import { Router } from "express";
import crypto from "crypto";

const router = Router();

// Store active admin sessions in memory
export const adminSessions = new Set<string>();

// SHA-256 Hashes of:
// admin2026
// glitchframer_admin_secret
const ALLOWED_ADMIN_HASHES = [
  "39618f0ad562a1975e532b2d076d338db765dd134eb64016b341f9bf80a2283e",
  "cf6eb58f6d71b3e839e946059b02a9eb537b0c8042eb3519d08ee7183e2da06a"
];

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    const name = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// Check admin authentication status
router.get("/check", (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies["vf_admin_session"];
    if (sessionId && adminSessions.has(sessionId)) {
      return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
  } catch (err: any) {
    return res.json({ authenticated: false });
  }
});

// Admin login
router.post("/login", (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Şifre alanı zorunludur." });
    }

    // SHA-256 hash using node native crypto
    const hash = crypto.createHash("sha256").update(password).digest("hex");
    
    if (ALLOWED_ADMIN_HASHES.includes(hash)) {
      // Create cryptographically secure session ID (32 bytes hex)
      const sessionId = crypto.randomBytes(32).toString("hex");
      adminSessions.add(sessionId);

      const isProd = process.env.NODE_ENV === "production";
      let cookieString = `vf_admin_session=${sessionId}; HttpOnly; Path=/; SameSite=Strict; Max-Age=28800`; // 8 hours
      if (isProd) {
        cookieString += "; Secure";
      }
      res.setHeader("Set-Cookie", cookieString);
      return res.json({ success: true, message: "Giriş başarılı." });
    } else {
      return res.status(401).json({ error: "Hatalı yönetici şifresi. Erişim reddedildi." });
    }
  } catch (err: any) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

// Admin logout
router.post("/logout", (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies["vf_admin_session"];
    if (sessionId) {
      adminSessions.delete(sessionId);
    }
    res.setHeader("Set-Cookie", "vf_admin_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0");
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

export default router;
