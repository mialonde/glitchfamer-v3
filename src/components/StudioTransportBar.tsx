import React from "react";
import { 
  Play, Pause, FastForward, Rewind, RotateCcw, 
  Type, Volume2, VolumeX 
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface StudioTransportBarProps {
  audioUrl: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  lyricsEnabled: boolean;
  formatTime: (s: number) => string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleLyrics: () => void;
  onSeek: (seconds: number) => void;
  onSeekRelative: (offset: number) => void;
}

export const StudioTransportBar: React.FC<StudioTransportBarProps> = ({
  audioUrl,
  isPlaying,
  isMuted,
  currentTime,
  duration,
  lyricsEnabled,
  formatTime,
  onTogglePlay,
  onToggleMute,
  onToggleLyrics,
  onSeek,
  onSeekRelative
}) => {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mt-2 sm:mt-3 bg-panel border border-border-subtle p-3 rounded-lg flex flex-col gap-2 shadow-elevation-2 shrink-0">
      {/* Timeline Scrubber Slider */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <span className="text-[10px] font-mono text-content-secondary w-10 text-right shrink-0">
          {formatTime(currentTime)}
        </span>
        
        <div className="relative flex-1 flex items-center h-4 group">
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full bg-accent group-hover:bg-accent-hover transition-all rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime}
            disabled={!audioUrl}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <span className="text-[10px] font-mono text-content-tertiary w-10 shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* Kontrol Butonları */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSeekRelative(-5)}
            disabled={!audioUrl}
            title="5 Saniye Geri Sar"
          >
            <Rewind size={14} />
          </Button>

          <Button 
            variant="accent"
            size="icon"
            onClick={onTogglePlay} 
            disabled={!audioUrl}
            title="Oynat / Durdur (Boşluk Tuşu)"
            className="rounded-full shadow-[0_0_12px_rgba(0,87,255,0.4)]"
          >
            {isPlaying ? (
              <Pause size={15} fill="currentColor" />
            ) : (
              <Play size={15} fill="currentColor" className="ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSeekRelative(5)}
            disabled={!audioUrl}
            title="5 Saniye İleri Sar"
          >
            <FastForward size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSeek(0)}
            disabled={!audioUrl}
            title="Başa Dön"
            className="ml-1"
          >
            <RotateCcw size={13} />
          </Button>
        </div>

        {/* Ses ve Kısayol İpuçları */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleLyrics}
            className={cn(
              lyricsEnabled ? "text-accent hover:text-accent-hover" : "text-content-tertiary"
            )}
            title={lyricsEnabled ? "Sözleri Gizle" : "Sözleri Göster"}
          >
            <Type size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleMute}
            disabled={!audioUrl}
            className={cn(isMuted && "text-red-400 hover:text-red-300")}
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </Button>

          <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-sans text-content-tertiary border-l border-border-subtle pl-3">
            <span className="bg-surface px-1.5 py-0.5 rounded border border-border-subtle text-content-secondary font-mono">SPACE</span>
            <span>Oynat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

