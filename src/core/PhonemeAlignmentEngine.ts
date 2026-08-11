import { AudioEvents, PhonemeToken, SyncedLine, SyncedWord, VisemeCode } from '../types';

/**
 * Fonetik Karakter Sınıfları ve Akustik Süre Ağırlıkları
 */
export interface PhonemeRule {
  phoneme: VisemeCode;
  type: 'vowel' | 'consonant' | 'bilabial' | 'fricative';
  weight: number;      // Fonemin kelime içindeki göreceli süresi (Sesliler uzundur, patlamalılar kısadır)
  minDuration: number; // Minimum artikülasyon süresi (saniye)
}

const PHONEME_MAP: Record<string, PhonemeRule> = {
  // --- VOWELS (Sesli Harfler - Akustik Rezonans & Yüksek Süre Ağırlığı) ---
  'a': { phoneme: 'A', type: 'vowel', weight: 3.2, minDuration: 0.090 },
  'â': { phoneme: 'A', type: 'vowel', weight: 3.2, minDuration: 0.090 },
  'á': { phoneme: 'A', type: 'vowel', weight: 3.2, minDuration: 0.090 },
  'à': { phoneme: 'A', type: 'vowel', weight: 3.2, minDuration: 0.090 },
  'ä': { phoneme: 'A', type: 'vowel', weight: 3.2, minDuration: 0.090 },

  'e': { phoneme: 'E', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'é': { phoneme: 'E', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'è': { phoneme: 'E', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'ê': { phoneme: 'E', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'ë': { phoneme: 'E', type: 'vowel', weight: 2.8, minDuration: 0.080 },

  'i': { phoneme: 'I', type: 'vowel', weight: 2.6, minDuration: 0.075 },
  'ı': { phoneme: 'I', type: 'vowel', weight: 2.6, minDuration: 0.075 },
  'î': { phoneme: 'I', type: 'vowel', weight: 2.6, minDuration: 0.075 },
  'í': { phoneme: 'I', type: 'vowel', weight: 2.6, minDuration: 0.075 },
  'y': { phoneme: 'I', type: 'vowel', weight: 1.8, minDuration: 0.060 }, // Yarı-ünlü

  'o': { phoneme: 'O', type: 'vowel', weight: 3.0, minDuration: 0.085 },
  'ö': { phoneme: 'O', type: 'vowel', weight: 3.0, minDuration: 0.085 },
  'ó': { phoneme: 'O', type: 'vowel', weight: 3.0, minDuration: 0.085 },
  'ô': { phoneme: 'O', type: 'vowel', weight: 3.0, minDuration: 0.085 },

  'u': { phoneme: 'U', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'ü': { phoneme: 'U', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'û': { phoneme: 'U', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'ú': { phoneme: 'U', type: 'vowel', weight: 2.8, minDuration: 0.080 },
  'w': { phoneme: 'U', type: 'vowel', weight: 1.8, minDuration: 0.060 },

  // --- BILABIAL CONSONANTS (Çift Dudak Kapanışı: M, B, P) ---
  'm': { phoneme: 'M', type: 'bilabial', weight: 1.2, minDuration: 0.055 },
  'b': { phoneme: 'M', type: 'bilabial', weight: 0.9, minDuration: 0.045 },
  'p': { phoneme: 'M', type: 'bilabial', weight: 0.9, minDuration: 0.045 },

  // --- LABIODENTAL (Dudak-Diş: F, V) ---
  'f': { phoneme: 'F', type: 'consonant', weight: 1.1, minDuration: 0.050 },
  'v': { phoneme: 'F', type: 'consonant', weight: 1.1, minDuration: 0.050 },

  // --- ALVEOLAR / LINGUAL (Dil-Damak: L, D, T, N, R) ---
  'l': { phoneme: 'L', type: 'consonant', weight: 1.2, minDuration: 0.055 },
  'd': { phoneme: 'L', type: 'consonant', weight: 0.9, minDuration: 0.045 },
  't': { phoneme: 'L', type: 'consonant', weight: 0.9, minDuration: 0.045 },
  'n': { phoneme: 'L', type: 'consonant', weight: 1.1, minDuration: 0.050 },
  'r': { phoneme: 'L', type: 'consonant', weight: 1.3, minDuration: 0.060 },

  // --- FRICATIVE / SIBILANT / VELAR (Sürtünmeli & Damaksıl) ---
  's': { phoneme: 'S', type: 'fricative', weight: 1.3, minDuration: 0.060 },
  'z': { phoneme: 'S', type: 'fricative', weight: 1.2, minDuration: 0.055 },
  'c': { phoneme: 'S', type: 'fricative', weight: 1.0, minDuration: 0.050 },
  'ç': { phoneme: 'S', type: 'fricative', weight: 1.1, minDuration: 0.055 },
  'ş': { phoneme: 'S', type: 'fricative', weight: 1.3, minDuration: 0.060 },
  'j': { phoneme: 'S', type: 'fricative', weight: 1.1, minDuration: 0.050 },
  'k': { phoneme: 'S', type: 'fricative', weight: 0.9, minDuration: 0.045 },
  'g': { phoneme: 'S', type: 'fricative', weight: 0.9, minDuration: 0.045 },
  'ğ': { phoneme: 'A', type: 'vowel',     weight: 1.5, minDuration: 0.060 }, // Yumuşak g uzatmadır
  'h': { phoneme: 'S', type: 'fricative', weight: 0.9, minDuration: 0.045 },
  'x': { phoneme: 'S', type: 'fricative', weight: 1.1, minDuration: 0.050 },
  'q': { phoneme: 'S', type: 'fricative', weight: 0.9, minDuration: 0.045 }
};

/**
 * Akustik Formant Frekans Bölgeleri Analiz Sonucu
 */
export interface FormantSpectrumAnalysis {
  f1_jawOpen: number;      // 0.0 - 1.0: 300Hz - 1000Hz (Çene ve ağız açıklığı)
  f2_tongueSpread: number; // 0.0 - 1.0: 1000Hz - 2800Hz (Yayvanlık / E, I tespiti)
  fricativeEnergy: number; // 0.0 - 1.0: 3500Hz - 8000Hz (S, Ş, F sürtünmesi)
  isVocalPresent: boolean; // VAD (Voice Activity Detection) aktif mi?
  vocalConfidence: number; // 0.0 - 1.0 güven skoru
  dominantViseme: VisemeCode; // Akustik formantların işaret ettiği en olası viseme
}

export class PhonemeAlignmentEngine {
  private wordCache: Map<string, PhonemeToken[]> = new Map();
  private noiseFloor: number = 0.015;
  private lastActiveVocalTime: number = -1;
  private sustainedVowel: VisemeCode = 'A';
  private sustainDuration: number = 0;

  /**
   * 1. G2P ve Fonem Zaman Çizelgesi Oluşturucu (Phoneme Timeline Generator)
   * Bir kelimeyi analiz ederek her alt fonemin normalize ve mutlak zaman aralığını hesaplar.
   */
  public generateWordPhonemes(wordText: string, wordStart: number = 0, wordEnd: number = 0): PhonemeToken[] {
    const clean = wordText.toLowerCase().replace(/[^a-zâáàäeéèêëiıîíyoöóôuüûúwmbpfvldtnrszcçşjkgğhxq]/g, '');
    if (!clean) {
      return [{
        phoneme: 'REST',
        char: '',
        type: 'consonant',
        relativeStart: 0,
        relativeEnd: 1,
        startTime: wordStart,
        endTime: wordEnd,
        isVowelNucleus: false
      }];
    }

    // Cache kontrolü (sadece göreceli şablon için)
    const tokens: { char: string; rule: PhonemeRule }[] = [];
    let totalWeight = 0;

    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      const rule = PHONEME_MAP[ch] || { phoneme: 'A', type: 'vowel', weight: 2.0, minDuration: 0.06 };
      tokens.push({ char: ch, rule });
      totalWeight += rule.weight;
    }

    // Kelimedeki sesli harflerin sonuncusunu veya en ağırlıklısını Vowel Nucleus (Çekirdek) olarak işaretle
    let nucleusIdx = -1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].rule.type === 'vowel') {
        nucleusIdx = i;
        break;
      }
    }
    if (nucleusIdx === -1 && tokens.length > 0) {
      nucleusIdx = 0;
    }

    const duration = Math.max(0.1, wordEnd - wordStart);
    let accumWeight = 0;

    const phonemeTokens: PhonemeToken[] = tokens.map((item, idx) => {
      const startRatio = accumWeight / totalWeight;
      accumWeight += item.rule.weight;
      const endRatio = accumWeight / totalWeight;

      return {
        phoneme: item.rule.phoneme,
        char: item.char,
        type: item.rule.type,
        relativeStart: startRatio,
        relativeEnd: endRatio,
        startTime: wordStart + (startRatio * duration),
        endTime: wordStart + (endRatio * duration),
        isVowelNucleus: idx === nucleusIdx
      };
    });

    return phonemeTokens;
  }

  /**
   * Tüm SyncedLine koleksiyonunu zenginleştirerek her kelimeye alt-fonem çizelgesi ekler.
   */
  public enrichLyricsWithPhonemes(lines: SyncedLine[]): SyncedLine[] {
    return lines.map(line => {
      if (!line.words || line.words.length === 0) {
        const wordsArray = line.text.split(' ').filter(Boolean);
        const lineDur = Math.max(1.0, line.endTime - line.startTime);
        const wDur = lineDur / Math.max(1, wordsArray.length);

        const generatedWords: SyncedWord[] = wordsArray.map((w, wIdx) => {
          const wStart = line.startTime + (wIdx * wDur);
          const wEnd = wStart + wDur;
          return {
            word: w,
            startTime: Math.round(wStart * 100) / 100,
            endTime: Math.round(wEnd * 100) / 100,
            phonemes: this.generateWordPhonemes(w, wStart, wEnd)
          };
        });

        return { ...line, words: generatedWords };
      }

      const enrichedWords: SyncedWord[] = line.words.map(w => ({
        ...w,
        phonemes: w.phonemes && w.phonemes.length > 0 
          ? w.phonemes 
          : this.generateWordPhonemes(w.word, w.startTime, w.endTime)
      }));

      return { ...line, words: enrichedWords };
    });
  }

  /**
   * 2. Akustik Spektral Analiz & Formant Takip Motoru (Real-time Formant & VAD Tracker)
   * 64-kanallı FFT spektrumundan ve zaman-alanı RMS değerinden gerçek sesli harf formantlarını ayıklar.
   */
  public analyzeFormants(audio: AudioEvents): FormantSpectrumAnalysis {
    const spectrum = audio.spectrum || [];
    const len = spectrum.length;

    // F1 Band: 300Hz - 1000Hz (64 kanalda yaklaşık index 2 - 10)
    let f1Sum = 0;
    let f1Count = 0;
    for (let i = 2; i <= 10 && i < len; i++) {
      f1Sum += spectrum[i];
      f1Count++;
    }
    const f1_jawOpen = f1Count > 0 ? Math.min(1.0, (f1Sum / f1Count) * 2.2) : 0;

    // F2 Band: 1000Hz - 2800Hz (64 kanalda yaklaşık index 11 - 28)
    let f2Sum = 0;
    let f2Count = 0;
    for (let i = 11; i <= 28 && i < len; i++) {
      f2Sum += spectrum[i];
      f2Count++;
    }
    const f2_tongueSpread = f2Count > 0 ? Math.min(1.0, (f2Sum / f2Count) * 2.6) : 0;

    // Fricative / High Sibilant Band: 3500Hz - 8000Hz (index 29 - 52)
    let f3Sum = 0;
    let f3Count = 0;
    for (let i = 29; i <= 52 && i < len; i++) {
      f3Sum += spectrum[i];
      f3Count++;
    }
    const fricativeEnergy = f3Count > 0 ? Math.min(1.0, (f3Sum / f3Count) * 3.2) : 0;

    // Dinamik Gürültü Tabanı (Noise Floor) Adaptasyonu
    const instantRMS = audio.vocalRMS ?? 0;
    const instantVocalEnergy = audio.vocalEnergy ?? 0;
    if (audio.isSilence || instantRMS < 0.01) {
      this.noiseFloor = this.noiseFloor * 0.98 + instantRMS * 0.02;
    }

    // VAD Kararı (Voice Activity Detection)
    const combinedVocalPower = instantVocalEnergy * 1.5 + instantRMS * 1.8 + (audio.midEnergy ?? 0) * 0.4;
    const vocalThreshold = Math.max(0.028, this.noiseFloor * 1.8);
    const isVocalPresent = !audio.isSilence && (combinedVocalPower > vocalThreshold);

    const vocalConfidence = Math.min(1.0, Math.max(0.0, (combinedVocalPower - vocalThreshold) / 0.35));

    // Formant Dağılımına Göre Baskın Akustik Viseme Belirleme
    let dominantViseme: VisemeCode = 'REST';
    if (isVocalPresent) {
      if (fricativeEnergy > 0.52 && f1_jawOpen < 0.35) {
        dominantViseme = 'S';
      } else if (f2_tongueSpread > 0.48 && f1_jawOpen < 0.45) {
        dominantViseme = 'I';
      } else if (f2_tongueSpread > 0.40) {
        dominantViseme = 'E';
      } else if (f1_jawOpen > 0.45) {
        dominantViseme = 'A';
      } else if (f1_jawOpen > 0.25 && f2_tongueSpread < 0.30) {
        dominantViseme = 'O';
      } else {
        dominantViseme = 'U';
      }
    }

    return {
      f1_jawOpen,
      f2_tongueSpread,
      fricativeEnergy,
      isVocalPresent,
      vocalConfidence,
      dominantViseme
    };
  }

  /**
   * 3. Forced Alignment & Akustik Hibrit Fonem Seçici
   *  - LRC'den gelen kelime ve alt-fonem çizelgesini alır.
   *  - Anlık ses analizinden gelen VAD ve Formant verisi ile eşleştirir.
   *  - Vowel Sustain kontrolü ile şarkıcı notayı uzattığında erken kapanmayı engeller.
   */
  public alignPhonemeAtTime(
    currentTime: number,
    syncedLines: SyncedLine[] | undefined,
    audio: AudioEvents,
    formants: FormantSpectrumAnalysis
  ): {
    currentPhoneme: VisemeCode;
    nextPhoneme: VisemeCode;
    blendProgress: number;
    isBilabialClosed: boolean;
    isSustainedVowel: boolean;
  } {
    // 1. Kesin Sessizlik ve Şarkı Öncesi Durumu
    if (currentTime <= 0.06 || audio.isSilence || (!formants.isVocalPresent && (audio.vocalRMS ?? 0) < 0.012)) {
      this.sustainDuration = 0;
      return {
        currentPhoneme: 'REST',
        nextPhoneme: 'REST',
        blendProgress: 0,
        isBilabialClosed: false,
        isSustainedVowel: false
      };
    }

    if (formants.isVocalPresent) {
      this.lastActiveVocalTime = currentTime;
    }

    // 2. LRC Üzerinden Aktif Kelime ve Fonem Taraması
    let activeWord: SyncedWord | null = null;
    let previousWord: SyncedWord | null = null;

    if (syncedLines && syncedLines.length > 0) {
      for (let i = syncedLines.length - 1; i >= 0; i--) {
        const line = syncedLines[i];
        if (currentTime >= line.startTime - 0.20 && currentTime <= line.endTime + 2.5) {
          if (line.words && line.words.length > 0) {
            for (let w = 0; w < line.words.length; w++) {
              const wObj = line.words[w];
              if (currentTime >= wObj.startTime && currentTime <= wObj.endTime) {
                activeWord = wObj;
                previousWord = w > 0 ? line.words[w - 1] : null;
                break;
              } else if (currentTime > wObj.endTime && (!activeWord || wObj.endTime > activeWord.endTime)) {
                previousWord = wObj;
              }
            }
          }
          if (activeWord) break;
        }
      }
    }

    // 3. Senaryo A: Aktif Kelime İçi Fonem Eşleşmesi
    if (activeWord) {
      const phonemes = activeWord.phonemes && activeWord.phonemes.length > 0
        ? activeWord.phonemes
        : this.generateWordPhonemes(activeWord.word, activeWord.startTime, activeWord.endTime);

      const wordDur = Math.max(0.08, activeWord.endTime - activeWord.startTime);
      const elapsed = currentTime - activeWord.startTime;
      const progress = Math.min(1.0, Math.max(0.0, elapsed / wordDur));

      // Aktif fonem belirleme
      let currentToken: PhonemeToken = phonemes[0];
      let nextToken: PhonemeToken = phonemes[0];
      let subProg = 0;

      for (let p = 0; p < phonemes.length; p++) {
        const tok = phonemes[p];
        if (progress >= tok.relativeStart && progress <= tok.relativeEnd) {
          currentToken = tok;
          nextToken = phonemes[Math.min(phonemes.length - 1, p + 1)];
          const span = Math.max(0.001, tok.relativeEnd - tok.relativeStart);
          subProg = (progress - tok.relativeStart) / span;
          break;
        }
      }

      // Vowel Nucleus kaydı (Kelime sonu uzatmalarında hafızada tutulur)
      const nucleus = phonemes.find(p => p.isVowelNucleus) || phonemes.find(p => p.type === 'vowel');
      if (nucleus) {
        this.sustainedVowel = nucleus.phoneme;
      }

      // Bilabial (M, B, P) Onset Kontrolü:
      // Yalnızca fonemin kendi penceresindeyken ve gerçekten kapanma anında tetiklenir
      const isBilabialClosed = currentToken.type === 'bilabial' && (
        formants.f1_jawOpen < 0.28 || subProg < 0.65
      );

      return {
        currentPhoneme: currentToken.phoneme,
        nextPhoneme: nextToken.phoneme,
        blendProgress: subProg,
        isBilabialClosed,
        isSustainedVowel: currentToken.type === 'vowel'
      };
    }

    // 4. Senaryo B: Kelime Bitti Ama Şarkıcı Notayı Uzatıyor (Vowel Sustain Mechanism)
    // Örnek: "seviyorum" kelimesinin bitiş süresi 01:23.40 ama ses dalgası 01:25.10'a kadar devam ediyor.
    // Ağız ASLA erken kapanmaz! Akustik formant ve sesli harf çekirdeği korunur.
    const isWithinSustainWindow = this.lastActiveVocalTime > 0 && (currentTime - this.lastActiveVocalTime) < 0.25;

    if (activeWord === null && previousWord && (formants.isVocalPresent || isWithinSustainWindow)) {
      this.sustainDuration += 0.016;

      // Akustik spektral formant ile teyit edilen sesli harf
      let vowelChoice = this.sustainedVowel;
      if (formants.dominantViseme !== 'REST' && formants.dominantViseme !== 'S') {
        vowelChoice = formants.dominantViseme;
      }

      return {
        currentPhoneme: vowelChoice,
        nextPhoneme: vowelChoice,
        blendProgress: 0,
        isBilabialClosed: false,
        isSustainedVowel: true
      };
    }

    // 5. Senaryo C: Enstrümantal Bölüm veya Söz Yoksa
    // Eğer şarkı sözleri (LRC) varsa ve aktif kelime/sustain yoksa KESİNLİKLE REST olmalıdır.
    if (syncedLines && syncedLines.length > 0) {
      this.sustainDuration = 0;
      return {
        currentPhoneme: 'REST',
        nextPhoneme: 'REST',
        blendProgress: 0,
        isBilabialClosed: false,
        isSustainedVowel: false
      };
    }

    // LRC yoksa sadece güçlü gerçek vokal tespit edildiğinde akustik viseme dönülür
    if (formants.isVocalPresent && formants.vocalConfidence > 0.35) {
      return {
        currentPhoneme: formants.dominantViseme,
        nextPhoneme: formants.dominantViseme,
        blendProgress: 0,
        isBilabialClosed: formants.dominantViseme === 'M',
        isSustainedVowel: false
      };
    }

    return {
      currentPhoneme: 'REST',
      nextPhoneme: 'REST',
      blendProgress: 0,
      isBilabialClosed: false,
      isSustainedVowel: false
    };
  }
}

export const phonemeEngine = new PhonemeAlignmentEngine();
