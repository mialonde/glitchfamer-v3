/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MusicMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string[];
  coverUrl?: string;
  lyrics?: string;
}

export type VisualizerMode = 
  | 'NONE'
  | 'SIMULATION' 
  | 'MONOLITH' 
  | 'NOIRGRID' 
  | 'CHAOS'
  | 'ESOTERIC'
  | 'PHONKWAVE'
  | 'RADIAL'
  | 'ETHER'
  | 'GLITCH'
  | 'SPECTRUM'
  | 'KINETIC'
  | 'NEON_TUNNEL'
  | 'QUANTUM_FIELD'
  | 'AUDIO_FLUID'
  | 'CODROPS_POLAR'
  | 'CODROPS_WAVE'
  | 'CODROPS_BARS'
  | 'CAVA_SPECTRUM'
  | 'LISSAJOUS_ORBIT'
  | 'POPCORN_PHYSICS'
  | 'VORTEX_NEBULA'
  | 'CYBER_MATRIX'
  | 'VISSONANCE_RING'
  | 'VISSONANCE_OCTAGON'
  | 'VISSONANCE_SPECTRUM'
  | 'PARTICLE_SPHERE_3D'
  | 'FLUID_METABALL'
  | 'SYNTHWAVE_GRID_3D'
  | 'KINETIC_TYPO_GLITCH'
  | 'CIRCULAR_AURA_SPECTRUM'
  | 'LIQUID_MERCURY_HUMAN'
  | 'NEON_HYDRO_HUMAN'
  | 'NOIR_SINGING_HEAD'
  | 'OBJ_FACE_MASK'
  | 'VRM_ANIME_HYBRID';

export type VisemeCode = 'REST' | 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'F' | 'L' | 'S';

export interface PerformanceLayerConfig {
  layer1LipSyncEnabled: boolean;        // Layer 1: Lip Sync & Phoneme Occlusion
  layer2FacialExpressionEnabled: boolean; // Layer 2: Eyebrows, subtle smile/relaxed tone
  layer3EyeTrackingEnabled: boolean;    // Layer 3: Gaze look-at target, saccades, human blinking
  layer4BreathingEnabled: boolean;      // Layer 4: Breathing cycle, ribcage expansion, pre-vocal inhale
  layer5BodyIdleEnabled: boolean;       // Layer 5: Tempo-synced head sway, beat response, relaxed posture
  layer6HairPhysicsEnabled: boolean;    // Layer 6: Secondary inertia lag & VRM spring bone smoothing
}

export interface PhonemeToken {
  phoneme: VisemeCode;
  char: string;
  type: 'vowel' | 'consonant' | 'bilabial' | 'fricative';
  relativeStart: number; // 0.0 - 1.0 (kelime içi normalize başlangıç)
  relativeEnd: number;   // 0.0 - 1.0 (kelime içi normalize bitiş)
  startTime?: number;    // Mutlak saniye
  endTime?: number;      // Mutlak saniye
  isVowelNucleus?: boolean;
}

export interface SyncedWord {
  word: string;
  startTime: number;
  endTime: number;
  phonemes?: PhonemeToken[];
}

export interface SyncedLine {
  startTime: number;
  endTime: number;
  text: string;
  words?: SyncedWord[];
}

export interface SunoTimelineWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface SunoWordTimestamp {
  text: string;
  startTime: number;
  endTime: number;
}

export interface TrackMetadata {
  id?: string;
  title: string;
  artist: string;
  image?: string;
  imageUrl?: string;
  audioUrl: string;
  lyrics: string;
  source: 'suno' | 'local' | 'demo';
  duration?: number;
  tags?: string;
  lyricsTimeline?: SunoTimelineWord[];
  syncedLines?: SyncedLine[];
  hasWordLevelTimestamps?: boolean;
}

export interface NormalizedSunoTrack {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  audioUrl: string;
  imageUrl?: string;
  image?: string;
  duration?: number;
  tags?: string;
  words: SunoWordTimestamp[];
  lyricsTimeline: SunoTimelineWord[];
  syncedLines: SyncedLine[];
  hasWordLevelTimestamps: boolean;
  source: 'suno';
}

export type LyricsStyle = 'KINETIC' | 'KARAOKE' | 'SUBTITLE' | 'NEON_BOX' | 'CYBER_GLITCH';
export type LyricsPosition = 'TOP' | 'CENTER' | 'BOTTOM';

export interface VisualizerSettings {
  mode: VisualizerMode;
  aspectRatio: '9/16' | '1/1' | '16/9';
  avatarMode?: 'anime' | 'hologram'; // Hologram or Solid Anime style
  vrmModelUrl?: string;             // 3D VRM Model dosya yolu veya blob URL (örn: /models/Nutachisan.vrm)
  vrmModelName?: string;            // Seçilen modelin adı
  intensity: number;
  
  // Efekt Aç/Kapa ve İnce Ayarlar
  rgbSplitEnabled: boolean;
  rgbSplit: number;
  
  scanLinesEnabled: boolean;
  scanLines: number;
  
  vignetteEnabled: boolean;
  vignette: number;
  
  bloomEnabled: boolean;
  bloom: number;

  filmGrainEnabled: boolean;
  filmGrain: number;

  strobeEnabled: boolean;
  strobe: number;

  cameraShakeEnabled: boolean;
  cameraShake: number;

  lensDistortEnabled: boolean;
  lensDistort: number;

  motionTrailEnabled: boolean;
  motionTrail: number;

  glitchSliceEnabled: boolean;
  glitchSlice: number;

  edgeGlowEnabled: boolean;
  edgeGlow: number;

  primaryColor: string;
  secondaryColor: string;
  bgMode: 'GRID' | 'SMOKE' | 'PARTICLES' | 'NONE';
  bgOpacity: number;
  trackTitle: string;
  artistName: string;
  
  // Şarkı Sözleri (Lyrics)
  lyricsEnabled: boolean;
  lyricsStyle: LyricsStyle;
  lyricsPosition: LyricsPosition;
  lyricsFontSize: number;
  lyricsColor: string;
  syncedLyrics: SyncedLine[];
  
  // 3D Avatar Performans Katmanı Konfigürasyonu (6-Layer Architecture)
  performanceLayers?: Partial<PerformanceLayerConfig>;
  
  displacement?: number;
  jitter?: number;
  coverScale?: number;
  coverX?: number;
  coverY?: number;
  bgVideoUrl?: string | null;
  bgVideoOpacity?: number;
  bgVideoBlur?: number;
  bgVideoReactive?: boolean;
  bgImageUrl?: string | null;
  bgImageOpacity?: number;
  bgImageBlur?: number;
  bgImageReactive?: boolean;

  // Yeni Özelleştirilebilir FX Parametreleri
  hueRotateEnabled?: boolean;
  hueRotate?: number;
  audioReactivity?: number;
  glitchFrequency?: number;
  distortion?: number;

  // Görselleştirici Tam Denetim & İnce Ayar Parametreleri (Visualizer Granular Controls)
  visSpeed?: number;           // Hız Çarpanı (0.1 - 3.0)
  visScale?: number;           // Ölçek / Boyut Çarpanı (0.2 - 2.5)
  visDensity?: number;         // Yoğunluk / Parçacık Sayısı Çarpanı (0.2 - 2.0)
  visRotation?: number;        // Dönme Hızı (-2.0 - 2.0)
  visGlow?: number;            // Parlama / Işıma Şiddeti (0.0 - 1.0)
  visBeatSensitivity?: number; // Ritim Duyarlılığı (0.1 - 3.0)
  visColorShift?: number;      // Dinamik Renk Kayması Hızı (0.0 - 1.0)
  
  // Render Motoru Seçimi (Sunucu / İstemci)
  renderEngine?: 'server' | 'client';
  serverRenderFps?: number;
  serverRenderQuality?: '1080p' | '720p' | '4k';
}

export type MasteringPreset = 'SPOTIFY' | 'YOUTUBE' | 'PHONK' | 'WARM_TAPE' | 'BYPASS';

export interface MasteringSettings {
  preset: MasteringPreset;
  enabled: boolean;        // A/B test and bypass flag
  bassBoost: number;      // -6dB to +12dB
  midPresence: number;    // -6dB to +6dB
  trebleAir: number;      // -6dB to +12dB
  saturation: number;     // 0.0 to 1.0 (Harmonic warmth)
  compThreshold: number;  // -24dB to 0dB
  compRatio: number;      // 1:1 to 12:1
  outputGain: number;     // 0.5 to 1.5
  lufsTarget: number;     // e.g. -14 LUFS, -9 LUFS
}

export interface UserInteractionState {
  pointerX: number;              // 0..width
  pointerY: number;              // 0..height
  isPointerDown: boolean;
  dragDeltaX: number;
  dragDeltaY: number;
  rotationX: number;             // Orbit Pitch
  rotationY: number;             // Orbit Yaw
  gravityAttractor: { x: number; y: number; strength: number } | null;
  fluidRipples: { x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number; speed: number }[];
  styleVariant: number;          // Double click / tap mode cycle
  glitchBoost: number;           // Tap glitch intensity spike
  paletteIndex: number;          // Theme cycling for 3D synthwave / particles
}

export interface AudioEvents {
  kick: number;         
  snare: number;        
  hihat: number;        
  energy: number;       
  spectrum: number[];   
  time: number;         
  beat: boolean;        
  isSilence: boolean;   
  bassEnergy?: number;
  midEnergy?: number;
  highEnergy?: number;
  trebleEnergy?: number;
  vocalEnergy?: number;
  vocalRMS?: number;
  delta?: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D | any;
  width: number;
  height: number;
  settings: VisualizerSettings;
  audio: AudioEvents;
  metadata?: MusicMetadata | null;
  coverImage?: HTMLImageElement | any | null;
  logoImage?: HTMLImageElement | any | null;
  bgVideo?: HTMLVideoElement | any | null;
  bgImage?: HTMLImageElement | any | null;
  interaction?: UserInteractionState;
}

export interface IVisualizer {
  name: string;
  update: (audio: AudioEvents, settings: VisualizerSettings) => void;
  render: (context: RenderContext) => void;
}

export interface VisualizerPresetProfile {
  id: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
  description?: string;
  isBuiltin?: boolean;
  settings: Partial<VisualizerSettings>;
}
