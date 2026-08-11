import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { VisualizerSettings, UserInteractionState } from '../types';
import { StudioRenderer } from '../core/Renderer';
import { AudioProcessor } from '../core/AudioProcessor';
import { audioEngine } from '../core/AudioEngine';

export interface VisualizerHandle {
  startRecording: (duration: number) => void;
  stopRecording: () => void;
  getStream: () => MediaStream | null;
}

interface Props {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  vocalAnalyserRef?: React.RefObject<AnalyserNode | null>;
  audioTrack?: MediaStreamTrack | null;
  settings: VisualizerSettings;
  isPlaying: boolean;
  isRecording?: boolean;
  coverUrl?: string | null;
  logoUrl?: string | null;
  bgVideoUrl?: string | null;
  bgImageUrl?: string | null;
  currentTime?: number;
  duration?: number;
  onTogglePlay?: () => void;
  onSeekRelative?: (seconds: number) => void;
  onSeekTo?: (time: number) => void;
  onRecordingComplete?: (blobUrl: string) => void;
  onRecordingStatusChange?: (recording: boolean) => void;
}

export const VisualizerCanvas = forwardRef<VisualizerHandle, Props>(({
  audioRef,
  analyserRef,
  vocalAnalyserRef,
  audioTrack,
  settings,
  isPlaying,
  isRecording: externalIsRecording,
  coverUrl,
  logoUrl,
  bgVideoUrl,
  bgImageUrl,
  currentTime = 0,
  duration = 0,
  onTogglePlay,
  onSeekRelative,
  onSeekTo,
  onRecordingComplete,
  onRecordingStatusChange
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoBgRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<StudioRenderer | null>(null);
  const processorRef = useRef<AudioProcessor | null>(null);
  
  // Interactive User Pointer & Orbit Gesture State
  const interactionRef = useRef<UserInteractionState>({
    pointerX: 0,
    pointerY: 0,
    isPointerDown: false,
    dragDeltaX: 0,
    dragDeltaY: 0,
    rotationX: 0,
    rotationY: 0,
    gravityAttractor: null,
    fluidRipples: [],
    styleVariant: 0,
    glitchBoost: 0,
    paletteIndex: 0
  });
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const hudTimeoutRef = useRef<number | null>(null);

  // Render Durumu ve İlerleme
  const [internalRecording, setInternalRecording] = useState(false);
  const isRecording = externalIsRecording !== undefined ? externalIsRecording : internalRecording;
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [recordTotal, setRecordTotal] = useState(0);
  const [isTabHidden, setIsTabHidden] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const progressTimerRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const originalTitleRef = useRef<string>(document.title || 'VidFramer 2.0');

  // Sekme Değişimi Tespiti (Tab Visibility Listener)
  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.hidden;
      setIsTabHidden(hidden);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // 1. Motoru ve Ses İşlemcisini Başlat
  useEffect(() => {
    if (!canvasRef.current) return;
    
    if (!rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }
    if (analyserRef.current && !processorRef.current) {
      processorRef.current = new AudioProcessor(analyserRef.current, vocalAnalyserRef?.current || undefined);
    }
  }, []);

  useEffect(() => {
    if (analyserRef.current && !processorRef.current) {
      processorRef.current = new AudioProcessor(analyserRef.current, vocalAnalyserRef?.current || undefined);
    }
  }, [analyserRef, vocalAnalyserRef]);

  // 2. Görselleri Motora Yükle
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }
    
    if (coverUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => rendererRef.current?.setCoverImage(img);
      img.src = coverUrl;
    } else {
      rendererRef.current?.setCoverImage(null);
    }
  }, [coverUrl]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }
    
    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => rendererRef.current?.setLogoImage(img);
      img.src = logoUrl;
    } else {
      rendererRef.current?.setLogoImage(null);
    }
  }, [logoUrl]);

  // Arka Plan Görselini Yükle ve Motora Bağla
  const activeImageUrl = bgImageUrl || settings.bgImageUrl;
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }

    if (activeImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => rendererRef.current?.setBgImage(img);
      img.src = activeImageUrl;
    } else {
      rendererRef.current?.setBgImage(null);
    }
  }, [activeImageUrl]);

  // Arka Plan Videosunu Yükle ve Motora Bağla
  const activeVideoUrl = bgVideoUrl || settings.bgVideoUrl;
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }

    if (activeVideoUrl && videoBgRef.current) {
      videoBgRef.current.src = activeVideoUrl;
      videoBgRef.current.load();
      videoBgRef.current.play().catch(e => console.warn("Background video auto-play:", e));
      rendererRef.current?.setBgVideo(videoBgRef.current);
    } else {
      if (videoBgRef.current) {
        videoBgRef.current.pause();
        videoBgRef.current.src = "";
      }
      rendererRef.current?.setBgVideo(null);
    }
  }, [activeVideoUrl]);

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (workerUrlRef.current) {
        URL.revokeObjectURL(workerUrlRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Tek kare çizme fonksiyonu (Hem rAF hem de Web Worker tarafından tetiklenebilir)
  const drawFrame = (currentTime: number, delta: number) => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new StudioRenderer(canvasRef.current);
    }
    if (analyserRef.current && !processorRef.current) {
      processorRef.current = new AudioProcessor(analyserRef.current, vocalAnalyserRef?.current || undefined);
    }

    if (rendererRef.current) {
      let audioEvents;

      // Ambient / Idle Animasyon
      if (isPlaying && processorRef.current && audioRef.current) {
        audioEvents = processorRef.current.process(audioRef.current.currentTime, delta);
      } else {
        const now = Date.now() / 1000;
        const ambientKick = Math.pow((Math.sin(now * 3.5) + 1) / 2, 4) * 0.45;
        const ambientSnare = Math.pow((Math.cos(now * 2.8) + 1) / 2, 3) * 0.35;
        const ambientHihat = Math.sin(now * 7) * 0.25 + 0.25;
        const ambientEnergy = 0.2 + ambientKick * 0.4;
        const ambientSpectrum = new Array(64).fill(0).map((_, i) => {
          const wave = Math.sin((i / 8) + now * 3) * 0.3 + 0.35;
          return Math.max(0.05, Math.min(1, wave * (1 - (i / 75))));
        });

        audioEvents = {
          kick: ambientKick,
          snare: ambientSnare,
          hihat: ambientHihat,
          energy: ambientEnergy,
          bassEnergy: ambientKick * 1.2,
          midEnergy: ambientSnare,
          highEnergy: ambientHihat,
          trebleEnergy: ambientHihat,
          spectrum: ambientSpectrum,
          time: now,
          beat: ambientKick > 0.35,
          isSilence: false,
          delta: delta
        };
      }

      // Continuous User Interaction State Updates (Decay & Ripple Animations)
      const inter = interactionRef.current;
      if (inter.glitchBoost > 0.01) inter.glitchBoost *= 0.92;
      if (inter.fluidRipples.length > 0) {
        for (let i = inter.fluidRipples.length - 1; i >= 0; i--) {
          const rip = inter.fluidRipples[i];
          rip.radius += rip.speed;
          rip.alpha = Math.max(0, 1 - rip.radius / rip.maxRadius);
          if (rip.radius >= rip.maxRadius) {
            inter.fluidRipples.splice(i, 1);
          }
        }
      }
      rendererRef.current.setInteraction(inter);

      rendererRef.current.render(audioEvents, settings);
    }
  };

  // 3. ANA RENDER DÖNGÜSÜ (60 FPS Kesintisiz & Dual-Clock Destekli)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      const delta = Math.min(0.05, (time - lastTime) / 1000) || (1 / 60);
      lastTime = time;

      const audioCurrentTime = audioRef.current?.currentTime || 0;
      drawFrame(audioCurrentTime, delta);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isRecording, settings, audioRef, analyserRef]);

  const stopActiveRecording = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.postMessage('stop');
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
      workerUrlRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Recorder stop error:", e);
      }
    }
    document.title = originalTitleRef.current;
    setInternalRecording(false);
    if (onRecordingStatusChange) onRecordingStatusChange(false);
  };

  // 4. KAYIT MOTORU (MediaRecorder + Web Worker Arka Plan Koruyucu)
  useImperativeHandle(ref, () => ({
    getStream: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.captureStream(60);
    },
    startRecording: (duration: number) => {
      if (!canvasRef.current || !audioRef.current) return;
      
      const targetDuration = duration && !isNaN(duration) && duration > 0 ? duration : 30;
      setRecordTotal(targetDuration);
      setRecordElapsed(0);
      setRecordProgress(0);
      setInternalRecording(true);
      if (onRecordingStatusChange) onRecordingStatusChange(true);
      chunksRef.current = [];
      originalTitleRef.current = document.title || 'VidFramer 2.0';

      // Arka plan sekme donmasını önlemek için Web Worker Ticker başlat
      try {
        const workerBlob = new Blob([`
          let timer = null;
          self.onmessage = function(e) {
            if (e.data === 'start') {
              if (timer) clearInterval(timer);
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 1000 / 60);
            } else if (e.data === 'stop') {
              if (timer) clearInterval(timer);
              timer = null;
            }
          };
        `], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        workerUrlRef.current = workerUrl;
        const worker = new Worker(workerUrl);
        worker.onmessage = () => {
          // Eğer sekme arka plandaysa (document.hidden), worker zorla canvas'ı çizer
          if (document.hidden && audioRef.current) {
            drawFrame(audioRef.current.currentTime, 1 / 60);
          }
        };
        worker.postMessage('start');
        workerRef.current = worker;
      } catch (err) {
        console.warn("Web Worker timer initialization warning:", err);
      }

      // Canvas ve Ses Streamlerini Birleştir (Audio Mastering Track Dahil Edildi!)
      const canvasStream = canvasRef.current.captureStream(60);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      const effectiveAudioTrack = audioTrack || audioEngine.getAudioStreamTrack();
      if (effectiveAudioTrack) {
        tracks.push(effectiveAudioTrack);
      }

      const combinedStream = new MediaStream(tracks);

      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }

      try {
        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 8000000 // 8 Mbps yüksek kalite
        });
        
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          document.title = originalTitleRef.current;
          setInternalRecording(false);
          if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
          }
          if (onRecordingStatusChange) onRecordingStatusChange(false);
          if (onRecordingComplete) onRecordingComplete(url);
        };

        recorder.start(100); // 100ms chunks
        mediaRecorderRef.current = recorder;

        // Audio çalmayı baştan başlat (AudioEngine üzerinden)
        audioEngine.seek(0);
        audioEngine.play().catch(e => console.warn("Audio play warning during render:", e));

        const startTime = Date.now();
        progressTimerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          setRecordElapsed(elapsed);
          const percent = Math.min(100, Math.round((elapsed / targetDuration) * 100));
          setRecordProgress(percent);

          // Sekme başlığında dinamik ilerleme göster
          document.title = `⚡ [%${percent}] Render İşleniyor... - VidFramer`;

          if (elapsed >= targetDuration) {
            stopActiveRecording();
          }
        }, 100);

        audioRef.current.onended = () => {
          stopActiveRecording();
        };

      } catch (err) {
        console.error("MediaRecorder başlatılamadı:", err);
        document.title = originalTitleRef.current;
        setInternalRecording(false);
        if (onRecordingStatusChange) onRecordingStatusChange(false);
      }
    },
    stopRecording: () => {
      stopActiveRecording();
    }
  }));

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const triggerHudActivity = useCallback(() => {
    setShowHud(true);
    if (hudTimeoutRef.current) {
      window.clearTimeout(hudTimeoutRef.current);
    }
    hudTimeoutRef.current = window.setTimeout(() => {
      setShowHud(false);
    }, 2800);
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      if (fs) {
        triggerHudActivity();
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, [triggerHudActivity]);

  // Global & Fullscreen Keyboard Shortcut Handler (ArrowLeft, ArrowRight, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (onTogglePlay) {
          onTogglePlay();
        } else if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          } else {
            audioRef.current.pause();
          }
        }
        triggerHudActivity();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        if (onSeekRelative) {
          onSeekRelative(-5);
        } else if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
        }
        triggerHudActivity();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        if (onSeekRelative) {
          onSeekRelative(5);
        } else if (audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.duration || 99999, audioRef.current.currentTime + 5);
        }
        triggerHudActivity();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [onTogglePlay, onSeekRelative, audioRef, triggerHudActivity]);

  // Pointer & Touch Handlers for 3D Orbit, Fluid Ripples & Magnetic Attractor
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    triggerHudActivity();
    const coords = getCanvasCoords(e);
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    const inter = interactionRef.current;
    inter.isPointerDown = true;
    inter.pointerX = coords.x;
    inter.pointerY = coords.y;
    inter.gravityAttractor = { x: coords.x, y: coords.y, strength: 1.0 };
    inter.glitchBoost = 0.55;

    // Add interactive fluid ripple
    inter.fluidRipples.push({
      x: coords.x,
      y: coords.y,
      radius: 8,
      maxRadius: 380,
      color: settings.primaryColor,
      alpha: 1.0,
      speed: 7
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    triggerHudActivity();
    const coords = getCanvasCoords(e);
    const inter = interactionRef.current;
    inter.pointerX = coords.x;
    inter.pointerY = coords.y;

    if (inter.isPointerDown) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      inter.rotationY += (dx / 350);
      inter.rotationX += (dy / 350);
      inter.gravityAttractor = { x: coords.x, y: coords.y, strength: 1.0 };
    }
  };

  const handlePointerUp = () => {
    const inter = interactionRef.current;
    inter.isPointerDown = false;
    inter.gravityAttractor = null;
  };

  const handleDoubleClick = () => {
    const inter = interactionRef.current;
    inter.styleVariant = (inter.styleVariant + 1) % 10;
    inter.paletteIndex = (inter.paletteIndex + 1) % 5;
    inter.glitchBoost = 0.9;
    triggerHudActivity();
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={triggerHudActivity}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group select-none"
    >
      
      {/* Dynamic Hidden Video Element for Background Video Layer */}
      <video 
        ref={videoBgRef} 
        loop 
        muted 
        playsInline 
        className="hidden" 
        crossOrigin="anonymous"
      />
      
      {/* Tam Ekran & HD Rozeti (Top Controls) */}
      <div className={`absolute top-3 right-3 z-30 flex items-center gap-2 transition-opacity duration-300 ${isFullscreen && !showHud ? 'opacity-0 pointer-events-none' : 'opacity-80 group-hover:opacity-100'}`}>
        <span className="bg-black/70 border border-yellow-400/40 text-yellow-400 text-[10px] font-mono px-2 py-1 rounded-sm shadow-md">
          {settings.aspectRatio} | {settings.mode}
        </span>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          className="bg-black/80 hover:bg-[#FFD700] text-white hover:text-black border border-yellow-400/50 p-1.5 rounded-sm transition-all cursor-pointer shadow-lg"
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          )}
        </button>
      </div>

      {/* FLOATING HUD TRANSPORT CONTROLS (Tam Ekran Modunda Otomatik Gizlenen Player Bar) */}
      {isFullscreen && (
        <div 
          className={`absolute bottom-6 inset-x-0 mx-auto w-[92%] max-w-xl z-40 bg-[#0A0A0E]/85 backdrop-blur-md border border-yellow-400/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-2xl transition-all duration-300 ${
            showHud ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono text-zinc-400 min-w-[38px]">{formatSecs(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (onSeekTo) onSeekTo(val);
                else if (audioRef.current) audioRef.current.currentTime = val;
                triggerHudActivity();
              }}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
            />
            <span className="text-[11px] font-mono text-zinc-500 min-w-[38px]">{formatSecs(duration)}</span>
          </div>

          {/* Transport Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onSeekRelative) onSeekRelative(-5);
                  else if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
                  triggerHudActivity();
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="5 Saniye Geri (←)"
              >
                <span>⏪</span>
                <span>-5s</span>
              </button>

              <button
                onClick={() => {
                  if (onTogglePlay) onTogglePlay();
                  else if (audioRef.current) {
                    if (audioRef.current.paused) audioRef.current.play();
                    else audioRef.current.pause();
                  }
                  triggerHudActivity();
                }}
                className="px-5 py-1.5 bg-[#FFD700] hover:bg-yellow-300 text-black font-black rounded-lg text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                title="Oynat / Durdur (Space)"
              >
                {isPlaying ? '⏸ DURDUR' : '▶ OYNAT'}
              </button>

              <button
                onClick={() => {
                  if (onSeekRelative) onSeekRelative(5);
                  else if (audioRef.current) audioRef.current.currentTime = Math.min(duration || 99999, audioRef.current.currentTime + 5);
                  triggerHudActivity();
                }}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="5 Saniye İleri (→)"
              >
                <span>+5s</span>
                <span>⏩</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span className="hidden sm:inline bg-zinc-900/90 border border-white/10 px-2.5 py-1 rounded text-zinc-300">
                ← / → : 5s | Space : Play
              </span>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded transition-colors cursor-pointer"
                title="Tam Ekrandan Çık (Esc)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={settings.aspectRatio === '16/9' ? 1920 : 1080}
        height={settings.aspectRatio === '16/9' ? 1080 : settings.aspectRatio === '1/1' ? 1080 : 1920}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,215,0,0.1)] transition-all duration-300 cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* RENDER PERDESİ (İşleniyor Ekranı - Stüdyo Modu) */}
      {isRecording && (
        <div className="absolute inset-0 z-50 bg-[#050505]/95 backdrop-blur-md flex flex-col items-center justify-center border-2 border-[#FFD700] p-6">
          <div className="text-[#FFD700] mb-4 animate-pulse">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
          </div>
          
          <h2 className="text-xl font-black text-white tracking-[0.3em] mb-2 text-center uppercase">
            MASTERING & 60FPS RENDER <br/><span className="text-[#FFD700]">İŞLENİYOR...</span>
          </h2>

          <div className="text-3xl font-mono font-black text-[#FFD700] mb-3">
            %{recordProgress}
          </div>
          
          <div className="w-full max-w-[320px] h-2 bg-zinc-900 mb-3 border border-zinc-800 overflow-hidden relative">
            <div 
              className="absolute inset-y-0 left-0 bg-[#FFD700] transition-all duration-100" 
              style={{ width: `${recordProgress}%` }}
            />
          </div>

          {/* Tab Durumu ve Arka Plan Bildirimi */}
          {isTabHidden ? (
            <div className="bg-amber-950/80 border border-amber-500/80 text-amber-200 px-4 py-2.5 rounded-sm max-w-[420px] text-center mb-4 text-[10px] font-mono animate-pulse">
              <span className="font-bold uppercase text-amber-400 block mb-0.5">⚠️ SEKMEDEN AYRILDINIZ</span>
              Tarayıcınız arka planda GPU çizimini yavaşlatabilir. Donmasız 60 FPS render için işlem bitene kadar bu sekmede kalmanız önerilir (Web Worker koruması aktif).
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3 bg-zinc-900/90 border border-zinc-800 px-3 py-1 text-[9px] font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>SEKME AKTİF: 60 FPS DONANIM HIZLANDIRMALI RENDER</span>
            </div>
          )}

          <div className="text-zinc-400 text-xs font-mono mb-6">
            {formatSecs(recordElapsed)} / {formatSecs(recordTotal)}
          </div>

          <button
            onClick={stopActiveRecording}
            className="px-6 py-2 bg-zinc-800 hover:bg-[#FFD700] text-zinc-200 hover:text-black font-black text-[10px] tracking-widest uppercase transition-colors border border-zinc-700 mb-4 cursor-pointer"
          >
            ⏹ RENDER'I BİTİR VE VİDEOYU AL
          </button>

          <div className="text-center space-y-1">
            <p className="text-[#FFD700] text-[10px] font-bold tracking-widest uppercase">
              ⚡ SPOTIFY DSP & MASTERING İLE 60 FPS KAYDEDİLİYOR
            </p>
            <p className="text-zinc-500 text-[9px] font-mono tracking-wide max-w-[360px]">
              Tüm görsel efektler, dinamik vuruşlar ve ses senkronizasyonu gerçek zamanlı işlenmektedir.
            </p>
          </div>
        </div>
      )}

    </div>
  );
});
