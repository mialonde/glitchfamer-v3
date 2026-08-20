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
  | 'COVER_PULSE_3D'
  | 'STUDIO_SPLIT_LYRICS'
  | 'NOIR_CORE'
  | 'NEURAL_BLOOM'
  | 'DREAM_PERFORMER'
  | 'NEURAL_NOIR'
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
  | 'KINETIC_BURST'
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
  translation?: string;
  romanization?: string;
  singer?: string;
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

export type LyricsStyle = 'KINETIC' | 'APPLE_SCROLL' | 'KARAOKE' | 'BETTER_FLOW' | 'SUBTITLE' | 'NEON_BOX' | 'CYBER_GLITCH' | 'MINIMAL';
export type LyricsPosition = 'TOP' | 'CENTER' | 'BOTTOM' | 'CUSTOM';

export interface VisualizerSettings {
  mode: VisualizerMode;
  aspectRatio: '9/16' | '1/1' | '16/9';
  avatarMode?: 'anime' | 'hologram'; // Hologram or Solid Anime style
  cardLayout?: 'DEFAULT' | 'NEON_FRAME' | 'POLAROID' | 'NOIR_VINYL' | 'HOLO_CD' | 'COVER_BIG' | 'VINYL' | 'CD' | 'SPOTIFY' | 'TIKTOK' | 'RETRO_TAPE' | 'GLASS_CARD'; // Social Media Music Cards
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
  
  // Şarkı Adı ve Sanatçı Adı Serbest Yerleşim & Tipografi Ayarları (Typography & Free Placement)
  showTrackTitle?: boolean;          // Şarkı adı gösterilsin mi? (varsayılan: true)
  showArtistName?: boolean;          // Sanatçı adı gösterilsin mi? (varsayılan: true)
  titlePositionMode?: 'unified' | 'independent'; // Başlık ve sanatçı birlikte mi yoksa bağımsız mı taşınsın?
  titleX?: number;                   // Şarkı adı X konumu (% 0 - 100, varsayılan 50)
  titleY?: number;                   // Şarkı adı Y konumu (% 0 - 100, varsayılan 80)
  titleFontSize?: number;            // Şarkı adı font boyutu (px, varsayılan 48)
  titleFontFamily?: string;          // Font ailesi ('Space Grotesk', 'Inter', 'Cinzel', 'Playfair Display', vb.)
  titleFontWeight?: 'normal' | 'bold' | '900'; // Font kalınlığı
  titleColor?: string;               // Şarkı adı yazı rengi (varsayılan #FFFFFF)
  titleGlow?: number;                // Başlık parlaması / neon şiddeti (0 - 1.0)
  titleGlowColor?: string;           // Başlık ışıma rengi
  titleAlign?: 'left' | 'center' | 'right'; // Yazı hizalaması
  titleLetterSpacing?: number;       // Harf aralığı (px)
  titleCase?: 'uppercase' | 'normal' | 'lowercase';
  titleItalic?: boolean;             // İtalik stil
  titleReactive?: boolean;           // Ritme göre titreşim / büyüme (varsayılan true)
  titleBadgeStyle?: 'NONE' | 'GLASS' | 'SOLID' | 'NEON_BORDER' | 'PILL'; // Metin arkası rozet stili

  artistX?: number;                  // Sanatçı adı X konumu (% 0 - 100, varsayılan 50)
  artistY?: number;                  // Sanatçı adı Y konumu (% 0 - 100, varsayılan 86)
  artistFontSize?: number;           // Sanatçı adı font boyutu (px, varsayılan 26)
  artistFontFamily?: string;         // Font ailesi
  artistFontWeight?: 'normal' | 'bold' | '900';
  artistColor?: string;              // Sanatçı yazı rengi (varsayılan: primaryColor)
  artistGlow?: number;               // Sanatçı parlaması (0 - 1.0)
  artistGlowColor?: string;          // Sanatçı ışıma rengi
  artistAlign?: 'left' | 'center' | 'right';
  artistLetterSpacing?: number;
  artistCase?: 'uppercase' | 'normal' | 'lowercase';
  artistItalic?: boolean;
  artistReactive?: boolean;

  // Metadata Ek Alanlar
  releaseDate?: string;
  watermarkText?: string;
  songCardLayout?: 'DEFAULT' | 'CENTER_MINIMAL' | 'LEFT_GLASS' | 'BRUTALIST_HUD' | 'NONE';

  // Şarkı Sözleri (Lyrics)
  lyricsEnabled: boolean;
  rawLyrics?: string;
  lyricsStyle: LyricsStyle;
  lyricsPosition: LyricsPosition;
  lyricsFontSize: number;
  lyricsColor: string;
  syncedLyrics: SyncedLine[];
  lyricsY?: number;                  // Dikey konum (% 5 - 95, varsayılan 88)
  lyricsX?: number;                  // Yatay konum (% 5 - 95, varsayılan 50)
  lyricsAlign?: 'left' | 'center' | 'right';
  lyricsFontFamily?: string;         // Font ailesi ('Space Grotesk', 'Syne', 'Outfit', 'Inter', vb.)
  lyricsFontWeight?: 'normal' | 'bold' | '900';
  lyricsLetterSpacing?: number;      // Harf aralığı
  lyricsGlow?: number;               // Işıma şiddeti (0 - 50)
  lyricsBeatReactive?: boolean;      // Ritme göre büyüme/titreşim
  lyricsBeatScale?: number;          // Ritim büyüme çarpanı (0.0 - 2.0)
  lyricsInactiveOpacity?: number;    // Pasif/önceki satır şeffaflığı (0.1 - 0.8)
  lyricsLineCount?: 1 | 2 | 3 | 5;   // Kaydırma modunda gösterilecek satır sayısı
  lyricsHighlightColor?: string;     // Aktif kelime / vurgu rengi (BetterLyrics)
  lyricsBlurInactive?: boolean;      // Pasif satırlara derinlik bulanıklığı (BetterLyrics)
  lyricsShowVocalGapDots?: boolean;  // Enstrümantal aralarda nefes sayacı ••• (BetterLyrics)
  lyricsLongNoteGlow?: boolean;      // Uzun notalarda dinamik aura/ışıma (BetterLyrics)
  lyricsWordSweep?: boolean;         // Kelime içi yumuşak degrade dolgu (BetterLyrics)
  lyricsTranslationEnabled?: boolean;// Çeviri satırı gösterimi
  lyricsRomanizationEnabled?: boolean;// Romaji / Latinizasyon satırı gösterimi
  
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
  
  // OBJ Face Mask Custom Settings
  objFaceBgColor?: string;
  objFaceColor?: string;
  objFaceColorMode?: 'solid' | 'rainbow' | 'pulse' | 'glow-fade' | 'audio';
  objFaceCycleSpeed?: number;
  objFaceBgReactive?: boolean;
  
  // Render Motoru Seçimi (Sunucu / İstemci)
  renderEngine?: 'server' | 'client';
  serverRenderFps?: number;
  serverRenderQuality?: '1080p' | '720p' | '4k';
  lowPerformanceMode?: boolean;

  // Ses Kesme & Snippet Ayarları (Audio Trim & Snippet Controls)
  trimEnabled?: boolean;       // Kırpma / Snippet modu aktif mi?
  trimStart?: number;          // Başlangıç saniyesi (varsayılan: 0)
  trimEnd?: number;            // Bitiş saniyesi (varsayılan: süre veya 30)
  trimLoop?: boolean;          // Kesit bittiğinde başa dönüp döngüde çalsın mı?
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
  duration?: number;    // Total duration of the track in seconds
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
  dispose?: () => void;
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

// ==========================================
// CMS & ADMIN TYPES
// ==========================================
export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: number;
}

export interface CMSLayout {
  headerTitle: string;
  headerLinks: { id: string; label: string; url: string }[];
  footerText: string;
}

export interface StudioTabConfig {
  id: string;
  label: string;
  iconName: string;
  enabled: boolean;
  order: number;
}

export interface AppColorTheme {
  accent: string;
  accentHover: string;
  background?: string;
  surface?: string;
  text?: string;
  border?: string;
  fontDisplay?: string;
  fontBody?: string;
  borderRadius?: string;
}

export interface StudioModulesConfig {
  enableSocial: boolean;
  enableEffects: boolean;
  enableLyrics: boolean;
  enablePresets: boolean;
  tabs?: StudioTabConfig[];
  theme?: AppColorTheme;
}

// User Management Types
export interface UserRenderHistoryItem {
  id: string;
  title: string;
  visualizer: string;
  duration: string;
  durationSec: number;
  renderTimeSec: number;
  resolution: '9/16' | '16/9' | '1/1';
  quality: '720p' | '1080p' | '4k';
  format: 'WebM' | 'MP4';
  date: string;
  status: 'SUCCESS' | 'FAILED';
  errorReason?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'FREE' | 'CREATOR' | 'PRO';
  renderCount: number;
  creditsUsed: number;
  creditsLimit: number;
  lastActive: string;
  createdAt: string;
  country: string;
  storageUsedMb: number;
  status: 'ACTIVE' | 'SUSPENDED';
  recentProjects: {
    id: string;
    title: string;
    visualizer: string;
    duration: string;
    renderTime: string;
    date: string;
  }[];
  detailedRenderHistory?: UserRenderHistoryItem[];
  topVisualizers: string[];
  avgRenderTime: number;
  totalExports: number;
  totalErrors: number;
  userErrorLogs?: {
    id: string;
    timestamp: number;
    message: string;
    visualizer: string;
    browser: string;
  }[];
}

// Studio & Visualizer Heatmap Types
export interface VisualizerAnalyticsItem {
  id: string;
  label: string;
  category: string;
  views: number;
  exports: number;
  conversionRate: number;
  avgPreviewSeconds: number;
  bounceRate: number;
  status: 'ACTIVE' | 'PRO' | 'BETA' | 'HIDDEN';
}

// Render Analytics & Logs
export interface RenderLogItem {
  id: string;
  timestamp: number;
  userEmail: string;
  visualizer: string;
  durationSec: number;
  fps: number;
  memoryMb: number;
  resolution: '9/16' | '16/9' | '1/1';
  quality: '720p' | '1080p' | '4k';
  browser: string;
  os: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  errorDetail?: string;
}

// Feedback & Feature Requests
export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  userEmail: string;
  category: 'BUG' | 'FEATURE' | 'UI' | 'PERFORMANCE' | 'RENDER';
  upvotes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: number;
}

// Error Tracking (Sentry-like)
export interface ErrorLogItem {
  id: string;
  type: 'JS_EXCEPTION' | 'WEBGL_CRASH' | 'FFMPEG_ERROR' | 'AUDIO_GLITCH' | 'EXPORT_FAILED';
  message: string;
  stacktrace: string;
  affectedUsers: number;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED';
}

// Suno & Audio Mastering Analytics
export interface SunoAnalyticsData {
  totalRequests: number;
  metadataSuccessRate: number;
  lyricsSuccessRate: number;
  timestampSuccessRate: number;
  coverArtSuccessRate: number;
  avgFetchTimeMs: number;
}

export interface MasteringAnalyticsData {
  totalMastered: number;
  topPresets: { preset: string; count: number; percentage: number }[];
  avgLufs: number;
  avgExportSec: number;
}

// A/B Testing
export interface ABTestVariant {
  id: string;
  name: string;
  trafficSplit: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
}

export interface ABTestItem {
  id: string;
  name: string;
  description: string;
  status: 'RUNNING' | 'COMPLETED' | 'DRAFT';
  variants: ABTestVariant[];
  winningVariantId?: string;
  createdAt: number;
}

// Landing Page CMS Content
export interface LandingPageCMS {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  features: { id: string; title: string; description: string; icon: string }[];
  pricingPlans: { id: string; name: string; price: string; period: string; popular?: boolean; features: string[] }[];
  faqs: { id: string; question: string; answer: string }[];
  changelog: { version: string; date: string; changes: string[] }[];
}

// -------------------------------------------------------------
// Faz 2 — Creator Platform Types (Templates, Assets, Release Pack, Feedback)
// -------------------------------------------------------------

export interface MusicGenreTemplate {
  id: string;
  name: string;
  genre: string;
  tagline: string;
  description: string;
  iconName: string;
  previewColors: string[];
  fontFamily: 'serif' | 'sans' | 'mono' | 'display';
  settings: Partial<VisualizerSettings>;
  thumbnail?: string;
  badge?: 'NEW' | 'Pro' | null;
  bgImageUrl?: string;
}

export type AssetCategory = 'BACKGROUND' | 'OVERLAY' | 'GEOMETRIC_LAYER';

export interface AssetLibraryItem {
  id: string;
  name: string;
  category: AssetCategory;
  thumbnail: string;
  description: string;
  badge?: string;
  applyConfig: Partial<VisualizerSettings>;
}

export interface ReleasePackFormatConfig {
  id: string;
  format: '16/9' | '9/16' | '1/1';
  platformName: 'YouTube 16:9' | 'TikTok / Reels 9:16' | 'Spotify / Instagram 1:1';
  resolutionLabel: string;
  enabled: boolean;
  quality: '720p' | '1080p' | '4k';
  progress: number;
  stage: 'IDLE' | 'RENDERING' | 'ENCODING' | 'PACKAGING' | 'COMPLETE' | 'FAILED';
  downloadUrl?: string;
  fileSizeEstimate?: string;
}

export interface PostRenderFeedbackRecord {
  id: string;
  rating: 'THUMBS_UP' | 'THUMBS_DOWN';
  reasons: string[];
  comment?: string;
  visualizer: string;
  resolution: string;
  durationSec: number;
  timestamp: number;
  userEmail?: string;
}


