import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Plus, Trash2, Download, Upload, Edit3, 
  Save, CheckCircle2, RefreshCw, FileText, Search, Copy, Check 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { VisualizerPresetProfile } from '../../types';
import { BUILTIN_PROFILES } from '../../services/presetService';
import { Button, Input, Card, Badge } from '../ui';
import { cn } from '../../lib/utils';

export const CMSPresetManagerTab: React.FC = () => {
  const { customPresets, savePreset, deletePreset, importPresets } = useCMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'custom' | 'builtin'>('all');
  const [editingPreset, setEditingPreset] = useState<VisualizerPresetProfile | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine built-in profiles and custom presets
  const allPresets = useMemo(() => {
    const customMap = new Map<string, VisualizerPresetProfile>();
    customPresets.forEach(p => customMap.set(p.id, p));

    const combined: VisualizerPresetProfile[] = [];
    
    // Add custom first
    customPresets.forEach(p => combined.push(p));

    // Add built-ins that haven't been overridden
    BUILTIN_PROFILES.forEach(b => {
      if (!customMap.has(b.id)) {
        combined.push(b);
      }
    });

    return combined;
  }, [customPresets]);

  // Filtered presets
  const filteredPresets = useMemo(() => {
    return allPresets.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.settings.mode.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === 'custom') return matchesSearch && !p.isBuiltin;
      if (selectedTab === 'builtin') return matchesSearch && p.isBuiltin;
      return matchesSearch;
    });
  }, [allPresets, searchQuery, selectedTab]);

  // Export single preset as JSON
  const handleDownloadPreset = (preset: VisualizerPresetProfile) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${preset.name.toLowerCase().replace(/\s+/g, '_')}_preset.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export all presets
  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allPresets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vidframer_all_presets_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const presetsToImport: VisualizerPresetProfile[] = Array.isArray(parsed) ? parsed : [parsed];
        
        const validPresets = presetsToImport.filter(p => p && p.name && p.settings);
        if (validPresets.length === 0) {
          alert("Dosyada geçerli preset formatı bulunamadı.");
          return;
        }

        const ok = await importPresets(validPresets);
        if (ok) {
          setStatusMessage(`${validPresets.length} preset başarıyla içe aktarıldı.`);
          setTimeout(() => setStatusMessage(null), 4000);
        }
      } catch (err) {
        alert("JSON dosyası ayrıştırılamadı. Lütfen geçerli bir preset JSON dosyası yükleyin.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Start new preset
  const handleCreateNew = () => {
    const newPreset: VisualizerPresetProfile = {
      id: `custom_${Date.now()}`,
      name: 'YENİ ÖZEL PRESET',
      description: 'CMS üzerinden oluşturulan özel görselleştirici preseti.',
      createdAt: Date.now(),
      isBuiltin: false,
      settings: {
        mode: 'STUDIO_SPLIT_LYRICS',
        aspectRatio: '16/9',
        primaryColor: '#FFD700',
        secondaryColor: '#FFFFFF',
        intensity: 1.0,
        bloomEnabled: true,
        bloom: 0.6,
        vignetteEnabled: true,
        vignette: 0.5,
        rgbSplitEnabled: false,
        filmGrainEnabled: false,
        cameraShakeEnabled: false,
        lyricsEnabled: true,
        lyricsStyle: 'KINETIC',
        bgMode: 'NONE',
        bgOpacity: 0.1
      }
    };
    setEditingPreset(newPreset);
    setIsEditingNew(true);
  };

  // Save preset from modal / editor
  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreset) return;
    setIsSaving(true);
    const ok = await savePreset(editingPreset);
    setIsSaving(false);
    if (ok) {
      setEditingPreset(null);
      setIsEditingNew(false);
      setStatusMessage(`'${editingPreset.name}' preseti başarıyla kaydedildi.`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDelete = async (presetId: string, name: string) => {
    if (confirm(`'${name}' presetini silmek istediğinize emin misiniz?`)) {
      await deletePreset(presetId);
      setStatusMessage(`'${name}' preseti silindi.`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık & Hızlı Eylemler */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-content-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Preset & Şablon Yöneticisi (Preset Manager)
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Özel görselleştirici profilleri oluşturun, düzenleyin, JSON olarak indirin veya sisteme aktarın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusMessage && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> {statusMessage}
            </span>
          )}

          {/* İçe Aktar (Import) */}
          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-hover border border-border-subtle hover:border-accent text-content-primary text-xs font-bold rounded-lg cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-accent" />
            JSON Yükle
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {/* Tümünü Dışa Aktar (Export) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Tümünü İndir
          </Button>

          {/* Yeni Preset Oluştur */}
          <Button
            variant="accent"
            size="sm"
            onClick={handleCreateNew}
            className="gap-1.5 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni Preset Ekle
          </Button>
        </div>
      </div>

      {/* Arama & Sekme Filtresi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-lg border border-border-subtle">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-content-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Preset adı, modu veya açıklamasıyla ara..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-panel p-1 rounded-md border border-border-subtle">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer",
              selectedTab === 'all' ? "bg-accent text-accent-foreground shadow-sm" : "text-content-secondary hover:text-content-primary"
            )}
          >
            Tümü ({allPresets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('custom')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer",
              selectedTab === 'custom' ? "bg-accent text-accent-foreground shadow-sm" : "text-content-secondary hover:text-content-primary"
            )}
          >
            Özel CMS ({customPresets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('builtin')}
            className={cn(
              "px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer",
              selectedTab === 'builtin' ? "bg-accent text-accent-foreground shadow-sm" : "text-content-secondary hover:text-content-primary"
            )}
          >
            Yerleşik ({BUILTIN_PROFILES.length})
          </button>
        </div>
      </div>

      {/* Preset Kartları Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => {
          const isBuiltin = Boolean(preset.isBuiltin);

          return (
            <Card
              key={preset.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-accent/50 transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-content-primary group-hover:text-accent transition-colors flex items-center gap-2">
                      {preset.name}
                    </h4>
                    <span className="text-[10px] font-mono text-content-tertiary">
                      Mod: {preset.settings.mode}
                    </span>
                  </div>

                  <Badge variant={isBuiltin ? "outline" : "accent"} className="text-[9px] uppercase">
                    {isBuiltin ? "Yerleşik" : "Özel CMS"}
                  </Badge>
                </div>

                <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                  {preset.description || "Açıklama belirtilmemiş."}
                </p>

                {/* Renk ve Ayar Rozetleri */}
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.settings.primaryColor || '#FFD700' }} />
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: preset.settings.secondaryColor || '#FFFFFF' }} />
                  </div>
                  <span className="text-[10px] text-content-tertiary font-mono">
                    Format: {preset.settings.aspectRatio || '16/9'}
                  </span>
                  <span className="text-[10px] text-content-tertiary font-mono">
                    Yoğunluk: {preset.settings.intensity ?? 1.0}x
                  </span>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDownloadPreset(preset)}
                    title="JSON Olarak İndir"
                    className="p-1.5 text-content-secondary hover:text-content-primary"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(preset, null, 2));
                      setCopiedId(preset.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    title="JSON Kopyala"
                    className="p-1.5 text-content-secondary hover:text-content-primary"
                  >
                    {copiedId === preset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setEditingPreset({ ...preset });
                      setIsEditingNew(false);
                    }}
                    className="text-xs gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Düzenle
                  </Button>

                  {!isBuiltin && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDelete(preset.id, preset.name)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Preset Düzenleme / Ekleme Modalı */}
      {editingPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-elevation-2 bg-panel border-accent/40 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                {isEditingNew ? 'Yeni Preset Oluştur' : `'${editingPreset.name}' Düzenle`}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPreset(null)}
                className="text-content-secondary hover:text-content-primary"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSaveEditor} className="p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary">Preset Adı</label>
                  <Input
                    value={editingPreset.name}
                    onChange={(e) => setEditingPreset(p => p ? { ...p, name: e.target.value } : null)}
                    placeholder="Örn: CYBERPUNK DRIFT"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary">Görselleştirici Modu</label>
                  <Input
                    value={editingPreset.settings.mode}
                    onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, mode: e.target.value as any } } : null)}
                    placeholder="Örn: STUDIO_SPLIT_LYRICS"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-content-secondary">Açıklama</label>
                <textarea
                  value={editingPreset.description || ''}
                  onChange={(e) => setEditingPreset(p => p ? { ...p, description: e.target.value } : null)}
                  rows={2}
                  className="w-full bg-surface border border-border-subtle rounded-md p-2.5 text-xs text-content-primary focus:outline-none focus:border-accent"
                  placeholder="Presetin görsel stili ve kullanım amacı..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary">Primary Renk</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingPreset.settings.primaryColor || '#FFD700'}
                      onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, primaryColor: e.target.value } } : null)}
                      className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={editingPreset.settings.primaryColor || '#FFD700'}
                      onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, primaryColor: e.target.value } } : null)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary">Secondary Renk</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingPreset.settings.secondaryColor || '#FFFFFF'}
                      onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, secondaryColor: e.target.value } } : null)}
                      className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={editingPreset.settings.secondaryColor || '#FFFFFF'}
                      onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, secondaryColor: e.target.value } } : null)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-content-secondary">En-Boy Oranı</label>
                  <select
                    value={editingPreset.settings.aspectRatio || '16/9'}
                    onChange={(e) => setEditingPreset(p => p ? { ...p, settings: { ...p.settings, aspectRatio: e.target.value as any } } : null)}
                    className="w-full bg-surface border border-border-subtle rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-accent"
                  >
                    <option value="16/9">16:9 Cinema</option>
                    <option value="9/16">9:16 Reels / TikTok</option>
                    <option value="1/1">1:1 Square</option>
                  </select>
                </div>
              </div>

              {/* JSON Ham Ayarlar Düzenleyici */}
              <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                <label className="text-xs font-bold text-content-secondary flex items-center justify-between">
                  <span>Ham Ayarlar JSON (Tüm Görsel Parametreler)</span>
                  <span className="text-[10px] text-content-tertiary font-normal">Gelişmiş Yapılandırma</span>
                </label>
                <textarea
                  value={JSON.stringify(editingPreset.settings, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingPreset(p => p ? { ...p, settings: parsed } : null);
                    } catch (_) {}
                  }}
                  rows={8}
                  className="w-full bg-black/60 border border-border-subtle rounded-md p-2.5 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPreset(null)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={isSaving}
                  className="gap-2 font-bold text-xs"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Preseti Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
