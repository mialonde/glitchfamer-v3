import React from "react";
import { 
  Play, Pause, FastForward, Rewind, RotateCcw, 
  Type, Volume2, VolumeX 
} from "lucide-react";
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
  return (
    <div className="w-full max-w-4xl mt-2 sm:mt-3 bg-surface border border-white/[0.09] p-2.5 sm:p-3 rounded-lg flex flex-col gap-2 shadow-xl shrink-0">
      {/* Timeline Scrubber Slider */}
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <span className="text-[9px] sm:text-[10px] font-sans text-content-secondary w-9 sm:w-10 text-right shrink-0">
          {formatTime(currentTime)}
        </span>
        
        <div className="relative flex-1 flex items-center">
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime}
            disabled={!audioUrl}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-hover rounded-lg accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-30 transition-all"
          />
        </div>

        <span className="text-[9px] sm:text-[10px] font-sans text-content-tertiary w-9 sm:w-10 shrink-0">
          {formatTime(duration)}
        </span>
      </div>

      {/* Kontrol Butonları */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onSeekRelative(-5)}
            disabled={!audioUrl}
            title="5 Saniye Geri Sar"
            className="p-1.5 text-content-secondary hover:text-content-primary transition-colors cursor-pointer disabled:opacity-20"
          >
            <Rewind size={15} />
          </button>

          <button 
            type="button"
            onClick={onTogglePlay} 
            disabled={!audioUrl}
            title="Oynat / Durdur (Boşluk Tuşu)"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent hover:bg-white text-black flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_12px_rgba(255,215,0,0.3)] cursor-pointer disabled:opacity-30"
          >
            {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => onSeekRelative(5)}
            disabled={!audioUrl}
            title="5 Saniye İleri Sar"
            className="p-1.5 text-content-secondary hover:text-content-primary transition-colors cursor-pointer disabled:opacity-20"
          >
            <FastForward size={15} />
          </button>

          <button
            type="button"
            onClick={() => onSeek(0)}
            disabled={!audioUrl}
            title="Başa Dön"
            className="p-1.5 text-content-secondary hover:text-content-primary transition-colors cursor-pointer disabled:opacity-20 ml-1"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Ses ve Kısayol İpuçları */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleLyrics}
            className={cn(
              "transition-colors cursor-pointer p-1 rounded hover:bg-surface",
              lyricsEnabled ? "text-accent" : "text-content-tertiary"
            )}
            title={lyricsEnabled ? "Sözleri Gizle" : "Sözleri Göster"}
          >
            {lyricsEnabled ? <Type size={15} /> : <Type size={15} className="opacity-50" />}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            disabled={!audioUrl}
            className="text-content-secondary hover:text-content-primary transition-colors cursor-pointer disabled:opacity-20 p-1 rounded hover:bg-surface"
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          >
            {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[8.5px] font-sans text-content-tertiary border-l border-border-strong pl-3">
            <span className="bg-surface px-1.5 py-0.5 rounded border border-border-strong text-content-secondary">SPACE</span>
            <span>Oynat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
