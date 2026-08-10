# GlitchFramer 2.0 AI Hafıza Bankası (Project Memory Bank)

> **Bu dosya, yapay zeka ajanlarının (AI Agents) proje üzerindeki geçmişini, yapılan tüm değişiklikleri, güncel ilerlemeyi, bilinen hataları ve gelecek yapılacakları takip ettiği canlı hafıza merkezidir.**

---

## 📌 1. Proje Kimliği & Canlı Durum

- **Proje Adı**: GlitchFramer 2.0 (VidFramer)
- **Mevcut Sürüm**: `v2.0.0`
- **Derleme Durumu**: 🟢 Derlenebilir (`npx tsc --noEmit` & `npm run build` hatasız)
- **Ana Teknolojiler**: React 19, TypeScript 5.8, Vite 6, Node.js + Express, FFmpeg H.264/AAC, Web Audio API, Gemini 2.5 AI.

---

## 🕒 2. İlerleme Logu & Değişiklik Geçmişi (Progress & Change Log)

### [2026-08-10 - Oturum 31] - Effect Defaults & Lyrics Lip-Sync Logic

**Çalışan Ajan Pipeline:** Lead Developer

- **Sorun:** Efektler varsayılan olarak açıktı. Dudak senkronizasyonu (lip-sync), sözler olmadan direkt müzikle başlıyordu.
- **Çözüm:**
  - `App.tsx` içerisindeki `VisualizerSettings` default değerlerinde tüm ekstra efektler (rgbSplit, scanLines, vignette, bloom vb.) kapatıldı (`false`).
  - `getLipSyncEnergy` adında bir yardımcı fonksiyon oluşturularak LRC (şarkı sözü) senkronizasyonuna bağlandı. Eğer lyrics (Sözler) yüklü değilse dudak hareket etmeyecek. Yüklüyse, geçerli bir kelimenin okunma aralığına göre aktifleşecek.
  - Bu mantık `TalkingHead`, `NoirSingingHeadVisualizer` ve `ObjFaceVisualizer` içerisine entegre edildi.


### [2026-08-10 - Oturum 30] - Fix VRM Model Rotation and Mobile Canvas Layout

**Çalışan Ajan Pipeline:** Lead Developer

- **Sorun:** VRM Anime modeli kameraya sırtını dönüyordu (geriye bakıyordu) ve mobil görünümlerde (veya dar ekranlarda) önizleme ekranı yalnızca profil sekmesinde görünüyordu.
- **Çözüm:**
  - `VrmAnimeHybridVisualizer.ts` dosyasında `vrm.scene.rotation.y = 0;` değeri `Math.PI` (180 derece) olarak değiştirildi, böylece model kameraya doğru çevrildi.
  - Mobil ekranlarda (veya dar masaüstü görünümlerinde) sağ taraftaki tab sekmesinin (`aside`) içeriği çok uzun olduğunda (Görsel ve Efekt sekmelerinde), sol taraftaki (`section`) canvas alanını sıkıştırıp yüksekliğini 0 yapmasına sebep olan flex taşma (overflow) problemi düzeltildi. `App.tsx` içerisinde sağ taraftaki konteynere `flex-1` ve `overflow-hidden` eklenerek scroll edilebilir hale getirildi, böylece her iki alan ekranı eşit oranda bölüşmeye başladı ve canvas (önizleme) görünür hale geldi.


### [2026-08-10 - Oturum 29] - Fix Shader Uniform Redefinition Error

**Çalışan Ajan Pipeline:** Lead Developer

- **Sorun:** VRM Anime Hybrid modelinde `THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false` ("uTime redefinition") hatası alınıyordu.
- **Çözüm:**
  - Aynı materyalin (ör. Alicia_body_wear) birden fazla alt modele (sub-mesh) uygulanması nedeniyle `onBeforeCompile` fonksiyonunun her bir sub-mesh için tekrar tekrar çağrılması ve shader koduna çoklu defa uniform satırlarının (`uniform float uTime;` vb.) eklenmesi (injection) tespit edildi.
  - `mat.userData.customShaderInjected` flagi kullanılarak her materyalin yalnızca bir kez inject edilmesi sağlandı ve hata çözüldü.


### [2026-08-10 - Oturum 28] - Fix Corrupted VRM Model

**Çalışan Ajan Pipeline:** Lead Developer

- **Sorun:** "VRM Load Error: Offset is outside the bounds of the DataView" hatası devam ediyordu.
- **Çözüm:**
  - Sorunun `AliciaSolid.vrm` dosyasının bir noktada metin olarak (UTF-8 encoding) okunup/yazıldığı için bozulmasından kaynaklandığı (binary dosyanın içine `ef bf bd` replacement character dolduğu) tespit edildi.
  - Bozuk `AliciaSolid.vrm` dosyası silindi ve orijinal binary `AliciaSolid.vrm` dosyası (UniVRM reposundan) yeniden indirilip `public/models` klasörüne yerleştirildi.
  - Uygulama sorunsuz şekilde VRM modelini yükleyebiliyor.


### [2026-08-10 - Oturum 27] - Fix VRM Load Error (DataView Offset Bounds)

**Çalışan Ajan Pipeline:** Lead Developer

- **Sorun:** "VRM Load Error: Offset is outside the bounds of the DataView" hatası oluştu.
- **Çözüm:**
  - Bu hata, `@pixiv/three-vrm` kütüphanesinin (3.x serisi) en yeni `three` (0.185.1) sürümündeki `GLTFLoader` DataView değişiklikleriyle uyumlu olmamasından kaynaklanıyordu.
  - `three` ve `@types/three` paketleri uyumlu ve kararlı olan `0.169.0` sürümüne düşürüldü (downgrade). Bu sayede VRM (AliciaSolid) modeli yüklenirken parsing (ayrıştırma) esnasında yaşanan taşma (offset bounds) hatası giderildi.


### [2026-08-10 - Oturum 26] - Vocal Emphasis Filter & MicroMovementSystem

**Çalışan Ajan Pipeline:** Lead Developer & UI/UX Critic

- **Sorun:** Davul (bass) seslerinin ağız hareketlerine etki etmemesi gerekiyordu. Ayrı bir vokal izolasyonuna ihtiyaç duyuldu ve gerçekçi, oyun-NPC olmayan mikro-mimiklerin ayrıştırılması gerekti.
- **Çözüm:**
  - `App.tsx` içerisine `BiquadFilterNode` eklendi. Bu filtre 500-3000Hz (vocal emphasis filter) arasında sesleri süzerek ayrı bir `AnalyserNode` (vocalAnalyser) üzerinden `AudioProcessor`a iletildi.
  - Vokal bandı sadece dudak senkronuna (lip-sync) yönlendirildi; bass ve tiz enerjileri görsel efektlerde (hologram vs) kalmaya devam etti.
  - `TalkingHead.ts` soyutlaması oluşturuldu: Göz kırpma (blink), hafif kafa sallama (sway) ve yavaş nefes alma (idle movement) için ayrı animasyon katmanları (MicroMovementSystem) programlandı. Bass enerjisi sadece kafanın titreşimini etkilerken, ağız şeklini sadece vokal enerjisi tetikliyor.


### [2026-08-08 - Oturum 25] - Doğal TalkingHead, Vocal Range Filter & Hologram/Anime Toggle

**Çalışan Ajan Pipeline:** Lead Developer & UI/UX Critic

- **Sorun:** Kullanıcı gerçekçi (talkinghead kütüphanesi benzeri) mikro-mimikler, sadece vokal bandında tetiklenen lip-sync ve "Hologram" ile "Anime (Solid)" modları arasında geçiş yapabilme seçeneği istedi.
- **Çözüm:**
  - `AudioProcessor.ts` üzerinde 500Hz - 3kHz frekans aralığını tarayan özel bir `vocalEnergy` bandı oluşturuldu (index 23 - 140 arası).
  - `VrmAnimeHybridVisualizer.ts` içerisine 'TalkingHead' benzeri bir update mekanizması yerleştirildi. Spine, neck ve head kemiklerine yavaş nefes alma ve ritmik hareket (sway) dinamikleri eklendi.
  - Göz kırpma (blink) ve yüz mimikleri (happy, relaxed) tam teşekküllü hale getirilerek yapaylıktan kurtarıldı.
  - Arayüze `AVATAR STİLİ` adında bir ayar (SOLID ANIME vs HOLOGRAM 3D) eklendi ve 2D render loop içerisinde composite operasyonlar bu ayara bağlandı.

### [2026-08-08 - Oturum 24] - VRM Doğal Lip Sync ve Yakın Çekim Kamera

**Çalışan Ajan Pipeline:** UI/UX Critic & Lead Developer

- **Sorun:** Kullanıcı animasyonun çok dağınık olduğunu (mesh yırtılmaları), kolların havada görünmesini istemediğini ve sadece kafaya odaklanan daha doğal bir lip-sync beklentisi olduğunu belirtti.
- **Çözüm:**
  - Vertex shader içindeki `ripple` ve `glitch` eklentileri (mesh yırtılmasına yol açan) tamamen kaldırıldı.
  - Kamera açısı değiştirilerek tam olarak `head` kemiğinin konumuna göre yakın çekim (close-up 3D Hologram Head) portre görünümüne odaklanıldı.
  - Lip-Sync (ağız hareketi) için sadece yüksek ses eşiği geçildiğinde (`mid > 0.15`) ağız hareketi tetiklenecek şekilde katı bir threshold (gate) yapısı kuruldu.
  - Göz kırpma (`blink`) daha düzensiz hale getirilerek gerçekçi kılındı ve zamana bağlı yavaş mimikler (`happy`, `relaxed`, `Joy`, `Fun`) eklendi.

### [2026-08-08 - Oturum 23] - VRM Mesh Tearing & Arm Rotation Fix

**Çalışan Ajan Pipeline:** Lead Developer & QA Tester

- **Sorun:** Karakterin kollarının havada (V-pose) kalması ve ses frekansı shader'ının mesh'i parçalayarak (tearing) lip-sync görünürlüğünü bozması.
- **Çözüm:**
  - Kolların A-Pose duruş açılarının Z-rotasyon yönleri tersine çevrildi (Left: `-1.0`, Right: `1.0`) ve kollar başarıyla aşağıya indirildi.
  - GLSL Vertex Shader içindeki `transformed += normal * ripple` ve `glitch` eklentileri mesh topolojisini bozduğu ve modeli piksellerine ayırdığı için kaldırıldı. Sadece çok hafif Y ekseni esnemesi bırakılarak stabil bir lip-sync ve hologram deneyimi sağlandı.

### [2026-08-08 - Oturum 22] - VRM Hologram & Lip Sync Revizyonu

**Çalışan Ajan Pipeline:** UI/UX Critic & Lead Developer

- **Sorun:** Kullanıcı geri bildirimine göre VRM modeli arkası dönük (T-pose) duruyor ve hologram hissiyatı vermiyordu. Ayrıca lip-sync (şarkı söyleme) tepkisi zayıftı.
- **Çözüm:**
  - VRM model rotasyonu kameraya bakacak şekilde (`rotation.y = 0`) düzeltildi.
  - Kolların varsayılan T-Pose duruşu A-Pose (aşağıya dönük) olarak kısıtlandı (`leftUpperArm` ve `rightUpperArm` kemik manipülasyonu).
  - Hologram Efekti Eklendi: 2D Canvas üzerinde WebGL çizimine `screen` blend modu, Chromatic Aberration (RGB split) ve CRT scanline tarama çizgileri uygulandı.
  - Lip-Sync Güçlendirildi: Vokal algılama (Mid band) 2.5 kat güçlendirilerek VRM ağız açılışı belirginleştirildi. `aa, ih, ou` (ve legacy `A, I, U`) shape key'leri zamana bağlı rastgele karıştırılarak doğal şarkı söyleme animasyonu (dinamik lip-sync) oluşturuldu.

### [2026-08-08 - Oturum 21] - VRM Shader Compilation Fix

**Çalışan Ajan Pipeline:** Code Auditor

- **Sorun:** `@pixiv/three-vrm` MToonMaterial shader'ının `onBeforeCompile` metodunun ezilmesi (override) nedeniyle Three.js revizyon makrolarının (örn. `THREE_VRM_THREE_REVISION`) silinmesi ve shader derleme hataları (VALIDATE_STATUS false) oluşması.
- **Çözüm:** `VrmAnimeHybridVisualizer` içindeki `onBeforeCompile` kancası sarmalandı (wrapped). Orijinal `onBeforeCompile` fonksiyonu çağrılarak kütüphaneye ait shader makrolarının eklenmesi sağlandı ve sonrasında custom GLSL (Audio-reactive) kodlarımız enjekte edildi.

### [2026-08-08 - Oturum 20] - VRM Load Error (HTML Parsing) Fix

**Çalışan Ajan Pipeline:** QA Tester

- **Sorun:** Dev sunucusunun önbelleğinden veya ilk hatalı model indirmesinden kaynaklanan HTML dosyasının (<!DOCTYPE) JSON olarak parse edilmeye çalışılması (VRM Load Error).
- **Çözüm:** Modelin sağlam binary versiyonu (10.7 MB) sunucuya yerleştirildi, geliştirme sunucusu yeniden başlatıldı (Cache temizliği yapıldı). Modelin VRM 1.0 uyumlu Expression setleri (aa, ih, blink vb.) kontrol edildi ve TypeError riski tamamen ortadan kaldırıldı.

### [2026-08-08 - Oturum 19] - VRM Load Error Fix

**Çalışan Ajan Pipeline:** Lead Developer → QA Tester

- **Bozuk VRM Dosyası Düzeltildi**: AliciaSolid.vrm modeli GitHub HTML sayfası olarak (Unexpected token '<') hatalı indirilmişti. Model `raw.githubusercontent.com/pixiv/three-vrm` üzerinden sağlam (binary glTF) bir VRM örneği ile değiştirildi (10.7MB) ve `VRM Load Error` çözüldü.

### [2026-08-08 - Oturum 18] - VRM Anime Hybrid & Three.js Entegrasyonu

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic & DSP Engineer

- **VRM & Three.js Altyapısı**: Projeye `three` ve `@pixiv/three-vrm` dahil edildi. İki katmanlı (Offscreen WebGL Renderer → 2D Canvas) hibrit çizim mimarisi kuruldu.
- **AliciaSolid VRM Modeli**: Standart CC0 VRM anime modeli `public/models/AliciaSolid.vrm` indirilerek yüklendi.
- **Audio-Reactive Procedural Shader**: VRM modelinin tüm materyallerine (onBeforeCompile ile) özel GLSL shader (vertex displacement) eklendi.
  - **Normal**: Standart VRM render.
  - **Bass (Dalgalanma)**: Yüzey (normal vektörleri) yönünde sinüzoidal (ripple) dalgalanma efekti eklendi.
  - **Distortion/Treble (Piksel Ayrışması)**: Hem GLSL vertex bazında (glitch kayması) hem de 2D Canvas getImageData bazında yatay slice glitch eklendi.
- **Vokal (Mid) Senkronu & Yansıma**: Vokal enerjisi ile VRM ExpressionManager (`aa`, `A`, `blink`) eşleştirilerek dudak senkronu (Lip-Sync) yapıldı. Aynı zamanda göz hizasına sese duyarlı Holo-HUD waveform yansıması (Cyberpunk Neon) entegre edildi.

### [2026-08-08 - Oturum 17] - 3D Math & Aesthetic Fixes (Anti-Mutant)

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic

- **3D Koordinat Düzeltmeleri**: ObjFaceVisualizer ve NoirSingingHead modellerindeki Y-Ekseni tersinmesi ve Z-Sorting (Painter's Algorithm) matematiği standart sağ-elli (right-handed) uzaya göre düzeltildi. Kafaların ters veya içe çökük görünmesi engellendi.
- **Mutasyon / Parçalanma Giderildi**: Yüksek `treble` ve `bass` değerlerinin vertexleri bağımsız kopararak (shatter/noise) radyasyonlu mutant bir görünüme yol açması düzeltildi. Bunun yerine global ve pürüzsüz (smooth) ses tepkileri (hafif çene düşmesi, global ölçeklenme) eklendi.
- **Noir Krom Estetiği**: Düzensiz renkler yerine, yüksek Fresnel yansımalı çelik/krom (Steel Blue) Noir aydınlatma ve temiz wireframe overlay eklendi.

### [2026-08-08 - Oturum 16] - OBJ Face Visualizer Typo / Interface Fix

**Çalışan Ajan Pipeline:** Lead Developer → QA Tester

- **Arayüz (Interface) Uyumluluğu**: Yeni yazılan  modülü,  arayüzünün ( ve ) zorunluluklarına göre güncellendi. Eski formattaki  metodu düzeltilerek çalışma zamanı çökme hatası (Runtime TypeError) onarıldı.
- **Derleme Hataları Giderildi**: Tip hataları ve RenderContext referansları yeniden bağlanarak %100 başarılı derleme sağlandı.

### [2026-08-08 - Oturum 15] - Dışarıdan Yüklenen OBJ 3D Model Entegrasyonu

**Çalışan Ajan Pipeline:** Lead Developer → Implementation → QA Tester → Documentation

- **Dışardan Harici 3D Model (OBJ) Desteği**:
  - `public/models/face.obj` yolundan MediaPipe'ın standart 468 vertex'lik düşük poligon (low-poly) yüz maskesi (`canonical_face_model.obj`) entegre edildi.
  - Sadece projenin içerisindeki bir model değil, `fetch` kullanılarak çalışma zamanında parse edilen (vertices, faces) yeni bir visualizer modülü yazıldı (`ObjFaceVisualizer.ts`).
- **Gerçek 3D Matematik & Rendering**:
  - `f` (faces) ve `v` (vertices) tagleri ayrıştırılarak Fan Triangulation yöntemiyle yüzeylere çevrildi.
  - Normal vektör hesaplamaları (Cross Product), ışıklandırma hesapları (Dot Product / Flat Shading) ve Painter's Algorithm kullanılarak 3D Z-sıralamalı (Z-sorting) render pipelini kuruldu. 
  - Yüz yönüne göre `Backface Culling` algoritması aktif edildi.
- **Audio-Reactivity (Sese Duyarlı Obj Mesh)**:
  - Yüklenen sabit bir 3D model, müziğe duyarlı hale getirildi. 
  - `treble` ile vertex'lerde süzülen parazit (organic floating noise), `bass` ile glitch patlamaları (shatter) ve `mid` enerjisiyle çenenin düşmesi (jaw drop) simüle edildi.

### [2026-08-08 - Oturum 14] - Audio-Reactive 3D Singing Head (Noir Singing Head) & Procedural Organism

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **Estetik Dönüşüm (Cyberpunk Wireframe & Digital Sculpting)**:
  - Solid (dolu) yüzey dolgusu (Black Chrome) yerine Cyberpunk / Wireframe çizgisel render stiline geçildi (`ctx.strokeStyle` ön plana çıkarıldı, `ctx.fillStyle` %70 transparan siyaha çekildi).
  - Yüz üçgenleri şarkının enerjisi ve anlık zamanıyla senkronize olarak Neon Cyan, Magenta ve Mor (`hsla` renk uzayı) tonlarında parlayıp renk değiştiriyor.
- **Gelişmiş Audio-Reactive Yüz Kinematiği**:
  - **Gözler (Blinking & Squinting)**: Tiz frekanslar (`treble`) göz çukurlarını dikeyde daraltarak ve göz hizasını kaydırarak (Squinting/Blinking) müziğin ritmine tepki veren göz kırpma efekti yaratıyor.
  - **Ağız (Lip Sync)**: Ağız mekaniği geliştirildi. Sadece alt çene değil, üst dudak da vokale (mid frekanslar) göre ayrı yönlere bükülerek çok daha net bir şarkı söyleme (Singing) simülasyonu sağlandı.
- **Procedural Digital Organism (Şekilsizden İnsana Geçiş)**:
  - Yüz yapısı (mesh) artık statik değil. Başlangıçta ve sessizlik anlarında şekilsiz (noise ile dalgalanan) bir veri küresi (sphere/blob) olarak görünüyor.
  - Şarkı ve vokaller başladığında (`audio.energy`), vertex'ler pürüzsüz bir matematiksel interpolasyon ile (morphing) küreden yavaş yavaş Noir insan yüzü formuna evriliyor. Müzik kesildiğinde tekrar dağılıp küreye dönüyor.
  - Organik bir form kazandırmak için bas vurmadığı anlarda "nefes alan" (breathing noise) dalgalanmalar entegre edildi.
- **Kamera Yönü ve Projeksiyon Düzeltmesi**:
  - Modelin yüzey normalleri ve Z-ekseni projeksiyon matematiği düzeltildi (`nzBase < 0` olarak front-facing ayarlandı).
  - Yüzün arka tarafını çizmeyi engelleyen 3D **Backface Culling** (Arka yüzey kırpma) algoritması çalışmaya devam ediyor.
  - Işıklandırma yönü (`lightDir`) ve görüntüleme vektörü (`viewDir`) düzeltildi, böylece speküler krom yansıma (black chrome shading) kusursuz çalışıyor.

### [2026-08-08 - Oturum 13] - 3D Dinamik Dans Kinematiği, 360° Gövde Dönüşü (Pirouette) & Sahne Gezinimi

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **Frekans Ayrışımlı Çok Eklemli Dans Koreografisi (Multi-Joint Frequency Dance)**:
  - **Bass (Kick & Sub)**: Pelvik bas vuruşları (hip drop/pop), dinamik diz bükülmeleri (groove bounce), ritmik ayak basma ve göğüs sıkışması/genleşmesi.
  - **Mid (Vokal & Melodi & Snare)**: Akışkan gövde ve omurga dalgası (serpentine spine roll), omuz izolasyonu ve çok segmentli akışkan kol dalgalanmaları (liquid arm choreography & tutting).
  - **Treble (Hi-Hat & Cızırtı)**: Parmak uçlarında titreşim/açılıp kapanma (hand flickers), kafa vuruş aksanları ve fırlayan cıva/ışık parçacıkları.
- **Kendi Etrafında 3D Dönme (360° Body Pirouettes & Yaw Rotation)**:
  - Figür dans ederken kendi dikey ekseni (Y-ekseni) etrafında 360° döner; bas ve melodi patlamalarında dönme hızı dinamik artar.
  - Tüm eklemler Z-derinliğine göre 3D perspektifle dönüştürülüp Z-sort edilerek (arka uzuvlar -> gövde -> ön uzuvlar) çizilir.
- **Sahne Boyunca İlerleme (Stage Locomotion & Locomotion Dance)**:
  - Figür sahne üzerinde sağa ve sola ritmik adımlarla süzülerek gezinir.
  - Zemindeki yansıtıcı cıva ve su havuzu (puddle) da figürle birlikte sahne boyunca akışkan bir ataletle hareket eder.
- **Sessizlikte Sıvıya Erime & Müzikle Yükselme**:
  - Şarkının sessiz kısımlarında figür pürüzsüzce yerdeki sıvıya erir; müzik başladığında dans adımlarıyla yükselir.

**Etkilenen Dosyalar:** `src/visualizers/LiquidMercuryHumanVisualizer.ts`, `src/visualizers/NeonHydroHumanVisualizer.ts`, `MEMORY.md`

### [2026-08-08 - Oturum 12] - 2 Yeni Dijital Su / İnsan Görselleştirici (Liquid Mercury Human & Neon Hydro-Human) - Zemin Sabitleme & Akışkan Erime

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **Sessizlikte Sıvı Puddle Formuna Erime & Müzikle Yükselme Dinamiği (`riseAmount: 0.0 -> 1.0`)**:
  - Şarkının sessiz kısımlarında veya müzik henüz başlamadığında insan figürü tamamen zemindeki sakin, yansıtıcı sıvı birikintisine (puddle) eriyerek hareketsiz bekler.
  - Müzik ve ses enerjisi yükseldiğinde sıvı merkezden toplanarak pürüzsüz bir organik animasyonla dik insan formuna yükselir.
  - Parça durduğunda veya sessizlik olduğunda figür tekrar zemindeki sıvıya pürüzsüzce geri erir.
- **Zemine Sabitlenmiş Doğal Dans Kinematiği (Uçma/Kayma Sorunu Giderildi)**:
  - Ayaklar zemindeki sıvı havuzuna (`footY = floorY`) mutlak olarak sabitlendi; gökyüzüne uçma veya sınır dışı sıçramalar tamamen kaldırıldı.
  - Bas ritimlerinde havaya uçmak yerine ritmik diz bükme (squat/groove), kalça-omuz salınımı, kafa bobbing ve kolların müziğe göre dalgalanması sağlandı.
- **1. "Liquid Mercury" (Cıva İnsan - `LIQUID_MERCURY_HUMAN`)**:
  - Zifiri karanlık aynalı zemin, krom/cıva sıvı birikintisi, bas vuruşlarında zeminde yayılan sıvı şok dalgaları, vokal enerjisine göre parlayan krom doku ve tizlerde ellerden/baştan ayrılıp süzülen cıva damlacıkları.
- **2. "Neon Hydro-Human" (Işıklı Su İnsan - `NEON_HYDRO_HUMAN`)**:
  - Saydam içeriden ışıldayan su formu, göğüste ritimle atan biyo-lüminesans neon kalp çekirdeği ve sinir ağları, melodiye göre Cyan/Magenta/Gold renk geçişleri ve bas vuruşlarında neon su halkaları.
- **Doğrulama**:
  - `tsc --noEmit` ve `npm run build` ile hatasız derleme onaylandı.

**Etkilenen Dosyalar:** `src/types.ts`, `src/core/Renderer.ts`, `src/App.tsx`, `src/visualizers/LiquidMercuryHumanVisualizer.ts`, `src/visualizers/NeonHydroHumanVisualizer.ts`, `MEMORY.md`

### [2026-08-08 - Oturum 11] - 5 Yeni Etkileşimli Generative Görselleştirici & 3-Bant FFT & Dokunmatik Yörünge Entegrasyonu

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **3-Bantlı Kesin FFT Frekans Ayrımı (Bass, Mid, Treble)**:
  - `AudioProcessor.ts`: Web Audio API FFT bantları standart odyofil frekans aralıklarına göre katı biçimde ayrıldı:
    - **Bass Bandı**: 20 Hz - 250 Hz (Sub & Low-end Kick reaksiyonları).
    - **Mid Bandı**: 250 Hz - 4000 Hz (Vokal, synth, enstrüman yüzey gürültüleri).
    - **Treble Bandı**: 4000 Hz - 20000 Hz (Hi-hat, cızırtı ve anlık neon kıvılcımları).
  - `AudioEvents` arayüzüne `trebleEnergy` eklendi, sunucu ve istemci render döngülerine tam senkronize bağlandı.
- **5 Yeni Etkileşimli Görselleştirici Motoru Eklendi (Toplam 31 Mod)**:
  1. **3D Particle Sphere (`PARTICLE_SPHERE_3D`)**: Binlerce 3D parçacıklı küre, Bass darbe genleşmesi, Mid yüzey noise dalgalanması, Treble neon kıvılcım saçılımları, 360° dokunmatik kamera dönüşü ve parmakla kütleçekim alanı oluşturma.
  2. **Fluid & Metaball Simülasyonu (`FLUID_METABALL`)**: Reaktif cıva/sıvı metaball dinamiği, kick ile fırlayan yeni damlalar, yüksek frekanslı yüzey dalgalanması ve ekrana dokunarak sıvıyı yönlendirme/itme.
  3. **Synthwave 3D Grid (`SYNTHWAVE_GRID_3D`)**: 80'ler retro 3D sonsuz perspektif ızgarası, Bass ile yükselen arazi dağları, parlak neon tel kafes güneş, yıldız tozu ve sürüklemeyle kamera açısını/hızını değiştirme.
  4. **Kinetic Glitch Typography (`KINETIC_TYPO_GLITCH`)**: Bas frekans genleşmeli dinamik tipografi, vokal/mid frekanslarında parlayan neon aura, treble frekanslarında piksel glitch dağılımı ve çift tıklamayla lirik/glitch stil değişimi.
  5. **Circular Aura Spectrum (`CIRCULAR_AURA_SPECTRUM`)**: Minimalist dairesel frekans barları, albüm kapağı merkezli nabız, dışa doğru genişleyen renkli aura halkaları, akışkan dalgalar ve çift dokunmayla 4 farklı stil modu (Neon, Minimal, Cyber, Sunset).
- **Kullanıcı Etkileşim Motoru (Pointer & Touch Gestures)**:
  - `types.ts`: `UserInteractionState` arayüzü eklendi (pointer koordinatları, sürükleme delta, 360° orbit açıları, kütleçekim çekicisi, akışkan dalgalar, stil varyantları ve anlık glitch patlamaları).
  - `VisualizerCanvas.tsx`: Mouse / Touch olayları (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onDoubleClick`) canvas üzerine bağlandı; `StudioRenderer` ve görselleştirici sınıflarına gerçek zamanlı aktarıldı.
  - Dinamik performans optimizasyonu (`settings.visDensity`, `settings.visScale`, FPS koruma) tüm modlarda uygulandı.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata (31 visualizer modunun tamamında %100 tip güvenliği).
  - `npm run build` → Başarılı (Vite client + esbuild Node.js server bundle).

**Etkilenen Dosyalar:** `src/types.ts`, `src/core/AudioProcessor.ts`, `src/core/Renderer.ts`, `src/components/VisualizerCanvas.tsx`, `src/App.tsx`, `src/visualizers/ParticleSphere3DVisualizer.ts`, `src/visualizers/FluidMetaballVisualizer.ts`, `src/visualizers/SynthwaveGrid3DVisualizer.ts`, `src/visualizers/KineticTypoGlitchVisualizer.ts`, `src/visualizers/CircularAuraSpectrumVisualizer.ts`, `server/renderEngine.ts`, `MEMORY.md`

### [2026-08-08 - Oturum 10] - Kod Tabanı Bütünlük Denetimi (Auditing) & Minimum Düzeltme

**Çalışan Ajan Pipeline:** Code Auditor → Lead Developer → QA Tester → Documentation

- **Bütünlük ve Bağlantı Denetimi**:
  - UI Redesign sonrası tüm bileşenler (`App.tsx`, `VisualizerCanvas.tsx`, `Renderer.ts`, `EffectsStudio.tsx`, `LyricsStudio.tsx`, `PresetManager.tsx`, `server/renderEngine.ts`, `server.ts`) incelendi.
  - State akışları, sekme geçişleri, AudioContext analyser bağlantıları, MediaRecorder CSR kaydı ve FFmpeg SSR render pipeline'ı test edildi.
- **Tespit Edilen ve Düzeltilen Kırılma (Minimum Fix)**:
  - **Sunucu Render (SSR) Duvar Kağıdı Yükleyici**: `server/renderEngine.ts` dosyasında `bgImageUrl` alanı için sadece `startsWith('data:image')` şartı aranıyordu. Bu durum, Medya sekmesindeki küratörlü HTTP/HTTPS duvar kağıtlarının sunucu render'ında yüklenmesini engelliyordu. `payload.settings?.bgImageUrl` doğrudan tüm geçerli URL'ler için `loadImage` ile yüklenebilir hale getirildi.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata (Hatasız).
  - `npm run build` → Başarılı.

**Etkilenen Dosyalar:** `server/renderEngine.ts`, `MEMORY.md`


### [2026-08-08 - Oturum 9] - Tekil Kontrol Konsolidasyonu, Arka Plan Görseli & Tam Duyarlı (Responsive) Düzen

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX & Design Critic → QA Tester → Documentation

- **Tekil Kontrol Konsolidasyonu (Single Source of Truth)**:
  - Tekrarlayan / çift yerlerde bulunan kontrol elemanları tek bir merkeze toplandı.
  - Header ve Canvas üzerindeki görüşü kapatan çift dosya seçiciler kaldırılarak `MEDYA` sekmesi tekil medya yönetim merkezi haline getirildi.
  - Müzik yüklü değilken dahi Visualizer sahnede akıcı bir şekilde önizleme modunda çalışmaya devam ederken, altta şık ve hafif bir durum rozeti ile kullanıcı tek tıkla Medya sekmesine yönlendirilir.
- **Arka Plan Görseli & Duvar Kağıdı (Static Wallpaper) Desteği**:
  - Hem İstemci (Canvas 2D render loop) hem de Sunucu (Node Canvas + FFmpeg 60 FPS) için tam `bgImageUrl` desteği eklendi.
  - `MEDYA` sekmesine 4 adet küratörlü HD Siber/Minimal duvar kağıdı, özel görsel yükleme (.JPG, .PNG, .WEBP), opaklık (%10 - %100), bulanıklık (0 - 25px) ve sese duyarlı Beat Kick Zoom & Pulse kontrolleri entegre edildi.
  - Sunucu render pipeline'ında çok parçalı form (`FormData` multipart upload) üzerinden görsel sunucuya aktarılıp FFmpeg videosuna işlenir.
- **Duyarlı (Responsive) Görünüm ve Çözünürlük Bütünlüğü**:
  - Mobil, tablet, daraltılmış pencere ve ultra-geniş ekranlarda düzenin kayması ve taşması engellendi.
  - Aspect ratio container (`max-h-[50vh]`, `min-w-0`, esnek oranlar) ile çözünürlük nasıl değişirse değişsin tuval oranları ve transport kontrolleri kusursuz hizalanır.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata.
  - `npm run build` → Başarılı.

**Etkilenen Dosyalar:** `src/App.tsx`, `src/components/VisualizerCanvas.tsx`, `src/core/Renderer.ts`, `src/types.ts`, `server/renderEngine.ts`, `server.ts`, `MEMORY.md`


### [2026-08-08 - Oturum 8] - Minimalist Pro Studio (1B$ Tier) & Tabbed Workspace Mimarisi

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX & Design Critic → QA Tester → Documentation

- **Minimalist Stüdyo & Split Viewport Mimarisi**:
  - Dikey kaydırma yığını yerine sol tarafta dinamik Aspect Ratio (16:9, 9:16, 1:1) Canvas Viewport ve altında entegre floating Audio Transport Scrubber (Oynat/Durdur, Timeline Dalga Çubuğu, Geri/İleri 5s, Süre ve Mute kontrolü) konumlandırıldı.
  - Sağ tarafta 6 odaklı sekmeye ayrılmış modern **Docked Tabbed Inspector** paneli oluşturuldu:
    1. `GÖRSEL` (26 Visualizer teması, Arama ve 3D/Particle/Wave/Cyber/Minimal kategori hapları, Renk Paletleri, Zemin Atmosferi, Hız/Ölçek mikro sliderları).
    2. `EFEKTLER` (12 FX post-process shaderı, 1-tık hazır FX paketleri, Master Intensity & Reaktivite).
    3. `SÖZLER` (Kinetic Typography, Karaoke, Subtitle, AI Otomatik Senkronizasyon, .LRC import/export).
    4. `MEDYA` (Ses dosyası, Parça ve Sanatçı bilgisi, Kapak Fotoğrafı, Logo Damgası, Euphoric Arka Plan Video Döngüleri).
    5. `PROFİL` (LocalStorage konfigürasyon profilleri, hızlı geri çağırma, JSON dışa/içe aktarma).
    6. `RENDER` (60 FPS Sunucu FFmpeg MP4 vs İstemci WebM, 1080p/720p, canlı render ilerleme takibi ve indirme).
- **DSP Suite Askıya Alındı**:
  - Kullanıcı isteği doğrultusunda Spotify DSP Mastering Suite arayüzü stüdyodan kaldırılarak ses işleme temiz, orijinal ses kalitesinde (bypass) Web Audio akışına bağlandı.
- **Klavye Kısayolları & Örnek Parça Deneyimi**:
  - `Space` ile anında oynatma/durdurma, `1-6` tuşları ile sekmeler arası hızlı geçiş eklendi.
  - MP3 dosyası olmayan kullanıcılar için tek tıkla çalışan "Örnek Parça Yükle" entegrasyonu sağlandı.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata.
  - `npm run build` → Başarılı.

**Etkilenen Dosyalar:** `src/App.tsx`, `src/components/EffectsStudio.tsx`, `src/components/LyricsStudio.tsx`, `src/components/PresetManager.tsx`, `MEMORY.md`


### [2026-08-08 - Oturum 7] - LocalStorage Konfigürasyon & Preset Profil Yöneticisi Entegrasyonu

**Çalışan Ajan Pipeline:** Lead Developer → UI/UX Critic → Implementation → QA Tester → Documentation

- **VisualizerSettings LocalStorage Profil Sistemi**:
  - `src/types.ts`: `VisualizerPresetProfile` arayüzü eklendi.
  - `src/services/presetService.ts`: `localStorage` üzerinde profilleri saklama, oluşturma, üzerine yazma, silme, JSON dışa aktarma (`.json`) ve JSON içe aktarma servis katmanı yazıldı.
  - 6 adet yüksek kaliteli yerleşik hazır profil eklendi (Cyberpunk Gold 2077, Synthwave Neon Highway, Popcorn Physics Surge, Vissonance Hyper Ring, Noir Monolith Minimal, Phonk Wave Aggression).
- **PresetManager Bileşeni & Hızlı Erişim Arayüzü**:
  - `src/components/PresetManager.tsx`: Hızlı profil seçici çubuğu, tek tıkla profil yükleme, yeni profil kaydetme modalı, profil arama ve tüm profilleri yönetme modalı entegre edildi.
  - `src/App.tsx`: PresetManager bileşeni ana stüdyo paneline yerleştirildi.
  - `AGENTS.md`: Yapay zeka ajanları için kalıcı geliştirme direktifleri ve mimari kuralları oluşturuldu.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata.
  - `npm run build` → Başarılı.

**Etkilenen Dosyalar:** `src/types.ts`, `src/services/presetService.ts`, `src/components/PresetManager.tsx`, `src/App.tsx`, `AGENTS.md`, `MEMORY.md`


### [2026-08-08 - Oturum 6] - Hugh Kennedy Popcorn Parçacık Fiziği & Organik Visualizer Entegrasyonu

**Çalışan Ajan Pipeline:** Product Manager → Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **Popcorn & Organik Parçacık Fiziği Entegrasyonu**:
  - `hughsk/popcorn` ilhamlı: `POPCORN_PHYSICS` (ses transient patlamalarıyla fırlayan parçacıklar, yerçekimi, zemin sekmesi, hız izleri ve genişleyen şok dalgaları).
  - `VORTEX_NEBULA` (yerçekimli parçacık girdabı, frekans genleşmesi ve konstelasyon ağ çizgileri).
  - `CYBER_MATRIX` (dijital matrix veri akışı ve ses ritmine bağlı düşüş hızları).
- **Görselleştirici Sayısı 22 Moda Yükseltildi**:
  - `src/types.ts`, `src/core/Renderer.ts` ve `src/App.tsx` üzerinde 22 mod tam tip güvenliğiyle eklendi.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata (22 visualizer modunun tamamında %100 tip güvenliği).
  - `npm run build` → Başarılı (4.62s, Vite client + esbuild Node.js server bundle).

**Etkilenen Dosyalar:** `src/types.ts`, `src/core/Renderer.ts`, `src/visualizers/PopcornPhysicsVisualizer.ts`, `src/visualizers/VortexNebulaVisualizer.ts`, `src/visualizers/CyberMatrixVisualizer.ts`, `src/App.tsx`, `MEMORY.md`, `FEATURES.md`

### [2026-08-08 - Oturum 5] - Codrops, CAVA & Lissajous Visualizer Entegrasyonu

**Çalışan Ajan Pipeline:** Product Manager → Lead Developer → UI/UX Critic & Audio DSP Engineer → Implementation → QA Tester → Documentation

- **Referans Proje Analizi ve Entegrasyonu**:
  - `codrops/AudioVisualizers` ilhamlı: `CODROPS_POLAR` (daire çizgi spektrumu & şok dalgaları), `CODROPS_WAVE` (çok katmanlı osiloskop eğrileri), `CODROPS_BARS` (sürekli frekans çizgi grafiği).
  - `karlstav/cava` ilhamlı: `CAVA_SPECTRUM` (logaritmik konsol/terminal EQ, yerçekimi fiziği ve blok kapsülleri).
  - `willianjusten/awesome-audio-visualization` ilhamlı: `LISSAJOUS_ORBIT` (çift kanal X-Y faz osiloskop yörüngeleri & harmonik bükülme).
- **Görselleştirici Sayısı 19 Moda Yükseltildi**:
  - `src/types.ts`, `src/core/Renderer.ts` ve `src/App.tsx` üzerinde 19 mod tam tip güvenliğiyle kaydedildi.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata (19 visualizer modunun tamamında %100 tip güvenliği).
  - `npm run build` → Başarılı (3.73s, Vite client + esbuild Node.js server bundle).

**Etkilenen Dosyalar:** `src/types.ts`, `src/core/Renderer.ts`, `src/visualizers/CodropsPolarVisualizer.ts`, `src/visualizers/CodropsWaveVisualizer.ts`, `src/visualizers/CodropsBarsVisualizer.ts`, `src/visualizers/CavaSpectrumVisualizer.ts`, `src/visualizers/LissajousOrbitVisualizer.ts`, `src/App.tsx`, `MEMORY.md`, `FEATURES.md`

### [2026-08-08 - Oturum 4] - 3 Yeni Profesyonel Visualizer & Tam Denetim Sistemi

**Çalışan Ajan Pipeline:** Product Manager → Lead Developer → UI/UX Critic & DSP Engineer → Implementation → QA Tester → Documentation

- **3 Yeni Yüksek Kalite Visualizer Modu Eklendi**:
  - `NEON_TUNNEL`: 3D siberpunk tel çerçeve tünel, dinamik derinlik perspektifi, oktagonal poligonal halkalar ve sese duyarlı derinlik ivmelenmesi (`src/visualizers/NeonTunnelVisualizer.ts`).
  - `QUANTUM_FIELD`: Yüksek yoğunluklu kozmik parçacık nebulası ve konstelasyon vektör alanı; sub-bass vurularında merkez merkezcil çekim kuvveti (`src/visualizers/QuantumFieldVisualizer.ts`).
  - `AUDIO_FLUID`: Çok bantlı akıcı sinüsoidal dalga şeritleri, sıvı renk gradyanları ve spektrum tepe noktası göstergeleri (`src/visualizers/AudioFluidVisualizer.ts`).
- **Görselleştirici Tam Denetim & İnce Ayar Paneli Eklendi**:
  - `types.ts` & `EffectsStudio.tsx` üzerinde 6 adet hassas canlı kontrol sürgüsü: **Animasyon Hızı (`visSpeed`)**, **Geometri Ölçeği (`visScale`)**, **Yoğunluk (`visDensity`)**, **Rotasyon Hızı (`visRotation`)**, **Visualizer Glow (`visGlow`)**, **Ritim Duyarlılığı (`visBeatSensitivity`)**.
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata (14 visualizer modunun tamamında %100 tip güvenliği).
  - `npm run build` → Başarılı (3.7s, Vite client + esbuild Node.js server bundle).

**Etkilenen Dosyalar:** `src/types.ts`, `src/core/Renderer.ts`, `src/visualizers/NeonTunnelVisualizer.ts`, `src/visualizers/QuantumFieldVisualizer.ts`, `src/visualizers/AudioFluidVisualizer.ts`, `src/components/EffectsStudio.tsx`, `src/App.tsx`, `MEMORY.md`, `FEATURES.md`

### [2026-08-08 - Oturum 3] - Multi-Agent Code Audit & Verification

**Çalışan Ajan Pipeline:** Code Auditor → Lead Developer → Implementation → QA Tester → Security Review → Documentation

- **Düzeltilen Sorunlar / Güvenlik ve Bellek İyileştirmeleri**:
  - `src/App.tsx`: Ses kaldırıldığında (`removeAudio`) bağlı olan `AudioContext` nesnesi kapatılarak ve `MasteringEngine` referansları sıfırlanarak bellek sızıntısı engellendi (**ERR-06 / Düşük Risk**).
  - `src/components/VisualizerCanvas.tsx`: Kayıt durdurulduğunda Web Worker blob URL'i `URL.revokeObjectURL(workerUrlRef.current)` ile serbest bırakıldı (**ERR-07 / Düşük Risk**).
  - `server.ts`: `/api/render/start` endpoint'ine `audioRemoteUrl` için regex bazlı URL şema doğrulaması (`^https?://`) eklendi (**SEC-01 / Orta Risk**).
- **Tip & Derleme Doğrulaması**:
  - `npx tsc --noEmit` → 0 hata.
  - `npm run build` → Başarılı (Vite UI bundle + esbuild Node.js server bundle).

**Etkilenen Dosyalar:** `src/App.tsx`, `src/components/VisualizerCanvas.tsx`, `server.ts`, `MEMORY.md`
- **Uzman AI Ajan Sistemi Kuruldu**:
  - `.agents/ROLES.md`: 9 farklı uzman ajan rolü (Lead Dev, Code Auditor, QA Tester, UI/UX Critic, Audio DSP Engineer, Documentation, Performance, Security, Product Manager) tanımlandı.
  - `.agents/AGENTS.md`: Çoklu ajan direktifleri, pipeline akışları ve Kritik Üçlü (Lead Dev + Code Auditor + QA Tester) yaklaşımı entegre edildi.
- **Visualizer & Renderer Tip Güvenliği**:
  - `src/core/Renderer.ts` içinde `settings.jitter` ve `settings.displacement` opsiyonel alanlarına `?? 0` koruması eklendi (`NaN` kaynaklı Canvas koordinat sistemi bozulması engellendi).
  - `PhonkWave`, `Chaos`, `Esoteric`, `Ether`, `KineticTypo`, `Monolith`, `NoirGrid` görselleştiricilerine `audio.bassEnergy`, `audio.highEnergy`, `audio.midEnergy` alanları için `?? 0` eklendi.
- **Sunucu & Chunk Yükleyici Güvenliği**:
  - `server.ts` içerisindeki parçalı yükleme (chunk upload) endpoint'lerinde `uploadId` temizlemesi sıkılaştırıldı.
  - Parçaların senkronize birleştirilmesi için `fs.appendFileSync` yapısına geçildi (asenkron race condition çözüldü).
  - Canvas RGBA karelerinin Buffer dönüşümü `Buffer.from(imgData.data.buffer, imgData.data.byteOffset, imgData.data.byteLength)` şeklinde kesin offset ile korundu.
- **11 Adet Kapsamlı Dokümantasyon Dosyası Oluşturuldu**:
  - `README.md`, `WALKTHROUGH.md`, `FEATURES.md`, `DESIGN.md`, `ARCHITECTURE.md`, `DSP_ENGINE.md`, `API_REFERENCE.md`, `CHANGELOG.md`, `TESTING.md`, `KNOWN_ISSUES.md`, `SECURITY.md`.

---

## ⚠️ 3. Bilinen Hatalar & Karşılaşılan Sorunlar (Errors & Gotchas Register)

| ID | Sorun / Hata | Sebep | Düzeltme / Geçici Çözüm | Durum |
| :--- | :--- | :--- | :--- | :---: |
| **ERR-01** | Canvas `ctx.translate(NaN, NaN)` çökmesi | `settings.jitter` undefined olduğunda `NaN` üretmesi | `Renderer.ts` içine `settings.jitter ?? 0` eklendi. | 🟢 Çözüldü |
| **ERR-02** | Express 413 Payload Too Large | Büyük ses/görsel verilerinin tek JSON gövdesinde gönderilmesi | `/api/render/upload-chunk` 10MB parçalı yükleyici eklendi. | 🟢 Çözüldü |
| **ERR-03** | Chunk Assembly Bozuk Okuma | `writeStream.end()` hemen ardından dosya okuması | `fs.appendFileSync` senkron yazımına geçildi. | 🟢 Çözüldü |
| **ERR-04** | FFmpeg Sunucuda Yüklü Değilse Render Hatası | FFmpeg binary dosyasının sistem PATH'inde bulunmaması | İstemci tarafında `Client Engine` (MediaRecorder) desteği sağlandı. | 🟡 Bilinen Kısıtlama |

---

## 📋 4. Eksikler & Gelecek Görevler (Backlog & Missing Features)

- [ ] **WebGPU Shader Desteği**: Canvas 2D yerine karmaşık 3D parçacık şaderları eklenmesi.
- [ ] **Altyazı İhraç Desteği**: Senkronize liriklerin `.srt` veya `.vtt` olarak indirilmesi.
- [ ] **Çoklu Dil (i18n) Desteği**: Arayüzün İngilizce / Türkçe dil anahtarıyla dinamikleşmesi.
- [ ] **Render Kuyruğu Yönetimi**: Birden fazla eşzamanlı render isteği için Redis/BullMQ benzeri kuyruk mimarisi.

---

## 🤖 5. Yapay Zeka Ajanları İçin Çalışma Talimatı (Rules for AI Agents)

Herhangi bir yapay zeka ajanı bu proje üzerinde çalışırken:
1. **İşe Başlarken**: İlk olarak `MEMORY.md` dosyasını oku ve projenin en son durumunu anla.
2. **Değişiklik Yaparken**: Kod tabanına eklenen yeni özellikler, düzeltilen hatalar veya karşılaşılan sorunları **İlerleme Logu** ve **Bilinen Hatalar** bölümlerine ekle.
3. **Görev Bittiğinde**: `MEMORY.md` belgesindeki tarih, derleme durumu ve tamamlanan görevleri güncelle.
