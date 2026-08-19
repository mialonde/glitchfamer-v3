import React, { useState } from 'react';
import { 
  Sparkles, X, Check, Flame, Zap, Activity, 
  Sliders, Music, ArrowRight, Layers, Palette, Eye
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MUSIC_GENRE_TEMPLATES[0].id);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Zap': return Zap;
      case 'Sparkles': return Sparkles;
      case 'Activity': return Activity;
      case 'Sliders': return Sliders;
      case 'Music': return Music;
      default: return Sparkles;
    }
  };

  const filteredTemplates = MUSIC_GENRE_TEMPLATES.filter(t => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ARABESK' && t.genre.toLowerCase().includes('arabesk')) return true;
    if (activeFilter === 'TRAP' && (t.genre.toLowerCase().includes('trap') || t.genre.toLowerCase().includes('drill'))) return true;
    if (activeFilter === 'POP' && t.genre.toLowerCase().includes('pop')) return true;
    if (activeFilter === 'PHONK' && t.genre.toLowerCase().includes('phonk')) return true;
    if (activeFilter === 'LOFI' && t.genre.toLowerCase().includes('lo-fi')) return true;
    return true;
  });

  const selectedTemplate = MUSIC_GENRE_TEMPLATES.find(t => t.id === selectedTemplateId) || MUSIC_GENRE_TEMPLATES[0];

  const handleApply = (tpl: MusicGenreTemplate) => {
    onApplyTemplate(tpl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                MÜZİK TÜRÜ & MOOD ŞABLONLARI
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  1-TIK KURULUM
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Tek tıkla görselleştirici, renk paleti, efektler, font ve atmosfer ayarlarını türünüze göre uyarlayın.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* GENRE FILTER PILLS */}
        <div className="px-6 py-2.5 border-b border-zinc-800/50 bg-zinc-950/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ALL', label: 'TÜM ŞABLONLAR' },
            { id: 'ARABESK', label: 'ARABESK & SERIF' },
            { id: 'TRAP', label: 'TRAP & DRILL' },
            { id: 'PHONK', label: 'PHONK & DRIFT' },
            { id: 'POP', label: 'POP & BRIGHT' },
            { id: 'LOFI', label: 'LO-FI & VINTAGE' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-amber-400 text-black shadow-md font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* MODAL BODY (TWO COLUMN: TEMPLATE CARDS & DETAIL PREVIEW) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* TEMPLATE CARDS GRID */}
          <div className="md:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTemplates.map(tpl => {
                const Icon = getIcon(tpl.iconName);
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg'
                        : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold shadow-sm"
                            style={{ backgroundColor: tpl.previewColors[0] || '#FFD700' }}
                          >
                            <Icon size={14} />
                          </div>
                          <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                            {tpl.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-medium text-zinc-400 mb-1.5 line-clamp-1">
                        {tpl.genre}
                      </div>

                      <p className="text-[11px] text-zinc-500 line-clamp-2 mb-3">
                        {tpl.tagline}
                      </p>
                    </div>

                    {/* COLOR SWATCHES & MODE BADGE */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <div className="flex items-center gap-1">
                        {tpl.previewColors.map((c, i) => (
                          <div 
                            key={i} 
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-xs" 
                            style={{ backgroundColor: c }} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
                        {tpl.settings.mode?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEMPLATE DETAIL & LIVE PREVIEW SUMMARY */}
          <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  ŞABLON ÖNİZLEME & AYARLAR
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedTemplate.genre}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>

              {/* SETTINGS HIGHLIGHT BOX */}
              <div className="bg-zinc-950/80 rounded-lg p-3.5 border border-zinc-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Sliders size={13} className="text-amber-400" /> Görselleştirici:
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {selectedTemplate.settings.mode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Palette size={13} className="text-amber-400" /> Renk Paleti:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      {selectedTemplate.previewColors.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border border-zinc-700" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-zinc-300">
                      {selectedTemplate.settings.primaryColor}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-400" /> Tipografi / Font:
                  </span>
                  <span className="font-mono text-zinc-200 capitalize">
                    {selectedTemplate.fontFamily} ({selectedTemplate.settings.lyricsStyle || 'Standard'})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" /> Efekt Katmanları:
                  </span>
                  <span className="text-zinc-300">
                    {[
                      selectedTemplate.settings.bloomEnabled ? 'Bloom' : null,
                      selectedTemplate.settings.rgbSplitEnabled ? 'RGB Split' : null,
                      selectedTemplate.settings.filmGrainEnabled ? 'Grain' : null,
                      selectedTemplate.settings.scanLinesEnabled ? 'Scanlines' : null,
                      selectedTemplate.settings.strobeEnabled ? 'Strobe' : null,
                    ].filter(Boolean).join(', ') || 'Minimal'}
                  </span>
                </div>
              </div>

              {/* COLOR PALETTE PREVIEW BAR */}
              <div className="h-6 rounded-lg overflow-hidden flex border border-zinc-800">
                {selectedTemplate.previewColors.map((c, i) => (
                  <div key={i} className="flex-1 flex items-center justify-center text-[9px] font-mono font-bold text-black/80" style={{ backgroundColor: c }}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-4 mt-4 border-t border-zinc-800/80">
              <button
                onClick={() => handleApply(selectedTemplate)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                <Sparkles size={15} />
                BU ŞABLONU STÜDYOYA UYGULA
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
