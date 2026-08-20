import React from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Upload, Download } from 'lucide-react';
import { Card, Button, Input } from '../ui';

interface LyricsSunoTabProps {
  sunoUrlInput: string;
  isSunoLoading: boolean;
  sunoSuccessMessage: string | null;
  sunoError: string | null;
  rawLrcInput: string;
  onSunoUrlChange: (val: string) => void;
  onFetchSunoLyrics: () => void;
  onLrcFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadLrc: () => void;
  onDownloadEnhancedLrc: () => void;
  onDownloadTtml: () => void;
  onDownloadJson: () => void;
  onDownloadSrt: () => void;
  onDownloadVtt: () => void;
  onRawLrcInputChange: (val: string) => void;
  onImportLrc: (content: string) => void;
}

export const LyricsSunoTab: React.FC<LyricsSunoTabProps> = ({
  sunoUrlInput,
  isSunoLoading,
  sunoSuccessMessage,
  sunoError,
  rawLrcInput,
  onSunoUrlChange,
  onFetchSunoLyrics,
  onLrcFileUpload,
  onDownloadLrc,
  onDownloadEnhancedLrc,
  onDownloadTtml,
  onDownloadJson,
  onDownloadSrt,
  onDownloadVtt,
  onRawLrcInputChange,
  onImportLrc,
}) => {
  return (
    <div className="space-y-4 bg-panel/70 p-4 border border-border-subtle rounded-lg">
      
      {/* SUNO İÇE AKTARMA */}
      <Card className="p-4 bg-surface border border-border-subtle rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-content-primary font-bold text-xs uppercase">
          <Sparkles size={15} className="text-accent" />
          <span>SUNO AI ŞARKI LİNKİNDEN OTOMATİK LİRİK ÇEK</span>
        </div>
        <p className="text-[10px] text-content-secondary">
          Suno.com paylaşım linkini yapıştırın. Şarkı sözleri ve fonem zamanlamaları anında içe aktarılır.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            value={sunoUrlInput}
            onChange={(e) => onSunoUrlChange(e.target.value)}
            placeholder="https://suno.com/s/..."
            className="flex-1 font-mono text-xs"
          />
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={onFetchSunoLyrics}
            disabled={isSunoLoading}
            className="font-bold text-xs uppercase tracking-wider gap-1.5"
          >
            {isSunoLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span>{isSunoLoading ? 'ÇÖZÜMLENİYOR...' : 'LİRİKLERİ ÇEK'}</span>
          </Button>
        </div>

        {sunoSuccessMessage && (
          <div className="p-2.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] rounded flex items-center gap-2">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>{sunoSuccessMessage}</span>
          </div>
        )}

        {sunoError && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] rounded flex items-center gap-2">
            <AlertCircle size={13} className="shrink-0" />
            <span>{sunoError}</span>
          </div>
        )}
      </Card>

      {/* .LRC METİN VE DOSYA İÇE AKTARMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* .LRC Dosyası Yükle */}
        <Card className="p-3.5 bg-surface border border-border-subtle rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-content-primary uppercase block">📂 .LRC DOSYASI YÜKLE</span>
            <p className="text-[9px] text-content-secondary mt-0.5">Bilgisayarınızdaki standart .lrc lirik dosyasını aktarın.</p>
          </div>
          <label className="w-full py-2.5 bg-panel hover:bg-panel/80 border border-dashed border-border-strong text-content-primary font-bold text-[10px] uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload size={13} className="text-accent" />
            <span>.LRC DOSYASI SEÇ</span>
            <input type="file" accept=".lrc,.txt" onChange={onLrcFileUpload} className="hidden" />
          </label>
        </Card>

        {/* Dışa Aktarma Butonları */}
        <Card className="p-3.5 bg-surface border border-border-subtle rounded-lg space-y-2">
          <span className="text-[10px] font-bold text-content-primary uppercase block">💾 PROFESYONEL LİRİK & ALTYAZI DIŞA AKTAR</span>
          <p className="text-[9px] text-content-secondary">BetterLyrics, Apple Music, Premiere, CapCut ve JSON formatlarında indirin.</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadLrc}
              title="Standart LRC formatında indir"
              className="gap-1 text-[9px] font-bold py-2 uppercase"
            >
              <Download size={11} className="text-accent" /> .LRC
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadEnhancedLrc}
              title="BetterLyrics Hece/Kelime zamanlamalı Enhanced LRC"
              className="gap-1 text-[9px] font-bold py-2 uppercase bg-accent/10 border-accent/40 text-accent"
            >
              <Sparkles size={11} className="text-accent" /> .ELRC
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadTtml}
              title="Apple Music uyumlu Timed Text Markup Language"
              className="gap-1 text-[9px] font-bold py-2 uppercase"
            >
              <Download size={11} className="text-accent" /> .TTML
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadJson}
              title="Tüm hece ve fonem verisiyle JSON formatı"
              className="gap-1 text-[9px] font-bold py-2 uppercase"
            >
              <Download size={11} className="text-accent" /> .JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadSrt}
              title="Video montaj için SRT altyazısı"
              className="gap-1 text-[9px] font-bold py-2 uppercase"
            >
              <Download size={11} className="text-accent" /> .SRT
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onDownloadVtt}
              title="Web video oynatıcıları için WebVTT"
              className="gap-1 text-[9px] font-bold py-2 uppercase"
            >
              <Download size={11} className="text-accent" /> .VTT
            </Button>
          </div>
        </Card>
      </div>

      {/* LRC Metin Editörü */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-content-primary uppercase block">
          HAM .LRC KODU (DOĞRUDAN YAPIŞTIR & UYGULA):
        </label>
        <textarea
          rows={6}
          value={rawLrcInput}
          onChange={(e) => onRawLrcInputChange(e.target.value)}
          className="w-full bg-panel border border-border-subtle p-2.5 text-[11px] font-mono text-accent rounded-md outline-none focus:border-accent"
        />
        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={() => onImportLrc(rawLrcInput)}
          className="font-bold text-xs uppercase"
        >
          METİNDEKİ .LRC'Yİ UYGULA
        </Button>
      </div>

    </div>
  );
};
