import path from "path";
import crypto from "crypto";

/**
 * 🛡️ GLITCHFRAMER CENTRALIZED SECURITY & VALIDATION MODULE
 * 
 * Bu modül; URL süzgeçleme (SSRF koruması), yerel dosya yolu doğrulama (Path Traversal koruması),
 * arka plan görseli doğrulama, süre/kare hard-cap sınırları, zaman-güvenli şifre karşılaştırması
 * ve anonim kullanıcı günlük kota yönetimini tek bir merkezde toplar.
 */

// ============================================================================
// 1. URL Whitelist & SSRF Savunması
// ============================================================================

const ALLOWED_REMOTE_DOMAINS = [
  "suno.com",
  "suno.ai",
  "cdn1.suno.ai",
  "cdn2.suno.ai",
  "cdn.suno.ai",
  "audiocdn.suno.ai",
  "audiocdn1.suno.ai",
  "audiocdn2.suno.ai",
  "studio-api.prod.suno.com",
  "studio-api.suno.ai",
  "storage.googleapis.com",
  "firebasestorage.googleapis.com"
];

const ALLOWED_BG_IMAGE_DOMAINS = [
  ...ALLOWED_REMOTE_DOMAINS,
  "images.unsplash.com",
  "unsplash.com",
  "images.pexels.com",
  "pexels.com",
  "pixabay.com",
  "cdn.pixabay.com",
  "res.cloudinary.com",
  "cloudinary.com",
  "imgur.com",
  "i.imgur.com"
];

// Özel / dahili IP adresleri ve link-local metadata aralıkları (SSRF önleme)
const BLOCKED_IP_PATTERNS = [
  /^127\./,                    // Loopback IPv4
  /^0\./,                      // Zero address
  /^10\./,                     // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
  /^192\.168\./,               // Private Class C
  /^169\.254\./,               // Link-local / Cloud Metadata (AWS, GCP, Azure)
  /^fc00:/i,                   // IPv6 Unique Local
  /^fe80:/i,                   // IPv6 Link-Local
  /^::1$/,                     // IPv6 Loopback
  /^0:0:0:0:0:0:0:1$/          // IPv6 Loopback full
];

/**
 * Verilen URL'nin güvenli, izinli ve SSRF tehdidi barındırmadığını doğrular.
 * Not: Yerel yollar için `isSafeLocalPath` kullanılmalıdır.
 */
export function isUrlSafe(urlStr: string, isProduction: boolean = process.env.NODE_ENV === "production"): boolean {
  if (!urlStr || typeof urlStr !== "string") {
    return false;
  }

  const trimmed = urlStr.trim();

  // "file:", "javascript:", "data:", "blob:" veya göreceli/yerel yolları remote URL olarak reddet
  if (/^(file|javascript|ftp|data|blob):/i.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);

    // Yalnızca standart HTTP ve HTTPS protokollerine izin ver
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Port kısıtlaması (Yalnızca standart web portları 80, 443 veya dev modda 3000/5173 vb.)
    if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
      if (isProduction) {
        return false;
      }
    }

    // SSRF IP filtresi
    for (const pattern of BLOCKED_IP_PATTERNS) {
      if (pattern.test(host)) {
        // Geliştirme ortamında yalnızca localhost/127.0.0.1'e izin ver
        if (!isProduction && (host === "localhost" || host === "127.0.0.1")) {
          return true;
        }
        return false;
      }
    }

    // Geliştirme ortamında localhost desteği
    if (!isProduction && (host === "localhost" || host === "127.0.0.1")) {
      return true;
    }

    // Whitelist kontrolü
    const isDomainAllowed = ALLOWED_REMOTE_DOMAINS.some(allowed => 
      host === allowed || host.endsWith("." + allowed)
    );

    return isDomainAllowed;
  } catch (_) {
    return false;
  }
}

// ============================================================================
// 2. Path Traversal Koruması & Yerel Dosya Doğrulama
// ============================================================================

/**
 * Göreceli bir dosya yolunun, izin verilen taban dizin (baseDir) dışına çıkmadığını
 * (Path Traversal / `../` denemesi olmadığını) kontrol eder ve güvenli mutlak yolu döndürür.
 */
export function resolveSafeLocalPath(relPath: string, allowedBaseDir: string = path.join(process.cwd(), "public")): string | null {
  if (!relPath || typeof relPath !== "string") {
    return null;
  }

  // Null byte injection koruması
  if (relPath.includes("\0")) {
    return null;
  }

  // Başındaki eğik çizgileri temizle
  const cleanRel = relPath.replace(/^[/\\]+/, "");
  const normalized = path.normalize(cleanRel);

  // Eğer normalize edilmiş yol '..' ile başlıyorsa kök dışına çıkmaya çalışıyordur
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    return null;
  }

  const baseResolved = path.resolve(allowedBaseDir);
  const targetResolved = path.resolve(baseResolved, normalized);

  // Hedef yol mutlaka taban dizinin altında başlamalıdır
  if (!targetResolved.startsWith(baseResolved)) {
    return null;
  }

  return targetResolved;
}

/**
 * Göreceli yolun güvenli olup olmadığını boolean olarak doğrular.
 */
export function isSafeLocalPath(relPath: string, allowedBaseDir: string = path.join(process.cwd(), "public")): boolean {
  return resolveSafeLocalPath(relPath, allowedBaseDir) !== null;
}

// ============================================================================
// 3. Arka Plan Görseli (bgImageUrl) Doğrulayıcı
// ============================================================================

/**
 * bgImageUrl girdisinin güvenli bir Base64 Data URL, izinli Remote URL veya
 * yerel public görsel yolu olduğunu doğrular.
 */
export function isSafeBgImageUrl(bgUrl: string | undefined | null, isProduction: boolean = process.env.NODE_ENV === "production"): boolean {
  if (!bgUrl || typeof bgUrl !== "string") {
    return false;
  }

  const trimmed = bgUrl.trim();

  // 1. Güvenli Data URI kontrolü (Yalnızca görsel MIME tipleri)
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    // 25MB aşırı büyük base64 dosya yüklemesini engelle
    if (trimmed.length > 25 * 1024 * 1024) {
      return false;
    }
    return true;
  }

  // 2. Uzak HTTP/HTTPS URL ise whitelist ve SSRF kontrolü
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }
      const host = parsed.hostname.toLowerCase();
      for (const pattern of BLOCKED_IP_PATTERNS) {
        if (pattern.test(host)) {
          return false;
        }
      }
      return ALLOWED_BG_IMAGE_DOMAINS.some(allowed => 
        host === allowed || host.endsWith("." + allowed)
      );
    } catch (_) {
      return false;
    }
  }

  // 3. Tehlikeli şemaları kesinlikle reddet
  if (/^(javascript|file|ftp|data|blob):/i.test(trimmed)) {
    return false;
  }

  // 4. Yerel dosya yolu ise public dizin altında güvenli yol kontrolü
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || !trimmed.includes(":")) {
    return isSafeLocalPath(trimmed);
  }

  return false;
}

// ============================================================================
// 4. Zaman-Güvenli Şifre Karşılaştırması & Admin Kimlik Doğrulama
// ============================================================================

/**
 * Timing-attack (zamanlama saldırılarına) karşı korumalı dize karşılaştırması.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const bufA = crypto.createHash("sha256").update(a).digest();
  const bufB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Ortam değişkenlerinden izin verilen admin parolalarını ve hash'lerini derler.
 * Şifre rotasyonunu desteklemek için virgülle ayrılmış değerleri kabul eder.
 */
export function getAllowedAdminHashes(): string[] {
  const hashes: string[] = [];

  // 1. Env: ADMIN_PASSWORD_HASH (Virgülle ayrılmış SHA-256 hash'leri)
  const envHashes = process.env.ADMIN_PASSWORD_HASH;
  if (envHashes) {
    envHashes.split(",").forEach(h => {
      const clean = h.trim().toLowerCase();
      if (clean && clean.length === 64) {
        hashes.push(clean);
      }
    });
  }

  // 2. Env: ADMIN_PASSWORD (Virgülle ayrılmış açık veya rotasyon parolaları -> hash'lenir)
  const envPasswords = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
  if (envPasswords) {
    envPasswords.split(",").forEach(p => {
      const clean = p.trim();
      if (clean) {
        hashes.push(crypto.createHash("sha256").update(clean).digest("hex"));
      }
    });
  }

  // 3. Geliştirme/test ortamı varsayılan fallback'i
  if (hashes.length === 0 || process.env.NODE_ENV !== "production") {
    hashes.push(crypto.createHash("sha256").update("admin2026").digest("hex"));
    hashes.push(crypto.createHash("sha256").update("glitchframer_admin_secret").digest("hex"));
  }

  return hashes;
}

/**
 * Girilen admin parolasını doğrular.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== "string") {
    return false;
  }

  const inputHash = crypto.createHash("sha256").update(password).digest("hex");
  const allowedHashes = getAllowedAdminHashes();

  for (const allowedHash of allowedHashes) {
    if (timingSafeEqualString(inputHash, allowedHash)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// 5. Sunucu Tarafı Hard-Cap Sınırları (Duration, FPS, TotalFrames)
// ============================================================================

export const HARD_CAPS = {
  MIN_DURATION: 1.0,         // 1 saniye
  MAX_DURATION: 600.0,       // 10 dakika (600 saniye) - DoS ve disk şişmesini engeller
  DEFAULT_DURATION: 30.0,
  MIN_FPS: 15,
  MAX_FPS: 60,
  DEFAULT_FPS: 30,
  MAX_TOTAL_FRAMES: 36000    // 600s * 60fps = 36.000 kare mutlak tavan
};

export function clampDuration(duration?: number): number {
  if (typeof duration !== "number" || isNaN(duration)) {
    return HARD_CAPS.DEFAULT_DURATION;
  }
  return Math.min(Math.max(duration, HARD_CAPS.MIN_DURATION), HARD_CAPS.MAX_DURATION);
}

export function clampFps(fps?: number): number {
  if (typeof fps !== "number" || isNaN(fps) || fps <= 0) {
    return HARD_CAPS.DEFAULT_FPS;
  }
  return Math.min(Math.max(Math.round(fps), HARD_CAPS.MIN_FPS), HARD_CAPS.MAX_FPS);
}

export function clampTotalFrames(totalFrames: number, maxFrames: number = HARD_CAPS.MAX_TOTAL_FRAMES): number {
  if (typeof totalFrames !== "number" || isNaN(totalFrames) || totalFrames <= 0) {
    return 1;
  }
  return Math.min(Math.floor(totalFrames), maxFrames);
}

// ============================================================================
// 6. Zaman Aşımlı Dış İstek Yöneticisi (fetchWithTimeout)
// ============================================================================

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// 7. Anonim Kullanıcı Günlük Kota Yöneticisi (Daily Quota Tracker)
// ============================================================================

interface QuotaRecord {
  date: string; // YYYY-MM-DD
  renderCount: number;
  lyricsCount: number;
}

export class DailyQuotaManager {
  private quotas = new Map<string, QuotaRecord>();
  private readonly MAX_DAILY_RENDERS = 20; // Anonim IP başına günde 20 render
  private readonly MAX_DAILY_LYRICS = 50;  // Anonim IP başına günde 50 AI senkron

  private getTodayString(): string {
    return new Date().toISOString().split("T")[0];
  }

  private getRecord(ip: string): QuotaRecord {
    const today = this.getTodayString();
    const existing = this.quotas.get(ip);
    if (!existing || existing.date !== today) {
      const fresh: QuotaRecord = { date: today, renderCount: 0, lyricsCount: 0 };
      this.quotas.set(ip, fresh);
      return fresh;
    }
    return existing;
  }

  public checkAndIncrementRender(ip: string): { allowed: boolean; remaining: number; totalLimit: number } {
    const record = this.getRecord(ip);
    if (record.renderCount >= this.MAX_DAILY_RENDERS) {
      return { allowed: false, remaining: 0, totalLimit: this.MAX_DAILY_RENDERS };
    }
    record.renderCount++;
    const remaining = Math.max(0, this.MAX_DAILY_RENDERS - record.renderCount);
    return { allowed: true, remaining, totalLimit: this.MAX_DAILY_RENDERS };
  }

  public checkAndIncrementLyrics(ip: string): { allowed: boolean; remaining: number; totalLimit: number } {
    const record = this.getRecord(ip);
    if (record.lyricsCount >= this.MAX_DAILY_LYRICS) {
      return { allowed: false, remaining: 0, totalLimit: this.MAX_DAILY_LYRICS };
    }
    record.lyricsCount++;
    const remaining = Math.max(0, this.MAX_DAILY_LYRICS - record.lyricsCount);
    return { allowed: true, remaining, totalLimit: this.MAX_DAILY_LYRICS };
  }

  public getStatus(ip: string): { remainingRenders: number; remainingLyrics: number } {
    const record = this.getRecord(ip);
    return {
      remainingRenders: Math.max(0, this.MAX_DAILY_RENDERS - record.renderCount),
      remainingLyrics: Math.max(0, this.MAX_DAILY_LYRICS - record.lyricsCount)
    };
  }

  // Günde bir kez eski günlerin bellek kayıtlarını temizle
  public cleanupStaleRecords(): void {
    const today = this.getTodayString();
    for (const [ip, rec] of this.quotas.entries()) {
      if (rec.date !== today) {
        this.quotas.delete(ip);
      }
    }
  }
}

export const dailyQuotaManager = new DailyQuotaManager();

// Her 6 saatte bir eski gün kayıtlarını süpür
setInterval(() => {
  dailyQuotaManager.cleanupStaleRecords();
}, 6 * 60 * 60 * 1000);
