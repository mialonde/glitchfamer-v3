import React from 'react';
import { 
  Sparkles, Sliders, Shield, Zap, RefreshCw, Layers, 
  HelpCircle, Monitor, ArrowLeft, Download, Eye
} from 'lucide-react';
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
          <div className="w-7 h-7 bg-accent text-black font-black flex items-center justify-center text-xs tracking-tighter rounded-sm shadow-[0_0_12px_rgba(255,215,0,0.35)]">
            VF
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xs font-black tracking-widest text-content-primary flex items-center gap-1.5">
              VIDFRAMER <span className="text-[9px] text-accent font-bold px-1 py-0.2 bg-accent/15 border border-accent/30 rounded">2.0</span>
            </span>
            <span className="text-[7.5px] font-mono text-content-tertiary uppercase tracking-wider hidden sm:block">
              AUDIO VISUALIZER & VIDEO ENGINE
            </span>
          </div>
        </div>

        {/* Aktif Parça Rozeti */}
        {isAudioLoaded && trackTitle && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border-subtle rounded text-[9px] font-mono text-content-secondary max-w-[200px] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">{trackTitle}</span>
          </div>
        )}
      </div>

      {/* Orta: Layer / Çalışma Modu Seçici */}
      <div className="flex items-center gap-1 bg-surface p-0.5 border border-border-subtle rounded-md">
        <button
          type="button"
          onClick={() => setUiLayer('QUICK_START')}
          className={cn(
            "px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1",
            uiLayer === 'QUICK_START'
              ? "bg-accent text-black font-black shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          )}
        >
          <Zap size={11} />
          <span>HIZLI BAŞLAT</span>
        </button>

        <button
          type="button"
          onClick={() => setUiLayer('STUDIO')}
          className={cn(
            "px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1",
            uiLayer === 'STUDIO'
              ? "bg-accent text-black font-black shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          )}
        >
          <Sliders size={11} />
          <span>STÜDYO KONSOLU</span>
        </button>

        <button
          type="button"
          onClick={() => setUiLayer('ADMIN')}
          className={cn(
            "px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1",
            uiLayer === 'ADMIN'
              ? "bg-accent text-black font-black shadow-sm"
              : "text-content-secondary hover:text-content-primary"
          )}
          title="Modül & CMS Yönetim Paneli"
        >
          <Shield size={11} />
          <span className="hidden sm:inline">CMS</span>
        </button>
      </div>

      {/* Sağ: Hızlı Araçlar (Suno, Eco Mod, Sıfırla) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSunoModal}
          className="px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Suno AI Şarkı Bağlantısını İçe Aktar"
        >
          <Sparkles size={11} className="text-accent" />
          <span>SUNO İÇE AKTAR</span>
        </button>

        {onToggleLowPerformance && (
          <button
            type="button"
            onClick={onToggleLowPerformance}
            className={cn(
              "hidden sm:flex items-center gap-1 px-2 py-1 border text-[8.5px] font-sans font-bold uppercase rounded cursor-pointer transition-all",
              lowPerformanceMode
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-surface border-border-subtle text-content-tertiary hover:text-content-secondary"
            )}
            title="Düşük GPU / Pil tasarrufu modu"
          >
            <span>{lowPerformanceMode ? '🟢 ECO' : '⚪ ECO'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onResetSettings}
          className="p-1.5 text-content-tertiary hover:text-content-primary hover:bg-hover rounded border border-transparent hover:border-border-subtle transition-all cursor-pointer"
          title="Tüm ayarları varsayılana sıfırla"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </header>
  );
};
