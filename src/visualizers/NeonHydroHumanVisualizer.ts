import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface HydroParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
}

interface HydroRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Joint3D {
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  screenZ: number;
  radius: number;
}

interface LimbSegment {
  j1: Joint3D;
  j2: Joint3D;
  r1: number;
  r2: number;
  zAvg: number;
  type: 'torso' | 'head' | 'limb';
}

export class NeonHydroHumanVisualizer implements IVisualizer {
  public name = 'NEON_HYDRO_HUMAN';

  private particles: HydroParticle[] = [];
  private ripples: HydroRipple[] = [];
  private dancePhase = 0;
  private walkPhase = 0;
  private bodyYaw = 0;
  private currentStageX = 0;
  private riseAmount = 0; // 0 = flat calm water pool on floor, 1 = fully upright glowing hydro human
  private lastKick = 0;
  private colorHue = 185; // Starting with Cyan/Aqua (185deg)

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const mid = audio.midEnergy ?? audio.snare ?? 0;
    const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
    const energy = audio.energy ?? 0;
    const speed = (settings.visSpeed ?? 1.0) * (0.8 + energy * 1.5);

    // 1. Silent / Idle vs Active Rise Management
    const isAudioActive = !audio.isSilence && energy > 0.035;
    const targetRise = isAudioActive ? 1.0 : 0.0;
    const riseLerpSpeed = isAudioActive ? 0.045 : 0.03;
    this.riseAmount += (targetRise - this.riseAmount) * riseLerpSpeed;
    if (this.riseAmount < 0.002) this.riseAmount = 0;
    if (this.riseAmount > 0.998) this.riseAmount = 1;

    // 2. Dance Phrasing, Stage Locomotion & 3D Spin
    if (this.riseAmount > 0.02) {
      this.dancePhase += 0.045 * speed;
      this.walkPhase += 0.024 * speed;

      // 3D Body Turn & Pirouettes
      const spinBoost = bass > 0.6 ? 0.035 : (mid > 0.5 ? 0.02 : 0.008);
      this.bodyYaw += (0.014 + spinBoost) * speed;
    }

    // 3. Melody & Harmonic Color Shift (Cyan -> Electric Blue -> Violet -> Magenta -> Gold)
    const targetHueShift = (mid * 80 + treble * 120 + audio.time * 20) % 360;
    this.colorHue = (this.colorHue + 0.4 + targetHueShift * 0.02) % 360;

    // 4. Bass Ripples in Pool (anchored to feet on floor)
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    if (this.riseAmount > 0.15 && bass > 0.38 && (bass - this.lastKick > 0.1 || Math.random() > 0.75)) {
      if (this.ripples.length < 14) {
        this.ripples.push({
          x: 0,
          y: 0,
          radius: 8,
          maxRadius: 200 + bass * 160 * beatSens,
          alpha: 1.0,
          color: `hsl(${this.colorHue}, 100%, 65%)`
        });
      }

      // Hydro Mist & Water Splashes
      if (this.riseAmount > 0.5) {
        const splashCount = Math.floor(2 + bass * 6);
        for (let s = 0; s < splashCount && this.particles.length < 50; s++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 4 * bass;
          const dist = 30 + Math.random() * 60;
          this.particles.push({
            x: Math.cos(angle) * dist,
            y: -100 - Math.random() * 80,
            z: Math.sin(angle) * dist,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 1,
            vz: (Math.random() - 0.5) * spd,
            radius: 2 + Math.random() * 3.5 * bass,
            alpha: 0.9,
            color: `hsl(${(this.colorHue + (Math.random() - 0.5) * 40 + 360) % 360}, 100%, 70%)`,
            life: 1.0
          });
        }
      }
    }
    this.lastKick = bass;

    // Update Hydro Mist Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.vy += 0.05;
      p.life -= 0.03;
      p.alpha = Math.max(0, p.life * this.riseAmount);
      if (p.life <= 0 || p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Water Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 5.0 * speed;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, interaction } = context;
    const centerX = width / 2;
    const minDim = Math.min(width, height);
    const scale = (settings.visScale ?? 1.0) * (minDim / 680);
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const mid = audio.midEnergy ?? audio.snare ?? 0;
    const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
    const glow = settings.visGlow ?? 0.85;

    // Dynamic Color Calculation
    const primaryNeon = `hsl(${this.colorHue}, 100%, 65%)`;
    const secondaryNeon = `hsl(${(this.colorHue + 60) % 360}, 100%, 55%)`;
    const coreColor = '#FFFFFF';

    // 1. Stage Locomotion & Navigation (Dancing across the stage left & right)
    const travelRange = (width * 0.22) * (settings.visScale ?? 1.0);
    const targetTravelX = Math.sin(this.walkPhase * 0.7) * travelRange + Math.sin(this.walkPhase * 0.3) * (travelRange * 0.4);
    const userSway = interaction?.isPointerDown ? (interaction.pointerX - centerX) * 0.4 : 0;

    this.currentStageX += ((targetTravelX + userSway) - this.currentStageX) * 0.08;
    const dancerCenterX = centerX + this.currentStageX;

    const floorY = height * 0.80;

    ctx.save();

    // 2. Deep Oceanic Dark Background
    const bgGrad = ctx.createRadialGradient(dancerCenterX, floorY - 140, 50, dancerCenterX, floorY, minDim * 0.9);
    bgGrad.addColorStop(0, `hsla(${this.colorHue}, 80%, 10%, 0.85)`);
    bgGrad.addColorStop(0.6, '#030811');
    bgGrad.addColorStop(1, '#000205');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Transparent Water Pool on Floor (Following dancer)
    const poolSpread = 1.0 + (1.0 - this.riseAmount) * 0.35 + bass * 0.18;
    const poolRadiusX = 185 * scale * poolSpread;
    const poolRadiusY = 42 * scale * poolSpread;

    ctx.save();
    ctx.translate(dancerCenterX, floorY);

    // Bioluminescent Caustics Glow
    const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, poolRadiusX);
    poolGrad.addColorStop(0, `hsla(${this.colorHue}, 100%, 75%, 0.8)`);
    poolGrad.addColorStop(0.35, `hsla(${this.colorHue}, 90%, 50%, 0.45)`);
    poolGrad.addColorStop(0.8, `hsla(${(this.colorHue + 40) % 360}, 100%, 40%, 0.2)`);
    poolGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.ellipse(0, 0, poolRadiusX, poolRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = poolGrad;
    ctx.fill();

    // Concentric Bass Ripples in Pool
    for (const r of this.ripples) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r.radius * scale, r.radius * 0.22 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = Math.max(1.2, 3 * r.alpha);
      ctx.globalAlpha = r.alpha * 0.85;
      if (glow > 0.1) {
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10 * glow;
      }
      ctx.stroke();
    }
    ctx.restore();

    // If completely calm in pool (silent parts / beginning), do not render upright body
    if (this.riseAmount <= 0.005) {
      ctx.restore();
      return;
    }

    // 4. Full 3D Dancing Hydro Kinematics
    const rise = this.riseAmount;
    const phase = this.dancePhase;
    const yaw = this.bodyYaw;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    // Dynamic Multi-Joint Dance Curves
    // A. Bass: Pelvic bounce, deep knee bends and chest accents
    const bassSquat = (Math.sin(phase * 2) * 0.5 + 0.5) * (18 * scale * rise * (1 + bass * 0.8));
    const pelvisSwayX = Math.sin(phase) * (15 * scale * rise);
    const pelvisTiltZ = Math.cos(phase * 1.5) * (15 * scale * rise);

    // B. Mid: Torso wave, serpentine spine snake & arm choreography
    const spineWaveX = Math.sin(phase * 1.8 + Math.PI / 4) * (22 * scale * rise * (0.6 + mid * 0.8));
    const spineWaveZ = Math.cos(phase * 1.8) * (18 * scale * rise * (0.6 + mid * 0.8));
    const armWave1 = Math.sin(phase * 2) * (40 * rise * (0.7 + mid * 0.6));
    const armWave2 = Math.cos(phase * 2) * (40 * rise * (0.7 + mid * 0.6));
    const armRaise = (Math.sin(phase * 0.8) * 0.5 + 0.5) * (48 * scale * rise);

    // C. Treble: Head nod and wrist/hand flickers
    const headNodY = Math.sin(phase * 4) * (5 * scale * rise * (0.5 + treble * 0.9));
    const handFlicker = Math.sin(phase * 6) * (8 * scale * rise * treble);

    // Helper: 3D to 2D projection function
    const projectJoint = (localX: number, localY: number, localZ: number, radius: number): Joint3D => {
      const rotX = localX * cosY + localZ * sinY;
      const rotZ = -localX * sinY + localZ * cosY;
      const rotY = localY;

      const fov = 650;
      const persScale = fov / (fov + rotZ);

      return {
        x: rotX,
        y: rotY,
        z: rotZ,
        screenX: dancerCenterX + rotX * persScale,
        screenY: floorY - (localY * persScale),
        screenZ: rotZ,
        radius: radius * persScale
      };
    };

    // Joint Positions
    const footLX = -38 * scale + Math.sin(phase) * (10 * scale);
    const footLZ = Math.cos(phase) * (15 * scale);
    const footRX = 38 * scale - Math.sin(phase) * (10 * scale);
    const footRZ = -Math.cos(phase) * (15 * scale);

    const jFootL = projectJoint(footLX, 0, footLZ, 10 * scale * rise);
    const jFootR = projectJoint(footRX, 0, footRZ, 10 * scale * rise);

    const kneeY = (46 * scale * rise) - (bassSquat * 0.6);
    const jKneeL = projectJoint(footLX * 0.85 + pelvisSwayX * 0.3, kneeY, footLZ * 0.5 + 16 * scale, 13 * scale * rise);
    const jKneeR = projectJoint(footRX * 0.85 + pelvisSwayX * 0.3, kneeY, footRZ * 0.5 + 16 * scale, 13 * scale * rise);

    const hipY = (90 * scale * rise) - bassSquat;
    const jHip = projectJoint(pelvisSwayX, hipY, pelvisTiltZ, 24 * scale * rise);

    const chestY = (176 * scale * rise) - (bassSquat * 0.4);
    const jChest = projectJoint(pelvisSwayX + spineWaveX, chestY, pelvisTiltZ + spineWaveZ, 30 * scale * rise);

    const neckY = (218 * scale * rise) - (bassSquat * 0.2);
    const jNeck = projectJoint(pelvisSwayX + spineWaveX * 1.1, neckY, pelvisTiltZ + spineWaveZ * 1.1, 18 * scale * rise);

    const headY = (256 * scale * rise) + headNodY - (bassSquat * 0.1);
    const jHead = projectJoint(pelvisSwayX + spineWaveX * 1.2, headY, pelvisTiltZ + spineWaveZ * 1.2, (22 + bass * 4) * scale * rise);

    const jShoulderL = projectJoint(jChest.x - 50 * scale, chestY + 6 * scale, jChest.z - 8 * scale, 15 * scale * rise);
    const jShoulderR = projectJoint(jChest.x + 50 * scale, chestY + 6 * scale, jChest.z + 8 * scale, 15 * scale * rise);

    const elbowLY = chestY - 10 * scale + armRaise * 0.6;
    const elbowRY = chestY - 10 * scale + armRaise * 0.6;
    const jElbowL = projectJoint(jShoulderL.x - 32 * scale - armWave1 * 0.4, elbowLY, jShoulderL.z + armWave2 * 0.5, 13 * scale * rise);
    const jElbowR = projectJoint(jShoulderR.x + 32 * scale + armWave2 * 0.4, elbowRY, jShoulderR.z - armWave1 * 0.5, 13 * scale * rise);

    const handLY = elbowLY + 32 * scale - armRaise - (bass * 20 * scale) + handFlicker;
    const handRY = elbowRY + 32 * scale - armRaise - (bass * 20 * scale) - handFlicker;
    const jHandL = projectJoint(jElbowL.x - 22 * scale - armWave1 * 0.7, handLY, jElbowL.z + armWave2 * 0.8, 10 * scale * rise);
    const jHandR = projectJoint(jElbowR.x + 22 * scale + armWave2 * 0.7, handRY, jElbowR.z - armWave1 * 0.8, 10 * scale * rise);

    // 5. Build Z-Sorted Limb List for 3D Volumetric Depth
    const limbs: LimbSegment[] = [
      { j1: jHip, j2: jKneeL, r1: 18 * scale * rise, r2: 13 * scale * rise, zAvg: (jHip.screenZ + jKneeL.screenZ) / 2, type: 'limb' },
      { j1: jKneeL, j2: jFootL, r1: 13 * scale * rise, r2: 10 * scale * rise, zAvg: (jKneeL.screenZ + jFootL.screenZ) / 2, type: 'limb' },
      { j1: jHip, j2: jKneeR, r1: 18 * scale * rise, r2: 13 * scale * rise, zAvg: (jHip.screenZ + jKneeR.screenZ) / 2, type: 'limb' },
      { j1: jKneeR, j2: jFootR, r1: 13 * scale * rise, r2: 10 * scale * rise, zAvg: (jKneeR.screenZ + jFootR.screenZ) / 2, type: 'limb' },
      { j1: jHip, j2: jChest, r1: 24 * scale * rise, r2: 30 * scale * rise, zAvg: (jHip.screenZ + jChest.screenZ) / 2, type: 'torso' },
      { j1: jChest, j2: jNeck, r1: 30 * scale * rise, r2: 18 * scale * rise, zAvg: (jChest.screenZ + jNeck.screenZ) / 2, type: 'torso' },
      { j1: jShoulderL, j2: jElbowL, r1: 15 * scale * rise, r2: 12 * scale * rise, zAvg: (jShoulderL.screenZ + jElbowL.screenZ) / 2, type: 'limb' },
      { j1: jElbowL, j2: jHandL, r1: 12 * scale * rise, r2: 9 * scale * rise, zAvg: (jElbowL.screenZ + jHandL.screenZ) / 2, type: 'limb' },
      { j1: jShoulderR, j2: jElbowR, r1: 15 * scale * rise, r2: 12 * scale * rise, zAvg: (jShoulderR.screenZ + jElbowR.screenZ) / 2, type: 'limb' },
      { j1: jElbowR, j2: jHandR, r1: 12 * scale * rise, r2: 9 * scale * rise, zAvg: (jElbowR.screenZ + jHandR.screenZ) / 2, type: 'limb' },
    ];

    limbs.sort((a, b) => a.zAvg - b.zAvg);

    // Helper: Draw a Luminous Transparent Hydro Water Limb
    const drawHydroCapsule = (seg: LimbSegment) => {
      const { j1, j2, r1, r2 } = seg;
      const dx = j2.screenX - j1.screenX;
      const dy = j2.screenY - j1.screenY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return;

      const angle = Math.atan2(dy, dx);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);

      const wave1 = Math.sin(phase * 3.5 + j1.screenY * 0.08) * (3 * mid * rise + bass * 1.5);
      const wave2 = Math.cos(phase * 3.5 + j2.screenY * 0.08) * (3 * mid * rise + bass * 1.5);

      ctx.beginPath();
      ctx.moveTo(j1.screenX + nx * (r1 + wave1), j1.screenY + ny * (r1 + wave1));
      ctx.lineTo(j2.screenX + nx * (r2 + wave2), j2.screenY + ny * (r2 + wave2));
      ctx.arc(j2.screenX, j2.screenY, Math.max(1, r2 + wave2), angle - Math.PI / 2, angle + Math.PI / 2);
      ctx.lineTo(j1.screenX - nx * (r1 + wave1), j1.screenY - ny * (r1 + wave1));
      ctx.arc(j1.screenX, j1.screenY, Math.max(1, r1 + wave1), angle + Math.PI / 2, angle - Math.PI / 2);
      ctx.closePath();

      // Transparent Liquid Fill
      const grad = ctx.createLinearGradient(
        j1.screenX - nx * r1, j1.screenY - ny * r1,
        j1.screenX + nx * r1, j1.screenY + ny * r1
      );
      grad.addColorStop(0, `hsla(${this.colorHue}, 100%, 75%, 0.35)`);
      grad.addColorStop(0.5, `hsla(${(this.colorHue + 30) % 360}, 95%, 45%, 0.15)`);
      grad.addColorStop(1, `hsla(${this.colorHue}, 100%, 85%, 0.45)`);

      ctx.fillStyle = grad;
      ctx.fill();

      // Glowing Neon Edge
      ctx.strokeStyle = primaryNeon;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85 * rise;
      if (glow > 0.1) {
        ctx.shadowColor = primaryNeon;
        ctx.shadowBlur = 8 * glow;
      }
      ctx.stroke();
    };

    // Helper: Draw Head
    const drawHead = () => {
      const headRadius = jHead.radius;
      if (headRadius <= 1) return;

      const headGrad = ctx.createRadialGradient(
        jHead.screenX - headRadius * 0.2,
        jHead.screenY - headRadius * 0.2,
        0,
        jHead.screenX,
        jHead.screenY,
        headRadius
      );
      headGrad.addColorStop(0, coreColor);
      headGrad.addColorStop(0.3, primaryNeon);
      headGrad.addColorStop(0.75, `hsla(${this.colorHue}, 100%, 50%, 0.3)`);
      headGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(jHead.screenX, jHead.screenY, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.strokeStyle = primaryNeon;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    };

    // 6. Draw 3D Grounded Neon Hydro Dancer
    for (const seg of limbs) {
      drawHydroCapsule(seg);
      if (seg.type === 'torso' && jHead.screenZ <= seg.zAvg) {
        drawHead();
      }
    }
    if (jHead.screenZ > limbs[limbs.length - 1].zAvg) {
      drawHead();
    }

    // 7. Internal Bioluminescent Neon Heart & Vascular Nodes (Beating in 3D)
    if (this.riseAmount > 0.5) {
      const heartPulse = (11 + bass * 15 + mid * 8) * scale * rise;

      // Glowing Neon Heart Core (Z-depth projected)
      const heartGrad = ctx.createRadialGradient(
        jChest.screenX, jChest.screenY + 12 * scale * rise,
        0,
        jChest.screenX, jChest.screenY + 12 * scale * rise,
        heartPulse * 1.5
      );
      heartGrad.addColorStop(0, '#FFFFFF');
      heartGrad.addColorStop(0.4, secondaryNeon);
      heartGrad.addColorStop(0.8, `hsla(${(this.colorHue + 60) % 360}, 100%, 50%, 0.35)`);
      heartGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(jChest.screenX, jChest.screenY + 12 * scale * rise, heartPulse * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = heartGrad;
      ctx.fill();

      // Vascular Energy Streams
      const energyNodes = [
        { x: jHead.screenX, y: jHead.screenY },
        { x: jHandL.screenX, y: jHandL.screenY },
        { x: jHandR.screenX, y: jHandR.screenY },
        { x: jKneeL.screenX, y: jKneeL.screenY },
        { x: jKneeR.screenX, y: jKneeR.screenY }
      ];

      ctx.lineWidth = 1.4;
      for (const node of energyNodes) {
        ctx.beginPath();
        ctx.moveTo(jChest.screenX, jChest.screenY + 12 * scale * rise);
        ctx.quadraticCurveTo(
          (jChest.screenX + node.x) / 2 + Math.sin(phase * 4) * 8,
          (jChest.screenY + node.y) / 2,
          node.x,
          node.y
        );
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = 0.75 * rise * (0.4 + bass * 0.6);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, (2.5 + treble * 3) * scale * rise, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    // 8. Hydro Splash & Mist Droplets (3D Projected)
    if (this.riseAmount > 0.4) {
      for (const p of this.particles) {
        const dropRotX = p.x * cosY + p.z * sinY;
        const dropRotZ = -p.x * sinY + p.z * cosY;
        const dropScreenX = dancerCenterX + dropRotX;
        const dropScreenY = (floorY - 160 * scale) + p.y * scale;

        ctx.beginPath();
        ctx.arc(dropScreenX, dropScreenY, Math.max(1, p.radius * scale), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (glow > 0.1) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6 * glow;
        }
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
