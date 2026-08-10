import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class VissonanceOctagonVisualizer implements IVisualizer {
  public name = 'VISSONANCE_OCTAGON';
  private rotation = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.015 * speed;
    this.rotation += rotSpeed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.6;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const layers = Math.floor(5 * density);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 22 * glow * (1 + kickBoost);
    }

    const sides = 8; // Octagon

    // 1. Concentric Octagonal Wireframe Mesh
    for (let l = 0; l < layers; l++) {
      const baseR = (80 + l * 65) * scale * (1 + kickBoost * 0.25);
      const color = l % 2 === 0 ? settings.primaryColor : settings.secondaryColor;

      ctx.save();
      ctx.beginPath();

      for (let s = 0; s <= sides; s++) {
        const angle = (s / sides) * Math.PI * 2 + (l * 0.1);
        const specIdx = Math.floor((s % sides) / sides * audio.spectrum.length);
        const specVal = audio.spectrum[specIdx] || 0;

        const vertexOffset = specVal * 120 * scale * (1 + kickBoost * 0.5);
        const r = baseR + vertexOffset;

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, (3.5 - l * 0.4) * scale * (1 + kickBoost * 0.3));
      ctx.globalAlpha = Math.min(1.0, (0.95 - l * 0.15) * (1 + audio.energy * 0.2));
      ctx.stroke();

      // Radiating spokes connecting vertices between layers
      if (l > 0) {
        for (let s = 0; s < sides; s++) {
          const angle = (s / sides) * Math.PI * 2;
          const innerR = (80 + (l - 1) * 65) * scale;
          const outerR = baseR;

          const x1 = Math.cos(angle + (l - 1) * 0.1) * innerR;
          const y1 = Math.sin(angle + (l - 1) * 0.1) * innerR;
          const x2 = Math.cos(angle + l * 0.1) * outerR;
          const y2 = Math.sin(angle + l * 0.1) * outerR;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `${color}60`;
          ctx.lineWidth = 1 * scale;
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 2. Interior Audio Reactive Energy Orb
    const orbRadius = 45 * scale * (1 + kickBoost * 0.7);
    const orbGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, orbRadius);
    orbGrad.addColorStop(0, settings.secondaryColor || '#FFFFFF');
    orbGrad.addColorStop(0.6, settings.primaryColor);
    orbGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    ctx.restore();
  }
}
