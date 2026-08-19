import { 
  AdminUser, VisualizerAnalyticsItem, RenderLogItem, 
  FeedbackItem, ErrorLogItem, SunoAnalyticsData, 
  MasteringAnalyticsData, ABTestItem, LandingPageCMS, 
  StudioTabConfig, StudioModulesConfig, CMSPage, CMSLayout 
} from '../types';

export const INITIAL_TABS: StudioTabConfig[] = [
  { id: 'visualizer', label: 'GÖRSEL', iconName: 'Sliders', enabled: true, order: 1 },
  { id: 'social',     label: 'SOSYAL MEDYA', iconName: 'Smartphone', enabled: true, order: 2 },
  { id: 'effects',    label: 'EFEKTLER', iconName: 'Sparkles', enabled: true, order: 3 },
  { id: 'lyrics',     label: 'SÖZLER', iconName: 'Type', enabled: true, order: 4 },
  { id: 'media',      label: 'MEDYA', iconName: 'Layers', enabled: true, order: 5 },
  { id: 'presets',    label: 'PROFİL', iconName: 'Bookmark', enabled: true, order: 6 },
  { id: 'export',     label: 'RENDER', iconName: 'Video', enabled: true, order: 7 },
];

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr_1',
    name: 'Kaan Demir',
    email: 'kaan.demir@glitchframer.studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    plan: 'PRO',
    renderCount: 142,
    creditsUsed: 1420,
    creditsLimit: 5000,
    lastActive: '5 dk önce',
    createdAt: '2024-01-15',
    country: 'Türkiye (TR)',
    storageUsedMb: 840,
    status: 'ACTIVE',
    recentProjects: [
      { id: 'p1', title: 'Cyberpunk Phonk Drop', visualizer: 'DREAM PERFORMER', duration: '2:45', renderTime: '22s', date: 'Bugün 14:20' },
      { id: 'p2', title: 'Midnight Synthwave Loop', visualizer: 'SYNTHWAVE 3D GRID', duration: '3:10', renderTime: '28s', date: 'Dün' },
      { id: 'p3', title: 'Dark Club Single Artwork', visualizer: 'NEURAL NOIR', duration: '1:30', renderTime: '14s', date: '3 gün önce' },
    ],
    detailedRenderHistory: [
      { id: 'dr_1', title: 'Cyberpunk Phonk Drop (9:16 Reels)', visualizer: 'DREAM PERFORMER', duration: '2:45', durationSec: 165, renderTimeSec: 22, resolution: '9/16', quality: '1080p', format: 'MP4', date: 'Bugün 14:20', status: 'SUCCESS' },
      { id: 'dr_2', title: 'Midnight Synthwave Loop', visualizer: 'SYNTHWAVE 3D GRID', duration: '3:10', durationSec: 190, renderTimeSec: 28, resolution: '16/9', quality: '1080p', format: 'MP4', date: 'Dün 22:15', status: 'SUCCESS' },
      { id: 'dr_3', title: 'Dark Club Single Artwork', visualizer: 'NEURAL NOIR', duration: '1:30', durationSec: 90, renderTimeSec: 14, resolution: '1/1', quality: '1080p', format: 'WebM', date: '3 gün önce', status: 'SUCCESS' },
      { id: 'dr_4', title: 'Tokyo Bass Drift 4K', visualizer: 'POPCORN PHYSICS', duration: '2:10', durationSec: 130, renderTimeSec: 45, resolution: '16/9', quality: '4k', format: 'MP4', date: '5 gün önce', status: 'SUCCESS' },
      { id: 'dr_5', title: 'Arabesk Trap Vocal Cut', visualizer: 'CIRCULAR AURA EQ', duration: '1:45', durationSec: 105, renderTimeSec: 16, resolution: '9/16', quality: '1080p', format: 'MP4', date: '6 gün önce', status: 'SUCCESS' },
      { id: 'dr_6', title: 'Experimental VRM Test', visualizer: 'VRM ANIME HYBRID', duration: '3:00', durationSec: 180, renderTimeSec: 52, resolution: '9/16', quality: '1080p', format: 'MP4', date: '1 hafta önce', status: 'FAILED', errorReason: 'WebGL context timeout' },
    ],
    topVisualizers: ['DREAM PERFORMER', 'SYNTHWAVE 3D GRID', 'NEURAL NOIR', 'POPCORN PHYSICS'],
    avgRenderTime: 21.3,
    totalExports: 138,
    totalErrors: 1,
    userErrorLogs: [
      { id: 'uel_1', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, message: 'WebGL memory spike on heavy particle count', visualizer: 'VRM ANIME HYBRID', browser: 'Chrome 125 (macOS)' }
    ]
  },
  {
    id: 'usr_2',
    name: 'Elena Rostova',
    email: 'elena.beats@soundwave.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    plan: 'CREATOR',
    renderCount: 67,
    creditsUsed: 670,
    creditsLimit: 2000,
    lastActive: '1 saat önce',
    createdAt: '2024-02-01',
    country: 'Almanya (DE)',
    storageUsedMb: 420,
    status: 'ACTIVE',
    recentProjects: [
      { id: 'p4', title: 'Echoes of Rain (Suno AI)', visualizer: 'LIQUID MERCURY', duration: '3:20', renderTime: '31s', date: 'Bugün 11:05' },
      { id: 'p5', title: 'Deep Ocean Ambient', visualizer: 'NEON HYDRO PERFORMER', duration: '4:00', renderTime: '38s', date: '2 gün önce' },
    ],
    detailedRenderHistory: [
      { id: 'dr_7', title: 'Echoes of Rain (Suno AI)', visualizer: 'LIQUID MERCURY', duration: '3:20', durationSec: 200, renderTimeSec: 31, resolution: '16/9', quality: '4k', format: 'MP4', date: 'Bugün 11:05', status: 'SUCCESS' },
      { id: 'dr_8', title: 'Deep Ocean Ambient 9:16', visualizer: 'NEON HYDRO PERFORMER', duration: '4:00', durationSec: 240, renderTimeSec: 38, resolution: '9/16', quality: '1080p', format: 'MP4', date: '2 gün önce', status: 'SUCCESS' },
      { id: 'dr_9', title: 'Chill Lo-Fi Sunset', visualizer: 'CIRCULAR AURA EQ', duration: '2:30', durationSec: 150, renderTimeSec: 24, resolution: '1/1', quality: '720p', format: 'WebM', date: '4 gün önce', status: 'SUCCESS' },
    ],
    topVisualizers: ['LIQUID MERCURY', 'NEON HYDRO PERFORMER'],
    avgRenderTime: 34.5,
    totalExports: 65,
    totalErrors: 0,
  },
  {
    id: 'usr_3',
    name: 'Marcus Vance',
    email: 'marcus.vance@vancerecords.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    plan: 'PRO',
    renderCount: 312,
    creditsUsed: 3120,
    creditsLimit: 10000,
    lastActive: '12 dk önce',
    createdAt: '2023-11-20',
    country: 'ABD (US)',
    storageUsedMb: 2450,
    status: 'ACTIVE',
    recentProjects: [
      { id: 'p6', title: 'Stadium Bass Trap Promo', visualizer: 'CODROPS POLAR', duration: '1:00', renderTime: '9s', date: 'Bugün' },
      { id: 'p7', title: 'Album Teaser 9:16 Reels', visualizer: 'CIRCULAR AURA EQ', duration: '0:30', renderTime: '5s', date: 'Bugün' },
    ],
    detailedRenderHistory: [
      { id: 'dr_10', title: 'Stadium Bass Trap Promo', visualizer: 'CODROPS POLAR', duration: '1:00', durationSec: 60, renderTimeSec: 9, resolution: '9/16', quality: '1080p', format: 'MP4', date: 'Bugün 15:40', status: 'SUCCESS' },
      { id: 'dr_11', title: 'Album Teaser 9:16 Reels', visualizer: 'CIRCULAR AURA EQ', duration: '0:30', durationSec: 30, renderTimeSec: 5, resolution: '9/16', quality: '1080p', format: 'MP4', date: 'Bugün 12:10', status: 'SUCCESS' },
      { id: 'dr_12', title: 'Main Single 4K HDR', visualizer: 'DREAM PERFORMER', duration: '3:45', durationSec: 225, renderTimeSec: 38, resolution: '16/9', quality: '4k', format: 'MP4', date: 'Dün', status: 'SUCCESS' },
    ],
    topVisualizers: ['CODROPS POLAR', 'CIRCULAR AURA EQ', 'DREAM PERFORMER'],
    avgRenderTime: 12.1,
    totalExports: 310,
    totalErrors: 2,
  },
  {
    id: 'usr_4',
    name: 'Deniz Yılmaz',
    email: 'deniz.y@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    plan: 'FREE',
    renderCount: 8,
    creditsUsed: 80,
    creditsLimit: 100,
    lastActive: '3 gün önce',
    createdAt: '2024-03-10',
    country: 'Türkiye (TR)',
    storageUsedMb: 45,
    status: 'ACTIVE',
    recentProjects: [
      { id: 'p8', title: 'Akustik Şarkı Deneme', visualizer: 'NEON SPECTRUM', duration: '2:15', renderTime: '19s', date: '3 gün önce' },
    ],
    detailedRenderHistory: [
      { id: 'dr_13', title: 'Akustik Şarkı Deneme', visualizer: 'NEON SPECTRUM', duration: '2:15', durationSec: 135, renderTimeSec: 19, resolution: '16/9', quality: '720p', format: 'WebM', date: '3 gün önce', status: 'SUCCESS' },
      { id: 'dr_14', title: 'Instagram Story Snippet', visualizer: 'VRM ANIME HYBRID', duration: '1:00', durationSec: 60, renderTimeSec: 22, resolution: '9/16', quality: '1080p', format: 'WebM', date: '4 gün önce', status: 'FAILED', errorReason: 'Mobile Safari GPU Context Lost' }
    ],
    topVisualizers: ['NEON SPECTRUM'],
    avgRenderTime: 19.0,
    totalExports: 7,
    totalErrors: 1,
    userErrorLogs: [
      { id: 'uel_2', timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, message: 'WebGL Context Lost (Mobile GPU Memory Limit)', visualizer: 'VRM ANIME HYBRID', browser: 'Safari 17 (iOS)' }
    ]
  },
  {
    id: 'usr_5',
    name: 'Satoshi Tanaka',
    email: 'satoshi.sound@tokyo-audio.jp',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    plan: 'PRO',
    renderCount: 189,
    creditsUsed: 1890,
    creditsLimit: 5000,
    lastActive: '2 saat önce',
    createdAt: '2023-12-05',
    country: 'Japonya (JP)',
    storageUsedMb: 1200,
    status: 'ACTIVE',
    recentProjects: [
      { id: 'p9', title: 'VRM Hologram V-Tuber Live', visualizer: 'VRM ANIME HYBRID', duration: '3:45', renderTime: '42s', date: 'Bugün' },
    ],
    detailedRenderHistory: [
      { id: 'dr_15', title: 'VRM Hologram V-Tuber Live', visualizer: 'VRM ANIME HYBRID', duration: '3:45', durationSec: 225, renderTimeSec: 42, resolution: '9/16', quality: '1080p', format: 'MP4', date: 'Bugün 13:00', status: 'SUCCESS' },
      { id: 'dr_16', title: 'Tokyo Night Drive 60FPS', visualizer: 'SYNTHWAVE 3D GRID', duration: '3:15', durationSec: 195, renderTimeSec: 29, resolution: '16/9', quality: '4k', format: 'MP4', date: 'Dün', status: 'SUCCESS' },
    ],
    topVisualizers: ['VRM ANIME HYBRID', 'DREAM PERFORMER', 'SYNTHWAVE 3D GRID'],
    avgRenderTime: 38.0,
    totalExports: 185,
    totalErrors: 0,
  },
];

export const INITIAL_VISUALIZER_ANALYTICS: VisualizerAnalyticsItem[] = [
  { id: 'DREAM_PERFORMER', label: 'DREAM PERFORMER', category: 'CINEMATIC', views: 4820, exports: 3950, conversionRate: 81.9, avgPreviewSeconds: 42, bounceRate: 8.2, status: 'PRO' },
  { id: 'NEURAL_NOIR', label: 'NEURAL NOIR', category: 'CINEMATIC', views: 3210, exports: 2470, conversionRate: 76.9, avgPreviewSeconds: 38, bounceRate: 11.5, status: 'ACTIVE' },
  { id: 'LIQUID_MERCURY_HUMAN', label: 'LIQUID MERCURY', category: 'LIQUID', views: 2890, exports: 2150, conversionRate: 74.3, avgPreviewSeconds: 35, bounceRate: 14.1, status: 'PRO' },
  { id: 'SYNTHWAVE_GRID_3D', label: 'SYNTHWAVE 3D GRID', category: 'CONCERT', views: 2450, exports: 1820, conversionRate: 74.2, avgPreviewSeconds: 30, bounceRate: 15.0, status: 'ACTIVE' },
  { id: 'CIRCULAR_AURA_SPECTRUM', label: 'CIRCULAR AURA EQ', category: 'MINIMAL', views: 2100, exports: 1680, conversionRate: 80.0, avgPreviewSeconds: 24, bounceRate: 9.4, status: 'ACTIVE' },
  { id: 'VRM_ANIME_HYBRID', label: 'VRM ANIME HYBRID', category: 'CINEMATIC', views: 1950, exports: 1420, conversionRate: 72.8, avgPreviewSeconds: 54, bounceRate: 18.2, status: 'BETA' },
  { id: 'FLUID_METABALL', label: 'FLUID METABALL', category: 'ORB', views: 1680, exports: 980, conversionRate: 58.3, avgPreviewSeconds: 21, bounceRate: 26.5, status: 'ACTIVE' },
  { id: 'NEON_HYDRO_HUMAN', label: 'NEON HYDRO PERFORMER', category: 'LIQUID', views: 1420, exports: 920, conversionRate: 64.7, avgPreviewSeconds: 28, bounceRate: 22.0, status: 'ACTIVE' },
  { id: 'NEURAL_BLOOM', label: 'NEURAL BLOOM', category: 'ORB', views: 1210, exports: 790, conversionRate: 65.2, avgPreviewSeconds: 26, bounceRate: 21.4, status: 'ACTIVE' },
  { id: 'POPCORN_PHYSICS', label: 'POPCORN PHYSICS', category: 'CONCERT', views: 890, exports: 410, conversionRate: 46.0, avgPreviewSeconds: 15, bounceRate: 38.0, status: 'ACTIVE' },
  { id: 'CHAOS', label: 'CHAOS THEORY', category: 'LEGACY', views: 320, exports: 45, conversionRate: 14.0, avgPreviewSeconds: 6, bounceRate: 68.5, status: 'HIDDEN' },
  { id: 'GLITCH', label: 'GLITCH DESTRUCTION', category: 'LEGACY', views: 410, exports: 68, conversionRate: 16.5, avgPreviewSeconds: 7, bounceRate: 62.0, status: 'HIDDEN' },
];

export const INITIAL_RENDER_LOGS: RenderLogItem[] = [
  { id: 'rnd_9082', timestamp: Date.now() - 1000 * 60 * 3, userEmail: 'kaan.demir@glitchframer.studio', visualizer: 'DREAM PERFORMER', durationSec: 165, fps: 59.8, memoryMb: 412, resolution: '9/16', quality: '1080p', browser: 'Chrome 125 (macOS)', os: 'macOS Sonoma', status: 'SUCCESS' },
  { id: 'rnd_9081', timestamp: Date.now() - 1000 * 60 * 18, userEmail: 'marcus.vance@vancerecords.com', visualizer: 'CIRCULAR AURA EQ', durationSec: 60, fps: 60.0, memoryMb: 245, resolution: '9/16', quality: '1080p', browser: 'Chrome 125 (Windows)', os: 'Windows 11', status: 'SUCCESS' },
  { id: 'rnd_9080', timestamp: Date.now() - 1000 * 60 * 35, userEmail: 'elena.beats@soundwave.io', visualizer: 'LIQUID MERCURY', durationSec: 200, fps: 58.4, memoryMb: 520, resolution: '16/9', quality: '4k', browser: 'Firefox 126 (Linux)', os: 'Ubuntu 24.04', status: 'SUCCESS' },
  { id: 'rnd_9079', timestamp: Date.now() - 1000 * 60 * 52, userEmail: 'deniz.y@gmail.com', visualizer: 'VRM ANIME HYBRID', durationSec: 135, fps: 42.1, memoryMb: 780, resolution: '9/16', quality: '1080p', browser: 'Safari 17 (iOS)', os: 'iOS 17.5', status: 'FAILED', errorDetail: 'WebGL Context Lost (Mobile GPU Memory Limit)' },
  { id: 'rnd_9078', timestamp: Date.now() - 1000 * 60 * 78, userEmail: 'satoshi.sound@tokyo-audio.jp', visualizer: 'SYNTHWAVE 3D GRID', durationSec: 225, fps: 59.9, memoryMb: 380, resolution: '16/9', quality: '1080p', browser: 'Edge 125 (Windows)', os: 'Windows 11', status: 'SUCCESS' },
  { id: 'rnd_9077', timestamp: Date.now() - 1000 * 60 * 110, userEmail: 'guest_892@anonymous.net', visualizer: 'NEON SPECTRUM', durationSec: 45, fps: 60.0, memoryMb: 180, resolution: '1/1', quality: '720p', browser: 'Chrome 125 (Android)', os: 'Android 14', status: 'SUCCESS' },
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  { id: 'fb_1', title: 'VRM modelleri için özel ışık açısı ayarı', description: 'VRM avatarlarında ana sahne spot ışığının X/Y koordinatını elle ayarlayabilmek harika olurdu.', userEmail: 'satoshi.sound@tokyo-audio.jp', category: 'FEATURE', upvotes: 42, priority: 'HIGH', status: 'IN_PROGRESS', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
  { id: 'fb_2', title: 'Safari iOS WebGL bellek uyarısı', description: 'iPhone 13 üzerinde 4K render almaya çalışırken tarayıcı sekmesi çöküyor, 1080p ile sınırlandırma önerilmeli.', userEmail: 'deniz.y@gmail.com', category: 'BUG', upvotes: 28, priority: 'HIGH', status: 'IN_REVIEW', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
  { id: 'fb_3', title: 'Suno AI şarkı sözleri için Neon Box stili', description: 'Kinetik tipografi yerine kelimeleri kutucuk içine alan Neon Karaoke kutusu stili eklenebilir mi?', userEmail: 'elena.beats@soundwave.io', category: 'UI', upvotes: 35, priority: 'MEDIUM', status: 'COMPLETED', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 'fb_4', title: 'Phonk mastering modunda bas doygunluğu', description: 'Phonk presetinde -6dB hard clip yerine yumuşak analog saturatör eğrisi daha sıcak duyuluyor.', userEmail: 'kaan.demir@glitchframer.studio', category: 'PERFORMANCE', upvotes: 19, priority: 'MEDIUM', status: 'NEW', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 },
];

export const INITIAL_ERRORS: ErrorLogItem[] = [
  { id: 'err_1', type: 'WEBGL_CRASH', message: 'WebGL: CONTEXT_LOST_WEBGL on heavy particle count buffer swap', stacktrace: 'at WebGLRenderingContext.drawArraysInstanced (three.module.js:14201)\nat renderScene (App.tsx:842)', affectedUsers: 14, occurrences: 48, firstSeen: Date.now() - 1000 * 60 * 60 * 72, lastSeen: Date.now() - 1000 * 60 * 15, status: 'INVESTIGATING' },
  { id: 'err_2', type: 'FFMPEG_ERROR', message: 'H.264 Encoder: Non-monotonic DTS in output stream', stacktrace: 'at ffmpeg.wasm / ffmpeg.c:3149\nat server/renderEngine.ts:184', affectedUsers: 3, occurrences: 5, firstSeen: Date.now() - 1000 * 60 * 60 * 48, lastSeen: Date.now() - 1000 * 60 * 60 * 4, status: 'RESOLVED' },
  { id: 'err_3', type: 'AUDIO_GLITCH', message: 'AudioContext resumed before user gesture policy satisfied', stacktrace: 'at AudioEngine.init (audioEngine.ts:62)', affectedUsers: 22, occurrences: 85, firstSeen: Date.now() - 1000 * 60 * 60 * 120, lastSeen: Date.now() - 1000 * 60 * 5, status: 'RESOLVED' },
];

export const INITIAL_SUNO_ANALYTICS: SunoAnalyticsData = {
  totalRequests: 1420,
  metadataSuccessRate: 98.4,
  lyricsSuccessRate: 94.2,
  timestampSuccessRate: 88.6,
  coverArtSuccessRate: 99.1,
  avgFetchTimeMs: 420,
};

export const INITIAL_MASTERING_ANALYTICS: MasteringAnalyticsData = {
  totalMastered: 3840,
  topPresets: [
    { preset: 'SPOTIFY (-14 LUFS)', count: 1840, percentage: 47.9 },
    { preset: 'PHONK BASS BOOST (+6dB)', count: 980, percentage: 25.5 },
    { preset: 'YOUTUBE MASTER (-13 LUFS)', count: 620, percentage: 16.1 },
    { preset: 'WARM TAPE SATURATION', count: 400, percentage: 10.5 },
  ],
  avgLufs: -13.8,
  avgExportSec: 2.4,
};

export const INITIAL_AB_TESTS: ABTestItem[] = [
  {
    id: 'ab_1',
    name: 'Render Buton Rengi ve Aksiyon Metni',
    description: 'Ana stüdyodaki "DIŞA AKTAR" butonunun renginin ve metninin (Vurgulu Mavi vs Altın Sarısı vs Neon Yeşil) dışa aktarma oranına etkisi.',
    status: 'RUNNING',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    variants: [
      { id: 'var_a', name: 'Versiyon A (Klasik Vurgulu Mavi - "DIŞA AKTAR")', trafficSplit: 50, visitors: 2450, conversions: 580, conversionRate: 23.6 },
      { id: 'var_b', name: 'Versiyon B (Canlı Neon Altın - "HIZLI MP4 AL")', trafficSplit: 50, visitors: 2420, conversions: 785, conversionRate: 32.4 },
    ],
    winningVariantId: 'var_b',
  },
  {
    id: 'ab_2',
    name: 'Varsayılan Açılış Visualizer Şablonu',
    description: 'Yeni misafir kullanıcıların ilk karşılaştığı görselleştirici modu: DREAM PERFORMER vs CIRCULAR AURA.',
    status: 'RUNNING',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    variants: [
      { id: 'var_c', name: 'DREAM PERFORMER (3D Avatar + Cyber)', trafficSplit: 50, visitors: 3100, conversions: 1420, conversionRate: 45.8 },
      { id: 'var_d', name: 'CIRCULAR AURA EQ (Minimalist Release)', trafficSplit: 50, visitors: 3080, conversions: 1110, conversionRate: 36.0 },
    ],
    winningVariantId: 'var_c',
  }
];

export const INITIAL_LANDING_CMS: LandingPageCMS = {
  heroTitle: 'Müziğinizi Sinematik Cyberpunk & 3D Görsel Şölene Dönüştürün',
  heroSubtitle: 'Suno AI şarkılarınız veya ses dosyalarınız için Spotify Canvas, TikTok ve YouTube 60 FPS müzik videoları üretin.',
  heroCtaText: 'ÜCRETSİZ STÜDYOYU BAŞLAT',
  features: [
    { id: 'f1', title: '60 FPS Ultra Akıcı Render', description: 'İstemci ve sunucu taraflı donanım hızlandırmalı MP4 / WebM dışa aktarım motoru.', icon: 'Zap' },
    { id: 'f2', title: 'Suno AI Tam Entegrasyonu', description: 'Tek tıkla Suno bağlantısı yapıştırın, şarkı sözü zamanlamalarını ve kapakları anında çekin.', icon: 'Music' },
    { id: 'f3', title: '3D VRM & Mesh Performans Katmanı', description: 'Anime avatarları ve sese duyarlı yüz kafesleriyle sanatçı performansları oluşturun.', icon: 'Sparkles' },
    { id: 'f4', title: 'Spotify & Mastering Standardı', description: '-14 LUFS lufs limiter, parametrik EQ ve analog harmonik doygunluk.', icon: 'Sliders' },
  ],
  pricingPlans: [
    { id: 'p_free', name: 'Free', price: '₺0', period: '/ay', features: ['720p & 1080p WebM Export', '15+ Temel Visualizer', 'Suno AI Bağlantı İçe Aktarma', 'Topluluk Desteği'] },
    { id: 'p_creator', name: 'Creator', price: '₺199', period: '/ay', popular: true, features: ['1080p 60 FPS MP4 H.264 Render', 'VRM 3D Anime Avatar Desteği', 'Senkronize Şarkı Sözleri', 'Spotify & YouTube Mastering Motoru', 'Öncelikli Render Kuyruğu'] },
    { id: 'p_pro', name: 'Studio Pro', price: '₺499', period: '/ay', features: ['4K Ultra HD Render', 'Sınırsız Sunucu Renderi', 'Özel Marka / Logo Kaldırma', 'A/B Test ve Özel Presetler', '7/24 VIP Destek'] },
  ],
  faqs: [
    { id: 'faq_1', question: 'GlitchFramer hangi ses formatlarını destekler?', answer: 'MP3, WAV, FLAC, AAC, OGG ve doğrudan Suno AI şarkı bağlantılarını eksiksiz destekler.' },
    { id: 'faq_2', question: 'Render işlemi bilgisayarımı yorar mı?', answer: 'Hem istemci tarafında yerel GPU ile WebM kaydı hem de sunucuda sıfır CPU yüküyle MP4 H.264 render motoru sunuyoruz.' },
    { id: 'faq_3', question: 'Sosyal medya platformları için dikey boyut var mı?', answer: 'Evet! Tek tıkla 9:16 (TikTok/Reels/Shorts), 1:1 (Kare/Instagram) ve 16:9 (YouTube) formatlarına geçiş yapabilirsiniz.' },
  ],
  changelog: [
    { version: 'v2.4.0', date: 'Ağustos 2024', changes: ['Shadcn Ürün Yönetimi & CMS Paneli entegre edildi', 'A/B Test ve Visualizer Heatmap analitikleri eklendi', 'Suno AI kelime bazlı timestamp lirik motoru güncellendi'] },
    { version: 'v2.3.0', date: 'Temmuz 2024', changes: ['VRM 3D Anime avatar 6 katmanlı performans mimarisi', 'Spotify -14 LUFS mastering modülü'] },
  ]
};
