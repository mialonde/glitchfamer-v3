import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class CavaSpectrumVisualizer implements IVisualizer {
  public name = 'CAVA_SPECTRUM';
  private smoothBars: number[] = new Array(64).fill(0);
  private peakCaps: number[] = new Array(64).fill(0);
  private gravity: number[] = new Array(64).fill(0);

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const gravityRate = 0.015 * speed;

    for (let i = 0; i < 64; i++) {
      // Logarithmic spectrum mapping (CAVA style)
      const logIdx = Math.floor(Math.pow(i / 64, 1.4) * (audio.spectrum.length - 1));
      const targetVal = audio.spectrum[logIdx] || 0;

      // Smooth bar interpolation (CAVA exponential smoothing)
      if (targetVal > this.smoothBars[i]) {
        this.smoothBars[i] = targetVal;
        this.gravity[i] = 0;
      } else {
        this.gravity[i] += gravityRate;
        this.smoothBars[i] = Math.max(0, this.smoothBars[i] - this.gravity[i]);
      }

      // Peak cap gravity physics
      if (this.smoothBars[i] > this.peakCaps[i]) {
        this.peakCaps[i] = this.smoothBars[i];
      } else {
        this.peakCaps[i] = Math.max(0, this.peakCaps[i] - 0.012 * speed);
      }
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const barCount = Math.floor(48 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    const padding = width * 0.06;
    const usableWidth = width - (padding * 2);
    const spacing = 4;
    const barWidth = Math.max(2, (usableWidth - (barCount * spacing)) / barCount);
    const baseY = height * 0.85;
    const maxBarHeight = height * 0.55 * scale;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 15 * glow * (1 + kickBoost);
    }

    for (let i = 0; i < barCount; i++) {
      const idx = Math.floor((i / barCount) * 64);
      const val = this.smoothBars[idx] || 0;
      const peakVal = this.peakCaps[idx] || 0;

      const barH = Math.max(3, val * maxBarHeight * (1 + kickBoost * 0.3));
      const peakH = Math.max(3, peakVal * maxBarHeight * (1 + kickBoost * 0.3));

      const x = padding + i * (barWidth + spacing);
      const y = baseY - barH;
      const peakY = baseY - peakH - 4;

      // CAVA Bar Gradient
      const grad = ctx.createLinearGradient(x, y, x, baseY);
      grad.addColorStop(0, settings.primaryColor);
      grad.addColorStop(0.7, `${settings.primaryColor}B0`);
      grad.addColorStop(1, `${settings.secondaryColor}40`);

      ctx.fillStyle = grad;
      ctx.globalAlpha = Math.min(1.0, 0.85 + val * 0.15);
      
      // Draw CAVA style segmented rounded bar blocks
      const blockHeight = 6 * scale;
      const blocks = Math.floor(barH / (blockHeight + 2));
      
      for (let b = 0; b < blocks; b++) {
        const blockY = baseY - (b + 1) * (blockHeight + 2);
        ctx.fillRect(x, blockY, barWidth, blockHeight);
      }

      // CAVA Floating Peak Cap
      if (peakVal > 0.02) {
        ctx.fillStyle = settings.secondaryColor;
        ctx.globalAlpha = 0.95;
        ctx.fillRect(x, peakY, barWidth, Math.max(2, 3 * scale));
      }
    }

    ctx.restore();
  }
}
