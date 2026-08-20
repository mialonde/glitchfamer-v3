import { NormalizedSunoTrack, SunoTimelineWord, SunoWordTimestamp, SyncedLine, SyncedWord } from "../types";
import { 
  parseLrcText, 
  exportToLrcText, 
  exportToEnhancedLrcText, 
  exportToSrtText, 
  exportToVttText, 
  exportToTtmlText,
  autoSyncLyricsByDuration, 
  cleanLyricsText, 
  isStructureMarkerToken 
} from "./lyricSyncService";
import { phonemeEngine } from "../core/PhonemeAlignmentEngine";

/**
 * SunoImporterService: Suno Şarkı Linki, Ham JSON ve Metadata İçe Aktarma Servisi.
 * (xiliourt/Suno-Lyrics ve Lumi-Script mimarisiyle tam uyumlu)
 * 
 * Görevler:
 * 1. Suno URL doğrulama (suno.com/s/..., suno.com/song/..., app.suno.ai/song/..., cdn1.suno.ai/... vb.) ve Track ID çıkarma.
 * 2. Ham Suno API JSON / Network dump verisini doğrudan içe aktarma desteği.
 * 3. Public sayfa içeriğinden, Studio API ve Aligned Lyrics endpointlerinden metadata & kelime zamanlamalarını çekme.
 * 4. Word-level timestamp varsa lyricsTimeline ve SyncedLine timeline'ına dönüştürme ve PhonemeAlignmentEngine ile zenginleştirme.
 * 5. Şarkı yapısı etiketlerini ([Verse], [Chorus], (Guitar Solo), vb.) akıllı filtreleme.
 * 6. xiliourt/Suno-Lyrics tarzı anında .LRC, .ELRC (Enhanced), .SRT, .VTT ve .TTML formatlarında dışa aktarma araçları.
 */
export class SunoImporterService {
  private static instance: SunoImporterService;

  public static getInstance(): SunoImporterService {
    if (!SunoImporterService.instance) {
      SunoImporterService.instance = new SunoImporterService();
    }
    return SunoImporterService.instance;
  }

  /**
   * Girilen metnin geçerli bir Suno URL'i, Track ID'si veya Ham JSON olup olmadığını doğrular.
   */
  public validateUrl(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();

    // 0. JSON formatı kontrolü
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && (parsed.id || parsed.title || parsed.audio_url || parsed.prompt || Array.isArray(parsed))) {
          return true;
        }
      } catch (_) {}
    }

    // 1. UUID formatı (8-4-4-4-12 hex)
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
      return true;
    }

    // 2. Suno domain kontrolü
    if (/^(?:https?:\/\/)?(?:www\.|app\.|cdn\d*\.|audiocdn\d*\.)?suno\.(?:com|ai)\//i.test(trimmed)) {
      return true;
    }

    // 3. /song/, /clip/, /s/ kalıbı
    if (/(?:suno\.com|suno\.ai)\/(?:s|song|clip|track)\/[a-zA-Z0-9_-]+/i.test(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Kullanıcı girdisinden (URL veya doğrudan ID) Suno Track/Clip UUID'sini ayıklar.
   */
  public extractTrackId(input: string): string | null {
    if (!input || typeof input !== 'string') return null;

    const trimmed = input.trim();

    // 1. Standart UUID formatı (8-4-4-4-12 hex)
    const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
    const uuidMatch = trimmed.match(uuidRegex);
    if (uuidMatch) {
      return uuidMatch[1].toLowerCase();
    }

    // 2. /song/ veya /clip/ sonrası gelen ID
    const urlSongRegex = /(?:song|clip|track)\/([a-zA-Z0-9_-]+)/i;
    const songMatch = trimmed.match(urlSongRegex);
    if (songMatch) {
      return songMatch[1];
    }

    // 3. /s/ short link kalıbı (suno.com/s/<shortCode>)
    const shortLinkRegex = /(?:suno\.com|suno\.ai)\/s\/([a-zA-Z0-9_-]+)/i;
    const shortMatch = trimmed.match(shortLinkRegex);
    if (shortMatch) {
      return shortMatch[1];
    }

    // 4. CDN URL formatı (cdn1.suno.ai/<ID>.mp3)
    const cdnRegex = /(?:cdn\d*|audiocdn\d*)\.suno\.(?:ai|com)\/([a-zA-Z0-9_-]+)\.mp3/i;
    const cdnMatch = trimmed.match(cdnRegex);
    if (cdnMatch) {
      return cdnMatch[1];
    }

    return null;
  }

  /**
   * Suno şarkısını URL, ID veya Ham JSON üzerinden normalize edilmiş track nesnesine dönüştürür.
   */
  public async importTrack(urlOrIdOrJson: string): Promise<NormalizedSunoTrack> {
    const trimmed = (urlOrIdOrJson || "").trim();
    if (!trimmed) {
      throw new Error("Lütfen geçerli bir Suno şarkı bağlantısı veya JSON girin. (Örn: https://suno.com/s/a2hf69thdnYq25lG veya https://suno.com/song/...)");
    }

    // A. Ham JSON girdisi kontrolü (xiliourt / Lumi-Script desteği)
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        const clip = Array.isArray(parsed) ? parsed[0] : (parsed.clips ? parsed.clips[0] : parsed);
        if (clip) {
          const trackId = clip.id || this.extractTrackId(clip.audio_url || "") || "suno-custom";
          return this.normalizeSunoData(clip, trackId);
        }
      } catch (jsonErr) {
        console.warn("JSON ayrıştırma hatası:", jsonErr);
      }
    }

    const trackId = this.extractTrackId(trimmed);
    let rawData: any = null;

    // ADIM 1: Sunucu tarafı proxy endpoint üzerinden güvenli çekim (/api/suno/inspect)
    try {
      const serverRes = await fetch("/api/suno/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, trackId })
      });

      if (serverRes.ok) {
        rawData = await serverRes.json();
      }
    } catch (serverErr) {
      console.warn("Sunucu Suno inspect endpoint uyarısı, doğrudan istemci isteği deneniyor:", serverErr);
    }

    // ADIM 2: Sunucu yanıt vermediyse ve elimizde trackId varsa doğrudan Suno Public API üzerinden çekim
    if (!rawData && trackId) {
      try {
        const directApiUrl = `https://studio-api.prod.suno.com/api/clip/${trackId}`;
        const directRes = await fetch(directApiUrl, {
          headers: { "Accept": "application/json" }
        });

        if (directRes.ok) {
          rawData = await directRes.json();
        }
      } catch (directErr) {
        console.warn("Doğrudan Suno API erişim uyarısı:", directErr);
      }
    }

    // ADIM 3: Eğer parça bilgisi geldi ama hizalama (aligned_lyrics) eksikse, alignment endpoint'ini sorgula
    if (rawData && trackId && (!rawData.aligned_lyrics && !rawData.metadata?.alignment)) {
      try {
        const alignRes = await fetch(`/api/suno/aligned-lyrics/${trackId}`);
        if (alignRes.ok) {
          const alignJson = await alignRes.json();
          if (alignJson?.words) {
            rawData.aligned_lyrics = alignJson.words;
            if (!rawData.metadata) rawData.metadata = {};
            rawData.metadata.alignment = alignJson.words;
          }
        }
      } catch (_) {}
    }

    if (!rawData && !trackId) {
      throw new Error("Suno bağlantısından şarkı bilgisi çözümlenemedi. Lütfen bağlantıyı kontrol edin.");
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      rawData = rawData[0];
    }

    // ADIM 4: Veriyi normalize et
    return this.normalizeSunoData(rawData, trackId || rawData?.id || "suno-track");
  }

  /**
   * Ham Suno API verisini veya varsayılan CDN verisini NormalizedSunoTrack formatına dönüştürür.
   */
  public normalizeSunoData(raw: any, trackId: string): NormalizedSunoTrack {
    let title = (raw?.title || raw?.name || "").trim();
    let artist = (raw?.display_name || raw?.handle || raw?.user_name || "").trim();

    // Default to Demo Song / Demo Singer if not provided or generic
    if (!title) title = "Demo Song";
    if (!artist || artist === "Suno AI" || artist === "Suno") artist = "Demo Singer";

    const rawPrompt = raw?.metadata?.prompt || raw?.prompt || "";
    const cleanLyrics = this.cleanSunoLyricsPrompt(rawPrompt);
    const tags = raw?.metadata?.tags || raw?.tags || "";
    const duration = raw?.metadata?.duration || raw?.duration || 0;

    // Audio URL (Öncelik: raw audio_url, yoksa CDN fallback)
    const rawAudioUrl = raw?.audio_url || `https://cdn1.suno.ai/${trackId}.mp3`;
    // Web Audio CORS engellerini aşmak için proxy stream URL'i oluştur
    const proxyAudioUrl = `/api/suno/proxy-audio?id=${encodeURIComponent(trackId)}&url=${encodeURIComponent(rawAudioUrl)}`;

    // Kapak görseli
    const imageUrl = raw?.image_large_url || raw?.image_url || `https://cdn1.suno.ai/image_${trackId}.png`;

    // Word-Level Timestamps ve Alignment Verisini Ayrıştır
    const alignmentSource = raw?.aligned_lyrics || raw?.metadata?.alignment || raw?.alignment || raw?.word_timestamps || raw?.words;
    const { words, lyricsTimeline, syncedLines, hasWordLevelTimestamps } = this.parseAlignmentAndLyrics(
      rawPrompt || cleanLyrics,
      alignmentSource,
      duration
    );

    return {
      id: trackId,
      title,
      artist,
      lyrics: cleanLyrics || rawPrompt,
      audioUrl: proxyAudioUrl,
      imageUrl,
      image: imageUrl,
      duration,
      tags,
      words,
      lyricsTimeline,
      syncedLines,
      hasWordLevelTimestamps,
      source: "suno"
    };
  }

  /**
   * Suno audio proxy URL'inden veya CDN'den ses dosyasını Blob formatında indirir.
   */
  public async fetchAudioBlob(audioUrl: string): Promise<Blob> {
    try {
      const res = await fetch(audioUrl);
      if (!res.ok) {
        throw new Error(`Audio fetch failed: HTTP ${res.status}`);
      }
      return await res.blob();
    } catch (err) {
      console.warn("fetchAudioBlob error, fallback empty blob:", err);
      throw err;
    }
  }

  /**
   * Suno lyrics prompt'u ve alignment verilerini parse eder.
   */
  private parseAlignmentAndLyrics(
    rawPrompt: string,
    alignmentData: any,
    duration: number
  ): {
    words: SunoWordTimestamp[];
    lyricsTimeline: SunoTimelineWord[];
    syncedLines: SyncedLine[];
    hasWordLevelTimestamps: boolean;
  } {
    const extractedWords: SunoWordTimestamp[] = [];
    const timelineWords: SunoTimelineWord[] = [];

    // Durum 1: Suno Alignment / Word Timestamps dizisi mevcutsa
    if (alignmentData && Array.isArray(alignmentData) && alignmentData.length > 0) {
      let bracketBuffer: { text: string; start: number; end: number }[] = [];
      let insideBracket = false;

      for (let i = 0; i < alignmentData.length; i++) {
        const item = alignmentData[i];
        const text = item.word || item.text || item.token || "";
        
        // Suno API varyasyonları (start, start_s, startTime, begin)
        const startTime = typeof item.start === 'number' 
          ? item.start 
          : (typeof item.start_s === 'number' ? item.start_s : (item.startTime ?? item.begin ?? 0));
        
        const endTime = typeof item.end === 'number' 
          ? item.end 
          : (typeof item.end_s === 'number' ? item.end_s : (item.endTime ?? (startTime + 0.35)));

        if (!text || !text.trim()) continue;
        const rawWord = text.trim();

        // Tek başına direkt yapı belirteci ise atla ([Verse], [Chorus], (Solo), vb.)
        if (isStructureMarkerToken(rawWord)) {
          continue;
        }

        // Çok kelimeli parantez / köşeli parantez bloklarını yakalama: örn. "(Pause", "-", "Single", "Kick)"
        if (rawWord.startsWith('(') || rawWord.startsWith('[') || rawWord.startsWith('{')) {
          insideBracket = true;
          bracketBuffer = [{ text: rawWord, start: startTime, end: endTime }];
          
          if (rawWord.endsWith(')') || rawWord.endsWith(']') || rawWord.endsWith('}')) {
            insideBracket = false;
            const fullBlock = bracketBuffer.map(b => b.text).join(' ');
            if (isStructureMarkerToken(fullBlock) || /^\([^)]+\)$/.test(fullBlock)) {
              bracketBuffer = [];
              continue;
            }
            bracketBuffer = [];
          }
          continue;
        } else if (insideBracket) {
          bracketBuffer.push({ text: rawWord, start: startTime, end: endTime });
          if (rawWord.endsWith(')') || rawWord.endsWith(']') || rawWord.endsWith('}')) {
            insideBracket = false;
            const fullBlock = bracketBuffer.map(b => b.text).join(' ');
            if (isStructureMarkerToken(fullBlock) || /^\([^)]+\)$/.test(fullBlock)) {
              bracketBuffer = [];
              continue;
            }
            // Müzik komutu değilse buffer'dakileri ekle
            for (const b of bracketBuffer) {
              const cleaned = cleanLyricsText(b.text);
              if (cleaned && !isStructureMarkerToken(cleaned)) {
                const s = Math.max(0, Math.round(b.start * 100) / 100);
                const e = Math.max(s + 0.1, Math.round(b.end * 100) / 100);
                extractedWords.push({ text: cleaned, startTime: s, endTime: e });
                timelineWords.push({ word: cleaned, startTime: s, endTime: e });
              }
            }
            bracketBuffer = [];
          }
          continue;
        }

        // Kalan parantez ve köşeli işaretleri temizle
        const cleanWord = rawWord
          .replace(/[\[\]\{\}<>]/g, '')
          .replace(/\([^)]*\)/g, '')
          .trim();

        if (!cleanWord || isStructureMarkerToken(cleanWord)) {
          continue;
        }

        const s = Math.max(0, Math.round(startTime * 100) / 100);
        const e = Math.max(s + 0.1, Math.round(endTime * 100) / 100);

        extractedWords.push({ text: cleanWord, startTime: s, endTime: e });
        timelineWords.push({ word: cleanWord, startTime: s, endTime: e });
      }
    }

    // Eğer word-level timestamps başarıyla alındıysa
    if (extractedWords.length > 0) {
      const groupedLines = this.groupWordsIntoLines(timelineWords);
      const enrichedLines = phonemeEngine.enrichLyricsWithPhonemes(groupedLines);
      return {
        words: extractedWords,
        lyricsTimeline: timelineWords,
        syncedLines: enrichedLines,
        hasWordLevelTimestamps: true
      };
    }

    // Durum 2: Eğer prompt içinde gömülü [00:12.34] LRC etiketleri varsa
    if (rawPrompt && /\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/.test(rawPrompt)) {
      const lrcLines = parseLrcText(rawPrompt);
      if (lrcLines.length > 0) {
        const flattenedWords: SunoWordTimestamp[] = [];
        const flatTimeline: SunoTimelineWord[] = [];
        for (const line of lrcLines) {
          if (line.words) {
            for (const w of line.words) {
              if (!isStructureMarkerToken(w.word)) {
                flattenedWords.push({ text: w.word, startTime: w.startTime, endTime: w.endTime });
                flatTimeline.push({ word: w.word, startTime: w.startTime, endTime: w.endTime });
              }
            }
          }
        }
        return {
          words: flattenedWords,
          lyricsTimeline: flatTimeline,
          syncedLines: lrcLines,
          hasWordLevelTimestamps: true
        };
      }
    }

    // Durum 3: Yalnızca düz metin varsa, temizle ve süreye göre akıllı senkronize et
    const cleanLyrics = this.cleanSunoLyricsPrompt(rawPrompt);
    const estimatedDuration = duration > 0 ? duration : 180;
    const fallbackLines = cleanLyrics ? autoSyncLyricsByDuration(cleanLyrics, estimatedDuration) : [];

    const fallbackWords: SunoWordTimestamp[] = [];
    const fallbackTimeline: SunoTimelineWord[] = [];
    for (const line of fallbackLines) {
      if (line.words) {
        for (const w of line.words) {
          if (!isStructureMarkerToken(w.word)) {
            fallbackWords.push({ text: w.word, startTime: w.startTime, endTime: w.endTime });
            fallbackTimeline.push({ word: w.word, startTime: w.startTime, endTime: w.endTime });
          }
        }
      }
    }

    return {
      words: fallbackWords,
      lyricsTimeline: fallbackTimeline,
      syncedLines: fallbackLines,
      hasWordLevelTimestamps: false
    };
  }

  /**
   * Kelime bazlı timestamp dizisini doğal şarkı satırlarına gruplar.
   */
  private groupWordsIntoLines(words: SunoTimelineWord[]): SyncedLine[] {
    if (!words || words.length === 0) return [];

    const rawLines: SyncedLine[] = [];
    let currentLineWords: SyncedWord[] = [];
    let lineStartTime = words[0].startTime;

    for (let i = 0; i < words.length; i++) {
      const curr = words[i];
      const next = words[i + 1];

      // Yapı belirteçlerini satıra dahil etme
      if (!isStructureMarkerToken(curr.word)) {
        currentLineWords.push({
          word: curr.word,
          startTime: curr.startTime,
          endTime: curr.endTime
        });
      }

      // Satır sonu kriterleri (xiliourt / Lumi-Script standartları):
      // 1. İki kelime arasında 0.85s üzerinde vokal nefes/ara boşluğu varsa
      // 2. Satırda 7 veya daha fazla kelime birikmişse ve ufak bir duraklama varsa
      // 3. Cümle bitiş noktalama işareti (., !, ?, ,, ;, :)
      const isPause = next && (next.startTime - curr.endTime >= 0.85);
      const isLongEnough = currentLineWords.length >= 7;
      const isEndOfPunctuation = /[.!?]$/.test(curr.word);
      const isLastWord = i === words.length - 1;

      if ((isPause || isLongEnough || isEndOfPunctuation || isLastWord) && currentLineWords.length > 0) {
        const lineEndTime = curr.endTime;
        const lineText = cleanLyricsText(currentLineWords.map(w => w.word).join(' '));

        if (lineText && !isStructureMarkerToken(lineText)) {
          rawLines.push({
            startTime: lineStartTime,
            endTime: lineEndTime,
            text: lineText,
            words: [...currentLineWords]
          });
        }

        currentLineWords = [];
        if (next) {
          lineStartTime = next.startTime;
        }
      }
    }

    return rawLines;
  }

  /**
   * Suno promptundaki yapı etiketlerini ([Verse 1], [Chorus], [Guitar Solo], (Fast tempo), vb.) temizler.
   */
  public cleanSunoLyricsPrompt(prompt: string): string {
    return cleanLyricsText(prompt);
  }

  // ============================================================
  // 💾 SUNO-LYRICS / XILIOURT / LUMI-SCRIPT DIŞA AKTARMA METODLARI
  // ============================================================

  /** Standart Line-by-Line LRC */
  public exportToLrc(lines: SyncedLine[]): string {
    return exportToLrcText(lines);
  }

  /** Hece/Kelime zamanlamalı Word-by-Word Enhanced LRC */
  public exportToEnhancedLrc(lines: SyncedLine[]): string {
    return exportToEnhancedLrcText(lines);
  }

  /** Premiere / DaVinci / CapCut uyumlu SRT Altyazı */
  public exportToSrt(lines: SyncedLine[]): string {
    return exportToSrtText(lines);
  }

  /** Web Video VTT */
  public exportToVtt(lines: SyncedLine[]): string {
    return exportToVttText(lines);
  }

  /** Apple Music TTML */
  public exportToTtml(lines: SyncedLine[], title = "Suno Track", artist = "Suno AI"): string {
    return exportToTtmlText(lines, title, artist);
  }
}

export const sunoImporter = SunoImporterService.getInstance();
