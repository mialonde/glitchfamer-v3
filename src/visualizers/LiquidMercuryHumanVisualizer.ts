import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface MercuryDroplet {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface MercuryRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  lineWidth: number;
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

export class LiquidMercuryHumanVisualizer implements IVisualizer {
  public name = 'LIQUID_MERCURY_HUMAN';
  
  private droplets: MercuryDroplet[] = [];
  private ripples: MercuryRipple[] = [];
  private dancePhase = 0;
  private walkPhase = 0;
  private bodyYaw = 0;
  private currentStageX = 0;
  private riseAmount = 0; // 0 = completely flat molten puddle on floor, 1 = fully upright dancing human
  private lastKick = 0;
  private lastTreble = 0;
  private glossShift = 0.85;

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
      this.dancePhase += 0.042 * speed;
      this.walkPhase += 0.022 * speed;

      // 3D Body Turn & Pirouettes: continuous fluid spin + speedup on intense drops
      const spinBoost = bass > 0.6 ? 0.035 : (mid > 0.5 ? 0.02 : 0.008);
      this.bodyYaw += (0.012 + spinBoost) * speed;
    }

    // 3. Vocal / Mid Specular Gloss Modulation
    this.glossShift += ((0.6 + mid * 0.45) - this.glossShift) * 0.15;

    // 4. Bass Shockwaves across puddle (anchored to feet on floor)
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    if (this.riseAmount > 0.15 && bass > 0.38 && (bass - this.lastKick > 0.1 || Math.random() > 0.78)) {
      if (this.ripples.length < 14) {
        this.ripples.push({
          x: 0,
          y: 0,
          radius: 8,
          maxRadius: 190 + bass * 150 * beatSens,
          alpha: 0.95,
          lineWidth: 2.5 + bass * 2
        });
      }
    }
    this.lastKick = bass;

    // 5. Treble Levitation Droplets (Mercury droplets breaking off hands/head when dancing)
    if (this.riseAmount > 0.6 && treble > 0.36 && (treble - this.lastTreble > 0.08 || Math.random() > 0.65)) {
      const dropCount = Math.floor(1 + treble * 4);
      for (let i = 0; i < dropCount && this.droplets.length < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 80;
        this.droplets.push({
          x: Math.cos(angle) * dist,
          y: -120 - Math.random() * 90,
          z: Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 2.5,
          vy: -1.2 - Math.random() * 3 * treble,
          vz: (Math.random() - 0.5) * 2.5,
          radius: 2 + Math.random() * 4 * treble,
          alpha: 1.0,
          life: 1.0,
          maxLife: 28 + Math.random() * 22
        });
      }
    }
    this.lastTreble = treble;

    // Update Levitating Mercury Droplets
    for (let i = this.droplets.length - 1; i >= 0; i--) {
      const d = this.droplets[i];
      d.x += d.vx;
      d.y += d.vy;
      d.z += d.vz;
      d.vy += 0.06; // gravity brings them back down toward puddle
      d.life -= 1 / d.maxLife;
      d.alpha = Math.max(0, d.life * this.riseAmount);
      if (d.life <= 0 || d.alpha <= 0) {
        this.droplets.splice(i, 1);
      }
    }

    // Update Puddle Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 4.5 * speed;
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
    const glow = settings.visGlow ?? 0.8;

    // 1. Stage Locomotion & Navigation (Dancing across the stage left & right)
    const travelRange = (width * 0.22) * (settings.visScale ?? 1.0);
    const targetTravelX = Math.sin(this.walkPhase * 0.7) * travelRange + Math.sin(this.walkPhase * 0.3) * (travelRange * 0.4);
    const userSway = interaction?.isPointerDown ? (interaction.pointerX - centerX) * 0.4 : 0;
    
    // Smooth stage position interpolation with subtle liquid lag
    this.currentStageX += ((targetTravelX + userSway) - this.currentStageX) * 0.08;
    const dancerCenterX = centerX + this.currentStageX;

    const floorY = height * 0.80; // Ground plane horizon

    ctx.save();

    // 2. Zifiri Karanlık & Aynalı Zemin (Mirrored Obsidian Floor Horizon)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, floorY);
    bgGrad.addColorStop(0, '#020204');
    bgGrad.addColorStop(0.7, '#07070d');
    bgGrad.addColorStop(1, '#0e0e18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, floorY);

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, '#12121f');
    floorGrad.addColorStop(0.35, '#080811');
    floorGrad.addColorStop(1, '#010103');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, width, height - floorY);

    // Floor Reflection Horizon Line
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Liquid Mercury Puddle on Floor (Elliptical Ground Projection that follows dancer)
    const puddleSpread = 1.0 + (1.0 - this.riseAmount) * 0.35 + bass * 0.18;
    const puddleRadiusX = 175 * scale * puddleSpread;
    const puddleRadiusY = 38 * scale * puddleSpread;

    ctx.save();
    ctx.translate(dancerCenterX, floorY);

    // Liquid Mercury Shimmer Base
    const puddleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, puddleRadiusX);
    puddleGrad.addColorStop(0, 'rgba(240, 245, 255, 0.95)');
    puddleGrad.addColorStop(0.35, 'rgba(170, 185, 215, 0.8)');
    puddleGrad.addColorStop(0.7, 'rgba(75, 85, 110, 0.45)');
    puddleGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.ellipse(0, 0, puddleRadiusX, puddleRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = puddleGrad;
    ctx.fill();

    // Subtle Mercury Surface Rim Light
    ctx.beginPath();
    ctx.ellipse(0, 0, puddleRadiusX * 0.95, puddleRadiusY * 0.95, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Liquid Shockwave Ripples in Puddle
    for (const r of this.ripples) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r.radius * scale, r.radius * 0.22 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.75})`;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();
    }
    ctx.restore();

    // If completely molten on floor (silence/beginning), do not render upright skeleton
    if (this.riseAmount <= 0.005) {
      ctx.restore();
      return;
    }

    // 4. Full 3D Dance Kinematics & Joint Calculations
    const rise = this.riseAmount; // 0.0 -> 1.0
    const phase = this.dancePhase;
    const yaw = this.bodyYaw;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    // Dynamic Multi-Joint Dance Curves
    // A. Bass: Pelvic bounce, deep knee bends and chest accents
    const bassSquat = (Math.sin(phase * 2) * 0.5 + 0.5) * (18 * scale * rise * (1 + bass * 0.8));
    const pelvisSwayX = Math.sin(phase) * (14 * scale * rise);
    const pelvisTiltZ = Math.cos(phase * 1.5) * (15 * scale * rise);

    // B. Mid: Torso wave, serpentine spine snake & arm choreography
    const spineWaveX = Math.sin(phase * 1.8 + Math.PI / 4) * (20 * scale * rise * (0.6 + mid * 0.8));
    const spineWaveZ = Math.cos(phase * 1.8) * (16 * scale * rise * (0.6 + mid * 0.8));
    const armWave1 = Math.sin(phase * 2) * (38 * rise * (0.7 + mid * 0.6));
    const armWave2 = Math.cos(phase * 2) * (38 * rise * (0.7 + mid * 0.6));
    const armRaise = (Math.sin(phase * 0.8) * 0.5 + 0.5) * (45 * scale * rise);

    // C. Treble: Head nod and wrist/hand flickers
    const headNodY = Math.sin(phase * 4) * (5 * scale * rise * (0.5 + treble * 0.9));
    const handFlicker = Math.sin(phase * 6) * (8 * scale * rise * treble);

    // Helper: 3D to 2D projection function
    const projectJoint = (localX: number, localY: number, localZ: number, radius: number): Joint3D => {
      // 3D rotation around Y-axis (Yaw rotation)
      const rotX = localX * cosY + localZ * sinY;
      const rotZ = -localX * sinY + localZ * cosY;
      const rotY = localY;

      // Perspective projection
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

    // Calculate 3D Joint Local Positions (Relative to floor at (0, 0, 0))
    // Feet: Grounded on floor, alternating dance step tap
    const footLX = -36 * scale + Math.sin(phase) * (10 * scale);
    const footLZ = Math.cos(phase) * (15 * scale);
    const footRX = 36 * scale - Math.sin(phase) * (10 * scale);
    const footRZ = -Math.cos(phase) * (15 * scale);

    const jFootL = projectJoint(footLX, 0, footLZ, 10 * scale * rise);
    const jFootR = projectJoint(footRX, 0, footRZ, 10 * scale * rise);

    // Knees (Bending forward & dynamically reacting to bass)
    const kneeY = (46 * scale * rise) - (bassSquat * 0.6);
    const jKneeL = projectJoint(footLX * 0.85 + pelvisSwayX * 0.3, kneeY, footLZ * 0.5 + 16 * scale, 12 * scale * rise);
    const jKneeR = projectJoint(footRX * 0.85 + pelvisSwayX * 0.3, kneeY, footRZ * 0.5 + 16 * scale, 12 * scale * rise);

    // Pelvis / Hips
    const hipY = (90 * scale * rise) - bassSquat;
    const jHip = projectJoint(pelvisSwayX, hipY, pelvisTiltZ, 22 * scale * rise);

    // Chest / Upper Torso
    const chestY = (176 * scale * rise) - (bassSquat * 0.4);
    const jChest = projectJoint(pelvisSwayX + spineWaveX, chestY, pelvisTiltZ + spineWaveZ, 28 * scale * rise);

    // Neck & Head
    const neckY = (218 * scale * rise) - (bassSquat * 0.2);
    const jNeck = projectJoint(pelvisSwayX + spineWaveX * 1.1, neckY, pelvisTiltZ + spineWaveZ * 1.1, 16 * scale * rise);

    const headY = (256 * scale * rise) + headNodY - (bassSquat * 0.1);
    const jHead = projectJoint(pelvisSwayX + spineWaveX * 1.2, headY, pelvisTiltZ + spineWaveZ * 1.2, (21 + bass * 3) * scale * rise);

    // Shoulders
    const jShoulderL = projectJoint(jChest.x - 48 * scale, chestY + 6 * scale, jChest.z - 8 * scale, 14 * scale * rise);
    const jShoulderR = projectJoint(jChest.x + 48 * scale, chestY + 6 * scale, jChest.z + 8 * scale, 14 * scale * rise);

    // Elbows & Hands (Liquid Arm Choreography)
    const elbowLY = chestY - 10 * scale + armRaise * 0.6;
    const elbowRY = chestY - 10 * scale + armRaise * 0.6;
    const jElbowL = projectJoint(jShoulderL.x - 30 * scale - armWave1 * 0.4, elbowLY, jShoulderL.z + armWave2 * 0.5, 12 * scale * rise);
    const jElbowR = projectJoint(jShoulderR.x + 30 * scale + armWave2 * 0.4, elbowRY, jShoulderR.z - armWave1 * 0.5, 12 * scale * rise);

    const handLY = elbowLY + 32 * scale - armRaise - (bass * 20 * scale) + handFlicker;
    const handRY = elbowRY + 32 * scale - armRaise - (bass * 20 * scale) - handFlicker;
    const jHandL = projectJoint(jElbowL.x - 22 * scale - armWave1 * 0.7, handLY, jElbowL.z + armWave2 * 0.8, 9 * scale * rise);
    const jHandR = projectJoint(jElbowR.x + 22 * scale + armWave2 * 0.7, handRY, jElbowR.z - armWave1 * 0.8, 9 * scale * rise);

    // 5. Build Z-Sorted Limb List for 3D Volumetric Depth
    const limbs: LimbSegment[] = [
      // Left Leg
      { j1: jHip, j2: jKneeL, r1: 17 * scale * rise, r2: 13 * scale * rise, zAvg: (jHip.screenZ + jKneeL.screenZ) / 2, type: 'limb' },
      { j1: jKneeL, j2: jFootL, r1: 13 * scale * rise, r2: 10 * scale * rise, zAvg: (jKneeL.screenZ + jFootL.screenZ) / 2, type: 'limb' },
      // Right Leg
      { j1: jHip, j2: jKneeR, r1: 17 * scale * rise, r2: 13 * scale * rise, zAvg: (jHip.screenZ + jKneeR.screenZ) / 2, type: 'limb' },
      { j1: jKneeR, j2: jFootR, r1: 13 * scale * rise, r2: 10 * scale * rise, zAvg: (jKneeR.screenZ + jFootR.screenZ) / 2, type: 'limb' },
      // Torso & Spine
      { j1: jHip, j2: jChest, r1: 22 * scale * rise, r2: 28 * scale * rise, zAvg: (jHip.screenZ + jChest.screenZ) / 2, type: 'torso' },
      { j1: jChest, j2: jNeck, r1: 28 * scale * rise, r2: 16 * scale * rise, zAvg: (jChest.screenZ + jNeck.screenZ) / 2, type: 'torso' },
      // Left Arm
      { j1: jShoulderL, j2: jElbowL, r1: 14 * scale * rise, r2: 11 * scale * rise, zAvg: (jShoulderL.screenZ + jElbowL.screenZ) / 2, type: 'limb' },
      { j1: jElbowL, j2: jHandL, r1: 11 * scale * rise, r2: 8 * scale * rise, zAvg: (jElbowL.screenZ + jHandL.screenZ) / 2, type: 'limb' },
      // Right Arm
      { j1: jShoulderR, j2: jElbowR, r1: 14 * scale * rise, r2: 11 * scale * rise, zAvg: (jShoulderR.screenZ + jElbowR.screenZ) / 2, type: 'limb' },
      { j1: jElbowR, j2: jHandR, r1: 11 * scale * rise, r2: 8 * scale * rise, zAvg: (jElbowR.screenZ + jHandR.screenZ) / 2, type: 'limb' },
    ];

    // Sort by depth (farthest back drawn first)
    limbs.sort((a, b) => a.zAvg - b.zAvg);

    // Helper: Draw a Chrome Liquid 3D Capsule between two projected joints
    const drawMercuryCapsule = (seg: LimbSegment) => {
      const { j1, j2, r1, r2 } = seg;
      const dx = j2.screenX - j1.screenX;
      const dy = j2.screenY - j1.screenY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return;

      const angle = Math.atan2(dy, dx);
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);

      // Liquid wavy ripple displacement
      const wave = Math.sin(phase * 3 + j1.screenY * 0.05) * (2.2 * mid * rise);

      ctx.beginPath();
      ctx.moveTo(j1.screenX + nx * (r1 + wave), j1.screenY + ny * (r1 + wave));
      ctx.lineTo(j2.screenX + nx * (r2 + wave), j2.screenY + ny * (r2 + wave));
      ctx.arc(j2.screenX, j2.screenY, Math.max(1, r2 + wave), angle - Math.PI / 2, angle + Math.PI / 2);
      ctx.lineTo(j1.screenX - nx * (r1 + wave), j1.screenY - ny * (r1 + wave));
      ctx.arc(j1.screenX, j1.screenY, Math.max(1, r1 + wave), angle + Math.PI / 2, angle - Math.PI / 2);
      ctx.closePath();

      // Liquid Chrome Shader Gradient (Z-Depth Aware Specular Gloss)
      const grad = ctx.createLinearGradient(
        j1.screenX - nx * r1, j1.screenY - ny * r1,
        j1.screenX + nx * r1, j1.screenY + ny * r1
      );
      grad.addColorStop(0, '#363b4a');
      grad.addColorStop(0.25, '#828fa6');
      grad.addColorStop(0.5, this.glossShift > 0.7 ? '#FFFFFF' : '#d5dfed');
      grad.addColorStop(0.75, '#626d84');
      grad.addColorStop(1, '#181b26');

      ctx.fillStyle = grad;
      ctx.fill();

      // Specular Highlight Stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    // Helper: Draw Head with liquid specular core
    const drawHead = () => {
      const headRadius = jHead.radius;
      if (headRadius <= 1) return;

      const hGrad = ctx.createRadialGradient(
        jHead.screenX - headRadius * 0.35,
        jHead.screenY - headRadius * 0.35,
        0,
        jHead.screenX,
        jHead.screenY,
        headRadius * 1.2
      );
      hGrad.addColorStop(0, '#FFFFFF');
      hGrad.addColorStop(0.35, '#a4b3cc');
      hGrad.addColorStop(0.8, '#434b5c');
      hGrad.addColorStop(1, '#181b24');

      ctx.beginPath();
      ctx.arc(jHead.screenX, jHead.screenY, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = hGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // 6. Draw Mirrored Floor Reflection
    ctx.save();
    ctx.translate(0, floorY * 2);
    ctx.scale(1, -0.75);
    ctx.globalAlpha = 0.32 * rise;
    for (const seg of limbs) {
      drawMercuryCapsule(seg);
    }
    drawHead();
    ctx.restore();

    // 7. Draw Real 3D Grounded Liquid Mercury Dancer
    for (const seg of limbs) {
      drawMercuryCapsule(seg);
      // If head is in front of torso, draw head at the right depth
      if (seg.type === 'torso' && jHead.screenZ <= seg.zAvg) {
        drawHead();
      }
    }
    // Final head check (if in front of all limbs)
    if (jHead.screenZ > limbs[limbs.length - 1].zAvg) {
      drawHead();
    }

    // 8. Render Levitating Mercury Droplets with 3D Rotation
    if (this.riseAmount > 0.4) {
      for (const d of this.droplets) {
        const dropRotX = d.x * cosY + d.z * sinY;
        const dropRotZ = -d.x * sinY + d.z * cosY;
        const dropScreenX = dancerCenterX + dropRotX;
        const dropScreenY = (floorY - 160 * scale) + d.y * scale;

        const dGrad = ctx.createRadialGradient(
          dropScreenX - d.radius * 0.3,
          dropScreenY - d.radius * 0.3,
          0,
          dropScreenX,
          dropScreenY,
          d.radius
        );
        dGrad.addColorStop(0, '#FFFFFF');
        dGrad.addColorStop(0.4, '#b5c5e0');
        dGrad.addColorStop(0.9, '#4c556b');
        dGrad.addColorStop(1, '#1e222d');

        ctx.beginPath();
        ctx.arc(dropScreenX, dropScreenY, Math.max(1, d.radius * scale), 0, Math.PI * 2);
        ctx.fillStyle = dGrad;
        ctx.globalAlpha = d.alpha;
        ctx.fill();

        if (glow > 0.1) {
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 5 * glow;
        }
      }
    }

    ctx.restore();
  }
}
