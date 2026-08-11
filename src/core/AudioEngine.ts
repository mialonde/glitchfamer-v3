import { MasteringSettings, MasteringPreset, AudioEvents, VisualizerSettings } from '../types';
import { AudioProcessor } from './AudioProcessor';

export interface AudioEnginePlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  audioUrl: string | null;
  trackTitle: string;
  artistName: string;
  isLoaded: boolean;
  reduction: number;
  masteringSettings: MasteringSettings;
}

export type AudioEngineStateListener = (state: AudioEnginePlaybackState) => void;

/**
 * 🎛️ AudioEngine (Unified Audio Controller)
 * 
 * Mimari Şema:
 * AudioEngine
 *  ├── AudioContext & Lifecycle (Lazy init, gesture resume, safe close)
 *  ├── MediaSource (Single MediaElementSource & audio element encapsulation)
 *  ├── Analyser (Master FFT Analyser + Vocal Bandpass Extraction Analyser)
 *  ├── Master Chain (LowShelf -> MidPeak -> HighShelf -> WaveShaper -> Compressor -> MasterGain)
 *  ├── Export Chain (MediaStreamDestination for canvas recording & offline WAV export)
 *  └── Playback (Play, pause, seek, volume, track loading & state subscription)
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  // 1. AudioContext
  private ctx: AudioContext | null = null;
  private isDisposed: boolean = false;

  // 2. MediaSource
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isSourceConnected: boolean = false;

  // 3. Analyser
  private mainAnalyser: AnalyserNode | null = null;
  private vocalFilter: BiquadFilterNode | null = null;
  private vocalAnalyser: AnalyserNode | null = null;
  private audioProcessor: AudioProcessor | null = null;

  // 4. Master Chain (DSP)
  private lowShelf: BiquadFilterNode | null = null;
  private midPeaking: BiquadFilterNode | null = null;
  private highShelf: BiquadFilterNode | null = null;
  private waveShaper: WaveShaperNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private masteringSettings: MasteringSettings;

  // 5. Export Chain
  private exportDestination: MediaStreamAudioDestinationNode | null = null;

  // 6. Playback & State
  private state: AudioEnginePlaybackState;
  private listeners: Set<AudioEngineStateListener> = new Set();
  private timeUpdateInterval: number | null = null;

  public static readonly DEFAULT_MASTERING_SETTINGS: MasteringSettings = {
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

  public static readonly MASTERING_PRESETS: Record<MasteringPreset, MasteringSettings> = {
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

  private constructor() {
    this.masteringSettings = { ...AudioEngine.DEFAULT_MASTERING_SETTINGS };
    this.state = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isMuted: false,
      volume: 1.0,
      audioUrl: null,
      trackTitle: '',
      artistName: '',
      isLoaded: false,
      reduction: 0,
      masteringSettings: this.masteringSettings
    };
  }

  /**
   * Singleton erişim noktası
   */
  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // ==========================================================================
  // 1. AUDIOCONTEXT & GRAPH INITIALIZATION
  // ==========================================================================

  /**
   * Web Audio Context ve DSP Graph'ı güvenle başlatır.
   */
  public ensureContext(): AudioContext {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    this.ctx = ctx;
    this.isDisposed = false;

    // --- 3. Analyser Düğümleri ---
    // Ana Spektrum Analyser
    const mainAnalyser = ctx.createAnalyser();
    mainAnalyser.fftSize = 1024;
    mainAnalyser.smoothingTimeConstant = 0.8;
    this.mainAnalyser = mainAnalyser;

    // Vokal Filtresi (500Hz - 3000Hz bandpass) ve Vokal Analyser
    const vocalFilter = ctx.createBiquadFilter();
    vocalFilter.type = 'bandpass';
    vocalFilter.frequency.value = 1750;
    vocalFilter.Q.value = 0.7;
    this.vocalFilter = vocalFilter;

    const vocalAnalyser = ctx.createAnalyser();
    vocalAnalyser.fftSize = 1024;
    vocalAnalyser.smoothingTimeConstant = 0.85;
    this.vocalAnalyser = vocalAnalyser;

    this.vocalFilter.connect(this.vocalAnalyser);

    // AudioProcessor Bağlantısı
    this.audioProcessor = new AudioProcessor(mainAnalyser, vocalAnalyser);

    // --- 4. Master Chain (DSP) Düğümleri ---
    // 1. Low Shelf (Sub & Bass Punch @ 85Hz)
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 85;
    this.lowShelf = lowShelf;

    // 2. Mid Peaking (Presence & Clarity @ 2500Hz)
    const midPeaking = ctx.createBiquadFilter();
    midPeaking.type = 'peaking';
    midPeaking.frequency.value = 2500;
    midPeaking.Q.value = 1.0;
    this.midPeaking = midPeaking;

    // 3. High Shelf (Air & Brilliance @ 10500Hz)
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 10500;
    this.highShelf = highShelf;

    // 4. Analog Saturation (WaveShaper)
    const waveShaper = ctx.createWaveShaper();
    waveShaper.oversample = '4x';
    this.waveShaper = waveShaper;

    // 5. Multiband Mastering Compressor / Limiter
    const compressor = ctx.createDynamicsCompressor();
    compressor.attack.value = 0.015;
    compressor.release.value = 0.12;
    compressor.knee.value = 6;
    this.compressor = compressor;

    // 6. Master Output Gain
    const masterGain = ctx.createGain();
    this.masterGain = masterGain;

    // --- 5. Export Destination ---
    const exportDestination = ctx.createMediaStreamDestination();
    this.exportDestination = exportDestination;

    // Master DSP Chain Bağlantısı:
    // lowShelf -> midPeaking -> highShelf -> waveShaper -> compressor -> masterGain
    this.lowShelf.connect(this.midPeaking);
    this.midPeaking.connect(this.highShelf);
    this.highShelf.connect(this.waveShaper);
    this.waveShaper.connect(this.compressor);
    this.compressor.connect(this.masterGain);

    // MasterGain Çıkış Yönlendirmeleri:
    // 1. Hoparlör (ctx.destination)
    this.masterGain.connect(ctx.destination);
    // 2. Ana Spektrum Analyser
    this.masterGain.connect(this.mainAnalyser);
    // 3. Export Stream Destination (MediaRecorder kaydı için)
    this.masterGain.connect(this.exportDestination);

    // Başlangıç Ayarlarını Uygula
    this.applyMasteringSettings(this.masteringSettings);

    // Eğer bağlı bir ses elementi varsa grafiğe bağla
    if (this.audioElement && !this.isSourceConnected) {
      this.attachAudioElement(this.audioElement);
    }

    return ctx;
  }

  // ==========================================================================
  // 2. MEDIASOURCE ATTACHMENT
  // ==========================================================================

  /**
   * HTMLAudioElement'i AudioEngine DSP grafiğine bağlar.
   * Aynı elementin iki defa bağlanıp hata fırlatmasını engeller.
   */
  public attachAudioElement(element: HTMLAudioElement) {
    this.audioElement = element;

    // Olay dinleyicilerini bağla
    element.onplay = () => {
      this.ensureContext();
      this.updateState({ isPlaying: true });
      this.startTimeTracker();
    };

    element.onpause = () => {
      this.updateState({ isPlaying: false });
      this.stopTimeTracker();
    };

    element.onended = () => {
      this.updateState({ isPlaying: false, currentTime: this.state.duration });
      this.stopTimeTracker();
    };

    element.ontimeupdate = () => {
      this.updateState({ currentTime: element.currentTime });
    };

    element.onloadedmetadata = () => {
      this.updateState({
        duration: element.duration || 0,
        isLoaded: true
      });
    };

    // Eğer context hazırsa MediaSourceNode bağla
    if (this.ctx && !this.isSourceConnected) {
      try {
        const source = this.ctx.createMediaElementSource(element);
        this.sourceNode = source;

        // 1. Master Chain Girişine bağla (LowShelf)
        if (this.lowShelf) {
          source.connect(this.lowShelf);
        }

        // 2. Vokal Ayrıştırma Filtresine bağla (Hoparlöre gitmez, sadece analiz)
        if (this.vocalFilter) {
          source.connect(this.vocalFilter);
        }

        this.isSourceConnected = true;
      } catch (err) {
        console.warn("[AudioEngine] MediaElementSource bağlantı uyarısı:", err);
      }
    }
  }

  // ==========================================================================
  // 3. ANALYSER & AUDIO PROCESSOR
  // ==========================================================================

  public getMainAnalyser(): AnalyserNode | null {
    return this.mainAnalyser;
  }

  public getVocalAnalyser(): AnalyserNode | null {
    return this.vocalAnalyser;
  }

  public getAudioProcessor(): AudioProcessor | null {
    return this.audioProcessor;
  }

  /**
   * 60 FPS Canvas döngüsü için ses analiz olaylarını döndürür.
   */
  public getAudioEvents(currentTime: number, isPlaying: boolean, delta: number = 1/60): AudioEvents {
    if (!this.audioProcessor || !this.mainAnalyser) {
      return AudioProcessor.createEmptyAudioEvents();
    }
    return this.audioProcessor.getAudioEvents(currentTime, isPlaying, delta);
  }

  // ==========================================================================
  // 4. MASTER CHAIN (DSP MASTERING)
  // ==========================================================================

  public getMasteringSettings(): MasteringSettings {
    return { ...this.masteringSettings };
  }

  public setMasteringPreset(preset: MasteringPreset) {
    const presetSettings = AudioEngine.MASTERING_PRESETS[preset] || AudioEngine.DEFAULT_MASTERING_SETTINGS;
    this.updateMasteringSettings({ ...presetSettings });
  }

  public updateMasteringSettings(partial: Partial<MasteringSettings>) {
    this.masteringSettings = {
      ...this.masteringSettings,
      ...partial
    };
    this.applyMasteringSettings(this.masteringSettings);
    this.updateState({ masteringSettings: this.masteringSettings });
  }

  public getReduction(): number {
    return this.compressor?.reduction ?? 0;
  }

  private applyMasteringSettings(settings: MasteringSettings) {
    if (!this.ctx || !this.lowShelf || !this.midPeaking || !this.highShelf || !this.compressor || !this.masterGain) {
      return;
    }

    const isBypass = !settings.enabled || settings.preset === 'BYPASS';
    const currTime = this.ctx.currentTime;

    // EQ Düğümleri
    this.lowShelf.gain.setTargetAtTime(isBypass ? 0 : settings.bassBoost, currTime, 0.04);
    this.midPeaking.gain.setTargetAtTime(isBypass ? 0 : settings.midPresence, currTime, 0.04);
    this.highShelf.gain.setTargetAtTime(isBypass ? 0 : settings.trebleAir, currTime, 0.04);

    // Saturation
    this.updateDistortionCurve(isBypass ? 0 : settings.saturation);

    // Compressor
    this.compressor.threshold.setTargetAtTime(isBypass ? 0 : settings.compThreshold, currTime, 0.04);
    this.compressor.ratio.setTargetAtTime(isBypass ? 1 : settings.compRatio, currTime, 0.04);

    // Master Gain
    this.masterGain.gain.setTargetAtTime(isBypass ? 1.0 : settings.outputGain, currTime, 0.04);
  }

  private updateDistortionCurve(amount: number) {
    if (!this.waveShaper) return;
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
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    this.waveShaper.curve = curve;
  }

  // ==========================================================================
  // 5. EXPORT CHAIN (RECORDING & OFFLINE STREAM)
  // ==========================================================================

  /**
   * MediaRecorder için masterlenmiş ses akış parçasını (track) döndürür.
   */
  public getAudioStreamTrack(): MediaStreamTrack | null {
    if (this.exportDestination && this.exportDestination.stream) {
      const tracks = this.exportDestination.stream.getAudioTracks();
      return tracks[0] || null;
    }
    return null;
  }

  // ==========================================================================
  // 6. PLAYBACK CONTROLS & UNIFIED TRANSPORT
  // ==========================================================================

  /**
   * Yeni bir ses kaynağını yükler
   */
  public async loadTrack(
    source: string | File | Blob,
    metadata?: { title?: string; artist?: string }
  ): Promise<string> {
    this.ensureContext();

    let url: string;
    if (typeof source === 'string') {
      url = source;
    } else {
      url = URL.createObjectURL(source);
    }

    const prevUrl = this.state.audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:') && prevUrl !== url) {
      URL.revokeObjectURL(prevUrl);
    }

    this.updateState({
      audioUrl: url,
      trackTitle: metadata?.title || this.state.trackTitle || 'Parça Adı',
      artistName: metadata?.artist || this.state.artistName || 'Sanatçı',
      currentTime: 0,
      isPlaying: false,
      isLoaded: false
    });

    if (this.audioElement) {
      this.audioElement.src = url;
      this.audioElement.load();
    }

    return url;
  }

  public async play(): Promise<void> {
    this.ensureContext();
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.audioElement) {
      try {
        await this.audioElement.play();
        this.updateState({ isPlaying: true });
      } catch (err) {
        console.warn("[AudioEngine] Play Hatası:", err);
        this.updateState({ isPlaying: false });
      }
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.updateState({ isPlaying: false });
    }
  }

  public async togglePlay(): Promise<void> {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  public seek(seconds: number): void {
    const target = Math.max(0, Math.min(this.state.duration || 10000, seconds));
    if (this.audioElement) {
      this.audioElement.currentTime = target;
    }
    this.updateState({ currentTime: target });
  }

  public seekRelative(deltaSeconds: number): void {
    const target = (this.audioElement?.currentTime ?? this.state.currentTime) + deltaSeconds;
    this.seek(target);
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    this.updateState({ volume: clamped });
  }

  public setMuted(muted: boolean): void {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
    this.updateState({ isMuted: muted });
  }

  public toggleMute(): void {
    this.setMuted(!this.state.isMuted);
  }

  /**
   * Sesi ve tüm kaynakları temizler
   */
  public unloadTrack(): void {
    this.pause();
    if (this.state.audioUrl && this.state.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.state.audioUrl);
    }
    if (this.audioElement) {
      this.audioElement.src = '';
      this.audioElement.removeAttribute('src');
      this.audioElement.load();
    }
    this.updateState({
      audioUrl: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoaded: false
    });
  }

  // ==========================================================================
  // 7. OBSERVABLE STATE & TIME TRACKER
  // ==========================================================================

  public getState(): AudioEnginePlaybackState {
    return { ...this.state };
  }

  public subscribe(listener: AudioEngineStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(partial: Partial<AudioEnginePlaybackState>) {
    this.state = {
      ...this.state,
      ...partial
    };
    this.notifyListeners();
  }

  private notifyListeners() {
    const currentState = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.error("[AudioEngine] State listener hatası:", err);
      }
    }
  }

  private startTimeTracker() {
    this.stopTimeTracker();
    this.timeUpdateInterval = window.setInterval(() => {
      if (this.audioElement && this.state.isPlaying) {
        const reduction = this.getReduction();
        this.updateState({
          currentTime: this.audioElement.currentTime,
          reduction
        });
      }
    }, 100);
  }

  private stopTimeTracker() {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  // ==========================================================================
  // 8. TEARDOWN & CLEANUP
  // ==========================================================================

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;

    this.stopTimeTracker();
    this.unloadTrack();

    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }

    this.mainAnalyser = null;
    this.vocalAnalyser = null;
    this.vocalFilter = null;
    this.lowShelf = null;
    this.midPeaking = null;
    this.highShelf = null;
    this.waveShaper = null;
    this.compressor = null;
    this.masterGain = null;
    this.exportDestination = null;
    this.sourceNode = null;
    this.isSourceConnected = false;
    this.audioProcessor = null;
    this.ctx = null;
    this.listeners.clear();
  }
}

export const audioEngine = AudioEngine.getInstance();
