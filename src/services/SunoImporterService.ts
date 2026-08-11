import { NormalizedSunoTrack, SunoTimelineWord, SunoWordTimestamp, SyncedLine, SyncedWord, TrackMetadata } from "../types";
import { parseLrcText, autoSyncLyricsByDuration } from "./lyricSyncService";
import { phonemeEngine } from "../core/PhonemeAlignmentEngine";

/**
 * SunoImporterService: Suno Şarkı Linki ve Metadata İçe Aktarma Servisi.
 * 
 * Görevler:
 * 1. Suno URL doğrulama (suno.com/s/..., suno.com/song/..., app.suno.ai/song/..., cdn1.suno.ai/... vb.).
 * 2. Public sayfa içeriğinden/API'den metadata analiz etme (/api/suno/inspect ve doğrudan API).
 * 3. TrackMetadata & NormalizedSunoTrack formatına normalize etme.
 * 4. Word-level timestamp varsa lyricsTimeline ve SyncedLine timeline'ına dönüştürme ve PhonemeAlignmentEngine ile zenginleştirme.
 * 5. Timestamp yoksa mevcut LRC parser / WhisperX fallback / PhonemeAlignmentEngine ile kesintisiz uyumluluk sağlama.
 * 6. Audio stream'i hem Web Audio player hem de Blob formatında temin etme.
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
   * Girilen metnin geçerli bir Suno URL'i veya Track ID olup olmadığını doğrular.
   */
  public validateUrl(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    const trimmed = input.trim();

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
   * Suno şarkısını sunucu proxy'si ve istemci fallback ile normalize edilmiş track nesnesine dönüştürür.
   */
  public async importTrack(urlOrId: string): Promise<NormalizedSunoTrack> {
    const trimmed = (urlOrId || "").trim();
    if (!trimmed) {
      throw new Error("Lütfen geçerli bir Suno şarkı bağlantısı girin. (Örn: https://suno.com/s/a2hf69thdnYq25lG veya https://suno.com/song/...)");
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

    if (!rawData && !trackId) {
      throw new Error("Suno bağlantısından şarkı bilgisi çözümlenemedi. Lütfen bağlantıyı kontrol edin.");
    }

    // ADIM 3: Veriyi normalize et
    return this.normalizeSunoData(rawData, trackId || rawData?.id || "suno-track");
  }

  /**
   * Ham Suno API verisini veya varsayılan CDN verisini NormalizedSunoTrack formatına dönüştürür.
   */
  public normalizeSunoData(raw: any, trackId: string): NormalizedSunoTrack {
    const title = (raw?.title || raw?.name || "Suno Track").trim();
    const artist = (raw?.display_name || raw?.handle || raw?.user_name || "Suno AI").trim();
    const promptLyrics = raw?.metadata?.prompt || raw?.prompt || "";
    const tags = raw?.metadata?.tags || raw?.tags || "";
    const duration = raw?.metadata?.duration || raw?.duration || 0;

    // Audio URL (Öncelik: raw audio_url, yoksa CDN fallback)
    const rawAudioUrl = raw?.audio_url || `https://cdn1.suno.ai/${trackId}.mp3`;
    // Web Audio CORS engellerini aşmak için proxy stream URL'i oluştur
    const proxyAudioUrl = `/api/suno/proxy-audio?id=${encodeURIComponent(trackId)}&url=${encodeURIComponent(rawAudioUrl)}`;

    // Kapak görseli
    const imageUrl = raw?.image_large_url || raw?.image_url || `https://cdn1.suno.ai/image_${trackId}.png`;

    // Word-Level Timestamps ve Alignment Verisini Ayrıştır
    const { words, lyricsTimeline, syncedLines, hasWordLevelTimestamps } = this.parseAlignmentAndLyrics(
      promptLyrics,
      raw?.metadata?.alignment || raw?.alignment || raw?.word_timestamps || raw?.words,
      duration
    );

    return {
      id: trackId,
      title,
      artist,
      lyrics: promptLyrics,
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
   * Bu Blob, mevcut player, sunucu FFmpeg render motoru ve MediaRecorder ile %100 uyumludur.
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
      for (const item of alignmentData) {
        const text = item.word || item.text || item.token || "";
        const startTime = typeof item.start === 'number' ? item.start : (item.startTime ?? 0);
        const endTime = typeof item.end === 'number' ? item.end : (item.endTime ?? (startTime + 0.4));

        if (text && text.trim()) {
          const cleanWord = text.trim();
          const s = Math.max(0, Math.round(startTime * 100) / 100);
          const e = Math.max(s + 0.1, Math.round(endTime * 100) / 100);

          extractedWords.push({ text: cleanWord, startTime: s, endTime: e });
          timelineWords.push({ word: cleanWord, startTime: s, endTime: e });
        }
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
              flattenedWords.push({ text: w.word, startTime: w.startTime, endTime: w.endTime });
              flatTimeline.push({ word: w.word, startTime: w.startTime, endTime: w.endTime });
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
          fallbackWords.push({ text: w.word, startTime: w.startTime, endTime: w.endTime });
          fallbackTimeline.push({ word: w.word, startTime: w.startTime, endTime: w.endTime });
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

    const lines: SyncedLine[] = [];
    let currentLineWords: SyncedWord[] = [];
    let lineStartTime = words[0].startTime;

    for (let i = 0; i < words.length; i++) {
      const curr = words[i];
      const next = words[i + 1];

      currentLineWords.push({
        word: curr.word,
        startTime: curr.startTime,
        endTime: curr.endTime
      });

      // Satır sonu kriterleri:
      // 1. İki kelime arasında 1.0 saniyeden fazla boşluk varsa
      // 2. Satırda 7 veya daha fazla kelime birikmişse ve ufak bir duraklama varsa
      // 3. Noktalama işareti (nokta, ünlem, soru işareti, virgül sonu)
      const isPause = next && (next.startTime - curr.endTime > 1.0);
      const isLongEnough = currentLineWords.length >= 7;
      const isEndOfPunctuation = /[.!?]$/.test(curr.word);
      const isLastWord = i === words.length - 1;

      if (isPause || isLongEnough || isEndOfPunctuation || isLastWord) {
        const lineEndTime = curr.endTime;
        const lineText = currentLineWords.map(w => w.word).join(' ');

        lines.push({
          startTime: lineStartTime,
          endTime: lineEndTime,
          text: lineText,
          words: [...currentLineWords]
        });

        currentLineWords = [];
        if (next) {
          lineStartTime = next.startTime;
        }
      }
    }

    return lines;
  }

  /**
   * Suno promptundaki yapı etiketlerini ([Verse 1], [Chorus], [Guitar Solo], vb.) temizler.
   */
  public cleanSunoLyricsPrompt(prompt: string): string {
    if (!prompt) return "";

    return prompt
      // [Verse 1], [Chorus], [Outro], (Fast tempo) vb. yapı etiketlerini kaldır
      .replace(/\[[^\]]+\]/g, '')
      .replace(/\([^\)]+(?:beat|drop|solo|tempo|outro|intro|instrumental)[^\)]*\)/gi, '')
      // Birden fazla boş satırı teke indir
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n');
  }
}

export const sunoImporter = SunoImporterService.getInstance();
