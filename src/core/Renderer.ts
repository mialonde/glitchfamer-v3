import { AudioEvents, RenderContext, IVisualizer, VisualizerSettings, UserInteractionState } from '../types';

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
  
  // Modüler Visualizer Kaydı
  private visualizerRegistry: Map<string, IVisualizer> = new Map();
  
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

  // Tüm görsel modları sisteme kaydediyoruz
  private initRegistry() {
    const mods: IVisualizer[] = [
      new SimulationVisualizer(),
      new MonolithVisualizer(),
      new NoirGridVisualizer(),
      new ChaosVisualizer(),
      new RadialVisualizer(),
      new PhonkWaveVisualizer(),
      new EsotericVisualizer(),
      new EtherVisualizer(),
      new GlitchVisualizer(),
      new SpectrumVisualizer(),
      new KineticTypoVisualizer(),
      new NeonTunnelVisualizer(),
      new QuantumFieldVisualizer(),
      new AudioFluidVisualizer(),
      new CodropsPolarVisualizer(),
      new CodropsWaveVisualizer(),
      new CodropsBarsVisualizer(),
      new CavaSpectrumVisualizer(),
      new LissajousOrbitVisualizer(),
      new PopcornPhysicsVisualizer(),
      new VortexNebulaVisualizer(),
      new CyberMatrixVisualizer(),
      new VissonanceRingVisualizer(),
      new VissonanceOctagonVisualizer(),
      new VissonanceSpectrumVisualizer(),
      new ParticleSphere3DVisualizer(),
      new FluidMetaballVisualizer(),
      new SynthwaveGrid3DVisualizer(),
      new KineticTypoGlitchVisualizer(),
      new CircularAuraSpectrumVisualizer(),
      new LiquidMercuryHumanVisualizer(),
      new NeonHydroHumanVisualizer(),
      new NoirSingingHeadVisualizer(),
      new ObjFaceVisualizer(),
      new VrmAnimeHybridVisualizer()
    ];
    mods.forEach(mod => this.visualizerRegistry.set(mod.name.toUpperCase(), mod));
  }

  public setLogoImage(img: HTMLImageElement | null) { this.logoImage = img; }
  public setCoverImage(img: HTMLImageElement | null) { this.coverImage = img; }
  public setBgVideo(video: HTMLVideoElement | null) { this.bgVideo = video; }
  public setBgImage(img: HTMLImageElement | null) { this.bgImage = img; }
  public setInteraction(interaction: UserInteractionState | null) { this.interaction = interaction; }

  // 🚀 ANA RENDER DÖNGÜSÜ (PIPELINE)
  public render(audio: AudioEvents, settings: VisualizerSettings) {
    const { width, height } = this.canvas;
    
    // 0. TEMİZLİK (Her frame'de ekranı simsiyah yap)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);

    // Jitter & Camera Shake
    const jitter = settings.jitter ?? 0;
    const displacement = settings.displacement ?? 0;
    const shakeAmount = (jitter * 25 + (audio.kick > 0.8 ? displacement * 15 : 0));
    const shakeX = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0;
    const shakeY = shakeAmount > 0 ? (Math.random() - 0.5) * shakeAmount : 0;

    this.ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      this.ctx.translate(shakeX, shakeY);
    }

    // Context objesini diğer fonksiyonlara paslamak için hazırlıyoruz
    const context: RenderContext = {
      ctx: this.ctx, width, height, audio, settings,
      logoImage: this.logoImage, coverImage: this.coverImage,
      bgVideo: this.bgVideo, bgImage: this.bgImage,
      interaction: this.interaction || undefined
    };

    // --- KATMAN 0.1: ARKA PLAN GÖRSELİ (CUSTOM WALLPAPER / BACKGROUND PHOTO) ---
    this.drawImageBackground(context);

    // --- KATMAN 0.2: ARKA PLAN VİDEOSU (EUPHORIC / CINEMATIC VIDEO LAYER) ---
    this.drawVideoBackground(context);

    // --- KATMAN 1: GLOBAL ARKA PLAN (Zemin Efektleri: Izgara, Sis, Yıldız Tozu) ---
    this.drawBackgroundLayer(context);

    // --- KATMAN 2: CORE EQ (Sadece 'NONE' modunda çalışsın) ---
    if (settings.mode === 'NONE') {
      this.drawCoreEQ(context);
    }

    // --- KATMAN 3: FANTEZİ MODU (Kullanıcı seçtiyse) ---
    if (settings.mode !== 'NONE' && this.visualizerRegistry.has(settings.mode)) {
      const activeMod = this.visualizerRegistry.get(settings.mode)!;
      activeMod.update(audio, settings);
      activeMod.render(context);
    }

    // --- KATMAN 4: FX & YIKIM (RGB Split, Vignette, Scanlines, Bloom, Grain, Strobe, Glitch, etc.) ---
    this.applyFXLayer(context);

    // --- KATMAN 5: BİLGİ VE BİLDİRİM (Tipografi, Lirikler, Logo) ---
    this.drawOverlays(context);

    this.ctx.restore();
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
    if (settings.rgbSplitEnabled !== false && settings.rgbSplit > 0.01) {
      const splitAmount = (settings.rgbSplit * 18) + (audio.beat ? audio.kick * 12 : 0);
      if (splitAmount > 0.5) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = Math.min(0.45, settings.rgbSplit * 0.7 + (audio.kick * 0.2));
        
        // Red channel offset
        ctx.fillStyle = '#FF003C';
        ctx.fillRect(-splitAmount, 0, width, height);
        
        // Cyan channel offset
        ctx.fillStyle = '#00F0FF';
        ctx.fillRect(splitAmount, 0, width, height);
        ctx.restore();
      }
    }

    // 2. CRT Scanlines
    if (settings.scanLinesEnabled !== false && settings.scanLines > 0.02) {
      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = settings.scanLines * 0.35;
      const step = 4;
      for (let y = 0; y < height; y += step * 2) {
        ctx.fillRect(0, y, width, step);
      }
      ctx.restore();
    }

    // 3. Cinematic Vignette
    if (settings.vignetteEnabled !== false && settings.vignette > 0.02) {
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.25,
        width / 2, height / 2, width * 0.72
      );
      const vAlpha = Math.min(0.9, settings.vignette * 0.85 + (audio.kick * 0.15));
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
      bloomGrad.addColorStop(0, `rgba(255, 215, 0, ${bloomAlpha})`);
      bloomGrad.addColorStop(0.5, `rgba(255, 255, 255, ${bloomAlpha * 0.3})`);
      bloomGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bloomGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 5. Film Grain / 35mm Analog Noise
    if (settings.filmGrainEnabled && (settings.filmGrain ?? 0.3) > 0.02) {
      ctx.save();
      const grainIntensity = (settings.filmGrain ?? 0.3) * 0.12;
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = grainIntensity;
      const grainCount = Math.floor(width * height * 0.00015 * (settings.filmGrain ?? 0.3));
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        const gSize = Math.random() < 0.2 ? 2 : 1;
        ctx.fillRect(gx, gy, gSize, gSize);
      }
      ctx.restore();
    }

    // 6. Bass Strobe / Flash (Euphoric Party Lights)
    if (settings.strobeEnabled && audio.kick > 0.75) {
      ctx.save();
      const flashAlpha = Math.min(0.6, (settings.strobe ?? 0.4) * (audio.kick - 0.4) * 1.5);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = flashAlpha;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 7. Glitch Slice Displacement (Yatay Dijital Bant Kayması)
    if (settings.glitchSliceEnabled && (audio.beat || audio.snare > 0.5)) {
      ctx.save();
      const sliceCount = Math.floor(1 + Math.random() * 4 * (settings.glitchSlice ?? 0.5));
      ctx.globalCompositeOperation = 'difference';
      ctx.fillStyle = settings.primaryColor;
      for (let i = 0; i < sliceCount; i++) {
        const sliceY = Math.random() * height;
        const sliceH = 2 + Math.random() * 12;
        const sliceShift = (Math.random() - 0.5) * 40 * (settings.glitchSlice ?? 0.5);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(sliceShift, sliceY, width, sliceH);
      }
      ctx.restore();
    }

    // 8. Edge Glow / Neon Çerçeve Pulsasyonu
    if (settings.edgeGlowEnabled && (settings.edgeGlow ?? 0.5) > 0.02) {
      ctx.save();
      const edgeAlpha = Math.min(0.8, (settings.edgeGlow ?? 0.5) * (0.3 + audio.kick * 0.6));
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = 4 + audio.kick * 8;
      ctx.globalAlpha = edgeAlpha;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * audio.energy;
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();
    }
  }

  private drawOverlays({ ctx, width, height, audio, settings }: RenderContext) {
    // 1. Kapak Fotoğrafı (Eğer fantezi modları kendi çizmiyorsa)
    const selfDrawingModes = ['RADIAL', 'GLITCH', 'SPECTRUM'];
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

    // 2. ŞARKI VE SANATÇI ADI (Brütalist Tipografi)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const bottomPadding = height * 0.16; 
    
    if (settings.trackTitle) {
      const fontSize = Math.min(54, Math.floor(width * 0.045));
      ctx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 18 * audio.energy;
      ctx.shadowColor = '#FFFFFF';
      ctx.fillText(settings.trackTitle.toUpperCase(), width / 2, height - bottomPadding - 45);
    }

    if (settings.artistName) {
      const fontSize = Math.min(32, Math.floor(width * 0.028));
      ctx.font = `800 ${fontSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = settings.primaryColor;
      ctx.shadowBlur = 0;
      ctx.fillText(settings.artistName.toUpperCase(), width / 2, height - bottomPadding);
    }
    ctx.restore();

    // 3. Kinetik Lirikler (Magic Sync & Çeşitli Tipografi Modları)
    if (settings.lyricsEnabled !== false && settings.syncedLyrics && settings.syncedLyrics.length > 0 && settings.mode !== 'KINETIC') {
      this.drawLyricsLayer(ctx, width, height, audio, settings);
    }

    // 4. Logo / Watermark (Sağ alt veya sol üst)
    if (this.logoImage) {
      ctx.save();
      const logoSize = Math.min(70, Math.floor(width * 0.06));
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.logoImage, width - logoSize - 30, height - logoSize - 30, logoSize, logoSize);
      ctx.restore();
    }
  }

  private drawLyricsLayer(ctx: CanvasRenderingContext2D, width: number, height: number, audio: AudioEvents, settings: VisualizerSettings) {
    const activeLine = settings.syncedLyrics.find(
      line => audio.time >= line.startTime && audio.time <= line.endTime
    );

    if (!activeLine) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Konumlandırma (TOP, CENTER, BOTTOM)
    let lyricY = height * 0.72;
    if (settings.lyricsPosition === 'TOP') lyricY = height * 0.22;
    if (settings.lyricsPosition === 'CENTER') lyricY = height * 0.50;

    const baseSize = settings.lyricsFontSize || 42;
    const style = settings.lyricsStyle || 'KINETIC';
    const mainColor = settings.lyricsColor || settings.primaryColor || '#FFD700';

    ctx.translate(width / 2, lyricY);

    if (style === 'KINETIC') {
      // Dinamik Büyüyen Vuruşlu Kinetik Tipografi
      const scale = 1 + (audio.kick * 0.18 * settings.intensity);
      ctx.scale(scale, scale);

      ctx.font = `900 ${baseSize}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = mainColor;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 20 * audio.energy;
      ctx.fillText(activeLine.text.toUpperCase(), 0, 0);

    } else if (style === 'KARAOKE') {
      // Kelime Kelime Parlayan Karaoke Efekti
      ctx.font = `800 ${baseSize * 0.9}px "Space Grotesk", sans-serif`;
      
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

      // Kelimelerin toplam genişliğini hesapla ve ortala
      const wordMetrics = words.map(w => {
        const upperWord = w.word.toUpperCase();
        return {
          word: upperWord,
          wWidth: ctx.measureText(upperWord + " ").width,
          isActive: audio.time >= w.startTime && audio.time <= w.endTime,
          isPast: audio.time > w.endTime
        };
      });

      const totalW = wordMetrics.reduce((acc, curr) => acc + curr.wWidth, 0);
      let currentX = -totalW / 2;

      ctx.textAlign = 'left';
      wordMetrics.forEach(item => {
        if (item.isActive) {
          ctx.fillStyle = mainColor;
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = 25;
          ctx.fillText(item.word.toUpperCase(), currentX, -audio.kick * 4);
        } else if (item.isPast) {
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 0;
          ctx.fillText(item.word.toUpperCase(), currentX, 0);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 0;
          ctx.fillText(item.word.toUpperCase(), currentX, 0);
        }
        currentX += item.wWidth;
      });

    } else if (style === 'SUBTITLE') {
      // Sinematik Şeffaf Arka Plan Kutulu Altyazı
      ctx.font = `700 ${baseSize * 0.8}px "Space Grotesk", sans-serif`;
      const textMetrics = ctx.measureText(activeLine.text);
      const boxPadX = 24;
      const boxPadY = 14;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(
        -textMetrics.width / 2 - boxPadX, 
        -baseSize / 2 - boxPadY, 
        textMetrics.width + (boxPadX * 2), 
        baseSize + (boxPadY * 2)
      );

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        -textMetrics.width / 2 - boxPadX, 
        -baseSize / 2 - boxPadY, 
        textMetrics.width + (boxPadX * 2), 
        baseSize + (boxPadY * 2)
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.fillText(activeLine.text, 0, 0);

    } else if (style === 'NEON_BOX') {
      // Neon Çerçeveli Retro Rozet
      ctx.font = `900 ${baseSize * 0.85}px "Space Grotesk", sans-serif`;
      const textMetrics = ctx.measureText(activeLine.text.toUpperCase());
      const boxPadX = 30;
      const boxPadY = 16;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
      ctx.fillRect(
        -textMetrics.width / 2 - boxPadX, 
        -baseSize / 2 - boxPadY, 
        textMetrics.width + (boxPadX * 2), 
        baseSize + (boxPadY * 2)
      );

      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2 + audio.kick * 3;
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 18 * audio.energy;
      ctx.strokeRect(
        -textMetrics.width / 2 - boxPadX, 
        -baseSize / 2 - boxPadY, 
        textMetrics.width + (boxPadX * 2), 
        baseSize + (boxPadY * 2)
      );

      ctx.fillStyle = mainColor;
      ctx.fillText(activeLine.text.toUpperCase(), 0, 0);

    } else if (style === 'CYBER_GLITCH') {
      // Cyberpunk Glitch Karakter Kayması
      ctx.font = `900 ${baseSize}px monospace`;
      const glitchOffset = (Math.random() - 0.5) * 8 * audio.energy;
      
      // Cyan gölge
      ctx.fillStyle = '#00F0FF';
      ctx.fillText(activeLine.text.toUpperCase(), -glitchOffset - 3, 0);
      
      // Red gölge
      ctx.fillStyle = '#FF003C';
      ctx.fillText(activeLine.text.toUpperCase(), glitchOffset + 3, 0);
      
      // Ana Metin
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(activeLine.text.toUpperCase(), 0, 0);
    }

    ctx.restore();
  }
}


