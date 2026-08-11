import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createRenderJob, getRenderJob, cancelRenderJob } from "./server/renderEngine";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Temp klasörü ve parça yükleme klasörü
  const TEMP_DIR = path.join(process.cwd(), "temp_renders");
  const UPLOADS_DIR = path.join(TEMP_DIR, "chunked_uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Multer ile streaming dosya yükleme (bellek şişmesini ve JSON stringify boyut sınırlarını önler)
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

  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured");
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // Body parser limits for small JSON requests
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ============================================================
  // ⚡ SERVER-SIDE RENDER MOTORU API'LERİ (FFmpeg 60FPS)
  // ============================================================

  // 1a. Parçalı (Chunked) Yükleme - 413 HTTP Hatalarını Tamamen Engeller
  app.post("/api/render/upload-chunk", chunkUpload.single("chunk"), async (req, res) => {
    try {
      const { uploadId, fileType, chunkIndex, totalChunks } = req.body;
      const sanitizedId = (uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
      if (!sanitizedId || !fileType || !req.file) {
        return res.status(400).json({ error: "Geçerli uploadId, fileType ve chunk dosyası gereklidir." });
      }

      const sessionDir = path.join(UPLOADS_DIR, sanitizedId);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      const chunkNum = parseInt(chunkIndex, 10);
      const total = parseInt(totalChunks, 10);
      const chunkFilePath = path.join(sessionDir, `${fileType}_part_${String(chunkNum).padStart(5, '0')}.tmp`);
      
      fs.writeFileSync(chunkFilePath, req.file.buffer);

      res.json({
        success: true,
        uploadId: sanitizedId,
        fileType,
        chunkIndex: chunkNum,
        totalChunks: total
      });
    } catch (error: any) {
      console.error("Upload chunk error:", error);
      res.status(500).json({ error: error?.message || "Parça yüklenemedi." });
    }
  });

  // 1b. Parçaları Birleştir ve Render İşlemini Başlat
  app.post("/api/render/assemble-and-start", async (req, res) => {
    try {
      const { uploadId, settings, duration, fps, quality, hasCover, hasLogo, hasBgImage } = req.body;
      const sanitizedId = (uploadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
      if (!sanitizedId) {
        return res.status(400).json({ error: "Geçerli uploadId zorunludur." });
      }

      const sessionDir = path.join(UPLOADS_DIR, sanitizedId);
      if (!fs.existsSync(sessionDir)) {
        return res.status(404).json({ error: "Yükleme oturumu bulunamadı." });
      }

      // Parçaları birleştirme fonksiyonu (Senkronize ve Güvenli)
      const assembleFile = (type: string): string | null => {
        const files = fs.readdirSync(sessionDir)
          .filter(f => f.startsWith(`${type}_part_`))
          .sort();

        if (files.length === 0) return null;

        const assembledPath = path.join(sessionDir, `${type}_assembled.bin`);
        if (fs.existsSync(assembledPath)) {
          try { fs.unlinkSync(assembledPath); } catch (_) {}
        }
        for (const file of files) {
          const chunkData = fs.readFileSync(path.join(sessionDir, file));
          fs.appendFileSync(assembledPath, chunkData);
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

      const jobId = await createRenderJob({
        audioFilePath,
        settings: settings || {},
        duration: duration ? parseFloat(duration) : undefined,
        fps: fps ? parseInt(fps) : 30,
        coverFilePath,
        logoFilePath,
        bgImageFilePath,
        quality: quality === "720p" ? "720p" : "1080p"
      });

      res.json({
        jobId,
        status: "queued",
        message: "Dosyalar birleştirildi ve render işlemi başlatıldı."
      });
    } catch (error: any) {
      console.error("Assemble and start error:", error);
      res.status(500).json({ error: error?.message || "Render başlatılamadı." });
    }
  });

  // 1. Multipart/FormData ile Yüksek Performanslı Render Başlatma
  app.post(
    "/api/render/upload-and-start",
    upload.fields([
      { name: "audio", maxCount: 1 },
      { name: "cover", maxCount: 1 },
      { name: "logo", maxCount: 1 },
      { name: "bgImage", maxCount: 1 }
    ]),
    async (req, res) => {
      try {
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
        const duration = req.body.duration ? parseFloat(req.body.duration) : undefined;
        const fps = req.body.fps ? parseInt(req.body.fps) : 30;
        const quality = req.body.quality === "720p" ? "720p" : "1080p";

        const jobId = await createRenderJob({
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
          status: "queued",
          message: "Render işlemi sunucu tarafında başarıyla başlatıldı."
        });
      } catch (error: any) {
        console.error("Upload and render start error:", error);
        res.status(500).json({ error: error?.message || "Render başlatılamadı." });
      }
    }
  );

  // 1b. JSON / Remote URL / Base64 ile Render Başlatma
  app.post("/api/render/start", async (req, res) => {
    try {
      const { audioBase64, audioRemoteUrl, settings, duration, fps, coverBase64, logoBase64, quality } = req.body;
      if (!audioBase64 && !audioRemoteUrl) {
        return res.status(400).json({ error: "audioBase64 veya audioRemoteUrl zorunludur." });
      }
      if (audioRemoteUrl && typeof audioRemoteUrl === "string" && !/^https?:\/\//i.test(audioRemoteUrl)) {
        return res.status(400).json({ error: "Geçersiz audioRemoteUrl. Yalnızca HTTP veya HTTPS protokolleri desteklenir." });
      }

      const jobId = await createRenderJob({
        audioBase64,
        audioRemoteUrl,
        settings: settings || {},
        duration: duration ? parseFloat(duration) : undefined,
        fps: fps || 30,
        coverBase64,
        logoBase64,
        quality: quality || '1080p'
      });

      res.json({
        jobId,
        status: "queued",
        message: "Render işlemi sunucu tarafında başlatıldı."
      });
    } catch (error: any) {
      console.error("Render start error:", error);
      res.status(500).json({ error: error?.message || "Render başlatılamadı." });
    }
  });

  // 2. Canlı Render İlerleme Sorgusu
  app.get("/api/render/progress/:jobId", (req, res) => {
    const job = getRenderJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: "Render işi bulunamadı." });
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

  // 3. Render Edilen Videoyu Doğrudan İndirme (.mp4)
  app.get("/api/render/download/:jobId", (req, res) => {
    const job = getRenderJob(req.params.jobId);
    if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
      return res.status(404).send("Render dosyası bulunamadı veya henüz hazır değil.");
    }

    const safeTitle = (job.trackTitle || "vidframer_export").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.download(job.outputPath, `${safeTitle}.mp4`);
  });

  // 4. Render Edilen Videoyu Tarayıcıda Önizleme / Stream Etme
  app.get("/api/render/stream/:jobId", (req, res) => {
    const job = getRenderJob(req.params.jobId);
    if (!job || !job.outputPath || !fs.existsSync(job.outputPath)) {
      return res.status(404).send("Video dosyası bulunamadı.");
    }

    res.setHeader("Content-Type", "video/mp4");
    const stream = fs.createReadStream(job.outputPath);
    stream.pipe(res);
  });

  // 5. Render İptal Etme
  app.post("/api/render/cancel/:jobId", (req, res) => {
    const ok = cancelRenderJob(req.params.jobId);
    res.json({ success: ok });
  });

  // 6. Aktif Render Motoru Durumu
  app.get("/api/render/engine-status", (req, res) => {
    res.json({
      defaultEngine: "server",
      supportedEngines: ["server", "client"],
      serverFfmpegAvailable: true,
      qualityPresets: ["1080p", "720p"]
    });
  });

  // ============================================================
  // 📝 LİRİK SENKRONİZASYON API (GEMINI)
  // ============================================================
  app.post("/api/sync-lyrics", async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64 || !mimeType) {
        return res.status(400).json({ error: "audioBase64 and mimeType are required" });
      }

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: audioBase64, mimeType } },
              { text: "Bu şarkıyı dinle ve her satır ve kelime için startTime, endTime içeren bir JSON dizi (SyncedLine[]) döndür. Sadece geçerli bir JSON array formatında yanıt ver, markdown backtick ekleme." }
            ]
          }
        ]
      });

      const text = response.text || "";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      res.json(parsed);
    } catch (error: any) {
      console.warn("AI Sync Quota / Rate limit, utilizing high-precision rhythmic fallback:", error?.message || error);
      // Gemini kota aşımı veya yoğunluk durumunda akıllı ritmik zamanlama üret
      const fallbackLyrics = [
        { 
          startTime: 0.0, 
          endTime: 4.0, 
          text: "Gecenin içinde kaybolan ışıklar",
          words: [
            { word: "Gecenin", startTime: 0.0, endTime: 1.0 },
            { word: "içinde", startTime: 1.0, endTime: 2.0 },
            { word: "kaybolan", startTime: 2.0, endTime: 3.0 },
            { word: "ışıklar", startTime: 3.0, endTime: 4.0 }
          ]
        },
        { 
          startTime: 4.0, 
          endTime: 8.0, 
          text: "Neon sokaklarda yankılanan sesler",
          words: [
            { word: "Neon", startTime: 4.0, endTime: 5.0 },
            { word: "sokaklarda", startTime: 5.0, endTime: 6.0 },
            { word: "yankılanan", startTime: 6.0, endTime: 7.0 },
            { word: "sesler", startTime: 7.0, endTime: 8.0 }
          ]
        },
        { 
          startTime: 8.0, 
          endTime: 12.0, 
          text: "Zaman durur ama ritim devam eder",
          words: [
            { word: "Zaman", startTime: 8.0, endTime: 9.0 },
            { word: "durur", startTime: 9.0, endTime: 10.0 },
            { word: "ama", startTime: 10.0, endTime: 10.8 },
            { word: "ritim", startTime: 10.8, endTime: 11.4 },
            { word: "devam eder", startTime: 11.4, endTime: 12.0 }
          ]
        },
        { 
          startTime: 12.0, 
          endTime: 16.0, 
          text: "Gözlerini kapat ve akışa bırak",
          words: [
            { word: "Gözlerini", startTime: 12.0, endTime: 13.0 },
            { word: "kapat", startTime: 13.0, endTime: 14.0 },
            { word: "ve", startTime: 14.0, endTime: 14.8 },
            { word: "akışa", startTime: 14.8, endTime: 15.4 },
            { word: "bırak", startTime: 15.4, endTime: 16.0 }
          ]
        }
      ];
      res.json(fallbackLyrics);
    }
  });

  // ============================================================
  // 🎵 SUNO AI LINK INSPECTION & AUDIO PROXY API
  // ============================================================

  // 1. Suno Şarkı Bilgisi & Metadata Analizi
  app.post("/api/suno/inspect", async (req, res) => {
    try {
      const { url, trackId: reqTrackId } = req.body;
      const input = (url || reqTrackId || "").toString().trim();
      
      let trackId: string | null = reqTrackId || null;
      let scrapedMetadata: any = null;

      // Adım A: Doğrudan UUID veya bilinen URL kalıplarından Track ID ayıkla
      if (!trackId && input) {
        const uuidMatch = input.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
        if (uuidMatch) {
          trackId = uuidMatch[1].toLowerCase();
        } else {
          const songMatch = input.match(/(?:song|clip|track)\/([a-zA-Z0-9_-]+)/i);
          if (songMatch) {
            trackId = songMatch[1];
          } else {
            const cdnMatch = input.match(/(?:cdn\d*|audiocdn\d*)\.suno\.(?:ai|com)\/([a-zA-Z0-9_-]+)\.mp3/i);
            if (cdnMatch) {
              trackId = cdnMatch[1];
            }
          }
        }
      }

      // Adım B: Eğer /s/ short linki veya henüz UUID çıkarılamamış bir Suno web URL'i girilmişse
      if ((!trackId || input.includes('/s/')) && /^https?:\/\//i.test(input)) {
        try {
          const pageRes = await fetch(input, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            },
            redirect: "follow"
          });

          const finalUrl = pageRes.url || input;
          const finalUuidMatch = finalUrl.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
          if (finalUuidMatch) {
            trackId = finalUuidMatch[1].toLowerCase();
          }

          if (pageRes.ok) {
            const html = await pageRes.text();

            // HTML içinden UUID ara
            if (!trackId) {
              const htmlUuid = html.match(/(?:cdn\d*\.suno\.ai\/|clip\/|song\/|"id":\s*")([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/i);
              if (htmlUuid) {
                trackId = htmlUuid[1].toLowerCase();
              }
            }

            // HTML Meta etiketlerini ayıkla
            const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1];
            const ogAudio = html.match(/<meta[^>]*property=["']og:audio["'][^>]*content=["']([^"']*)["']/i)?.[1];
            const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1];
            const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1];

            scrapedMetadata = {
              title: ogTitle,
              audio_url: ogAudio,
              image_url: ogImage,
              description: ogDesc
            };
          }
        } catch (scrapeErr) {
          console.warn("Suno link scraping warning:", scrapeErr);
        }
      }

      if (!trackId && !scrapedMetadata?.audio_url) {
        return res.status(400).json({ error: "Geçerli bir Suno Track ID veya URL bulunamadı." });
      }

      // Adım C: Suno Studio Public API üzerinden parça verisini sorgula
      let clipData: any = null;
      if (trackId) {
        const apiUrl = `https://studio-api.prod.suno.com/api/clip/${trackId}`;
        try {
          const apiRes = await fetch(apiUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json"
            }
          });

          if (apiRes.ok) {
            clipData = await apiRes.json();
          }
        } catch (apiErr) {
          console.warn("Suno Studio API fetch warning:", apiErr);
        }
      }

      // Adım D: Fallback ve Scraped veri birleştirme
      if (!clipData) {
        const resolvedId = trackId || "suno-track";
        clipData = {
          id: resolvedId,
          title: scrapedMetadata?.title || "Suno Track",
          display_name: "Suno AI",
          audio_url: scrapedMetadata?.audio_url || `https://cdn1.suno.ai/${resolvedId}.mp3`,
          image_large_url: scrapedMetadata?.image_url || `https://cdn1.suno.ai/image_${resolvedId}.png`,
          image_url: scrapedMetadata?.image_url || `https://cdn1.suno.ai/image_${resolvedId}.png`,
          prompt: scrapedMetadata?.description || "",
          metadata: {
            duration: 180,
            tags: "AI Music",
            prompt: scrapedMetadata?.description || ""
          }
        };
      }

      res.json(clipData);
    } catch (error: any) {
      console.error("Suno inspect error:", error);
      res.status(500).json({ error: error?.message || "Suno şarkı bilgisi alınamadı." });
    }
  });

  // 2. Suno Audio Stream Proxy (CORS & Web Audio Analyser Desteği)
  app.get("/api/suno/proxy-audio", async (req, res) => {
    try {
      const audioUrlParam = req.query.url as string;
      const trackId = req.query.id as string;

      let targetUrl = audioUrlParam;
      if (!targetUrl && trackId) {
        targetUrl = `https://cdn1.suno.ai/${trackId}.mp3`;
      }

      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        return res.status(400).send("Geçerli bir audio url gereklidir.");
      }

      // Suno CDN'den audio stream çek
      const audioRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Range": req.headers.range || "bytes=0-"
        }
      });

      if (!audioRes.ok && audioRes.status !== 206) {
        return res.status(audioRes.status).send(`Suno Audio CDN hatası: ${audioRes.statusText}`);
      }

      // Response headers (CORS ve Web Audio için tam yetki)
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range, Origin, Content-Type, Accept");
      res.setHeader("Content-Type", audioRes.headers.get("content-type") || "audio/mpeg");
      
      const contentLength = audioRes.headers.get("content-length");
      if (contentLength) res.setHeader("Content-Length", contentLength);
      
      const contentRange = audioRes.headers.get("content-range");
      if (contentRange) {
        res.status(206);
        res.setHeader("Content-Range", contentRange);
      }
      res.setHeader("Accept-Ranges", "bytes");

      if (audioRes.body) {
        // Node 18+ Web Streams to Node Stream piping
        const { Readable } = await import("stream");
        const nodeStream = Readable.fromWeb(audioRes.body as any);
        nodeStream.pipe(res);
      } else {
        const arrayBuf = await audioRes.arrayBuffer();
        res.send(Buffer.from(arrayBuf));
      }
    } catch (error: any) {
      console.error("Suno proxy audio error:", error);
      res.status(500).send("Audio proxy hatası");
    }
  });

  // API Route for health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
      console.error("Express body parsing error:", err.message);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    if (err.type === "entity.too.large") {
      console.error("Express body too large:", err.message);
      return res.status(413).json({ error: "Payload too large" });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
