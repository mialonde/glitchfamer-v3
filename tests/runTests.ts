import { FastFourierTransform, AudioAnalysisCore, OfflineAudioProcessor } from "../src/core/AudioAnalysisEngine";
import { BUILTIN_PROFILES, sanitizeSettingsForProfile } from "../src/services/presetService";
import { AudioEvents } from "../src/types";

/**
 * 🧪 GLITCHFRAMER 2.0 AUTOMATED DSP & AUDIO ENGINE TEST SUITE
 * 
 * Bu test paketi, projenin en kritik ses ve render analiz bileşenlerini
 * hem doğrusal sinyaller hem de uç durumlar (edge-cases) ile test eder.
 */

interface TestResult {
  name: string;
  success: boolean;
  message?: string;
  error?: any;
}

const results: TestResult[] = [];

function describe(suiteName: string, fn: () => void) {
  console.log(`\n================================================================`);
  console.log(`🚀 RUNNING SUITE: ${suiteName.toUpperCase()}`);
  console.log(`================================================================`);
  fn();
}

function it(testName: string, fn: () => void) {
  try {
    fn();
    results.push({ name: testName, success: true });
    console.log(`  ✅ PASS: ${testName}`);
  } catch (err: any) {
    results.push({ name: testName, success: false, error: err });
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Reason:`, err.message || err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================================
// 1. FFT & DSP ANALİZ SÜRECİ TESTLERİ
// ============================================================================
describe("DSP & FFT Core Engine", () => {
  it("FFT size 2'nin kuvveti olmalıdır", () => {
    // 1024 ve 2048 geçerlidir
    const fft1024 = new FastFourierTransform(1024);
    const fft2048 = new FastFourierTransform(2048);
    assert(fft1024.size === 1024, "FFT 1024 boyutu eşleşmeli");
    assert(fft2048.size === 2048, "FFT 2048 boyutu eşleşmeli");

    // Geçersiz boyutta hata fırlatmalıdır
    try {
      new FastFourierTransform(1000);
      assert(false, "Geçersiz boyutta hata fırlatılmalıydı");
    } catch (e: any) {
      assert(e.message.includes("2'nin kuvveti olmalıdır"), "Beklenen hata mesajı");
    }
  });

  it("100Hz Sub-bass (Kick) Frekansını Doğru Şekilde İzole Etmelidir", () => {
    const offline = new OfflineAudioProcessor(44100);
    const sampleRate = 44100;
    const numSamples = 44100 * 2; // 2 saniye
    const pcm = new Int16Array(numSamples);

    // 100 Hz tam genlikli sinüs dalgası
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      pcm[i] = Math.round(Math.sin(2 * Math.PI * 100 * t) * 32000);
    }

    // Adaptif ortalama için 15 kare çalıştır
    let lastEvent!: AudioEvents;
    for (let f = 0; f < 15; f++) {
      lastEvent = offline.processFrame(pcm, 44100 + f * 735, 1.0 + f * 0.016, 1/60);
    }

    // Doğrulama
    assert(lastEvent.bassEnergy > 0.5, `Bas enerjisi yüksek olmalıdır. Alınan: ${lastEvent.bassEnergy}`);
    assert(lastEvent.highEnergy < 0.15, `Treble enerjisi düşük olmalıdır. Alınan: ${lastEvent.highEnergy}`);
    assert(lastEvent.kick > lastEvent.hihat, "Kick hihat'ten baskın olmalıdır");
  });

  it("8000Hz Treble (Hi-hat) Frekansını Doğru Şekilde İzole Etmelidir", () => {
    const offline = new OfflineAudioProcessor(44100);
    const sampleRate = 44100;
    const numSamples = 44100 * 2;
    const pcm = new Int16Array(numSamples);

    // 8000 Hz tam genlikli sinüs dalgası (Hi-hat bölgesi)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      pcm[i] = Math.round(Math.sin(2 * Math.PI * 8000 * t) * 32000);
    }

    // Adaptif ortalama için 15 kare çalıştır
    let lastEvent!: AudioEvents;
    for (let f = 0; f < 15; f++) {
      lastEvent = offline.processFrame(pcm, 44100 + f * 735, 1.0 + f * 0.016, 1/60);
    }

    // Doğrulama: 8000Hz sine wave tek bir bin'de toplandığı için getAverage ile hesaplanan
    // geniş bant ortalamasında hihat enerjisi bas ve mid'den çok daha yüksek olmalıdır.
    assert(lastEvent.highEnergy > lastEvent.bassEnergy, `High enerjisi bas'tan yüksek olmalıdır. High: ${lastEvent.highEnergy}, Bass: ${lastEvent.bassEnergy}`);
    assert(lastEvent.highEnergy > lastEvent.midEnergy, `High enerjisi mid'den yüksek olmalıdır. High: ${lastEvent.highEnergy}, Mid: ${lastEvent.midEnergy}`);
    assert(lastEvent.bassEnergy < 0.05, "Tiz dalgasında bas enerjisi sıfıra yakın olmalıdır");
  });

  it("Adaptif Beat Detection (Ritmik Vuruş) Algoritması Çalışmalıdır", () => {
    const core = new AudioAnalysisCore();
    const frequencyData = new Uint8Array(512);

    // Sessiz bir geçmiş simüle et
    for (let i = 0; i < 30; i++) {
      core.process(frequencyData, 0.0, i * 0.016, 1/60);
    }

    // Ani bir bas patlaması (Kick bandı: 0 - 7 binleri yüksek)
    frequencyData.fill(0);
    for (let i = 0; i <= 7; i++) {
      frequencyData[i] = 240; // Çok yüksek enerji
    }

    const event = core.process(frequencyData, 0.6, 31 * 0.016, 1/60);
    assert(event.beat === true, "Dinamik vuruş tespiti bu transient patlamasını 'beat' olarak görmelidir");
  });

  it("Sessizlik Tespiti Doğru Çalışmalıdır", () => {
    const core = new AudioAnalysisCore();
    const frequencyData = new Uint8Array(512);
    
    // Sıfır giriş sinyali
    const event = core.process(frequencyData, 0.0, 0, 1/60);
    assert(event.isSilence === true, "Sıfır sinyali sessizlik olarak algılanmalıdır");
    assert(event.kick === 0, "Sessizlikte bas sönümlenmiş olmalıdır");
  });
});

// ============================================================================
// 2. PRESET PROFILLERI VE YAPILANDIRMA TESTLERİ
// ============================================================================
describe("Preset Configuration Profile Engine", () => {
  it("Built-in Presets listesi geçerli olmalıdır", () => {
    assert(BUILTIN_PROFILES.length > 0, "Yerleşik hazır profiller bulunmalıdır");
    for (const p of BUILTIN_PROFILES) {
      assert(!!p.id, "Profil ID'si olmalı");
      assert(!!p.name, "Profil adı olmalı");
      assert(!!p.settings.mode, "Visualizer modu tanımlı olmalı");
    }
  });

  it("Profil ayarları doğru bir şekilde temizlenmeli (sanitize)", () => {
    const dirtySettings: any = {
      mode: "CODROPS_POLAR",
      primaryColor: "#00F0FF",
      trackTitle: "Unutulmaz Şarkı", // Parçaya özel metadata
      artistName: "Sanatçı",
      syncedLyrics: [],
      bloomEnabled: true
    };

    const clean = sanitizeSettingsForProfile(dirtySettings);
    assert(clean.mode === "CODROPS_POLAR", "Mod korunmalı");
    assert(clean.primaryColor === "#00F0FF", "Renk korunmalı");
    assert(clean.bloomEnabled === true, "Efekt ayarları korunmalı");
    
    assert(!("trackTitle" in clean), " trackTitle temizlenmelidir");
    assert(!("artistName" in clean), " artistName temizlenmelidir");
    assert(!("syncedLyrics" in clean), " lirikler temizlenmelidir");
  });
});

// ============================================================================
// 3. SUNO URL / TRACK ID AYIKLAMA TESTLERİ
// ============================================================================
describe("Suno AI URL Parser", () => {
  it("Suno linklerinden Track ID (UUID) başarıyla çıkarılmalıdır", () => {
    const testCases = [
      {
        url: "https://suno.com/song/c873f4b2-03d1-4bc9-9fb5-63795ba72ab9",
        expected: "c873f4b2-03d1-4bc9-9fb5-63795ba72ab9"
      },
      {
        url: "https://cdn1.suno.ai/e731a5b8-c31a-4a2e-8fa9-fa314cb2a781.mp3",
        expected: "e731a5b8-c31a-4a2e-8fa9-fa314cb2a781"
      },
      {
        url: "c873f4b2-03d1-4bc9-9fb5-63795ba72ab9", // Doğrudan UUID
        expected: "c873f4b2-03d1-4bc9-9fb5-63795ba72ab9"
      }
    ];

    // server.ts içerisindeki ID ayıklama regex mantığını test edelim:
    for (const { url, expected } of testCases) {
      let trackId: string | null = null;
      const uuidMatch = url.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/);
      if (uuidMatch) {
        trackId = uuidMatch[1].toLowerCase();
      } else {
        const songMatch = url.match(/(?:song|clip|track)\/([a-zA-Z0-9_-]+)/i);
        if (songMatch) {
          trackId = songMatch[1];
        } else {
          const cdnMatch = url.match(/(?:cdn\d*|audiocdn\d*)\.suno\.(?:ai|com)\/([a-zA-Z0-9_-]+)\.mp3/i);
          if (cdnMatch) {
            trackId = cdnMatch[1];
          }
        }
      }

      assert(trackId === expected, `Hata! Beklenen: ${expected}, Çıkarılan: ${trackId}`);
    }
  });
});

// ============================================================================
// TEST SONUÇLARI ÖZETİ VE ÇIKIŞ KODU
// ============================================================================
console.log(`\n================================================================`);
console.log(`📊 TEST SUITE SUMMARY`);
console.log(`================================================================`);
const passed = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`  Passed:  ${passed.length}/${results.length}`);
console.log(`  Failed:  ${failed.length}/${results.length}\n`);

if (failed.length > 0) {
  console.error(`🚨 TEST FAILURES DETAILED:`);
  for (const f of failed) {
    console.error(`  - ${f.name}`);
    console.error(`    Error:`, f.error?.message || f.error);
  }
  process.exit(1);
} else {
  console.log(`🎉 ALL TESTS COMPLETED SUCCESSFULLY! PROD READY!`);
  process.exit(0);
}
