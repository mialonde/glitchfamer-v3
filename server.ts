import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Route imports
import adminRouter from "./server/routes/admin";
import lyricsRouter from "./server/routes/lyrics";
import sunoRouter from "./server/routes/suno";
import renderRouter from "./server/routes/render";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cloud Run / Nginx reverse proxy support
  app.set("trust proxy", 1);

  // 1. CORS Middleware (Handle preflight and cross-origin iframe requests)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Range, X-Render-Token");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  const isProd = process.env.NODE_ENV === "production";

  // 2. Güvenlik Başlıkları (Helmet - Geliştirmede esnek, üretimde sıkı ama iframe/medya dostu)
  app.use(helmet({
    contentSecurityPolicy: isProd ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://storage.googleapis.com", "https://firebasestorage.googleapis.com", "https://*.suno.ai", "https://suno.com", "https://*.suno.com"],
        mediaSrc: ["'self'", "blob:", "data:", "https://*.suno.ai", "https://suno.com", "https://*.suno.com", "https://storage.googleapis.com", "https://firebasestorage.googleapis.com"],
        connectSrc: ["'self'", "ws:", "wss:", "https://*.googleapis.com", "https://*.suno.ai", "https://suno.com", "https://*.suno.com", "https://*.run.app"],
        frameAncestors: ["'self'", "https://*.google.com", "https://*.google.com.tr", "https://ai.studio", "https://*.studio"],
      }
    } : false,
    frameguard: isProd ? { action: "sameorigin" } : false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: isProd ? { policy: "same-origin" } : false,
    crossOriginResourcePolicy: false,
    originAgentCluster: isProd
  }));

  // Temp & uploads directories
  const TEMP_DIR = path.join(process.cwd(), "temp_renders");
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // 3. Rate Limiting (DDoS, Brute-force & API protection)
  const generalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests / minute
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin." }
  });

  const renderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // 60 render requests / 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: "Render işlem limitine ulaşıldı. Lütfen 15 dakika sonra tekrar deneyin." }
  });

  // Apply general and render rate limiters
  app.use("/api/", generalApiLimiter);
  app.use("/api/render/", renderLimiter);

  // Body parsing limits for JSON/URL-encoded requests
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ============================================================
  // 🔌 ROUTERS REGISTER
  // ============================================================
  app.use("/api/admin", adminRouter);
  app.use("/api", lyricsRouter);
  app.use("/api", sunoRouter);
  app.use("/api/render", renderRouter);

  // API Route for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite static/middleware flow
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

  // Express Error handling middleware
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
