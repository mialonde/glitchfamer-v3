import React, { useState, useEffect } from 'react';
import { 
  Volume2, Sliders, Activity, Zap, Check, RotateCcw, 
  Sparkles, Radio, Gauge, AudioWaveform
} from 'lucide-react';
import { MasteringSettings, MasteringPreset } from '../types';
import { audioEngine, AudioEngine, AudioEnginePlaybackState } from '../core/AudioEngine';
import { cn } from '../lib/utils';

interface DSPMasteringPanelProps {
  className?: string;
}

export const DSPMasteringPanel: React.FC<DSPMasteringPanelProps> = ({ className }) => {
  const [mastering, setMastering] = useState<MasteringSettings>(AudioEngine.DEFAULT_MASTERING_SETTINGS);
  const [reduction, setReduction] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const unsub = audioEngine.subscribe((st: AudioEnginePlaybackState) => {
      setMastering(st.masteringSettings);
      setReduction(st.reduction);
      setIsAudioPlaying(st.isPlaying);
    });
    return () => unsub();
  }, []);

  const handleApplyPreset = (presetKey: MasteringPreset) => {
    audioEngine.setMasteringPreset(presetKey);
  };

  const handleUpdateParam = (key: keyof MasteringSettings, value: number | boolean | string) => {
    audioEngine.updateMasteringSettings({ [key]: value });
  };

  const handleToggleBypass = () => {
    audioEngine.updateMasteringSettings({ enabled: !mastering.enabled });
  };

  const handleSpotifyOneClickNormalize = () => {
    audioEngine.setMasteringPreset('SPOTIFY');
    audioEngine.updateMasteringSettings({
      enabled: true,
      lufsTarget: -14,
      bassBoost: 2.8,
      midPresence: 1.2,
      trebleAir: 2.2,
      outputGain: 1.05
    });
  };

  return (
    <div className={cn("bg-panel border border-border-subtle p-4 rounded-lg space-y-4 select-none", className)}>
      {/* Üst Bar: Başlık, Durum & Bypass Butonu */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/15 border border-accent/30 rounded text-accent">
            <Volume2 size={14} />
          </div>
          <div>
            <h3 className="text-[11px] font-sans font-black uppercase tracking-wider text-content-primary flex items-center gap-1.5">
              SPOTIFY & MASTERING DSP MOTORU
              {mastering.enabled && (
                <span className="text-[7.5px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                  AKTİF
                </span>
              )}
            </h3>
            <p className="text-[8px] font-mono text-content-tertiary">
              Donanım hızlandırmalı Web Audio 6-bant analog modelleme zinciri
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleBypass}
          className={cn(
            "px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded border transition-all cursor-pointer",
            mastering.enabled
              ? "bg-accent text-black border-accent font-black shadow-sm"
              : "bg-surface text-content-tertiary border-border-subtle hover:text-content-primary"
          )}
        >
          {mastering.enabled ? '⚡ DSP AÇIK' : '⚪ BYPASS (KAPALI)'}
        </button>
      </div>

      {/* 🚀 SPOTIFY -14 LUFS TEK TIKLA NORMALİZASYON VURGUSU */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black border border-emerald-500/40 p-3 rounded-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            -14
          </div>
          <div className="flex flex-col">
            <span className="text-[9.5px] font-sans font-black text-emerald-300 uppercase tracking-wide">
              SPOTIFY STANDARDI (-14 LUFS) HASSAS NORMALİZASYON
            </span>
            <span className="text-[8px] font-mono text-emerald-400/70">
              Dinamik tepe noktalarını sıkıştırır, bas gövdesini ve vokal varlığını Spotify algoritmalarına optimize eder.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpotifyOneClickNormalize}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-sans font-black uppercase tracking-wider rounded transition-all shadow-md cursor-pointer shrink-0"
        >
          {mastering.preset === 'SPOTIFY' && mastering.enabled ? '✓ UYGULANDI' : 'TEK TIKLA UYGULA'}
        </button>
      </div>

      {/* Hazır Mastering Presets */}
      <div className="space-y-1.5">
        <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          MASTERING PROFİLLERİ
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {(['SPOTIFY', 'YOUTUBE', 'TIKTOK_BASS', 'PHONK', 'LOFI_WARM', 'CINEMATIC'] as MasteringPreset[]).map((preset) => {
            const isCurrent = mastering.enabled && mastering.preset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "p-2 text-center border rounded text-[8.5px] font-sans uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5",
                  isCurrent
                    ? "bg-accent text-black border-accent font-black shadow-sm"
                    : "bg-surface text-content-secondary border-border-subtle hover:border-border-strong hover:text-content-primary"
                )}
              >
                <span className="truncate w-full">{preset.replace('_', ' ')}</span>
                {isCurrent && <span className="text-[7px] opacity-80">AKTİF</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* İnce Ayar Parametreleri (EQ, Saturation, Output) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-3 rounded border border-border-subtle">
        {/* Bas Güçlendirme */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8.5px] font-mono text-content-secondary">
            <span>BASS BOOST (80Hz):</span>
            <span className="text-accent font-bold">{(mastering.bassBoost ?? 0).toFixed(1)} dB</span>
          </div>
          <input
            type="range"
            min="-6"
            max="12"
            step="0.5"
            disabled={!mastering.enabled}
            value={mastering.bassBoost ?? 0}
            onChange={(e) => handleUpdateParam('bassBoost', parseFloat(e.target.value))}
            className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Mid Presence */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8.5px] font-mono text-content-secondary">
            <span>MID PRESENCE (1.5kHz):</span>
            <span className="text-accent font-bold">{(mastering.midPresence ?? 0).toFixed(1)} dB</span>
          </div>
          <input
            type="range"
            min="-6"
            max="8"
            step="0.5"
            disabled={!mastering.enabled}
            value={mastering.midPresence ?? 0}
            onChange={(e) => handleUpdateParam('midPresence', parseFloat(e.target.value))}
            className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Treble Air */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8.5px] font-mono text-content-secondary">
            <span>TREBLE AIR (10kHz):</span>
            <span className="text-accent font-bold">{(mastering.trebleAir ?? 0).toFixed(1)} dB</span>
          </div>
          <input
            type="range"
            min="-6"
            max="10"
            step="0.5"
            disabled={!mastering.enabled}
            value={mastering.trebleAir ?? 0}
            onChange={(e) => handleUpdateParam('trebleAir', parseFloat(e.target.value))}
            className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Tape Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[8.5px] font-mono text-content-secondary">
            <span>TAPE SATURATION:</span>
            <span className="text-accent font-bold">{Math.round((mastering.saturation ?? 0) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            disabled={!mastering.enabled}
            value={mastering.saturation ?? 0}
            onChange={(e) => handleUpdateParam('saturation', parseFloat(e.target.value))}
            className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* Gain Reduction & Kompresör Göstergesi */}
      <div className="flex items-center justify-between text-[8.5px] font-mono text-content-tertiary bg-surface/50 px-3 py-1.5 rounded border border-border-subtle">
        <div className="flex items-center gap-2">
          <Gauge size={12} className={reduction < -0.5 ? "text-amber-400" : "text-content-tertiary"} />
          <span>GAIN REDUCTION:</span>
          <span className="text-content-primary font-bold">{reduction.toFixed(1)} dB</span>
        </div>
        <div className="flex items-center gap-2">
          <span>HEDEF:</span>
          <span className="text-accent font-bold">{mastering.lufsTarget || -14} LUFS</span>
        </div>
      </div>
    </div>
  );
};
