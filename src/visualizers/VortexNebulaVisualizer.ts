import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface VortexParticle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
}

export class VortexNebulaVisualizer implements IVisualizer {
  public name = 'VORTEX_NEBULA';
  private particles: VortexParticle[] = [];
  private rotation = 0;

  constructor() {
    this.initSwarm(200);
  }

  private initSwarm(count: number) {
    this.particles = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: 40 + Math.random() * 450,
      speed: (0.005 + Math.random() * 0.015),
      size: 2 + Math.random() * 5,
      color: Math.random() > 0.4 ? '#FFD700' : '#FFFFFF',
      alpha: 0.3 + Math.random() * 0.7
    }));
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.015 * speed;
    this.rotation += rotSpeed;

    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const targetCount = Math.floor(250 * density);

    if (this.particles.length !== targetCount) {
      this.initSwarm(targetCount);
    }

    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    this.particles.forEach((p, idx) => {
      p.angle += (p.speed + kickBoost * 0.02) * speed;
      const specIdx = Math.floor((idx / this.particles.length) * audio.spectrum.length);
      const specVal = audio.spectrum[specIdx] || 0;
      
      // Radial breathing movement
      p.distance += Math.sin(audio.time * 2 + idx) * 0.4 + (specVal * 1.5);
      if (p.distance > 500) p.distance = 50;
      if (p.distance < 40) p.distance = 450;
    });
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * glow * (1 + kickBoost);
    }

    // Render Vortex Particles & Connecting Constellation Lines
    this.particles.forEach((p, i) => {
      const color = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      const r = p.distance * scale * (1 + kickBoost * 0.3);
      const x = Math.cos(p.angle) * r;
      const y = Math.sin(p.angle) * r;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, p.size * scale * (1 + kickBoost * 0.4)), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.restore();

      // Connect nearby particles within threshold distance
      if (i % 3 === 0 && i < this.particles.length - 1) {
        const nextP = this.particles[i + 1];
        const nextR = nextP.distance * scale * (1 + kickBoost * 0.3);
        const nextX = Math.cos(nextP.angle) * nextR;
        const nextY = Math.sin(nextP.angle) * nextR;

        const dist = Math.hypot(x - nextX, y - nextY);
        if (dist < 120 * scale) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nextX, nextY);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.5, 1.5 * (1 - dist / (120 * scale)));
          ctx.globalAlpha = (1 - dist / (120 * scale)) * 0.4;
          ctx.stroke();
        }
      }
    });

    ctx.restore();
  }
}
