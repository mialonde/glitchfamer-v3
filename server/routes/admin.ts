import { Router } from "express";
import crypto from "crypto";
import { verifyAdminPassword, isUrlSafe } from "../utils/security";
import {
  getFullCMSConfig,
  saveFullCMSConfig,
  getPublicCMSConfig,
  testServiceConnection,
  addAuditLog,
  DEFAULT_GLOBAL_SETTINGS,
  DEFAULT_BUILTIN_PRESETS,
  DEFAULT_PAGES,
  DEFAULT_MEDIA,
  DEFAULT_SEO,
  DEFAULT_INBOX,
  DEFAULT_ADMIN_USERS,
  DEFAULT_AUDIT_LOGS,
  getInitialApiKeysConfig,
  CMSFullConfig,
  CMSPageItem,
  CMSMediaItem,
  CMSFormSubmission
} from "../services/cmsConfigService";

const router = Router();

interface AdminSession {
  sessionId: string;
  createdAt: number;
}

export const adminSessions = new Map<string, AdminSession>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

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

export function isValidAdminSession(cookieHeader?: string): boolean {
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies["vf_admin_session"];
  if (!sessionId) return false;

  const session = adminSessions.get(sessionId);
  if (!session) return false;

  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    adminSessions.delete(sessionId);
    return false;
  }

  return true;
}

function requireAdmin(req: any, res: any, next: any) {
  if (!isValidAdminSession(req.headers.cookie)) {
    return res.status(401).json({ error: "Yetkisiz erişim. Lütfen admin girişi yapın." });
  }
  next();
}

// ==========================================
// 🔓 PUBLIC CONFIG & CONTACT FORM ENDPOINTS
// ==========================================
router.get("/public-config", (req, res) => {
  try {
    const config = getPublicCMSConfig();
    return res.json(config);
  } catch (err: any) {
    console.error("[CMS] Error getting public config:", err);
    return res.status(500).json({ error: "Konfigürasyon alınamadı." });
  }
});

// Public contact/feedback submission endpoint
router.post("/public-contact", (req, res) => {
  try {
    const { senderName, senderEmail, subject, category, message } = req.body;
    if (!senderName || !senderEmail || !message) {
      return res.status(400).json({ error: "İsim, e-posta ve mesaj alanları zorunludur." });
    }

    const current = getFullCMSConfig();
    const newSubmission: CMSFormSubmission = {
      id: `inbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderName: String(senderName).trim(),
      senderEmail: String(senderEmail).trim(),
      subject: String(subject || "Genel Mesaj").trim(),
      category: category || "İLETİŞİM",
      message: String(message).trim(),
      status: "YENİ",
      priority: "ORTA",
      createdAt: Date.now()
    };

    const inbox = [newSubmission, ...(current.inboxMessages || [])];
    saveFullCMSConfig({ inboxMessages: inbox });

    return res.json({ success: true, message: "Mesajınız yönetici ekibine iletildi. Teşekkür ederiz!" });
  } catch (err: any) {
    console.error("[CMS] Public contact submission error:", err);
    return res.status(500).json({ error: "Mesaj gönderilirken bir hata oluştu." });
  }
});

// Check admin authentication status
router.get("/check", (req, res) => {
  try {
    const authenticated = isValidAdminSession(req.headers.cookie);
    return res.json({ authenticated });
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

    const isValid = verifyAdminPassword(password);
    
    if (isValid) {
      const sessionId = crypto.randomBytes(32).toString("hex");
      adminSessions.set(sessionId, {
        sessionId,
        createdAt: Date.now()
      });

      addAuditLog("GİRİŞ_BAŞARILI", "admin", "Oturum girişi sağlandı.");

      const isProd = process.env.NODE_ENV === "production";
      let cookieString = `vf_admin_session=${sessionId}; HttpOnly; Path=/; SameSite=Strict; Max-Age=28800`;
      if (isProd) {
        cookieString += "; Secure";
      }
      res.setHeader("Set-Cookie", cookieString);
      return res.json({ success: true, message: "Giriş başarılı." });
    } else {
      addAuditLog("GİRİŞ_BAŞARISIZ", "bilinmeyen", "Hatalı şifre ile başarısız giriş denemesi.");
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
    addAuditLog("ÇIKIŞ", "admin", "Oturum sonlandırıldı.");
    res.setHeader("Set-Cookie", "vf_admin_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0");
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

// ==========================================
// 🔒 PROTECTED FULL CMS ADMIN ROUTES
// ==========================================

// 1. Get Full CMS Configuration
router.get("/config", requireAdmin, (req, res) => {
  try {
    const config = getFullCMSConfig();
    return res.json(config);
  } catch (err: any) {
    console.error("[CMS] Get config error:", err);
    return res.status(500).json({ error: "Ayar yüklenirken sunucu hatası oluştu." });
  }
});

// 2. Update Global Settings (Brand, UI, Texts, Theme)
router.put("/config/global", requireAdmin, (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Geçersiz global ayar yapısı." });
    }

    const current = getFullCMSConfig();
    const updated = saveFullCMSConfig({
      globalSettings: {
        ...current.globalSettings,
        ...settings,
        theme: {
          ...current.globalSettings.theme,
          ...(settings.theme || {})
        }
      }
    });

    addAuditLog("MARKA_TEMA_GÜNCELLENDİ", "admin", `Genel marka ayarları ve tema güncellendi (${settings.appName || current.globalSettings.appName}).`);

    return res.json({
      success: true,
      message: "Genel ayarlar ve tema kaydedildi.",
      settings: updated.globalSettings
    });
  } catch (err: any) {
    console.error("[CMS] Update global error:", err);
    return res.status(500).json({ error: "Genel ayarlar güncellenemedi." });
  }
});

// 3. Update API Keys & External Integrations
router.put("/config/api-keys", requireAdmin, (req, res) => {
  try {
    const { geminiApiKey, sunoApiKey, customWebhookUrl, geminiModel } = req.body;
    
    if (geminiApiKey && typeof geminiApiKey === "string" && geminiApiKey.trim()) {
      process.env.GEMINI_API_KEY = geminiApiKey.trim();
    }
    if (sunoApiKey && typeof sunoApiKey === "string" && sunoApiKey.trim()) {
      if (isUrlSafe(sunoApiKey.trim())) {
        process.env.SUNO_API_ENDPOINT = sunoApiKey.trim();
      }
    }

    const current = getFullCMSConfig();
    const updatedKeys = getInitialApiKeysConfig();
    if (customWebhookUrl !== undefined) updatedKeys.customWebhookUrl = String(customWebhookUrl || "");
    if (geminiModel) updatedKeys.geminiModel = String(geminiModel);

    const updated = saveFullCMSConfig({
      apiKeys: updatedKeys
    });

    addAuditLog("API_KEY_GÜNCELLENDİ", "admin", "API anahtarları ve entegrasyon ayarları güncellendi.");

    return res.json({
      success: true,
      message: "API anahtarları başarıyla güncellendi.",
      apiKeys: updated.apiKeys
    });
  } catch (err: any) {
    console.error("[CMS] Update API keys error:", err);
    return res.status(500).json({ error: "API anahtarları kaydedilemedi." });
  }
});

// 4. Test API Key Integration
router.post("/config/api-keys/test", requireAdmin, async (req, res) => {
  try {
    const { provider, testKey } = req.body;
    if (!provider || !["gemini", "suno"].includes(provider)) {
      return res.status(400).json({ error: "Geçersiz servis türü." });
    }

    const testResult = await testServiceConnection(provider, testKey);
    addAuditLog("API_TESTİ", "admin", `${provider.toUpperCase()} servis bağlantı testi tamamlandı (${testResult.latencyMs}ms).`);
    return res.json(testResult);
  } catch (err: any) {
    console.error("[CMS] Test key error:", err);
    return res.status(500).json({ success: false, message: `Hata: ${err.message || err}`, latencyMs: 0 });
  }
});

// 5. Toggle Visualizer Mode (Active / Disabled)
router.put("/config/visualizers/toggle", requireAdmin, (req, res) => {
  try {
    const { modeId, enabled } = req.body;
    if (!modeId || typeof modeId !== "string") {
      return res.status(400).json({ error: "Geçerli bir modeId belirtilmelidir." });
    }

    const current = getFullCMSConfig();
    const disabledList = new Set(current.visualizerConfig.disabledVisualizers || []);

    if (enabled) {
      disabledList.delete(modeId);
    } else {
      disabledList.add(modeId);
    }

    const updated = saveFullCMSConfig({
      visualizerConfig: {
        ...current.visualizerConfig,
        disabledVisualizers: Array.from(disabledList)
      }
    });

    addAuditLog("VISUALIZER_DURUM", "admin", `'${modeId}' görselleştirici ${enabled ? 'aktifleştirildi' : 'pasifleştirildi'}.`);

    return res.json({
      success: true,
      message: `Görselleştirici '${modeId}' durumu güncellendi.`,
      visualizerConfig: updated.visualizerConfig
    });
  } catch (err: any) {
    console.error("[CMS] Toggle visualizer error:", err);
    return res.status(500).json({ error: "Görselleştirici durumu değiştirilemedi." });
  }
});

// 6. Save or Update Preset
router.post("/config/presets", requireAdmin, (req, res) => {
  try {
    const { preset } = req.body;
    if (!preset || !preset.name || !preset.settings) {
      return res.status(400).json({ error: "Geçersiz preset formatı." });
    }

    const current = getFullCMSConfig();
    const presets = [...(current.customPresets || [])];
    const index = presets.findIndex(p => p.id === preset.id);

    if (index >= 0) {
      presets[index] = {
        ...presets[index],
        ...preset,
        updatedAt: Date.now()
      };
    } else {
      presets.push({
        ...preset,
        id: preset.id || `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now()
      });
    }

    const updated = saveFullCMSConfig({ customPresets: presets });
    addAuditLog("PRESET_KAYDEDİLDİ", "admin", `'${preset.name}' preset profili kaydedildi.`);

    return res.json({
      success: true,
      message: `Preset '${preset.name}' kaydedildi.`,
      presets: updated.customPresets
    });
  } catch (err: any) {
    console.error("[CMS] Save preset error:", err);
    return res.status(500).json({ error: "Preset kaydedilemedi." });
  }
});

// 7. Delete Preset
router.delete("/config/presets/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const current = getFullCMSConfig();
    const filtered = (current.customPresets || []).filter(p => p.id !== id);
    const updated = saveFullCMSConfig({ customPresets: filtered });
    addAuditLog("PRESET_SİLİNDİ", "admin", `Preset ID '${id}' silindi.`);

    return res.json({
      success: true,
      message: "Preset silindi.",
      presets: updated.customPresets
    });
  } catch (err: any) {
    console.error("[CMS] Delete preset error:", err);
    return res.status(500).json({ error: "Preset silinemedi." });
  }
});

// 8. PAGES MANAGEMENT ENDPOINTS
router.post("/config/pages", requireAdmin, (req, res) => {
  try {
    const { page } = req.body;
    if (!page || !page.title || !page.content) {
      return res.status(400).json({ error: "Sayfa başlığı ve içeriği zorunludur." });
    }

    const current = getFullCMSConfig();
    const pages = [...(current.pages || [])];
    const existingIndex = pages.findIndex(p => p.id === page.id);

    const slug = (page.slug || page.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    if (existingIndex >= 0) {
      pages[existingIndex] = {
        ...pages[existingIndex],
        ...page,
        slug,
        updatedAt: Date.now()
      };
    } else {
      const newPage: CMSPageItem = {
        id: page.id || `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: String(page.title).trim(),
        slug,
        category: page.category || 'SAYFA',
        content: String(page.content),
        coverImageUrl: page.coverImageUrl || '',
        status: page.status || 'YAYINDA',
        views: 0,
        author: page.author || 'GlitchFramer Admin',
        seoTitle: page.seoTitle || page.title,
        seoDescription: page.seoDescription || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      pages.unshift(newPage);
    }

    const updated = saveFullCMSConfig({ pages });
    addAuditLog("SAYFA_KAYDEDİLDİ", "admin", `'${page.title}' başlıklı sayfa/duyuru kaydedildi.`);

    return res.json({
      success: true,
      message: `'${page.title}' sayfası başarıyla kaydedildi.`,
      pages: updated.pages
    });
  } catch (err: any) {
    console.error("[CMS] Save page error:", err);
    return res.status(500).json({ error: "Sayfa kaydedilemedi." });
  }
});

router.delete("/config/pages/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const current = getFullCMSConfig();
    const filtered = (current.pages || []).filter(p => p.id !== id);
    const updated = saveFullCMSConfig({ pages: filtered });
    addAuditLog("SAYFA_SİLİNDİ", "admin", `Sayfa ID '${id}' silindi.`);

    return res.json({
      success: true,
      message: "Sayfa silindi.",
      pages: updated.pages
    });
  } catch (err: any) {
    console.error("[CMS] Delete page error:", err);
    return res.status(500).json({ error: "Sayfa silinemedi." });
  }
});

// 9. MEDIA LIBRARY ENDPOINTS
router.post("/config/media", requireAdmin, (req, res) => {
  try {
    const { media } = req.body;
    if (!media || !media.name || !media.url) {
      return res.status(400).json({ error: "Medya adı ve URL alanı zorunludur." });
    }

    const current = getFullCMSConfig();
    const mediaList = [...(current.mediaAssets || [])];

    const newItem: CMSMediaItem = {
      id: media.id || `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: String(media.name).trim(),
      type: media.type || 'IMAGE',
      url: String(media.url).trim(),
      sizeBytes: Number(media.sizeBytes || 150000),
      mimeType: media.mimeType || 'image/png',
      tags: Array.isArray(media.tags) ? media.tags : ['general'],
      uploadedAt: Date.now()
    };

    mediaList.unshift(newItem);
    const updated = saveFullCMSConfig({ mediaAssets: mediaList });
    addAuditLog("MEDYA_YÜKLENDİ", "admin", `'${newItem.name}' medya kütüphanesine eklendi.`);

    return res.json({
      success: true,
      message: `'${newItem.name}' medyası kaydedildi.`,
      mediaAssets: updated.mediaAssets
    });
  } catch (err: any) {
    console.error("[CMS] Save media error:", err);
    return res.status(500).json({ error: "Medya ögesi eklenemedi." });
  }
});

router.delete("/config/media/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const current = getFullCMSConfig();
    const filtered = (current.mediaAssets || []).filter(m => m.id !== id);
    const updated = saveFullCMSConfig({ mediaAssets: filtered });
    addAuditLog("MEDYA_SİLİNDİ", "admin", `Medya ID '${id}' silindi.`);

    return res.json({
      success: true,
      message: "Medya ögesi silindi.",
      mediaAssets: updated.mediaAssets
    });
  } catch (err: any) {
    console.error("[CMS] Delete media error:", err);
    return res.status(500).json({ error: "Medya silinemedi." });
  }
});

// 10. SEO & ANALYTICS ENDPOINTS
router.put("/config/seo", requireAdmin, (req, res) => {
  try {
    const { seoAnalytics } = req.body;
    if (!seoAnalytics || typeof seoAnalytics !== 'object') {
      return res.status(400).json({ error: "Geçersiz SEO yapısı." });
    }

    const current = getFullCMSConfig();
    const updatedSeo = {
      ...current.seoAnalytics,
      ...seoAnalytics
    };

    const updated = saveFullCMSConfig({ seoAnalytics: updatedSeo });
    addAuditLog("SEO_GÜNCELLENDİ", "admin", "SEO ve analitik ayarları güncellendi.");

    return res.json({
      success: true,
      message: "SEO & Analitik ayarları kaydedildi.",
      seoAnalytics: updated.seoAnalytics
    });
  } catch (err: any) {
    console.error("[CMS] Update SEO error:", err);
    return res.status(500).json({ error: "SEO ayarları güncellenemedi." });
  }
});

// 11. INBOX MESSAGES ENDPOINTS
router.put("/config/inbox/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const current = getFullCMSConfig();
    const inbox = [...(current.inboxMessages || [])];
    const idx = inbox.findIndex(i => i.id === id);

    if (idx >= 0) {
      if (status) inbox[idx].status = status;
      if (priority) inbox[idx].priority = priority;
      const updated = saveFullCMSConfig({ inboxMessages: inbox });
      addAuditLog("GELEN_KUTUSU_GÜNCELLENDİ", "admin", `Mesaj ID '${id}' durumu '${status || inbox[idx].status}' yapıldı.`);

      return res.json({
        success: true,
        message: "Mesaj durumu güncellendi.",
        inboxMessages: updated.inboxMessages
      });
    }

    return res.status(404).json({ error: "Mesaj bulunamadı." });
  } catch (err: any) {
    console.error("[CMS] Update inbox error:", err);
    return res.status(500).json({ error: "Mesaj güncellenemedi." });
  }
});

router.delete("/config/inbox/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const current = getFullCMSConfig();
    const filtered = (current.inboxMessages || []).filter(i => i.id !== id);
    const updated = saveFullCMSConfig({ inboxMessages: filtered });
    addAuditLog("GELEN_KUTUSU_SİLİNDİ", "admin", `Mesaj ID '${id}' silindi.`);

    return res.json({
      success: true,
      message: "Mesaj silindi.",
      inboxMessages: updated.inboxMessages
    });
  } catch (err: any) {
    console.error("[CMS] Delete inbox message error:", err);
    return res.status(500).json({ error: "Mesaj silinemedi." });
  }
});

// 12. Reset to Defaults
router.post("/config/reset", requireAdmin, (req, res) => {
  try {
    const resetConfig: CMSFullConfig = {
      globalSettings: DEFAULT_GLOBAL_SETTINGS,
      apiKeys: getInitialApiKeysConfig(),
      visualizerConfig: { disabledVisualizers: [], customLabels: {} },
      customPresets: DEFAULT_BUILTIN_PRESETS,
      pages: DEFAULT_PAGES,
      mediaAssets: DEFAULT_MEDIA,
      seoAnalytics: DEFAULT_SEO,
      inboxMessages: DEFAULT_INBOX,
      adminUsers: DEFAULT_ADMIN_USERS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      updatedAt: Date.now()
    };
    const updated = saveFullCMSConfig(resetConfig);
    addAuditLog("FABRİKA_AYARLARI_SIFIRLANDI", "admin", "Tüm CMS ayarları fabrika varsayılanlarına sıfırlandı.");

    return res.json({
      success: true,
      message: "Tüm CMS ayarları varsayılan fabrika ayarlarına sıfırlandı.",
      config: updated
    });
  } catch (err: any) {
    console.error("[CMS] Reset config error:", err);
    return res.status(500).json({ error: "Sıfırlama işlemi başarısız oldu." });
  }
});

export default router;
