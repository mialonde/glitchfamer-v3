import React, { useState } from 'react';
import { 
  Sparkles, X, Check, Play, ChevronRight 
} from 'lucide-react';
import { MusicGenreTemplate, VisualizerSettings } from '../types';
import { MUSIC_GENRE_TEMPLATES } from '../lib/creatorTemplatesData';
import { Button, Badge } from './ui';
import { cn } from '../lib/utils';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: VisualizerSettings;
  onApplyTemplate: (template: MusicGenreTemplate) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplyTemplate
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    MUSIC_GENRE_TEMPLATES[0]?.id || ''
  );
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  if (!isOpen) return null;

  // Custom filters based on genre categories
  const filteredTemplates = MUSIC_GENRE_TEMPLATES.filter(t => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DARK') {
      const g = t.genre.toLowerCase();
      return g.includes('phonk') || g.includes('metal') || g.includes('trap') || g.includes('drill');
    }
    if (activeFilter === 'CYBER') {
      const g = t.genre.toLowerCase();
      return g.includes('techno') || g.includes('space') || g.includes('synthwave') || g.includes('edm') || g.includes('trance');
    }
    if (activeFilter === 'CHILL') {
      const g = t.genre.toLowerCase();
      return g.includes('ambient') || g.includes('chill') || g.includes('indie') || g.includes('jazz') || g.includes('lo-fi') || g.includes('organic');
    }
    return true;
  });

  const handleApply = (tpl: MusicGenreTemplate) => {
    onApplyTemplate(tpl);
    onClose();
  };

  const handleShowMore = () => {
    setVisibleCount(24);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="preset-picker-container"
        className="bg-panel border border-border-subtle rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-elevation-3 overflow-hidden text-content-primary"
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-panel shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-content-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              SELECT A PRESET FOR YOUR VIDEO
            </h2>
            <p className="text-xs text-content-secondary">
              Görselleştirici, renk paleti, 60 FPS filtreler, font ve sinematik arka planı tek tıkla yükleyin.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={15} />
          </Button>
        </div>

        {/* GENRE/STYLE FILTER PILLS */}
        <div className="px-6 py-2.5 bg-surface/50 border-b border-border-subtle flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar shrink-0">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'TÜM PRESETLER' },
              { id: 'DARK', label: 'DARK & BASS' },
              { id: 'CYBER', label: 'CYBER & TECHNO' },
              { id: 'CHILL', label: 'AMBIENT & CHILL' },
            ].map(f => (
              <Button
                key={f.id}
                size="xs"
                variant={activeFilter === f.id ? "amber" : "secondary"}
                onClick={() => {
                  setActiveFilter(f.id);
                  setVisibleCount(f.id === 'ALL' ? 12 : 24);
                }}
                className={cn(
                  "font-bold text-[10px]",
                  activeFilter === f.id && "shadow-sm"
                )}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="text-[10px] text-content-tertiary font-mono hidden md:block">
            Sistem: {filteredTemplates.length} Hazır Stüdyo Kombinasyonu
          </div>
        </div>

        {/* MODAL GRID BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTemplates.slice(0, visibleCount).map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              
              const renderVisualizerGraphic = (mode: string) => {
                if (mode.includes('CIRCULAR') || mode.includes('RING') || mode.includes('POLAR')) {
                  return (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:scale-110 group-hover:opacity-65 transition-all duration-300">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-white animate-[spin_12s_linear_infinite]" />
                      <div className="w-10 h-10 rounded-full border border-white absolute animate-ping" />
                      <div className="w-4 h-4 rounded-full bg-white/20 absolute" />
                    </div>
                  );
                }
                if (mode.includes('GRID') || mode.includes('TUNNEL')) {
                  return (
                    <div className="absolute inset-0 flex flex-col justify-center gap-1 opacity-25 group-hover:opacity-50 transition-all duration-300 px-6">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12" />
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 scale-x-75" />
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12 scale-x-50" />
                    </div>
                  );
                }
                return (
                  <div className="absolute inset-0 flex items-end justify-center gap-0.5 px-6 pb-8 opacity-40 group-hover:opacity-65 transition-all duration-300">
                    <div className="w-1 bg-white h-8 rounded-t" />
                    <div className="w-1 bg-white h-12 rounded-t" />
                    <div className="w-1 bg-white h-6 rounded-t" />
                    <div className="w-1 bg-white h-16 rounded-t animate-pulse" />
                    <div className="w-1 bg-white h-10 rounded-t" />
                    <div className="w-1 bg-white h-14 rounded-t" />
                    <div className="w-1 bg-white h-5 rounded-t" />
                  </div>
                );
              };

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    handleApply(tpl);
                  }}
                  className={cn(
                    "group relative flex flex-col aspect-[16/10] rounded-lg overflow-hidden border cursor-pointer bg-surface/40 transition-all duration-200 hover:scale-[1.02]",
                    isSelected 
                      ? 'border-amber-400 ring-1 ring-amber-400/50 shadow-elevation-2' 
                      : 'border-border-subtle hover:border-border-strong'
                  )}
                >
                  {/* PREVIEW BACKGROUND IMAGE */}
                  <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                       style={{ backgroundImage: `url(${tpl.thumbnail})` }} />

                  {/* VIGNETTE GRADIENT LAYER */}
                  <div className="absolute inset-0 z-1 bg-gradient-to-t from-panel/95 via-panel/30 to-black/40 group-hover:from-panel/100 transition-all duration-200" />

                  {/* VISUALIZER SIMULATED GRAPHIC OVERLAY */}
                  <div className="absolute inset-0 z-2">
                    {renderVisualizerGraphic(tpl.settings.mode || '')}
                  </div>

                  {/* TOP BADGE */}
                  {tpl.badge && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Badge variant={tpl.badge === 'NEW' ? "destructive" : "accent"} className="text-[9px]">
                        {tpl.badge}
                      </Badge>
                    </div>
                  )}

                  {/* CARD FOOTER CONTENT */}
                  <div className="absolute bottom-0 inset-x-0 p-3.5 z-10 flex items-end justify-between gap-2 bg-gradient-to-t from-panel via-panel/80 to-transparent pt-6">
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors truncate">
                        {tpl.name}
                      </h3>
                      <span className="text-[10px] text-content-tertiary truncate">
                        {tpl.genre.split(' / ')[0]}
                      </span>
                    </div>
                    
                    <button className={cn(
                      "flex items-center justify-center p-1.5 rounded-sm transition-all shrink-0",
                      isSelected 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-white/10 hover:bg-white/20 text-white group-hover:bg-amber-400 group-hover:text-black'
                    )}>
                      {isSelected ? <Check size={12} strokeWidth={3} /> : <Play size={10} fill="currentColor" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SHOW MORE BUTTON */}
          {activeFilter === 'ALL' && visibleCount < MUSIC_GENRE_TEMPLATES.length && (
            <div className="flex justify-center mt-8 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowMore}
                className="gap-2 text-[10px] font-bold tracking-widest uppercase"
              >
                SHOW MORE
                <ChevronRight size={12} className="text-content-tertiary" />
              </Button>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-border-subtle bg-panel flex items-center justify-between text-xs text-content-secondary shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-400" />
            <span className="text-[11px]">Presetler, optimum 60 FPS video renderı için önceden kalibre edilmiştir.</span>
          </div>
          <span className="font-mono text-[10px] text-content-tertiary">VidFramer Engine v2.0</span>
        </div>
      </div>
    </div>
  );
};

