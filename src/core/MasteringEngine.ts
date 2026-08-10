import { MasteringSettings, MasteringPreset } from '../types';

export class MasteringEngine {
  private ctx: AudioContext;
  private lowShelf: BiquadFilterNode;
  private midPeaking: BiquadFilterNode;
  private highShelf: BiquadFilterNode;
  private waveShaper: WaveShaperNode;
  private compressor: DynamicsCompressorNode;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  private streamDestination: MediaStreamAudioDestinationNode;
  private sourceConnected: boolean = false;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  public static DEFAULT_SETTINGS: MasteringSettings = {
    preset: 'BYPASS',
    enabled: false,
    bassBoost: 0,
    midPresence: 0,
    trebleAir: 0,
    saturation: 0,
    compThreshold: 0,
    compRatio: 1,
    outputGain: 1.0,
    lufsTarget: -14
  };

  public static PRESETS: Record<MasteringPreset, MasteringSettings> = {
    SPOTIFY: {
      preset: 'SPOTIFY',
      enabled: true,
      bassBoost: 2.8,
      midPresence: 1.2,
      trebleAir: 2.2,
      saturation: 0.18,
      compThreshold: -14,
      compRatio: 3.2,
      outputGain: 1.05,
      lufsTarget: -14
    },
    YOUTUBE: {
      preset: 'YOUTUBE',
      enabled: true,
      bassBoost: 4.5,
      midPresence: 1.8,
      trebleAir: 3.5,
      saturation: 0.28,
      compThreshold: -13,
      compRatio: 4.0,
      outputGain: 1.1,
      lufsTarget: -14
    },
    PHONK: {
      preset: 'PHONK',
      enabled: true,
      bassBoost: 8.5,
      midPresence: -1.0,
      trebleAir: 5.0,
      saturation: 0.65,
      compThreshold: -9,
      compRatio: 8.0,
      outputGain: 1.25,
      lufsTarget: -9
    },
    WARM_TAPE: {
      preset: 'WARM_TAPE',
      enabled: true,
      bassBoost: 3.2,
      midPresence: 2.2,
      trebleAir: -1.5,
      saturation: 0.5,
      compThreshold: -16,
      compRatio: 2.5,
      outputGain: 1.0,
      lufsTarget: -16
    },
    BYPASS: {
      preset: 'BYPASS',
      enabled: false,
      bassBoost: 0,
      midPresence: 0,
      trebleAir: 0,
      saturation: 0,
      compThreshold: 0,
      compRatio: 1,
      outputGain: 1.0,
      lufsTarget: -14
    }
  };

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    // 1. Low Shelf (Sub & Bass Punch @ 85Hz)
    this.lowShelf = ctx.createBiquadFilter();
    this.lowShelf.type = 'lowshelf';
    this.lowShelf.frequency.value = 85;

    // 2. Mid Peaking (Presence & Clarity @ 2500Hz)
    this.midPeaking = ctx.createBiquadFilter();
    this.midPeaking.type = 'peaking';
    this.midPeaking.frequency.value = 2500;
    this.midPeaking.Q.value = 1.0;

    // 3. High Shelf (Air & Brilliance @ 10500Hz)
    this.highShelf = ctx.createBiquadFilter();
    this.highShelf.type = 'highshelf';
    this.highShelf.frequency.value = 10500;

    // 4. Analog Saturation (WaveShaper)
    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.oversample = '4x';
    this.updateDistortionCurve(MasteringEngine.DEFAULT_SETTINGS.saturation);

    // 5. Multiband-Style Mastering Compressor / Limiter
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.attack.value = 0.015; // 15ms
    this.compressor.release.value = 0.12; // 120ms
    this.compressor.knee.value = 6;

    // 6. Master Output Gain
    this.masterGain = ctx.createGain();

    // 7. Spectrum Analyser
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.8;

    // 8. Stream Destination (for Recording Canvas + Mastered Audio together!)
    this.streamDestination = ctx.createMediaStreamDestination();

    // DSP CHAIN BAĞLANTISI:
    // lowShelf -> midPeaking -> highShelf -> waveShaper -> compressor -> masterGain -> [analyser, destination, streamDestination]
    this.lowShelf.connect(this.midPeaking);
    this.midPeaking.connect(this.highShelf);
    this.highShelf.connect(this.waveShaper);
    this.waveShaper.connect(this.compressor);
    this.compressor.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.masterGain.connect(ctx.destination);
    this.masterGain.connect(this.streamDestination);

    this.updateSettings(MasteringEngine.DEFAULT_SETTINGS);
  }

  public connectSource(audioElement: HTMLAudioElement) {
    if (this.sourceConnected && this.sourceNode) return;
    try {
      this.sourceNode = this.ctx.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.lowShelf);
      this.sourceConnected = true;
    } catch (e) {
      console.warn("Audio source already connected or failed to connect:", e);
    }
  }

  public getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  public getAudioStreamTrack(): MediaStreamTrack {
    return this.streamDestination.stream.getAudioTracks()[0];
  }

  public getReduction(): number {
    return this.compressor.reduction;
  }

  public updateSettings(settings: MasteringSettings) {
    const isBypass = !settings.enabled || settings.preset === 'BYPASS';

    this.lowShelf.gain.setTargetAtTime(isBypass ? 0 : settings.bassBoost, this.ctx.currentTime, 0.05);
    this.midPeaking.gain.setTargetAtTime(isBypass ? 0 : settings.midPresence, this.ctx.currentTime, 0.05);
    this.highShelf.gain.setTargetAtTime(isBypass ? 0 : settings.trebleAir, this.ctx.currentTime, 0.05);

    this.updateDistortionCurve(isBypass ? 0 : settings.saturation);

    this.compressor.threshold.setTargetAtTime(isBypass ? 0 : settings.compThreshold, this.ctx.currentTime, 0.05);
    this.compressor.ratio.setTargetAtTime(isBypass ? 1 : settings.compRatio, this.ctx.currentTime, 0.05);

    this.masterGain.gain.setTargetAtTime(isBypass ? 1.0 : settings.outputGain, this.ctx.currentTime, 0.05);
  }

  private updateDistortionCurve(amount: number) {
    if (amount <= 0) {
      this.waveShaper.curve = null;
      return;
    }

    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const k = amount * 50;
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      // Soft tube/analog saturation transfer curve (tanh approximation)
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    this.waveShaper.curve = curve;
  }
}
