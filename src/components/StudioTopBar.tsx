import React from "react";
import { 
  Sparkles, Video, Download, Music, Zap, Settings, FileArchive 
} from "lucide-react";
import { VisualizerSettings } from "../types";
import { useCMS } from "../context/CMSContext";
import { Button, Badge, Separator } from "./ui";
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
  onSwitchToAutoMagic?: () => void;
  onSwitchToCreator?: () => void;
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
  onLoadDemo,
  onSwitchToAutoMagic,
  onSwitchToCreator
}) => {
  const { globalSettings } = useCMS();

  return (
    <header className="h-14 border-b border-border-subtle bg-panel/95 backdrop-blur-xl px-3 sm:px-5 flex items-center justify-between flex-shrink-0 z-40 gap-2">
      {/* Sol: Dinamik Logo & Marka Başlığı + Mod Seçici */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {globalSettings.logoUrl ? (
            <img 
              src={globalSettings.logoUrl} 
              alt={globalSettings.appName || "Logo"} 
              className="h-6 max-w-[120px] object-contain shrink-0" 
            />
          ) : (
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-black font-black text-[10px] shadow-[0_0_12px_rgba(255,215,0,0.4)] shrink-0">
              {globalSettings.appName ? globalSettings.appName.charAt(0).toUpperCase() : 'V'}
            </div>
          )}
          <span className="font-extrabold tracking-[0.25em] text-xs uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
            {globalSettings.headerTitle || globalSettings.appName || "VIDFRAMER"}
          </span>
        </div>

        {/* Tier Mode Switcher */}
        {onSwitchToAutoMagic && onSwitchToCreator && (
          <div className="hidden lg:flex items-center gap-1 bg-surface p-1 rounded-lg border border-border-subtle ml-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={onSwitchToAutoMagic}
              className="text-[10px] text-content-tertiary hover:text-content-primary gap-1 px-2"
              title="1-Tık Otomatik Analiz ve Dışa Aktar"
            >
              <Zap size={12} />
              <span>Otomatik</span>
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={onSwitchToCreator}
              className="text-[10px] text-content-tertiary hover:text-content-primary gap-1 px-2"
              title="Hazır Şablonlar Kütüphanesi"
            >
              <Sparkles size={12} />
              <span>Creator</span>
            </Button>

            <Button
              variant="accent"
              size="xs"
              className="font-bold text-[10px] gap-1 px-2"
            >
              <span>Pro Studio</span>
            </Button>
          </div>
        )}
      </div>


      {/* Orta: Aktif Parça Rozeti / Medya Sekmesine Yönlendirme */}
      <div className="flex items-center gap-2 min-w-0">
        {audioUrl ? (
          <button
            type="button"
            onClick={() => onSelectTab('media')}
            title="Medya Sekmesini Aç"
            className="flex items-center gap-2 px-3 py-1 bg-surface hover:bg-hover border border-border-subtle hover:border-accent rounded-full text-[10px] font-sans text-content-secondary max-w-[200px] sm:max-w-xs truncate cursor-pointer transition-all"
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
            <Button
              variant="outline"
              size="xs"
              onClick={() => onSelectTab('media')}
              className="rounded-full px-3 text-[10px]"
            >
              <Music size={12} className="text-accent" />
              <span>MEDYA YÖNETİMİ</span>
            </Button>
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
        <Button
          variant="amber"
          size="sm"
          onClick={onOpenTemplates}
          title="Müzik Türü ve Mood Presetleri"
          className="text-[10px]"
        >
          <Sparkles size={12} className="text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">PRESET SEÇ</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenReleasePack}
          title="Release Pack Studio: Tek tıkla 3 format (YouTube 16:9, TikTok 9:16, Spotify 1:1)"
          className="text-[10px] text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
        >
          <FileArchive size={12} className="text-blue-400" />
          <span className="hidden sm:inline">RELEASE PACK</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAdmin}
          title="Yönetim Paneli"
          className="text-[10px]"
        >
          <Settings size={12} className="text-content-secondary" />
          <span className="hidden sm:inline">YÖNETİM</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSuno}
          title="Suno AI Şarkı Bağlantısı ile İçe Aktar"
          className="text-[10px] text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
        >
          <Zap size={12} className="text-amber-400" />
          <span>SUNO İÇE AKTAR</span>
        </Button>

        {serverVideoUrl && (
          <a 
            href={serverVideoUrl} 
            download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
            className="inline-flex items-center justify-center gap-1.5 h-7 px-3 text-[10px] font-black uppercase tracking-wider rounded-sm bg-[#FFD700] hover:bg-white text-black transition-all shadow-[0_0_12px_rgba(255,215,0,0.3)]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">MP4 İNDİR</span>
          </a>
        )}

        <Button
          variant={activeTab === 'export' ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelectTab('export')}
          className={cn(
            "text-[10px] font-black uppercase tracking-wider",
            activeTab === 'export' && "bg-white text-black border-white hover:bg-zinc-200"
          )}
        >
          <Video size={13} className={activeTab === 'export' ? "text-black" : "text-accent"} />
          <span>DIŞA AKTAR</span>
        </Button>
      </div>
    </header>
  );
};

