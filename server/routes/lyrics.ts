import express, { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import { dailyQuotaManager } from "../utils/security";

const router = Router();

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

const lyricsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI sync lyrics requests
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { error: "Çok fazla AI şarkı sözü analizi isteği gönderildi. Lütfen 15 dakika sonra tekrar deneyin." }
});

function getClientIp(req: express.Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

router.post("/sync-lyrics", lyricsLimiter, async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const quota = dailyQuotaManager.checkAndIncrementLyrics(clientIp);
    if (!quota.allowed) {
      res.setHeader("X-Daily-Quota-Remaining", "0");
      return res.status(429).json({ 
        error: `Günlük AI şarkı sözü senkronizasyonu kotanıza (${quota.totalLimit} işlem/gün) ulaştınız. Lütfen yarın tekrar deneyin.`,
        remaining: 0 
      });
    }
    res.setHeader("X-Daily-Quota-Remaining", quota.remaining.toString());

    const { audioBase64, mimeType } = req.body;
    if (!audioBase64 || !mimeType) {
      return res.status(400).json({ error: "audioBase64 ve mimeType parametreleri zorunludur." });
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
    console.error("AI Sync Lyrics error:", error?.message || error);
    res.status(502).json({ 
      error: "Şarkı sözü senkronizasyonu AI servisi tarafından tamamlanamadı: " + (error?.message || "AI servisi yanıt vermedi.")
    });
  }
});

export default router;
