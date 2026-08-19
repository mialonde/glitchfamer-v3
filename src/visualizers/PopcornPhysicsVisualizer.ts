import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface PopParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  bounces: number;
  trail: { x: number; y: number }[];
}

interface PopRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export class PopcornPhysicsVisualizer implements IVisualizer {
  public name = 'Kinetic Burst';
  private particles: PopParticle[] = [];
  private shockwaves: PopRing[] = [];
  private lastPopTime = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const gravity = 0.48 * speed;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const scale = settings.visScale ?? 1.0;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;

    // Detect dynamic audio pops / transient bursts
    const isKickPop = audio.beat && audio.kick > 0.38 * (2 - beatSens);
    const isSnarePop = audio.snare > 0.42 * (2 - beatSens);
    const isHihatPop = audio.hihat > 0.48 * (2 - beatSens);

    if ((isKickPop || isSnarePop || isHihatPop) && (audio.time - this.lastPopTime) > 0.07) {
      this.lastPopTime = audio.time;

      const popOriginX = 960 + (Math.random() - 0.5) * 700 * scale;
      const popOriginY = 880;

      // Spawn shockwave ring
      this.shockwaves.push({
        x: popOriginX,
        y: popOriginY,
        radius: 10 * scale,
        maxRadius: (140 + bass * 280) * scale,
        color: isKickPop ? settings.primaryColor : settings.secondaryColor,
        alpha: 0.95
      });

      // Spawn popping particles with physics velocity
      const popCount = Math.floor((16 + audio.energy * 40) * (settings.visDensity ?? 1.0));
      for (let i = 0; i < popCount; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.75;
        const velocity = (14 + Math.random() * 26) * scale * (1 + bass * 0.9) * speed;

        this.particles.push({
          x: popOriginX,
          y: popOriginY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          radius: (3 + Math.random() * 9) * scale,
          color: Math.random() > 0.35 ? settings.primaryColor : settings.secondaryColor,
          alpha: 1.0,
          life: 0,
          maxLife: 95 + Math.random() * 65,
          bounces: 0,
          trail: []
        });
      }
    }

    // Update Shockwaves
    this.shockwaves.forEach(sw => {
      sw.radius += (9 + bass * 14) * speed;
      sw.alpha = Math.max(0, 0.95 * (1 - sw.radius / sw.maxRadius));
    });
    this.shockwaves = this.shockwaves.filter(sw => sw.alpha > 0.01);

    // Update Particle Physics (Gravity, Damping, Ground Bounce, Motion Trail)
    const floorY = 960;
    this.particles.forEach(p => {
      p.life++;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 5) p.trail.shift();

      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Bounce off bottom floor with restitution
      if (p.y >= floorY - p.radius && p.vy > 0) {
        p.y = floorY - p.radius;
        p.vy = -p.vy * 0.58;
        p.vx *= 0.82;
        p.bounces++;
      }

      p.alpha = Math.max(0, 1.0 - (p.life / p.maxLife));
    });

    // Prune dead particles
    const maxCapacity = Math.floor(450 * (settings.visDensity ?? 1.0));
    this.particles = this.particles.filter(p => p.alpha > 0.02 && p.bounces < 5).slice(-maxCapacity);
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const glow = settings.visGlow ?? 0.5;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * glow * (1 + kickBoost);
    }

    // 1. Render Shockwave Rings
    this.shockwaves.forEach(sw => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(1, 3.5 * (1 - sw.radius / sw.maxRadius));
      ctx.globalAlpha = sw.alpha;
      ctx.stroke();
      ctx.restore();
    });

    // 2. Render Popping Particles & Motion Trails
    this.particles.forEach(p => {
      ctx.save();
      
      // Draw motion trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 0.6;
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.stroke();
      }

      // Draw particle core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      ctx.restore();
    });

    // 3. Audio Spectrum Floor Glow Line
    const floorY = 960;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.strokeStyle = `${settings.primaryColor}66`;
    ctx.lineWidth = Math.max(2, 4 * (1 + kickBoost));
    ctx.stroke();

    ctx.restore();
  }
}
