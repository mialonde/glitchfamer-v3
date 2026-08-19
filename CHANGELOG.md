# GlitchFramer Değişiklik Günlüğü (Changelog)

Projedeki tüm güncellemeler ve sürüm geçmişi.

---

## [2.1.0] - 2026-08-10

### ✨ Eklenen Özellikler (Added)
- **Geri Al / Yeniden Yap (Undo / Redo) Desteği**: Sahnede yapılan 50 adımlık görselleştirici ayar geçmişini hafızada (past/future settings stacks) tutarak `Ctrl+Z`, `Ctrl+Y` ve arayüz butonları ile geri/ileri alabilme desteği.
- **Proje Kaydetme ve Yükleme (.JSON)**: Tüm görsel ve şarkı sözü ayarlarını `.json` formatında bilgisayara indirme ve dosyayı açarak projeye kaldığı yerden devam etme özelliği.
- **Otomatik Seans Kurtarma (Autosave)**: Tarayıcıda `localStorage` üzerinde çalışan `"vidframer_project_autosave"` anahtarıyla otomatik periyodik yedekleme. Sistem açılışında yarım kalan seansı kurtarma banner'ı.
- **Eco Mode (Düşük Performans / Pil Tasarrufu)**: Mobil ve eski cihazlarda 60 FPS akıcılığı korumak adına tek tıkla aktifleşen Eco Mod seçeneği. Aktifken partikül yoğunluğunu %50 düşürür, ölçeği optimize eder ve işlemciyi/GPU'yu yoran ağır shader efektlerini (Bloom, Motion Trail, Glitch Slice, RGB Split) otomatik devreden çıkarır.
- **Video Altyazı Dışa Aktarımı (SRT & VTT Export)**: Senkronize edilen şarkı sözlerini standart video oynatıcılar ve video kurgu yazılımları ile doğrudan uyumlu kılmak için milisaniye hassasiyetli zaman kodlu `.srt` (SubRip) ve `.vtt` (WebVTT) formatlarında indirebilme.
- **Sekmeden Ayrılma/Yenileme Koruması**: Canlı kayıt veya sunucu render işlemi devam ederken sekmeyi kazara kapatmayı önleyen tarayıcı seviyesi `beforeunload` koruması.

---

## [2.0.0] - 2026-08-08

### ✨ Eklenen Özellikler (Added)
- **11 Özgün Visualizer Modu**: `SIMULATION`, `MONOLITH`, `NOIRGRID`, `CHAOS`, `ESOTERIC`, `PHONKWAVE`, `RADIAL`, `ETHER`, `SPECTRUM`, `KINETIC`, `GLITCH`.
- **Sunucu Tarafı FFmpeg 60FPS MP4 Render Motoru**: Tarayıcı bağımsız, `@napi-rs/canvas` ve `child_process.spawn('ffmpeg')` tabanlı yüksek çözünürlüklü video kodlama.
- **Parçalı (Chunked) Dosya Yükleme Mimarisi**: 413 Payload Too Large hatalarını tamamen engelleyen 10MB chunk yükleyici.
- **Gemini 2.5 AI Magic Sync**: Otomatik kelime ve satır bazlı lirik senkronizasyon servisi.
- **Mastering & DSP Motoru**: Low/Mid/High parametrik EQ, WaveShaper soft tube saturasyonu ve DynamicsCompressor limiter katmanı (`SPOTIFY`, `YOUTUBE`, `PHONK`, `WARM_TAPE`, `BYPASS`).

### 🐛 Düzeltmeler (Fixed & Hardened)
- **Renderer `NaN` Koruması**: `settings.jitter` ve `settings.displacement` opsiyonel tanımlamalarında `NaN` üretilerek Canvas koordinat sisteminin bozulması engellendi.
- **Visualizer Tip Güvenliği**: `PhonkWave`, `Chaos`, `Esoteric`, `Ether`, `KineticTypo`, `Monolith`, `NoirGrid` görselleştiricilerinde `audio.bassEnergy`, `audio.highEnergy`, `audio.midEnergy` opsiyonel değerlerine `?? 0` koruması eklendi.
- **Sunucu Chunk Assembly Senkronizasyonu**: `server.ts` içerisindeki parçalı dosya birleştirme işlemi senkronized yapıldı ve `uploadId` sanitization güvenliği artırıldı.
- **FFmpeg Frame Buffer Memory Hizalaması**: Canvas RGBA kareleri `Buffer.from(imgData.data.buffer, imgData.data.byteOffset, imgData.data.byteLength)` şeklinde kesin offset ve uzunlukla tamponlandı.

---

## 🔮 Gelecek Yol Haritası (Future Roadmap)

- [ ] WebGPU tabanlı 3D şader (Shader) görselleştiricileri.
- [x] SRT / VTT altyazı dosyası dışa aktarma (Export) desteği.
- [ ] Çoklu dil (i18n) arayüz desteği.
