# GlitchFramer 2.0 Kullanım Rehberi (Walkthrough)

Bu doküman, GlitchFramer uygulamasının ilk açılışından nihai 60FPS MP4 videosunun indirildiği ana kadarki kullanıcı deneyimini ve iş akışlarını adım adım anlatmaktadır.

---

## 1. İlk Başlatma Deneyimi (First Launch Experience)

1. Uygulama tarayıcıda yüklendiğinde brütalist, siyah-koyu antrasit renk paletinde **GlitchFramer Stüdyo Arayüzü** karşılar.
2. Ekranın üst kısmında ana **Canvas Önizleme Penceresi** yer alır. Ses çalmadığında dahi Canvas üzerinde yumuşak ambient (idle) animasyonu aktiftir.
3. Önizleme penceresinin altında medya kontol düğmeleri (Oynat/Durdur, Zaman Çubuğu, Render MP4 Düğmesi) bulunur.
4. Alt tarafta sekmeli kontrol paneli yer alır:
   - **Görsel & Efektler**: Mod seçimi, en boy oranı (16:9, 9:16, 1:1) ve FX parametreleri.
   - **Lirik Stüdyosu**: Söz düzenleme ve AI Magic Sync.
   - **Mastering Stüdyosu**: Ses karakteri ve preset yönetimi.

---

## 2. Medya Yükleme Akışı (Upload Workflow)

1. **Ses Dosyası Yükleme**:
   - Yükleme alanına `.mp3`, `.wav`, `.flac` veya `.m4a` dosyasını sürükleyin ya da dosya seçin.
   - Yükleme tamamlandığında ses süresi ve dosya ismi tespit edilerek zaman çubuğu güncellenir.
2. **Kapak Resmi (Cover Image) Yükleme**:
   - İsteğe bağlı olarak albüm kapağı yükleyebilirsiniz.
   - Kapak resmi `RADIAL` ve `SPECTRUM` modlarında dairesel veya merkez görsel olarak ritme göre büyüyüp küçülür.
3. **Logo ve Arka Plan Videosu Yükleme**:
   - Köşe logosu ve sinematik arka plan videoları (MP4) eklenebilir.
   - Hazır Euphoric video döngülerinden (`Cyberpunk Neon Drift`, `Vaporwave Retro Highway` vb.) tek tıkla seçim yapılabilir.

---

## 3. Görselleştirici & Efekt Ayarları Akışı (Visualizer & FX Workflow)

1. **Visualizer Modu Seçimi**:
   - `SIMULATION`, `MONOLITH`, `NOIRGRID`, `PHONKWAVE`, `CHAOS`, `ESOTERIC`, `ETHER`, `SPECTRUM`, `RADIAL`, `KINETIC` veya `GLITCH` modlarından birini seçin.
2. **Oran Seçimi (Aspect Ratio)**:
   - YouTube için `16:9`, Instagram Reels / TikTok / Shorts için `9:16`, Kare akışlar için `1:1`.
3. **FX Katmanlarını Özelleştirme**:
   - **RGB Split**: Chromatic aberration yoğunluğunu ayarlayın.
   - **CRT Scanlines**: Tarama çizgilerini açıp kapatın.
   - **Bloom & Flare**: Bas vurularındaki ışık parlamasını ayarlayın.
   - **Camera Shake & Strobe**: Yüksek enerjili kulüpler için sarsıntı ve beyaz çakar modunu devreye sokun.

---

## 4. Yapay Zeka Şarkı Sözü Senkronizasyonu (AI Lyric Sync Workflow)

1. **Lirik Stüdyosu** sekmesine geçin.
2. **AI Magic Sync (Gemini 2.5)** butonuna basın.
3. Yapay zeka ses dosyasını analiz eder ve milisaniye hassasiyetinde `startTime`, `endTime` ve kelime dizilimi içeren lirik zamanlamasını oluşturur.
4. Yapay zeka kotası aşıldığında akıllı ritmik zamanlama yedek mekanizması devreye girerek şarkının ritmine uygun zaman çizelgesi üretir.
5. Söz stili (`KINETIC`, `KARAOKE`, `SUBTITLE`, `NEON_BOX`, `CYBER_GLITCH`) ve konum seçimi yapabilirsiniz.

---

## 5. DSP & Spotify -14 LUFS Mastering Akışı (Mastering Workflow)

1. **Mastering Konsolu** sekmesini veya Hızlı Başlat panelini açın.
2. **Spotify Standardı (-14 LUFS) Hassas Normalizasyon** butonuna tıklayın.
3. Web Audio 6-bant analog modelleme zinciri (LowShelf, MidPresence, TrebleAir, Tube/Tape Saturation ve DynamicsCompressor) şarkıyı Spotify tepe seviyelerine optimize eder.
4. İsteğe göre `YOUTUBE`, `PHONK`, `TIKTOK_BASS`, `LOFI_WARM` ve `CINEMATIC` profilleri arasında geçiş yapabilirsiniz.

---

## 6. Dışa Aktarma Akışı (Export Workflow)

1. **Sunucu Tarafı Render (Server-Side FFmpeg Engine - Önerilen)**:
   - `Render Motoru` ayarlarından `Server Engine (FFmpeg 60FPS)` modunu ve `1080p` kalitesini seçin.
   - `Render MP4` butonuna tıklayın.
   - Ses ve görseller sunucuya atomik FormData ile aktarılır.
   - FFmpeg 60FPS hızında kare kare video çizer, sesi birleştirir ve hazır `.mp4` indirme bağlantısını sunar.
2. **İstemci Tarafı Kayıt & Sunucu MP4 Dönüştürme**:
   - Tarayıcı canlı oynatım esnasında Canvas akışını `.webm` olarak kaydeder.
   - İsteğe bağlı olarak "Sunucuda MP4'e Dönüştür" butonu ile saniyeler içinde H.264/AAC MP4'e çevrilir.
