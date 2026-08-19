import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

interface PolyVertex {
  x: number;
  y: number;
  z: number;
}

export class ChaosVisualizer implements IVisualizer {
  public name = 'Chaos Hyper-Geometry';
  private vertices: PolyVertex[] = [];
  private rotX = 0;
  private rotY = 0;
  private rotZ = 0;
  private dropShatter = 0;
  private shatterSeed = 0;

  constructor() {
    this.initIcosahedron();
  }

  private initIcosahedron() {
    const phi = (1 + Math.sqrt(5)) / 2;
    const raw: [number, number, number][] = [
      [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
    ];
    this.vertices = raw.map(([x, y, z]) => {
      const len = Math.hypot(x, y, z) || 1;
      return { x: (x / len) * 220, y: (y / len) * 220, z: (z / len) * 220 };
    });
  }

  update(audio: AudioEvents, settings: VisualizerSettings) {
    const speed = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;

    // Multi-axis chaotic rotation
    this.rotX += (0.012 + audio.snare * 0.03) * speed;
    this.rotY += (0.016 + audio.hihat * 0.04) * speed;
    this.rotZ += 0.008 * speed;

    // Beat-onset structural shatter
    if (audio.beat && audio.kick > 0.5 * (2 - beatSens)) {
      this.dropShatter = 1.0;
      this.shatterSeed = Math.random() * 100;
    } else {
      this.dropShatter *= 0.92; // smooth geometric reform
    }
  }

  render(context: RenderContext) {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.2;

    ctx.save();
    ctx.translate(centerX, centerY);

    if (glow > 0.1) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 18 * glow * (1 + bass * 0.8);
    }

    // 3D Rotation Matrix Calculation
    const cosX = Math.cos(this.rotX), sinX = Math.sin(this.rotX);
    const cosY = Math.cos(this.rotY), sinY = Math.sin(this.rotY);
    const cosZ = Math.cos(this.rotZ), sinZ = Math.sin(this.rotZ);

    const projected = this.vertices.map((v, idx) => {
      // Deform with audio spectrum and shatter burst
      const spec = (audio.spectrum[idx * 4] || 0) * 0.6;
      const shatterAmp = this.dropShatter * Math.sin(idx + this.shatterSeed) * 80;
      const r = (1 + bass * 0.4 + spec) * scale;

      let x = v.x * r + (v.x > 0 ? shatterAmp : -shatterAmp);
      let y = v.y * r + (v.y > 0 ? shatterAmp : -shatterAmp);
      let z = v.z * r + (v.z > 0 ? shatterAmp : -shatterAmp);

      // Rotate Y
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;

      // Rotate X
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Rotate Z
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      // Perspective projection
      const fov = 650;
      const depth = Math.max(10, fov + z2);
      const projScale = fov / depth;

      return {
        x: x3 * projScale,
        y: y3 * projScale,
        z: z2,
        scale: projScale
      };
    });

    // 1. Draw Polyhedral Wireframe Edges
    ctx.lineWidth = 2 * (1 + audio.kick * 0.6);
    ctx.strokeStyle = settings.primaryColor;

    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i];
        const p2 = projected[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        
        // Connect nearby vertices in icosahedral topology
        if (dist < 260 * scale) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.globalAlpha = Math.max(0.15, Math.min(1.0, 0.9 * (1 - dist / (260 * scale)) + vocal * 0.3));
          ctx.stroke();
        }
      }
    }

    // 2. Draw Vertex Energy Nodes (Secondary Glow)
    projected.forEach((p, idx) => {
      ctx.beginPath();
      const nodeR = Math.max(2, 6 * p.scale * (1 + (audio.spectrum[idx * 3] || 0) * 0.8));
      ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = idx % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      ctx.globalAlpha = Math.max(0.3, Math.min(1.0, p.scale));
      ctx.fill();
    });

    // 3. Central Sacred Core
    ctx.beginPath();
    ctx.arc(0, 0, (25 + bass * 40) * scale, 0, Math.PI * 2);
    ctx.strokeStyle = settings.secondaryColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;
    ctx.stroke();

    ctx.restore();
  }
}
