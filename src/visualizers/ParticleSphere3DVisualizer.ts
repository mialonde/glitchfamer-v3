import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface SpherePoint {
  baseX: number;
  baseY: number;
  baseZ: number;
  noiseOffset: number;
}

interface SparkParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class ParticleSphere3DVisualizer implements IVisualizer {
  public name = 'PARTICLE_SPHERE_3D';
  private points: SpherePoint[] = [];
  private sparks: SparkParticle[] = [];
  private autoRotX = 0;
  private autoRotY = 0;
  private pulseScale = 1.0;
  private noisePhase = 0;
  private lastHighEnergy = 0;

  constructor() {
    this.initSpherePoints(750);
  }

  private initSpherePoints(count: number) {
    this.points = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      this.points.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        noiseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + audio.energy * 0.8);
    this.autoRotY += 0.008 * speed;
    this.autoRotX += 0.004 * speed;
    this.noisePhase += 0.04 * (1 + (audio.midEnergy ?? audio.snare) * 2.5);

    // Bass Pulse
    const bass = audio.bassEnergy ?? audio.kick;
    const targetScale = 1.0 + bass * 0.65 * (settings.visBeatSensitivity ?? 1.0);
    this.pulseScale += (targetScale - this.pulseScale) * 0.25;

    // Treble Sparks Emission
    const treble = audio.trebleEnergy ?? audio.hihat;
    if (treble > 0.45 && (treble - this.lastHighEnergy > 0.1 || Math.random() > 0.6)) {
      const sparkCount = Math.floor(treble * 8);
      for (let s = 0; s < sparkCount && this.sparks.length < 120; s++) {
        const randPt = this.points[Math.floor(Math.random() * this.points.length)];
        const speedVal = 2.5 + Math.random() * 4 * treble;
        this.sparks.push({
          x: randPt.baseX * 180,
          y: randPt.baseY * 180,
          z: randPt.baseZ * 180,
          vx: randPt.baseX * speedVal + (Math.random() - 0.5) * 2,
          vy: randPt.baseY * speedVal + (Math.random() - 0.5) * 2,
          vz: randPt.baseZ * speedVal + (Math.random() - 0.5) * 2,
          life: 1.0,
          maxLife: 20 + Math.random() * 25,
          color: Math.random() > 0.5 ? settings.primaryColor : '#00FFFF',
          size: Math.random() * 3 + 1.5
        });
      }
    }
    this.lastHighEnergy = treble;

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.z += sp.vz;
      sp.life -= 1 / sp.maxLife;
      if (sp.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, interaction } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);
    const baseRadius = minDim * 0.28 * (settings.visScale ?? 1.0) * this.pulseScale;
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const treble = audio.trebleEnergy ?? audio.hihat;

    // User Interactive Orbit Angles
    const rotX = this.autoRotX + (interaction?.rotationX ?? 0);
    const rotY = this.autoRotY + (interaction?.rotationY ?? 0);

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);

    const fov = 600;
    const glow = settings.visGlow ?? 0.7;

    ctx.save();

    // 1. Central Core Glow Aura (Reacts to Bass)
    if (glow > 0.05) {
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.4);
      coreGrad.addColorStop(0, `${settings.primaryColor}${Math.floor(Math.min(255, 60 + bass * 120)).toString(16).padStart(2, '0')}`);
      coreGrad.addColorStop(0.5, `${settings.secondaryColor}22`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Gravity Attractor Point Check
    const attractor = interaction?.gravityAttractor;

    // Project & Sort 3D Points
    interface ProjectedPoint {
      sx: number;
      sy: number;
      sz: number;
      scale: number;
      alpha: number;
      color: string;
      radius: number;
    }

    const projected: ProjectedPoint[] = [];

    // Density LOD control
    const densityMul = Math.max(0.4, Math.min(1.5, settings.visDensity ?? 1.0));
    const pointCount = Math.floor(this.points.length * densityMul);

    for (let i = 0; i < pointCount; i++) {
      const p = this.points[i];

      // Organic Noise & Vertex Displacement (Mid Frequency)
      const noise = Math.sin(p.noiseOffset * 4 + this.noisePhase) * Math.cos(p.baseY * 3 + this.noisePhase);
      const disp = 1.0 + (noise * 0.28 * mid) + (bass * 0.15);
      let px = p.baseX * baseRadius * disp;
      let py = p.baseY * baseRadius * disp;
      let pz = p.baseZ * baseRadius * disp;

      // 3D Rotation Matrix
      // Y-axis rotation
      let x1 = px * cosY + pz * sinY;
      let y1 = py;
      let z1 = -px * sinY + pz * cosY;

      // X-axis rotation
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // 3D to 2D Perspective Projection
      const zDist = z2 + fov;
      if (zDist <= 10) continue;
      const projScale = fov / zDist;
      let screenX = centerX + x2 * projScale;
      let screenY = centerY + y2 * projScale;

      // Magnetic Attraction to pointer if interacting
      if (attractor && interaction?.isPointerDown) {
        const dx = attractor.x - screenX;
        const dy = attractor.y - screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 320 && dist > 1) {
          const force = ((320 - dist) / 320) * 45 * attractor.strength;
          screenX += (dx / dist) * force;
          screenY += (dy / dist) * force;
        }
      }

      // Treble Color Shifting (Cyan -> Gold -> Neon Pink -> White)
      let ptColor = settings.primaryColor;
      if (treble > 0.4) {
        if (i % 3 === 0) ptColor = '#00FFFF';
        else if (i % 3 === 1) ptColor = '#FF007F';
        else ptColor = '#FFFFFF';
      } else if (i % 2 === 0) {
        ptColor = settings.secondaryColor;
      }

      const depthAlpha = Math.max(0.12, Math.min(1.0, (z2 + baseRadius) / (baseRadius * 2)));
      const ptRadius = Math.max(1, (2.2 + treble * 2.5) * projScale * (settings.visScale ?? 1.0));

      projected.push({
        sx: screenX,
        sy: screenY,
        sz: z2,
        scale: projScale,
        alpha: depthAlpha,
        color: ptColor,
        radius: ptRadius
      });
    }

    // Sort by Z depth (Back to Front)
    projected.sort((a, b) => a.sz - b.sz);

    // Draw Subtle Connecting Wireframe Lines for closest neighbors
    ctx.lineWidth = 0.75;
    const lineStep = Math.max(1, Math.floor(4 / densityMul));
    for (let i = 0; i < projected.length - lineStep; i += lineStep) {
      const p1 = projected[i];
      const p2 = projected[i + lineStep];
      const distSq = (p1.sx - p2.sx) ** 2 + (p1.sy - p2.sy) ** 2;
      if (distSq < 2200 * (1 + bass * 0.5)) {
        ctx.strokeStyle = p1.color;
        ctx.globalAlpha = Math.min(0.4, p1.alpha * 0.3 * (1 + mid));
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }
    }

    // Draw 3D Sphere Particles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (glow > 0.1 && p.sz > 0) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * glow * (1 + treble);
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Render Sparks
    for (const sp of this.sparks) {
      const zDist = sp.z + fov;
      if (zDist <= 10) continue;
      const projScale = fov / zDist;
      const sx = centerX + sp.x * projScale;
      const sy = centerY + sp.y * projScale;

      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 10 * glow;
      ctx.beginPath();
      ctx.arc(sx, sy, sp.size * projScale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
