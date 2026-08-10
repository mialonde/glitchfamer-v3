import { AudioEvents } from '../types';

export class AudioProcessor {
  private analyser: AnalyserNode;
  private vocalAnalyser?: AnalyserNode;
  private dataArray: Uint8Array;
  private vocalDataArray?: Uint8Array;
  private energyHistory: number[] = [];
  private readonly historySize = 30;
  private spectrumArray: number[] = new Array(64).fill(0);

  // Sönümlenmiş değerler
  private smoothKick = 0;
  private smoothSnare = 0;
  private smoothHihat = 0;
  private smoothEnergy = 0;

  constructor(analyser: AnalyserNode, vocalAnalyser?: AnalyserNode) {
    this.analyser = analyser;
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.75;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    if (vocalAnalyser) {
      this.vocalAnalyser = vocalAnalyser;
      this.vocalAnalyser.fftSize = 1024;
      this.vocalAnalyser.smoothingTimeConstant = 0.85;
      this.vocalDataArray = new Uint8Array(this.vocalAnalyser.frequencyBinCount);
    }
  }

  public process(currentTime: number, delta: number): AudioEvents {
    this.analyser.getByteFrequencyData(this.dataArray);
    if (this.vocalAnalyser && this.vocalDataArray) {
      this.vocalAnalyser.getByteFrequencyData(this.vocalDataArray);
    }

    // 1. Frekans Ayrıştırma (3 Ana Bant: Bass 20-250Hz, Mid 250-4000Hz, Treble 4000-20000Hz)
    const rawKick = Math.min(1, this.getAverage(0, 7) * 1.6);     // Sub-bass (20 - 250 Hz)
    const rawSnare = Math.min(1, this.getAverage(7, 93) * 1.8);   // Mid / Vokal / Harmonics (250 - 4000 Hz)
    
    // Vocal band extraction
    let rawVocal = 0;
    if (this.vocalAnalyser && this.vocalDataArray) {
      // 500Hz to 3000Hz via vocal filtered analyser
      rawVocal = Math.min(1, this.getAverage(23, 140, this.vocalDataArray) * 2.5);
    } else {
      // Fallback
      rawVocal = Math.min(1, this.getAverage(23, 140) * 2.2); 
    }
    const rawHihat = Math.min(1, this.getAverage(93, 465) * 3.5); // Treble / Hi-hat / Air (4000 - 20000 Hz)

    const rawEnergy = Math.min(1, (rawKick * 1.2 + rawSnare + rawHihat) / 3);

    // 2. Yumuşatma (Lerp)
    this.smoothKick += (rawKick - this.smoothKick) * 0.28;
    this.smoothSnare += (rawSnare - this.smoothSnare) * 0.25;
    this.smoothHihat += (rawHihat - this.smoothHihat) * 0.3;
    this.smoothEnergy += (rawEnergy - this.smoothEnergy) * 0.25;

    // 3. Dinamik Vuruş Tespiti (Beat Detection)
    this.energyHistory.push(rawKick);
    if (this.energyHistory.length > this.historySize) this.energyHistory.shift();
    let sumEnergy = 0;
    for (let i = 0; i < this.energyHistory.length; i++) {
      sumEnergy += this.energyHistory[i];
    }
    const avgEnergy = this.energyHistory.length > 0 ? sumEnergy / this.energyHistory.length : 0;
    const isBeat = rawKick > (avgEnergy * 1.22) && rawKick > 0.12;

    // 4. Sessizlik Kontrolü (isSilence)
    const isSilence = rawEnergy < 0.012;

    // 5. Spektrum Normalizasyonu (64 kanal)
    for (let i = 0; i < 64; i++) {
      const idx = Math.min(this.dataArray.length - 1, Math.floor(i * 3.6));
      const val = (this.dataArray[idx] / 255) * (1 + (i / 64) * 0.75);
      this.spectrumArray[i] = Math.min(1, Math.max(0, val));
    }

    return {
      kick: this.smoothKick,
      snare: this.smoothSnare,
      hihat: this.smoothHihat,
      energy: this.smoothEnergy,
      bassEnergy: rawKick,
      midEnergy: rawSnare,
      highEnergy: rawHihat,
      trebleEnergy: rawHihat,
      vocalEnergy: rawVocal,
      spectrum: [...this.spectrumArray],
      time: currentTime,
      delta: delta,
      beat: isBeat,
      isSilence
    };
  }

  private getAverage(start: number, end: number, data: Uint8Array = this.dataArray): number {
    let sum = 0;
    const actualEnd = Math.min(end, data.length);
    const count = actualEnd - start;
    if (count <= 0) return 0;
    for (let i = start; i < actualEnd; i++) sum += data[i];
    return (sum / count) / 255;
  }
}
