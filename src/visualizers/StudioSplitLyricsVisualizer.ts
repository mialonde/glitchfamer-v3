import { AudioEvents, IVisualizer, RenderContext, SyncedLine, VisualizerSettings } from '../types';

interface ExtractedPalette {
  primary: string;
  secondary: string;
  glow: string;
  bgDark: string;
}

// Fallback preview lyrics if no lyrics loaded (matches Apple Music / Spotify TV reference)
const DEFAULT_PREVIEW_LYRICS: SyncedLine[] = [
  { startTime: 0.0, endTime: 6.5, text: "Coming out of my cage and I've been doing just fine" },
  { startTime: 6.5, endTime: 13.0, text: "Gotta gotta be down because I want it all" },
  { startTime: 13.0, endTime: 19.5, text: "It started out with a kiss, how did it end up like this?" },
  { startTime: 19.5, endTime: 26.0, text: "It was only a kiss, it was only a kiss" },
  { startTime: 26.0, endTime: 32.5, text: "Now I'm falling asleep and she's calling a cab" },
  { startTime: 32.5, endTime: 39.0, text: "While he's having a smoke and she's taking a drag" },
  { startTime: 39.0, endTime: 46.0, text: "Now they're going to bed and my stomach is sick" },
  { startTime: 46.0, endTime: 53.0, text: "And it's all in my head, but she's touching his chest now" },
  { startTime: 53.0, endTime: 59.5, text: "He takes off her dress now, let me go" },
  { startTime: 59.5, endTime: 66.0, text: "And I just can't look, it's killing me" },
  { startTime: 66.0, endTime: 73.0, text: "And taking control" },
  { startTime: 73.0, endTime: 80.0, text: "Jealousy, turning saints into the sea" },
  { startTime: 80.0, endTime: 87.0, text: "Swimming through sick lullabies" },
  { startTime: 87.0, endTime: 94.0, text: "Choking on your alibis" },
  { startTime: 94.0, endTime: 101.0, text: "But it's just the price I pay" },
  { startTime: 101.0, endTime: 108.0, text: "Destiny is calling me" },
  { startTime: 108.0, endTime: 115.0, text: "Open up my eager eyes" },
  { startTime: 115.0, endTime: 122.0, text: "'Cause I'm Mr. Brightside" },
];

export class StudioSplitLyricsVisualizer implements IVisualizer {
  public name = 'STUDIO_SPLIT_LYRICS';

  // Smooth Scrolling Spring Physics
  private currentScrollY = 0;
  private targetScrollY = 0;
  private time = 0;
  private pulseScale = 1.0;
  private coverTiltX = 0;
  private coverTiltY = 0;

  // Extracted Palette Cache
  private lastCoverSrc: string | null = null;
  private extractedPalette: ExtractedPalette | null = null;

  // Background Ambient Fluid Nodes
  private ambientBlobs = [
    { x: 0.2, y: 0.3, vx: 0.0004, vy: 0.0003, r: 0.45 },
    { x: 0.7, y: 0.6, vx: -0.0003, vy: -0.0004, r: 0.55 },
    { x: 0.5, y: 0.8, vx: 0.0005, vy: -0.0002, r: 0.40 },
  ];

  /**
   * Albüm kapağından dinamik ortam rengi ve derin arka plan çıkarımı
   */
  private extractPalette(image: HTMLImageElement | null, defaultPrimary: string, defaultSecondary: string): ExtractedPalette {
    if (!image || !image.complete || image.naturalWidth === 0) {
      return {
        primary: defaultPrimary || '#FFFFFF',
        secondary: defaultSecondary || '#38BDF8',
        glow: 'rgba(56, 189, 248, 0.4)',
        bgDark: '#0b0d13'
      };
    }

    try {
      const srcKey = image.src || 'split_cover_default';
      if (this.lastCoverSrc === srcKey && this.extractedPalette) {
        return this.extractedPalette;
      }

      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 32;
      sampleCanvas.height = 32;
      const sCtx = sampleCanvas.getContext('2d');
      if (!sCtx) throw new Error('No 2d context');

      sCtx.drawImage(image, 0, 0, 32, 32);
      const data = sCtx.getImageData(0, 0, 32, 32).data;

      let rSum = 0, gSum = 0, bSum = 0;
      let maxSat = -1;
      let vibrantR = 56, vibrantG = 189, vibrantB = 248;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        rSum += r;
        gSum += g;
        bSum += b;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;

        if (sat > maxSat && max > 60) {
          maxSat = sat;
          vibrantR = r;
          vibrantG = g;
          vibrantB = b;
        }
      }

      const count = data.length / 4;
      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);

      const darkR = Math.min(18, Math.round(avgR * 0.08 + 2));
      const darkG = Math.min(20, Math.round(avgG * 0.08 + 3));
      const darkB = Math.min(26, Math.round(avgB * 0.10 + 6));

      this.lastCoverSrc = srcKey;
      this.extractedPalette = {
        primary: `#${((1 << 24) + (vibrantR << 16) + (vibrantG << 8) + vibrantB).toString(16).slice(1)}`,
        secondary: defaultSecondary || '#38BDF8',
        glow: `rgba(${vibrantR}, ${vibrantG}, ${vibrantB}, 0.45)`,
        bgDark: `#${((1 << 24) + (darkR << 16) + (darkG << 8) + darkB).toString(16).slice(1)}`
      };

      return this.extractedPalette;
    } catch (_) {
      return {
        primary: defaultPrimary || '#FFFFFF',
        secondary: defaultSecondary || '#38BDF8',
        glow: 'rgba(56, 189, 248, 0.4)',
        bgDark: '#0b0d13'
      };
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const speed = settings.visSpeed ?? 1.0;
    this.time += 0.016 * speed;

    // Cover Pulse & Subtle 3D Float
    const targetScale = 1.0 + (bass * 0.045 * (settings.visBeatSensitivity ?? 1.0));
    this.pulseScale += (targetScale - this.pulseScale) * 0.2;

    this.coverTiltX = Math.sin(this.time * 0.8) * 0.02;
    this.coverTiltY = Math.cos(this.time * 0.6) * 0.02;

    // Ambient Backdrop Blobs
    for (const blob of this.ambientBlobs) {
      blob.x += blob.vx * (1 + bass * 1.5);
      blob.y += blob.vy * (1 + bass * 1.5);
      if (blob.x < 0.05 || blob.x > 0.95) blob.vx *= -1;
      if (blob.y < 0.05 || blob.y > 0.95) blob.vy *= -1;
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, audio, settings, coverImage, interaction } = context;
    const isPortrait = height > width;
    const pal = this.extractPalette(coverImage, settings.primaryColor, settings.secondaryColor);
    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const glow = settings.visGlow ?? 0.85;

    ctx.save();

    // ==========================================
    // 🌌 1. AMBIENT BLURRED BACKDROP (Apple Music TV Glass Canvas)
    // ==========================================
    this.renderAmbientBackdrop(ctx, width, height, coverImage, pal, bass);

    // ==========================================
    // 🎛️ 2. TOP GLASS STATUS & ACTION ICONS
    // ==========================================
    this.renderTopBarIcons(ctx, width, height, isPortrait);

    // Lyrics Data (Use loaded lyrics or curated sample matching the reference)
    const lyricsList = (settings.syncedLyrics && settings.syncedLyrics.length > 0)
      ? settings.syncedLyrics
      : DEFAULT_PREVIEW_LYRICS;

    const currentTime = audio.time || 0;
    const duration = audio.duration || (lyricsList[lyricsList.length - 1]?.endTime || 224);

    if (isPortrait) {
      // 📱 PORTRAIT / MOBILE COMPACT SPLIT (Top: Player, Bottom: Lyrics)
      const topSectionH = height * 0.44;
      this.renderLeftColumnPlayer(ctx, 0, 0, width, topSectionH, coverImage, settings, pal, currentTime, duration, bass, glow, true);
      this.renderRightColumnLyrics(ctx, 0, topSectionH, width, height - topSectionH, lyricsList, audio, settings, pal, glow, true);
    } else {
      // 🖥️ LANDSCAPE / DESKTOP SPLIT (Left 42%, Right 58%)
      const leftColW = Math.max(380, Math.min(width * 0.42, 600));
      const rightColW = width - leftColW;

      this.renderLeftColumnPlayer(ctx, 0, 0, leftColW, height, coverImage, settings, pal, currentTime, duration, bass, glow, false);
      this.renderRightColumnLyrics(ctx, leftColW, 0, rightColW, height, lyricsList, audio, settings, pal, glow, false);
    }

    ctx.restore();
  }

  /**
   * Apple Music / Spotify TV Ambient Fluid Backlight Arka Planı
   */
  private renderAmbientBackdrop(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    coverImage: HTMLImageElement | null,
    pal: ExtractedPalette,
    bass: number
  ) {
    // 1. Deep Dark Base
    ctx.fillStyle = pal.bgDark;
    ctx.fillRect(0, 0, width, height);

    // 2. Cover Art Heavy Blur Background
    if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.22 + (bass * 0.08);
      ctx.drawImage(coverImage, -width * 0.2, -height * 0.2, width * 1.4, height * 1.4);
      ctx.restore();
    }

    // 3. Ambient Fluid Nebulas
    for (const blob of this.ambientBlobs) {
      const bx = blob.x * width;
      const by = blob.y * height;
      const radius = blob.r * Math.max(width, height) * (1 + bass * 0.15);

      const radGrad = ctx.createRadialGradient(bx, by, 10, bx, by, radius);
      radGrad.addColorStop(0, `${pal.primary}2A`);
      radGrad.addColorStop(0.5, `${pal.secondary}14`);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Dark Vignette Overlay
    const vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.75
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    vigGrad.addColorStop(0.7, 'rgba(5, 7, 12, 0.85)');
    vigGrad.addColorStop(1, 'rgba(2, 3, 6, 0.96)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Üst Sol Köşe / Sağ Köşe Minimal Kontrol ve Durum İkonları (Referans `fdfddfd.png`)
   */
  private renderTopBarIcons(ctx: CanvasRenderingContext2D, width: number, height: number, isPortrait: boolean) {
    ctx.save();
    const iconY = isPortrait ? 28 : 36;
    const startX = isPortrait ? 24 : 44;
    const spacing = 34;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Close / Back (✕)
    ctx.beginPath();
    ctx.moveTo(startX - 6, iconY - 6);
    ctx.lineTo(startX + 6, iconY + 6);
    ctx.moveTo(startX + 6, iconY - 6);
    ctx.lineTo(startX - 6, iconY + 6);
    ctx.stroke();

    // 2. Karaoke / Lyrics Mic (🎤)
    const micX = startX + spacing;
    ctx.beginPath();
    ctx.arc(micX, iconY - 2, 4, 0, Math.PI * 2);
    ctx.moveTo(micX, iconY + 2);
    ctx.lineTo(micX, iconY + 7);
    ctx.stroke();

    // 3. Audio Visualizer Spectrum (ılıl)
    const waveX = micX + spacing;
    ctx.beginPath();
    ctx.moveTo(waveX - 6, iconY + 4);
    ctx.lineTo(waveX - 6, iconY - 3);
    ctx.moveTo(waveX - 2, iconY + 6);
    ctx.lineTo(waveX - 2, iconY - 6);
    ctx.moveTo(waveX + 2, iconY + 5);
    ctx.lineTo(waveX + 2, iconY - 4);
    ctx.moveTo(waveX + 6, iconY + 3);
    ctx.lineTo(waveX + 6, iconY - 2);
    ctx.stroke();

    // 4. Focus / Eye Mode (👁)
    const eyeX = waveX + spacing;
    ctx.beginPath();
    ctx.ellipse(eyeX, iconY, 6, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(eyeX, iconY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * SOL KOLON: Albüm Kapağı, Şarkı Bilgisi, Ses Kalitesi Rozeti (FLAC), Scrubber & Play Butonu
   */
  private renderLeftColumnPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    coverImage: HTMLImageElement | null,
    settings: VisualizerSettings,
    pal: ExtractedPalette,
    currentTime: number,
    duration: number,
    bass: number,
    glow: number,
    isPortrait: boolean
  ) {
    const title = settings.trackTitle || "Demo Song";
    const artist = settings.artistName || "Demo Singer";

    ctx.save();
    ctx.translate(x, y);

    const padLeft = isPortrait ? 24 : Math.max(48, w * 0.12);
    const contentW = isPortrait ? w - 48 : w - padLeft - 32;

    // 1. ALBÜM KAPAĞI (Squircle Rounded Artwork with 3D Depth)
    const maxCoverSize = isPortrait ? Math.min(w * 0.44, h * 0.48) : Math.min(contentW, h * 0.46, 380);
    const coverSize = maxCoverSize * this.pulseScale;
    const coverX = padLeft;
    const coverY = isPortrait ? 52 : Math.max(70, h * 0.12);

    ctx.save();
    // Ambient Drop Shadow / Glow
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 32 * glow * (1 + bass * 0.4);
    ctx.shadowOffsetY = 12;

    // Rounded Squircle Clip
    const cornerRadius = 18;
    this.drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, cornerRadius);
    ctx.fillStyle = '#11131c';
    ctx.fill();
    ctx.restore();

    ctx.save();
    this.drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, cornerRadius);
    ctx.clip();

    if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
      ctx.drawImage(coverImage, coverX, coverY, coverSize, coverSize);
    } else {
      // Prosedürel Şık Sanal Kapak (The Killers - Direct Hits tarzı halkalı plak)
      ctx.fillStyle = '#0f1118';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);

      // Hedef / Plak Eşmerkezli Halkaları (Reference 3)
      const cx = coverX + coverSize / 2;
      const cy = coverY + coverSize / 2;
      for (let r = 15; r < coverSize * 0.46; r += 14) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${coverSize * 0.12}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((artist || "DEMO SINGER").toUpperCase(), cx, cy - 14);
      ctx.font = `bold ${coverSize * 0.07}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = pal.primary;
      ctx.fillText("DIRECT AUDIO", cx, cy + 18);
    }

    // Cam / Specular Üst Işık Katmanı
    const glassGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(coverX, coverY, coverSize, coverSize);

    ctx.restore();

    // 2. ŞARKI ADI & AUDIO KALİTE ROZETİ (FLAC / LOSSLESS / HI-RES)
    const textStartY = coverY + coverSize + (isPortrait ? 18 : 28);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Şarkı Adı
    ctx.fillStyle = '#FFFFFF';
    const titleFontSize = isPortrait ? 18 : Math.min(26, Math.max(20, contentW * 0.075));
    ctx.font = `900 ${titleFontSize}px "Space Grotesk", sans-serif`;
    ctx.fillText(title, padLeft, textStartY);

    const titleWidth = ctx.measureText(title).width;

    // FLAC / Lossless Rozeti (Reference: `FLAC` capsule badge)
    const badgeX = padLeft + titleWidth + 12;
    const badgeY = textStartY - titleFontSize * 0.78;
    const badgeW = 38;
    const badgeH = 16;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFFDD';
    ctx.font = '900 9px "Space Grotesk", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("FLAC", badgeX + badgeW / 2, badgeY + badgeH / 2 + 0.5);
    ctx.restore();

    // Sanatçı Adı
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = `600 ${isPortrait ? 13 : 15}px "Space Grotesk", sans-serif`;
    ctx.fillText(artist, padLeft, textStartY + (isPortrait ? 18 : 24));

    // 3. İLERLEME ÇUBUĞU (SCRUBBER TIMELINE)
    const scrubberY = textStartY + (isPortrait ? 42 : 68);
    const scrubberW = contentW;
    const curMin = Math.floor(currentTime / 60);
    const curSec = Math.floor(currentTime % 60);
    const totalMin = Math.floor(duration / 60);
    const totalSec = Math.floor(duration % 60);
    const curTimeStr = `${curMin}:${curSec.toString().padStart(2, '0')}`;
    const totalTimeStr = `${totalMin}:${totalSec.toString().padStart(2, '0')}`;

    // Zaman Sayacı Sol & Sağ
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = `600 ${isPortrait ? 11 : 12}px "Space Grotesk", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(curTimeStr, padLeft, scrubberY - 10);

    ctx.textAlign = 'right';
    ctx.fillText(totalTimeStr, padLeft + scrubberW, scrubberY - 10);

    // Track Çizgisi
    const progress = duration > 0 ? Math.min(1.0, Math.max(0, currentTime / duration)) : 0.25;
    ctx.beginPath();
    ctx.moveTo(padLeft, scrubberY);
    ctx.lineTo(padLeft + scrubberW, scrubberY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Doldurulmuş İlerleme Çizgisi
    const filledW = scrubberW * progress;
    if (filledW > 0) {
      ctx.beginPath();
      ctx.moveTo(padLeft, scrubberY);
      ctx.lineTo(padLeft + filledW, scrubberY);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // 4. PARLAYAN OYNAT/DURAKLAT KONTROL BUTONU (Reference Center Pill Pause Button)
    if (!isPortrait) {
      const buttonY = scrubberY + 52;
      const buttonX = padLeft + (scrubberW / 2);
      const btnRadius = 24;

      ctx.save();
      ctx.beginPath();
      ctx.arc(buttonX, buttonY, btnRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 18;
      ctx.fill();

      // Pause İkonu (İki Dikey Çubuk)
      ctx.fillStyle = '#0b0d13';
      const barH = 14;
      const barW = 3.5;
      ctx.fillRect(buttonX - 5.5, buttonY - barH / 2, barW, barH);
      ctx.fillRect(buttonX + 2, buttonY - barH / 2, barW, barH);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * SAĞ KOLON: Apple Music / Spotify TV Stili Akan Şarkı Sözleri (Flowing Synced Lyrics)
   */
  private renderRightColumnLyrics(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    lyrics: SyncedLine[],
    audio: AudioEvents,
    settings: VisualizerSettings,
    pal: ExtractedPalette,
    glow: number,
    isPortrait: boolean
  ) {
    if (!lyrics || lyrics.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.translate(x, y);

    const syncOffset = settings.lyricsSyncOffset || 0;
    const currentTime = (audio.time || 0) + syncOffset;
    const bass = audio.bassEnergy ?? audio.kick ?? 0;

    // 1. O anki aktif kelimenin satırını bul (Kelime bazlı hassas arama)
    let activeIdx = -1;
    let nextIdx = -1;
    
    // Önce tamamen aktif olan satırı bul (currentTime satırın içinde)
    activeIdx = lyrics.findIndex(
      l => currentTime >= l.startTime && currentTime <= l.endTime
    );

    // Eğer tam o an aktif bir satır yoksa, şarkı neresinde kalmış bul
    nextIdx = lyrics.findIndex(l => l.startTime > currentTime);
    
    // Aktif bir satır yoksa, bir önceki satırı aktif satır gibi highlight et 
    // (Apple Music/Spotify stili - aralarda kalınca son satır parlar veya bekler)
    if (activeIdx === -1) {
      if (nextIdx !== -1) {
        // Sıradaki satır var, demek ki iki satır arasındayız. 
        // Bir önceki satırı (varsa) son söylenen olarak işaretle, ama süresi bitmiş olacak
        activeIdx = Math.max(0, nextIdx - 1);
      } else {
        // Şarkı bitmiş, tüm satırlar geçmiş, son satırda kal
        activeIdx = lyrics.length - 1;
      }
    }

    const activeLine = lyrics[activeIdx];
    // Satırın aktif okunma süresinin bitip bitmediği (vocal gap beklemesi)
    const isVocalGap = activeIdx !== -1 && activeLine && currentTime > activeLine.endTime && nextIdx !== -1;

    // Dikey Akış & Spring Lerp Hesaplaması
    const baseFontSize = isPortrait ? 24 : Math.min(44, Math.max(30, w * 0.058));
    const lineSpacing = baseFontSize * (isPortrait ? 1.6 : 1.75);
    const centerY = isPortrait ? h * 0.42 : h * 0.46;

    // Hedef scroll pozisyonu (aktif satırın merkezde olması)
    this.targetScrollY = centerY - (activeIdx * lineSpacing);
    this.currentScrollY += (this.targetScrollY - this.currentScrollY) * 0.085;

    const padLeft = isPortrait ? 24 : Math.max(48, w * 0.08);
    const fontFamily = settings.lyricsFontFamily ? `"${settings.lyricsFontFamily}", sans-serif` : '"Space Grotesk", sans-serif';

    // Üst ve Alt Şeffaflık Maskesi / Gradyan Karartması (Soft Depth Fade)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    lyrics.forEach((line, idx) => {
      const lineY = this.currentScrollY + (idx * lineSpacing);

      // Ekran dışındakileri çizme
      if (lineY < -60 || lineY > h + 60) return;

      const distFromCenter = Math.abs(lineY - centerY);
      const isCurrentActive = idx === activeIdx;

      ctx.save();

      if (isCurrentActive) {
        // ==========================================
        // 🌟 AKTİF SATIR (Büyük, Kalın, Parlak Beyaz, Kelime Akışı)
        // ==========================================
        const kickScale = 1.0 + (bass * 0.035);
        ctx.translate(padLeft, lineY);
        ctx.scale(kickScale, kickScale);

        ctx.font = `900 ${baseFontSize}px ${fontFamily}`;

        // Kelime düzeyinde zamanlama varsa (BetterLyrics / Suno Aligned)
        if (line.words && line.words.length > 0) {
          let cursorX = 0;
          line.words.forEach(wItem => {
            const wText = wItem.word + " ";
            const wWidth = ctx.measureText(wText).width;
            const isWordActive = currentTime >= wItem.startTime && currentTime <= wItem.endTime;
            const isWordPast = currentTime > wItem.endTime;

            if (isWordActive) {
              // Aktif söylenen kelime: Parlak ışıma & Degrade Dolgu
              ctx.save();
              const wDur = Math.max(0.1, wItem.endTime - wItem.startTime);
              const progress = Math.max(0, Math.min(1, (currentTime - wItem.startTime) / wDur));

              const wordGrad = ctx.createLinearGradient(cursorX, 0, cursorX + wWidth, 0);
              wordGrad.addColorStop(0, '#FFFFFF');
              wordGrad.addColorStop(progress, '#FFFFFF');
              wordGrad.addColorStop(Math.min(1, progress + 0.1), 'rgba(255, 255, 255, 0.45)');
              wordGrad.addColorStop(1, 'rgba(255, 255, 255, 0.45)');

              ctx.fillStyle = wordGrad;
              ctx.shadowColor = '#FFFFFF';
              ctx.shadowBlur = 18 * glow;
              ctx.fillText(wItem.word, cursorX, 0);
              ctx.restore();
            } else if (isWordPast) {
              // Söylenmiş kelime: Düz beyaz
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(wItem.word, cursorX, 0);
            } else {
              // Henüz söylenmemiş kelime: Hafif şeffaf
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillText(wItem.word, cursorX, 0);
            }

            cursorX += wWidth;
          });
        } else {
          // Satır düzeyinde düzgün parıltılı beyaz render
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.shadowBlur = 16 * glow;
          ctx.fillText(line.text, 0, 0);
        }

      } else {
        // ==========================================
        // 🌫️ PASİF SATIRLAR (Derinlik Bulanıklığı, Kısıtlı Şeffaflık)
        // ==========================================
        const normalizedDist = Math.min(1.0, distFromCenter / (h * 0.45));
        const opacity = Math.max(0.08, (1.0 - normalizedDist) * 0.42);
        const fontSize = baseFontSize * (1.0 - (normalizedDist * 0.14));

        ctx.translate(padLeft, lineY);
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        // Derinlik hissi için hafif bulanıklık (Depth of Field)
        if (normalizedDist > 0.3 && typeof (ctx as any).filter !== 'undefined') {
          (ctx as any).filter = `blur(${Math.round(normalizedDist * 2.5)}px)`;
        }

        ctx.fillText(line.text, 0, 0);
      }

      ctx.restore();
    });

    // ==========================================
    // ⏱️ VOCAL GAP / ENSTRÜMANTAL BEKLEME NOKTALARI (•••)
    // ==========================================
    if (isVocalGap && nextIdx !== -1 && lyrics[nextIdx]) {
      const nextLine = lyrics[nextIdx];
      const remainingTime = nextLine.startTime - currentTime;
      if (remainingTime > 0.1 && remainingTime <= 4.0) {
        const dotY = centerY + (baseFontSize * 1.1);
        const dotCount = 3;
        const spacing = 22;
        const progress = 1 - (remainingTime / 3.5);

        ctx.save();
        ctx.translate(padLeft, dotY);
        for (let d = 0; d < dotCount; d++) {
          const threshold = (d + 1) / (dotCount + 1);
          const isLit = progress >= threshold;
          ctx.beginPath();
          ctx.arc(d * spacing, 0, isLit ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isLit ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)';
          if (isLit) {
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 10;
          }
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Üst ve Alt Kenar Karartma Gradyanları (Smooth Vignette Fade)
    const topFade = ctx.createLinearGradient(0, 0, 0, h * 0.18);
    topFade.addColorStop(0, pal.bgDark);
    topFade.addColorStop(1, 'transparent');
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, w, h * 0.18);

    const bottomFade = ctx.createLinearGradient(0, h * 0.82, 0, h);
    bottomFade.addColorStop(0, 'transparent');
    bottomFade.addColorStop(1, pal.bgDark);
    ctx.fillStyle = bottomFade;
    ctx.fillRect(0, h * 0.82, w, h * 0.18);

    ctx.restore();
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
