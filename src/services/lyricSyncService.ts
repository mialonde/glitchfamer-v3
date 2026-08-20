import { SyncedLine, SyncedWord } from "../types";
import { phonemeEngine } from "../core/PhonemeAlignmentEngine";

/**
 * Suno, AI müzik jeneratörleri ve şarkı sözü dosyalarındaki yapı/komut belirteçlerini
 * ([Verse 1], [Chorus], (Guitar Solo), (Drop), (Pause - Single Kick), {Intro}, vb.) tespit eder.
 */
export function isStructureMarkerToken(token: string): boolean {
  if (!token) return false;
  const trimmed = token.trim();
  if (!trimmed) return false;

  // 1. Köşeli, süslü veya açılı parantez içine alınmış HER TÜRLÜ etiket: [Verse 1], [Chorus], [1], [Drop], [Guitar Solo], {Intro}, <Solo> vb.
  if (/^[\[\{<][^\]\}>]+[\]\}>]$/.test(trimmed)) {
    return true;
  }

  // 2. Parantez içi müzik, ritim, prodüksiyon veya yapı yönlendirmeleri ve komutları:
  // Örn: (Pause - Single Kick), (Guitar Solo), (Fast tempo), (Beat drop), (Instrumental), (Drop - Heavy 808), (Chorus x2)
  if (/^\([^)]+\)$/.test(trimmed)) {
    // Parantez içi müzik / prodüksiyon anahtar kelimeleri
    const musicKeywords = /(?:verse|chorus|bridge|intro|outro|hook|drop|pre-chorus|post-chorus|refrain|interlude|break|breakdown|build|buildup|solo|instrumental|guitar|piano|synth|drum|drums|beat|tempo|vocal|vocals|whisper|spoken|applause|cheering|screaming|echo|ad-lib|fade|end|coda|key change|female|male|duet|brass|strings|orchestral|fast|slow|acoustic|electronic|heavy|soft|bass|pause|kick|snare|hi-hat|hihat|cymbal|808|riff|ambient|lead|chords|melody|fill|silence|switch|sample|effect|fx|sound|vocalist|singer|talking|laugh|chuckle|x\d+|\d+x)/i;
    
    if (musicKeywords.test(trimmed)) {
      return true;
    }

    // Tire, iki nokta veya yönlendirme içeren parantezli komutlar: (Pause - Single Kick), (Beat: Fast)
    if (/\([^)]*[-:–—][^)]*\)/.test(trimmed)) {
      return true;
    }

    // 4 kelimeden kısa ve standart şarkı sözü cümlesi olmayan parantezler
    const innerWords = trimmed.slice(1, -1).trim().split(/\s+/);
    if (innerWords.length <= 4 && /(?:pause|kick|beat|drop|solo|instrumental|music|sound|break|tempo)/i.test(trimmed)) {
      return true;
    }
  }

  // 3. Parantez veya köşeli parantez kırıntıları / kelime parçaları: "[Verse", "1]", "[Chorus", "(Solo", "(Pause", "Kick)"
  if (/^[\[\(]/.test(trimmed) || /[\]\)]$/.test(trimmed)) {
    if (/(?:verse|chorus|bridge|intro|outro|hook|drop|pre-chorus|post-chorus|refrain|interlude|break|build|solo|instrumental|guitar|piano|synth|drum|beat|tempo|vocal|whisper|spoken|applause|fade|end|coda|pause|kick|snare|hi-hat|808)/i.test(trimmed)) {
      return true;
    }
  }

  // 4. İki nokta ile biten veya doğrudan yapı belirten başlıklar: "Verse 1:", "Chorus:", "Intro:", "Bridge:", "Outro:"
  if (/^(?:verse|chorus|bridge|intro|outro|hook|pre-chorus|post-chorus|refrain|interlude|breakdown|drop|solo|instrumental)\s*(?:\d+)?\s*:?$/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Şarkı sözü metnindeki tüm yapısal etiketleri, komutları ve gereksiz parantezleri temizler.
 * Şarkıda gerçekten seslendirilen/okunan temiz lirik metnini döndürür.
 */
export function cleanLyricsText(text: string): string {
  if (!text) return "";

  const musicKeywordsPattern = '(?:verse|chorus|bridge|intro|outro|hook|drop|pre-chorus|post-chorus|refrain|interlude|break|breakdown|build|buildup|solo|instrumental|guitar|piano|synth|drum|drums|beat|tempo|vocal|vocals|whisper|spoken|applause|cheering|screaming|echo|ad-lib|fade|end|coda|key change|female|male|duet|brass|strings|orchestral|fast|slow|acoustic|electronic|heavy|soft|bass|pause|kick|snare|hi-hat|hihat|cymbal|808|riff|ambient|lead|chords|melody|fill|silence|switch|sample|effect|fx|sound|vocalist|singer|talking|laugh|chuckle|x\\d+|\\d+x)';

  return text
    // 1. Köşeli parantez içindeki tüm yapıları temizle: [Verse 1], [Chorus], [Guitar Solo], [Drop], [BPM: 120] vb.
    .replace(/\[[^\]]*\]/g, '')
    // 2. Süslü ve açılı parantezleri temizle: {Verse}, <Chorus>
    .replace(/\{[^}]*\}/g, '')
    .replace(/<[^>]*>/g, '')
    // 3. Müzikal komut / yapı belirten normal parantezleri temizle: (Guitar Solo), (Chorus), (Pause - Single Kick), (Intro), (Instrumental break) vb.
    .replace(new RegExp(`\\([^\\)]*${musicKeywordsPattern}[^\\)]*\\)`, 'gi'), '')
    // 4. Tireli veya yönlendirmeli parantezli komutları temizle: (Pause - Single Kick)
    .replace(/\([^\)]*[-:–—][^\)]*\)/g, '')
    // 5. Satır başındaki çıplak yapı etiketlerini ("Verse 1:", "Chorus:", "Intro:") temizle
    .replace(/^(?:verse|chorus|bridge|intro|outro|hook|pre-chorus|post-chorus|refrain|interlude|breakdown|drop|solo|instrumental)\s*(?:\d+)?\s*:\s*$/gim, '')
    // 6. Satır satır derinlemesine temizlik ve filtreleme
    .split('\n')
    .map(line => {
      let cleaned = line
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\{[^}]*\}/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(new RegExp(`\\([^\\)]*${musicKeywordsPattern}[^\\)]*\\)`, 'gi'), '')
        .replace(/\([^\)]*[-:–—][^\)]*\)/g, '')
        .replace(/^(?:verse|chorus|bridge|intro|outro|hook|pre-chorus|post-chorus|refrain|interlude|breakdown|drop|solo|instrumental)\s*(?:\d+)?\s*:\s*/gi, '')
        .trim();

      // Sadece yapı komutu içeren parantezli satırları yok et
      if (/^\([^)]+\)$/.test(cleaned)) {
        if (isStructureMarkerToken(cleaned)) {
          return '';
        }
      }

      if (isStructureMarkerToken(cleaned)) {
        return '';
      }

      // Baştaki/sondaki fazladan kalan işaretleri kaldır
      cleaned = cleaned.replace(/^[-–—:\s]+/, '').replace(/[-–—:\s]+$/, '').trim();
      return cleaned;
    })
    .filter(line => line.length > 0)
    .join('\n');
}

export const MESELE_DEMO_LRC_TEXT = `[00:17.41]Geceler geçmiyo'
[00:19.68]Sabahlar bitmiyo'
[00:21.94]Nitekim dinmiyor, ağrı, sebebini bilmiyom
[00:26.30]Hızlıyım, sorunlarla soranlar incitmiyo'
[00:31.00]Kim diyor, evim? yakarım hiç bilmiyo'
[00:35.49]"Gezelim hadi gel, bin!" diyor
[00:38.14]Gidelim istiyor: "Zamanım var benim"
[00:41.83]Kısa kes! seni dinliyom:
[00:44.72]"Bir sigara daha yaktım
[00:46.43]Belki susar kafamdaki ses
[00:49.01]Yokluğun ayrı bela
[00:51.03]Varlığın ayrı bir nefes"
[00:53.32]Sorarsan ayaktayım da
[00:55.73]Yaşamak başka mesele
[00:57.92]Bazı günler ölmek değil
[00:59.94]Sabahlamak zor o mesele
[01:02.52]Sözüm şiirlerin mükemmelidir
[01:07.05]Senden başkasını seven delidir
[01:11.58]Yüzün çiçeklerin en güzelidir
[01:15.93]Gözlerin bilinmez bir diyar gibi
[01:20.25]Sokak lambaları yanık
[01:21.64]Yine gece mesaisindeyim
[01:23.97]Kaç gecedir aynı filmi
[01:25.68]Farklı kafayla seyretmekteyim
[01:28.50]Müslüm çalıyor uzaktan
[01:30.28]Şarkı ciğerime oturuyo'
[01:33.10]Bazı şarkılar var ya
[01:34.84]Adamın ömrünü çürütüyo'
[01:37.38]Çocukluğum kaldı bir yerde
[01:39.68]Bulsam alıp gelicem
[01:41.74]Bu yaştan sonra kimseye derdimi anlatam'icam
[01:46.48]Herkes kendi hesabında kendi derdinde
[01:50.79]Benim içimde kıyamet var kendi halimde
[01:55.11]Sözüm şiirlerin mükemmelidir
[01:59.61]Senden başkasını seven delidir
[02:03.68]Yüzün çiçeklerin en güzelidir
[02:08.49]Gözlerin bilinmez bir diyar gibi`;

export function getMeseleDemoSyncedLyrics(): SyncedLine[] {
  return parseLrcText(MESELE_DEMO_LRC_TEXT);
}

/**
 * LRC formatındaki metni SyncedLine nesnelerine dönüştürür.
 * Desteklenen formatlar: [01:23.45] Söz metni veya [01:23] Söz metni
 */
export function parseLrcText(lrc: string): SyncedLine[] {
  if (!lrc || !lrc.trim()) return [];

  const lines = lrc.split('\n');
  const parsedItems: { time: number; text: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Header etiketlerini (ör: [ar: Sanatçı], [ti: Başlık]) atla
    if (/^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) {
      continue;
    }

    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    let match;
    const timestamps: number[] = [];

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const totalSecs = mins * 60 + secs + fraction;
      timestamps.push(totalSecs);
    }

    const rawTextWithoutTime = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
    const cleanText = cleanLyricsText(rawTextWithoutTime);

    // Eğer satır sadece yapı etiketi ([Verse], (Solo) vb.) ise veya boşsa listeye ekleme
    if (timestamps.length > 0 && cleanText && !isStructureMarkerToken(cleanText)) {
      for (const t of timestamps) {
        parsedItems.push({ time: t, text: cleanText });
      }
    }
  }

  // Zaman sırasına diz
  parsedItems.sort((a, b) => a.time - b.time);

  const syncedLines: SyncedLine[] = [];
  for (let i = 0; i < parsedItems.length; i++) {
    const current = parsedItems[i];
    const rawGap = i < parsedItems.length - 1 ? (parsedItems[i + 1].time - current.time) : 4.5;
    
    // Kelimeleri bölerek kelime bazlı animasyon için de zaman ata (yapı belirteçlerini filtrele)
    const wordsArray = current.text
      .split(' ')
      .map(w => w.trim())
      .filter(w => Boolean(w) && !isStructureMarkerToken(w));

    if (wordsArray.length === 0) continue;

    // Cümlenin doğal konuşma/şarkı süresi (kelime başına ~0.55-0.75s, sonraki satıra kadar olan boşluktan fazla olamaz)
    const naturalLineDur = Math.max(1.2, wordsArray.length * 0.65);
    const lineDuration = Math.min(Math.max(1.0, rawGap - 0.4), naturalLineDur);
    const lineEndTime = current.time + lineDuration;

    // Kelime uzunluklarına göre ağırlıklı zamanlama (uzun kelimeler biraz daha uzun sürer)
    const totalChars = wordsArray.reduce((acc, w) => acc + Math.max(2, w.length), 0);
    let runningTime = current.time;

    const words = wordsArray.map((w) => {
      const charWeight = Math.max(2, w.length) / Math.max(1, totalChars);
      const wDur = Math.max(0.2, lineDuration * charWeight);
      const wStart = runningTime;
      const wEnd = runningTime + wDur;
      runningTime = wEnd;

      return {
        word: w,
        startTime: Math.round(wStart * 100) / 100,
        endTime: Math.round(wEnd * 100) / 100
      };
    });

    syncedLines.push({
      startTime: Math.round(current.time * 100) / 100,
      endTime: Math.round(lineEndTime * 100) / 100,
      text: wordsArray.join(' '),
      words: words
    });
  }

  return phonemeEngine.enrichLyricsWithPhonemes(syncedLines);
}

/**
 * SyncedLine dizisini standart .LRC formatına dönüştürür.
 */
export function exportToLrcText(lines: SyncedLine[]): string {
  if (!lines || lines.length === 0) return "";

  return lines
    .filter(line => line.text && !isStructureMarkerToken(line.text))
    .map(line => {
      const mins = Math.floor(line.startTime / 60);
      const secs = Math.floor(line.startTime % 60);
      const ms = Math.floor((line.startTime % 1) * 100);
      const formattedTime = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
      return `${formattedTime} ${cleanLyricsText(line.text)}`;
    })
    .join('\n');
}

/**
 * BetterLyrics: SyncedLine dizisini hece/kelime seviyesinde Enhanced LRC (.elrc / .lrc) formatına dönüştürür.
 * Format: [00:12.34]<00:12.34>Kelime1 <00:12.80>Kelime2 <00:13.20>Kelime3
 */
export function exportToEnhancedLrcText(lines: SyncedLine[]): string {
  if (!lines || lines.length === 0) return "";

  return lines
    .filter(line => line.text && !isStructureMarkerToken(line.text))
    .map(line => {
      const mins = Math.floor(line.startTime / 60);
      const secs = Math.floor(line.startTime % 60);
      const ms = Math.floor((line.startTime % 1) * 100);
      const formattedLineTime = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;

      if (line.words && line.words.length > 0) {
        const wordsStr = line.words
          .filter(w => !isStructureMarkerToken(w.word))
          .map(w => {
            const wMins = Math.floor(w.startTime / 60);
            const wSecs = Math.floor(w.startTime % 60);
            const wMs = Math.floor((w.startTime % 1) * 100);
            const tag = `<${String(wMins).padStart(2, '0')}:${String(wSecs).padStart(2, '0')}.${String(wMs).padStart(2, '0')}>`;
            return `${tag}${w.word}`;
          })
          .join(' ');
        return `${formattedLineTime}${wordsStr}`;
      }

      return `${formattedLineTime} ${cleanLyricsText(line.text)}`;
    })
    .join('\n');
}

/**
 * BetterLyrics / Apple Music: SyncedLine dizisini profesyonel TTML (Timed Text Markup Language) formatına dönüştürür.
 */
export function exportToTtmlText(lines: SyncedLine[], title = "GlitchFramer Track", artist = "Artist"): string {
  if (!lines || lines.length === 0) return "";

  const formatTtmlTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 1000);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const paragraphs = lines
    .filter(line => line.text && !isStructureMarkerToken(line.text))
    .map((line, idx) => {
      const pBegin = formatTtmlTime(line.startTime);
      const pEnd = formatTtmlTime(line.endTime);

      let inner = cleanLyricsText(line.text);
      if (line.words && line.words.length > 0) {
        inner = line.words
          .filter(w => !isStructureMarkerToken(w.word))
          .map(w => {
            const wBegin = formatTtmlTime(w.startTime);
            const wEnd = formatTtmlTime(w.endTime);
            return `      <span begin="${wBegin}" end="${wEnd}">${escapeXml(w.word)}</span>`;
          })
          .join('\n');
        return `    <p id="p${idx + 1}" begin="${pBegin}" end="${pEnd}">\n${inner}\n    </p>`;
      }

      return `    <p id="p${idx + 1}" begin="${pBegin}" end="${pEnd}">${escapeXml(inner)}</p>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<tt xmlns="http://www.w3.org/ns/ttml" xmlns:ttm="http://www.w3.org/ns/ttml#metadata" xmlns:itunes="http://music.apple.com/metadata">
  <head>
    <metadata>
      <ttm:title>${escapeXml(title)}</ttm:title>
      <ttm:agent type="person">${escapeXml(artist)}</ttm:agent>
      <itunes:timing type="word-by-word" />
    </metadata>
  </head>
  <body>
    <div>
${paragraphs}
    </div>
  </body>
</tt>`;
}

/**
 * Premiere Pro / DaVinci Resolve / CapCut uyumlu SRT Altyazı Dışa Aktarma
 */
export function exportToSrtText(lines: SyncedLine[]): string {
  if (!lines || lines.length === 0) return "";

  const formatSrtTime = (seconds: number) => {
    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  };

  return lines
    .filter(line => line.text && !isStructureMarkerToken(line.text))
    .map((line, idx) => {
      const clean = cleanLyricsText(line.text);
      return `${idx + 1}\n${formatSrtTime(line.startTime)} --> ${formatSrtTime(line.endTime)}\n${clean}\n`;
    })
    .join('\n');
}

/**
 * Web Video / HTML5 Video Oynatıcıları uyumlu VTT Altyazı Dışa Aktarma
 */
export function exportToVttText(lines: SyncedLine[], title = "GlitchFramer"): string {
  if (!lines || lines.length === 0) return "WEBVTT\n\n";

  const formatVttTime = (seconds: number) => {
    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
  };

  const body = lines
    .filter(line => line.text && !isStructureMarkerToken(line.text))
    .map((line, idx) => {
      const clean = cleanLyricsText(line.text);
      return `${idx + 1}\n${formatVttTime(line.startTime)} --> ${formatVttTime(line.endTime)}\n${clean}\n`;
    })
    .join('\n');

  return `WEBVTT - ${title}\n\n${body}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * BetterLyrics TTML Parser: TTML (Apple Music) formatındaki sözleri kelime seviyesinde ayrıştırır.
 */
export function parseTtmlText(ttml: string): SyncedLine[] {
  if (!ttml || !ttml.trim()) return [];

  const lines: SyncedLine[] = [];
  const parseTime = (str: string): number => {
    if (!str) return 0;
    if (str.endsWith('s')) return parseFloat(str.replace('s', '')) || 0;
    const parts = str.split(':');
    if (parts.length === 3) {
      return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    } else if (parts.length === 2) {
      return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(str) || 0;
  };

  // Basit ve hızlı Regex tabanlı XML parser (tarayıcı ve sunucu uyumlu)
  const pRegex = /<p\b[^>]*begin="([^"]+)"[^>]*end="([^"]+)"[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;

  while ((pMatch = pRegex.exec(ttml)) !== null) {
    const startTime = parseTime(pMatch[1]);
    const endTime = parseTime(pMatch[2]);
    const pContent = pMatch[3];

    const spanRegex = /<span\b[^>]*begin="([^"]+)"[^>]*end="([^"]+)"[^>]*>([\s\S]*?)<\/span>/gi;
    let sMatch;
    const words: SyncedWord[] = [];
    let fullText = "";

    while ((sMatch = spanRegex.exec(pContent)) !== null) {
      const wStart = parseTime(sMatch[1]);
      const wEnd = parseTime(sMatch[2]);
      const rawWord = sMatch[3].replace(/<[^>]+>/g, '').trim();
      const cleanW = cleanLyricsText(rawWord);

      if (cleanW && !isStructureMarkerToken(cleanW)) {
        words.push({
          word: cleanW,
          startTime: Math.round(wStart * 100) / 100,
          endTime: Math.round(wEnd * 100) / 100
        });
        fullText += (fullText ? " " : "") + cleanW;
      }
    }

    if (words.length === 0) {
      fullText = cleanLyricsText(pContent.replace(/<[^>]+>/g, '').trim());
    }

    if (fullText && !isStructureMarkerToken(fullText)) {
      lines.push({
        startTime: Math.round(startTime * 100) / 100,
        endTime: Math.round(endTime * 100) / 100,
        text: fullText,
        words: words.length > 0 ? words : undefined
      });
    }
  }

  return phonemeEngine.enrichLyricsWithPhonemes(lines);
}

/**
 * BetterLyrics Instrumental Gap Detector:
 * Şarkı sözleri arasındaki enstrümantal molaları, soloları ve nefes aralıklarını tespit eder.
 */
export interface InstrumentalGap {
  afterLineIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
}

export function detectInstrumentalGaps(lines: SyncedLine[], minGapDuration = 2.4): InstrumentalGap[] {
  if (!lines || lines.length < 2) return [];

  const gaps: InstrumentalGap[] = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const current = lines[i];
    const next = lines[i + 1];
    const gap = next.startTime - current.endTime;
    if (gap >= minGapDuration) {
      gaps.push({
        afterLineIndex: i,
        startTime: current.endTime,
        endTime: next.startTime,
        duration: Math.round(gap * 10) / 10
      });
    }
  }
  return gaps;
}

/**
 * BetterLyrics Universal Lyrics Parser:
 * Formatı (TTML, Enhanced LRC, Standart LRC veya Düz Metin) otomatik tespit edip en yüksek hassasiyette parse eder.
 */
export function parseUniversalLyrics(text: string, defaultDuration = 180): SyncedLine[] {
  if (!text || !text.trim()) return [];

  const trimmed = text.trim();
  if (trimmed.startsWith('<tt') || trimmed.includes('<p begin=')) {
    const ttmlResult = parseTtmlText(trimmed);
    if (ttmlResult.length > 0) return ttmlResult;
  }

  // Standart veya Enhanced LRC mi?
  if (/\[\d{1,2}:\d{2}/.test(trimmed)) {
    const lrcResult = parseLrcText(trimmed);
    if (lrcResult.length > 0) return lrcResult;
  }

  // Düz Metin (Akıllı Kadans Motoru ile Dağıt)
  return autoSyncLyricsByDuration(trimmed, defaultDuration);
}

/**
 * Düz şarkı sözü metnini hece, kelime ve karakter ağırlıklı akıllı müzikal kadans motoru ile
 * toplam şarkı süresine göre dinamik ve son derece doğal aralıklarla senkronize eder.
 */
export function autoSyncLyricsByDuration(rawText: string, totalDuration: number, customIntroTime?: number): SyncedLine[] {
  if (!rawText || !rawText.trim()) return [];

  const cleanedText = cleanLyricsText(rawText);
  const rawLines = cleanedText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !isStructureMarkerToken(l));

  if (rawLines.length === 0) return [];

  const songDuration = totalDuration > 10 ? totalDuration : 180;

  // 1. Akıllı Intro & Outro Payı (Müzikal Giriş/Çıkış Payı)
  const introTime = typeof customIntroTime === 'number' && customIntroTime >= 0
    ? customIntroTime
    : Math.min(10.0, Math.max(4.0, songDuration * 0.045));
  const outroTime = Math.min(12.0, Math.max(5.0, songDuration * 0.04));
  const usableDuration = Math.max(10.0, songDuration - introTime - outroTime);

  // 2. Her satır için fonetik ve kelime ağırlığı hesaplama
  const lineWeights = rawLines.map(line => {
    const words = line.split(/\s+/).filter(w => Boolean(w) && !isStructureMarkerToken(w));
    const wordCount = Math.max(1, words.length);
    const charCount = line.length;
    // Türkçe ve evrensel diller için sesli harf / hece tahmini
    const vowelCount = (line.match(/[aeıioöuüAEIİOÖUÜ]/g) || []).length;
    const syllableEstimate = Math.max(wordCount, vowelCount);

    // Birleşik satır ağırlığı: Kelime sayısı %45, Hece sayısı %40, Karakter sayısı %15
    const weight = (wordCount * 0.45) + (syllableEstimate * 0.40) + (charCount * 0.03);
    return {
      text: words.join(' '),
      words,
      weight: Math.max(1.0, weight)
    };
  });

  const totalWeight = lineWeights.reduce((sum, item) => sum + item.weight, 0);

  // 3. Zamanlama Dağıtımı (Her satırın uzunluğuna göre orantılı süre ve nefes aralığı)
  let currentTime = introTime;
  const lines: SyncedLine[] = [];

  for (let i = 0; i < lineWeights.length; i++) {
    const item = lineWeights[i];
    const isLastLine = i === lineWeights.length - 1;

    // Bu satıra düşen toplam blok süresi
    const allocatedBlockTime = (item.weight / Math.max(1, totalWeight)) * usableDuration;
    
    // Satırın okunma süresi (kelime başına min 0.55s, nefes payı bırak)
    const pauseGap = isLastLine ? 0.2 : Math.min(0.6, Math.max(0.25, allocatedBlockTime * 0.08));
    const lineActiveDur = Math.max(1.2, allocatedBlockTime - pauseGap);

    const startTime = Math.round(currentTime * 100) / 100;
    const endTime = Math.round((currentTime + lineActiveDur) * 100) / 100;

    // Kelime bazlı hassas zamanlama
    const totalChars = item.words.reduce((acc, w) => acc + Math.max(2, w.length), 0);
    let wordRunningTime = startTime;

    const words = item.words.map((w) => {
      const charWeight = Math.max(2, w.length) / Math.max(1, totalChars);
      const wDur = Math.max(0.18, lineActiveDur * charWeight);
      const wStart = wordRunningTime;
      const wEnd = Math.min(endTime, wordRunningTime + wDur);
      wordRunningTime = wEnd;

      return {
        word: w,
        startTime: Math.round(wStart * 100) / 100,
        endTime: Math.round(wEnd * 100) / 100
      };
    });

    lines.push({
      startTime,
      endTime,
      text: item.text,
      words
    });

    currentTime += allocatedBlockTime;
  }

  return phonemeEngine.enrichLyricsWithPhonemes(lines);
}

export async function generateSyncedLyrics(audioBase64: string, mimeType: string): Promise<SyncedLine[]> {
  try {
    const response = await fetch('/api/sync-lyrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ audioBase64, mimeType })
    });

    if (!response.ok) {
      throw new Error('Senkronizasyon API hatası verdi.');
    }

    const data = await response.json();
    return data as SyncedLine[];
  } catch (error) {
    console.error("Lyrics Sync Error:", error);
    return [];
  }
}
