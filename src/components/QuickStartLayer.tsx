import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Play, Sliders, ChevronRight, Music, Image as ImageIcon, Video, Download, Loader2, Settings } from 'lucide-react';
import { VisualizerSettings } from '../types';
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
      
      {/* Sol Panel (Önizleme): Adım 3 (Önizleme & Render) */}
      <div className="flex-none h-[50vh] lg:h-auto lg:flex-1 bg-app flex flex-col relative shrink-0">
        <div className="flex-1 flex items-center justify-center p-4 lg:p-16 relative">
          
          {/* Subtle Backglow from primary color */}
          <div 
            className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: settings.primaryColor }}
          />

          <div className="w-full max-w-4xl aspect-video rounded-lg shadow-elevation-3 border border-border-subtle bg-black overflow-hidden relative flex items-center justify-center z-10">
            {canvasNode}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 lg:p-8 border-t border-border-subtle bg-app/80 backdrop-blur flex flex-col sm:flex-row justify-between items-center gap-4 z-20 shrink-0">
          <div className="text-xs sm:text-sm text-content-secondary text-center sm:text-left">
            Önizleme kalitesi düşüktür (60fps). Render sırasında tam kalite işlenecektir.
          </div>
          
          <div className="flex items-center gap-4">
            {isServerRendering ? (
              <div className="flex items-center gap-4 bg-surface border border-accent/30 rounded-md px-6 py-2 shadow-elevation-1">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">RENDER ALINIYOR...</span>
                  <span className="text-xs text-content-secondary">{serverStage} ({Math.round(serverProgress)}%)</span>
                </div>
                <div className="w-32 h-1.5 bg-panel rounded-full overflow-hidden ml-2 border border-border-subtle">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${serverProgress}%` }}
                  />
                </div>
              </div>
            ) : serverVideoUrl ? (
              <div className="flex items-center gap-3">
                <a
                  href={serverVideoUrl}
                  download={`${settings.trackTitle || 'vidframer_export'}.mp4`}
                  className="bg-green-600 hover:bg-green-500 text-white px-8 py-3.5 rounded-md font-medium shadow-elevation-2 flex items-center gap-2 transition-colors"
                >
                  <Download size={18} />
                  MP4 İNDİR
                </a>
                <button
                  onClick={onRenderClick}
                  className="bg-surface hover:bg-hover border border-border-strong text-content-primary px-4 py-3.5 rounded-md font-medium transition-colors"
                >
                  YENİDEN RENDER ET
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRenderClick}
                disabled={!audioUrl}
                className="bg-accent hover:bg-accent-hover text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3.5 rounded-md font-medium shadow-elevation-2 flex items-center gap-2 transition-colors"
              >
                <Video size={18} fill="currentColor" />
                Hızlı Render (MP4)
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Sağ Panel (Kontroller): Adım 1 & 2 (Kontroller) */}
      <div className="w-full lg:w-[440px] xl:w-[500px] bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col shadow-elevation-2 z-10 flex-1 lg:flex-none min-h-0">
        <div className="p-4 lg:p-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-medium tracking-tight text-content-primary">GlitchFramer</h1>
            <p className="text-sm text-content-secondary mt-1">Hızlı Başlat</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onAdminClick}
              className="flex items-center gap-1.5 text-xs font-medium text-content-tertiary hover:text-content-primary transition-colors"
              title="Yönetim Paneli"
            >
              <Settings size={14} />
              Yönetim Paneli
            </button>
            <div className="w-px h-4 bg-border-strong" />
            <button 
              onClick={onAdvancedClick}
              className="flex items-center gap-1.5 text-xs font-medium text-content-tertiary hover:text-content-primary transition-colors"
            >
              <Sliders size={14} />
              Stüdyo Modu
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 pt-4 space-y-10">
          
          {/* Adım 1: Medya */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-surface border border-border-strong flex items-center justify-center text-[10px] text-content-secondary">1</span>
              Medya Yükle
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => audioInputRef.current?.click()}
                className={cn(
                  "w-full p-4 rounded-md border border-dashed transition-all flex flex-col items-center justify-center gap-2",
                  audioUrl ? "border-accent/30 bg-accent/5" : "border-border-strong bg-surface hover:bg-hover hover:border-border-subtle"
                )}
              >
                <Music size={20} className={audioUrl ? "text-accent" : "text-content-tertiary"} />
                <div className="text-sm font-medium text-content-primary">
                  {audioUrl ? "Ses Yüklendi" : "Ses Dosyası Seç (.mp3, .wav)"}
                </div>
                <div className="text-xs text-content-secondary">
                  {audioUrl ? "Değiştirmek için tıkla" : "Sürükle ve bırak veya tıkla"}
                </div>
              </button>
              <input type="file" accept="audio/*" ref={audioInputRef} className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) onAudioSelect(URL.createObjectURL(file));
              }} />

              <button 
                onClick={() => coverInputRef.current?.click()}
                className="w-full p-3 rounded-md border border-border-strong bg-surface hover:bg-hover hover:border-border-subtle transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded bg-panel border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                  {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-content-tertiary" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-content-primary">Kapak Fotoğrafı</div>
                  <div className="text-xs text-content-secondary">{coverUrl ? "Değiştir" : "İsteğe bağlı"}</div>
                </div>
              </button>
              <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (file) onCoverSelect(URL.createObjectURL(file));
              }} />
            </div>
          </section>

          {/* Adım 2: Stil Seçimi */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-surface border border-border-strong flex items-center justify-center text-[10px] text-content-secondary">2</span>
              Görsel His (Look)
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {CURATED_LOOKS.map(look => {
                const isSelected = activeLookId === look.id;
                return (
                  <button
                    key={look.id}
                    onClick={() => onUpdateSettings(look.apply)}
                    className={cn(
                      "text-left p-3 rounded-md border transition-all relative overflow-hidden flex flex-col gap-1.5",
                      isSelected 
                        ? "border-accent bg-accent/10 shadow-elevation-1" 
                        : "border-border-strong bg-surface hover:bg-hover hover:border-border-subtle"
                    )}
                  >
                    <div className="text-sm font-medium text-content-primary leading-tight">{look.name}</div>
                    <div className="text-xs text-content-secondary leading-snug">{look.desc}</div>
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-accent/20 to-transparent pointer-events-none" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};
