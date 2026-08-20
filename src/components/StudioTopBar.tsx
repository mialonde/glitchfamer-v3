import React from "react";
import { 
  Sparkles, Video, Download, Music, Zap, Settings, FileArchive 
} from "lucide-react";
import { VisualizerSettings, StudioTabConfig } from "../types";
import { cn } from "../lib/utils";

interface StudioTopBarProps {
  audioUrl: string | null;
  settings: VisualizerSettings;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formatTime: (s: number) => string;
  serverVideoUrl: string | null;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenTemplates: () => void;
  onOpenReleasePack: () => void;
  onOpenAdmin: () => void;
  onOpenSuno: () => void;
  onLoadDemo: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  audioUrl,
  settings,
  isPlaying,
  currentTime,
  duration,
  formatTime,
  serverVideoUrl,
  activeTab,
  onSelectTab,
  onOpenTemplates,
  onOpenReleasePack,
  onOpenAdmin,
  onOpenSuno,
  onLoadDemo
}) => {
  return (
    <header className="h-14 border-b border-white/[0.07] bg-[#09090D]/90 backdrop-blur-xl px-3 sm:px-5 flex items-center justify-between flex-shrink-0 z-40 gap-2">
      {/* Sol: Monolitik Logo & Sürüm */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-black font-black text-[10px] shadow-[0_0_12px_rgba(255,215,0,0.4)] shrink-0">
            V
          </div>
          <span className="font-extrabold tracking-[0.25em] text-xs uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            VIDFRAMER
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border-subtle">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-widest uppercase bg-white/[0.04] border border-border-subtle text-content-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            STUDIO 2.0
          </span>
          <span className="text-[10px] text-content-tertiary font-sans hidden md:inline">
            60 FPS RENDER
          </span>
        </div>
      </div>

      {/* Orta: Aktif Parça Rozeti / Medya Sekmesine Yönlendirme */}
      <div className="flex items-center gap-2 min-w-0">
        {audioUrl ? (
          <button
            type="button"
            onClick={() => onSelectTab('media')}
            title="Medya Sekmesini Aç"
            className="flex items-center gap-2 px-3 py-1 bg-panel hover:bg-panel/90 border border-border-subtle hover:border-accent rounded-full text-[10px] font-sans text-content-secondary max-w-[200px] sm:max-w-xs truncate cursor-pointer transition-all"
          >
            <div className="flex items-end gap-0.5 h-3 px-0.5 shrink-0">
              <span className={cn("w-0.5 bg-accent rounded-full transition-all", isPlaying ? "h-full animate-bounce" : "h-1.5")} />
              <span className={cn("w-0.5 bg-accent rounded-full transition-all", isPlaying ? "h-2/3 animate-bounce [animation-delay:0.15s]" : "h-2.5")} />
              <span className={cn("w-0.5 bg-accent rounded-full transition-all", isPlaying ? "h-4/5 animate-bounce [animation-delay:0.3s]" : "h-1")} />
            </div>
            <span className="truncate font-semibold text-content-primary">
              {settings.trackTitle || "Yüklü Ses Dosyası"}
            </span>
            <span className="text-content-tertiary text-[9px] shrink-0 hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('media')}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-border-subtle hover:border-accent rounded-full text-[10px] font-sans text-content-secondary hover:text-content-primary cursor-pointer transition-colors"
            >
              <Music size={12} className="text-accent" />
              <span>MEDYA YÖNETİMİ</span>
            </button>
            <button
              type="button"
              onClick={onLoadDemo}
              className="hidden md:inline-flex text-[9px] font-sans text-content-tertiary hover:text-accent transition-colors cursor-pointer"
            >
              (Örnek Parça)
            </button>
          </div>
        )}
      </div>

      {/* Sağ: Render, Şablon, Paket, Yönetim & İndir Butonları */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenTemplates}
          className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          title="Müzik Türü ve Mood Presetleri (Rebellion, Space, Digital Abyss, Forest, vb.)"
        >
          <Sparkles size={12} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">PRESET SEÇ</span>
        </button>

        <button
          type="button"
          onClick={onOpenReleasePack}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 sm:px-3 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.1)]"
          title="Release Pack Studio: Tek tıkla 3 format (YouTube 16:9, TikTok 9:16, Spotify 1:1)"
        >
          <FileArchive size={12} className="text-blue-400" />
          <span className="hidden sm:inline">RELEASE PACK</span>
        </button>

        <button
          type="button"
          onClick={onOpenAdmin}
          className="bg-surface hover:bg-hover text-content-secondary border border-border-subtle px-3 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          title="Yönetim Paneli"
        >
          <Settings size={12} className="text-content-secondary" />
          <span className="hidden sm:inline">YÖNETİM</span>
        </button>

        <button
          type="button"
          onClick={onOpenSuno}
          className="bg-accent/10 hover:bg-[#FFD700]/25 text-accent border border-accent/40 px-3 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,215,0,0.15)] cursor-pointer"
          title="Suno AI Şarkı Bağlantısı ile İçe Aktar"
        >
          <Zap size={12} className="text-accent" />
          <span>SUNO İÇE AKTAR</span>
        </button>

        {serverVideoUrl && (
          <a 
            href={serverVideoUrl} 
            download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
            className="bg-accent hover:bg-white text-black px-3 sm:px-3.5 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">MP4 İNDİR</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => onSelectTab('export')}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border",
            activeTab === 'export'
              ? "bg-white text-black border-white"
              : "bg-white/[0.05] hover:bg-white/[0.1] text-content-primary border-border-subtle"
          )}
        >
          <Video size={13} className="text-accent" />
          <span>DIŞA AKTAR</span>
        </button>
      </div>
    </header>
  );
};
