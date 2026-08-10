# GlitchFramer Değişiklik Günlüğü (Changelog)

Projedeki tüm güncellemeler ve sürüm geçmişi.

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
- [ ] SRT / VTT altyazı dosyası dışa aktarma (Export) desteği.
- [ ] Çoklu dil (i18n) arayüz desteği.
