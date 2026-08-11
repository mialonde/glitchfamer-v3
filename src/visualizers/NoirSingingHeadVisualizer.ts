import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';
import { getLipSyncBlendshapes } from '../core/LipSync';

interface Vertex3D {
  baseX: number;
  baseY: number;
  baseZ: number;
  sx: number;
  sy: number;
  sz: number;
  nx: number;
  ny: number;
  nz: number;
  isJaw: number;
  isMouth: number;
  isEye: number;
  shatterSeed: number;
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
}

interface Triangle {
  vA: Vertex3D;
  vB: Vertex3D;
  vC: Vertex3D;
  nx: number;
  ny: number;
  nz: number;
  zAvg: number;
  isEye: number;
  isMouth: number;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  angle: number;
  rotSpeed: number;
}

export class NoirSingingHeadVisualizer implements IVisualizer {
  public name = 'NOIR_SINGING_HEAD';
  
  private rows = 36;
  private cols = 40;
  private grid: Vertex3D[][] = [];
  private smoke: SmokeParticle[] = [];
  private rotX = 0;
  private rotY = 0;
  private faceFormation = 0.0;

  constructor() {
    this.generateMesh();
  }

  private generateMesh() {
    this.grid = [];
    const radius = 170;
    
    for (let r = 0; r <= this.rows; r++) {
      const theta = (r / this.rows) * Math.PI;
      const nyBase = Math.cos(theta); // 1 (top) to -1 (bottom)
      const sinTheta = Math.sin(theta);
      
      const rowVertices: Vertex3D[] = [];
      for (let c = 0; c <= this.cols; c++) {
        const phi = (c / this.cols) * Math.PI * 2 - Math.PI;
        
        const nxBase = sinTheta * Math.sin(phi);
        const nzBase = -sinTheta * Math.cos(phi); // < 0 is front (facing the camera at -z)
        
        // Base perfect sphere coordinates
        const sx = nxBase * radius;
        const sy = nyBase * radius;
        const sz = nzBase * radius;

        let x = sx;
        let y = sy;
        let z = sz;
        
        const isFront = nzBase < 0;
        const frontWeight = Math.max(0, -nzBase);
        
        // Base head shaping (Elongated skull)
        x *= 0.85;
        y *= 1.05;
        if (nzBase > 0) {
            z *= 0.85; // Flat back of head
            y *= 0.95;
        }
        
        let isJaw = 0, isMouth = 0, isEye = 0;
        
        if (isFront) {
            // Jaw / Chin
            if (nyBase < -0.15) {
                const chinV = Math.max(0, (-nyBase - 0.15) / 0.85);
                const chinH = Math.max(0, 1 - Math.abs(nxBase) / 0.45);
                const chinWeight = chinV * chinH * frontWeight;
                y -= chinWeight * 30;
                z -= chinWeight * 10; // Closer to camera
                isJaw = chinWeight;
            }
            
            // Nose
            const noseDist = Math.sqrt(Math.pow(nyBase - 0.05, 2) + Math.pow(nxBase, 2));
            const noseWeight = Math.max(0, 1 - noseDist / 0.25);
            z -= Math.pow(noseWeight, 1.6) * 30; // Protrude towards camera
            y -= noseWeight * 12;
            
            // Eye Sockets
            const eyeL = Math.sqrt(Math.pow(nyBase - 0.35, 2) + Math.pow(nxBase - 0.28, 2));
            const eyeR = Math.sqrt(Math.pow(nyBase - 0.35, 2) + Math.pow(nxBase + 0.28, 2));
            const eyeWeight = Math.max(0, 1 - Math.min(eyeL, eyeR) / 0.22);
            z += Math.pow(eyeWeight, 1.5) * 15; // Deep sockets (away from camera)
            isEye = eyeWeight;
            
            // Brow Ridge
            const browDist = Math.abs(nyBase - 0.5);
            const browWeight = Math.max(0, 1 - browDist / 0.15) * frontWeight * (1 - Math.abs(nxBase)/0.7);
            z -= browWeight * 20;
            
            // Mouth / Lips
            const mouthDistY = Math.abs(nyBase + 0.15);
            const mouthDistX = Math.abs(nxBase);
            if (mouthDistY < 0.12 && mouthDistX < 0.25) {
                const mouthWeight = Math.max(0, 1 - mouthDistY / 0.12) * Math.max(0, 1 - mouthDistX / 0.25);
                z -= Math.pow(mouthWeight, 1.8) * 20;
                isMouth = mouthWeight;
            }
            
            // Cheeks
            const cheekDist = Math.sqrt(Math.pow(nyBase - 0.0, 2) + Math.pow(Math.abs(nxBase) - 0.5, 2));
            const cheekWeight = Math.max(0, 1 - cheekDist / 0.35);
            z -= cheekWeight * 20;
            x += Math.sign(nxBase) * cheekWeight * 15;
        }
        
        rowVertices.push({
            baseX: x, baseY: y, baseZ: z, // Head shape
            sx, sy, sz, // Sphere shape
            nx: 0, ny: 0, nz: 0,
            isJaw, isMouth, isEye,
            shatterSeed: Math.random(),
            px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0
        });
      }
      this.grid.push(rowVertices);
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
      // Audio processing and smoke updates are done in render due to reliance on Canvas coordinates
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, interaction } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);
    const scale = (settings.visScale ?? 1.0) * (minDim / 750);
    
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const mid = audio.midEnergy ?? audio.snare ?? 0;
    const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
    const energy = audio.energy ?? 0;
    
    // 1. Black Noir Background
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, width, height);
    
    // Procedural Organism Formation Logic
    // If music is playing (energy > 0.05), face forms. Otherwise it decays back to a sphere/blob.
    const targetFormation = energy > 0.05 ? Math.min(1.0, energy * 1.5) : 0.0;
    this.faceFormation += (targetFormation - this.faceFormation) * 0.02; // Smooth morphing
    const fWeight = this.faceFormation; // 0 = sphere/blob, 1 = face

    // 2. Head Kinematics & Audio Reactivity
    const shatterIntensity = Math.pow(Math.max(0, bass - 0.8), 2) * 20 * fWeight; 
    const shapes = getLipSyncBlendshapes(audio, settings);
    const jawDrop = shapes.jaw_drop * 55 * fWeight;
    const mouthOpen = shapes.mouth_open * 40 * fWeight;
    const mouthWidthFactor = 1 + (shapes.mouth_width - 0.5) * 0.4 * fWeight;
    const lipRound = shapes.lip_round * 16 * fWeight;
    const lipPress = shapes.lip_press * 10 * fWeight;
    
    // Breathing & Nodding
    const targetRotX = Math.sin(audio.time * 2.5) * 0.12 * fWeight + (bass * 0.18) + (1 - fWeight) * audio.time * 0.5; 
    const targetRotY = Math.sin(audio.time * 0.9) * 0.2 * fWeight + (interaction?.isPointerDown ? (interaction.pointerX - centerX) * 0.003 : 0) + (1 - fWeight) * audio.time * 0.2;
    
    this.rotX += (targetRotX - this.rotX) * 0.12;
    this.rotY += (targetRotY - this.rotY) * 0.12;
    
    const cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
    const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY);
    
    const fov = 850;
    const viewDistance = 750 - (bass * 60 * fWeight); // Head bumps forward on bass
    
    // 3. Project Vertices
    for (let r = 0; r <= this.rows; r++) {
        for (let c = 0; c <= this.cols; c++) {
            const v = this.grid[r][c];
            
            // Interpolate between shapeless blob/sphere and the face
            // Add some noise based on audio to the blob state
            const noise = (1 - fWeight) * treble * 5 * v.shatterSeed;
            
            let x = v.sx * (1 - fWeight) + v.baseX * fWeight + Math.sin(audio.time * 5 + v.shatterSeed * 10) * noise;
            let y = v.sy * (1 - fWeight) + v.baseY * fWeight + Math.cos(audio.time * 4 + v.shatterSeed * 10) * noise;
            let z = v.sz * (1 - fWeight) + v.baseZ * fWeight + Math.sin(audio.time * 3 + v.shatterSeed * 10) * noise;
            
            // Viseme Lip Sync & Jaw Drop
            if (v.isJaw > 0) {
                y -= jawDrop * v.isJaw;
                z -= jawDrop * 0.2 * v.isJaw;
            }
            
            // Mouth opening, round & width based on active viseme
            if (v.isMouth > 0) {
                x *= mouthWidthFactor;
                // Lip round brings corners inwards and protrudes outwards on Z
                z += lipRound * v.isMouth;
                
                if (v.baseY < -0.15 * 170) { // Lower lip
                    y -= (mouthOpen * 0.7 - lipPress) * v.isMouth;
                } else { // Upper lip
                    y += (mouthOpen * 0.3 - lipPress) * v.isMouth;
                }
            }

            
            // Eye Blinking / Audio Reactive Squinting
            if (v.isEye > 0) {
                // Approximate eye center Y
                const eyeCenterY = 0.35 * 170;
                // Move towards or away from eye center based on treble
                const eyeMove = (y - eyeCenterY) * treble * 2.5 * v.isEye;
                y -= eyeMove; 
                // Bulge out on bass
                z -= bass * 15 * v.isEye;
            }
            
            // Shatter Glitch Effect
            if (shatterIntensity > 0) {
                // Approximate normal for shatter direction based on origin
                const nLen = Math.sqrt(x*x + y*y + z*z) || 1;
                const shatterOffset = shatterIntensity * v.shatterSeed;
                x += (x / nLen) * shatterOffset;
                y += (y / nLen) * shatterOffset;
                z += (z / nLen) * shatterOffset;
            }
            
            // Rotate Y
            let x1 = x * cy + z * sy;
            let z1 = -x * sy + z * cy;
            // Rotate X
            let y2 = y * cx - z1 * sx;
            let z2 = y * sx + z1 * cx;
            
            v.rx = x1;
            v.ry = y2;
            v.rz = z2;
            
            const viewZ = z2 + viewDistance;
            const persScale = fov / Math.max(1, viewZ);
            
            v.px = centerX + x1 * persScale * scale;
            v.py = centerY - y2 * persScale * scale; // Invert Y for canvas
            v.pz = viewZ;
        }
    }
    
    // 4. Build Triangles for Z-Sorting & Backface Culling
    const triangles: Triangle[] = [];
    const isShattered = shatterIntensity > 15;
    
    for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
            const vA = this.grid[r][c];
            const vB = this.grid[r][c+1];
            const vC = this.grid[r+1][c];
            const vD = this.grid[r+1][c+1];
            
            const addTri = (tA: Vertex3D, tB: Vertex3D, tC: Vertex3D) => {
                const ux = tB.rx - tA.rx;
                const uy = tB.ry - tA.ry;
                const uz = tB.rz - tA.rz;
                const vx = tC.rx - tA.rx;
                const vy = tC.ry - tA.ry;
                const vz = tC.rz - tA.rz;
                
                // Outward normal (since U is +x, V is -y, U x V = -z)
                let nx = uy * vz - uz * vy;
                let ny = uz * vx - ux * vz;
                let nz = ux * vy - uy * vx;
                
                // 3D Backface Culling
                // Camera is at -z looking at +z. The face front is at -z with normal pointing to -z.
                // If the normal points towards +z (nz > 0), it's facing away from the camera.
                if (!isShattered && nz > 0) return; 
                
                const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
                
                triangles.push({
                    vA: tA, vB: tB, vC: tC,
                    nx: nx/len, ny: ny/len, nz: nz/len,
                    zAvg: (tA.pz + tB.pz + tC.pz) / 3,
                    isEye: (tA.isEye + tB.isEye + tC.isEye) / 3,
                    isMouth: (tA.isMouth + tB.isMouth + tC.isMouth) / 3
                });
            };
            
            addTri(vA, vB, vC);
            addTri(vB, vD, vC);
        }
    }
    
    // Sort Triangles (Painter's Algorithm: Back to Front)
    triangles.sort((a, b) => b.zAvg - a.zAvg);
    
    // 5. Render 3D Black Chrome Head (50.4k Triangles Generated, ~25.2k Rendered after Culling)
    // Light from top-right-front
    const lightDir = { x: 0.7, y: 0.5, z: -0.8 }; 
    const lLen = Math.sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z);
    lightDir.x /= lLen; lightDir.y /= lLen; lightDir.z /= lLen;
    
    ctx.lineJoin = 'round';
    
    for (const t of triangles) {
        let dot = t.nx * lightDir.x + t.ny * lightDir.y + t.nz * lightDir.z;
        if (isShattered) dot = Math.abs(dot); // Double-sided lighting if fragments spin
        
        const diffuse = Math.max(0, dot);
        
        // View direction is towards the camera (-z)
        const viewDir = { x: 0, y: 0, z: -1 };
        let nx = t.nx, ny = t.ny, nz = t.nz;
        if (isShattered && dot < 0) { nx = -nx; ny = -ny; nz = -nz; }
        
        const halfX = lightDir.x + viewDir.x;
        const halfY = lightDir.y + viewDir.y;
        const halfZ = lightDir.z + viewDir.z;
        const halfLen = Math.sqrt(halfX*halfX + halfY*halfY + halfZ*halfZ);
        const specAngle = Math.max(0, nx * (halfX/halfLen) + ny * (halfY/halfLen) + nz * (halfZ/halfLen));
        const specular = Math.pow(specAngle, 14);
        
        // Base Wireframe Colors (Neon Cyan / Purple Cyberpunk aesthetic)
        let hue = 180 + (t.isMouth * 120) + (t.isEye * 50) + (audio.time * 20) % 360;
        let saturation = 80 + (energy * 20);
        let lightness = 20 + diffuse * 30 + specular * 50;
        
        // Eyes glow bright on high frequency
        if (t.isEye > 0.4) {
            lightness += treble * 50;
            hue = 300; // Purple/Pink eyes
        }
        
        // Mouth glows bright on vocals
        if (t.isMouth > 0.4) {
            lightness += mid * 60;
            hue = 330; // Red/Pink mouth
        }
        
        ctx.beginPath();
        ctx.moveTo(t.vA.px, t.vA.py);
        ctx.lineTo(t.vB.px, t.vB.py);
        ctx.lineTo(t.vC.px, t.vC.py);
        ctx.closePath();
        
        // Very subtle dark translucent fill to hide back lines
        ctx.fillStyle = `hsla(${hue}, 10%, 2%, 0.7)`;
        ctx.fill();
        
        // Cyberpunk Wireframe Stroke
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 + energy * 0.5})`;
        ctx.lineWidth = 1.0 + energy * 1.5;
        ctx.stroke();
    }
    
    // 6. Mouth Smoke Emission
    const mouthRow = Math.floor(this.rows * 0.8);
    const mouthCol = Math.floor(this.cols / 2);
    const mouthVertex = this.grid[mouthRow][mouthCol];
    
    if (jawDrop > 12 || Math.random() > 0.88) {
        this.smoke.push({
            x: mouthVertex.px,
            y: mouthVertex.py,
            vx: (Math.random() - 0.5) * 5,
            vy: -1 - Math.random() * 4, // Smoke rises up
            life: 1.0,
            maxLife: 35 + Math.random() * 40,
            size: 15 + Math.random() * 30 * scale,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08
        });
    }
    
    // 7. Render Smoke Particles
    for (let i = this.smoke.length - 1; i >= 0; i--) {
        const s = this.smoke[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.angle += s.rotSpeed;
        s.life -= 1 / s.maxLife;
        
        if (s.life <= 0) {
            this.smoke.splice(i, 1);
            continue;
        }
        
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s.size);
        grad.addColorStop(0, `rgba(180, 190, 210, ${0.25 * Math.max(0, s.life)})`);
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
  }
}
