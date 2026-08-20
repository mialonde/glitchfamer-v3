import React, { useState, useMemo } from 'react';
import { 
  Sliders, Search, Filter, CheckSquare, Square, 
  CheckCircle2, XCircle, Sparkles, RefreshCw, Eye, EyeOff 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { VISUALIZER_MODES, VisualizerModeEntry } from '../../lib/visualizerCatalog';
import { Button, Input, Card, Badge } from '../ui';
import { cn } from '../../lib/utils';

export const CMSVisualizerManagerTab: React.FC = () => {
  const { visualizerConfig, toggleVisualizer, isVisualizerEnabled } = useCMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Categories list with counts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    VISUALIZER_MODES.forEach(m => cats.add(m.catLabel || m.cat));
    return ['ALL', ...Array.from(cats)];
  }, []);

  // Filtered visualizers
  const filteredVisualizers = useMemo(() => {
    return VISUALIZER_MODES.filter(v => {
      const matchesSearch = v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || (v.catLabel || v.cat) === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const totalCount = VISUALIZER_MODES.length;
  const disabledCount = visualizerConfig.disabledVisualizers?.length || 0;
  const activeCount = totalCount - disabledCount;

  const handleToggle = async (modeId: string, currentActive: boolean) => {
    setIsUpdating(modeId);
    await toggleVisualizer(modeId, !currentActive);
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & İstatistikler */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-content-primary flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent" />
            Görselleştirici Kataloğu Yönetimi (Visualizer Manager)
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Sistemdeki {totalCount} görselleştirici motorunun erişilebilirliğini ve katalog görünürlüğünü tek tıkla kontrol edin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-subtle rounded-lg text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {activeCount} Aktif
            </span>
            <span className="text-border-subtle">|</span>
            <span className="text-red-400 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {disabledCount} Pasif
            </span>
          </div>
        </div>
      </div>

      {/* Arama & Kategori Filtresi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-content-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Visualizer adı, modu veya açıklamasıyla ara..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-content-tertiary flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-panel border border-border-subtle rounded-md px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-accent shrink-0"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'Tüm Kategoriler' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visualizers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVisualizers.map((vis) => {
          const isEnabled = isVisualizerEnabled(vis.id);
          const isBusy = isUpdating === vis.id;

          return (
            <Card
              key={vis.id}
              className={cn(
                "p-4 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden",
                isEnabled 
                  ? "bg-surface/80 border-border-subtle hover:border-accent/40" 
                  : "bg-panel/40 border-red-950/40 opacity-70"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={cn("text-xs font-bold tracking-wide uppercase", isEnabled ? "text-content-primary" : "text-content-secondary line-through")}>
                      {vis.label}
                    </h4>
                    <span className="text-[10px] font-mono text-content-tertiary">
                      ID: {vis.id}
                    </span>
                  </div>

                  <Badge 
                    variant={isEnabled ? "accent" : "outline"} 
                    className={cn("text-[9px] uppercase px-1.5 py-0", !isEnabled && "text-red-400 border-red-900/50")}
                  >
                    {vis.catLabel || vis.cat}
                  </Badge>
                </div>

                <p className="text-[11px] text-content-secondary line-clamp-2 leading-relaxed">
                  {vis.desc}
                </p>
              </div>

              {/* Alt Eylem ve Toggle Barı */}
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", isEnabled ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-content-tertiary">
                    {isEnabled ? "Stüdyoda Görünür" : "Devre Dışı"}
                  </span>
                </div>

                <Button
                  variant={isEnabled ? "outline" : "accent"}
                  size="xs"
                  onClick={() => handleToggle(vis.id, isEnabled)}
                  disabled={isBusy}
                  className={cn(
                    "text-[11px] font-bold gap-1.5 px-3 py-1",
                    !isEnabled && "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isBusy ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : isEnabled ? (
                    <>
                      <EyeOff className="w-3 h-3 text-red-400" />
                      Pasif Yap
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      Aktif Et
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredVisualizers.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-lg border border-border-subtle space-y-2">
          <p className="text-sm font-semibold text-content-secondary">Arama kriterlerine uygun görselleştirici bulunamadı.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}>
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
};
