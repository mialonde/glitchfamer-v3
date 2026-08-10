import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class AudioFluidVisualizer implements IVisualizer {
  public name = 'AUDIO_FLUID';
  private phase = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + (audio.kick * 0.8 * (settings.visBeatSensitivity ?? 1.0)));
    this.phase += 0.03 * speed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.6;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const waveCount = Math.floor(4 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * glow * (1 + kickBoost);
    }

    const segments = 100;
    const stepX = width / segments;

    for (let w = 0; w < waveCount; w++) {
      const wavePhase = this.phase + (w * Math.PI * 0.35);
      const waveColor = w % 2 === 0 ? settings.primaryColor : settings.secondaryColor;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i <= segments; i++) {
        const x = i * stepX;
        const normI = i / segments;
        
        // Map segment to audio spectrum index
        const specIdx = Math.floor(normI * (audio.spectrum.length - 1));
        const specVal = audio.spectrum[specIdx] || 0;

        // Wave formula: Multi-harmonic sine + audio spectrum amplitude
        const amp = (60 * scale + specVal * 280 * scale * (1 + kickBoost)) * (1 - Math.abs(normI - 0.5) * 0.8);
        const freq1 = Math.sin(normI * Math.PI * 4 + wavePhase + w) * amp;
        const freq2 = Math.cos(normI * Math.PI * 2 - wavePhase * 0.7) * (amp * 0.5);
        const y = centerY + freq1 + freq2 + ((w - waveCount / 2) * 35 * scale);

        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Fluid gradient fill
      const grad = ctx.createLinearGradient(0, centerY - 150 * scale, 0, height);
      grad.addColorStop(0, waveColor);
      grad.addColorStop(0.5, `${waveColor}80`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.globalAlpha = Math.min(0.85, (0.45 + (w * 0.1)) * (1 + audio.energy * 0.3));
      ctx.fill();

      // Wave Outline Stroke
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = Math.max(1.5, 3 * scale * (1 + kickBoost * 0.4));
      ctx.globalAlpha = Math.min(1.0, 0.7 + kickBoost * 0.3);
      ctx.stroke();

      ctx.restore();
    }

    // Peak Caps Floating along the top wave
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.9;
    for (let i = 10; i < segments; i += 8) {
      const x = i * stepX;
      const normI = i / segments;
      const specIdx = Math.floor(normI * (audio.spectrum.length - 1));
      const specVal = audio.spectrum[specIdx] || 0;

      if (specVal > 0.3) {
        const amp = (60 * scale + specVal * 280 * scale * (1 + kickBoost)) * (1 - Math.abs(normI - 0.5) * 0.8);
        const y = centerY + Math.sin(normI * Math.PI * 4 + this.phase) * amp - 12;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, 4 * scale * (specVal + kickBoost)), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
