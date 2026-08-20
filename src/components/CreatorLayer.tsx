import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Zap, Sliders, Music, Image as ImageIcon, Video, 
  Download, Loader2, Settings, Check, LayoutGrid, Layers, ShieldCheck
} from 'lucide-react';
import { VisualizerSettings } from '../types';
import { Button, Badge, Card } from './ui';
import { CURATED_LOOKS } from './QuickStartLayer';
import { cn } from '../lib/utils';

interface CreatorLayerProps {
  settings: VisualizerSettings;
  onUpdateSettings: (s: Partial<VisualizerSettings>) => void;
  audioUrl: string | null;
  audioFileName: string | null;
  onAudioSelect: (fileOrUrl: File | string) => void;
  coverUrl: string | null;
  onCoverSelect: (file: File) => void;
  isServerRendering: boolean;
  serverProgress: number;
  serverStage: string;
  serverVideoUrl: string | null;
  serverError: string | null;
  onRenderClick: () => void;
  onOpenSunoModal: () => void;
  onSwitchToAutoMagic: () => void;
  onSwitchToPro: () => void;
  onSwitchToAdmin: () => void;
  onLoadDemoTrack: () => void;
  canvasNode: React.ReactNode;
}

export const CreatorLayer: React.FC<CreatorLayerProps> = ({
  settings,
  onUpdateSettings,
  audioUrl,
  audioFileName,
  onAudioSelect,
  coverUrl,
  onCoverSelect,
  isServerRendering,
  serverProgress,
  serverStage,
  serverVideoUrl,
  serverError,
  onRenderClick,
  onOpenSunoModal,
  onSwitchToAutoMagic,
  onSwitchToPro,
  onSwitchToAdmin,
  onLoadDemoTrack,
  canvasNode
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeLookId = CURATED_LOOKS.find(l => l.apply.mode === settings.mode)?.id || 'minimal';

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-app font-sans relative overflow-hidden">
      
      {/* Header Bar */}
      <header className="h-14 border-b border-border-subtle bg-panel/90 backdrop-blur px-4 lg:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-black shadow-md">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-content-primary">GlitchFramer</h1>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono border-accent/40 text-accent">
                CREATOR PRESETS
              </Badge>
            </div>
            <p className="text-[10px] text-content-secondary hidden sm:block">
              Hazır Şablonlar & Stil Kütüphanesi
            </p>
          </div>
        </div>

        {/* Tier Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border-subtle">
          <Button
            variant="ghost"
            size="xs"
            onClick={onSwitchToAutoMagic}
            className="text-[11px] text-content-tertiary hover:text-content-primary gap-1 px-2.5"
          >
            <Zap size={13} />
            <span>Otomatik</span>
          </Button>

          <Button
            variant="accent"
            size="xs"
            className="font-bold text-[11px] gap-1 px-2.5"
          >
            <Sparkles size={13} />
            <span>Creator</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={onSwitchToPro}
            className="text-[11px] text-content-tertiary hover:text-content-primary gap-1 px-2.5"
          >
            <Sliders size={13} />
            <span>Pro Studio</span>
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={onOpenSunoModal}
            className="gap-1.5 text-xs font-bold border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          >
            <Music size={13} />
            <span className="hidden sm:inline">Suno'dan İçe Aktar</span>
            <span className="sm:hidden">Suno</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onSwitchToAdmin}
            className="text-content-tertiary hover:text-content-primary"
            title="Yönetim Paneli (CMS)"
          >
            <Settings size={15} />
          </Button>
        </div>
      </header>

      {/* Main Creator Stage & Preset Manager */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Stage Preview */}
        <div className="flex-1 bg-app flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: settings.primaryColor || '#FFD700' }}
          />

          <div className="w-full max-w-5xl aspect-video rounded-xl shadow-elevation-3 border border-border-subtle bg-black overflow-hidden relative flex items-center justify-center">
            {canvasNode}
          </div>

          {/* Quick Aspect Ratio Toggles */}
          <div className="mt-4 flex items-center gap-2 bg-panel/80 backdrop-blur border border-border-subtle px-3 py-1.5 rounded-lg shadow-sm">
            <span className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">Format:</span>
            <Button
              variant={settings.aspectRatio === '16/9' ? 'accent' : 'ghost'}
              size="xs"
              onClick={() => onUpdateSettings({ aspectRatio: '16/9' })}
              className="text-[10px] font-mono px-2 py-0.5"
            >
              16:9 YouTube
            </Button>
            <Button
              variant={settings.aspectRatio === '9/16' ? 'accent' : 'ghost'}
              size="xs"
              onClick={() => onUpdateSettings({ aspectRatio: '9/16' })}
              className="text-[10px] font-mono px-2 py-0.5"
            >
              9:16 TikTok / Reels
            </Button>
            <Button
              variant={settings.aspectRatio === '1/1' ? 'accent' : 'ghost'}
              size="xs"
              onClick={() => onUpdateSettings({ aspectRatio: '1/1' })}
              className="text-[10px] font-mono px-2 py-0.5"
            >
              1:1 Instagram
            </Button>
          </div>
        </div>

        {/* Right Sidebar: Presets & Controls */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col shadow-elevation-2 z-10 overflow-hidden">
          
          {/* Audio & Media Select Header */}
          <div className="p-4 border-b border-border-subtle bg-surface/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-1.5">
                <Music size={14} className="text-accent" />
                Medya & Parça
              </span>
              <Button
                variant="ghost"
                size="xs"
                onClick={onOpenSunoModal}
                className="text-[10px] text-amber-400 hover:underline gap-1 p-0 h-auto"
              >
                + Suno AI Linki
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="audio/*"
                ref={audioInputRef}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onAudioSelect(f);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => audioInputRef.current?.click()}
                className="flex-1 text-xs font-bold gap-2 justify-start truncate"
              >
                <Music size={14} className="text-accent shrink-0" />
                <span className="truncate">{audioFileName || "Ses Dosyası Seç (.mp3, .wav)"}</span>
              </Button>

              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onCoverSelect(f);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                className="text-xs font-bold gap-1.5 shrink-0"
              >
                <ImageIcon size={14} />
                Kapak
              </Button>
            </div>
          </div>

          {/* Scrollable Presets Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-1.5">
                <LayoutGrid size={14} className="text-accent" />
                Hazır Şablonlar (Curated Looks)
              </span>
              <span className="text-[10px] text-content-secondary">{CURATED_LOOKS.length} Stil</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CURATED_LOOKS.map((look) => {
                const isSelected = activeLookId === look.id;
                return (
                  <Card
                    key={look.id}
                    onClick={() => onUpdateSettings(look.apply)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 relative overflow-hidden group",
                      isSelected 
                        ? "border-accent bg-accent/10 shadow-elevation-1" 
                        : "border-border-subtle bg-surface hover:bg-hover hover:border-border-strong"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-content-primary">{look.name}</span>
                      {isSelected && <Check size={14} className="text-accent" />}
                    </div>
                    <p className="text-[10px] text-content-secondary leading-snug">{look.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Bottom Export Bar */}
          <div className="p-4 border-t border-border-subtle bg-panel space-y-3 shrink-0">
            {isServerRendering ? (
              <div className="p-3 bg-surface border border-accent/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-accent">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Render Alınıyor...
                  </span>
                  <span>%{Math.round(serverProgress)}</span>
                </div>
                <div className="w-full h-2 bg-panel rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${serverProgress}%` }} />
                </div>
              </div>
            ) : serverVideoUrl ? (
              <a
                href={serverVideoUrl}
                download={`${settings.trackTitle || 'vidframer_export'}.mp4`}
                className="w-full inline-flex items-center justify-center rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 shadow-sm gap-2 transition-all cursor-pointer"
              >
                <Download size={16} /> MP4 İNDİR (60 FPS)
              </a>
            ) : (
              <Button
                variant="accent"
                size="default"
                onClick={onRenderClick}
                disabled={!audioUrl}
                className="w-full font-bold text-xs gap-2 py-3 justify-center shadow-md"
              >
                <Video size={16} fill="currentColor" />
                Şablonu Render Et (60 FPS MP4)
              </Button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
