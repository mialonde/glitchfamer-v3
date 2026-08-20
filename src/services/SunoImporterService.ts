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

    if (Array.isArray(rawData) && rawData.length > 0) {
      rawData = rawData[0];
    }
    const resolvedTrackId = rawData?.id || trackId;

    // ADIM 3: Eğer parça bilgisi geldi ama hizalama (aligned_lyrics) eksikse, alignment endpoint'ini sorgula
    if (rawData && resolvedTrackId && (!rawData.aligned_lyrics && !rawData.metadata?.alignment)) {
      try {
        const alignRes = await fetch(`/api/suno/aligned-lyrics/${resolvedTrackId}`);
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

    if (!rawData && !resolvedTrackId) {
      throw new Error("Suno bağlantısından şarkı bilgisi çözümlenemedi. Lütfen bağlantıyı kontrol edin.");
    }

    // ADIM 4: Veriyi normalize et
    return this.normalizeSunoData(rawData, resolvedTrackId || "suno-track");
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
   * (get-suno-lyric / Suno Lyric Downloader motoru algoritması ile %100 uyumlu)
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
    // Durum 1: Suno Alignment / Word Timestamps dizisi mevcutsa (get-suno-lyric motoru)
    if (alignmentData && Array.isArray(alignmentData) && alignmentData.length > 0) {
      const extractedWords: (SunoWordTimestamp & { hasNewline?: boolean })[] = [];
      const timelineWords: SunoTimelineWord[] = [];

      for (let i = 0; i < alignmentData.length; i++) {
        const item = alignmentData[i];
        if (!item || typeof item !== 'object') continue;

        const rawText = (item.text ?? item.word ?? item.token ?? "").toString();
        
        // Suno API varyasyonları (start_s, start, startTime, begin)
        const startTime = typeof item.start_s === 'number' 
          ? item.start_s 
          : (typeof item.start === 'number' ? item.start : (item.startTime ?? item.begin ?? 0));
        
        const endTime = typeof item.end_s === 'number' 
          ? item.end_s 
          : (typeof item.end === 'number' ? item.end : (item.endTime ?? (startTime + 0.35)));

        const hasNewline = Boolean(item.has_newline ?? item.hasNewline ?? /\n|\r/.test(rawText));
        const cleanWord = rawText.replace(/[\r\n]/g, "").trim();

        // We will do a consolidated jitter analysis after the loop instead of spamming console.log here.

        if (!cleanWord || isStructureMarkerToken(cleanWord)) {
          continue;
        }

        const s = Math.max(0, Math.round(startTime * 100) / 100);
        const e = Math.max(s + 0.05, Math.round(endTime * 100) / 100);

        extractedWords.push({ text: cleanWord, startTime: s, endTime: e, hasNewline });
        timelineWords.push({ word: cleanWord, startTime: s, endTime: e });
      }

      if (extractedWords.length > 0) {
        // [DEBUG LOG] Consolidated Jitter Analysis
        console.groupCollapsed("[SYNC DEBUG] Suno Raw Word Timestamps & Jitter Analysis");
        const tableData = extractedWords.map((w, i) => {
          const prev = i > 0 ? extractedWords[i-1] : null;
          const gap = prev ? (w.startTime - prev.endTime).toFixed(3) : '0.000';
          const duration = (w.endTime - w.startTime).toFixed(3);
          const isJittery = prev ? (w.startTime < prev.startTime || w.startTime < prev.endTime - 0.1) : false; // Allow slight overlap
          
          return {
            Word: w.text,
            Start: w.startTime.toFixed(3),
            End: w.endTime.toFixed(3),
            Duration: duration,
            GapToPrev: gap,
            Jitter: isJittery ? '⚠️ YES' : 'NO'
          };
        });
        console.table(tableData);
        
        const jitterCount = tableData.filter(d => d.Jitter !== 'NO').length;
        if (jitterCount > 0) {
          console.warn(`[SYNC WARNING] Detected ${jitterCount} potential jittery/overlapping timestamps from Suno payload! This may cause visual stuttering.`);
        } else {
          console.info("[SYNC INFO] Timestamps appear sequentially stable. No major jitter detected.");
        }
        console.groupEnd();

        const rawLines = this.groupWordsIntoLines(extractedWords);
        const smoothedLines = this.smoothLineDurations(rawLines);
        const enrichedLines = phonemeEngine.enrichLyricsWithPhonemes(smoothedLines);

        return {
          words: extractedWords,
          lyricsTimeline: timelineWords,
          syncedLines: enrichedLines,
          hasWordLevelTimestamps: true
        };
      }
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
   * Suno'nun kelime bazlı zamanlamalarını (extractedWords) şarkının orijinal prompt satırlarıyla (rawPrompt)
   * %100 birebir eşleştirir. (get-suno-lyric / Suno Lyric Downloader motoru standartlarında)
   */
  private alignWordsWithPrompt(
    rawPrompt: string,
    extractedWords: (SunoWordTimestamp & { hasNewline?: boolean })[],
    timelineWords: SunoTimelineWord[]
  ): SyncedLine[] {
    const cleanPrompt = this.cleanSunoLyricsPrompt(rawPrompt);
    const promptLines = cleanPrompt
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !isStructureMarkerToken(l));

    if (!extractedWords || extractedWords.length === 0) {
      return [];
    }

    // YÖNTEM 1 (En Güvenilir & Doğrudan): Suno kelimelerindeki \n (newline) işaretlerine göre doğal gruplama.
    const hasExplicitNewlinesInWords = extractedWords.some(w => w.hasNewline);

    if (hasExplicitNewlinesInWords || promptLines.length === 0) {
      const grouped = this.groupWordsIntoLines(extractedWords);
      return this.smoothLineDurations(grouped);
    }

    // YÖNTEM 2: Prompt Satırlarıyla Akıllı Bulanık (Fuzzy) Eşleme
    const normalizeWord = (str: string) => (str || "")
      .toLowerCase()
      .replace(/[\[\]\(\)\{\}\<\>\,\.\!\?\:\;\"\'\-\–\—\…]/g, '')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .trim();

    let rawLines: SyncedLine[] = [];
    let wordIdx = 0;

    for (let l = 0; l < promptLines.length; l++) {
      const lineText = promptLines[l];
      const targetWords = lineText
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => Boolean(w) && !isStructureMarkerToken(w));

      if (targetWords.length === 0) continue;

      const normTargets = targetWords.map(normalizeWord).filter(Boolean);
      if (normTargets.length === 0) continue;

      // İlk kelimeyi extractedWords dizisinde wordIdx konumundan itibaren esnek pencereli ara (max 30 kelime)
      let matchedStartIdx = -1;
      const searchEnd = Math.min(extractedWords.length, wordIdx + 30);

      for (let i = wordIdx; i < searchEnd; i++) {
        const ewNorm = normalizeWord(extractedWords[i].text);
        if (ewNorm && (ewNorm === normTargets[0] || ewNorm.startsWith(normTargets[0]) || normTargets[0].startsWith(ewNorm))) {
          matchedStartIdx = i;
          break;
        }
      }

      // Eğer kelime bulunamadıysa ama elimizde tüketilmesi gereken kelime varsa, wordIdx'ten devam et
      if (matchedStartIdx === -1) {
        if (wordIdx < extractedWords.length) {
          matchedStartIdx = wordIdx;
        } else {
          break;
        }
      }

      const lineMatchedWords: SyncedWord[] = [];
      let currIdx = matchedStartIdx;

      for (let t = 0; t < targetWords.length && currIdx < extractedWords.length; t++) {
        const ew = extractedWords[currIdx];
        lineMatchedWords.push({
          word: targetWords[t],
          startTime: ew.startTime,
          endTime: ew.endTime
        });
        currIdx++;
      }

      if (lineMatchedWords.length > 0) {
        rawLines.push({
          startTime: lineMatchedWords[0].startTime,
          endTime: lineMatchedWords[lineMatchedWords.length - 1].endTime,
          text: lineText,
          words: lineMatchedWords
        });
        wordIdx = currIdx;
      }
    }

    // Prompt bittiği halde geride kalan kelimeler varsa onları da ekle
    if (wordIdx < extractedWords.length && rawLines.length > 0) {
      const remainingWords = extractedWords.slice(wordIdx);
      const remainingGrouped = this.groupWordsIntoLines(remainingWords);
      rawLines.push(...remainingGrouped);
    }

    if (rawLines.length === 0) {
      rawLines = this.groupWordsIntoLines(extractedWords);
    }

    return this.smoothLineDurations(rawLines);
  }

  /** Satır bitiş sürelerini ekranda pürüzsüz tutmak için yumuşatır */
  private smoothLineDurations(lines: SyncedLine[]): SyncedLine[] {
    for (let i = 0; i < lines.length; i++) {
      const curr = lines[i];
      const next = lines[i + 1];

      if (next) {
        const maxHold = (curr.words && curr.words.length > 0)
          ? curr.words[curr.words.length - 1].endTime + 2.2
          : curr.startTime + 5.0;

        curr.endTime = Math.round(Math.min(next.startTime - 0.08, Math.max(curr.endTime, maxHold)) * 100) / 100;
      } else {
        curr.endTime = Math.round((curr.endTime + 2.5) * 100) / 100;
      }
    }
    return lines;
  }

  /**
   * Kelime bazlı timestamp dizisini doğal şarkı satırlarına gruplar.
   */
  private groupWordsIntoLines(words: (SunoWordTimestamp & { hasNewline?: boolean })[]): SyncedLine[] {
    if (!words || words.length === 0) return [];

    const rawLines: SyncedLine[] = [];
    let currentLineWords: SyncedWord[] = [];
    let lineStartTime = words[0].startTime;

    for (let i = 0; i < words.length; i++) {
      const curr = words[i];
      const next = words[i + 1];

      // Yapı belirteçlerini satıra dahil etme
      if (!isStructureMarkerToken(curr.text)) {
        currentLineWords.push({
          word: curr.text,
          startTime: curr.startTime,
          endTime: curr.endTime
        });
      }

      // Satır sonu kriterleri (get-suno-lyric standartları):
      // 1. Kelime verisinde açık \n (newline) sinyali varsa
      // 2. İki kelime arasında 0.9s üzerinde belirgin müzikal es/duraklama varsa
      // 3. Son kelime ise
      const isExplicitNewline = Boolean(curr.hasNewline);
      const isPause = next && (next.startTime - curr.endTime >= 0.9);
      const isLastWord = i === words.length - 1;

      if ((isExplicitNewline || isPause || isLastWord) && currentLineWords.length > 0) {
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
