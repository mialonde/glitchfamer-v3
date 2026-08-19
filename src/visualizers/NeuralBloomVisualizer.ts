import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

interface SynapticParticle {
  x: number;
  y: number;
  z: number; // For 3D tunnel flythrough
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  color: string;
}

export class NeuralBloomVisualizer implements IVisualizer {
  public name = 'Neural Bloom';

  private particles: SynapticParticle[] = [];
  private time = 0;
  private hue = 0;
  private lastBeat = false;
  
  // Distortion pulse trigger
  private distortionPulse = 0;
  private zoomFactor = 1;
  private tunnelOffset = 0;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.particles = Array.from({ length: 150 }, () => this.createParticle(true));
  }

  private createParticle(randomZ = false): SynapticParticle {
    // Spawn particles in a circular core or randomly in depth Z
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.2;
    return {
      x: Math.cos(angle) * (Math.random() * 30 + 5),
      y: Math.sin(angle) * (Math.random() * 30 + 5),
      z: randomZ ? Math.random() * 1000 : 1000, // Z depth: 1000 is far, 0 is near
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      vz: -(Math.random() * 2 + 1), // Move towards camera (Z decreases)
      size: Math.random() * 2 + 1,
      alpha: 0, // Starts invisible, fades in
      color: Math.random() > 0.5 ? 'primary' : 'secondary'
    };
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speedMultiplier = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const colorShiftSpeed = settings.visColorShift ?? 0.2;

    this.time += 0.01 * speedMultiplier;
    this.tunnelOffset += 1.5 * speedMultiplier;

    // Vocal/Midrange drives hue shift
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.1;
    this.hue = (this.hue + (0.1 + vocal * 2) * colorShiftSpeed) % 360;

    // Bass drives zoom pulse
    const bass = audio.bassEnergy ?? audio.kick ?? 0.1;
    const targetZoom = 1.0 + Math.pow(bass, 1.5) * 0.18 * beatSens;
    this.zoomFactor += (targetZoom - this.zoomFactor) * 0.2;

    // Beat drives distortion pulse
    if (audio.beat && !this.lastBeat) {
      this.distortionPulse = 1.0;
    } else {
      this.distortionPulse *= 0.92; // Decay
    }
    this.lastBeat = audio.beat;

    // Update particles (foreground synapse field)
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;
      p.z += p.vz * speedMultiplier * 4;

      // Fade in as it enters mid-ground, fade out as it flies past camera
      if (p.z > 800) {
        p.alpha = Math.max(0, 1 - (p.z - 800) / 200);
      } else if (p.z < 200) {
        p.alpha = p.z / 200;
      } else {
        p.alpha = 1;
      }

      // Recycle when flies past camera
      if (p.z <= 10) {
        this.particles[i] = this.createParticle(false);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, settings, audio } = context;
    const primaryColor = settings.primaryColor || '#FFD700';
    const secondaryColor = settings.secondaryColor || '#FFFFFF';
    const density = settings.visDensity ?? 1.0;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.hypot(width, height) / 2;

    // --- 1. BACKGROUND: Elegant Gradient Noise ---
    // We create multiple layers of radial gradients rotating around each other to simulate organic flow
    ctx.fillStyle = '#05020a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Base glowing gradient shifted by vocal hue
    const gradientHue1 = (this.hue) % 360;
    const gradientHue2 = (this.hue + 120) % 360;

    // Multi-frequency noise-like dynamic positions
    const noiseX1 = centerX + Math.sin(this.time * 0.7) * (width * 0.15);
    const noiseY1 = centerY + Math.cos(this.time * 0.5) * (height * 0.15);
    const noiseX2 = centerX + Math.cos(this.time * 0.4) * (width * 0.2);
    const noiseY2 = centerY + Math.sin(this.time * 0.6) * (height * 0.2);

    const grad1 = ctx.createRadialGradient(noiseX1, noiseY1, 10, noiseX1, noiseY1, maxRadius * 0.6);
    grad1.addColorStop(0, `hsla(${gradientHue1}, 80%, 15%, 0.4)`);
    grad1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    const grad2 = ctx.createRadialGradient(noiseX2, noiseY2, 5, noiseX2, noiseY2, maxRadius * 0.8);
    grad2.addColorStop(0, `hsla(${gradientHue2}, 70%, 10%, 0.3)`);
    grad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    // Dynamic grid tunnel lines receding in distance to reinforce depth
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = `hsla(${gradientHue1}, 40%, 30%, 0.08)`;
    ctx.lineWidth = 1;
    
    const tunnelRings = 8;
    for (let r = 0; r < tunnelRings; r++) {
      const radiusOffset = ((this.tunnelOffset + r * (maxRadius / tunnelRings)) % maxRadius);
      const distAlpha = Math.max(0, 1 - radiusOffset / maxRadius);
      ctx.strokeStyle = `hsla(${gradientHue1}, 50%, 40%, ${distAlpha * 0.12})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusOffset, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Apply main scale transforms (zoom driven by bass)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.zoomFactor * scale, this.zoomFactor * scale);

    // Set up glow styling
    if (glow > 0.05) {
      ctx.shadowBlur = 15 * glow;
      ctx.shadowColor = `hsla(${gradientHue1}, 90%, 60%, 0.5)`;
    }

    // --- 2. MIDDLE: Fractal Neural Bloom Mesh ---
    // A beautiful recursive neural flower / fractal system blooming from the center
    const maxBranchDepth = Math.min(6, Math.floor(4 + density * 2));
    const segments = 6; // Symmetrical neural branches
    
    for (let s = 0; s < segments; s++) {
      const angleOffset = (s / segments) * Math.PI * 2 + this.time * 0.05;
      ctx.save();
      ctx.rotate(angleOffset);
      
      // Starting branch of the fractal neural bloom
      this.drawNeuralBranch(
        ctx,
        0,
        0,
        -70,
        Math.PI / 12,
        maxBranchDepth,
        this.time,
        gradientHue1,
        audio
      );
      
      ctx.restore();
    }

    // Centered glowing synaptic nucleus
    const nucleusSize = 25 + (audio.energy ?? 0) * 15;
    const nucleusGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, nucleusSize);
    nucleusGrad.addColorStop(0, '#FFFFFF');
    nucleusGrad.addColorStop(0.3, `hsla(${gradientHue1}, 100%, 70%, 0.9)`);
    nucleusGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nucleusGrad;
    ctx.beginPath();
    ctx.arc(0, 0, nucleusSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore from Zoom transform

    // --- 3. FOREGROUND: Infinite Synapse Particle Field ---
    // 3D projections flying towards the camera
    ctx.save();
    ctx.translate(centerX, centerY);

    const pColor1 = `hsla(${gradientHue1}, 90%, 75%, 0.85)`;
    const pColor2 = `hsla(${gradientHue2}, 90%, 65%, 0.85)`;

    const activeParticlesCount = Math.min(this.particles.length, Math.floor(this.particles.length * density));

    for (let i = 0; i < activeParticlesCount; i++) {
      const p = this.particles[i];
      
      // Perspective projection mapping
      // Standard perspective division: screenX = (worldX * focalLength) / worldZ
      const focalLength = 300;
      const projScale = focalLength / p.z;
      
      let projX = p.x * projScale;
      let projY = p.y * projScale;
      
      // Apply BEAT distortion pulse ripple wave
      if (this.distortionPulse > 0.01) {
        const distFromCenter = Math.hypot(projX, projY);
        const waveFreq = 0.05;
        // Radial wave distorting outer particles outward in a sine pattern
        const wave = Math.sin(distFromCenter * waveFreq - this.time * 15) * 18 * this.distortionPulse;
        const angle = Math.atan2(projY, projX);
        projX += Math.cos(angle) * wave;
        projY += Math.sin(angle) * wave;
      }

      // Check if within bounds
      const screenX = projX;
      const screenY = projY;
      const size = p.size * projScale * 1.5;

      if (Math.abs(screenX) < width && Math.abs(screenY) < height && p.z > 10) {
        ctx.fillStyle = p.color === 'primary' ? pColor1 : pColor2;
        ctx.globalAlpha = p.alpha;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();

        // Delicate neural filaments to nearby particles
        if (i < activeParticlesCount - 1 && p.z > 300) {
          const nextP = this.particles[i + 1];
          const distanceZ = Math.abs(p.z - nextP.z);
          if (distanceZ < 50) {
            const nextProjScale = focalLength / nextP.z;
            const nextProjX = nextP.x * nextProjScale;
            const nextProjY = nextP.y * nextProjScale;
            
            const screenDist = Math.hypot(screenX - nextProjX, screenY - nextProjY);
            if (screenDist < 120) {
              ctx.strokeStyle = `hsla(${gradientHue1}, 60%, 70%, ${p.alpha * 0.15})`;
              ctx.lineWidth = 0.5 * projScale;
              ctx.beginPath();
              ctx.moveTo(screenX, screenY);
              ctx.lineTo(nextProjX, nextProjY);
              ctx.stroke();
            }
          }
        }
      }
    }
    
    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  // Recursive neural-fractal tree renderer
  private drawNeuralBranch(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    length: number,
    angle: number,
    depth: number,
    time: number,
    baseHue: number,
    audio: AudioEvents
  ): void {
    if (depth === 0) return;

    // Calculate end of current branch
    const endX = startX + Math.sin(angle) * length;
    const endY = startY + Math.cos(angle) * length;

    // Determine thickness based on depth
    ctx.lineWidth = Math.max(0.7, depth * 0.7);

    // Beautiful glowing synapses connection lines
    const lineHue = (baseHue + depth * 15) % 360;
    ctx.strokeStyle = `hsla(${lineHue}, 80%, 65%, ${0.15 + (depth / 8) * 0.55})`;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw little synapse node
    if (depth <= 3) {
      const nodeSize = (1.5 + (4 - depth) * 1.0) * (1.0 + (audio.vocalEnergy ?? 0.1) * 0.5);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(endX, endY, nodeSize * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `hsla(${lineHue}, 100%, 70%, 0.5)`;
      ctx.beginPath();
      ctx.arc(endX, endY, nodeSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Next recursion variables (curving driven by vocal / mid frequencies)
    const vocalInfluence = (audio.vocalEnergy ?? 0.1) * 0.3;
    const wave = Math.sin(time * 2 + depth * 1.5) * 0.2 + vocalInfluence;

    // Branches bloom outwards
    const nextLength = length * 0.72;
    const branchAngleOffset = 0.38 + wave;

    this.drawNeuralBranch(
      ctx,
      endX,
      endY,
      nextLength,
      angle - branchAngleOffset,
      depth - 1,
      time,
      baseHue,
      audio
    );

    this.drawNeuralBranch(
      ctx,
      endX,
      endY,
      nextLength,
      angle + branchAngleOffset,
      depth - 1,
      time,
      baseHue,
      audio
    );
  }
}
