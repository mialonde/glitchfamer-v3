import React from 'react';
import { Type, Eye, EyeOff, Clock, Play, Pause } from 'lucide-react';
import { Button, Badge, Card } from '../ui';
import { SyncedLine } from '../../types';
import { cn } from '../../lib/utils';

interface LyricsHeaderProps {
  lyricsEnabled: boolean;
  lyricsCount: number;
  currentActiveLine: SyncedLine | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onToggleEnabled: () => void;
  onTogglePlay: () => void;
}

export const LyricsHeader: React.FC<LyricsHeaderProps> = ({
  lyricsEnabled,
  lyricsCount,
  currentActiveLine,
  currentTime,
  duration,
  isPlaying,
  onToggleEnabled,
  onTogglePlay
}) => {
  const formatTimeSeconds = (sec: number) => {
    const numSec = Number(sec) || 0;
    const m = Math.floor(numSec / 60);
    const s = Number(numSec % 60 || 0).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  };

  return (
    <div className="space-y-2.5">
      {/* 1. ÜST HEADER BAR */}
      <Card className="p-3 bg-panel/90 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-all shrink-0 shadow-inner",
            lyricsEnabled ? "bg-accent text-accent-foreground" : "bg-surface text-content-tertiary"
          )}>
            <Type size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary truncate">
                PRO LYRICS & TYPOGRAPHY STUDIO
              </h3>
              <Badge variant="accent" className="text-[9px]">
                {lyricsCount} SATIR
              </Badge>
            </div>
            <p className="text-[10px] text-content-secondary truncate">
              Apple Music 3-Satır kaydırma, hassas %Y dikey konum ve anlık fonetik düzenleme.
            </p>
          </div>
        </div>

        {/* Lirik Aç/Kapa Düğmesi */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant={lyricsEnabled ? "accent" : "outline"}
            size="sm"
            onClick={onToggleEnabled}
            className="text-[10px] font-bold uppercase tracking-wider gap-1.5"
          >
            {lyricsEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{lyricsEnabled ? 'LİRİKLER: AKTİF' : 'LİRİKLER: GİZLİ'}</span>
          </Button>
        </div>
      </Card>

      {/* 2. CANLI ÇALAN SATIR VE OYNATICI ÇUBUĞU */}
      <Card className="p-2.5 bg-surface/90 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full shrink-0",
            currentActiveLine ? "bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" : "bg-content-tertiary/40"
          )} />
          <div className="min-w-0 truncate">
            <span className="text-[9px] font-bold uppercase text-content-tertiary mr-1.5">ŞU AN:</span>
            <span className="text-xs font-bold text-accent">
              {currentActiveLine ? `"${currentActiveLine.text}"` : '— Müzik Çalıyor (Lirik Arası) —'}
            </span>
          </div>
        </div>

        {/* Sayaç ve Play/Pause */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-content-secondary bg-panel px-2.5 py-1 rounded-md border border-border-subtle">
            <Clock size={12} className="text-accent" />
            <span className="text-accent font-bold">{formatTimeSeconds(currentTime)}</span>
            <span className="text-content-tertiary">/</span>
            <span>{formatTimeSeconds(duration || 0)}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onTogglePlay}
            className="gap-1 font-bold text-[10px] uppercase"
          >
            {isPlaying ? <Pause size={12} className="text-accent" /> : <Play size={12} />}
            <span>{isPlaying ? 'DURDUR' : 'ÇAL'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
