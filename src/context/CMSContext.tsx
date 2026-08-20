import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CMSFullConfig, 
  CMSGlobalSettings, 
  CMSApiKeysConfig, 
  CMSVisualizerConfig, 
  VisualizerPresetProfile,
  CMSPageItem,
  CMSMediaItem,
  CMSSeoAnalytics,
  CMSFormSubmission
} from '../types';
import { VISUALIZER_MODES, VisualizerModeEntry } from '../lib/visualizerCatalog';

const DEFAULT_GLOBAL: CMSGlobalSettings = {
  appName: "GlitchFramer 2.0",
  appSubtitle: "Audio Visualizer & Video Engine",
  tabTitle: "GlitchFramer 2.0 | 60 FPS Audio Visualizer",
  metaDescription: "60 FPS Cyberpunk, Cinematic & Studio Audio Visualizer Video Engine",
  logoUrl: "",
  logoType: "icon",
  headerTitle: "GlitchFramer",
  headerSubtitle: "STUDIO 2.0",
  headerLinks: [
    { id: "1", label: "Studio", url: "/" },
    { id: "2", label: "Hızlı Başlat", url: "/?mode=quick" }
  ],
  footerText: "© 2026 GlitchFramer Studio. 60 FPS Cyberpunk Müzik Render Motoru.",
  footerLinks: [
    { id: "1", label: "Dokümantasyon", url: "#" },
    { id: "2", label: "Kullanım Şartları", url: "#" },
    { id: "3", label: "Gizlilik Politikası", url: "#" }
  ],
  theme: {
    primaryColor: "#FFD700",
    secondaryColor: "#FFFFFF",
    accentColor: "#0057FF",
    bgDark: "#060608"
  }
};

const DEFAULT_CONFIG: CMSFullConfig = {
  globalSettings: DEFAULT_GLOBAL,
  apiKeys: {
    hasGeminiKey: false,
    maskedGeminiKey: "",
    hasSunoKey: false,
    maskedSunoKey: "",
    customWebhookUrl: "",
    geminiModel: "gemini-2.5-flash"
  },
  visualizerConfig: {
    disabledVisualizers: [],
    customLabels: {}
  },
  customPresets: [],
  pages: [],
  mediaAssets: [],
  inboxMessages: [],
  auditLogs: [],
  updatedAt: Date.now()
};

interface CMSContextType {
  config: CMSFullConfig;
  globalSettings: CMSGlobalSettings;
  apiKeys: CMSApiKeysConfig;
  visualizerConfig: CMSVisualizerConfig;
  customPresets: VisualizerPresetProfile[];
  pages: CMSPageItem[];
  mediaAssets: CMSMediaItem[];
  seoAnalytics?: CMSSeoAnalytics;
  inboxMessages: CMSFormSubmission[];
  activeVisualizerModes: VisualizerModeEntry[];
  isVisualizerEnabled: (modeId: string) => boolean;
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  updateGlobalSettings: (settings: Partial<CMSGlobalSettings>) => Promise<boolean>;
  updateApiKeys: (keys: { geminiApiKey?: string; sunoApiKey?: string; customWebhookUrl?: string; geminiModel?: string }) => Promise<boolean>;
  testApiKey: (provider: 'gemini' | 'suno', testKey?: string) => Promise<{ success: boolean; message: string; latencyMs: number }>;
  toggleVisualizer: (modeId: string, enabled: boolean) => Promise<boolean>;
  savePreset: (preset: VisualizerPresetProfile) => Promise<boolean>;
  deletePreset: (id: string) => Promise<boolean>;
  importPresets: (presets: VisualizerPresetProfile[]) => Promise<boolean>;
  savePage: (page: Partial<CMSPageItem>) => Promise<boolean>;
  deletePage: (id: string) => Promise<boolean>;
  saveMediaAsset: (media: Partial<CMSMediaItem>) => Promise<boolean>;
  deleteMediaAsset: (id: string) => Promise<boolean>;
  updateSeoAnalytics: (seo: Partial<CMSSeoAnalytics>) => Promise<boolean>;
  updateInboxMessageStatus: (id: string, status?: string, priority?: string) => Promise<boolean>;
  deleteInboxMessage: (id: string) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CMSFullConfig>(() => {
    // Initial local cache recovery if present
    try {
      const cached = localStorage.getItem('vidframer_cms_client_config');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (_) {}
    return DEFAULT_CONFIG;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full configuration from backend
  const refreshConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data: CMSFullConfig = await res.json();
        setConfig(data);
        localStorage.setItem('vidframer_cms_client_config', JSON.stringify(data));
        setError(null);
      }
    } catch (err: any) {
      console.warn("Failed to fetch CMS config from backend, using current/cached:", err);
      setError(err?.message || "Sunucuya ulaşılamadı.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  // Apply Live Dynamic DOM side-effects (Document Title, Meta, Theme Variables)
  useEffect(() => {
    if (!config || !config.globalSettings) return;

    // 1. Update Tab Title
    if (config.globalSettings.tabTitle) {
      document.title = config.globalSettings.tabTitle;
    } else if (config.globalSettings.appName) {
      document.title = `${config.globalSettings.appName} | 60 FPS Audio Visualizer`;
    }

    // 2. Update Meta Description
    if (config.globalSettings.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', config.globalSettings.metaDescription);
    }

    // 3. Inject / Update Dynamic CSS Theme Variables
    if (config.globalSettings.theme) {
      const { accentColor, primaryColor, secondaryColor, bgDark } = config.globalSettings.theme;
      const root = document.documentElement;
      
      if (accentColor) {
        root.style.setProperty('--color-accent', accentColor);
      }
      if (primaryColor) {
        root.style.setProperty('--color-primary-custom', primaryColor);
      }
      if (secondaryColor) {
        root.style.setProperty('--color-secondary-custom', secondaryColor);
      }
      if (bgDark) {
        root.style.setProperty('--color-app-bg', bgDark);
      }
    }
  }, [config]);

  // Helper: check if a visualizer mode is enabled
  const isVisualizerEnabled = useCallback((modeId: string): boolean => {
    const disabledList = config.visualizerConfig?.disabledVisualizers || [];
    return !disabledList.includes(modeId);
  }, [config.visualizerConfig]);

  // Filtered active visualizer modes
  const activeVisualizerModes = React.useMemo(() => {
    const disabledSet = new Set(config.visualizerConfig?.disabledVisualizers || []);
    const labels = config.visualizerConfig?.customLabels || {};

    return VISUALIZER_MODES.filter(m => !disabledSet.has(m.id)).map(m => {
      if (labels[m.id]) {
        return { ...m, label: labels[m.id] };
      }
      return m;
    });
  }, [config.visualizerConfig]);

  // 1. Update Global Settings
  const updateGlobalSettings = async (settings: Partial<CMSGlobalSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          globalSettings: data.settings,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating global settings:", err);
      return false;
    }
  };

  // 2. Update API Keys
  const updateApiKeys = async (keys: {
    geminiApiKey?: string;
    sunoApiKey?: string;
    customWebhookUrl?: string;
    geminiModel?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          apiKeys: data.apiKeys,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating API keys:", err);
      return false;
    }
  };

  // 3. Test API Key
  const testApiKey = async (
    provider: 'gemini' | 'suno',
    testKey?: string
  ): Promise<{ success: boolean; message: string; latencyMs: number }> => {
    try {
      const res = await fetch('/api/admin/config/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, testKey })
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Bağlantı testi sırasında ağ hatası oluştu.",
        latencyMs: 0
      };
    }
  };

  // 4. Toggle Visualizer
  const toggleVisualizer = async (modeId: string, enabled: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/visualizers/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeId, enabled })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          visualizerConfig: data.visualizerConfig,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error toggling visualizer:", err);
      return false;
    }
  };

  // 5. Preset Operations
  const savePreset = async (preset: VisualizerPresetProfile): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          customPresets: data.presets,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error saving preset:", err);
      return false;
    }
  };

  const deletePreset = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/config/presets/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          customPresets: data.presets,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting preset:", err);
      return false;
    }
  };

  const importPresets = async (presets: VisualizerPresetProfile[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/presets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presets })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          customPresets: data.presets,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error importing presets:", err);
      return false;
    }
  };

  // 6. Page Operations
  const savePage = async (page: Partial<CMSPageItem>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          pages: data.pages,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error saving page:", err);
      return false;
    }
  };

  const deletePage = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/config/pages/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          pages: data.pages,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting page:", err);
      return false;
    }
  };

  // 7. Media Asset Operations
  const saveMediaAsset = async (media: Partial<CMSMediaItem>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          mediaAssets: data.mediaAssets,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error saving media asset:", err);
      return false;
    }
  };

  const deleteMediaAsset = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/config/media/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          mediaAssets: data.mediaAssets,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting media asset:", err);
      return false;
    }
  };

  // 8. SEO & Analytics
  const updateSeoAnalytics = async (seo: Partial<CMSSeoAnalytics>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seoAnalytics: seo })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          seoAnalytics: data.seoAnalytics,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating SEO analytics:", err);
      return false;
    }
  };

  // 9. Inbox Operations
  const updateInboxMessageStatus = async (id: string, status?: string, priority?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/config/inbox/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          inboxMessages: data.inboxMessages,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating inbox message:", err);
      return false;
    }
  };

  const deleteInboxMessage = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/config/inbox/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(prev => ({
          ...prev,
          inboxMessages: data.inboxMessages,
          updatedAt: Date.now()
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting inbox message:", err);
      return false;
    }
  };

  // 10. Reset to Defaults
  const resetToDefaults = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/config/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error resetting defaults:", err);
      return false;
    }
  };

  return (
    <CMSContext.Provider
      value={{
        config,
        globalSettings: config.globalSettings,
        apiKeys: config.apiKeys,
        visualizerConfig: config.visualizerConfig,
        customPresets: config.customPresets,
        pages: config.pages || [],
        mediaAssets: config.mediaAssets || [],
        seoAnalytics: config.seoAnalytics,
        inboxMessages: config.inboxMessages || [],
        activeVisualizerModes,
        isVisualizerEnabled,
        isLoading,
        error,
        refreshConfig,
        updateGlobalSettings,
        updateApiKeys,
        testApiKey,
        toggleVisualizer,
        savePreset,
        deletePreset,
        importPresets,
        savePage,
        deletePage,
        saveMediaAsset,
        deleteMediaAsset,
        updateSeoAnalytics,
        updateInboxMessageStatus,
        deleteInboxMessage,
        resetToDefaults
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = (): CMSContextType => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
