import { VisualizerPresetProfile, VisualizerSettings } from '../types';

const STORAGE_KEY = 'vidframer_visualizer_profiles_v1';
const ACTIVE_PROFILE_KEY = 'vidframer_active_profile_id_v1';

// Küratörlü Başlangıç Preset Profilleri (Curated Built-in Profiles)
export const BUILTIN_PROFILES: VisualizerPresetProfile[] = [
  {
    id: 'builtin_default_preset',
    name: 'DEFAULT PRESET',
    description: 'Temel başlatma ayarları.',
    createdAt: 1723110000000,
    isBuiltin: true,
    settings: {
      mode: 'NEON_TUNNEL',
      aspectRatio: '16/9',
      avatarMode: 'anime',
      cardLayout: 'DEFAULT',
      intensity: 1.0,
      rgbSplitEnabled: false,
      rgbSplit: 0.25,
      scanLinesEnabled: false,
      scanLines: 0.2,
      vignetteEnabled: false,
      vignette: 0.5,
      bloomEnabled: false,
      bloom: 0.6,
      filmGrainEnabled: false,
      filmGrain: 0.25,
      strobeEnabled: false,
      strobe: 0.4,
      cameraShakeEnabled: false,
      cameraShake: 0.3,
      lensDistortEnabled: false,
      lensDistort: 0.3,
      motionTrailEnabled: false,
      motionTrail: 0.3,
      glitchSliceEnabled: false,
      glitchSlice: 0.35,
      edgeGlowEnabled: false,
      edgeGlow: 0.4,
      displacement: 0.3,
      jitter: 0,
      primaryColor: '#FFD700',
      secondaryColor: '#FFFFFF',
      bgMode: 'GRID',
      bgOpacity: 0.06,
      trackTitle: 'Demo Song',
      artistName: 'Demo Singer',
      lyricsEnabled: true,
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#FFD700',
      syncedLyrics: null,
      bgImageUrl: null,
      bgImageOpacity: 0.7,
      bgImageBlur: 0,
      bgImageReactive: true,
      bgVideoUrl: null,
      bgVideoOpacity: 0.65,
      bgVideoBlur: 0,
      bgVideoReactive: true,
      visSpeed: 1.0,
      visScale: 1.0,
      visDensity: 1.0,
      visRotation: 0.5,
      visGlow: 0.5,
      visBeatSensitivity: 1.0,
      visColorShift: 0.2,
      objFaceBgColor: '#0a0a0c',
      objFaceColor: '#4f86f7',
      objFaceColorMode: 'solid',
      objFaceCycleSpeed: 1.0,
      objFaceBgReactive: false
    }
  },
  {
    id: 'builtin_studio_split_lyrics',
    name: 'APPLE / TV SPLIT LYRICS FLOW',
    description: 'Sol panelde albüm kapağı, FLAC rozeti, ilerleme çubuğu ve player; sağ panelde derinlik bulanıklı akan şarkı sözleri.',
    createdAt: 1723120000000,
    isBuiltin: true,
    settings: {
      mode: 'STUDIO_SPLIT_LYRICS',
      aspectRatio: '16/9',
      primaryColor: '#FFFFFF',
      secondaryColor: '#38BDF8',
      bgMode: 'NONE',
      bgOpacity: 0.1,
      intensity: 1.1,
      bloomEnabled: true,
      bloom: 0.6,
      vignetteEnabled: true,
      vignette: 0.8,
      rgbSplitEnabled: false,
      filmGrainEnabled: true,
      filmGrain: 0.12,
      cameraShakeEnabled: false,
      cameraShake: 0.0,
      strobeEnabled: false,
      cardLayout: 'DEFAULT',
      lyricsStyle: 'BETTER_FLOW',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 44,
      lyricsColor: '#FFFFFF',
      lyricsHighlightColor: '#FFFFFF',
      lyricsBlurInactive: true,
      lyricsShowVocalGapDots: true,
      lyricsLongNoteGlow: true
    }
  },
  {
    id: 'builtin_cover_pulse_3d',
    name: 'COVER PULSE 3D (22NOIR RELEASE)',
    description: '3D albüm kapağı, otomatik renk paleti, yan EQ dalgaları, ışık darbeleri & Spotify/YouTube player.',
    createdAt: 1723120000000,
    isBuiltin: true,
    settings: {
      mode: 'COVER_PULSE_3D',
      aspectRatio: '16/9',
      primaryColor: '#FF2A6D',
      secondaryColor: '#05D9E8',
      bgMode: 'NONE',
      bgOpacity: 0.1,
      intensity: 1.25,
      bloomEnabled: true,
      bloom: 0.85,
      vignetteEnabled: true,
      vignette: 0.7,
      rgbSplitEnabled: false,
      filmGrainEnabled: true,
      filmGrain: 0.15,
      cameraShakeEnabled: true,
      cameraShake: 0.2,
      strobeEnabled: false,
      cardLayout: 'DEFAULT',
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 36,
      lyricsColor: '#FFFFFF'
    }
  },
  {
    id: 'builtin_rebellion',
    name: 'REBELLION',
    description: 'Derin karanlık duman, kırmızı parlama, yoğun bloom ve sarsıntılı bas.',
    createdAt: 1723120000000,
    isBuiltin: true,
    settings: {
      mode: 'CIRCULAR_AURA_SPECTRUM',
      aspectRatio: '16/9',
      primaryColor: '#FF003C',
      secondaryColor: '#000000',
      bgMode: 'SMOKE',
      bgOpacity: 0.15,
      intensity: 1.35,
      bloomEnabled: true,
      bloom: 0.9,
      vignetteEnabled: true,
      vignette: 0.75,
      rgbSplitEnabled: true,
      rgbSplit: 0.4,
      filmGrainEnabled: true,
      filmGrain: 0.3,
      cameraShakeEnabled: true,
      cameraShake: 0.35,
      strobeEnabled: true,
      strobe: 0.3,
      cardLayout: 'NEON_FRAME',
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 44,
      lyricsColor: '#FF003C',
      bgImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_thru_space_time',
    name: 'thru space & time',
    description: 'Sonsuz siber tünel bükülmesi, kozmik mavi/mor enerji ve hızlı parçacıklar.',
    createdAt: 1723120001000,
    isBuiltin: true,
    settings: {
      mode: 'NEON_TUNNEL',
      aspectRatio: '16/9',
      primaryColor: '#00F0FF',
      secondaryColor: '#BD00FF',
      bgMode: 'PARTICLES',
      bgOpacity: 0.12,
      intensity: 1.25,
      bloomEnabled: true,
      bloom: 0.85,
      vignetteEnabled: true,
      vignette: 0.6,
      rgbSplitEnabled: true,
      rgbSplit: 0.35,
      cameraShakeEnabled: true,
      cameraShake: 0.3,
      cardLayout: 'HOLO_CD',
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 40,
      lyricsColor: '#00F0FF',
      bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_digital_abyss',
    name: 'DIGITAL ABYSS',
    description: 'Kuantum parçacık küresi, siber radar telemetrisi ve can alıcı yeşil neon.',
    createdAt: 1723120002000,
    isBuiltin: true,
    settings: {
      mode: 'PARTICLE_SPHERE_3D',
      aspectRatio: '16/9',
      primaryColor: '#39FF14',
      secondaryColor: '#FFA500',
      bgMode: 'GRID',
      bgOpacity: 0.1,
      intensity: 1.15,
      bloomEnabled: true,
      bloom: 0.75,
      scanLinesEnabled: true,
      scanLines: 0.25,
      filmGrainEnabled: false,
      cardLayout: 'DEFAULT',
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 42,
      lyricsColor: '#39FF14',
      bgImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_forest_lights',
    name: 'FOREST OF LIGHTS',
    description: 'Dumanlı orman manzarası, süzülen ışık huzmeleri ve minimal spektrum.',
    createdAt: 1723120003000,
    isBuiltin: true,
    settings: {
      mode: 'CAVA_SPECTRUM',
      aspectRatio: '16/9',
      primaryColor: '#FFFFFF',
      secondaryColor: '#A1A1AA',
      bgMode: 'NONE',
      bgOpacity: 0.05,
      intensity: 0.95,
      bloomEnabled: true,
      bloom: 0.4,
      vignetteEnabled: true,
      vignette: 0.55,
      filmGrainEnabled: true,
      filmGrain: 0.25,
      cardLayout: 'GLASS_CARD',
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 38,
      lyricsColor: '#FFFFFF',
      bgImageUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_prismatic_shard',
    name: 'PRISMATIC SHARD',
    description: '3D cam kristaller, sese duyarlı geometrik halka ve renk geçişleri.',
    createdAt: 1723120004000,
    isBuiltin: true,
    settings: {
      mode: 'VISSONANCE_RING',
      aspectRatio: '16/9',
      primaryColor: '#FF007F',
      secondaryColor: '#00F0FF',
      bgMode: 'SMOKE',
      bgOpacity: 0.08,
      intensity: 1.25,
      bloomEnabled: true,
      bloom: 0.85,
      lensDistortEnabled: true,
      lensDistort: 0.25,
      cardLayout: 'DEFAULT',
      lyricsStyle: 'NEON_BOX',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 44,
      lyricsColor: '#FFFFFF',
      bgImageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_infrared',
    name: 'INFRARED',
    description: 'Retro 3D dağ ızgarası, neon güneş, kaset greni ve scanline çizgileri.',
    createdAt: 1723120005000,
    isBuiltin: true,
    settings: {
      mode: 'SYNTHWAVE_GRID_3D',
      aspectRatio: '16/9',
      primaryColor: '#FF007F',
      secondaryColor: '#00FFFF',
      bgMode: 'GRID',
      bgOpacity: 0.15,
      intensity: 1.15,
      bloomEnabled: true,
      bloom: 0.8,
      scanLinesEnabled: true,
      scanLines: 0.4,
      rgbSplitEnabled: true,
      rgbSplit: 0.35,
      filmGrainEnabled: true,
      filmGrain: 0.2,
      cardLayout: 'RETRO_TAPE',
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#00FFFF',
      bgImageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_jungle_cat',
    name: 'JUNGLE CAT',
    description: 'Vahşi orman aslanı portresi, organik bas spektrum barları ve altın tonlar.',
    createdAt: 1723120006000,
    isBuiltin: true,
    settings: {
      mode: 'SPECTRUM',
      aspectRatio: '16/9',
      primaryColor: '#FFD700',
      secondaryColor: '#E4E3E0',
      bgMode: 'NONE',
      bgOpacity: 0.05,
      intensity: 1.0,
      bloomEnabled: true,
      bloom: 0.5,
      vignetteEnabled: true,
      vignette: 0.65,
      cardLayout: 'COVER_BIG',
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 40,
      lyricsColor: '#FFD700',
      bgImageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_default_brutal',
    name: 'DEFAULT BRUTAL',
    description: 'Siyah monolit sütunlar, perspektif çizgileri ve bas sarsıntısı.',
    createdAt: 1723120007000,
    isBuiltin: true,
    settings: {
      mode: 'MONOLITH',
      aspectRatio: '16/9',
      primaryColor: '#FFFFFF',
      secondaryColor: '#71717A',
      bgMode: 'NONE',
      bgOpacity: 0.0,
      intensity: 1.2,
      filmGrainEnabled: true,
      filmGrain: 0.35,
      cameraShakeEnabled: true,
      cameraShake: 0.25,
      cardLayout: 'NOIR_VINYL',
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 38,
      lyricsColor: '#E4E3E0',
      bgImageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_magma',
    name: 'MAGMA',
    description: 'Erimiş magma akışkanları ve parıldayan kırmızı şok dalgaları.',
    createdAt: 1723120008000,
    isBuiltin: true,
    settings: {
      mode: 'CIRCULAR_AURA_SPECTRUM',
      aspectRatio: '16/9',
      primaryColor: '#FF2200',
      secondaryColor: '#FFAA00',
      bgMode: 'SMOKE',
      bgOpacity: 0.12,
      intensity: 1.3,
      bloomEnabled: true,
      bloom: 0.8,
      strobeEnabled: true,
      strobe: 0.35,
      cardLayout: 'NEON_FRAME',
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 46,
      lyricsColor: '#FF2200',
      bgImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_coil',
    name: 'COIL',
    description: 'Metropol silüeti üzerinde basla bükülen dairesel polar osiloskop halkaları.',
    createdAt: 1723120009000,
    isBuiltin: true,
    settings: {
      mode: 'CODROPS_POLAR',
      aspectRatio: '16/9',
      primaryColor: '#0088FF',
      secondaryColor: '#A3E635',
      bgMode: 'GRID',
      bgOpacity: 0.1,
      intensity: 1.15,
      bloomEnabled: true,
      bloom: 0.75,
      vignetteEnabled: true,
      vignette: 0.5,
      cardLayout: 'HOLO_CD',
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#0088FF',
      bgImageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_skyline',
    name: 'SKYLINE',
    description: 'Siyah beyaz gökdelen perspektifi, daktilo şarkı sözleri ve logaritmik spektrum.',
    createdAt: 1723120010000,
    isBuiltin: true,
    settings: {
      mode: 'SPECTRUM',
      aspectRatio: '16/9',
      primaryColor: '#FFFFFF',
      secondaryColor: '#78716C',
      bgMode: 'NONE',
      bgOpacity: 0.05,
      intensity: 0.9,
      filmGrainEnabled: true,
      filmGrain: 0.5,
      vignetteEnabled: true,
      vignette: 0.5,
      cardLayout: 'GLASS_CARD',
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 38,
      lyricsColor: '#FFFFFF',
      bgImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80'
    }
  },
  {
    id: 'builtin_red_planet',
    name: 'RED PLANET',
    description: 'Kızıl Mars yüzeyi ve çift kanallı osiloskop ses dalgası.',
    createdAt: 1723120011000,
    isBuiltin: true,
    settings: {
      mode: 'CODROPS_WAVE',
      aspectRatio: '16/9',
      primaryColor: '#FF3333',
      secondaryColor: '#FF6666',
      bgMode: 'PARTICLES',
      bgOpacity: 0.08,
      intensity: 1.2,
      bloomEnabled: true,
      bloom: 0.75,
      strobeEnabled: true,
      strobe: 0.25,
      cardLayout: 'DEFAULT',
      lyricsStyle: 'KARAOKE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 40,
      lyricsColor: '#FF3333',
      bgImageUrl: 'https://images.unsplash.com/photo-1612892483236-42d68a57623d?auto=format&fit=crop&w=1920&q=80'
    }
  }
];

// Clean Visualizer Settings for Preset Export/Storage
export function sanitizeSettingsForProfile(settings: VisualizerSettings): Partial<VisualizerSettings> {
  const {
    // Parçaya özel metadata alanlarını çıkar (ayrık tut)
    trackTitle,
    artistName,
    syncedLyrics,
    bgVideoUrl,
    coverScale,
    coverX,
    coverY,
    ...pureVisualSettings
  } = settings;

  return pureVisualSettings;
}

// LocalStorage Yardımcıları
export const PresetService = {
  /**
   * Tüm profilleri getirir (Kullanıcı profilleri + Yerleşik profiller)
   */
  getProfiles(): VisualizerPresetProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // İlk açılışta yerleşik profilleri kaydet
        localStorage.setItem(STORAGE_KEY, JSON.stringify(BUILTIN_PROFILES));
        return BUILTIN_PROFILES;
      }
      const parsed: VisualizerPresetProfile[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return BUILTIN_PROFILES;
      }
      return parsed;
    } catch (e) {
      console.warn('LocalStorage okunamadı, varsayılan profiller kullanılıyor:', e);
      return BUILTIN_PROFILES;
    }
  },

  /**
   * Aktif seçili profil kimliğini döndürür
   */
  getActiveProfileId(): string | null {
    try {
      return localStorage.getItem(ACTIVE_PROFILE_KEY);
    } catch (_) {
      return null;
    }
  },

  /**
   * Aktif profil kimliğini kaydeder
   */
  setActiveProfileId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(ACTIVE_PROFILE_KEY, id);
      } else {
        localStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
    } catch (_) {}
  },

  /**
   * Yeni bir profil oluşturur ve kaydeder
   */
  saveNewProfile(name: string, settings: VisualizerSettings, description?: string): VisualizerPresetProfile {
    const profiles = this.getProfiles();
    const cleanName = name.trim() || `Profil ${profiles.length + 1}`;
    const id = `user_prof_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const newProfile: VisualizerPresetProfile = {
      id,
      name: cleanName,
      description: description?.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isBuiltin: false,
      settings: sanitizeSettingsForProfile(settings)
    };

    const updated = [newProfile, ...profiles];
    this.saveAllProfiles(updated);
    this.setActiveProfileId(id);
    return newProfile;
  },

  /**
   * Var olan bir profili günceller / üzerine yazar
   */
  updateProfile(id: string, name: string, settings: VisualizerSettings, description?: string): VisualizerPresetProfile | null {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = profiles[index];
    const updatedProfile: VisualizerPresetProfile = {
      ...existing,
      name: name.trim() || existing.name,
      description: description !== undefined ? description.trim() : existing.description,
      updatedAt: Date.now(),
      isBuiltin: false, // Kullanıcı düzenlediğinde özelleştirilmiş olur
      settings: sanitizeSettingsForProfile(settings)
    };

    profiles[index] = updatedProfile;
    this.saveAllProfiles(profiles);
    this.setActiveProfileId(id);
    return updatedProfile;
  },

  /**
   * Profili siler
   */
  deleteProfile(id: string): boolean {
    const profiles = this.getProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    if (filtered.length === profiles.length) return false;

    this.saveAllProfiles(filtered);
    if (this.getActiveProfileId() === id) {
      this.setActiveProfileId(filtered.length > 0 ? filtered[0].id : null);
    }
    return true;
  },

  /**
   * Tüm profilleri kaydeder
   */
  saveAllProfiles(profiles: VisualizerPresetProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('LocalStorage profilleri kaydedilirken hata oluştu:', e);
    }
  },

  /**
   * Varsayılan hazır profillere sıfırlar
   */
  resetToDefaults(): VisualizerPresetProfile[] {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BUILTIN_PROFILES));
      this.setActiveProfileId(BUILTIN_PROFILES[0].id);
      return BUILTIN_PROFILES;
    } catch (_) {
      return BUILTIN_PROFILES;
    }
  },

  /**
   * Profilleri JSON formatında dışa aktarır
   */
  exportProfilesJSON(): string {
    const profiles = this.getProfiles();
    return JSON.stringify({
      schema: 'vidframer_profiles_v1',
      exportedAt: new Date().toISOString(),
      profiles
    }, null, 2);
  },

  /**
   * JSON dosyasından profilleri içe aktarır
   */
  importProfilesJSON(jsonStr: string): { successCount: number; errorCount: number; imported: VisualizerPresetProfile[] } {
    try {
      const data = JSON.parse(jsonStr);
      const incoming: VisualizerPresetProfile[] = Array.isArray(data) ? data : data.profiles;
      
      if (!Array.isArray(incoming)) {
        throw new Error('Geçersiz profil veri yapısı');
      }

      const current = this.getProfiles();
      const existingIds = new Set(current.map(p => p.id));
      const newlyAdded: VisualizerPresetProfile[] = [];

      for (const item of incoming) {
        if (!item || typeof item !== 'object' || !item.name || !item.settings) {
          continue;
        }

        // Benzersiz ID ver
        const id = existingIds.has(item.id) 
          ? `user_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
          : (item.id || `user_imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

        const validProfile: VisualizerPresetProfile = {
          id,
          name: String(item.name).slice(0, 50),
          description: item.description ? String(item.description).slice(0, 150) : undefined,
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
          isBuiltin: false,
          settings: item.settings
        };

        newlyAdded.push(validProfile);
        existingIds.add(id);
      }

      if (newlyAdded.length > 0) {
        const merged = [...newlyAdded, ...current];
        this.saveAllProfiles(merged);
        this.setActiveProfileId(newlyAdded[0].id);
      }

      return {
        successCount: newlyAdded.length,
        errorCount: incoming.length - newlyAdded.length,
        imported: newlyAdded
      };
    } catch (e: any) {
      console.error('İçe aktarma hatası:', e);
      return { successCount: 0, errorCount: 1, imported: [] };
    }
  }
};
