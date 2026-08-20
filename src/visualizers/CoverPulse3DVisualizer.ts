import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface Shard3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  size: number;
  type: 'shard' | 'ember' | 'diamond';
  colorType: 'primary' | 'secondary' | 'white' | 'gold';
  alpha: number;
}

interface ExtractedPalette {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  bgDark: string;
}

export class CoverPulse3DVisualizer implements IVisualizer {
  public name = 'COVER_PULSE_3D';

  // Animation & Physics State
  private time = 0;
  private rotationX = -0.05;
  private rotationY = 0.22;
  private targetRotX = -0.05;
  private targetRotY = 0.22;
  private floatY = 0;
  private pulseScale = 1.0;
  private bassImpact = 0;
  private snareFlash = 0;
  private sheenOffset = -1.5;

  // Particle System
  private shards: Shard3D[] = [];
  private maxShards = 70;

  // Extracted Palette Cache
  private lastCoverSrc: string | null = null;
  private extractedPalette: ExtractedPalette | null = null;

  // Spectrum Smoothing Buffers
  private smoothLeftSpec: number[] = new Array(36).fill(0);
  private smoothRightSpec: number[] = new Array(36).fill(0);
  private peakLeftSpec: number[] = new Array(36).fill(0);
  private peakRightSpec: number[] = new Array(36).fill(0);

  constructor() {
    this.initShards();
  }

  private initShards() {
    this.shards = Array.from({ length: this.maxShards }, () => this.createShard());
  }

  private createShard(): Shard3D {
    return {
      x: (Math.random() - 0.5) * 1400,
      y: (Math.random() - 0.5) * 800 - 100,
      z: Math.random() * 800 - 200,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.5 - Math.random() * 1.2,
      vz: (Math.random() - 0.5) * 0.6,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.04,
      vRotY: (Math.random() - 0.5) * 0.04,
      vRotZ: (Math.random() - 0.5) * 0.04,
      size: 4 + Math.random() * 14,
      type: Math.random() > 0.6 ? 'diamond' : Math.random() > 0.4 ? 'shard' : 'ember',
      colorType: Math.random() > 0.5 ? 'primary' : Math.random() > 0.2 ? 'secondary' : 'gold',
      alpha: 0.3 + Math.random() * 0.6
    };
  }

  /**
   * Kapak görselinden dominant ve vurgulu renk paletini otomatik çıkartır
   */
  private extractPaletteFromImage(image: HTMLImageElement | null, defaultPrimary: string, defaultSecondary: string): ExtractedPalette {
    if (!image || !image.complete || image.naturalWidth === 0) {
      return {
        primary: defaultPrimary || '#FF2A6D',
        secondary: defaultSecondary || '#05D9E8',
        accent: '#FF0055',
        glow: 'rgba(255, 42, 109, 0.4)',
        bgDark: '#0a020c'
      };
    }

    try {
      const srcKey = image.src || 'cover_default';
      if (this.lastCoverSrc === srcKey && this.extractedPalette) {
        return this.extractedPalette;
      }

      // 32x32 offscreen mini canvas ile renk analizi
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 32;
      sampleCanvas.height = 32;
      const sCtx = sampleCanvas.getContext('2d');
      if (!sCtx) throw new Error('No 2d context');

      sCtx.drawImage(image, 0, 0, 32, 32);
      const imgData = sCtx.getImageData(0, 0, 32, 32).data;

      let rSum = 0, gSum = 0, bSum = 0;
      let maxVibrancy = -1;
      let vibrantR = 255, vibrantG = 42, vibrantB = 109;

      let darkR = 10, darkG = 2, darkB = 12;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        rSum += r;
        gSum += g;
        bSum += b;

        // Renk doygunluğu ve parlaklık ölçümü
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        const sat = max === 0 ? 0 : delta / max;
        const brightness = max / 255;

        // En canlı / neon pigmenti yakala
        const vibrancy = sat * 1.5 + (brightness > 0.3 && brightness < 0.9 ? 1.0 : 0.2);
        if (vibrancy > maxVibrancy && sat > 0.35) {
          maxVibrancy = vibrancy;
          vibrantR = r;
          vibrantG = g;
          vibrantB = b;
        }
      }

      const count = imgData.length / 4;
      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);

      const primaryHex = `#${((1 << 24) + (vibrantR << 16) + (vibrantG << 8) + vibrantB).toString(16).slice(1)}`;
      
      // Tamamlayıcı / kontrast ikincil renk türet (Hue shift + 40-60 deg)
      const secR = Math.min(255, Math.max(0, Math.round(vibrantB * 0.8 + 30)));
      const secG = Math.min(255, Math.max(0, Math.round(vibrantR * 0.3 + vibrantG * 0.7)));
      const secB = Math.min(255, Math.max(0, Math.round(vibrantR * 0.9 + 40)));
      const secondaryHex = `#${((1 << 24) + (secR << 16) + (secG << 8) + secB).toString(16).slice(1)}`;

      darkR = Math.min(20, Math.round(avgR * 0.1));
      darkG = Math.min(20, Math.round(avgG * 0.1));
      darkB = Math.min(26, Math.round(avgB * 0.15 + 4));
      const bgDarkHex = `#${((1 << 24) + (darkR << 16) + (darkG << 8) + darkB).toString(16).slice(1)}`;

      this.lastCoverSrc = srcKey;
      this.extractedPalette = {
        primary: primaryHex,
        secondary: secondaryHex,
        accent: '#FFD700',
        glow: `rgba(${vibrantR}, ${vibrantG}, ${vibrantB}, 0.5)`,
        bgDark: bgDarkHex
      };

      return this.extractedPalette;
    } catch (_) {
      return {
        primary: defaultPrimary || '#FF2A6D',
        secondary: defaultSecondary || '#05D9E8',
        accent: '#FF0055',
        glow: 'rgba(255, 42, 109, 0.4)',
        bgDark: '#0a020c'
      };
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const snare = audio.snare ?? audio.midEnergy ?? 0;
    const hihat = audio.hihat ?? audio.trebleEnergy ?? 0;
    const speed = (settings.visSpeed ?? 1.0);

    this.time += 0.016 * speed;

    // Ritmik 3D Salınım ve İnertia
    const swayAngleY = Math.sin(this.time * 0.8) * 0.18 + Math.cos(this.time * 0.3) * 0.08;
    const swayAngleX = Math.cos(this.time * 0.6) * 0.05 - 0.03;
    
    this.rotationY += (this.targetRotY + swayAngleY - this.rotationY) * 0.1;
    this.rotationX += (this.targetRotX + swayAngleX - this.rotationX) * 0.1;

    // Y Ekseni Yüzen Hareket (Floating Bobbing)
    this.floatY = Math.sin(this.time * 1.5) * 14 - (bass * 22);

    // Kick / Bass Darbesi & Ölçek Nabzı
    const targetScale = 1.0 + bass * 0.18 * (settings.visBeatSensitivity ?? 1.0);
    this.pulseScale += (targetScale - this.pulseScale) * 0.25;

    this.bassImpact = bass;
    this.snareFlash += (snare - this.snareFlash) * 0.3;

    // Specular Cam Işık Geçişi
    this.sheenOffset += 0.025 * speed + snare * 0.08;
    if (this.sheenOffset > 2.5) {
      this.sheenOffset = -2.0;
    }

    // Spectrum smoothing
    const spec = audio.spectrum;
    const numBars = this.smoothLeftSpec.length;
    const specLen = spec.length;

    for (let i = 0; i < numBars; i++) {
      const norm = i / numBars;
      // Logarithmic index selection for balanced low-to-high spectrum
      const specIdx = Math.min(specLen - 1, Math.floor(Math.pow(norm, 1.6) * (specLen * 0.75)));
      const rawVal = spec[specIdx] || 0;

      // Left and Right channels with subtle independent variance
      const valL = rawVal * (1.0 + Math.sin(this.time * 2 + i) * 0.08);
      const valR = rawVal * (1.0 + Math.cos(this.time * 2 + i) * 0.08);

      this.smoothLeftSpec[i] += (valL - this.smoothLeftSpec[i]) * 0.35;
      this.smoothRightSpec[i] += (valR - this.smoothRightSpec[i]) * 0.35;

      if (this.smoothLeftSpec[i] > this.peakLeftSpec[i]) {
        this.peakLeftSpec[i] = this.smoothLeftSpec[i];
      } else {
        this.peakLeftSpec[i] -= 0.015;
      }

      if (this.smoothRightSpec[i] > this.peakRightSpec[i]) {
        this.peakRightSpec[i] = this.smoothRightSpec[i];
      } else {
        this.peakRightSpec[i] -= 0.015;
      }
    }

    // Update Shards
    for (const shard of this.shards) {
      shard.x += shard.vx * (1 + bass * 2);
      shard.y += shard.vy * (1 + hihat * 1.5);
      shard.z += shard.vz;
      shard.rotX += shard.vRotX;
      shard.rotY += shard.vRotY;
      shard.rotZ += shard.vRotZ;

      // Wrap around bounds
      if (shard.y < -500) {
        shard.y = 450;
        shard.x = (Math.random() - 0.5) * 1400;
        shard.z = Math.random() * 800 - 200;
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, coverImage, interaction } = context;
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const mid = audio.midEnergy ?? audio.snare ?? 0;
    const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
    const glow = settings.visGlow ?? 0.85;
    const currentTime = audio.time || 0;
    const duration = audio.duration || 180;

    // User Interactive Orbit Tilt
    if (interaction?.isPointerDown) {
      this.targetRotY = (interaction.rotationY || 0) * 1.2 + 0.2;
      this.targetRotX = (interaction.rotationX || 0) * 0.8 - 0.05;
    }

    // Style Mode Variant (0: Cyber Pedestal / Ring, 1: Wet Reflective Horizon Box, 2: Holographic Vinyl Slice)
    const styleMode = Math.abs((interaction?.styleVariant ?? 0) % 3);

    // 1. Kapaktan Renk Çıkarımı
    const pal = this.extractPaletteFromImage(coverImage, settings.primaryColor, settings.secondaryColor);

    const centerX = width / 2;
    const centerY = height * 0.44; // Alt kısımdaki player için kapağı biraz yukarı ortala
    const minDim = Math.min(width, height);
    const boxSize = minDim * 0.38 * (settings.visScale ?? 1.0) * this.pulseScale;
    const boxDepth = boxSize * (styleMode === 1 ? 0.28 : 0.16); // 3D Kutu Kalınlığı / Omurga

    const floorY = centerY + (boxSize * 0.65) + 30;

    ctx.save();

    // ==========================================
    // 🌌 2. ATMOSPHERIC BACKGROUND & AMBIENT NEBULA
    // ==========================================
    const bgGrad = ctx.createRadialGradient(
      centerX, centerY - 50, 50,
      centerX, centerY + 100, Math.max(width, height) * 0.8
    );
    bgGrad.addColorStop(0, `${pal.primary}26`); // %15-20 renkli merkez parıltısı
    bgGrad.addColorStop(0.4, `${pal.secondary}14`);
    bgGrad.addColorStop(0.75, pal.bgDark);
    bgGrad.addColorStop(1, '#020005');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Üst ve Alt Vignette Karartması
    const vigGrad = ctx.createLinearGradient(0, 0, 0, height);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
    vigGrad.addColorStop(0.3, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // ⚡ 3. FLANKING AUDIO SPECTRUM WAVES (Left & Right)
    // ==========================================
    this.renderFlankingSpectrum(ctx, width, height, centerY, boxSize, pal, bass, mid, treble, glow, styleMode);

    // ==========================================
    // 💎 4. 3D FLOATING PARTICLES & CRYSTAL SHARDS (Background layer)
    // ==========================================
    this.renderShards(ctx, centerX, centerY, pal, glow, false);

    // ==========================================
    // ⭕ 5. NEON PEDESTAL / HORIZON FLOOR RINGS
    // ==========================================
    this.renderPedestalAndGround(ctx, centerX, floorY, boxSize, pal, bass, mid, glow, styleMode);

    // ==========================================
    // 🪞 6. WET FLOOR REFLECTION OF 3D COVER
    // ==========================================
    this.renderCoverReflection(ctx, centerX, centerY, floorY, boxSize, boxDepth, coverImage, pal, bass, styleMode);

    // ==========================================
    // 📦 7. 3D ALBUM COVER CENTERPIECE (Main Box)
    // ==========================================
    this.render3DCoverBox(ctx, centerX, centerY + this.floatY, boxSize, boxDepth, coverImage, pal, settings, bass, snareFlashVal(this.snareFlash), styleMode);

    // ==========================================
    // ✨ 8. FOREGROUND FLOATING EMBERS & SPARKLES
    // ==========================================
    this.renderShards(ctx, centerX, centerY, pal, glow, true);

    // ==========================================
    // 🎵 9. INTEGRATED SPOTIFY / YOUTUBE PLAYER BAR UI
    // ==========================================
    this.renderPlayerBar(ctx, width, height, settings, pal, currentTime, duration, bass, glow);

    ctx.restore();
  }

  /**
   * Sol ve Sağ Simetrik / Logaritmik Frekans EQ Dalgası Çizimi
   */
  private renderFlankingSpectrum(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerY: number,
    boxSize: number,
    pal: ExtractedPalette,
    bass: number,
    mid: number,
    treble: number,
    glow: number,
    styleMode: number
  ) {
    const numBars = this.smoothLeftSpec.length;
    const margin = boxSize * 0.75;
    const availableWidth = (width / 2) - margin - 40;
    if (availableWidth <= 20) return;

    const barWidth = Math.max(3, Math.min(10, availableWidth / numBars * 0.65));
    const step = availableWidth / numBars;
    const maxBarHeight = height * 0.28 * (1 + bass * 0.4);

    ctx.save();

    // 1. SOL SPEKTRUM BARI
    for (let i = 0; i < numBars; i++) {
      const val = this.smoothLeftSpec[i];
      const peakVal = this.peakLeftSpec[i];
      const barH = Math.max(4, val * maxBarHeight);
      const peakH = Math.max(6, peakVal * maxBarHeight);

      // Merkezden dışa doğru yerleşim
      const x = (width / 2) - margin - (i * step) - barWidth;
      const y1 = centerY - (barH / 2);
      const y2 = centerY + (barH / 2);

      // Neon Gradyan
      const grad = ctx.createLinearGradient(0, y1, 0, y2);
      grad.addColorStop(0, pal.primary);
      grad.addColorStop(0.5, pal.secondary);
      grad.addColorStop(1, pal.primary);

      ctx.fillStyle = grad;
      ctx.beginPath();
      roundRect(ctx, x, y1, barWidth, barH, barWidth / 2);
      ctx.fill();

      // Peak Capsule / Dot
      if (peakVal > 0.08) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, centerY - (peakH / 2) - 3, Math.max(1.5, barWidth * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      // Güçlü baslarda dikey laser ışık huzmesi
      if (i < 8 && val > 0.55 && glow > 0.2) {
        const beamGrad = ctx.createLinearGradient(0, y1, 0, y1 - 180);
        beamGrad.addColorStop(0, `${pal.primary}55`);
        beamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(x - 1, y1 - 180, barWidth + 2, 180);
      }
    }

    // 2. SAĞ SPEKTRUM BARI
    for (let i = 0; i < numBars; i++) {
      const val = this.smoothRightSpec[i];
      const peakVal = this.peakRightSpec[i];
      const barH = Math.max(4, val * maxBarHeight);
      const peakH = Math.max(6, peakVal * maxBarHeight);

      const x = (width / 2) + margin + (i * step);
      const y1 = centerY - (barH / 2);
      const y2 = centerY + (barH / 2);

      const grad = ctx.createLinearGradient(0, y1, 0, y2);
      grad.addColorStop(0, pal.primary);
      grad.addColorStop(0.5, pal.secondary);
      grad.addColorStop(1, pal.primary);

      ctx.fillStyle = grad;
      ctx.beginPath();
      roundRect(ctx, x, y1, barWidth, barH, barWidth / 2);
      ctx.fill();

      if (peakVal > 0.08) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, centerY - (peakH / 2) - 3, Math.max(1.5, barWidth * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }

      if (i < 8 && val > 0.55 && glow > 0.2) {
        const beamGrad = ctx.createLinearGradient(0, y1, 0, y1 - 180);
        beamGrad.addColorStop(0, `${pal.primary}55`);
        beamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(x - 1, y1 - 180, barWidth + 2, 180);
      }
    }

    ctx.restore();
  }

  /**
   * 3D Yüzen Kristal Parçacıkları ve Kıvılcımlar (Depth-sorted Particles)
   */
  private renderShards(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    pal: ExtractedPalette,
    glow: number,
    foregroundOnly: boolean
  ) {
    ctx.save();
    for (const shard of this.shards) {
      const isFore = shard.z > 0;
      if (foregroundOnly && !isFore) continue;
      if (!foregroundOnly && isFore) continue;

      // 3D Perspective Projection
      const fov = 600;
      const scale = fov / (fov + shard.z);
      const screenX = centerX + shard.x * scale;
      const screenY = centerY + shard.y * scale;
      const size = shard.size * scale;

      if (screenX < -50 || screenX > ctx.canvas.width + 50 || screenY < -50 || screenY > ctx.canvas.height + 50) {
        continue;
      }

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(shard.rotZ);

      const col = shard.colorType === 'primary' ? pal.primary : shard.colorType === 'secondary' ? pal.secondary : '#FFD700';

      ctx.globalAlpha = shard.alpha * (isFore ? 0.9 : 0.4);

      if (shard.type === 'diamond') {
        // Elmas / Kristal Parça
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.7, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.7, 0);
        ctx.closePath();

        const shardGrad = ctx.createLinearGradient(-size, -size, size, size);
        shardGrad.addColorStop(0, '#FFFFFF');
        shardGrad.addColorStop(0.5, col);
        shardGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = shardGrad;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF88';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (shard.type === 'shard') {
        // Üçgen Kırık Cam
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, -size * 0.8);
        ctx.lineTo(size * 0.8, -size * 0.2);
        ctx.lineTo(0, size * 0.9);
        ctx.closePath();

        ctx.fillStyle = `${col}AA`;
        ctx.fill();
        ctx.strokeStyle = `${col}FF`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Işıltılı Neon Kor / Bokeh Noktası
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1.5, size * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Zemin Neon Halkası / Cyber Pedestal ve Islak Yansıma Zemin Izgarası
   */
  private renderPedestalAndGround(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    floorY: number,
    boxSize: number,
    pal: ExtractedPalette,
    bass: number,
    mid: number,
    glow: number,
    styleMode: number
  ) {
    ctx.save();

    // 1. Zemin Islak Yüzey Gradyanı
    const floorGrad = ctx.createLinearGradient(0, floorY - 50, 0, ctx.canvas.height);
    floorGrad.addColorStop(0, 'rgba(10, 2, 14, 0.4)');
    floorGrad.addColorStop(0.2, 'rgba(5, 1, 8, 0.8)');
    floorGrad.addColorStop(1, '#020004');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY - 50, ctx.canvas.width, ctx.canvas.height - (floorY - 50));

    // 2. Dairesel Neon Pedestal (Reference Image 1)
    const ringRadiusX = boxSize * (0.85 + bass * 0.15);
    const ringRadiusY = ringRadiusX * 0.28; // Perspektif basıklığı

    // Dış Neon Çember
    ctx.beginPath();
    ctx.ellipse(centerX, floorY, ringRadiusX, ringRadiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = Math.max(2, 3.5 * (1 + bass * 0.5));
    if (glow > 0.1) {
      ctx.shadowColor = pal.primary;
      ctx.shadowBlur = 24 * glow * (1 + bass);
    }
    ctx.stroke();

    // İç İkincil Çember
    ctx.beginPath();
    ctx.ellipse(centerX, floorY, ringRadiusX * 0.72, ringRadiusY * 0.72, 0, 0, Math.PI * 2);
    ctx.strokeStyle = pal.secondary;
    ctx.lineWidth = 2;
    if (glow > 0.1) {
      ctx.shadowColor = pal.secondary;
      ctx.shadowBlur = 14 * glow;
    }
    ctx.stroke();

    // Zemin Altı Radyal Işık Havuzu (Glow Pool)
    const poolGrad = ctx.createRadialGradient(centerX, floorY, 10, centerX, floorY, ringRadiusX * 1.5);
    poolGrad.addColorStop(0, `${pal.primary}55`);
    poolGrad.addColorStop(0.4, `${pal.secondary}22`);
    poolGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = poolGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, floorY, ringRadiusX * 1.4, ringRadiusY * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Islak Zemindeki 3D Kapak ve Işık Yansıması
   */
  private renderCoverReflection(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    floorY: number,
    boxSize: number,
    boxDepth: number,
    coverImage: HTMLImageElement | null,
    pal: ExtractedPalette,
    bass: number,
    styleMode: number
  ) {
    if (!coverImage) return;

    ctx.save();
    const reflectY = floorY + 4;
    const reflectHeight = boxSize * 0.65;

    ctx.beginPath();
    ctx.rect(centerX - boxSize, reflectY, boxSize * 2, reflectHeight);
    ctx.clip();

    ctx.save();
    ctx.translate(centerX, reflectY);
    ctx.scale(1, -0.6); // Dikey aynalama ve perspektif kısalması
    ctx.translate(-centerX, -reflectY);

    ctx.globalAlpha = 0.35 + bass * 0.15;
    this.render3DCoverBox(ctx, centerX, reflectY + (boxSize * 0.5), boxSize, boxDepth, coverImage, pal, {} as any, 0, 0, styleMode, true);
    ctx.restore();

    // Yansıma Kararma / Sönümleme Katmanı (Fade Gradient)
    const fadeGrad = ctx.createLinearGradient(0, reflectY, 0, reflectY + reflectHeight);
    fadeGrad.addColorStop(0, 'rgba(0,0,0,0.1)');
    fadeGrad.addColorStop(0.7, 'rgba(2,0,5,0.8)');
    fadeGrad.addColorStop(1, '#020005');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(centerX - boxSize, reflectY, boxSize * 2, reflectHeight);

    ctx.restore();
  }

  /**
   * Merkezdeki 3D Albüm Kapağı & CD/Jewel Box Geometrisi
   */
  private render3DCoverBox(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
    depth: number,
    coverImage: HTMLImageElement | null,
    pal: ExtractedPalette,
    settings: VisualizerSettings,
    bass: number,
    snareFlashVal: number,
    styleMode: number,
    isReflection = false
  ) {
    ctx.save();
    ctx.translate(centerX, centerY);

    const halfS = size / 2;
    const cosY = Math.cos(this.rotationY);
    const sinY = Math.sin(this.rotationY);
    const cosX = Math.cos(this.rotationX);
    const sinX = Math.sin(this.rotationX);

    // 3D Köşe Koordinatları (Ön Yüz)
    // P0: Sol-Üst, P1: Sağ-Üst, P2: Sağ-Alt, P3: Sol-Alt
    const project = (x: number, y: number, z: number) => {
      // Rotate Y
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      // Rotate X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 800;
      const pScale = fov / (fov + z2);
      return { x: x1 * pScale, y: y2 * pScale, z: z2 };
    };

    // Ön Yüz (Front Face)
    const fTL = project(-halfS, -halfS, 0);
    const fTR = project(halfS, -halfS, 0);
    const fBR = project(halfS, halfS, 0);
    const fBL = project(-halfS, halfS, 0);

    // Arka / Yan Omurga (Back / Spine Face)
    const bTL = project(-halfS, -halfS, -depth);
    const bTR = project(halfS, -halfS, -depth);
    const bBR = project(halfS, halfS, -depth);
    const bBL = project(-halfS, halfS, -depth);

    // ==========================================
    // A. 3D YAN OMURGA / DERİNLİK YÜZEYİ (Side Spine Face)
    // ==========================================
    if (sinY > 0) {
      // Sağ taraf / omurga görünüyor
      ctx.beginPath();
      ctx.moveTo(fTR.x, fTR.y);
      ctx.lineTo(bTR.x, bTR.y);
      ctx.lineTo(bBR.x, bBR.y);
      ctx.lineTo(fBR.x, fBR.y);
      ctx.closePath();

      const spineGrad = ctx.createLinearGradient(fTR.x, fTR.y, bTR.x, bTR.y);
      spineGrad.addColorStop(0, '#15151e');
      spineGrad.addColorStop(1, '#09090f');
      ctx.fillStyle = spineGrad;
      ctx.fill();

      // Omurga Neon Kontur Çizgisi
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Omurga üzerindeki Şarkı / Albüm Adı (Reference 2: "22NOIR GECE")
      if (!isReflection && depth > 20) {
        ctx.save();
        const midX = (fTR.x + bTR.x + fBR.x + bBR.x) / 4;
        const midY = (fTR.y + bTR.y + fBR.y + bBR.y) / 4;
        ctx.translate(midX, midY);
        ctx.rotate(Math.PI / 2 + this.rotationX);
        ctx.fillStyle = '#FFFFFFCC';
        ctx.font = `900 ${Math.max(8, depth * 0.35)}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const titleText = (settings?.trackTitle || "Demo Song").toUpperCase();
        ctx.fillText(titleText.slice(0, 18), 0, 0);
        ctx.restore();
      }
    } else {
      // Sol omurga görünüyor
      ctx.beginPath();
      ctx.moveTo(fTL.x, fTL.y);
      ctx.lineTo(bTL.x, bTL.y);
      ctx.lineTo(bBL.x, bBL.y);
      ctx.lineTo(fBL.x, fBL.y);
      ctx.closePath();

      const spineGrad = ctx.createLinearGradient(fTL.x, fTL.y, bTL.x, bTL.y);
      spineGrad.addColorStop(0, '#15151e');
      spineGrad.addColorStop(1, '#09090f');
      ctx.fillStyle = spineGrad;
      ctx.fill();

      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ==========================================
    // B. 3D ÜST / ALT KENAR YÜZEYİ (Top / Bottom Depth Face)
    // ==========================================
    if (sinX < 0) {
      // Üst yüzey görünüyor
      ctx.beginPath();
      ctx.moveTo(fTL.x, fTL.y);
      ctx.lineTo(fTR.x, fTR.y);
      ctx.lineTo(bTR.x, bTR.y);
      ctx.lineTo(bTL.x, bTL.y);
      ctx.closePath();
      ctx.fillStyle = '#222230';
      ctx.fill();
      ctx.strokeStyle = `${pal.secondary}88`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ==========================================
    // C. 3D ÖN KAPAK YÜZEYİ (Front Cover Art)
    // ==========================================
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fTL.x, fTL.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(fBR.x, fBR.y);
    ctx.lineTo(fBL.x, fBL.y);
    ctx.closePath();
    ctx.clip();

    if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
      // 2D affine transform ile 3D quadrilateral çizimi
      drawTransformedImage(ctx, coverImage, fTL, fTR, fBR, fBL);
    } else {
      // Kapak yoksa Prosedürel Şık Dark Vinyl / Single Kapak Grafiği
      const placeholderGrad = ctx.createLinearGradient(fTL.x, fTL.y, fBR.x, fBR.y);
      placeholderGrad.addColorStop(0, '#14031a');
      placeholderGrad.addColorStop(0.5, '#2b0736');
      placeholderGrad.addColorStop(1, '#0a010d');
      ctx.fillStyle = placeholderGrad;
      ctx.fill();

      // Merkez Monogram / Logo
      ctx.fillStyle = pal.primary;
      ctx.font = `900 ${size * 0.35}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = settings?.trackTitle ? settings.trackTitle.charAt(0).toUpperCase() : '22';
      ctx.fillText(initial, (fTL.x + fBR.x) / 2, (fTL.y + fBR.y) / 2);
    }

    // Specular Cam / Parlak Jelatin Işıltısı (Cellophane / Glossy Sheen)
    const sheenGrad = ctx.createLinearGradient(
      fTL.x + (fTR.x - fTL.x) * this.sheenOffset,
      fTL.y,
      fTR.x + (fTR.x - fTL.x) * (this.sheenOffset + 0.6),
      fBR.y
    );
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
    sheenGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.35 + snareFlashVal * 0.4})`);
    sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.08)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sheenGrad;
    ctx.fillRect(-size, -size, size * 2, size * 2);

    // Parental Advisory Rozeti (Sağ Alt Köşe)
    if (!isReflection && size > 140) {
      const badgeW = size * 0.22;
      const badgeH = badgeW * 0.55;
      const bx = fBR.x - badgeW - 8;
      const by = fBR.y - badgeH - 8;

      ctx.fillStyle = '#000000DD';
      ctx.fillRect(bx, by, badgeW, badgeH);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, badgeW, badgeH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${badgeH * 0.32}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("PARENTAL", bx + badgeW / 2, by + badgeH * 0.32);
      ctx.font = `bold ${badgeH * 0.28}px "Space Grotesk", sans-serif`;
      ctx.fillText("ADVISORY", bx + badgeW / 2, by + badgeH * 0.7);
    }

    ctx.restore();

    // ==========================================
    // D. 3D ÖN ÇERÇEVE NEON KONTURU (Neon Rims)
    // ==========================================
    ctx.beginPath();
    ctx.moveTo(fTL.x, fTL.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(fBR.x, fBR.y);
    ctx.lineTo(fBL.x, fBL.y);
    ctx.closePath();

    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = Math.max(1.8, 3.0 * (1 + bass * 0.4));
    if (settings?.visGlow ?? 0.8 > 0.1) {
      ctx.shadowColor = pal.primary;
      ctx.shadowBlur = 18 * (settings?.visGlow ?? 0.8) * (1 + bass * 0.5);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /**
   * Alt Kısımda Spotify / YouTube Release Visual Müzik Çalar Arayüzü (Player Bar)
   */
  private renderPlayerBar(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    settings: VisualizerSettings,
    pal: ExtractedPalette,
    currentTime: number,
    duration: number,
    bass: number,
    glow: number
  ) {
    const isMobile = width < 600 || height > width;
    const barWidth = Math.min(width * 0.88, 640);
    const barX = (width - barWidth) / 2;
    const barY = height * 0.86;

    ctx.save();

    // 1. Şarkı ve Sanatçı Adı (Player Bar Üstü)
    const title = settings?.trackTitle || 'Demo Song';
    const artist = settings?.artistName || 'Demo Singer';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Şarkı Adı
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `900 ${isMobile ? 14 : 18}px "Space Grotesk", sans-serif`;
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 8 * glow;
    ctx.fillText(title, width / 2, barY - 32);

    ctx.shadowBlur = 0;

    // 2. Timeline Zaman Göstergeleri (01:24 ve 03:17)
    const curMin = Math.floor(currentTime / 60);
    const curSec = Math.floor(currentTime % 60);
    const totalMin = Math.floor(duration / 60);
    const totalSec = Math.floor(duration % 60);
    const curStr = `${curMin.toString().padStart(2, '0')}:${curSec.toString().padStart(2, '0')}`;
    const totalStr = `${totalMin.toString().padStart(2, '0')}:${totalSec.toString().padStart(2, '0')}`;

    ctx.fillStyle = '#FFFFFF99';
    ctx.font = `bold ${isMobile ? 10 : 12}px "Space Grotesk", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(curStr, barX, barY);

    ctx.textAlign = 'right';
    ctx.fillText(totalStr, barX + barWidth, barY);

    // 3. İlerleme Çubuğu (Progress Scrubber)
    const trackStartX = barX + (isMobile ? 42 : 55);
    const trackEndX = barX + barWidth - (isMobile ? 42 : 55);
    const trackWidth = trackEndX - trackStartX;
    const progress = duration > 0 ? Math.min(1.0, Math.max(0, currentTime / duration)) : 0.42;

    // Arka Plan İlerleme İzi (Track Track)
    ctx.beginPath();
    ctx.moveTo(trackStartX, barY);
    ctx.lineTo(trackEndX, barY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Doldurulmuş İlerleme Çubuğu (Filled Progress with Neon Gradient)
    const filledEndX = trackStartX + (trackWidth * progress);
    if (filledEndX > trackStartX) {
      const progGrad = ctx.createLinearGradient(trackStartX, 0, filledEndX, 0);
      progGrad.addColorStop(0, pal.secondary);
      progGrad.addColorStop(1, pal.primary);

      ctx.beginPath();
      ctx.moveTo(trackStartX, barY);
      ctx.lineTo(filledEndX, barY);
      ctx.strokeStyle = progGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Parlayan İlerleme Noktası (Thumb Knob)
      ctx.beginPath();
      ctx.arc(filledEndX, barY, 6 + bass * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = pal.primary;
      ctx.shadowBlur = 12 * glow;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Oynatma Kontrol İkonları (Shuffle, Prev, Play Button, Next, Repeat)
    const controlsY = barY + 36;
    const buttonSpacing = isMobile ? 36 : 48;

    // Play / Pause Büyük Buton
    ctx.beginPath();
    ctx.arc(width / 2, controlsY, 18 + bass * 3, 0, Math.PI * 2);
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 15 * glow;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Play Üçgen İkonu
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    const iconSize = 8;
    ctx.moveTo(width / 2 - iconSize * 0.6, controlsY - iconSize);
    ctx.lineTo(width / 2 + iconSize, controlsY);
    ctx.lineTo(width / 2 - iconSize * 0.6, controlsY + iconSize);
    ctx.closePath();
    ctx.fill();

    // Prev İkonu (|◀)
    drawMediaIcon(ctx, width / 2 - buttonSpacing, controlsY, 'prev', pal.primary);

    // Next İkonu (▶|)
    drawMediaIcon(ctx, width / 2 + buttonSpacing, controlsY, 'next', pal.primary);

    // Shuffle İkonu (🔀)
    drawMediaIcon(ctx, width / 2 - buttonSpacing * 2, controlsY, 'shuffle', '#FFFFFF88');

    // Repeat İkonu (🔁)
    drawMediaIcon(ctx, width / 2 + buttonSpacing * 2, controlsY, 'repeat', '#FFFFFF88');

    ctx.restore();
  }
}

/**
 * Snare / Flash şiddeti yardımcı fonksiyonu
 */
function snareFlashVal(val: number): number {
  return Math.min(1.0, Math.max(0, val));
}

/**
 * Yuvarlatılmış dikdörtgen path çizici
 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 2D Canvas üzerinde 3D Dörtgen Görüntü Dönüşümü (Affine Mapping)
 */
function drawTransformedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
) {
  // İki üçgene bölerek doku haritalama
  drawTriangle(ctx, img, 0, 0, img.naturalWidth, 0, 0, img.naturalHeight, p0, p1, p3);
  drawTriangle(ctx, img, img.naturalWidth, 0, img.naturalWidth, img.naturalHeight, 0, img.naturalHeight, p1, p2, p3);
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  im: HTMLImageElement,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  d0: { x: number; y: number },
  d1: { x: number; y: number },
  d2: { x: number; y: number }
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  const delta = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  if (Math.abs(delta) < 0.0001) {
    ctx.restore();
    return;
  }

  const delta_a = d0.x * (y1 - y2) + d1.x * (y2 - y0) + d2.x * (y0 - y1);
  const delta_b = x0 * (d1.x - d2.x) + x1 * (d2.x - d0.x) + x2 * (d0.x - d1.x);
  const delta_c = x0 * (y1 * d2.x - y2 * d1.x) + x1 * (y2 * d0.x - y0 * d2.x) + x2 * (y0 * d1.x - y1 * d0.x);
  const delta_d = d0.y * (y1 - y2) + d1.y * (y2 - y0) + d2.y * (y0 - y1);
  const delta_e = x0 * (d1.y - d2.y) + x1 * (d2.y - d0.y) + x2 * (d0.y - d1.y);
  const delta_f = x0 * (y1 * d2.y - y2 * d1.y) + x1 * (y2 * d0.y - y0 * d2.y) + x2 * (y0 * d1.y - y1 * d0.y);

  ctx.transform(delta_a / delta, delta_d / delta, delta_b / delta, delta_e / delta, delta_c / delta, delta_f / delta);
  ctx.drawImage(im, 0, 0);
  ctx.restore();
}

/**
 * Vektörel Medya İkonları Çizici
 */
function drawMediaIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'prev' | 'next' | 'shuffle' | 'repeat',
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = 6;
  if (type === 'prev') {
    ctx.beginPath();
    ctx.moveTo(s * 0.8, -s);
    ctx.lineTo(-s * 0.4, 0);
    ctx.lineTo(s * 0.8, s);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s * 0.8, -s);
    ctx.lineTo(-s * 0.8, s);
    ctx.stroke();
  } else if (type === 'next') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, -s);
    ctx.lineTo(s * 0.4, 0);
    ctx.lineTo(-s * 0.8, s);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s * 0.8, -s);
    ctx.lineTo(s * 0.8, s);
    ctx.stroke();
  } else if (type === 'shuffle') {
    ctx.beginPath();
    ctx.moveTo(-s, -s * 0.7);
    ctx.lineTo(0, s * 0.7);
    ctx.lineTo(s, s * 0.7);
    ctx.moveTo(-s, s * 0.7);
    ctx.lineTo(0, -s * 0.7);
    ctx.lineTo(s, -s * 0.7);
    ctx.stroke();
  } else if (type === 'repeat') {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.4, -s * 0.9);
    ctx.lineTo(s * 0.9, -s * 0.6);
    ctx.lineTo(s * 0.4, -s * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
