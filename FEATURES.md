# GlitchFramer 2.0 Özellik Envanteri (Features Inventory)

Bu doküman, GlitchFramer projesinde yer alan tüm çalışan özellikleri, deneysel nitelikteki bileşenleri ve teknik kısıtlamaları listelemektedir.

---

## 1. Çalışan Özellikler (Working Features)

### A. Görselleştirici Motorlar (25 Özgün Audio Visualizer Modu)
- **VISSONANCE_RING (YENİ)**: Tariq Soliman Vissonance 3D dairesel perspektif frekans halkaları, normal yönde vertiks kayması ve yörünge parçacıkları.
- **VISSONANCE_OCTAGON (YENİ)**: Vissonance 3D geometrik sekizgen (octagon) wireframe ağ, katmanlar arası bağlantı ışınları ve ses enerjisi çekirdeği.
- **VISSONANCE_SPECTRUM (YENİ)**: Vissonance 3D perspektif ses arazisi (terrain landscape), yükseklik modülasyonu ve derinlik sis efekti.
- **POPCORN_PHYSICS**: Hugh Kennedy Popcorn ilhamlı audio-reaktif parçacık patlaması, parabolik fırlatma, yerçekimi, zemin sekmesi ve şok dalgası halkaları.
- **VORTEX_NEBULA**: Yerçekimi kuvvetli parçacık girdabı, frekans bandına duyarlı yarıçap genleşmesi ve konstelasyon çizgileri.
- **CYBER_MATRIX**: Siberpunk dijital veri yağmuru, frekans spektrumuna bağlı düşüş hızı ve parlayan lider karakterler.
- **CODROPS_POLAR**: Codrops mimarisi dairesel polar frekans halkası, sese duyarlı vertiks yarıçap kayması ve genişleyen şok dalgaları.
- **CODROPS_WAVE**: Codrops çok katmanlı osiloskop çizgi grafiği, Bezier yumuşak eğrileri ve frekans bant ayrışımı.
- **CODROPS_BARS**: Codrops sürekli çizgi spektrum eğrisi, dikey barlar yerine akıcı cubic interpolasyon ve yüzen tepe noktası kapsülleri.
- **CAVA_SPECTRUM**: CAVA (Console Audio Visualizer) logaritmik EQ frekans dağılımı, yerçekimi fiziği ve terminal blok kapsülleri.
- **LISSAJOUS_ORBIT**: Çift kanal X-Y faz osiloskop yörüngesi, harmonik faz sapması ve frekans bükülmesi.
- **NEON_TUNNEL**: 3D siberpunk tel çerçeve tünel, derinlik perspektifi, reaktif poligonal halkalar ve neon ışıma.
- **QUANTUM_FIELD**: Yüksek yoğunluklu kozmik parçacık nebulası ve vektör alanı; bas patlamalarında çekim gücü ve konstelasyon çizgileri.
- **AUDIO_FLUID**: Çok bantlı akıcı sinüsoidal dalga şeritleri, renk gradyanları ve frekans tepe noktası göstergeleri.
- **SIMULATION**: Biyometrik göz, bebek pupil büyümesi (bass enerjisine duyarlı), rastgele göz kırpma mekanizması ve sese duyarlı radyasyon halkaları.
- **MONOLITH**: Brütalist kalın antrasit dış çerçeve, bass vurularında dikey esneyen iç blok ve rastgele glitch çizgileri.
- **NOIRGRID**: Dinamik grid matrisi, sub-bass eşiği aşıldığında rastgele sarı patlama kareleri.
- **CHAOS**: Kick patlamalarında şekil değiştiren (üçgen, kare, zikzak) kaotik dönen geometri.
- **ESOTERIC**: Okült merkez halkaları, numerolojik şifreler (1, 6, 9) ve kesikli çizgi kombinasyonları.
- **PHONKWAVE**: Yıkıcı 808 tepkimesi, dalga formu bozunumu ve Hi-hat sivriltmesi.
- **RADIAL**: 64 kanallı dairesel frekans çubukları ve dairesel kapak görseli entegrasyonu.
- **ETHER**: Huzurlu sinüs akışı ve Screen harmanlama modlu dalga çizgileri.
- **SPECTRUM**: Doğrusal 64 kanallı gradient renkli frekans bar analizörü.
- **KINETIC**: Şarkı sözleri ve kick vuruşlarında devasa büyüyen tipografik reaktivite ve RGB split parlaması.
- **GLITCH**: Dijital bant kayması ve renk kanalı bozulması.

### B. Görselleştirici Tam Denetim & İnce Ayar Sistemi (Granular Fine-Tuning)
- **Animasyon Hızı (`visSpeed`)**: 0.1x ile 3.0x arasında canlı visualizer hız ayarı.
- **Geometri Ölçeği (`visScale`)**: 0.2x ile 2.5x arasında boyut çarpanı.
- **Yoğunluk / Parçacık Sayısı (`visDensity`)**: 0.2x ile 2.0x arasında eleman yoğunluğu.
- **Rotasyon Hızı (`visRotation`)**: -2.0 ile 2.0 arasında dönme yönü ve hızı.
- **Visualizer Glow (`visGlow`)**: %0 ile %100 arasında ışıma/parlama şiddeti.
- **Ritim Duyarlılığı (`visBeatSensitivity`)**: 0.1x ile 3.0x arasında vuruş reaktivitesi.

### B. Sinematik Efekt & FX Stüdyosu
- **RGB Split (Chromatic Aberration)**: Kırmızı ve mavi renk kanalı kaydırması.
- **CRT Scanlines**: Tarama çizgileri efekti.
- **Cinematic Vignette**: Odaklandırıcı kenar karartması.
- **Bloom & Beat Drop Flare**: Bas patlamalarında ışık yayılımı.
- **Film Grain & 35mm Noise**: Analog gren ve kumlanma.
- **Bass Strobe / Flash**: Ağır kick vurularında kulüp beyaz flaş çakarı.
- **Camera Shake / Beat Jitter**: Bas frekanslarında sarsıntı efekti.
- **Glitch Slice**: Snare ve beat vurularında yatay piksel dilimlemesi.
- **Neon Edge Glow**: Sese duyarlı ekran kenar neon parıltısı.

### C. Sunucu Tarafı Render Motoru (Server-Side FFmpeg Engine)
- **60 FPS H.264 / AAC MP4 Kodlama**: Node.js `child_process.spawn('ffmpeg')` ile ham RGBA karelerinin doğrudan MP4 kodlanması.
- **Chunked File Upload**: 413 HTTP hatalarını engelleyen parçalı dosya yükleme API'si.
- **Canlı İlerleme Takibi**: `/api/render/progress/:jobId` ile yüzde, kare sayısı ve aşama takibi.
- **Çözünürlük Presets**: `1080p` (1080x1920 / 1920x1080) ve `720p` seçenekleri.

### D. Yapay Zeka & Şarkı Sözleri (AI Lyrics & Sync)
- **Gemini 2.5 AI Sync**: Şarkı ses verisinden otomatik kelime ve satır zamanlaması.
- **Fallback Rhythmic Generator**: Kota aşımı durumunda akıllı varsayılan ritmik zamanlayıcı.
- **Tipografi Stilleri**: KINETIC, KARAOKE, SUBTITLE, NEON_BOX, CYBER_GLITCH.

### E. Web Audio DSP & Mastering Engine
- **3-Bant Parametrik EQ**: Low Shelf (85Hz), Mid Peaking (2500Hz), High Shelf (10500Hz).
- **WaveShaper Saturation**: Soft tube/analog saturasyon (tanh egrisi).
- **DynamicsCompressor**: Master çıkış limitleme ve kompresyon.
- **Mastering Presets**: `SPOTIFY`, `YOUTUBE`, `PHONK`, `WARM_TAPE`, `BYPASS`.

### F. Kullanıcı Deneyimi (UX), Proje Kalıcılığı & Performans (YENİ)
- **Geri Al / İleri Al (Undo/Redo)**: Sahnede yapılan 50 adımlık görsel ayar geçmişini hafızada tutarak `Ctrl+Z`, `Ctrl+Y` ve arayüz butonları ile geri/ileri alabilme.
- **Proje Kaydetme / Yükleme (.JSON)**: Tüm ayarlar ve senkronize edilmiş lirikleri içeren projeyi `.json` dosyası olarak yerel bilgisayara indirme ve geri açma desteği.
- **Otomatik Seans Yedekleme & Kurtarma**: Tarayıcıda `localStorage` üzerinde çalışan `"vidframer_project_autosave"` anahtarıyla otomatik periyodik kayıt mekanizması. Sistem açıldığında yarım kalan seansı kurtarma bildirimi.
- **Eco Mode (Düşük Performans Optimizasyonu)**: Pilde çalışan veya mobil/eski cihazlar için tek tıkla aktifleşen Eco Mod. Aktifken partikül yoğunluğunu %50 düşürür, ölçeği optimize eder ve işlemciyi yoran Bloom, Motion Trail, Glitch Slice, RGB Split gibi ağır efektleri otomatik kapatır.
- **Video Altyazı Dışa Aktarımı (SRT / VTT)**: Senkronize edilen şarkı sözlerini standart video oynatıcılar ve video kurgu yazılımları ile doğrudan uyumlu kılmak için milisaniye hassasiyetli zaman kodlu `.srt` (SubRip) ve `.vtt` (WebVTT) formatlarında indirebilme.
- **Sayfadan Ayrılma Koruması**: Canlı kayıt veya sunucu render işlemi devam ederken sekmeyi yanlışlıkla kapatmayı veya sayfayı yenilemeyi önleyen `beforeunload` koruması.

---

## 2. Teknik Kısıtlamalar (Technical Limitations)

1. **Sunucu Yükü**: Sunucu tarafı FFmpeg render işlemi CPU ve RAM yoğun bir işlemdir; eşzamanlı render sayısı sunucu donanımına bağlıdır.
2. **Tarayıcı Autoplay Politikası**: Arka plan videoları tarayıcının otomatik oynatma kısıtlamaları nedeniyle kullanıcı etkileşimi öncesinde sessiz başlatılmaktadır.
