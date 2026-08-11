import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';
import { getLipSyncBlendshapes } from '../core/LipSync';

interface Vertex3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  // Current position after deformations
  x: number;
  y: number;
  z: number;
  // Anatomical vertex weights for natural articulation
  mouthWeight: number;
  upperLipWeight: number;
  lowerLipWeight: number;
  cornerWeight: number;
  jawWeight: number;
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
    const rawVertices: { x: number; y: number; z: number }[] = [];
    this.faces = [];
    this.vertices = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === 'v') {
        rawVertices.push({
          x: parseFloat(parts[1]),
          y: parseFloat(parts[2]),
          z: parseFloat(parts[3])
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

    if (rawVertices.length === 0) return;

    // Calculate center of mass for perfect rotation pivot
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const v of rawVertices) {
      sumX += v.x;
      sumY += v.y;
      sumZ += v.z;
    }
    const cX = sumX / rawVertices.length;
    const cY = sumY / rawVertices.length;
    const cZ = sumZ / rawVertices.length;

    const scale = 24;
    // Canonical mouth center in scaled OBJ coordinate space
    const mX = (0 - cX) * scale;
    const mY = (-4.26 - cY) * scale;
    const mZ = (5.31 - cZ) * scale;

    for (const v of rawVertices) {
      const baseX = (v.x - cX) * scale;
      const baseY = (v.y - cY) * scale;
      const baseZ = (v.z - cZ) * scale;
      
      const dx = baseX - mX;
      const dy = baseY - mY;
      const dz = baseZ - mZ;
      const mouthDist = Math.sqrt(dx * dx + dy * dy * 1.4 + dz * dz * 1.5);
      const mouthWeight = Math.max(0, 1 - mouthDist / 48);

      // Upper lip moves slightly upward on vowels / mouth opening
      const upperLipWeight = mouthWeight * (dy >= -2 ? Math.min(1, Math.max(0, (dy + 2) / 10)) : 0);
      // Lower lip moves downwards strongly
      const lowerLipWeight = mouthWeight * (dy < -2 ? Math.min(1, Math.max(0, (-dy - 2) / 12)) : 0);
      // Mouth corners move horizontally on smile / width
      const cornerWeight = Math.abs(dx) > 10 ? mouthWeight * Math.min(1, (Math.abs(dx) - 8) / 22) : 0;
      // Mandible / Chin bone rotation
      const jawWeight = baseY < mY - 12 ? Math.min(1, Math.max(0, (mY - 12 - baseY) / 110)) : 0;

      this.vertices.push({
        baseX,
        baseY,
        baseZ,
        x: 0,
        y: 0,
        z: 0,
        mouthWeight,
        upperLipWeight,
        lowerLipWeight,
        cornerWeight,
        jawWeight,
        shatterSeed: Math.random()
      });
    }

    this.isLoaded = true;
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, interaction, settings } = context;

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

    // 1. Transform Vertices with Anatomically Realistic Blendshapes
    const shapes = getLipSyncBlendshapes(audio, settings);
    
    // Smooth global audio-reactive pulse (bass)
    const globalScale = 1 + bass * 0.04;

    for (const v of this.vertices) {
      let vx = v.baseX * globalScale;
      let vy = v.baseY * globalScale;
      let vz = v.baseZ * globalScale;

      // 1. Mouth Aperture: Lower lip drops, Upper lip lifts slightly
      const lowerLipOffset = (shapes.mouth_open * 22 + shapes.jaw_drop * 14) * v.lowerLipWeight;
      const upperLipOffset = (shapes.mouth_open * 5) * v.upperLipWeight;
      vy -= lowerLipOffset;
      vy += upperLipOffset;

      // 2. Jaw Bone / Chin Drop (mandible hinge motion)
      const chinDrop = shapes.jaw_drop * 18 * v.jawWeight;
      vy -= chinDrop;
      vz -= chinDrop * 0.15;

      // 3. Mouth Width & Corner Spread (Smile / Vowels A, E)
      const widthDelta = (shapes.mouth_width - 0.5) * 20;
      vx += Math.sign(vx || 1) * widthDelta * v.cornerWeight;

      // 4. Lip Rounding / Pucker (Vowels O, U)
      const pucker = shapes.lip_round * 16;
      vz += pucker * v.mouthWeight;
      vx -= Math.sign(vx || 1) * (pucker * 0.4) * v.cornerWeight;

      // 5. Lip Press (Consonants P, B, M)
      const press = shapes.lip_press * 7;
      if (v.lowerLipWeight > 0) vy += press * v.lowerLipWeight;
      if (v.upperLipWeight > 0) vy -= press * v.upperLipWeight;
      
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

      const normalX = nx;
      const normalY = ny;
      const normalZ = nz;

      // Backface culling: only render polygons facing towards the screen/camera
      if (normalZ <= 0) continue; 

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
