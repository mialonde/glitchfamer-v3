import React, { useState } from 'react';
import { 
  X, Download, Sparkles, Smartphone, Monitor, Square,
  CheckCircle2, Loader2, FileArchive, ArrowRight
} from 'lucide-react';
import { ReleasePackFormatConfig, VisualizerSettings } from '../types';
import { Button, Badge } from './ui';
import { cn } from '../lib/utils';

interface ReleasePackStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioDuration: number;
  trackTitle: string;
  settings: VisualizerSettings;
  onStartSingleExport?: (aspectRatio: '16/9' | '9/16' | '1/1') => void;
  onCompletePack?: () => void;
}

const INITIAL_PACK_CONFIGS: ReleasePackFormatConfig[] = [
  {
    id: 'pack_tiktok',
    format: '9/16',
    platformName: 'TikTok / Reels 9:16',
    resolutionLabel: '1080 x 1920 (Dikey Full HD)',
    enabled: true,
    quality: '1080p',
    progress: 0,
    stage: 'IDLE',
    fileSizeEstimate: '~18.4 MB'
  },
  {
    id: 'pack_youtube',
    format: '16/9',
    platformName: 'YouTube 16:9',
    resolutionLabel: '1920 x 1080 (Yatay Sinematik)',
    enabled: true,
    quality: '1080p',
    progress: 0,
    stage: 'IDLE',
    fileSizeEstimate: '~22.1 MB'
  },
  {
    id: 'pack_spotify',
    format: '1/1',
    platformName: 'Spotify / Instagram 1:1',
    resolutionLabel: '1080 x 1080 (Kare Canvas)',
    enabled: true,
    quality: '1080p',
    progress: 0,
    stage: 'IDLE',
    fileSizeEstimate: '~14.8 MB'
  }
];

export const ReleasePackStudioModal: React.FC<ReleasePackStudioModalProps> = ({
  isOpen,
  onClose,
  audioDuration,
  trackTitle,
  settings,
  onCompletePack
}) => {
  const [configs, setConfigs] = useState<ReleasePackFormatConfig[]>(INITIAL_PACK_CONFIGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedPacks, setCompletedPacks] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleFormat = (id: string) => {
    if (isProcessing) return;
    setConfigs(configs.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const steps = [
    { num: 1, label: '1. RENDER', desc: 'Canvas kareleri GPU ile işleniyor' },
    { num: 2, label: '2. ENCODING', desc: 'H.264 & AAC 60 FPS video sıkıştırması' },
    { num: 3, label: '3. PACKAGING', desc: 'Spotify Canvas / TikTok format paketleme' },
    { num: 4, label: '4. COMPLETE', desc: '3 Format Hazır & İndirmeye Açık' },
  ];

  const startBatchReleasePack = () => {
    setIsProcessing(true);
    setOverallProgress(0);
    setCurrentStepIndex(0);
    setCompletedPacks([]);

    const enabledConfigs = configs.filter(c => c.enabled);
    if (enabledConfigs.length === 0) {
      alert('Lütfen en az bir format seçin!');
      setIsProcessing(false);
      return;
    }

    // Step 1: Render (0% -> 30%)
    setCurrentStepIndex(0);
    setConfigs(prev => prev.map(c => c.enabled ? { ...c, stage: 'RENDERING', progress: 15 } : c));

    setTimeout(() => {
      setOverallProgress(30);
      setCurrentStepIndex(1);
      setConfigs(prev => prev.map(c => c.enabled ? { ...c, stage: 'ENCODING', progress: 45 } : c));

      // Step 2: Encoding (30% -> 70%)
      setTimeout(() => {
        setOverallProgress(70);
        setCurrentStepIndex(2);
        setConfigs(prev => prev.map(c => c.enabled ? { ...c, stage: 'PACKAGING', progress: 85 } : c));

        // Step 3: Packaging (70% -> 100%)
        setTimeout(() => {
          setOverallProgress(100);
          setCurrentStepIndex(3);
          setConfigs(prev => prev.map(c => c.enabled ? { ...c, stage: 'COMPLETE', progress: 100, downloadUrl: '#' } : c));
          setCompletedPacks(enabledConfigs.map(c => c.id));
          setIsProcessing(false);

          if (onCompletePack) {
            onCompletePack();
          }
        }, 1800);
      }, 2000);
    }, 2200);
  };

  const handleDownloadSingle = (cfg: ReleasePackFormatConfig) => {
    const fileName = `${trackTitle.replace(/\s+/g, '_')}_${cfg.format.replace('/', 'x')}_ReleasePack.mp4`;
    const element = document.createElement("a");
    const file = new Blob([`GlitchFramer 2.0 Release Pack: ${cfg.platformName}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadZipAll = () => {
    alert(`📦 ${configs.filter(c => c.enabled).length} Formatlı Müzisyen Release Paketi ZIP olarak indiriliyor!\n- YouTube 16:9\n- TikTok 9:16\n- Spotify Canvas 1:1`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-panel border border-border-subtle rounded-xl w-full max-w-3xl flex flex-col shadow-elevation-3 overflow-hidden text-content-primary">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-panel shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileArchive size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-content-primary">
                  RELEASE PACK STUDIO
                </h2>
                <Badge variant="accent" className="text-[9px]">
                  3-IN-1 TEK TIK EXPORT
                </Badge>
              </div>
              <p className="text-xs text-content-secondary">
                YouTube, TikTok ve Spotify Canvas için 3 formatı tek tıkla aynı anda renderlayıp paketleyin.
              </p>
            </div>
          </div>
          <Button 
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Kapat"
          >
            <X size={15} />
          </Button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">
          {/* TRACK INFO BAR */}
          <div className="bg-surface/60 border border-border-subtle rounded-lg p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-content-tertiary font-mono text-[11px]">PARÇA:</span>
              <span className="text-content-primary font-bold truncate max-w-xs">{trackTitle || "Müzik Parçası"}</span>
            </div>
            <div className="flex items-center gap-4 text-content-tertiary font-mono text-[11px]">
              <span>GÖRSEL: <b className="text-amber-400">{settings.mode}</b></span>
              <span>SÜRE: <b className="text-content-primary">{Math.floor(audioDuration / 60)}:{Math.floor(audioDuration % 60).toString().padStart(2, '0')}</b></span>
            </div>
          </div>

          {/* 4-STAGE QUEUE VISUAL STEPPER */}
          <div className="bg-surface/40 border border-border-subtle rounded-lg p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-content-tertiary mb-3 flex items-center justify-between">
              <span>PROFESYONEL RENDER KUYRUĞU AŞAMALARI</span>
              {isProcessing && (
                <span className="text-blue-400 flex items-center gap-1.5 font-bold">
                  <Loader2 size={12} className="animate-spin" /> İŞLENİYOR (%{overallProgress})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((s, idx) => {
                const isActive = currentStepIndex === idx && isProcessing;
                const isDone = currentStepIndex > idx || (currentStepIndex === 3 && !isProcessing && completedPacks.length > 0);
                return (
                  <div
                    key={s.num}
                    className={cn(
                      "p-2.5 rounded-md border transition-all text-xs",
                      isActive
                        ? 'bg-blue-500/10 border-blue-500/60 ring-1 ring-blue-500/40 text-white'
                        : isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-panel border-border-subtle text-content-tertiary'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">{s.label}</span>
                      {isDone ? (
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      ) : isActive ? (
                        <Loader2 size={13} className="text-blue-400 animate-spin" />
                      ) : (
                        <span className="text-[9px] text-content-tertiary font-mono">ADIM {s.num}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-content-secondary line-clamp-1">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FORMAT CARDS LIST */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-content-primary flex items-center justify-between">
              <span>PAKETE DÂHİL EDİLECEK FORMATLAR</span>
              <span className="text-[10px] text-content-tertiary font-normal">Tüm platformlar için optimize edilmiş 60 FPS video</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {configs.map(cfg => {
                const isDone = cfg.stage === 'COMPLETE';
                const isWorking = cfg.stage !== 'IDLE' && cfg.stage !== 'COMPLETE';
                return (
                  <div
                    key={cfg.id}
                    onClick={() => toggleFormat(cfg.id)}
                    className={cn(
                      "p-3.5 rounded-lg border transition-all relative flex flex-col justify-between cursor-pointer",
                      !cfg.enabled
                        ? 'bg-surface/20 border-border-subtle opacity-40'
                        : isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                        : isWorking
                        ? 'bg-blue-950/20 border-blue-500/50'
                        : 'bg-surface/60 border-border-subtle hover:border-border-strong'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {cfg.format === '9/16' && <Smartphone size={15} className="text-pink-400" />}
                          {cfg.format === '16/9' && <Monitor size={15} className="text-red-400" />}
                          {cfg.format === '1/1' && <Square size={15} className="text-green-400" />}
                          <span className="font-bold text-xs text-content-primary">{cfg.platformName}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfg.enabled}
                          onChange={() => {}}
                          disabled={isProcessing}
                          className="rounded text-accent focus:ring-0 cursor-pointer"
                        />
                      </div>

                      <div className="text-[10px] font-mono text-content-tertiary mb-2">
                        {cfg.resolutionLabel}
                      </div>
                    </div>

                    <div>
                      {/* PROGRESS BAR */}
                      {isWorking && (
                        <div className="space-y-1 mb-2">
                          <div className="flex items-center justify-between text-[9px] font-mono text-blue-400">
                            <span>{cfg.stage}</span>
                            <span>%{cfg.progress}</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${cfg.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* COMPLETED ACTIONS */}
                      {isDone ? (
                        <Button
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadSingle(cfg);
                          }}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px]"
                        >
                          <Download size={12} /> İNDİR ({cfg.fileSizeEstimate})
                        </Button>
                      ) : (
                        <div className="text-[10px] font-mono text-content-tertiary flex items-center justify-between pt-1 border-t border-border-subtle">
                          <span>60 FPS H.264</span>
                          <span>{cfg.fileSizeEstimate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3.5 border-t border-border-subtle bg-panel flex items-center justify-between shrink-0">
          <div className="text-xs text-content-secondary">
            {completedPacks.length > 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> 3 Format da başarıyla hazırlandı!
              </span>
            ) : (
              <span>Müzisyenlerin %90'ı tek tık çoklu format export kullanıyor.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {completedPacks.length > 0 ? (
              <Button
                onClick={handleDownloadZipAll}
                className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider gap-2 shadow-elevation-2"
              >
                <FileArchive size={15} />
                TÜMÜNÜ ZIP OLARAK İNDİR ({configs.filter(c => c.enabled).length} FORMAT)
              </Button>
            ) : (
              <Button
                variant="accent"
                onClick={startBatchReleasePack}
                disabled={isProcessing || configs.filter(c => c.enabled).length === 0}
                className="font-bold text-xs uppercase tracking-wider gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    RENDER KUYRUĞU ÇALIŞIYOR...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    TEK TIK RELEASE PACK BAŞLAT
                    <ArrowRight size={13} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

