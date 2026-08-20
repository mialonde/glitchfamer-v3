import React from 'react';
import { 
  Sparkles, Sliders, Shield, Zap, RefreshCw
} from 'lucide-react';
import { Button, Badge } from './ui';
import { cn } from '../lib/utils';

interface AppHeaderProps {
  uiLayer: 'QUICK_START' | 'STUDIO' | 'ADMIN';
  setUiLayer: (layer: 'QUICK_START' | 'STUDIO' | 'ADMIN') => void;
  onOpenSunoModal: () => void;
  onOpenPresetModal?: () => void;
  onResetSettings: () => void;
  lowPerformanceMode?: boolean;
  onToggleLowPerformance?: () => void;
  trackTitle?: string;
  isAudioLoaded?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  uiLayer,
  setUiLayer,
  onOpenSunoModal,
  onResetSettings,
  lowPerformanceMode,
  onToggleLowPerformance,
  trackTitle,
  isAudioLoaded
}) => {
  return (
    <header className="h-12 border-b border-border-subtle bg-panel/95 backdrop-blur px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Sol: Logo & Marka */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUiLayer('QUICK_START')}>
          <div className="w-7 h-7 bg-accent text-accent-foreground font-black flex items-center justify-center text-xs tracking-tighter rounded-md shadow-elevation-1">
            VF
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-content-primary flex items-center gap-1.5">
              VIDFRAMER <Badge variant="accent" className="text-[9px] py-0 px-1">2.0</Badge>
            </span>
            <span className="text-[8px] font-mono text-content-tertiary uppercase tracking-wider hidden sm:block">
              AUDIO VISUALIZER & VIDEO ENGINE
            </span>
          </div>
        </div>

        {/* Aktif Parça Rozeti */}
        {isAudioLoaded && trackTitle && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border-subtle rounded-md text-[10px] font-mono text-content-secondary max-w-[200px] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">{trackTitle}</span>
          </div>
        )}
      </div>

      {/* Orta: Layer / Çalışma Modu Seçici */}
      <div className="flex items-center gap-1 bg-surface p-0.5 border border-border-subtle rounded-lg">
        <Button
          variant={uiLayer === 'QUICK_START' ? 'accent' : 'ghost'}
          size="xs"
          onClick={() => setUiLayer('QUICK_START')}
          className="font-bold uppercase text-[10px] gap-1"
        >
          <Zap size={12} />
          <span>HIZLI BAŞLAT</span>
        </Button>

        <Button
          variant={uiLayer === 'STUDIO' ? 'accent' : 'ghost'}
          size="xs"
          onClick={() => setUiLayer('STUDIO')}
          className="font-bold uppercase text-[10px] gap-1"
        >
          <Sliders size={12} />
          <span>STÜDYO KONSOLU</span>
        </Button>

        <Button
          variant={uiLayer === 'ADMIN' ? 'accent' : 'ghost'}
          size="xs"
          onClick={() => setUiLayer('ADMIN')}
          className="font-bold uppercase text-[10px] gap-1"
          title="Modül & CMS Yönetim Paneli"
        >
          <Shield size={12} />
          <span className="hidden sm:inline">CMS</span>
        </Button>
      </div>

      {/* Sağ: Hızlı Araçlar (Suno, Eco Mod, Sıfırla) */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={onOpenSunoModal}
          className="border-accent/40 text-accent hover:border-accent font-bold uppercase text-[10px] gap-1.5"
          title="Suno AI Şarkı Bağlantısını İçe Aktar"
        >
          <Sparkles size={12} className="text-accent" />
          <span>SUNO İÇE AKTAR</span>
        </Button>

        {onToggleLowPerformance && (
          <Button
            variant={lowPerformanceMode ? "secondary" : "ghost"}
            size="xs"
            onClick={onToggleLowPerformance}
            className={cn(
              "hidden sm:flex text-[9px] font-mono",
              lowPerformanceMode && "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
            )}
            title="Düşük GPU / Pil tasarrufu modu"
          >
            <span>{lowPerformanceMode ? '🟢 ECO' : '⚪ ECO'}</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onResetSettings}
          title="Tüm ayarları varsayılana sıfırla"
          aria-label="Ayarları sıfırla"
        >
          <RefreshCw size={13} />
        </Button>
      </div>
    </header>
  );
};

