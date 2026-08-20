import React, { useState } from 'react';
import { 
  Key, Shield, Zap, Eye, EyeOff, CheckCircle2, XCircle, 
  RefreshCw, Save, Cpu, Sparkles, ExternalLink, Activity 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Button, Input, Card, Badge } from '../ui';
import { cn } from '../../lib/utils';

export const CMSApiKeysTab: React.FC = () => {
  const { apiKeys, updateApiKeys, testApiKey } = useCMS();

  // Form states (Inputs are empty unless user explicitly wants to update them)
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [sunoKeyInput, setSunoKeyInput] = useState('');
  const [webhookUrlInput, setWebhookUrlInput] = useState(apiKeys.customWebhookUrl || '');
  const [selectedModel, setSelectedModel] = useState(apiKeys.geminiModel || 'gemini-2.5-flash');

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSunoKey, setShowSunoKey] = useState(false);

  // Status & Testing states
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  const [isTestingSuno, setIsTestingSuno] = useState(false);
  const [sunoTestResult, setSunoTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const payload: {
      geminiApiKey?: string;
      sunoApiKey?: string;
      customWebhookUrl?: string;
      geminiModel?: string;
    } = {
      customWebhookUrl: webhookUrlInput,
      geminiModel: selectedModel
    };

    if (geminiKeyInput.trim()) {
      payload.geminiApiKey = geminiKeyInput.trim();
    }
    if (sunoKeyInput.trim()) {
      payload.sunoApiKey = sunoKeyInput.trim();
    }

    const ok = await updateApiKeys(payload);
    setIsSaving(false);

    if (ok) {
      setGeminiKeyInput('');
      setSunoKeyInput('');
      setSaveMessage('API anahtarları ve entegrasyon ayarları başarıyla kaydedildi.');
      setTimeout(() => setSaveMessage(null), 4000);
    } else {
      setSaveMessage('Ayarlar kaydedilirken hata oluştu.');
    }
  };

  const handleTestGemini = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    const result = await testApiKey('gemini', geminiKeyInput.trim() || undefined);
    setIsTestingGemini(false);
    setGeminiTestResult(result);
  };

  const handleTestSuno = async () => {
    setIsTestingSuno(true);
    setSunoTestResult(null);
    const result = await testApiKey('suno', sunoKeyInput.trim() || undefined);
    setIsTestingSuno(false);
    setSunoTestResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Üst Bilgi Barı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-content-primary flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" />
            API ve Dış Servis Entegrasyon Yönetimi
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            Google Gemini ve Suno AI anahtarlarını güvenli biçimde tanımlayın, doğrulayın ve bağlantılarını test edin.
          </p>
        </div>

        {saveMessage && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {saveMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSaveKeys} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. GOOGLE GEMINI AI ENTEGRASYONU */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-content-primary">Google Gemini AI</h3>
                  <span className="text-[10px] text-content-tertiary">Otomatik Şarkı Sözü Senkronizasyonu & Analiz</span>
                </div>
              </div>

              <Badge variant={apiKeys.hasGeminiKey ? "accent" : "outline"} className="text-[10px]">
                {apiKeys.hasGeminiKey ? "✓ AKTİF / TANIMLI" : "EKSİK"}
              </Badge>
            </div>

            {/* Mevcut Durum */}
            <div className="bg-surface p-3 rounded-lg border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-content-secondary">Kayıtlı Anahtar (Maskeli):</span>
                <span className="font-mono text-xs font-bold text-content-primary">
                  {apiKeys.hasGeminiKey ? apiKeys.maskedGeminiKey : "Tanımlanmamış (.env veya panelden girin)"}
                </span>
              </div>
            </div>

            {/* Yeni / Güncel Anahtar Girişi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary">
                {apiKeys.hasGeminiKey ? "Yeni GEMINI_API_KEY Gir (Değiştirmek İçin)" : "GEMINI_API_KEY Giriniz"}
              </label>
              <div className="relative">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder={apiKeys.hasGeminiKey ? "Yeni anahtar girmek için yazın..." : "AIzaSy..."}
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary cursor-pointer p-1"
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-content-tertiary block">
                Anahtarlar tarayıcıda plain-text saklanmaz; güvenli server route üzerinden iletilir.
              </span>
            </div>

            {/* Model Seçimi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary">Varsayılan Gemini Modeli</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-md p-2 text-xs text-content-primary focus:outline-none focus:border-accent"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Önerilen - Hızlı & Yüksek Doğruluk)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>

            {/* Test Butonu & Sonuç */}
            <div className="pt-2 border-t border-border-subtle space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestGemini}
                disabled={isTestingGemini || (!apiKeys.hasGeminiKey && !geminiKeyInput.trim())}
                className="w-full gap-2 text-xs font-bold justify-center"
              >
                {isTestingGemini ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-accent" />}
                {isTestingGemini ? "Bağlantı Test Ediliyor..." : "⚡ Gemini API Bağlantısını Test Et"}
              </Button>

              {geminiTestResult && (
                <div className={cn(
                  "p-3 rounded-lg border text-xs space-y-1 animate-in fade-in-50 duration-200",
                  geminiTestResult.success 
                    ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                    : "bg-red-950/30 border-red-800/60 text-red-300"
                )}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {geminiTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                      {geminiTestResult.success ? "Bağlantı Başarılı" : "Test Başarısız"}
                    </span>
                    {geminiTestResult.latencyMs > 0 && (
                      <span className="font-mono text-[10px] text-content-tertiary">
                        {geminiTestResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{geminiTestResult.message}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 2. SUNO AI & HARİCİ WEBHOOK ENTEGRASYONU */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-content-primary">Suno AI & Webhook</h3>
                  <span className="text-[10px] text-content-tertiary">Suno Link Çözümleyici & Webhook Entegrasyonu</span>
                </div>
              </div>

              <Badge variant={apiKeys.hasSunoKey ? "accent" : "outline"} className="text-[10px]">
                {apiKeys.hasSunoKey ? "✓ ÖZEL TOKEN" : "GENEL API"}
              </Badge>
            </div>

            {/* Mevcut Durum */}
            <div className="bg-surface p-3 rounded-lg border border-border-subtle space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-content-secondary">Suno Token (Maskeli):</span>
                <span className="font-mono text-xs font-bold text-content-primary">
                  {apiKeys.hasSunoKey ? apiKeys.maskedSunoKey : "Genel Suno Çözümleyici Modunda"}
                </span>
              </div>
            </div>

            {/* Suno Token Girişi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary">
                Suno API Key / Token (Opsiyonel)
              </label>
              <div className="relative">
                <Input
                  type={showSunoKey ? "text" : "password"}
                  value={sunoKeyInput}
                  onChange={(e) => setSunoKeyInput(e.target.value)}
                  placeholder="Suno API Bearer token..."
                  className="font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSunoKey(!showSunoKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary cursor-pointer p-1"
                >
                  {showSunoKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Özel Webhook URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-content-secondary">
                Özel Bildirim / Render Webhook URL
              </label>
              <Input
                value={webhookUrlInput}
                onChange={(e) => setWebhookUrlInput(e.target.value)}
                placeholder="https://your-server.com/api/vidframer-webhook"
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-content-tertiary block">
                Render tamamlandığında veya hata oluştuğunda JSON payload ile tetiklenir.
              </span>
            </div>

            {/* Suno Test Butonu */}
            <div className="pt-2 border-t border-border-subtle space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestSuno}
                disabled={isTestingSuno}
                className="w-full gap-2 text-xs font-bold justify-center"
              >
                {isTestingSuno ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-amber-400" />}
                {isTestingSuno ? "Suno Test Ediliyor..." : "⚡ Suno API Bağlantısını Test Et"}
              </Button>

              {sunoTestResult && (
                <div className={cn(
                  "p-3 rounded-lg border text-xs space-y-1 animate-in fade-in-50 duration-200",
                  sunoTestResult.success 
                    ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300"
                    : "bg-amber-950/30 border-amber-800/60 text-amber-300"
                )}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {sunoTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-amber-400" />}
                      {sunoTestResult.success ? "Erişim Doğrulandı" : "Ağ Bildirimi"}
                    </span>
                    {sunoTestResult.latencyMs > 0 && (
                      <span className="font-mono text-[10px] text-content-tertiary">
                        {sunoTestResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{sunoTestResult.message}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Alt Kaydetme Barı */}
        <div className="flex items-center justify-between p-4 bg-panel border border-border-subtle rounded-lg">
          <div className="text-xs text-content-secondary flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Tüm anahtarlar TLS/HTTPS üzerinden şifreli iletilir ve sunucu ortamında güvenle saklanır.
          </div>

          <Button
            type="submit"
            variant="accent"
            size="default"
            disabled={isSaving}
            className="gap-2 px-6 font-bold text-xs uppercase tracking-wider"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Tüm API Ayarlarını Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
};
