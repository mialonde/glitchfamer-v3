import React, { useState, useEffect, useRef } from 'react';
import { 
  Bookmark, BookmarkCheck, Save, Plus, Trash2, Edit3, 
  Download, Upload, RefreshCw, Check, Sparkles, Sliders, 
  X, Search, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { VisualizerSettings, VisualizerPresetProfile } from '../types';
import { PresetService } from '../services/presetService';
import { useCMS } from '../context/CMSContext';
import { Button, Badge, Card, Input } from './ui';
import { cn } from '../lib/utils';

interface PresetManagerProps {
  currentSettings: VisualizerSettings;
  onApplySettings: (settings: Partial<VisualizerSettings>) => void;
  className?: string;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentSettings,
  onApplySettings,
  className
}) => {
  const { customPresets, savePreset: saveCmsPreset } = useCMS();
  const [profiles, setProfiles] = useState<VisualizerPresetProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Yeni Profil Kaydetme State
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  
  // Düzenleme / İsim Değiştirme State
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Bildirim / Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // İlk yükleme ve CMS senkronizasyonu
  useEffect(() => {
    loadProfiles();
  }, [customPresets]);

  const loadProfiles = () => {
    const list = PresetService.getProfiles();
    // CMS custom presets varsa ve yerel listede yoksa birleştir
    const merged = [...list];
    if (customPresets && customPresets.length > 0) {
      customPresets.forEach(cp => {
        if (!merged.some(p => p.id === cp.id)) {
          merged.push(cp);
        }
      });
    }
    setProfiles(merged);
    const activeId = PresetService.getActiveProfileId();
    if (activeId && merged.some(p => p.id === activeId)) {
      setActiveProfileId(activeId);
    } else if (merged.length > 0) {
      setActiveProfileId(merged[0].id);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Profili Uygula (Recall)
  const handleApplyProfile = (profile: VisualizerPresetProfile) => {
    onApplySettings(profile.settings);
    setActiveProfileId(profile.id);
    PresetService.setActiveProfileId(profile.id);
    showToast(`"${profile.name}" profili yüklendi!`, 'success');
  };

  // Yeni Profil Kaydet
  const handleSaveNew = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProfileName.trim()) {
      showToast('Lütfen profil için bir isim girin.', 'error');
      return;
    }

    const saved = PresetService.saveNewProfile(
      newProfileName.trim(),
      currentSettings,
      newProfileDesc.trim() || undefined
    );

    setProfiles(PresetService.getProfiles());
    setActiveProfileId(saved.id);
    setIsSaveModalOpen(false);
    setNewProfileName('');
    setNewProfileDesc('');
    showToast(`"${saved.name}" profili başarıyla kaydedildi!`, 'success');
  };

  // Aktif Profilin Üzerine Yaz (Update Existing)
  const handleOverwriteActive = () => {
    if (!activeProfileId) return;
    const current = profiles.find(p => p.id === activeProfileId);
    if (!current) return;

    const updated = PresetService.updateProfile(
      activeProfileId,
      current.name,
      currentSettings,
      current.description
    );

    if (updated) {
      setProfiles(PresetService.getProfiles());
      showToast(`"${updated.name}" profili güncellendi!`, 'success');
    }
  };

  // Profil Sil
  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" profilini silmek istediğinize emin misiniz?`)) {
      PresetService.deleteProfile(id);
      const updatedList = PresetService.getProfiles();
      setProfiles(updatedList);
      if (activeProfileId === id) {
        setActiveProfileId(updatedList.length > 0 ? updatedList[0].id : null);
      }
      showToast(`"${name}" silindi.`, 'info');
    }
  };

  // Profil İsim / Açıklama Düzenlemeyi Kaydet
  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const target = profiles.find(p => p.id === id);
    if (!target) return;

    PresetService.updateProfile(id, editName.trim(), target.settings as VisualizerSettings, editDesc.trim());
    setProfiles(PresetService.getProfiles());
    setEditingProfileId(null);
    showToast('Profil bilgileri güncellendi.', 'success');
  };

  // JSON Dışa Aktar
  const handleExportJSON = () => {
    const jsonStr = PresetService.exportProfilesJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vidframer_presets_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Profiller JSON olarak indirildi.', 'success');
  };

  // JSON İçe Aktar
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = PresetService.importProfilesJSON(content);
        if (result.successCount > 0) {
          loadProfiles();
          showToast(`${result.successCount} adet profil başarıyla içe aktarıldı!`, 'success');
        } else {
          showToast('Geçerli profil bulunamadı veya JSON formatı hatalı.', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Varsayılanlara Sıfırla
  const handleResetDefaults = () => {
    if (confirm('Tüm özel profiller silinecek ve varsayılan hazır profiller yüklenecektir. Emin misiniz?')) {
      const defs = PresetService.resetToDefaults();
      setProfiles(defs);
      setActiveProfileId(defs[0].id);
      onApplySettings(defs[0].settings);
      showToast('Varsayılan profillere sıfırlandı.', 'info');
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const filteredProfiles = profiles.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.settings.mode && p.settings.mode.toLowerCase().includes(q))
    );
  });

  // Profilin kaç aktif efekt içerdiğini hesapla
  const getActiveFxCount = (s?: Partial<VisualizerSettings>) => {
    if (!s) return 0;
    let count = 0;
    if (s.rgbSplitEnabled) count++;
    if (s.scanLinesEnabled) count++;
    if (s.vignetteEnabled) count++;
    if (s.bloomEnabled) count++;
    if (s.filmGrainEnabled) count++;
    if (s.strobeEnabled) count++;
    if (s.cameraShakeEnabled) count++;
    if (s.glitchSliceEnabled) count++;
    if (s.edgeGlowEnabled) count++;
    if (s.lensDistortEnabled) count++;
    if (s.motionTrailEnabled) count++;
    if (s.hueRotateEnabled) count++;
    return count;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* TOAST BİLDİRİMİ */}
      {toastMessage && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-4 py-3 border font-mono text-xs shadow-2xl flex items-center gap-2 rounded-lg animate-in fade-in slide-in-from-bottom-2",
          toastMessage.type === 'success' ? "bg-panel border-accent text-accent" :
          toastMessage.type === 'error' ? "bg-red-950 border-red-500 text-red-300" :
          "bg-surface border-border-strong text-content-primary"
        )}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-accent" /> : <AlertCircle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HIZLI PROFİL ERİŞİM ÇUBUĞU (QUICK RECALL BAR) */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary flex items-center gap-2">
                KONFİGÜRASYON PROFİLLERİ & PRESETLER
                <Badge variant="accent" className="text-[9px]">
                  {profiles.length} KAYITLI
                </Badge>
              </h3>
              <p className="text-[10px] text-content-tertiary">
                Visualizer, renk ve shader ayarlarınızı profil olarak kaydedin ve geri çağırın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Üzerine Yaz / Hızlı Kaydet Butonu */}
            {activeProfile && !activeProfile.isBuiltin && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleOverwriteActive}
                title={`Mevcut ayarları "${activeProfile.name}" profiline kaydet`}
                className="gap-1.5 uppercase font-mono text-[9px]"
              >
                <Save size={12} className="text-accent" />
                <span>GÜNCELLE</span>
              </Button>
            )}

            {/* Yeni Olarak Kaydet Butonu */}
            <Button
              variant="accent"
              size="xs"
              onClick={() => {
                setNewProfileName(`Özel Profil ${profiles.length + 1}`);
                setNewProfileDesc('');
                setIsSaveModalOpen(true);
              }}
              className="gap-1.5 uppercase font-mono text-[9px]"
            >
              <Plus size={13} />
              <span>YENİ PROFİL KAYDET</span>
            </Button>

            {/* Tüm Profilleri Yönet / Modal Butonu */}
            <Button
              variant="outline"
              size="xs"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 uppercase font-mono text-[9px]"
            >
              <Layers size={13} />
              <span>TÜMÜNÜ YÖNET</span>
            </Button>
          </div>
        </div>

        {/* HIZLI SEÇİCİ GRID (EN ÇOK KULLANILANLAR) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {profiles.slice(0, 6).map((prof) => {
            const isSelected = activeProfileId === prof.id;
            return (
              <Button
                key={prof.id}
                type="button"
                variant={isSelected ? "accent" : "outline"}
                onClick={() => handleApplyProfile(prof)}
                className="p-2.5 text-left flex flex-col items-start justify-between min-h-[58px] h-auto"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate pr-1">
                    {prof.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {prof.settings.primaryColor && (
                      <span 
                        className="w-2 h-2 rounded-full border border-black/40" 
                        style={{ backgroundColor: prof.settings.primaryColor }} 
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mt-1.5">
                  <span className={cn(
                    "text-[8px] font-mono uppercase truncate",
                    isSelected ? "text-accent-foreground font-bold" : "text-content-tertiary"
                  )}>
                    {prof.settings.mode || 'STANDART'}
                  </span>
                  {isSelected && (
                    <Check size={12} className="stroke-[3]" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* YENİ PROFİL KAYDETME MODALI */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 border-accent/60">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black uppercase tracking-wider text-content-primary">
                  YENİ PROFİL OLARAK KAYDET
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="xs"
                onClick={() => setIsSaveModalOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-content-secondary tracking-wider block">
                  PROFİL ADI:
                </label>
                <Input
                  type="text"
                  required
                  autoFocus
                  placeholder="Örn: Ağır Bas Cyberpunk, Sinematik Retro..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-content-secondary tracking-wider block">
                  AÇIKLAMA / NOT (İSTEĞE BAĞLI):
                </label>
                <Input
                  type="text"
                  placeholder="Örn: 80ler kaset greni ve neon ışıklar"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                />
              </div>

              {/* Mevcut Ayar Özeti */}
              <div className="bg-surface border border-border-subtle p-3 rounded-lg space-y-1.5 text-[10px] font-mono">
                <div className="text-content-secondary uppercase font-bold">KAYDEDİLECEK AYAR ÖZETİ:</div>
                <div className="flex flex-wrap gap-1.5 text-content-tertiary">
                  <Badge variant="outline" className="text-[9px]">
                    Mod: {currentSettings.mode}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    Oran: {currentSettings.aspectRatio}
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    Aktif FX: {getActiveFxCount(currentSettings)} adet
                  </Badge>
                  <Badge variant="outline" className="text-[9px] gap-1">
                    Renk: <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentSettings.primaryColor }} />
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  İPTAL
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                >
                  PROFİLİ KAYDET
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TÜM PROFİLLERİ YÖNETME MODALI (FULL PRESET MANAGER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 p-0 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-panel">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <div>
                  <h2 className="text-sm font-black tracking-wider uppercase text-content-primary">
                    PROFİL VE PRESET YÖNETİCİSİ
                  </h2>
                  <p className="text-[10px] text-content-tertiary">
                    Kayıtlı profilleri inceleyin, düzenleyin, dışa/içe aktarın.
                  </p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="xs"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Arama & Dışa/İçe Aktarma Araç Çubuğu */}
            <div className="p-4 border-b border-border-subtle bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
                <Input
                  type="text"
                  placeholder="Profil adı veya visualizer modu ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* JSON Dışa Aktar */}
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleExportJSON}
                  className="gap-1.5 uppercase font-mono text-[9px]"
                  title="Profilleri JSON dosyası olarak indir"
                >
                  <Download size={12} />
                  <span>DIŞA AKTAR (.JSON)</span>
                </Button>

                {/* JSON İçe Aktar */}
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 uppercase font-mono text-[9px]"
                  title="JSON dosyasından profil yükle"
                >
                  <Upload size={12} />
                  <span>İÇE AKTAR</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImportFile}
                />

                {/* Varsayılanlara Sıfırla */}
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={handleResetDefaults}
                  className="gap-1.5 uppercase font-mono text-[9px]"
                  title="Tüm profilleri varsayılana döndür"
                >
                  <RefreshCw size={12} />
                  <span>SIFIRLA</span>
                </Button>
              </div>
            </div>

            {/* Profil Listesi */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-12 text-content-tertiary text-xs">
                  Aramanıza uygun profil bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProfiles.map((prof) => {
                    const isSelected = activeProfileId === prof.id;
                    const isEditing = editingProfileId === prof.id;

                    return (
                      <Card
                        key={prof.id}
                        className={cn(
                          "p-4 transition-all flex flex-col justify-between gap-3",
                          isSelected
                            ? "border-accent bg-accent/5 shadow-md"
                            : "bg-surface border-border-subtle hover:border-border-strong"
                        )}
                      >
                        {/* Üst Kısım: İsim, Tip ve Rozetler */}
                        <div>
                          {isEditing ? (
                            <div className="space-y-2 mb-2">
                              <Input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="text-xs uppercase font-bold"
                              />
                              <Input
                                type="text"
                                placeholder="Açıklama..."
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="text-[10px]"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setEditingProfileId(null)}
                                >
                                  İptal
                                </Button>
                                <Button
                                  type="button"
                                  variant="accent"
                                  size="xs"
                                  onClick={() => handleSaveEdit(prof.id)}
                                >
                                  Kaydet
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-content-primary">
                                    {prof.name}
                                  </h4>
                                  {prof.isBuiltin && (
                                    <Badge variant="outline" className="text-[8px] uppercase">
                                      YERLEŞİK
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <Badge variant="accent" className="text-[8px] uppercase font-bold">
                                      AKTİF
                                    </Badge>
                                  )}
                                </div>
                                {prof.description && (
                                  <p className="text-[10px] text-content-secondary mt-0.5">
                                    {prof.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {prof.settings.primaryColor && (
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black shadow-sm" 
                                    style={{ backgroundColor: prof.settings.primaryColor }} 
                                    title={`Vurgu: ${prof.settings.primaryColor}`}
                                  />
                                )}
                                {prof.settings.secondaryColor && (
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black shadow-sm" 
                                    style={{ backgroundColor: prof.settings.secondaryColor }} 
                                    title={`İkincil: ${prof.settings.secondaryColor}`}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Parametre Rozetleri */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            <Badge variant="outline" className="text-[9px] font-mono">
                              MOD: <b className="text-content-primary ml-1">{prof.settings.mode || 'STANDART'}</b>
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              ORAN: <b className="text-content-primary ml-1">{prof.settings.aspectRatio || '16/9'}</b>
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              FX: <b className="text-accent ml-1">{getActiveFxCount(prof.settings)}</b>
                            </Badge>
                            {prof.settings.visSpeed && (
                              <Badge variant="outline" className="text-[9px] font-mono">
                                HIZ: <b className="text-content-primary ml-1">{prof.settings.visSpeed}x</b>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Alt Butonlar */}
                        <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-1">
                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => {
                                  setEditingProfileId(prof.id);
                                  setEditName(prof.name);
                                  setEditDesc(prof.description || '');
                                }}
                                className="text-content-tertiary hover:text-content-secondary text-[9px] gap-1 px-1 h-6"
                              >
                                <Edit3 size={11} />
                                <span>YENİDEN ADLANDIR</span>
                              </Button>
                            )}

                            {!prof.isBuiltin && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleDelete(prof.id, prof.name)}
                                className="text-content-tertiary hover:text-destructive text-[9px] gap-1 px-1 h-6 ml-1"
                              >
                                <Trash2 size={11} />
                                <span>SİL</span>
                              </Button>
                            )}
                          </div>

                          <Button
                            variant={isSelected ? "outline" : "accent"}
                            size="xs"
                            onClick={() => {
                              handleApplyProfile(prof);
                              setIsModalOpen(false);
                            }}
                            className="text-[9px] uppercase font-bold gap-1.5"
                          >
                            {isSelected ? <Check size={12} /> : <Sparkles size={12} />}
                            <span>{isSelected ? 'YENİDEN UYGULA' : 'YÜKLE / KULLAN'}</span>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-subtle bg-surface flex items-center justify-between text-[10px] text-content-tertiary">
              <span>Toplam {profiles.length} profil kayıtlı.</span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsModalOpen(false)}
                className="uppercase font-bold text-[9px]"
              >
                KAPAT
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

