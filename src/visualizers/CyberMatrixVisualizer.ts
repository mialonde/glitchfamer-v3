import { AudioEvents, IVisualizer, RenderContext, VisualizerSettings } from '../types';

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

export class CyberMatrixVisualizer implements IVisualizer {
  public name = 'CYBER_MATRIX';
  private columns: MatrixColumn[] = [];
  private charPool = '0123456789ABCDEFGHJKMNPQRSTVWXYZ✦⚡';

  constructor() {
    this.initColumns(50);
  }

  private initColumns(count: number) {
    const spacing = 1920 / count;
    this.columns = Array.from({ length: count }, (_, i) => ({
      x: i * spacing + spacing / 2,
      y: Math.random() * 1080,
      speed: 3 + Math.random() * 8,
      chars: Array.from({ length: 18 }, () => this.charPool[Math.floor(Math.random() * this.charPool.length)])
    }));
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const speed = settings.visSpeed ?? 1.0;
    const density = Math.max(0.3, settings.visDensity ?? 1.0);
    const targetCount = Math.floor(60 * density);

    if (this.columns.length !== targetCount) {
      this.initColumns(targetCount);
    }

    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    this.columns.forEach((col, idx) => {
      const specIdx = Math.floor((idx / this.columns.length) * audio.spectrum.length);
      const specVal = audio.spectrum[specIdx] || 0;

      // Downward drop speed modulated by audio spectrum and kick
      col.y += (col.speed + specVal * 16 + kickBoost * 12) * speed;

      if (col.y > 1180) {
        col.y = -200;
        col.x = idx * (1920 / this.columns.length) + (1920 / this.columns.length) / 2;
      }

      // Mutate random character
      if (Math.random() < 0.1) {
        const charIdx = Math.floor(Math.random() * col.chars.length);
        col.chars[charIdx] = this.charPool[Math.floor(Math.random() * this.charPool.length)];
      }
    });
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings } = context;
    const scale = settings.visScale ?? 1.0;
    const glow = settings.visGlow ?? 0.5;
    const fontSize = Math.max(10, 16 * scale);
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const kickBoost = audio.kick * beatSens;

    ctx.save();
    ctx.font = `black ${fontSize}px monospace`;

    if (glow > 0.05) {
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 12 * glow * (1 + kickBoost);
    }

    this.columns.forEach(col => {
      col.chars.forEach((char, cIdx) => {
        const charY = col.y - (cIdx * fontSize * 1.2);
        if (charY < -50 || charY > height + 50) return;

        const isLead = cIdx === 0;
        const color = isLead ? (settings.secondaryColor || '#FFFFFF') : settings.primaryColor;
        const alpha = Math.max(0, 1.0 - (cIdx / col.chars.length));

        ctx.fillStyle = color;
        ctx.globalAlpha = isLead ? 1.0 : alpha * 0.75;
        ctx.fillText(char, col.x, charY);
      });
    });

    ctx.restore();
  }
}
