import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

export class SimulationVisualizer implements IVisualizer {
  public name = 'Cybernetic Simulation';
  private blinkTimer = 0;
  private isBlinking = false;
  private pupilSize = 1;
  private reticleAngle = 0;
  private scanlineY = 0;
  private irisPulse = 0;

  update(audio: AudioEvents, settings: VisualizerSettings) {
    const speed = settings.visSpeed ?? 1.0;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.2;
    const bass = audio.bassEnergy ?? audio.kick ?? 0.2;

    // Pupil dilation based on multi-band energy
    this.pupilSize = 1 + (bass * 0.9 + vocal * 0.4) * beatSens * (settings.intensity ?? 1.0);
    
    // Iris pulse on beat onset with smooth exponential decay
    if (audio.beat) {
      this.irisPulse = 1.0;
    } else {
      this.irisPulse *= 0.92;
    }

    // Reticle HUD rotation
    this.reticleAngle += (0.015 + audio.snare * 0.04) * speed;

    // Scanline vertical sweep
    this.scanlineY = (this.scanlineY + 4 * speed + audio.hihat * 10) % 1080;

    // Organic eyelid blinking
    if (!this.isBlinking && Math.random() > 0.985) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }

    if (this.isBlinking) {
      this.blinkTimer += 0.16 * speed;
      if (this.blinkTimer >= 1) {
        this.isBlinking = false;
      }
    }
  }

  render(context: RenderContext) {
    const { ctx, width, height, audio, settings } = context;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const eyeWidth = Math.min(width, height) * 0.65 * scale;
    const eyeHeight = eyeWidth * 0.42;

    ctx.save();
    
    // Background Dark Cinematic Ambience & Pulse
    if (audio.beat) {
      ctx.fillStyle = `${settings.primaryColor}15`;
      ctx.fillRect(0, 0, width, height);
    }

    // 1. Cybernetic Tech HUD Crosshairs & Grid Background
    ctx.save();
    ctx.strokeStyle = `${settings.primaryColor}22`;
    ctx.lineWidth = 1;
    
    // Center Tech Target Rings
    ctx.beginPath();
    ctx.arc(centerX, centerY, eyeWidth * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, eyeWidth * 0.75, 0, Math.PI * 2);
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tech HUD Corner Brackets
    const bracketSize = 35 * scale;
    const bracketPad = 60 * scale;
    const leftX = centerX - eyeWidth * 0.55;
    const rightX = centerX + eyeWidth * 0.55;
    const topY = centerY - eyeHeight * 0.75;
    const botY = centerY + eyeHeight * 0.75;

    ctx.strokeStyle = `${settings.primaryColor}88`;
    ctx.lineWidth = 2;
    
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(leftX, topY + bracketSize);
    ctx.lineTo(leftX, topY);
    ctx.lineTo(leftX + bracketSize, topY);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(rightX - bracketSize, topY);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, topY + bracketSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(leftX, botY - bracketSize);
    ctx.lineTo(leftX, botY);
    ctx.lineTo(leftX + bracketSize, botY);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(rightX - bracketSize, botY);
    ctx.lineTo(rightX, botY);
    ctx.lineTo(rightX, botY - bracketSize);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Sclera (Eye Shape) with smooth clipping
    ctx.save();
    const blinkFactor = this.isBlinking ? Math.sin(Math.min(1, Math.max(0, this.blinkTimer)) * Math.PI) : 0;
    const currentHeight = Math.max(2, eyeHeight * (1 - blinkFactor));
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, Math.max(1, eyeWidth / 2), Math.max(1, currentHeight / 2), 0, 0, Math.PI * 2);
    
    // Gradient Sclera
    const scleraGrad = ctx.createRadialGradient(centerX, centerY, eyeWidth * 0.1, centerX, centerY, eyeWidth * 0.5);
    scleraGrad.addColorStop(0, '#f4f4f5');
    scleraGrad.addColorStop(0.85, '#d4d4d8');
    scleraGrad.addColorStop(1, '#71717a');
    ctx.fillStyle = scleraGrad;
    ctx.fill();

    // Outer Sclera Glow Border
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 3.5;
    if (glow > 0.1) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 15 * glow;
    }
    ctx.stroke();
    ctx.clip(); // Clip all interior eye graphics

    // 3. Iris (Audio Reactive Biometric Aperture)
    const irisRadius = Math.max(4, (eyeHeight * 0.82) / 2);
    const irisX = centerX + (Math.sin(audio.time * 2) * audio.snare * 6);
    const irisY = centerY + (Math.cos(audio.time * 2) * audio.snare * 4);

    const irisGrad = ctx.createRadialGradient(irisX, irisY, irisRadius * 0.2, irisX, irisY, irisRadius);
    irisGrad.addColorStop(0, settings.secondaryColor);
    irisGrad.addColorStop(0.6, settings.primaryColor);
    irisGrad.addColorStop(1, '#09090b');

    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Iris Tech Aperture Fins / Radial Spokes
    ctx.save();
    ctx.translate(irisX, irisY);
    ctx.rotate(this.reticleAngle);
    const finCount = 16;
    ctx.strokeStyle = `${settings.primaryColor}aa`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < finCount; i++) {
      const angle = (i / finCount) * Math.PI * 2;
      const innerR = irisRadius * 0.35;
      const outerR = irisRadius * (0.9 + (audio.spectrum[i * 4] || 0) * 0.2);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Pupil (Reacts intensely to Bass & Beat)
    const pupilRadius = Math.max(3, irisRadius * 0.38 * this.pupilSize);
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#050507';
    ctx.fill();

    // Pupil Cyber Core Glow Ring
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilRadius * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = settings.primaryColor;
    ctx.lineWidth = 2 + this.irisPulse * 3;
    ctx.stroke();

    // Specular Reflection (Gleam)
    ctx.beginPath();
    ctx.arc(irisX - irisRadius * 0.28, irisY - irisRadius * 0.28, irisRadius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.restore(); // Exit Sclera Clip

    // 5. Digital Telemetry HUD Overlay & Scanlines
    ctx.save();
    ctx.font = '9px monospace';
    ctx.fillStyle = `${settings.primaryColor}cc`;
    ctx.fillText(`TARGET_LOCK // SYNC: ${Number((audio.energy || 0) * 100).toFixed(0)}%`, leftX, botY + 18);
    ctx.fillText(`BIOMETRIC_IRIS: ${Number(this.pupilSize || 0).toFixed(2)}x`, rightX - 120, botY + 18);

    // Dynamic CRT Horizontal Scanline
    ctx.fillStyle = `${settings.primaryColor}44`;
    ctx.fillRect(0, this.scanlineY, width, 2);
    if (audio.snare > 0.6) {
      ctx.fillStyle = `${settings.secondaryColor}66`;
      ctx.fillRect(0, (this.scanlineY + 140) % height, width, 1.5);
    }
    ctx.restore();

    ctx.restore();
  }
}
