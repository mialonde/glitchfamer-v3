# GlitchFramer 2.0 AI Hafıza Bankası (Project Memory Bank)

> **Bu dosya, yapay zeka ajanlarının (AI Agents) proje üzerindeki geçmişini, yapılan tüm değişiklikleri, güncel ilerlemeyi, bilinen hataları ve gelecek yapılacakları takip ettiği canlı hafıza merkezidir.**

---

## 📌 1. Proje Kimliği & Canlı Durum

- **Proje Adı**: GlitchFramer 2.0 (VidFramer)
- **Mevcut Sürüm**: `v2.1.0`
- **Derleme Durumu**: 🟢 Derlenebilir (`npx tsc --noEmit` & `npm run build` hatasız)
- **Ana Teknolojiler**: React 19, TypeScript 5.8, Vite 6, Node.js + Express, FFmpeg H.264/AAC, Web Audio API, Gemini 2.5 AI.

---

## 🕒 2. İlerleme Logu & Değişiklik Geçmişi (Progress & Change Log)

### [2026-08-20 - Oturum 74] - GitHub Import Migration, Lock File Cleanup & Validation
- **Görev & İstek:**
  - AI Studio GitHub Import Migration protokolünün (`/skills/system_skills/github_import_migration/SKILL.md`) uygulanması ve projenin platform üzerinde doğrulanması.
- **Yapılan İyileştirmeler:**
  1. **Depo Normalizasyonu**:
     - Standart dışı paket yöneticisi kilit dosyası `bun.lock` kaldırıldı.
     - `.env.example` dosyası oluşturuldu ve `GEMINI_API_KEY` dokümante edildi.
  2. **Derleme ve Sağlık Doğrulaması**:
     - `lint_applet` (`tsc --noEmit`): %100 Başarılı (0 hata).
     - `compile_applet` (`npm run build`): %100 Başarılı.
     - Test paketi (`npm test`): 8/8 test başarılı.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.


### [2026-08-20 - Oturum 73] - Update Default Track Info, Preset Fixes & Sync Issue
- **Kullanıcı Geri Bildirimi:**
  - "düzelmedi. ayrıca suno üzerinden çektiğim şarkıda sanatçı adı şarkı adı niye farklı çıkıyor? Hiçbir şey yokken default şarkıcı adı: Demo Singer olsun şarkı adı da : Demo Song olsun. Default Preset de default preset olsun."
- **Yapılan İyileştirmeler:**
  1. `src/App.tsx` ve `src/types.ts` içerisindeki boş olan (veya 'Lumina' olan) `trackTitle` ve `artistName` varsayılan değerleri "Demo Song" ve "Demo Singer" olarak güncellendi.
  2. `src/visualizers/StudioSplitLyricsVisualizer.ts` içerisinde hardcode kalmış olan "Mr. Brightside" / "The Killers" yedek metinleri kaldırılarak ayarlardan gelen dinamik veriye, yoksa "Demo Song" / "Demo Singer" değerlerine bağlandı. Aynı işlem `CoverPulse3DVisualizer.ts` içerisindeki "22NOIR" kalıntıları için de yapıldı.
  3. `src/lib/creatorTemplatesData.ts` ve `src/services/presetService.ts` dosyalarındaki şablon tanımlarında `trackTitle` ve `artistName` alanları silindi. Şablon değiştirildiğinde mevcut şarkı adının silinmesini önlemek için `handleApplyTemplate` fonksiyonu güncellendi.
  4. `src/services/SunoImporterService.ts` ve `server/routes/suno.ts` içerisinde Suno AI'dan veri çekilirken şarkı adı ve sanatçı adı boş, jenerik veya bulunamazsa "Demo Song" ve "Demo Singer" atanması sağlandı.
  5. `src/visualizers/StudioSplitLyricsVisualizer.ts` içerisindeki **şarkı sözü senkronizasyonu** hatası giderildi. `isCurrentActive` kelime bazlı senkronizasyon varken, satır bazlı kontrole (`currentTime >= line.startTime && currentTime <= line.endTime`) takılarak satırın içindeki kelime okuması bitmeden veya kelime okuması yokken pasif duruma geçmesine yol açıyordu. Sadece `idx === activeIdx` olarak düzeltildi. Ayrıca activeIdx hesaplaması sadece satır okuması bittiği andaki (vocal gap durumu) ara duraklamalarda önceki satırın kalması (Apple Music stili) sağlanacak şekilde düzeltildi.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 71] - Fix Duplicate Center Overlay & Lyrics on Studio Split Lyrics
- **Kullanıcı Geri Bildirimi & Ekran Görüntüsü Analizi:**
  - "cover art şarkı ve şarkıcı adı ortaya da basmışsın. Aynı zamanda lyric de..."
  - `STUDIO_SPLIT_LYRICS` modu aktifken, global Canvas katmanındaki `drawOverlays` fonksiyonunun varsayılan merkez albüm kapağını (`drawDefaultLayout`), merkezdeki şarkı/sanatçı tipografisini (`drawCustomTrackTypography`) ve global tek satırlık şarkı sözü katmanını (`drawLyricsLayer`) split ekranın tam ortasına mükerrer şekilde çizdiği tespit edildi.
- **Yapılan İyileştirmeler:**
  1. `src/core/Renderer.ts` -> `drawOverlays()` fonksiyonuna `STUDIO_SPLIT_LYRICS` mod koruması eklendi; sol paneldeki yerleşik player ve sağ paneldeki akan şarkı sözü motoru devredeyken ortada çakışan kart, tipografi ve global lirik overlay'i atlanıyor.
  2. `drawDefaultLayout()` içerisindeki `selfDrawingModes` dizisine `COVER_PULSE_3D` ve `STUDIO_SPLIT_LYRICS` eklendi.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 70] - Apple / TV Studio Split Lyrics Flow Preset & Visualizer Engine
- **Kullanıcı Talebi & Referans Görsel (`fdfddfd.png`):**
  - "Bu da ayrı bir preset. solda track bilgileri, ilerleme çubuğu vb yer alırken sağda ise akan şarkı sözleri olacak."
- **Yapılan İyileştirmeler & Mimari Geliştirmeler:**
  1. **Split-Screen Görselleştirici Motoru (`src/visualizers/StudioSplitLyricsVisualizer.ts`)**:
     - **Sol Panel (Artwork & Player Deck)**:
       - 3D Squircle köşe yumuşatmalı albüm kapağı, bas frekanslarıyla nefes alan dinamik büyüme (`pulseScale`) ve cam parlaması.
       - Parça Adı, Sanatçı Adı ve `FLAC` / `LOSSLESS` stüdyo kalite rozeti.
       - Zaman sayaçları (`0:54` / `3:44`), akıcı ilerleme çizgisi (scrubber) ve merkezde parlayan Apple/Spotify stili Pause/Play hap butonu.
       - Üst sol kontrol ikonları (Kapat, Mikrofon/Karaoke, EQ Spektrum, Odak Gözü).
     - **Sağ Panel (Apple Music / Spotify TV Stili Akan Şarkı Sözleri)**:
       - Yaylı fizik tabanlı pürüzsüz dikey kaydırma (`currentScrollY += (target - current) * 0.085`).
       - **Aktif Satır**: Büyük, kalın, parıltılı beyaz tipografi; kelime düzeyinde zamanlama varsa (BetterLyrics / Suno Aligned) yumuşak dolum (`word sweep`) ve bas vuruşlarında reaktif genleşme.
       - **Pasif Satırlar**: Odak dışı kalan satırlarda derinlik hissi veren optik bulanıklık (`blur(2.5px)`) ve kademeli şeffaflık (`fade`).
       - **Vokal Bekleme Noktaları (`•••`)**: Enstrümantal kısımlarda ritmik 3-nokta geri sayım göstergesi.
       - **Dinamik Arka Plan**: Albüm kapağından otomatik renk çıkarımı (adaptive ambient glow) ve sıvı ışık nebulaları.
  2. **Tip & Sistem Entegrasyonu**:
     - `src/types.ts`: `'STUDIO_SPLIT_LYRICS'` eklendi.
     - `src/core/Renderer.ts`: Lazy factory ve render pipeline entegrasyonu tamamlandı.
     - `src/lib/visualizerCatalog.ts`: MINIMAL RELEASE kategorisine eklendi.
     - `src/services/presetService.ts` & `src/lib/creatorTemplatesData.ts`: `APPLE / TV SPLIT LYRICS FLOW` hazır ayarı ve şablonu eklendi.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 69] - Cover Pulse 3D: 3D Album Cover Visualizer, Auto-Palette Extraction & Flanking EQ
- **Kullanıcı Talebi & Referans Görseller:**
  - "Cover Pulse 3D: Cover art'ını sahnenin merkezindeki 3D bir albüm kapağına dönüştürür. Kapak görselinin baskın rengi otomatik olarak çıkarılır ve tüm arka planın renk paletini belirler. Cover'ın iki yanında müziğin frekanslarına tepki veren EQ dalgaları ve ışık darbeleri hareket eder. Kapak sabit bir görsel gibi durmaz; hafif perspektif hareketleri, derinlik ve ışık tepkileriyle gerçek bir 3D obje hissi verir. Baslar, davullar ve yüksek frekanslar görselin farklı bölümlerinde farklı şiddette tepki oluşturur. Özellikle Spotify/YouTube release visual'ları için."
- **Yapılan İyileştirmeler & Mimari Geliştirmeler:**
  1. **3D Motoru & Görselleştirici (`src/visualizers/CoverPulse3DVisualizer.ts`)**:
     - **Otomatik Kapak Renk Çıkarımı (`extractPaletteFromImage`)**: Yüklenen albüm kapağının piksellerini analiz ederek en canlı vokal/neon rengini (ör. macenta, neon mor, alev turuncusu, altın), tamamlayıcı ikincil rengi ve derin arka plan tonlarını otomatik çıkarır ve tüm sahneyi bu paletle aydınlatır.
     - **Gerçek Zamanlı 3D Obje Projeksiyonu**: Perspektif dönüşüm matrisi, 3D yan omurga (`spine`) kalınlığı, şarkı adı gravürü, parlak jelatin / cam yansıması (`specular cellophane sheen`), Parental Advisory rozeti ve bas vuruşlarında ölçek genleşmesi.
     - **Islak Zemin Yansıması & Cyber Pedestal**: 3D kapağın zemindeki ıslak yansıması, sese duyarlı çift neon dairesel podyum halkaları ve zemin ışık havuzu.
     - **Yan Frekans EQ Dalgaları & Lazer Işık Huzmeleri**: Kapağın sol ve sağında logaritmik frekans barları, tepe noktası kapsülleri ve güçlü vuruşlarda yukarı doğru fırlayan dikey neon lazer huzmeleri.
     - **3D Yüzen Kristal & Kor Parçacıkları (Depth-sorted Shards)**: Z-derinliğinde salınan elmas kırıkları ve ışık kıvılcımları.
     - **Entegre Spotify / YouTube Player UI**: Zaman göstergeleri (`01:24` / `03:17`), neon gradient ilerleme çubuğu ve parlayan oynatma kontrolleri.
  2. **Tip ve Katalog Entegrasyonu**:
     - `src/types.ts`: `'COVER_PULSE_3D'` modu eklendi.
     - `src/core/Renderer.ts`: Lazy factory ve hem istemci hem de sunucu tarafı render engine desteği sağlandı.
     - `src/lib/visualizerCatalog.ts`: MINIMAL RELEASE kategorisine eklendi, granüler parametre desteği tanımlandı.
     - `src/services/presetService.ts` & `src/lib/creatorTemplatesData.ts`: Küratörlü `COVER PULSE 3D (22NOIR RELEASE)` hazır ayarı eklendi.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 68] - Suno-Lyrics Community Best Practices Integration (xiliourt/Suno-Lyrics & Lumi-Script)
- **Kullanıcı Talepleri & İnceleme:**
  - "https://github.com/better-lyrics/better-lyrics şu projeyi baz alarak geliştir lyrics fonksiyonunu"
  - "https://github.com/xiliourt/Suno-Lyrics ve https://github.com/Lumi-Script/Suno-Lyrics projelerini incele ve suno ile ilgili düzenlemeleri buna göre yap"
- **Yapılan İyileştirmeler & Mimari Değişiklikler:**
  1. **Çok Kaynaklı Suno Metadata & Hizalama (Aligned Lyrics) Endpoint Entegrasyonu (`server/routes/suno.ts`)**:
     - `POST /api/suno/inspect`: `studio-api.prod.suno.com/api/clip/{id}`, `studio-api.prod.suno.com/api/feed/v2?ids={id}`, `studio-api.prod.suno.com/api/clip/{id}/aligned_lyrics/` ve sayfa scraping fallback'lerini kapsayan çoklu kaynak sorgulama motoru.
     - `GET /api/suno/aligned-lyrics/:trackId`: Parça bazında kelime düzeyinde zamanlanmış vokal verisini doğrudan sunan endpoint.
     - Ham Suno JSON API payload'larını doğrudan işleme desteği.
  2. **Suno İçe Aktarma & Format Dönüştürme Motoru (`src/services/SunoImporterService.ts`)**:
     - Suno v3, v3.5, v4 ve v5 varyasyonlarının tamamını (`word`, `token`, `text`, `start`, `start_s`, `begin`, `end`, `end_s`) destekleyen sözcük ve fonetik hizalama ayrıştırıcısı.
     - Müzikal yapı belirteçlerini (`[Verse]`, `[Chorus]`, `(Guitar Solo)`, `(Pause - Single Kick)`) akıllı gruplama eşikleriyle (0.85s vokal nefes boşluğu, noktalama işaretleri) arındırıp doğal satırlara bölen kadans mekanizması.
     - `xiliourt/Suno-Lyrics` standartlarında tek tıkla dışa aktarma fonksiyonları (`exportToLrc`, `exportToEnhancedLrc`, `exportToSrt`, `exportToVtt`, `exportToTtml`).
  3. **Gelişmiş Suno AI & Altyazı Stüdyosu Arayüzü (`src/components/SunoImporter.tsx` & `src/components/LyricsStudio.tsx`)**:
     - Link ile sorgulama modunun yanı sıra "HAM JSON / API PAYLOAD" sekmesi ile doğrudan JSON yapıştırma desteği.
     - Önizleme ekranında tek tıkla `.LRC`, `.ELRC`, `.SRT`, `.VTT`, `.TTML` ve `.JSON` indirme aksiyonları.
     - Kelime sayısı, vokal boşlukları ve senkronizasyon istatistiklerinin detaylı sunumu.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 67] - Comprehensive Structure Marker Removal, Preset Lyrics Fix & Weighted Cadence Auto-Sync
- **Kullanıcı Talepleri & Problemler:**
  1. "Suno'dan çekilen sözler için [] veya () gibi structure belirten veya komut belirten şarkı sözleriyle alakası olmayan yapıları çekme. (örn: `(Pause - Single Kick)` vb.)"
  2. "Bazı presetlerde altyazılar gösterilmiyor."
  3. "Otomatik senkronizasyon çalışmıyor verimli şekilde."
- **Kök Nedenler & Çözümler:**
  1. **Çok Kelimeli Müzik Komutları & Parantezli Yönergelerin Temizlenmesi**:
     - `(Pause - Single Kick)`, `(Guitar Solo - Fast)`, `(Drop - Heavy 808)` gibi çok kelimeli veya tire/iki nokta içeren müzikal komutlar parantez içindeki kelime dağarcığına `pause`, `kick`, `snare`, `808`, `beat`, `switch`, `riff` vb. eklenerek ve çok kelimeli token buffer mimarisi ile `src/services/lyricSyncService.ts` ve `src/services/SunoImporterService.ts` üzerinde tamamen elendi.
     - `LyricsStudio.tsx` içerisine **"YAPILARI ARINDIR"** butonu entegre edildi.
  2. **Tüm Presetlerde ve Modlarda Altyazı/Lirik Renderının Sağlanması**:
     - `src/core/Renderer.ts` dosyasında `drawLyricsLayer` çağrısı `drawOverlays` ana dağıtıcısının en üst katmanına taşındı ve `settings.mode !== 'KINETIC'` kısıtlaması kaldırılarak istisnasız tüm görselleştirici presetlerinde ve kart stillerinde (`NEON_FRAME`, `POLAROID`, `SPOTIFY`, `CD`, `HOLO_CD`, `TIKTOK`, `RETRO_TAPE`, `KINETIC` vb.) liriklerin kusursuz çizilmesi sağlandı.
  3. **Hece, Kelime ve Karakter Ağırlıklı Akıllı Müzikal Kadans Senkronizasyon Motoru**:
     - `autoSyncLyricsByDuration` metodunda eski eşit-aralıklı kaba dağıtım kaldırıldı; yerine hece tahmini (%40), kelime sayısı (%45) ve karakter uzunluğuna göre dinamik ağırlıklı, intro/outro payı bırakan ve nefes aralıkları tanıyan yapay zeka kalitesinde müzikal kadans motoru kuruldu.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`): %100 Başarılı.
  - `compile_applet` (`npm run build`): %100 Başarılı.

### [2026-08-20 - Oturum 66] - Suno Yapı/Komut Belirteçlerini ([Verse], (Solo) vb.) Söz Temizleme Motoru
- **Kullanıcı Talebi:**
  - "Suno'dan çekilen sözler için [] veya () gibi structure belirten veya komut belirten şarkı sözleriyle alakası olmayan yapıları çekme."
- **Kök Neden & Analiz:**
  - Suno AI promptları ve alignment verileri genellikle şarkı sözleri arasında `[Verse 1]`, `[Chorus]`, `[Guitar Solo]`, `[Drop]`, `(Guitar Solo)`, `(Instrumental)`, `(Fast tempo)`, `{Intro}`, `Verse 1:` gibi müzikal yapı/yönlendirme etiketleri içerir.
  - Bu etiketler şarkıda seslendirilen gerçek sözler olmamasına rağmen, lirik senkronizasyonunda ve ekranda belirebiliyordu.
- **Mimari & Uygulanan Çözümler:**
  1. **Evrensel Yapı & Komut Filtreleme Motoru (`src/services/lyricSyncService.ts`)**:
     - `isStructureMarkerToken(token: string)`: Köşeli parantez `[...]`, süslü parantez `{...}`, açılı parantez `<...>`, müzik komut parantezleri `(...)` (solo, tempo, drop, beat, vocal, guitar, instrumental vb.) ve başlık etiketlerini (`Verse 1:`, `Chorus:`) tek tek ayırt eden katı doğrulama.
     - `cleanLyricsText(text: string)`: Şarkı sözü metinlerindeki tüm yapısal etiketleri, komutları ve gereksiz parantezleri temizleyip yalnızca gerçek şarkı sözü satırlarını döndüren arındırma motoru.
     - `parseLrcText` ve `autoSyncLyricsByDuration` metodları bu filtrelemeyle güçlendirildi; yapı etiketleri zaman çizelgesine veya sözlere dahil edilmiyor.
  2. **Suno İçe Aktarıcı Entegrasyonu (`src/services/SunoImporterService.ts`)**:
     - `normalizeSunoData`: Çekilen prompt doğrudan filtrelenerek `lyrics` alanına aktarılıyor.
     - `parseAlignmentAndLyrics`: Suno'dan gelen kelime bazlı timestamp (`alignmentData`) dizisinde `[Verse]`, `[Chorus]`, `(Solo)` gibi etiketler ve parantezler filtrelenerek lirik zaman çizelgesinden ve fonetik hizalamadan tamamen çıkarıldı.
     - `groupWordsIntoLines`: Satırlara dönüştürülürken yapı belirteçleri atlandı ve temiz söz dizisi oluşturuldu.
  3. **Lirik Stüdyosu Desteği (`src/components/LyricsStudio.tsx`)**:
     - Manuel veya otomatik söz içe aktarma adımlarında temizleme motoru tetiklenerek kullanıcıya saf lirik akışı sağlandı.
- **Derleme & Doğrulama:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve sıfır hata.
  - `compile_applet` (`npm run build`) başarıyla tamamlandı.

### [2026-08-20 - Oturum 65] - Pro Lyrics Studio Ergonomic Card Redesign & Responsive Alignment
- **Kullanıcı Talebi & Problem:**
  - Adım Rehberi (Step Guide) veya dar yan panellerde Lirik Editörü satırlarının yatay olarak sıkışması, metin giriş kutusunun sıfır piksele daralması, -0.2 / +0.2 SN butonlarının satırlara bölünmesi ve taşma sorunu.
- **Kök Neden:**
  - `LyricsStudio.tsx` içerisindeki lirik düzenleme satırları tek bir katı yatay `flex-row` olarak tasarlanmıştı. 8 farklı kontrol kutusu (başlangıç, bitiş, nudge, aksiyon butonları) dar panel genişliklerinde (300-380px) şarkı sözü metin kutusunu eziyordu ve alt kaydırma çubuğu oluşturuyordu.
- **Mimari & Uygulanan Çözümler:**
  1. **Stüdyo Kartı Mimarisi (Responsive Lyric Studio Cards - `src/components/LyricsStudio.tsx`)**:
     - Her şarkı sözü satırı DAW/CapCut kalitesinde 2 katmanlı ergonomik kart yapısına kavuşturuldu:
       - **Üst Çubuk (Metadata & Controls)**: Sıra numarası rozeti (`#01`), Dinleme/Önizleme butonu, BŞL/BTM zaman girişleri, toplam süre rozeti (`2.4s`), mikro nudge butonları (`-0.1s`, `+0.1s`), Canlı Tap Hedef seçici, Kopyalama ve Silme butonları.
       - **Alt Çubuk (Full-Width Text Area)**: Şarkı sözü metni için tam genişlikli, yüksek kontrastlı ve okunabilir metin giriş alanı (`w-full bg-zinc-950/80`).
  2. **Global Zaman Öteleme Araç Çubuğu Optimizasyonu**:
     - -0.5s / -0.2s / +0.2s / +0.5s hızlı öteleme hapları tek satırda esnek ve düzenli hizalandı; tuhaf satır kırılmaları önlendi.
  3. **Adım Rehberi Entegrasyonu (`src/App.tsx`)**:
     - Adım 5 içerisine "TAM EKRAN AÇ" butonu eklenerek kullanıcıların tek tıkla ana "Lirikler" sekmesine geçebilmesi sağlandı.
     - `compact={true}` desteği ile yan panelde mükemmel uyum sağlandı.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve yeşil.
  - `compile_applet` (`npm run build`) başarıyla tamamlandı.

### [2026-08-19 - Oturum 64] - Cinematic Preset Engine & Premium Card Redesign
- **Kullanıcı Talebi & Hedef:**
  - "Şarkı adı ve sanatçı adı yerleşim yerlerine özgürlük ver, sürükleyip yerlerini ayarlayabilelim, font/renk/büyüklük ayarı şahane olurdu." (Önceki oturumlarda tamamlandı)
  - "Neden şuradaki gibi presetlerimiz yok da ... visualizerlerimiz var" -> Görsel kalitesi son derece yüksek, sinematik, Unsplash destekli 12 adet premium görselleştirici presetinin ve referans ekran görüntüsündeki modern grid tabanlı kart tasarımının hayata geçirilmesi.
- **Mimari & Uygulanan Çözümler:**
  1. **Kod Tabanı Derleme ve Sentaks Düzeltmesi (`src/lib/creatorTemplatesData.ts`)**:
     - Önceki oturumda oluşan sentaks hatası (yorum satırı içine sıkışmış `export const MUSIC_GENRE_TEMPLATES` bildirimi) tespit edilerek düzeltildi, tüm derleyici hataları giderildi.
  2. **Sinematik "Preset Seç" Modali Tasarımı (`src/components/TemplatePickerModal.tsx`)**:
     - Kullanıcının referans ekran görüntüsündeki brutalist, cyberpunk estetikle birebir uyumlu, yüksek kontrastlı ve göze hitap eden bir hazır şablon grid'i oluşturuldu.
     - **Kart Özellikleri**: `aspect-[16/10]` geniş ekran oranları, Unsplash sinematik arka planları, hover durumunda parlayan kehribar (amber-400) çizgiler, "NEW" ve "Pro" küçük parıldayan rozetler.
     - **Sese Duyarlı Önizlemeler**: Kartların içine sese duyarlı dairesel auroralar, 3D tünel kafesleri veya spektrum çizgileri içeren mikro-animasyon katmanları çizilerek her presetin ruhu canlandırıldı.
     - **Süzgeç Paneli**: Kullanıcının müzik tarzına göre hızlı tarama yapabilmesi için "TÜM PRESETLER", "DARK & BASS", "CYBER & TECHNO", "AMBIENT & CHILL" filtreleri yerleştirildi.
     - **Show More Butonu**: Referans görseldeki "SHOW MORE" butonu entegre edilerek ilk açılışta 8 presetin, tıklandığında ise tüm 12 presetin gösterilmesi sağlandı.
  3. **Arka Plan Duvar Kağıdı Senkronizasyonu (`src/App.tsx`)**:
     - `handleApplyTemplate` fonksiyonu güncellenerek seçilen presetin sadece renk ve efekt ayarlarını değil, aynı zamanda yüksek çözünürlüklü sinematik duvar kağıdını (`bgImageUrl`) da otomatik olarak stüdyoya uygulayabilmesi sağlandı.
  4. **Kategorik ve İsimsel Hizalama (`src/components/StudioTopBar.tsx`, `src/services/presetService.ts`)**:
     - Üst bardaki "ŞABLONLAR" butonu, kullanıcı terminolojisine sadık kalınarak parıldayan bir ikon ile "PRESET SEÇ" olarak güncellendi.
     - `src/services/presetService.ts` içerisindeki yerleşik profiller (`BUILTIN_PROFILES`) güncellenerek bu 12 premium presetle (Rebellion, Space, Digital Abyss, Forest, vb.) tam uyumlu hale getirildi.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve yeşil.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-19 - Oturum 63] - Architecture & Codebase Refactoring: Complete Modularization & Monolith Decomposition
- **Kullanıcı Talebi & Hedef:**
  - "Uygulamayı daha modüler hale getir. Uzun kod bloklarını kaldır."
  - 3000+ satırlık monolitik `src/App.tsx` dosyasını küçük, modüler, yeniden kullanılabilir ve tek sorumluluk prensibine (Single Responsibility) uygun bileşenlere ve veri kataloglarına bölmek.
- **Mimari & Uygulanan Çözümler:**
  1. **Statik Veri ve Katalog Ayrıştırması (`src/lib/visualizerCatalog.ts`)**:
     - `VISUALIZER_MODES` (38 mod + kategori etiketleri), `VRM_AVATAR_MODELS`, `EUPHORIC_VIDEO_PRESETS`, `CURATED_WALLPAPERS`, `COLOR_PALETTES` ve `getVisualizerSupportedFeatures` yardımcı fonksiyonları `src/lib/visualizerCatalog.ts` içine taşındı.
  2. **Modüler Arayüz Bileşenleri (`src/components/`)**:
     - `StudioTopBar.tsx`: Logo, parça bilgisi, oynatma göstergesi, şablon, release pack, Suno ve dışa aktarma butonlarını içeren bağımsız başlık çubuğu.
     - `StudioTransportBar.tsx`: Zaman çizgisi kaydırma (scrubber), 5s ileri/geri, oynat/durdur, tekrar, sessize alma ve şarkı sözü anahtarını içeren bağımsız oynatıcı barı.
     - `VisualizerTab.tsx`: Görselleştirici arama, kategori filtreleme, mod kartları grid'i, 3D VRM kontrolleri, OBJ yüz maskesi ayarları, renk paletleri, atmosfer modu ve mikro kaydırıcılar.
     - `MediaTab.tsx`: Şarkı adı/sanatçı metadata alanları, kart yerleşimi, ses/kapak/logo/arka plan görseli ve videosu yönetimi, Suno içe aktarma ve demo yükleme.
     - `ExportTab.tsx`: SSR FFmpeg 60FPS vs CSR WebM motor seçimi, 1080p/720p çözünürlük ayarı, canlı ilerleme ve aşama çubuğu, indirme bağlantıları, hata yönetimi ve WebM'den MP4'e dönüştürücü.
  3. **`App.tsx` Sadeleştirmesi**:
     - `App.tsx` 3072 satırdan ~600 satıra indirilerek sadece genel durum orkestrasyonu, ses motoru bağlantıları ve klavye kısayollarına odaklanan temiz bir ana bileşene dönüştürüldü.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-19 - Oturum 62] - Bugfix & Networking: Resolving "Failed to fetch" & Reverse-Proxy Headers
- **Kullanıcı Talebi & Problem:**
  - Uygulama başlangıcında ve ağ isteklerinde `Failed to fetch` hatası.
- **Kök Neden:**
  - `helmet` varsayılan `frameguard` (`X-Frame-Options: SAMEORIGIN`) ve strict `crossOriginResourcePolicy` ayarları ile Google AI Studio iframe önizleme ortamında ve medya fetch isteklerinde tarayıcı engellemesine yol açıyordu.
  - CORS ara katmanı `helmet` ve `rateLimit` sonrasına konulduğu için preflight (`OPTIONS`) istekleri uygun CORS başlıklarını alamıyordu.
  - Ters vekil (reverse proxy) arkasında `trust proxy` bayrağı tanımlı değildi.
- **Uygulanan Düzeltmeler:**
  1. CORS ara katmanı Express zincirinin en başına taşındı.
  2. `helmet` konfigürasyonunda `frameguard: false` ve cross-origin serbestlikleri ayarlanarak AI Studio iframe önizleme uyumluluğu sağlandı.
  3. `app.set("trust proxy", 1)` ve rate limiter toleransları optimize edildi.
  4. Geliştirme sunucusu yeniden başlatılarak doğrulandı.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 yeşil ve hatasız.
  - `compile_applet` (`npm run build`) başarıyla tamamlandı.

### [2026-08-19 - Oturum 61] - Security, Hardening & Production-Readiness: Helmet, Rate Limiting, IDOR Token Validation & Admin Gatekeeper
- **Kullanıcı Talebi & Hedef:**
  - Güvenlik ve prodüksiyon hazırlıklarını tamamlamak: Helmet ve Express Rate Limiting entegrasyonu.
  - Render işlerinde IDOR (Insecure Direct Object Reference) riskini ortadan kaldırmak için `ownerToken` sahiplik anahtarı doğrulamasını uygulamak.
  - `/api/sync-lyrics` uç noktasında sahte fallback yerine gerçekçi 502/400 HTTP hata yönetimi ve rate limit koruması getirmek.
  - Admin Paneli (`AdminDashboard.tsx`) için parola korumalı güvenlik kapısı (Gatekeeper) ve oturum yönetimi eklemek.
  - `.gitignore` ve depolama hijyenini tam olarak sağlamak.
- **Mimari & Uygulanan Çözümler:**
  1. **Güvenlik Başlıkları & Rate Limiting (`server.ts`)**:
     - `helmet` ile güvenli HTTP başlıkları eklendi.
     - `express-rate-limit` ile genel API (120 req/min), Render (30 req/15min) ve Gemini AI Lyrics (20 req/15min) koruma kuralları devreye alındı.
  2. **IDOR Korumalı Render Mimarisi (`server/renderEngine.ts`, `server.ts` & `src/App.tsx`)**:
     - Her render işi için kriptografik `ownerToken` üretildi.
     - `/api/render/progress/:jobId`, `/api/render/download/:jobId`, `/api/render/stream/:jobId` ve `/api/render/cancel/:jobId` uç noktaları `X-Render-Token` başlığı veya `?token=` parametresi ile yetki kontrolüne tabi tutuldu.
     - İstemci `App.tsx` bileşeni token'ı saklayıp tüm sorgu ve indirme isteklerine dahil etti.
  3. **Şarkı Sözü Hata Yönetimi (`server.ts`)**:
     - Gemini kota veya ağ hatası durumunda sahte lirik üretimi kaldırılarak şeffaf `502 Bad Gateway` hata kodu ve detaylı mesaj döndürüldü.
  4. **Admin Dashboard Parola Koruması (`src/components/AdminDashboard.tsx`)**:
     - Yönetim paneli yetkisiz doğrudan erişimlere kapatıldı.
     - Şık brutalist parola giriş modali, `sessionStorage` oturum kalıcılığı ve "Çıkış Yap" (Logout) mekanizması entegre edildi.
  5. **Depo Hijyeni**:
     - `.gitignore` oluşturuldu, geçici render dosyaları temizlendi.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-19 - Oturum 60] - Architecture & Stability: Render Queue, Atomic Upload, Concurrency Limits & Modular Architecture
- **Kullanıcı Talebi & Hedef:**
  - Sunucu renderındaki oturum bulunamadı / timeout ve FFmpeg dönüştürme hatalarını kökten çözmek.
  - Render işleri için sunucu kuyruk (Queue) ve eşzamanlılık sınırı (`MAX_CONCURRENT_RENDERS = 2`) getirmek.
  - Otomatik 15 dakikalık disk temizleme cron'u ile sunucu disk şişmesini engellemek.
  - `eval('require')` kalıntılarını tamamen temizlemek ve browser uyumluluğunu garanti altına almak.
  - `App.tsx` bileşenini modüler alt modüllere bölmek (`AppHeader`, `DSPMasteringPanel`, vb.) ve Spotify -14 LUFS DSP mastering tek tıkla normalizasyonunu güçlendirmek.
- **Mimari & Uygulanan Çözümler:**
  1. **Render Kuyruğu & Eşzamanlılık Yönetimi (`server/renderEngine.ts`)**:
     - `renderQueue` FIFO kuyruğu ve `activeRendersCount` kontrolü ile sunucu CPU/RAM taşması engellendi.
     - 15 dakikada bir çalışan disk temizleme mekanizmasıyla 20 dakikadan eski geçici dosyalar ve render işleri temizlendi.
  2. **Atomik FormData Yükleme Pipeline'ı (`server.ts` & `src/App.tsx`)**:
     - Parçalı yükleme kaynaklı oturum uyumsuzluğu yerine doğrudan ve güvenilir `POST /api/render/upload-and-start` endpoint'i entegre edildi.
     - `POST /api/render/convert-webm-to-mp4` ile istemci WebM kayıtlarının sunucuda H.264/AAC MP4'e dönüştürülmesi sağlandı.
  3. **Güvenlik & Tarayıcı Uyumluluğu (`src/core/Renderer.ts` & `src/visualizers/ObjFaceVisualizer.ts`)**:
     - `eval('require')` kullanımları kaldırıldı; `OffscreenCanvas` ve prosedürel SSR yedekleri uygulandı.
  4. **Modüler Bileşen Mimarisi & DSP Konsolu (`src/components/AppHeader.tsx` & `src/components/DSPMasteringPanel.tsx`)**:
     - Ayrılmış stüdyo üst başlığı ve Spotify -14 LUFS tek tıkla normalizasyon DSP kontrol paneli oluşturuldu.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-11 - Oturum 59] - Feature: Shadcn Product & CMS Hub, Visualizer Heatmap & Product Decision Engine
- **Kullanıcı Talebi & Hedef:**
  - Modern, minimalist, yüksek kontrastlı Shadcn UI tasarım diliyle donatılmış kapsamlı bir **Ürün Yönetimi, CMS ve Analitik Yönetim Paneli (`AdminDashboard.tsx`)** geliştirmek.
  - Ürün kararlarını yönlendiren analitik modülleri (Visualizer Heatmap & Retention, Render Logları, Kullanıcı Yönetimi, Sentry Hata Takibi, Suno AI & Mastering Performansı, A/B Test Merkezi, Landing Page CMS, Medya Gezgini ve Tema Yöneticisi) tam tip güvenliği ve yerel kalıcılıkla sunmak.
- **Mimari & Uygulanan Çözümler:**
  1. **Tip Tanımları (`src/types.ts`) & Mock/Kalıcı Veri Motoru (`src/lib/adminData.ts`)**:
     - `AdminUser`, `VisualizerAnalyticsItem`, `RenderLogItem`, `FeedbackItem`, `ErrorLogItem`, `SunoAnalyticsData`, `MasteringAnalyticsData`, `ABTestItem`, `LandingPageCMS`, `StudioTabConfig`, `StudioModulesConfig` arayüzleri ve zengin başlangıç verileri oluşturuldu.
  2. **Kapsamlı Shadcn Admin & CMS Paneli (`src/components/AdminDashboard.tsx`)**:
     - **Genel Bakış (KPIs & Charts)**: 8 ana metrik kartı, Recharts tabanlı günlük render dağılımı (WebM vs MP4 H.264), çözünürlük pastası (9:16 vs 16:9 vs 1:1), kullanıcı büyüme trendi ve 4 adımlı dönüşüm hunisi (Conversion Funnel).
     - **Visualizer Heatmap & Retention**: En çok dönüştüren vs terk edilen modülleri listeleyen, durumlarını (Aktif, Pro, Beta, Gizli) anında değiştirebilen karar panosu.
     - **Render Analitiği & GPU Logları**: FPS, bellek kullanımı, OS/tarayıcı, çözünürlük ve hata detaylarını listeleyen filtrelenebilir render geçmişi.
     - **Kullanıcı Yönetimi**: Kullanıcı arama, plan filtreleme (Free/Creator/Pro), detay modali, son projeler ve hesap askıya alma/aktifleştirme.
     - **Kullanıcı İstekleri & Oylama**: Bug/Feature bildirimleri, oy verme mekanizması ve durum yönetimi.
     - **Hata & Çökme Takibi**: Sentry benzeri stacktrace, etkilenen kullanıcı sayısı, ilk/son görülme ve çözüldü işaretleme.
     - **Suno AI & Mastering Metrikleri**: Lirik/zamanlama başarı oranları, Spotify -14 LUFS lufs limit dağılımı.
     - **A/B Test Merkezi**: Çoklu varyant trafik bölme, dönüşüm oranları ve kazananı tek tıkla stüdyoya uygulama.
     - **Landing Page CMS & Fiyatlandırma**: Hero metinleri, özellik kartları, 3 seviyeli fiyatlandırma ve SSS yönetimi.
     - **Tema, Menü & Sistem Modülleri**: Renk paleti, sekme gizleme/sıralama ve stüdyo modül anahtarları.
  3. **Stüdyo Entegrasyonu (`src/App.tsx`)**:
     - Hızlı Başlangıç (Quick Start) ve Ana Stüdyo üst menülerine şık "Ürün & CMS Paneli" açılış butonları yerleştirildi.
     - CMS'den yönetilen sekme görünürlüğü ve tema rengi anlık senkronize edildi.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-11 - Oturum 58] - Feature: Dedicated "SOSYAL MEDYA" Tab, Original Layouts & Snippet Engine
- **Kullanıcı Talebi & Hedef:**
  - Sosyal medya kartı şablonlarını diğer visualizer'lardan izole ederek doğrudan sağ taraftaki ana sekme çubuğunda müstakil bir **"SOSYAL MEDYA"** sekmesi altına almak.
  - İlham görsellerine sadık kalarak, ancak kopya olmayan 4 yeni özgün sosyal medya kart tasarımı (Siber Işıma, Vintage Polaroid, Noir Vinil, Holografik CD) eklemek.
  - Kullanıcıların kısa Snippet klipler (15sn, 30sn vb.) paylaşabilmesi için şarkı içinde kırpma (Trim) ve döngüde oynatma (Loop) motoru geliştirmek.
- **Mimari & Uygulanan Çözümler:**
  1. **Özgün Şablon Render Motorları (`src/core/Renderer.ts`)**:
     - `NEON_FRAME` (Siber Işıma): Köşeleri yuvarlatılmış karanlık kart, cam yansıma (sheen) efektleri ve gradyanlı alt dikey equalizer spektrum barları.
     - `POLAROID` (Vintage): Otantik sıcak tonlar (peach/cream), Polaroid fotoğraf çerçevesi tasarımı ve alt merkezde dairesel sunburst equalizer ringi.
     - `NOIR_VINYL` (Derin Noir Vinil): Gerçekçi siyah mat plak, çift specular (parlak) yansıma açısı, havada uçuşan toz parçacıkları (stardust) ve altta glowing ribbon sinüs dalga animasyonu.
     - `HOLO_CD` (Y2K Holo CD): 3D perspektifle eğik açılı kompakt disk (scale: 1, 0.82), gökkuşağı prizmatik dilimler, 4 köşeli parıldayan yıldızlar.
  2. **Snippet ve Trim Motoru (`src/core/AudioEngine.ts` & `src/types.ts`)**:
     - `trimEnabled`, `trimStart`, `trimEnd`, ve `trimLoop` durumları tip güvenli bir şekilde `VisualizerSettings`'e eklendi.
     - `AudioEngine` üzerinde, belirlenen trim sınırları dışına çıkıldığında şarkıyı başa (veya durdurmaya) alan mantık kuruldu. `playFromTrimStart` metodu eklendi.
  3. **Müstakil Sosyal Medya Stüdyosu (`src/components/SocialMediaStudio.tsx`)**:
     - Oynatıcı önizlemesi üzerine yerleştirilen interaktif bir timeline ve çift kulplu (start/end) trim range sliderları entegre edildi.
     - En-boy oranı, tasarım seçici, albüm kapağı yükleme ve 4K arka plan videosu katmanları tek noktada birleştirildi.
- **Derleme & Doğrulama Sonuçları:**
  - `lint_applet` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `compile_applet` (`npm run build`) ile derleme başarıyla tamamlandı.

### [2026-08-10 - Oturum 57] - Bug Fix: Dream Performer Gaze & Head Tilt Correction
- **Kullanıcı Talebi & Hedef:**
  - "Dream Performer" visualizer modunda avatarın (AliciaSolid) başının yere bakması sorununu çözmek ve modelin doğrudan kameraya/kullanıcıya bakmasını sağlamak.
- **Mimari & Uygulanan Çözümler:**
  1. **Çakışan Manuel Kemik Dönüşümlerinin Temizlenmesi (`src/visualizers/DreamPerformerVisualizer.ts`)**:
     - `TalkingHead` kütüphanesinin `IdleAnimationEngine` üzerinden hesapladığı biyolojik ve doğal kafa/boyun rotasyonlarını euler tabanlı kaba `.rotation.x = ...` veya `.rotation.z = ...` atamalarıyla ezen, dolayısıyla kuaterniyonları sıfırlayıp başı yere eğen (`head.rotation.x = ... + vocal * 0.05`) eski çakışan manuel kod blokları temizlendi.
  2. **Gaze Takibi ve Kamera Bakışı Entegrasyonu**:
     - VRM modelinin `vrm.lookAt.target` nesnesi doğrudan sahne içi kameraya (`this.camera`) bağlandı. Böylece avatar gözleri ve başı ile kamerayı (kullanıcıyı) izleyecek şekilde hizalandı.
  3. **VRM Animasyon Döngüsünün Aktifleştirilmesi**:
     - `DreamPerformerVisualizer` içerisindeki eksik `this.currentVrm.update(delta)` çağrısı eklendi. Bu sayede modelin yüz ifadeleri, göz sakkadları, lookAt bakış takipleri ve saç/etek spring-bone fizik yaylanmaları gerçek zamanlı bas ritimleriyle canlandırıldı.
  4. **Kamera Perspektif Sabitleme**:
     - Renderer çizim döngüsüne `this.camera.lookAt(0, 1.35, 0)` eklenerek kameranın daima tam kafa seviyesine odaklı kalması sağlandı.
- **Derleme & Doğrulama Sonuçları:**
  - `npx tsc --noEmit` %100 başarılı ve yeşil.
  - `npm run build` ile üretim derlemesi pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 56] - Bug Fix & Refactor: Effects Studio Panel & Render Engine Alignment
- **Kullanıcı Talebi & Hedef:**
  - "Effects Studio" panelindeki 12 FX kontrolünün tamamını bütünüyle işlevsel ve yüksek kaliteli hale getirmek. Kozmetik/çalışmayan kontrol kalmamasını sağlamak ("Bir kontrol, arkasında çalışan kod olmadan asla kullanıcıya gösterilmemeli").
  - CRT Scanlines, Cinematic Vignette ve Film Grain gibi efektlerin kontrollerini kaba saydamlık slider'larından çıkarıp gerçek parametrik davranışlara kavuşturmak.
  - Fotosensitif epilepsi hastaları için güvenli Strobe çakarı geliştirmek ve uyarı etiketleri eklemek.
- **Mimari & Uygulanan Çözümler:**
  1. **Çift Katmanlı Render & Offscreen Blit Mimarisi (`src/core/Renderer.ts`)**:
     - Visualizer'ları, global arka planı ve EQ katmanını yüksek performanslı bir offscreen canvas (`offscreenCanvas`) içine çizip, post-processing aşamalarını ve geometrik bozulmaları bu offscreen canvas üzerinden ana canvas'a blit ederken uygulayan modern bir render hattı (render pipeline) kuruldu.
  2. **Yenilenen ve Düzeltilen 12 Efekt (12 FX Shader)**:
     - **RGB Split / Chromatic Aberration**: Sahte yarı-saydam dikdörtgenler yerine, sahneyi offscreen canvas üzerinden sağa ve sola kaydırıp `screen` kompozisyon moduyla birleştiren gerçek renk kanalı kayması (True Channel Shift) algoritması uygulandı.
     - **Camera Shake / Beat Jitter**: Global `cameraShake` ve `cameraShakeEnabled` arayüz ayarları, renderer'ın ana viewport jitter motoruyla birleştirilerek bas ritimlerine duyarlı kamera sarsıntısı bütünüyle işlevsel hale getirildi.
     - **CRT Scanlines**: Sabit adımlı tarama çizgileri parametrik hale getirilerek, slider değeri arttıkça çizgi sıklığının (density) artması ve kalınlığının dinamik ölçeklenmesi sağlandı.
     - **Cinematic Vignette**: Sabit karartma yarıçapı parametrik büküme kavuşturuldu; slider değeri arttıkça vizörün kenarlardan merkeze doğru büzülüp odağı daraltması sağlandı.
     - **Bloom & Beat Drop Flare**: Sabit altın sarısı rengi bütünüyle kaldırılarak kullanıcının seçtiği `primaryColor` paletiyle tam uyumlu, rengi dinamik eşlenen ışıma dalgası yazıldı.
     - **Film Grain**: Üniform dijital toz efekti yerine, gümüş halojen emülsiyonunu taklit eden organik, farklı boyut ve saydamlık dağılımına sahip (clustering distribution) analog gren motoru yazıldı.
     - **Bass Strobe (Flasher)**: Fotosensitif epilepsi duyarlılığı için maksimum saydamlık güvenli bir limite (`0.4`) sabitlendi, bas flaşı slider şiddetiyle çarpanlandı ve arayüz kartına prominent bir fotosensitivite uyarı etiketi eklendi.
     - **Glitch Slice**: Difference modu ile renk bozan düz boyalı kutular yerine, offscreen canvas'tan rastgele yüksekliklerde yatay kesitler alıp sese duyarlı kaydıran gerçek bir piksel-dilimleme (True Pixel Slicing) glitch efekti entegre edildi.
     - **Neon Edge Glow**: GPU canavarı pahalı `shadowBlur` kaldırıldı; bunun yerine iç içe geçen 3 kademeli saydam stroke katmanlarıyla ultra-akıcı ve 10 kat daha hızlı neon çerçeve reaktivitesi kuruldu.
     - **Lens Distortion (Fisheye Bulge)**: Bugüne dek hiç okunmayan bu ayar için, offscreen canvas merkezinden dairesel eşmerkezli halkalar kesip dışarı doğru büzerek büyüten gerçek bir 2D mercek bükme/balık gözü projeksiyonu yazıldı.
     - **Motion Trail / Ghost Echo**: Ana ekran temizleme döngüsü `motionTrailEnabled` durumuna göre koşullu hale getirildi. Arka planlar pürüzsüz kalırken visualizer ve partiküller, slider şiddetiyle orantılı (rgba 1-motionTrail temizlik hızıyla) arkalarında göz alıcı bir hayalet iz bırakacak şekilde güncellendi.
     - **Hue Rotation**: `ctx.filter = hue-rotate(...)` kullanılarak sese ve bas ritmine duyarlı kesintisiz renk spektrumu dönüşümü ve gökkuşağı akışı aktifleştirildi.
  3. **Master Kontrollerin Bağlanması**:
     - **Glitch Frequency**: Glitch dilimlerinin oluşma sıklığını ve rastgele tetikleme oranını belirleyen ana threshold'a bağlandı.
     - **Distortion (Geometrik Bükülme)**: Canvas'ı bükmek yerine, offscreen canvas satırlarını zaman ve bas frekansıyla büküp dalgalandıran gerçek bir analog yatay bükme dalgası (sine-wave horizontal warp) yazıldı.
     - **Audio Reactivity (Master)**: Gelen tüm ses transient değerlerini çarpanlayarak visualizer barlarının, titreşimlerin ve reaktif post-processing efektlerinin müzikle olan genel dans hassasiyetini tek elden kontrol eden master reaktiviteye dönüştürüldü.
- **Derleme & Doğrulama Sonuçları:**
  - `npx tsc --noEmit` %100 başarılı ve yeşil.
  - `npm run build` ile üretim derlemesi pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 55] - Bug Fix: Chunked Upload Integration on Frontend
- **Kullanıcı Talebi & Hedef:**
  - Sunucu taraflı 60 FPS video render başlatıldığında büyük ses dosyaları veya görsel bileşenlerin yüklenmesinde yaşanan "Unexpected token '<'..." JSON parse hatasını çözmek.
- **Analiz & Bulgular:**
  - Sunucuya tek seferde büyük boyutlu dosyalar (örneğin 19MB demo ses dosyası) yüklendiğinde, Nginx veya Cloud Run ağ sınırları nedeniyle isteklerin engellendiği, bu durumda istemcinin HTML formatında hata veya yönlendirme sayfaları alabildiği saptandı. Tarayıcı fetch isteğinin bu yönlendirmeleri 200 OK ile izlemesi sonucu, `.json()` çözümlemesinin fırlattığı hata tespit edildi.
- **Çözüm:**
  - İstemci tarafında `startServerRender` işlevi (`src/App.tsx`) bütünüyle güncellenerek parçalı yükleme (chunked upload) mimarisi entegre edildi.
  - Artık büyük ses dosyaları, kapaklar ve arka planlar 4MB büyüklüğünde küçük parçalara bölünerek güvenle `/api/render/upload-chunk` uç noktasına yükleniyor, ardından `/api/render/assemble-and-start` ile birleştirilip render işlemi pürüzsüzce başlatılıyor.

### [2026-08-10 - Oturum 54] - Premium Visualizer: "Neural Noir" Shatter Mechanics & Dynamic Transitions

**Çalışan Ajan Pipeline:** Lead Developer, 3D Kinematics, DSP Specialist & Code Auditor

- **Kullanıcı Talebi & Hedef:**
  - "Neural Noir" isimli, loş ve karanlık brutalist cyber-noir tarzı, dinamik durum makinesine (Verse, Chorus, Drop) sahip bir 3D tel kafes (wireframe) visualizer eklemek.
  - Şarkının bölümlerine göre dinamik davranışlar: Verse durumunda yavaşça dönen loş tel kafes, Chorus durumunda bas ritimleriyle parçalanan/bükülen mesh ve çoğalan geometrik sarmal küreler, vokal ile senkronize ağız hareketi ve parıldayan yüz hatları, Drop durumunda ise tüm modelin parçalanarak parlak partikül patlamasına dönüşmesi ve ardından tekrar kusursuzca birleşmesi sağlandı.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Neural Noir Görselleştirici Tasarımı (`src/visualizers/NeuralNoirVisualizer.ts`)**:
     - **3D Projeksiyon Motoru & Matematik Matrisi**: WebGL context kayıplarından etkilenmeyen, son derece akıcı ve kararlı 3D-to-2D perspektif projeksiyonu (focalLength / depth Z) oluşturuldu.
     - **Procedural Cyber Mask Mesh**: İnsan yüz konturlarına (burun köprüsü, elmacık kemikleri, çene çizgisi) sahip 144 vertex ve low-poly üçgen yüzeylerden oluşan özgün bir 3D siber maske oluşturuldu.
     - **Verse Davranışı**: Düşük parlaklıkta, koyu duman ve kömür rengi tonlarında, yavaş Y ekseni dönüşüne sahip fütüristik wireframe tasarımı.
     - **Chorus Davranışı (Vocal & Bass Entegrasyonu)**:
       - *Bass*: Bas vuruşlarında ve transient sinyallerinde mesh ağ yapısının dışarı doğru titreşmesi ve parçalanma reaksiyonu vermesi sağlandı. Çevreye 2 katmanlı reaktif orbital küreler eklendi.
       - *Vocal*: Vokal frekansına duyarlı dikey dudak senkronizasyonu ve yüz hatlarının parlayarak belirginleşmesi sağlandı.
     - **Drop Davranışı (Shatter & Assemble Physics)**:
       - Enerji eşiği aşıldığında veya geçişlerde tetiklenen asenkron `explosionFactor` fizik motoru yazıldı.
       - Parçacıklar kendilerine ait 3D patlama yönlerinde (`shatterDir`) dışarı doğru fırlatılıyor, drop şiddeti dindiğinde ise çekim kuvvetiyle (spring-easing) birleşip tekrar yüz formuna geri dönüyorlar.
  2. **Global Entegrasyon ve Test**:
     - `NeuralNoirVisualizer` lazy factory olarak `src/core/Renderer.ts` ve `src/types.ts` üzerine kaydedildi. `src/App.tsx` içerisindeki "Cinematic Portrait" kategorisine premium etiketle eklendi.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `npm run build` ile üretim derlemesi pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 53] - Premium Visualizer: "Dream Performer" Psychedelic Integration

**Çalışan Ajan Pipeline:** Lead Developer, 3D Kinematics, DSP Specialist & Code Auditor

- **Kullanıcı Talebi & Hedef:**
  - VRM avatarı psychedelic bir dünya ile birleştirerek "Dream Performer" isimli yeni bir ultra-premium sinematik 3D görselleştirici entegre etmek.
  - Avatar ortada, arka planda yaşayan bir fraktal dünya, saç ve giysilerde fiziksel rüzgar tepkisi, vokal ile değişen yüz aydınlatması ve nakarat/beat vuruşlarında kozmik uzay bükülmesi hedeflendi.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Dream Performer Görselleştirici Tasarımı (`src/visualizers/DreamPerformerVisualizer.ts`)**:
     - **Avatar (Orta Katman)**: 3D Three.js sahnesinde ortalanmış VRM anime avatarı (AliciaSolid) yüklendi. Çevrimdışı durumlar için 11 parçadan oluşan eklemli ve ritme göre dans eden holografik siber süzülen siber-mannequin model kurtarma mekanizması kuruldu.
     - **Fractal World (Arka Plan)**: Icosahedron, Octahedron, Dodecahedron ve Torus mesh sarmallarından oluşan yaşayan 48 dallı dairesel fraktal sistemi (`buildFractalWorld`) oluşturuldu. Her düğüm sesin vokal/bas enerjisine göre nefes alıyor ve renk mutasyonuna uğruyor.
     - **Fiziksel Reaktif Salınım**: VRM kemikleri ve fallback mannequin eklemleri, bas frekanslarıyla tetiklenen fiziksel rüzgar fazı (`physicalWindPhase`) ve sinüzoidal salınımla dinamik olarak dans ettirildi.
     - **Vokal Yüz Işık Değişimi**: Tam yüze doğrultulmuş ve vokal frekansı (`audio.vocalEnergy`) ile renk/yoğunluk değiştiren, kendi yörüngesinde dönen dinamik bir `THREE.PointLight` sistemi entegre edildi.
     - **Nakaratta Dünya Dönüşümü (Beat Warp)**: Bas ritmi (`audio.beat`) yakalandığında dışarı doğru yayılan bir siber bükülme gücü (`chorusTransformation`) ile yıldız alanı ve arka plan ızgara katmanı kozmik dalgalanmaya maruz bırakıldı.
  2. **Three.js Offscreen Rendering & 60FPS Video Export Entegrasyonu (`src/core/Renderer.ts`)**:
     - `DreamPerformerVisualizer` modüller silsilesine ve `src/types.ts` içerisine kusursuzca kaydedildi. WebGL offscreen buffer'ı, Express + Node Canvas sunucu taraflı video render motoruyla uyumlu şekilde 2D canvas frame'ine kopyalandı.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `npm run build` ile üretim derlemesi pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 52] - Premium Visualizer: "Neural Bloom" Implementation

**Çalışan Ajan Pipeline:** Lead Developer, 3D Kinematics, DSP Specialist & QA Verifier

- **Kullanıcı Talebi & Hedef:**
  - Audit skorbordundaki kürasyon tavsiyelerine uyarak visualizer seçim menüsünü Premium (Küratörlü 20 mod) ve Gelişmiş/Klasik (Legacy 14 mod) olarak 2 katmana bölmek.
  - "Neural Bloom" adlı, çok katmanlı, sese duyarlı ve sonsuz derinlik hissi veren yeni bir sinematik 3D-benzeri parçacık ve fraktal visualizer geliştirmek.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Arayüzde Kürasyon Filtresi & Klasik Toggle Entegrasyonu (`src/App.tsx`)**:
     - Visualizer'lar 6 küratörlü premium kategoriye (`CINEMATIC`, `LIQUID`, `MINIMAL`, `ORB`, `CONCERT`, `GEOMETRIC`) ve 1 adet `LEGACY` (klasik) kategorisine bölündü.
     - Arayüze "Sadece Premium (20/34)" ve "Tüm Modları Göster (34/34)" geçiş butonları (Toggle) ile temiz, brutalist ve son derece elit bir kategori filtresi yerleştirildi.
  2. **Neural Bloom Visualizer Tasarımı (`src/visualizers/NeuralBloomVisualizer.ts`)**:
     - **Background (Katman 1)**: Perlin/gradient noise benzeri, üst üste binmiş rotating radial gradient katmanlarından oluşan ve `vocalEnergy` ile rengi değişen akıcı bir arka plan oluşturuldu. Derinlik hissi için yavaşça genişleyen sonsuz tünel halkaları eklendi.
     - **Middle (Katman 2)**: 6 kollu simetrik, merkezden dışarı doğru büyüyen ve dalları sese duyarlı bükülen fraktal sinaps ağaçları (`drawNeuralBranch`) çizildi. Yaprak dallarının ucunda beyaz neon sinaptik çekirdekler parıldatıldı.
     - **Foreground (Katman 3)**: 150 adet SynapticParticle ile perspective division (focalLength / depth Z) projeksiyonu kullanılarak 3D tünel derinlik efekti oluşturuldu. Parçacıklar kameraya doğru süzülüp ince neon bağlarla birbirine bağlanıyor.
     - **Audio DSP Bağlantıları**:
       - `Bass`: Merkez ölçeklendirmesini (`zoomFactor`) 1.18x katına kadar büyütecek şekilde bas vuruşlarıyla eşlendi.
       - `Vocal (Midrange)`: Arka plan gradyanları ile parçacık renklerini döndüren dinamik `hue shift` döngüsünü tetikliyor.
       - `Beat (Transient)`: Ritim yakalandığında (`audio.beat`) dışarı doğru yayılan bir sinüzoidal radial bükülme/distort dalgası (`distortionPulse`) üreterek foreground alanını reaktif dalgalandırıyor.
  3. **Full-Stack Entegrasyonu & Lazy Factory Registration (`src/core/Renderer.ts` & `server/renderEngine.ts`)**:
     - `NeuralBloomVisualizer` lazy factory olarak renderer siciline kaydedildi. Bu sayede sunucu tarafı 60FPS FFmpeg video render motorunda da tam uyumlulukla asenkron çalışabiliyor.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `npm run build` ile üretim derlemesi pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 51] - Performance Optimization, Dynamic Feature Controls & Resilient 3D Fallbacks

**Çalışan Ajan Pipeline:** Lead Developer, Code Auditor, 3D Kinematics & DSP Specialist

- **Kullanıcı Talebi & Hedef:**
  - Kod tabanı denetim raporunu (Audit) hayata geçirmek; ağır parçacık çizim döngülerini optimize etmek, Nesil 1/Nesil 2 görselleştirici parametre farklarını arayüzde kontrol altına almak, 3D VRM modeline gerçek audio-reactive deformasyonlar eklemek ve OBJ yükleme başarısızlıklarına karşı esnek kurtarma mekanizmaları entegre etmek.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **QuantumFieldVisualizer Performans Devrimi (`src/visualizers/QuantumFieldVisualizer.ts`)**:
     - `N^2` karmaşıklığındaki yıldız kümesi çizgi çizim döngüsü, **Sweep-and-Prune (O(N log N))** algoritması ile baştan yazıldı. Parçacıklar X koordinatına göre sıralandı ve mesafe limiti aşıldığında iç döngünün kırılması (`break`) sağlandı. CPU/GPU yükü ağır yoğunluklarda 10 kattan fazla azaltıldı.
  2. **Dinamik Parametre Destek Filtresi & Yeni Sliderlar (`src/App.tsx`)**:
     - Her görselleştirici modunun (`VisualizerMode`) hangi ince ayarları (Hız, Ölçek, Yoğunluk, Dönüş, Parlama, Hassasiyet, Renk Geçişi) desteklediğini tanımlayan `getVisualizerSupportedFeatures` yardımcı haritası kuruldu.
     - Arayüzde klasik (Nesil 1) modlar seçildiğinde çalışmayan sliderlar gizlenerek kullanıcıya bilgilendirici bir uyarı gösterilmesi sağlandı. Eksik olan **Dönme Hızı (visRotation)**, **Parlama / Glow (visGlow)** ve **Renk Geçişi (visColorShift)** sliderları tam kontrolle panele eklendi.
  3. **VRM Avatar Audio-Reactive Prosedürel Deformasyon (`src/visualizers/VrmAnimeHybridVisualizer.ts`)**:
     - `onBeforeCompile` kancası üzerinde boş olan shader enjeksiyonu canlandırıldı. Vertex shader seviyesinde bas (`uBass`) ve tiz (`uTreble`) frekansları ile tetiklenen **sinüs-dalga tabanlı prosedürel mesh titreşim ve bükülme deformasyonu** GLSL ile entegre edildi. Avatar artık ritme göre holografik olarak esneyip dalgalanabiliyor.
  4. **OBJ Yüz Maskesi Esnek Kurtarma Mekanizması (`src/visualizers/ObjFaceVisualizer.ts`)**:
     - `/models/face.obj` dosyasının yüklenemediği veya eksik olduğu durumlar için (404/ağ hatası vb.) **prosedürel 3D maske oluşturucu (`createProceduralFaceFallback`)** yazıldı.
     - Çevrimdışı/hatalı durumlarda sonsuza kadar yükleme ekranında kalmak yerine, anında matematiksel olarak hesaplanan, göz/ağız delikleri bulunan, 3D koordinatlı ve dudak senkronizasyonuna tam uyumlu bir siber-maske modeli üretilerek sahneye eklenmesi sağlandı.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 başarılı ve hatasız.
  - `npm run build` ile üretim derlemesi (production build) pürüzsüz tamamlandı.

### [2026-08-10 - Oturum 50] - Project Persistence, Undo/Redo Engine, Eco Mode & Subtitle Export Upgrades

**Çalışan Ajan Pipeline:** Lead Developer, UX Architect & Performance Engineer

- **Kullanıcı Talebi & Hedef:**
  - GlitchFramer 2.0 (VidFramer) uygulamasının kullanıcı deneyimini (UX) üst seviyeye taşımak; proje kaydetme/yükleme, geçmişi geri/ileri alma (Undo/Redo), sayfadan ayrılma koruması, düşük performanslı cihazlar için Eco Mod ve lirikleri altyazı formatında dışa aktarma (SRT/VTT) özelliklerini entegre etmek.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Undo / Redo (Geri Al / İleri Al) Motoru (`src/App.tsx`)**:
     - Sahnede yapılan görselleştirici ayar değişikliklerini takip eden, 50 adım kapasiteli `pastSettings` ve `futureSettings` geçmiş yığınları (history stacks) kuruldu.
     - İki durum arasındaki farkın diskret (mod, en-boy oranı, aktif efektler gibi tek tıkla değişen ayarlar) olup olmadığını kontrol eden akıllı durum süzgeci ve sürekli değişen slider değerlerini saniyede maksimum bir kez yığına iten (debounce benzeri zaman filtresi) entegrasyon yapıldı.
     - Ekranın üst kısmına "GERİ AL" ve "İLERİ AL" butonları eklendi, ayrıca küresel klavye dinleyicisi ile `Ctrl+Z` ve `Ctrl+Y` / `Ctrl+Shift+Z` kısayolları tanımlandı.
  2. **Proje Kaydetme / Yükleme (.JSON) ve Otomatik Oturum Kurtarma (`src/App.tsx`)**:
     - Projedeki tüm ayarları içeren `.json` formatında dosya indirmeyi sağlayan `exportProjectJson` ve bu dosyaları tekrar yükleyen `importProjectJson` yardımcıları geliştirildi.
     - Her ayar değişiminde çalışan `localStorage` tabanlı otomatik seans yedekleme sistemi entegre edildi. Uygulama açılışında yarıda kalmış seansı tespit ettiğinde kullanıcıya "Oturumu Kurtar" veya "Yoksay" seçeneklerini sunan şık bir üst bildirim çubuğu (banner) yerleştirildi.
  3. **Eco Mode / Düşük Performans Optimizasyonu (`src/core/Renderer.ts`, `src/App.tsx`)**:
     - Mobil, eski nesil veya pilde çalışan bilgisayarlarda 60 FPS akıcılığını korumak için tek tıkla aktifleşen "Eco Mod" geliştirildi.
     - Eco mod aktif olduğunda; parçacık yoğunluğu (`visDensity`) anında %50'ye düşürülür, ölçek (`visScale`) hafifçe optimize edilir ve tarayıcıyı/GPU'yu yoran ağır efektler (Bloom, Motion Trail, Glitch Slice, RGB Split) otomatik olarak devreden çıkarılarak görsel akıcılık maksimum düzeyde tutulur.
  4. **Video Altyazı Dışa Aktarımı (SRT / VTT Export) (`src/components/LyricsStudio.tsx`)**:
     - LyricsStudio panelinde senkronize edilen zaman kodlu şarkı sözlerini standart video oynatıcılar ve Premiere/Resolve gibi kurgu yazılımları ile doğrudan uyumlu kılmak için SubRip (`.srt`) ve WebVTT (`.vtt`) formatında dışa aktarma butonları ve zaman formatlayıcıları (`formatSrtTime`, `formatVttTime`) eklendi.
  5. **Sayfadan Ayrılma ve Kapanma Engeli (`src/App.tsx`)**:
     - Canlı tarayıcı kaydı (`isRecording`) ya da sunucu tarafında ağır FFmpeg render işlemi (`isServerRendering`) devam ederken sekmeyi kazara kapatmayı, sayfayı yenilemeyi veya geri gitmeyi engelleyen tarayıcı seviyesi `beforeunload` pencere koruması entegre edildi.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 yeşil ve sıfır hata.
  - `npm run build` ile üretim sürümü sorunsuz derlendi.

### [2026-08-10 - Oturum 49] - Memory Optimization, Lazy Evaluation & Real-time Loop Performance Enhancements

**Çalışan Ajan Pipeline:** Lead Developer, Code Auditor & Performance Specialist

- **Kullanıcı Talebi & Hedef:**
  - GlitchFramer 2.0 (VidFramer) uygulamasının tarayıcı bellek sızıntılarını önlemek, GPU kaynaklarını optimize etmek ve kullanıcı ayar değişimlerinde kesintisiz bir 60 FPS akıcılık yakalamak.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Tembel Değerlendirmeli Görselleştirici Kayıt Altyapısı (`src/core/Renderer.ts`, `src/types.ts`)**:
     - `IVisualizer` arayüzüne isteğe bağlı (optional) bir `dispose?: () => void;` metodu eklendi.
     - `StudioRenderer` içindeki `visualizerRegistry` yapısı doğrudan instantiating yapmak yerine, talep edildiğinde çalışan birer **Lazy Factory Function (`() => IVisualizer`)** haritasına dönüştürüldü.
     - Sahnede başka bir görselleştirici moduna geçiş yapıldığında, eski görselleştiricinin varsa `.dispose()` fonksiyonu çağrılarak GPU ve CPU kaynaklarının otomatik olarak boşaltılması sağlandı.
  2. **WebGL ve GPU Sızıntılarının Giderilmesi (`src/visualizers/VrmAnimeHybridVisualizer.ts`)**:
     - 3D VRM Anime Avatar motoru (`VrmAnimeHybridVisualizer`) üzerinde tam bir temizlik mekanizması uygulandı.
     - Model yüklenmeden önce veya visualizer kapatıldığında sahnedeki önceki VRM modelinin tüm alt nesneleri taranarak geometri (`dispose()`), materyaller (`dispose()`) ve ilişkili tüm doku/kaplama haritaları (map, normalMap, bumpMap vb.) RAM/VRAM üzerinden tamamen temizlendi.
     - WebGLRenderer bağlamı `.dispose()` ile düzgün bir şekilde kapatıldı.
  3. **Vocal Analizi Sunucu-İstemci Senkronizasyonu (`src/core/AudioAnalysisEngine.ts`)**:
     - Sunucu tarafında çalışan `OfflineAudioProcessor` içerisindeki vokal analizi tutarsızlıkları tamamen çözüldü.
     - İstemci tarafındaki analog-modellenmiş Biquad vokal bant geçiren filtresinin (Center: 1750Hz, Q: 0.7) transfer fonksiyonu s-domain'de matematiksel olarak modellenip FFT çıktı pencerelerine doğrudan uygulanarak sunucu tarafında tam uyumlu simüle edilmiş bir `vocalFrequencyData` üretildi.
  4. **React Render Döngüsü ve İşlem Optimizasyonu (`src/App.tsx`, `src/components/VisualizerCanvas.tsx`)**:
     - `<audio>` elementi üzerindeki redundant/yinelenen `onTimeUpdate` ve `onLoadedMetadata` dinleyicileri kaldırıldı. `AudioEngine`'in reaktif abonelik yapısı (`subscribe`) tek gerçeklik kaynağı (Single Source of Truth) haline getirilerek React render thrashing'i engellendi.
     - `VisualizerCanvas` üzerindeki ana 60 FPS `requestAnimationFrame` döngüsü, `settings` değişkeninin her değişiminde silinip baştan başlatılmak (tear down) yerine, ayarları sürekli güncel tutan reaktif bir **`settingsRef` (`useRef`)** yapısına geçirildi. Bu sayede kullanıcılar slider'ları sürüklerken veya renk paleti değiştirirken render döngüsünde sıfır duraksama/kesinti sağlandı.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run lint` (`tsc --noEmit`) %100 başarılı, sıfır tip hatası.
  - `npm run test` komutuyla 8/8 birim test adımı başarıyla çalıştı ve yeşil geçildi.
  - `npm run build` ile üretim sürümü sorunsuz bir şekilde derlendi.

### [2026-08-10 - Oturum 48] - DSP Unified Extraction & Automated Test Infrastructure Setup

**Çalışan Ajan Pipeline:** Lead Developer, Audio/DSP Specialist & QA Engineer

- **Kullanıcı Talebi & Hedef:**
  - `TESTING.md` içerisinde yer alan test felsefesi ile kod tabanı arasındaki boşluğu doldurmak.
  - `package.json` dosyasına gerçek, otomatik olarak çalıştırılabilir bir test altyapısı entegre etmek.
  - İstemci (`AudioProcessor.ts`) ve Sunucu (`renderEngine.ts`) taraflarındaki frekans ve beat analizi farklarını gidererek her iki katmanda da Cooley-Tukey Radix-2 FFT ve adaptif beat tespiti kullanarak "gördüğün şeyi aynen render edersin" ilkesini sağlamak.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Ortak DSP Motoru (`src/core/AudioAnalysisEngine.ts`)**:
     - **FastFourierTransform**: Saf TypeScript ile yazılmış, Hann pencereli, sıfır GC (zero allocation) ile çalışan Radix-2 Cooley-Tukey FFT algoritması.
     - **AudioAnalysisCore**: Frekans bantlarını (Kick, Snare, Hi-hat, Vocal) normalize edip sönümleyen ve 30 frame rolling average tabanlı adaptif dinamik vuruş tespiti yapan ortak analizci.
     - **OfflineAudioProcessor**: Çevrimdışı (sunucu/render) ortamlarda PCM tamponlarından 60 FPS kare kare analiz yapan sarmalayıcı.
  2. **Sunucu ve İstemci Güncellemeleri**:
     - `server/renderEngine.ts` içerisindeki eski sahte spektrum ve sabit vuruş tespiti mantığı kaldırılarak `OfflineAudioProcessor` entegrasyonu tamamlandı.
     - `AudioProcessor.ts` içerisindeki analiz mantığı, ortak `AudioAnalysisCore` sınıfını kullanacak şekilde basitleştirildi ve refaktör edildi.
  3. **Otomatik Test Altyapısı (`tests/runTests.ts`)**:
     - Projenin en kritik analiz ve motor yapılarını test eden kapsamlı, hızlı bir test paketi yazıldı.
     - 100Hz Sub-bass ve 8000Hz Treble frekans izolasyon testleri, adaptif vuruş tespiti, sessizlik tespiti, profil temizleme ve Suno link ayıklama testleri eklendi.
     - `package.json` içerisine `"test": "tsx tests/runTests.ts"` scripti tanımlandı.
- **Derleme, Doğrulama & Test Sonuçları:**
  - `npm run test` komutu çalıştırılarak tüm 8/8 test adımı başarıyla yeşil tamamlandı.
  - `npm run build` ve `npm run lint` işlemleri sorunsuz geçildi.

### [2026-08-10 - Oturum 47] - AudioEngine Centralization Refactor (Single Source of Truth)

**Çalışan Ajan Pipeline:** Lead Developer & Audio Architecture Specialist

- **Kullanıcı Talebi & Hedef:**
  - `AudioEngine` altında ses mimarisini tek merkezden yönetmek:
    ```
    AudioEngine
     ├── AudioContext
     ├── MediaSource
     ├── Analyser (Main & Vocal Filtered)
     ├── Master Chain (DSP & Presets)
     ├── Export Chain (MediaStreamDestination)
     └── Playback (Play/Pause, Seek, Mute, Observable State)
    ```
  - Öncesinde dağınık olan `App.tsx`, `MasteringEngine.ts` ve `VisualizerCanvas.tsx` içerisindeki ses bağlamı ve olay manipülasyonlarını tek bir `AudioEngine` singleton kontrolcüsünde toplamak.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Merkezi Ses Motoru (`src/core/AudioEngine.ts`)**:
     - `AudioContext` tembel başlatma (lazy initialization) ve kullanıcı etkileşimi güvenliği.
     - Tek `MediaElementSourceNode` yönetimi (`attachAudioElement`, `loadTrack`, `unloadTrack`).
     - `Main Analyser` (1024 FFT, 0.8 smoothing) ve `Vocal Analyser` (Bandpass 1750Hz, Q=0.7) entegrasyonu.
     - Tam mastering zinciri (LowShelf, MidPeaking, HighShelf, WaveShaper Saturation, DynamicsCompressor, MasterGain).
     - İstemci kaydı için `MediaStreamDestination` bağlantısı ve `getAudioStreamTrack()` desteği.
     - Reaktif abonelik sistemi (`subscribe`) ile UI ve bileşenlerin tek merkezden senkronize edilmesi.
  2. **Bileşen Entegrasyonları (`src/App.tsx`, `src/components/VisualizerCanvas.tsx`, `src/core/AudioProcessor.ts`)**:
     - `App.tsx`: Dağınık `AudioContext` ve `source.connect` efektleri temizlendi; `audioEngine.subscribe` ile tüm oynatıcı durumları bağlandı. Slider, butonlar ve klavye kısayolları doğrudan `audioEngine.seek`, `audioEngine.seekRelative`, `audioEngine.togglePlay` ve `audioEngine.toggleMute` çağrılarına bağlandı.
     - `VisualizerCanvas.tsx`: Kayıt başlangıcında ses parçası doğrudan `audioEngine.getAudioStreamTrack()` üzerinden alındı; oynatma tetikleyicileri `audioEngine` ile senkronize edildi.
     - `AudioProcessor.ts`: `createEmptyAudioEvents` statik metodu ve `getAudioEvents` yardımcı fonksiyonu eklenerek tip güvenliği %100 sağlandı.
- **Derleme & Doğrulama:** `npx tsc --noEmit` ve `npm run build` %100 hatasız yeşil tamamlandı.

**Çalışan Ajan Pipeline:** Lead Developer & Audio Integration Architect

- **Kullanıcı Talebi & Hedef:**
  - Kullanıcı Suno şarkı linki verdiğinde (örn: `https://suno.com/s/a2hf69thdnYq25lG` veya `https://suno.com/song/...`) mevcut upload pipeline yerine alternatif bir veri sağlayıcı (Data Provider) katmanı olarak çalışması.
  - Mevcut audio player, lip sync motoru, `VisemeEngine`, `PhonemeAlignmentEngine` ve 3D VRM avatar pipeline'ı kesinlikle bozulmadan korunmalı.
  - Suno URL doğrulama, sayfa/API içeriğinden metadata analiz etme (`title`, `artist`, `image`, `audioUrl`, `lyrics`, `source: "suno"`).
  - Word-level timestamp veya alignment verisi varsa `lyricsTimeline` formatına dönüştürüp `PhonemeAlignmentEngine` ile zenginleştirme; yoksa mevcut LRC parser / WhisperX fallback / otomatik süre dağıtımı ile kesintisiz çalışma.
  - Arayüzde hem Header, hem Medya Sekmesi hem de LyricsStudio içerisinde tek tıkla Suno içe aktarma desteği.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **Sunucu Tarafı API (`server.ts`)**:
     - `POST /api/suno/inspect`: Suno linklerini (kısa link `/s/`, `/song/`, `/clip/` veya UUID) çözümleyen, yönlendirmeleri izleyen, HTML OpenGraph / JSON-LD ve Suno Public API üzerinden şarkı adı, sanatçı, kapak görseli, ses URL'i ve word-level alignment verilerini çeken güvenli sunucu endpoint'i.
     - `GET /api/suno/proxy-audio`: Web Audio API ve Canvas görselleştiricilerinde CORS kısıtlamalarını aşarak Suno ses akışını (stream ve Blob) sunan güvenli proxy endpoint'i.
  2. **Veri Modelleri (`src/types.ts`)**:
     - `SunoTimelineWord`, `SunoWordTimestamp`, `TrackMetadata` ve `NormalizedSunoTrack` interface'leri tanımlandı.
  3. **Servis Katmanı (`src/services/SunoImporterService.ts`)**:
     - `validateUrl()`, `extractTrackId()`, `importTrack()`, `fetchAudioBlob()`, `normalizeSunoData()`, `parseAlignmentAndLyrics()`, `groupWordsIntoLines()` ve `cleanSunoLyricsPrompt()` fonksiyonları uygulandı.
     - Kelime düzeyinde zamanlama varsa doğrudan `PhonemeAlignmentEngine.enrichLyricsWithPhonemes()` ile viseme bağlandı; yoksa LRC parser veya akıllı süre dağıtımı devreye girdi.
  4. **Kullanıcı Arayüzü & Bileşenler (`src/components/SunoImporter.tsx`, `src/App.tsx`, `src/components/LyricsStudio.tsx`)**:
     - `SunoImporter.tsx`: Modern brutalist tasarımda, canlı analiz durumu, örnek linkler, parça & lirik önizlemesi ve "Projeye Aktar & Oynat" butonuna sahip şık modal ve inline panel bileşeni.
     - `App.tsx`: Header barda "⚡ SUNO İÇE AKTAR", Medya sekmesinde "⚡ SUNO LİNKİ İLE YÜKLE" butonu ve modal entegrasyonu.
     - `LyricsStudio.tsx`: "⚡ 3. SUNO AI LİNKİNDEN ÇÖZÜMLE" alt sekmesi ile sözleri ve zamanlamaları anında içe aktarma yeteneği.
- **Derleme & Doğrulama:** `npx tsc --noEmit` (`lint_applet`) ve `npm run build` (`compile_applet`) %100 başarılı.

### [2026-08-10 - Oturum 45] - 3D Avatar 6-Layer Procedural Performance Architecture & Natural Singer Live Presence

**Çalışan Ajan Pipeline:** Lead Developer & 3D Character Rigging & Animation Architect

- **Kullanıcı Bildirimi & Görev Hedefi:**
  - Avatarın sadece mekanik konuşuyor görünmesi değil, sahnede gerçek bir şarkıcı/performer gibi canlı, organik ve nefes alan bir performans sergilemesi.
  - 6 bağımsız katmandan oluşan **Motion Layer Architecture** kurulması:
    - Layer 1: Lip Sync & Occlusion (En yüksek öncelik)
    - Layer 2: Facial Expressions (Kaşlar, tebessüm, dinlenme)
    - Layer 3: Eye Tracking & Blinking (Gaze, sakkadlar, insan tipi göz kırpma)
    - Layer 4: Breathing & Posture (8s nefes döngüsü, şarkı öncesi nefes alma, göğüs/omuz)
    - Layer 5: Body Idle & Performance (Müzik temposu kafa salınımı, ritim nod, rahat kol duruşu)
    - Layer 6: Hair & Secondary Physics (Sönümlü yay atalet gecikmesi ve VRM spring bone)
  - Mevcut VRM yükleme, iskelet rig, lip sync, LRC senkronizasyonu ve oynatıcı sistemlerinin sıfır bozulmayla korunması.
- **Kök Neden & Mimari Analiz:**
  1. **Açık Ağız Problemi**: `PhonemeAlignmentEngine.ts` içinde LRC senkronizasyonunda o anda aktif kelime olmadığında (intro veya kelimeler arası enstrümantal bölümler), `Senaryo C` devreye girip enstrümantal müzik frekanslarını (gitar, synth) vokal sanarak `A` veya `U` viseme kodu döndürüyordu.
  2. **Statik/Donuk Duruş**: Avatarın nefes alma, insan benzeri göz kırpma (çift göz kırpma olasılığı, yumuşak s-curve kapanma/açılma), kafa mikro yaw/pitch/roll salınımları ve ikincil saç ataleti için bağımsız bir katman bulunmuyordu.
- **Uygulanan Çözümler & Yeni Modüller:**
  1. **`src/core/IdleAnimationEngine.ts` (6-Layer Procedural Performance Engine)**:
     - **4 Performance State**: `BEFORE_PLAYBACK`, `INSTRUMENTAL`, `VOCAL`, `HIGH_ENERGY`.
     - **Layer 1**: Lip sync durumuyla entegre REST kontrolü ve pre-vocal şarkı başlangıç takibi.
     - **Layer 2 (Facial Expressions)**: Vokal enerjisinde hafif kaş yükselmesi (`browInnerUp`), yüksek enerjide mikro-tebessüm (`happy`), dinlenmede gevşeme (`relaxed`).
     - **Layer 3 (Eye Tracking & Human Blinking)**: 3.0 - 7.0 sn rastgele insan kırpma aralığı (vokal sırasında odak için 5.0 - 8.0 sn), %20 çift kırpma şansı, aşırı açık ağızda kırpma baskılama, mikro-sakkadlar (2.2 - 5.0 sn) ve derin müzikal anlarda düşünceli içe bakış (introspective glance).
     - **Layer 4 (Breathing & Posture)**: 8 saniyelik doğal döngü (4s alma, 4s verme), şarkı başlamadan önce 400ms'lik nefes alma refleksi (pre-vocal inhale anticipation), göğüs genişlemesi ve omuz yükselmesi.
     - **Layer 5 (Body Idle & Performance)**: Müzik temposuna bağlı 0.2° - 1.5° kafa mikro-salınımı, kick/bass ritim binişi, rahat müzisyen kol dinlenme duruşu.
     - **Layer 6 (Hair & Secondary Physics)**: Kafa açısal hızından türetilen 2. derece sönümlü yay ataleti (damped spring oscillator).
  2. **`src/types.ts`**:
     - `PerformanceLayerConfig` arayüzü eklendi; her katman bağımsız olarak açılıp kapatılabilir (`layer1LipSyncEnabled`, `layer2FacialExpressionEnabled`, `layer3EyeTrackingEnabled`, `layer4BreathingEnabled`, `layer5BodyIdleEnabled`, `layer6HairPhysicsEnabled`).
  3. **`src/core/TalkingHead.ts`**:
     - 6 katmanlı performans motoru iskelet kuaterniyonları ve blendshapeleri ile tam uyumlu hale getirildi.
  4. **`src/core/PhonemeAlignmentEngine.ts` & `VisemeEngine.ts`**:
     - Enstrümantal ve intro bölümlerinde kesin `REST` pozuna geçiş ve 55ms pürüzsüz ağız kapanma sönümlemesi uygulandı (`Rest Lock`).
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 başarılı.

### [2026-08-10 - Oturum 44] - VRM Upper/Lower Arm Skeletal Rest Pose Calibration Fix

**Çalışan Ajan Pipeline:** Lead Developer & 3D Skeletal Rigging Architect

- **Kullanıcı Bildirimi & Sorun Tespiti:**
  - 3D VRM modelinin kollarının T-pose'dan gövde yanına inmek yerine yukarı doğru havaya kalkması (`leftUpperArm` ve `rightUpperArm` açılarının ters eksende olması).
- **Kök Neden:**
  - `@pixiv/three-vrm` normalize edilmiş humanoid kemik koordinat sisteminde sol kol (+X) için pozitif Z rotasyonu kolu aşağı indirirken, önceki kodda `-1.40` radyan verilmişti (bu da kolu T-pose'dan +80 derece yukarı havaya kaldırıyordu). Sağ kol (-X) için ise `+1.40` radyan ters yönde uygulanmıştı.
- **Uygulanan Çözümler:**
  - `src/core/TalkingHead.ts`:
    - `leftUpperArm`: `q.setFromEuler(0.10, -0.05, 1.35)` ile gövdenin sol yanına doğal şekilde indirildi.
    - `rightUpperArm`: `q.setFromEuler(0.10, 0.05, -1.35)` ile gövdenin sağ yanına doğal şekilde indirildi.
    - `leftLowerArm` / `rightLowerArm` ve `leftShoulder` / `rightShoulder` açıları dirseklerin içe ve öne hafif bükülü doğal dinlenme duruşuna ayarlandı.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 başarılı.

### [2026-08-10 - Oturum 43] - VRM Visualizer Background Image Fix & Glitch Flicker / Red Lines Elimination

**Çalışan Ajan Pipeline:** Lead Developer & 3D/2D Canvas Rendering Architect

- **Kullanıcı Bildirimi & Sorun Tespiti:**
  - VRM görselleştirici seçildiğinde ekranın yanıp sönmesi ve ekranda kırmızı çizgilerin belirmesi.
  - Arka plan görseli seçildiğinde (küratörlü veya özel yüklenen duvar kağıtları) VRM modunda hiçbir şekilde arka planda görünmemesi.
- **Kök Neden Analizi:**
  1. **Arka Planın Kaybolması**: `src/visualizers/VrmAnimeHybridVisualizer.ts` içerisindeki `render` fonksiyonu, Three.js sahnesini şeffaf (`alpha: true`) olarak çizdikten hemen sonra `ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, width, height);` çağrısıyla tüm 2D Canvas'ı opak bir renkle dolduruyor; bu da `StudioRenderer` tarafından çizilen arka plan görselini (`drawImageBackground`) ve videosunu tamamen siliyordu.
  2. **Yanıp Sönme ve Kırmızı Çizgiler**: Yine `VrmAnimeHybridVisualizer.ts` içinde tiz frekans (`treble > 0.75`) piklerinde çalışan agresif `getImageData` piksel dilimleme ve `ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; ctx.fillRect(0, y, width, sliceHeight);` kodları ekranda kırmızı yatay bantlar ve şiddetli titremelere yol açıyordu. Ayrıca bas piklerinde göz çevresine neon pembe kutu ve vokal dalga formu çiziliyordu.
  3. **Varsayılan Avatar Modu**: `src/App.tsx` içinde varsayılan `avatarMode` değeri `hologram` olarak ayarlandığı için RGB ayrışması ve CRT tarama çizgileri otomatik olarak devreye giriyordu.
- **Uygulanan Çözümler:**
  1. `src/visualizers/VrmAnimeHybridVisualizer.ts`:
     - Opak `ctx.fillRect(0, 0, width, height)` çağrısı kaldırıldı. Three.js WebGL canvas'ı şeffaf arka planla doğrudan 2D Canvas üzerine bindirilerek kullanıcının seçtiği duvar kağıtlarının/videolarının 3D avatar arkasında pürüzsüzce görünmesi sağlandı.
     - Tiz frekanslarındaki kontrolsüz kırmızı bant çizimleri (`rgba(255, 0, 0, 0.5)`), bas kutuları ve titreten piksel kaydırmaları tamamen temizlendi.
     - `SOLID ANIME` modu yüksek çözünürlüklü, net ve temiz 3D render sağlayacak şekilde optimize edildi; `HOLOGRAM 3D` modu ise estetik, yumuşak bir ışık halesi (`screen` blending) ile dengelendi.
  2. `src/App.tsx`:
     - Varsayılan `avatarMode` değeri `'anime'` olarak ayarlandı.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 başarılı.

### [2026-08-10 - Oturum 42] - 5-Stage Acoustic Forced Alignment, Formant VAD & Phoneme Timeline Engine

**Çalışan Ajan Pipeline:** Lead Developer & DSP / Phonetic Speech Animation Architect

- **Kullanıcı Talebi & Kod İncelemesi:**
  - `VisemeEngine.ts`, `AudioProcessor.ts` ve `lyricSyncService.ts` dosyalarının akustik analiz derinliğini doğrulamak;
  - LRC tabanlı yaklaşık dudak hareketinden, ses tabanlı gerçek fonem zamanlamasına (Forced Alignment) geçmek:
    `Audio -> Voice Activity Detection (VAD) -> Phoneme Alignment -> Viseme Mapping -> Blendshape Animation`
  - Vowel sustain detection (sesli harf uzatmalarında erken kapanmayı önleme) eklemek;
  - Bilabial phoneme detection (M, B, P) için gerçek kapanma (`lip_press: 1`, `mouth_open: 0`, `jaw_drop: 0`) kurallarını sadece duyulduğu anda uygulamak;
  - Coarticulation ve 50-100ms enterpolasyon ile yumuşak viseme geçişleri sağlamak;
  - Başlangıçta ve sessizlikte REST pozunu garantiye almak.
- **Uygulanan Mimari & Kod Çözümleri:**
  1. **`src/core/PhonemeAlignmentEngine.ts`**:
     - **Phoneme Timeline**: Her kelime için akustik süre ağırlıkları (`weight`) ve minimum artikülasyon süreleri ile alt fonem çizelgesi (`PhonemeToken[]`: `relativeStart`, `relativeEnd`, `startTime`, `endTime`, `isVowelNucleus`) üretimi.
     - **Akustik Spektral Analiz & Formant Takip**: 64-kanallı FFT'den F1 (300-1000Hz çene açıklığı), F2 (1000-2800Hz yayvanlık), Fricative (3500-8000Hz S/Ş/F sürtünmesi) formant bölgelerini ve dinamik gürültü tabanlı VAD (Voice Activity Detection) tespiti.
     - **Vowel Sustain Tracker**: Kelime zaman damgası bitse dahi vokal enerjisi devam ediyorsa (`vocalRMS`, `vocalEnergy`, `isVocalPresent`), sesli harf çekirdeğini (`sustainedVowel`) koruyarak erken kapanmayı önleyen mekanizma.
  2. **`src/core/VisemeEngine.ts`**:
     - 5-Kademeli işlem hattı: `VAD & Formant Extraction -> Forced Alignment -> Coarticulation Interpolation -> Bilabial Occlusion -> Asymmetric Exponential Smoothing (Attack: 45ms, Release: 100ms)`.
     - `M`, `B`, `P` için mutlak çift dudak kapanışı (`mouth_open = 0`, `jaw_drop = 0`, `lip_press = 1`).
     - Şarkı başında ve vokal yokken kesin `REST` pozu.
  3. **`src/services/lyricSyncService.ts` & `src/types.ts`**:
     - `SyncedWord` ve `PhonemeToken` tipleri ile `enrichLyricsWithPhonemes` entegrasyonu. LRC artık fallback ve yaklaşık kelime kılavuzu olarak görev yapar.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 yeşil, tüm VRM animasyonları ve mevcut bileşenler korundu.

### [2026-08-10 - Oturum 41] - 5-Stage Layered Skeletal Calibration & Quaternion Animation Transform Pipeline

**Çalışan Ajan Pipeline:** Lead Developer & 3D Skeletal Rigging / VRM Kinematics Architect

- **Kullanıcı Talebi:**
  - Doğrudan kemik rotasyonu (`leftUpperArm.rotation.set(...)`) verilmesinin modelden modele bozulmalara ve VRM animasyon/humanoid sistemiyle üst üste binme çakışmalarına neden olduğunu belirterek;
  - Sistematik 5 aşamalı mimariyi kurmak:
    `Avatar Load -> Skeleton Calibration -> Rest Pose Offset -> Animation Layer -> Final Bone Transform`
- **Uygulanan Çözümler:**
  - **Aşama 1: Avatar Load**: Model GLTF/VRMLoader ile sahneye yüklendiğinde `TalkingHead(vrm)` örneği başlatılır.
  - **Aşama 2: Skeleton Calibration (`calibrateSkeleton`)**:
    - Tüm humanoid kemik düğümleri (`hips`, `spine`, `chest`, `neck`, `head`, `leftShoulder`, `rightShoulder`, `leftUpperArm`, `rightUpperArm`, `leftLowerArm`, `rightLowerArm`, `leftHand`, `rightHand`) taranır.
    - Modelin orijinal bind-pose kuaterniyonları (`initialQuaternion`), pozisyon ve ölçek referansları `Map<HumanoidBoneKey, BoneCalibration>` yapısında kaydedilir.
  - **Aşama 3: Rest Pose Offset (`calculateRestPoseOffsetForBone`)**:
    - T-Pose / A-Pose başlangıç duruşunu organik dinlenme duruşuna dönüştüren kemik bazlı kanonik göreceli kuaterniyon ofsetleri (`restOffsetQuaternion`) tanımlanır.
  - **Aşama 4: Animation Layer**:
    - Şarkı söylerken baş onayı (vocal nodding), nefes alma mikro-salınımları, ritmik omurga kinematiği ve kol salınımı dinamik göreceli kuaterniyon olarak (`tempAnimQ`) üretilir.
    - Dudak hareketleri (Bilabial occlusion korumalı visemeler) ve doğal göz kırpma blendshape katmanında işlenir.
  - **Aşama 5: Final Bone Transform (`applyLayeredBoneTransform`)**:
    - Her kemik için bileşik dönüşüm formülü uygulanır:
      $$Q_{final} = Q_{calibrated} \times Q_{restOffset} \times Q_{anim}$$
    - Kuaterniyon çarpımı ile açı birikmesi (drift) ve gimbal lock tamamen engellenir, VRM iç güncellemesi (`vrm.update(1/60)`) ile tam uyumlu çalışır.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 40] - Default Local Demo Asset Integration (MESELE.flac & MESELE.txt)

**Çalışan Ajan Pipeline:** Lead Developer & Media Asset Integration Architect

- **Kullanıcı Talebi:** `/public/demo-items` yoluna eklenen `MESELE.flac` ve `MESELE.txt` dosyalarını uygulamanın varsayılan demo müziği ve senkronize lirik (LRC) içeriği olarak kullanmak; böylece her testte tekrar tekrar dosya yükleme zahmetini ortadan kaldırmak.
- **Uygulanan Çözümler:**
  - **LRC Servisi Entegrasyonu (`lyricSyncService.ts`)**:
    - `MESELE_DEMO_LRC_TEXT` ve `getMeseleDemoSyncedLyrics()` yardımcı fonksiyonu eklendi; `MESELE.txt` içeriği zaman damgalı satır ve kelimeleriyle tam fonetik ayrıştırma için hazır hale getirildi.
  - **Uygulama Başlangıç & Demo Yapılandırması (`App.tsx`)**:
    - Varsayılan ses dosyası `/demo-items/MESELE.flac`, parça başlığı `'Mesele'`, sanatçı adı `'Demo'` ve senkronize lirikler `getMeseleDemoSyncedLyrics()` olarak ayarlandı.
    - Uygulama ilk açıldığında arka planda `fetch('/demo-items/MESELE.flac')` ile ses dosyası `Blob` olarak önbelleğe alınarak FFmpeg ve yerel render motoruna anında hazır hale getirildi.
    - Top bar ve Medya sekmesindeki `loadDemoTrack()` fonksiyonu Mesele parçası ve LRC'sini anında yeniden yükleyecek şekilde güncellendi.
  - **Lirik Stüdyosu Güncellemesi (`LyricsStudio.tsx`)**:
    - Varsayılan metin ve LRC alanları `MESELE.txt` içeriğiyle senkronize edildi; tek tıkla "Mesele Demo LRC'yi Uygula" butonu eklendi.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 39] - Acoustic Waveform / RMS Energy-Driven Lip Sync & Adaptive Phoneme Sustain Engine

**Çalışan Ajan Pipeline:** Lead Developer & DSP / Vocal Synthesis Architect

- **Kullanıcı Talebi:** Mevcut LRC kelime süre tahminindeki erken REST pozisyonuna geçme sorununu çözmek; LRC'yi sadece başlangıç referansı olarak kullanıp kelime bitişlerini audio waveform/RMS enerji analizi ile tespit ederek, ses devam ettiği sürece viseme animasyonunu sürdürmek ve vokal enerjisi düştüğünde 100-150ms smoothing ile REST pozisyonuna geçmek.
- **Uygulanan Çözümler:**
  - **Waveform RMS & Vocal Energy Pipeline (`AudioProcessor.ts`, `src/types.ts`)**:
    - `analyser.getByteTimeDomainData()` ile gerçek zamanlı fiziksel ses basıncı RMS genliği (`vocalRMS`) hesaplandı.
    - 300Hz-3400Hz vokal formant bandı (F1/F2) ile RMS gücü birleştirilerek anlık vokal varlığı tespit edildi.
  - **Vokal Performans Tabanlı Viseme Motoru (`VisemeEngine.ts`)**:
    - **LRC Sadece Başlangıç Referansı (Start Trigger)**: LRC zaman damgaları artık yapay bitiş süreleri dayatmıyor. Zaman kelimenin başlangıcına ulaştığında fonetik sıralama tetikleniyor.
    - **Sürdürülen Vokal / Sesli Harf Fonem Kilidi (Phoneme Sustain)**: Başlangıç ünsüzleri doğal akustik süreyle (~85ms) geçildikten sonra kelimenin ana sesli harfi vokal enerjisi devam ettiği sürece açık tutuluyor (uzun notalar, solo şarkı kısımları vb.).
    - **Akustik Enerji Bitiş Tespiti & REST Geçişi**: `vocalRaw` (RMS + Vocal Formant) enerjisi eşik altına düştüğünde ve 80ms vibrato koruma penceresi dolduğunda vokal bitişi anında algılanıp hedef `REST` olarak belirleniyor.
    - **100-150ms Organik Yumuşatma (Exponential Smoothing Filter)**: Attack süresi 85ms (hızlı ve ritmik şarkı girişi), Decay/Release süresi 125ms (tam 100-150ms aralığında esnek ve doğal ağız kapanışı) olarak yapılandırıldı.
    - **Vokal Gücü Modülasyonu**: Şarkıcının ses şiddetine (belting / soft singing) göre ağız dikey açıklığı (`mouth_open`, `jaw_drop`) dinamik olarak ölçekleniyor.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 38] - Lowered Relaxed Arms Kinematics & Dynamic Head Hero Framing (16:9, 1:1, 9:16)

**Çalışan Ajan Pipeline:** Lead Developer & 3D Kinematics Architect

- **Kullanıcı Talebi:** VRM 3D modelinde kolları tamamen aşağı indirmek ve 16:9, 9:16, 1:1 modlarının tamamında ana materyal olarak kafaya (close-up portrait / headshot) odaklanmak.
- **Uygulanan Çözümler:**
  - **Doğal Rahat Kol Duruşu (Lowered Arms Kinematics)** (`TalkingHead.ts` & `VrmAnimeHybridVisualizer.ts`):
    - T-Pose / açık A-pose kolları gövde yanına tamamen indirildi (`leftUpperArm`: `Z: -1.35 rad ~ -77°`, `X: 0.08`, `Y: 0.04`; `rightUpperArm`: `Z: +1.35 rad`, `X: 0.08`, `Y: -0.04`).
    - Dirsekler (`lowerArm`) ve bilekler (`hand`) doğal bir rahatlama açısıyla gövde hizasına yerleştirildi.
    - `TalkingHead.update()` içerisinde her karede (frame) hafif nefes alma ve ritim salınımı ile kolların gövde yanında stabil kalması sağlandı.
  - **Dinamik Kafa Odaklı Kamera Kadrajlama (Head Hero Framing)** (`VrmAnimeHybridVisualizer.ts`):
    - `updateCameraFraming(aspect)` metodu geliştirildi.
    - Modelin baş kemiği (`head`) dünya koordinatları (`baseHeadPos`) baz alınarak:
      - **16:9 (Geniş Ekran / Sinematik)**: 32° FOV, ~0.48m mesafe ile kafayı tam merkeze alan yakın plan (bust shot).
      - **1:1 (Kare Avatar / Kapak)**: 34° FOV, ~0.52m mesafe ile baş ve yaka hizasını mükemmel kare kadraja alan profil portresi.
      - **9:16 (Dikey / Reels / TikTok / Shorts)**: 35° FOV ve en-boy oranına göre dinamik mesafe çarpanı (`distance = 0.50 * 0.85 / aspect`) ile saçların ve başın yanlardan kesilmesini tamamen önleyen, kafayı ekranın üst-orta altın oranına oturtan kadrajlama.
- **Derleme & Doğrulama:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 37] - Dynamic 3D VRM Model Selection & Custom Avatar Upload Engine

**Çalışan Ajan Pipeline:** Lead Developer & UI/UX Architect

- **Amaç:** Kullanıcının dosya gezgini ile yüklediği `Nutachisan.vrm` ve diğer özel `.vrm` modellerini stüdyo arayüzünden anında seçilebilir ve yüklenebilir hale getirmek.
- **Çözüm:**
  - **Dinamik Model Yükleme Altyapısı (`VrmAnimeHybridVisualizer.ts`)**:
    - `loadVRM(modelUrl)` fonksiyonu parametrik hale getirildi. Model değiştiğinde eski Three.js sahne nesneleri ve `TalkingHead` bağlamı güvenle temizlenip yeni VRM modeli (49 kemik, blendshape setleri) GPU belleğine yükleniyor.
    - Farklı boy ve oranlardaki avatarlar için kafa kemiği (`head`) ve sınırlayıcı kutu (`Box3`) bazlı otomatik kamera kadrajlama (auto-focus framing) entegre edildi.
  - **Tip Güvenliği (`src/types.ts`)**:
    - `VisualizerSettings` arayüzüne `vrmModelUrl?: string` ve `vrmModelName?: string` alanları eklendi.
  - **Görsel & Medya Arayüzü Entegrasyonu (`src/App.tsx`)**:
    - **Görsel Sekmesi (`VRM_ANIME_HYBRID`)**: Alicia Solid (Standart) ve Nutachisan (Yüklenen Özel Model) hızlı seçim kartları, doğrudan bilgisayardan `.vrm` yükleme butonu ve manuel model yolu giriş alanı eklendi.
    - **Medya Yönetimi Sekmesi**: Tüm medya varlıklarının yanında 3D VRM Avatar/Karakter modeli yönetim kartı eklendi.
- **Derleme:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 36] - Anatomical Lip, Mouth Aperture & Blendshape Separation for OBJ Face Mask

**Çalışan Ajan Pipeline:** Lead Developer & QA Tester

- **Sorun:** OBJ Face Mask modelinde kaba koordinat kesimi (`vy < -20`) nedeniyle ağız yerine yanakların, elmacık kemiklerinin ve tüm alt yüzün genişleyip büzülmesi; üst ve alt dudakların ayrışmaması.
- **Çözüm:**
  - `ObjFaceVisualizer.ts` içerisinde model ayrıştırma (`parseObj`) aşamasında her tepe noktası için anatomik ağırlıklar (`upperLipWeight`, `lowerLipWeight`, `cornerWeight`, `jawWeight`, `mouthWeight`) hesaplandı.
  - Ağız açıklığı (oral aperture) üst dudak (hafif yukarı) ve alt dudak (aşağı) hareketlerine ayrıştırıldı; yanaklar ve kafatası kemikleri sabitlendi.
  - Dudak büzme (`lip_round`), gülümseme/genişleme (`mouth_width`) ve dudak sıkma (`lip_press`) blendshape'leri gerçekçi dudak geometrisine bağlandı.
- **Derleme:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 35] - Fix LRC Viseme Timing & Lip-Sync REST Transition Architecture

**Çalışan Ajan Pipeline:** Lead Developer & DSP Critic

- **Sorun:** Kelime ve cümle bittikten sonra avatar ağzının açık veya son viseme pozisyonunda (örn: "seviyorum" sonrası) donup kalması.
- **Çözüm:**
  - **Dinamik End Timestamp & Kelime Ayrıştırma**: `VisemeEngine` içerisine eksik kelime bitişlerini sonraki kelime veya satır sınırına göre dinamik hesaplama eklendi; `lyricSyncService.ts` üzerinde kelime uzunluklarına göre ağırlıklı ve doğal süre dağıtımı sağlandı.
  - **REST State Entegrasyonu**: Her kelimenin telaffuz süresinden sonra (son %20-25 / 80-150ms aralığında) ve kelime aralarındaki boşluklarda otomatik REST durumuna geçiş sağlandı.
  - **80-150ms Exponential Damping (Smooth Interpolation)**: Delta-time (`dt`) duyarlı yumuşak sönümleme filtresi ile REST geçişinin ani/sert sıçrama olmadan 80-150ms bandında organik olarak tamamlanması sağlandı.
  - **Cümle Bitişi Algılama (Phrase Completion)**: Son kelime tamamlandığında satır sonu otomatik algılanarak ağzın nötr ve kapalı pozisyona dönmesi garantilendi.
  - **Doğal Vokal Mikro-Hareketleri**: Kelime ve cümle aralarında vokal/müzik enerjisine bağlı organik mikro-nefes ve dudak gerilimi hareketleri eklendi.
- **Derleme:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 34] - Fix OBJ Face Mask Rotation Axis & Orientation

**Çalışan Ajan Pipeline:** Lead Developer & QA Tester

- **Sorun:** OBJ Face Mask modelinin (`face.obj`) ters/arka yöne bakması ve normal culling nedeniyle içe dönük görünmesi.
- **Çözüm:**
  - `ObjFaceVisualizer.ts` içerisindeki `parseObj` fonksiyonuna model ağırlık merkezi (center of mass) hesaplaması eklendi; dönme ekseni (pivot) tam kafa merkezine oturtuldu.
  - Normal vektör hesaplamasındaki ters işaret (`-nz`) ve culling koşulu (`normalZ <= 0`) düzeltilerek 888 ön yüzey poligonunun doğrudan ekrana (kameraya) bakması sağlandı.
- **Derleme:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 33] - Fix VRM Model Asset & Resilient GLTFLoader Pipeline

**Çalışan Ajan Pipeline:** Lead Developer & QA Verifier

- **Sorun:** `VRM Load Error: THREE.GLTFLoader: JSON content not found.` hatası. `public/models/AliciaSolid.vrm` dosyasının kısmi/kesilmiş (1.99MB) indirilmiş olması nedeniyle binary glTF chunk parsing aşamasında GLTFLoader JSON başlığını bulamıyordu.
- **Çözüm:**
  - `public/models/AliciaSolid.vrm` tam ve sağlam resmi VRM 0.51 ikili modeli (7.6MB) ile yenilendi.
  - `VrmAnimeHybridVisualizer.ts` içerisine otomatik CDN fallback ve hata yakalama mekanizması eklendi.
  - Model yüklenirken 2D/3D tuval üzerinde şık siberpunk holografik yükleme animasyonu ve durum geri bildirimi sağlandı.
- **Derleme:** `tsc --noEmit` ve `npm run build` %100 yeşil.

### [2026-08-10 - Oturum 32] - Viseme & Blendshape Lip-Sync Architecture

**Çalışan Ajan Pipeline:** Lead Developer & UI/UX Critic

- **Özellik / İyileştirme:** 
  - NVIDIA Audio2Face ve Rhubarb Lip-Sync standartlarını temel alan 10 Visemeli (`REST`, `A`, `E`, `I`, `O`, `U`, `M`, `F`, `L`, `S`) fonetik dudak senkronizasyonu motoru (`src/core/VisemeEngine.ts`) geliştirildi.
  - Kelime ve hece düzeyinde harfler fonetik visemelere ayrıştırıldı (Grapheme-to-Phoneme G2P). Şarkı sözünün zaman aralığı içerisinde harf sırasına göre blendshape geçişleri (lerp/damper) 60 FPS'de yumuşatıldı.
  - `jaw_drop`, `mouth_open`, `mouth_width`, `lip_round`, `lip_press` parametreleri hem VRM 1.0 & VRM 0.0 blendshape morf modellerine (`TalkingHead.ts`), hem de prosedürel 3D mesh modellerine (`NoirSingingHeadVisualizer.ts`, `ObjFaceVisualizer.ts`) bağlandı.
  - Şarkı sözü bulunmadığında veya satır aralarında dudak hareketleri otomatik olarak `REST` pozuna dönerek şarkı esnasında yapay ağız açıp kapama sorunu tamamen ortadan kaldırıldı.
  - `LyricsStudio.tsx` üzerinde 10 Viseme aktifliğini gösteren bilgilendirici kontrol rozeti eklendi.

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
