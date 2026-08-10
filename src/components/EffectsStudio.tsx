import React from 'react';
import { VisualizerSettings } from '../types';
import { Sparkles, Zap, Eye, EyeOff, RefreshCw } from 'lucide-react';
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

  // Ana 11 efekt listesi
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
      desc: 'Ağır kick vuruşlarında yüksek enerjili beyaz flaş çakarı',
      enabled: Boolean(settings.strobeEnabled),
      value: settings.strobe ?? 0.4, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ strobeEnabled: !settings.strobeEnabled }),
      onSlide: (v: number) => onChange({ strobe: v, strobeEnabled: true })
    },
    {
      id: 'cameraShake',
      name: 'CAMERA SHAKE / BEAT JITTER',
      desc: 'Bas frekanslarında deprem ve sarsıntı reaktivitesi',
      enabled: Boolean(settings.cameraShakeEnabled),
      value: settings.cameraShake ?? 0.3, min: 0.1, max: 1.0, step: 0.05,
      onToggle: () => onChange({ cameraShakeEnabled: !settings.cameraShakeEnabled }),
      onSlide: (v: number) => onChange({ cameraShake: v, cameraShakeEnabled: true })
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
    {
      id: 'lensDistort',
      name: 'LENS DISTORTION (BALIK GÖZÜ)',
      desc: 'Optik mercek çarpıtması ve fisheye bükülme efekti',
      enabled: Boolean(settings.lensDistortEnabled),
      value: settings.lensDistort ?? 0.3, min: 0.05, max: 1.0, step: 0.05,
      onToggle: () => onChange({ lensDistortEnabled: !settings.lensDistortEnabled }),
      onSlide: (v: number) => onChange({ lensDistort: v, lensDistortEnabled: true })
    },
    {
      id: 'motionTrail',
      name: 'MOTION TRAIL / GHOST ECHO',
      desc: 'Hareket eden nesnelerin arkasında kalan kalıcı iz efekti',
      enabled: Boolean(settings.motionTrailEnabled),
      value: settings.motionTrail ?? 0.3, min: 0.05, max: 0.95, step: 0.05,
      onToggle: () => onChange({ motionTrailEnabled: !settings.motionTrailEnabled }),
      onSlide: (v: number) => onChange({ motionTrail: v, motionTrailEnabled: true })
    },
    {
      id: 'hueRotate',
      name: 'HUE ROTATION (RENK KAYDIRMA)',
      desc: 'Basa reaktif sürekli renk tonu dönüşümü ve gökkuşağı efekti',
      enabled: Boolean(settings.hueRotateEnabled),
      value: settings.hueRotate ?? 0.3, min: 0.05, max: 2.0, step: 0.05,
      onToggle: () => onChange({ hueRotateEnabled: !settings.hueRotateEnabled }),
      onSlide: (v: number) => onChange({ hueRotate: v, hueRotateEnabled: true })
    },
  ];

  return (
    <section className="space-y-6">
      {/* BAŞLIK & HAZIR PRESET BUTONLARI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD700]" />
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
              GÖRSEL EFEKTLER (12 FX SHADER)
            </h3>
            <p className="text-[8.5px] text-zinc-500 font-mono">
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
            <button
              key={btn.id}
              onClick={() => applyPreset(btn.id as any)}
              className="px-2 py-0.5 bg-black/60 hover:bg-[#FFD700] text-zinc-400 hover:text-black border border-white/[0.08] hover:border-[#FFD700] text-[8px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer rounded-sm"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* MASTER KONTROLLER (2-KOL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Master Intensity */}
        <div className="bg-black/40 p-3.5 border border-white/[0.08] rounded-sm flex flex-col gap-2.5">
          <div className="space-y-0.5">
            <div className="text-[9.5px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="text-[#FFD700]" />
              MASTER INTENSITY (GENEL ŞİDDET)
            </div>
            <p className="text-[8px] font-mono text-zinc-500">
              Tüm efektlerin vuruşlara tepki çarpanı.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0.1" max="2.0" step="0.05"
              value={settings.intensity}
              onChange={(e) => onChange({ intensity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-[#FFD700] w-12 text-right">
              %{Math.round(settings.intensity * 100)}
            </span>
          </div>
        </div>

        {/* Audio Reactivity */}
        <div className="bg-zinc-950 p-4 border border-zinc-800/80 flex flex-col gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <RefreshCw size={13} className="text-[#FFD700]" />
              AUDIO REAKTİVİTE (SES DUYARLILIĞI)
            </div>
            <p className="text-[8px] font-mono text-zinc-500">
              Sesin efektleri tetikleme hassasiyeti ve hızı.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range" min="0.1" max="2.0" step="0.05"
              value={settings.audioReactivity ?? 0.8}
              onChange={(e) => onChange({ audioReactivity: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-[#FFD700] w-12 text-right">
              %{Math.round((settings.audioReactivity ?? 0.8) * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* 🎛️ GÖRSELLEŞTİRİCİ TAM DENETİM & İNCE AYAR (VISUALIZER GRANULAR CONTROLS) */}
      <div className="bg-[#080808] border border-yellow-400/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#FFD700]" />
            <h3 className="text-[10px] font-black tracking-widest text-[#FFD700] uppercase">
              GÖRSELLEŞTİRİCİ TAM DENETİM & İNCE AYAR (GRANULAR FINE-TUNING)
            </h3>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">CANLI MODÜLASYON PARAMETRELERİ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* HIZ ÇARPANI */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">ANİMASYON HIZI:</span>
              <span className="text-[#FFD700] font-bold">{(settings.visSpeed ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.1" max="3.0" step="0.1"
              value={settings.visSpeed ?? 1.0}
              onChange={(e) => onChange({ visSpeed: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>

          {/* ÖLÇEK / BOYUT */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">GEOMETRİ ÖLÇEĞİ:</span>
              <span className="text-[#FFD700] font-bold">{(settings.visScale ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.2" max="2.5" step="0.1"
              value={settings.visScale ?? 1.0}
              onChange={(e) => onChange({ visScale: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>

          {/* YOĞUNLUK / PARÇACIK SAYISI */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">YOĞUNLUK / ELEMAN:</span>
              <span className="text-[#FFD700] font-bold">{(settings.visDensity ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.2" max="2.0" step="0.1"
              value={settings.visDensity ?? 1.0}
              onChange={(e) => onChange({ visDensity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>

          {/* DÖNME HIZI */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">ROTASYON HIZI:</span>
              <span className="text-[#FFD700] font-bold">{(settings.visRotation ?? 0.5).toFixed(1)}</span>
            </div>
            <input
              type="range" min="-2.0" max="2.0" step="0.1"
              value={settings.visRotation ?? 0.5}
              onChange={(e) => onChange({ visRotation: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>

          {/* PARLAMA / IŞIMA */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">VISUALIZER GLOW (IŞIMA):</span>
              <span className="text-[#FFD700] font-bold">%{Math.round((settings.visGlow ?? 0.5) * 100)}</span>
            </div>
            <input
              type="range" min="0.0" max="1.0" step="0.05"
              value={settings.visGlow ?? 0.5}
              onChange={(e) => onChange({ visGlow: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>

          {/* RİTİM DUYARLILIĞI */}
          <div className="bg-zinc-950 p-3 border border-zinc-800/80 space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono">
              <span className="text-zinc-400 uppercase">RİTİM / BEAT REAKTİVİTESİ:</span>
              <span className="text-[#FFD700] font-bold">{(settings.visBeatSensitivity ?? 1.0).toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.1" max="3.0" step="0.1"
              value={settings.visBeatSensitivity ?? 1.0}
              onChange={(e) => onChange({ visBeatSensitivity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* GLİÇ FREKANS & DİSTORSİYON SLIDERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-950 p-4 border border-zinc-800/80 space-y-2">
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-zinc-400 uppercase">GLİÇ FREKANS (BOZULMA HIZI)</span>
            <span className="text-[#FFD700] font-bold">%{Math.round((settings.glitchFrequency ?? 0.3) * 100)}</span>
          </div>
          <input
            type="range" min="0.0" max="1.0" step="0.05"
            value={settings.glitchFrequency ?? 0.3}
            onChange={(e) => onChange({ glitchFrequency: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
          />
          <p className="text-[8px] font-mono text-zinc-600">Dijital bozulma ve slice etkilerinin tetiklenme sıklığı.</p>
        </div>

        <div className="bg-zinc-950 p-4 border border-zinc-800/80 space-y-2">
          <div className="flex justify-between text-[9px] font-mono">
            <span className="text-zinc-400 uppercase">DİSTORSİYON (GEOMETRİK BÜKÜLME)</span>
            <span className="text-[#FFD700] font-bold">%{Math.round((settings.distortion ?? 0.0) * 100)}</span>
          </div>
          <input
            type="range" min="0.0" max="1.0" step="0.05"
            value={settings.distortion ?? 0.0}
            onChange={(e) => onChange({ distortion: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
          />
          <p className="text-[8px] font-mono text-zinc-600">Canvas koordinat sistemini büken geometrik bozulma çarpanı.</p>
        </div>
      </div>

      {/* 12 FARKLI BAĞIMSIZ EFEKT KARTI (TOGGLE + SLIDER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {effectsList.map((fx) => (
          <div
            key={fx.id}
            className={cn(
              "p-4 border transition-all flex flex-col justify-between space-y-3",
              fx.enabled
                ? "bg-[#090909] border-zinc-700/80 shadow-[0_0_15px_rgba(255,215,0,0.03)]"
                : "bg-[#030303] border-zinc-900 opacity-60 hover:opacity-90"
            )}
          >
            {/* Kart Başlığı & Aç/Kapa Butonu */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[9px] font-black tracking-wider uppercase text-zinc-200">
                  {fx.name}
                </div>
                <div className="text-[8px] font-mono text-zinc-500 mt-0.5 line-clamp-2">
                  {fx.desc}
                </div>
              </div>
              <button
                onClick={fx.onToggle}
                className={cn(
                  "px-2 py-0.5 text-[8px] font-mono font-black uppercase border transition-all cursor-pointer shrink-0 flex items-center gap-1",
                  fx.enabled
                    ? "bg-[#FFD700] text-black border-[#FFD700]"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                )}
              >
                {fx.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
                <span>{fx.enabled ? 'AÇIK' : 'KAPALI'}</span>
              </button>
            </div>

            {/* Slider & Değer */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[8px] font-mono">
                <span className="text-zinc-500 uppercase">ŞİDDET / YOĞUNLUK:</span>
                <span className={cn("font-bold", fx.enabled ? "text-[#FFD700]" : "text-zinc-600")}>
                  %{Math.round(fx.value * 100)}
                </span>
              </div>
              <input
                type="range"
                min={fx.min} max={fx.max} step={fx.step}
                value={fx.value}
                disabled={!fx.enabled}
                onChange={(e) => fx.onSlide(parseFloat(e.target.value))}
                className={cn(
                  "w-full h-1 appearance-none cursor-pointer",
                  fx.enabled ? "bg-zinc-800 accent-[#FFD700]" : "bg-zinc-900 accent-zinc-700 opacity-40 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
