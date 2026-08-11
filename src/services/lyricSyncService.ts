import { SyncedLine } from "../types";
import { phonemeEngine } from "../core/PhonemeAlignmentEngine";

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

    const cleanText = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();

    if (timestamps.length > 0 && cleanText) {
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
    
    // Kelimeleri bölerek kelime bazlı animasyon için de zaman ata
    const wordsArray = current.text.split(' ').filter(Boolean);
    // Cümlenin doğal konuşma/şarkı süresi (kelime başına ~0.55-0.75s, sonraki satıra kadar olan boşluktan fazla olamaz)
    const naturalLineDur = Math.max(1.2, wordsArray.length * 0.65);
    const lineDuration = Math.min(Math.max(1.0, rawGap - 0.4), naturalLineDur);
    const lineEndTime = current.time + lineDuration;

    // Kelime uzunluklarına göre ağırlıklı zamanlama (uzun kelimeler biraz daha uzun sürer)
    const totalChars = wordsArray.reduce((acc, w) => acc + Math.max(2, w.length), 0);
    let runningTime = current.time;

    const words = wordsArray.map((w, wIdx) => {
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
      text: current.text,
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
    .map(line => {
      const mins = Math.floor(line.startTime / 60);
      const secs = Math.floor(line.startTime % 60);
      const ms = Math.floor((line.startTime % 1) * 100);
      const formattedTime = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
      return `${formattedTime} ${line.text}`;
    })
    .join('\n');
}

/**
 * Düz şarkı sözü metnini toplam şarkı süresine göre akıllıca eşit aralıklarla senkronize eder.
 */
export function autoSyncLyricsByDuration(rawText: string, totalDuration: number): SyncedLine[] {
  if (!rawText || !rawText.trim()) return [];

  const rawLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (rawLines.length === 0) return [];

  // Giriş (Intro) ve Bitiş (Outro) için ufak pay bırak
  const effectiveStart = Math.min(5.0, totalDuration * 0.05);
  const effectiveEnd = Math.max(effectiveStart + 5.0, totalDuration * 0.95);
  const availableTime = effectiveEnd - effectiveStart;
  const lineDuration = availableTime / rawLines.length;

  const lines = rawLines.map((text, idx) => {
    const startTime = Math.round((effectiveStart + idx * lineDuration) * 100) / 100;
    const wordsArray = text.split(' ').filter(Boolean);
    const activeDur = Math.min(lineDuration * 0.88, Math.max(1.2, wordsArray.length * 0.65));
    const endTime = Math.round((startTime + activeDur) * 100) / 100;

    const totalChars = wordsArray.reduce((acc, w) => acc + Math.max(2, w.length), 0);
    let runningTime = startTime;

    const words = wordsArray.map((w) => {
      const charWeight = Math.max(2, w.length) / Math.max(1, totalChars);
      const wDur = Math.max(0.2, activeDur * charWeight);
      const wStart = runningTime;
      const wEnd = runningTime + wDur;
      runningTime = wEnd;

      return {
        word: w,
        startTime: Math.round(wStart * 100) / 100,
        endTime: Math.round(wEnd * 100) / 100
      };
    });

    return {
      startTime,
      endTime,
      text,
      words
    };
  });

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
