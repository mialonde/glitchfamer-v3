import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, Video, Smartphone, Sliders, Type, Layers, Bookmark 
} from "lucide-react";
import { VisualizerCanvas, VisualizerHandle } from "./components/VisualizerCanvas";
import { EffectsStudio } from "./components/EffectsStudio";
import { LyricsStudio } from "./components/LyricsStudio";
import { SocialMediaStudio } from "./components/SocialMediaStudio";
import { PresetManager } from "./components/PresetManager";
import { SunoImporter } from "./components/SunoImporter";
import { TemplatePickerModal } from "./components/TemplatePickerModal";
import { ReleasePackStudioModal } from "./components/ReleasePackStudioModal";
import { PostRenderFeedbackModal } from "./components/PostRenderFeedbackModal";
import { QuickStartLayer } from "./components/QuickStartLayer";
import { AdminDashboard } from "./components/AdminDashboard";

// Modular Sub-Components
import { StudioTopBar } from "./components/StudioTopBar";
import { StudioTransportBar } from "./components/StudioTransportBar";
import { VisualizerTab } from "./components/VisualizerTab";
import { MediaTab } from "./components/MediaTab";
import { ExportTab } from "./components/ExportTab";

import { VisualizerSettings, NormalizedSunoTrack, StudioTabConfig, MusicGenreTemplate } from "./types";
import { INITIAL_TABS } from "./lib/adminData";
import { getMeseleDemoSyncedLyrics } from "./services/lyricSyncService";
import { audioEngine } from "./core/AudioEngine";
import { cn } from "./lib/utils";

type StudioTab = 'visualizer' | 'social' | 'effects' | 'lyrics' | 'media' | 'presets' | 'export';
type UILayer = 'QUICK_START' | 'STUDIO' | 'ADMIN';

export default function App() {
  const [uiLayer, setUiLayer] = useState<UILayer>('QUICK_START');
  const [activeTab, setActiveTab] = useState<StudioTab>('visualizer');
  const [studioTabs, setStudioTabs] = useState<StudioTabConfig[]>(INITIAL_TABS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Medya ve Zaman
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  // Render Motoru (Varsayılan: 'server' - Sunucu Tarafı FFmpeg 60FPS)
  const [renderEngine, setRenderEngine] = useState<'server' | 'client'>('server');
  const [isServerRendering, setIsServerRendering] = useState(false);
  const [isConvertingMp4, setIsConvertingMp4] = useState(false);
  const [serverProgress, setServerProgress] = useState(0);
  const [serverStage, setServerStage] = useState('Render kuyruğa alınıyor...');
  const [serverJobId, setServerJobId] = useState<string | null>(null);
  const [serverOwnerToken, setServerOwnerToken] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverVideoUrl, setServerVideoUrl] = useState<string | null>(null);
  const [serverQuality, setServerQuality] = useState<'1080p' | '720p'>('1080p');

  // Modallar
  const [isSunoModalOpen, setIsSunoModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isReleasePackModalOpen, setIsReleasePackModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Ham Dosya Referansları
  const [audioFileBlob, setAudioFileBlob] = useState<Blob | File | null>(null);
  const [coverFileBlob, setCoverFileBlob] = useState<Blob | File | null>(null);
  const [logoFileBlob, setLogoFileBlob] = useState<Blob | File | null>(null);
  const [bgImageFileBlob, setBgImageFileBlob] = useState<Blob | File | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasHandleRef = useRef<VisualizerHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vocalAnalyserRef = useRef<AnalyserNode | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Görsel Ayarlar
  const [settings, _setSettings] = useState<VisualizerSettings>({
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
    trackTitle: '',
    artistName: '',
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
  });

  // Undo / Redo History Stacks
  const pastSettings = useRef<VisualizerSettings[]>([]);
  const futureSettings = useRef<VisualizerSettings[]>([]);
  const lastHistoryPushTime = useRef<number>(0);

  // setSettings custom wrapper interceptor for automatic Undo/Redo
  const setSettings = useCallback((
    newSettingsOrFunc: VisualizerSettings | Partial<VisualizerSettings> | ((prev: VisualizerSettings) => VisualizerSettings)
  ) => {
    _setSettings((prev) => {
      let next: VisualizerSettings;
      if (typeof newSettingsOrFunc === 'function') {
        next = newSettingsOrFunc(prev);
      } else {
        next = { ...prev, ...newSettingsOrFunc } as VisualizerSettings;
      }

      // Check if we should push old state to history
      const now = Date.now();
      const timeDiff = now - lastHistoryPushTime.current;

      let isDiscrete = false;
      if (prev.mode !== next.mode ||
          prev.aspectRatio !== next.aspectRatio ||
          prev.avatarMode !== next.avatarMode ||
          prev.bgMode !== next.bgMode ||
          prev.rgbSplitEnabled !== next.rgbSplitEnabled ||
          prev.scanLinesEnabled !== next.scanLinesEnabled ||
          prev.vignetteEnabled !== next.vignetteEnabled ||
          prev.bloomEnabled !== next.bloomEnabled ||
          prev.filmGrainEnabled !== next.filmGrainEnabled ||
          prev.strobeEnabled !== next.strobeEnabled ||
          prev.cameraShakeEnabled !== next.cameraShakeEnabled ||
          prev.lensDistortEnabled !== next.lensDistortEnabled ||
          prev.motionTrailEnabled !== next.motionTrailEnabled ||
          prev.glitchSliceEnabled !== next.glitchSliceEnabled ||
          prev.edgeGlowEnabled !== next.edgeGlowEnabled ||
          prev.lyricsEnabled !== next.lyricsEnabled ||
          prev.lyricsStyle !== next.lyricsStyle ||
          prev.lyricsPosition !== next.lyricsPosition ||
          prev.lowPerformanceMode !== next.lowPerformanceMode
      ) {
        isDiscrete = true;
      }

      if (isDiscrete || timeDiff > 1000) {
        pastSettings.current.push(prev);
        if (pastSettings.current.length > 50) {
          pastSettings.current.shift();
        }
        futureSettings.current = [];
        lastHistoryPushTime.current = now;
      }

      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (pastSettings.current.length === 0) return;
    const prev = pastSettings.current.pop();
    if (prev) {
      _setSettings((current) => {
        futureSettings.current.push(current);
        return prev;
      });
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (futureSettings.current.length === 0) return;
    const next = futureSettings.current.pop();
    if (next) {
      _setSettings((current) => {
        pastSettings.current.push(current);
        return next;
      });
    }
  }, []);

  // Project Import / Export JSON
  const exportProjectJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      version: "2.0",
      settings,
      savedAt: Date.now()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${settings.trackTitle || 'vidframer'}_project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.settings) {
            setSettings(parsed.settings);
          } else {
            alert("Geçersiz proje dosyası yapısı.");
          }
        } catch (_) {
          alert("Dosya okunamadı veya geçersiz JSON formatı.");
        }
      };
    }
  };

  // Auto-Save and Restore Previous Session
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("vidframer_project_autosave");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.settings) {
          setSavedSessionData(parsed);
          setHasSavedSession(true);
        }
      } catch (_) {}
    }
  }, []);

  // Sync CMS modules, tabs and theme from localStorage
  useEffect(() => {
    try {
      const savedModules = localStorage.getItem('vidframer_cms_modules');
      if (savedModules) {
        const parsed = JSON.parse(savedModules);
        if (parsed.tabs && Array.isArray(parsed.tabs)) {
          setStudioTabs(parsed.tabs);
        }
        if (parsed.theme?.accent) {
          document.documentElement.style.setProperty('--accent', parsed.theme.accent);
          document.documentElement.style.setProperty('--accent-hover', parsed.theme.accentHover || parsed.theme.accent);
        }
      }
    } catch (e) {
      console.warn('CMS modules sync error:', e);
    }
  }, [uiLayer]);

  const restoreSession = () => {
    if (savedSessionData && savedSessionData.settings) {
      _setSettings(savedSessionData.settings);
    }
    setHasSavedSession(false);
  };

  const dismissSession = () => {
    localStorage.removeItem("vidframer_project_autosave");
    setHasSavedSession(false);
  };

  useEffect(() => {
    if (!settings) return;
    const projectData = {
      settings,
      savedAt: Date.now()
    };
    localStorage.setItem("vidframer_project_autosave", JSON.stringify(projectData));
  }, [settings]);

  // Prevent accidental unload/refresh during recording or rendering
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording || isServerRendering) {
        e.preventDefault();
        e.returnValue = "Render veya kayıt işlemi devam ediyor. Ayrılmak istediğinizden emin misiniz?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRecording, isServerRendering]);

  // Zaman Formatlayıcı
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 1. AudioEngine State Senkronizasyonu & Tek Gerçek Kaynağı
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((engineState) => {
      setIsPlaying(engineState.isPlaying);
      setCurrentTime(engineState.currentTime);
      setDuration(engineState.duration);
      setIsMuted(engineState.isMuted);
      setAudioTrack(audioEngine.getAudioStreamTrack());
      analyserRef.current = audioEngine.getMainAnalyser();
      vocalAnalyserRef.current = audioEngine.getVocalAnalyser();
    });
    return () => unsubscribe();
  }, []);

  // 2. Web Audio Context & MediaSource Bağlantısı (AudioEngine Tek Merkez)
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioEngine.attachAudioElement(audioRef.current);
      analyserRef.current = audioEngine.getMainAnalyser();
      vocalAnalyserRef.current = audioEngine.getVocalAnalyser();
      setAudioTrack(audioEngine.getAudioStreamTrack());
    }
  }, [audioUrl]);

  // 3. Audio Trim & Snippet Range Sync with AudioEngine
  useEffect(() => {
    const enabled = settings.trimEnabled ?? false;
    const start = settings.trimStart ?? 0;
    const end = settings.trimEnd ?? (duration > 0 ? duration : 30);
    const loop = settings.trimLoop ?? true;
    audioEngine.setTrimRange(enabled, start, end, loop);
  }, [settings.trimEnabled, settings.trimStart, settings.trimEnd, settings.trimLoop, duration]);

  const seekRelative = (seconds: number) => {
    audioEngine.seekRelative(seconds);
  };

  const togglePlay = () => {
    audioEngine.togglePlay();
  };

  // Klavye Kısayolları (Space: Play/Pause, ←: -5s, →: +5s, 1-6: Sekmeler, Ctrl+Z/Y: Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(5);
      } else if (e.code === 'Digit1') {
        setActiveTab('visualizer');
      } else if (e.code === 'Digit2') {
        setActiveTab('effects');
      } else if (e.code === 'Digit3') {
        setActiveTab('lyrics');
      } else if (e.code === 'Digit4') {
        setActiveTab('media');
      } else if (e.code === 'Digit5') {
        setActiveTab('presets');
      } else if (e.code === 'Digit6') {
        setActiveTab('export');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, audioUrl, duration, handleUndo, handleRedo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'AUDIO' | 'COVER' | 'LOGO' | 'BG_IMAGE' | 'VIDEO' | 'VRM') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'AUDIO') {
      if (audioUrl && audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setAudioFileBlob(file);
      setAudioFileName(file.name);
      setVideoResultUrl(null);
      setServerVideoUrl(null);
      const rawName = file.name.replace(/\.[^/.]+$/, "");
      setSettings(s => ({ ...s, trackTitle: s.trackTitle || rawName }));
    }
    if (type === 'COVER') {
      if (coverUrl && coverUrl.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
      setCoverUrl(url);
      setCoverFileBlob(file);
    }
    if (type === 'LOGO') {
      if (logoUrl && logoUrl.startsWith('blob:')) URL.revokeObjectURL(logoUrl);
      setLogoUrl(url);
      setLogoFileBlob(file);
    }
    if (type === 'BG_IMAGE') {
      if (bgImageUrl && bgImageUrl.startsWith('blob:')) URL.revokeObjectURL(bgImageUrl);
      setBgImageUrl(url);
      setBgImageFileBlob(file);
      setSettings(s => ({ ...s, bgImageUrl: url }));
    }
    if (type === 'VIDEO') {
      if (bgVideoUrl && bgVideoUrl.startsWith('blob:')) URL.revokeObjectURL(bgVideoUrl);
      setBgVideoUrl(url);
      setSettings(s => ({ ...s, bgVideoUrl: url }));
    }
    if (type === 'VRM') {
      if (settings.vrmModelUrl && settings.vrmModelUrl.startsWith('blob:')) {
        URL.revokeObjectURL(settings.vrmModelUrl);
      }
      setSettings(s => ({ 
        ...s, 
        mode: 'VRM_ANIME_HYBRID',
        vrmModelUrl: url, 
        vrmModelName: file.name 
      }));
    }
    e.target.value = '';
  };

  // Otomatik Demo Dosyası Blob Ön Yükleme (Render & Dışa Aktarma Desteği)
  useEffect(() => {
    fetch('/demo-items/MESELE.flac')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => setAudioFileBlob(blob))
      .catch(err => console.warn("Demo audio blob ön yükleme uyarısı:", err));
  }, []);

  // Demo / Örnek Müzik Yükleyici (Mesele Demo Parçası & LRC)
  const loadDemoTrack = () => {
    const demoAudioUrl = '/demo-items/MESELE.flac';
    setAudioUrl(demoAudioUrl);
    setAudioFileName('MESELE.flac');
    setSettings(s => ({
      ...s,
      trackTitle: 'Mesele',
      artistName: 'Demo',
      lyricsEnabled: true,
      syncedLyrics: getMeseleDemoSyncedLyrics()
    }));
    fetch(demoAudioUrl)
      .then(res => res.blob())
      .then(blob => setAudioFileBlob(blob))
      .catch(err => console.warn("Demo audio blob yükleme hatası:", err));
  };

  // Suno Linkinden Gelen Şarkıyı Projeye Aktar
  const handleSunoImport = (track: NormalizedSunoTrack, audioBlob?: Blob | null) => {
    if (audioUrl && audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(track.audioUrl);
    setAudioFileName(track.title);
    if (audioBlob) {
      setAudioFileBlob(audioBlob);
    } else {
      fetch(track.audioUrl)
        .then(res => res.blob())
        .then(b => setAudioFileBlob(b))
        .catch(err => console.warn("Suno audio blob arka plan indirme uyarısı:", err));
    }
    setVideoResultUrl(null);
    setServerVideoUrl(null);

    if (track.imageUrl) {
      if (coverUrl && coverUrl.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
      setCoverUrl(track.imageUrl);
    }

    setSettings(s => ({
      ...s,
      trackTitle: track.title,
      artistName: track.artist,
      lyricsEnabled: true,
      rawLyrics: track.lyrics || s.rawLyrics,
      syncedLyrics: track.syncedLines && track.syncedLines.length > 0 ? track.syncedLines : s.syncedLyrics
    }));

    setCurrentTime(0);
    setIsSunoModalOpen(false);
  };

  // Şablon Seçildiğinde Stüdyoya Uygula
  const handleApplyTemplate = (tpl: MusicGenreTemplate) => {
    setSettings((prev) => ({
      ...prev,
      ...tpl.settings,
      primaryColor: tpl.settings.primaryColor || tpl.previewColors[0] || prev.primaryColor,
      secondaryColor: tpl.settings.secondaryColor || tpl.previewColors[1] || prev.secondaryColor,
    }));
  };

  const removeAudio = () => {
    audioEngine.unloadTrack();
    analyserRef.current = null;
    vocalAnalyserRef.current = null;
    setAudioTrack(null);
    setAudioUrl(null);
    setAudioFileName(null);
    setAudioFileBlob(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const removeCover = () => {
    if (coverUrl && coverUrl.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
    setCoverUrl(null);
    setCoverFileBlob(null);
  };

  const removeLogo = () => {
    if (logoUrl && logoUrl.startsWith('blob:')) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setLogoFileBlob(null);
  };

  const removeBackgroundImage = () => {
    if (bgImageUrl && bgImageUrl.startsWith('blob:')) URL.revokeObjectURL(bgImageUrl);
    setBgImageUrl(null);
    setBgImageFileBlob(null);
    setSettings(s => ({ ...s, bgImageUrl: null }));
  };

  const selectCuratedWallpaper = (url: string) => {
    setBgImageUrl(url);
    setBgImageFileBlob(null);
    setSettings(s => ({ ...s, bgImageUrl: url }));
  };

  const removeBackgroundVideo = () => {
    if (bgVideoUrl && bgVideoUrl.startsWith('blob:')) URL.revokeObjectURL(bgVideoUrl);
    setBgVideoUrl(null);
    setSettings(s => ({ ...s, bgVideoUrl: null }));
  };

  const selectEuphoricVideo = (url: string) => {
    setBgVideoUrl(url);
    setSettings(s => ({ ...s, bgVideoUrl: url }));
  };

  // İstemci Tarafı Render
  const startClientRender = () => {
    if (!audioUrl || !canvasHandleRef.current) return;
    setVideoResultUrl(null);
    audioEngine.seek(0);
    const recDuration = duration > 0 ? duration : 30;
    canvasHandleRef.current.startRecording(recDuration);
    audioEngine.play().catch(e => console.warn(e));
  };

  const convertWebMtoMp4 = async () => {
    if (!videoResultUrl) return;
    try {
      setIsConvertingMp4(true);
      const res = await fetch(videoResultUrl);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append("video", blob, "video.webm");
      formData.append("aspectRatio", settings.aspectRatio);
      
      const convertRes = await fetch("/api/render/convert-webm-to-mp4", {
        method: "POST",
        body: formData
      });
      
      if (!convertRes.ok) {
        const errorData = await convertRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Dönüştürme sunucu tarafından reddedildi.");
      }
      
      const mp4Blob = await convertRes.blob();
      const mp4Url = URL.createObjectURL(mp4Blob);
      
      const a = document.createElement("a");
      a.href = mp4Url;
      a.download = `${settings.trackTitle || 'vidframer_render'}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (e: any) {
      console.error(e);
      alert("MP4 dönüştürme başarısız oldu: " + e.message);
    } finally {
      setIsConvertingMp4(false);
    }
  };

  // Sunucu Tarafı Render (SSR FFmpeg)
  const startServerRender = async () => {
    if (!audioFileBlob && !audioUrl) {
      alert("Lütfen önce bir ses dosyası yükleyin.");
      return;
    }

    setIsServerRendering(true);
    setServerProgress(0);
    setServerStage("Ses ve görsel varlıklar sunucuya aktarılıyor...");
    setServerError(null);
    setServerVideoUrl(null);

    try {
      let finalAudioBlob = audioFileBlob;
      if (!finalAudioBlob && audioUrl) {
        setServerStage("Ses dosyası hazırlanıyor...");
        try {
          const response = await fetch(audioUrl);
          if (response.ok) {
            finalAudioBlob = await response.blob();
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (fetchErr) {
          if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
            try {
              const proxyRes = await fetch(`/api/suno/proxy-audio?url=${encodeURIComponent(audioUrl)}`);
              if (proxyRes.ok) {
                finalAudioBlob = await proxyRes.blob();
              }
            } catch (proxyErr) {
              console.warn("Audio proxy fetch hatası:", proxyErr);
            }
          }
        }
      }

      let finalCoverBlob = coverFileBlob;
      if (!finalCoverBlob && coverUrl) {
        try {
          const cRes = await fetch(coverUrl);
          if (cRes.ok) finalCoverBlob = await cRes.blob();
        } catch (_) {}
      }

      let finalLogoBlob = logoFileBlob;
      if (!finalLogoBlob && logoUrl) {
        try {
          const lRes = await fetch(logoUrl);
          if (lRes.ok) finalLogoBlob = await lRes.blob();
        } catch (_) {}
      }

      let finalBgImageBlob = bgImageFileBlob;
      if (!finalBgImageBlob && bgImageUrl) {
        try {
          const bRes = await fetch(bgImageUrl);
          if (bRes.ok) finalBgImageBlob = await bRes.blob();
        } catch (_) {}
      }

      if (finalAudioBlob && finalAudioBlob.size > 0) {
        setServerStage("Varlıklar sunucuya aktarılıyor ve render kuyruğu hazırlanıyor...");
        const formData = new FormData();
        formData.append("audio", finalAudioBlob, "audio.bin");
        if (finalCoverBlob) formData.append("cover", finalCoverBlob, "cover.bin");
        if (finalLogoBlob) formData.append("logo", finalLogoBlob, "logo.bin");
        if (finalBgImageBlob) formData.append("bgImage", finalBgImageBlob, "bgimage.bin");
        formData.append("settings", JSON.stringify(settings));
        if (duration > 0) formData.append("duration", duration.toString());
        formData.append("fps", "60");
        formData.append("quality", serverQuality);

        const uploadRes = await fetch("/api/render/upload-and-start", {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || `Sunucu render başlatılamadı (${uploadRes.status})`);
        }

        const data = await uploadRes.json();
        setServerJobId(data.jobId);
        setServerOwnerToken(data.ownerToken || null);
        pollServerRender(data.jobId, data.ownerToken);
        return;
      }

      if (audioUrl) {
        setServerStage("Uzak ses dosyası sunucu tarafından işleniyor...");
        const startRes = await fetch("/api/render/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioRemoteUrl: audioUrl,
            settings,
            duration: duration > 0 ? duration : undefined,
            fps: 60,
            quality: serverQuality
          })
        });
        if (!startRes.ok) {
          const errData = await startRes.json().catch(() => ({}));
          throw new Error(errData.error || `Sunucu render başlatılamadı (${startRes.status})`);
        }
        const data = await startRes.json();
        setServerJobId(data.jobId);
        setServerOwnerToken(data.ownerToken || null);
        pollServerRender(data.jobId, data.ownerToken);
        return;
      }

      throw new Error("Ses dosyası bulunamadı. Lütfen bir ses dosyası yükleyin veya Suno parçasını yeniden seçin.");
    } catch (err: any) {
      console.error("Sunucu render başlatma hatası:", err);
      setIsServerRendering(false);
      setServerError(err.message || "Render başlatılamadı.");
    }
  };

  const pollServerRender = (jobId: string, token?: string | null) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers["x-render-token"] = token;
        }
        const progRes = await fetch(`/api/render/progress/${jobId}${token ? `?token=${encodeURIComponent(token)}` : ''}`, {
          headers
        });
        if (!progRes.ok) return;

        const progData = await progRes.json();
        setServerProgress(progData.progress || 0);
        setServerStage(progData.stage || "İşleniyor...");

        if (progData.status === "completed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsServerRendering(false);
          const downloadUrl = token 
            ? `/api/render/download/${jobId}?token=${encodeURIComponent(token)}`
            : `/api/render/download/${jobId}`;
          setServerVideoUrl(progData.videoUrl || downloadUrl);
        } else if (progData.status === "failed" || progData.status === "cancelled") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsServerRendering(false);
          setServerError(progData.error || "Render işlemi tamamlanamadı.");
        }
      } catch (e) {
        console.warn("Poll error:", e);
      }
    }, 700);
  };

  const cancelServerRender = async () => {
    if (!serverJobId) return;
    try {
      const headers: Record<string, string> = {};
      if (serverOwnerToken) {
        headers["x-render-token"] = serverOwnerToken;
      }
      await fetch(`/api/render/cancel/${serverJobId}${serverOwnerToken ? `?token=${encodeURIComponent(serverOwnerToken)}` : ''}`, { 
        method: "POST",
        headers
      });
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsServerRendering(false);
      setServerStage("İşlem iptal edildi.");
    } catch (_) {}
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const visualizerCanvasNode = (
    <VisualizerCanvas
      ref={canvasHandleRef}
      audioRef={audioRef}
      analyserRef={analyserRef}
      vocalAnalyserRef={vocalAnalyserRef}
      audioTrack={audioTrack}
      settings={settings}
      isPlaying={isPlaying}
      isRecording={isRecording}
      coverUrl={coverUrl}
      logoUrl={logoUrl}
      bgVideoUrl={bgVideoUrl}
      bgImageUrl={bgImageUrl}
      currentTime={currentTime}
      duration={duration}
      onTogglePlay={togglePlay}
      onSeekRelative={seekRelative}
      onSeekTo={(t) => {
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrentTime(t);
      }}
      onRecordingStatusChange={(rec) => setIsRecording(rec)}
      onRecordingComplete={(url) => {
        setVideoResultUrl(url);
        setIsRecording(false);
      }}
      onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
    />
  );

  if (uiLayer === 'ADMIN') return <AdminDashboard onClose={() => setUiLayer('STUDIO')} />;

  if (uiLayer === 'QUICK_START') {
    return (
      <main className="h-screen w-screen bg-app text-content-primary flex flex-col overflow-hidden font-sans selection:bg-accent-muted selection:text-accent">
        {hasSavedSession && savedSessionData && (
          <div className="bg-panel border-b border-accent/30 py-2.5 px-4 text-xs flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-50 shadow-elevation-2">
            <div className="flex items-center gap-2 text-content-secondary">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
              <span>Önceki seansınız bulundu. Devam etmek ister misiniz?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={restoreSession}
                className="bg-accent hover:bg-accent-hover text-accent-foreground px-3 py-1 font-medium rounded-sm transition-colors cursor-pointer"
              >
                Oturumu Kurtar
              </button>
              <button 
                onClick={dismissSession}
                className="text-content-tertiary hover:text-content-primary px-2 py-1 transition-colors cursor-pointer"
              >
                Yoksay
              </button>
            </div>
          </div>
        )}
        
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" onEnded={() => setIsPlaying(false)} />
        )}
        
        <QuickStartLayer 
          settings={settings}
          onUpdateSettings={(s) => setSettings(prev => ({...prev, ...s}))}
          audioUrl={audioUrl}
          onAudioSelect={(url) => {
            setAudioUrl(url);
            setAudioFileName('Audio Track');
          }}
          coverUrl={coverUrl}
          onCoverSelect={setCoverUrl}
          isServerRendering={isServerRendering}
          serverProgress={serverProgress}
          serverStage={serverStage}
          serverVideoUrl={serverVideoUrl}
          serverError={serverError}
          onRenderClick={startServerRender}
          onAdvancedClick={() => setUiLayer('STUDIO')}
          onAdminClick={() => setUiLayer('ADMIN')}
          canvasNode={visualizerCanvasNode}
        />
      </main>
    );
  }

  return (
    <main className="h-screen w-screen bg-app text-content-primary flex flex-col overflow-hidden font-sans selection:bg-accent-muted selection:text-accent">
      
      {/* Oturum Kurtarma Bildirimi */}
      {hasSavedSession && savedSessionData && (
        <div className="bg-panel border-b border-accent py-2.5 px-4 text-xs font-sans flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300 relative z-50 shadow-lg">
          <div className="flex items-center gap-2 text-content-secondary">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span>Sistemde kaydedilmemiş önceki seansınız bulundu ({new Date(savedSessionData.savedAt).toLocaleTimeString()}). Kaldığınız yerden devam etmek ister misiniz?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={restoreSession}
              className="bg-accent hover:bg-white text-black px-3 py-1 font-bold text-[10px] uppercase rounded-sm cursor-pointer transition-colors"
            >
              Oturumu Kurtar
            </button>
            <button 
              onClick={dismissSession}
              className="text-content-tertiary hover:text-content-primary px-2 py-1 text-[10px] uppercase cursor-pointer transition-colors"
            >
              Yoksay
            </button>
          </div>
        </div>
      )}
      
      {/* Gizli Audio Elemanı */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          crossOrigin="anonymous" 
          onEnded={() => setIsPlaying(false)} 
        />
      )}
      
      {/* 👑 1. ULTRA-MINIMAL TOP BAR */}
      <StudioTopBar
        audioUrl={audioUrl}
        settings={settings}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
        serverVideoUrl={serverVideoUrl}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenReleasePack={() => setIsReleasePackModalOpen(true)}
        onOpenAdmin={() => setUiLayer('ADMIN')}
        onOpenSuno={() => setIsSunoModalOpen(true)}
        onLoadDemo={loadDemoTrack}
      />

      {/* 🎛️ 2. ANA STÜDYO ALANI (SPLIT VIEWPORT + TABBED INSPECTOR) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 lg:overflow-hidden">
        
        {/* 🎬 SOL / ORTA: VİSUALİZER SAHNESİ & TRANSPORT BAR */}
        <section className="flex-none h-[50vh] lg:h-auto lg:flex-1 bg-[#060608] flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-white/[0.07] relative min-w-0 shrink-0">
          
          {/* Sahne Üst Kontrolleri: Aspect Ratio, Geri Al, Eco Mod, Proje Yönetimi */}
          <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2.5 mb-2 sm:mb-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* Aspect Ratio Seçimi */}
              <div className="flex items-center gap-1 p-1 bg-panel border border-border-subtle rounded-md">
                {(['16/9', '9/16', '1/1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
                    className={cn(
                      "px-2.5 sm:px-3 py-1 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer",
                      settings.aspectRatio === ratio
                        ? "bg-accent text-black shadow-sm font-black"
                        : "text-content-secondary hover:text-content-primary"
                    )}
                  >
                    {ratio === '16/9' ? '16:9 CINEMA' : ratio === '9/16' ? '9:16 REELS' : '1:1 SQUARE'}
                  </button>
                ))}
              </div>

              {/* Geri Al / Yeniden Yap (Undo/Redo) */}
              <div className="flex items-center gap-1 p-1 bg-panel border border-border-subtle rounded-md">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={pastSettings.current.length === 0}
                  className="px-2 py-1 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-content-secondary hover:text-content-primary disabled:opacity-30"
                  title="Geri Al (Ctrl+Z)"
                >
                  GERİ AL
                </button>
                <div className="w-[1px] h-3 bg-white/[0.08]" />
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={futureSettings.current.length === 0}
                  className="px-2 py-1 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-content-secondary hover:text-content-primary disabled:opacity-30"
                  title="Yeniden Yap (Ctrl+Y)"
                >
                  İLERİ AL
                </button>
              </div>

              {/* Proje .JSON Kaydet / Yükle */}
              <div className="flex items-center gap-1 p-1 bg-panel border border-border-subtle rounded-md">
                <button
                  type="button"
                  onClick={exportProjectJson}
                  className="px-2 py-1 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded text-accent hover:text-content-primary cursor-pointer transition-colors"
                  title="Projeyi .JSON dosyası olarak bilgisayarınıza indirin"
                >
                  PROJEYİ KAYDET
                </button>
                <div className="w-[1px] h-3 bg-white/[0.08]" />
                <label 
                  className="px-2 py-1 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded text-content-secondary hover:text-content-primary cursor-pointer transition-colors"
                  title="Kayıtlı bir .JSON projesini açın"
                >
                  <input type="file" accept=".json" onChange={importProjectJson} className="hidden" />
                  PROJE AÇ
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Eco Mod / Low Performance Mode Toggle */}
              <button
                type="button"
                onClick={() => setSettings({ ...settings, lowPerformanceMode: !settings.lowPerformanceMode })}
                className={cn(
                  "px-2.5 py-1.5 text-[8.5px] sm:text-[9px] font-sans font-bold uppercase tracking-wider rounded border transition-all cursor-pointer",
                  settings.lowPerformanceMode
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-panel border-border-subtle text-content-secondary hover:text-content-primary"
                )}
                title="Düşük performanslı cihazlar veya pilden tasarruf için partikülleri yarıya indirir, ağır shader efektlerini devre dışı bırakır."
              >
                <span>{settings.lowPerformanceMode ? "🟢 ECO MOD" : "⚪ ECO MOD"}</span>
              </button>

              <span className="text-[8.5px] sm:text-[9px] font-sans text-content-secondary bg-white/[0.03] border border-border-subtle px-2 py-1.5 rounded truncate max-w-[160px]">
                MOD: <b className="text-content-primary">{settings.mode}</b>
              </span>
              <span className="text-[8.5px] sm:text-[9px] font-sans text-content-tertiary bg-white/[0.03] border border-border-subtle px-2 py-1.5 rounded">
                60 FPS
              </span>
            </div>
          </div>

          {/* Dinamik Canvas Viewport Alanı */}
          <div className="flex-1 w-full max-w-4xl flex items-center justify-center min-h-[220px] sm:min-h-[340px] lg:min-h-[400px] max-h-[50vh] sm:max-h-[56vh] relative py-2 min-w-0">
            
            {/* Ambient Arka Plan Işık Difüzyonu */}
            <div 
              className="absolute inset-0 opacity-25 blur-3xl pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle, ${settings.primaryColor}22 0%, transparent 70%)`
              }}
            />

            {/* Canvas Kutusu */}
            <div 
              className={cn(
                "relative bg-[#000000] border border-white/[0.12] rounded-lg shadow-2xl overflow-hidden transition-all duration-200 flex items-center justify-center max-w-full max-h-full",
                settings.aspectRatio === '16/9' ? "w-full aspect-video max-h-full max-w-[880px]" :
                settings.aspectRatio === '9/16' ? "h-full aspect-[9/16] max-h-[460px] max-w-full" :
                "h-full aspect-square max-h-[460px] max-w-full"
              )}
            >
              {!audioUrl && (
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-panel/80 backdrop-blur-md border border-white/[0.1] px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-sans text-content-secondary shadow-xl pointer-events-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span>Canlı Önizleme Modu —</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('media')} 
                    className="text-accent font-bold hover:underline cursor-pointer"
                  >
                    Medya Sekmesini Aç →
                  </button>
                </div>
              )}

              {visualizerCanvasNode}
            </div>
          </div>

          {/* FLOATING STUDIO TRANSPORT SCRUBBER */}
          <StudioTransportBar
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            isMuted={isMuted}
            currentTime={currentTime}
            duration={duration}
            lyricsEnabled={settings.lyricsEnabled !== false}
            formatTime={formatTime}
            onTogglePlay={togglePlay}
            onToggleMute={() => audioEngine.toggleMute()}
            onToggleLyrics={() => setSettings(s => ({ ...s, lyricsEnabled: !s.lyricsEnabled }))}
            onSeek={(val) => audioEngine.seek(val)}
            onSeekRelative={seekRelative}
          />
        </section>

        {/* 🎚️ SAĞ: DOCKED TABBED INSPECTOR WORKSPACE */}
        <aside className="w-full lg:w-[440px] xl:w-[500px] bg-panel flex flex-col border-t lg:border-t-0 lg:border-l border-border-subtle h-full overflow-hidden flex-1 lg:shrink-0 lg:flex-none min-w-0">
          
          {/* TAB BAR HEADER */}
          <div className="border-b border-border-subtle bg-surface px-2 pt-2 flex items-center overflow-x-auto custom-scrollbar flex-shrink-0 gap-1">
            <div className="flex items-center gap-1">
              {studioTabs.filter(t => t.enabled !== false).map((tab) => {
                const iconMap: Record<string, any> = {
                  visualizer: Sliders,
                  social: Smartphone,
                  effects: Sparkles,
                  lyrics: Type,
                  media: Layers,
                  presets: Bookmark,
                  export: Video,
                };
                const Icon = iconMap[tab.id] || Sliders;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as StudioTab)}
                    className={cn(
                      "px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "text-accent border-accent bg-white/[0.03]"
                        : "text-content-secondary border-transparent hover:text-content-primary hover:bg-white/[0.02]"
                    )}
                  >
                    <Icon size={13} className={isActive ? "text-accent" : "text-content-tertiary"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB İÇERİĞİ (KAYDIRILABİLİR ALAN) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            
            {/* TAB 1: VISUALIZER MODES, COLORS & ATMOSPHERE */}
            {activeTab === 'visualizer' && (
              <VisualizerTab
                settings={settings}
                onUpdateSettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                onFileUpload={(e, type) => handleFileUpload(e, type)}
              />
            )}

            {/* TAB 2: SOCIAL MEDIA & TIKTOK FORMAT ENGINE */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <SocialMediaStudio
                  settings={settings}
                  currentTime={currentTime}
                  audioDuration={duration || 120}
                  onUpdateSettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                  onSeek={seekRelative}
                  onSelectWallpaper={selectCuratedWallpaper}
                  onSelectEuphoricVideo={selectEuphoricVideo}
                />
              </div>
            )}

            {/* TAB 3: SHADER FX & MASTERING SUITE */}
            {activeTab === 'effects' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <EffectsStudio 
                  settings={settings} 
                  onChange={(newSettings) => setSettings(s => ({ ...s, ...newSettings }))}
                />
              </div>
            )}

            {/* TAB 4: ADVANCED AI LYRICS STUDIO */}
            {activeTab === 'lyrics' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <LyricsStudio
                  settings={settings}
                  currentTime={currentTime}
                  audioBlob={audioFileBlob}
                  audioUrl={audioUrl}
                  audioDuration={duration}
                  onUpdateSettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                  onSeek={(time) => {
                    if (audioRef.current) audioRef.current.currentTime = time;
                    setCurrentTime(time);
                  }}
                />
              </div>
            )}

            {/* TAB 5: MEDIA ASSETS & METADATA */}
            {activeTab === 'media' && (
              <MediaTab
                settings={settings}
                audioUrl={audioUrl}
                audioFileName={audioFileName}
                coverArtUrl={coverUrl}
                logoUrl={logoUrl}
                bgImageUrl={bgImageUrl}
                bgVideoUrl={bgVideoUrl}
                onUpdateSettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                onFileUpload={handleFileUpload}
                onOpenSunoModal={() => setIsSunoModalOpen(true)}
                onLoadDemoTrack={loadDemoTrack}
                onRemoveAudio={removeAudio}
                onRemoveCoverArt={removeCover}
                onRemoveLogo={removeLogo}
                onRemoveBackgroundImage={removeBackgroundImage}
                onRemoveBackgroundVideo={removeBackgroundVideo}
                onSelectWallpaper={selectCuratedWallpaper}
                onSelectEuphoricVideo={selectEuphoricVideo}
              />
            )}

            {/* TAB 6: PRESET & PROFILE MANAGER */}
            {activeTab === 'presets' && (
              <div className="animate-in fade-in-50 duration-150">
                <PresetManager 
                  currentSettings={settings}
                  onApplySettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                />
              </div>
            )}

            {/* TAB 7: EXPORT & 60 FPS RENDER ENGINE */}
            {activeTab === 'export' && (
              <ExportTab
                settings={settings}
                audioUrl={audioUrl}
                renderEngine={renderEngine}
                serverQuality={serverQuality}
                isServerRendering={isServerRendering}
                serverProgress={serverProgress}
                serverStage={serverStage}
                serverError={serverError}
                serverVideoUrl={serverVideoUrl}
                isRecording={isRecording}
                videoResultUrl={videoResultUrl}
                isConvertingMp4={isConvertingMp4}
                onSetRenderEngine={setRenderEngine}
                onSetServerQuality={setServerQuality}
                onStartServerRender={startServerRender}
                onCancelServerRender={cancelServerRender}
                onClearServerError={() => setServerError(null)}
                onStartClientRender={startClientRender}
                onConvertWebMtoMp4={convertWebMtoMp4}
                onResetServerVideoUrl={() => setServerVideoUrl(null)}
                onResetClientVideoUrl={() => setVideoResultUrl(null)}
              />
            )}

          </div>
        </aside>

      </div>

      {/* Suno AI Link Importer Modalı */}
      <SunoImporter
        isOpen={isSunoModalOpen}
        onClose={() => setIsSunoModalOpen(false)}
        onImportTrack={handleSunoImport}
      />

      {/* Müzik Türü & Mood Şablonları Modalı */}
      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentSettings={settings}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Release Pack Studio (3-in-1 Çoklu Format Export) Modalı */}
      <ReleasePackStudioModal
        isOpen={isReleasePackModalOpen}
        onClose={() => setIsReleasePackModalOpen(false)}
        audioDuration={duration || 120}
        trackTitle={settings.trackTitle || "Vidframer Track"}
        settings={settings}
        onCompletePack={() => {
          setIsFeedbackModalOpen(true);
        }}
      />

      {/* Render Sonrası Geri Bildirim Modalı */}
      <PostRenderFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        visualizer={settings.mode}
        resolution={settings.aspectRatio}
        durationSec={Math.round(duration || 60)}
      />
    </main>
  );
}
