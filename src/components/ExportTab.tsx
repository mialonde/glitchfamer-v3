import React from "react";
import { Video, Download, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { VisualizerSettings } from "../types";
import { Button, Badge, Card } from "./ui";
import { cn } from "../lib/utils";

interface ExportTabProps {
  settings: VisualizerSettings;
  audioUrl: string | null;
  renderEngine: 'server' | 'client';
  serverQuality: '1080p' | '720p';
  isServerRendering: boolean;
  serverProgress: number;
  serverStage: string;
  serverError: string | null;
  serverVideoUrl: string | null;
  isRecording: boolean;
  videoResultUrl: string | null;
  isConvertingMp4: boolean;
  onSetRenderEngine: (engine: 'server' | 'client') => void;
  onSetServerQuality: (quality: '1080p' | '720p') => void;
  onStartServerRender: () => void;
  onCancelServerRender: () => void;
  onClearServerError: () => void;
  onStartClientRender: () => void;
  onConvertWebMtoMp4: () => void;
  onResetServerVideoUrl: () => void;
  onResetClientVideoUrl: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  settings,
  audioUrl,
  renderEngine,
  serverQuality,
  isServerRendering,
  serverProgress,
  serverStage,
  serverError,
  serverVideoUrl,
  isRecording,
  videoResultUrl,
  isConvertingMp4,
  onSetRenderEngine,
  onSetServerQuality,
  onStartServerRender,
  onCancelServerRender,
  onClearServerError,
  onStartClientRender,
  onConvertWebMtoMp4,
  onResetServerVideoUrl,
  onResetClientVideoUrl
}) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      
      {/* Motor Seçimi (SSR vs CSR) */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
            RENDER MOTORU SEÇİMİ
          </span>
          <Badge variant="outline" className="text-[9px]">
            H.264 / WEBM ÇIKTI
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSetRenderEngine('server')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSetRenderEngine('server'); }}
            className={cn(
              "p-3 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer text-left",
              renderEngine === 'server'
                ? "border-accent bg-surface shadow-elevation-2"
                : "border-border-subtle bg-surface/40 text-content-tertiary hover:border-border-strong"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-accent">SUNUCU (SSR)</span>
              <Badge variant="accent" className="text-[8px]">ÖNERİLEN</Badge>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed">
              FFmpeg 60 FPS MP4 kodlama. Kristal netliğinde çıktı verir.
            </p>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onSetRenderEngine('client')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSetRenderEngine('client'); }}
            className={cn(
              "p-3 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer text-left",
              renderEngine === 'client'
                ? "border-accent bg-surface shadow-elevation-2"
                : "border-border-subtle bg-surface/40 text-content-tertiary hover:border-border-strong"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-content-secondary">İSTEMCİ (CSR)</span>
              <Badge variant="secondary" className="text-[8px]">TARAYICI</Badge>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed">
              MediaRecorder WebM kaydı. Hızlı önizleme ve yerel indirme.
            </p>
          </div>
        </div>

        {/* Çözünürlük */}
        {renderEngine === 'server' && (
          <div className="pt-3 flex items-center justify-between text-xs text-content-secondary border-t border-border-subtle">
            <span className="font-mono text-[10px] uppercase">ÇÖZÜNÜRLÜK:</span>
            <div className="flex gap-2">
              <Button
                variant={serverQuality === '1080p' ? 'accent' : 'outline'}
                size="xs"
                onClick={() => onSetServerQuality('1080p')}
                className="font-mono text-[9px]"
              >
                1080P FULL HD
              </Button>
              <Button
                variant={serverQuality === '720p' ? 'accent' : 'outline'}
                size="xs"
                onClick={() => onSetServerQuality('720p')}
                className="font-mono text-[9px]"
              >
                720P HIZLI
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* SSR Render Alanı */}
      {renderEngine === 'server' && (
        <div className="space-y-3">
          {isServerRendering ? (
            <Card className="p-5 border-accent space-y-3 shadow-elevation-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  SUNUCUDA RENDER ALINIYOR...
                </span>
                <span className="text-xs font-mono font-bold text-accent">
                  %{serverProgress}
                </span>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="w-full h-2 bg-surface border border-border-strong overflow-hidden rounded-full">
                <div 
                  className="h-full bg-accent transition-all duration-300 shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                  style={{ width: `${serverProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-content-secondary">
                <span className="truncate pr-2">{serverStage}</span>
                <Button 
                  variant="destructive"
                  size="xs"
                  onClick={onCancelServerRender}
                  className="text-[9px]"
                >
                  İPTAL
                </Button>
              </div>
            </Card>
          ) : serverVideoUrl ? (
            <div className="space-y-2">
              <a 
                href={serverVideoUrl}
                download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
                className="block text-center w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3.5 text-xs font-bold uppercase tracking-widest transition-all shadow-elevation-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Download size={16} /> 60 FPS MP4 VİDEOYU İNDİR
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onResetServerVideoUrl();
                  onStartServerRender();
                }}
                className="w-full text-xs gap-1.5"
              >
                <RotateCcw size={13} />
                YENİDEN RENDER ET
              </Button>
            </div>
          ) : (
            <Button 
              variant="accent"
              size="lg"
              onClick={onStartServerRender}
              disabled={!audioUrl || isServerRendering}
              className="w-full text-xs font-bold uppercase tracking-widest gap-2 shadow-elevation-2 py-4"
            >
              <Video size={16} /> 60 FPS MP4 RENDER BAŞLAT (FFMPEG)
            </Button>
          )}

          {serverError && (
            <Card className="p-4 bg-destructive/10 border-destructive/40 text-destructive-foreground text-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-destructive">Sunucu Render Hatası:</span>
                    <span className="text-[11px] text-content-secondary mt-0.5">{serverError}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onClearServerError}
                  className="h-6 w-6 p-0 text-content-tertiary hover:text-content-primary"
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-destructive/20">
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={onStartServerRender}
                  className="text-[9px] uppercase font-bold"
                >
                  ⚡ Yeniden Dene
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    onSetRenderEngine('client');
                    onClearServerError();
                  }}
                  className="text-[9px] uppercase font-bold"
                >
                  Tarayıcı Motoruna Geç (CSR)
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* CSR Render Alanı */}
      {renderEngine === 'client' && (
        <div className="space-y-3">
          {!videoResultUrl ? (
            <Button 
              variant="outline"
              size="lg"
              onClick={onStartClientRender}
              disabled={!audioUrl || isRecording}
              className="w-full text-xs font-bold uppercase tracking-wider gap-2 py-4"
            >
              <Video size={16} /> {isRecording ? 'İSTEMCİDE KAYDEDİLİYOR...' : 'WEBM KAYDI BAŞLAT'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                variant="accent"
                size="lg"
                onClick={onConvertWebMtoMp4}
                disabled={isConvertingMp4}
                className="w-full text-xs font-bold uppercase tracking-widest gap-2 shadow-elevation-2 py-4"
              >
                {isConvertingMp4 ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {isConvertingMp4 ? "MP4'E ÇEVRİLİYOR..." : "MP4 OLARAK İNDİR (HIZLI)"}
              </Button>
              <a 
                href={videoResultUrl} 
                download={`${settings.trackTitle || 'vidframer_render'}.webm`}
                className="block text-center w-full bg-surface hover:bg-surface-hover text-content-secondary py-3 text-xs font-bold uppercase tracking-wider transition-all border border-border-strong rounded-lg flex items-center justify-center gap-2"
              >
                <Download size={14} /> WEBM (ORİJİNAL) İNDİR
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onResetClientVideoUrl();
                  onStartClientRender();
                }}
                className="w-full text-xs gap-1.5"
              >
                <RotateCcw size={13} />
                YENİDEN KAYDET
              </Button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

