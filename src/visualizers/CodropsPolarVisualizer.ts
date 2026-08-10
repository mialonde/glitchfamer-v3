import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface Shockwave {
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export class CodropsPolarVisualizer implements IVisualizer {
  public name = 'CODROPS_POLAR';
  private rotation = 0;
  private shockwaves: Shockwave[] = [];
  private lastBeatTime = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.012 * speed;
    this.rotation += rotSpeed;

    const beatSens = settings.visBeatSensitivity ?? 1.0;

    // Spawn expanding shockwave on strong bass kick
    if (audio.beat && audio.kick > 0.45 * (2 - beatSens) && (audio.time - this.lastBeatTime) > 0.15) {
      this.lastBeatTime = audio.time;
      this.shockwaves.push({
        radius: 60 * (settings.visScale ?? 1.0),
        maxRadius: 650 * (settings.visScale ?? 1.0),
        alpha: 0.85,
        speed: (8 + audio.kick * 14) * speed
      });
    }

    // Update existing shockwaves
    this.shockwaves.forEach(sw => {
      sw.radius += sw.speed;
      sw.alpha = Math.max(0, 0.85 * (1 - sw.radius / sw.maxRadius));
    });

    this.shockwaves = this.shockwaves.filter(sw => sw.alpha > 0.01 && sw.radius < sw.maxRadius);
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.22 * (settings.visScale ?? 1.0);
    const glow = settings.visGlow ?? 0.5;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const numPoints = Math.floor(64 * density);

    ctx.save();
    ctx.translate(centerX, centerY);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 18 * glow * (1 + kickBoost);
    }

    // 1. Render Expanding Shockwaves
    this.shockwaves.forEach(sw => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = Math.max(1, 2.5 * (1 - sw.radius / sw.maxRadius));
      ctx.globalAlpha = sw.alpha;
      ctx.stroke();
      ctx.restore();
    });

    // 2. Render Dynamic Polar Line Ring
    ctx.save();
    ctx.rotate(this.rotation);

    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const specIdx = Math.floor((i % numPoints) / numPoints * audio.spectrum.length);
      const specVal = audio.spectrum[specIdx] || 0;

      const rOffset = specVal * 160 * (settings.visScale ?? 1.0) * (1 + kickBoost * 0.8);
      const r = baseRadius + rOffset;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Line Ring Stroke & Glow Fill
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = Math.max(1.5, 3.5 * (1 + kickBoost * 0.5));
    ctx.globalAlpha = Math.min(1.0, 0.85 + kickBoost * 0.15);
    ctx.stroke();

    ctx.fillStyle = `${settings.primaryColor}15`;
    ctx.fill();

    // 3. Inner Radial Vertex Nodes
    for (let i = 0; i < numPoints; i += 2) {
      const angle = (i / numPoints) * Math.PI * 2;
      const specIdx = Math.floor(i / numPoints * audio.spectrum.length);
      const specVal = audio.spectrum[specIdx] || 0;
      const r = baseRadius + specVal * 160 * (settings.visScale ?? 1.0) * (1 + kickBoost * 0.8);

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      ctx.fillStyle = settings.secondaryColor;
      ctx.globalAlpha = Math.min(1.0, 0.4 + specVal * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, 3.5 * (specVal + 0.2)), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }
}
