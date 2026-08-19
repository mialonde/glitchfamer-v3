import { createCanvas, loadImage } from '@napi-rs/canvas';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { VisualizerSettings, AudioEvents } from '../src/types';
import { StudioRenderer } from '../src/core/Renderer';
import { OfflineAudioProcessor } from '../src/core/AudioAnalysisEngine';

export interface RenderJob {
  id: string;
  ownerToken: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
  currentFrame: number;
  totalFrames: number;
  outputPath: string | null;
  videoUrl: string | null;
  error?: string | null;
  createdAt: number;
  duration: number;
  fps: number;
  trackTitle: string;
  cancel?: () => void;
}

export interface StartRenderPayload {
  audioBase64?: string;
  audioFilePath?: string;
  audioRemoteUrl?: string;
  mimeType?: string;
  settings: VisualizerSettings;
  duration?: number;
  fps?: number;
  coverBase64?: string | null;
  coverFilePath?: string | null;
  logoBase64?: string | null;
  logoFilePath?: string | null;
  bgImageBase64?: string | null;
  bgImageFilePath?: string | null;
  quality?: '1080p' | '720p';
}

const jobs = new Map<string, RenderJob>();
const renderQueue: { jobId: string; payload: StartRenderPayload }[] = [];
let activeRendersCount = 0;
const MAX_CONCURRENT_RENDERS = 2; // Stabilite ve CPU kilitlenmesini önleme limiti

// Temp ve Render çıktı klasörlerini hazırla
const TEMP_DIR = path.join(process.cwd(), 'temp_renders');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Otomatik 15 dakikalık disk ve temp dosya temizleme rutini (20 dakikadan eski dosyalar)
setInterval(() => {
  try {
    const now = Date.now();
    // 1. İş kayıtlarını temizle
    for (const [id, job] of jobs.entries()) {
      if (now - job.createdAt > 30 * 60 * 1000) {
        if (job.outputPath && fs.existsSync(job.outputPath)) {
          try { fs.unlinkSync(job.outputPath); } catch (_) {}
        }
        jobs.delete(id);
      }
    }
    // 2. Temp klasöründeki yetim / geçici dosyaları süpür
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      for (const file of files) {
        const fullPath = path.join(TEMP_DIR, file);
        try {
          const stats = fs.statSync(fullPath);
          if (now - stats.mtimeMs > 20 * 60 * 1000) {
            fs.unlinkSync(fullPath);
          }
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('Temp disk cleanup warning:', err);
  }
}, 15 * 60 * 1000);

export function getRenderJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

export function cancelRenderJob(id: string): boolean {
  const job = jobs.get(id);
  // Kuyruktaysa kuyruktan çıkar
  const qIdx = renderQueue.findIndex(q => q.jobId === id);
  if (qIdx !== -1) {
    renderQueue.splice(qIdx, 1);
  }

  if (job && (job.status === 'processing' || job.status === 'queued')) {
    const wasProcessing = job.status === 'processing';
    if (job.cancel) {
      job.cancel();
    }
    job.status = 'cancelled';
    job.stage = 'Kullanıcı tarafından iptal edildi';
    if (wasProcessing) {
      activeRendersCount = Math.max(0, activeRendersCount - 1);
      processNextQueueItem();
    }
    return true;
  }
  return false;
}

export async function createRenderJob(payload: StartRenderPayload): Promise<{ jobId: string; ownerToken: string }> {
  const jobId = `render_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const ownerToken = crypto.randomBytes(24).toString('hex');
  const fps = payload.fps || 30; // 30 FPS yüksek stabilite ve akıcılık
  const settings = payload.settings;

  const job: RenderJob = {
    id: jobId,
    ownerToken,
    status: 'queued',
    progress: 0,
    stage: activeRendersCount >= MAX_CONCURRENT_RENDERS 
      ? `Render kuyrukta bekliyor (Sıra: ${renderQueue.length + 1})...` 
      : 'Render başlatılıyor...',
    currentFrame: 0,
    totalFrames: 0,
    outputPath: null,
    videoUrl: null,
    error: null,
    createdAt: Date.now(),
    duration: payload.duration || 30,
    fps,
    trackTitle: settings.trackTitle || 'vidframer_export'
  };

  jobs.set(jobId, job);
  renderQueue.push({ jobId, payload });

  processNextQueueItem();

  return { jobId, ownerToken };
}

function processNextQueueItem() {
  if (activeRendersCount >= MAX_CONCURRENT_RENDERS || renderQueue.length === 0) {
    return;
  }

  const nextItem = renderQueue.shift();
  if (!nextItem) return;

  const job = jobs.get(nextItem.jobId);
  if (!job || job.status === 'cancelled') {
    processNextQueueItem();
    return;
  }

  activeRendersCount++;

  processRenderJob(nextItem.jobId, nextItem.payload)
    .catch((err) => {
      console.error(`Render Job ${nextItem.jobId} failed:`, err);
      const j = jobs.get(nextItem.jobId);
      if (j) {
        j.status = 'failed';
        j.error = err?.message || 'Bilinmeyen render hatası';
        j.stage = `Hata: ${j.error}`;
      }
    })
    .finally(() => {
      activeRendersCount = Math.max(0, activeRendersCount - 1);
      processNextQueueItem();
    });
}

async function processRenderJob(jobId: string, payload: StartRenderPayload) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.stage = '[1/4] Ses dalgaları ve zamanlama çözümleniyor...';
  job.progress = 5;

  const tempAudioPath = path.join(TEMP_DIR, `${jobId}_input_audio.bin`);
  const tempPcmPath = path.join(TEMP_DIR, `${jobId}_audio.raw`);
  const outputVideoPath = path.join(TEMP_DIR, `${jobId}_output.mp4`);
  job.outputPath = outputVideoPath;

  let ffmpegProcess: any = null;
  let isCancelled = false;

  job.cancel = () => {
    isCancelled = true;
    if (ffmpegProcess) {
      try { ffmpegProcess.kill('SIGKILL'); } catch (_) {}
    }
    cleanupTempFiles([tempAudioPath, tempPcmPath]);
  };

  try {
    // 1. Audio dosyasını hazırla
    if (payload.audioFilePath && fs.existsSync(payload.audioFilePath)) {
      // Multer tarafından yüklenen dosyayı tempAudioPath'e kopyala / taşı
      fs.copyFileSync(payload.audioFilePath, tempAudioPath);
    } else if (payload.audioRemoteUrl && payload.audioRemoteUrl.startsWith('http')) {
      // Uzak sunucudan doğrudan indir
      const remoteRes = await fetch(payload.audioRemoteUrl);
      if (!remoteRes.ok) {
        throw new Error(`Uzak ses dosyası indirilemedi: HTTP ${remoteRes.status}`);
      }
      const remoteBuffer = Buffer.from(await remoteRes.arrayBuffer());
      fs.writeFileSync(tempAudioPath, remoteBuffer);
    } else if (payload.audioRemoteUrl) {
      // Yerel dosya yolu desteği (örn. /demo-items/MESELE.flac)
      const cleanPath = payload.audioRemoteUrl.replace(/^\//, '');
      const localPublicPath = path.join(process.cwd(), 'public', cleanPath);
      const localDirectPath = path.join(process.cwd(), cleanPath);
      if (fs.existsSync(localPublicPath)) {
        fs.copyFileSync(localPublicPath, tempAudioPath);
      } else if (fs.existsSync(localDirectPath)) {
        fs.copyFileSync(localDirectPath, tempAudioPath);
      } else {
        throw new Error(`Yerel ses dosyası bulunamadı: ${payload.audioRemoteUrl}`);
      }
    } else if (payload.audioBase64) {
      let audioBuffer: Buffer;
      if (payload.audioBase64.includes(',')) {
        audioBuffer = Buffer.from(payload.audioBase64.split(',')[1], 'base64');
      } else {
        audioBuffer = Buffer.from(payload.audioBase64, 'base64');
      }
      fs.writeFileSync(tempAudioPath, audioBuffer);
    } else {
      throw new Error("Ses dosyası verisi bulunamadı.");
    }

    // 2. Ses süresini ffprobe ile tam tespit et
    let audioDuration = payload.duration || 30;
    try {
      const probeOutput = execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempAudioPath}"`
      ).toString().trim();
      const parsedDur = parseFloat(probeOutput);
      if (!isNaN(parsedDur) && parsedDur > 0) {
        audioDuration = parsedDur;
      }
    } catch (e) {
      console.warn('ffprobe duration detection warning, fallback to requested duration:', e);
    }

    job.duration = audioDuration;
    const fps = payload.fps || 30;
    const totalFrames = Math.max(1, Math.floor(audioDuration * fps));
    job.totalFrames = totalFrames;

    // 3. FFmpeg ile 44.1kHz 16-bit Mono Raw PCM çıkar
    try {
      execSync(`ffmpeg -y -i "${tempAudioPath}" -f s16le -ac 1 -ar 44100 "${tempPcmPath}"`, {
        stdio: 'ignore'
      });
    } catch (e) {
      throw new Error('Ses dosyası PCM formatına dönüştürülemedi.');
    }

    if (isCancelled) return;

    // 4. PCM verisini RAM'e yükle ve Spektrum / Enerji Tablosunu Oluştur
    const pcmBuffer = fs.readFileSync(tempPcmPath);
    const sampleRate = 44100;
    const pcmSamples = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);

    job.stage = '[2/4] Görseller ve Stüdyo motoru hazırlanıyor...';
    job.progress = 12;

    // 5. Çözünürlük ve Canvas Boyutlarını Ayarla
    const aspectRatio = payload.settings.aspectRatio || '9/16';
    let width = 1080;
    let height = 1920;

    if (aspectRatio === '16/9') {
      width = 1920;
      height = 1080;
    } else if (aspectRatio === '1/1') {
      width = 1080;
      height = 1080;
    }

    // 720p render kalitesi seçildiyse ölçekle
    if (payload.quality === '720p') {
      if (aspectRatio === '9/16') { width = 720; height = 1280; }
      else if (aspectRatio === '16/9') { width = 1280; height = 720; }
      else if (aspectRatio === '1/1') { width = 720; height = 720; }
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const renderer = new StudioRenderer(canvas as any);

    // Kapak görseli varsa yükle
    if (payload.coverFilePath && fs.existsSync(payload.coverFilePath)) {
      try {
        const coverImg = await loadImage(payload.coverFilePath);
        renderer.setCoverImage(coverImg as any);
      } catch (e) {
        console.warn('Cover image file load warning:', e);
      }
    } else if (payload.coverBase64) {
      try {
        const coverImg = await loadImage(payload.coverBase64);
        renderer.setCoverImage(coverImg as any);
      } catch (e) {
        console.warn('Cover image load warning:', e);
      }
    }

    // Logo görseli varsa yükle
    if (payload.logoFilePath && fs.existsSync(payload.logoFilePath)) {
      try {
        const logoImg = await loadImage(payload.logoFilePath);
        renderer.setLogoImage(logoImg as any);
      } catch (e) {
        console.warn('Logo image file load warning:', e);
      }
    } else if (payload.logoBase64) {
      try {
        const logoImg = await loadImage(payload.logoBase64);
        renderer.setLogoImage(logoImg as any);
      } catch (e) {
        console.warn('Logo image load warning:', e);
      }
    }

    // Arka Plan Görseli (Static Wallpaper) varsa yükle
    if (payload.bgImageFilePath && fs.existsSync(payload.bgImageFilePath)) {
      try {
        const bgImg = await loadImage(payload.bgImageFilePath);
        renderer.setBgImage(bgImg as any);
      } catch (e) {
        console.warn('Background image file load warning:', e);
      }
    } else if (payload.bgImageBase64) {
      try {
        const bgImg = await loadImage(payload.bgImageBase64);
        renderer.setBgImage(bgImg as any);
      } catch (e) {
        console.warn('Background image load warning:', e);
      }
    } else if (payload.settings?.bgImageUrl) {
      try {
        const bgImg = await loadImage(payload.settings.bgImageUrl);
        renderer.setBgImage(bgImg as any);
      } catch (e) {
        console.warn('Settings bgImageUrl load warning:', e);
      }
    }

    if (isCancelled) return;

    job.stage = `[3/4] 60 FPS Kareler çiziliyor ve FFmpeg MP4 kodlanıyor... (0/${totalFrames})`;
    job.progress = 15;

    // 6. FFmpeg H.264 / AAC MP4 Kodlayıcıyı Başlat
    const ffmpegArgs = [
      '-y',
      '-f', 'rawvideo',
      '-vcodec', 'rawvideo',
      '-pix_fmt', 'rgba',
      '-s', `${width}x${height}`,
      '-r', `${fps}`,
      '-i', 'pipe:0',
      '-i', tempAudioPath,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-shortest',
      '-movflags', '+faststart',
      outputVideoPath
    ];

    ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

    let ffmpegErrLog = '';
    ffmpegProcess.stderr.on('data', (d: Buffer) => {
      ffmpegErrLog += d.toString();
    });

    const ffmpegPromise = new Promise<void>((resolve, reject) => {
      ffmpegProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg kodlama hatası (kod ${code}): ${ffmpegErrLog.slice(-400)}`));
        }
      });
      ffmpegProcess.on('error', (err: any) => {
        reject(err);
      });
    });

    // 7. Her Frame İçin Audio Analizi ve Canvas Çizim Döngüsü
    let currentFrame = 0;
    const offlineProcessor = new OfflineAudioProcessor(sampleRate);

    const renderNextFrames = async () => {
      while (currentFrame < totalFrames && !isCancelled) {
        const t = currentFrame / fps;
        const centerSample = Math.floor(t * sampleRate);

        // Gerçek FFT ve Adaptif Beat Analizi ile AudioEvents üret
        const audioEvents = offlineProcessor.processFrame(pcmSamples, centerSample, t, 1 / fps);

        // Stüdyo motorunu bu kare için çalıştır
        renderer.render(audioEvents, payload.settings);

        // Raw RGBA Frame Verisini Al ve FFmpeg'e Yaz
        const imgData = ctx.getImageData(0, 0, width, height);
        const frameBuffer = Buffer.from(imgData.data.buffer, imgData.data.byteOffset, imgData.data.byteLength);
        currentFrame++;
        job.currentFrame = currentFrame;

        // İlerleme yüzdesi (%15 - %92 arası)
        const framePercent = Math.round((currentFrame / totalFrames) * 77);
        job.progress = 15 + framePercent;
        if (currentFrame % (fps * 2) === 0 || currentFrame === totalFrames) {
          job.stage = `[3/4] Kareler işleniyor: %${job.progress} (Kare ${currentFrame}/${totalFrames})`;
        }

        const canContinue = ffmpegProcess.stdin.write(frameBuffer);
        if (!canContinue) {
          await new Promise<void>((r) => ffmpegProcess.stdin.once('drain', r));
        }
      }

      ffmpegProcess.stdin.end();
    };

    await renderNextFrames();

    if (isCancelled) {
      cleanupTempFiles([tempAudioPath, tempPcmPath]);
      return;
    }

    job.stage = '[4/4] Video ve ses birleştiriliyor (MP4)...';
    job.progress = 95;

    await ffmpegPromise;

    // 8. Tamamlandı!
    job.progress = 100;
    job.status = 'completed';
    job.stage = '✨ Render tamamlandı! Video indirilmeye hazır.';
    job.videoUrl = `/api/render/download/${jobId}`;

    cleanupTempFiles([tempAudioPath, tempPcmPath]);

  } catch (err: any) {
    console.error(`Render Job ${jobId} error:`, err);
    cleanupTempFiles([tempAudioPath, tempPcmPath]);
    job.status = 'failed';
    job.error = err?.message || 'Render sırasında hata oluştu.';
    job.stage = `Hata: ${job.error}`;
  }
}

function cleanupTempFiles(filePaths: string[]) {
  filePaths.forEach((fp) => {
    try {
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
      }
    } catch (_) {}
  });
}
