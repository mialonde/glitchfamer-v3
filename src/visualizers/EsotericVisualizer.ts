import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

export class EsotericVisualizer implements IVisualizer {
  public name = 'Esoteric Sacred Geometry';
  private rotation = 0;
  private innerRotation = 0;

  update(audio: AudioEvents, settings: VisualizerSettings) {
    const speed = settings.visSpeed ?? 1.0;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.2;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;

    // Harmonic multi-speed counter rotation
    this.rotation += (0.006 + bass * 0.02) * speed;
    this.innerRotation -= (0.01 + vocal * 0.025) * speed;
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
      ctx.shadowBlur = 18 * glow * (1 + bass * 0.7);
    }

    const baseRadius = Math.min(width, height) * 0.32 * scale;

    // 1. Concentric Concentrated Sacred Rings
    for (let i = 1; i <= 4; i++) {
      const r = baseRadius * (i * 0.25) * (1 + bass * 0.15);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      ctx.lineWidth = i === 4 ? 3 : 1.5;
      
      if (i === 3) {
        ctx.setLineDash([12, 14]);
      } else if (i === 2) {
        ctx.setLineDash([4, 8]);
      }
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Outer Rotating Merkaba / Star Polygon
    ctx.save();
    ctx.rotate(this.rotation);
    const starPoints = 8;
    const outerR = baseRadius * (1 + bass * 0.25);
    const innerR = outerR * 0.5;

    ctx.beginPath();
    for (let i = 0; i < starPoints * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i / (starPoints * 2)) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    ctx.stroke();
    ctx.restore();

    // 3. Inner Counter-Rotating Hexagram & Flower of Life Arc
    ctx.save();
    ctx.rotate(this.innerRotation);
    const flowerCount = 6;
    const petalR = baseRadius * 0.45 * (1 + vocal * 0.3);

    for (let i = 0; i < flowerCount; i++) {
      const angle = (i / flowerCount) * Math.PI * 2;
      const px = Math.cos(angle) * petalR;
      const py = Math.sin(angle) * petalR;

      ctx.beginPath();
      ctx.arc(px, py, petalR, 0, Math.PI * 2);
      ctx.strokeStyle = settings.secondaryColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6 + vocal * 0.35;
      ctx.stroke();
    }
    ctx.restore();

    // 4. Central Sacred Glyph Node
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, 14 * scale * (1 + audio.kick * 0.8)), 0, Math.PI * 2);
    ctx.fillStyle = settings.primaryColor;
    ctx.globalAlpha = 1.0;
    ctx.fill();

    ctx.restore();
  }
}
