import React, { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';

interface Props {
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  reactCurrentTime: number;
}

export const SyncDriftDebugger: React.FC<Props> = ({ audioRef, reactCurrentTime }) => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<{ audioTime: number; reactTime: number; deltaMs: number }[]>([]);
  const requestRef = useRef<number>();
  
  // Use a ref to hold the latest reactCurrentTime so we don't re-bind the rAF loop
  const reactTimeRef = useRef(reactCurrentTime);
  useEffect(() => {
    reactTimeRef.current = reactCurrentTime;
  }, [reactCurrentTime]);

  useEffect(() => {
    if (!isVisible || !audioRef) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      const audioTime = audioRef.current?.currentTime || 0;
      const reactTime = reactTimeRef.current;
      const deltaMs = (audioTime - reactTime) * 1000;

      dataRef.current.push({ audioTime, reactTime, deltaMs });
      if (dataRef.current.length > 200) {
        dataRef.current.shift();
      }

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw center line (0ms drift)
      const centerY = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.setLineDash([2, 2]);
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw drift line
      ctx.beginPath();
      ctx.strokeStyle = '#FBBF24'; // amber-400
      ctx.lineWidth = 2;
      
      const maxDrift = 500; // max +/- 500ms for scale

      dataRef.current.forEach((point, i) => {
        const x = (i / 200) * canvas.width;
        // Map delta to Y axis (clamped to maxDrift)
        const clampedDelta = Math.max(-maxDrift, Math.min(maxDrift, point.deltaMs));
        const y = centerY - (clampedDelta / maxDrift) * (canvas.height / 2);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Current values text
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`Drift: ${deltaMs.toFixed(1)}ms`, 5, 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(`Audio: ${audioTime.toFixed(3)}s`, 5, canvas.height - 15);
      ctx.fillText(`State: ${reactTime.toFixed(3)}s`, 5, canvas.height - 4);

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible, audioRef]); 

  if (!audioRef) return null;

  return (
    <div className="absolute top-2 right-2 z-50">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className={`p-1.5 rounded-md flex items-center justify-center transition-colors shadow-sm ${
          isVisible ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
        }`}
        title="Toggle Sync Drift Debugger"
      >
        <Activity size={14} />
      </button>
      
      {isVisible && (
        <div className="absolute top-full right-0 mt-2 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 p-2 rounded-lg shadow-2xl w-48 z-50">
          <div className="text-[10px] font-bold text-zinc-300 uppercase mb-1.5 flex justify-between items-center">
            <span className="flex items-center gap-1.5"><Activity size={10} className="text-amber-400" /> Sync Drift</span>
            <span className="text-zinc-500">+/- 500ms</span>
          </div>
          <canvas 
            ref={canvasRef}
            width={174}
            height={60}
            className="bg-black/60 rounded border border-zinc-800/80 w-full mb-1.5"
          />
          <div className="text-[9px] text-zinc-500 leading-tight">
            Plots delta between high-frequency raw Audio API clock and React <code className="text-zinc-400 bg-zinc-800 px-0.5 py-px rounded">currentTime</code> state loop.
          </div>
        </div>
      )}
    </div>
  );
};
