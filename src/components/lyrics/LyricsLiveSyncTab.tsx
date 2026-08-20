import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Mic2, Save, RotateCcw, AlertCircle, Hand } from 'lucide-react';
import { Button } from '../ui';
import { SyncedLine } from '../../types';

interface LyricsLiveSyncTabProps {
  rawText: string;
  onRawTextChange: (val: string) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  onApplySyncedLyrics: (lines: SyncedLine[]) => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
}

export const LyricsLiveSyncTab: React.FC<LyricsLiveSyncTabProps> = ({
  rawText,
  onRawTextChange,
  audioRef,
  onApplySyncedLyrics,
  onTogglePlay,
  isPlaying
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [recordedTimestamps, setRecordedTimestamps] = useState<{line: string, time: number}[]>([]);
  
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Initialize lines when recording starts
  const handleStartRecording = () => {
    const rawLines = rawText.split('\n').filter(l => l.trim().length > 0);
    if (rawLines.length === 0) {
      alert("Lütfen önce şarkı sözlerini yapıştırın!");
      return;
    }
    setLines(rawLines);
    setRecordedTimestamps([]);
    setCurrentLineIndex(0);
    setIsRecording(true);
    
    // Seek to 0 and play
    if (audioRef?.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) onTogglePlay();
    }
    
    // Focus the tap button so spacebar works immediately
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);
  };

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    if (isPlaying) onTogglePlay();
  }, [isPlaying, onTogglePlay]);

  const handleTap = useCallback(() => {
    if (!isRecording || !audioRef?.current) return;
    
    const time = audioRef.current.currentTime;
    setRecordedTimestamps(prev => [...prev, { line: lines[currentLineIndex], time }]);
    
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      // Done
      handleStopRecording();
    }
  }, [isRecording, audioRef, lines, currentLineIndex, handleStopRecording]);

  // Handle spacebar tap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRecording && e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handleTap();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, handleTap]);

  const handleSave = () => {
    if (recordedTimestamps.length === 0) return;
    
    const synced: SyncedLine[] = recordedTimestamps.map((rt, i) => {
      const nextTime = recordedTimestamps[i + 1]?.time || (audioRef?.current?.duration || rt.time + 3);
      return {
        text: rt.line,
        startTime: rt.time,
        // Make the line end right before the next one starts, or 3s later if it's the last line
        endTime: Math.max(rt.time + 0.1, nextTime - 0.1)
      };
    });
    
    onApplySyncedLyrics(synced);
    setIsRecording(false);
  };

  return (
    <div className="space-y-4 bg-panel/70 p-4 border border-border-subtle rounded-lg">
      <div className="space-y-1">
        <label className="text-xs font-bold text-content-primary uppercase flex items-center gap-1.5">
          <Mic2 size={14} className="text-accent" />
          CANLI SENKRONİZASYON (TAP-TO-SYNC)
        </label>
        <p className="text-[10px] text-content-secondary">
          Python betiğindeki gibi: Şarkı sözlerini yapıştırın. Müziği başlatın ve her satırın başladığı anı duyduğunuzda <b>SPACEBAR</b> veya <b>TAP</b> butonuna basın.
        </p>
      </div>

      {!isRecording && recordedTimestamps.length === 0 && (
        <div className="space-y-3">
          <textarea
            rows={8}
            value={rawText}
            onChange={(e) => onRawTextChange(e.target.value)}
            placeholder="Şarkı sözlerini buraya yapıştırın..."
            className="w-full bg-panel border border-border-subtle p-3 text-xs text-content-primary rounded-md outline-none focus:border-accent font-sans"
          />
          <Button
            type="button"
            variant="accent"
            onClick={handleStartRecording}
            className="w-full font-bold text-xs uppercase tracking-wider py-4 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
          >
            <Play size={16} className="mr-2" />
            KAYDI BAŞLAT (MÜZİĞİ SIFIRLA)
          </Button>
        </div>
      )}

      {isRecording && (
        <div className="space-y-4">
          <div className="bg-surface border border-border-strong rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-inner min-h-[200px]">
            <div className="text-[10px] text-content-tertiary uppercase font-bold tracking-widest animate-pulse">
              Duyduğunuz an butona basın
            </div>
            
            <div className="w-full">
              {/* Previous Line */}
              {currentLineIndex > 0 && (
                <div className="text-content-tertiary/50 text-sm truncate mb-2 blur-[1px]">
                  {lines[currentLineIndex - 1]}
                </div>
              )}
              
              {/* Current Target Line */}
              <div className="text-xl md:text-2xl font-bold text-content-primary truncate text-accent shadow-sm drop-shadow-md">
                {lines[currentLineIndex]}
              </div>
              
              {/* Next Line */}
              {currentLineIndex < lines.length - 1 && (
                <div className="text-content-secondary/60 text-sm truncate mt-2">
                  {lines[currentLineIndex + 1]}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              ref={buttonRef}
              type="button"
              variant="accent"
              onClick={handleTap}
              className="flex-1 font-black text-lg py-8 shadow-[0_0_25px_rgba(251,191,36,0.5)] active:scale-95 transition-transform"
            >
              <Hand size={24} className="mr-3" />
              BUNA BAS (VEYA SPACE)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleStopRecording}
              className="py-8 px-4 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
            >
              <Square size={20} />
            </Button>
          </div>
          <div className="text-[10px] text-center text-content-secondary">
            İlerleme: {currentLineIndex} / {lines.length} satır
          </div>
        </div>
      )}

      {!isRecording && recordedTimestamps.length > 0 && (
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] font-bold text-green-400 mb-2 uppercase">Kayıt Başarılı ({recordedTimestamps.length} Satır)</h4>
            <div className="space-y-1">
              {recordedTimestamps.map((rt, i) => (
                <div key={i} className="flex gap-3 text-[11px] font-mono">
                  <span className="text-content-secondary w-12 text-right">[{rt.time.toFixed(2)}]</span>
                  <span className="text-content-primary">{rt.line}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="accent"
              onClick={handleSave}
              className="flex-1 font-bold text-xs uppercase"
            >
              <Save size={14} className="mr-2" />
              ZAMANLAMALARI SİSTEME UYGULA
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRecordedTimestamps([]);
              }}
              className="font-bold text-xs uppercase"
            >
              <RotateCcw size={14} className="mr-2" />
              İPTAL & YENİDEN
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
