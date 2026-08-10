import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface Metaball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  phase: number;
  color: string;
}

interface FluidDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
}

export class FluidMetaballVisualizer implements IVisualizer {
  public name = 'FLUID_METABALL';
  private metaballs: Metaball[] = [];
  private droplets: FluidDroplet[] = [];
  private internalRipples: { x: number; y: number; r: number; maxR: number; alpha: number; color: string }[] = [];
  private lastKick = 0;
  private time = 0;

  constructor() {
    this.initMetaballs(12);
  }

  private initMetaballs(count: number) {
    this.metaballs = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      this.metaballs.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        baseRadius: 45 + Math.random() * 65,
        radius: 60,
        phase: Math.random() * Math.PI * 2,
        color: i % 2 === 0 ? '#FFD700' : '#FF007F'
      });
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const speedMul = (settings.visSpeed ?? 1.0) * (0.8 + audio.energy * 1.4);
    this.time += 0.02 * speedMul;

    // Viscosity control: higher tempo/energy = lower viscosity (more fragmentation & faster movement)
    const viscosityFactor = Math.max(0.4, 1.4 - audio.energy * 0.8);

    // Kick detection: trigger droplet splashes and liquid shockwave ripples
    if (bass > 0.48 && (bass - this.lastKick > 0.12 || Math.random() > 0.75)) {
      // Spawn new liquid droplets
      const dropCount = Math.floor(4 + bass * 8);
      for (let d = 0; d < dropCount && this.droplets.length < 50; d++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 6 * bass;
        this.droplets.push({
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 6 + Math.random() * 14 * bass,
          alpha: 1.0,
          color: Math.random() > 0.5 ? settings.primaryColor : settings.secondaryColor,
          life: 1.0
        });
      }

      // Add ripple
      this.internalRipples.push({
        x: 0,
        y: 0,
        r: 10,
        maxR: 280 + bass * 200,
        alpha: 0.9,
        color: settings.primaryColor
      });
    }
    this.lastKick = bass;

    // Update Droplets
    for (let i = this.droplets.length - 1; i >= 0; i--) {
      const drop = this.droplets[i];
      drop.x += drop.vx * (1 / viscosityFactor);
      drop.y += drop.vy * (1 / viscosityFactor);
      drop.vx *= 0.96;
      drop.vy *= 0.96;
      drop.life -= 0.025;
      drop.alpha = Math.max(0, drop.life);
      if (drop.life <= 0) {
        this.droplets.splice(i, 1);
      }
    }

    // Update Ripples
    for (let i = this.internalRipples.length - 1; i >= 0; i--) {
      const rip = this.internalRipples[i];
      rip.r += 6 * speedMul;
      rip.alpha = Math.max(0, 1 - rip.r / rip.maxR);
      if (rip.r >= rip.maxR) {
        this.internalRipples.splice(i, 1);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, interaction } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);
    const scale = (settings.visScale ?? 1.0) * (minDim / 600);
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const treble = audio.trebleEnergy ?? audio.hihat;
    const glow = settings.visGlow ?? 0.8;

    ctx.save();

    // 1. Draw Liquid Expansion Ripples
    for (const rip of this.internalRipples) {
      ctx.beginPath();
      ctx.arc(centerX + rip.x, centerY + rip.y, rip.r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color;
      ctx.lineWidth = Math.max(1.5, 4 * rip.alpha);
      ctx.globalAlpha = rip.alpha * 0.7;
      if (glow > 0.1) {
        ctx.shadowColor = rip.color;
        ctx.shadowBlur = 12 * glow;
      }
      ctx.stroke();
    }

    // Process User Interactive Ripples (from pointer taps)
    if (interaction?.fluidRipples && interaction.fluidRipples.length > 0) {
      for (const irip of interaction.fluidRipples) {
        ctx.beginPath();
        ctx.arc(irip.x, irip.y, irip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = irip.color || settings.primaryColor;
        ctx.lineWidth = 3 * irip.alpha;
        ctx.globalAlpha = irip.alpha * 0.8;
        ctx.stroke();
      }
    }

    // 2. Liquid Metaballs Orbit & Positioning
    const boundRadius = minDim * 0.28 * scale;
    const pointerDisturbX = interaction?.isPointerDown ? (interaction.pointerX - centerX) : 0;
    const pointerDisturbY = interaction?.isPointerDown ? (interaction.pointerY - centerY) : 0;

    const density = Math.max(0.4, Math.min(1.5, settings.visDensity ?? 1.0));
    const activeBallCount = Math.floor(this.metaballs.length * density);

    // Render Multi-layer Fluid Gradient Discs with smooth alpha blending
    for (let i = 0; i < activeBallCount; i++) {
      const mb = this.metaballs[i];
      const orbitSpeed = 0.5 + (i % 3) * 0.4;
      const angle = this.time * orbitSpeed + mb.phase;
      const dist = (boundRadius * 0.55) * (0.6 + Math.sin(this.time * 0.8 + i) * 0.4);

      let px = centerX + Math.cos(angle) * dist;
      let py = centerY + Math.sin(angle) * dist;

      // Pointer Viscous Swirl Interaction
      if (interaction?.isPointerDown) {
        const dx = interaction.pointerX - px;
        const dy = interaction.pointerY - py;
        const pDist = Math.sqrt(dx * dx + dy * dy);
        if (pDist < 250 && pDist > 1) {
          const force = (1 - pDist / 250) * 40;
          px += (dx / pDist) * force;
          py += (dy / pDist) * force;
        }
      }

      // Audio reactive size & distortion
      const specIdx = Math.floor((i / activeBallCount) * (audio.spectrum.length - 1));
      const specVal = audio.spectrum[specIdx] || 0;
      const currentRadius = (mb.baseRadius + bass * 55 + specVal * 45) * scale;
      const ballColor = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;

      // Fluid Drop Gradient (Mercury / Lava Glow)
      const grad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.2, ballColor);
      grad.addColorStop(0.7, `${ballColor}99`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.globalAlpha = Math.min(0.85, 0.55 + bass * 0.35);

      if (glow > 0.1) {
        ctx.shadowColor = ballColor;
        ctx.shadowBlur = 18 * glow * (1 + bass * 0.5);
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }

    // 3. Central Core Liquid Nucleus
    const coreRadius = (minDim * 0.16 + bass * 65 + mid * 35) * scale;
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.3, settings.primaryColor);
    coreGrad.addColorStop(0.8, `${settings.secondaryColor}66`);
    coreGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // 4. Splashing Fluid Droplets
    for (const drop of this.droplets) {
      const dx = centerX + drop.x * scale;
      const dy = centerY + drop.y * scale;

      const dGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, drop.radius * scale);
      dGrad.addColorStop(0, '#FFFFFF');
      dGrad.addColorStop(0.4, drop.color);
      dGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(dx, dy, drop.radius * scale, 0, Math.PI * 2);
      ctx.fillStyle = dGrad;
      ctx.globalAlpha = drop.alpha * 0.85;
      ctx.fill();
    }

    ctx.restore();
  }
}
