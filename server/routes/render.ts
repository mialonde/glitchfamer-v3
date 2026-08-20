import express, { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { spawn } from "child_process";
import { createRenderJob, getRenderJob, cancelRenderJob } from "../renderEngine";
import { 
  isUrlSafe, 
  resolveSafeLocalPath, 
  clampDuration, 
  clampFps, 
  dailyQuotaManager 
} from "../utils/security";

const router = Router();

const TEMP_DIR = path.join(process.cwd(), "temp_renders");
const UPLOADS_DIR = path.join(TEMP_DIR, "chunked_uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB max
});

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB chunk max
});

// IDOR Protection: Render Owner Validation (Fail-Closed)
function isRenderJobAuthorized(req: express.Request, job: any): boolean {
  if (!job) return false;
  if (!job.ownerToken) return false;
  const providedToken = (req.headers["x-render-token"] || req.query.token) as string | undefined;
  return Boolean(providedToken && providedToken === job.ownerToken);
}

// Helper: Extract client IP for quota tracking
function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

// 1a. Chunk Upload
router.post("/upload-chunk", chunkUpload.single("chunk"), async (req, res) => {
  try {
    const { uploadId, fileType, chunkIndex, totalChunks } = req.body;
    const sanitizedId = (uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitizedFileType = (fileType || "").replace(/[^a-zA-Z0-9_-]/g, "");

    if (!sanitizedId || !sanitizedFileType || !req.file) {
      return res.status(400).json({ error: "Geçerli uploadId, fileType ve chunk dosyası gereklidir." });
    }

    const sessionDir = path.join(UPLOADS_DIR, sanitizedId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const chunkNum = parseInt(chunkIndex, 10);
    const total = parseInt(totalChunks, 10);
    const chunkFilePath = path.join(sessionDir, `${sanitizedFileType}_part_${String(chunkNum).padStart(5, '0')}.tmp`);
    
    fs.writeFileSync(chunkFilePath, req.file.buffer);

    res.json({
      success: true,
      uploadId: sanitizedId,
      fileType: sanitizedFileType,
      chunkIndex: chunkNum,
      totalChunks: total
    });
  } catch (error: any) {
    console.error("Upload chunk error:", error);
    res.status(500).json({ error: error?.message || "Parça yüklenemedi." });
  }
});

// 1b. Assemble Chunks and Start Render
router.post("/assemble-and-start", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const quota = dailyQuotaManager.checkAndIncrementRender(clientIp);
    if (!quota.allowed) {
      res.setHeader("X-Daily-Quota-Remaining", "0");
      return res.status(429).json({ 
        error: `Günlük render kotanıza (${quota.totalLimit} işlem/gün) ulaştınız. Lütfen yarın tekrar deneyin.`,
        remaining: 0 
      });
    }
    res.setHeader("X-Daily-Quota-Remaining", quota.remaining.toString());

    const { uploadId, settings, duration, fps, quality, hasCover, hasLogo, hasBgImage } = req.body;
    const sanitizedId = (uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedId) {
      return res.status(400).json({ error: "Geçerli uploadId zorunludur." });
    }

    const sessionDir = path.join(UPLOADS_DIR, sanitizedId);
    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({ error: "Yükleme oturumu bulunamadı." });
    }

    const assembleFile = (type: string): string | null => {
      const sanitizedType = type.replace(/[^a-zA-Z0-9_-]/g, "");
      const files = fs.readdirSync(sessionDir)
        .filter(f => f.startsWith(`${sanitizedType}_part_`))
        .sort();

      if (files.length === 0) return null;

      const assembledPath = path.join(sessionDir, `${sanitizedType}_assembled.bin`);
      if (fs.existsSync(assembledPath)) {
        try { fs.unlinkSync(assembledPath); } catch (_) {}
      }
      for (const file of files) {
        const chunkData = fs.readFileSync(path.join(sessionDir, file));
        fs.appendFileSync(assembledPath, chunkData);
        // Parçayı birleştirdikten hemen sonra temizle (disk tasarrufu)
        try { fs.unlinkSync(path.join(sessionDir, file)); } catch (_) {}
      }
      return assembledPath;
    };

    const audioFilePath = assembleFile("audio");
    if (!audioFilePath || !fs.existsSync(audioFilePath)) {
      return res.status(400).json({ error: "Ses dosyası parçaları birleştirilemedi." });
    }

    const coverFilePath = hasCover ? assembleFile("cover") : null;
    const logoFilePath = hasLogo ? assembleFile("logo") : null;
    const bgImageFilePath = hasBgImage ? assembleFile("bgimage") : null;

    const clampedDuration = duration ? clampDuration(parseFloat(duration)) : undefined;
    const clampedFps = fps ? clampFps(parseInt(fps, 10)) : 60;

    const { jobId, ownerToken } = await createRenderJob({
      audioFilePath,
      settings: settings || {},
      duration: clampedDuration,
      fps: clampedFps,
      coverFilePath,
      logoFilePath,
      bgImageFilePath,
      quality: quality === "720p" ? "720p" : "1080p"
    });

    res.json({
      jobId,
      ownerToken,
      status: "queued",
      message: "Dosyalar birleştirildi ve render işlemi başlatıldı."
    });
  } catch (error: any) {
    console.error("Assemble and start error:", error);
    res.status(500).json({ error: error?.message || "Render başlatılamadı." });
  }
});

// 1c. Multipart/FormData upload and start
router.post(
  "/upload-and-start",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "bgImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const clientIp = getClientIp(req);
      const quota = dailyQuotaManager.checkAndIncrementRender(clientIp);
      if (!quota.allowed) {
        res.setHeader("X-Daily-Quota-Remaining", "0");
        return res.status(429).json({ 
          error: `Günlük render kotanıza (${quota.totalLimit} işlem/gün) ulaştınız. Lütfen yarın tekrar deneyin.`,
          remaining: 0 
        });
      }
      res.setHeader("X-Daily-Quota-Remaining", quota.remaining.toString());

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const audioFile = files?.audio?.[0];
      if (!audioFile) {
        return res.status(400).json({ error: "Ses dosyası (audio) zorunludur." });
      }

      let settings: any = {};
      try {
        settings = req.body.settings ? JSON.parse(req.body.settings) : {};
      } catch (_) {
        settings = {};
      }

      const coverFile = files?.cover?.[0];
      const logoFile = files?.logo?.[0];
      const bgImageFile = files?.bgImage?.[0];
      const duration = req.body.duration ? clampDuration(parseFloat(req.body.duration)) : undefined;
      const fps = req.body.fps ? clampFps(parseInt(req.body.fps, 10)) : 60;
      const quality = req.body.quality === "720p" ? "720p" : "1080p";

      const { jobId, ownerToken } = await createRenderJob({
        audioFilePath: audioFile.path,
        settings,
        duration,
        fps,
        coverFilePath: coverFile ? coverFile.path : null,
        logoFilePath: logoFile ? logoFile.path : null,
        bgImageFilePath: bgImageFile ? bgImageFile.path : null,
        quality
      });

      res.json({
        jobId,
        ownerToken,
        status: "queued",
        message: "Render işlemi sunucu tarafında başarıyla başlatıldı."
      });
    } catch (error: any) {
      console.error("Upload and render start error:", error);
      res.status(500).json({ error: error?.message || "Render başlatılamadı." });
    }
  }
);

// 1d. JSON / Base64 / Remote URL start
router.post("/start", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const quota = dailyQuotaManager.checkAndIncrementRender(clientIp);
    if (!quota.allowed) {
      res.setHeader("X-Daily-Quota-Remaining", "0");
      return res.status(429).json({ 
        error: `Günlük render kotanıza (${quota.totalLimit} işlem/gün) ulaştınız. Lütfen yarın tekrar deneyin.`,
        remaining: 0 
      });
    }
    res.setHeader("X-Daily-Quota-Remaining", quota.remaining.toString());

    const { audioBase64, audioRemoteUrl, settings, duration, fps, coverBase64, logoBase64, quality } = req.body;
    if (!audioBase64 && !audioRemoteUrl) {
      return res.status(400).json({ error: "audioBase64 veya audioRemoteUrl zorunludur." });
    }

    if (audioRemoteUrl && typeof audioRemoteUrl === "string") {
      if (audioRemoteUrl.startsWith("http://") || audioRemoteUrl.startsWith("https://")) {
        if (!isUrlSafe(audioRemoteUrl)) {
          return res.status(400).json({ error: "Geçersiz veya güvensiz audioRemoteUrl." });
        }
      } else {
        // Yerel dosya kontrolü
        const safeLocal = resolveSafeLocalPath(audioRemoteUrl, path.join(process.cwd(), "public"));
        if (!safeLocal) {
          return res.status(400).json({ error: "Geçersiz yerel ses dosyası yolu." });
        }
      }
    }

    const clampedDuration = duration ? clampDuration(parseFloat(duration)) : undefined;
    const clampedFps = fps ? clampFps(parseInt(fps, 10)) : 60;

    const { jobId, ownerToken } = await createRenderJob({
      audioBase64,
      audioRemoteUrl,
      settings: settings || {},
      duration: clampedDuration,
      fps: clampedFps,
      coverBase64,
      logoBase64,
      quality: quality || '1080p'
    });

    res.json({
      jobId,
      ownerToken,
      status: "queued",
      message: "Render işlemi sunucu tarafında başlatıldı."
    });
  } catch (error: any) {
    console.error("Render start error:", error);
    res.status(500).json({ error: error?.message || "Render başlatılamadı." });
  }
});

// 2. Render Progress Check (Fail-Closed IDOR Protected)
router.get("/progress/:jobId", (req, res) => {
  const job = getRenderJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Render işi bulunamadı." });
  }
  if (!isRenderJobAuthorized(req, job)) {
    return res.status(403).json({ error: "Yetkisiz erişim: Geçersiz veya eksik sahiplik anahtarı (Owner Token)." });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    currentFrame: job.currentFrame,
    totalFrames: job.totalFrames,
    duration: job.duration,
    videoUrl: job.videoUrl,
    error: job.error
  });
});

// 3. Render Download (Fail-Closed IDOR Protected)
router.get("/download/:jobId", (req, res) => {
  const job = getRenderJob(req.params.jobId);
  if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).send("Render dosyası bulunamadı veya henüz hazır değil.");
  }
  if (!isRenderJobAuthorized(req, job)) {
    return res.status(403).send("Yetkisiz erişim: Bu render çıktısını indirme yetkiniz yok.");
  }

  const safeTitle = (job.trackTitle || "vidframer_export").replace(/[^a-zA-Z0-9_-]/g, "_");
  res.download(job.outputPath, `${safeTitle}.mp4`);
});

// 4. Render Stream Preview (Fail-Closed IDOR Protected)
router.get("/stream/:jobId", (req, res) => {
  const job = getRenderJob(req.params.jobId);
  if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).send("Video dosyası bulunamadı.");
  }
  if (!isRenderJobAuthorized(req, job)) {
    return res.status(403).send("Yetkisiz erişim: Bu videoyu izleme yetkiniz yok.");
  }

  res.setHeader("Content-Type", "video/mp4");
  const stream = fs.createReadStream(job.outputPath);
  stream.pipe(res);
});

// 5. Render Cancel (Fail-Closed IDOR Protected)
router.post("/cancel/:jobId", (req, res) => {
  const job = getRenderJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Render işi bulunamadı." });
  }
  if (!isRenderJobAuthorized(req, job)) {
    return res.status(403).json({ error: "Yetkisiz işlem: Bu render işini iptal etme yetkiniz yok." });
  }
  const ok = cancelRenderJob(req.params.jobId);
  res.json({ success: ok });
});

// 6. Active Engine Status
router.get("/engine-status", (req, res) => {
  res.json({
    defaultEngine: "server",
    supportedEngines: ["server", "client"],
    serverFfmpegAvailable: true,
    qualityPresets: ["1080p", "720p"]
  });
});

// 7. WebM to MP4 converter
router.post("/convert-webm-to-mp4", upload.single("video"), async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const quota = dailyQuotaManager.checkAndIncrementRender(clientIp);
    if (!quota.allowed) {
      res.setHeader("X-Daily-Quota-Remaining", "0");
      return res.status(429).json({ 
        error: `Günlük işlem kotanıza (${quota.totalLimit} işlem/gün) ulaştınız. Lütfen yarın tekrar deneyin.`,
        remaining: 0 
      });
    }
    res.setHeader("X-Daily-Quota-Remaining", quota.remaining.toString());

    if (!req.file) {
      return res.status(400).json({ error: "Dönüştürülecek video dosyası bulunamadı." });
    }
    
    const inputPath = req.file.path;
    const outputPath = path.join(TEMP_DIR, `converted_${Date.now()}_${Math.random().toString(36).substring(2,8)}.mp4`);
    
    const aspectRatio = req.body.aspectRatio || "16/9";
    let scaleFilter = "pad=ceil(iw/2)*2:ceil(ih/2)*2";
    if (aspectRatio === "9/16") {
      scaleFilter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,pad=ceil(iw/2)*2:ceil(ih/2)*2";
    } else if (aspectRatio === "1/1") {
      scaleFilter = "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,pad=ceil(iw/2)*2:ceil(ih/2)*2";
    } else if (aspectRatio === "16/9") {
      scaleFilter = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,pad=ceil(iw/2)*2:ceil(ih/2)*2";
    }
    
    const ffmpegArgs = [
      "-y",
      "-i", inputPath,
      "-vf", scaleFilter,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-map", "0:v:0",
      "-map", "0:a:0?",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      outputPath
    ];
    
    const ffmpeg = spawn("ffmpeg", ffmpegArgs);
    let stderrLog = "";
    ffmpeg.stderr.on("data", (data: Buffer) => { stderrLog += data.toString(); });
    
    ffmpeg.on("error", (err: any) => {
      console.error("FFmpeg spawn error:", err);
      try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
      if (!res.headersSent) {
        res.status(500).json({ error: "FFmpeg dönüştürme başlatılamadı: " + err.message });
      }
    });
    
    ffmpeg.on("close", (code: number) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        res.download(outputPath, "vidframer_export.mp4", (err) => {
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (_) {}
        });
      } else {
        console.error("FFmpeg convert failed. Exit code:", code, "Log:", stderrLog);
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (_) {}
        if (!res.headersSent) {
          res.status(500).json({ error: "Video MP4 formatına dönüştürülemedi." });
        }
      }
    });
    
  } catch (e: any) {
    console.error("convert-webm-to-mp4 error:", e);
    if (!res.headersSent) {
      res.status(500).json({ error: e.message || "Dönüştürme başarısız oldu." });
    }
  }
});

export default router;
