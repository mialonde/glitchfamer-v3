import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

export class MonolithVisualizer implements IVisualizer {
  public name = 'Brutalist Monolith Drop';
  private fractureProgress = 0;
  private cameraRoll = 0;
  private rotY = 0;

  update(audio: AudioEvents, settings: VisualizerSettings) {
    const speed = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    
    // Slow rotational perspective
    this.rotY += 0.008 * speed;

    // Structural Drop fracture on hard beat onset
    if (audio.beat && audio.kick > 0.5 * (2 - beatSens)) {
      this.fractureProgress = 1.0;
      this.cameraRoll = (Math.random() - 0.5) * 0.05;
    } else {
      this.fractureProgress *= 0.93; // Smooth structural recovery
      this.cameraRoll *= 0.9;
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
    
    // Camera shake on heavy bass
    if (this.cameraRoll !== 0) {
      ctx.translate(centerX, centerY);
      ctx.rotate(this.cameraRoll);
      ctx.translate(-centerX, -centerY);
    }

    // 1. Brutalist Outer Boundary Architecture
    const pad = Math.max(30, 60 * scale - bass * 20);
    ctx.strokeStyle = `${settings.primaryColor}33`;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    // Inner Accent Grid Frames
    const innerPad = pad + 18;
    ctx.strokeStyle = `${settings.primaryColor}18`;
    ctx.setLineDash([8, 12]);
    ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);
    ctx.setLineDash([]);

    // 2. 3D Wireframe Monolith Pillars & Blocks
    ctx.save();
    ctx.translate(centerX, centerY);

    const monoW = 280 * scale * (1 + bass * 0.15);
    const monoH = 540 * scale * (1 + audio.energy * 0.25);
    const depth = 90 * scale;

    // Shift segments during fracture drop
    const fractureOffset = this.fractureProgress * 35;

    // Draw 3D Isometric Faces
    // Top Face
    ctx.beginPath();
    ctx.moveTo(-monoW / 2 + Math.sin(this.rotY) * depth, -monoH / 2 - depth * 0.4);
    ctx.lineTo(monoW / 2 + Math.sin(this.rotY) * depth, -monoH / 2 - depth * 0.4);
    ctx.lineTo(monoW / 2, -monoH / 2);
    ctx.lineTo(-monoW / 2, -monoH / 2);
    ctx.closePath();
    ctx.fillStyle = `${settings.primaryColor}44`;
    ctx.fill();
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right Perspective Side Face
    ctx.beginPath();
    ctx.moveTo(monoW / 2, -monoH / 2);
    ctx.lineTo(monoW / 2 + Math.sin(this.rotY) * depth, -monoH / 2 - depth * 0.4);
    ctx.lineTo(monoW / 2 + Math.sin(this.rotY) * depth, monoH / 2 - depth * 0.4);
    ctx.lineTo(monoW / 2, monoH / 2);
    ctx.closePath();
    ctx.fillStyle = `${settings.secondaryColor}22`;
    ctx.fill();
    ctx.stroke();

    // Front Brutalist Slab
    // Segment 1 (Top)
    ctx.save();
    ctx.translate(fractureOffset, 0);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-monoW / 2, -monoH / 2, monoW, monoH * 0.3);
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 3;
    if (glow > 0.1) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 16 * glow;
    }
    ctx.strokeRect(-monoW / 2, -monoH / 2, monoW, monoH * 0.3);
    ctx.restore();

    // Segment 2 (Mid - Vocal Sheen Gradient)
    ctx.save();
    ctx.translate(-fractureOffset * 0.8, 0);
    const midGrad = ctx.createLinearGradient(-monoW / 2, 0, monoW / 2, 0);
    midGrad.addColorStop(0, '#0d0d11');
    midGrad.addColorStop(0.5, `${settings.primaryColor}${Math.floor(20 + vocal * 60).toString(16).padStart(2, '0')}`);
    midGrad.addColorStop(1, '#0d0d11');
    ctx.fillStyle = midGrad;
    ctx.fillRect(-monoW / 2, -monoH * 0.2, monoW, monoH * 0.4);
    ctx.strokeStyle = settings.secondaryColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-monoW / 2, -monoH * 0.2, monoW, monoH * 0.4);

    // Audio Frequency Slits in Middle Slab
    const slitCount = 12;
    const slitW = (monoW * 0.8) / slitCount;
    for (let i = 0; i < slitCount; i++) {
      const specVal = (audio.spectrum[i * 3] || 0) * monoH * 0.16;
      ctx.fillStyle = settings.primaryColor;
      ctx.fillRect(-monoW * 0.4 + i * slitW + 2, -specVal / 2, slitW - 4, specVal);
    }
    ctx.restore();

    // Segment 3 (Bottom)
    ctx.save();
    ctx.translate(fractureOffset * 0.5, 0);
    ctx.fillStyle = '#050507';
    ctx.fillRect(-monoW / 2, monoH * 0.2, monoW, monoH * 0.3);
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-monoW / 2, monoH * 0.2, monoW, monoH * 0.3);
    ctx.restore();

    // Telemetry Monolith Typography
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = `${settings.primaryColor}cc`;
    ctx.textAlign = 'center';
    ctx.fillText(`MONOLITH // ARCH_ID: 0x${Math.floor(bass * 9999).toString(16).toUpperCase()}`, 0, monoH / 2 + 35);

    ctx.restore(); // End 3D Monolith

    // 3. Brutalist Lateral Voltage Accents
    if (audio.hihat > 0.65) {
      ctx.fillStyle = `${settings.primaryColor}88`;
      const glitchY = centerY + (Math.random() - 0.5) * height * 0.7;
      ctx.fillRect(pad, glitchY, width - pad * 2, 2);
    }

    ctx.restore();
  }
}
