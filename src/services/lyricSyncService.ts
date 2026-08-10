import { SyncedLine } from "../types";

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
    const nextTime = i < parsedItems.length - 1 ? parsedItems[i + 1].time : current.time + 4.5;
    
    // Kelimeleri bölerek kelime bazlı animasyon için de zaman ata
    const wordsArray = current.text.split(' ').filter(Boolean);
    const duration = Math.max(1.0, nextTime - current.time);
    const wordDur = duration / Math.max(1, wordsArray.length);

    const words = wordsArray.map((w, wIdx) => ({
      word: w,
      startTime: current.time + (wIdx * wordDur),
      endTime: current.time + ((wIdx + 1) * wordDur)
    }));

    syncedLines.push({
      startTime: Math.round(current.time * 100) / 100,
      endTime: Math.round(nextTime * 100) / 100,
      text: current.text,
      words: words
    });
  }

  return syncedLines;
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

  return rawLines.map((text, idx) => {
    const startTime = Math.round((effectiveStart + idx * lineDuration) * 100) / 100;
    const endTime = Math.round((startTime + lineDuration) * 100) / 100;

    const wordsArray = text.split(' ').filter(Boolean);
    const wordDur = lineDuration / Math.max(1, wordsArray.length);

    const words = wordsArray.map((w, wIdx) => ({
      word: w,
      startTime: Math.round((startTime + (wIdx * wordDur)) * 100) / 100,
      endTime: Math.round((startTime + ((wIdx + 1) * wordDur)) * 100) / 100
    }));

    return {
      startTime,
      endTime,
      text,
      words
    };
  });
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
