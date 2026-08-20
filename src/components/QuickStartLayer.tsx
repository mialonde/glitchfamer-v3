import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Play, Sliders, ChevronRight, Music, Image as ImageIcon, Video, Download, Loader2, Settings } from 'lucide-react';
import { VisualizerSettings } from '../types';
import { Button, Badge, Card } from './ui';
import { cn } from '../lib/utils';

export const CURATED_LOOKS = [
  {
    id: 'minimal',
    name: 'Minimal Release',
    desc: 'Temiz, zarif dairesel spektrum. Klasik.',
    apply: { mode: 'CIRCULAR_AURA_SPECTRUM', primaryColor: '#FAFAFA', bloomIntensity: 0.1, cameraShake: 0, glitchIntensity: 0, audioReactivity: 0.5 }
  },
  {
    id: 'concert',
    name: 'Concert Energy',
    desc: 'Yüksek ritim, lazerler ve kamera sarsıntısı.',
    apply: { mode: 'NEON_TUNNEL', primaryColor: '#E11D48', bloomIntensity: 0.8, cameraShake: 0.25, glitchIntensity: 0, audioReactivity: 0.8 }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Grid',
    desc: '80ler retro-fütüristik 3D tel kafes grid.',
    apply: { mode: 'SYNTHWAVE_GRID_3D', primaryColor: '#00F0FF', bloomIntensity: 0.6, cameraShake: 0.05, glitchIntensity: 0.1, audioReactivity: 0.6 }
  },
  {
    id: 'liquid',
    name: 'Ambient Liquid',
    desc: 'Akışkan, organik sıvı metal reaksiyonu.',
    apply: { mode: 'FLUID_METABALL', primaryColor: '#C084FC', bloomIntensity: 0.4, cameraShake: 0, glitchIntensity: 0, audioReactivity: 0.7 }
  },
  {
    id: 'noir',
    name: 'Noir Vocalist',
    desc: 'Siyah beyaz, sese duyarlı silüet vokal.',
    apply: { mode: 'NOIR_SINGING_HEAD', primaryColor: '#FFFFFF', bloomIntensity: 0.1, cameraShake: 0.05, glitchIntensity: 0, audioReactivity: 0.4 }
  },
  {
    id: 'cinematic',
    name: 'Cinematic Orb',
    desc: 'Ağır, yavaş atan sinematik enerji küresi.',
    apply: { mode: 'NEURAL_BLOOM', primaryColor: '#E8590C', bloomIntensity: 0.7, cameraShake: 0, glitchIntensity: 0, audioReactivity: 0.3 }
  }
];

interface QuickStartLayerProps {
  settings: VisualizerSettings;
  onUpdateSettings: (s: Partial<VisualizerSettings>) => void;
  audioUrl: string | null;
  onAudioSelect: (url: string | null) => void;
  coverUrl: string | null;
  onCoverSelect: (url: string | null) => void;
  isServerRendering: boolean;
  serverProgress: number;
  serverStage: string;
  serverVideoUrl: string | null;
  serverError: string | null;
  onRenderClick: () => void;
  onAdvancedClick: () => void;
  onAdminClick: () => void;
  canvasNode: React.ReactNode;
}

export const QuickStartLayer: React.FC<QuickStartLayerProps> = ({
  settings,
  onUpdateSettings,
  audioUrl,
  onAudioSelect,
  coverUrl,
  onCoverSelect,
  isServerRendering,
  serverProgress,
  serverStage,
  serverVideoUrl,
  serverError,
  onRenderClick,
  onAdvancedClick,
  onAdminClick,
  canvasNode
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Derive which curated look is active (rough match)
  const activeLookId = CURATED_LOOKS.find(l => l.apply.mode === settings.mode)?.id || 'minimal';

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full h-full font-sans">
      
      {/* Sol Panel (Önizleme Sahnesi) */}
      <div className="flex-none h-[50vh] lg:h-auto lg:flex-1 bg-app flex flex-col relative shrink-0">
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: settings.primaryColor }}
          />

          <div className="w-full max-w-4xl aspect-video rounded-lg shadow-elevation-3 border border-border-subtle bg-black overflow-hidden relative flex items-center justify-center z-10">
            {canvasNode}
          </div>

        </div>
      </div>

      {/* Sağ Panel (Kontroller): Header + Sabit Hızlı Render + Ayarlar */}
      <div className="w-full lg:w-[440px] xl:w-[500px] bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col shadow-elevation-2 z-10 flex-1 lg:flex-none min-h-0">
        
        {/* 1. ÜST BAŞLIK (GlitchFramer - Hızlı Başlat) */}
        <div className="p-4 lg:p-6 pb-4 flex items-center justify-between shrink-0 border-b border-border-subtle/50">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-content-primary">GlitchFramer</h1>
            <p className="text-xs text-content-secondary mt-0.5">Hızlı Başlat</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="xs"
              onClick={onAdminClick}
              className="gap-1.5 text-xs text-content-tertiary hover:text-content-primary"
              title="Yönetim Paneli"
            >
              <Settings size={14} />
              <span>Yönetim</span>
            </Button>
            <div className="w-px h-4 bg-border-subtle" />
            <Button 
              variant="ghost"
              size="xs"
              onClick={onAdvancedClick}
              className="gap-1.5 text-xs text-content-tertiary hover:text-content-primary"
            >
              <Sliders size={14} />
              <span>Stüdyo Modu</span>
            </Button>
          </div>
        </div>

        {/* 2. BAŞLIK ALTINA SABİTLENEN HIZLI RENDER BÖLÜMÜ (PINNED QUICK RENDER) */}
        <div className="p-4 lg:px-6 bg-surface/70 border-b border-border-subtle shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-1.5">
              <Video size={13} className="text-accent" />
              Hızlı Render
            </span>
            <span className="text-[10px] text-content-secondary">
              60 FPS • MP4 Çıktı
            </span>
          </div>

          {/* Render Durumları */}
          {isServerRendering ? (
            <div className="flex flex-col gap-2.5 bg-panel border border-accent/40 rounded-lg p-3 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Render Alınıyor...</span>
                </div>
                <span className="text-xs font-mono font-bold text-content-primary">%{Math.round(serverProgress)}</span>
              </div>
              
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border-subtle">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.max(5, serverProgress)}%` }}
                />
              </div>

              <span className="text-[11px] text-content-secondary truncate">{serverStage}</span>
            </div>
          ) : serverVideoUrl ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <a
                href={serverVideoUrl}
                download={`${settings.trackTitle || 'vidframer_export'}.mp4`}
                className="flex-1 inline-flex items-center justify-center rounded-lg text-xs font-bold bg-green-600 hover:bg-green-500 text-white py-2.5 px-4 shadow-sm gap-2 transition-colors cursor-pointer"
              >
                <Download size={15} />
                MP4 İNDİR
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={onRenderClick}
                className="text-xs"
              >
                Yeniden Render
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                variant="accent"
                size="default"
                onClick={onRenderClick}
                disabled={!audioUrl}
                className="w-full gap-2 py-2.5 shadow-md text-xs font-bold justify-center"
              >
                <Video size={16} fill="currentColor" />
                Hızlı Render (MP4)
              </Button>
              
              {serverError && (
                <div className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2.5 py-1.5">
                  {serverError}
                </div>
              )}

              <p className="text-[10px] text-content-secondary leading-tight text-center">
                {audioUrl 
                  ? "Önizleme 60fps'tir. Render sırasında tam kalitede işlenecektir." 
                  : "Render alabilmek için önce bir ses dosyası seçin."}
              </p>
            </div>
          )}
        </div>

        {/* 3. KAYDIRILABİLİR KONTROL ADIMLARI (Medya & Stil) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
          
          {/* Adım 1: Medya */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-2">
              <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-[10px]">1</Badge>
              Medya Yükle
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => audioInputRef.current?.click()}
                className={cn(
                  "w-full p-4 rounded-lg border border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer",
                  audioUrl ? "border-accent/40 bg-accent/5" : "border-border-strong bg-surface hover:bg-hover hover:border-accent/30"
                )}
              >
                <Music size={20} className={audioUrl ? "text-accent" : "text-content-tertiary"} />
                <div className="text-xs font-bold text-content-primary">
                  {audioUrl ? "Ses Yüklendi" : "Ses Dosyası Seç (.mp3, .wav)"}
                </div>
                <div className="text-[10px] text-content-secondary">
                  {audioUrl ? "Değiştirmek için tıkla" : "Sürükle ve bırak veya tıkla"}
                </div>
              </button>
              <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) onAudioSelect(URL.createObjectURL(file));
              }} />

              <button 
                onClick={() => coverInputRef.current?.click()}
                className="w-full p-3 rounded-lg border border-border-subtle bg-surface hover:bg-hover hover:border-border-strong transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-panel border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                  {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-content-tertiary" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-content-primary">Kapak Fotoğrafı</div>
                  <div className="text-[10px] text-content-secondary">{coverUrl ? "Değiştir" : "İsteğe bağlı"}</div>
                </div>
              </button>
              <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) onCoverSelect(URL.createObjectURL(file));
              }} />
            </div>
          </section>

          {/* Adım 2: Stil Seçimi */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-2">
              <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-[10px]">2</Badge>
              Görsel His (Look)
            </h2>
            
            <div className="grid grid-cols-2 gap-2.5">
              {CURATED_LOOKS.map(look => {
                const isSelected = activeLookId === look.id;
                return (
                  <Card
                    key={look.id}
                    onClick={() => onUpdateSettings(look.apply)}
                    className={cn(
                      "text-left p-3.5 rounded-lg border transition-all relative overflow-hidden flex flex-col gap-1 cursor-pointer",
                      isSelected 
                        ? "border-accent bg-accent/10 shadow-md" 
                        : "border-border-subtle bg-surface hover:bg-hover hover:border-border-strong"
                    )}
                  >
                    <div className="text-xs font-bold text-content-primary leading-tight">{look.name}</div>
                    <div className="text-[10px] text-content-secondary leading-snug">{look.desc}</div>
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent/20 to-transparent pointer-events-none" />
                    )}
                  </Card>
                )
              })}
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};

