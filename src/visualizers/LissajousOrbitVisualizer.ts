import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class LissajousOrbitVisualizer implements IVisualizer {
  public name = 'LISSAJOUS_ORBIT';
  private phase = 0;
  private rotation = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + (audio.kick * 0.8 * (settings.visBeatSensitivity ?? 1.0)));
    this.phase += 0.03 * speed;
    this.rotation += (settings.visRotation ?? 0.5) * 0.01 * speed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.6;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const orbitCount = Math.floor(3 * density);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    const baseSize = Math.min(width, height) * 0.32 * scale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 * glow * (1 + kickBoost);
    }

    const pointsPerLoop = 300;

    for (let o = 0; o < orbitCount; o++) {
      const freqA = 3 + o;
      const freqB = 2 + o;
      const phaseDelta = this.phase * (1 + o * 0.2);

      const color = o % 2 === 0 ? settings.primaryColor : settings.secondaryColor;

      ctx.save();
      ctx.beginPath();

      for (let i = 0; i <= pointsPerLoop; i++) {
        const t = (i / pointsPerLoop) * Math.PI * 2;
        const specIdx = Math.floor((i / pointsPerLoop) * audio.spectrum.length);
        const specVal = audio.spectrum[specIdx] || 0;

        // Lissajous Parametric Formula with Audio Warp
        const ampX = baseSize * (1 + (audio.bassEnergy ?? audio.kick) * 0.3 * kickBoost + specVal * 0.4);
        const ampY = baseSize * (1 + (audio.highEnergy ?? audio.hihat) * 0.3 * kickBoost + specVal * 0.4);

        const x = Math.sin(freqA * t + phaseDelta) * ampX * (0.8 + o * 0.15);
        const y = Math.sin(freqB * t) * ampY * (0.8 + o * 0.15);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();

      // Oscilloscope Trace Stroke
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, (3 - o * 0.5) * scale * (1 + kickBoost * 0.4));
      ctx.globalAlpha = Math.min(1.0, (0.85 - o * 0.15) * (1 + audio.energy * 0.2));
      ctx.stroke();

      ctx.restore();
    }

    // Center Oscilloscope Core Node
    ctx.fillStyle = settings.secondaryColor;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, 8 * scale * (1 + kickBoost)), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
