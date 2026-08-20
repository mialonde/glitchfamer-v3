import React, { useState, useEffect } from 'react';
import { VisualizerSettings, SyncedLine } from '../types';
import { 
  parseLrcText, 
  exportToLrcText, 
  exportToEnhancedLrcText,
  exportToTtmlText,
  autoSyncLyricsByDuration, 
  cleanLyricsText, 
  isStructureMarkerToken, 
  MESELE_DEMO_LRC_TEXT 
} from '../services/lyricSyncService';
import { sunoImporter } from '../services/SunoImporterService';
import { Clock, Palette, Sparkles, Zap, Mic2 } from 'lucide-react';
import { Button } from './ui';
import { cn } from '../lib/utils';
import { LyricsHeader } from './lyrics/LyricsHeader';
import { LyricsTimeline } from './lyrics/LyricsTimeline';
import { LyricsCardList } from './lyrics/LyricsCardList';
import { LyricsStyleTab } from './lyrics/LyricsStyleTab';
import { LyricsSunoTab } from './lyrics/LyricsSunoTab';
import { LyricsAutoSyncTab } from './lyrics/LyricsAutoSyncTab';
import { LyricsLiveSyncTab } from './lyrics/LyricsLiveSyncTab';
import { SyncDriftDebugger } from './lyrics/SyncDriftDebugger';

interface LyricsStudioProps {
  settings: VisualizerSettings;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onChange: (updated: Partial<VisualizerSettings>) => void;
  onSeek?: (time: number) => void;
  compact?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

const DEMO_LYRICS_TEXT = `Geceler geçmiyo'
Sabahlar bitmiyo'
Nitekim dinmiyor, ağrı, sebebini bilmiyom
Hızlıyım, sorunlarla soranlar incitmiyo'
Kim diyor, evim? yakarım hiç bilmiyo'
"Gezelim hadi gel, bin!" diyor
Gidelim istiyor: "Zamanım var benim"
Kısa kes! seni dinliyom:
"Bir sigara daha yaktım
Belki susar kafamdaki ses
Yokluğun ayrı bela
Varlığın ayrı bir nefes"
Sorarsan ayaktayım da
Yaşamak başka mesele
Bazı günler ölmek değil
Sabahlamak zor o mesele
Sözüm şiirlerin mükemmelidir
Senden başkasını seven delidir
Yüzün çiçeklerin en güzelidir
Gözlerin bilinmez bir diyar gibi`;

export const LyricsStudio: React.FC<LyricsStudioProps> = ({
  settings,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onChange,
  onSeek,
  compact = false,
  audioRef
}) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'STYLE' | 'SUNO' | 'AUTO' | 'LIVE'>('MANUAL');
  const [rawTextInput, setRawTextInput] = useState(settings.rawLyrics || DEMO_LYRICS_TEXT);
  const [rawLrcInput, setRawLrcInput] = useState(() => {
    if (settings.syncedLyrics && settings.syncedLyrics.length > 0) {
      return exportToLrcText(settings.syncedLyrics);
    }
    return MESELE_DEMO_LRC_TEXT;
  });
  const [liveTapIndex, setLiveTapIndex] = useState(0);
  const [offsetValue, setOffsetValue] = useState<number>(0.2);

  // Suno Import State
  const [sunoUrlInput, setSunoUrlInput] = useState('https://suno.com/s/a2hf69thdnYq25lG');
  const [isSunoLoading, setIsSunoLoading] = useState(false);
  const [sunoError, setSunoError] = useState<string | null>(null);
  const [sunoSuccessMessage, setSunoSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings.rawLyrics) {
      setRawTextInput(settings.rawLyrics);
    }
  }, [settings.rawLyrics]);

  useEffect(() => {
    if (settings.syncedLyrics && settings.syncedLyrics.length > 0) {
      const lrcText = exportToLrcText(settings.syncedLyrics);
      setRawLrcInput(lrcText);
    }
  }, [settings.syncedLyrics]);

  // Aktif çalan satırı takip et
  const activeLineIndex = (settings.syncedLyrics || []).findIndex(
    line => currentTime >= line.startTime && currentTime <= line.endTime
  );

  useEffect(() => {
    if (activeLineIndex !== -1 && activeTab === 'MANUAL') {
      const activeEl = document.getElementById(`lyric-line-card-${activeLineIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeLineIndex, activeTab]);

  // 1. Akıllı Senkronizasyon (Süreye Göre Dağıt)
  const handleAutoSync = () => {
    const songDuration = duration > 0 ? duration : 180;
    const cleanText = cleanLyricsText(rawTextInput);
    const generated = autoSyncLyricsByDuration(cleanText, songDuration);
    onChange({
      rawLyrics: cleanText || rawTextInput,
      syncedLyrics: generated
    });
    setLiveTapIndex(0);
    setActiveTab('MANUAL');
  };

  // 2. .LRC Metni İçe Aktar
  const handleImportLrc = (lrcContent: string) => {
    const parsed = parseLrcText(lrcContent);
    if (parsed.length > 0) {
      onChange({
        syncedLyrics: parsed,
        rawLyrics: parsed.map(p => p.text).join('\n')
      });
      setLiveTapIndex(0);
      setActiveTab('MANUAL');
    }
  };

  // 3. .LRC Dosyası Yükle
  const handleLrcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawLrcInput(content);
        handleImportLrc(content);
      }
    };
    reader.readAsText(file);
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. İndirme Yardımcıları (.LRC, .ELRC, .TTML, .JSON, .SRT, .VTT)
  const handleDownloadLrc = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const lrcText = exportToLrcText(settings.syncedLyrics);
    downloadFile(lrcText, `${settings.title || 'lyrics'}.lrc`, 'text/plain;charset=utf-8');
  };

  const handleDownloadEnhancedLrc = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const elrcText = exportToEnhancedLrcText(settings.syncedLyrics);
    downloadFile(elrcText, `${settings.title || 'lyrics'}.elrc`, 'text/plain;charset=utf-8');
  };

  const handleDownloadTtml = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const ttmlText = exportToTtmlText(settings.syncedLyrics, settings.title || 'GlitchFramer Track', settings.artist || 'Artist');
    downloadFile(ttmlText, `${settings.title || 'lyrics'}.ttml`, 'application/xml;charset=utf-8');
  };

  const handleDownloadJson = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const jsonText = JSON.stringify(settings.syncedLyrics, null, 2);
    downloadFile(jsonText, `${settings.title || 'lyrics'}.json`, 'application/json;charset=utf-8');
  };

  const handleDownloadSrt = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const formatSrtTime = (seconds: number) => {
      const pad = (n: number, z = 2) => ('00' + n).slice(-z);
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
    };

    const srtContent = settings.syncedLyrics
      .map((line, idx) => `${idx + 1}\n${formatSrtTime(line.startTime)} --> ${formatSrtTime(line.endTime)}\n${line.text}\n`)
      .join('\n');

    downloadFile(srtContent, `${settings.title || 'lyrics'}.srt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadVtt = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const formatVttTime = (seconds: number) => {
      const pad = (n: number, z = 2) => ('00' + n).slice(-z);
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
    };

    const vttContent = `WEBVTT - ${settings.title || 'Lyrics'}\n\n` + settings.syncedLyrics
      .map((line, idx) => `${idx + 1}\n${formatVttTime(line.startTime)} --> ${formatVttTime(line.endTime)}\n${line.text}\n`)
      .join('\n');

    downloadFile(vttContent, `${settings.title || 'lyrics'}.vtt`, 'text/vtt;charset=utf-8');
  };

  // 5.1 Mevcut Sözlerdeki Tüm Yapı/Komut Belirteçlerini ([Verse], (Pause - Single Kick) vb.) Arındır
  const handlePurgeStructureMarkers = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) {
      if (rawTextInput) {
        const cleanRaw = cleanLyricsText(rawTextInput);
        setRawTextInput(cleanRaw);
        onChange({ rawLyrics: cleanRaw });
      }
      return;
    }

    const filtered = settings.syncedLyrics
      .map(line => {
        const cleanText = cleanLyricsText(line.text);
        if (!cleanText || isStructureMarkerToken(cleanText)) return null;

        const cleanWords = (line.words || [])
          .map(w => ({ ...w, word: cleanLyricsText(w.word) }))
          .filter(w => Boolean(w.word) && !isStructureMarkerToken(w.word));

        return {
          ...line,
          text: cleanText,
          words: cleanWords.length > 0 ? cleanWords : undefined
        };
      })
      .filter((line): line is SyncedLine => line !== null);

    const cleanRaw = cleanLyricsText(settings.rawLyrics || rawTextInput);
    setRawTextInput(cleanRaw);
    onChange({
      syncedLyrics: filtered,
      rawLyrics: cleanRaw
    });
    setLiveTapIndex(0);
  };

  // 5.2 Akıllı Otomatik Senkronizasyon & Kesintisiz Akış Kalibrasyonu
  const handleAutoCalibrateSync = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;

    const calibrated = settings.syncedLyrics.map((line) => {
      const cleanText = cleanLyricsText(line.text);
      const cleanWords = line.words
        ?.map(w => ({ ...w, word: cleanLyricsText(w.word) }))
        .filter(w => Boolean(w.word) && !isStructureMarkerToken(w.word));

      return {
        ...line,
        text: cleanText || line.text,
        words: cleanWords && cleanWords.length > 0 ? cleanWords : line.words
      };
    }).filter(line => Boolean(line.text) && !isStructureMarkerToken(line.text));

    for (let i = 0; i < calibrated.length; i++) {
      const curr = calibrated[i];
      const next = calibrated[i + 1];

      if (next) {
        const maxHold = (curr.words && curr.words.length > 0)
          ? curr.words[curr.words.length - 1].endTime + 2.2
          : curr.startTime + 5.0;
        curr.endTime = Math.round(Math.min(next.startTime - 0.08, Math.max(curr.endTime, maxHold)) * 100) / 100;
      } else {
        curr.endTime = Math.round((curr.endTime + 2.5) * 100) / 100;
      }
    }

    onChange({ syncedLyrics: calibrated });
  };

  // 5. Suno Import
  const handleFetchSunoLyrics = async () => {
    if (!sunoUrlInput.trim()) return;

    setIsSunoLoading(true);
    setSunoError(null);
    setSunoSuccessMessage(null);

    try {
      const result = await sunoImporter.importTrack(sunoUrlInput.trim());

      if (result.syncedLines && result.syncedLines.length > 0) {
        onChange({
          syncedLyrics: result.syncedLines,
          rawLyrics: result.lyrics || settings.rawLyrics,
          title: result.title || settings.title,
          artist: result.artist || settings.artist,
          coverImage: result.imageUrl || result.image || settings.coverImage
        });

        setSunoSuccessMessage(`✓ Başarıyla aktarıldı: "${result.title || 'Şarkı'}" (${result.syncedLines.length} satır lirik + fonetik senkron)`);
        setLiveTapIndex(0);
        setActiveTab('MANUAL');
      } else if (result.lyrics) {
        setRawTextInput(result.lyrics);
        setActiveTab('AUTO');
        setSunoSuccessMessage(`✓ Şarkı sözleri çekildi. "Akıllı Otomatik Süre Dağıtıcı" ile senkronize edebilirsiniz.`);
      } else {
        setSunoError("Şarkı sözü bulunamadı veya link çözümlenemedi.");
      }
    } catch (err: any) {
      setSunoError(err?.message || "Suno linki çözümlenirken bir hata oluştu.");
    } finally {
      setIsSunoLoading(false);
    }
  };

  // 6. Canlı Tap
  const handleLiveTapNext = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    if (liveTapIndex >= settings.syncedLyrics.length) return;

    const updated = [...settings.syncedLyrics];
    const now = Math.round(currentTime * 100) / 100;

    if (liveTapIndex > 0) {
      updated[liveTapIndex - 1] = {
        ...updated[liveTapIndex - 1],
        endTime: Math.max(updated[liveTapIndex - 1].startTime + 0.4, now)
      };
    }

    const defaultDuration = 3.2;
    updated[liveTapIndex] = {
      ...updated[liveTapIndex],
      startTime: now,
      endTime: now + defaultDuration
    };

    onChange({ syncedLyrics: updated });
    setLiveTapIndex(prev => Math.min(prev + 1, updated.length - 1));
  };

  // 7. Satır Güncelleme
  const handleUpdateLine = (index: number, field: keyof SyncedLine, value: any) => {
    if (!settings.syncedLyrics) return;
    const updated = [...settings.syncedLyrics];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange({ syncedLyrics: updated });
  };

  // 8. Satır Nudge (+/- 0.1 sn)
  const nudgeLineTime = (index: number, delta: number) => {
    if (!settings.syncedLyrics || !settings.syncedLyrics[index]) return;
    const line = settings.syncedLyrics[index];
    const newStart = Math.max(0, Math.round((line.startTime + delta) * 100) / 100);
    const newEnd = Math.max(newStart + 0.2, Math.round((line.endTime + delta) * 100) / 100);
    
    const updated = [...settings.syncedLyrics];
    updated[index] = {
      ...line,
      startTime: newStart,
      endTime: newEnd
    };
    onChange({ syncedLyrics: updated });
  };

  // 9. Global Toplu Kaydırma
  const handleShiftAllTimestamps = (delta: number) => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    const updated = settings.syncedLyrics.map(line => {
      const newStart = Math.max(0, Math.round((line.startTime + delta) * 100) / 100);
      const newEnd = Math.max(newStart + 0.2, Math.round((line.endTime + delta) * 100) / 100);
      return {
        ...line,
        startTime: newStart,
        endTime: newEnd,
        words: line.words?.map(w => ({
          ...w,
          startTime: Math.max(0, Math.round((w.startTime + delta) * 100) / 100),
          endTime: Math.max(0.1, Math.round((w.endTime + delta) * 100) / 100)
        }))
      };
    });
    onChange({ syncedLyrics: updated });
  };

  // 10. Yeni Satır Ekle
  const handleAddLine = () => {
    const current = settings.syncedLyrics || [];
    const lastLine = current[current.length - 1];
    const newStart = lastLine ? Math.round((lastLine.endTime + 0.3) * 100) / 100 : Math.round(currentTime * 100) / 100;
    const newLine: SyncedLine = {
      startTime: newStart,
      endTime: newStart + 3.0,
      text: "Yeni şarkı sözü satırı..."
    };
    onChange({ syncedLyrics: [...current, newLine] });
  };

  // 11. Satır Çoğalt
  const handleDuplicateLine = (index: number) => {
    if (!settings.syncedLyrics || !settings.syncedLyrics[index]) return;
    const line = settings.syncedLyrics[index];
    const current = [...settings.syncedLyrics];
    const newLine: SyncedLine = {
      startTime: Math.round((line.endTime + 0.2) * 100) / 100,
      endTime: Math.round((line.endTime + (line.endTime - line.startTime)) * 100) / 100,
      text: line.text
    };
    current.splice(index + 1, 0, newLine);
    onChange({ syncedLyrics: current });
  };

  // 12. Satır Sil
  const handleDeleteLine = (index: number) => {
    if (!settings.syncedLyrics) return;
    const updated = settings.syncedLyrics.filter((_, i) => i !== index);
    onChange({ syncedLyrics: updated });
    if (liveTapIndex >= updated.length) {
      setLiveTapIndex(Math.max(0, updated.length - 1));
    }
  };

  // 13. Tek Satırı Dinle
  const handlePreviewLine = (startTime: number) => {
    if (onSeek) {
      onSeek(Math.max(0, startTime - 0.3));
      if (!isPlaying) onTogglePlay();
    }
  };

  // Timeline tıkla
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      }
      if (e.code === 'KeyT' || e.code === 'Enter') {
        e.preventDefault();
        handleLiveTapNext();
      }
      if (e.code === 'ArrowLeft' && onSeek) {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - 5));
      }
      if (e.code === 'ArrowRight' && onSeek) {
        e.preventDefault();
        onSeek(Math.min(duration || 300, currentTime + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, liveTapIndex, settings.syncedLyrics, isPlaying]);

  const lyricsCount = settings.syncedLyrics?.length || 0;
  const currentActiveLine = activeLineIndex !== -1 && settings.syncedLyrics ? settings.syncedLyrics[activeLineIndex] : null;

  return (
    <div className="w-full space-y-3.5 select-none relative">
      <SyncDriftDebugger audioRef={audioRef} reactCurrentTime={currentTime} />
      
      {/* 1. ÜST HEADER BAR & CANLI DURUM */}
      <LyricsHeader
        lyricsEnabled={settings.lyricsEnabled !== false}
        lyricsCount={lyricsCount}
        currentActiveLine={currentActiveLine}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onToggleEnabled={() => onChange({ lyricsEnabled: !(settings.lyricsEnabled !== false) })}
        onTogglePlay={onTogglePlay}
      />

      {/* 2. ANA STÜDYO SEKMELERİ */}
      <div className="flex flex-wrap border-b border-border-subtle gap-1">
        {[
          { id: 'MANUAL', label: `⏱️ ZAMAN ÇİZELGESİ & LİRİK LİSTESİ (${lyricsCount})`, icon: Clock },
          { id: 'STYLE', label: '🎨 TİPOGRAFİ & EKRAN YERLEŞİMİ (%Y / %X)', icon: Palette },
          { id: 'SUNO', label: '⚡ SUNO AI & İÇE / DIŞA AKTAR', icon: Sparkles },
          { id: 'AUTO', label: '🪄 AKILLI SÜRE DAĞITICI', icon: Zap },
          { id: 'LIVE', label: '🎙️ CANLI SENKRON (TAP-TO-SYNC)', icon: Mic2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "accent" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "rounded-b-none border-b-2 text-[10px] font-bold uppercase tracking-wider gap-1.5",
                isActive
                  ? "border-accent shadow-sm"
                  : "border-transparent text-content-secondary hover:text-content-primary"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SEKME 1: ⏱️ ZAMAN ÇİZELGESİ, CANLI DOKUN & ERGONOMİK LİRİK KARTLARI      */}
      {/* ========================================================================= */}
      {activeTab === 'MANUAL' && (
        <div className="space-y-3.5 bg-panel/70 p-3.5 border border-border-subtle rounded-lg">
          <LyricsTimeline
            syncedLyrics={settings.syncedLyrics || []}
            currentTime={currentTime}
            duration={duration}
            liveTapIndex={liveTapIndex}
            offsetValue={offsetValue}
            syncOffset={settings.lyricsSyncOffset || 0}
            onOffsetChange={setOffsetValue}
            onSyncOffsetChange={(val) => onChange({ lyricsSyncOffset: val })}
            onTimelineClick={handleTimelineClick}
            onLiveTapNext={handleLiveTapNext}
            onAddLine={handleAddLine}
            onPurgeStructureMarkers={handlePurgeStructureMarkers}
            onAutoCalibrateSync={handleAutoCalibrateSync}
            onShiftAllTimestamps={handleShiftAllTimestamps}
          />

          <LyricsCardList
            syncedLyrics={settings.syncedLyrics || []}
            currentTime={currentTime}
            liveTapIndex={liveTapIndex}
            lyricsTranslationEnabled={settings.lyricsTranslationEnabled}
            onPreviewLine={handlePreviewLine}
            onUpdateLine={handleUpdateLine}
            onNudgeLineTime={nudgeLineTime}
            onSetLiveTapIndex={setLiveTapIndex}
            onDuplicateLine={handleDuplicateLine}
            onDeleteLine={handleDeleteLine}
            onSeek={onSeek}
            onLoadDemoLyrics={handleAutoSync}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 2: 🎨 TİPOGRAFİ, EKRAN YERLEŞİMİ (%Y / %X) VE DERİNLİK AYARLARI   */}
      {/* ========================================================================= */}
      {activeTab === 'STYLE' && (
        <LyricsStyleTab
          settings={settings}
          onChange={onChange}
        />
      )}

      {/* ========================================================================= */}
      {/* SEKME 3: ⚡ SUNO AI & İÇE / DIŞA AKTAR (.LRC, .SRT, .VTT)                 */}
      {/* ========================================================================= */}
      {activeTab === 'SUNO' && (
        <LyricsSunoTab
          sunoUrlInput={sunoUrlInput}
          isSunoLoading={isSunoLoading}
          sunoSuccessMessage={sunoSuccessMessage}
          sunoError={sunoError}
          rawLrcInput={rawLrcInput}
          onSunoUrlChange={setSunoUrlInput}
          onFetchSunoLyrics={handleFetchSunoLyrics}
          onLrcFileUpload={handleLrcFileUpload}
          onDownloadLrc={handleDownloadLrc}
          onDownloadEnhancedLrc={handleDownloadEnhancedLrc}
          onDownloadTtml={handleDownloadTtml}
          onDownloadJson={handleDownloadJson}
          onDownloadSrt={handleDownloadSrt}
          onDownloadVtt={handleDownloadVtt}
          onRawLrcInputChange={setRawLrcInput}
          onImportLrc={handleImportLrc}
        />
      )}

      {/* ========================================================================= */}
      {/* SEKME 4: 🪄 AKILLI SÜRE DAĞITICI (AUTO SYNC)                             */}
      {/* ========================================================================= */}
      {activeTab === 'AUTO' && (
        <LyricsAutoSyncTab
          rawTextInput={rawTextInput}
          duration={duration}
          onRawTextChange={setRawTextInput}
          onAutoSync={handleAutoSync}
        />
      )}

      {/* ========================================================================= */}
      {/* SEKME 5: 🎙️ CANLI SENKRON (TAP-TO-SYNC)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE' && (
        <LyricsLiveSyncTab
          rawText={rawTextInput}
          onRawTextChange={setRawTextInput}
          audioRef={audioRef}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onApplySyncedLyrics={(lines) => {
            onChange({ syncedLyrics: lines });
            setActiveTab('MANUAL');
          }}
        />
      )}

    </div>
  );
};
