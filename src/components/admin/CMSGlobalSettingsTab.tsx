import React, { useState } from 'react';
import { 
  Globe, Layout, Palette, Upload, Plus, Trash2, Save, 
  CheckCircle2, RefreshCw, Sparkles, ExternalLink, Image as ImageIcon 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { CMSGlobalSettings, CMSHeaderLink, CMSFooterLink } from '../../types';
import { Button, Input, Card, Badge } from '../ui';
import { cn } from '../../lib/utils';

export const CMSGlobalSettingsTab: React.FC = () => {
  const { globalSettings, updateGlobalSettings } = useCMS();
  const [form, setForm] = useState<CMSGlobalSettings>({ ...globalSettings });
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'interface' | 'theme'>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if external changes occur
  React.useEffect(() => {
    setForm({ ...globalSettings });
  }, [globalSettings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    const ok = await updateGlobalSettings(form);
    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // Logo file upload handler (converts to base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo dosyası 2MB'den küçük olmalıdır.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm(prev => ({
          ...prev,
          logoUrl: reader.result as string,
          logoType: 'image'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Header Links management
  const addHeaderLink = () => {
    const newLink: CMSHeaderLink = {
      id: `link_${Date.now()}`,
      label: 'Yeni Menü',
      url: '/'
    };
    setForm(prev => ({
      ...prev,
      headerLinks: [...prev.headerLinks, newLink]
    }));
  };

  const updateHeaderLink = (id: string, field: 'label' | 'url', val: string) => {
    setForm(prev => ({
      ...prev,
      headerLinks: prev.headerLinks.map(l => l.id === id ? { ...l, [field]: val } : l)
    }));
  };

  const removeHeaderLink = (id: string) => {
    setForm(prev => ({
      ...prev,
      headerLinks: prev.headerLinks.filter(l => l.id !== id)
    }));
  };

  // Footer Links management
  const addFooterLink = () => {
    const newLink: CMSFooterLink = {
      id: `flink_${Date.now()}`,
      label: 'Yeni Bağlantı',
      url: '#'
    };
    setForm(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, newLink]
    }));
  };

  const updateFooterLink = (id: string, field: 'label' | 'url', val: string) => {
    setForm(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.map(l => l.id === id ? { ...l, [field]: val } : l)
    }));
  };

  const removeFooterLink = (id: string) => {
    setForm(prev => ({
      ...prev,
      footerLinks: prev.footerLinks.filter(l => l.id !== id)
    }));
  };

  // Preset themes
  const PRESET_PALETTES = [
    { name: 'Glitch Cyber (Default)', primary: '#FFD700', secondary: '#FFFFFF', accent: '#0057FF', bg: '#060608' },
    { name: 'Neon Synthwave', primary: '#FF007F', secondary: '#00F0FF', accent: '#7928CA', bg: '#0A051B' },
    { name: 'Monochrome Noir', primary: '#FFFFFF', secondary: '#A1A1AA', accent: '#52525B', bg: '#09090B' },
    { name: 'Emerald Studio', primary: '#10B981', secondary: '#6EE7B7', accent: '#059669', bg: '#021B13' },
    { name: 'Sunset Phonk', primary: '#FF6B00', secondary: '#FFD166', accent: '#EF476F', bg: '#100B14' }
  ];

  return (
    <div className="space-y-6">
      {/* Üst Navigasyon & Kaydet Barı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-content-primary flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Genel Uygulama Ayarları (Global Settings)
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Marka kimliği, sekme başlıkları, üst/alt gezinme ve renk temasını gerçek zamanlı yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4" /> Değişiklikler Kaydedildi
            </span>
          )}
          <Button
            variant="accent"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 px-5 text-xs font-bold uppercase tracking-wider"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Ayarları Kaydet
          </Button>
        </div>
      </div>

      {/* Alt Sekmeler: Markalaşma / Arayüz / Tema */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('branding')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2",
            activeSubTab === 'branding' 
              ? "bg-accent text-accent-foreground shadow-sm" 
              : "text-content-secondary hover:text-content-primary"
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Markalaşma & Meta
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('interface')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2",
            activeSubTab === 'interface' 
              ? "bg-accent text-accent-foreground shadow-sm" 
              : "text-content-secondary hover:text-content-primary"
          )}
        >
          <Layout className="w-3.5 h-3.5" />
          Header & Footer
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('theme')}
          className={cn(
            "px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-2",
            activeSubTab === 'theme' 
              ? "bg-accent text-accent-foreground shadow-sm" 
              : "text-content-secondary hover:text-content-primary"
          )}
        >
          <Palette className="w-3.5 h-3.5" />
          Tema & Renk Paleti
        </button>
      </div>

      {/* 1. MARKALAŞMA & META SEKMESİ */}
      {activeSubTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent" />
              Uygulama Logosu & Marka Görseli
            </h3>

            <div className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border-subtle">
              <div className="w-16 h-16 rounded-lg bg-panel border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="w-10 h-10 rounded bg-accent text-accent-foreground font-black flex items-center justify-center text-sm shadow-elevation-1">
                    VF
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-bold rounded cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Yeni Logo Yükle
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {form.logoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForm(f => ({ ...f, logoUrl: '', logoType: 'icon' }))}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-content-tertiary">
                  PNG, SVG veya JPG (Maks. 2MB). Yüklenen logo üst menüde ve dışa aktarımlarda görüntülenir.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary">Logo URL (Alternatif Uzak Bağlantı)</label>
              <Input
                value={form.logoUrl || ''}
                onChange={(e) => setForm(f => ({ ...f, logoUrl: e.target.value, logoType: e.target.value ? 'image' : 'icon' }))}
                placeholder="https://example.com/logo.png"
                className="text-xs font-mono"
              />
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              Sekme Başlığı & SEO Meta Bilgileri
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Uygulama Adı (App Name)</label>
                <Input
                  value={form.appName}
                  onChange={(e) => setForm(f => ({ ...f, appName: e.target.value }))}
                  placeholder="GlitchFramer 2.0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Uygulama Alt Başlığı (Subtitle)</label>
                <Input
                  value={form.appSubtitle}
                  onChange={(e) => setForm(f => ({ ...f, appSubtitle: e.target.value }))}
                  placeholder="Audio Visualizer & Video Engine"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Tarayıcı Sekme Başlığı (Document Title)</label>
                <Input
                  value={form.tabTitle}
                  onChange={(e) => setForm(f => ({ ...f, tabTitle: e.target.value }))}
                  placeholder="GlitchFramer 2.0 | 60 FPS Audio Visualizer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Meta Açıklaması (Meta Description)</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full bg-surface border border-border-subtle rounded-md p-2.5 text-xs text-content-primary focus:outline-none focus:border-accent"
                  placeholder="Arama motorları ve sosyal paylaşımlar için açıklama..."
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 2. HEADER & FOOTER SEKMESİ */}
      {activeSubTab === 'interface' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-50 duration-200">
          {/* Header Metin & Linkleri */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                Üst Menü (Header) Ayarları
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={addHeaderLink}
                className="gap-1.5 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" /> Menü Linki Ekle
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Header Başlık Metni</label>
                <Input
                  value={form.headerTitle}
                  onChange={(e) => setForm(f => ({ ...f, headerTitle: e.target.value }))}
                  placeholder="GlitchFramer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Header Rozet / Sürüm Metni</label>
                <Input
                  value={form.headerSubtitle}
                  onChange={(e) => setForm(f => ({ ...f, headerSubtitle: e.target.value }))}
                  placeholder="STUDIO 2.0"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <label className="text-xs font-bold text-content-tertiary uppercase tracking-wider block">
                  Header Navigasyon Linkleri ({form.headerLinks.length})
                </label>
                {form.headerLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 bg-surface p-2 rounded border border-border-subtle">
                    <Input
                      value={link.label}
                      onChange={(e) => updateHeaderLink(link.id, 'label', e.target.value)}
                      placeholder="Başlık (örn: Studio)"
                      className="w-1/3 text-xs"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateHeaderLink(link.id, 'url', e.target.value)}
                      placeholder="URL (örn: /)"
                      className="flex-1 text-xs font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => removeHeaderLink(link.id)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Footer Metin & Linkleri */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-accent" />
                Alt Bilgi (Footer) Ayarları
              </h3>
              <Button
                variant="outline"
                size="xs"
                onClick={addFooterLink}
                className="gap-1.5 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" /> Footer Linki Ekle
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-content-secondary">Telif Hakkı & Footer Metni</label>
                <textarea
                  value={form.footerText}
                  onChange={(e) => setForm(f => ({ ...f, footerText: e.target.value }))}
                  rows={2}
                  className="w-full bg-surface border border-border-subtle rounded-md p-2.5 text-xs text-content-primary focus:outline-none focus:border-accent"
                  placeholder="© 2026 GlitchFramer Studio. 60 FPS Cyberpunk Müzik Render Motoru."
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <label className="text-xs font-bold text-content-tertiary uppercase tracking-wider block">
                  Footer Linkleri ({form.footerLinks.length})
                </label>
                {form.footerLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 bg-surface p-2 rounded border border-border-subtle">
                    <Input
                      value={link.label}
                      onChange={(e) => updateFooterLink(link.id, 'label', e.target.value)}
                      placeholder="Başlık (örn: Gizlilik)"
                      className="w-1/3 text-xs"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateFooterLink(link.id, 'url', e.target.value)}
                      placeholder="URL (örn: #gizlilik)"
                      className="flex-1 text-xs font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => removeFooterLink(link.id)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. TEMA & RENK PALETİ SEKMESİ */}
      {activeSubTab === 'theme' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Hazır Paletler */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Küratörlü Hazır Renk Paletleri (Hızlı Seçim)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {PRESET_PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => {
                    setForm(f => ({
                      ...f,
                      theme: {
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary,
                        accentColor: palette.accent,
                        bgDark: palette.bg
                      }
                    }));
                  }}
                  className="p-3 bg-surface hover:bg-hover border border-border-subtle hover:border-accent rounded-lg text-left transition-all cursor-pointer space-y-2 group"
                >
                  <span className="text-xs font-bold text-content-primary group-hover:text-accent truncate block">
                    {palette.name}
                  </span>
                  <div className="flex items-center gap-1.5 h-5 rounded overflow-hidden p-0.5 bg-black/40">
                    <div className="flex-1 h-full rounded-sm" style={{ backgroundColor: palette.primary }} title="Primary" />
                    <div className="flex-1 h-full rounded-sm" style={{ backgroundColor: palette.secondary }} title="Secondary" />
                    <div className="flex-1 h-full rounded-sm" style={{ backgroundColor: palette.accent }} title="Accent" />
                    <div className="w-4 h-full rounded-sm border border-white/20" style={{ backgroundColor: palette.bg }} title="Dark BG" />
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Özel Hex Renk Ayarları & Canlı Önizleme */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 space-y-4 lg:col-span-2">
              <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-accent" />
                Özel Hex Renk Tanımları
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Color */}
                <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-content-primary">Ana Renk (Primary Color)</label>
                    <span className="text-[10px] font-mono text-content-tertiary">{form.theme.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.theme.primaryColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, primaryColor: e.target.value } }))}
                      className="w-9 h-9 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={form.theme.primaryColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, primaryColor: e.target.value } }))}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-content-primary">İkincil Renk (Secondary Color)</label>
                    <span className="text-[10px] font-mono text-content-tertiary">{form.theme.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.theme.secondaryColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, secondaryColor: e.target.value } }))}
                      className="w-9 h-9 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={form.theme.secondaryColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, secondaryColor: e.target.value } }))}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-content-primary">Vurgu Rengi (Accent Color)</label>
                    <span className="text-[10px] font-mono text-content-tertiary">{form.theme.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.theme.accentColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, accentColor: e.target.value } }))}
                      className="w-9 h-9 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={form.theme.accentColor}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, accentColor: e.target.value } }))}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Background Dark */}
                <div className="space-y-1.5 bg-surface p-3 rounded-lg border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-content-primary">Karanlık Arka Plan (Dark BG)</label>
                    <span className="text-[10px] font-mono text-content-tertiary">{form.theme.bgDark}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.theme.bgDark}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, bgDark: e.target.value } }))}
                      className="w-9 h-9 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <Input
                      value={form.theme.bgDark}
                      onChange={(e) => setForm(f => ({ ...f, theme: { ...f.theme, bgDark: e.target.value } }))}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Canlı UI Önizleme Kartı */}
            <Card className="p-5 space-y-4 flex flex-col justify-between" style={{ backgroundColor: form.theme.bgDark }}>
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary block">
                  Canlı Tema Önizleme
                </span>
                
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: form.theme.primaryColor }}>
                      {form.appName || "GlitchFramer"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ backgroundColor: form.theme.accentColor, color: '#fff' }}>
                      CANLI
                    </span>
                  </div>

                  <p className="text-xs" style={{ color: form.theme.secondaryColor }}>
                    Önizleme metni ve spektrum rengi seçilen renk kodlarına anında uyarlanır.
                  </p>

                  <div className="h-2 w-full rounded-full overflow-hidden bg-black/40 flex">
                    <div className="w-1/3 h-full" style={{ backgroundColor: form.theme.primaryColor }} />
                    <div className="w-1/3 h-full" style={{ backgroundColor: form.theme.secondaryColor }} />
                    <div className="w-1/3 h-full" style={{ backgroundColor: form.theme.accentColor }} />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-content-tertiary text-center">
                Kaydet butonuna bastığınızda tema tüm uygulamaya anında uygulanır.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
