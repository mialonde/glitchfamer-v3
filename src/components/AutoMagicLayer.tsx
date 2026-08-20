import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Upload, Video, Download, Sparkles, Music, Sliders, 
  Settings, Loader2, Play, Pause, CheckCircle2, RefreshCw,
  FolderOpen, Layers, ArrowRight, ShieldCheck
} from 'lucide-react';
import { VisualizerSettings } from '../types';
import { Button, Badge, Card } from './ui';
import { analyzeAudioBuffer, AudioAnalysisProfile } from '../utils/audioAnalyzer';
import { cn } from '../lib/utils';

interface AutoMagicLayerProps {
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
  onOpenReleasePackModal: () => void;
  onSwitchToCreator: () => void;
  onSwitchToPro: () => void;
  onSwitchToAdmin: () => void;
  onLoadDemoTrack: () => void;
  canvasNode: React.ReactNode;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const AutoMagicLayer: React.FC<AutoMagicLayerProps> = ({
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
  onOpenReleasePackModal,
  onSwitchToCreator,
  onSwitchToPro,
  onSwitchToAdmin,
  onLoadDemoTrack,
  canvasNode,
  isPlaying,
  onTogglePlay
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisProfile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto Analysis Trigger when new audio file is uploaded
  const handleAudioFileChange = async (file: File) => {
    onAudioSelect(file);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const profile = await analyzeAudioBuffer(file);
      setAnalysisResult(profile);
      // Auto-apply recommended settings immediately!
      onUpdateSettings({
        ...profile.recommendedSettings,
        trackTitle: file.name.replace(/\.[^/.]+$/, "")
      });
    } catch (err) {
      console.warn("Auto magic analysis warning:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        handleAudioFileChange(file);
      }
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col w-full h-full bg-app font-sans relative overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag Over Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-accent p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent mb-4 animate-bounce">
              <Zap size={40} />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              SES DOSYASINI BURAYA BIRAKIN
            </h2>
            <p className="text-sm text-content-secondary mt-2 max-w-md">
              Sistem şarkınızı anında analiz edip temposunu, enerjisini ve ritmini ölçecek ve en uygun görselleştiriciyi otomatik uygulayacaktır.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="h-14 border-b border-border-subtle bg-panel/90 backdrop-blur px-4 lg:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-black shadow-md">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-content-primary">GlitchFramer</h1>
              <Badge variant="accent" className="text-[9px] px-1.5 py-0 font-mono">
                OTOMATİK (1-TIK)
              </Badge>
            </div>
            <p className="text-[10px] text-content-secondary hidden sm:block">
              Sesi bırakın • Temponuz analiz edilsin • Anında dışa aktarın
            </p>
          </div>
        </div>

        {/* Tier Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border-subtle">
          <Button
            variant="accent"
            size="xs"
            className="font-bold text-[11px] gap-1 px-2.5"
          >
            <Zap size={13} />
            <span>Otomatik</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={onSwitchToCreator}
            className="text-[11px] text-content-tertiary hover:text-content-primary gap-1 px-2.5"
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left / Center Canvas Preview Stage */}
        <div className="flex-1 bg-app flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-[120px] pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: settings.primaryColor || '#FFD700' }}
          />

          {/* Video / Canvas Window */}
          <div className="w-full max-w-5xl aspect-video rounded-xl shadow-elevation-3 border border-border-subtle bg-black overflow-hidden relative flex items-center justify-center group">
            {canvasNode}

            {/* Play/Pause Overlay Control */}
            {audioUrl && (
              <button
                onClick={onTogglePlay}
                className="absolute bottom-4 left-4 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100"
                title={isPlaying ? "Durdur" : "Oynat"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
            )}
          </div>

          {/* Quick Stats or Status Overlay */}
          {isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-2.5 rounded-lg bg-surface/90 border border-accent/40 text-accent flex items-center gap-3 shadow-lg"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="text-xs font-mono font-bold">
                ⚡ TEMPO VE ENERJİ ANALİZ EDİLİYOR... ŞABLON UYGULANIYOR
              </div>
            </motion.div>
          ) : analysisResult ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-2 rounded-lg bg-surface/90 border border-emerald-500/30 text-content-primary flex flex-wrap items-center justify-center gap-3 text-xs font-mono shadow-md"
            >
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 size={13} />
                Analiz Tamamlandı:
              </span>
              <span className="text-content-secondary">
                BPM: <strong className="text-content-primary">{analysisResult.bpm}</strong>
              </span>
              <span className="text-content-tertiary">•</span>
              <span className="text-content-secondary">
                Enerji: <strong className="text-content-primary">%{Math.round(analysisResult.energy * 100)}</strong> ({analysisResult.energyLabel})
              </span>
              <span className="text-content-tertiary">•</span>
              <span className="text-content-secondary">
                Önerilen Stil: <strong className="text-accent">{analysisResult.genreLabel}</strong>
              </span>
            </motion.div>
          ) : null}
        </div>

        {/* Right Action Panel (Simple, One-Click Centric) */}
        <div className="w-full lg:w-[400px] xl:w-[440px] bg-panel border-t lg:border-t-0 lg:border-l border-border-subtle p-6 flex flex-col justify-between shrink-0 shadow-elevation-2 z-10 overflow-y-auto">
          
          <div className="space-y-6">
            
            {/* Audio State / Dropper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary flex items-center gap-1.5">
                  <Music size={14} className="text-accent" />
                  Ses Parçası
                </span>
                {audioUrl && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => audioInputRef.current?.click()}
                    className="text-[10px] text-accent hover:underline p-0 h-auto"
                  >
                    Değiştir
                  </Button>
                )}
              </div>

              <input 
                type="file" 
                accept="audio/*" 
                ref={audioInputRef} 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAudioFileChange(f);
                  e.target.value = '';
                }} 
              />

              {audioUrl ? (
                <div className="p-4 rounded-xl bg-surface border border-accent/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 text-accent flex items-center justify-center shrink-0">
                    <Music size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-content-primary truncate">
                      {settings.trackTitle || audioFileName || 'Ses Parçası Yüklendi'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <Sparkles size={11} />
                      Otomatik Görselleştirici Uygulandı
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-border-strong bg-surface hover:bg-hover hover:border-accent/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={22} />
                    </div>
                    <div className="text-xs font-bold text-content-primary">
                      Ses Dosyası Bırakın veya Seçin
                    </div>
                    <div className="text-[10px] text-content-secondary">
                      .MP3, .WAV, .FLAC, .OGG
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenSunoModal}
                      className="text-xs font-bold gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 justify-center"
                    >
                      <Music size={13} />
                      Suno AI Bağlantısı
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLoadDemoTrack}
                      className="text-xs font-bold gap-1.5 justify-center"
                    >
                      <Zap size={13} className="text-accent" />
                      Demo Müzik Yükle
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Cover Art Option */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
                  Kapak Fotoğrafı (İsteğe Bağlı)
                </span>
                {coverUrl && (
                  <span className="text-[10px] text-emerald-400 font-mono">Yüklendi</span>
                )}
              </div>

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

              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-full p-3 rounded-lg border border-border-subtle bg-surface hover:bg-hover transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-md bg-panel border border-border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <FolderOpen size={16} className="text-content-tertiary" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-bold text-content-primary">
                    {coverUrl ? "Kapak Resmini Değiştir" : "Görsel veya Logo Ekle"}
                  </div>
                  <div className="text-[10px] text-content-secondary">
                    Otomatik şablona kapak görseli yerleştirir
                  </div>
                </div>
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-surface/60 border border-border-subtle space-y-2">
              <div className="text-xs font-bold text-content-primary flex items-center justify-between">
                <span>Görselleştirici Modu:</span>
                <Badge variant="accent" className="font-mono text-[10px]">
                  {settings.mode.replace(/_/g, ' ')}
                </Badge>
              </div>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                Şarkınızın ritmine ve frekans spektrumuna en uygun görsel motor, kamera sarsıntısı ve renk paleti arka planda eşlendi.
              </p>
            </div>

          </div>

          {/* Bottom Massive Glowing Export Section */}
          <div className="space-y-3 pt-6 border-t border-border-subtle">
            
            {isServerRendering ? (
              <div className="flex flex-col gap-3 bg-panel border border-accent/50 rounded-xl p-4 shadow-elevation-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    <span className="text-xs font-black text-accent uppercase tracking-wider">
                      VİDEO RENDER ALINIYOR...
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-content-primary">
                    %{Math.round(serverProgress)}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border-subtle">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.max(5, serverProgress)}%` }}
                  />
                </div>

                <span className="text-[11px] text-content-secondary truncate">
                  {serverStage}
                </span>
              </div>
            ) : serverVideoUrl ? (
              <div className="space-y-2">
                <a
                  href={serverVideoUrl}
                  download={`${settings.trackTitle || 'vidframer_export'}.mp4`}
                  className="w-full inline-flex items-center justify-center rounded-xl text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 shadow-elevation-2 gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Download size={20} />
                  MP4 VİDEOYU İNDİR (60 FPS)
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenReleasePackModal}
                    className="text-xs font-bold gap-1 justify-center"
                  >
                    <Layers size={13} />
                    Release Pack Kit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRenderClick}
                    className="text-xs justify-center"
                  >
                    Yeniden Render
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Massive Glowing Export Button */}
                <button
                  onClick={onRenderClick}
                  disabled={!audioUrl}
                  className={cn(
                    "w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-elevation-3 relative overflow-hidden",
                    audioUrl 
                      ? "bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse hover:animate-none transform hover:scale-[1.02]" 
                      : "bg-surface text-content-tertiary border border-border-subtle cursor-not-allowed"
                  )}
                >
                  <Video size={20} className="fill-current" />
                  <span>DIŞA AKTAR (60 FPS MP4 VİDEO)</span>
                </button>

                {serverError && (
                  <div className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5">
                    {serverError}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-content-tertiary px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" /> 60 FPS • Full HD
                  </span>
                  <button
                    onClick={onSwitchToPro}
                    className="text-content-secondary hover:text-accent font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    İnce Ayarlar (Stüdyo) <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
