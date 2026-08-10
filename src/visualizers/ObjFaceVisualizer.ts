import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';
import { getLipSyncEnergy } from '../core/LipSync';

interface Vertex3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  // Current position after deformations
  x: number;
  y: number;
  z: number;
  // Metadata for audio reaction
  isJaw: boolean;
  shatterSeed: number;
}

interface Face3D {
  v1: number;
  v2: number;
  v3: number;
}

interface Triangle {
  vA: Vertex3D;
  vB: Vertex3D;
  vC: Vertex3D;
  pA: { x: number, y: number };
  pB: { x: number, y: number };
  pC: { x: number, y: number };
  zAvg: number;
  nx: number;
  ny: number;
  nz: number;
}

export class ObjFaceVisualizer implements IVisualizer {
  public name = 'OBJ_FACE_MASK';
  
  private vertices: Vertex3D[] = [];
  private faces: Face3D[] = [];
  private isLoaded = false;
  
  private rotX = 0;
  private rotY = 0;

  constructor() {
    this.loadObj();
  }

  private async loadObj() {
    try {
      const response = await fetch('/models/face.obj');
      const text = await response.text();
      this.parseObj(text);
    } catch (error) {
      console.error("Failed to load face.obj", error);
    }
  }

  private parseObj(text: string) {
    const lines = text.split('\n');
    const scale = 22; 
    
    // MediaPipe canonical face uses standard right-handed coordinates:
    // +Y is UP (chin is ~ -9.4, forehead is ~ +8.2)
    // +Z is FORWARD (nose is ~ +7.5)
    // +X is RIGHT
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'v') {
        const x = parseFloat(parts[1]) * scale;
        const y = parseFloat(parts[2]) * scale; 
        const z = parseFloat(parts[3]) * scale;
        
        // Jaw region is negative Y (lower half of face)
        const isJaw = y < -20;
        
        this.vertices.push({
          baseX: x, baseY: y, baseZ: z,
          x: 0, y: 0, z: 0,
          isJaw,
          shatterSeed: Math.random()
        });
      } else if (parts[0] === 'f') {
        const faceIndices = parts.slice(1).map(p => parseInt(p.split('/')[0]) - 1);
        for (let i = 1; i < faceIndices.length - 1; i++) {
          this.faces.push({
            v1: faceIndices[0],
            v2: faceIndices[i],
            v3: faceIndices[i + 1]
          });
        }
      }
    }
    
    this.isLoaded = true;
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, interaction } = context;

    if (!this.isLoaded) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Loading OBJ...', width / 2, height / 2);
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;

    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const mid = audio.midEnergy ?? audio.snare ?? 0;
    const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
    const energy = audio.energy ?? 0;

    // Background
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, width, height);

    // Audio-reactive rotations
    const targetRotX = Math.sin(audio.time * 2) * 0.15 - (bass * 0.15); // Look up slightly on bass
    const targetRotY = Math.sin(audio.time * 0.8) * 0.25 + (interaction?.isPointerDown ? (interaction.pointerX - centerX) * 0.003 : 0);

    this.rotX += (targetRotX - this.rotX) * 0.15;
    this.rotY += (targetRotY - this.rotY) * 0.15;

    const cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
    const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY);

    const fov = 700;
    const viewDistance = 500 - (bass * 50);

    // 1. Transform Vertices
    const jawDrop = getLipSyncEnergy(audio, settings, mid) * 20; // Subtle jaw drop
    
    // Smooth global audio-reactive scale
    const globalScale = 1 + bass * 0.05;

    for (const v of this.vertices) {
      let vx = v.baseX * globalScale;
      let vy = v.baseY * globalScale;
      let vz = v.baseZ * globalScale;

      // Smooth jaw drop (gradual based on Y)
      if (vy < -20) {
        const jawWeight = Math.min(1, (-vy - 20) / 150);
        vy -= jawDrop * jawWeight;
      }
      
      // Rotate Y (Yaw)
      const rx = vx * cy + vz * sy;
      const rz = -vx * sy + vz * cy;

      // Rotate X (Pitch)
      const ry = vy * cx - rz * sx;
      const finalZ = vy * sx + rz * cx;

      v.x = rx;
      v.y = ry;
      v.z = finalZ;
    }

    // 2. Build Triangles & Backface Culling
    const triangles: Triangle[] = [];

    for (const f of this.faces) {
      const vA = this.vertices[f.v1];
      const vB = this.vertices[f.v2];
      const vC = this.vertices[f.v3];
      
      if (!vA || !vB || !vC) continue;

      // Normal calculation (Cross product)
      const ux = vB.x - vA.x;
      const uy = vB.y - vA.y;
      const uz = vB.z - vA.z;

      const vx = vC.x - vA.x;
      const vy = vC.y - vA.y;
      const vz = vC.z - vA.z;

      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;

      const normalX = -nx;
      const normalY = -ny;
      const normalZ = -nz;

      // Backface culling
      if (normalZ < 0) continue; 

      const zAvg = (vA.z + vB.z + vC.z) / 3;
      
      // Project to 2D
      const distA = viewDistance - vA.z;
      const distB = viewDistance - vB.z;
      const distC = viewDistance - vC.z;

      if (distA <= 0 || distB <= 0 || distC <= 0) continue;

      const scaleA = fov / distA;
      const scaleB = fov / distB;
      const scaleC = fov / distC;

      triangles.push({
        vA, vB, vC,
        pA: { x: centerX + vA.x * scaleA, y: centerY - vA.y * scaleA }, 
        pB: { x: centerX + vB.x * scaleB, y: centerY - vB.y * scaleB },
        pC: { x: centerX + vC.x * scaleC, y: centerY - vC.y * scaleC },
        zAvg,
        nx: normalX, ny: normalY, nz: normalZ
      });
    }

    // 3. Sort Triangles (Painter's Algorithm)
    triangles.sort((a, b) => a.zAvg - b.zAvg);

    // 4. Render
    const lightDir = { x: 0.5, y: 0.5, z: 0.7 };
    const lLen = Math.sqrt(lightDir.x**2 + lightDir.y**2 + lightDir.z**2);
    lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;
    
    // Noir aesthetic colors
    const hue = 220; // Steel blue / chrome
    const sat = 20;

    for (const t of triangles) {
      const nLen = Math.sqrt(t.nx**2 + t.ny**2 + t.nz**2) || 1;
      let nx = t.nx / nLen;
      let ny = t.ny / nLen;
      let nz = t.nz / nLen;

      // Specular & Diffuse
      const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
      const diffuse = Math.max(0.1, dot);
      
      // Chrome-like reflection approximation
      const viewDot = nz; // Camera looks down -Z
      const fresnel = Math.pow(1 - Math.max(0, viewDot), 3);
      
      const lit = 5 + (diffuse * 35) + (fresnel * 40) + (energy * 15);

      ctx.beginPath();
      ctx.moveTo(t.pA.x, t.pA.y);
      ctx.lineTo(t.pB.x, t.pB.y);
      ctx.lineTo(t.pC.x, t.pC.y);
      ctx.closePath();

      // Flat shading fill (solid metallic)
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lit}%)`;
      ctx.fill();

      // Clean wireframe
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${lit + 40}%, 0.6)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}
