import React, { useState } from 'react';
import { 
  Sparkles, X, Check, Flame, Zap, Activity, 
  Sliders, Music, ChevronRight, Eye, Play, Plus
} from 'lucide-react';
import { MusicGenreTemplate, VisualizerSettings } from '../types';
import { MUSIC_GENRE_TEMPLATES } from '../lib/creatorTemplatesData';

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
  const [visibleCount, setVisibleCount] = useState<number>(12); // Initially show 12, "Show More" reveals all 18!

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        id="preset-picker-container"
        className="bg-zinc-950 border border-zinc-900 rounded-xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden text-zinc-100"
      >
        
        {/* MODAL HEADER */}
        <div className="px-8 py-5 border-b border-zinc-900/80 flex items-center justify-between bg-zinc-950">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              SELECT A PRESET FOR YOUR VIDEO
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              Tek tıkla görselleştirici, renk paleti, 60 FPS filtreler, font ve sinematik duvar kağıdını yükleyin.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800 hover:text-white text-zinc-400 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* GENRE/STYLE FILTER PILLS */}
        <div className="px-8 py-3 bg-zinc-950/40 border-b border-zinc-900/50 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar flex-shrink-0">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'TÜM PRESETLER' },
              { id: 'DARK', label: 'DARK & BASS' },
              { id: 'CYBER', label: 'CYBER & TECHNO' },
              { id: 'CHILL', label: 'AMBIENT & CHILL' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id);
                  // Reset visible count on filter switch to allow clean viewing
                  setVisibleCount(f.id === 'ALL' ? 12 : 24);
                }}
                className={`px-3 py-1.5 text-[10px] font-sans font-bold tracking-widest rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-amber-400 text-black shadow-md font-black'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono hidden md:block">
            Sistem: {filteredTemplates.length} Hazır Stüdyo Kombinasyonu
          </div>
        </div>

        {/* MODAL GRID BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.slice(0, visibleCount).map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              
              // Helper to draw visualizer-reactive graphics inside card thumbnails to make them look sese-duyarlı
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
                // Default Spectrum bars
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
                  className={`group relative flex flex-col aspect-[16/10] rounded-lg overflow-hidden border cursor-pointer bg-zinc-900/30 transition-all duration-300 hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)] bg-zinc-900/60' 
                      : 'border-zinc-900 hover:border-zinc-700/60'
                  }`}
                >
                  {/* PREVIEW BACKGROUND IMAGE */}
                  <div className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 group-hover:scale-105"
                       style={{ backgroundImage: `url(${tpl.thumbnail})` }} />

                  {/* VIGNETTE GRADIENT LAYER */}
                  <div className="absolute inset-0 z-1 bg-gradient-to-t from-zinc-950/95 via-zinc-950/20 to-black/30 group-hover:from-zinc-950/100 transition-all duration-300" />

                  {/* VISUALIZER SIMULATED GRAPHIC OVERLAY */}
                  <div className="absolute inset-0 z-2">
                    {renderVisualizerGraphic(tpl.settings.mode || '')}
                  </div>

                  {/* TOP BADGE (NEW, PRO) */}
                  {tpl.badge && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-lg ${
                        tpl.badge === 'NEW' 
                          ? 'bg-red-500 text-white shadow-red-500/10' 
                          : 'bg-violet-600 text-white shadow-violet-500/10'
                      }`}>
                        {tpl.badge}
                      </span>
                    </div>
                  )}

                  {/* CARD FOOTER CONTENT */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex items-end justify-between gap-3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-8">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-amber-400 transition-colors truncate">
                        {tpl.name}
                      </h3>
                      <span className="text-[9px] text-zinc-400 tracking-tight leading-none truncate block">
                        {tpl.genre.split(' / ')[0]}
                      </span>
                    </div>
                    
                    {/* HOVER SELECT BUTTON */}
                    <button className={`flex items-center justify-center p-1.5 rounded transition-all flex-shrink-0 ${
                      isSelected 
                        ? 'bg-amber-400 text-black' 
                        : 'bg-white/10 hover:bg-white/20 text-white group-hover:bg-amber-400 group-hover:text-black'
                    }`}>
                      {isSelected ? <Check size={12} strokeWidth={3} /> : <Play size={10} fill="currentColor" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SHOW MORE BUTTON IN SCREENSHOT STYLE */}
          {activeFilter === 'ALL' && visibleCount < MUSIC_GENRE_TEMPLATES.length && (
            <div className="flex justify-center mt-12 mb-4">
              <button
                onClick={handleShowMore}
                className="px-8 py-3 border border-zinc-800 hover:border-zinc-600 bg-zinc-950 text-zinc-400 hover:text-white font-sans font-black tracking-[0.2em] text-[10px] rounded transition-all uppercase flex items-center gap-2 hover:bg-zinc-900 shadow-md cursor-pointer active:scale-[0.98]"
              >
                SHOW MORE
                <ChevronRight size={12} className="text-zinc-500" />
              </button>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-8 py-4 border-t border-zinc-900/80 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-amber-400" />
            <span>Presetler, optimum 60 FPS video renderı için önceden kalibre edilmiştir.</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-600">VidFramer Engine v2.0</span>
        </div>

      </div>
    </div>
  );
};
