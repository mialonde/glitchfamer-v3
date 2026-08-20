import React, { useState, useEffect } from 'react';
import { 
  Volume2, Gauge
} from 'lucide-react';
import { MasteringSettings, MasteringPreset } from '../types';
import { audioEngine, AudioEngine, AudioEnginePlaybackState } from '../core/AudioEngine';
import { Button, Badge, Card, Slider } from './ui';
import { cn } from '../lib/utils';

interface DSPMasteringPanelProps {
  className?: string;
}

export const DSPMasteringPanel: React.FC<DSPMasteringPanelProps> = ({ className }) => {
  const [mastering, setMastering] = useState<MasteringSettings>(AudioEngine.DEFAULT_MASTERING_SETTINGS);
  const [reduction, setReduction] = useState(0);

  useEffect(() => {
    const unsub = audioEngine.subscribe((st: AudioEnginePlaybackState) => {
      setMastering(st.masteringSettings);
      setReduction(st.reduction);
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
    <Card className={cn("p-4 space-y-4 select-none", className)}>
      {/* Üst Bar: Başlık, Durum & Bypass Butonu */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/15 border border-accent/30 rounded-md text-accent">
            <Volume2 size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
                SPOTIFY & MASTERING DSP MOTORU
              </h3>
              {mastering.enabled && (
                <Badge variant="success" className="text-[9px]">
                  AKTİF
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-content-tertiary">
              Donanım hızlandırmalı Web Audio 6-bant analog modelleme zinciri
            </p>
          </div>
        </div>

        <Button
          variant={mastering.enabled ? "accent" : "outline"}
          size="xs"
          onClick={handleToggleBypass}
          className="font-bold text-[10px]"
        >
          {mastering.enabled ? '⚡ DSP AÇIK' : '⚪ BYPASS'}
        </Button>
      </div>

      {/* SPOTIFY -14 LUFS TEK TIKLA NORMALİZASYON VURGUSU */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 shadow-elevation-1">
            -14
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
              SPOTIFY STANDARDI (-14 LUFS) HASSAS NORMALİZASYON
            </span>
            <span className="text-[10px] text-emerald-400/80">
              Dinamik tepe noktalarını sıkıştırır, bas gövdesini ve vokal varlığını Spotify algoritmalarına optimize eder.
            </span>
          </div>
        </div>

        <Button
          size="xs"
          onClick={handleSpotifyOneClickNormalize}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase tracking-wider shrink-0"
        >
          {mastering.preset === 'SPOTIFY' && mastering.enabled ? '✓ UYGULANDI' : 'TEK TIKLA UYGULA'}
        </Button>
      </div>

      {/* Hazır Mastering Presets */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold text-content-secondary uppercase tracking-wider block">
          MASTERING PROFİLLERİ
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {(['SPOTIFY', 'YOUTUBE', 'TIKTOK_BASS', 'PHONK', 'LOFI_WARM', 'CINEMATIC'] as MasteringPreset[]).map((preset) => {
            const isCurrent = mastering.enabled && mastering.preset === preset;
            return (
              <Button
                key={preset}
                variant={isCurrent ? "accent" : "outline"}
                size="xs"
                onClick={() => handleApplyPreset(preset)}
                className={cn(
                  "text-[10px] font-mono uppercase h-auto py-1.5 flex-col gap-0.5",
                  isCurrent && "shadow-elevation-1"
                )}
              >
                <span className="truncate w-full">{preset.replace('_', ' ')}</span>
                {isCurrent && <span className="text-[8px] opacity-80">AKTİF</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* İnce Ayar Parametreleri (EQ, Saturation, Output) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface/50 p-3 rounded-lg border border-border-subtle">
        {/* Bas Güçlendirme */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-content-secondary">
            <span>BASS BOOST (80Hz):</span>
            <span className="text-accent font-bold">{(mastering.bassBoost ?? 0).toFixed(1)} dB</span>
          </div>
          <Slider
            min={-6}
            max={12}
            step={0.5}
            disabled={!mastering.enabled}
            value={mastering.bassBoost ?? 0}
            onChange={(val) => handleUpdateParam('bassBoost', val)}
          />
        </div>

        {/* Mid Presence */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-content-secondary">
            <span>MID PRESENCE (1.5kHz):</span>
            <span className="text-accent font-bold">{(mastering.midPresence ?? 0).toFixed(1)} dB</span>
          </div>
          <Slider
            min={-6}
            max={8}
            step={0.5}
            disabled={!mastering.enabled}
            value={mastering.midPresence ?? 0}
            onChange={(val) => handleUpdateParam('midPresence', val)}
          />
        </div>

        {/* Treble Air */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-content-secondary">
            <span>TREBLE AIR (10kHz):</span>
            <span className="text-accent font-bold">{(mastering.trebleAir ?? 0).toFixed(1)} dB</span>
          </div>
          <Slider
            min={-6}
            max={10}
            step={0.5}
            disabled={!mastering.enabled}
            value={mastering.trebleAir ?? 0}
            onChange={(val) => handleUpdateParam('trebleAir', val)}
          />
        </div>

        {/* Tape Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-content-secondary">
            <span>TAPE SATURATION:</span>
            <span className="text-accent font-bold">{Math.round((mastering.saturation ?? 0) * 100)}%</span>
          </div>
          <Slider
            min={0}
            max={0.8}
            step={0.05}
            disabled={!mastering.enabled}
            value={mastering.saturation ?? 0}
            onChange={(val) => handleUpdateParam('saturation', val)}
          />
        </div>
      </div>

      {/* Gain Reduction & Kompresör Göstergesi */}
      <div className="flex items-center justify-between text-[10px] font-mono text-content-tertiary bg-surface/30 px-3 py-1.5 rounded-md border border-border-subtle">
        <div className="flex items-center gap-2">
          <Gauge size={13} className={reduction < -0.5 ? "text-amber-400" : "text-content-tertiary"} />
          <span>GAIN REDUCTION:</span>
          <span className="text-content-primary font-bold">{reduction.toFixed(1)} dB</span>
        </div>
        <div className="flex items-center gap-2">
          <span>HEDEF:</span>
          <span className="text-accent font-bold">{mastering.lufsTarget || -14} LUFS</span>
        </div>
      </div>
    </Card>
  );
};

