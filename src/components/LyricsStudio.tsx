import React, { useState, useEffect } from 'react';
import { VisualizerSettings, LyricsStyle, LyricsPosition } from '../types';
import { parseLrcText, exportToLrcText, autoSyncLyricsByDuration, MESELE_DEMO_LRC_TEXT } from '../services/lyricSyncService';
import { sunoImporter } from '../services/SunoImporterService';
import { 
  Type, Upload, Download, Plus, Trash2, Zap, Play, Clock, 
  RotateCcw, Eye, EyeOff, Radio, Link2, Sparkles, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LyricsStudioProps {
  settings: VisualizerSettings;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onChange: (updated: Partial<VisualizerSettings>) => void;
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
Gözlerin bilinmez bir diyar gibi
Sokak lambaları yanık
Yine gece mesaisindeyim
Kaç gecedir aynı filmi
Farklı kafayla seyretmekteyim
Müslüm çalıyor uzaktan
Şarkı ciğerime oturuyo'
Bazı şarkılar var ya
Adamın ömrünü çürütüyo'
Çocukluğum kaldı bir yerde
Bulsam alıp gelicem
Bu yaştan sonra kimseye derdimi anlatam'icam
Herkes kendi hesabında kendi derdinde
Benim içimde kıyamet var kendi halimde
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
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<'AUTO' | 'LRC' | 'SUNO' | 'MANUAL'>('LRC');
  const [rawTextInput, setRawTextInput] = useState(settings.rawLyrics || DEMO_LYRICS_TEXT);
  const [rawLrcInput, setRawLrcInput] = useState(MESELE_DEMO_LRC_TEXT);
  const [liveTapIndex, setLiveTapIndex] = useState(0);

  useEffect(() => {
    if (settings.rawLyrics) {
      setRawTextInput(settings.rawLyrics);
    }
  }, [settings.rawLyrics]);

  // Suno Link Çözümleme State'i
  const [sunoUrlInput, setSunoUrlInput] = useState('https://suno.com/s/a2hf69thdnYq25lG');
  const [isSunoLoading, setIsSunoLoading] = useState(false);
  const [sunoError, setSunoError] = useState<string | null>(null);
  const [sunoSuccessMessage, setSunoSuccessMessage] = useState<string | null>(null);

  // Klavye Space Tuşu ile Canlı Senkronizasyon desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Eğer input veya textarea odağında değilsek space ile canlı tap yap
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyT' && activeTab === 'MANUAL') {
        e.preventDefault();
        handleLiveTapNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, liveTapIndex, currentTime, settings.syncedLyrics]);

  // 1. Akıllı Otomatik Senkronizasyon (Süreye Göre Dağıt)
  const handleAutoSync = () => {
    const effectiveDuration = duration > 5 ? duration : 180;
    const synced = autoSyncLyricsByDuration(rawTextInput, effectiveDuration);
    onChange({
      syncedLyrics: synced,
      lyricsEnabled: true
    });
    setLiveTapIndex(0);
  };

  // 2. LRC Metnini veya Dosyasını Ayrıştır
  const handleImportLrc = (lrcString: string) => {
    const parsed = parseLrcText(lrcString);
    if (parsed.length > 0) {
      onChange({
        syncedLyrics: parsed,
        lyricsEnabled: true
      });
      setLiveTapIndex(0);
    }
  };

  const handleLrcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawLrcInput(text);
        handleImportLrc(text);
      }
    };
    reader.readAsText(file);
  };

  // 3. LRC Formatında İndir
  const handleDownloadLrc = () => {
    const lrcContent = exportToLrcText(settings.syncedLyrics);
    if (!lrcContent) return;
    const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.trackTitle || 'vidframer_lyrics'}.lrc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3.5 Suno AI Linkinden Lirik ve Senkronizasyon Çek
  const handleFetchSunoLyrics = async () => {
    const targetUrl = sunoUrlInput.trim();
    if (!targetUrl) {
      setSunoError("Lütfen geçerli bir Suno şarkı linki girin.");
      return;
    }

    setSunoError(null);
    setSunoSuccessMessage(null);
    setIsSunoLoading(true);

    try {
      const track = await sunoImporter.importTrack(targetUrl);
      if (track.syncedLines && track.syncedLines.length > 0) {
        onChange({
          syncedLyrics: track.syncedLines,
          lyricsEnabled: true,
          trackTitle: track.title || settings.trackTitle,
          artistName: track.artist || settings.artistName
        });
        setSunoSuccessMessage(
          `✓ "${track.title}" başarıyla yüklendi! (${track.syncedLines.length} satır, ${track.hasWordLevelTimestamps ? 'Kelime Düzeyi Senkron' : 'Otomatik Senkron'})`
        );
        setLiveTapIndex(0);
      } else if (track.lyrics) {
        setRawTextInput(track.lyrics);
        setSunoSuccessMessage(`✓ Şarkı sözleri metin olarak alındı.`);
      } else {
        throw new Error("Şarkıya ait lirik bulunamadı.");
      }
    } catch (err: any) {
      setSunoError(err?.message || "Suno lirikleri alınamadı.");
    } finally {
      setIsSunoLoading(false);
    }
  };

  // 4. Canlı Tap / Dokunarak Zaman Damgası Mühürleme
  const handleLiveTapNext = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    if (liveTapIndex >= settings.syncedLyrics.length) return;

    const updated = [...settings.syncedLyrics];
    const now = Math.round(currentTime * 100) / 100;
    
    // Aktif satırın başlangıç zamanını şu anki saniye yap
    updated[liveTapIndex] = {
      ...updated[liveTapIndex],
      startTime: now
    };

    // Bir önceki satır varsa onun bitiş zamanını bu an yap
    if (liveTapIndex > 0) {
      updated[liveTapIndex - 1] = {
        ...updated[liveTapIndex - 1],
        endTime: now
      };
    }

    // Sıradaki satıra geç
    onChange({ syncedLyrics: updated });
    setLiveTapIndex(prev => Math.min(updated.length, prev + 1));
  };

  // Satır Ekleme / Silme / Düzenleme
  const handleAddLine = () => {
    const updated = [...(settings.syncedLyrics || [])];
    const lastLine = updated[updated.length - 1];
    const start = lastLine ? lastLine.endTime : 0;
    updated.push({
      startTime: start,
      endTime: start + 4.0,
      text: 'Yeni Şarkı Sözü Satırı'
    });
    onChange({ syncedLyrics: updated });
  };

  const handleDeleteLine = (index: number) => {
    const updated = (settings.syncedLyrics || []).filter((_, idx) => idx !== index);
    onChange({ syncedLyrics: updated });
    if (liveTapIndex >= updated.length) {
      setLiveTapIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateLine = (index: number, field: 'startTime' | 'endTime' | 'text', val: string | number) => {
    const updated = [...(settings.syncedLyrics || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
      onChange({ syncedLyrics: updated });
    }
  };

  const formatSrtTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const formatVttTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const handleDownloadSrt = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    let srtContent = "";
    settings.syncedLyrics.forEach((line, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${formatSrtTime(line.startTime)} --> ${formatSrtTime(line.endTime)}\n`;
      srtContent += `${line.text}\n\n`;
    });
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.trackTitle || 'vidframer_lyrics'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadVtt = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    let vttContent = "WEBVTT\n\n";
    settings.syncedLyrics.forEach((line, index) => {
      vttContent += `${index + 1}\n`;
      vttContent += `${formatVttTime(line.startTime)} --> ${formatVttTime(line.endTime)}\n`;
      vttContent += `${line.text}\n\n`;
    });
    const blob = new Blob([vttContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.trackTitle || 'vidframer_lyrics'}.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lyricsCount = settings.syncedLyrics?.length || 0;

  return (
    <section className="space-y-6">
      {/* 1. ÜST BAŞLIK & GENEL AÇ/KAPA DÜĞMESİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Type className={cn("w-4 h-4 transition-colors", settings.lyricsEnabled !== false ? "text-accent" : "text-content-tertiary")} />
          <div>
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-content-primary">
              ŞARKI SÖZLERİ (KINETIC LYRICS)
            </h3>
            <p className="text-[8.5px] text-content-tertiary font-sans">
              Otomatik süre dağıtıcı, .LRC içe/dışa aktarma veya canlı senkronizasyon.
            </p>
          </div>
        </div>

        {/* Şarkı Sözleri Genel Aç/Kapa */}
        <button
          onClick={() => onChange({ lyricsEnabled: !(settings.lyricsEnabled !== false) })}
          className={cn(
            "px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider border rounded-sm transition-all flex items-center gap-1.5 cursor-pointer",
            settings.lyricsEnabled !== false
              ? "bg-accent text-black border-accent shadow-[0_0_12px_rgba(255,215,0,0.25)]"
              : "bg-panel text-content-tertiary border-white/[0.08] hover:border-border-strong"
          )}
        >
          {settings.lyricsEnabled !== false ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{settings.lyricsEnabled !== false ? 'LİRİKLER: AÇIK' : 'LİRİKLER: KAPALI'}</span>
        </button>
      </div>

      {/* 2. GÖRSEL TİPOGRAFİ VE KONUM AYARLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-panel p-3.5 border border-white/[0.08] rounded-sm">
        {/* Stil Seçici */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-sans uppercase text-content-secondary">TİPOGRAFİ STİLİ:</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'KINETIC', label: 'KINETIC GLOW', desc: 'Vuruşlu brütalist' },
              { id: 'KARAOKE', label: 'KARAOKE BOUNCE', desc: 'Kelime kelime parlama' },
              { id: 'SUBTITLE', label: 'SUBTITLE BOX', desc: 'Sinematik altyazı kutusu' },
              { id: 'NEON_BOX', label: 'NEON BADGE', desc: 'Retro neon çerçeve' },
              { id: 'CYBER_GLITCH', label: 'CYBER GLITCH', desc: 'Glitch piksel kayması' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onChange({ lyricsStyle: st.id as LyricsStyle })}
                className={cn(
                  "p-2 text-left border transition-all cursor-pointer",
                  (settings.lyricsStyle || 'KINETIC') === st.id
                    ? "bg-accent text-black border-accent font-black"
                    : "bg-panel text-content-secondary border-border-strong hover:border-border-strong"
                )}
              >
                <div className="text-[8px] font-bold uppercase">{st.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Konum Seçici */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-sans uppercase text-content-secondary">EKRAN KONUMU:</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'TOP', label: 'ÜST' },
              { id: 'CENTER', label: 'ORTA' },
              { id: 'BOTTOM', label: 'ALT' }
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onChange({ lyricsPosition: pos.id as LyricsPosition })}
                className={cn(
                  "py-3 text-center border transition-all cursor-pointer font-bold text-[9px] uppercase",
                  (settings.lyricsPosition || 'BOTTOM') === pos.id
                    ? "bg-accent text-black border-accent"
                    : "bg-panel text-content-secondary border-border-strong hover:border-border-strong"
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>

          {/* Yazı Boyutu */}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-[8px] font-sans">
              <span className="text-content-tertiary uppercase">YAZI BOYUTU:</span>
              <span className="text-accent font-bold">{settings.lyricsFontSize || 42}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="68"
              step="2"
              value={settings.lyricsFontSize || 42}
              onChange={(e) => onChange({ lyricsFontSize: parseInt(e.target.value) })}
              className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Vurgu Rengi */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-sans uppercase text-content-secondary">LİRİK VURGU RENGİ:</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { name: 'GOLD', color: '#FFD700' },
              { name: 'CYAN', color: '#00F0FF' },
              { name: 'WHITE', color: '#FFFFFF' },
              { name: 'LIME', color: '#39FF14' },
              { name: 'CRIMSON', color: '#FF003C' },
              { name: 'PURPLE', color: '#BD00FF' }
            ].map((c) => (
              <button
                key={c.name}
                onClick={() => onChange({ lyricsColor: c.color })}
                className={cn(
                  "p-2 flex items-center gap-1.5 border transition-all cursor-pointer",
                  (settings.lyricsColor || '#FFD700') === c.color
                    ? "border-accent bg-surface"
                    : "border-border-strong bg-panel hover:border-border-strong"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[8px] font-bold text-content-secondary">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2.5 VİSEME DİJİTAL DUDAK SENKRONİZASYONU BİLGİ KARTI */}
      <div className="bg-[#FFD700]/[0.03] border border-accent/20 p-3 rounded-sm flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-content-secondary text-[8.5px] font-sans leading-relaxed">
          <div className="text-accent font-bold uppercase tracking-wider flex items-center gap-2">
            <span>VİSEME / FONEM DESTEKLİ DUDAK SENKRONİZASYONU (LIP-SYNC)</span>
            <span className="px-1.5 py-0.2 bg-accent/20 text-accent text-[7.5px] rounded">10 VİSEME AKTİF</span>
          </div>
          <p>
            Yüklediğiniz veya senkronize ettiğiniz şarkı sözleri otomatik olarak fonemlere ayrıştırılır (<span className="text-content-primary">A, E, I, O, U, M, F, L, S</span>) ve 3D Anime / Hologram modellerinde (<span className="text-content-primary">AliciaSolid, Noir Head, Obj Mask</span>) gerçek zamanlı ağız kası blendshape hareketlerine dönüştürülür. Şarkı sözü yokken ağız hareketi durur.
          </p>
        </div>
      </div>

      {/* 3. SENKRONİZASYON SEKMELERİ (AUTO / LRC / SUNO / MANUAL) */}
      <div className="space-y-4">
        <div className="flex flex-wrap border-b border-border-strong">
          {[
            { id: 'AUTO', label: '1. AKILLI OTOMATİK SÜRE DAĞITIMI' },
            { id: 'LRC', label: '2. .LRC DOSYASI / METİN' },
            { id: 'SUNO', label: '⚡ 3. SUNO AI LİNKİNDEN ÇÖZÜMLE' },
            { id: 'MANUAL', label: `4. CANLI DOKUN & DÜZENLE (${lyricsCount} SATIR)` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2.5 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                activeTab === tab.id
                  ? "border-accent text-accent bg-[#FFD700]/5"
                  : "border-transparent text-content-tertiary hover:text-content-secondary"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEKME 1: AKILLI OTOMATİK SENKRONİZASYON */}
        {activeTab === 'AUTO' && (
          <div className="space-y-4 bg-panel p-4 border border-border-strong">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-sans text-content-secondary">
                Şarkı sözlerini alt alta yapıştırın. Sistem şarkının toplam süresine ({Math.round(duration || 180)} sn) göre satırları akıcı ve eşit şekilde senkronize eder.
              </span>
              <button
                onClick={() => setRawTextInput(DEMO_LYRICS_TEXT)}
                className="text-[8px] font-sans text-accent hover:underline cursor-pointer"
              >
                Örnek Demo Metin Doldur
              </button>
            </div>

            <textarea
              rows={5}
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder="Her satıra bir lirik gelecek şekilde yapıştırın..."
              className="w-full bg-panel border border-border-strong p-3 text-xs font-sans text-content-primary focus:border-accent outline-none"
            />

            <button
              onClick={handleAutoSync}
              className="w-full py-3 bg-accent hover:bg-white text-black font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              <Zap size={14} />
              <span>ŞARKI SÜRESİNE GÖRE ANINDA SENKRONİZE ET & UYGULA</span>
            </button>
          </div>
        )}

        {/* SEKME 2.5: SUNO AI LİNKİNDEN LİRİK ÇÖZÜMLE */}
        {activeTab === 'SUNO' && (
          <div className="space-y-4 bg-panel p-4 border border-border-strong">
            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold text-content-primary uppercase flex items-center gap-1.5">
                <Sparkles size={13} className="text-accent" />
                SUNO ŞARKI LİNKİNDEN LİRİK VE SENKRONİZASYON AKTAR
              </span>
              <p className="text-[8.5px] font-sans text-content-secondary">
                Suno linkini yapıştırın; şarkı sözleri, kelime zamanlamaları (word-level timestamps) ve fonetik dudak senkronizasyonu otomatik hazırlanır.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
                <input
                  type="text"
                  placeholder="https://suno.com/s/a2hf69thdnYq25lG veya https://suno.com/song/..."
                  value={sunoUrlInput}
                  onChange={(e) => setSunoUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchSunoLyrics();
                  }}
                  className="w-full bg-panel border border-border-strong focus:border-accent pl-8 pr-3 py-2.5 text-xs font-sans text-content-primary placeholder:text-content-tertiary outline-none rounded-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleFetchSunoLyrics}
                disabled={isSunoLoading || !sunoUrlInput.trim()}
                className="px-4 py-2.5 bg-accent hover:bg-[#ffe033] text-black font-sans font-bold text-[9.5px] uppercase rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0 shadow-[0_0_12px_rgba(255,215,0,0.2)]"
              >
                {isSunoLoading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    ÇÖZÜMLENİYOR...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    SÖZLERİ ÇEK & UYGULA
                  </>
                )}
              </button>
            </div>

            {/* Hızlı Örnekler */}
            <div className="flex items-center gap-2 pt-1 text-[8px] font-sans text-content-tertiary">
              <span>HIZLI TEST:</span>
              <button
                type="button"
                onClick={() => {
                  setSunoUrlInput("https://suno.com/s/a2hf69thdnYq25lG");
                }}
                className="text-content-secondary hover:text-accent underline cursor-pointer"
              >
                Örnek Kısa Link
              </button>
            </div>

            {sunoError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-sm flex items-center gap-2 text-red-300 text-[9px] font-sans">
                <AlertCircle size={13} className="shrink-0 text-red-400" />
                <span>{sunoError}</span>
              </div>
            )}

            {sunoSuccessMessage && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-sm flex items-center gap-2 text-emerald-300 text-[9px] font-sans">
                <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                <span>{sunoSuccessMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* SEKME 2: LRC DOSYASI VE İÇE/DIŞA AKTAR */}
        {activeTab === 'LRC' && (
          <div className="space-y-4 bg-panel p-4 border border-border-strong">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LRC Dosyası Yükle */}
              <label className="border border-dashed border-border-strong p-6 text-center cursor-pointer hover:border-accent transition-colors bg-panel flex flex-col items-center justify-center">
                <input type="file" accept=".lrc,text/plain" onChange={handleLrcFileUpload} className="hidden" />
                <Upload size={20} className="text-accent mb-2" />
                <span className="text-[10px] font-black uppercase text-content-primary">.LRC DOSYASI YÜKLE</span>
                <span className="text-[8px] font-sans text-content-tertiary mt-1">Zaman damgalı standart lirik dosyası</span>
              </label>

              {/* Mevcut Sözleri LRC Olarak İndir */}
              <button
                onClick={handleDownloadLrc}
                disabled={lyricsCount === 0}
                className="border border-border-strong p-6 text-center hover:border-accent transition-colors bg-panel flex flex-col items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <Download size={20} className="text-accent mb-2" />
                <span className="text-[10px] font-black uppercase text-content-primary">.LRC OLARAK İNDİR</span>
                <span className="text-[8px] font-sans text-content-tertiary mt-1">{lyricsCount} adet senkronize satırı dışa aktar</span>
              </button>
            </div>

            {/* Altyazı Dışa Aktarma Formatları */}
            <div className="pt-2 border-t border-zinc-850 space-y-2">
              <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
                VİDEO ALTYAZI FORMATLARINDA DIŞA AKTAR
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSrt}
                  disabled={lyricsCount === 0}
                  className="py-3 px-4 border border-border-strong hover:border-accent text-center bg-panel hover:bg-panel text-[9px] font-sans uppercase tracking-wider text-content-secondary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Download size={13} className="text-accent" />
                  <span>SRT ALTYAZI İNDİR (.srt)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadVtt}
                  disabled={lyricsCount === 0}
                  className="py-3 px-4 border border-border-strong hover:border-accent text-center bg-panel hover:bg-panel text-[9px] font-sans uppercase tracking-wider text-content-secondary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Download size={13} className="text-accent" />
                  <span>VTT ALTYAZI İNDİR (.vtt)</span>
                </button>
              </div>
            </div>

            {/* LRC Metin Yapıştırma */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-sans text-content-secondary uppercase">VEYA LRC FORMATINDA METİN YAPIŞTIRIN:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawLrcInput(MESELE_DEMO_LRC_TEXT);
                    handleImportLrc(MESELE_DEMO_LRC_TEXT);
                  }}
                  className="text-[8px] font-sans text-accent hover:underline cursor-pointer"
                >
                  Mesele Demo LRC'yi Uygula
                </button>
              </div>
              <textarea
                rows={4}
                value={rawLrcInput}
                onChange={(e) => setRawLrcInput(e.target.value)}
                placeholder="[00:12.30] Şarkı sözü satırı..."
                className="w-full bg-panel border border-border-strong p-3 text-xs font-sans text-content-primary focus:border-accent outline-none"
              />
              <button
                onClick={() => handleImportLrc(rawLrcInput)}
                className="px-4 py-2 bg-surface hover:bg-accent text-content-primary hover:text-black font-black text-[9px] uppercase tracking-wider border border-border-strong cursor-pointer"
              >
                YAPIŞTIRILAN LRC'Yİ AKTİF ET
              </button>
            </div>
          </div>
        )}

        {/* SEKME 3: MANUEL CANLI SENKRONİZASYON STÜDYOSU */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-4 bg-panel p-4 border border-border-strong">
            {/* CANLI TAP KONTROL PANELİ */}
            <div className="bg-panel p-4 border border-border-strong flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-content-primary flex items-center gap-2">
                  <Clock size={13} className="text-accent" />
                  <span>ŞARKI ZAMANI: {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')} sn</span>
                </div>
                <p className="text-[8px] font-sans text-content-tertiary">
                  Şarkıyı oynatın. Şarkıcı bir sonraki satıra her geçtiğinde büyük sarı butona dokunun (veya 'T' tuşuna basın).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePlay}
                  className="px-3 py-2 bg-surface border border-border-strong hover:border-border-strong text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={12} className={isPlaying ? "text-accent" : ""} />
                  <span>{isPlaying ? 'DURAKLAT' : 'ŞARKIYI ÇAL'}</span>
                </button>

                {/* BÜYÜK CANLI DOKUN BUTONU */}
                <button
                  onClick={handleLiveTapNext}
                  disabled={lyricsCount === 0 || liveTapIndex >= lyricsCount}
                  className="px-5 py-2.5 bg-accent hover:bg-white text-black font-black text-[10px] tracking-widest uppercase border border-accent transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-40"
                >
                  <Radio size={14} className="animate-pulse" />
                  <span>BU SATIRA DOKUN (CANLI TAP) [{liveTapIndex + 1}/{lyricsCount}]</span>
                </button>
              </div>
            </div>

            {/* SATIR SATIR DÜZENLEME TABLOSU */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {settings.syncedLyrics && settings.syncedLyrics.length > 0 ? (
                settings.syncedLyrics.map((line, idx) => {
                  const isCurrentLive = idx === liveTapIndex;
                  const isCurrentTimeActive = currentTime >= line.startTime && currentTime <= line.endTime;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2.5 border flex items-center gap-3 transition-all",
                        isCurrentLive
                          ? "border-accent bg-accent/10"
                          : isCurrentTimeActive
                          ? "border-zinc-600 bg-surface/50"
                          : "border-border-subtle bg-panel"
                      )}
                    >
                      {/* Sıra Numarası */}
                      <span className="text-[9px] font-sans text-content-tertiary w-5 text-right font-bold">
                        {idx + 1}.
                      </span>

                      {/* Başlangıç Saniyesi */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-sans text-content-tertiary">BAŞLA:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={line.startTime}
                          onChange={(e) => handleUpdateLine(idx, 'startTime', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-surface border border-border-strong px-1 py-0.5 text-[9px] font-sans text-accent text-center"
                        />
                      </div>

                      {/* Bitiş Saniyesi */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-sans text-content-tertiary">BİTİR:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={line.endTime}
                          onChange={(e) => handleUpdateLine(idx, 'endTime', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-surface border border-border-strong px-1 py-0.5 text-[9px] font-sans text-content-secondary text-center"
                        />
                      </div>

                      {/* Satır Metni */}
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => handleUpdateLine(idx, 'text', e.target.value)}
                        className="flex-1 bg-transparent border-b border-border-strong focus:border-accent px-2 py-0.5 text-xs text-content-primary outline-none font-bold"
                      />

                      {/* Canlı Tap Seçimi */}
                      <button
                        onClick={() => setLiveTapIndex(idx)}
                        title="Bu satırı canlı tap hedefi yap"
                        className={cn(
                          "px-2 py-1 text-[8px] font-sans uppercase border cursor-pointer",
                          isCurrentLive ? "bg-accent text-black border-accent font-bold" : "text-content-tertiary border-border-strong hover:text-content-primary"
                        )}
                      >
                        {isCurrentLive ? 'HEDEF' : 'SEÇ'}
                      </button>

                      {/* Sil */}
                      <button
                        onClick={() => handleDeleteLine(idx)}
                        className="text-red-500 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[10px] font-sans text-content-tertiary">
                  Henüz lirik eklenmedi. Yukarıdaki "1. Akıllı Senkronizasyon" sekmesinden veya "Satır Ekle" butonundan başlayabilirsiniz.
                </div>
              )}
            </div>

            {/* Satır Ekle & Sıfırla Butonları */}
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <button
                onClick={handleAddLine}
                className="px-3 py-1.5 bg-surface hover:bg-accent text-content-secondary hover:text-black border border-border-strong text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} /> SATIR EKLE
              </button>

              <button
                onClick={() => setLiveTapIndex(0)}
                className="text-[8px] font-sans text-content-tertiary hover:text-content-secondary flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={10} /> Canlı Tap Hedefini Başa Al
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
