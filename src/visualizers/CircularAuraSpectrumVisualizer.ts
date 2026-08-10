import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class CircularAuraSpectrumVisualizer implements IVisualizer {
  public name = 'CIRCULAR_AURA_SPECTRUM';
  private rotation = 0;
  private breathScale = 1.0;

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = (settings.visSpeed ?? 1.0) * 0.006;
    this.rotation += speed;

    const bass = audio.bassEnergy ?? audio.kick;
    const targetBreath = 1.0 + bass * 0.35 * (settings.visBeatSensitivity ?? 1.0);
    this.breathScale += (targetBreath - this.breathScale) * 0.2;
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, coverImage, interaction } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const minDim = Math.min(width, height);
    const scale = (settings.visScale ?? 1.0);
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const treble = audio.trebleEnergy ?? audio.hihat;
    const glow = settings.visGlow ?? 0.8;

    const coreRadius = minDim * 0.18 * scale * this.breathScale;

    // Style Variant (0: Circular Frequency Bars, 1: Fluid Continuous Waveform, 2: Dotted Neon Orbit, 3: Symmetric Dual Ring)
    const styleMode = Math.abs((interaction?.styleVariant ?? 0) % 4);

    ctx.save();

    // 1. Dynamic Breathing Aura Background (Radial Gradient Pulse)
    const auraRadius = coreRadius * 2.8;
    const auraGrad = ctx.createRadialGradient(centerX, centerY, coreRadius * 0.5, centerX, centerY, auraRadius);
    auraGrad.addColorStop(0, `${settings.primaryColor}${Math.floor(Math.min(255, 70 + bass * 140)).toString(16).padStart(2, '0')}`);
    auraGrad.addColorStop(0.4, `${settings.secondaryColor}${Math.floor(Math.min(255, 30 + mid * 70)).toString(16).padStart(2, '0')}`);
    auraGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Center Cover Image / Avatar / Disc
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.clip();

    if (coverImage) {
      ctx.drawImage(coverImage, centerX - coreRadius, centerY - coreRadius, coreRadius * 2, coreRadius * 2);
    } else {
      const discGrad = ctx.createLinearGradient(centerX - coreRadius, centerY - coreRadius, centerX + coreRadius, centerY + coreRadius);
      discGrad.addColorStop(0, '#111118');
      discGrad.addColorStop(0.5, '#1e1e2d');
      discGrad.addColorStop(1, '#09090e');
      ctx.fillStyle = discGrad;
      ctx.fillRect(centerX - coreRadius, centerY - coreRadius, coreRadius * 2, coreRadius * 2);

      // Monogram or Icon placeholder
      ctx.fillStyle = settings.primaryColor;
      ctx.font = `900 ${coreRadius * 0.45}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(settings.trackTitle ? settings.trackTitle.charAt(0).toUpperCase() : 'V', centerX, centerY);
    }
    ctx.restore();

    // Disc Border
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = Math.max(2, 3 * scale * (1 + bass * 0.4));
    if (glow > 0.1) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 15 * glow;
    }
    ctx.stroke();

    // 3. Audio Reactive Surrounding Spectrum / Waveform
    const barCount = styleMode === 2 ? 96 : 64;
    const specLen = audio.spectrum.length;

    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);

    if (styleMode === 0) {
      // Style 0: Radial Frequency Bars (Extending outwards)
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const specIdx = Math.floor((i < barCount / 2 ? i : barCount - i) / (barCount / 2) * (specLen - 1));
        const specVal = audio.spectrum[specIdx] || 0;
        const barHeight = Math.max(4, specVal * minDim * 0.22 * scale * (1 + bass * 0.5));

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const x1 = cosA * (coreRadius + 4);
        const y1 = sinA * (coreRadius + 4);
        const x2 = cosA * (coreRadius + 4 + barHeight);
        const y2 = sinA * (coreRadius + 4 + barHeight);

        ctx.strokeStyle = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
        ctx.lineWidth = Math.max(1.5, ((Math.PI * 2 * coreRadius) / barCount) * 0.65);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else if (styleMode === 1) {
      // Style 1: Smooth Continuous Fluid Waveform
      ctx.beginPath();
      for (let i = 0; i <= barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const normI = (i < barCount / 2 ? i : barCount - i) / (barCount / 2);
        const specIdx = Math.floor(normI * (specLen - 1));
        const specVal = audio.spectrum[specIdx] || 0;
        const r = coreRadius + 10 + (specVal * minDim * 0.2 * scale * (1 + bass * 0.5));

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      ctx.fillStyle = `${settings.primaryColor}22`;
      ctx.fill();
    } else if (styleMode === 2) {
      // Style 2: Dotted Neon Particle Orbit Ring
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const normI = (i < barCount / 2 ? i : barCount - i) / (barCount / 2);
        const specIdx = Math.floor(normI * (specLen - 1));
        const specVal = audio.spectrum[specIdx] || 0;
        const r = coreRadius + 12 + (specVal * minDim * 0.25 * scale);

        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const dotSize = Math.max(2, 4.5 * (specVal + treble));

        ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : (i % 2 === 0 ? settings.primaryColor : settings.secondaryColor);
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Style 3: Symmetric Dual Layer Ring
      for (let layer = 0; layer < 2; layer++) {
        const layerR = coreRadius + (layer * 22 * scale);
        ctx.beginPath();
        for (let i = 0; i <= barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2;
          const specIdx = Math.floor((i / barCount) * (specLen - 1));
          const specVal = audio.spectrum[specIdx] || 0;
          const r = layerR + (specVal * 45 * scale * (layer === 0 ? 1 : 1.5));
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = layer === 0 ? settings.primaryColor : settings.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
