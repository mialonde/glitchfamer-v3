# GlitchFramer 2.0 AI Agent Guidelines & Architecture Rules (AGENTS.md)

Bu dosya, GlitchFramer 2.0 (VidFramer) projesi üzerinde çalışan tüm yapay zeka ajanları (AI Agents) için temel geliştirme prensiplerini, mimari kurallarını ve rollerini tanımlar.

---

## 🎯 1. Temel Geliştirme İlkeleri (Core Development Principles)

1. **Tip Güvenliği (Strict TypeScript 5.8+)**:
   - `src/types.ts` içerisindeki arayüzler ana gerçeği (single source of truth) temsil eder.
   - Tüm yeni parametreler ve görselleştirici ayarları tip güvenliği ile tanımlanmalıdır.
   - Opsiyonel alanlarda (`?? 0` veya `Boolean()`) güvenli geri dönüşler uygulanmalı; `NaN` kaynaklı Canvas koordinat çökmesi engellenmelidir.

2. **Görsel / Ses Performansı & 60 FPS Render**:
   - Canvas çizim döngülerinde (render loop) gereksiz nesne oluşturmaktan (object allocation / GC pause) kaçının.
   - Web Audio `AudioContext` ve `AnalyserNode` bağlantıları component unmount veya ses kaldırılma anında düzgünce kapatılmalı ve bellek sızıntıları (`revokeObjectURL`) önlenmelidir.

3. **İki Katmanlı Render Mimarisi**:
   - **Sunucu Tarafı (SSR)**: Express + Node Canvas + FFmpeg H.264/AAC MP4 render pipeline (`server/renderEngine.ts`).
   - **İstemci Tarafı (CSR)**: MediaRecorder API ile yerel WebM kaydı.

4. **Konfigürasyon ve Profil Kalıcılığı**:
   - `VisualizerSettings` profilleri `localStorage` üzerinde `vidframer_visualizer_profiles_v1` anahtarıyla güvenli bir şekilde saklanır.
   - Küratörlü yerleşik (built-in) profiller ve kullanıcı profilleri tam tip güvenliğiyle yönetilir.

---

## 🤖 2. Uzman Ajan Rolleri (Specialized Agent Roles)

- **Lead Developer**: Mimari bütünlüğü, dosya yapısını ve temel modül entegrasyonlarını denetler.
- **Code Auditor**: Bellek sızıntılarını, potansiyel null/undefined hatalarını ve tip uyumluluğunu inceler.
- **QA Tester & Verifier**: `lint_applet` (`tsc --noEmit`) ve `compile_applet` (`npm run build`) adımlarının %100 yeşil tamamlanmasını sağlar.
- **UI/UX & DSP Critic**: Brutalist, cyberpunk estetik ve Spotify -14 LUFS mastering hassasiyetini korur.
- **Documentation Agent**: Yapılan geliştirmeleri `MEMORY.md`, `FEATURES.md` ve `CHANGELOG.md` belgelerine işler.

---

## 🔄 3. Yapay Zeka Ajanı Çalışma Döngüsü (Agent Workflow)

1. **Başlangıç**: `MEMORY.md` ve `AGENTS.md` dosyalarını inceleyerek güncel durumu ve mimariyi kavra.
2. **Geliştirme**: İstenen özellikleri tek odaklı, modüler ve temiz bir şekilde uygula.
3. **Doğrulama**: `npx tsc --noEmit` ve `npm run build` ile hatasız derlemeyi onayla.
4. **Güncelleme**: `MEMORY.md` üzerindeki İlerleme Logu'na yeni oturumu, değişiklikleri ve derleme sonucunu ekle.
