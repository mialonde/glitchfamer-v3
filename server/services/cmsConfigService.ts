import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { isUrlSafe, fetchWithTimeout } from "../utils/security";

export interface CMSHeaderLink {
  id: string;
  label: string;
  url: string;
}

export interface CMSFooterLink {
  id: string;
  label: string;
  url: string;
}

export interface CMSAppTheme {
  primaryColor: string;    // e.g. #FFD700
  secondaryColor: string;  // e.g. #FFFFFF
  accentColor: string;     // e.g. #0057FF
  bgDark: string;          // e.g. #060608
}

export interface CMSGlobalSettings {
  appName: string;
  appSubtitle: string;
  tabTitle: string;
  metaDescription: string;
  logoUrl: string;
  logoType: 'text' | 'image' | 'icon';
  headerTitle: string;
  headerSubtitle: string;
  headerLinks: CMSHeaderLink[];
  footerText: string;
  footerLinks: CMSFooterLink[];
  theme: CMSAppTheme;
}

export interface CMSApiKeysConfig {
  hasGeminiKey: boolean;
  maskedGeminiKey: string;
  hasSunoKey: boolean;
  maskedSunoKey: string;
  customWebhookUrl: string;
  geminiModel: string;
}

export interface CMSVisualizerConfig {
  disabledVisualizers: string[]; // List of VisualizerMode IDs that are deactivated
  customLabels: Record<string, string>; // Custom rename mapping
}

export interface VisualizerPresetProfile {
  id: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
  description?: string;
  isBuiltin?: boolean;
  settings: Record<string, any>;
}

// -------------------------------------------------------------
// 🌟 STANDARD CMS EXTENSIONS: PAGES, MEDIA, SEO, INBOX, LOGS
// -------------------------------------------------------------

export interface CMSPageItem {
  id: string;
  title: string;
  slug: string;
  category: 'SAYFA' | 'DUYURU' | 'BLOG' | 'YASAL' | 'SSS';
  content: string; // Markdown or HTML
  coverImageUrl?: string;
  status: 'YAYINDA' | 'TASLAK';
  views: number;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CMSMediaItem {
  id: string;
  name: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | '3D_AVATAR' | 'LOGO' | 'WATERMARK';
  url: string;
  sizeBytes: number;
  mimeType: string;
  tags: string[];
  uploadedAt: number;
}

export interface CMSSeoAnalytics {
  metaTitleTemplate: string;
  defaultOgImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  customHeadScripts: string;
  customBodyScripts: string;
  robotsTxtContent: string;
  sitemapEnabled: boolean;
}

export interface CMSFormSubmission {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: 'İLETİŞİM' | 'GÖRSELLEŞTİRİCİ TALEBİ' | 'HATA BİLDİRİMİ' | 'GÖRÜŞ';
  message: string;
  status: 'YENİ' | 'İNCELENİYOR' | 'YANITLANDI' | 'ARŞİV';
  priority: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK';
  createdAt: number;
}

export interface CMSAdminUser {
  id: string;
  username: string;
  email: string;
  role: 'SÜPER ADMİN' | 'EDITÖR' | 'MODERATÖR';
  lastLoginAt: number;
  status: 'AKTİF' | 'KİLİTLİ';
}

export interface CMSAuditLog {
  id: string;
  timestamp: number;
  action: string;
  user: string;
  details: string;
  ip?: string;
}

export interface CMSFullConfig {
  globalSettings: CMSGlobalSettings;
  apiKeys: CMSApiKeysConfig;
  visualizerConfig: CMSVisualizerConfig;
  customPresets: VisualizerPresetProfile[];
  pages: CMSPageItem[];
  mediaAssets: CMSMediaItem[];
  seoAnalytics: CMSSeoAnalytics;
  inboxMessages: CMSFormSubmission[];
  adminUsers: CMSAdminUser[];
  auditLogs: CMSAuditLog[];
  updatedAt: number;
}

const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "cms_full_config.json");

export const DEFAULT_GLOBAL_SETTINGS: CMSGlobalSettings = {
  appName: "GlitchFramer 2.0",
  appSubtitle: "Hızlı Başlat",
  tabTitle: "GlitchFramer 2.0 | 60 FPS Audio Visualizer",
  metaDescription: "60 FPS Cyberpunk, Cinematic & Studio Audio Visualizer Video Engine",
  logoUrl: "",
  logoType: "icon",
  headerTitle: "GlitchFramer",
  headerSubtitle: "STUDIO 2.0",
  headerLinks: [
    { id: "1", label: "Stüdyo", url: "/" },
    { id: "2", label: "Hızlı Başlat", url: "/?mode=quick" }
  ],
  footerText: "© 2026 GlitchFramer Studio. 60 FPS Cyberpunk Müzik Render Motoru.",
  footerLinks: [
    { id: "1", label: "Dokümantasyon", url: "#" },
    { id: "2", label: "Kullanım Şartları", url: "#" },
    { id: "3", label: "Gizlilik Politikası", url: "#" }
  ],
  theme: {
    primaryColor: "#FFD700",
    secondaryColor: "#FFFFFF",
    accentColor: "#0057FF",
    bgDark: "#060608"
  }
};

export const DEFAULT_PAGES: CMSPageItem[] = [
  {
    id: "page_welcome_1",
    title: "GlitchFramer 2.0 Kullanım Kılavuzu & Stüdyo Özellikleri",
    slug: "kullanim-kilavuzu",
    category: "DUYURU",
    content: `# GlitchFramer 2.0 Stüdyo Rehberi\n\nGlitchFramer 2.0, 60 FPS performans odaklı Web Audio API, Canvas ve 3D VRM rendering motoruna sahip gelişmiş bir müzik görselleştiricidir.\n\n### Öne Çıkan Özellikler\n- **39+ Görselleştirici Modu**: Cyberpunk, Cinematic, Liquid, Minimal, Orb ve Concert modları.\n- **AI Şarkı Sözü Senkronizasyonu**: Gemini 2.5 Flash ile müzik sözlerini anında zamanlanmış LRC formatına dönüştürün.\n- **Suno Müzik Entegrasyonu**: AI müzik üretimi ve görselleştirme stüdyosu entegrasyonu.\n- **FFmpeg MP4 & MediaRecorder**: Sunucu tarafı yüksek çözünürlüklü video render pipeline.`,
    coverImageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    status: "YAYINDA",
    views: 1420,
    author: "GlitchFramer Admin",
    seoTitle: "GlitchFramer 2.0 Rehberi | 60 FPS Visualizer",
    seoDescription: "GlitchFramer 2.0 özellikleri, görselleştirici modları ve video export seçenekleri.",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: "page_terms_1",
    title: "Kullanım Şartları ve Telif Hakları Politikası",
    slug: "kullanim-sartlari",
    category: "YASAL",
    content: `## 1. Hizmet Şartları\nGlitchFramer 2.0 ile üretilen tüm görselleştirilmiş videolar ve render çıktılarının ticari kullanım hakları içerik üreten sanatçıya aittir.\n\n## 2. Telif ve Lisanslama\nYüklenen ses dosyalarının telif hakları kullanıcı sorumluluğundadır.`,
    status: "YAYINDA",
    views: 850,
    author: "Hukuk Ekibi",
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 10
  }
];

export const DEFAULT_MEDIA: CMSMediaItem[] = [
  {
    id: "media_logo_default",
    name: "GlitchFramer Gold Badge Logo",
    type: "LOGO",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    sizeBytes: 124500,
    mimeType: "image/png",
    tags: ["logo", "brand", "gold"],
    uploadedAt: Date.now() - 86400000 * 3
  },
  {
    id: "media_watermark_default",
    name: "Studio 2.0 Watermark Overlay",
    type: "WATERMARK",
    url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400&q=80",
    sizeBytes: 85200,
    mimeType: "image/png",
    tags: ["watermark", "overlay"],
    uploadedAt: Date.now() - 86400000 * 2
  }
];

export const DEFAULT_SEO: CMSSeoAnalytics = {
  metaTitleTemplate: "%s | GlitchFramer Studio 2.0",
  defaultOgImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
  twitterHandle: "@GlitchFramer",
  googleAnalyticsId: "G-VIDFRAMER20",
  customHeadScripts: "<!-- Google Analytics & Meta Pixel Ready -->",
  customBodyScripts: "<!-- Custom Body Scripts -->",
  robotsTxtContent: "User-agent: *\nAllow: /\nSitemap: https://vidframer.studio/sitemap.xml",
  sitemapEnabled: true
};

export const DEFAULT_INBOX: CMSFormSubmission[] = [
  {
    id: "inbox_1",
    senderName: "Kaan Yılmaz",
    senderEmail: "kaan@example.com",
    subject: "Yeni Cyberpunk Glitch Modu İstegi",
    category: "GÖRSELLEŞTİRİCİ TALEBİ",
    message: "Harika bir stüdyo! Retro CRT scanline efekti ve mor neon temalı ekstra bir visualizer eklenmesi mümkün mü?",
    status: "YENİ",
    priority: "YÜKSEK",
    createdAt: Date.now() - 3600000 * 4
  },
  {
    id: "inbox_2",
    senderName: "Zeynep Demir",
    senderEmail: "zeynep@music.io",
    subject: "Suno AI API Entegrasyonu Sorusu",
    category: "İLETİŞİM",
    message: "Suno AI prompt entegrasyonunu kendi stüdyomuzda kullanmak istiyoruz, API Webhook desteği harika çalışıyor.",
    status: "İNCELENİYOR",
    priority: "ORTA",
    createdAt: Date.now() - 3600000 * 20
  }
];

export const DEFAULT_ADMIN_USERS: CMSAdminUser[] = [
  {
    id: "user_superadmin_1",
    username: "admin",
    email: "admin@vidframer.studio",
    role: "SÜPER ADMİN",
    lastLoginAt: Date.now(),
    status: "AKTİF"
  },
  {
    id: "user_editor_1",
    username: "editor_studio",
    email: "editor@vidframer.studio",
    role: "EDITÖR",
    lastLoginAt: Date.now() - 86400000,
    status: "AKTİF"
  }
];

export const DEFAULT_AUDIT_LOGS: CMSAuditLog[] = [
  {
    id: "log_init_1",
    timestamp: Date.now() - 1000 * 60 * 30,
    action: "GİRİŞ_BAŞARILI",
    user: "admin",
    details: "Yönetici paneline güvenli HttpOnly oturum girişi sağlandı.",
    ip: "127.0.0.1"
  },
  {
    id: "log_init_2",
    timestamp: Date.now() - 1000 * 60 * 10,
    action: "AYAR_GÜNCELLENDİ",
    user: "admin",
    details: "Dinamik marka başlığı ve tema renkleri güncellendi.",
    ip: "127.0.0.1"
  }
];

export const DEFAULT_BUILTIN_PRESETS: VisualizerPresetProfile[] = [
  {
    id: "builtin_neon_master",
    name: "NEON TUNNEL MASTER",
    createdAt: Date.now(),
    description: "Sarı-altın neon tünel ve yüksek enerjili render.",
    isBuiltin: true,
    settings: {
      mode: "NEON_TUNNEL",
      primaryColor: "#FFD700",
      secondaryColor: "#FFFFFF",
      intensity: 1.0,
      bloomEnabled: true,
      bloom: 0.6
    }
  },
  {
    id: "builtin_dream_performer",
    name: "DREAM PERFORMER 3D",
    createdAt: Date.now(),
    description: "Psychedelic 3D rüya performansı avatar modu.",
    isBuiltin: true,
    settings: {
      mode: "DREAM_PERFORMER",
      primaryColor: "#00E5FF",
      secondaryColor: "#FF007F",
      intensity: 1.2,
      cameraShakeEnabled: true,
      cameraShake: 0.25
    }
  },
  {
    id: "builtin_cyber_matrix",
    name: "CYBER MATRIX OVERDRIVE",
    createdAt: Date.now(),
    description: "Zümrüt yeşili dijital yağmur ve siber grid.",
    isBuiltin: true,
    settings: {
      mode: "CYBER_MATRIX",
      primaryColor: "#10B981",
      secondaryColor: "#34D399",
      intensity: 1.1,
      speed: 1.2
    }
  }
];

function maskSecret(secret?: string): string {
  if (!secret || secret.trim().length === 0) return "";
  const trimmed = secret.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

export function getInitialApiKeysConfig(): CMSApiKeysConfig {
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const sunoEndpoint = process.env.SUNO_API_ENDPOINT || "https://suno.com";

  return {
    hasGeminiKey: Boolean(geminiKey && geminiKey.trim().length > 0),
    maskedGeminiKey: maskSecret(geminiKey),
    hasSunoKey: true,
    maskedSunoKey: maskSecret(sunoEndpoint),
    customWebhookUrl: "",
    geminiModel: "gemini-2.5-flash"
  };
}

let activeConfig: CMSFullConfig | null = null;

function initConfigFile() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONFIG_FILE)) {
      const initial: CMSFullConfig = {
        globalSettings: DEFAULT_GLOBAL_SETTINGS,
        apiKeys: getInitialApiKeysConfig(),
        visualizerConfig: {
          disabledVisualizers: [],
          customLabels: {}
        },
        customPresets: DEFAULT_BUILTIN_PRESETS,
        pages: DEFAULT_PAGES,
        mediaAssets: DEFAULT_MEDIA,
        seoAnalytics: DEFAULT_SEO,
        inboxMessages: DEFAULT_INBOX,
        adminUsers: DEFAULT_ADMIN_USERS,
        auditLogs: DEFAULT_AUDIT_LOGS,
        updatedAt: Date.now()
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(initial, null, 2), "utf-8");
      activeConfig = initial;
    } else {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      activeConfig = {
        globalSettings: parsed.globalSettings || DEFAULT_GLOBAL_SETTINGS,
        apiKeys: parsed.apiKeys || getInitialApiKeysConfig(),
        visualizerConfig: parsed.visualizerConfig || { disabledVisualizers: [], customLabels: {} },
        customPresets: parsed.customPresets || DEFAULT_BUILTIN_PRESETS,
        pages: parsed.pages || DEFAULT_PAGES,
        mediaAssets: parsed.mediaAssets || DEFAULT_MEDIA,
        seoAnalytics: parsed.seoAnalytics || DEFAULT_SEO,
        inboxMessages: parsed.inboxMessages || DEFAULT_INBOX,
        adminUsers: parsed.adminUsers || DEFAULT_ADMIN_USERS,
        auditLogs: parsed.auditLogs || DEFAULT_AUDIT_LOGS,
        updatedAt: parsed.updatedAt || Date.now()
      };
    }
  } catch (e) {
    console.error("[CMS] Storage init error:", e);
    activeConfig = {
      globalSettings: DEFAULT_GLOBAL_SETTINGS,
      apiKeys: getInitialApiKeysConfig(),
      visualizerConfig: {
        disabledVisualizers: [],
        customLabels: {}
      },
      customPresets: DEFAULT_BUILTIN_PRESETS,
      pages: DEFAULT_PAGES,
      mediaAssets: DEFAULT_MEDIA,
      seoAnalytics: DEFAULT_SEO,
      inboxMessages: DEFAULT_INBOX,
      adminUsers: DEFAULT_ADMIN_USERS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      updatedAt: Date.now()
    };
  }
}

export function getFullCMSConfig(): CMSFullConfig {
  if (!activeConfig) {
    initConfigFile();
  }
  // Refresh runtime API keys status
  const currentKeys = getInitialApiKeysConfig();
  if (activeConfig) {
    activeConfig.apiKeys.hasGeminiKey = currentKeys.hasGeminiKey;
    activeConfig.apiKeys.maskedGeminiKey = currentKeys.maskedGeminiKey;
    if (!activeConfig.pages) activeConfig.pages = DEFAULT_PAGES;
    if (!activeConfig.mediaAssets) activeConfig.mediaAssets = DEFAULT_MEDIA;
    if (!activeConfig.seoAnalytics) activeConfig.seoAnalytics = DEFAULT_SEO;
    if (!activeConfig.inboxMessages) activeConfig.inboxMessages = DEFAULT_INBOX;
    if (!activeConfig.adminUsers) activeConfig.adminUsers = DEFAULT_ADMIN_USERS;
    if (!activeConfig.auditLogs) activeConfig.auditLogs = DEFAULT_AUDIT_LOGS;
  }
  return activeConfig || {
    globalSettings: DEFAULT_GLOBAL_SETTINGS,
    apiKeys: currentKeys,
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
}

export function saveFullCMSConfig(newConfig: Partial<CMSFullConfig>): CMSFullConfig {
  const current = getFullCMSConfig();
  const updated: CMSFullConfig = {
    ...current,
    ...newConfig,
    updatedAt: Date.now()
  };
  activeConfig = updated;

  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[CMS] Failed to save full config to disk:", err);
  }

  return updated;
}

export function getPublicCMSConfig() {
  const full = getFullCMSConfig();
  return {
    globalSettings: full.globalSettings,
    visualizerConfig: full.visualizerConfig,
    customPresets: full.customPresets,
    pages: (full.pages || []).filter(p => p.status === 'YAYINDA'),
    seoAnalytics: full.seoAnalytics,
    updatedAt: full.updatedAt,
    apiStatus: {
      geminiConfigured: full.apiKeys.hasGeminiKey,
      sunoConfigured: true
    }
  };
}

export function addAuditLog(action: string, user: string, details: string, ip?: string) {
  try {
    const full = getFullCMSConfig();
    const newLog: CMSAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      action,
      user,
      details,
      ip: ip || '127.0.0.1'
    };
    const logs = [newLog, ...(full.auditLogs || [])].slice(0, 100); // keep last 100 logs
    saveFullCMSConfig({ auditLogs: logs });
  } catch (err) {
    console.error("[CMS] Audit log failed:", err);
  }
}

export async function testServiceConnection(provider: "gemini" | "suno", testKey?: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  if (provider === "gemini") {
    const keyToUse = testKey?.trim() || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      return { success: false, message: "Gemini API anahtarı boş veya tanımlanmamış.", latencyMs: 0 };
    }
    try {
      const ai = new GoogleGenAI({ apiKey: keyToUse });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Ping test. Respond 'OK'."
      });
      const latency = Date.now() - start;
      if (response.text) {
        return { success: true, message: `Gemini 2.5 Flash başarıyla yanıt verdi (${latency}ms).`, latencyMs: latency };
      }
      return { success: true, message: `Gemini API bağlantısı sağlandı (${latency}ms).`, latencyMs: latency };
    } catch (err: any) {
      const latency = Date.now() - start;
      return { success: false, message: `Gemini API hatası: ${err.message || err}`, latencyMs: latency };
    }
  }

  if (provider === "suno") {
    try {
      const endpoint = testKey?.trim() || process.env.SUNO_API_ENDPOINT || "https://suno.com";
      const res = await fetchWithTimeout(endpoint, {}, 5000);
      const latency = Date.now() - start;
      return {
        success: res.ok,
        message: res.ok ? `Suno API endpoint erişilebilir (${latency}ms).` : `Suno API HTTP ${res.status} döndürdü.`,
        latencyMs: latency
      };
    } catch (err: any) {
      const latency = Date.now() - start;
      return { success: false, message: `Suno API erişim hatası: ${err.message || err}`, latencyMs: latency };
    }
  }

  return { success: false, message: "Geçersiz servis sağlayıcı.", latencyMs: 0 };
}

