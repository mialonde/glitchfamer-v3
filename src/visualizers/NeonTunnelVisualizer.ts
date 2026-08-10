import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class NeonTunnelVisualizer implements IVisualizer {
  public name = 'NEON_TUNNEL';
  private rotationAngle = 0;
  private ringOffset = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + (audio.kick * 1.5 * (settings.visBeatSensitivity ?? 1.0)));
    const rotSpeed = (settings.visRotation ?? 0.5) * 0.015;
    
    this.ringOffset = (this.ringOffset + speed * 12 * (audio.delta || 1 / 60)) % 100;
    this.rotationAngle += rotSpeed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.hypot(width, height) * 0.55 * (settings.visScale ?? 1.0);

    ctx.save();
    
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const ringCount = Math.floor(24 * density);
    const sides = 8; // Octagonal Tunnel
    const glow = settings.visGlow ?? 0.6;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    // Optional Glow shadow
    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 15 * glow * (1 + kickBoost * 0.8);
    }

    const time = audio.time * (settings.visColorShift ?? 0.2);

    for (let i = 0; i < ringCount; i++) {
      // Perspective Z calculation
      const zProgress = ((i * (100 / ringCount) + this.ringOffset) % 100) / 100;
      const perspective = Math.pow(zProgress, 2.2); // Exponential depth
      const radius = maxRadius * perspective;

      if (radius < 4) continue;

      const alpha = Math.min(1.0, perspective * 1.5) * (1 - perspective * 0.3);
      const angleOffset = this.rotationAngle + (i * 0.05 * (settings.visRotation ?? 0.5));

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angleOffset);

      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        const a = (s / sides) * Math.PI * 2;
        const audioPulse = 1 + (audio.spectrum[(s * 4) % audio.spectrum.length] || 0) * 0.4 * kickBoost;
        const r = radius * audioPulse;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Dynamic color shift
      ctx.strokeStyle = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      ctx.lineWidth = Math.max(1, (1 + perspective * 6) * (1 + kickBoost * 0.5));
      ctx.globalAlpha = alpha;
      ctx.stroke();

      // Inner crosshair connectors on closer rings
      if (perspective > 0.6 && i % 3 === 0) {
        ctx.strokeStyle = settings.secondaryColor;
        ctx.globalAlpha = alpha * 0.35;
        ctx.lineWidth = 1;
        for (let s = 0; s < sides; s += 2) {
          const a = (s / sides) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
