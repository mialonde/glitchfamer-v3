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

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return { r: 79, g: 134, b: 247 }; // default #4f86f7
  }
  return { r, g, b };
}

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r = l, g = l, b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
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
      let text = '';
      if (typeof window === 'undefined') {
        // Server-side (Node.js/SSR) fallback to procedural high-res cyber-mask to avoid dynamic require
        this.createProceduralFaceFallback();
        return;
      } else {
        // Client-side browser load
        const response = await fetch('/models/face.obj');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        text = await response.text();
      }
      this.parseObj(text);
    } catch (error) {
      console.warn("Failed to load face.obj, using premium procedural siber-mask fallback:", error);
      this.createProceduralFaceFallback();
    }
  }

  private createProceduralFaceFallback() {
    console.log("Generating procedural siber-mask fallback...");
    const rawVertices: { x: number; y: number; z: number }[] = [];
    this.faces = [];
    this.vertices = [];

    // Create a beautiful 3D grid shaped like a mask/face (spherical half-dome with mouth and eyes cut-out)
    const cols = 16;
    const rows = 16;
    for (let r = 0; r <= rows; r++) {
      const phi = (r / rows) * Math.PI * 0.75; // latitude
      for (let c = 0; c <= cols; c++) {
        const theta = (c / cols) * Math.PI - Math.PI / 2; // longitude (-90 to 90 deg)
        
        // Base sphere coordinates
        const radius = 6.0;
        let x = radius * Math.sin(phi) * Math.sin(theta);
        let y = radius * Math.cos(phi) * 1.3; // slightly elongated vertically
        let z = radius * Math.sin(phi) * Math.cos(theta);

        // Apply a deformation to shape it like a stylized mask (narrow chin, high cheekbones, nose ridge)
        if (y < 0) {
          x *= (1.0 + y * 0.08); // chin narrowing
        }
        // Nose bridge protrusion
        if (Math.abs(theta) < 0.25 && phi > 0.6 && phi < 1.8) {
          z += 1.2 * (0.25 - Math.abs(theta));
        }

        rawVertices.push({ x, y, z });
      }
    }

    // Connect grid vertices with triangles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i1 = r * (cols + 1) + c;
        const i2 = r * (cols + 1) + (c + 1);
        const i3 = (r + 1) * (cols + 1) + c;
        const i4 = (r + 1) * (cols + 1) + (c + 1);

        // Cut out eyes and mouth regions for realism & cool cyber aesthetic!
        const isEyeL = (r === Math.floor(rows * 0.35) && (c === Math.floor(cols * 0.3) || c === Math.floor(cols * 0.35)));
        const isEyeR = (r === Math.floor(rows * 0.35) && (c === Math.floor(cols * 0.7) || c === Math.floor(cols * 0.65)));
        const isMouth = (r === Math.floor(rows * 0.7) && c >= cols * 0.35 && c <= cols * 0.65);

        if (isEyeL || isEyeR || isMouth) continue;

        // Triangle 1
        this.faces.push({ v1: i1, v2: i2, v3: i3 });
        // Triangle 2
        this.faces.push({ v1: i2, v2: i4, v3: i3 });
      }
    }

    const scale = 24;
    const mX = 0;
    const mY = -2.0 * scale;
    const mZ = 5.0 * scale;

    for (const v of rawVertices) {
      const baseX = v.x * scale;
      const baseY = v.y * scale;
      const baseZ = v.z * scale;
      
      const dx = baseX - mX;
      const dy = baseY - mY;
      const dz = baseZ - mZ;
      const mouthDist = Math.sqrt(dx * dx + dy * dy * 1.4 + dz * dz * 1.5);
      const mouthWeight = Math.max(0, 1 - mouthDist / 48);

      const upperLipWeight = mouthWeight * (dy >= -2 ? Math.min(1, Math.max(0, (dy + 2) / 10)) : 0);
      const lowerLipWeight = mouthWeight * (dy < -2 ? Math.min(1, Math.max(0, (-dy - 2) / 12)) : 0);
      const cornerWeight = Math.abs(dx) > 10 ? mouthWeight * Math.min(1, (Math.abs(dx) - 8) / 22) : 0;
      const jawWeight = baseY < mY - 12 ? Math.min(1, Math.max(0, (mY - 12 - baseY) / 110)) : 0;

      this.vertices.push({
        baseX, baseY, baseZ,
        x: 0, y: 0, z: 0,
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

    if (rawVertices.length === 0) {
      throw new Error("No vertices found in OBJ file");
    }

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
    const bgBaseColor = settings.objFaceBgColor || '#0a0a0c';
    ctx.fillStyle = bgBaseColor;
    ctx.fillRect(0, 0, width, height);

    if (settings.objFaceBgReactive) {
      // Create a sese duyarlı reactive glow overlay with the face color
      const pulseOpacity = Math.min(0.25, bass * 0.15 * (settings.visBeatSensitivity ?? 1.0));
      if (pulseOpacity > 0.01) {
        ctx.fillStyle = settings.objFaceColor || '#4f86f7';
        ctx.globalAlpha = pulseOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
      }
    }

    // Audio-reactive rotations
    const userRotation = settings.visRotation ?? 0.5;
    const targetRotX = (Math.sin(audio.time * 2) * 0.15 - (bass * 0.15)) * userRotation;
    const targetRotY = (Math.sin(audio.time * 0.8) * 0.25 + (interaction?.isPointerDown ? (interaction.pointerX - centerX) * 0.003 : 0)) * userRotation;

    this.rotX += (targetRotX - this.rotX) * 0.15;
    this.rotY += (targetRotY - this.rotY) * 0.15;

    const cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
    const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY);

    const fov = 700;
    const viewDistance = 500 - (bass * 50 * (settings.visBeatSensitivity ?? 1.0));

    // 1. Transform Vertices with Anatomically Realistic Blendshapes
    const shapes = getLipSyncBlendshapes(audio, settings);
    
    // Smooth global audio-reactive pulse (bass) & scale factor
    const userScale = settings.visScale ?? 1.0;
    const globalScale = (1 + bass * 0.04 * (settings.visBeatSensitivity ?? 1.0)) * userScale;

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

      // Painters algorithm handles depth sorting, so we can render double-sided or fallback safely
      // We only cull extremely flat triangles to prevent rendering artifacts
      if (Math.abs(normalZ) < 0.0001) continue; 

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
    
    const colorMode = settings.objFaceColorMode || 'solid';
    const cycleSpeed = settings.objFaceCycleSpeed ?? 1.0;
    
    // Convert hex face color to RGB & HSL
    const faceHex = settings.objFaceColor || '#4f86f7';
    const faceRgb = hexToRgb(faceHex);
    const faceHsl = rgbToHsl(faceRgb);

    let currentH = faceHsl.h;
    let currentS = faceHsl.s;
    let currentL = faceHsl.l;

    if (colorMode === 'rainbow') {
      currentH = (audio.time * 45 * cycleSpeed) % 360;
      currentS = 90;
      currentL = 50;
    } else if (colorMode === 'pulse') {
      const pulseFactor = 0.5 + 0.5 * Math.sin(audio.time * 4 * cycleSpeed);
      currentL = Math.max(15, Math.min(85, faceHsl.l * (0.6 + pulseFactor * 0.4)));
    } else if (colorMode === 'glow-fade') {
      const wave = Math.sin(audio.time * 2.5 * cycleSpeed);
      currentH = (faceHsl.h + wave * 25 + 360) % 360;
      currentS = Math.max(20, Math.min(100, faceHsl.s * (0.7 + (wave + 1) * 0.15)));
    } else if (colorMode === 'audio') {
      const sens = settings.visBeatSensitivity ?? 1.0;
      currentH = (faceHsl.h + (bass * 40 * sens * cycleSpeed)) % 360;
      currentS = Math.max(30, Math.min(100, faceHsl.s * (0.8 + energy * 0.4 * sens)));
      currentL = Math.max(20, Math.min(85, faceHsl.l * (0.9 + energy * 0.25 * sens)));
    }

    // Convert dynamic HSL back to RGB so we can apply precise lighting/shading
    const dynamicBaseRgb = hslToRgb({ h: currentH, s: currentS, l: currentL });

    const glowMultiplier = settings.visGlow ?? 0.5;

    for (const t of triangles) {
      const nLen = Math.sqrt(t.nx**2 + t.ny**2 + t.nz**2) || 1;
      let nx = t.nx / nLen;
      let ny = t.ny / nLen;
      let nz = t.nz / nLen;

      // Ensure normal points towards the viewer for correct shading of double-sided triangles
      if (nz < 0) {
        nx = -nx;
        ny = -ny;
        nz = -nz;
      }

      // Specular & Diffuse
      const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
      const diffuse = Math.max(0.1, dot);
      
      // Chrome-like reflection approximation
      const viewDot = nz; // Camera looks down -Z
      const fresnel = Math.pow(1 - Math.max(0, viewDot), 3);
      
      // Shading factor represents environmental lighting multiplier (ambient + diffuse + fresnel glow + audio power)
      const ambient = 0.20;
      const diffuseIntensity = diffuse * 0.50;
      const fresnelIntensity = fresnel * 0.30;
      const audioPulse = energy * 0.15 * (settings.visBeatSensitivity ?? 1.0);
      const shadeFactor = ambient + diffuseIntensity + fresnelIntensity + audioPulse;

      // Calculate accurate shaded color in RGB space! This guarantees exact hue and saturation matching
      const finalR = Math.min(255, Math.round(dynamicBaseRgb.r * shadeFactor));
      const finalG = Math.min(255, Math.round(dynamicBaseRgb.g * shadeFactor));
      const finalB = Math.min(255, Math.round(dynamicBaseRgb.b * shadeFactor));

      ctx.beginPath();
      ctx.moveTo(t.pA.x, t.pA.y);
      ctx.lineTo(t.pB.x, t.pB.y);
      ctx.lineTo(t.pC.x, t.pC.y);
      ctx.closePath();

      // Shaded face fill
      ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
      ctx.fill();

      // Slightly brighter wireframe with custom glow opacity
      const wireR = Math.min(255, Math.round(dynamicBaseRgb.r * (shadeFactor + 0.25)));
      const wireG = Math.min(255, Math.round(dynamicBaseRgb.g * (shadeFactor + 0.25)));
      const wireB = Math.min(255, Math.round(dynamicBaseRgb.b * (shadeFactor + 0.25)));

      ctx.strokeStyle = `rgba(${wireR}, ${wireG}, ${wireB}, ${glowMultiplier * 1.2})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}
