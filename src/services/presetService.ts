import { VisualizerPresetProfile, VisualizerSettings } from '../types';

const STORAGE_KEY = 'vidframer_visualizer_profiles_v1';
const ACTIVE_PROFILE_KEY = 'vidframer_active_profile_id_v1';

// Küratörlü Başlangıç Preset Profilleri (Curated Built-in Profiles)
export const BUILTIN_PROFILES: VisualizerPresetProfile[] = [
  {
    id: 'builtin_cyber_gold',
    name: 'CYBERPUNK GOLD 2077',
    description: 'Yüksek kontrastlı altın sarısı, neon tünel ve kromatik aberasyon',
    createdAt: 1723120000000,
    isBuiltin: true,
    settings: {
      mode: 'NEON_TUNNEL',
      aspectRatio: '16/9',
      primaryColor: '#FFD700',
      secondaryColor: '#FFFFFF',
      bgMode: 'GRID',
      bgOpacity: 0.08,
      intensity: 1.1,
      rgbSplitEnabled: true,
      rgbSplit: 0.35,
      scanLinesEnabled: true,
      scanLines: 0.25,
      bloomEnabled: true,
      bloom: 0.7,
      vignetteEnabled: true,
      vignette: 0.55,
      filmGrainEnabled: false,
      strobeEnabled: true,
      strobe: 0.3,
      cameraShakeEnabled: true,
      cameraShake: 0.25,
      edgeGlowEnabled: true,
      edgeGlow: 0.6,
      visSpeed: 1.2,
      visScale: 1.1,
      visDensity: 1.2,
      visRotation: 0.6,
      visGlow: 0.8,
      visBeatSensitivity: 1.2,
      lyricsStyle: 'KINETIC',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 44,
      lyricsColor: '#FFD700'
    }
  },
  {
    id: 'builtin_synthwave_retro',
    name: 'SYNTHWAVE NEON HIGHWAY',
    description: '80ler retro fütüristik mavi/mor polar frekans ve analog scanlines',
    createdAt: 1723120001000,
    isBuiltin: true,
    settings: {
      mode: 'CODROPS_POLAR',
      aspectRatio: '16/9',
      primaryColor: '#00F0FF',
      secondaryColor: '#FF003C',
      bgMode: 'GRID',
      bgOpacity: 0.1,
      intensity: 1.0,
      rgbSplitEnabled: true,
      rgbSplit: 0.4,
      scanLinesEnabled: true,
      scanLines: 0.4,
      filmGrainEnabled: true,
      filmGrain: 0.3,
      bloomEnabled: true,
      bloom: 0.8,
      vignetteEnabled: true,
      vignette: 0.65,
      glitchSliceEnabled: true,
      glitchSlice: 0.3,
      visSpeed: 1.0,
      visScale: 1.0,
      visDensity: 1.0,
      visGlow: 0.7,
      visBeatSensitivity: 1.1,
      lyricsStyle: 'NEON_BOX',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 40,
      lyricsColor: '#00F0FF'
    }
  },
  {
    id: 'builtin_popcorn_fiesta',
    name: 'POPCORN PHYSICS SURGE',
    description: 'Hughsk fizik motoru, yerçekimi ve transient bas patlamaları',
    createdAt: 1723120002000,
    isBuiltin: true,
    settings: {
      mode: 'POPCORN_PHYSICS',
      aspectRatio: '16/9',
      primaryColor: '#39FF14',
      secondaryColor: '#FFD700',
      bgMode: 'PARTICLES',
      bgOpacity: 0.06,
      intensity: 1.3,
      bloomEnabled: true,
      bloom: 0.85,
      strobeEnabled: true,
      strobe: 0.45,
      cameraShakeEnabled: true,
      cameraShake: 0.4,
      edgeGlowEnabled: true,
      edgeGlow: 0.8,
      visSpeed: 1.3,
      visScale: 1.2,
      visDensity: 1.4,
      visBeatSensitivity: 1.4,
      visGlow: 0.9,
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 46,
      lyricsColor: '#39FF14'
    }
  },
  {
    id: 'builtin_vissonance_3d',
    name: 'VISSONANCE HYPER RING',
    description: '3D dairesel perspektif halkaları ve dinamik uzay partikülleri',
    createdAt: 1723120003000,
    isBuiltin: true,
    settings: {
      mode: 'VISSONANCE_RING',
      aspectRatio: '16/9',
      primaryColor: '#BD00FF',
      secondaryColor: '#00F0FF',
      bgMode: 'SMOKE',
      bgOpacity: 0.07,
      intensity: 1.0,
      bloomEnabled: true,
      bloom: 0.9,
      edgeGlowEnabled: true,
      edgeGlow: 0.75,
      lensDistortEnabled: true,
      lensDistort: 0.3,
      motionTrailEnabled: true,
      motionTrail: 0.35,
      visSpeed: 1.1,
      visScale: 1.05,
      visDensity: 1.1,
      visRotation: 0.5,
      visGlow: 0.85,
      visBeatSensitivity: 1.2,
      lyricsStyle: 'KARAOKE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 42,
      lyricsColor: '#BD00FF'
    }
  },
  {
    id: 'builtin_noir_minimal',
    name: 'NOIR MONOLITH MINIMAL',
    description: 'Saf brutalist siyah beyaz estetik, analog gren ve temiz frekans blokları',
    createdAt: 1723120004000,
    isBuiltin: true,
    settings: {
      mode: 'MONOLITH',
      aspectRatio: '16/9',
      primaryColor: '#E4E3E0',
      secondaryColor: '#71717A',
      bgMode: 'NONE',
      bgOpacity: 0.0,
      intensity: 0.8,
      filmGrainEnabled: true,
      filmGrain: 0.4,
      vignetteEnabled: true,
      vignette: 0.4,
      scanLinesEnabled: false,
      bloomEnabled: false,
      strobeEnabled: false,
      cameraShakeEnabled: false,
      visSpeed: 0.9,
      visScale: 0.95,
      visDensity: 0.9,
      visBeatSensitivity: 0.9,
      lyricsStyle: 'SUBTITLE',
      lyricsPosition: 'BOTTOM',
      lyricsFontSize: 36,
      lyricsColor: '#E4E3E0'
    }
  },
  {
    id: 'builtin_phonk_brutal',
    name: 'PHONK WAVE AGGRESSION',
    description: 'Ağır 808 distortion, glitch dilimleme ve sarsıntılı kırmızı flare',
    createdAt: 1723120005000,
    isBuiltin: true,
    settings: {
      mode: 'PHONKWAVE',
      aspectRatio: '16/9',
      primaryColor: '#FF003C',
      secondaryColor: '#FFD700',
      bgMode: 'GRID',
      bgOpacity: 0.12,
      intensity: 1.4,
      glitchSliceEnabled: true,
      glitchSlice: 0.5,
      cameraShakeEnabled: true,
      cameraShake: 0.5,
      strobeEnabled: true,
      strobe: 0.5,
      rgbSplitEnabled: true,
      rgbSplit: 0.45,
      bloomEnabled: true,
      bloom: 0.85,
      filmGrainEnabled: true,
      filmGrain: 0.35,
      visSpeed: 1.4,
      visBeatSensitivity: 1.5,
      lyricsStyle: 'CYBER_GLITCH',
      lyricsPosition: 'CENTER',
      lyricsFontSize: 48,
      lyricsColor: '#FF003C'
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
