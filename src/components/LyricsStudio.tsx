import React, { useState, useEffect, useRef } from 'react';
import { VisualizerSettings, LyricsStyle, LyricsPosition, SyncedLine } from '../types';
import { 
  parseLrcText, 
  exportToLrcText, 
  exportToEnhancedLrcText,
  exportToTtmlText,
  parseUniversalLyrics,
  detectInstrumentalGaps,
  autoSyncLyricsByDuration, 
  cleanLyricsText, 
  isStructureMarkerToken, 
  MESELE_DEMO_LRC_TEXT 
} from '../services/lyricSyncService';
import { sunoImporter } from '../services/SunoImporterService';
import { 
  Type, Upload, Download, Plus, Trash2, Zap, Play, Pause, Clock, 
  RotateCcw, Eye, EyeOff, Radio, Link2, Sparkles, Loader2, CheckCircle2, 
  AlertCircle, Sliders, ChevronLeft, ChevronRight, ArrowRightLeft,
  MoveVertical, MoveHorizontal, AlignLeft, AlignCenter, AlignRight,
  Split, Copy, FileText, Palette, Layers, Music, LayoutList, LayoutGrid,
  Check, ArrowUpRight, FastForward, Rewind, Scissors
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LyricsStudioProps {
  settings: VisualizerSettings;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onChange: (updated: Partial<VisualizerSettings>) => void;
  onSeek?: (time: number) => void;
  compact?: boolean;
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

const FONT_OPTIONS = [
  { id: 'Space Grotesk', label: 'Space Grotesk (Brutalist)' },
  { id: 'Syne', label: 'Syne (Avant-Garde)' },
  { id: 'Outfit', label: 'Outfit (Modern Clean)' },
  { id: 'Inter', label: 'Inter (Precision)' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Cyber)' },
  { id: 'Cinzel', label: 'Cinzel (Cinematic Serif)' },
  { id: 'Montserrat', label: 'Montserrat (Bold Impact)' },
  { id: 'Bebas Neue', label: 'Bebas Neue (Condensed)' }
];

const PRESET_COLORS = [
  { name: 'GOLD', color: '#FFD700' },
  { name: 'CYAN', color: '#00F0FF' },
  { name: 'WHITE', color: '#FFFFFF' },
  { name: 'LIME', color: '#39FF14' },
  { name: 'CRIMSON', color: '#FF003C' },
  { name: 'PURPLE', color: '#BD00FF' },
  { name: 'AMBER', color: '#F59E0B' },
  { name: 'PINK', color: '#EC4899' }
];

export const LyricsStudio: React.FC<LyricsStudioProps> = ({
  settings,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onChange,
  onSeek,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'STYLE' | 'SUNO' | 'AUTO'>('MANUAL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');
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

  const lyricsCount = settings.syncedLyrics?.length || 0;
  const currentActiveLine = activeLineIndex !== -1 && settings.syncedLyrics ? settings.syncedLyrics[activeLineIndex] : null;

  // Dikey ve Yatay Yüzdeler
  const currentYPercent = settings.lyricsY !== undefined 
    ? settings.lyricsY 
    : (settings.lyricsPosition === 'TOP' ? 12 : settings.lyricsPosition === 'CENTER' ? 50 : 88);

  const currentXPercent = settings.lyricsX !== undefined ? settings.lyricsX : 50;

  const formatTimeSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  };

  return (
    <div className="w-full space-y-3.5 select-none">
      
      {/* 1. ÜST HEADER BAR & CANLI DURUM */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-md flex items-center justify-center font-black transition-all shrink-0 shadow-inner",
            settings.lyricsEnabled !== false ? "bg-amber-400 text-black shadow-amber-400/20" : "bg-zinc-800 text-zinc-500"
          )}>
            <Type size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-white truncate">
                PRO LYRICS & TYPOGRAPHY STUDIO
              </h3>
              <span className="px-2 py-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[9px] font-mono font-bold rounded-full">
                {lyricsCount} SATIR
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              Apple Music 3-Satır kaydırma, hassas %Y dikey konum ve anlık fonetik düzenleme.
            </p>
          </div>
        </div>

        {/* Lirik Aç/Kapa Düğmesi */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onChange({ lyricsEnabled: !(settings.lyricsEnabled !== false) })}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
              settings.lyricsEnabled !== false
                ? "bg-amber-400 text-black border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] hover:bg-amber-300"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            )}
          >
            {settings.lyricsEnabled !== false ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{settings.lyricsEnabled !== false ? 'LİRİKLER: AKTİF' : 'LİRİKLER: GİZLİ'}</span>
          </button>
        </div>
      </div>

      {/* 2. CANLI ÇALAN SATIR VE OYNATICI ÇUBUĞU */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            currentActiveLine ? "bg-amber-400 animate-pulse shadow-[0_0_8px_#FBBF24]" : "bg-zinc-600"
          )} />
          <div className="min-w-0 truncate">
            <span className="text-[9px] font-bold uppercase text-zinc-500 mr-1.5">ŞU AN:</span>
            <span className="text-xs font-bold text-amber-300">
              {currentActiveLine ? `"${currentActiveLine.text}"` : '— Müzik Çalıyor (Lirik Arası) —'}
            </span>
          </div>
        </div>

        {/* Sayaç ve Play/Pause */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            <Clock size={12} className="text-amber-400" />
            <span className="text-amber-400 font-bold">{formatTimeSeconds(currentTime)}</span>
            <span className="text-zinc-600">/</span>
            <span>{formatTimeSeconds(duration || 0)}</span>
          </div>

          <button
            type="button"
            onClick={onTogglePlay}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-[10px] uppercase rounded flex items-center gap-1 cursor-pointer transition-all"
          >
            {isPlaying ? <Pause size={12} className="text-amber-400" /> : <Play size={12} />}
            <span>{isPlaying ? 'DURDUR' : 'ÇAL'}</span>
          </button>
        </div>
      </div>

      {/* 3. ANA STÜDYO SEKMELERİ */}
      <div className="flex flex-wrap border-b border-zinc-800 gap-1">
        {[
          { id: 'MANUAL', label: `⏱️ ZAMAN ÇİZELGESİ & LİRİK LİSTESİ (${lyricsCount})`, icon: Clock },
          { id: 'STYLE', label: '🎨 TİPOGRAFİ & EKRAN YERLEŞİMİ (%Y / %X)', icon: Palette },
          { id: 'SUNO', label: '⚡ SUNO AI & İÇE / DIŞA AKTAR', icon: Sparkles },
          { id: 'AUTO', label: '🪄 AKILLI SÜRE DAĞITICI', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer rounded-t",
                activeTab === tab.id
                  ? "border-amber-400 text-amber-400 bg-amber-400/5 font-bold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SEKME 1: ⏱️ ZAMAN ÇİZELGESİ, CANLI DOKUN & ERGONOMİK LİRİK KARTLARI      */}
      {/* ========================================================================= */}
      {activeTab === 'MANUAL' && (
        <div className="space-y-3.5 bg-zinc-950/70 p-3.5 border border-zinc-800 rounded-lg">
          
          {/* 1.1 İNTERAKTİF GÖRSEL LİRİK ZAMAN ÇİZELGESİ (TIMELINE) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 uppercase">
              <span className="flex items-center gap-1.5 font-bold text-zinc-300">
                <Music size={12} className="text-amber-400" />
                İNTERAKTİF ZAMAN ÇİZELGESİ
              </span>
              <span>{formatTimeSeconds(currentTime)} / {formatTimeSeconds(duration || 0)}</span>
            </div>
            
            <div 
              onClick={handleTimelineClick}
              className="relative h-8 w-full bg-zinc-900 border border-zinc-750 rounded-md overflow-hidden cursor-pointer select-none group"
            >
              {/* Lirik Blokları */}
              {settings.syncedLyrics && settings.syncedLyrics.length > 0 && duration > 0 && (
                settings.syncedLyrics.map((line, idx) => {
                  const left = (line.startTime / duration) * 100;
                  const width = Math.max(0.8, ((line.endTime - line.startTime) / duration) * 100);
                  const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
                  return (
                    <div
                      key={idx}
                      title={`[${idx + 1}] ${line.text} (${line.startTime.toFixed(1)}s - ${line.endTime.toFixed(1)}s)`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      className={cn(
                        "absolute top-1 bottom-1 rounded-[2px] transition-all border border-black/30",
                        isActive 
                          ? "bg-amber-400 shadow-[0_0_12px_#FBBF24] z-10" 
                          : idx === liveTapIndex 
                          ? "bg-blue-500/90"
                          : "bg-zinc-700 group-hover:bg-zinc-600"
                      )}
                    />
                  );
                })
              )}

              {/* Güncel Çalma Kafası */}
              {duration > 0 && (
                <div 
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_red] z-20 pointer-events-none"
                />
              )}
            </div>
          </div>

          {/* 1.2 CANLI DOKUN (LIVE TAP) VE GLOBAL SHIFT TOOLBAR */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleLiveTapNext}
                disabled={lyricsCount === 0 || liveTapIndex >= lyricsCount}
                className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs tracking-wider uppercase border border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] disabled:opacity-40 rounded"
              >
                <Radio size={14} className="animate-pulse" />
                <span>CANLI DOKUN (TAP) [{liveTapIndex + 1}/{lyricsCount}]</span>
              </button>

              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus size={13} className="text-amber-400" />
                <span>SATIR EKLE</span>
              </button>

              <button
                type="button"
                onClick={handlePurgeStructureMarkers}
                title="Şarkı sözlerindeki [Verse], (Pause - Single Kick), (Solo) vb. müzikal komutları ve yapı etiketlerini otomatik arındırır"
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <Sparkles size={13} className="text-rose-400" />
                <span>YAPILARI ARINDIR</span>
              </button>
            </div>

            {/* GLOBAL SÜRE ÖTELEME */}
            <div className="flex items-center gap-1.5 flex-wrap bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-800">
              <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase flex items-center gap-1 mr-1">
                <Sliders size={11} className="text-amber-400" /> ÖTELE:
              </span>
              
              <button
                type="button"
                onClick={() => handleShiftAllTimestamps(-0.5)}
                className="px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 font-mono text-[9px] font-bold rounded cursor-pointer"
              >
                -0.5s
              </button>
              <button
                type="button"
                onClick={() => handleShiftAllTimestamps(-offsetValue)}
                className="px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 font-mono text-[9px] font-bold rounded cursor-pointer"
              >
                -{offsetValue}s
              </button>

              <input
                type="number"
                step="0.05"
                min="0.05"
                max="5"
                value={offsetValue}
                onChange={(e) => setOffsetValue(Math.max(0.05, parseFloat(e.target.value) || 0.1))}
                className="w-12 bg-zinc-900 border border-zinc-700 px-1 py-0.5 text-center text-[10px] text-amber-300 rounded font-mono font-bold"
              />

              <button
                type="button"
                onClick={() => handleShiftAllTimestamps(offsetValue)}
                className="px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-green-400 font-mono text-[9px] font-bold rounded cursor-pointer"
              >
                +{offsetValue}s
              </button>
              <button
                type="button"
                onClick={() => handleShiftAllTimestamps(0.5)}
                className="px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-green-400 font-mono text-[9px] font-bold rounded cursor-pointer"
              >
                +0.5s
              </button>
            </div>
          </div>

          {/* 1.3 PROFESYONEL LİRİK KARTLARI LİSTESİ (TAŞMAYAN, ERGONOMİK VE NET) */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 border border-zinc-800/80 p-2 bg-zinc-950/60 rounded-lg custom-scrollbar">
            {settings.syncedLyrics && settings.syncedLyrics.length > 0 ? (
              settings.syncedLyrics.map((line, idx) => {
                const isCurrentLive = idx === liveTapIndex;
                const isCurrentTimeActive = currentTime >= line.startTime && currentTime <= line.endTime;
                const durationSpan = Math.max(0.1, line.endTime - line.startTime);

                return (
                  <div
                    key={idx}
                    id={`lyric-line-card-${idx}`}
                    className={cn(
                      "p-2.5 border rounded-lg transition-all space-y-2",
                      isCurrentLive
                        ? "border-amber-400/80 bg-amber-400/10 ring-1 ring-amber-400/40 shadow-sm"
                        : isCurrentTimeActive
                        ? "border-amber-500/60 bg-amber-400/10"
                        : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    {/* ÜST SATIR: Sıra, Zaman Rozetleri, Nudge ve Aksiyonlar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      
                      {/* Sol: Sıra No ve Çal Butonu */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePreviewLine(line.startTime)}
                          title="Bu satırı dinle (0.3sn öncesinden çalar)"
                          className="w-6 h-6 bg-zinc-800 hover:bg-amber-400 hover:text-black border border-zinc-700 rounded flex items-center justify-center text-amber-400 transition-all cursor-pointer shadow-sm"
                        >
                          <Play size={10} />
                        </button>
                        <span className="text-[10px] font-mono font-black text-zinc-400 px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Orta: Başlangıç / Bitiş Zaman Damgaları & Süre */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          <span className="text-[8px] font-bold text-zinc-500 uppercase">BŞL:</span>
                          <input
                            type="number"
                            step="0.05"
                            value={line.startTime}
                            onChange={(e) => handleUpdateLine(idx, 'startTime', parseFloat(e.target.value) || 0)}
                            className="w-13 bg-transparent text-amber-400 font-mono text-xs font-bold text-center outline-none"
                          />
                          <span className="text-zinc-600 text-xs">➔</span>
                          <span className="text-[8px] font-bold text-zinc-500 uppercase">BTM:</span>
                          <input
                            type="number"
                            step="0.05"
                            value={line.endTime}
                            onChange={(e) => handleUpdateLine(idx, 'endTime', parseFloat(e.target.value) || 0)}
                            className="w-13 bg-transparent text-zinc-200 font-mono text-xs font-bold text-center outline-none"
                          />
                        </div>

                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          {durationSpan.toFixed(1)}s
                        </span>
                      </div>

                      {/* Sağ: Mikro Nudge (-0.1 / +0.1) & Aksiyon Araçları */}
                      <div className="flex items-center gap-1 shrink-0 ml-auto">
                        <button
                          type="button"
                          onClick={() => nudgeLineTime(idx, -0.1)}
                          title="0.1s geriye al"
                          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[9px] font-mono font-bold text-zinc-300 rounded cursor-pointer transition-colors"
                        >
                          -0.1s
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgeLineTime(idx, 0.1)}
                          title="0.1s ileriye al"
                          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[9px] font-mono font-bold text-zinc-300 rounded cursor-pointer transition-colors"
                        >
                          +0.1s
                        </button>

                        <button
                          type="button"
                          onClick={() => setLiveTapIndex(idx)}
                          title="Canlı tap hedefine ayarla"
                          className={cn(
                            "px-2 py-0.5 text-[8.5px] font-bold uppercase rounded border transition-all cursor-pointer",
                            isCurrentLive 
                              ? "bg-amber-400 text-black border-amber-400 font-black" 
                              : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                          )}
                        >
                          {isCurrentLive ? 'HEDEF' : 'TAP SEÇ'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateLine(idx)}
                          title="Satırı çoğalt"
                          className="p-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <Copy size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLine(idx)}
                          title="Satırı sil"
                          className="p-1 bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/40 rounded text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                    </div>

                    {/* ALT SATIR: TAM GENİŞLİK ŞARKI SÖZÜ METİN GİRİŞİ & ÇEVİRİ ALANI */}
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => handleUpdateLine(idx, 'text', e.target.value)}
                          placeholder="Şarkı sözü metnini girin..."
                          className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-amber-400 focus:bg-black px-3 py-1.5 text-xs text-white rounded-md font-semibold outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (onSeek) onSeek(line.startTime);
                          }}
                          title="Zaman çizgisine atla"
                          className="px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono font-bold rounded cursor-pointer shrink-0"
                        >
                          {formatTimeSeconds(line.startTime)}
                        </button>
                      </div>

                      {/* İsteğe Bağlı Çeviri / Romanizasyon Alanı */}
                      {settings.lyricsTranslationEnabled && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[8px] font-bold uppercase text-amber-400/80 shrink-0">ÇEVİRİ:</span>
                          <input
                            type="text"
                            value={line.translation || ''}
                            onChange={(e) => handleUpdateLine(idx, 'translation', e.target.value)}
                            placeholder="Alt satır çevirisi veya romanizasyon..."
                            className="flex-1 bg-zinc-950/60 border border-zinc-850 focus:border-amber-400/60 px-2.5 py-1 text-[11px] text-zinc-300 rounded outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Satırlar Arası Enstrümantal / Solo Boşluğu Tespiti */}
                    {idx < (settings.syncedLyrics?.length || 0) - 1 && settings.syncedLyrics && (
                      (() => {
                        const next = settings.syncedLyrics[idx + 1];
                        const gap = next ? next.startTime - line.endTime : 0;
                        if (gap >= 2.4) {
                          return (
                            <div className="mt-2 py-1 px-2.5 bg-amber-400/5 border border-amber-400/20 rounded-md flex items-center justify-between text-[9px] font-mono text-amber-400/90">
                              <span className="flex items-center gap-1.5 font-bold">
                                <Music size={11} className="text-amber-400" />
                                <span>{gap.toFixed(1)}s ENSTRÜMANTAL BOŞLUK / NEFES</span>
                              </span>
                              <span className="font-bold tracking-widest text-[10px]">• • •</span>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 space-y-3">
                <Music size={28} className="mx-auto text-zinc-600" />
                <p className="text-xs text-zinc-400 font-semibold">Henüz senkronize edilmiş şarkı sözü bulunmuyor.</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoSync}
                    className="px-3.5 py-1.5 bg-amber-400 text-black text-xs font-bold rounded uppercase cursor-pointer"
                  >
                    Demo Sözleri Yükle
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 2: 🎨 TİPOGRAFİ, EKRAN YERLEŞİMİ (%Y / %X) VE DERİNLİK AYARLARI   */}
      {/* ========================================================================= */}
      {activeTab === 'STYLE' && (
        <div className="space-y-4 bg-zinc-950/70 p-4 border border-zinc-800 rounded-lg">
          
          {/* 2.1 TİPOGRAFİK STİL SEÇİCİ (8 FARKLI MOD) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Layers size={13} className="text-amber-400" />
                <span>TİPOGRAFİ & ANİMASYON STİLİ:</span>
              </label>
              <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">
                {settings.lyricsStyle || 'BETTER_FLOW'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'BETTER_FLOW', label: 'BETTER FLOW ✦', desc: 'Apple Music kelime süpürme & derinlik bulanıklığı' },
                { id: 'APPLE_SCROLL', label: 'APPLE SCROLL', desc: '3-Satır dikey akıcı kaydırma' },
                { id: 'KARAOKE', label: 'KARAOKE BOUNCE', desc: 'Sürekli degrade parlayan akış' },
                { id: 'KINETIC', label: 'KINETIC PUNCH', desc: 'Vuruşlu brütalist büyüme' },
                { id: 'SUBTITLE', label: 'SUBTITLE BOX', desc: 'Buzlu cam sinematik altyazı' },
                { id: 'NEON_BOX', label: 'NEON BADGE', desc: 'Cyber neon çerçeve rozet' },
                { id: 'CYBER_GLITCH', label: 'CYBER GLITCH', desc: 'RGB 3D kromatik kayma' },
                { id: 'MINIMAL', label: 'MINIMAL SHADOW', desc: 'Sade ve net tipografi' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChange({ lyricsStyle: st.id as LyricsStyle })}
                  className={cn(
                    "p-2.5 text-left border rounded-md transition-all cursor-pointer flex flex-col justify-between",
                    (settings.lyricsStyle || 'BETTER_FLOW') === st.id
                      ? "bg-amber-400 text-black border-amber-400 font-black shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                      : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850"
                  )}
                >
                  <div className="text-[9px] font-black uppercase tracking-wider">{st.label}</div>
                  <div className={cn(
                    "text-[8px] mt-1 font-sans",
                    (settings.lyricsStyle || 'BETTER_FLOW') === st.id ? "text-black/80 font-medium" : "text-zinc-400"
                  )}>
                    {st.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2.2 DERİNLEMESİNE EKRAN KONUMLANDIRMA (%Y VE %X SERBEST SLIDER) */}
          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <MoveVertical size={13} className="text-amber-400" />
                <span>EKRAN KONUMU & HASSAS DİKEY YÜKSEKLİK (%Y):</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold">Y: %{currentYPercent}</span>
                <span className="text-[10px] font-mono text-zinc-400">X: %{currentXPercent}</span>
              </div>
            </div>

            {/* Hızlı Önayarlar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { pos: 'TOP', y: 12, label: 'ÜST (%12)' },
                { pos: 'CUSTOM', y: 30, label: 'ORTA-ÜST (%30)' },
                { pos: 'CENTER', y: 50, label: 'TAM ORTA (%50)' },
                { pos: 'BOTTOM', y: 88, label: 'ALT (%88)' },
                { pos: 'CUSTOM', y: 93, label: 'EN ALT (%93)' }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange({ 
                    lyricsPosition: preset.pos as LyricsPosition,
                    lyricsY: preset.y
                  })}
                  className={cn(
                    "py-2 px-1 text-center border rounded transition-all cursor-pointer font-bold text-[9px] uppercase",
                    currentYPercent === preset.y
                      ? "bg-amber-400 text-black border-amber-400 shadow-sm"
                      : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Hassas Dikey Yükseklik (%Y) Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[9px] font-sans">
                <span className="text-zinc-300 uppercase font-bold flex items-center gap-1">
                  <MoveVertical size={11} className="text-amber-400" /> DİKEY YÜKSEKLİK (%5 = EN ÜST, %95 = EN ALT):
                </span>
                <span className="text-amber-400 font-mono font-bold">%{currentYPercent}</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="1"
                value={currentYPercent}
                onChange={(e) => onChange({ 
                  lyricsY: parseInt(e.target.value),
                  lyricsPosition: 'CUSTOM'
                })}
                className="w-full h-1.5 bg-zinc-800 accent-amber-400 appearance-none cursor-pointer rounded-lg"
              />
            </div>

            {/* Yatay Konum (%X) ve Hizalama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-sans">
                  <span className="text-zinc-300 uppercase font-bold flex items-center gap-1">
                    <MoveHorizontal size={11} className="text-amber-400" /> YATAY KONUM (%X):
                  </span>
                  <span className="text-amber-400 font-mono font-bold">%{currentXPercent}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={currentXPercent}
                  onChange={(e) => onChange({ lyricsX: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 accent-amber-400 appearance-none cursor-pointer rounded-lg"
                />
              </div>

              {/* Metin Hizalama (Sol, Orta, Sağ) */}
              <div className="space-y-1">
                <span className="text-[9px] font-sans text-zinc-300 uppercase font-bold block">
                  METİN HİZALAMA:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'left', label: 'SOL', icon: AlignLeft },
                    { id: 'center', label: 'ORTA', icon: AlignCenter },
                    { id: 'right', label: 'SAĞ', icon: AlignRight }
                  ].map((al) => {
                    const AlIcon = al.icon;
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => onChange({ lyricsAlign: al.id as any })}
                        className={cn(
                          "py-1.5 px-2 border rounded flex items-center justify-center gap-1 text-[9px] font-bold uppercase transition-all cursor-pointer",
                          (settings.lyricsAlign || 'center') === al.id
                            ? "bg-amber-400 text-black border-amber-400"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <AlIcon size={12} />
                        <span>{al.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 2.3 TİPOGRAFİ, FONT, BOYUT VE IŞIMA PARAMETRELERİ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-sans font-bold uppercase text-zinc-300">
                FONT AİLESİ:
              </label>
              <select
                value={settings.lyricsFontFamily || 'Space Grotesk'}
                onChange={(e) => onChange({ lyricsFontFamily: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-sans text-white rounded outline-none focus:border-amber-400"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-sans">
                <span className="text-zinc-300 uppercase font-bold">YAZI BOYUTU:</span>
                <span className="text-amber-400 font-mono font-bold">{settings.lyricsFontSize || 42}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="84"
                step="2"
                value={settings.lyricsFontSize || 42}
                onChange={(e) => onChange({ lyricsFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 accent-amber-400 appearance-none cursor-pointer rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-sans">
                <span className="text-zinc-300 uppercase font-bold">IŞIMA / GLOW:</span>
                <span className="text-amber-400 font-mono font-bold">{settings.lyricsGlow ?? 20}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="2"
                value={settings.lyricsGlow ?? 20}
                onChange={(e) => onChange({ lyricsGlow: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 accent-amber-400 appearance-none cursor-pointer rounded-lg"
              />
            </div>
          </div>

          {/* 2.4 DİNAMİK VURUŞ TEPKİSİ VE APPLE SCROLL ÖZEL AYARLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-1.5">
              <div className="flex justify-between text-[9px] font-sans">
                <span className="text-zinc-300 uppercase font-bold flex items-center gap-1">
                  <Zap size={12} className="text-amber-400" /> RİTİM TEPKİSİ (KICK BOUNCE):
                </span>
                <span className="text-amber-400 font-mono font-bold">{(settings.lyricsBeatScale ?? 1.0).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.5"
                step="0.1"
                value={settings.lyricsBeatScale ?? 1.0}
                onChange={(e) => onChange({ lyricsBeatScale: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 accent-amber-400 appearance-none cursor-pointer rounded-lg"
              />
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
              <span className="text-[9px] font-sans text-zinc-300 uppercase font-bold block">
                APPLE SCROLL GÖRÜNÜR SATIR SAYISI:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { count: 1, label: '1 SATIR' },
                  { count: 3, label: '3 SATIR' },
                  { count: 5, label: '5 SATIR' }
                ].map((sc) => (
                  <button
                    key={sc.count}
                    type="button"
                    onClick={() => onChange({ lyricsLineCount: sc.count as any })}
                    className={cn(
                      "py-1.5 text-center border rounded text-[9px] font-bold uppercase transition-all cursor-pointer",
                      (settings.lyricsLineCount || 3) === sc.count
                        ? "bg-amber-400 text-black border-amber-400 font-black"
                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2.5 BETTER LYRICS İLERİ SEVİYE GÖRSEL EFEKTLERİ */}
          <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-lg space-y-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>BETTER LYRICS GELİŞMİŞ AKIŞ AYARLARI:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {/* Vocal Gap Countdown Dots */}
              <button
                type="button"
                onClick={() => onChange({ lyricsShowVocalGapDots: !(settings.lyricsShowVocalGapDots !== false) })}
                className={cn(
                  "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
                  settings.lyricsShowVocalGapDots !== false
                    ? "bg-amber-400/10 border-amber-400/80 text-amber-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <div>
                  <div className="text-[9px] font-bold uppercase">••• Vokal Geri Sayım</div>
                  <div className="text-[8px] text-zinc-400">Enstrümantal nefes noktaları</div>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 border",
                  settings.lyricsShowVocalGapDots !== false ? "bg-amber-400 border-amber-400" : "border-zinc-700"
                )} />
              </button>

              {/* Long Note Sustained Glow */}
              <button
                type="button"
                onClick={() => onChange({ lyricsLongNoteGlow: !(settings.lyricsLongNoteGlow !== false) })}
                className={cn(
                  "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
                  settings.lyricsLongNoteGlow !== false
                    ? "bg-amber-400/10 border-amber-400/80 text-amber-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <div>
                  <div className="text-[9px] font-bold uppercase">✨ Uzun Hece Işıması</div>
                  <div className="text-[8px] text-zinc-400">0.75s+ tutulan notalarda aura</div>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 border",
                  settings.lyricsLongNoteGlow !== false ? "bg-amber-400 border-amber-400" : "border-zinc-700"
                )} />
              </button>

              {/* Inactive Line Blur */}
              <button
                type="button"
                onClick={() => onChange({ lyricsBlurInactive: !Boolean(settings.lyricsBlurInactive) })}
                className={cn(
                  "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
                  settings.lyricsBlurInactive
                    ? "bg-amber-400/10 border-amber-400/80 text-amber-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <div>
                  <div className="text-[9px] font-bold uppercase">🌫️ Derinlik Bulanıklığı</div>
                  <div className="text-[8px] text-zinc-400">Aktif olmayan satırları flulaştır</div>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 border",
                  settings.lyricsBlurInactive ? "bg-amber-400 border-amber-400" : "border-zinc-700"
                )} />
              </button>

              {/* Translation Display */}
              <button
                type="button"
                onClick={() => onChange({ lyricsTranslationEnabled: !Boolean(settings.lyricsTranslationEnabled) })}
                className={cn(
                  "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
                  settings.lyricsTranslationEnabled
                    ? "bg-amber-400/10 border-amber-400/80 text-amber-300"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <div>
                  <div className="text-[9px] font-bold uppercase">🌐 Çeviri / Romanizasyon</div>
                  <div className="text-[8px] text-zinc-400">İkinci dil satırını göster</div>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full shrink-0 border",
                  settings.lyricsTranslationEnabled ? "bg-amber-400 border-amber-400" : "border-zinc-700"
                )} />
              </button>
            </div>
          </div>

          {/* 2.6 LİRİK VURGU RENGİ & ÖZEL HEX */}
          <div className="space-y-2 pt-1">
            <label className="text-[9px] font-sans font-bold uppercase text-zinc-300 block">
              LİRİK VURGU RENGİ (AKTİF KELİME & IŞIMA):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onChange({ lyricsColor: c.color })}
                  className={cn(
                    "px-2.5 py-1.5 flex items-center gap-1.5 border rounded transition-all cursor-pointer",
                    (settings.lyricsColor || '#FFD700') === c.color
                      ? "border-amber-400 bg-zinc-900 ring-1 ring-amber-400/50"
                      : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                  )}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-[8.5px] font-bold text-zinc-300">{c.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                <input
                  type="color"
                  value={settings.lyricsColor || '#FFD700'}
                  onChange={(e) => onChange({ lyricsColor: e.target.value })}
                  className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                />
                <span className="text-[8.5px] font-mono text-zinc-400 uppercase">Özel</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 3: ⚡ SUNO AI & İÇE / DIŞA AKTAR (.LRC, .SRT, .VTT)                 */}
      {/* ========================================================================= */}
      {activeTab === 'SUNO' && (
        <div className="space-y-4 bg-zinc-950/70 p-4 border border-zinc-800 rounded-lg">
          
          {/* SUNO İÇE AKTARMA */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <Sparkles size={15} className="text-amber-400" />
              <span>SUNO AI ŞARKI LİNKİNDEN OTOMATİK LİRİK ÇEK</span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Suno.com paylaşım linkini yapıştırın. Şarkı sözleri ve fonem zamanlamaları anında içe aktarılır.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sunoUrlInput}
                onChange={(e) => setSunoUrlInput(e.target.value)}
                placeholder="https://suno.com/s/..."
                className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-2 text-xs text-white rounded outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={handleFetchSunoLyrics}
                disabled={isSunoLoading}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSunoLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isSunoLoading ? 'ÇÖZÜMLENİYOR...' : 'LİRİKLERİ ÇEK'}</span>
              </button>
            </div>

            {sunoSuccessMessage && (
              <div className="p-2.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] rounded flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>{sunoSuccessMessage}</span>
              </div>
            )}

            {sunoError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] rounded flex items-center gap-2">
                <AlertCircle size={13} className="shrink-0" />
                <span>{sunoError}</span>
              </div>
            )}
          </div>

          {/* .LRC METİN VE DOSYA İÇE AKTARMA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* .LRC Dosyası Yükle */}
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-white uppercase block">📂 .LRC DOSYASI YÜKLE</span>
                <p className="text-[9px] text-zinc-400 mt-0.5">Bilgisayarınızdaki standart .lrc lirik dosyasını aktarın.</p>
              </div>
              <label className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-dashed border-zinc-700 text-zinc-300 font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload size={13} className="text-amber-400" />
                <span>.LRC DOSYASI SEÇ</span>
                <input type="file" accept=".lrc,.txt" onChange={handleLrcFileUpload} className="hidden" />
              </label>
            </div>

            {/* Dışa Aktarma Butonları */}
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
              <span className="text-[10px] font-bold text-white uppercase block">💾 PROFESYONEL LİRİK & ALTYAZI DIŞA AKTAR</span>
              <p className="text-[9px] text-zinc-400">BetterLyrics, Apple Music, Premiere, CapCut ve JSON formatlarında indirin.</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadLrc}
                  title="Standart LRC formatında indir"
                  className="py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={11} className="text-amber-400" /> .LRC
                </button>
                <button
                  type="button"
                  onClick={handleDownloadEnhancedLrc}
                  title="BetterLyrics Hece/Kelime zamanlamalı Enhanced LRC"
                  className="py-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles size={11} className="text-amber-400" /> .ELRC
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTtml}
                  title="Apple Music uyumlu Timed Text Markup Language"
                  className="py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={11} className="text-amber-400" /> .TTML
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  title="Tüm hece ve fonem verisiyle JSON formatı"
                  className="py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={11} className="text-amber-400" /> .JSON
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSrt}
                  title="Video montaj için SRT altyazısı"
                  className="py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={11} className="text-amber-400" /> .SRT
                </button>
                <button
                  type="button"
                  onClick={handleDownloadVtt}
                  title="Web video oynatıcıları için WebVTT"
                  className="py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-bold text-[9px] uppercase rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Download size={11} className="text-amber-400" /> .VTT
                </button>
              </div>
            </div>
          </div>

          {/* LRC Metin Editörü */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white uppercase block">
              HAM .LRC KODU (DOĞRUDAN YAPIŞTIR & UYGULA):
            </label>
            <textarea
              rows={6}
              value={rawLrcInput}
              onChange={(e) => setRawLrcInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-[11px] font-mono text-amber-300 rounded-md outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleImportLrc(rawLrcInput)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded cursor-pointer transition-all"
            >
              METİNDEKİ .LRC'Yİ UYGULA
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKME 4: 🪄 AKILLI SÜRE DAĞITICI (AUTO SYNC)                             */}
      {/* ========================================================================= */}
      {activeTab === 'AUTO' && (
        <div className="space-y-3.5 bg-zinc-950/70 p-4 border border-zinc-800 rounded-lg">
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              HAM ŞARKI SÖZLERİNİ ŞARKI SÜRESİNE OTOMATİK DAĞIT
            </label>
            <p className="text-[10px] text-zinc-400">
              Şarkı sözlerini satır satır yapıştırın. Sistem şarkının toplam süresine ({Math.floor(duration || 180)} sn) göre akıllıca eşit aralıklarla başlangıç/bitiş zamanları oluşturur.
            </p>
          </div>

          <textarea
            rows={8}
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            placeholder="Şarkı sözlerini buraya yapıştırın..."
            className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white rounded-md outline-none focus:border-amber-400 font-sans"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-zinc-500">
              {rawTextInput.split('\n').filter(l => l.trim().length > 0).length} satır tespit edildi.
            </span>

            <button
              type="button"
              onClick={handleAutoSync}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-md flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
            >
              <Zap size={14} />
              <span>AKILLI SENKRONİZASYONU ÇALIŞTIR</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
