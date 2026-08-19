# GlitchFramer 2.0 API Referansı (API Reference)

GlitchFramer Express HTTP API dokümantasyonu. Sunucu varsayılan olarak `http://localhost:3000` portunda çalışır.

---

## 1. Genel & Durum Endpoint'leri

### GET `/api/health`
Sunucu sağlık durumunu kontrol eder.
- **Yanıt (200 OK)**:
  ```json
  { "status": "ok" }
  ```

### GET `/api/render/engine-status`
Aktif render motoru kapasitesini ve çözünürlük seçeneklerini döndürür.
- **Yanıt (200 OK)**:
  ```json
  {
    "defaultEngine": "server",
    "supportedEngines": ["server", "client"],
    "serverFfmpegAvailable": true,
    "qualityPresets": ["1080p", "720p"]
  }
  ```

---

## 2. Doğrudan & Parçalı Render Başlatma API'leri

### POST `/api/render/upload-and-start`
Ses ve görsel varlıkları tek bir atomik istekte sunucuya yükler, kuyruğa alır ve 60 FPS FFmpeg render işlemini başlatır.
- **Content-Type**: `multipart/form-data`
- **Body Parametreleri**:
  - `audio` (file): Ana ses dosyası (WAV/FLAC/MP3).
  - `cover` (file, opsiyonel): Kapak görseli.
  - `logo` (file, opsiyonel): Logo görseli.
  - `bgImage` (file, opsiyonel): Arka plan görseli.
  - `settings` (JSON string): Görselleştirici ve efekt ayarları.
  - `duration` (string/number): Süre.
  - `quality` (string): `1080p` veya `720p`.
- **Yanıt (200 OK)**:
  ```json
  {
    "jobId": "render_17125000_abc123",
    "status": "queued",
    "message": "Render işlemi kuyruğa alındı ve başlatıldı."
  }
  ```

### POST `/api/render/convert-webm-to-mp4`
İstemci tarafında kaydedilen WebM videolarını sunucuda donanım uyumlu H.264/AAC MP4 formatına dönüştürür.
- **Content-Type**: `multipart/form-data`
- **Body Parametreleri**:
  - `video` (file): İstemci WebM kaydı.
  - `aspectRatio` (string): `16/9`, `9/16` veya `1/1`.
- **Yanıt**: `.mp4` dosya indirmesi.

---

## 3. Render Kuyruğu & Eşzamanlılık (Concurrency)
- **Maksimum Eşzamanlı İş (MAX_CONCURRENT_RENDERS)**: 2 CPU render işi.
- Fazla gelen istekler `queued` durumunda bekletilir ve CPU kilitlenmesi engellenir.
- Otomatik 15 dakikalık disk süpürme cron'u, 20 dakikadan eski geçici dosyaları temizler.

---

## 3. Render Takip & İndirme API'leri

### GET `/api/render/progress/:jobId`
Canlı render ilerleme durumunu sorgular.
- **Yanıt (200 OK)**:
  ```json
  {
    "id": "render_17125000_abc123",
    "status": "processing",
    "progress": 45,
    "stage": "[3/4] Kareler işleniyor: %45 (Kare 900/2000)",
    "currentFrame": 900,
    "totalFrames": 2000,
    "duration": 66.6,
    "videoUrl": null,
    "error": null
  }
  ```

### GET `/api/render/download/:jobId`
Tamamlanan MP4 videosunu indirir.
- **Yanıt**: `.mp4` dosya indirmesi (`Content-Disposition: attachment`).

### POST `/api/render/cancel/:jobId`
Aktif render işlemini ve FFmpeg sürecini iptal eder.
- **Yanıt (200 OK)**:
  ```json
  { "success": true }
  ```

---

## 4. Yapay Zeka Lirik Senkronizasyon API'si

### POST `/api/sync-lyrics`
Gemini 2.5 AI ile ses dosyasından lirik zamanlaması oluşturur.
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "audioBase64": "<base64_string>",
    "mimeType": "audio/mp3"
  }
  ```
- **Yanıt (200 OK)**:
  ```json
  [
    {
      "startTime": 0.0,
      "endTime": 4.0,
      "text": "Gecenin içinde kaybolan ışıklar",
      "words": [
        { "word": "Gecenin", "startTime": 0.0, "endTime": 1.0 }
      ]
    }
  ]
  ```
