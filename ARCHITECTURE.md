# GlitchFramer 2.0 Mimari Dokümanı (Architecture)

GlitchFramer, istemci tarafı kullanıcı arayüzü (React 19 + TypeScript + Vite) ile sunucu tarafı yüksek performanslı video işleme motorunu (Node.js + Express + FFmpeg + Canvas) birleştiren hibrit bir mimariye sahiptir.

---

## 1. Dizin Yapısı (Folder Structure)

```
glitchframer/
├── dist/                   # Üretim derleme çıktıları (Vite SPA + Server bundle)
├── server/
│   └── renderEngine.ts     # Sunucu tarafı Canvas çizim ve FFmpeg 60FPS MP4 işleme motoru
├── src/
│   ├── components/         # React arayüz bileşenleri
│   │   ├── EffectsStudio.tsx     # FX parametreleri ve hazır efekt paketleri
│   │   ├── LyricsStudio.tsx      # Lirik editörü ve AI Magic Sync arayüzü
│   │   └── VisualizerCanvas.tsx  # Canlı Canvas önizleme ve kayıt yöneticisi
│   ├── core/               # Çekirdek ses ve grafik işleme sınıfları
│   │   ├── AudioProcessor.ts     # Web Audio Analyser, FFT ve vuruş (beat) tespiti
│   │   ├── MasteringEngine.ts    # Web Audio EQ, WaveShaper saturation ve Limiter
│   │   └── Renderer.ts           # Ana 2D Canvas çizim boru hattı (Pipeline)
│   ├── lib/                # Yardımcı araçlar (clsx, tailwind-merge)
│   │   └── utils.ts
│   ├── services/           # Servis katmanı
│   │   ├── audioService.ts       # Ses yükleme ve ortam yönetimi
│   │   ├── lyricsService.ts      # Şarkı sözü metin işleme
│   │   └── lyricSyncService.ts   # Yapay zeka senkronizasyon API çağrıları
│   ├── visualizers/        # 11 adet modüler IVisualizer sınıfı
│   │   ├── ChaosVisualizer.ts
│   │   ├── EsotericVisualizer.ts
│   │   ├── EtherVisualizer.ts
│   │   ├── GlitchVisualizer.ts
│   │   ├── KineticTypoVisualizer.ts
│   │   ├── MonolithVisualizer.ts
│   │   ├── NoirGridVisualizer.ts
│   │   ├── PhonkWaveVisualizer.ts
│   │   ├── RadialVisualizer.ts
│   │   ├── SimulationVisualizer.ts
│   │   └── SpectrumVisualizer.ts
│   ├── App.tsx             # Ana uygulama bileşeni ve state deposu
│   ├── index.css           # Global stiller ve Tailwind direktifleri
│   ├── main.tsx            # React kök yükleyici
│   └── types.ts            # Tip tanımlamaları (VisualizerSettings, AudioEvents vb.)
├── .env.example            # Örnek çevre değişkenleri
├── package.json            # Proje bağımlılıkları ve npm betikleri
├── server.ts               # Express HTTP API sunucusu ve Vite middleware
├── tsconfig.json           # TypeScript derleyici ayarları
└── vite.config.ts          # Vite derleme yapılandırması
```

---

## 2. Uygulama ve Durum Yönetimi (State Management)

- **Merkezi React State**: `App.tsx` uygulamadaki tüm medyaları (audio, cover, logo, background video), görselleştirici ayarlarını (`VisualizerSettings`) ve mastering ayarlarını (`MasteringSettings`) tek merkezden yönetir.
- **Modüler Visualizer Registry**: `StudioRenderer` sınıfı, `IVisualizer` arayüzünü uygulayan 11 modu dinamik bir `Map<VisualizerMode, IVisualizer>` kaydı üzerinden çalıştırır.
- **Canlı Canvas Render Döngüsü**: `requestAnimationFrame` ile 60 FPS hızında çalışan istemci render döngüsü, tarayıcı arka plana alındığında `visibilitychange` dinleyicisi ile kaynağı korumak adına duraklatılır veya optimize edilir.

---

## 3. Ses İşleme Boru Hattı (Audio Pipeline Architecture)

```
[HTMLAudioElement / Multi-part Buffer]
             │
             ▼
    [MasteringEngine]
   ┌─────────┴─────────┐
   │ 1. Low Shelf      │ (85 Hz Sub/Bass)
   │ 2. Mid Peaking    │ (2500 Hz Presence)
   │ 3. High Shelf     │ (10500 Hz Air)
   │ 4. WaveShaper     │ (Tanh Tube Saturation)
   │ 5. Compressor     │ (Dynamics Compressor / Limiter)
   │ 6. MasterGain     │ (Output Gain Level)
   └─────────┬─────────┘
             ├──────────────────────────┐
             ▼                          ▼
      [AnalyserNode]           [AudioDestination]
             │                    (Hoparlörler)
             ▼
     [AudioProcessor]
   ┌─────────┴─────────┐
   │ - FFT Breakdown   │ (64 Spectrum Bins)
   │ - Energy History  │ (Bass / Mid / High Extraction)
   │ - Beat Detection  │ (Kick / Snare / Hi-Hat Thresholds)
   └─────────┬─────────┘
             ▼
      [AudioEvents]
             │
             ▼
      [StudioRenderer] ──> [Canvas Render & Post-FX Layers]
```

---

## 4. API Mimari Akışı (Server Render Pipeline)

1. İstemci ses ve medya dosyalarını parçalı olarak `/api/render/upload-chunk` endpoint'ine gönderir.
2. Parçalar sunucu tarafında `temp_renders/chunked_uploads/<uploadId>` klasöründe toplanır.
3. `/api/render/assemble-and-start` çağrısı ile dosyalar senkronize olarak birleştirilir.
4. `createRenderJob` fonksiyonu arka planda `processRenderJob` iş parçacığını başlatır:
   - `ffprobe` ile ses süresi belirlenir.
   - `ffmpeg` ile ses dosyası `44.1kHz 16-bit Mono Raw PCM` verisine dönüştürülür.
   - PCM sample pencerelerinden enerji ve 64 kanallı spektrum hesaplanır.
   - `@napi-rs/canvas` ile her kare çizilir ve `ffmpeg` stdin pipe'ına raw RGBA olarak aktarılır.
   - FFmpeg `libx264` ve `aac` ile MP4 kodlamasını tamamlar.
