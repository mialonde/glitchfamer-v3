import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

interface CyberVertex {
  x: number;       // Base local coordinate
  y: number;
  z: number;
  currentX: number; // Displaced coordinate
  currentY: number;
  currentZ: number;
  vx: number;       // Particle physics velocity during drop
  vy: number;
  vz: number;
  shatterDirX: number; // Random directional vector for explosive shattering
  shatterDirY: number;
  shatterDirZ: number;
  isMouth: boolean;
}

interface CyberFace {
  a: number; // Indices of connected vertices
  b: number;
  c: number;
}

interface GeometricSphere {
  radius: number;
  rotationX: number;
  rotationY: number;
  speedX: number;
  speedY: number;
  colorType: 'primary' | 'secondary' | 'accent';
}

export class NeuralNoirVisualizer implements IVisualizer {
  public name = 'Neural Noir';

  private vertices: CyberVertex[] = [];
  private faces: CyberFace[] = [];
  private geometricSpheres: GeometricSphere[] = [];
  
  private time = 0;
  private rotationAngleY = 0;
  private rotationAngleX = 0;
  private explosionFactor = 0; // 0 = fully assembled head, 1 = exploded particle cloud
  private lastBeat = false;
  private beatMultiplier = 1.0;
  private peakEnergyHistory: number[] = [];

  // Drop State Machine
  private state: 'VERSE' | 'CHORUS' | 'DROP' = 'VERSE';
  private transitionTimer = 0;

  constructor() {
    this.generateProceduralFace();
    this.initGeometricSpheres();
  }

  private generateProceduralFace() {
    this.vertices = [];
    this.faces = [];

    // Let's generate a beautiful low-poly cybernetic face mask
    const rows = 12;
    const cols = 12;

    for (let r = 0; r < rows; r++) {
      const phi = (r / (rows - 1)) * Math.PI; // 0 to PI
      const y = Math.cos(phi) * 120; // Height

      for (let c = 0; c < cols; c++) {
        const theta = (c / (cols - 1)) * Math.PI - Math.PI / 2; // -PI/2 to PI/2 (front semi-sphere)
        
        // Human face contour shaping (nose, chin, eyes)
        let radius = 100;
        
        // Nose bridge (center vertical line)
        if (Math.abs(theta) < 0.25 && r > 3 && r < 7) {
          radius += 25 * (1.0 - Math.abs(theta) / 0.25);
        }
        // Mouth cavity indentations
        const isMouth = r === 8 && Math.abs(theta) < 0.35;
        if (isMouth) {
          radius -= 8;
        }
        // Cheekbones
        if (Math.abs(theta) > 0.4 && Math.abs(theta) < 0.8 && r > 4 && r < 7) {
          radius += 12;
        }

        const x = Math.sin(phi) * Math.sin(theta) * radius;
        const z = Math.sin(phi) * Math.cos(theta) * radius;

        // Generate explosive directional vector
        const angle = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI;

        this.vertices.push({
          x,
          y,
          z,
          currentX: x,
          currentY: y,
          currentZ: z,
          vx: 0,
          vy: 0,
          vz: 0,
          shatterDirX: Math.cos(pitch) * Math.sin(angle),
          shatterDirY: Math.sin(pitch),
          shatterDirZ: Math.cos(pitch) * Math.cos(angle),
          isMouth
        });
      }
    }

    // Build low-poly triangular faces between rows/columns
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const i00 = r * cols + c;
        const i10 = (r + 1) * cols + c;
        const i01 = r * cols + (c + 1);
        const i11 = (r + 1) * cols + (c + 1);

        // Grid mesh triangulation
        this.faces.push({ a: i00, b: i10, c: i01 });
        this.faces.push({ a: i01, b: i10, c: i11 });
      }
    }
  }

  private initGeometricSpheres() {
    this.geometricSpheres = [
      { radius: 170, rotationX: 0, rotationY: 0, speedX: 0.12, speedY: 0.2, colorType: 'primary' },
      { radius: 210, rotationX: Math.PI / 4, rotationY: 0, speedX: -0.15, speedY: 0.1, colorType: 'secondary' },
      { radius: 250, rotationX: -Math.PI / 4, rotationY: Math.PI / 2, speedX: 0.08, speedY: -0.18, colorType: 'accent' }
    ];
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    
    this.time += 0.016 * speed;

    const bass = audio.bassEnergy ?? audio.kick ?? 0.1;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.1;
    const energy = audio.energy ?? 0.2;

    // --- Dynamic State Machine detection ---
    // Smooth peak history to avoid flickering state changes
    this.peakEnergyHistory.push(energy);
    if (this.peakEnergyHistory.length > 30) this.peakEnergyHistory.shift();
    const averageEnergy = this.peakEnergyHistory.reduce((a, b) => a + b, 0) / this.peakEnergyHistory.length;

    if (energy > 0.65 && averageEnergy > 0.45) {
      this.state = 'DROP';
    } else if (energy > 0.35 || bass > 0.5) {
      this.state = 'CHORUS';
    } else {
      this.state = 'VERSE';
    }

    // --- 1. VERSE State: Slow Noir Rotation & Low Brightness ---
    let targetRotationSpeed = 0.12;
    if (this.state === 'CHORUS') targetRotationSpeed = 0.35;
    if (this.state === 'DROP') targetRotationSpeed = 0.95;

    this.rotationAngleY += targetRotationSpeed * 0.05 * speed * (1.0 + bass * 0.5);
    this.rotationAngleX = Math.sin(this.time * 0.4) * 0.15;

    // --- 2. DROP State: Complete Object Explosion & Reformation ---
    if (this.state === 'DROP') {
      // Explode the mask outwards dynamically based on beat/energy spikes
      const targetExplosion = 0.1 + energy * 0.8 * beatSens;
      this.explosionFactor += (targetExplosion - this.explosionFactor) * 0.22;
    } else {
      // Verse/Chorus: Seamlessly pull the particles back into place (re-merge!)
      this.explosionFactor += (0 - this.explosionFactor) * 0.15;
    }

    // --- 3. CHORUS State: Mesh Shatter, Geometric Spheres Multiply ---
    // Calculate vertices with lip-sync, bass-shattering, and explosion
    this.vertices.forEach((v) => {
      // Base mesh vibration driven by Bass
      const bassDisplace = Math.sin(this.time * 25 + v.y) * bass * 12 * beatSens;

      // Vocal Lip Sync: Move mouth vertices based on vocal energy
      let mouthDisplaceY = 0;
      let mouthDisplaceZ = 0;
      if (v.isMouth) {
        mouthDisplaceY = -vocal * 22 * beatSens;
        mouthDisplaceZ = vocal * 8 * beatSens;
      }

      // Explosion physics offset during DROP
      const explodeOffset = this.explosionFactor * 240;

      v.currentX = v.x + v.shatterDirX * explodeOffset;
      v.currentY = v.y + v.shatterDirY * explodeOffset + mouthDisplaceY;
      v.currentZ = v.z + v.shatterDirZ * explodeOffset + bassDisplace + mouthDisplaceZ;
    });

    // Rotate Concentric Geometric Spheres
    this.geometricSpheres.forEach((sphere) => {
      sphere.rotationX += sphere.speedX * 0.05 * speed * (1.0 + bass * 0.8);
      sphere.rotationY += sphere.speedY * 0.05 * speed;
    });
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, settings, audio } = context;
    const primaryColor = settings.primaryColor || '#FFD700';
    const secondaryColor = settings.secondaryColor || '#FFFFFF';
    const accentColor = '#FF0055'; // Cyberpunk neon pink accent

    const centerX = width / 2;
    const centerY = height / 2;

    const bass = audio.bassEnergy ?? audio.kick ?? 0.1;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.1;
    const energy = audio.energy ?? 0.2;

    // Draw Brutalist Cyber background
    ctx.fillStyle = '#030206';
    ctx.fillRect(0, 0, width, height);

    // Dynamic scanner line effect (grid tarama çizgileri)
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 3D Projection Matrix Transform Helper
    const cosY = Math.cos(this.rotationAngleY);
    const sinY = Math.sin(this.rotationAngleY);
    const cosX = Math.cos(this.rotationAngleX);
    const sinX = Math.sin(this.rotationAngleX);

    // Project 3D vertex to 2D Screen
    const project = (x: number, y: number, z: number) => {
      // 1. Rotate Y
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // 2. Rotate X
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // 3. Perspective Projection
      const focalLength = 350;
      const zDepth = focalLength + z2;
      const scale = zDepth > 20 ? focalLength / zDepth : 0.001;
      
      return {
        sx: centerX + x1 * scale,
        sy: centerY - y2 * scale,
        scale,
        depth: z2
      };
    };

    // --- 1. RENDER CHORUS: Concentric Geometric Spheres ---
    // Spheres are only visible during CHORUS or DROP states to signify complexity multiplication
    if (this.state === 'CHORUS' || this.state === 'DROP') {
      ctx.save();
      this.geometricSpheres.forEach((sphere, idx) => {
        // Multiply spheres dynamically (Render more if drop is active)
        if (this.state === 'VERSE') return;
        if (idx === 2 && this.state !== 'DROP') return; // Third sphere only during drop!

        const sphereColor = sphere.colorType === 'primary' 
          ? primaryColor 
          : sphere.colorType === 'secondary' 
            ? secondaryColor 
            : accentColor;

        ctx.strokeStyle = sphereColor;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.08 + (idx === 0 ? bass * 0.15 : vocal * 0.1);

        // Draw multiple latitude bands
        const bands = 8;
        for (let b = 0; b < bands; b++) {
          const latAngle = (b / bands) * Math.PI - Math.PI / 2;
          const bandRadius = sphere.radius * Math.cos(latAngle);
          const bandY = sphere.radius * Math.sin(latAngle);

          ctx.beginPath();
          // Draw 36 segment circle projected
          for (let s = 0; s <= 36; s++) {
            const rotTheta = (s / 36) * Math.PI * 2;
            const lx = Math.cos(rotTheta) * bandRadius;
            const lz = Math.sin(rotTheta) * bandRadius;

            // Apply sphere's unique 3D rotation matrix
            const cX = Math.cos(sphere.rotationX);
            const sX = Math.sin(sphere.rotationX);
            const cY = Math.cos(sphere.rotationY);
            const sY = Math.sin(sphere.rotationY);

            // Sphere rot X then Y
            const rx1 = lx;
            const ry1 = bandY * cX - lz * sX;
            const rz1 = bandY * sX + lz * cX;

            const rx2 = rx1 * cY - rz1 * sY;
            const ry2 = ry1;
            const rz2 = rx1 * sY + rz1 * cY;

            const proj = project(rx2, ry2, rz2);
            if (s === 0) ctx.moveTo(proj.sx, proj.sy);
            else ctx.lineTo(proj.sx, proj.sy);
          }
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // --- 2. PROJECT VERTICES ---
    const projected = this.vertices.map((v) => project(v.currentX, v.currentY, v.currentZ));

    // --- 3. RENDER VERSE: Dark Wireframe ---
    // Under VERSE, draw subtle lines. Under CHORUS, lines become bright neon.
    const isDrop = this.state === 'DROP';
    const isChorus = this.state === 'CHORUS';

    ctx.save();
    
    // Draw wireframe faces
    this.faces.forEach((face) => {
      const pA = projected[face.a];
      const pB = projected[face.b];
      const pC = projected[face.c];

      // Draw lines
      ctx.beginPath();
      ctx.moveTo(pA.sx, pA.sy);
      ctx.lineTo(pB.sx, pB.sy);
      ctx.lineTo(pC.sx, pC.sy);
      ctx.closePath();

      // Style
      let wireOpacity = 0.05; // Verse: very dark wireframe
      if (isChorus) wireOpacity = 0.12 + vocal * 0.15;
      if (isDrop) wireOpacity = 0.03 + (1.0 - this.explosionFactor) * 0.15; // Fades as it explodes

      ctx.strokeStyle = isChorus 
        ? primaryColor 
        : isDrop 
          ? accentColor 
          : 'rgba(100, 110, 130, 0.4)'; // Charcoal wireframe during Verse
      
      ctx.lineWidth = isChorus ? 0.8 : 0.4;
      ctx.globalAlpha = wireOpacity;
      ctx.stroke();

      // Face filling (subtle translucent grid depth)
      if (isChorus || isDrop) {
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = isDrop ? 0.005 : 0.02 * vocal;
        ctx.fill();
      }
    });

    ctx.restore();

    // --- 4. RENDER DROP: Exploding Particle Sparks ---
    // Draw vertices as bright neon physical particles
    ctx.save();
    projected.forEach((p, idx) => {
      const v = this.vertices[idx];
      
      // Determine node size & glow
      let size = 1.0;
      let alpha = 0.2;
      let nodeColor = secondaryColor;

      if (v.isMouth) {
        // Highlight mouth / face contour features based on vocal volume
        size = 2.0 + vocal * 4;
        alpha = 0.4 + vocal * 0.6;
        nodeColor = primaryColor;
      } else if (isDrop) {
        // High glow drop particles
        size = 1.5 + Math.random() * 2.0;
        alpha = 0.6 + Math.random() * 0.4;
        nodeColor = idx % 2 === 0 ? primaryColor : accentColor;
      } else if (isChorus) {
        size = 1.2;
        alpha = 0.3 + bass * 0.4;
      }

      ctx.fillStyle = nodeColor;
      ctx.globalAlpha = alpha;
      
      ctx.beginPath();
      // Adjust particle radius by perspective projection scale
      ctx.arc(p.sx, p.sy, size * p.scale, 0, Math.PI * 2);
      ctx.fill();

      // Glow backing during high energy
      if (isDrop && Math.random() > 0.75) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = accentColor;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, (size + 1) * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // Show state feedback text in standard minimalist cyberpunk branding style
    ctx.save();
    ctx.font = '8px monospace';
    ctx.fillStyle = isDrop ? accentColor : isChorus ? primaryColor : '#71717a';
    ctx.fillText(`NEURAL SYSTEM STATE: ${this.state}`, 25, height - 25);
    ctx.fillText(`EXP_FACTOR: ${Number(this.explosionFactor || 0).toFixed(3)}`, 25, height - 15);
    ctx.restore();
  }
}
