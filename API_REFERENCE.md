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

## 2. Parçalı (Chunked) Yükleme ve Render API'leri

### POST `/api/render/upload-chunk`
Büyük medya dosyalarını parçalar halinde sunucuya yükler.
- **Content-Type**: `multipart/form-data`
- **Body Parametreleri**:
  - `uploadId` (string): Benzersiz yükleme oturum kimliği.
  - `fileType` (string): Dosya tipi (`audio`, `cover`, `logo`).
  - `chunkIndex` (number): Parça sırası (0'dan başlar).
  - `totalChunks` (number): Toplam parça sayısı.
  - `chunk` (file): Parça verisi (max 10MB).
- **Yanıt (200 OK)**:
  ```json
  {
    "success": true,
    "uploadId": "sess_12345",
    "fileType": "audio",
    "chunkIndex": 0,
    "totalChunks": 5
  }
  ```

### POST `/api/render/assemble-and-start`
Yüklenen tüm parçaları senkronize olarak birleştirir ve sunucu tarafı FFmpeg render işlemini başlatır.
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "uploadId": "sess_12345",
    "settings": { "mode": "SIMULATION", "aspectRatio": "16/9" },
    "duration": 120.5,
    "fps": 30,
    "quality": "1080p",
    "hasCover": true,
    "hasLogo": false
  }
  ```
- **Yanıt (200 OK)**:
  ```json
  {
    "jobId": "render_17125000_abc123",
    "status": "queued",
    "message": "Dosyalar birleştirildi ve render işlemi başlatıldı."
  }
  ```

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
