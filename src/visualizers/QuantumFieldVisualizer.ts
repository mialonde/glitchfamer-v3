import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface QuantumParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  hueOffset: number;
}

export class QuantumFieldVisualizer implements IVisualizer {
  public name = 'QUANTUM_FIELD';
  private particles: QuantumParticle[] = [];
  private initialized = false;

  private initParticles(density: number) {
    const count = Math.floor(120 * Math.max(0.2, density));
    this.particles = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 1920,
      y: (Math.random() - 0.5) * 1080,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      baseRadius: Math.random() * 3 + 1.5,
      hueOffset: Math.random() * 60
    }));
    this.initialized = true;
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const density = settings.visDensity ?? 1.0;
    if (!this.initialized || this.particles.length !== Math.floor(120 * Math.max(0.2, density))) {
      this.initParticles(density);
    }

    const speed = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickForce = audio.kick * beatSens;
    const time = audio.time * speed;

    this.particles.forEach((p, idx) => {
      // Flow vector field calculation
      const angle = Math.sin(p.x * 0.003 + time) + Math.cos(p.y * 0.003 + time);
      const forceX = Math.cos(angle) * 0.8 * speed;
      const forceY = Math.sin(angle) * 0.8 * speed;

      p.vx += forceX * 0.1;
      p.vy += forceY * 0.1;

      // Bass gravity pull towards center on kick
      if (kickForce > 0.4) {
        const dist = Math.hypot(p.x, p.y) || 1;
        p.vx -= (p.x / dist) * kickForce * 3;
        p.vy -= (p.y / dist) * kickForce * 3;
      }

      // Friction & Position update
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;

      // Screen Wrap-around
      const boundX = 1920 / 2;
      const boundY = 1080 / 2;
      if (p.x < -boundX) p.x = boundX;
      if (p.x > boundX) p.x = -boundX;
      if (p.y < -boundY) p.y = boundY;
      if (p.y > boundY) p.y = -boundY;
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

    // Apply rotation
    if ((settings.visRotation ?? 0) !== 0) {
      ctx.rotate(audio.time * (settings.visRotation ?? 0.5) * 0.2);
    }

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 12 * glow * (1 + kickBoost);
    }

    // 1. Draw Constellation lines between close particles
    const maxLinkDist = 110 * scale;
    ctx.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = (p1.x - p2.x) * scale;
        const dy = (p1.y - p2.y) * scale;
        const dist = Math.hypot(dx, dy);

        if (dist < maxLinkDist) {
          const alpha = (1 - dist / maxLinkDist) * 0.45 * (1 + kickBoost * 0.5);
          ctx.strokeStyle = j % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
          ctx.globalAlpha = Math.min(0.8, alpha);

          ctx.beginPath();
          ctx.moveTo(p1.x * scale, p1.y * scale);
          ctx.lineTo(p2.x * scale, p2.y * scale);
          ctx.stroke();
        }
      }
    }

    // 2. Draw Quantum Particle Nodes
    this.particles.forEach((p) => {
      const pRadius = p.baseRadius * scale * (1 + kickBoost * 0.8 + audio.hihat * 0.4);
      ctx.fillStyle = settings.primaryColor;
      ctx.globalAlpha = Math.min(1.0, 0.7 + kickBoost * 0.3);

      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, pRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}
