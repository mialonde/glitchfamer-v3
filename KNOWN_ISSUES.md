# GlitchFramer Bilinen Sorunlar (Known Issues)

Bu belgede GlitchFramer uygulamasında tespit edilmiş bilinen davranış kısıtlamaları ve geçici çözümler listelenmektedir.

---

## 1. Doğrulanmış Durumlar & Kısıtlamalar

### A. FFmpeg Bağımlılığı (Sunucu Render İçin)
- **Önem Derecesi**: Orta (Medium)
- **Açıklama**: Sunucu tarafı 60FPS MP4 render motorunun çalışabilmesi için sunucu sisteminde FFmpeg ve FFprobe binaries'lerinin yüklü ve PATH üzerinde erişilebilir olması gerekir.
- **Yeniden Üretme**: FFmpeg yüklü olmayan bir ortamda `Render MP4` çalıştırıldığında `FFmpeg kodlama hatası` döner.
- **Geçici Çözüm**: Sunucu ortamına FFmpeg yüklenmeli veya arayüzden `Client Engine` seçilerek tarayıcı içi MediaRecorder kaydı kullanılmalıdır.

### B. Tarayıcı Autoplay Politikası (Background Video)
- **Önem Derecesi**: Düşük (Low)
- **Açıklama**: Modern web tarayıcıları kullanıcı etkileşimi olmadan sesli/sessiz video oynatımını kısıtlayabilir.
- **Yeniden Üretme**: Sayfa ilk yüklendiğinde kullanıcı ekrana tıklamadan arka plan videosu seçilirse otomatik oynatma engellenebilir.
- **Geçici Çözüm**: Arka plan videoları `videoBgRef.current.play().catch(...)` bloğu ile sessiz ve güvenli modda başlatılır.

---

## 2. Düzeltilmiş Sorunlar (Fixed Issues)

- [x] **Renderer `NaN` Jitter Bug**: `settings.jitter` opsiyonel değerinin `NaN` üreterek Canvas'ı bozması düzeltildi.
- [x] **Visualizer Audio Prop Nullability**: `PhonkWave` ve diğer modlarda `audio.bassEnergy` gibi opsiyonel özelliklerin tanımsız olması durumunda varsayılan `0` atanarak güvenli hale getirildi.
- [x] **Parçalı Yükleme Race Condition**: Chunked upload sonrasında asenkron yazar stream'in erken kapanması düzeltilerek senkron append yazaçlarına geçildi.
- [x] **Merkezi Güvenlik & SSRF Koruması (#1, #12)**: `server/utils/security.ts` modülü oluşturuldu, `isUrlSafe` ile IP/link-local ve domain filtrelemesi tekilleştirildi.
- [x] **Path Traversal / Yetkisiz Dizin Erişimi (#1, #12)**: `resolveSafeLocalPath` ile tüm göreceli dosya yolları taban dizine hapsedildi.
- [x] **Admin Kimlik Bilgileri Env Taşıma & Timing-Attack Savunması (#2)**: Parolalar `ADMIN_PASSWORD_HASH` / `ADMIN_PASSWORD` env değişkenlerine bağlandı, `timingSafeEqual` ile yan kanal açığı kapatıldı.
- [x] **Arka Plan Görseli Whitelist (#4)**: `isSafeBgImageUrl` ile base64 ve CDN domain kontrolü sağlandı.
- [x] **Hard-Cap & Günlük Kota (#3)**: Süre (1s-600s), FPS (15-60) hard-cap sınırları ve IP bazlı günlük kota yönetimi (`DailyQuotaManager`) devreye alındı.
- [x] **Rekürsif Disk Temizliği (#7)**: `chunked_uploads` alt klasörleri de dahil olmak üzere 20 dakikadan eski geçici dosyalar ve dizinler otomatik temizleniyor.
- [x] **Dış İstek Zaman Aşımı (#11)**: `fetchWithTimeout` ile 10-15s zaman aşımı kontrolü eklendi.
- [x] **IDOR Koruması & Fail-Closed Kontrolleri (#13)**: Render işleri için kriptografik `x-owner-token` doğrulama mantığı entegre edildi.
