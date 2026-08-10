import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class VissonanceSpectrumVisualizer implements IVisualizer {
  public name = 'VISSONANCE_SPECTRUM';
  private phase = 0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * (1 + (audio.kick * 0.5 * (settings.visBeatSensitivity ?? 1.0)));
    this.phase += 0.02 * speed;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const gridCols = Math.floor(32 * density);
    const gridRows = 16;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    const horizonY = height * 0.42;
    const baseY = height * 0.95;

    ctx.save();

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 18 * glow * (1 + kickBoost);
    }

    // Render 3D Perspective Audio Grid Lines (Vissonance Landscape)
    const stepX = width / gridCols;

    for (let r = 0; r < gridRows; r++) {
      const normR = r / gridRows;
      const rowY = horizonY + Math.pow(normR, 1.8) * (baseY - horizonY);
      const rowAlpha = Math.min(1.0, normR * 1.2);
      const rowScale = 0.2 + normR * 0.8;

      ctx.save();
      ctx.beginPath();

      for (let c = 0; c <= gridCols; c++) {
        const normC = c / gridCols;
        const specIdx = Math.floor((c / gridCols) * audio.spectrum.length);
        const specVal = audio.spectrum[specIdx] || 0;

        // Perspective origin
        const origX = (c * stepX - width / 2) * rowScale + width / 2;
        const heightDisp = specVal * 180 * scale * rowScale * (1 + kickBoost * 0.6) * Math.sin(normC * Math.PI * 4 + this.phase);
        const y = rowY - heightDisp;

        if (c === 0) ctx.moveTo(origX, y);
        else ctx.lineTo(origX, y);
      }

      ctx.strokeStyle = r % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
      ctx.lineWidth = Math.max(1, 2.5 * rowScale * scale);
      ctx.globalAlpha = rowAlpha * 0.85;
      ctx.stroke();

      ctx.restore();
    }

    // Longitudinal Perspective Rays
    for (let c = 0; c <= gridCols; c += 2) {
      const normC = c / gridCols;
      const topX = (c * stepX - width / 2) * 0.2 + width / 2;
      const botX = c * stepX;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(topX, horizonY);
      ctx.lineTo(botX, baseY);
      ctx.strokeStyle = `${settings.primaryColor}50`;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
