import React, { useState, useEffect, useRef } from 'react';
import { 
  Bookmark, BookmarkCheck, Save, Plus, Trash2, Edit3, 
  Download, Upload, RefreshCw, Check, Sparkles, Sliders, 
  X, Search, Layers, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { VisualizerSettings, VisualizerPresetProfile } from '../types';
import { PresetService } from '../services/presetService';
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

  // İlk yükleme
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const list = PresetService.getProfiles();
    setProfiles(list);
    const activeId = PresetService.getActiveProfileId();
    if (activeId && list.some(p => p.id === activeId)) {
      setActiveProfileId(activeId);
    } else if (list.length > 0) {
      setActiveProfileId(list[0].id);
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
          "fixed bottom-6 right-6 z-50 px-4 py-3 border font-sans text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2",
          toastMessage.type === 'success' ? "bg-panel border-accent text-accent" :
          toastMessage.type === 'error' ? "bg-red-950 border-red-500 text-red-300" :
          "bg-surface border-border-strong text-content-primary"
        )}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-accent" /> : <AlertCircle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* HIZLI PROFİL ERİŞİM ÇUBUĞU (QUICK RECALL BAR) */}
      <div className="bg-panel border border-white/[0.08] p-4 rounded-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            <div>
              <h3 className="text-[10px] font-sans font-bold uppercase tracking-widest text-content-primary flex items-center gap-2">
                KONFİGÜRASYON PROFİLLERİ & PRESETLER
                <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.2 font-sans rounded">
                  {profiles.length} KAYITLI
                </span>
              </h3>
              <p className="text-[8.5px] text-content-tertiary font-sans">
                Visualizer, renk ve shader ayarlarınızı profil olarak kaydedin ve geri çağırın.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Üzerine Yaz / Hızlı Kaydet Butonu */}
            {activeProfile && !activeProfile.isBuiltin && (
              <button
                type="button"
                onClick={handleOverwriteActive}
                title={`Mevcut ayarları "${activeProfile.name}" profiline kaydet`}
                className="px-3 py-1.5 bg-surface hover:bg-hover text-content-secondary hover:text-content-primary border border-border-strong text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save size={12} className="text-accent" />
                <span>GÜNCELLE</span>
              </button>
            )}

            {/* Yeni Olarak Kaydet Butonu */}
            <button
              type="button"
              onClick={() => {
                setNewProfileName(`Özel Profil ${profiles.length + 1}`);
                setNewProfileDesc('');
                setIsSaveModalOpen(true);
              }}
              className="px-3 py-1.5 bg-accent hover:bg-white text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)] cursor-pointer"
            >
              <Plus size={13} />
              <span>YENİ PROFİL KAYDET</span>
            </button>

            {/* Tüm Profilleri Yönet / Modal Butonu */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-surface hover:bg-hover text-content-secondary hover:text-accent border border-border-strong hover:border-accent text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers size={13} />
              <span>TÜMÜNÜ YÖNET</span>
            </button>
          </div>
        </div>

        {/* HIZLI SEÇİCİ GRID (EN ÇOK KULLANILANLAR) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {profiles.slice(0, 6).map((prof) => {
            const isSelected = activeProfileId === prof.id;
            return (
              <button
                key={prof.id}
                type="button"
                onClick={() => handleApplyProfile(prof)}
                className={cn(
                  "p-2.5 text-left border transition-all flex flex-col justify-between min-h-[58px] cursor-pointer group relative overflow-hidden",
                  isSelected
                    ? "bg-accent text-black border-accent font-black shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                    : "bg-panel text-content-secondary border-border-strong hover:border-zinc-600 hover:bg-surface/60"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate pr-1">
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
                    "text-[7.5px] font-sans uppercase truncate",
                    isSelected ? "text-zinc-900 font-bold" : "text-content-tertiary"
                  )}>
                    {prof.settings.mode || 'STANDART'}
                  </span>
                  {isSelected && (
                    <Check size={11} className="text-black stroke-[3]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* YENİ PROFİL KAYDETME MODALI */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-panel/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-accent/60 p-6 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-strong pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black uppercase tracking-widest text-content-primary">
                  YENİ PROFİL OLARAK KAYDET
                </h3>
              </div>
              <button 
                onClick={() => setIsSaveModalOpen(false)}
                className="text-content-tertiary hover:text-content-primary transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-sans text-content-secondary uppercase tracking-widest block">
                  PROFİL ADI:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Örn: Ağır Bas Cyberpunk, Sinematik Retro..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-panel border border-border-strong p-2.5 text-xs text-content-primary uppercase font-bold focus:border-accent outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-sans text-content-secondary uppercase tracking-widest block">
                  AÇIKLAMA / NOT (İSTEĞE BAĞLI):
                </label>
                <input
                  type="text"
                  placeholder="Örn: 80ler kaset greni ve neon ışıklar"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  className="w-full bg-panel border border-border-strong p-2.5 text-xs text-content-secondary focus:border-accent outline-none"
                />
              </div>

              {/* Mevcut Ayar Özeti */}
              <div className="bg-panel border border-border-strong p-3 space-y-1.5 text-[9px] font-sans">
                <div className="text-content-secondary uppercase font-bold">KAYDEDİLECEK AYAR ÖZETİ:</div>
                <div className="flex flex-wrap gap-2 text-content-tertiary">
                  <span className="bg-surface px-1.5 py-0.5 border border-border-strong text-content-secondary">
                    Mod: {currentSettings.mode}
                  </span>
                  <span className="bg-surface px-1.5 py-0.5 border border-border-strong text-content-secondary">
                    Oran: {currentSettings.aspectRatio}
                  </span>
                  <span className="bg-surface px-1.5 py-0.5 border border-border-strong text-content-secondary">
                    Aktif FX: {getActiveFxCount(currentSettings)} adet
                  </span>
                  <span className="bg-surface px-1.5 py-0.5 border border-border-strong text-content-secondary flex items-center gap-1">
                    Renk: <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentSettings.primaryColor }} />
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 bg-surface hover:bg-hover text-content-secondary text-[10px] font-black uppercase tracking-wider border border-border-strong cursor-pointer"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent hover:bg-white text-black text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
                >
                  PROFİLİ KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TÜM PROFİLLERİ YÖNETME MODALI (FULL PRESET MANAGER) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-panel/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#080808] border border-border-strong max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-border-strong flex items-center justify-between bg-panel">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <div>
                  <h2 className="text-sm font-black tracking-widest uppercase text-content-primary">
                    PROFİL VE PRESET YÖNETİCİSİ
                  </h2>
                  <p className="text-[10px] text-content-tertiary font-sans">
                    Kayıtlı profilleri inceleyin, düzenleyin, dışa/içe aktarın.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-content-secondary hover:text-content-primary p-1 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Arama & Dışa/İçe Aktarma Araç Çubuğu */}
            <div className="p-4 border-b border-border-strong bg-panel flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
                <input
                  type="text"
                  placeholder="Profil adı veya visualizer modu ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-panel border border-border-strong pl-9 pr-3 py-2 text-xs text-content-primary font-sans placeholder:text-content-tertiary focus:border-accent outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* JSON Dışa Aktar */}
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-2 bg-surface hover:bg-hover text-content-secondary hover:text-content-primary border border-border-strong text-[9px] font-sans uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Profilleri JSON dosyası olarak indir"
                >
                  <Download size={12} />
                  <span>DIŞA AKTAR (.JSON)</span>
                </button>

                {/* JSON İçe Aktar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-surface hover:bg-hover text-content-secondary hover:text-content-primary border border-border-strong text-[9px] font-sans uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="JSON dosyasından profil yükle"
                >
                  <Upload size={12} />
                  <span>İÇE AKTAR</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImportFile}
                />

                {/* Varsayılanlara Sıfırla */}
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-2 bg-panel hover:bg-red-950/40 text-content-tertiary hover:text-red-400 border border-border-strong hover:border-red-900 text-[9px] font-sans uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Tüm profilleri varsayılana döndür"
                >
                  <RefreshCw size={12} />
                  <span>SIFIRLA</span>
                </button>
              </div>
            </div>

            {/* Profil Listesi */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-12 text-content-tertiary font-sans text-xs">
                  Aramanıza uygun profil bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProfiles.map((prof) => {
                    const isSelected = activeProfileId === prof.id;
                    const isEditing = editingProfileId === prof.id;

                    return (
                      <div
                        key={prof.id}
                        className={cn(
                          "border p-4 transition-all flex flex-col justify-between gap-3 relative",
                          isSelected
                            ? "bg-panel border-accent shadow-[0_0_20px_rgba(255,215,0,0.1)]"
                            : "bg-[#050505] border-border-strong/90 hover:border-border-strong"
                        )}
                      >
                        {/* Üst Kısım: İsim, Tip ve Rozetler */}
                        <div>
                          {isEditing ? (
                            <div className="space-y-2 mb-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-panel border border-accent p-1.5 text-xs text-content-primary font-bold uppercase"
                              />
                              <input
                                type="text"
                                placeholder="Açıklama..."
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-panel border border-border-strong p-1.5 text-[10px] text-content-secondary"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => setEditingProfileId(null)}
                                  className="px-2 py-1 text-[8px] font-sans uppercase bg-surface text-content-secondary border border-border-strong"
                                >
                                  İptal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(prof.id)}
                                  className="px-2 py-1 text-[8px] font-sans uppercase bg-accent text-black font-bold"
                                >
                                  Kaydet
                                </button>
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
                                    <span className="text-[7px] font-sans bg-hover text-content-secondary px-1 py-0.2 uppercase border border-border-strong">
                                      YERLEŞİK
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="text-[7px] font-sans bg-accent text-black px-1.5 py-0.2 font-bold uppercase">
                                      AKTİF
                                    </span>
                                  )}
                                </div>
                                {prof.description && (
                                  <p className="text-[9px] text-content-secondary font-sans mt-0.5">
                                    {prof.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {prof.settings.primaryColor && (
                                  <span 
                                    className="w-3 h-3 rounded-full border border-black" 
                                    style={{ backgroundColor: prof.settings.primaryColor }} 
                                    title={`Vurgu: ${prof.settings.primaryColor}`}
                                  />
                                )}
                                {prof.settings.secondaryColor && (
                                  <span 
                                    className="w-2.5 h-2.5 rounded-full border border-black" 
                                    style={{ backgroundColor: prof.settings.secondaryColor }} 
                                    title={`İkincil: ${prof.settings.secondaryColor}`}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Parametre Rozetleri */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            <span className="text-[8px] font-sans bg-panel text-content-secondary border border-border-strong px-1.5 py-0.5">
                              MOD: <b className="text-content-primary">{prof.settings.mode || 'STANDART'}</b>
                            </span>
                            <span className="text-[8px] font-sans bg-panel text-content-secondary border border-border-strong px-1.5 py-0.5">
                              ORAN: <b className="text-content-primary">{prof.settings.aspectRatio || '16/9'}</b>
                            </span>
                            <span className="text-[8px] font-sans bg-panel text-content-secondary border border-border-strong px-1.5 py-0.5">
                              FX: <b className="text-accent">{getActiveFxCount(prof.settings)}</b>
                            </span>
                            {prof.settings.visSpeed && (
                              <span className="text-[8px] font-sans bg-panel text-content-secondary border border-border-strong px-1.5 py-0.5">
                                HIZ: <b className="text-content-primary">{prof.settings.visSpeed}x</b>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Alt Butonlar */}
                        <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-1">
                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProfileId(prof.id);
                                  setEditName(prof.name);
                                  setEditDesc(prof.description || '');
                                }}
                                className="text-content-tertiary hover:text-content-secondary text-[9px] font-sans uppercase flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit3 size={11} />
                                <span>YENİDEN ADLANDIR</span>
                              </button>
                            )}

                            {!prof.isBuiltin && (
                              <button
                                type="button"
                                onClick={() => handleDelete(prof.id, prof.name)}
                                className="text-content-tertiary hover:text-red-400 text-[9px] font-sans uppercase flex items-center gap-1 cursor-pointer transition-colors ml-2"
                              >
                                <Trash2 size={11} />
                                <span>SİL</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleApplyProfile(prof);
                              setIsModalOpen(false);
                            }}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                              isSelected
                                ? "bg-hover text-content-secondary hover:bg-hover"
                                : "bg-accent hover:bg-white text-black font-black shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                            )}
                          >
                            {isSelected ? <Check size={12} /> : <Sparkles size={12} />}
                            <span>{isSelected ? 'YENİDEN UYGULA' : 'YÜKLE / KULLAN'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-strong bg-panel flex items-center justify-between text-[10px] font-sans text-content-tertiary">
              <span>Toplam {profiles.length} profil kayıtlı.</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-surface hover:bg-hover text-content-secondary uppercase font-black text-[9px] border border-border-strong cursor-pointer"
              >
                KAPAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
