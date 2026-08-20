import React from 'react';
import { VisualizerSettings } from '../types';
import { Sparkles, Zap, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button, Badge, Card, Slider } from './ui';
import { cn } from '../lib/utils';

interface EffectsStudioProps {
  settings: VisualizerSettings;
  onChange: (updated: Partial<VisualizerSettings>) => void;
}

export const EffectsStudio: React.FC<EffectsStudioProps> = ({ settings, onChange }) => {
  // Hazır Efekt Paketleri
  const applyPreset = (presetName: 'ALL_ON' | 'EUPHORIC' | 'RETRO_VHS' | 'MINIMAL' | 'ALL_OFF' | 'PSYCHEDELIC' | 'DEEP_SPACE') => {
    switch (presetName) {
      case 'ALL_ON':
        onChange({
          rgbSplitEnabled: true, scanLinesEnabled: true, vignetteEnabled: true,
          bloomEnabled: true, filmGrainEnabled: true, strobeEnabled: true,
          cameraShakeEnabled: true, glitchSliceEnabled: true, edgeGlowEnabled: true,
          lensDistortEnabled: true, motionTrailEnabled: true, hueRotateEnabled: true,
          intensity: 1.0, audioReactivity: 1.0, hueRotate: 0.3, glitchFrequency: 0.5
        });
        break;
      case 'EUPHORIC':
        onChange({
          rgbSplitEnabled: true, rgbSplit: 0.35, bloomEnabled: true, bloom: 0.8,
          strobeEnabled: true, strobe: 0.5, edgeGlowEnabled: true, edgeGlow: 0.7,
          cameraShakeEnabled: true, cameraShake: 0.4, filmGrainEnabled: false,
          scanLinesEnabled: false, vignetteEnabled: true, vignette: 0.4,
          glitchSliceEnabled: true, lensDistortEnabled: false, motionTrailEnabled: false,
          hueRotateEnabled: false, intensity: 1.2, audioReactivity: 0.9, glitchFrequency: 0.4
        });
        break;
      case 'RETRO_VHS':
        onChange({
          scanLinesEnabled: true, scanLines: 0.45, filmGrainEnabled: true, filmGrain: 0.5,
          rgbSplitEnabled: true, rgbSplit: 0.4, vignetteEnabled: true, vignette: 0.7,
          glitchSliceEnabled: true, glitchSlice: 0.6, bloomEnabled: false, strobeEnabled: false,
          edgeGlowEnabled: false, lensDistortEnabled: false, motionTrailEnabled: false,
          hueRotateEnabled: false, intensity: 0.9, audioReactivity: 0.6, glitchFrequency: 0.6
        });
        break;
      case 'PSYCHEDELIC':
        onChange({
          hueRotateEnabled: true, hueRotate: 0.8, bloomEnabled: true, bloom: 0.9,
          rgbSplitEnabled: true, rgbSplit: 0.5, lensDistortEnabled: true, lensDistort: 0.6,
          motionTrailEnabled: true, motionTrail: 0.5, strobeEnabled: false,
          cameraShakeEnabled: true, cameraShake: 0.3, filmGrainEnabled: true, filmGrain: 0.2,
          scanLinesEnabled: false, edgeGlowEnabled: true, edgeGlow: 0.9,
          vignetteEnabled: true, vignette: 0.3, intensity: 1.5, audioReactivity: 1.2,
          glitchFrequency: 0.3, distortion: 0.4
        });
        break;
      case 'DEEP_SPACE':
        onChange({
          bloomEnabled: true, bloom: 0.95, edgeGlowEnabled: true, edgeGlow: 0.8,
          motionTrailEnabled: true, motionTrail: 0.7, vignetteEnabled: true, vignette: 0.8,
          filmGrainEnabled: true, filmGrain: 0.15, rgbSplitEnabled: false,
          scanLinesEnabled: false, strobeEnabled: false, cameraShakeEnabled: false,
          glitchSliceEnabled: false, hueRotateEnabled: false, lensDistortEnabled: true,
          lensDistort: 0.3, intensity: 1.0, audioReactivity: 0.8, glitchFrequency: 0.1
        });
        break;
      case 'MINIMAL':
        onChange({
          vignetteEnabled: true, vignette: 0.3, bloomEnabled: false, rgbSplitEnabled: false,
          scanLinesEnabled: false, filmGrainEnabled: false, strobeEnabled: false,
          cameraShakeEnabled: false, glitchSliceEnabled: false, edgeGlowEnabled: false,
          lensDistortEnabled: false, motionTrailEnabled: false, hueRotateEnabled: false,
          intensity: 0.6, audioReactivity: 0.5, glitchFrequency: 0.1
        });
        break;
      case 'ALL_OFF':
        onChange({
          rgbSplitEnabled: false, scanLinesEnabled: false, vignetteEnabled: false,
          bloomEnabled: false, filmGrainEnabled: false, strobeEnabled: false,
          cameraShakeEnabled: false, glitchSliceEnabled: false, edgeGlowEnabled: false,
          lensDistortEnabled: false, motionTrailEnabled: false, hueRotateEnabled: false,
          intensity: 0.5, audioReactivity: 0.5, glitchFrequency: 0.0
        });
        break;
    }
  };

  // Ana efekt listesi
  const effectsList = [
    {
      id: 'rgbSplit',
      name: 'RGB SPLIT / CHROMATIC ABERRATION',
      desc: 'Kırmızı/Mavi renk kanalı ayrışması ve vuruş kayması',
      enabled: settings.rgbSplitEnabled !== false,
      value: settings.rgbSplit ?? 0.2, min: 0.05, max: 1.0, step: 0.05,
      onToggle: () => onChange({ rgbSplitEnabled: !(settings.rgbSplitEnabled !== false) }),
      onSlide: (v: number) => onChange({ rgbSplit: v, rgbSplitEnabled: true })
    },
    {
      id: 'scanLines',
      name: 'CRT SCANLINES (ANALOG ÇİZGİLER)',
      desc: 'Retro 80ler tüplü televizyon tarama ızgarası',
      enabled: settings.scanLinesEnabled !== false,
      value: settings.scanLines ?? 0.2, min: 0.05, max: 1.0, step: 0.05,
      onToggle: () => onChange({ scanLinesEnabled: !(settings.scanLinesEnabled !== false) }),
      onSlide: (v: number) => onChange({ scanLines: v, scanLinesEnabled: true })
    },
    {
      id: 'vignette',
      name: 'CINEMATIC VIGNETTE (KENAR KARARTMASI)',
      desc: 'Sinematik derinlik ve odaklanma için koyu kenar halkası',
      enabled: settings.vignetteEnabled !== false,
      value: settings.vignette ?? 0.5, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ vignetteEnabled: !(settings.vignetteEnabled !== false) }),
      onSlide: (v: number) => onChange({ vignette: v, vignetteEnabled: true })
    },
    {
      id: 'bloom',
      name: 'BLOOM & BEAT DROP FLARE',
      desc: 'Bas patlamalarında göz alıcı ışık ve parlama difüzyonu',
      enabled: settings.bloomEnabled !== false,
      value: settings.bloom ?? 0.5, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ bloomEnabled: !(settings.bloomEnabled !== false) }),
      onSlide: (v: number) => onChange({ bloom: v, bloomEnabled: true })
    },
    {
      id: 'filmGrain',
      name: 'FILM GRAIN & 35MM ANALOG NOISE',
      desc: 'Gerçekçi gren, organik kumlama ve analog doku',
      enabled: Boolean(settings.filmGrainEnabled),
      value: settings.filmGrain ?? 0.3, min: 0.05, max: 1.0, step: 0.05,
      onToggle: () => onChange({ filmGrainEnabled: !settings.filmGrainEnabled }),
      onSlide: (v: number) => onChange({ filmGrain: v, filmGrainEnabled: true })
    },
    {
      id: 'strobe',
      name: 'BASS STROBE / FLASH (KULÜP ÇAKARI)',
      desc: '⚠️ FLASHER UYARISI: Fotosensitif epilepsi hastaları için uygun olmayabilir.',
      enabled: Boolean(settings.strobeEnabled),
      value: settings.strobe ?? 0.4, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ strobeEnabled: !settings.strobeEnabled }),
      onSlide: (v: number) => onChange({ strobe: v, strobeEnabled: true })
    },
    {
      id: 'glitchSlice',
      name: 'GLITCH SLICE (DİJİTAL BANT KAYMASI)',
      desc: 'Snare ve beat vuruşlarında yatay dijital piksel kayması',
      enabled: Boolean(settings.glitchSliceEnabled),
      value: settings.glitchSlice ?? 0.4, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ glitchSliceEnabled: !settings.glitchSliceEnabled }),
      onSlide: (v: number) => onChange({ glitchSlice: v, glitchSliceEnabled: true })
    },
    {
      id: 'edgeGlow',
      name: 'NEON EDGE GLOW (ÇERÇEVE PARILTISI)',
      desc: 'Ekran kenarlarında sese reaktif neon outline parıltısı',
      enabled: Boolean(settings.edgeGlowEnabled),
      value: settings.edgeGlow ?? 0.5, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ edgeGlowEnabled: !settings.edgeGlowEnabled }),
      onSlide: (v: number) => onChange({ edgeGlow: v, edgeGlowEnabled: true })
    },
  ];

  return (
    <section className="space-y-6">
      {/* BAŞLIK & HAZIR PRESET BUTONLARI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
              GÖRSEL EFEKTLER (12 FX SHADER)
            </h3>
            <p className="text-[10px] text-content-tertiary">
              Bas ve frekanslara duyarlı gerçek zamanlı post-process efektleri.
            </p>
          </div>
        </div>

        {/* HIZLI FX PRESETLERİ */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'EUPHORIC',    label: 'EUPHORIC' },
            { id: 'RETRO_VHS',  label: 'VHS' },
            { id: 'PSYCHEDELIC',label: 'PSYCHEDELIC' },
            { id: 'DEEP_SPACE', label: 'SPACE' },
            { id: 'MINIMAL',    label: 'MİNİMAL' },
            { id: 'ALL_ON',     label: 'TÜMÜ AÇIK' },
            { id: 'ALL_OFF',    label: 'KAPAT' }
          ].map((btn) => (
            <Button
              key={btn.id}
              variant="outline"
              size="xs"
              onClick={() => applyPreset(btn.id as any)}
              className="text-[9px] font-mono uppercase"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* MASTER KONTROLLER (2-KOL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Master Intensity */}
        <Card className="p-3.5 flex flex-col gap-2.5">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-accent" />
              MASTER INTENSITY (GENEL ŞİDDET)
            </div>
            <p className="text-[10px] text-content-tertiary">
              Tüm efektlerin vuruşlara tepki çarpanı.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={0.1}
              max={2.0}
              step={0.05}
              value={settings.intensity}
              onChange={(val) => onChange({ intensity: val })}
              className="flex-1"
            />
            <span className="text-xs font-mono font-bold text-accent w-12 text-right">
              %{Math.round(settings.intensity * 100)}
            </span>
          </div>
        </Card>

        {/* Audio Reactivity */}
        <Card className="p-3.5 flex flex-col gap-2.5">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw size={13} className="text-accent" />
              AUDIO REAKTİVİTE (SES DUYARLILIĞI)
            </div>
            <p className="text-[10px] text-content-tertiary">
              Sesin efektleri tetikleme hassasiyeti ve hızı.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={0.1}
              max={2.0}
              step={0.05}
              value={settings.audioReactivity ?? 0.8}
              onChange={(val) => onChange({ audioReactivity: val })}
              className="flex-1"
            />
            <span className="text-xs font-mono font-bold text-accent w-12 text-right">
              %{Math.round((settings.audioReactivity ?? 0.8) * 100)}
            </span>
          </div>
        </Card>
      </div>

      {/* GÖRSELLEŞTİRİCİ TAM DENETİM & İNCE AYAR */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <h3 className="text-xs font-bold tracking-wider text-accent uppercase">
              GÖRSELLEŞTİRİCİ TAM DENETİM & İNCE AYAR
            </h3>
          </div>
          <Badge variant="secondary" className="text-[9px]">
            CANLI MODÜLASYON PARAMETRELERİ
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* HIZ ÇARPANI */}
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-content-secondary uppercase">ANİMASYON HIZI:</span>
              <span className="text-accent font-bold">{Number(settings.visSpeed ?? 1.0).toFixed(1)}x</span>
            </div>
            <Slider
              min={0.1}
              max={3.0}
              step={0.1}
              value={settings.visSpeed ?? 1.0}
              onChange={(val) => onChange({ visSpeed: val })}
            />
          </div>

          {/* ÖLÇEK / BOYUT */}
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-content-secondary uppercase">GEOMETRİ ÖLÇEĞİ:</span>
              <span className="text-accent font-bold">{Number(settings.visScale ?? 1.0).toFixed(1)}x</span>
            </div>
            <Slider
              min={0.2}
              max={2.5}
              step={0.1}
              value={settings.visScale ?? 1.0}
              onChange={(val) => onChange({ visScale: val })}
            />
          </div>

          {/* YOĞUNLUK / PARÇACIK SAYISI */}
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-content-secondary uppercase">YOĞUNLUK / ELEMAN:</span>
              <span className="text-accent font-bold">{Number(settings.visDensity ?? 1.0).toFixed(1)}x</span>
            </div>
            <Slider
              min={0.2}
              max={2.0}
              step={0.1}
              value={settings.visDensity ?? 1.0}
              onChange={(val) => onChange({ visDensity: val })}
            />
          </div>

          {/* DÖNME HIZI */}
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-content-secondary uppercase">ROTASYON HIZI:</span>
              <span className="text-accent font-bold">{Number(settings.visRotation ?? 0.5).toFixed(1)}</span>
            </div>
            <Slider
              min={-2.0}
              max={2.0}
              step={0.1}
              value={settings.visRotation ?? 0.5}
              onChange={(val) => onChange({ visRotation: val })}
            />
          </div>

          {/* PARLAMA / IŞIMA */}
          <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-content-secondary uppercase">VISUALIZER GLOW (IŞIMA):</span>
              <span className="text-accent font-bold">%{Math.round((settings.visGlow ?? 0.5) * 100)}</span>
            </div>
            <Slider
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.visGlow ?? 0.5}
              onChange={(val) => onChange({ visGlow: val })}
            />
          </div>
        </div>
      </Card>

      {/* 8 FARKLI BAĞIMSIZ EFEKT KARTI (TOGGLE + SLIDER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {effectsList.map((fx) => (
          <Card
            key={fx.id}
            className={cn(
              "p-4 transition-all flex flex-col justify-between space-y-3",
              fx.enabled
                ? "border-accent/40 shadow-elevation-2"
                : "opacity-60 hover:opacity-90 bg-surface/50"
            )}
          >
            {/* Kart Başlığı & Aç/Kapa Butonu */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-bold tracking-wider uppercase text-content-primary">
                  {fx.name}
                </div>
                <div className="text-[10px] text-content-tertiary mt-0.5 line-clamp-2">
                  {fx.desc}
                </div>
              </div>
              <Button
                variant={fx.enabled ? "accent" : "outline"}
                size="xs"
                onClick={fx.onToggle}
                className="shrink-0 text-[9px] font-mono gap-1"
              >
                {fx.enabled ? <Eye size={11} /> : <EyeOff size={11} />}
                <span>{fx.enabled ? 'AÇIK' : 'KAPALI'}</span>
              </Button>
            </div>

            {/* Slider & Değer */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-content-tertiary uppercase">ŞİDDET:</span>
                <span className={cn("font-bold", fx.enabled ? "text-accent" : "text-content-tertiary")}>
                  %{Math.round(fx.value * 100)}
                </span>
              </div>
              <Slider
                min={fx.min}
                max={fx.max}
                step={fx.step}
                value={fx.value}
                disabled={!fx.enabled}
                onChange={(val) => fx.onSlide(val)}
              />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

