import { MusicGenreTemplate, AssetLibraryItem, PostRenderFeedbackRecord } from '../types';

// ============================================================================
// 1. MÜZİK TÜRÜ & MOOD ŞABLONLARI (CURATED GENRE TEMPLATES)
// ============================================================================

export const MUSIC_GENRE_TEMPLATES: MusicGenreTemplate[] = [
  {
    id: 'tpl_arabesk_neon',
    name: 'Arabesk Neon',
    genre: 'Arabesk / Trap Arabesk',
    tagline: 'Altın tonlar, duman, hafif glitch ve serif tipografi',
    description: 'Duygusal ve ağır tempolu parçalar için mistik altın ışıma, sinematik duman parçacıkları ve zarif serif şarkı sözleri.',
    iconName: 'Flame',
    previewColors: ['#FFD700', '#FFA500', '#1C1204'],
    fontFamily: 'serif',
    settings: {
      mode: 'CIRCULAR_AURA_SPECTRUM',
      aspectRatio: '9/16',
      primaryColor: '#FFD700',
      secondaryColor: '#FFA500',
      bgMode: 'PARTICLES',
      bgOpacity: 0.08,
      intensity: 1.15,
      bloomEnabled: true,
      bloom: 0.75,
      vignetteEnabled: true,
      vignette: 0.65,
      rgbSplitEnabled: true,
      rgbSplit: 0.25,
      scanLinesEnabled: false,
      filmGrainEnabled: true,
      filmGrain: 0.2,
      strobeEnabled: false,
      cameraShakeEnabled: true,
      cameraShake: 0.15,
      edgeGlowEnabled: true,
      edgeGlow: 0.7,
      visSpeed: 0.9,
      visScale: 1.1,
      visDensity: 1.2,
      visGlow: 0.85,
      visBeatSensitivity: 1.1,
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#FFD700',
    }
  },
  {
    id: 'tpl_trap_dark',
    name: 'Trap Dark',
    genre: 'Trap / Drill / Hip-Hop',
    tagline: 'Mor, derin siyah, spectrum ve agresif sub-bass pulsasyonu',
    description: 'Sert 808 baslar ve karanlık atmosferler için mor-siyah neon, scanline çizgileri ve yüksek transient tepkisi.',
    iconName: 'Zap',
    previewColors: ['#9D00FF', '#000000', '#E2B0FF'],
    fontFamily: 'sans',
    settings: {
      mode: 'CODROPS_POLAR',
      aspectRatio: '9/16',
      primaryColor: '#9D00FF',
      secondaryColor: '#FFFFFF',
      bgMode: 'GRID',
      bgOpacity: 0.09,
      intensity: 1.3,
      bloomEnabled: true,
      bloom: 0.8,
      vignetteEnabled: true,
      vignette: 0.8,
      rgbSplitEnabled: true,
      rgbSplit: 0.45,
      scanLinesEnabled: true,
      scanLines: 0.35,
      strobeEnabled: true,
      strobe: 0.3,
      cameraShakeEnabled: true,
      cameraShake: 0.35,
      edgeGlowEnabled: true,
      edgeGlow: 0.8,
      visSpeed: 1.2,
      visScale: 1.2,
      visDensity: 1.3,
      visGlow: 0.8,
      visBeatSensitivity: 1.45,
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 46,
      lyricsColor: '#E2B0FF',
    }
  },
  {
    id: 'tpl_pop_bright',
    name: 'Pop Bright',
    genre: 'Pop / Synthpop / Dance',
    tagline: 'Canlı pembe, turkuaz, akıcı küre ve yumuşak geçişler',
    description: 'Radyo hitleri, vokal ağırlıklı şarkılar ve enerjik pop parçaları için akıcı pastel neon ve modern display tipografi.',
    iconName: 'Sparkles',
    previewColors: ['#FF2A85', '#00F0FF', '#FFFFFF'],
    fontFamily: 'sans',
    settings: {
      mode: 'FLUID_METABALL',
      aspectRatio: '9/16',
      primaryColor: '#FF2A85',
      secondaryColor: '#00F0FF',
      bgMode: 'PARTICLES',
      bgOpacity: 0.05,
      intensity: 1.05,
      bloomEnabled: true,
      bloom: 0.65,
      vignetteEnabled: true,
      vignette: 0.35,
      rgbSplitEnabled: false,
      scanLinesEnabled: false,
      filmGrainEnabled: false,
      strobeEnabled: false,
      cameraShakeEnabled: false,
      edgeGlowEnabled: true,
      edgeGlow: 0.5,
      visSpeed: 1.0,
      visScale: 1.0,
      visDensity: 1.1,
      visGlow: 0.75,
      visBeatSensitivity: 1.0,
      lyricsStyle: 'NEON_BOX',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 40,
      lyricsColor: '#FFFFFF',
    }
  },
  {
    id: 'tpl_phonk_drift',
    name: 'Phonk Drift',
    genre: 'Drift Phonk / Hard Bass',
    tagline: 'Kan kırmızısı, neon sarı, strobe, VHS grain ve CRT efekti',
    description: 'Gece sürüşleri ve aşırı distorsiyonlu cowbell melodilere özel 60 FPS bas patlamaları, analog VHS ve CRT bozulması.',
    iconName: 'Activity',
    previewColors: ['#FF003C', '#FFE600', '#000000'],
    fontFamily: 'mono',
    settings: {
      mode: 'POPCORN_PHYSICS',
      aspectRatio: '9/16',
      primaryColor: '#FF003C',
      secondaryColor: '#FFE600',
      bgMode: 'GRID',
      bgOpacity: 0.12,
      intensity: 1.45,
      bloomEnabled: true,
      bloom: 0.9,
      vignetteEnabled: true,
      vignette: 0.75,
      rgbSplitEnabled: true,
      rgbSplit: 0.55,
      scanLinesEnabled: true,
      scanLines: 0.45,
      filmGrainEnabled: true,
      filmGrain: 0.45,
      strobeEnabled: true,
      strobe: 0.5,
      cameraShakeEnabled: true,
      cameraShake: 0.45,
      edgeGlowEnabled: true,
      edgeGlow: 0.9,
      visSpeed: 1.4,
      visScale: 1.25,
      visDensity: 1.5,
      visGlow: 0.95,
      visBeatSensitivity: 1.6,
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 44,
      lyricsColor: '#FFE600',
    }
  },
  {
    id: 'tpl_cyberpunk_club',
    name: 'Cyberpunk Club',
    genre: 'Cyberpunk / Midtempo / Electro',
    tagline: 'Elektrik mavi, lazer sarısı, 3D Grid tüneli ve hologram',
    description: '3D avatar meshleri, fütüristik grid dünyası ve Blade Runner tarzı sinematik lazer ışıklandırması.',
    iconName: 'Sliders',
    previewColors: ['#00F0FF', '#FFE600', '#050B14'],
    fontFamily: 'display',
    settings: {
      mode: 'SYNTHWAVE_GRID_3D',
      aspectRatio: '16/9',
      primaryColor: '#00F0FF',
      secondaryColor: '#FFE600',
      bgMode: 'GRID',
      bgOpacity: 0.1,
      intensity: 1.2,
      bloomEnabled: true,
      bloom: 0.85,
      vignetteEnabled: true,
      vignette: 0.6,
      rgbSplitEnabled: true,
      rgbSplit: 0.4,
      scanLinesEnabled: true,
      scanLines: 0.25,
      edgeGlowEnabled: true,
      edgeGlow: 0.8,
      visSpeed: 1.15,
      visScale: 1.1,
      visDensity: 1.2,
      visGlow: 0.85,
      visBeatSensitivity: 1.25,
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#00F0FF',
    }
  },
  {
    id: 'tpl_lofi_vintage',
    name: 'Lo-Fi Vintage',
    genre: 'Lo-Fi / Chillhop / Indie',
    tagline: 'Sıcak sepia, film grain, analog bant dalgalanması ve retro daktilo',
    description: 'Düşük tempolu, rahatlatıcı ve nostaljik parçalar için sıcak analog doku, kumlanma ve yumuşak spektrum.',
    iconName: 'Music',
    previewColors: ['#E0A96D', '#2C1D11', '#FFF3E3'],
    fontFamily: 'serif',
    settings: {
      mode: 'CIRCULAR_AURA_SPECTRUM',
      aspectRatio: '1/1',
      primaryColor: '#E0A96D',
      secondaryColor: '#FFF3E3',
      bgMode: 'NONE',
      bgOpacity: 0.04,
      intensity: 0.95,
      bloomEnabled: false,
      vignetteEnabled: true,
      vignette: 0.5,
      rgbSplitEnabled: false,
      scanLinesEnabled: true,
      scanLines: 0.2,
      filmGrainEnabled: true,
      filmGrain: 0.65,
      strobeEnabled: false,
      cameraShakeEnabled: false,
      edgeGlowEnabled: false,
      visSpeed: 0.8,
      visScale: 0.95,
      visDensity: 0.9,
      visGlow: 0.4,
      visBeatSensitivity: 0.9,
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 38,
      lyricsColor: '#FFF3E3',
    }
  },
  {
    id: 'tpl_dream_performer',
    name: '3D Dream Performer',
    genre: 'Cinematic / EDM / AI Vocal',
    tagline: 'Sese duyarlı 3D yüz mesh, sinematik neon ve derin bas aurası',
    description: 'Suno AI şarkıcıları ve dijital sanatçılar için gerçek zamanlı ağız/kafa hareketleri sunan amiral gemisi sahne.',
    iconName: 'Flame',
    previewColors: ['#0057FF', '#FF00A0', '#0A0E17'],
    fontFamily: 'display',
    settings: {
      mode: 'DREAM_PERFORMER',
      aspectRatio: '9/16',
      primaryColor: '#0057FF',
      secondaryColor: '#FF00A0',
      bgMode: 'PARTICLES',
      bgOpacity: 0.07,
      intensity: 1.25,
      bloomEnabled: true,
      bloom: 0.8,
      vignetteEnabled: true,
      vignette: 0.7,
      rgbSplitEnabled: true,
      rgbSplit: 0.35,
      filmGrainEnabled: true,
      filmGrain: 0.25,
      edgeGlowEnabled: true,
      edgeGlow: 0.75,
      visSpeed: 1.1,
      visScale: 1.15,
      visBeatSensitivity: 1.3,
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 44,
      lyricsColor: '#FFFFFF',
    }
  }
];

// ============================================================================
// 2. ASSET KÜTÜPHANESİ KATALOĞU (ASSET LIBRARY)
// ============================================================================

export const ASSET_LIBRARY_ITEMS: AssetLibraryItem[] = [
  // --- ARKAPLANLAR (BACKGROUNDS) ---
  {
    id: 'asset_bg_neon_city',
    name: 'Neon Cyber City 2077',
    category: 'BACKGROUND',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=200&fit=crop',
    description: 'Yüksek binalar, neon ışık yansımaları ve derin cyberpunk atmosferi.',
    badge: '4K DÖNGÜ',
    applyConfig: {
      bgMode: 'GRID',
      bgOpacity: 0.12,
      primaryColor: '#00F0FF',
      secondaryColor: '#FF007F'
    }
  },
  {
    id: 'asset_bg_smoke_haze',
    name: 'Cinematic Smoke & Fog',
    category: 'BACKGROUND',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=200&fit=crop',
    description: 'Konser ve stüdyo havası veren sese duyarlı yumuşak duman sisi.',
    badge: 'SESE DUYARLI',
    applyConfig: {
      bgMode: 'PARTICLES',
      bgOpacity: 0.08,
      filmGrainEnabled: true,
      filmGrain: 0.25
    }
  },
  {
    id: 'asset_bg_deep_particles',
    name: 'Quantum Audio Particles',
    category: 'BACKGROUND',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=300&h=200&fit=crop',
    description: 'Bas vuruşlarında etrafa saçılan 2000+ mikro ışık parçacığı.',
    badge: 'POPÜLER',
    applyConfig: {
      bgMode: 'PARTICLES',
      bgOpacity: 0.1,
      edgeGlowEnabled: true,
      edgeGlow: 0.7
    }
  },
  {
    id: 'asset_bg_stars_cosmos',
    name: 'Cosmic Nebula & Stars',
    category: 'BACKGROUND',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop',
    description: 'Sonsuz uzay derinliği, dönen yıldız tozları ve galaktik renkler.',
    badge: '60 FPS',
    applyConfig: {
      bgMode: 'PARTICLES',
      bgOpacity: 0.06,
      bloomEnabled: true,
      bloom: 0.8
    }
  },
  {
    id: 'asset_bg_cyber_grid_3d',
    name: 'Tron Retro Cyber Grid',
    category: 'BACKGROUND',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&h=200&fit=crop',
    description: 'Sonsuza uzanan 3D perspektif zemin çizgileri ve bas dalgaları.',
    badge: 'SYNTHWAVE',
    applyConfig: {
      bgMode: 'GRID',
      bgOpacity: 0.14,
      scanLinesEnabled: true,
      scanLines: 0.3
    }
  },

  // --- OVERLAYLER (OVERLAYS) ---
  {
    id: 'asset_ov_vhs_tape',
    name: 'VHS Camcorder 1989',
    category: 'OVERLAY',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&h=200&fit=crop',
    description: 'Tarih sayacı, SP kayıt modu, tracking hatası ve analog kaset paraziti.',
    badge: 'RETRO',
    applyConfig: {
      rgbSplitEnabled: true,
      rgbSplit: 0.4,
      scanLinesEnabled: true,
      scanLines: 0.35,
      filmGrainEnabled: true,
      filmGrain: 0.3
    }
  },
  {
    id: 'asset_ov_crt_scanlines',
    name: 'CRT Phosphor Scanlines',
    category: 'OVERLAY',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop',
    description: 'Tüplü televizyon fosfor çizgileri ve köşelerde kavisli cam efekti.',
    badge: 'ANALOG',
    applyConfig: {
      scanLinesEnabled: true,
      scanLines: 0.45,
      vignetteEnabled: true,
      vignette: 0.6
    }
  },
  {
    id: 'asset_ov_film_grain_35mm',
    name: '35mm Kodak Film Grain',
    category: 'OVERLAY',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=200&fit=crop',
    description: 'Sinematik sıcaklık katan gerçekçi gümüş halojenür film kumlanması.',
    badge: 'SİNEMATİK',
    applyConfig: {
      filmGrainEnabled: true,
      filmGrain: 0.5,
      bloomEnabled: true,
      bloom: 0.45
    }
  },
  {
    id: 'asset_ov_noise_dust',
    name: 'Analog Dust & Noise Texture',
    category: 'OVERLAY',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=200&fit=crop',
    description: 'Lo-Fi ve vintage parçalarda plak çıtırtısı hissini görselleştiren toz dokusu.',
    badge: 'LO-FI',
    applyConfig: {
      filmGrainEnabled: true,
      filmGrain: 0.4,
      vignetteEnabled: true,
      vignette: 0.5
    }
  },
  {
    id: 'asset_ov_glitch_chroma',
    name: 'RGB Glitch Slice Surge',
    category: 'OVERLAY',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&h=200&fit=crop',
    description: 'Bas transient vuruşlarında tetiklenen kromatik kayma ve veri dilimleme.',
    badge: 'PHONK/TRAP',
    applyConfig: {
      rgbSplitEnabled: true,
      rgbSplit: 0.55,
      strobeEnabled: true,
      strobe: 0.35,
      cameraShakeEnabled: true,
      cameraShake: 0.3
    }
  },

  // --- GEOMETRİK KATMANLAR (GEOMETRIC LAYERS) ---
  {
    id: 'asset_geo_tunnel_warp',
    name: 'Hyperdrive Warp Tunnel',
    category: 'GEOMETRIC_LAYER',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&h=200&fit=crop',
    description: 'Müziğin ritmiyle iç içe geçen ve derinlik hissi veren sonsuz tünel halkaları.',
    badge: '3D DEEP',
    applyConfig: {
      visScale: 1.2,
      visSpeed: 1.3,
      visGlow: 0.85
    }
  },
  {
    id: 'asset_geo_sacred_circle',
    name: 'Sacred Audio Geometry Ring',
    category: 'GEOMETRIC_LAYER',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop',
    description: 'Altın oran çemberleri ve 360 derece sese duyarlı frekans yayları.',
    badge: 'MİNİMAL',
    applyConfig: {
      visDensity: 1.25,
      visRotation: 0.8,
      visBeatSensitivity: 1.2
    }
  },
  {
    id: 'asset_geo_pulse_triangle',
    name: 'Cyber Wireframe Triangle',
    category: 'GEOMETRIC_LAYER',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=200&fit=crop',
    description: 'Karanlık tekno ve synthwave için dönen ve basla nefes alan neon üçgen.',
    badge: 'CYBER',
    applyConfig: {
      visScale: 1.1,
      visGlow: 0.9,
      edgeGlowEnabled: true,
      edgeGlow: 0.8
    }
  }
];

// ============================================================================
// 3. FAZ 2 KALICI GERİ BİLDİRİM DEPOLAMA YARDIMCISI (FEEDBACK UTILS)
// ============================================================================

const FEEDBACK_STORAGE_KEY = 'vidframer_post_render_feedback_v2';

export function getSavedFeedback(): PostRenderFeedbackRecord[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Feedback get error:', e);
    return [];
  }
}

export function savePostRenderFeedback(record: PostRenderFeedbackRecord) {
  try {
    const existing = getSavedFeedback();
    const updated = [record, ...existing].slice(0, 200); // keep last 200
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Feedback save error:', e);
  }
}
