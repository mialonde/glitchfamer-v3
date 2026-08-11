import { AudioEvents, VisualizerSettings } from '../types';
import { phonemeEngine, FormantSpectrumAnalysis } from './PhonemeAlignmentEngine';

export type VisemeType = 'REST' | 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'F' | 'L' | 'S';

export interface FacialBlendshapes {
  jaw_drop: number;    // 0.0 - 1.0: Çene dikey açıklığı (mandible drop)
  mouth_open: number;  // 0.0 - 1.0: Ağız dikey açıklığı (aperture)
  mouth_width: number; // 0.0 - 1.0: Ağız yatay genişliği (smile/spread)
  lip_round: number;   // 0.0 - 1.0: Dudak büzüşmesi / yuvarlaklaşması (O, U, W)
  lip_press: number;   // 0.0 - 1.0: Dudakların birbirine basması / kapanması (M, B, P)
}

/**
 * 8-12 Temel Anime/Avatar Viseme Parametre Tablosu (NVIDIA Audio2Face / Rhubarb / Oculus standartları)
 */
export const VISEME_BLENDSHAPES: Record<VisemeType, FacialBlendshapes> = {
  REST: {
    jaw_drop: 0.0,
    mouth_open: 0.0,
    mouth_width: 0.35,
    lip_round: 0.0,
    lip_press: 0.0
  },
  A: { // Geniş açık (AA, AH, A)
    jaw_drop: 0.85,
    mouth_open: 0.90,
    mouth_width: 0.50,
    lip_round: 0.0,
    lip_press: 0.0
  },
  E: { // Orta açık yayvan (EH, EE, E)
    jaw_drop: 0.45,
    mouth_open: 0.50,
    mouth_width: 0.80,
    lip_round: 0.0,
    lip_press: 0.0
  },
  I: { // Yatay ince gülümseme (IH, IY, I, Y)
    jaw_drop: 0.25,
    mouth_open: 0.25,
    mouth_width: 0.95,
    lip_round: 0.0,
    lip_press: 0.0
  },
  O: { // Yuvarlak açık (OH, AO, O)
    jaw_drop: 0.55,
    mouth_open: 0.60,
    mouth_width: 0.20,
    lip_round: 0.85,
    lip_press: 0.0
  },
  U: { // İleri büzülmüş (UW, OU, U, W)
    jaw_drop: 0.25,
    mouth_open: 0.30,
    mouth_width: 0.10,
    lip_round: 0.95,
    lip_press: 0.10
  },
  M: { // Kapalı Dudak (Bilabial Occlusion: M, B, P) - Tamamen kapalı ağız & sıfır çene
    jaw_drop: 0.0,
    mouth_open: 0.0,
    mouth_width: 0.35,
    lip_round: 0.0,
    lip_press: 1.0
  },
  F: { // Alt dudak - diş teması (F, V)
    jaw_drop: 0.18,
    mouth_open: 0.18,
    mouth_width: 0.50,
    lip_round: 0.0,
    lip_press: 0.40
  },
  L: { // Dil-damak alveolar (L, D, T, N, R)
    jaw_drop: 0.35,
    mouth_open: 0.35,
    mouth_width: 0.55,
    lip_round: 0.0,
    lip_press: 0.0
  },
  S: { // İnce diş sürtünmesi (S, Z, C, Ç, Ş, J, X, K, G, H)
    jaw_drop: 0.15,
    mouth_open: 0.15,
    mouth_width: 0.70,
    lip_round: 0.0,
    lip_press: 0.0
  }
};

/**
 * Geriye dönük uyumluluk için G2P yardımcı fonksiyonları
 */
export function wordToVisemes(word: string): VisemeType[] {
  const clean = word.toLowerCase().trim();
  if (!clean) return ['REST'];

  const visemes: VisemeType[] = [];
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (/[aâáàä]/.test(char)) visemes.push('A');
    else if (/[eéèêë]/.test(char)) visemes.push('E');
    else if (/[iıîíy]/.test(char)) visemes.push('I');
    else if (/[oöóô]/.test(char)) visemes.push('O');
    else if (/[uüûúw]/.test(char)) visemes.push('U');
    else if (/[mbp]/.test(char)) visemes.push('M');
    else if (/[fv]/.test(char)) visemes.push('F');
    else if (/[ldtnr]/.test(char)) visemes.push('L');
    else if (/[szcçşjxkgğhq]/.test(char)) visemes.push('S');
  }
  return visemes.length > 0 ? visemes : ['REST'];
}

export function extractVowelNucleus(visemes: VisemeType[]): VisemeType {
  const vowels: VisemeType[] = ['A', 'E', 'I', 'O', 'U'];
  for (let i = visemes.length - 1; i >= 0; i--) {
    if (vowels.includes(visemes[i])) return visemes[i];
  }
  return visemes.find(v => v !== 'REST' && v !== 'M') || 'A';
}

/**
 * 5-Kademeli Akustik & Fonetik Forced Alignment Lip Sync Motoru:
 *  1. Audio Signal & Spektrum Analizi
 *  2. Voice Activity Detection (VAD) & Formant Extraction (F1, F2, Fricative)
 *  3. Phoneme Alignment & Vowel Sustain Tracker
 *  4. Coarticulation & Bilabial Occlusion Mapping
 *  5. Asymmetric Exponential Smoothing (Attack: 45ms, Release: 85-110ms)
 */
export class VisemeEngine {
  private currentBlendshapes: FacialBlendshapes = { ...VISEME_BLENDSHAPES.REST };
  private activeViseme: VisemeType = 'REST';
  private lastTime: number = 0;
  private lastActiveVocalTime: number = -1;

  public update(audio: AudioEvents, settings?: VisualizerSettings): FacialBlendshapes {
    const time = audio.time;

    // Delta time hesabı (60 FPS stabilite)
    const dt = (this.lastTime > 0 && Math.abs(time - this.lastTime) < 0.3)
      ? Math.max(0.001, time - this.lastTime)
      : 0.016;
    this.lastTime = time;

    // -------------------------------------------------------------
    // ADIM 1: Voice Activity Detection (VAD) & Formant Spektrum Analizi
    // -------------------------------------------------------------
    const formants: FormantSpectrumAnalysis = phonemeEngine.analyzeFormants(audio);

    if (formants.isVocalPresent) {
      this.lastActiveVocalTime = time;
    }

    // 120ms Vokal Devamlılık Penceresi (Vocal Hold Window)
    const isVocalSustained = formants.isVocalPresent || 
      (this.lastActiveVocalTime > 0 && (time - this.lastActiveVocalTime) < 0.14);

    // Başlangıç veya Kesin Sessizlikte Doğrudan REST Pozu
    if (time <= 0.06 || audio.isSilence || (!isVocalSustained && (audio.vocalRMS ?? 0) < 0.012)) {
      this.activeViseme = 'REST';
      this.currentBlendshapes = { ...VISEME_BLENDSHAPES.REST };
      return this.currentBlendshapes;
    }

    // -------------------------------------------------------------
    // ADIM 2: Forced Alignment & Akustik Hibrit Fonem Seçimi
    // -------------------------------------------------------------
    const alignment = phonemeEngine.alignPhonemeAtTime(
      time,
      settings?.syncedLyrics,
      audio,
      formants
    );

    const currentViseme = alignment.currentPhoneme as VisemeType;
    const nextViseme = alignment.nextPhoneme as VisemeType;
    const subProg = alignment.blendProgress;

    // -------------------------------------------------------------
    // ADIM 3: Coarticulation & Hedef Blendshape Hesabı
    // -------------------------------------------------------------
    const shapeA = VISEME_BLENDSHAPES[currentViseme] || VISEME_BLENDSHAPES.REST;
    const shapeB = VISEME_BLENDSHAPES[nextViseme] || VISEME_BLENDSHAPES.REST;

    // İki komşu fonem arasında 50-100ms yumuşak enterpolasyon (Coarticulation)
    const rawTarget: FacialBlendshapes = {
      jaw_drop: shapeA.jaw_drop * (1 - subProg) + shapeB.jaw_drop * subProg,
      mouth_open: shapeA.mouth_open * (1 - subProg) + shapeB.mouth_open * subProg,
      mouth_width: shapeA.mouth_width * (1 - subProg) + shapeB.mouth_width * subProg,
      lip_round: shapeA.lip_round * (1 - subProg) + shapeB.lip_round * subProg,
      lip_press: shapeA.lip_press * (1 - subProg) + shapeB.lip_press * subProg
    };

    let effectiveTarget: FacialBlendshapes;

    // -------------------------------------------------------------
    // ADIM 4: Bilabial Occlusion & Akustik Enerji Modülasyonu
    // -------------------------------------------------------------
    if (alignment.isBilabialClosed || currentViseme === 'M') {
      // M, B, P: Dudaklar birbirine bastığında dikey açıklık KESİNLİKLE sıfırlanır
      effectiveTarget = {
        jaw_drop: 0.0,
        mouth_open: 0.0,
        mouth_width: 0.35,
        lip_round: 0.0,
        lip_press: 1.0
      };
    } else {
      // Sesli harflerde veya açık ünsüzlerde ses gücüne göre dinamik açıklık
      const vocalRMS = audio.vocalRMS ?? 0;
      const vocalEnergy = audio.vocalEnergy ?? 0;
      const combinedPower = vocalRMS * 1.6 + vocalEnergy * 1.4 + formants.f1_jawOpen * 0.4;
      
      // Dinamik ölçekleme faktörü (0.60x - 1.35x)
      const energyMod = Math.min(1.35, Math.max(0.60, 0.55 + combinedPower * 1.5));

      effectiveTarget = {
        jaw_drop: Math.min(1.0, rawTarget.jaw_drop * energyMod),
        mouth_open: Math.min(1.0, rawTarget.mouth_open * energyMod),
        mouth_width: rawTarget.mouth_width,
        lip_round: rawTarget.lip_round,
        lip_press: 0.0
      };
    }

    // -------------------------------------------------------------
    // ADIM 5: Asimetrik Exponential Smoothing (Doğal Kas Tepkisi)
    // -------------------------------------------------------------
    // Dudak kapanması (Attack): 45ms, Açılma: 70ms, Sessizlik (Release): 60ms
    const isMClosing = effectiveTarget.lip_press > 0.5;
    const isOpening = effectiveTarget.mouth_open > this.currentBlendshapes.mouth_open;
    const timeConstant = isMClosing ? 0.045 : isOpening ? 0.070 : (currentViseme === 'REST' ? 0.055 : 0.090);
    const alpha = 1.0 - Math.exp(-dt / timeConstant);

    this.currentBlendshapes.jaw_drop += (effectiveTarget.jaw_drop - this.currentBlendshapes.jaw_drop) * alpha;
    this.currentBlendshapes.mouth_open += (effectiveTarget.mouth_open - this.currentBlendshapes.mouth_open) * alpha;
    this.currentBlendshapes.mouth_width += (effectiveTarget.mouth_width - this.currentBlendshapes.mouth_width) * alpha;
    this.currentBlendshapes.lip_round += (effectiveTarget.lip_round - this.currentBlendshapes.lip_round) * alpha;
    this.currentBlendshapes.lip_press += (effectiveTarget.lip_press - this.currentBlendshapes.lip_press) * alpha;

    // Bilabial M/B/P baskısı varsa ağız dikey açıklığını zorunlu sıfırla
    if (this.currentBlendshapes.lip_press > 0.35) {
      const suppression = Math.max(0, 1 - (this.currentBlendshapes.lip_press - 0.35) * 2.2);
      this.currentBlendshapes.mouth_open *= suppression;
      this.currentBlendshapes.jaw_drop *= suppression;
    }

    // Sessizlik veya REST modunda sıfıra yakın değerleri tamamen temizle (Rest Lock)
    if (currentViseme === 'REST' && !isVocalSustained) {
      if (this.currentBlendshapes.mouth_open < 0.015) {
        this.currentBlendshapes.jaw_drop = 0;
        this.currentBlendshapes.mouth_open = 0;
        this.currentBlendshapes.lip_round = 0;
        this.currentBlendshapes.lip_press = 0;
      }
    }

    this.activeViseme = (isVocalSustained && currentViseme !== 'REST') ? currentViseme : 'REST';
    return this.currentBlendshapes;
  }

  public getActiveViseme(): VisemeType {
    return this.activeViseme;
  }
}
