import React, { useState, useEffect } from 'react';
import { 
  Globe, Key, Sliders, Sparkles, Activity, Shield, 
  LogOut, X, RefreshCw, BarChart3, Lock, CheckCircle2, 
  Menu, Eye, EyeOff, LayoutDashboard, ChevronRight,
  FileText, Image as ImageIcon, Search, Inbox, Users, History
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { Button, Input, Card, Badge } from './ui';
import { cn } from '../lib/utils';

// Import Modular CMS Tabs
import { CMSOverviewTab } from './admin/CMSOverviewTab';
import { CMSGlobalSettingsTab } from './admin/CMSGlobalSettingsTab';
import { CMSApiKeysTab } from './admin/CMSApiKeysTab';
import { CMSVisualizerManagerTab } from './admin/CMSVisualizerManagerTab';
import { CMSPresetManagerTab } from './admin/CMSPresetManagerTab';
import { CMSPagesTab } from './admin/CMSPagesTab';
import { CMSMediaLibraryTab } from './admin/CMSMediaLibraryTab';
import { CMSSeoAnalyticsTab } from './admin/CMSSeoAnalyticsTab';
import { CMSInboxFeedbackTab } from './admin/CMSInboxFeedbackTab';
import { CMSUserSecurityTab } from './admin/CMSUserSecurityTab';
import { CMSAuditLogsTab } from './admin/CMSAuditLogsTab';

interface AdminDashboardProps {
  onClose: () => void;
}

export type CMSTabId = 'overview' | 'global' | 'api' | 'visualizers' | 'presets' | 'pages' | 'media' | 'seo' | 'inbox' | 'users' | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { globalSettings, refreshConfig } = useCMS();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<CMSTabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(Boolean(data.authenticated));
        setIsLoadingAuth(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAuthError('Lütfen yönetici şifresini giriniz.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminPassword('');
        await refreshConfig();
      } else {
        setAuthError(data.error || 'Hatalı yönetici şifresi.');
      }
    } catch (err: any) {
      setAuthError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {}
    setIsAuthenticated(false);
  };

  // Nav items definition
  const NAV_ITEMS = [
    { id: 'overview' as CMSTabId, label: 'Genel Bakış & Durum', icon: LayoutDashboard, desc: 'Sistem durumu ve özet' },
    { id: 'global' as CMSTabId, label: 'Marka & Arayüz', icon: Globe, desc: 'Logo, başlık, menü, renkler' },
    { id: 'pages' as CMSTabId, label: 'Sayfa & Blog Yönetimi', icon: FileText, desc: 'Statik sayfalar, duyuru, yasal' },
    { id: 'media' as CMSTabId, label: 'Medya & Dosya Kütüphanesi', icon: ImageIcon, desc: 'Logo, filigran, 3D avatar' },
    { id: 'api' as CMSTabId, label: 'API & Entegrasyon', icon: Key, desc: 'Gemini, Suno, Webhook' },
    { id: 'visualizers' as CMSTabId, label: 'Görselleştiriciler', icon: Sliders, desc: '39+ motor katalog yönetimi' },
    { id: 'presets' as CMSTabId, label: 'Preset & Şablonlar', icon: Sparkles, desc: 'JSON import/export, düzenleme' },
    { id: 'seo' as CMSTabId, label: 'SEO & Analitik', icon: Search, desc: 'Meta tags, GA, sitemap' },
    { id: 'inbox' as CMSTabId, label: 'Gelen Kutusu & Destek', icon: Inbox, desc: 'Kullanıcı bildirim ve talepleri' },
    { id: 'users' as CMSTabId, label: 'Kullanıcı & Güvenlik', icon: Users, desc: 'Yönetici hesapları, 2FA' },
    { id: 'audit' as CMSTabId, label: 'Denetim Logları', icon: History, desc: 'İşlem geçmişi ve aktivite' },
  ];

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          <span className="text-xs font-mono text-content-secondary uppercase tracking-wider">
            Yönetici Oturumu Kontrol Ediliyor...
          </span>
        </div>
      </div>
    );
  }

  // 🔒 AUTHENTICATION LOGIN MODAL
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-panel border-accent/40 shadow-elevation-2 animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-elevation-1">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-content-primary">
              {globalSettings.appName || "GlitchFramer 2.0"} CMS Paneli
            </h2>
            <p className="text-xs text-content-secondary">
              Yönetici yapılandırma paneline erişmek için lütfen şifrenizi girin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary flex items-center justify-between">
                <span>Yönetici Şifresi</span>
                <span className="text-[10px] text-content-tertiary font-mono">Varsayılan: admin123</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300 animate-in fade-in">
                {authError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onClose}
                className="flex-1 text-xs"
              >
                Stüdyoya Dön
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="default"
                disabled={isSubmitting}
                className="flex-1 font-bold text-xs uppercase tracking-wider gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Giriş Yap
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // 🚀 AUTHENTICATED CMS DASHBOARD (Modern Full-Featured Sidebar Layout)
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* 1. ÜST HEADER BAR */}
      <header className="h-14 border-b border-border-subtle bg-panel px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-content-secondary hover:text-content-primary cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-accent text-accent-foreground font-black flex items-center justify-center text-xs shadow-elevation-1">
              CMS
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-content-primary flex items-center gap-1.5">
                {globalSettings.appName || "GlitchFramer"}
                <span className="text-[10px] text-accent font-mono">DASHBOARD</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Yönetici Oturumu
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleLogout}
            className="text-xs text-content-secondary hover:text-red-400 gap-1.5"
            title="Oturumu Kapat"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </Button>

          <div className="w-px h-4 bg-border-subtle" />

          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="p-1.5 text-content-secondary hover:text-content-primary rounded-lg"
            title="Paneli Kapat ve Stüdyoya Dön"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 2. ANA GÖVDE: SIDEBAR + İÇERİK ALANI */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR (Desktop & Mobile Drawer) */}
        <aside className={cn(
          "w-64 border-r border-border-subtle bg-surface flex flex-col justify-between shrink-0 transition-all duration-200 z-20",
          mobileMenuOpen ? "fixed inset-y-14 left-0 w-64 shadow-2xl" : "hidden md:flex"
        )}>
          <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-bold text-content-tertiary uppercase tracking-wider">
              Yönetim Modülleri
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer group",
                    isActive
                      ? "bg-accent text-accent-foreground font-bold shadow-sm"
                      : "text-content-secondary hover:text-content-primary hover:bg-hover"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-accent-foreground" : "text-content-tertiary group-hover:text-accent")} />
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-tight truncate">{item.label}</div>
                      <div className={cn("text-[10px] truncate", isActive ? "text-accent-foreground/80" : "text-content-tertiary")}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className={cn("w-3.5 h-3.5 opacity-40 shrink-0", isActive && "opacity-100")} />
                </button>
              );
            })}
          </div>

          {/* Sidebar Alt Bilgi */}
          <div className="p-4 border-t border-border-subtle bg-panel/50 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-content-tertiary font-mono">
              <span>CMS Veri Yolu:</span>
              <span className="text-emerald-400">/data/cms-config.json</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-content-tertiary font-mono">
              <span>Hızlı Yenileme:</span>
              <button 
                type="button" 
                onClick={() => refreshConfig()} 
                className="text-accent hover:underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Senkron Et
              </button>
            </div>
          </div>
        </aside>

        {/* 3. DİNAMİK İÇERİK ALANI */}
        <main className="flex-1 bg-background overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && (
              <CMSOverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />
            )}
            {activeTab === 'global' && (
              <CMSGlobalSettingsTab />
            )}
            {activeTab === 'pages' && (
              <CMSPagesTab />
            )}
            {activeTab === 'media' && (
              <CMSMediaLibraryTab />
            )}
            {activeTab === 'api' && (
              <CMSApiKeysTab />
            )}
            {activeTab === 'visualizers' && (
              <CMSVisualizerManagerTab />
            )}
            {activeTab === 'presets' && (
              <CMSPresetManagerTab />
            )}
            {activeTab === 'seo' && (
              <CMSSeoAnalyticsTab />
            )}
            {activeTab === 'inbox' && (
              <CMSInboxFeedbackTab />
            )}
            {activeTab === 'users' && (
              <CMSUserSecurityTab />
            )}
            {activeTab === 'audit' && (
              <CMSAuditLogsTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
