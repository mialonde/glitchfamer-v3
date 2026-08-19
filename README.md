# GlitchFramer 2.0 (VidFramer)

> **Brutalist, High-Performance Audio-Reactive Video Visualizer & FFmpeg Render Engine**

GlitchFramer, müzik ve ses dosyalarını yüksek çözünürlüklü (1080p/720p 60FPS) sinematik ve brütalist video görselleştirmelerine dönüştüren tam donanımlı bir web uygulaması ve sunucu motorudur.

---

## 🚀 Öne Çıkan Özellikler

- **11 Özgün Audio Visualizer Modu**:
  - `SIMULATION`: Biyometrik göz simülasyonu (göz kırpma, sese duyarlı bebek pupil büyümesi, glitch halkaları).
  - `MONOLITH`: Devasa brütalist bloklar ve kalın antrasit çerçeveler.
  - `NOIRGRID`: Koyu zemin üzerinde sub-bass uyarısıyla patlayan ızgara kareleri.
  - `CHAOS`: Ritim patlamalarında kaotik dönüşen 3D/2D geometriler (üçgen, kare, zikzak).
  - `ESOTERIC`: Okült çemberler, numerolojik sayı şifreleri (1, 6, 9) ve kesikli halkalar.
  - `PHONKWAVE`: Ağır 808 bass tepkimeli ve hi-hat sivriltmeli dalga formu.
  - `RADIAL`: Dairesel dikey frekans çubukları ve dairesel kapak görseli.
  - `ETHER`: Akışkan sinüs dalgaları ve huzurlu Screen harmanlaması.
  - `GLITCH`: Dijital bant kayması ve renk kanalı ayrışması.
  - `SPECTRUM`: Klasik ve yumuşak geçişli 64 bantlı spektrum analizörü.
  - `KINETIC`: Şarkı sözleri ve ritimle devasa büyüyen tipografik reaktivite.

- **Dual Render Motoru (Client & Server-Side)**:
  - **Server-Side FFmpeg Engine**: Sunucu tarafında Canvas + FFmpeg H.264/AAC ile doğrudan yüksek çözünürlüklü MP4 üretimi.
  - **Client-Side Canvas Recorder**: Tarayıcı içi MediaRecorder ile anında hızlı önizleme kaydı.

- **Yapay Zeka (Gemini 2.5) Lirik Senkronizasyonu**:
  - Şarkı ses dosyasından otomatik zaman kodlu (`startTime`, `endTime`, kelime bazlı) lirik hizalaması.
  - API kota aşımı durumunda akıllı ritmik zamanlama yedeklemesi (fallback).

- **Sinematik FX & Zemin Katmanları**:
  - RGB Split (Chromatic Aberration), CRT Scanlines, Cinematic Vignette, Bloom & Flare, Film Grain (35mm), Bass Strobe, Camera Shake, Glitch Slice, Neon Edge Glow.
  - Arka plan video döngüleri (Cyberpunk Neon Drift, Euphoric Cosmic Aurora, Vaporwave Retro Highway, Dark Liquid Chrome).

- **Web Audio DSP & Mastering Engine**:
  - Low Shelf (Sub & Bass Punch @ 85Hz), Mid Peaking (Presence @ 2500Hz), High Shelf (Air @ 10500Hz).
  - Soft tube / analog saturasyon (WaveShaper tanh egrisi) ve DynamicsCompressor limiter katmanı.
  - Hazır presets: `SPOTIFY`, `YOUTUBE`, `PHONK`, `WARM_TAPE`, `BYPASS`.

- **Gelişmiş UX, Proje Yönetimi & Performans**:
  - **Undo / Redo (Geri / İleri Al)**: `Ctrl+Z` ve `Ctrl+Y` klavye kısayolları ve arayüz butonları ile 50 adımlık görsel ayar geçmişini yönetme.
  - **Proje Kaydetme & Yükleme**: Projeyi `.json` formatında dışa aktarma (export) ve geri yükleme (import).
  - **Otomatik Seans Kurtarma (Autosave)**: Tarayıcıda otomatik seans yedeklemesi ve açılışta kurtarma bildirimi.
  - **Eco Mod (Düşük Performans / Pil Tasarrufu)**: Mobil/eski cihazlarda 60 FPS akıcılığı korumak adına partikülleri %50 düşüren ve ağır shader efektlerini kapatan tek tıkla optimizasyon.
  - **Altyazı Dışa Aktarım (SRT & VTT)**: Senkronize edilen şarkı sözlerini saniye/milisaniye hassasiyetli `.srt` ve `.vtt` olarak indirebilme.
  - **Sekme Kapanma Koruması**: Kayıt veya render esnasında sekmeyi kazara kapatmayı önleyen `beforeunload` uyarısı.

---

## 🛠️ Kurulum

### Gereksinimler
- **Node.js**: v20 veya üzeri
- **FFmpeg & FFprobe**: Sunucu tarafı 60FPS video çıktısı almak için sistem PATH'inde yüklü olmalıdır.

### Adımlar

1. Depoyu klonlayın veya çalışma dizinine gidin:
   ```bash
   cd glitchframer
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini yapılandırın (`.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Geliştirici sunucusunu başlatın:
   ```bash
   npm run dev
   ```

5. Üretim (Production) derlemesi:
   ```bash
   npm run build
   npm start
   ```

---

## 🎵 Desteklenen ve Dışa Aktarılan Formatlar

| Tür | Desteklenen Girdi Formatları | Dışa Aktarım (Export) Formatları |
| :--- | :--- | :--- |
| **Ses (Audio)** | MP3, WAV, FLAC, OGG, AAC, M4A | MP4 (H.264 / AAC 256kbps), WEBM |
| **Görsel (Image)** | PNG, JPG, JPEG, WEBP, SVG | Canvas Frame / Video Overlay |
| **Video (Background)** | MP4, WEBM | MP4 (H.264 60FPS) |

---

## 📖 Kullanım

1. **Ses Yükleme**: Ana sayfadaki yükleme alanına bir ses dosyası (MP3/WAV vb.) sürükleyin.
2. **Kapak & Logo Ekleme**: İsteğe bağlı olarak kapak resmi ve köşe logosu yükleyin.
3. **Mod & Efekt Seçimi**: Sol panelden `Visualizer` modunu (Simulation, Monolith, PhonkWave vb.) ve `Effects Studio` bölümünden FX parametrelerini ayarlayın.
4. **Lirik Senkronizasyonu**: `AI Magic Sync` butonuna basarak Gemini 2.5 ile şarkı sözlerini zaman kodlu senkronize edin.
5. **Mastering Preset**: Ses rengini canlı A/B testi ile `PHONK`, `SPOTIFY` veya `WARM_TAPE` modlarına alın.
6. **Render & İndirme**: `Render MP4` butonuna tıklayarak sunucuda 60FPS yüksek kalitede MP4 oluşturup indirin.

---

## 📄 Lisans

Apache-2.0 License.
