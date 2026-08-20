# GlitchFramer 2.0 Güvenlik Modeli (Security Architecture)

GlitchFramer 2.0 uygulaması için çok katmanlı savunma (defense-in-depth), girdi doğrulama, kimlik denetimi, SSRF ve DoS engelleme politikaları.

---

## 1. Merkezi Güvenlik Modülü (`server/utils/security.ts`)

Uygulamanın tüm güvenlik kontrolleri tek bir ortak kaynakta toplanmıştır:

### A. SSRF (Server-Side Request Forgery) Savunması (`isUrlSafe`)
- **Şema Kısıtlaması**: Sadece `http:` ve `https:` protokollerine izin verilir (`file:`, `javascript:`, `data:`, `blob:`, `gopher:` engellenir).
- **IP / Link-Local Filtresi**: `169.254.169.254` (Cloud Instance Metadata), `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1` gibi iç ağ ve loopback IP aralıkları kesin olarak engellenir.
- **Domain Whitelist**: Suno AI CDN'leri (`suno.com`, `*.suno.ai`), Google Cloud Storage (`storage.googleapis.com`, `firebasestorage.googleapis.com`) gibi izinli güvenli host'lar kabul edilir.

### B. Path Traversal & Dizin Güvenliği (`resolveSafeLocalPath`, `isSafeLocalPath`)
- Göreceli dosya yolları normalize edilir ve `path.resolve` ile taban dizin (`public/` veya `temp_renders/`) altında olup olmadığı kesin kontrol edilir.
- Null-byte (`\0`), `../` veya `..\` enjeksiyonları anında `null` döndürür.

### C. Arka Plan Görseli Doğrulaması (`isSafeBgImageUrl`)
- Base64 Data URI'ler yalnızca `data:image/(png|jpeg|jpg|webp|gif);base64,...` kalıbı ve maksimum `25 MB` sınırı ile kabul edilir.
- Uzak görsel URL'leri Unsplash, Pexels, Cloudinary, Imgur ve Suno CDN'leri ile kısıtlıdır.

---

## 2. Kimlik Doğrulama & Timing-Attack Savunması (`verifyAdminPassword`)

- **Sabit Zamanlı Karşılaştırma**: `crypto.timingSafeEqual` kullanılarak yan kanal (side-channel/timing) saldırıları tamamen engellenir.
- **Çevre Değişkeni Desteği & Şifre Rotasyonu**:
  - `ADMIN_PASSWORD_HASH`: Virgülle ayrılmış SHA-256 hash listesi.
  - `ADMIN_PASSWORD` / `ADMIN_SECRET`: Virgülle ayrılmış açık veya geçiş dönemi parolaları.
- **Güvenli Oturum Çerezleri**: `HttpOnly`, `SameSite=Strict`, (Production'da) `Secure` bayrakları ve kriptografik `crypto.randomBytes(32)` oturum belirteçleri.

---

## 3. DoS Koruması & Hard-Cap Limitleri

- **Render Süresi Hard-Cap**: Minimum `1.0s`, maksimum `600.0s` (10 dakika). `clampDuration()` ile denetlenir.
- **FPS Hard-Cap**: Minimum `15 FPS`, maksimum `60 FPS`. `clampFps()` ile denetlenir.
- **Maksimum Kare Tavanı**: `36.000` kare (600s * 60fps).
- **Yükleme Boyut Sınırları**:
  - Tekil dosya yükleme: `200 MB`
  - Parçalı yükleme chunk: `10 MB`
- **Dış İstek Zaman Aşımı (`fetchWithTimeout`)**: Tüm harici HTTP isteklerine (Suno API, uzaktan ses indirme) `AbortController` tabanlı `10-15 saniye` zaman aşımı sınırı uygulanır.

---

## 4. Anonim Kullanıcı Günlük Kota Yönetimi (`DailyQuotaManager`)

Anonim kullanıcıların sunucuyu aşırı tüketmesini engellemek için IP tabanlı takip yapılır:
- **Günlük Render Sınırı**: IP başına günde maksimum `20` render.
- **Günlük Şarkı Sözü Analiz Sınırı**: IP başına günde maksimum `50` AI senkronizasyonu.
- **Yanıt Başlıkları**: `X-Daily-Quota-Remaining` ve `X-Daily-Quota-Limit` istemciye şeffaf biçimde iletilir. Kota aşıldığında HTTP `429 Too Many Requests` döndürülür.

---

## 5. IDOR (Insecure Direct Object References) Koruması

- Her render işi için kriptografik `ownerToken` (`crypto.randomBytes(24).toString('hex')`) üretilir.
- Render ilerleme sorgulama (`/api/render/progress/:jobId`) ve iptal (`/api/render/cancel/:jobId`) işlemlerinde `x-owner-token` başlığı doğrulanır (Fail-Closed prensibi).

---

## 6. Disk İzolasyonu & Rekürsif Otomatik Temizlik

- Tüm geçici iş dosyaları `temp_renders/` altında izole edilir.
- Her `15 dakikada bir`, 20 dakikadan eski tamamlanmış veya yarıda kalmış tüm dosyalar ve `chunked_uploads` alt klasörleri rekürsif olarak diskten silinir.

