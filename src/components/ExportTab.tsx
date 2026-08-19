import React from "react";
import { Video, Download, Loader2 } from "lucide-react";
import { VisualizerSettings } from "../types";
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
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          RENDER MOTORU SEÇİMİ
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSetRenderEngine('server')}
            className={cn(
              "p-3 text-left border rounded-sm transition-all flex flex-col gap-1 cursor-pointer",
              renderEngine === 'server'
                ? "border-accent bg-surface/80 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                : "border-border-subtle bg-panel text-content-tertiary hover:border-border-strong"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-accent">SUNUCU (SSR)</span>
              <span className="text-[7.5px] bg-accent/20 text-accent px-1 py-0.2 font-sans font-bold">ÖNERİLEN</span>
            </div>
            <p className="text-[8.5px] text-content-secondary font-sans leading-relaxed">
              FFmpeg 60 FPS MP4 kodlama. Kristal netliğinde çıktı verir.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onSetRenderEngine('client')}
            className={cn(
              "p-3 text-left border rounded-sm transition-all flex flex-col gap-1 cursor-pointer",
              renderEngine === 'client'
                ? "border-accent bg-surface/80 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                : "border-border-subtle bg-panel text-content-tertiary hover:border-border-strong"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase text-content-secondary">İSTEMCİ (CSR)</span>
              <span className="text-[7.5px] bg-hover text-content-secondary px-1 py-0.2 font-sans">TARAYICI</span>
            </div>
            <p className="text-[8.5px] text-content-secondary font-sans leading-relaxed">
              MediaRecorder WebM kaydı. Hızlı önizleme ve yerel indirme.
            </p>
          </button>
        </div>

        {/* Çözünürlük */}
        {renderEngine === 'server' && (
          <div className="pt-2 flex items-center justify-between text-[9px] font-sans text-content-secondary border-t border-border-subtle">
            <span>ÇÖZÜNÜRLÜK:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSetServerQuality('1080p')}
                className={cn(
                  "px-2 py-0.5 border text-[8.5px] font-sans font-bold uppercase cursor-pointer",
                  serverQuality === '1080p' ? "border-accent bg-accent text-black" : "border-border-strong text-content-tertiary"
                )}
              >
                1080P FULL HD
              </button>
              <button
                type="button"
                onClick={() => onSetServerQuality('720p')}
                className={cn(
                  "px-2 py-0.5 border text-[8.5px] font-sans font-bold uppercase cursor-pointer",
                  serverQuality === '720p' ? "border-accent bg-accent text-black" : "border-border-strong text-content-tertiary"
                )}
              >
                720P HIZLI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SSR Render Alanı */}
      {renderEngine === 'server' && (
        <div className="space-y-3">
          {isServerRendering ? (
            <div className="p-5 bg-panel border border-accent space-y-3 shadow-[0_0_30px_rgba(255,215,0,0.15)] rounded-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-accent uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  SUNUCUDA RENDER ALINIYOR...
                </span>
                <span className="text-xs font-sans font-bold text-accent">
                  %{serverProgress}
                </span>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="w-full h-2.5 bg-surface border border-border-strong overflow-hidden rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-[#FFD700] to-yellow-200 transition-all duration-300 shadow-[0_0_10px_#FFD700]"
                  style={{ width: `${serverProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-sans text-content-secondary">
                <span className="truncate pr-2">{serverStage}</span>
                <button 
                  type="button"
                  onClick={onCancelServerRender}
                  className="text-red-400 hover:text-red-300 font-bold uppercase shrink-0 cursor-pointer underline"
                >
                  İPTAL
                </button>
              </div>
            </div>
          ) : serverVideoUrl ? (
            <div className="space-y-2">
              <a 
                href={serverVideoUrl}
                download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
                className="block text-center w-full bg-accent hover:bg-white text-black py-4 text-xs font-black uppercase tracking-[0.25em] transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] rounded-sm flex items-center justify-center gap-2"
              >
                <Download size={16} /> 60 FPS MP4 VİDEOYU İNDİR
              </a>
              <button
                type="button"
                onClick={() => {
                  onResetServerVideoUrl();
                  onStartServerRender();
                }}
                className="w-full bg-surface hover:bg-hover text-content-secondary py-2 text-[9px] font-sans uppercase tracking-wider border border-border-strong rounded-sm cursor-pointer"
              >
                YENİDEN RENDER ET
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={onStartServerRender}
              disabled={!audioUrl || isServerRendering}
              className="w-full bg-accent text-black py-4 text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all disabled:opacity-25 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.2)] rounded-sm"
            >
              <Video size={16} /> 60 FPS MP4 RENDER BAŞLAT (FFMPEG)
            </button>
          )}

          {serverError && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-sans rounded-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold block text-red-200">Sunucu Render Hatası:</span>
                  <span className="text-[10px] text-red-300/90">{serverError}</span>
                </div>
                <button
                  type="button"
                  onClick={onClearServerError}
                  className="text-red-400 hover:text-white text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-red-900/50">
                <button
                  type="button"
                  onClick={onStartServerRender}
                  className="px-2.5 py-1 bg-red-900/40 hover:bg-red-900/80 text-red-200 text-[8.5px] uppercase font-bold rounded-sm border border-red-700 cursor-pointer"
                >
                  ⚡ Yeniden Dene
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetRenderEngine('client');
                    onClearServerError();
                  }}
                  className="px-2.5 py-1 bg-accent/20 hover:bg-accent/40 text-accent text-[8.5px] uppercase font-bold rounded-sm border border-accent/40 cursor-pointer"
                >
                  Tarayıcı Motoruna Geç (CSR)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSR Render Alanı */}
      {renderEngine === 'client' && (
        <div className="space-y-3">
          {!videoResultUrl ? (
            <button 
              type="button"
              onClick={onStartClientRender}
              disabled={!audioUrl || isRecording}
              className="w-full bg-hover text-content-primary hover:bg-hover/80 py-4 text-xs font-sans font-bold uppercase tracking-wider transition-all disabled:opacity-20 flex items-center justify-center gap-2 cursor-pointer border border-border-strong rounded-sm"
            >
              <Video size={16} /> {isRecording ? 'İSTEMCİDE KAYDEDİLİYOR...' : 'WEBM KAYDI BAŞLAT'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={onConvertWebMtoMp4}
                disabled={isConvertingMp4}
                className="w-full bg-accent hover:bg-white text-black py-4 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] rounded-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isConvertingMp4 ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {isConvertingMp4 ? "MP4'E ÇEVRİLİYOR..." : "MP4 OLARAK İNDİR (HIZLI)"}
              </button>
              <a 
                href={videoResultUrl} 
                download={`${settings.trackTitle || 'vidframer_render'}.webm`}
                className="block text-center w-full bg-panel hover:bg-surface text-content-secondary py-3 text-[10px] font-bold uppercase tracking-widest transition-all border border-border-strong rounded-sm flex items-center justify-center gap-2"
              >
                <Download size={12} /> WEBM (ORİJİNAL) İNDİR
              </a>
              <button
                type="button"
                onClick={() => {
                  onResetClientVideoUrl();
                  onStartClientRender();
                }}
                className="w-full bg-surface hover:bg-hover text-content-secondary py-2 text-[9px] font-sans uppercase tracking-wider border border-border-strong rounded-sm cursor-pointer"
              >
                YENİDEN KAYDET
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
