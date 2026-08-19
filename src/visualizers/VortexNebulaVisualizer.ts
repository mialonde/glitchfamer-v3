import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface VortexParticle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  arm: number;
}

export class VortexNebulaVisualizer implements IVisualizer {
  public name = 'Vortex Nebula Orb';
  private particles: VortexParticle[] = [];
  private rotation = 0;
  private corePulse = 0;

  constructor() {
    this.initSwarm(220);
  }

  private initSwarm(count: number) {
    const arms = 3;
    this.particles = Array.from({ length: count }, (_, idx) => {
      const arm = idx % arms;
      const armAngleOffset = (arm / arms) * Math.PI * 2;
      const dist = 30 + Math.pow(Math.random(), 0.7) * 440;
      return {
        angle: armAngleOffset + (dist * 0.015) + (Math.random() - 0.5) * 0.5,
        distance: dist,
        speed: 0.008 + Math.random() * 0.018,
        size: 2 + Math.random() * 5,
        color: Math.random() > 0.4 ? 'primary' : 'secondary',
        alpha: 0.3 + Math.random() * 0.7,
        arm
      };
    });
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.02 * speed;
    this.rotation += rotSpeed;

    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const targetCount = Math.floor(260 * density);

    if (this.particles.length !== targetCount) {
      this.initSwarm(targetCount);
    }

    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.2;

    if (audio.beat) {
      this.corePulse = 1.0;
    } else {
      this.corePulse *= 0.92;
    }

    this.particles.forEach((p, idx) => {
      p.angle += (p.speed + bass * 0.03 * beatSens) * speed;
      const specIdx = Math.floor((idx / this.particles.length) * audio.spectrum.length);
      const specVal = audio.spectrum[specIdx] || 0;
      
      // Radial breathing & orbital gravitation
      p.distance += Math.sin(audio.time * 2.5 + idx) * 0.6 + (specVal * 2.0);
      if (p.distance > 480) p.distance = 35;
      if (p.distance < 30) p.distance = 460;
    });
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 22 * glow * (1 + bass * 0.8);
    }

    // 1. Central Nebula Singularity Core
    const coreR = Math.max(10, (28 + bass * 45 + this.corePulse * 20) * scale);
    const coreGrad = ctx.createRadialGradient(0, 0, coreR * 0.1, 0, 0, coreR);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, settings.secondaryColor);
    coreGrad.addColorStop(1, `${settings.primaryColor}00`);
    
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // 2. Render Vortex Particles & Constellation Links
    this.particles.forEach((p, i) => {
      const color = p.color === 'primary' ? settings.primaryColor : settings.secondaryColor;
      const r = p.distance * scale * (1 + bass * 0.25);
      const x = Math.cos(p.angle) * r;
      const y = Math.sin(p.angle) * r;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, p.size * scale * (1 + bass * 0.4)), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.min(1.0, p.alpha + vocal * 0.3);
      ctx.fill();
      ctx.restore();

      // Connect nearby particles in spiral arms
      if (i % 2 === 0 && i < this.particles.length - 2) {
        const nextP = this.particles[i + 2];
        if (nextP.arm === p.arm) {
          const nextR = nextP.distance * scale * (1 + bass * 0.25);
          const nextX = Math.cos(nextP.angle) * nextR;
          const nextY = Math.sin(nextP.angle) * nextR;

          const dist = Math.hypot(x - nextX, y - nextY);
          if (dist < 130 * scale) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(nextX, nextY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = Math.max(0.05, 0.4 * (1 - dist / (130 * scale)));
            ctx.stroke();
          }
        }
      }
    });

    ctx.restore();
  }
}
