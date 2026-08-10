import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class CodropsBarsVisualizer implements IVisualizer {
  public name = 'CODROPS_BARS';
  private peaks: number[] = new Array(64).fill(0);

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;

    // Update floating peak physics
    for (let i = 0; i < 64; i++) {
      const val = audio.spectrum[i] || 0;
      if (val > this.peaks[i]) {
        this.peaks[i] = val;
      } else {
        this.peaks[i] = Math.max(0, this.peaks[i] - 0.015 * speed);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const baseY = height * 0.82;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const numPoints = Math.floor(48 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    const padding = width * 0.08;
    const usableWidth = width - (padding * 2);
    const stepX = usableWidth / (numPoints - 1);

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 18 * glow * (1 + kickBoost);
    }

    // 1. Continuous Line Curve
    ctx.beginPath();
    ctx.moveTo(padding, baseY);

    const points: { x: number; y: number; peakY: number }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const x = padding + (i * stepX);
      const specIdx = Math.floor((i / numPoints) * audio.spectrum.length);
      const val = audio.spectrum[specIdx] || 0;
      const peakVal = this.peaks[specIdx] || 0;

      const h = val * height * 0.5 * scale * (1 + kickBoost * 0.5);
      const peakH = peakVal * height * 0.5 * scale * (1 + kickBoost * 0.5);

      const y = baseY - h;
      const peakY = baseY - peakH;

      points.push({ x, y, peakY });
    }

    // Smooth Bezier Curve through points
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    // Line Stroke
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = Math.max(2, 4 * scale * (1 + kickBoost * 0.3));
    ctx.globalAlpha = 0.95;
    ctx.stroke();

    // Gradient Area Fill under curve
    ctx.lineTo(padding + usableWidth, baseY);
    ctx.lineTo(padding, baseY);
    ctx.closePath();

    const fillGrad = ctx.createLinearGradient(0, baseY - height * 0.5, 0, baseY);
    fillGrad.addColorStop(0, `${settings.primaryColor}50`);
    fillGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = fillGrad;
    ctx.globalAlpha = 0.5;
    ctx.fill();

    // 2. Floating Peak Cap Markers
    ctx.fillStyle = settings.secondaryColor;
    points.forEach((p, idx) => {
      if (idx % 2 === 0) {
        ctx.globalAlpha = Math.min(1.0, 0.5 + (baseY - p.peakY) / (height * 0.5));
        ctx.beginPath();
        ctx.arc(p.x, p.peakY - 4, Math.max(1.5, 3 * scale), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}
