import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class CodropsWaveVisualizer implements IVisualizer {
  public name = 'CODROPS_WAVE';
  private phase = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + (audio.kick * 0.6 * (settings.visBeatSensitivity ?? 1.0)));
    this.phase += 0.025 * speed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const lineCount = Math.floor(5 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 16 * glow * (1 + kickBoost);
    }

    const segments = 80;
    const stepX = width / segments;

    for (let l = 0; l < lineCount; l++) {
      const linePhase = this.phase + (l * 0.45);
      const isPrimary = l % 2 === 0;
      const lineColor = isPrimary ? settings.primaryColor : settings.secondaryColor;
      
      // Frequency band focus per line
      const freqGain = l === 0 ? (audio.bassEnergy ?? audio.kick) : l === 1 ? (audio.midEnergy ?? audio.snare) : (audio.highEnergy ?? audio.hihat);

      ctx.save();
      ctx.beginPath();

      for (let i = 0; i <= segments; i++) {
        const x = i * stepX;
        const normI = i / segments;
        const specIdx = Math.floor(normI * (audio.spectrum.length - 1));
        const specVal = audio.spectrum[specIdx] || 0;

        // Oscilloscope sine wave with spectrum modulation
        const baseAmp = 40 * scale * (1 + freqGain * 1.5) * (1 - Math.abs(normI - 0.5) * 0.7);
        const wave = Math.sin(normI * Math.PI * (3 + l) + linePhase) * baseAmp;
        const specDisp = (specVal * 180 * scale * (1 + kickBoost * 0.6)) * Math.sin(normI * Math.PI * 6 + linePhase);
        const y = centerY + wave + specDisp + ((l - lineCount / 2) * 20 * scale);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = Math.max(1, (2.5 - l * 0.3) * scale * (1 + kickBoost * 0.3));
      ctx.globalAlpha = Math.min(1.0, (0.85 - l * 0.12) * (1 + audio.energy * 0.2));
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}
