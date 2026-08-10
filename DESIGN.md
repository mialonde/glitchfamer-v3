# GlitchFramer 2.0 Tasarım Sistemi (Design System & Aesthetics)

GlitchFramer, ham dijital estetiği, yüksek kontrastı ve tipografik vurguyu temel alan **Neubrutalism (Yeni Brütalizm)** ve **Cyberpunk / Underground Synth** tasarım felsefesiyle inşa edilmiştir.

---

## 1. Tasarım Felsefesi (Neubrutalism & Cyberpunk)

- **Ham ve Keskin Çizgiler**: Yumuşatılmış yumuşak kıvrımlar yerine keskin kenarlar, yüksek konturlu çerçeveler (`border-2`, `border-white/20`).
- **Koyu Antrasit Zemin**: Derin siyah (`#000000`) ve mat antrasit (`#050505`, `#121212`) zemin üzerinde patlayan endüstriyel sarı ve neon vurgular.
- **Tipografik Baskınlık**: Bilgi hiyerarşisinde devasa font boyutları, monospaced teknik etiketler ve yüksek görünürlük.

---

## 2. Renk Paleti (Color Palette)

| Renk İsmi | Hex Kodu | Kullanım Alanı |
| :--- | :--- | :--- |
| **Vorteks Siyahı** | `#000000` | Ana Canvas ve Uygulama Arka Planı |
| **Antrasit Mat** | `#050505` / `#121212` | Panel Zeminleri, Kartlar ve Kontrol Alanları |
| **Endüstriyel Sarı (Primary)** | `#FFD700` | Ana Vurgular, Çerçeveler, Aktif Modlar, Butonlar |
| **Endüstriyel Pembe/Kırmızı** | `#FF0055` | Uyarılar, RGB Split Kırmızı Kanalı, Yüksek Enerji |
| **Siber Camgöbeği (Secondary)** | `#00FFFF` | İkincil Dalga Boyları, RGB Split Mavi Kanalı |
| **Brütalist Beyaz** | `#E4E3E0` | Tipografi, Metinler ve Çizgi Izgaraları |
| **Mat Gri** | `#262626` | Pasif Sınırlar ve İnce Çizgiler |

---

## 3. Tipografi (Typography)

- **Ana Başlıklar & Tipografik Visualizer**: `"Space Grotesk", sans-serif` (Bold 700 / Black 900)
- **Teknik Etiketler & Kod Alanları**: `"JetBrains Mono", "Fira Code", monospace`
- **Arayüz Metinleri**: `"Inter", sans-serif`

---

## 4. Bileşen Kılavuzu (Component Guidelines)

1. **Butonlar ve Kontroller**:
   - `border-2 border-yellow-400/30` ile belirgin sınır.
   - Hover durumunda neon ışıma (`shadow-[0_0_15px_rgba(255,215,0,0.3)]`) ve arka plan renk değişimi.
2. **Sliders & Range Inputs**:
   - İnce teknik çizgi zemin ve yüksek kontrastlı sürgü başlığı.
3. **Canvas Önizleme Kartı**:
   - Keskin brütalist çerçeve, oran değişimlerinde yumuşak CSS geçişleri (`transition-all duration-300`).

---

## 5. Erişilebilirlik (Accessibility)

- **Yüksek Kontrast**: Tüm metinler WCAG AAA standartlarında koyu zemin üzerinde yüksek kontrast oranına sahiptir.
- **Odak Yönetimi**: Klavye ile gezilebilir form elemanları ve buton odak sınırları (`focus:outline-none focus:ring-2 focus:ring-yellow-400`).
