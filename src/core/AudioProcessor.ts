import { AudioEvents } from '../types';
import { AudioAnalysisCore } from './AudioAnalysisEngine';

export class AudioProcessor {
  private analyser: AnalyserNode;
  private vocalAnalyser?: AnalyserNode;
  private dataArray: Uint8Array;
  private timeDomainArray: Uint8Array;
  private vocalDataArray?: Uint8Array;
  private core: AudioAnalysisCore;

  constructor(analyser: AnalyserNode, vocalAnalyser?: AnalyserNode) {
    this.analyser = analyser;
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.75;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomainArray = new Uint8Array(this.analyser.fftSize);
    this.core = new AudioAnalysisCore();
    
    if (vocalAnalyser) {
      this.vocalAnalyser = vocalAnalyser;
      this.vocalAnalyser.fftSize = 1024;
      this.vocalAnalyser.smoothingTimeConstant = 0.85;
      this.vocalDataArray = new Uint8Array(this.vocalAnalyser.frequencyBinCount);
    }
  }

  public process(currentTime: number, delta: number): AudioEvents {
    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.timeDomainArray);

    if (this.vocalAnalyser && this.vocalDataArray) {
      this.vocalAnalyser.getByteFrequencyData(this.vocalDataArray);
    }

    // 1. Gerçek Zamanlı Waveform RMS Enerji Hesabı (Physical Acoustic Power)
    let sumSq = 0;
    const len = this.timeDomainArray.length;
    for (let i = 0; i < len; i++) {
      const norm = (this.timeDomainArray[i] - 128) / 128;
      sumSq += norm * norm;
    }
    const rawRMS = Math.min(1, Math.sqrt(sumSq / len) * 2.8);

    // 2. Ortak AudioAnalysisCore üzerinden AudioEvents üretimi
    return this.core.process(
      this.dataArray,
      rawRMS,
      currentTime,
      delta,
      this.vocalDataArray
    );
  }

  public static createEmptyAudioEvents(): AudioEvents {
    return {
      kick: 0,
      snare: 0,
      hihat: 0,
      energy: 0,
      bassEnergy: 0,
      midEnergy: 0,
      highEnergy: 0,
      trebleEnergy: 0,
      vocalEnergy: 0,
      vocalRMS: 0,
      spectrum: new Array(64).fill(0),
      time: 0,
      delta: 0,
      beat: false,
      isSilence: true
    };
  }

  public getAudioEvents(currentTime: number, isPlaying: boolean, delta: number = 1/60): AudioEvents {
    if (!isPlaying) {
      return AudioProcessor.createEmptyAudioEvents();
    }
    return this.process(currentTime, delta);
  }

  public reset(): void {
    this.core.reset();
  }
}

