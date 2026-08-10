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
  public name = 'POPCORN_PHYSICS';
  private particles: PopParticle[] = [];
  private shockwaves: PopRing[] = [];
  private lastPopTime = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const gravity = 0.45 * speed;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const scale = settings.visScale ?? 1.0;

    // Detect dynamic audio pops / transient bursts
    const isKickPop = audio.beat && audio.kick > 0.4 * (2 - beatSens);
    const isSnarePop = audio.snare > 0.45 * (2 - beatSens);
    const isHihatPop = audio.hihat > 0.5 * (2 - beatSens);

    if ((isKickPop || isSnarePop || isHihatPop) && (audio.time - this.lastPopTime) > 0.08) {
      this.lastPopTime = audio.time;

      const popOriginX = 960 + (Math.random() - 0.5) * 600 * scale;
      const popOriginY = 850;

      // Spawn shockwave ring
      this.shockwaves.push({
        x: popOriginX,
        y: popOriginY,
        radius: 10 * scale,
        maxRadius: (120 + audio.energy * 250) * scale,
        color: isKickPop ? settings.primaryColor : settings.secondaryColor,
        alpha: 0.9
      });

      // Spawn popping particles (Hugh Kennedy Popcorn style)
      const popCount = Math.floor((12 + audio.energy * 35) * (settings.visDensity ?? 1.0));
      for (let i = 0; i < popCount; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7;
        const velocity = (12 + Math.random() * 22) * scale * (1 + audio.kick * 0.8) * speed;

        this.particles.push({
          x: popOriginX,
          y: popOriginY,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          radius: (3 + Math.random() * 8) * scale,
          color: Math.random() > 0.35 ? settings.primaryColor : settings.secondaryColor,
          alpha: 1.0,
          life: 0,
          maxLife: 90 + Math.random() * 60,
          bounces: 0
        });
      }
    }

    // Update Shockwaves
    this.shockwaves.forEach(sw => {
      sw.radius += (8 + audio.kick * 12) * speed;
      sw.alpha = Math.max(0, 0.9 * (1 - sw.radius / sw.maxRadius));
    });
    this.shockwaves = this.shockwaves.filter(sw => sw.alpha > 0.01);

    // Update Particle Physics (Gravity, Damping, Ground Bounce)
    const floorY = 980;
    this.particles.forEach(p => {
      p.life++;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;

      // Bounce off bottom floor
      if (p.y >= floorY - p.radius && p.vy > 0) {
        p.y = floorY - p.radius;
        p.vy = -p.vy * 0.55;
        p.vx *= 0.8;
        p.bounces++;
      }

      p.alpha = Math.max(0, 1.0 - (p.life / p.maxLife));
    });

    // Prune dead particles (limit max array size)
    const maxCapacity = Math.floor(400 * (settings.visDensity ?? 1.0));
    this.particles = this.particles.filter(p => p.alpha > 0.02 && p.bounces < 4).slice(-maxCapacity);
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const glow = settings.visGlow ?? 0.5;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 18 * glow * (1 + kickBoost);
    }

    // 1. Render Shockwave Rings
    this.shockwaves.forEach(sw => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = Math.max(1, 3 * (1 - sw.radius / sw.maxRadius));
      ctx.globalAlpha = sw.alpha;
      ctx.stroke();
      ctx.restore();
    });

    // 2. Render Popping Particles with Glow Trails
    this.particles.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Velocity trail line
      if (Math.abs(p.vx) + Math.abs(p.vy) > 3) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.radius * 0.8;
        ctx.globalAlpha = p.alpha * 0.4;
        ctx.stroke();
      }
      ctx.restore();
    });

    // 3. Audio Spectrum Floor Glow Line
    const floorY = 980;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.strokeStyle = `${settings.primaryColor}60`;
    ctx.lineWidth = Math.max(2, 4 * (1 + kickBoost));
    ctx.stroke();

    ctx.restore();
  }
}
