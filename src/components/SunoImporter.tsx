import React, { useState } from "react";
import { 
  Music, Link2, Sparkles, AlertCircle, CheckCircle2, 
  Loader2, Play, Zap, X, Download, Code
} from "lucide-react";
import { NormalizedSunoTrack } from "../types";
import { sunoImporter } from "../services/SunoImporterService";
import { Button, Badge, Input } from "./ui";
import { cn } from "../lib/utils";

interface SunoImporterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onImportTrack: (track: NormalizedSunoTrack, audioBlob?: Blob | null) => void;
  inline?: boolean;
}

const SAMPLE_SUNO_LINKS = [
  {
    title: "Örnek 1 (Kısa Link)",
    url: "https://suno.com/s/a2hf69thdnYq25lG"
  },
  {
    title: "Örnek 2 (Song Link)",
    url: "https://suno.com/song/387431e1-e123-4886-90c7-05c04df3ef61"
  }
];

export const SunoImporter: React.FC<SunoImporterProps> = ({
  isOpen = true,
  onClose,
  onImportTrack,
  inline = false
}) => {
  const [inputMode, setInputMode] = useState<'URL' | 'JSON'>('URL');
  const [urlInput, setUrlInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectedTrack, setInspectedTrack] = useState<NormalizedSunoTrack | null>(null);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState(false);
  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');

  const handleInspect = async (overrideValue?: string) => {
    const rawTarget = overrideValue || (inputMode === 'URL' ? urlInput : jsonInput);
    const target = rawTarget.trim();
    if (!target) {
      setError(inputMode === 'URL' ? "Lütfen geçerli bir Suno bağlantısı girin." : "Lütfen geçerli bir Suno JSON verisi girin.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setInspectedTrack(null);

    try {
      const track = await sunoImporter.importTrack(target);
      setInspectedTrack(track);
      setStep('PREVIEW');
    } catch (err: any) {
      setError(err?.message || "Suno şarkısı çözümlenemedi. Lütfen bağlantıyı veya JSON verisini kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!inspectedTrack) return;

    setIsDownloadingAudio(true);
    let blob: Blob | null = null;

    try {
      blob = await sunoImporter.fetchAudioBlob(inspectedTrack.audioUrl);
    } catch (e) {
      console.warn("Audio blob önbellekleme uyarısı, stream üzerinden devam ediliyor:", e);
    }

    setIsDownloadingAudio(false);
    onImportTrack(inspectedTrack, blob);
    if (onClose) onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const trimmed = text.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          setInputMode('JSON');
          setJsonInput(trimmed);
          handleInspect(trimmed);
        } else {
          setInputMode('URL');
          setUrlInput(trimmed);
          handleInspect(trimmed);
        }
      }
    } catch (e) {
      // Clipboard fallback
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFormat = (fmt: 'LRC' | 'ELRC' | 'SRT' | 'VTT' | 'TTML' | 'JSON') => {
    if (!inspectedTrack) return;
    const safeTitle = (inspectedTrack.title || "suno_track").toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
    
    switch (fmt) {
      case 'LRC':
        downloadFile(sunoImporter.exportToLrc(inspectedTrack.syncedLines), `${safeTitle}.lrc`, "text/plain;charset=utf-8");
        break;
      case 'ELRC':
        downloadFile(sunoImporter.exportToEnhancedLrc(inspectedTrack.syncedLines), `${safeTitle}.elrc`, "text/plain;charset=utf-8");
        break;
      case 'SRT':
        downloadFile(sunoImporter.exportToSrt(inspectedTrack.syncedLines), `${safeTitle}.srt`, "text/plain;charset=utf-8");
        break;
      case 'VTT':
        downloadFile(sunoImporter.exportToVtt(inspectedTrack.syncedLines), `${safeTitle}.vtt`, "text/vtt;charset=utf-8");
        break;
      case 'TTML':
        downloadFile(sunoImporter.exportToTtml(inspectedTrack.syncedLines, inspectedTrack.title, inspectedTrack.artist), `${safeTitle}.ttml`, "application/xml;charset=utf-8");
        break;
      case 'JSON':
        downloadFile(JSON.stringify(inspectedTrack, null, 2), `${safeTitle}_suno.json`, "application/json;charset=utf-8");
        break;
    }
  };

  const resetState = () => {
    setInspectedTrack(null);
    setStep('INPUT');
    setError(null);
    setUrlInput("");
    setJsonInput("");
  };

  const content = (
    <div className="space-y-4 text-content-primary">
      {/* Header & Tagline */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center font-black">
            <Zap size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-content-primary uppercase tracking-wider">
                SUNO AI LYRICS & TRACK STUDIO
              </h3>
              <Badge variant="accent" className="text-[9px]">
                v2.5
              </Badge>
            </div>
            <p className="text-[10px] text-content-secondary">
              Suno linki veya JSON verisiyle anında ses, kapak, lirik ve senkronizasyon aktar
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={15} />
          </Button>
        )}
      </div>

      {/* STEP 1: URL / JSON Girişi */}
      {step === 'INPUT' && (
        <div className="space-y-3">
          {/* Giriş Modu Seçimi */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border-subtle">
            <Button
              variant={inputMode === 'URL' ? 'accent' : 'ghost'}
              size="xs"
              onClick={() => setInputMode('URL')}
              className="flex-1 font-mono uppercase font-bold text-[10px] gap-1.5"
            >
              <Link2 size={12} /> SUNO LINKI / ID
            </Button>
            <Button
              variant={inputMode === 'JSON' ? 'accent' : 'ghost'}
              size="xs"
              onClick={() => setInputMode('JSON')}
              className="flex-1 font-mono uppercase font-bold text-[10px] gap-1.5"
            >
              <Code size={12} /> HAM JSON / API
            </Button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-content-secondary uppercase">
              <span>{inputMode === 'URL' ? "SUNO ŞARKI BAĞLANTISI (URL VEYA UUID)" : "HAM SUNO API JSON VERİSİ"}</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-accent hover:underline text-[9px] cursor-pointer flex items-center gap-1"
              >
                📋 Panodan Yapıştır
              </button>
            </div>

            {inputMode === 'URL' ? (
              <div className="relative flex items-center">
                <Link2 size={14} className="absolute left-3 text-content-tertiary" />
                <input
                  type="text"
                  placeholder="Örn: https://suno.com/s/a2hf69thdnYq25lG veya https://suno.com/song/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInspect();
                  }}
                  className="w-full bg-surface border border-border-subtle focus:border-accent pl-8 pr-24 py-2 text-xs font-mono text-content-primary placeholder:text-content-tertiary rounded-lg outline-none transition-colors"
                />
                <Button
                  variant="accent"
                  size="xs"
                  onClick={() => handleInspect()}
                  disabled={isLoading || !urlInput.trim()}
                  className="absolute right-1 font-mono uppercase font-bold text-[10px] gap-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      ANALİZ...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} />
                      ÇÖZÜMLE
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder='{"id": "...", "title": "...", "audio_url": "...", "metadata": {"alignment": [...]}}'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-surface border border-border-subtle focus:border-accent p-2.5 text-xs font-mono text-content-primary placeholder:text-content-tertiary rounded-lg outline-none resize-none"
                />
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleInspect()}
                  disabled={isLoading || !jsonInput.trim()}
                  className="w-full font-mono uppercase font-bold text-xs gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      JSON AYRIŞTIRILIYOR...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      JSON VERİSİNİ İÇE AKTAR
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Hızlı Örnekler */}
          {inputMode === 'URL' && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-mono text-content-tertiary uppercase tracking-wider block">
                VEYA HIZLI TEST İÇİN DENE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SUNO_LINKS.map((sample, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      setUrlInput(sample.url);
                      handleInspect(sample.url);
                    }}
                    className="text-[9px] font-mono gap-1"
                  >
                    <Zap size={10} className="text-accent" />
                    {sample.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="p-2.5 bg-red-950/30 border border-red-800/50 rounded-lg flex items-start gap-2 text-red-300 text-xs font-mono">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Bilgi Kutusu */}
          <div className="p-2.5 bg-surface/50 border border-border-subtle rounded-lg text-[10px] font-mono text-content-secondary space-y-1">
            <div className="flex items-center gap-1.5 text-content-primary font-bold">
              <CheckCircle2 size={12} className="text-accent" />
              TAM OTOMATİK ENTEGRASYON (XILIOURT & LUMI-SCRIPT UYUMLU)
            </div>
            <p className="text-content-tertiary leading-relaxed text-[9px]">
              Suno şarkı linki girildiğinde parça adı, sanatçı, kapak, ses akışı ve kelime bazlı senkronizasyon otomatik çözümlenir. İster projede oynatın, ister anında .LRC/.SRT formatında indirin.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Şarkı Önizleme ve İçe Aktarma Onayı */}
      {step === 'PREVIEW' && inspectedTrack && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-surface/50 border border-border-subtle p-3 rounded-lg flex flex-col sm:flex-row items-start gap-3">
            {/* Kapak Görseli */}
            <div className="w-18 h-18 bg-panel border border-border-subtle rounded-lg overflow-hidden shrink-0 relative group">
              {inspectedTrack.imageUrl ? (
                <img
                  src={inspectedTrack.imageUrl}
                  alt={inspectedTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-content-tertiary">
                  <Music size={22} />
                </div>
              )}
            </div>

            {/* Parça Detayları */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="accent" className="text-[9px]">
                  SUNO AI TRACK
                </Badge>
                {inspectedTrack.hasWordLevelTimestamps ? (
                  <Badge variant="success" className="text-[9px] gap-1">
                    <Sparkles size={9} /> KELİME DÜZEYİ SENKRONİZE
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] gap-1">
                    <CheckCircle2 size={9} /> OTOMATİK LİRİK SENKRONU
                  </Badge>
                )}
              </div>

              <h4 className="text-xs font-mono font-bold text-content-primary uppercase truncate">
                {inspectedTrack.title}
              </h4>
              <p className="text-[10px] font-mono text-content-secondary truncate">
                Sanatçı: <span className="text-content-primary">{inspectedTrack.artist}</span>
              </p>

              {inspectedTrack.tags && (
                <p className="text-[9px] font-mono text-content-tertiary truncate">
                  Tür / Etiketler: {inspectedTrack.tags}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1 text-[9px] font-mono text-content-tertiary">
                <span>⏱ Süre: ~{Math.floor((inspectedTrack.duration || 180) / 60)}:{(Math.floor((inspectedTrack.duration || 180) % 60)).toString().padStart(2, '0')}</span>
                <span>•</span>
                <span>📝 {inspectedTrack.syncedLines.length} Satır</span>
                {inspectedTrack.words.length > 0 && (
                  <>
                    <span>•</span>
                    <span>⚡ {inspectedTrack.words.length} Kelime</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Lirik Önizleme */}
          {inspectedTrack.lyrics && (
            <div className="bg-surface/30 border border-border-subtle p-2.5 rounded-lg max-h-24 overflow-y-auto">
              <span className="text-[8px] font-mono font-bold text-content-tertiary uppercase tracking-wider block mb-1">
                LİRİK METNİ ÖNİZLEMESİ (TEMİZLENMİŞ PROMPT)
              </span>
              <p className="text-[9px] font-mono text-content-secondary whitespace-pre-line leading-relaxed">
                {inspectedTrack.lyrics.slice(0, 200)}...
              </p>
            </div>
          )}

          {/* Format İndirme Barı */}
          <div className="p-2.5 bg-surface/50 border border-border-subtle rounded-lg space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
              <Download size={11} /> SUNO ALTYAZI VE LİRİK FORMATLARINI İNDİR:
            </span>
            <div className="grid grid-cols-6 gap-1">
              {(['LRC', 'ELRC', 'SRT', 'VTT', 'TTML', 'JSON'] as const).map((fmt) => (
                <Button
                  key={fmt}
                  variant={fmt === 'ELRC' ? 'accent' : 'outline'}
                  size="xs"
                  onClick={() => handleDownloadFormat(fmt)}
                  className="font-mono text-[9px] font-bold py-1 h-auto"
                >
                  .{fmt}
                </Button>
              ))}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={resetState}
              className="flex-1 font-mono uppercase font-bold text-[10px]"
            >
              ← YENİ SORGULA
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleConfirmImport}
              disabled={isDownloadingAudio}
              className="flex-[2] font-mono uppercase font-bold text-xs gap-1.5"
            >
              {isDownloadingAudio ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  SES VE SÖZLER AKTARILIYOR...
                </>
              ) : (
                <>
                  <Play size={13} className="fill-current" />
                  PROJEYE AKTAR & OYNAT
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="bg-panel border border-border-subtle p-4 rounded-xl">
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-panel border border-border-subtle w-full max-w-lg p-5 rounded-xl shadow-elevation-3 relative">
        {content}
      </div>
    </div>
  );
};


