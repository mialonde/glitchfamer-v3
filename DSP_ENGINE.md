# GlitchFramer 2.0 DSP Motoru Dokümanı (DSP Engine)

GlitchFramer, Web Audio API ve sunucu tarafı PCM matematiksel çözücü tabanlı iki yönlü bir Dijital Sinyal İşleme (DSP) mimarisine sahiptir.

---

## 1. Sinyal Akışı (Signal Flow)

```
Input Audio ──> Biquad Filter (Low Shelf) ──> Biquad Filter (Mid Peaking)
                      │
                      ▼
            Biquad Filter (High Shelf) ──> WaveShaper (Analog Saturation)
                      │
                      ▼
          DynamicsCompressor (Limiter) ──> Master Gain ──> AnalyserNode & Output
```

---

## 2. Filtre Mimarisi (Filters & Equalizer)

Mastering motoru 3 bantlı hassas parametrik EQ aşamalarından oluşur:

1. **Sub & Bass Low-Shelf Filtresi**:
   - **Frekans**: `85 Hz`
   - **Tipi**: `lowshelf`
   - **Amacı**: Sub-bass ve 808 kick frekanslarını güçlendirmek veya zayıflatmak.
2. **Mid Presence Peaking Filtresi**:
   - **Frekans**: `2500 Hz`
   - **Q Faktörü**: `1.0`
   - **Tipi**: `peaking`
   - **Amacı**: Vokal netliğini ve enstrüman varlığını ön plana çıkarmak.
3. **High Shelf Air Filtresi**:
   - **Frekans**: `10500 Hz`
   - **Tipi**: `highshelf`
   - **Amacı**: Üst frekans parıltısını (brilliance/air) artırmak veya yumuşatmak.

---

## 3. Analog Satürasyon Tasarımı (WaveShaper Saturation)

Sese sıcaklık ve analog kaset/tüp karakteri kazandırmak için `WaveShaperNode` kullanılmaktadır (`oversample = '4x'`).

### Transfer Fonksiyonu (Tanh Yaklaşımı):
```typescript
const n_samples = 44100;
const curve = new Float32Array(n_samples);
const k = amount * 50;
const deg = Math.PI / 180;

for (let i = 0; i < n_samples; ++i) {
  const x = (i * 2) / n_samples - 1;
  // Soft tube/analog saturation transfer curve
  curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
}
```

---

## 4. Kompresör ve Limiter Tasarımı (Dynamics Compressor)

Mastering aşamasının son adımı, parçanın ses seviyesini sabitleyen ve dijital bozulmayı (clipping) engelleyen multiband tarzı kompresör/limiter modülüdür:

- **Attack Süresi**: `0.015 s (15 ms)` - Hızlı transient yanıtı.
- **Release Süresi**: `0.12 s (120 ms)` - Ritmik nefes alma ve akıcı salınım.
- **Knee (Diz)**: `6 dB` - Soft-knee geçişi.

---

## 5. Frekans Ayrıştırma & Beat Detection (`AudioProcessor`)

`AnalyserNode` (FFT Size: `1024`, Smoothing: `0.75`) üzerinden gelen spektrum verisi 3 temel bantta işlenir:

- **Kick (Sub/Bass)**: Bin `0 - 10` aralığı katsayı ile çarpılarak hesaplanır.
- **Snare (Mid/Vokal)**: Bin `10 - 65` aralığı işlenir.
- **Hi-Hat (High/Air)**: Bin `65 - 240` aralığı işlenir.

Dinamik beat tespiti için son 30 karelik enerji geçmişi tutulur (`energyHistory`). Anlık kick seviyesi ortalama enerjinin `%122`'sini aştığında `beat = true` bayrağı tetiklenir.
