import React, { useState } from 'react';
import { 
  Activity, Globe, Key, Sliders, Sparkles, Shield, 
  CheckCircle2, AlertTriangle, RefreshCw, Zap, Server, 
  RotateCcw, ExternalLink, Cpu 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { VISUALIZER_MODES } from '../../lib/visualizerCatalog';
import { BUILTIN_PROFILES } from '../../services/presetService';
import { Button, Card, Badge } from '../ui';

interface CMSOverviewTabProps {
  onNavigateTab: (tab: 'global' | 'api' | 'visualizers' | 'presets') => void;
}

export const CMSOverviewTab: React.FC<CMSOverviewTabProps> = ({ onNavigateTab }) => {
  const { config, globalSettings, apiKeys, visualizerConfig, customPresets, resetToDefaults, testApiKey } = useCMS();

  const [isResetting, setIsResetting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [quickTestRunning, setQuickTestRunning] = useState(false);
  const [quickTestMsg, setQuickTestMsg] = useState<string | null>(null);

  const totalVisualizers = VISUALIZER_MODES.length;
  const disabledVisualizersCount = visualizerConfig.disabledVisualizers?.length || 0;
  const activeVisualizersCount = totalVisualizers - disabledVisualizersCount;

  const totalPresetsCount = BUILTIN_PROFILES.length + customPresets.length;

  const handleQuickTest = async () => {
    setQuickTestRunning(true);
    setQuickTestMsg(null);
    const res = await testApiKey('gemini');
    setQuickTestRunning(false);
    setQuickTestMsg(res.message);
    setTimeout(() => setQuickTestMsg(null), 5000);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await resetToDefaults();
    setIsResetting(false);
    setResetModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Üst Karşılama Banner */}
      <div className="p-6 bg-surface rounded-xl border border-border-subtle relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="accent" className="text-[10px] uppercase font-bold tracking-wider">
              CMS MOTORU AKTİF
            </Badge>
            <span className="text-xs text-content-tertiary font-mono">
              v2.5.0 Production
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight text-content-primary">
            {globalSettings.appName || "GlitchFramer 2.0"} İçerik & Sistem Paneli
          </h2>
          <p className="text-xs text-content-secondary max-w-xl">
            Tüm arayüz değişkenlerini, AI entegrasyonlarını, 60 FPS görselleştirici kataloglarını ve ses şablonlarını tek merkezden dinamik olarak yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleQuickTest}
            disabled={quickTestRunning}
            className="gap-1.5 text-xs font-bold"
          >
            {quickTestRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-accent" />}
            Hızlı AI Bağlantı Testi
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            className="text-red-400 hover:text-red-300 border-red-900/40 gap-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Fabrika Ayarlarına Dön
          </Button>
        </div>

        {quickTestMsg && (
          <div className="absolute bottom-2 left-6 right-6 text-xs text-emerald-400 bg-black/80 px-3 py-1.5 rounded border border-emerald-500/40 animate-in fade-in">
            {quickTestMsg}
          </div>
        )}
      </div>

      {/* 4 Ana Metrik Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kart 1: Global Ayarlar */}
        <Card 
          onClick={() => onNavigateTab('global')}
          className="p-5 cursor-pointer hover:border-accent transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-content-tertiary tracking-wider">Marka & Arayüz</span>
            <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-content-primary truncate">
              {globalSettings.appName}
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              Tema: <span className="font-mono text-accent">{globalSettings.theme?.primaryColor || '#FFD700'}</span>
            </p>
          </div>
          <div className="text-[11px] text-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ayarları Düzenle →
          </div>
        </Card>

        {/* Kart 2: API Entegrasyonları */}
        <Card 
          onClick={() => onNavigateTab('api')}
          className="p-5 cursor-pointer hover:border-accent transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-content-tertiary tracking-wider">API Entegrasyonu</span>
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-content-primary flex items-center gap-2">
              {apiKeys.hasGeminiKey ? "Gemini Aktif" : "Eksik Anahtar"}
              <span className={`w-2 h-2 rounded-full ${apiKeys.hasGeminiKey ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </div>
            <p className="text-xs text-content-secondary mt-0.5 truncate">
              Model: {apiKeys.geminiModel || 'gemini-2.5-flash'}
            </p>
          </div>
          <div className="text-[11px] text-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Anahtarları Yönet →
          </div>
        </Card>

        {/* Kart 3: Visualizer Kataloğu */}
        <Card 
          onClick={() => onNavigateTab('visualizers')}
          className="p-5 cursor-pointer hover:border-accent transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-content-tertiary tracking-wider">Görselleştiriciler</span>
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-content-primary">
              {activeVisualizersCount} / {totalVisualizers} Aktif
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              {disabledVisualizersCount > 0 ? `${disabledVisualizersCount} mod devre dışı` : 'Tüm motorlar yayında'}
            </p>
          </div>
          <div className="text-[11px] text-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Kataloğu Düzenle →
          </div>
        </Card>

        {/* Kart 4: Presetler */}
        <Card 
          onClick={() => onNavigateTab('presets')}
          className="p-5 cursor-pointer hover:border-accent transition-all group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-content-tertiary tracking-wider">Preset Profilleri</span>
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-content-primary">
              {totalPresetsCount} Toplam Profil
            </div>
            <p className="text-xs text-content-secondary mt-0.5">
              {customPresets.length} Özel CMS / {BUILTIN_PROFILES.length} Yerleşik
            </p>
          </div>
          <div className="text-[11px] text-accent font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Presetleri Yönet →
          </div>
        </Card>
      </div>

      {/* Sistem Mimarisi & DSP Bilgilendirme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" />
            Sistem Çalışma Zamanı & Render Motoru
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-surface rounded border border-border-subtle">
              <span className="text-content-secondary">Render Pipeline (SSR):</span>
              <span className="font-mono font-bold text-content-primary">Node Canvas + FFmpeg H.264 MP4</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-surface rounded border border-border-subtle">
              <span className="text-content-secondary">Yerel Kayıt (CSR):</span>
              <span className="font-mono font-bold text-content-primary">MediaRecorder WebM 60 FPS</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-surface rounded border border-border-subtle">
              <span className="text-content-secondary">DSP Ses Çözümleyici:</span>
              <span className="font-mono font-bold text-content-primary">Web Audio API (Spotify -14 LUFS)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-surface rounded border border-border-subtle">
              <span className="text-content-secondary">Veri Kalıcılığı (CMS):</span>
              <span className="font-mono font-bold text-emerald-400">/data/cms-config.json (Canlı Senkron)</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-content-primary uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Güvenlik & Yönetici Oturumu
          </h3>

          <div className="space-y-3 text-xs text-content-secondary">
            <p>
              Admin oturumu <strong>HttpOnly ve SameSite=Strict</strong> korumalı çerezlerle yönetilir. Şifre doğrulaması zamanlama saldırılarına (timing-attack) karşı dirençlidir.
            </p>
            <div className="p-3 bg-panel border border-border-subtle rounded space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>Oturum Süresi (TTL):</span>
                <span className="text-content-primary font-bold">8 Saat</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>API Anahtar Maskeleme:</span>
                <span className="text-emerald-400 font-bold">SHA-256 + Kısmi Maskeleme</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sıfırlama Onay Modalı */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-panel border-red-900/60 shadow-elevation-2 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-content-primary">Fabrika Ayarlarına Dönülsün mü?</h3>
            </div>

            <p className="text-xs text-content-secondary leading-relaxed">
              Bu işlem tüm özel marka ayarlarını, renk temasını ve görselleştirici katalog durumlarını varsayılan fabrika değerlerine sıfırlayacaktır.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetModalOpen(false)}
              >
                Vazgeç
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="bg-red-600 hover:bg-red-500 text-white gap-1.5"
              >
                {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Evet, Sıfırla
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
