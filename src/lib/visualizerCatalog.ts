import { VisualizerMode } from '../types';

// Yerleşik 3D VRM Karakter Modelleri
export const VRM_AVATAR_MODELS = [
  {
    id: 'alicia',
    name: 'Alicia Solid',
    url: '/models/AliciaSolid.vrm',
    desc: 'Orijinal Standart Anime Avatarı (VRM 0.0)',
    badge: 'STANDART'
  },
  {
    id: 'nutachisan',
    name: 'Nutachisan',
    url: '/models/Nutachisan.vrm',
    desc: 'Özel Yüklenen Anime Karakteri (VRM 0.0)',
    badge: 'ÖZEL MODEL'
  }
];

// Hazır Euphoric & Sinematik Video Döngüleri
export const EUPHORIC_VIDEO_PRESETS = [
  {
    name: 'CYBERPUNK NEON DRIFT',
    desc: 'Sinematik neon sokaklar & ışık akışı',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-tunnel-with-glowing-neon-lines-41551-large.mp4'
  },
  {
    name: 'EUPHORIC COSMIC AURORA',
    desc: 'Kozmik parçacıklar ve soyut uzay dalgası',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-rotating-hypnotic-fractal-animation-43093-large.mp4'
  },
  {
    name: 'VAPORWAVE RETRO HIGHWAY',
    desc: '80ler tel çerçeve güneş ve sonsuz yol',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-wireframe-grid-tunnel-animation-43095-large.mp4'
  },
  {
    name: 'DARK LIQUID CHROME',
    desc: 'Akışkan sıvı metal ve cıva yansımaları',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-fluid-abstract-background-39873-large.mp4'
  }
];

// Küratörlü HD Arka Plan Duvar Kağıtları (Static Wallpapers)
export const CURATED_WALLPAPERS = [
  {
    name: 'NEO TOKYO CYBER',
    desc: 'Siberpunk yağmurlu neon şehir manzarası',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'DEEP SPACE NEBULA',
    desc: 'Kozmik yıldız tozu ve mor nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'DARK LIQUID GLOW',
    desc: 'Altın ve siyah akışkan sıvı metal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'MINIMAL NOIR GRID',
    desc: 'Mat siyah brütalist mimari ve çizgiler',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80'
  }
];

export interface VisualizerModeEntry {
  id: VisualizerMode; 
  label: string; 
  cat: 'CINEMATIC' | 'LIQUID' | 'MINIMAL' | 'ORB' | 'CONCERT' | 'GEOMETRIC' | 'RHYTHM' | 'ARCHIVE'; 
  catLabel: string;
  desc: string; 
  isCurated: boolean;
}

// 34+ Visualizer Modları Listesi ve Kategorileri (6 Küratörlü Premium Kategori & Klasik Modlar)
export const VISUALIZER_MODES: VisualizerModeEntry[] = [
  // CATEGORY 1 — Cinematic Portrait (Artist Performance)
  { id: 'DREAM_PERFORMER', label: 'DREAM PERFORMER', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: 'Psychedelic 3D rüya performansı: VRM Avatar, yaşayan fraktal dünya, sese duyarlı yüz ışıkları ve uzay bükülmesi', isCurated: true },
  { id: 'NEURAL_NOIR', label: 'NEURAL NOIR', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: 'Karanlık brutalist cyber-noir maske: verse loş tel kafes, nakaratta parçalanan mesh ve çoğalan küreler', isCurated: true },
  { id: 'SIMULATION', label: 'CYBERNETIC SIMULATION', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: '3D siber-küre çekirdeği, radar grid, HUD telemetrisi ve çok katmanlı CRT dalgası', isCurated: true },
  { id: 'VRM_ANIME_HYBRID', label: 'VRM ANIME HYBRID', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: 'Three.js VRM Anime modeli, GLSL Procedural Shader ile audio-reactive deformasyon', isCurated: true },
  { id: 'OBJ_FACE_MASK', label: 'OBJ FACE MASK', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: 'Gerçek zamanlı yüklü Düşük Poligon (OBJ) Yüz Maskesi, sese duyarlı', isCurated: true },
  { id: 'NOIR_SINGING_HEAD', label: 'NOIR SINGING HEAD', cat: 'CINEMATIC', catLabel: 'CINEMATIC PORTRAIT', desc: '22Noir tarzı siyah krom 3D vokal kafa, dudak senkronu, bas ile parçalanma ve duman efektleri', isCurated: true },

  // CATEGORY 2 — Liquid Performer
  { id: 'LIQUID_MERCURY_HUMAN', label: 'LIQUID MERCURY', cat: 'LIQUID', catLabel: 'LIQUID PERFORMER', desc: 'Aynalı zeminde dans eden cıva insan, vokal parlaklığı & Bass şok dalgaları', isCurated: true },
  { id: 'NEON_HYDRO_HUMAN', label: 'NEON HYDRO PERFORMER', cat: 'LIQUID', catLabel: 'LIQUID PERFORMER', desc: 'Müzikle ritmik dans eden ışıklı su insan, biyo-neon çekirdek & bas su halkaları', isCurated: true },
  { id: 'FLUID_METABALL', label: 'FLUID METABALL', cat: 'LIQUID', catLabel: 'LIQUID PERFORMER', desc: 'Reaktif cıva/sıvı metaball simülasyonu, kick damlaları & parmak karıştırma', isCurated: true },

  // CATEGORY 3 — Minimal Release (Spotify Canvas / Single Kapak)
  { id: 'CIRCULAR_AURA_SPECTRUM', label: 'CIRCULAR AURA EQ', cat: 'MINIMAL', catLabel: 'MINIMAL RELEASE', desc: 'Albüm kapağı merkezli dairesel spektrum, nefes alan aura & çift dokunma modları', isCurated: true },
  { id: 'KINETIC_TYPO_GLITCH', label: 'KINETIC GLITCH TYPO', cat: 'MINIMAL', catLabel: 'MINIMAL RELEASE', desc: 'Frekans genleşmeli kinetik tipografi, vokal neon aura & glitch parçalanma', isCurated: true },
  { id: 'SPECTRUM', label: 'NEON SPECTRUM', cat: 'MINIMAL', catLabel: 'MINIMAL RELEASE', desc: 'Hassas logaritmik stüdyo spektrum barları ve tepe noktaları', isCurated: true },
  { id: 'NONE', label: 'NOIR CORE EQ', cat: 'MINIMAL', catLabel: 'MINIMAL RELEASE', desc: 'Ultra-temiz brütalist stüdyo spektrum barları ve hassas RMS seviyesi', isCurated: true },

  // CATEGORY 4 — Abstract / Cinematic Orb
  { id: 'NEURAL_BLOOM', label: 'NEURAL BLOOM', cat: 'ORB', catLabel: 'CINEMATIC ORB', desc: 'Ritmik fraktal sinaps tomurcukları, gradyan gürültü arka planı ve sese duyarlı renk geçişi', isCurated: true },
  { id: 'PARTICLE_SPHERE_3D', label: '3D PARTICLE SPHERE', cat: 'ORB', catLabel: 'CINEMATIC ORB', desc: '360° interaktif 3D parçacık küresi, kütleçekim alanı & Treble kıvılcımları', isCurated: true },
  { id: 'QUANTUM_FIELD', label: 'QUANTUM FIELD', cat: 'ORB', catLabel: 'CINEMATIC ORB', desc: 'Kuantum parçacık nebulası & atomik titreşim dalgaları', isCurated: true },
  { id: 'VORTEX_NEBULA', label: 'VORTEX NEBULA ORB', cat: 'ORB', catLabel: 'CINEMATIC ORB', desc: 'Spiral galaksi kolları, yerçekimi tekilliği & konstelasyon bağları', isCurated: true },

  // CATEGORY 5 — Live Concert / Cyber
  { id: 'NEON_TUNNEL', label: 'NEON TUNNEL', cat: 'CONCERT', catLabel: 'LIVE CONCERT / CYBER', desc: '3D siberpunk sonsuz siber-tünel perspektifi & audio warp', isCurated: true },
  { id: 'SYNTHWAVE_GRID_3D', label: 'SYNTHWAVE 3D GRID', cat: 'CONCERT', catLabel: 'LIVE CONCERT / CYBER', desc: 'Sonsuz 3D perspektif ızgara, bass arazi tepeleri & neon ufuk güneşi', isCurated: true },
  { id: 'MONOLITH', label: 'BRUTALIST MONOLITH', cat: 'CONCERT', catLabel: 'LIVE CONCERT / CYBER', desc: '3D monolit sütunlar, perspektif zemin kafesi ve bas vuruşlarında parçalanma', isCurated: true },
  { id: 'NOIRGRID', label: 'NOIR GRID PROJECTION', cat: 'CONCERT', catLabel: 'LIVE CONCERT / CYBER', desc: 'Perspektif 3D ufuk ızgarası, ses arazisi ve ışık sütunları', isCurated: true },

  // CATEGORY 6 — Wireframe / Ring System
  { id: 'VISSONANCE_RING', label: 'VISSONANCE RING', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: '3D dairesel perspektif halkaları & parçacık dalgası', isCurated: true },
  { id: 'VISSONANCE_OCTAGON', label: 'VISSONANCE OCTAGON', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: '3D geometrik oktagon telleri & ses çekirdeği', isCurated: true },
  { id: 'VISSONANCE_SPECTRUM', label: 'VISSONANCE SPECTRUM', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: 'Perspektif 3D ses arazisi & ızgara manzarası', isCurated: true },
  { id: 'CODROPS_WAVE', label: 'CODROPS WAVE', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: 'Çok katmanlı osiloskop çizgi grafiği & spektral yüzey', isCurated: true },
  { id: 'LISSAJOUS_ORBIT', label: 'LISSAJOUS ORBIT', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: 'Çift kanal faz osiloskop yörüngesi & Lissajous eğrileri', isCurated: true },
  { id: 'CODROPS_POLAR', label: 'CODROPS POLAR', cat: 'GEOMETRIC', catLabel: 'WIREFRAME / RING SYSTEM', desc: 'Dairesel polar frekans halkası & şok dalgaları', isCurated: true },

  // CATEGORY 7 — Rhythm Play / Dynamic
  { id: 'POPCORN_PHYSICS', label: 'KINETIC BURST', cat: 'RHYTHM', catLabel: 'RHYTHM PLAY / DYNAMIC', desc: 'Fizik tabanlı kinetik parçacık patlamaları, şok dalgaları & yerçekimi reaksiyonu', isCurated: true },
  { id: 'CHAOS', label: 'CHAOS HYPER-GEOMETRY', cat: 'RHYTHM', catLabel: 'RHYTHM PLAY / DYNAMIC', desc: '3D parametrik hiper-geometri, fraktal çokgenler ve bas deformasyonu', isCurated: true },
  { id: 'ESOTERIC', label: 'ESOTERIC SACRED GEOMETRY', cat: 'RHYTHM', catLabel: 'RHYTHM PLAY / DYNAMIC', desc: 'Dönen 3D Merkaba yıldızı, Yaşam Çiçeği ve altın oran rezonansı', isCurated: true },
  { id: 'GLITCH', label: 'GLITCH DESTRUCTION', cat: 'RHYTHM', catLabel: 'RHYTHM PLAY / DYNAMIC', desc: 'Sese duyarlı RGB kanal kayması, veri bozunumu ve analog gürültü', isCurated: true },
  { id: 'CAVA_SPECTRUM', label: 'TERMINAL CAVA EQ', cat: 'RHYTHM', catLabel: 'RHYTHM PLAY / DYNAMIC', desc: 'Logaritmik stüdyo konsol EQ & tepe kapsülleri', isCurated: true },

  // ARCHIVE / CLASSIC MODES (Hidden by default, accessible in advanced mode)
  { id: 'ETHER', label: 'ETHER WAVE', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Akıcı sinüzoidal duman ve sis dalgası', isCurated: false },
  { id: 'PHONKWAVE', label: 'PHONK WAVE', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Agresif 808 distortion ve neon parıltı', isCurated: false },
  { id: 'AUDIO_FLUID', label: 'AUDIO FLUID', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Çok bantlı sinüzoidal akıcı dalgalar', isCurated: false },
  { id: 'CODROPS_BARS', label: 'CODROPS BARS', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Sürekli frekans eğrisi & yüzen tepe noktaları', isCurated: false },
  { id: 'CYBER_MATRIX', label: 'CYBER MATRIX', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Dijital veri yağmuru & ses ritim akışı', isCurated: false },
  { id: 'KINETIC', label: 'KINETIC TYPO', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Klasik tipografik bas vuruşları', isCurated: false },
  { id: 'RADIAL', label: 'RADIAL SPECTRUM', cat: 'ARCHIVE', catLabel: 'KLASİK ARŞİV', desc: 'Dairesel enerji halkası ve radyal barlar', isCurated: false }
];

// Renk Paletleri
export const COLOR_PALETTES = [
  { name: 'NOIR GOLD', p: '#FFD700', s: '#FFFFFF' },
  { name: 'CYBER CYAN', p: '#00F0FF', s: '#FF003C' },
  { name: 'ACID LIME', p: '#39FF14', s: '#E4E3E0' },
  { name: 'CRIMSON RED', p: '#FF003C', s: '#FFD700' },
  { name: 'VAPOR PURPLE', p: '#BD00FF', s: '#00F0FF' },
  { name: 'TITANIUM MONO', p: '#E4E3E0', s: '#71717A' }
];

// Görselleştirici Modlarının hangi Granüler Parametreleri desteklediğini haritalandırır
export const getVisualizerSupportedFeatures = (mode: VisualizerMode) => {
  const archiveMinimal: VisualizerMode[] = ['CYBER_MATRIX', 'RADIAL', 'KINETIC'];
  
  if (archiveMinimal.includes(mode)) {
    return {
      speed: true,
      scale: true,
      density: false,
      rotation: false,
      glow: false,
      beatSensitivity: true,
      colorShift: false
    };
  }
  
  if (mode === 'VRM_ANIME_HYBRID') {
    return {
      speed: true,
      scale: true,
      density: false,
      rotation: false,
      glow: false,
      beatSensitivity: true,
      colorShift: false
    };
  }
  if (mode === 'OBJ_FACE_MASK') {
    return {
      speed: false,
      scale: true,
      density: false,
      rotation: true,
      glow: true,
      beatSensitivity: true,
      colorShift: false
    };
  }
  if (mode === 'PARTICLE_SPHERE_3D') {
    return {
      speed: true,
      scale: true,
      density: true,
      rotation: true,
      glow: true,
      beatSensitivity: true,
      colorShift: false
    };
  }
  if (mode === 'NOIR_SINGING_HEAD') {
    return {
      speed: false,
      scale: true,
      density: false,
      rotation: true,
      glow: true,
      beatSensitivity: true,
      colorShift: false
    };
  }
  if (mode === 'FLUID_METABALL') {
    return {
      speed: true,
      scale: true,
      density: true,
      rotation: false,
      glow: true,
      beatSensitivity: true,
      colorShift: false
    };
  }
  if (mode === 'KINETIC_TYPO_GLITCH') {
    return {
      speed: true,
      scale: true,
      density: false,
      rotation: false,
      glow: true,
      beatSensitivity: true,
      colorShift: true
    };
  }
  if (mode === 'CIRCULAR_AURA_SPECTRUM') {
    return {
      speed: true,
      scale: true,
      density: true,
      rotation: true,
      glow: true,
      beatSensitivity: true,
      colorShift: true
    };
  }

  // Varsayılan Yeni Nesil (Tüm parametreler tam uyumlu)
  return {
    speed: true,
    scale: true,
    density: true,
    rotation: true,
    glow: true,
    beatSensitivity: true,
    colorShift: true
  };
};

// ============================================================================
// TIPOGRAFİ & SERBEST YERLEŞİM KATALOĞU (Typography & Text Placement Catalog)
// ============================================================================

export interface FontOption {
  id: string;
  name: string;
  category: 'Modern Sans' | 'Display / Cyber' | 'Serif / Luxury' | 'Brutalist / Mono' | 'Retro / Street';
  fontFamily: string;
  desc: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Display / Cyber', fontFamily: '"Space Grotesk", sans-serif', desc: 'Siberpunk & Fütüristik' },
  { id: 'Inter', name: 'Inter Sans', category: 'Modern Sans', fontFamily: '"Inter", sans-serif', desc: 'Net, Modern & Okunabilir' },
  { id: 'Bebas Neue', name: 'Bebas Neue', category: 'Brutalist / Mono', fontFamily: '"Bebas Neue", sans-serif', desc: 'Yüksek Etkili Brütalist Başlık' },
  { id: 'Montserrat', name: 'Montserrat Bold', category: 'Modern Sans', fontFamily: '"Montserrat", sans-serif', desc: 'Geniş & Güçlü Geometrik' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'Serif / Luxury', fontFamily: '"Playfair Display", serif', desc: 'Sinematik Lüks Serif' },
  { id: 'Cinzel', name: 'Cinzel Roman', category: 'Serif / Luxury', fontFamily: '"Cinzel", serif', desc: 'İmparatorluk & Sinematik Taş Baskı' },
  { id: 'Outfit', name: 'Outfit', category: 'Modern Sans', fontFamily: '"Outfit", sans-serif', desc: 'Temiz Spotify Pop Tarzı' },
  { id: 'Syncopate', name: 'Syncopate Ultra-Wide', category: 'Display / Cyber', fontFamily: '"Syncopate", sans-serif', desc: 'Ekstra Geniş Sinematik Elektronik' },
  { id: 'Kanit', name: 'Kanit Heavy', category: 'Brutalist / Mono', fontFamily: '"Kanit", sans-serif', desc: 'Ağır Sıklet Bass & Trap Başlığı' },
  { id: 'Orbitron', name: 'Orbitron Sci-Fi', category: 'Display / Cyber', fontFamily: '"Orbitron", sans-serif', desc: 'Neo-Matrix HUD & Siber Arayüz' },
  { id: 'Syne', name: 'Syne Avant-Garde', category: 'Display / Cyber', fontFamily: '"Syne", sans-serif', desc: 'Avangart Fransız Tipografi' },
  { id: 'Rubik Glitch', name: 'Rubik Glitch', category: 'Retro / Street', fontFamily: '"Rubik Glitch", cursive', desc: 'Dijital Bozulma & Hata Parçacığı' },
  { id: 'Permanent Marker', name: 'Permanent Marker', category: 'Retro / Street', fontFamily: '"Permanent Marker", cursive', desc: 'Sokak Graffiti & Hip-Hop' },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'Brutalist / Mono', fontFamily: '"JetBrains Mono", monospace', desc: 'Analog Konsol & Kodlama Monospace' }
];

export interface PlacementPreset {
  id: string;
  name: string;
  iconName: string;
  titleX: number;
  titleY: number;
  artistX: number;
  artistY: number;
  align: 'left' | 'center' | 'right';
  desc: string;
}

export const TEXT_PLACEMENT_PRESETS: PlacementPreset[] = [
  {
    id: 'BOTTOM_CENTER',
    name: 'Alt Orta (Klasik)',
    iconName: 'AlignCenter',
    titleX: 50,
    titleY: 78,
    artistX: 50,
    artistY: 84,
    align: 'center',
    desc: 'Standart visualizer alt merkez yerleşimi'
  },
  {
    id: 'TOP_CENTER',
    name: 'Üst Başlık (Header)',
    iconName: 'ArrowUp',
    titleX: 50,
    titleY: 15,
    artistX: 50,
    artistY: 21,
    align: 'center',
    desc: 'Üstte sinematik başlık, altta geniş görsel alan'
  },
  {
    id: 'BOTTOM_LEFT',
    name: 'Sol Alt (Spotify / Modern)',
    iconName: 'AlignLeft',
    titleX: 8,
    titleY: 80,
    artistX: 8,
    artistY: 86,
    align: 'left',
    desc: 'Modern akış servisleri sol alt editorial tasarım'
  },
  {
    id: 'BOTTOM_RIGHT',
    name: 'Sağ Alt (HUD Köşe)',
    iconName: 'AlignRight',
    titleX: 92,
    titleY: 80,
    artistX: 92,
    artistY: 86,
    align: 'right',
    desc: 'Teknoloji & Synthwave sağ alt köşe yerleşimi'
  },
  {
    id: 'CENTER_FOCUS',
    name: 'Merkez / Odak (Hero)',
    iconName: 'Focus',
    titleX: 50,
    titleY: 48,
    artistX: 50,
    artistY: 55,
    align: 'center',
    desc: 'Ekranın tam ortasında büyük kinetik odak'
  },
  {
    id: 'VERTICAL_REELS',
    name: 'Reels / TikTok Dikey',
    iconName: 'Smartphone',
    titleX: 50,
    titleY: 72,
    artistX: 50,
    artistY: 77,
    align: 'center',
    desc: '9:16 Hikaye ve Reels buton alanlarına çarpmayan yerleşim'
  }
];

export const TEXT_BADGE_STYLES = [
  { id: 'NONE', label: 'YOK (SAYDAM)', desc: 'Doğrudan görsel üzerine saf yazı' },
  { id: 'GLASS', label: 'CAM KAPSÜL', desc: 'Buzlu cam arkaplan ve ince sınır çizgisi' },
  { id: 'SOLID', label: 'MAT SİYAH', desc: 'Yüksek kontrastlı koyu kutu' },
  { id: 'NEON_BORDER', label: 'NEON ÇERÇEVE', desc: 'Parıldayan neon çizgili fütüristik çerçeve' },
  { id: 'PILL', label: 'SPOTIFY PILL', desc: 'Yuvarlatılmış pill rozet' }
];

