import { AudioEvents, RenderContext, IVisualizer, VisualizerSettings, UserInteractionState, LyricsStyle } from '../types';

import { SimulationVisualizer } from '../visualizers/SimulationVisualizer';
import { MonolithVisualizer } from '../visualizers/MonolithVisualizer';
import { NoirGridVisualizer } from '../visualizers/NoirGridVisualizer';
import { ChaosVisualizer } from '../visualizers/ChaosVisualizer';
import { RadialVisualizer } from '../visualizers/RadialVisualizer';
import { PhonkWaveVisualizer } from '../visualizers/PhonkWaveVisualizer';
import { EsotericVisualizer } from '../visualizers/EsotericVisualizer';
import { EtherVisualizer } from '../visualizers/EtherVisualizer';
import { GlitchVisualizer } from '../visualizers/GlitchVisualizer';
import { SpectrumVisualizer } from '../visualizers/SpectrumVisualizer';
import { KineticTypoVisualizer } from '../visualizers/KineticTypoVisualizer';
import { NeonTunnelVisualizer } from '../visualizers/NeonTunnelVisualizer';
import { QuantumFieldVisualizer } from '../visualizers/QuantumFieldVisualizer';
import { AudioFluidVisualizer } from '../visualizers/AudioFluidVisualizer';
import { CodropsPolarVisualizer } from '../visualizers/CodropsPolarVisualizer';
import { CodropsWaveVisualizer } from '../visualizers/CodropsWaveVisualizer';
import { CodropsBarsVisualizer } from '../visualizers/CodropsBarsVisualizer';
import { CavaSpectrumVisualizer } from '../visualizers/CavaSpectrumVisualizer';
import { LissajousOrbitVisualizer } from '../visualizers/LissajousOrbitVisualizer';
import { PopcornPhysicsVisualizer } from '../visualizers/PopcornPhysicsVisualizer';
import { VortexNebulaVisualizer } from '../visualizers/VortexNebulaVisualizer';
import { CyberMatrixVisualizer } from '../visualizers/CyberMatrixVisualizer';
import { VissonanceRingVisualizer } from '../visualizers/VissonanceRingVisualizer';
import { VissonanceOctagonVisualizer } from '../visualizers/VissonanceOctagonVisualizer';
import { VissonanceSpectrumVisualizer } from '../visualizers/VissonanceSpectrumVisualizer';
import { ParticleSphere3DVisualizer } from '../visualizers/ParticleSphere3DVisualizer';
import { FluidMetaballVisualizer } from '../visualizers/FluidMetaballVisualizer';
import { SynthwaveGrid3DVisualizer } from '../visualizers/SynthwaveGrid3DVisualizer';
import { KineticTypoGlitchVisualizer } from '../visualizers/KineticTypoGlitchVisualizer';
import { CircularAuraSpectrumVisualizer } from '../visualizers/CircularAuraSpectrumVisualizer';
import { LiquidMercuryHumanVisualizer } from '../visualizers/LiquidMercuryHumanVisualizer';
import { NeonHydroHumanVisualizer } from '../visualizers/NeonHydroHumanVisualizer';
import { NoirSingingHeadVisualizer } from '../visualizers/NoirSingingHeadVisualizer';
import { ObjFaceVisualizer } from '../visualizers/ObjFaceVisualizer';
import { VrmAnimeHybridVisualizer } from '../visualizers/VrmAnimeHybridVisualizer';
import { NeuralBloomVisualizer } from '../visualizers/NeuralBloomVisualizer';
import { DreamPerformerVisualizer } from '../visualizers/DreamPerformerVisualizer';
import { NeuralNoirVisualizer } from '../visualizers/NeuralNoirVisualizer';
import { CoverPulse3DVisualizer } from '../visualizers/CoverPulse3DVisualizer';
import { StudioSplitLyricsVisualizer } from '../visualizers/StudioSplitLyricsVisualizer';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export class StudioRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // High-performance offscreen buffer for post-processing and chromatic aberration
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  // Modüler Visualizer Kaydı (Lazy Instantiation Map)
  private visualizerRegistry: Map<string, () => IVisualizer> = new Map();
  private activeVisualizer: IVisualizer | null = null;
  private currentModeName: string | null = null;
  
  // Dışarıdan yüklenecek statik dosyalar (Logo, Kapak, Arka Plan Videosu, Arka Plan Görseli)
  private logoImage: HTMLImageElement | null = null;
  private coverImage: HTMLImageElement | null = null;
  private bgVideo: HTMLVideoElement | null = null;
  private bgImage: HTMLImageElement | null = null;

  // Kullanıcı Etkileşim Durumu (Pointer, 360 Orbit, Attractor, Ripples)
  private interaction: UserInteractionState | null = null;

  // Background FX Particles
  private bgParticles: Particle[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;
    this.initRegistry();
    this.initParticles();
  }

  private initParticles() {
    this.bgParticles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.4 ? '#FFD700' : '#FFFFFF'
    }));
  }

  // Tüm görsel modları lazy factory olarak kaydediyoruz
  private initRegistry() {
    const mods: [string, () => IVisualizer][] = [
      ['STUDIO_SPLIT_LYRICS', () => new StudioSplitLyricsVisualizer()],
      ['COVER_PULSE_3D', () => new CoverPulse3DVisualizer()],
      ['SIMULATION', () => new SimulationVisualizer()],
      ['MONOLITH', () => new MonolithVisualizer()],
      ['NOIRGRID', () => new NoirGridVisualizer()],
      ['CHAOS', () => new ChaosVisualizer()],
      ['RADIAL', () => new RadialVisualizer()],
      ['PHONKWAVE', () => new PhonkWaveVisualizer()],
      ['ESOTERIC', () => new EsotericVisualizer()],
      ['ETHER', () => new EtherVisualizer()],
      ['GLITCH', () => new GlitchVisualizer()],
      ['SPECTRUM', () => new SpectrumVisualizer()],
      ['KINETIC', () => new KineticTypoVisualizer()],
      ['NEON_TUNNEL', () => new NeonTunnelVisualizer()],
      ['QUANTUM_FIELD', () => new QuantumFieldVisualizer()],
      ['AUDIO_FLUID', () => new AudioFluidVisualizer()],
      ['CODROPS_POLAR', () => new CodropsPolarVisualizer()],
      ['CODROPS_WAVE', () => new CodropsWaveVisualizer()],
      ['CODROPS_BARS', () => new CodropsBarsVisualizer()],
      ['CAVA_SPECTRUM', () => new CavaSpectrumVisualizer()],
      ['LISSAJOUS_ORBIT', () => new LissajousOrbitVisualizer()],
      ['POPCORN_PHYSICS', () => new PopcornPhysicsVisualizer()],
      ['KINETIC_BURST', () => new PopcornPhysicsVisualizer()],
      ['VORTEX_NEBULA', () => new VortexNebulaVisualizer()],
      ['CYBER_MATRIX', () => new CyberMatrixVisualizer()],
      ['VISSONANCE_RING', () => new VissonanceRingVisualizer()],
      ['VISSONANCE_OCTAGON', () => new VissonanceOctagonVisualizer()],
      ['VISSONANCE_SPECTRUM', () => new VissonanceSpectrumVisualizer()],
      ['PARTICLE_SPHERE_3D', () => new ParticleSphere3DVisualizer()],
      ['FLUID_METABALL', () => new FluidMetaballVisualizer()],
      ['SYNTHWAVE_GRID_3D', () => new SynthwaveGrid3DVisualizer()],
      ['KINETIC_TYPO_GLITCH', () => new KineticTypoGlitchVisualizer()],
      ['CIRCULAR_AURA_SPECTRUM', () => new CircularAuraSpectrumVisualizer()],
      ['LIQUID_MERCURY_HUMAN', () => new LiquidMercuryHumanVisualizer()],
      ['NEON_HYDRO_HUMAN', () => new NeonHydroHumanVisualizer()],
      ['NOIR_SINGING_HEAD', () => new NoirSingingHeadVisualizer()],
      ['OBJ_FACE_MASK', () => new ObjFaceVisualizer()],
      ['VRM_ANIME_HYBRID', () => typeof window === 'undefined' ? new NoirSingingHeadVisualizer() : new VrmAnimeHybridVisualizer()],
      ['NEURAL_BLOOM', () => new NeuralBloomVisualizer()],
      ['DREAM_PERFORMER', () => typeof window === 'undefined' ? new NoirSingingHeadVisualizer() : new DreamPerformerVisualizer()],
      ['NEURAL_NOIR', () => new NeuralNoirVisualizer()],
      ['NOIR_CORE', () => new SpectrumVisualizer()]
    ];
    mods.forEach(([key, factory]) => this.visualizerRegistry.set(key, factory));
  }

  private getActiveVisualizer(mode: string): IVisualizer | null {
    const key = (mode || '').toUpperCase();
    if (this.currentModeName !== key) {
      // Mod değişimi algılandı! Eski görselleştiriciyi temizle (dispose)
      if (this.activeVisualizer && this.activeVisualizer.dispose) {
        try {
          this.activeVisualizer.dispose();
        } catch (e) {
          console.error("Görselleştirici dispose hatası:", e);
        }
      }
      this.activeVisualizer = null;
      this.currentModeName = key;

      const factory = this.visualizerRegistry.get(key);
      if (factory) {
        try {
          this.activeVisualizer = factory();
        } catch (e) {
          console.error(`Görselleştirici instantiating hatası (${key}):`, e);
        }
      }
    }
    return this.activeVisualizer;
  }

  public dispose() {
    if (this.activeVisualizer && this.activeVisualizer.dispose) {
      try {
        this.activeVisualizer.dispose();
      } catch (e) {
        console.error("StudioRenderer dispose hatası:", e);
      }
    }
    this.activeVisualizer = null;
    this.currentModeName = null;
  }

  public setLogoImage(img: HTMLImageElement | null) { this.logoImage = img; }
  public setCoverImage(img: HTMLImageElement | null) { this.coverImage = img; }
  public setBgVideo(video: HTMLVideoElement | null) { this.bgVideo = video; }
  public setBgImage(img: HTMLImageElement | null) { this.bgImage = img; }
  public setInteraction(interaction: UserInteractionState | null) { this.interaction = interaction; }

  // 🚀 ANA RENDER DÖNGÜSÜ (PIPELINE)
  public render(audio: AudioEvents, settings: VisualizerSettings) {
    const { width, height } = this.canvas;
    
    // --- MASTER AUDIO REAKTİVİTE SENSİTİVİTY ---
    const sensitivity = settings.audioReactivity ?? 0.8;
    const scaledAudio: AudioEvents = {
      ...audio,
      kick: Math.min(1.0, audio.kick * sensitivity),
      snare: Math.min(1.0, audio.snare * sensitivity),
      hihat: Math.min(1.0, audio.hihat * sensitivity),
      energy: Math.min(1.0, audio.energy * sensitivity),
      bassEnergy: audio.bassEnergy !== undefined ? Math.min(1.0, audio.bassEnergy * sensitivity) : undefined,
      midEnergy: audio.midEnergy !== undefined ? Math.min(1.0, audio.midEnergy * sensitivity) : undefined,
      highEnergy: audio.highEnergy !== undefined ? Math.min(1.0, audio.highEnergy * sensitivity) : undefined,
      vocalEnergy: audio.vocalEnergy !== undefined ? Math.min(1.0, audio.vocalEnergy * sensitivity) : undefined,
    };

    // Apply Low Performance / Eco Mode optimization if enabled
    let activeSettings = settings;
    if (settings.lowPerformanceMode) {
      activeSettings = {
        ...settings,
        visDensity: (settings.visDensity ?? 1.0) * 0.5,
        visScale: (settings.visScale ?? 1.0) * 0.9,
        bloomEnabled: false,
        motionTrailEnabled: false,
        glitchSliceEnabled: false,
        rgbSplitEnabled: false,
      };
    }

    // Jitter & Camera Shake / Beat Jitter
    const cameraShakeVal = activeSettings.cameraShakeEnabled ? (activeSettings.cameraShake ?? 0.3) : 0;
    const jitter = activeSettings.jitter ?? 0;
    const displacement = activeSettings.displacement ?? 0;
    // Combine local visualizer triggers with global EffectsStudio cameraShake slider!
    const shakeAmount = (cameraShakeVal * 22 * scaledAudio.kick) + (jitter * 25 + (scaledAudio.kick > 0.8 ? displacement * 15 : 0));
    const shakeX = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0;
    const shakeY = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0;

    // Ensure high-performance offscreen buffer is correctly sized and initialized
    if (!this.offscreenCanvas || this.offscreenCanvas.width !== width || this.offscreenCanvas.height !== height) {
      if (typeof document !== 'undefined') {
        this.offscreenCanvas = document.createElement('canvas');
      } else if (typeof OffscreenCanvas !== 'undefined') {
        this.offscreenCanvas = new OffscreenCanvas(width, height) as any;
      } else if (this.canvas && typeof (this.canvas as any).constructor === 'function') {
        try {
          this.offscreenCanvas = new (this.canvas as any).constructor(width, height);
        } catch (_) {
          this.offscreenCanvas = null;
        }
      } else {
        this.offscreenCanvas = null;
      }
      if (this.offscreenCanvas) {
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      }
    }

    this.ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      this.ctx.translate(shakeX, shakeY);
    }

    // 0. TEMİZLİK (Her frame'de main canvas'ı ve offscreen canvas'ı temizle)
    if (activeSettings.motionTrailEnabled && (activeSettings.motionTrail ?? 0.3) > 0.02) {
      const trailAlpha = 1.0 - (activeSettings.motionTrail ?? 0.3);
      this.ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, width, height);
    }

    if (this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, width, height);
    }

    // Context objesini diğer fonksiyonlara paslamak için hazırlıyoruz
    const mainContext: RenderContext = {
      ctx: this.ctx, width, height, audio: scaledAudio, settings: activeSettings,
      logoImage: this.logoImage, coverImage: this.coverImage,
      bgVideo: this.bgVideo, bgImage: this.bgImage,
      interaction: this.interaction || undefined
    };

    const activeCtx = this.offscreenCtx || this.ctx;
    const renderContext: RenderContext = {
      ...mainContext,
      ctx: activeCtx
    };

    // --- KATMAN 0.1: ARKA PLAN GÖRSELİ (Drawn directly on main canvas to preserve static sharpness) ---
    this.drawImageBackground(mainContext);

    // --- KATMAN 0.2: ARKA PLAN VİDEOSU (Drawn directly on main canvas) ---
    this.drawVideoBackground(mainContext);

    // --- KATMAN 1: GLOBAL ARKA PLAN (Zemin Efektleri: Izgara, Sis, Yıldız Tozu - Drawn in offscreen so it gets FX) ---
    this.drawBackgroundLayer(renderContext);

    // --- KATMAN 2: CORE EQ (Sadece 'NONE' modunda çalışsın) ---
    if (activeSettings.mode === 'NONE') {
      this.drawCoreEQ(renderContext);
    }

    // --- KATMAN 3: FANTEZİ MODU (Kullanıcı seçtiyse) ---
    if (activeSettings.mode !== 'NONE') {
      const activeMod = this.getActiveVisualizer(activeSettings.mode);
      if (activeMod) {
        activeMod.update(scaledAudio, activeSettings);
        activeMod.render(renderContext);
      }
    }

    // --- KATMAN 4: FX & YIKIM (Scanlines, Vignette, Bloom, Grain, Strobe, Glitch, vb. - Applied to active context) ---
    this.applyFXLayer(renderContext);

    // --- BLIT OFFSCREEN TO MAIN (RGB Split, Lens Distortion, Distortion/Warp, Hue Rotate) ---
    if (this.offscreenCanvas && activeCtx === this.offscreenCtx) {
      this.blitOffscreenToMain(mainContext);
    }

    // --- KATMAN 5: BİLGİ VE BİLDİRİM (Tipografi, Lirikler, Logo - Drawn sharp on main canvas) ---
    this.drawOverlays(mainContext);

    this.ctx.restore();
  }

  private blitOffscreenToMain({ ctx, width, height, audio, settings }: RenderContext) {
    if (!this.offscreenCanvas) return;

    ctx.save();

    // 1. Hue Rotation filter (native hardware-accelerated WebGL/Canvas2D)
    if (settings.hueRotateEnabled && (settings.hueRotate ?? 0.3) > 0.02) {
      const angle = (((settings.hueRotate ?? 0.3) * 360) + (audio.energy * 90)) % 360;
      ctx.filter = `hue-rotate(${angle}deg)`;
    }

    // 2. RGB Split / Chromatic Aberration Amount
    const hasRgbSplit = settings.rgbSplitEnabled !== false && settings.rgbSplit > 0.01;
    const splitAmount = hasRgbSplit ? ((settings.rgbSplit * 18) + (audio.beat ? audio.kick * 12 : 0)) : 0;

    // Helper to draw a single buffer instance with optional row warp distortion
    const drawBuffer = (dx: number, dy: number, scaleX = 1.0, scaleY = 1.0) => {
      const hasDistortion = settings.distortion && settings.distortion > 0.02;
      const hasLensDistort = settings.lensDistortEnabled && (settings.lensDistort ?? 0.3) > 0.02;

      if (hasLensDistort) {
        // High-Performance Spherical Fisheye / Lens Bulge simulation using nested concentric rings
        const distortAmount = settings.lensDistort ?? 0.3;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.48;
        const steps = 6;

        ctx.save();
        ctx.translate(dx, dy);
        if (scaleX !== 1.0 || scaleY !== 1.0) {
          ctx.scale(scaleX, scaleY);
        }

        for (let r = steps; r > 0; r--) {
          const radius = (r / steps) * maxRadius;
          const magnification = 1.0 + (distortAmount * 0.16 * (1.0 - r / steps) * (1.0 + audio.kick * 0.2));

          ctx.save();
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(
            this.offscreenCanvas!,
            centerX - radius / magnification, centerY - radius / magnification, radius * 2 / magnification, radius * 2 / magnification,
            centerX - radius, centerY - radius, radius * 2, radius * 2
          );
          ctx.restore();
        }

        // Draw outside of lens normally
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        // Clip to everything OUTSIDE the lens
        ctx.rect(width, 0, -width, height);
        ctx.clip();
        ctx.drawImage(this.offscreenCanvas!, 0, 0);
        ctx.restore();

        ctx.restore();
      } else if (hasDistortion) {
        // High-Performance Sine-wave row warp
        const dIntensity = settings.distortion ?? 0;
        const waveHeight = 6 + dIntensity * 20;
        const waveFrequency = 0.015;
        const speed = audio.time * 8;

        ctx.save();
        ctx.translate(dx, dy);
        if (scaleX !== 1.0 || scaleY !== 1.0) {
          ctx.scale(scaleX, scaleY);
        }
        for (let y = 0; y < height; y += 4) {
          const xOffset = Math.sin(y * waveFrequency + speed) * waveHeight * (1.0 + audio.kick * 0.5);
          ctx.drawImage(
            this.offscreenCanvas!,
            0, y, width, 4,
            xOffset, y, width, 4
          );
        }
        ctx.restore();
      } else {
        // Plain fast blit
        if (dx === 0 && dy === 0 && scaleX === 1.0 && scaleY === 1.0) {
          ctx.drawImage(this.offscreenCanvas!, 0, 0);
        } else {
          ctx.save();
          ctx.translate(dx, dy);
          if (scaleX !== 1.0 || scaleY !== 1.0) {
            ctx.scale(scaleX, scaleY);
          }
          ctx.drawImage(this.offscreenCanvas!, 0, 0);
          ctx.restore();
        }
      }
    };

    if (hasRgbSplit && splitAmount > 0.5) {
      // Draw centered base scene
      ctx.globalAlpha = 1.0;
      drawBuffer(0, 0);

      // Chromatic Aberration: Shifted channels blending via screen mode
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(0.65, settings.rgbSplit * 0.7 + (audio.kick * 0.3));
      
      // Shift left and right to split colors beautifully
      drawBuffer(-splitAmount, 0);
      drawBuffer(splitAmount, 0);
      ctx.restore();
    } else {
      drawBuffer(0, 0);
    }

    ctx.restore();
    ctx.filter = 'none'; // Clear filter
  }

  // ==========================================
  // KATMAN FONKSİYONLARI
  // ==========================================

  // --- 0.1 ARKA PLAN GÖRSELİ (STATIC WALLPAPER / CUSTOM PHOTO) ---
  private drawImageBackground({ ctx, width, height, audio, settings }: RenderContext) {
    if (!this.bgImage) return;

    ctx.save();
    
    // Opaklık ve Ses Reaktivitesi (Kick pulse)
    const baseOpacity = settings.bgImageOpacity ?? 0.7;
    const pulseGain = settings.bgImageReactive !== false ? audio.kick * 0.12 : 0;
    ctx.globalAlpha = Math.min(1.0, Math.max(0.05, baseOpacity + pulseGain));

    // Blur efekti
    if (settings.bgImageBlur && settings.bgImageBlur > 0) {
      ctx.filter = `blur(${settings.bgImageBlur}px)`;
    }

    // Cover oranına göre resmi ortalayarak boyutlandır
    const imgWidth = (this.bgImage as any).naturalWidth || this.bgImage.width || 1920;
    const imgHeight = (this.bgImage as any).naturalHeight || this.bgImage.height || 1080;
    const hRatio = width / (imgWidth || 1);
    const vRatio = height / (imgHeight || 1);
    const ratio = Math.max(hRatio, vRatio);

    // Reaktif Zoom
    const zoomScale = 1 + (settings.bgImageReactive !== false ? audio.kick * 0.04 : 0);
    const renderW = imgWidth * ratio * zoomScale;
    const renderH = imgHeight * ratio * zoomScale;
    const renderX = (width - renderW) / 2;
    const renderY = (height - renderH) / 2;

    try {
      ctx.drawImage(this.bgImage, renderX, renderY, renderW, renderH);
    } catch (e) {
      // Cross-origin fallback
    }

    // Filtreyi sıfırla
    ctx.filter = 'none';

    // Sinematik karartma katmanı
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // --- 0.2 ARKA PLAN VİDEOSU ---
  private drawVideoBackground({ ctx, width, height, audio, settings }: RenderContext) {
    if (!this.bgVideo) return;
    if (this.bgVideo.readyState < 2) return; // HAVE_CURRENT_DATA

    ctx.save();
    
    // Opaklık ve Ses Reaktivitesi (Euphoric Pulse)
    const baseOpacity = settings.bgVideoOpacity ?? 0.65;
    const pulseGain = settings.bgVideoReactive !== false ? audio.kick * 0.15 : 0;
    ctx.globalAlpha = Math.min(1.0, Math.max(0.05, baseOpacity + pulseGain));

    // Blur efekti
    if (settings.bgVideoBlur && settings.bgVideoBlur > 0) {
      ctx.filter = `blur(${settings.bgVideoBlur}px)`;
    }

    // Cover oranına göre videoyu ortalayarak boyutlandır
    const videoWidth = this.bgVideo.videoWidth || 1920;
    const videoHeight = this.bgVideo.videoHeight || 1080;
    const hRatio = width / videoWidth;
    const vRatio = height / videoHeight;
    const ratio = Math.max(hRatio, vRatio);

    // Reaktif Zoom (Vuruşlarda hafif genişleme)
    const zoomScale = 1 + (settings.bgVideoReactive !== false ? audio.kick * 0.05 : 0);
    const renderW = videoWidth * ratio * zoomScale;
    const renderH = videoHeight * ratio * zoomScale;
    const renderX = (width - renderW) / 2;
    const renderY = (height - renderH) / 2;

    try {
      ctx.drawImage(this.bgVideo, renderX, renderY, renderW, renderH);
    } catch (e) {
      // Cross-origin veya frame atlamalarında sessizce geç
    }

    // Filtreyi sıfırla
    ctx.filter = 'none';

    // Üstüne hafif sinematik kontrast katmanı at
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  private drawBackgroundLayer({ ctx, width, height, audio, settings }: RenderContext) {
    if (settings.bgMode === 'NONE') return;

    ctx.save();
    const dynamicOpacity = Math.max(0.04, Math.min(0.8, (settings.bgOpacity || 0.1) * (1 + audio.energy * 0.8)));

    if (settings.bgMode === 'GRID') {
      const gridSize = 80;
      ctx.strokeStyle = settings.primaryColor;
      ctx.globalAlpha = dynamicOpacity * 0.4;
      ctx.lineWidth = 1 + (audio.kick * 1.5);
      
      const offset = (audio.time * 25) % gridSize;
      
      ctx.beginPath();
      for (let x = offset; x < width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
      }
      for (let y = offset; y < height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Cyberpunk Horizon Horizon line pulse
      ctx.beginPath();
      ctx.moveTo(0, height * 0.7);
      ctx.lineTo(width, height * 0.7);
      ctx.strokeStyle = settings.secondaryColor;
      ctx.globalAlpha = dynamicOpacity * 0.7;
      ctx.stroke();

    } else if (settings.bgMode === 'SMOKE') {
      // Atmospheric smoke nebulae
      const grad = ctx.createRadialGradient(
        width / 2 + Math.sin(audio.time * 0.5) * 100, 
        height / 2 + Math.cos(audio.time * 0.4) * 80, 
        10, 
        width / 2, 
        height / 2, 
        width * 0.65
      );
      grad.addColorStop(0, `${settings.primaryColor}${Math.floor(dynamicOpacity * 90).toString(16).padStart(2, '0')}`);
      grad.addColorStop(0.5, `${settings.secondaryColor}${Math.floor(dynamicOpacity * 40).toString(16).padStart(2, '0')}`);
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

    } else if (settings.bgMode === 'PARTICLES') {
      // Floating stardust
      ctx.globalAlpha = dynamicOpacity;
      this.bgParticles.forEach(p => {
        p.x += p.vx * (1 + audio.kick * 4);
        p.y += p.vy * (1 + audio.kick * 4);
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + audio.snare * 1.5), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  private drawCoreEQ({ ctx, width, height, audio, settings }: RenderContext) {
    ctx.save();
    const barCount = 36;
    const spacing = 6;
    const totalSpacing = (barCount - 1) * spacing;
    const barWidth = (width - totalSpacing) / barCount;
    
    // Müzik durduğunda barlar donar (Silence-Aware)
    if (audio.isSilence) {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, height - 8, width, 8);
      ctx.restore();
      return;
    }

    for (let i = 0; i < barCount; i++) {
      const spectrumIdx = Math.floor((i / barCount) * audio.spectrum.length);
      const value = audio.spectrum[spectrumIdx] || 0;
      
      const h = Math.max(6, value * height * 0.55 * (1 + audio.kick * 0.4) * settings.intensity);
      const x = i * (barWidth + spacing);
      const y = height - h;

      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, audio.hihat > 0.6 ? '#FFFFFF' : settings.primaryColor);
      gradient.addColorStop(0.3, settings.primaryColor);
      gradient.addColorStop(0.8, '#27272a');
      gradient.addColorStop(1, '#09090b');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, h);
      
      // Peak cap indicators
      if (value > 0.05) {
        ctx.fillStyle = settings.primaryColor;
        ctx.fillRect(x, y, barWidth, Math.max(3, audio.kick * 8));
      }
    }
    ctx.restore();
  }

  private applyFXLayer({ ctx, width, height, audio, settings }: RenderContext) {
    // 1. RGB Split / Chromatic Aberration
    // Upgraded to a "True Channel Shift" (Chromatic Aberration) blit in blitOffscreenToMain!

    // 2. CRT Scanlines
    if (settings.scanLinesEnabled !== false && settings.scanLines > 0.02) {
      ctx.save();
      ctx.fillStyle = '#000000';
      const intensity = settings.scanLines;
      const step = Math.max(2, Math.floor(10 - intensity * 6)); // Step decreases (denser lines) as intensity increases!
      const lineThickness = Math.max(1, Math.floor(step * 0.4)); // Thickness proportional to step
      ctx.globalAlpha = intensity * 0.45;
      for (let y = 0; y < height; y += step * 2) {
        ctx.fillRect(0, y, width, lineThickness);
      }
      ctx.restore();
    }

    // 3. Cinematic Vignette
    if (settings.vignetteEnabled !== false && settings.vignette > 0.02) {
      ctx.save();
      const vIntensity = settings.vignette;
      // Spread shrinks inward as intensity increases
      const innerRadius = width * Math.max(0.05, 0.45 - vIntensity * 0.35);
      const outerRadius = width * Math.max(0.3, 0.95 - vIntensity * 0.45);
      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, innerRadius,
        width / 2, height / 2, outerRadius
      );
      const vAlpha = Math.min(0.95, vIntensity * 0.9 + (audio.kick * 0.1));
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(0.7, `rgba(0,0,0,${vAlpha * 0.5})`);
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${vAlpha})`);
      
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 4. Bloom / Beat Drop Flare
    if (settings.bloomEnabled !== false && settings.bloom > 0.02 && (audio.beat || audio.kick > 0.6)) {
      ctx.save();
      const bloomGrad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width * 0.55
      );
      const bloomAlpha = Math.min(0.5, settings.bloom * 0.45 * audio.energy);
      
      // Parse settings.primaryColor and map bloom color directly to user selection!
      const c = (settings.primaryColor || '#FFD700').replace('#', '');
      const r = parseInt(c.substring(0, 2), 16) || 255;
      const g = parseInt(c.substring(2, 4), 16) || 215;
      const b = parseInt(c.substring(4, 6), 16) || 0;
      
      bloomGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${bloomAlpha})`);
      bloomGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${bloomAlpha * 0.3})`);
      bloomGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 5. Film Grain / 35mm Analog Noise
    if (settings.filmGrainEnabled && (settings.filmGrain ?? 0.3) > 0.02) {
      ctx.save();
      const grainIntensity = (settings.filmGrain ?? 0.3);
      ctx.fillStyle = '#FFFFFF';
      const grainCount = Math.floor(width * height * 0.00015 * grainIntensity);
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        
        const rand = Math.random();
        let gSize = 1;
        let gAlpha = rand * grainIntensity * 0.18;
        
        if (rand > 0.85) {
          gSize = 2;
        } else if (rand > 0.97) {
          gSize = 3; // Occasional larger emulsion specks for biological realistic grain
          gAlpha = rand * grainIntensity * 0.08;
        }
        
        ctx.globalAlpha = gAlpha;
        ctx.fillRect(gx, gy, gSize, gSize);
      }
      ctx.restore();
    }

    // 6. Bass Strobe / Flash (Euphoric Party Lights with Safe Cap)
    if (settings.strobeEnabled && audio.kick > 0.78) {
      ctx.save();
      // Photosensitivity safety cap: limit max alpha to 0.4 and scale with strobe intensity slider
      const flashAlpha = Math.min(0.4, (settings.strobe ?? 0.4) * 0.3 * (audio.kick - 0.4));
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = flashAlpha;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 7. Glitch Slice Displacement (Yatay Dijital Bant Kayması - True Pixel Slicing)
    if (settings.glitchSliceEnabled && this.offscreenCanvas && (audio.beat || audio.snare > 0.5)) {
      ctx.save();
      const freq = settings.glitchFrequency ?? 0.3;
      if (Math.random() < freq * 0.8) {
        const sliceCount = Math.floor(2 + Math.random() * 6 * (settings.glitchSlice ?? 0.5));
        for (let i = 0; i < sliceCount; i++) {
          const sliceY = Math.random() * height;
          const sliceH = 5 + Math.random() * 35;
          const sliceShift = (Math.random() - 0.5) * 60 * (settings.glitchSlice ?? 0.5);
          
          ctx.globalAlpha = 0.6 + Math.random() * 0.4;
          // Slice sections of the ACTUAL rendered visualizer scene rather than drawing fake bars!
          ctx.drawImage(
            this.offscreenCanvas,
            0, sliceY, width, sliceH,
            sliceShift, sliceY, width, sliceH
          );
        }
      }
      ctx.restore();
    }

    // 8. Edge Glow / Neon Çerçeve Pulsasyonu (Optimized with nested strokes instead of slow shadowBlur)
    if (settings.edgeGlowEnabled && (settings.edgeGlow ?? 0.5) > 0.02) {
      ctx.save();
      const edgeAlpha = Math.min(0.8, (settings.edgeGlow ?? 0.5) * (0.3 + audio.kick * 0.6));
      const baseWidth = 3 + audio.kick * 6;
      
      ctx.strokeStyle = settings.primaryColor;
      
      // Performant outer glow layer
      ctx.globalAlpha = edgeAlpha * 0.2;
      ctx.lineWidth = baseWidth * 4;
      ctx.strokeRect(0, 0, width, height);
      
      // Mid glow layer
      ctx.globalAlpha = edgeAlpha * 0.4;
      ctx.lineWidth = baseWidth * 2;
      ctx.strokeRect(0, 0, width, height);
      
      // Crisp inner core layer
      ctx.globalAlpha = edgeAlpha;
      ctx.lineWidth = baseWidth;
      ctx.strokeRect(0, 0, width, height);
      
      ctx.restore();
    }
  }

  private drawOverlays(context: RenderContext) {
    const { ctx, width, height, audio, settings } = context;
    const layout = settings.cardLayout || 'DEFAULT';

    // STUDIO_SPLIT_LYRICS modu kendi bölünmüş ekran arayüzünde albüm kapağını, şarkı/sanatçı künyesini
    // ve senkronize liriklerini (sol/sağ panel) zaten tam stüdyo kalitesinde çizer.
    // Bu modda orta ekranda çakışan mükerrer varsayılan kart, tipografi ve global lirik overlay'i atlanır.
    if (settings.mode === 'STUDIO_SPLIT_LYRICS') {
      if (this.logoImage) {
        ctx.save();
        const logoSize = Math.min(70, Math.floor(width * 0.06));
        ctx.globalAlpha = 0.85;
        ctx.drawImage(this.logoImage, width - logoSize - 30, height - logoSize - 30, logoSize, logoSize);
        ctx.restore();
      }
      return;
    }

    if (layout === 'NEON_FRAME') {
      this.drawNeonFrameLayout(context);
    } else if (layout === 'POLAROID') {
      this.drawPolaroidLayout(context);
    } else if (layout === 'NOIR_VINYL') {
      this.drawNoirVinylLayout(context);
    } else if (layout === 'HOLO_CD') {
      this.drawHoloCDLayout(context);
    } else if (layout === 'COVER_BIG') {
      this.drawCoverBigLayout(context);
    } else if (layout === 'VINYL') {
      this.drawVinylLayout(context);
    } else if (layout === 'CD') {
      this.drawCDLayout(context);
    } else if (layout === 'SPOTIFY') {
      this.drawSpotifyLayout(context);
    } else if (layout === 'TIKTOK') {
      this.drawTikTokLayout(context);
    } else if (layout === 'RETRO_TAPE') {
      this.drawRetroTapeLayout(context);
    } else if (layout === 'GLASS_CARD') {
      this.drawGlassCardLayout(context);
    } else {
      this.drawDefaultLayout(context);
    }

    // 2. Kinetik Lirikler (Magic Sync & Tipografi Katmanı)
    // TÜM PRESETLERDE VE KART MODLARINDA EN ÜST KATMAN OLARAK GARANTİLİ ÇİZİLİR
    if (settings.lyricsEnabled !== false && settings.syncedLyrics && settings.syncedLyrics.length > 0) {
      this.drawLyricsLayer(ctx, width, height, audio, settings);
    }

    // Always draw Logo / Watermark if enabled (except on dense TikTok layout)
    if (this.logoImage && layout !== 'TIKTOK') {
      ctx.save();
      const logoSize = Math.min(70, Math.floor(width * 0.06));
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.logoImage, width - logoSize - 30, height - logoSize - 30, logoSize, logoSize);
      ctx.restore();
    }
  }

  // ============================================================================
  // SHARED GRAPHIC HELPERS FOR SOCIAL MEDIA MUSIC CARDS
  // ============================================================================

  private drawSafeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }

  private formatTime(secs: number): string {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.floor(Math.max(0, secs) % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private drawReactiveWaveform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, audio: AudioEvents, primaryColor: string) {
    ctx.save();
    const barCount = 36;
    const gap = 3;
    const barW = (w - (barCount - 1) * gap) / barCount;
    const maxBarH = h;

    for (let i = 0; i < barCount; i++) {
      const specIdx = Math.floor((i / barCount) * audio.spectrum.length);
      const val = audio.spectrum[specIdx] || 0.02;
      const pulseH = Math.max(3, val * maxBarH * (1 + audio.kick * 0.4));
      
      const bx = x + i * (barW + gap);
      const by = y - pulseH / 2;

      // Gradient fill for waveform bars
      const grad = ctx.createLinearGradient(bx, by, bx, by + pulseH);
      grad.addColorStop(0, primaryColor);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

      ctx.fillStyle = grad;
      this.drawSafeRoundRect(ctx, bx, by, barW, pulseH, barW / 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ============================================================================
  // SPECIALIZED AUDIO GRAPHIC HELPERS (SUNBURST, RIBBON SINE, SPECTRUM BARS)
  // ============================================================================

  private drawSunburstEqualizer(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    baseRadius: number,
    tickLength: number,
    audio: AudioEvents,
    color: string
  ) {
    ctx.save();
    const tickCount = 48;
    const kickBoost = audio.kick * 14;
    const rotation = audio.time * 0.8;

    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 + rotation;
      const specIdx = Math.floor((i / tickCount) * (audio.spectrum.length / 2));
      const energy = audio.spectrum[specIdx] || 0.05;
      
      const rInner = baseRadius + kickBoost * 0.5;
      const rOuter = rInner + 4 + energy * tickLength * 1.6 + kickBoost;

      const x1 = cx + Math.cos(angle) * rInner;
      const y1 = cy + Math.sin(angle) * rInner;
      const x2 = cx + Math.cos(angle) * rOuter;
      const y2 = cy + Math.sin(angle) * rOuter;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawRibbonSineWave(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    audio: AudioEvents,
    color: string
  ) {
    ctx.save();
    const points = 64;
    const time = audio.time * 3.0;
    const energy = Math.max(0.15, audio.energy);

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 * energy;

    // Layer 1: Primary glowing sine ribbon
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const norm = i / points;
      const px = x + norm * w;
      // Window envelope to taper at ends
      const envelope = Math.sin(norm * Math.PI);
      const specIdx = Math.floor(norm * (audio.spectrum.length / 3));
      const specVal = audio.spectrum[specIdx] || 0.1;
      
      const wave1 = Math.sin(norm * 14 + time) * (h * 0.5);
      const wave2 = Math.sin(norm * 28 - time * 1.5) * (h * 0.25);
      const py = y + (wave1 + wave2) * envelope * (specVal * 1.5 + audio.kick * 0.8);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Layer 2: Secondary phase-shifted ribbon
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const norm = i / points;
      const px = x + norm * w;
      const envelope = Math.sin(norm * Math.PI);
      const specIdx = Math.floor((1 - norm) * (audio.spectrum.length / 3));
      const specVal = audio.spectrum[specIdx] || 0.1;
      
      const wave = Math.sin(norm * 18 - time * 1.2 + Math.PI / 2) * (h * 0.35);
      const py = y + wave * envelope * (specVal * 1.3 + audio.snare * 0.6);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  // ============================================================================
  // INSPIRATION LAYOUT 1: SİBER IŞIMA KARTI (NEON_FRAME)
  // ============================================================================
  private drawNeonFrameLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#00F0FF';
    const isVertical = height > width;

    ctx.save();

    // 1. Cyber Dark Vignette & Background Ambient Glow
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.35, 10,
      width / 2, height * 0.35, width * 0.6
    );
    bgGrad.addColorStop(0, `${primaryColor}25`);
    bgGrad.addColorStop(0.6, 'rgba(10, 12, 18, 0.6)');
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Glowing Rounded Cover Art Card
    const cardW = isVertical ? Math.min(width * 0.82, 420) : Math.min(height * 0.52, 380);
    const cardH = cardW;
    const cardX = (width - cardW) / 2;
    const cardY = isVertical ? height * 0.14 : height * 0.10;

    // Ambient Neon Shadow / Halo behind card
    ctx.save();
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 30 + audio.kick * 25;
    ctx.fillStyle = '#0a0a10';
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.restore();

    // Draw clipped artwork
    ctx.save();
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.clip();

    if (this.coverImage) {
      ctx.drawImage(this.coverImage, cardX, cardY, cardW, cardH);
    } else {
      ctx.fillStyle = '#12121a';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ALBUM COVER', cardX + cardW / 2, cardY + cardH / 2);
    }

    // Diagonal Glass Sheen Reflection
    const sheenGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    sheenGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
    sheenGrad.addColorStop(0.31, 'rgba(255, 255, 255, 0.0)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    ctx.restore();

    // Card Outer Stroke
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.stroke();
    ctx.restore();

    // 3. Track Title & Artist Info (Left Aligned on Card Margin)
    const textY = cardY + cardH + 40;
    ctx.save();
    ctx.textAlign = 'left';

    const trackTitle = (settings.trackTitle || "DON'T STOP").toUpperCase();
    const artistName = (settings.artistName || "JERRY J").toUpperCase();

    ctx.font = `900 ${Math.min(34, Math.floor(width * 0.048))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(trackTitle, cardX, textY);

    ctx.font = `600 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(artistName, cardX, textY + 28);
    ctx.restore();

    // 4. Equalizer Spectrum Bars (Bottom Left or Centered)
    const eqW = cardW * 0.65;
    const eqX = cardX;
    const eqY = textY + 95;
    const barCount = 28;
    const gap = 3;
    const barW = (eqW - (barCount - 1) * gap) / barCount;
    const maxBarH = 42;

    ctx.save();
    for (let i = 0; i < barCount; i++) {
      const specIdx = Math.floor((i / barCount) * (audio.spectrum.length / 2));
      const val = audio.spectrum[specIdx] || 0.05;
      const barH = Math.max(4, val * maxBarH * (1.2 + audio.kick * 0.5));
      const bx = eqX + i * (barW + gap);
      const by = eqY - barH;

      const barGrad = ctx.createLinearGradient(bx, by, bx, by + barH);
      barGrad.addColorStop(0, primaryColor);
      barGrad.addColorStop(1, '#9333EA'); // purple bottom fade

      ctx.fillStyle = barGrad;
      this.drawSafeRoundRect(ctx, bx, by, barW, barH, barW / 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  // ============================================================================
  // INSPIRATION LAYOUT 2: VINTAGE POLAROID & SUNBURST (POLAROID)
  // ============================================================================
  private drawPolaroidLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#E8590C';
    const isVertical = height > width;

    ctx.save();

    // 1. Warm Sunset Peach/Cream Ambient Background
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.4, 30,
      width / 2, height * 0.4, width * 0.75
    );
    bgGrad.addColorStop(0, '#FFE8D6');
    bgGrad.addColorStop(0.5, '#F7D1BA');
    bgGrad.addColorStop(1, '#DDB892');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Authentic Polaroid Frame Dimensions
    const frameW = isVertical ? Math.min(width * 0.82, 400) : Math.min(height * 0.55, 360);
    const photoPad = frameW * 0.05;
    const photoSize = frameW - photoPad * 2;
    const frameH = photoSize + photoPad * 3 + 45; // Extra bottom margin for Polaroid caption
    const frameX = (width - frameW) / 2;
    const frameY = isVertical ? height * 0.12 : height * 0.08;

    // Realistic Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(60, 40, 20, 0.35)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#FFFFFF';
    this.drawSafeRoundRect(ctx, frameX, frameY, frameW, frameH, 8);
    ctx.fill();
    ctx.restore();

    // Photo Area
    const photoX = frameX + photoPad;
    const photoY = frameY + photoPad;
    ctx.save();
    this.drawSafeRoundRect(ctx, photoX, photoY, photoSize, photoSize, 4);
    ctx.clip();

    if (this.coverImage) {
      ctx.drawImage(this.coverImage, photoX, photoY, photoSize, photoSize);
      // Soft warm photo filter tint
      ctx.fillStyle = 'rgba(255, 200, 150, 0.12)';
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
    } else {
      ctx.fillStyle = '#3F2E23';
      ctx.fillRect(photoX, photoY, photoSize, photoSize);
      ctx.fillStyle = '#FFE8D6';
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POLAROID SNAPSHOT', photoX + photoSize / 2, photoY + photoSize / 2);
    }
    ctx.restore();

    // Polaroid Bottom Caption (Distressed Typewriter Style)
    ctx.save();
    ctx.fillStyle = '#2B1E16';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    const tagText = 'SUNSET ROLLER DISCO - SUMMER \'77';
    ctx.fillText(tagText, frameX + frameW / 2, frameY + frameH - 18);
    ctx.restore();

    // 3. Track Title & Artist Info (Warm Contrast)
    const textY = frameY + frameH + 36;
    ctx.save();
    ctx.textAlign = 'left';

    const trackTitle = (settings.trackTitle || "DON'T STOP").toUpperCase();
    const artistName = (settings.artistName || "JERRY J").toUpperCase();

    ctx.font = `900 ${Math.min(34, Math.floor(width * 0.048))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.fillText(trackTitle, frameX, textY);

    ctx.font = `700 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#5A3E2B';
    ctx.fillText(artistName, frameX, textY + 26);
    ctx.restore();

    // 4. Circular Sunburst Audio Reactive Ring at bottom center
    const sunburstY = textY + 85;
    this.drawSunburstEqualizer(
      ctx,
      width / 2,
      sunburstY,
      20,
      22,
      audio,
      primaryColor
    );

    ctx.restore();
  }

  // ============================================================================
  // INSPIRATION LAYOUT 3: NOIR KARANLIK VİNİL & SİNÜS RİBBON (NOIR_VINYL)
  // ============================================================================
  private drawNoirVinylLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#E11D48';
    const isVertical = height > width;

    ctx.save();

    // 1. Deep Cinematic Noir Background with Floating Dust Particles
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.38, 20,
      width / 2, height * 0.38, width * 0.7
    );
    bgGrad.addColorStop(0, '#1c1c24');
    bgGrad.addColorStop(0.7, '#0c0c10');
    bgGrad.addColorStop(1, '#050508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient stardust particles
    ctx.save();
    for (let p = 0; p < 24; p++) {
      const px = (Math.sin(p * 99 + audio.time * 0.2) * 0.5 + 0.5) * width;
      const py = (Math.cos(p * 33 + audio.time * 0.15) * 0.5 + 0.5) * height;
      const pr = (Math.sin(p + audio.time) * 0.5 + 0.5) * 1.5 + 0.5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Centered Noir Vinyl Record
    const vinylRadius = isVertical ? Math.min(width * 0.40, 210) : Math.min(height * 0.26, 180);
    const vinylX = width / 2;
    const vinylY = isVertical ? height * 0.32 : height * 0.26;
    const rotation = audio.time * 1.2;

    ctx.save();
    ctx.translate(vinylX, vinylY);
    ctx.rotate(rotation);

    // Outer Vinyl Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.arc(0, 0, vinylRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Vinyl Grooves (Reflective concentric arcs)
    const grooveCount = 18;
    for (let g = 0; g < grooveCount; g++) {
      const gr = vinylRadius * 0.44 + (g / grooveCount) * (vinylRadius * 0.52);
      ctx.strokeStyle = g % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, gr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dual Specular Reflection Highlights
    const specGrad = ctx.createLinearGradient(-vinylRadius, -vinylRadius, vinylRadius, vinylRadius);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    specGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.0)');
    specGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.0)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(0, 0, vinylRadius, 0, Math.PI * 2);
    ctx.fill();

    // Center Cover Label
    const labelRadius = vinylRadius * 0.38;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
    ctx.clip();

    if (this.coverImage) {
      ctx.drawImage(this.coverImage, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    }
    ctx.restore();

    // Center Spindle Hole
    ctx.fillStyle = '#050508';
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 3. Track Title & Artist Info (Left Aligned)
    const cardMarginX = isVertical ? width * 0.10 : width * 0.15;
    const textY = vinylY + vinylRadius + 44;
    ctx.save();
    ctx.textAlign = 'left';

    const trackTitle = (settings.trackTitle || "DON'T STOP").toUpperCase();
    const artistName = (settings.artistName || "JERRY J").toUpperCase();

    ctx.font = `900 ${Math.min(34, Math.floor(width * 0.048))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(trackTitle, cardMarginX, textY);

    ctx.font = `600 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(artistName, cardMarginX, textY + 28);
    ctx.restore();

    // 4. Glowing Sine Ribbon Waveform at bottom
    const waveW = width - cardMarginX * 2;
    const waveY = textY + 85;
    this.drawRibbonSineWave(ctx, cardMarginX, waveY, waveW, 28, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // INSPIRATION LAYOUT 4: AÇILI HOLOGRAFİK CD & YILDIZ IŞILTILARI (HOLO_CD)
  // ============================================================================
  private drawHoloCDLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#C084FC';
    const isVertical = height > width;

    ctx.save();

    // 1. Deep Space Violet / Charcoal Vignette Background
    const bgGrad = ctx.createRadialGradient(
      width / 2, height * 0.35, 10,
      width / 2, height * 0.35, width * 0.7
    );
    bgGrad.addColorStop(0, '#2e106540');
    bgGrad.addColorStop(0.6, '#0f0f15');
    bgGrad.addColorStop(1, '#050508');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Sparkling 4-Point Star Sparkles around the CD
    const cdCenterX = width / 2;
    const cdCenterY = isVertical ? height * 0.32 : height * 0.26;
    const stars = [
      { x: cdCenterX - width * 0.30, y: cdCenterY - height * 0.12, size: 8, phase: 0 },
      { x: cdCenterX - width * 0.33, y: cdCenterY + height * 0.06, size: 6, phase: 1.5 },
      { x: cdCenterX + width * 0.32, y: cdCenterY - height * 0.08, size: 10, phase: 3.0 },
      { x: cdCenterX + width * 0.28, y: cdCenterY + height * 0.10, size: 7, phase: 4.5 }
    ];

    ctx.save();
    stars.forEach(star => {
      const pulse = Math.sin(audio.time * 4 + star.phase) * 0.4 + 0.6 + (audio.highEnergy || 0) * 0.5;
      const s = star.size * pulse;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 10 * pulse;

      // 4-point star path
      ctx.beginPath();
      ctx.moveTo(star.x, star.y - s);
      ctx.quadraticCurveTo(star.x, star.y, star.x + s, star.y);
      ctx.quadraticCurveTo(star.x, star.y, star.x, star.y + s);
      ctx.quadraticCurveTo(star.x, star.y, star.x - s, star.y);
      ctx.quadraticCurveTo(star.x, star.y, star.x, star.y - s);
      ctx.fill();
    });
    ctx.restore();

    // 3. 3D-Tilted Angled Holographic CD Disc
    const cdRadius = isVertical ? Math.min(width * 0.38, 200) : Math.min(height * 0.26, 170);
    const rotation = audio.time * 2.0;

    ctx.save();
    ctx.translate(cdCenterX, cdCenterY);
    // Apply 3D-tilted rotation & scale to simulate perspective angle
    ctx.rotate(-0.25);
    ctx.scale(1.0, 0.82);
    ctx.rotate(rotation);

    // Outer Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 36;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, cdRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Holographic Rainbow Prismatic Wedges
    const wedgeCount = 16;
    const holoColors = [
      '#FF0055', '#FF7700', '#FFFF00', '#00FF66', 
      '#00FFFF', '#0066FF', '#9900FF', '#FF00AA'
    ];

    for (let w = 0; w < wedgeCount; w++) {
      const a1 = (w / wedgeCount) * Math.PI * 2;
      const a2 = ((w + 1) / wedgeCount) * Math.PI * 2;
      ctx.fillStyle = holoColors[w % holoColors.length];
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, cdRadius, a1, a2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Specular Silver Reflection Sheen
    const sheen = ctx.createLinearGradient(-cdRadius, -cdRadius, cdRadius, cdRadius);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    sheen.addColorStop(0.35, 'rgba(255, 255, 255, 0.1)');
    sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
    sheen.addColorStop(0.65, 'rgba(255, 255, 255, 0.1)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(0, 0, cdRadius, 0, Math.PI * 2);
    ctx.fill();

    // Clear Plastic Inner Ring
    ctx.fillStyle = 'rgba(240, 240, 245, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, cdRadius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Spindle Hole
    ctx.fillStyle = '#08080c';
    ctx.beginPath();
    ctx.arc(0, 0, cdRadius * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // 4. Track Title & Artist Info (Left Aligned)
    const cardMarginX = isVertical ? width * 0.10 : width * 0.15;
    const textY = cdCenterY + cdRadius * 0.82 + 48;
    ctx.save();
    ctx.textAlign = 'left';

    const trackTitle = (settings.trackTitle || "DON'T STOP").toUpperCase();
    const artistName = (settings.artistName || "JERRY J").toUpperCase();

    ctx.font = `900 ${Math.min(34, Math.floor(width * 0.048))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(trackTitle, cardMarginX, textY);

    ctx.font = `600 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(artistName, cardMarginX, textY + 28);
    ctx.restore();

    // 5. Glowing Ribbon Sine Waveform at bottom
    const waveW = width - cardMarginX * 2;
    const waveY = textY + 85;
    this.drawRibbonSineWave(ctx, cardMarginX, waveY, waveW, 26, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // 1. SPOTIFY CANVAS & STORY SHARE (ULTRA-CLEAN STREAMING MASTERPIECE)
  // ============================================================================
  private drawSpotifyLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#1DB954';
    const isVertical = height > width;

    ctx.save();

    // 1. Ambient Background Glow (Soft colored halo derived from primary color)
    const glowRadius = Math.min(width, height) * 0.45;
    const ambientGrad = ctx.createRadialGradient(
      width / 2, height * 0.35, 20,
      width / 2, height * 0.35, glowRadius
    );
    ambientGrad.addColorStop(0, `${primaryColor}22`);
    ambientGrad.addColorStop(0.6, `${primaryColor}08`);
    ambientGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Spotify Top Header Pill
    const headerY = height * 0.06;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Spotify mini badge
    const badgeW = 160;
    const badgeH = 28;
    const badgeX = (width - badgeW) / 2;
    ctx.fillStyle = 'rgba(10, 10, 12, 0.65)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.drawSafeRoundRect(ctx, badgeX, headerY - badgeH / 2, badgeW, badgeH, 14);
    ctx.fill();
    ctx.stroke();

    // Spotify 3-arcs icon
    const iconX = badgeX + 20;
    const iconY = headerY;
    ctx.strokeStyle = '#1DB954';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let a = 0; a < 3; a++) {
      const arcR = 4 + a * 3.5;
      ctx.beginPath();
      ctx.arc(iconX, iconY + 5, arcR, -Math.PI * 0.65, -Math.PI * 0.35);
      ctx.stroke();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 10px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('SPOTIFY CANVAS', badgeX + badgeW / 2 + 10, headerY);
    ctx.restore();

    // 3. Album Cover (Floating with deep shadow + halo)
    const coverSize = isVertical 
      ? Math.min(width * 0.65, 340) 
      : Math.min(height * 0.42, 320);
    const coverX = (width - coverSize) / 2;
    const coverY = isVertical ? height * 0.14 : height * 0.12;

    // Cover backlight halo
    ctx.save();
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 35 * (1 + audio.kick * 0.25);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
    ctx.fill();
    ctx.restore();

    // Render Cover Image with rounded corners
    ctx.save();
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, coverX, coverY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#18181c';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPOTIFY TRACK', coverX + coverSize / 2, coverY + coverSize / 2);
    }
    // Subtle inner border over cover
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 20);
    ctx.stroke();
    ctx.restore();

    // 5. Floating Spotify Player Bar (Bottom Widget)
    const playerW = Math.min(width * 0.90, 520);
    const playerH = 92;
    const playerX = (width - playerW) / 2;
    const playerY = height - playerH - (isVertical ? 36 : 24);

    // Glass Container
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 28;
    ctx.fillStyle = 'rgba(18, 18, 22, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.drawSafeRoundRect(ctx, playerX, playerY, playerW, playerH, 18);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Mini Thumbnail
    const thumbSize = 52;
    const thumbX = playerX + 16;
    const thumbY = playerY + 16;
    ctx.save();
    this.drawSafeRoundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 10);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, thumbX, thumbY, thumbSize, thumbSize);
    } else {
      ctx.fillStyle = '#282828';
      ctx.fillRect(thumbX, thumbY, thumbSize, thumbSize);
    }
    ctx.restore();

    // Track Title & Artist
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const textStartX = thumbX + thumbSize + 14;
    const titleText = (settings.trackTitle || 'UNTITLED TRACK').toUpperCase();
    const artistText = (settings.artistName || 'UNKNOWN ARTIST').toUpperCase();

    ctx.font = '800 15px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(titleText, textStartX, playerY + 28);

    ctx.font = '600 12px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillText(artistText, textStartX, playerY + 46);
    ctx.restore();

    // Live Spotify Animated Equalizer Widget (Right Side)
    const eqX = playerX + playerW - 46;
    const eqY = playerY + 36;
    ctx.save();
    ctx.strokeStyle = '#1DB954';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const barH = 6 + (i === 0 ? audio.kick : i === 1 ? audio.snare : i === 2 ? audio.hihat : audio.energy) * 20;
      const bx = eqX - 18 + i * 8;
      ctx.beginPath();
      ctx.moveTo(bx, eqY + barH / 2);
      ctx.lineTo(bx, eqY - barH / 2);
      ctx.stroke();
    }
    ctx.restore();

    // Scrubber Progress Bar & Timestamps
    const scrubX = playerX + 16;
    const scrubY = playerY + playerH - 18;
    const scrubW = playerW - 32;
    const dur = audio.duration && audio.duration > 0 ? audio.duration : 180;
    const progress = Math.min(1.0, Math.max(0.0, audio.time / dur));

    ctx.save();
    // Track line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.drawSafeRoundRect(ctx, scrubX, scrubY, scrubW, 4, 2);
    ctx.fill();

    // Active filled line
    ctx.fillStyle = '#1DB954';
    this.drawSafeRoundRect(ctx, scrubX, scrubY, Math.max(4, scrubW * progress), 4, 2);
    ctx.fill();

    // Glowing Thumb dot
    const thumbDotX = scrubX + scrubW * progress;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#1DB954';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(thumbDotX, scrubY + 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ============================================================================
  // 2. VINYL TURNTABLE STUDIO (LO-FI ANALOG MASTERPIECE)
  // ============================================================================
  private drawVinylLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#FFD700';
    const isVertical = height > width;
    const time = audio.time;

    ctx.save();

    // 1. Turntable Layout Math
    const turntableRadius = isVertical 
      ? Math.min(width * 0.38, 220)
      : Math.min(height * 0.30, 200);
    const centerX = width / 2;
    const centerY = isVertical ? height * 0.32 : height * 0.36;

    // 2. Ambient Shadow under the entire Turntable System
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 45;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, turntableRadius * 1.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Realistic Cardboard Sleeve (Offset behind vinyl on the left)
    const sleeveSize = turntableRadius * 1.95;
    const sleeveX = centerX - turntableRadius * 1.05;
    const sleeveY = centerY - sleeveSize / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 24;
    this.drawSafeRoundRect(ctx, sleeveX, sleeveY, sleeveSize, sleeveSize, 12);
    ctx.fillStyle = '#141416';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Clip sleeve cover
    this.drawSafeRoundRect(ctx, sleeveX, sleeveY, sleeveSize, sleeveSize, 12);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, sleeveX, sleeveY, sleeveSize, sleeveSize);
    }
    // Cardboard spine & opening shadow
    const seamGrad = ctx.createLinearGradient(sleeveX + sleeveSize - 40, sleeveY, sleeveX + sleeveSize, sleeveY);
    seamGrad.addColorStop(0, 'rgba(0,0,0,0)');
    seamGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = seamGrad;
    ctx.fillRect(sleeveX + sleeveSize - 40, sleeveY, 40, sleeveSize);
    ctx.restore();

    // 4. Realistic Spinning Vinyl Disc (Sliding out to the right)
    const vinylX = centerX + turntableRadius * 0.32;
    const vinylY = centerY;
    const spinAngle = time * 1.8;

    ctx.save();
    ctx.translate(vinylX, vinylY);
    ctx.rotate(spinAngle);

    // Deep black vinyl body
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.arc(0, 0, turntableRadius, 0, Math.PI * 2);
    ctx.fill();

    // Vinyl Rim Bevel
    ctx.strokeStyle = '#222228';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 16 Microscopic Realistic Audio Grooves
    for (let g = 0; g < 16; g++) {
      const grRatio = 0.42 + (g / 16) * 0.54;
      ctx.strokeStyle = g % 4 === 0 ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, turntableRadius * grRatio, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Specular Anisotropic Light Glare Reflections (Dual rotating light wings)
    const sheenGrad = ctx.createRadialGradient(0, 0, turntableRadius * 0.2, 0, 0, turntableRadius);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheenGrad;
    // Wing 1
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, turntableRadius, -Math.PI / 5, Math.PI / 5);
    ctx.fill();
    // Wing 2 (Opposite)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, turntableRadius, Math.PI - Math.PI / 5, Math.PI + Math.PI / 5);
    ctx.fill();

    // Center Paper Record Label
    const labelRadius = turntableRadius * 0.36;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    } else {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    }
    // Label border & vintage text ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Center Spindle Hole & Brass Ring
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4af37'; // gold brass spindle ring
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore(); // end vinyl rotation

    // 5. Heavy Chrome Tonearm with Audio-Reactive Needle Bounce
    ctx.save();
    const armBaseX = vinylX + turntableRadius * 0.92;
    const armBaseY = vinylY - turntableRadius * 0.85;

    // Base pivot cylinder
    ctx.fillStyle = '#1e1e24';
    ctx.strokeStyle = '#4a4a55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(armBaseX, armBaseY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Counterweight
    ctx.fillStyle = '#7a7a85';
    ctx.beginPath();
    ctx.arc(armBaseX + 8, armBaseY - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Arm Rotation (reacts slightly to sub-bass kick)
    ctx.translate(armBaseX, armBaseY);
    const armAngle = 0.52 + Math.sin(time * 0.1) * 0.015 + audio.kick * 0.012;
    ctx.rotate(armAngle);

    // Chrome Arm Rod
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-35, turntableRadius * 0.65);
    ctx.lineTo(-65, turntableRadius * 1.05);
    ctx.stroke();

    // Headshell Cartridge & Glowing LED Needle
    const headX = -65;
    const headY = turntableRadius * 1.05;
    ctx.fillStyle = '#111115';
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, headX - 8, headY - 4, 16, 22, 3);
    ctx.fill();
    ctx.stroke();

    // Glowing Stylus Needle Point
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 10 * (1 + audio.kick * 0.5);
    ctx.beginPath();
    ctx.arc(headX, headY + 18, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Typography & Audio Spec Badges (Bottom Section)
    const textY = isVertical ? centerY + turntableRadius + 75 : height - 120;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const trackTitle = (settings.trackTitle || 'VINYL SESSION').toUpperCase();
    const artistName = (settings.artistName || 'ANALOG MASTER').toUpperCase();

    // Badges: [ 33 ⅓ RPM ] [ STEREO FIDELITY ]
    const badgeStr = '33 ⅓ RPM  •  HI-FI STEREO MASTER  •  VALVE ANALOG';
    ctx.font = '700 9.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = primaryColor;
    ctx.letterSpacing = '2px';
    ctx.fillText(badgeStr, width / 2, textY - 24);

    ctx.font = `900 ${Math.min(38, Math.floor(width * 0.046))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.fillText(trackTitle, width / 2, textY + 8);

    ctx.font = `700 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(artistName, width / 2, textY + 36);
    ctx.restore();

    // 7. Smooth Equalizer Waveform below
    const waveW = Math.min(width * 0.72, 480);
    const waveX = (width - waveW) / 2;
    const waveY = textY + 74;
    this.drawReactiveWaveform(ctx, waveX, waveY, waveW, 36, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // 3. Y2K HOLOGRAPHIC CD JEWEL CASE (RETRO FUTURE COMPACT DISC)
  // ============================================================================
  private drawCDLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#38BDF8';
    const isVertical = height > width;
    const time = audio.time;

    ctx.save();
    const cdRadius = isVertical 
      ? Math.min(width * 0.36, 210) 
      : Math.min(height * 0.30, 190);
    const centerX = width / 2;
    const centerY = isVertical ? height * 0.32 : height * 0.36;

    // 1. Transparent Acrylic Jewel Case (Behind CD)
    const caseSize = cdRadius * 2.05;
    const caseX = centerX - cdRadius * 1.05;
    const caseY = centerY - caseSize / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 30;

    // Jewel Case Acrylic Base
    ctx.fillStyle = 'rgba(20, 24, 32, 0.82)';
    this.drawSafeRoundRect(ctx, caseX, caseY, caseSize, caseSize, 14);
    ctx.fill();

    // Album Inlay Cover Inside
    const pad = 12;
    this.drawSafeRoundRect(ctx, caseX + pad, caseY + pad, caseSize - pad * 2, caseSize - pad * 2, 8);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, caseX + pad, caseY + pad, caseSize - pad * 2, caseSize - pad * 2);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(caseX + pad, caseY + pad, caseSize - pad * 2, caseSize - pad * 2);
    }

    // Acrylic Glare Diagonal Line
    const glareGrad = ctx.createLinearGradient(caseX, caseY, caseX + caseSize, caseY + caseSize);
    glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    glareGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
    glareGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    glareGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    ctx.fillStyle = glareGrad;
    ctx.fillRect(caseX, caseY, caseSize, caseSize);

    // Case Edge Bevel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, caseX, caseY, caseSize, caseSize, 14);
    ctx.stroke();
    ctx.restore();

    // 2. Holographic Rainbow Compact Disc (Sliding out to the right)
    const cdX = centerX + cdRadius * 0.35;
    const cdY = centerY;
    const cdAngle = time * 2.5;

    ctx.save();
    ctx.translate(cdX, cdY);
    ctx.rotate(cdAngle);

    // CD Base Mirror Surface
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 24;
    const mirrorGrad = ctx.createRadialGradient(0, 0, cdRadius * 0.15, 0, 0, cdRadius);
    mirrorGrad.addColorStop(0, '#f8fafc');
    mirrorGrad.addColorStop(0.35, '#94a3b8');
    mirrorGrad.addColorStop(0.7, '#475569');
    mirrorGrad.addColorStop(1, '#cbd5e1');

    ctx.fillStyle = mirrorGrad;
    ctx.beginPath();
    ctx.arc(0, 0, cdRadius, 0, Math.PI * 2);
    ctx.fill();

    // Continuous Chromatic Rainbow Hologram Grating
    const rainbowColors = [
      'rgba(255, 0, 0, 0.18)',
      'rgba(255, 165, 0, 0.18)',
      'rgba(255, 255, 0, 0.18)',
      'rgba(0, 255, 0, 0.18)',
      'rgba(0, 255, 255, 0.18)',
      'rgba(0, 0, 255, 0.18)',
      'rgba(147, 51, 234, 0.18)'
    ];

    for (let i = 0; i < 4; i++) {
      const startA = (i * Math.PI) / 2 - Math.PI / 6;
      const sweepA = Math.PI / 3;
      rainbowColors.forEach((col, idx) => {
        const segA = startA + (idx / rainbowColors.length) * sweepA;
        const nextA = startA + ((idx + 1) / rainbowColors.length) * sweepA;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, cdRadius, segA, nextA);
        ctx.fill();
      });
    }

    // Concentric Data Tracks
    [0.94, 0.88, 0.76, 0.42].forEach(r => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, cdRadius * r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Center Silk-Screened Artwork Label
    const labelRadius = cdRadius * 0.38;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    } else {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
    }
    ctx.restore();

    // Clear Clamping Ring Section (Polycarbonate transparent inner band)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Spindle Hole
    ctx.fillStyle = '#05070a';
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Compact Disc Digital Audio Badge & Track Information
    const textY = isVertical ? centerY + cdRadius + 75 : height - 120;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const trackTitle = (settings.trackTitle || 'COMPACT DISC AUDIO').toUpperCase();
    const artistName = (settings.artistName || 'DIGITAL STEREO').toUpperCase();

    // CD Digital Audio Logo Badge
    ctx.font = '800 10px "Space Grotesk", sans-serif';
    ctx.fillStyle = primaryColor;
    ctx.letterSpacing = '2px';
    ctx.fillText('COMPACT DISC  •  DIGITAL AUDIO  •  16-BIT / 44.1kHz', width / 2, textY - 24);

    ctx.font = `900 ${Math.min(38, Math.floor(width * 0.046))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(trackTitle, width / 2, textY + 8);

    ctx.font = `700 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(artistName, width / 2, textY + 36);
    ctx.restore();

    // 4. Equalizer Waveform
    const waveW = Math.min(width * 0.72, 480);
    const waveX = (width - waveW) / 2;
    const waveY = textY + 74;
    this.drawReactiveWaveform(ctx, waveX, waveY, waveW, 36, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // 4. EDITORIAL BIG COVER POSTER (SWISS / A24 BRUTALIST LUXURY)
  // ============================================================================
  private drawCoverBigLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#FFD700';
    const isVertical = height > width;

    ctx.save();

    // 1. Cover Art Size & Geometry
    const coverSize = isVertical 
      ? Math.min(width * 0.74, 400) 
      : Math.min(height * 0.48, 360);
    const coverX = (width - coverSize) / 2;
    const coverY = isVertical ? height * 0.16 : height * 0.12;

    // 2. Ambient Glow & Bevel Frame Behind Cover
    ctx.save();
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 40 * (1 + audio.kick * 0.35);
    ctx.fillStyle = '#08080a';
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 16);
    ctx.fill();
    ctx.restore();

    // Cover Image Clip
    ctx.save();
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 16);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, coverX, coverY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#141418';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 18px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO COVER ART', coverX + coverSize / 2, coverY + coverSize / 2);
    }
    // High-contrast border overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 16);
    ctx.stroke();
    ctx.restore();

    // 3. Editorial Badges on Top
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '800 10px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '1.5px';
    ctx.fillStyle = primaryColor;
    ctx.fillText('VF-MASTER // 2026', coverX, coverY - 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ORIGINAL RECORDING', coverX + coverSize, coverY - 20);
    ctx.restore();

    // 4. Large Editorial Typography Below
    const textY = coverY + coverSize + (isVertical ? 65 : 45);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const trackTitle = (settings.trackTitle || 'EDITORIAL RELEASE').toUpperCase();
    const artistName = (settings.artistName || 'CURATED ARTIST').toUpperCase();

    ctx.font = `900 ${Math.min(44, Math.floor(width * 0.052))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 18 * audio.energy;
    ctx.fillText(trackTitle, width / 2, textY);

    ctx.font = `700 ${Math.min(22, Math.floor(width * 0.026))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.shadowBlur = 0;
    ctx.fillText(artistName, width / 2, textY + 36);
    ctx.restore();

    // 5. Symmetric Stereo Waveform Below
    const waveW = Math.min(width * 0.74, 520);
    const waveX = (width - waveW) / 2;
    const waveY = textY + 80;
    this.drawReactiveWaveform(ctx, waveX, waveY, waveW, 44, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // 5. TIKTOK & REELS VIRAL SOUND (KINETIC KARAOKE & VIRAL RECORD)
  // ============================================================================
  private drawTikTokLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#FF0050';
    const isVertical = height > width;

    ctx.save();

    // 2. Native TikTok Sound Pill (Bottom Left)
    const soundPillX = width * 0.05;
    const soundPillY = height - 100;

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const trackTitle = (settings.trackTitle || 'ORIGINAL SOUND').toUpperCase();
    const artistName = (settings.artistName || 'CREATOR').toUpperCase();

    // User Handle
    ctx.font = '900 18px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(`@${artistName}`, soundPillX, soundPillY - 8);

    // TikTok Music Sound Bar Marquee
    ctx.font = '700 12.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`♫ ${trackTitle} - ${artistName} (Original Sound)`, soundPillX, soundPillY + 18);
    ctx.restore();

    // 3. Rotating Mini Vinyl Badge (Bottom Right) with Floating Musical Notes
    const vinylSize = 58;
    const vinylX = width - vinylSize - (width * 0.05);
    const vinylY = height - vinylSize - 55;
    const spinAngle = audio.time * 2.8;

    ctx.save();
    ctx.translate(vinylX + vinylSize / 2, vinylY + vinylSize / 2);
    ctx.rotate(spinAngle);

    // Vinyl Rim
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#111114';
    ctx.beginPath();
    ctx.arc(0, 0, vinylSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#33333d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mini Cover inside
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, vinylSize * 0.32, 0, Math.PI * 2);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, -vinylSize * 0.32, -vinylSize * 0.32, vinylSize * 0.64, vinylSize * 0.64);
    } else {
      ctx.fillStyle = primaryColor;
      ctx.fillRect(-vinylSize * 0.32, -vinylSize * 0.32, vinylSize * 0.64, vinylSize * 0.64);
    }
    ctx.restore();
    ctx.restore();

    // Floating musical note animation
    ctx.save();
    const noteFloatY = vinylY - Math.abs(Math.sin(audio.time * 2.0)) * 25;
    const noteAlpha = 0.8 - (Math.abs(Math.sin(audio.time * 2.0)) * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${noteAlpha})`;
    ctx.font = '16px serif';
    ctx.fillText('🎵', vinylX + 15, noteFloatY);
    ctx.restore();

    // 4. Smooth Bottom Progress Scrubber
    const dur = audio.duration && audio.duration > 0 ? audio.duration : 180;
    const progress = Math.min(1.0, Math.max(0.0, audio.time / dur));
    const timelineH = 4;
    const timelineY = height - timelineH;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(0, timelineY, width, timelineH);

    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, timelineY, width * progress, timelineH);
    ctx.restore();

    ctx.restore();
  }

  // ============================================================================
  // 6. RETRO CASSETTE TAPE (80s WALKMAN & CHROME HIGH-BIAS TAPE)
  // ============================================================================
  private drawRetroTapeLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#F59E0B';
    const isVertical = height > width;
    const time = audio.time;

    ctx.save();

    // 1. Cassette Dimensions
    const tapeW = isVertical ? Math.min(width * 0.88, 440) : Math.min(width * 0.55, 480);
    const tapeH = tapeW * 0.63;
    const tapeX = (width - tapeW) / 2;
    const tapeY = isVertical ? height * 0.18 : height * 0.14;

    // Outer Smoked Acrylic Cassette Shell
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#16161a';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    this.drawSafeRoundRect(ctx, tapeX, tapeY, tapeW, tapeH, 16);
    ctx.fill();
    ctx.stroke();

    // 4 Corner Metal Screws
    const screws = [
      [14, 14], [tapeW - 14, 14],
      [14, tapeH - 14], [tapeW - 14, tapeH - 14],
      [tapeW / 2, 14]
    ];
    ctx.fillStyle = '#4b5563';
    screws.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(tapeX + sx, tapeY + sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Vintage Paper Label Sticker
    const labelPadX = tapeW * 0.08;
    const labelPadY = tapeH * 0.08;
    const labelW = tapeW - labelPadX * 2;
    const labelH = tapeH * 0.76;
    const labelX = tapeX + labelPadX;
    const labelY = tapeY + labelPadY;

    ctx.save();
    ctx.fillStyle = '#eae6db'; // authentic vintage off-white
    this.drawSafeRoundRect(ctx, labelX, labelY, labelW, labelH, 8);
    ctx.fill();

    // Top Stripe on Sticker (primary accent)
    ctx.fillStyle = primaryColor;
    this.drawSafeRoundRect(ctx, labelX, labelY, labelW, 8, 4);
    ctx.fill();

    // Sticker Details
    ctx.fillStyle = '#111115';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SIDE A  •  TYPE II [CrO2]  •  DOLBY B-C NR', labelX + 14, labelY + 24);

    const songTitle = (settings.trackTitle || 'MIXTAPE VOL. 1').toUpperCase();
    const artistTitle = (settings.artistName || 'ANALOG RECORD').toUpperCase();

    ctx.font = `bold ${Math.min(15, Math.floor(tapeW * 0.038))}px monospace`;
    ctx.fillText(`▶ ${songTitle}`, labelX + 14, labelY + 44);

    ctx.font = '10.5px monospace';
    ctx.fillStyle = '#4b5563';
    ctx.fillText(artistTitle, labelX + 30, labelY + 60);
    ctx.restore();

    // 3. Center Transparent Window & Dual Spinning Tape Spools
    const winW = tapeW * 0.56;
    const winH = tapeH * 0.36;
    const winX = tapeX + (tapeW - winW) / 2;
    const winY = tapeY + tapeH * 0.44;

    ctx.save();
    ctx.fillStyle = '#08080a';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, winX, winY, winW, winH, 6);
    ctx.fill();
    ctx.stroke();

    // Real Magnetic Brown Tape Wrapping Between Reels
    const spoolR = winH * 0.38;
    const spool1X = winX + winW * 0.26;
    const spool2X = winX + winW * 0.74;
    const spoolY = winY + winH / 2;
    const spinAng = time * 3.2;

    // Dark brown tape mass
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(spool1X, spoolY, spoolR * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spool2X, spoolY, spoolR * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Dual 6-toothed white plastic spools
    [spool1X, spool2X].forEach(sx => {
      ctx.save();
      ctx.translate(sx, spoolY);
      ctx.rotate(spinAng);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, spoolR, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      ctx.fillStyle = '#0a0a0c';
      for (let g = 0; g < 6; g++) {
        const ang = (g * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * spoolR * 0.65, Math.sin(ang) * spoolR * 0.65, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, spoolR * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Center Tape Mechanical Counter
    const counterVal = Math.floor(time * 2).toString().padStart(3, '0');
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[ ${counterVal} ]`, winX + winW / 2, winY + winH / 2 + 4);
    ctx.restore();

    // 4. Analog Dual Needle VU Meters & Typography (Bottom)
    const textY = tapeY + tapeH + (isVertical ? 75 : 55);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `900 ${Math.min(38, Math.floor(width * 0.046))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(songTitle, width / 2, textY);

    ctx.font = `700 ${Math.min(18, Math.floor(width * 0.024))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.fillText(artistTitle, width / 2, textY + 34);
    ctx.restore();

    // Waveform
    const waveW = Math.min(width * 0.72, 480);
    const waveX = (width - waveW) / 2;
    const waveY = textY + 76;
    this.drawReactiveWaveform(ctx, waveX, waveY, waveW, 36, audio, primaryColor);

    ctx.restore();
  }

  // ============================================================================
  // 7. FROSTED GLASS CARD (APPLE MUSIC / iOS 18 LIQUID LUXURY)
  // ============================================================================
  private drawGlassCardLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const primaryColor = settings.primaryColor || '#38BDF8';
    const isVertical = height > width;

    ctx.save();

    // 1. Glass Container Dimensions
    const cardW = isVertical ? Math.min(width * 0.88, 440) : Math.min(width * 0.52, 460);
    const cardH = isVertical ? Math.min(height * 0.70, 560) : Math.min(height * 0.80, 500);
    const cardX = (width - cardW) / 2;
    const cardY = (height - cardH) / 2;

    // Ambient Colorful Halo behind card
    ctx.save();
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 50 * (1 + audio.kick * 0.3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.restore();

    // Frosted Deep Glass Body
    ctx.save();
    ctx.fillStyle = 'rgba(15, 18, 26, 0.86)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.stroke();

    // Top Glossy Bevel
    const glossGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + 80);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glossGrad;
    this.drawSafeRoundRect(ctx, cardX, cardY, cardW, cardH, 26);
    ctx.fill();
    ctx.restore();

    // 2. Cover Art with Squircle (iOS style)
    const pad = 24;
    const coverSize = Math.min(cardW - pad * 2, cardH * 0.50);
    const coverX = cardX + (cardW - coverSize) / 2;
    const coverY = cardY + pad;

    ctx.save();
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 18);
    ctx.clip();
    if (this.coverImage) {
      ctx.drawImage(this.coverImage, coverX, coverY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO COVER ART', coverX + coverSize / 2, coverY + coverSize / 2);
    }
    // Inner bevel stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    this.drawSafeRoundRect(ctx, coverX, coverY, coverSize, coverSize, 18);
    ctx.stroke();
    ctx.restore();

    // 3. Track Title, Artist & Lossless Audio Badge
    const infoY = coverY + coverSize + 26;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const trackTitle = (settings.trackTitle || 'UNTITLED TRACK').toUpperCase();
    const artistName = (settings.artistName || 'APPLE LOSSLESS').toUpperCase();

    ctx.font = '900 21px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(trackTitle, cardX + pad, infoY);

    ctx.font = '600 13.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = primaryColor;
    ctx.fillText(artistName, cardX + pad, infoY + 22);

    // Apple Lossless mini badge
    ctx.font = '700 8.5px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.letterSpacing = '1px';
    ctx.fillText('LOSSLESS  •  APPLE DIGITAL MASTER', cardX + pad, infoY + 40);
    ctx.restore();

    // 4. Liquid Timeline Scrubber with Timestamps
    const dur = audio.duration && audio.duration > 0 ? audio.duration : 180;
    const progress = Math.min(1.0, Math.max(0.0, audio.time / dur));
    const scrubX = cardX + pad;
    const scrubY = infoY + 65;
    const scrubW = cardW - pad * 2;

    ctx.save();
    // Track Line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    this.drawSafeRoundRect(ctx, scrubX, scrubY, scrubW, 5, 2.5);
    ctx.fill();

    // Active Bar
    ctx.fillStyle = primaryColor;
    this.drawSafeRoundRect(ctx, scrubX, scrubY, Math.max(5, scrubW * progress), 5, 2.5);
    ctx.fill();

    // Glowing Dot
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(scrubX + scrubW * progress, scrubY + 2.5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Time Indicators
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.formatTime(audio.time), scrubX, scrubY + 18);
    ctx.textAlign = 'right';
    ctx.fillText(this.formatTime(dur), scrubX + scrubW, scrubY + 18);
    ctx.restore();

    // 5. Mini Equalizer Spectrum Wave
    const waveY = scrubY + 38;
    this.drawReactiveWaveform(ctx, scrubX, waveY, scrubW, 26, audio, primaryColor);

    ctx.restore();
  }

  private drawDefaultLayout({ ctx, width, height, audio, settings }: RenderContext) {
    const selfDrawingModes = ['RADIAL', 'GLITCH', 'SPECTRUM', 'CIRCULAR_AURA_SPECTRUM', 'COVER_PULSE_3D', 'STUDIO_SPLIT_LYRICS'];
    if (this.coverImage && !selfDrawingModes.includes(settings.mode) && settings.mode !== 'SIMULATION') {
      ctx.save();
      const pulse = 1 + (audio.kick * 0.06 * settings.intensity);
      const baseScale = settings.coverScale || 1.0;
      const size = Math.min(width, height) * 0.28 * baseScale * pulse;
      const posX = (width * ((settings.coverX ?? 50) / 100)) - (size / 2);
      const posY = (height * ((settings.coverY ?? 40) / 100)) - (size / 2);

      // Glow & Shadow
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 25 * audio.energy;
      
      ctx.drawImage(this.coverImage, posX, posY, size, size);
      
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = 2 + (audio.kick * 3);
      ctx.strokeRect(posX, posY, size, size);
      ctx.restore();
    }

    // 2. ŞARKI VE SANATÇI ADI (Serbest Yerleşim & Gelişmiş Tipografi)
    this.drawCustomTrackTypography(ctx, width, height, audio, settings);
  }

  // ============================================================================
  // SERBEST YERLEŞİM & GELİŞMİŞ TİPOGRAFİ KATMANI (Custom Track Typography Layer)
  // ============================================================================
  private drawCustomTrackTypography(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioEvents, settings: VisualizerSettings) {
    const isVertical = height > width;
    const showTitle = settings.showTrackTitle !== false && !!settings.trackTitle;
    const showArtist = settings.showArtistName !== false && !!settings.artistName;

    if (!showTitle && !showArtist) return;

    const baseTitleSize = settings.titleFontSize ?? (isVertical ? 42 : 48);
    const baseArtistSize = settings.artistFontSize ?? (isVertical ? 22 : 26);

    const scaledTitleSize = Math.max(12, Math.round(baseTitleSize * (width >= 1920 ? 1.15 : 1.0)));
    const scaledArtistSize = Math.max(10, Math.round(baseArtistSize * (width >= 1920 ? 1.15 : 1.0)));

    // Koordinat Hesaplamaları (% 0 - 100)
    const titlePctX = settings.titleX ?? 50;
    const titlePctY = settings.titleY ?? (isVertical ? 76 : 80);
    const titlePosX = (titlePctX / 100) * width;
    const titlePosY = (titlePctY / 100) * height;

    const isIndependent = settings.titlePositionMode === 'independent';
    const artistPctX = isIndependent ? (settings.artistX ?? 50) : titlePctX;
    const artistPctY = isIndependent ? (settings.artistY ?? (isVertical ? 82 : 86)) : (titlePctY + (isVertical ? 5.5 : 5.0));
    const artistPosX = (artistPctX / 100) * width;
    const artistPosY = (artistPctY / 100) * height;

    // 1. ŞARKI ADI (Track Title)
    if (showTitle && settings.trackTitle) {
      ctx.save();
      const titleFamily = settings.titleFontFamily || 'Space Grotesk';
      const titleWeight = settings.titleFontWeight || '900';
      const titleItalic = settings.titleItalic ? 'italic ' : '';
      const titleAlign = settings.titleAlign || 'center';
      
      let titleText = settings.trackTitle;
      if (settings.titleCase === 'lowercase') titleText = titleText.toLowerCase();
      else if (settings.titleCase === 'normal') titleText = titleText;
      else titleText = titleText.toUpperCase(); // varsayılan uppercase

      ctx.font = `${titleItalic}${titleWeight} ${scaledTitleSize}px "${titleFamily}", sans-serif`;
      ctx.textAlign = titleAlign as CanvasTextAlign;
      ctx.textBaseline = 'middle';

      // Audio reactive titreşim / büyüme
      const pulseScale = settings.titleReactive !== false ? (1 + (audio.kick * 0.08 * (settings.intensity ?? 1.0))) : 1.0;
      
      ctx.translate(titlePosX, titlePosY);
      if (pulseScale !== 1.0) {
        ctx.scale(pulseScale, pulseScale);
      }

      // Harf aralığı (Letter Spacing)
      if ('letterSpacing' in ctx && typeof settings.titleLetterSpacing === 'number') {
        (ctx as any).letterSpacing = `${settings.titleLetterSpacing}px`;
      }

      const metrics = ctx.measureText(titleText);
      const textWidth = metrics.width;
      const textHeight = scaledTitleSize * 1.2;

      // Rozet / Arka Plan Kutusu (Badge Style)
      const badge = settings.titleBadgeStyle || 'NONE';
      if (badge !== 'NONE') {
        const padX = Math.max(18, scaledTitleSize * 0.5);
        const padY = Math.max(8, scaledTitleSize * 0.25);
        const boxW = textWidth + padX * 2;
        const boxH = textHeight + padY * 2;
        let boxX = -boxW / 2;
        if (titleAlign === 'left') boxX = -padX;
        if (titleAlign === 'right') boxX = -boxW + padX;
        const boxY = -boxH / 2;
        const radius = badge === 'PILL' ? boxH / 2 : 8;

        ctx.save();
        if (badge === 'GLASS') {
          ctx.fillStyle = 'rgba(10, 10, 14, 0.75)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1.5;
        } else if (badge === 'SOLID') {
          ctx.fillStyle = 'rgba(5, 5, 8, 0.95)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
        } else if (badge === 'NEON_BORDER') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.strokeStyle = settings.titleGlowColor || settings.primaryColor;
          ctx.lineWidth = 2;
          ctx.shadowColor = settings.titleGlowColor || settings.primaryColor;
          ctx.shadowBlur = 12 * (audio.energy || 0.5);
        } else if (badge === 'PILL') {
          ctx.fillStyle = 'rgba(18, 18, 24, 0.85)';
          ctx.strokeStyle = settings.primaryColor;
          ctx.lineWidth = 1.5;
        }
        this.drawSafeRoundRect(ctx, boxX, boxY, boxW, boxH, radius);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Neon Parlama & Yazı Rengi
      const glowAmt = settings.titleGlow ?? 0.4;
      const titleColor = settings.titleColor || '#FFFFFF';
      const glowColor = settings.titleGlowColor || titleColor;

      if (glowAmt > 0) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowAmt * 32 * (0.3 + (audio.energy || 0.5) * 0.7);
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = titleColor;
      ctx.fillText(titleText, 0, 0);
      ctx.restore();
    }

    // 2. SANATÇI ADI (Artist Name)
    if (showArtist && settings.artistName) {
      ctx.save();
      const artistFamily = settings.artistFontFamily || settings.titleFontFamily || 'Space Grotesk';
      const artistWeight = settings.artistFontWeight || 'bold';
      const artistItalic = settings.artistItalic ? 'italic ' : '';
      const artistAlign = settings.artistAlign || (isIndependent ? 'center' : (settings.titleAlign || 'center'));

      let artistText = settings.artistName;
      if (settings.artistCase === 'lowercase') artistText = artistText.toLowerCase();
      else if (settings.artistCase === 'normal') artistText = artistText;
      else artistText = artistText.toUpperCase();

      ctx.font = `${artistItalic}${artistWeight === '900' ? '900' : artistWeight === 'normal' ? '400' : '700'} ${scaledArtistSize}px "${artistFamily}", sans-serif`;
      ctx.textAlign = artistAlign as CanvasTextAlign;
      ctx.textBaseline = 'middle';

      const pulseScale = settings.artistReactive !== false ? (1 + (audio.kick * 0.05 * (settings.intensity ?? 1.0))) : 1.0;

      ctx.translate(artistPosX, artistPosY);
      if (pulseScale !== 1.0) {
        ctx.scale(pulseScale, pulseScale);
      }

      if ('letterSpacing' in ctx && typeof settings.artistLetterSpacing === 'number') {
        (ctx as any).letterSpacing = `${settings.artistLetterSpacing}px`;
      }

      const glowAmt = settings.artistGlow ?? 0.0;
      const artistColor = settings.artistColor || settings.primaryColor || '#FFD700';
      const glowColor = settings.artistGlowColor || artistColor;

      if (glowAmt > 0) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowAmt * 24 * (0.3 + (audio.energy || 0.5) * 0.7);
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = artistColor;
      ctx.fillText(artistText, 0, 0);
      ctx.restore();
    }
  }

  private drawLyricsLayer(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioEvents, settings: VisualizerSettings) {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;

    const syncOffset = settings.lyricsSyncOffset || 0;
    const effectiveTime = audio.time + syncOffset;

    let activeIdx = -1;
    let nextIdx = -1;
    
    activeIdx = settings.syncedLyrics.findIndex(
      line => effectiveTime >= line.startTime && effectiveTime <= line.endTime
    );

    nextIdx = settings.syncedLyrics.findIndex(l => l.startTime > effectiveTime);
    
    if (activeIdx === -1) {
      if (nextIdx !== -1) {
        activeIdx = Math.max(0, nextIdx - 1);
      } else {
        activeIdx = settings.syncedLyrics.length - 1;
      }
    }

    const activeLine = activeIdx !== -1 ? settings.syncedLyrics[activeIdx] : null;
    const style: LyricsStyle = settings.lyricsStyle || 'BETTER_FLOW';

    // In non-scrolling modes, if no line is currently actively sung, check for vocal gap countdown dots
    const isActivelySung = activeIdx !== -1 && activeLine && effectiveTime >= activeLine.startTime && effectiveTime <= activeLine.endTime;
    const isVocalGap = !isActivelySung && nextIdx !== -1 && settings.syncedLyrics[nextIdx] && (settings.syncedLyrics[nextIdx].startTime - effectiveTime <= 4.0) && (settings.syncedLyrics[nextIdx].startTime - effectiveTime >= 0.1);

    if (!activeLine && !isVocalGap && style !== 'APPLE_SCROLL' && style !== 'BETTER_FLOW') return;

    ctx.save();
    
    // 1. Precise Coordinate Placement (% or Preset)
    let lyricY: number;
    if (settings.lyricsY !== undefined) {
      lyricY = (settings.lyricsY / 100) * height;
    } else if (settings.lyricsPosition === 'TOP') {
      lyricY = height * 0.14;
    } else if (settings.lyricsPosition === 'CENTER') {
      lyricY = height * 0.50;
    } else if (settings.lyricsPosition === 'CUSTOM') {
      lyricY = (settings.lyricsY ?? 88) / 100 * height;
    } else {
      // Default: True BOTTOM alignment
      lyricY = height * 0.86;
    }

    let lyricX: number;
    if (settings.lyricsX !== undefined) {
      lyricX = (settings.lyricsX / 100) * width;
    } else {
      lyricX = width / 2;
    }

    const baseSize = settings.lyricsFontSize || 42;
    const fontFamily = settings.lyricsFontFamily ? `"${settings.lyricsFontFamily}", sans-serif` : '"Space Grotesk", sans-serif';
    const mainColor = settings.lyricsColor || settings.primaryColor || '#FFD700';
    const highlightColor = settings.lyricsHighlightColor || '#FFFFFF';
    const glowIntensity = settings.lyricsGlow ?? 22;
    const beatReactivity = settings.lyricsBeatReactive !== false ? (settings.lyricsBeatScale ?? 1.0) : 0;
    const align = settings.lyricsAlign || 'center';
    const showVocalDots = settings.lyricsShowVocalGapDots !== false;
    const blurInactive = Boolean(settings.lyricsBlurInactive);

    ctx.textAlign = align;
    ctx.textBaseline = 'middle';

    // === VOCAL GAP COUNTDOWN DOTS (Apple Music & BetterLyrics Signature •••) ===
    if (!activeLine && isVocalGap && showVocalDots && nextIdx !== -1) {
      const nextLine = settings.syncedLyrics[nextIdx];
      const remainingTime = nextLine.startTime - audio.time;
      const progress = Math.max(0, Math.min(1, 1 - (remainingTime / 3.0))); // 3s countdown
      const dotCount = 3;
      const dotSpacing = 28;
      const startDotX = lyricX - ((dotCount - 1) * dotSpacing) / 2;

      ctx.save();
      ctx.translate(startDotX, lyricY);
      for (let d = 0; d < dotCount; d++) {
        const dotThreshold = (d + 1) / (dotCount + 1);
        const isLit = progress >= dotThreshold;
        const dotScale = isLit ? 1.0 + (audio.kick * 0.25 * beatReactivity) : 0.7;
        const dx = d * dotSpacing;

        ctx.save();
        ctx.beginPath();
        ctx.arc(dx, 0, 7 * dotScale, 0, Math.PI * 2);
        if (isLit) {
          ctx.fillStyle = mainColor;
          if (glowIntensity > 0) {
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = glowIntensity * 1.5;
          }
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // === STYLE 1 & 2: BETTER_FLOW & APPLE_SCROLL (Multi-Line Spring Flow & Word Sweep) ===
    if (style === 'BETTER_FLOW' || style === 'APPLE_SCROLL') {
      const currentIdx = activeIdx !== -1 ? activeIdx : (
        nextIdx !== -1 ? Math.max(0, nextIdx - 1) : settings.syncedLyrics.length - 1
      );

      const lineCount = settings.lyricsLineCount || 3;
      const lineSpacing = baseSize * 1.45;
      const inactiveOpacity = settings.lyricsInactiveOpacity ?? 0.32;

      ctx.translate(lyricX, lyricY);

      // Önceki Satırlar (Previous Lines)
      if (lineCount >= 5 && currentIdx > 1) {
        ctx.save();
        if (blurInactive && typeof (ctx as any).filter !== 'undefined') (ctx as any).filter = 'blur(3px)';
        ctx.font = `600 ${baseSize * 0.62}px ${fontFamily}`;
        ctx.fillStyle = `rgba(255, 255, 255, ${inactiveOpacity * 0.45})`;
        ctx.fillText(settings.syncedLyrics[currentIdx - 2].text, 0, -lineSpacing * 2);
        ctx.restore();
      }
      if (currentIdx > 0) {
        ctx.save();
        if (blurInactive && typeof (ctx as any).filter !== 'undefined') (ctx as any).filter = 'blur(1.5px)';
        ctx.font = `700 ${baseSize * 0.76}px ${fontFamily}`;
        ctx.fillStyle = `rgba(255, 255, 255, ${inactiveOpacity})`;
        ctx.fillText(settings.syncedLyrics[currentIdx - 1].text, 0, -lineSpacing);
        ctx.restore();
      }

      // Aktif Satır (Active Line - BetterLyrics Fluid Word Sweep & Long-Note Glow)
      if (settings.syncedLyrics[currentIdx]) {
        const curLine = settings.syncedLyrics[currentIdx];
        const isCurrentTimeActive = activeIdx === currentIdx;
        const kickScale = isCurrentTimeActive ? (1 + (audio.kick * 0.09 * beatReactivity * settings.intensity)) : 1.0;
        
        ctx.save();
        ctx.scale(kickScale, kickScale);

        // Eğer kelime bazlı zamanlama varsa ve BETTER_FLOW modundaysa: Akıllı Degrade Kelime Doldurma
        if (style === 'BETTER_FLOW' && curLine.words && curLine.words.length > 0 && isCurrentTimeActive) {
          ctx.font = `900 ${baseSize}px ${fontFamily}`;
          const words = curLine.words;
          const wordMetrics = words.map(w => {
            const wText = w.word + " ";
            const wWidth = ctx.measureText(wText).width;
            const wDur = Math.max(0.1, w.endTime - w.startTime);
            const wProgress = Math.max(0, Math.min(1, (effectiveTime - w.startTime) / wDur));
            const isWordActive = effectiveTime >= w.startTime && effectiveTime <= w.endTime;
            const isWordPast = effectiveTime > w.endTime;
            const isLongNote = wDur >= 0.75 && isWordActive;

            return {
              word: w.word,
              fullText: wText,
              width: wWidth,
              progress: isWordPast ? 1.0 : (isWordActive ? wProgress : 0.0),
              isActive: isWordActive,
              isPast: isWordPast,
              isLongNote,
              wDur
            };
          });

          const totalLineW = wordMetrics.reduce((acc, w) => acc + w.width, 0);
          let cursorX = align === 'center' ? -totalLineW / 2 : (align === 'left' ? 0 : -totalLineW);

          ctx.textAlign = 'left';
          wordMetrics.forEach(wItem => {
            // Long Note Sustained Glow (Apple Music / BetterLyrics Signature)
            if (wItem.isLongNote && settings.lyricsLongNoteGlow !== false) {
              ctx.save();
              ctx.fillStyle = mainColor;
              ctx.shadowColor = mainColor;
              ctx.shadowBlur = (glowIntensity + 15) * (1 + audio.energy * 0.8);
              ctx.fillText(wItem.word, cursorX, -audio.kick * 3 * beatReactivity);
              ctx.restore();
            }

            if (wItem.isActive) {
              // Aktif kelime: Sol-sağ dolum geçişi
              ctx.save();
              const grad = ctx.createLinearGradient(cursorX, 0, cursorX + wItem.width, 0);
              const p = Math.max(0.01, Math.min(0.99, wItem.progress));
              grad.addColorStop(0, mainColor);
              grad.addColorStop(p, mainColor);
              grad.addColorStop(Math.min(1, p + 0.05), 'rgba(255, 255, 255, 0.45)');
              grad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');

              ctx.fillStyle = grad;
              if (glowIntensity > 0) {
                ctx.shadowColor = mainColor;
                ctx.shadowBlur = glowIntensity * (1 + audio.energy * 0.6);
              }
              ctx.fillText(wItem.word, cursorX, -audio.kick * 3 * beatReactivity);
              ctx.restore();
            } else if (wItem.isPast) {
              ctx.save();
              ctx.fillStyle = mainColor;
              ctx.shadowBlur = 0;
              ctx.fillText(wItem.word, cursorX, 0);
              ctx.restore();
            } else {
              ctx.save();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
              ctx.shadowBlur = 0;
              ctx.fillText(wItem.word, cursorX, 0);
              ctx.restore();
            }

            cursorX += wItem.width;
          });
        } else {
          // Klasik Satır Dolumu
          ctx.font = `900 ${baseSize}px ${fontFamily}`;
          ctx.fillStyle = isCurrentTimeActive ? mainColor : '#FFFFFF';
          if (glowIntensity > 0 && isCurrentTimeActive) {
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = glowIntensity * (1 + audio.energy * 0.5);
          }
          ctx.fillText(curLine.text, 0, 0);
        }

        // Varsa İkincil Çeviri / Romanizasyon Satırı
        if (settings.lyricsTranslationEnabled && curLine.translation) {
          ctx.save();
          ctx.font = `500 ${baseSize * 0.48}px ${fontFamily}`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.shadowBlur = 0;
          ctx.fillText(curLine.translation, 0, baseSize * 0.75);
          ctx.restore();
        }

        ctx.restore();
      }

      // Sonraki Satırlar (Next Lines)
      if (currentIdx < settings.syncedLyrics.length - 1) {
        ctx.save();
        if (blurInactive && typeof (ctx as any).filter !== 'undefined') (ctx as any).filter = 'blur(1.5px)';
        ctx.font = `700 ${baseSize * 0.76}px ${fontFamily}`;
        ctx.fillStyle = `rgba(255, 255, 255, ${inactiveOpacity})`;
        ctx.fillText(settings.syncedLyrics[currentIdx + 1].text, 0, lineSpacing);
        ctx.restore();
      }
      if (lineCount >= 5 && currentIdx < settings.syncedLyrics.length - 2) {
        ctx.save();
        if (blurInactive && typeof (ctx as any).filter !== 'undefined') (ctx as any).filter = 'blur(3px)';
        ctx.font = `600 ${baseSize * 0.62}px ${fontFamily}`;
        ctx.fillStyle = `rgba(255, 255, 255, ${inactiveOpacity * 0.45})`;
        ctx.fillText(settings.syncedLyrics[currentIdx + 2].text, 0, lineSpacing * 2);
        ctx.restore();
      }

    // === SINGLE LINE STYLES ===
    } else if (activeLine) {
      ctx.translate(lyricX, lyricY);

      if (style === 'KINETIC') {
        const scale = 1 + (audio.kick * 0.20 * (beatReactivity || 1.0) * settings.intensity);
        ctx.scale(scale, scale);
        ctx.font = `900 ${baseSize}px ${fontFamily}`;
        ctx.fillStyle = mainColor;
        if (glowIntensity > 0) {
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = glowIntensity * audio.energy;
        }
        ctx.fillText(activeLine.text.toUpperCase(), 0, 0);

      } else if (style === 'KARAOKE') {
        ctx.font = `800 ${baseSize * 0.9}px ${fontFamily}`;
        const words = activeLine.words && activeLine.words.length > 0
          ? activeLine.words
          : activeLine.text.split(' ').map((w, idx, arr) => {
              const span = (activeLine.endTime - activeLine.startTime) / arr.length;
              return {
                word: w,
                startTime: activeLine.startTime + (idx * span),
                endTime: activeLine.startTime + ((idx + 1) * span)
              };
            });

        const wordMetrics = words.map(w => {
          const upperWord = w.word.toUpperCase();
          const wWidth = ctx.measureText(upperWord + " ").width;
          const wDur = Math.max(0.1, w.endTime - w.startTime);
          const wProgress = Math.max(0, Math.min(1, (audio.time - w.startTime) / wDur));
          const isActive = audio.time >= w.startTime && audio.time <= w.endTime;
          const isPast = audio.time > w.endTime;
          return {
            word: upperWord,
            wWidth,
            progress: isPast ? 1.0 : (isActive ? wProgress : 0.0),
            isActive,
            isPast,
            isLongNote: wDur >= 0.75 && isActive
          };
        });

        const totalW = wordMetrics.reduce((acc, curr) => acc + curr.wWidth, 0);
        let currentX = align === 'center' ? -totalW / 2 : (align === 'left' ? 0 : -totalW);

        ctx.textAlign = 'left';
        wordMetrics.forEach(item => {
          if (item.isLongNote && settings.lyricsLongNoteGlow !== false) {
            ctx.save();
            ctx.fillStyle = mainColor;
            ctx.shadowColor = mainColor;
            ctx.shadowBlur = (glowIntensity + 16) * (1 + audio.energy * 0.8);
            ctx.fillText(item.word, currentX, -audio.kick * 4 * beatReactivity);
            ctx.restore();
          }

          if (item.isActive) {
            ctx.save();
            // Sürekli degrade dolgu
            const grad = ctx.createLinearGradient(currentX, 0, currentX + item.wWidth, 0);
            const p = Math.max(0.01, Math.min(0.99, item.progress));
            grad.addColorStop(0, mainColor);
            grad.addColorStop(p, mainColor);
            grad.addColorStop(Math.min(1, p + 0.05), 'rgba(255, 255, 255, 0.4)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.4)');

            ctx.fillStyle = grad;
            if (glowIntensity > 0) {
              ctx.shadowColor = mainColor;
              ctx.shadowBlur = glowIntensity * 1.3;
            }
            ctx.fillText(item.word, currentX, -audio.kick * 4 * beatReactivity);
            ctx.restore();
          } else if (item.isPast) {
            ctx.fillStyle = mainColor;
            ctx.shadowBlur = 0;
            ctx.fillText(item.word, currentX, 0);
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${settings.lyricsInactiveOpacity ?? 0.38})`;
            ctx.shadowBlur = 0;
            ctx.fillText(item.word, currentX, 0);
          }
          currentX += item.wWidth;
        });

      } else if (style === 'SUBTITLE') {
        ctx.font = `700 ${baseSize * 0.8}px ${fontFamily}`;
        const textMetrics = ctx.measureText(activeLine.text);
        const boxPadX = 24;
        const boxPadY = 14;

        ctx.fillStyle = 'rgba(10, 10, 14, 0.84)';
        this.drawSafeRoundRect(
          ctx,
          -textMetrics.width / 2 - boxPadX, 
          -baseSize / 2 - boxPadY, 
          textMetrics.width + (boxPadX * 2), 
          baseSize + (boxPadY * 2),
          12
        );
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        this.drawSafeRoundRect(
          ctx,
          -textMetrics.width / 2 - boxPadX, 
          -baseSize / 2 - boxPadY, 
          textMetrics.width + (boxPadX * 2), 
          baseSize + (boxPadY * 2),
          12
        );
        ctx.stroke();

        ctx.fillStyle = highlightColor;
        ctx.shadowBlur = 0;
        ctx.fillText(activeLine.text, 0, 0);

      } else if (style === 'NEON_BOX') {
        ctx.font = `900 ${baseSize * 0.85}px ${fontFamily}`;
        const textMetrics = ctx.measureText(activeLine.text.toUpperCase());
        const boxPadX = 28;
        const boxPadY = 16;
        const boxW = textMetrics.width + (boxPadX * 2);
        const boxH = baseSize + (boxPadY * 2);

        ctx.fillStyle = 'rgba(8, 8, 12, 0.92)';
        this.drawSafeRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 14);
        ctx.fill();

        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2 + (audio.kick * 2 * beatReactivity);
        if (glowIntensity > 0) {
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = glowIntensity * (1 + audio.energy);
        }
        this.drawSafeRoundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 14);
        ctx.stroke();

        ctx.fillStyle = mainColor;
        ctx.fillText(activeLine.text.toUpperCase(), 0, 0);

      } else if (style === 'CYBER_GLITCH') {
        ctx.font = `900 ${baseSize}px monospace`;
        const glitchOffset = (Math.random() - 0.5) * 10 * audio.energy * (beatReactivity || 1.0);
        
        ctx.fillStyle = '#00F0FF';
        ctx.fillText(activeLine.text.toUpperCase(), -glitchOffset - 3, 0);
        
        ctx.fillStyle = '#FF003C';
        ctx.fillText(activeLine.text.toUpperCase(), glitchOffset + 3, 0);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(activeLine.text.toUpperCase(), 0, 0);

      } else if (style === 'MINIMAL') {
        ctx.font = `700 ${baseSize}px ${fontFamily}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 12;
        ctx.fillText(activeLine.text, 0, 0);
      }
    }

    ctx.restore();
  }
}


