import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

export class KineticTypoGlitchVisualizer implements IVisualizer {
  public name = 'KINETIC_TYPO_GLITCH';
  private fontFamilies = [
    '"Space Grotesk", sans-serif',
    '"Syne", sans-serif',
    '"Cinzel Decorative", Georgia, serif',
    '"JetBrains Mono", monospace'
  ];

  public update(): void {}

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, metadata, interaction } = context;
    const bass = audio.bassEnergy ?? audio.kick;
    const mid = audio.midEnergy ?? audio.snare;
    const treble = audio.trebleEnergy ?? audio.hihat;
    const glow = settings.visGlow ?? 0.8;

    // Determine Display Text (Current synced lyric word/line or track info)
    let mainText = '';
    let subText = '';

    const syncOffset = settings.lyricsSyncOffset || 0;
    const currentTime = audio.time + syncOffset;

    if (settings.syncedLyrics && settings.syncedLyrics.length > 0) {
      const activeLine = settings.syncedLyrics.find(
        line => currentTime >= line.startTime && currentTime <= line.endTime
      );
      if (activeLine) {
        const activeWord = activeLine.words?.find(
          w => currentTime >= w.startTime && currentTime <= w.endTime
        );
        mainText = activeWord ? activeWord.word : activeLine.text;
        subText = activeWord ? activeLine.text : (metadata?.artist || settings.artistName || '');
      }
    }

    if (!mainText) {
      mainText = settings.trackTitle || metadata?.title || 'GLITCH FRAMER';
      subText = settings.artistName || metadata?.artist || 'STUDIO AUDIO CORE';
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Font selection based on user click / styleVariant
    const fontIdx = Math.abs((interaction?.styleVariant ?? 0) % this.fontFamilies.length);
    const selectedFont = this.fontFamilies[fontIdx];

    ctx.save();
    ctx.translate(centerX, centerY);

    // Audio Reactive Scale & Expansion
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickImpact = bass * beatSens;
    const scale = (settings.visScale ?? 1.0) * (1.0 + kickImpact * 0.45);
    ctx.scale(scale, scale);

    // Dynamic Font Sizing
    const isSingleWord = mainText.split(' ').length <= 2;
    const baseFontSize = isSingleWord 
      ? Math.min(width, height) * 0.18 
      : Math.min(width, height) * 0.09;
    const fontSize = baseFontSize + (mid * 20);

    ctx.font = `900 ${fontSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Vocal / Mid-High Neon Aura Glow
    if (mid > 0.35 || glow > 0.1) {
      const auraIntensity = (mid * 35 + treble * 25) * glow;
      ctx.shadowColor = settings.secondaryColor;
      ctx.shadowBlur = auraIntensity;
    }

    // 2. Glitch Slice & RGB Split (on heavy bass or user glitch boost)
    const glitchIntensity = (audio.energy > 0.65 ? (audio.energy - 0.65) * 3 : 0) + (interaction?.glitchBoost ?? 0);

    if (glitchIntensity > 0.1) {
      const shiftX = (Math.random() - 0.5) * 30 * glitchIntensity;
      const shiftY = (Math.random() - 0.5) * 12 * glitchIntensity;

      // Red Channel Shift
      ctx.fillStyle = '#FF0055';
      ctx.fillText(mainText, -shiftX, -shiftY);

      // Cyan Channel Shift
      ctx.fillStyle = '#00FFFF';
      ctx.fillText(mainText, shiftX, shiftY);

      // Horizontal Glitch Slice Slices
      const sliceCount = Math.floor(3 + glitchIntensity * 5);
      for (let s = 0; s < sliceCount; s++) {
        const sy = (Math.random() - 0.5) * fontSize * 1.2;
        const sh = Math.random() * 14 + 4;
        const sx = (Math.random() - 0.5) * 45 * glitchIntensity;
        ctx.save();
        ctx.beginPath();
        ctx.rect(-width / 2, sy, width, sh);
        ctx.clip();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(mainText, sx, 0);
        ctx.restore();
      }
    }

    // 3. Primary Main Typography Text
    ctx.fillStyle = settings.primaryColor;
    ctx.fillText(mainText, 0, 0);

    // 4. Subtitle / Artist / Context Typography
    if (subText && subText !== mainText) {
      ctx.font = `700 ${fontSize * 0.28}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.75 + mid * 0.25;
      ctx.shadowBlur = 0;
      ctx.fillText(subText.toUpperCase(), 0, fontSize * 0.85);
    }

    // 5. Kinetic Reactive Orbital Frequency Ring
    const ringRadius = Math.max(width * 0.22, fontSize * 0.9 + bass * 40);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `${settings.secondaryColor}44`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}
