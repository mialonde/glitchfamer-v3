import React, { useState } from "react";
import { 
  Music, Link2, Sparkles, AlertCircle, CheckCircle2, 
  Loader2, Play, Image as ImageIcon, FileText, ArrowRight,
  Zap, X, RefreshCw, Layers, Download, Code
} from "lucide-react";
import { NormalizedSunoTrack } from "../types";
import { sunoImporter } from "../services/SunoImporterService";
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
      // Arka planda audio blob çek (Player & Render pipeline uyumluluğu için)
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
      // Clipboard erişim kısıtlaması durumunda
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
    <div className="space-y-4">
      {/* Header & Tagline */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#FFD700] text-black flex items-center justify-center font-black">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              SUNO AI LYRICS & TRACK STUDIO
              <span className="text-[8px] bg-[#FFD700]/20 text-[#FFD700] px-1.5 py-0.2 rounded border border-[#FFD700]/40 font-mono">
                v2.5
              </span>
            </h3>
            <p className="text-[9px] font-mono text-zinc-400">
              Suno linki veya JSON verisiyle anında ses, kapak, lirik ve senkronizasyon aktar / dışa aktar
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* STEP 1: URL / JSON Girişi */}
      {step === 'INPUT' && (
        <div className="space-y-3">
          {/* Giriş Modu Seçimi */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-sm border border-zinc-800">
            <button
              type="button"
              onClick={() => setInputMode('URL')}
              className={cn(
                "flex-1 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                inputMode === 'URL' ? "bg-[#FFD700] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Link2 size={11} /> SUNO LINKI / ID
            </button>
            <button
              type="button"
              onClick={() => setInputMode('JSON')}
              className={cn(
                "flex-1 py-1.5 text-[9px] font-mono font-bold uppercase rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                inputMode === 'JSON' ? "bg-[#FFD700] text-black shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              <Code size={11} /> HAM JSON / API PAYLOAD
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-300 uppercase">
              <span>{inputMode === 'URL' ? "SUNO ŞARKI BAĞLANTISI (URL VEYA UUID)" : "HAM SUNO API JSON VERİSİ"}</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[#FFD700] hover:underline text-[8.5px] cursor-pointer flex items-center gap-1"
              >
                📋 Panodan Yapıştır
              </button>
            </div>

            {inputMode === 'URL' ? (
              <div className="relative flex items-center">
                <Link2 size={14} className="absolute left-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Örn: https://suno.com/s/a2hf69thdnYq25lG veya https://suno.com/song/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInspect();
                  }}
                  className="w-full bg-black/80 border border-zinc-800 focus:border-[#FFD700] pl-8 pr-24 py-2.5 text-[10px] font-mono text-white placeholder:text-zinc-600 rounded-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleInspect()}
                  disabled={isLoading || !urlInput.trim()}
                  className={cn(
                    "absolute right-1.5 px-3 py-1.5 rounded-sm text-[9px] font-mono uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                    urlInput.trim() && !isLoading
                      ? "bg-[#FFD700] text-black hover:bg-[#ffe033] shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}
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
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder='{"id": "...", "title": "...", "audio_url": "...", "metadata": {"alignment": [...]}}'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-black/80 border border-zinc-800 focus:border-[#FFD700] p-2.5 text-[10px] font-mono text-zinc-300 placeholder:text-zinc-600 rounded-sm outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleInspect()}
                  disabled={isLoading || !jsonInput.trim()}
                  className={cn(
                    "w-full py-2 rounded-sm text-[9px] font-mono uppercase font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                    jsonInput.trim() && !isLoading
                      ? "bg-[#FFD700] text-black hover:bg-[#ffe033]"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      JSON AYRIŞTIRILIYOR...
                    </>
                  ) : (
                    <>
                      <Sparkles size={11} />
                      JSON VERİSİNİ İÇE AKTAR
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Hızlı Örnekler */}
          {inputMode === 'URL' && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">
                VEYA HIZLI TEST İÇİN DENE:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SUNO_LINKS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(sample.url);
                      handleInspect(sample.url);
                    }}
                    className="text-[8px] font-mono bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-[#FFD700]/50 text-zinc-300 px-2 py-1 rounded-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap size={9} className="text-[#FFD700]" />
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-sm flex items-start gap-2 text-red-300 text-[9px] font-mono">
              <AlertCircle size={13} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Bilgi Kutusu */}
          <div className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-sm text-[8.5px] font-mono text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <CheckCircle2 size={11} className="text-[#FFD700]" />
              TAM OTOMATİK ENTEGRASYON (XILIOURT & LUMI-SCRIPT UYUMLU)
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Suno şarkı linki girildiğinde parça adı, sanatçı, kapak, ses akışı ve kelime bazlı senkronizasyon (Word Aligned Timestamps) otomatik çözümlenir. İster projede oynatın, ister anında .LRC/.SRT formatında indirin.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Şarkı Önizleme ve İçe Aktarma Onayı */}
      {step === 'PREVIEW' && inspectedTrack && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-sm flex flex-col sm:flex-row items-start gap-3">
            {/* Kapak Görseli */}
            <div className="w-20 h-20 bg-black border border-zinc-800 rounded-sm overflow-hidden shrink-0 relative group">
              {inspectedTrack.imageUrl ? (
                <img
                  src={inspectedTrack.imageUrl}
                  alt={inspectedTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Music size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Music size={16} className="text-[#FFD700]" />
              </div>
            </div>

            {/* Parça Detayları */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono bg-[#FFD700]/10 text-[#FFD700] px-1.5 py-0.2 rounded border border-[#FFD700]/30 font-bold uppercase">
                  SUNO AI TRACK
                </span>
                {inspectedTrack.hasWordLevelTimestamps ? (
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800 flex items-center gap-1 font-bold">
                    <Sparkles size={8} /> KELİME DÜZEYİ SENKRONİZE
                  </span>
                ) : (
                  <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={8} /> OTOMATİK LİRİK SENKRONU
                  </span>
                )}
              </div>

              <h4 className="text-xs font-mono font-black text-white uppercase truncate">
                {inspectedTrack.title}
              </h4>
              <p className="text-[9px] font-mono text-zinc-400 truncate">
                Sanatçı: <span className="text-zinc-200">{inspectedTrack.artist}</span>
              </p>

              {inspectedTrack.tags && (
                <p className="text-[8px] font-mono text-zinc-500 truncate">
                  Tür / Etiketler: {inspectedTrack.tags}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1 text-[8px] font-mono text-zinc-400">
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
            <div className="bg-black/50 border border-white/[0.06] p-2.5 rounded-sm max-h-24 overflow-y-auto custom-scrollbar">
              <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                LİRİK METNİ ÖNİZLEMESİ (TEMİZLENMİŞ PROMPT)
              </span>
              <p className="text-[8.5px] font-mono text-zinc-300 whitespace-pre-line leading-relaxed">
                {inspectedTrack.lyrics.slice(0, 200)}...
              </p>
            </div>
          )}

          {/* xiliourt / Lumi-Script Tarzı Doğrudan Altyazı & Lirik İndirme Barı */}
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-sm space-y-1.5">
            <span className="text-[8px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
              <Download size={10} /> SUNO ALTYAZI VE LİRİK FORMATLARINI İNDİR:
            </span>
            <div className="grid grid-cols-6 gap-1">
              <button
                type="button"
                onClick={() => handleDownloadFormat('LRC')}
                className="py-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="Standart LRC indir"
              >
                .LRC
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFormat('ELRC')}
                className="py-1 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="BetterLyrics Hece Zamanlamalı Enhanced LRC"
              >
                .ELRC
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFormat('SRT')}
                className="py-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="Video Altyazısı (SRT)"
              >
                .SRT
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFormat('VTT')}
                className="py-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="Web VTT"
              >
                .VTT
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFormat('TTML')}
                className="py-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="Apple Music TTML"
              >
                .TTML
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFormat('JSON')}
                className="py-1 bg-zinc-950 hover:bg-zinc-850 border border-zinc-700 text-white font-mono text-[8px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                title="Tüm Veriyle JSON"
              >
                .JSON
              </button>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={resetState}
              className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-sm text-[9px] font-mono uppercase font-bold transition-colors cursor-pointer"
            >
              ← YENİ SORGULA
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isDownloadingAudio}
              className="flex-[2] py-2 px-3 bg-[#FFD700] hover:bg-[#ffe033] text-black font-mono font-black text-[9.5px] uppercase rounded-sm transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] cursor-pointer"
            >
              {isDownloadingAudio ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  SES VE SÖZLER AKTARILIYOR...
                </>
              ) : (
                <>
                  <Play size={12} className="fill-black" />
                  PROJEYE AKTAR & OYNAT
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="bg-black/70 border border-white/[0.08] p-4 rounded-sm">
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-5 rounded-sm shadow-2xl relative">
        {content}
      </div>
    </div>
  );
};

