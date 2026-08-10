import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class SynthwaveGrid3DVisualizer implements IVisualizer {
  public name = 'SYNTHWAVE_GRID_3D';
  private gridOffset = 0;
  private sunPulse = 1.0;
  private terrainOffset = 0;

  // 3 Distinct Curated Synthwave Palettes
  private palettes = [
    { name: 'NEON_SUNSET', grid: '#FF007F', sunTop: '#FFD700', sunBottom: '#FF007F', mountain: '#00FFFF', bg: '#080114' },
    { name: 'CYBER_MATRIX', grid: '#00FF9D', sunTop: '#00FFFF', sunBottom: '#0088FF', mountain: '#FF007F', bg: '#020C09' },
    { name: 'SYNTH_AMBER', grid: '#FFAA00', sunTop: '#FFDD00', sunBottom: '#FF3300', mountain: '#FF0055', bg: '#100600' }
  ];

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const bass = audio.bassEnergy ?? audio.kick;
    const speed = (settings.visSpeed ?? 1.0) * (0.8 + audio.energy * 2.2);
    this.gridOffset = (this.gridOffset + 0.025 * speed) % 1.0;
    this.terrainOffset += 0.03 * speed;

    const targetSun = 1.0 + bass * 0.45 * (settings.visBeatSensitivity ?? 1.0);
    this.sunPulse += (targetSun - this.sunPulse) * 0.2;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, interaction } = context;
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const treble = audio.trebleEnergy ?? audio.hihat;
    const glow = settings.visGlow ?? 0.7;

    // Palette selection (Cycle with click / paletteIndex)
    const palIndex = Math.abs((interaction?.paletteIndex ?? 0) % this.palettes.length);
    const pal = this.palettes[palIndex];

    // User Interactive Horizon Tilt
    const userTilt = interaction?.rotationX ? interaction.rotationX * 120 : 0;
    const horizonY = height * 0.48 + userTilt;

    ctx.save();

    // 1. Synthwave Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, pal.bg);
    skyGrad.addColorStop(0.7, '#150622');
    skyGrad.addColorStop(1, '#3b0d45');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // 2. Neon Synthwave Sun with horizontal scanline slices
    const sunRadius = Math.min(width, height) * 0.22 * (settings.visScale ?? 1.0) * this.sunPulse;
    const sunCenterX = width / 2 + (interaction?.rotationY ? interaction.rotationY * 180 : 0);
    const sunCenterY = horizonY - sunRadius * 0.25;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
    ctx.clip();

    // Sun Gradient
    const sunGrad = ctx.createLinearGradient(sunCenterX, sunCenterY - sunRadius, sunCenterX, sunCenterY + sunRadius);
    sunGrad.addColorStop(0, pal.sunTop);
    sunGrad.addColorStop(0.5, '#FF8800');
    sunGrad.addColorStop(1, pal.sunBottom);
    ctx.fillStyle = sunGrad;
    ctx.fillRect(sunCenterX - sunRadius, sunCenterY - sunRadius, sunRadius * 2, sunRadius * 2);

    // Sun Horizontal Cutout Scanline Blinds (Synthwave retro style)
    const sliceCount = 9;
    ctx.fillStyle = '#090112';
    for (let s = 0; s < sliceCount; s++) {
      const sliceNorm = s / sliceCount;
      const sliceY = sunCenterY + (sliceNorm * sunRadius);
      const sliceH = Math.max(2, (sliceNorm * 8) + (bass * 3));
      ctx.fillRect(sunCenterX - sunRadius, sliceY, sunRadius * 2, sliceH);
    }
    ctx.restore();

    // Sun Glow Aura
    if (glow > 0.1) {
      ctx.shadowColor = pal.sunBottom;
      ctx.shadowBlur = 30 * glow * (1 + bass * 0.5);
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = `${pal.sunTop}66`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Synthwave Wireframe Mountain Silhouettes on Horizon
    const mountainSegments = 40;
    const mStep = width / mountainSegments;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);

    for (let i = 0; i <= mountainSegments; i++) {
      const mx = i * mStep;
      const normI = i / mountainSegments;
      const mPeak = Math.sin(normI * Math.PI * 5) * Math.cos(normI * Math.PI * 2);
      const specIdx = Math.floor(normI * (audio.spectrum.length - 1));
      const specVal = audio.spectrum[specIdx] || 0;
      const my = horizonY - (Math.abs(mPeak) * 90 + specVal * 120 * bass);
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(width, horizonY);
    ctx.closePath();

    ctx.fillStyle = '#0D021A';
    ctx.fill();
    ctx.strokeStyle = pal.mountain;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. 3D Perspective Ground Grid with Terrain Elevation Waves (Bass Displacement)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#10031E');
    groundGrad.addColorStop(1, '#000000');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    const cols = 28;
    const rows = 22;
    const gridColor = pal.grid;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = gridColor;
    if (glow > 0.1) {
      ctx.shadowColor = gridColor;
      ctx.shadowBlur = 12 * glow;
    }

    // Longitudinal (Vanishing) Perspective Lines
    for (let c = 0; c <= cols; c++) {
      const normX = (c / cols - 0.5) * 2; // -1 to 1
      const startX = width / 2 + normX * 40;
      const endX = width / 2 + normX * width * 1.35;

      ctx.beginPath();
      ctx.moveTo(startX, horizonY);

      // Add terrain bump waves on bass
      const subSteps = 12;
      for (let s = 1; s <= subSteps; s++) {
        const normZ = s / subSteps;
        const currentY = horizonY + Math.pow(normZ, 2.2) * (height - horizonY);
        const currentX = startX + (endX - startX) * normZ;

        // Terrain wave height
        const waveDisp = Math.sin(normZ * Math.PI * 4 - this.terrainOffset + normX * 3) * (bass * 28 * normZ);
        ctx.lineTo(currentX, currentY - waveDisp);
      }

      ctx.globalAlpha = Math.min(0.85, 0.2 + (1 - Math.abs(normX)) * 0.6 + bass * 0.2);
      ctx.stroke();
    }

    // Transverse (Moving Horizontal) Lines
    for (let r = 0; r < rows; r++) {
      const zNorm = (r + this.gridOffset) / rows;
      if (zNorm <= 0.02) continue;

      const y = horizonY + Math.pow(zNorm, 2.2) * (height - horizonY);
      const spanWidth = width * 1.35 * zNorm;
      const leftX = width / 2 - spanWidth / 2;
      const rightX = width / 2 + spanWidth / 2;

      ctx.beginPath();
      ctx.moveTo(leftX, y);

      // Displace along the horizontal line
      const lineSteps = 20;
      const stepW = spanWidth / lineSteps;
      for (let ls = 0; ls <= lineSteps; ls++) {
        const lx = leftX + ls * stepW;
        const normLX = (ls / lineSteps - 0.5) * 2;
        const specIdx = Math.floor(Math.abs(normLX) * (audio.spectrum.length - 1));
        const specVal = audio.spectrum[specIdx] || 0;
        const terrainWave = Math.sin(normLX * Math.PI * 3 + this.terrainOffset) * (bass * 22 * zNorm) + (specVal * 20 * zNorm);
        ctx.lineTo(lx, y - terrainWave);
      }

      ctx.globalAlpha = Math.min(0.9, zNorm * 0.9 + bass * 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
