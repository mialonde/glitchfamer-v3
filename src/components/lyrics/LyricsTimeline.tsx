import React from 'react';
import { Radio, Plus, Sparkles, Sliders, Music, Zap, Target } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { SyncedLine } from '../../types';
import { cn } from '../../lib/utils';

interface LyricsTimelineProps {
  syncedLyrics: SyncedLine[];
  currentTime: number;
  duration: number;
  liveTapIndex: number;
  offsetValue: number;
  syncOffset?: number;
  onOffsetChange: (val: number) => void;
  onSyncOffsetChange?: (val: number) => void;
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onLiveTapNext: () => void;
  onAddLine: () => void;
  onPurgeStructureMarkers: () => void;
  onAutoCalibrateSync?: () => void;
  onShiftAllTimestamps: (delta: number) => void;
}

export const LyricsTimeline: React.FC<LyricsTimelineProps> = ({
  syncedLyrics,
  currentTime,
  duration,
  liveTapIndex,
  offsetValue,
  syncOffset = 0,
  onOffsetChange,
  onSyncOffsetChange,
  onTimelineClick,
  onLiveTapNext,
  onAddLine,
  onPurgeStructureMarkers,
  onAutoCalibrateSync,
  onShiftAllTimestamps,
}) => {
  const formatTimeSeconds = (sec: number) => {
    const numSec = Number(sec) || 0;
    const m = Math.floor(numSec / 60);
    const s = Number(numSec % 60 || 0).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  };

  const lyricsCount = syncedLyrics.length;

  return (
    <div className="space-y-3">
      {/* 1.1 İNTERAKTİF GÖRSEL LİRİK ZAMAN ÇİZELGESİ (TIMELINE) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] font-mono text-content-tertiary uppercase">
          <span className="flex items-center gap-1.5 font-bold text-content-secondary">
            <Music size={12} className="text-accent" />
            İNTERAKTİF ZAMAN ÇİZELGESİ
          </span>
          <span>{formatTimeSeconds(currentTime)} / {formatTimeSeconds(duration || 0)}</span>
        </div>
        
        <div 
          onClick={onTimelineClick}
          className="relative h-8 w-full bg-panel border border-border-subtle rounded-md overflow-hidden cursor-pointer select-none group"
        >
          {/* Lirik Blokları */}
          {syncedLyrics.length > 0 && duration > 0 && (
            syncedLyrics.map((line, idx) => {
              const left = (line.startTime / duration) * 100;
              const width = Math.max(0.8, ((line.endTime - line.startTime) / duration) * 100);
              const isActive = currentTime >= line.startTime && currentTime <= line.endTime;
              return (
                <div
                  key={idx}
                  title={`[${idx + 1}] ${line.text} (${Number(line.startTime ?? 0).toFixed(1)}s - ${Number(line.endTime ?? 0).toFixed(1)}s)`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className={cn(
                    "absolute top-1 bottom-1 rounded-[2px] transition-all border border-black/30",
                    isActive 
                      ? "bg-accent shadow-[0_0_12px_var(--accent)] z-10" 
                      : idx === liveTapIndex 
                      ? "bg-blue-500/90"
                      : "bg-surface group-hover:bg-surface/80"
                  )}
                />
              );
            })
          )}

          {/* Güncel Çalma Kafası */}
          {duration > 0 && (
            <div 
              style={{ left: `${(currentTime / duration) * 100}%` }}
              className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_red] z-20 pointer-events-none"
            />
          )}
        </div>
      </div>

      {/* 1.2 CANLI DOKUN (LIVE TAP) VE GLOBAL SHIFT TOOLBAR */}
      <Card className="p-3 bg-surface/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={onLiveTapNext}
            disabled={lyricsCount === 0 || liveTapIndex >= lyricsCount}
            className="flex-1 sm:flex-none font-bold text-xs tracking-wider uppercase gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] disabled:opacity-40"
          >
            <Radio size={14} className="animate-pulse" />
            <span>CANLI DOKUN (TAP) [{liveTapIndex + 1}/{lyricsCount}]</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddLine}
            className="text-xs font-bold uppercase gap-1.5"
          >
            <Plus size={13} className="text-accent" />
            <span>SATIR EKLE</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onPurgeStructureMarkers}
            title="Şarkı sözlerindeki [Verse], (Pause - Single Kick), (Solo) vb. müzikal komutları ve yapı etiketlerini otomatik arındırır"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-800/40 text-xs font-bold uppercase gap-1.5"
          >
            <Sparkles size={13} className="text-rose-400" />
            <span>YAPILARI ARINDIR</span>
          </Button>

          {onAutoCalibrateSync && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAutoCalibrateSync}
              title="Kelime ve satır bitiş sürelerini pürüzsüzleştirir, vokal eslerini düzenler"
              className="text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-800/50 text-xs font-bold uppercase gap-1.5"
            >
              <Zap size={13} className="text-emerald-400" />
              <span>SÜRE & AKIŞI KALİBRE ET</span>
            </Button>
          )}

          {syncedLyrics.length > 0 && (
            (() => {
              const firstLineStart = syncedLyrics[0]?.startTime ?? 0;
              const shiftDelta = Math.round((currentTime - firstLineStart) * 100) / 100;
              return (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onShiftAllTimestamps(shiftDelta)}
                  title={`1. Satırı ("${syncedLyrics[0].text.slice(0, 20)}...") tam oynatıcının şu anki saniyesine (${formatTimeSeconds(currentTime)}) çeker`}
                  className="text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-600/60 text-xs font-bold uppercase gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] animate-pulse"
                >
                  <Target size={14} className="text-amber-400" />
                  <span>1. SATIRI {formatTimeSeconds(currentTime)}'E HİZALA ({shiftDelta >= 0 ? `+${Number(shiftDelta || 0).toFixed(2)}s` : `${Number(shiftDelta || 0).toFixed(2)}s`})</span>
                </Button>
              );
            })()
          )}
        </div>

        {/* CANLI MİKRO-SENKRONİZASYON OFSETİ VE TOPLU ÖTELEME */}
        <div className="flex items-center gap-2 flex-wrap">
          {onSyncOffsetChange && (
            <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-md">
              <span className="text-[9px] font-bold text-accent uppercase flex items-center gap-1">
                ⚡ KALİBRASYON OFSETİ:
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onSyncOffsetChange(Math.round((syncOffset - 0.1) * 100) / 100)}
                className="h-5 px-1 text-[9px] font-mono font-bold text-accent hover:bg-accent/20"
              >
                -0.1s
              </Button>
              <span className="font-mono text-xs font-bold text-content-primary px-1 min-w-[45px] text-center">
                {syncOffset > 0 ? `+${Number(syncOffset || 0).toFixed(2)}s` : `${Number(syncOffset || 0).toFixed(2)}s`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onSyncOffsetChange(Math.round((syncOffset + 0.1) * 100) / 100)}
                className="h-5 px-1 text-[9px] font-mono font-bold text-accent hover:bg-accent/20"
              >
                +0.1s
              </Button>
              {syncOffset !== 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onSyncOffsetChange(0)}
                  title="Sıfırla"
                  className="h-5 px-1 text-[8px] uppercase text-content-tertiary hover:text-content-primary"
                >
                  SIFIRLA
                </Button>
              )}
            </div>
          )}

          {/* GLOBAL SÜRE ÖTELEME */}
          <div className="flex items-center gap-1.5 flex-wrap bg-panel px-2.5 py-1.5 rounded-md border border-border-subtle">
            <span className="text-[9px] font-bold text-content-tertiary uppercase flex items-center gap-1 mr-1">
              <Sliders size={11} className="text-accent" /> ÖTELE:
            </span>
            
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(-5)}
              className="text-red-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              -5s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(-1)}
              className="text-red-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              -1s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(-offsetValue)}
              className="text-red-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              -{offsetValue}s
            </Button>

            <Input
              type="number"
              step="0.05"
              min="0.05"
              max="120"
              value={offsetValue}
              onChange={(e) => onOffsetChange(Math.max(0.05, parseFloat(e.target.value) || 0.1))}
              className="w-12 h-6 px-1 py-0.5 text-center text-[10px] text-accent font-mono font-bold"
            />

            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(offsetValue)}
              className="text-green-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              +{offsetValue}s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(1)}
              className="text-green-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              +1s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(5)}
              className="text-green-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              +5s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(15)}
              className="text-green-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
            >
              +15s
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onShiftAllTimestamps(18)}
              className="text-amber-400 font-mono text-[9px] font-bold px-1 py-0.5 h-6"
              title="Şarkı girişi (Intro) 18 saniyeyse doğrudan +18s ötele"
            >
              +18s
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
