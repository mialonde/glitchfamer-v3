import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface RingParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

export class VissonanceRingVisualizer implements IVisualizer {
  public name = 'VISSONANCE_RING';
  private rotation = 0;
  private particles: RingParticle[] = [];

  constructor() {
    this.particles = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 120 + Math.random() * 320,
      speed: 0.005 + Math.random() * 0.015,
      size: 2 + Math.random() * 4
    }));
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.012 * speed;
    this.rotation += rotSpeed;

    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    this.particles.forEach(p => {
      p.angle += (p.speed + kickBoost * 0.01) * speed;
    });
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const ringCount = Math.floor(4 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * glow * (1 + kickBoost);
    }

    // 1. Concentric Vissonance Rings with Vertex Normal Displacement
    for (let r = 0; r < ringCount; r++) {
      const baseRadius = (100 + r * 75) * scale;
      const points = 72;
      const color = r % 2 === 0 ? settings.primaryColor : settings.secondaryColor;

      ctx.save();
      ctx.beginPath();

      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const specIdx = Math.floor((i % points) / points * audio.spectrum.length);
        const specVal = audio.spectrum[specIdx] || 0;

        // Vertices normal displacement
        const displacement = specVal * 140 * scale * (1 + kickBoost * 0.6) * Math.sin(angle * 6 + this.rotation * 2);
        const currentRadius = baseRadius + displacement;

        const x = Math.cos(angle) * currentRadius;
        const y = Math.sin(angle) * currentRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, (3 - r * 0.4) * scale * (1 + kickBoost * 0.4));
      ctx.globalAlpha = Math.min(1.0, (0.9 - r * 0.15) * (1 + audio.energy * 0.2));
      ctx.stroke();

      if (r === 0) {
        ctx.fillStyle = `${settings.primaryColor}18`;
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Orbiting Ring Dust Particles
    this.particles.forEach((p, idx) => {
      const pColor = idx % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      const r = p.radius * scale * (1 + kickBoost * 0.3);
      const x = Math.cos(p.angle) * r;
      const y = Math.sin(p.angle) * r;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = pColor;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }
}
