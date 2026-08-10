# GlitchFramer 2.0 Test Dokümanı (Testing Guide)

GlitchFramer uygulaması için test prosedürleri ve kontrol listeleri.

---

## 1. Manuel Test Prosedürleri (Manual Testing Procedures)

### A. Tip Güvenliği ve Derleme Testi
```bash
# 1. TypeScript derleyici kontrolü (Sıfır hata olmalıdır)
npx tsc --noEmit

# 2. Üretim derleme testi (Vite SPA + esbuild server bundle)
npm run build
```

### B. Sunucu Sağlık ve Motor Kontrolü
```bash
# Geliştirme sunucusunu başlatın
npm run dev

# Sağlık endpoint'ini test edin
curl http://localhost:3000/api/health

# Engine status kontrolü
curl http://localhost:3000/api/render/engine-status
```

---

## 2. Ses ve Görsel Doğrulama Kontrol Listesi (Validation Checklist)

| Test Adımı | Beklenen Davranış | Durum |
| :--- | :--- | :--- |
| **MP3/WAV Yükleme** | Dosya yüklendiğinde süre doğru okunmalı, zaman çubuğu güncellenmeli. | PASS |
| **Visualizer Değişimi** | 11 mod arasında geçiş yapıldığında Canvas akıcı şekilde değişmeli. | PASS |
| **Mastering A/B Testi** | `BYPASS` ile `PHONK` / `SPOTIFY` modları arasında anlık ses rengi değişimi duyulmalı. | PASS |
| **FX Sliders** | RGB Split, Vignette, Scanlines sürgüleri sürüklendiğinde görüntü canlı tepki vermeli. | PASS |
| **AI Magic Sync** | Lirikler şarkı sözü zamanlamasına göre kelime kelime ekrana düşmeli. | PASS |
| **FFmpeg MP4 Render** | Render MP4 butonuna tıklandığında %0'dan %100'e ilerlemeli ve `.mp4` indirmelidir. | PASS |

---

## 3. Tarayıcı Uyumluluk Kontrol Listesi (Browser Compatibility)

| Tarayıcı | Web Audio API | HTML5 Canvas 2D | MediaRecorder | Durum |
| :--- | :---: | :---: | :---: | :---: |
| **Google Chrome (v110+)** | EVET | EVET | EVET | Tam Uyumlu |
| **Mozilla Firefox (v110+)**| EVET | EVET | EVET | Tam Uyumlu |
| **Microsoft Edge (v110+)** | EVET | EVET | EVET | Tam Uyumlu |
| **Apple Safari (v16.4+)**  | EVET | EVET | EVET | Tam Uyumlu |

---

## 4. Uç Durumlar (Edge Cases)

- **Boş veya Bozuk Ses Dosyası**: Uygulama çökmemeli, kullanıcıya hata mesajı göstermelidir.
- **Tarayıcı Sekme Değişikliği (Tab Hiding)**: Sekme gizlendiğinde `visibilitychange` dinleyicisi gereksiz kaynak tüketimini durdurmalıdır.
- **İnternet Bağlantısı Olmaması**: AI Magic Sync çağrısı başarısız olduğunda ritmik fallback mekanizması devreye girmelidir.
