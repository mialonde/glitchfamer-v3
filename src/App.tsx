import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, Play, Pause, Download, Image as ImageIcon,
  Sparkles, Video, Film, Trash2, Zap,
  Sliders, Music, Type, Layers, Check, Search,
  Volume2, VolumeX, RotateCcw, FastForward, Rewind,
  Maximize2, Eye, EyeOff, CheckCircle2, ChevronRight,
  Bookmark, FolderDown, Terminal, User, Box
} from "lucide-react";
import { VisualizerCanvas, VisualizerHandle } from "./components/VisualizerCanvas";
import { EffectsStudio } from "./components/EffectsStudio";
import { LyricsStudio } from "./components/LyricsStudio";
import { PresetManager } from "./components/PresetManager";
import { SunoImporter } from "./components/SunoImporter";
import { VisualizerSettings, VisualizerMode, NormalizedSunoTrack } from "./types";
import { PresetService } from "./services/presetService";
import { getMeseleDemoSyncedLyrics } from "./services/lyricSyncService";
import { audioEngine } from "./core/AudioEngine";
import { cn } from "./lib/utils";

// Yerleşik 3D VRM Karakter Modelleri
const VRM_AVATAR_MODELS = [
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
const EUPHORIC_VIDEO_PRESETS = [
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
const CURATED_WALLPAPERS = [
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

// 34 Visualizer Modları Listesi ve Kategorileri
const VISUALIZER_MODES: { id: VisualizerMode; label: string; cat: '3D' | 'PARTICLE' | 'WAVE' | 'CYBER' | 'MINIMAL'; desc: string }[] = [
  { id: 'NOIR_SINGING_HEAD', label: 'NOIR SINGING HEAD', cat: '3D', desc: '22Noir tarzı siyah krom 3D vokal kafa, dudak senkronu, bas ile parçalanma ve duman efektleri' },
  { id: 'OBJ_FACE_MASK', label: 'OBJ FACE MASK', cat: '3D', desc: 'Gerçek zamanlı yüklü Düşük Poligon (OBJ) Yüz Maskesi, sese duyarlı' },
  { id: 'VRM_ANIME_HYBRID', label: 'VRM ANIME HYBRID', cat: '3D', desc: 'Three.js VRM Anime modeli, GLSL Procedural Shader ile audio-reactive deformasyon (Bass ile dalgalanma, Distortion ile pikselleşme)' },
  { id: 'LIQUID_MERCURY_HUMAN', label: 'LIQUID MERCURY HUMAN', cat: '3D', desc: 'Aynalı zeminde dans eden cıva insan, vokal parlaklığı & Bass şok dalgaları' },
  { id: 'NEON_HYDRO_HUMAN', label: 'NEON HYDRO HUMAN', cat: 'PARTICLE', desc: 'Müzikle ritmik dans eden ışıklı su insan, biyo-neon çekirdek & bas su halkaları' },
  { id: 'PARTICLE_SPHERE_3D', label: '3D PARTICLE SPHERE', cat: '3D', desc: '360° interaktif 3D parçacık küresi, kütleçekim alanı & Treble kıvılcımları' },
  { id: 'FLUID_METABALL', label: 'FLUID & METABALL', cat: 'PARTICLE', desc: 'Reaktif cıva/sıvı metaball simülasyonu, kick damlaları & parmak karıştırma' },
  { id: 'SYNTHWAVE_GRID_3D', label: 'SYNTHWAVE 3D GRID', cat: '3D', desc: 'Sonsuz 3D perspektif ızgara, bass arazi tepeleri & neon güneş' },
  { id: 'KINETIC_TYPO_GLITCH', label: 'KINETIC GLITCH TYPO', cat: 'MINIMAL', desc: 'Frekans genleşmeli kinetik tipografi, vokal neon aura & glitch parçalanma' },
  { id: 'CIRCULAR_AURA_SPECTRUM', label: 'CIRCULAR AURA EQ', cat: 'WAVE', desc: 'Albüm kapağı merkezli dairesel spektrum, nefes alan aura & çift dokunma modları' },
  { id: 'NONE', label: 'NOIR CORE EQ', cat: 'MINIMAL', desc: 'Minimalist brütalist spektrum barları' },
  { id: 'VISSONANCE_RING', label: 'VISSONANCE RING', cat: '3D', desc: '3D dairesel perspektif halkaları & parçacık dalgası' },
  { id: 'VISSONANCE_OCTAGON', label: 'VISSONANCE OCTAGON', cat: '3D', desc: '3D geometrik oktagon telleri & ses çekirdeği' },
  { id: 'VISSONANCE_SPECTRUM', label: 'VISSONANCE SPECTRUM', cat: '3D', desc: 'Perspektif 3D ses arazisi & ızgara manzarası' },
  { id: 'POPCORN_PHYSICS', label: 'POPCORN PHYSICS', cat: 'PARTICLE', desc: 'Hugh Kennedy parçacık patlaması & yerçekimi fiziği' },
  { id: 'VORTEX_NEBULA', label: 'VORTEX NEBULA', cat: 'PARTICLE', desc: 'Çekim gücü parçacık girdabı & konstelasyon' },
  { id: 'QUANTUM_FIELD', label: 'QUANTUM FIELD', cat: 'PARTICLE', desc: 'Parçacık nebulası & atomik titreşim' },
  { id: 'CYBER_MATRIX', label: 'CYBER MATRIX', cat: 'CYBER', desc: 'Dijital veri yağmuru & ses ritim akışı' },
  { id: 'NEON_TUNNEL', label: 'NEON TUNNEL', cat: 'CYBER', desc: '3D siberpunk kozmik tünel perspektifi' },
  { id: 'PHONKWAVE', label: 'PHONK WAVE', cat: 'CYBER', desc: 'Agresif 808 distortion ve neon parıltı' },
  { id: 'SIMULATION', label: 'SIMULATION', cat: 'CYBER', desc: 'Sibernetik göz & CRT tarama çizgileri' },
  { id: 'CODROPS_POLAR', label: 'CODROPS POLAR', cat: 'WAVE', desc: 'Dairesel polar frekans halkası & şok dalgaları' },
  { id: 'CODROPS_WAVE', label: 'CODROPS WAVE', cat: 'WAVE', desc: 'Çok katmanlı osiloskop çizgi grafiği' },
  { id: 'CODROPS_BARS', label: 'CODROPS BARS', cat: 'WAVE', desc: 'Sürekli frekans eğrisi & yüzen tepe noktaları' },
  { id: 'AUDIO_FLUID', label: 'AUDIO FLUID', cat: 'WAVE', desc: 'Çok bantlı sinüzoidal akıcı dalgalar' },
  { id: 'CAVA_SPECTRUM', label: 'CAVA SPECTRUM', cat: 'CYBER', desc: 'Logaritmik konsol/terminal EQ & fizik kapsülleri' },
  { id: 'LISSAJOUS_ORBIT', label: 'LISSAJOUS ORBIT', cat: 'WAVE', desc: 'Çift kanal faz osiloskop yörüngesi' },
  { id: 'MONOLITH', label: 'MONOLITH', cat: 'MINIMAL', desc: 'Ağır brütalist monolit bloklar' },
  { id: 'NOIRGRID', label: 'NOIR GRID', cat: 'MINIMAL', desc: 'Perspektif teknik ızgara çizgileri' },
  { id: 'CHAOS', label: 'CHAOS THEORY', cat: 'CYBER', desc: 'Agresif parametrik geometri' },
  { id: 'ESOTERIC', label: 'ESOTERIC', cat: '3D', desc: 'Okült mistik çemberler & altın oran' },
  { id: 'RADIAL', label: 'RADIAL SPECTRUM', cat: '3D', desc: 'Dairesel enerji halkası ve radyal barlar' },
  { id: 'ETHER', label: 'ETHER WAVE', cat: 'WAVE', desc: 'Akıcı sinüzoidal duman ve sis dalgası' },
  { id: 'GLITCH', label: 'GLITCH DESTRUCTION', cat: 'CYBER', desc: 'Dijital parçalanma ve piksel kayması' },
  { id: 'SPECTRUM', label: 'NEON SPECTRUM', cat: 'WAVE', desc: 'Aydınlık spektrum çubukları' },
  { id: 'KINETIC', label: 'KINETIC TYPO', cat: 'MINIMAL', desc: 'Agresif tipografik bas vuruşları' }
];

// Renk Paletleri
const COLOR_PALETTES = [
  { name: 'NOIR GOLD', p: '#FFD700', s: '#FFFFFF' },
  { name: 'CYBER CYAN', p: '#00F0FF', s: '#FF003C' },
  { name: 'ACID LIME', p: '#39FF14', s: '#E4E3E0' },
  { name: 'CRIMSON RED', p: '#FF003C', s: '#FFD700' },
  { name: 'VAPOR PURPLE', p: '#BD00FF', s: '#00F0FF' },
  { name: 'TITANIUM MONO', p: '#E4E3E0', s: '#71717A' }
];

type StudioTab = 'visualizer' | 'effects' | 'lyrics' | 'media' | 'presets' | 'export';

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('visualizer');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Medya ve Zaman
  const [audioUrl, setAudioUrl] = useState<string | null>('/demo-items/MESELE.flac');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  // Filter & Search
  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [visualizerCategory, setVisualizerCategory] = useState<'ALL' | '3D' | 'PARTICLE' | 'WAVE' | 'CYBER' | 'MINIMAL'>('ALL');

  // Render Motoru (Varsayılan: 'server' - Sunucu Tarafı FFmpeg 60FPS)
  const [renderEngine, setRenderEngine] = useState<'server' | 'client'>('server');
  const [isServerRendering, setIsServerRendering] = useState(false);
  const [serverProgress, setServerProgress] = useState(0);
  const [serverStage, setServerStage] = useState('Render kuyruğa alınıyor...');
  const [serverJobId, setServerJobId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverVideoUrl, setServerVideoUrl] = useState<string | null>(null);
  const [serverQuality, setServerQuality] = useState<'1080p' | '720p'>('1080p');

  // Suno Link Importer Modal Durumu
  const [isSunoModalOpen, setIsSunoModalOpen] = useState(false);

  // Ham Dosya Referansları
  const [audioFileBlob, setAudioFileBlob] = useState<Blob | File | null>(null);
  const [coverFileBlob, setCoverFileBlob] = useState<Blob | File | null>(null);
  const [logoFileBlob, setLogoFileBlob] = useState<Blob | File | null>(null);
  const [bgImageFileBlob, setBgImageFileBlob] = useState<Blob | File | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasHandleRef = useRef<VisualizerHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vocalAnalyserRef = useRef<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Görsel Ayarlar
  const [settings, setSettings] = useState<VisualizerSettings>({
    mode: 'NEON_TUNNEL',
    aspectRatio: '16/9',
    avatarMode: 'anime',
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
    trackTitle: 'Mesele',
    artistName: 'Demo',
    lyricsEnabled: true,
    lyricsStyle: 'KINETIC',
    lyricsPosition: 'BOTTOM',
    lyricsFontSize: 42,
    lyricsColor: '#FFD700',
    syncedLyrics: getMeseleDemoSyncedLyrics(),
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
    visColorShift: 0.2
  });

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

  const seekRelative = (seconds: number) => {
    audioEngine.seekRelative(seconds);
  };

  // Klavye Kısayolları (Space: Play/Pause, ←: -5s, →: +5s, 1-6: Sekmeler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      
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
  }, [isPlaying, audioUrl, duration]);

  const togglePlay = () => {
    audioEngine.togglePlay();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'AUDIO' | 'COVER' | 'LOGO' | 'BG_IMAGE' | 'VIDEO' | 'VRM') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'AUDIO') {
      if (audioUrl && audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setAudioFileBlob(file);
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
    // 1. Audio URL & Blob temizle ve ata
    if (audioUrl && audioUrl.startsWith('blob:')) URL.revokeObjectURL(audioUrl);
    setAudioUrl(track.audioUrl);
    if (audioBlob) {
      setAudioFileBlob(audioBlob);
    } else {
      // Arka planda blob indirmeyi dene (Render engine için)
      fetch(track.audioUrl)
        .then(res => res.blob())
        .then(b => setAudioFileBlob(b))
        .catch(err => console.warn("Suno audio blob arka plan indirme uyarısı:", err));
    }
    setVideoResultUrl(null);
    setServerVideoUrl(null);

    // 2. Kapak görseli ata
    if (track.imageUrl) {
      if (coverUrl && coverUrl.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
      setCoverUrl(track.imageUrl);
    }

    // 3. Ayarları güncelle
    setSettings(s => ({
      ...s,
      trackTitle: track.title,
      artistName: track.artist,
      lyricsEnabled: true,
      syncedLyrics: track.syncedLines && track.syncedLines.length > 0 ? track.syncedLines : s.syncedLyrics
    }));

    // 4. Zamanı başa al
    setCurrentTime(0);
    setIsSunoModalOpen(false);
  };

  const removeAudio = () => {
    audioEngine.unloadTrack();
    analyserRef.current = null;
    vocalAnalyserRef.current = null;
    setAudioContext(null);
    setAudioTrack(null);
    setAudioUrl(null);
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

  // Sunucu Tarafı Render (SSR FFmpeg)
  const startServerRender = async () => {
    if (!audioFileBlob && !audioUrl) {
      alert("Lütfen önce bir ses dosyası yükleyin.");
      return;
    }

    setIsServerRendering(true);
    setServerProgress(0);
    setServerStage("Ses ve görsel varlıklar sunucuya yükleniyor...");
    setServerError(null);
    setServerVideoUrl(null);

    try {
      const formData = new FormData();
      if (audioFileBlob) {
        formData.append("audio", audioFileBlob);
      } else if (audioUrl) {
        const res = await fetch(audioUrl);
        const blob = await res.blob();
        formData.append("audio", blob, "track.mp3");
      }

      if (coverFileBlob) formData.append("cover", coverFileBlob);
      if (logoFileBlob) formData.append("logo", logoFileBlob);
      if (bgImageFileBlob) formData.append("bgImage", bgImageFileBlob);

      formData.append("settings", JSON.stringify(settings));
      formData.append("quality", serverQuality);

      const res = await fetch("/api/render/upload-and-start", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Sunucu hatası (${res.status})`);
      }

      const data = await res.json();
      setServerJobId(data.jobId);
      pollServerRender(data.jobId);
    } catch (err: any) {
      console.error("Sunucu render başlatma hatası:", err);
      setIsServerRendering(false);
      setServerError(err.message || "Render başlatılamadı.");
    }
  };

  const pollServerRender = (jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const progRes = await fetch(`/api/render/progress/${jobId}`);
        if (!progRes.ok) return;

        const progData = await progRes.json();
        setServerProgress(progData.progress || 0);
        setServerStage(progData.stage || "İşleniyor...");

        if (progData.status === "completed") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsServerRendering(false);
          setServerVideoUrl(progData.videoUrl || `/api/render/download/${jobId}`);
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
      await fetch(`/api/render/cancel/${serverJobId}`, { method: "POST" });
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

  const filteredVisualizers = VISUALIZER_MODES.filter(m => {
    const matchCategory = visualizerCategory === 'ALL' || m.cat === visualizerCategory;
    const matchQuery = !visualizerSearch.trim() || 
      m.label.toLowerCase().includes(visualizerSearch.toLowerCase()) || 
      m.desc.toLowerCase().includes(visualizerSearch.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <main className="h-screen w-screen bg-[#070709] text-[#EDEDEE] flex flex-col overflow-hidden font-sans selection:bg-[#FFD700] selection:text-black">
      
      {/* Gizli Audio Elemanı */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          crossOrigin="anonymous" 
          muted={isMuted}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)} 
        />
      )}
      
      {/* ============================================================ */}
      {/* 👑 1. ULTRA-MINIMAL TOP BAR (1 BILLION DOLLAR TIER HEADER) */}
      {/* ============================================================ */}
      <header className="h-14 border-b border-white/[0.07] bg-[#09090D]/90 backdrop-blur-xl px-3 sm:px-5 flex items-center justify-between flex-shrink-0 z-40 gap-2">
        
        {/* Sol: Monolitik Logo & Sürüm */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center text-black font-black text-[10px] shadow-[0_0_12px_rgba(255,215,0,0.4)] shrink-0">
              V
            </div>
            <span className="font-extrabold tracking-[0.25em] text-xs uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              VIDFRAMER
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/[0.08]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase bg-white/[0.04] border border-white/[0.08] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
              STUDIO 2.0
            </span>
            <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
              60 FPS RENDER
            </span>
          </div>
        </div>

        {/* Orta: Aktif Parça Rozeti / Medya Sekmesine Yönlendirme */}
        <div className="flex items-center gap-2 min-w-0">
          {audioUrl ? (
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              title="Medya Sekmesini Aç"
              className="flex items-center gap-2 px-3 py-1 bg-black/60 hover:bg-black/90 border border-white/[0.08] hover:border-[#FFD700]/50 rounded-full text-[10px] font-mono text-zinc-300 max-w-[200px] sm:max-w-xs truncate cursor-pointer transition-all"
            >
              <div className="flex items-end gap-0.5 h-3 px-0.5 shrink-0">
                <span className={cn("w-0.5 bg-[#FFD700] rounded-full transition-all", isPlaying ? "h-full animate-bounce" : "h-1.5")} />
                <span className={cn("w-0.5 bg-[#FFD700] rounded-full transition-all", isPlaying ? "h-2/3 animate-bounce [animation-delay:0.15s]" : "h-2.5")} />
                <span className={cn("w-0.5 bg-[#FFD700] rounded-full transition-all", isPlaying ? "h-4/5 animate-bounce [animation-delay:0.3s]" : "h-1")} />
              </div>
              <span className="truncate font-semibold text-white">
                {settings.trackTitle || "Yüklü Ses Dosyası"}
              </span>
              <span className="text-zinc-500 text-[9px] shrink-0 hidden sm:inline">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#FFD700]/50 rounded-full text-[10px] font-mono text-zinc-300 hover:text-white cursor-pointer transition-colors"
              >
                <Music size={12} className="text-[#FFD700]" />
                <span>MEDYA YÖNETİMİ</span>
              </button>
              <button
                type="button"
                onClick={loadDemoTrack}
                className="hidden md:inline-flex text-[9px] font-mono text-zinc-500 hover:text-[#FFD700] transition-colors cursor-pointer"
              >
                (Örnek Parça)
              </button>
            </div>
          )}
        </div>

        {/* Sağ: Render & Hızlı İndir Butonları */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSunoModalOpen(true)}
            className="bg-[#FFD700]/10 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/40 px-3 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,215,0,0.15)] cursor-pointer"
            title="Suno AI Şarkı Bağlantısı ile İçe Aktar"
          >
            <Zap size={12} className="text-[#FFD700]" />
            <span>SUNO İÇE AKTAR</span>
          </button>

          {serverVideoUrl && (
            <a 
              href={serverVideoUrl} 
              download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
              className="bg-[#FFD700] hover:bg-white text-black px-3 sm:px-3.5 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              <Download size={13} />
              <span className="hidden sm:inline">MP4 İNDİR</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={cn(
              "px-3 sm:px-3.5 py-1.5 rounded-sm text-[9.5px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border",
              activeTab === 'export'
                ? "bg-white text-black border-white"
                : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border-white/[0.08]"
            )}
          >
            <Video size={13} className="text-[#FFD700]" />
            <span>DIŞA AKTAR</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 🎛️ 2. ANA STÜDYO ALANI (SPLIT VIEWPORT + TABBED INSPECTOR) */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 lg:overflow-hidden">
        
        {/* ============================================================ */}
        {/* 🎬 SOL / ORTA: VİSUALİZER SAHNESİ & TRANSPORT BAR */}
        {/* ============================================================ */}
        <section className="flex-1 bg-[#060608] flex flex-col items-center justify-between p-3 sm:p-5 lg:p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-white/[0.07] relative min-w-0">
          
          {/* Sahne Üst Kontrolleri: Aspect Ratio & Çözünürlük */}
          <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/[0.08] rounded-md">
              {(['16/9', '9/16', '1/1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
                  className={cn(
                    "px-2.5 sm:px-3 py-1 text-[8.5px] sm:text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer",
                    settings.aspectRatio === ratio
                      ? "bg-[#FFD700] text-black shadow-sm font-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {ratio === '16/9' ? '16:9 CINEMA' : ratio === '9/16' ? '9:16 REELS' : '1:1 SQUARE'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[8.5px] sm:text-[9px] font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-2 py-1 rounded truncate max-w-[160px]">
                MOD: <b className="text-zinc-200">{settings.mode}</b>
              </span>
              <span className="text-[8.5px] sm:text-[9px] font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2 py-1 rounded">
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
              {/* Canlı Önizleme Bilgilendirme Rozeti (Görünümü engellemez) */}
              {!audioUrl && (
                <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/[0.1] px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-mono text-zinc-300 shadow-xl pointer-events-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                  <span>Canlı Önizleme Modu —</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('media')} 
                    className="text-[#FFD700] font-bold hover:underline cursor-pointer"
                  >
                    Medya Sekmesini Aç →
                  </button>
                </div>
              )}

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
              />
            </div>
          </div>

          {/* FLOATING STUDIO TRANSPORT SCRUBBER */}
          <div className="w-full max-w-4xl mt-2 sm:mt-3 bg-[#0A0A0E] border border-white/[0.09] p-2.5 sm:p-3 rounded-lg flex flex-col gap-2 shadow-xl shrink-0">
            
            {/* Timeline Scrubber Slider */}
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 w-9 sm:w-10 text-right shrink-0">
                {formatTime(currentTime)}
              </span>
              
              <div className="relative flex-1 flex items-center">
                <input 
                  type="range" 
                  min={0} 
                  max={duration || 100} 
                  value={currentTime}
                  disabled={!audioUrl}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    audioEngine.seek(val);
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-[#FFD700] appearance-none cursor-pointer disabled:opacity-30 transition-all"
                />
              </div>

              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 w-9 sm:w-10 shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Kontrol Butonları */}
            <div className="flex items-center justify-between">
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => audioEngine.seekRelative(-5)}
                  disabled={!audioUrl}
                  title="5 Saniye Geri Sar"
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
                >
                  <Rewind size={15} />
                </button>

                <button 
                  type="button"
                  onClick={togglePlay} 
                  disabled={!audioUrl}
                  title="Oynat / Durdur (Boşluk Tuşu)"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFD700] hover:bg-white text-black flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_12px_rgba(255,215,0,0.3)] cursor-pointer disabled:opacity-30"
                >
                  {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" className="ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => audioEngine.seekRelative(5)}
                  disabled={!audioUrl}
                  title="5 Saniye İleri Sar"
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
                >
                  <FastForward size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => audioEngine.seek(0)}
                  disabled={!audioUrl}
                  title="Başa Dön"
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20 ml-1"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Ses ve Kısayol İpuçları */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => audioEngine.toggleMute()}
                  disabled={!audioUrl}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20 p-1"
                  title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                >
                  {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-500 border-l border-zinc-800 pl-3">
                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">SPACE</span>
                  <span>Oynat</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ============================================================ */}
        {/* 🎚️ SAĞ: DOCKED TABBED INSPECTOR WORKSPACE */}
        {/* ============================================================ */}
        <aside className="w-full lg:w-[440px] xl:w-[500px] bg-[#08080B] flex flex-col border-t lg:border-t-0 lg:border-l border-white/[0.08] h-full overflow-hidden flex-1 lg:shrink-0 lg:flex-none min-w-0">
          
          {/* TAB BAR HEADER */}
          <div className="border-b border-white/[0.08] bg-[#0A0A0E] px-2 pt-2 flex items-center overflow-x-auto custom-scrollbar flex-shrink-0 gap-1">
            <div className="flex items-center gap-1">
              {[
                { id: 'visualizer', label: 'GÖRSEL', icon: Sliders },
                { id: 'effects',    label: 'EFEKTLER', icon: Sparkles },
                { id: 'lyrics',     label: 'SÖZLER', icon: Type },
                { id: 'media',      label: 'MEDYA', icon: Layers },
                { id: 'presets',    label: 'PROFİL', icon: Bookmark },
                { id: 'export',     label: 'RENDER', icon: Video },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as StudioTab)}
                    className={cn(
                      "px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "text-[#FFD700] border-[#FFD700] bg-white/[0.03]"
                        : "text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]"
                    )}
                  >
                    <Icon size={13} className={isActive ? "text-[#FFD700]" : "text-zinc-500"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB İÇERİĞİ (KAYDIRILABİLİR ALAN) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            
            {/* ========================================================== */}
            {/* TAB 1: VISUALIZER MODES, COLORS & ATMOSPHERE */}
            {/* ========================================================== */}
            {activeTab === 'visualizer' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                
                {/* Arama ve Kategori Filtreleme */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      VİSUALİZER MODU SEÇİN (26 TEMA)
                    </span>
                    <span className="text-[9px] font-mono text-[#FFD700]">
                      AKTİF: {settings.mode}
                    </span>
                  </div>

                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="text"
                      placeholder="Mod ara (örn: tunnel, ring, wave, matrix)..."
                      value={visualizerSearch}
                      onChange={(e) => setVisualizerSearch(e.target.value)}
                      className="w-full bg-black/60 border border-white/[0.08] rounded-sm pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 font-mono outline-none focus:border-[#FFD700]"
                    />
                  </div>

                  {/* Kategori Filtre Hapları */}
                  <div className="flex flex-wrap gap-1">
                    {(['ALL', '3D', 'PARTICLE', 'WAVE', 'CYBER', 'MINIMAL'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setVisualizerCategory(cat)}
                        className={cn(
                          "px-2 py-0.5 text-[8.5px] font-mono uppercase tracking-wider rounded border transition-all cursor-pointer",
                          visualizerCategory === cat
                            ? "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/60 font-bold"
                            : "bg-black text-zinc-500 border-zinc-800 hover:text-zinc-300"
                        )}
                      >
                        {cat === 'ALL' ? 'TÜMÜ' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Görselleştirici Mod Grid Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {filteredVisualizers.map((m) => {
                    const isSelected = settings.mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, mode: m.id })}
                        className={cn(
                          "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group",
                          isSelected
                            ? "bg-[#FFD700] text-black border-[#FFD700] font-black shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                            : "bg-black/50 text-zinc-300 border-white/[0.06] hover:border-zinc-700 hover:bg-white/[0.02]"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold uppercase tracking-wider truncate pr-1">
                            {m.label}
                          </span>
                          <span className={cn(
                            "text-[7px] font-mono px-1 py-0.2 rounded border",
                            isSelected ? "border-black/30 bg-black/10 text-black font-bold" : "border-zinc-800 text-zinc-500"
                          )}>
                            {m.cat}
                          </span>
                        </div>
                        <p className={cn(
                          "text-[8px] font-mono mt-1 line-clamp-1",
                          isSelected ? "text-zinc-900" : "text-zinc-500"
                        )}>
                          {m.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {settings.mode === 'VRM_ANIME_HYBRID' && (
                  <div className="space-y-4 pt-3 border-t border-white/10 bg-black/40 p-3.5 rounded-sm border border-white/[0.08]">
                    
                    {/* VRM Karakter Seçici Başlığı */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        <User size={13} className="text-[#FFD700]" />
                        3D VRM AVATAR MODELİ
                      </span>
                      <span className="text-[8.5px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30 font-bold truncate max-w-[170px]">
                        {settings.vrmModelName || (settings.vrmModelUrl?.includes('Nutachisan') ? 'Nutachisan.vrm' : 'AliciaSolid.vrm')}
                      </span>
                    </div>

                    {/* Model Kartları Listesi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {VRM_AVATAR_MODELS.map((model) => {
                        const isCurrent = (settings.vrmModelUrl || '/models/AliciaSolid.vrm') === model.url;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => setSettings(s => ({ ...s, vrmModelUrl: model.url, vrmModelName: model.name }))}
                            className={cn(
                              "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group relative",
                              isCurrent
                                ? "bg-[#FFD700] text-black border-[#FFD700] font-black shadow-[0_0_12px_rgba(255,215,0,0.2)]"
                                : "bg-black/60 text-zinc-300 border-white/[0.08] hover:border-zinc-700 hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] font-bold uppercase truncate pr-1">
                                {model.name}
                              </span>
                              <span className={cn(
                                "text-[7px] font-mono px-1 py-0.2 rounded border",
                                isCurrent ? "border-black/30 bg-black/10 text-black font-bold" : "border-zinc-800 text-zinc-500"
                              )}>
                                {model.badge}
                              </span>
                            </div>
                            <p className={cn(
                              "text-[8px] font-mono mt-1 line-clamp-1",
                              isCurrent ? "text-zinc-900" : "text-zinc-500"
                            )}>
                              {model.desc}
                            </p>
                            <span className={cn(
                              "text-[7.5px] font-mono mt-2 flex items-center gap-1",
                              isCurrent ? "text-black font-bold" : "text-zinc-600 group-hover:text-zinc-400"
                            )}>
                              {isCurrent ? "✓ AKTİF MODEL" : "Modeli Seç →"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Özel .VRM Dosyası Yükleme Butonu */}
                    <div className="space-y-2">
                      <label className="border border-dashed border-zinc-800 hover:border-[#FFD700] p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors bg-black/40 text-center group">
                        <Upload size={13} className="text-zinc-500 group-hover:text-[#FFD700]" />
                        <span className="text-[8.5px] font-mono uppercase text-zinc-300 group-hover:text-white font-bold">
                          + BİLGİSAYARINDAN .VRM DOSYASI YÜKLE
                        </span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".vrm,application/octet-stream,model/gltf-binary" 
                          onChange={(e) => handleFileUpload(e, 'VRM')} 
                        />
                      </label>
                      
                      {/* Manuel Dosya Yolu / URL Girişi */}
                      <div className="flex items-center gap-2 bg-black/60 border border-white/[0.06] p-1.5 rounded-sm">
                        <Box size={12} className="text-zinc-500 shrink-0 ml-1" />
                        <input
                          type="text"
                          placeholder="veya yol gir: /models/Nutachisan.vrm"
                          value={settings.vrmModelUrl || ''}
                          onChange={(e) => setSettings(s => ({ ...s, vrmModelUrl: e.target.value, vrmModelName: e.target.value.split('/').pop() || 'Custom Model' }))}
                          className="w-full bg-transparent text-[8.5px] font-mono text-zinc-300 placeholder:text-zinc-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Avatar Render Stili */}
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                        AVATAR RENDER STİLİ
                      </span>
                      <div className="flex bg-black/60 p-1 border border-white/[0.08] rounded gap-1">
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, avatarMode: 'anime' })}
                          className={cn(
                            "flex-1 text-[9px] py-1.5 font-bold uppercase tracking-wider rounded cursor-pointer transition-colors",
                            settings.avatarMode === 'anime' ? "bg-[#FFD700] text-black shadow-sm font-black" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          SOLID ANIME
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, avatarMode: 'hologram' })}
                          className={cn(
                            "flex-1 text-[9px] py-1.5 font-bold uppercase tracking-wider rounded cursor-pointer transition-colors",
                            settings.avatarMode === 'hologram' ? "bg-[#FFD700] text-black shadow-sm font-black" : "text-zinc-400 hover:text-white"
                          )}
                        >
                          HOLOGRAM 3D
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* RENK PALETİ SEÇİCİ */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    RENK PALETİ & VURGU
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {COLOR_PALETTES.map((pal) => {
                      const isSelected = settings.primaryColor === pal.p;
                      return (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => setSettings({ ...settings, primaryColor: pal.p, secondaryColor: pal.s })}
                          className={cn(
                            "p-2 text-left border rounded-sm transition-all flex flex-col gap-1.5 cursor-pointer",
                            isSelected
                              ? "border-[#FFD700] bg-zinc-900/90 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                              : "border-white/[0.06] bg-black/40 hover:border-zinc-700"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: pal.p }} />
                            <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: pal.s }} />
                          </div>
                          <span className="text-[7.5px] font-mono font-bold uppercase text-zinc-300 truncate">{pal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ARKAPLAN ZEMİN SEÇİCİ */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    ARKAPLAN ZEMİNİ & ATMOSFER
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'GRID', label: 'IZGARA' },
                      { id: 'SMOKE', label: 'DUMAN SİSİ' },
                      { id: 'PARTICLES', label: 'PARÇACIK' },
                      { id: 'NONE', label: 'SAF SİYAH' }
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, bgMode: bg.id as any })}
                        className={cn(
                          "py-2 px-3 text-center border rounded-sm text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer",
                          settings.bgMode === bg.id
                            ? "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700] font-bold"
                            : "bg-black/40 text-zinc-400 border-white/[0.06] hover:border-zinc-700"
                        )}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HAREKET & HASSASİYET MİKRO SLIDERLARI */}
                <div className="space-y-3 pt-2 border-t border-white/[0.06] bg-black/40 p-3 rounded-sm border">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    PARAMETRE İNCE AYARLARI
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>HIZ:</span>
                        <span className="text-[#FFD700] font-bold">{(settings.visSpeed ?? 1.0).toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.2" max="2.5" step="0.1" 
                        value={settings.visSpeed ?? 1.0}
                        onChange={(e) => setSettings({ ...settings, visSpeed: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>ÖLÇEK:</span>
                        <span className="text-[#FFD700] font-bold">{(settings.visScale ?? 1.0).toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.05" 
                        value={settings.visScale ?? 1.0}
                        onChange={(e) => setSettings({ ...settings, visScale: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>YOĞUNLUK:</span>
                        <span className="text-[#FFD700] font-bold">{(settings.visDensity ?? 1.0).toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.4" max="2.0" step="0.1" 
                        value={settings.visDensity ?? 1.0}
                        onChange={(e) => setSettings({ ...settings, visDensity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                        <span>BEAT DUYARLILIĞI:</span>
                        <span className="text-[#FFD700] font-bold">{(settings.visBeatSensitivity ?? 1.0).toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.4" max="2.5" step="0.1" 
                        value={settings.visBeatSensitivity ?? 1.0}
                        onChange={(e) => setSettings({ ...settings, visBeatSensitivity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}


            {/* ========================================================== */}
            {/* TAB 2: SHADERS & VISUAL EFFECTS STUDIO */}
            {/* ========================================================== */}
            {activeTab === 'effects' && (
              <div className="animate-in fade-in-50 duration-150">
                <EffectsStudio 
                  settings={settings}
                  onChange={(updated) => setSettings(s => ({ ...s, ...updated }))}
                />
              </div>
            )}


            {/* ========================================================== */}
            {/* TAB 3: LYRICS & KINETIC TYPOGRAPHY */}
            {/* ========================================================== */}
            {activeTab === 'lyrics' && (
              <div className="animate-in fade-in-50 duration-150">
                <LyricsStudio 
                  settings={settings}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                  onChange={(updated) => setSettings(s => ({ ...s, ...updated }))}
                />
              </div>
            )}


            {/* ========================================================== */}
            {/* TAB 4: MEDIA, COVER, LOGO & BACKGROUND VIDEO */}
            {/* ========================================================== */}
            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                
                {/* 1. Şarkı ve Sanatçı Metadatası */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    PARÇA VE SANATÇI BİLGİSİ
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">SANATÇI ADI:</span>
                      <input 
                        type="text" 
                        placeholder="Örn: Daft Punk" 
                        value={settings.artistName}
                        onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-[#FFD700] font-bold uppercase outline-none focus:border-[#FFD700]"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase">ŞARKI ADI:</span>
                      <input 
                        type="text" 
                        placeholder="Örn: Around The World" 
                        value={settings.trackTitle}
                        onChange={(e) => setSettings({ ...settings, trackTitle: e.target.value })}
                        className="w-full bg-black border border-zinc-800 p-2 text-xs text-white font-bold uppercase outline-none focus:border-[#FFD700]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Ses Dosyası Yönetimi */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      SES DOSYASI
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSunoModalOpen(true)}
                        className="text-[#FFD700] hover:underline text-[8.5px] font-mono uppercase flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Zap size={10} /> SUNO LİNKİ GİR
                      </button>
                      <span className="text-zinc-600">•</span>
                      <button
                        type="button"
                        onClick={loadDemoTrack}
                        className="text-zinc-400 hover:text-[#FFD700] text-[8.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                      >
                        MESELE DEMO
                      </button>
                      {audioUrl && (
                        <button
                          type="button"
                          onClick={removeAudio}
                          className="text-red-400 hover:text-red-300 text-[8.5px] font-mono uppercase flex items-center gap-1 cursor-pointer ml-1"
                        >
                          <Trash2 size={10} /> KALDIR
                        </button>
                      )}
                    </div>
                  </div>

                  {audioUrl ? (
                    <div className="flex items-center justify-between bg-zinc-950 p-3 border border-zinc-800">
                      <div className="flex items-center gap-2.5 truncate">
                        <Music size={15} className="text-[#FFD700] shrink-0" />
                        <span className="text-[10px] font-mono text-white truncate">
                          {settings.trackTitle || "Ses Dosyası Yüklendi"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setIsSunoModalOpen(true)}
                          className="px-2 py-1 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/40 text-[#FFD700] text-[8px] font-mono uppercase cursor-pointer"
                          title="Suno Şarkısı Değiştir"
                        >
                          ⚡ SUNO
                        </button>
                        <label className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[8.5px] font-mono uppercase cursor-pointer">
                          DEĞİŞTİR
                          <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'AUDIO')} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSunoModalOpen(true)}
                        className="border border-[#FFD700]/40 bg-[#FFD700]/5 hover:bg-[#FFD700]/15 p-3.5 rounded-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group"
                      >
                        <Zap size={16} className="text-[#FFD700] group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-mono font-bold text-[#FFD700] uppercase">
                          ⚡ SUNO LİNKİ İLE YÜKLE
                        </span>
                        <span className="text-[7.5px] font-mono text-zinc-500">
                          Söz & Kapak Otomatik Çekilir
                        </span>
                      </button>

                      <label className="border border-dashed border-zinc-800 hover:border-zinc-600 p-3.5 rounded-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-black/20 text-center group">
                        <Upload size={16} className="text-zinc-500 group-hover:text-zinc-300" />
                        <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase">
                          + DOSYA YÜKLE (.MP3/.WAV)
                        </span>
                        <span className="text-[7.5px] font-mono text-zinc-500">
                          Bilgisayarından Seç
                        </span>
                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'AUDIO')} />
                      </label>
                    </div>
                  )}
                </div>

                {/* 3. Kapak Fotoğrafı & Logo Katmanı */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kapak Fotoğrafı */}
                  <div className="bg-black/40 border border-white/[0.08] p-3 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">KAPAK FOTOĞRAFI</span>
                      {coverUrl && (
                        <button onClick={removeCover} className="text-red-400 text-[8px] font-mono uppercase cursor-pointer">SİL</button>
                      )}
                    </div>
                    {coverUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={coverUrl} alt="Kapak" className="w-12 h-12 object-cover border border-zinc-800" />
                        <label className="text-[8px] font-mono bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-300 cursor-pointer uppercase">
                          DEĞİŞTİR
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'COVER')} />
                        </label>
                      </div>
                    ) : (
                      <label className="border border-dashed border-zinc-800 p-3 flex flex-col items-center gap-1 cursor-pointer hover:border-[#FFD700] transition-colors">
                        <ImageIcon size={14} className="text-zinc-600" />
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">+ KAPAK YÜKLE</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'COVER')} />
                      </label>
                    )}
                  </div>

                  {/* Logo / Watermark */}
                  <div className="bg-black/40 border border-white/[0.08] p-3 rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">LOGO / WATERMARK</span>
                      {logoUrl && (
                        <button onClick={removeLogo} className="text-red-400 text-[8px] font-mono uppercase cursor-pointer">SİL</button>
                      )}
                    </div>
                    {logoUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-zinc-950 border border-zinc-800" />
                        <label className="text-[8px] font-mono bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-300 cursor-pointer uppercase">
                          DEĞİŞTİR
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'LOGO')} />
                        </label>
                      </div>
                    ) : (
                      <label className="border border-dashed border-zinc-800 p-3 flex flex-col items-center gap-1 cursor-pointer hover:border-[#FFD700] transition-colors">
                        <Sparkles size={14} className="text-zinc-600" />
                        <span className="text-[8px] font-mono text-zinc-500 uppercase">+ LOGO YÜKLE</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'LOGO')} />
                      </label>
                    )}
                  </div>
                </div>

                {/* 4. Arka Plan Görseli / Duvar Kağıdı Katmanı (Static Wallpaper) */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ImageIcon size={13} className="text-[#FFD700]" />
                      ARKAPLAN GÖRSELİ (DUVAR KAĞIDI)
                    </span>
                    {bgImageUrl && (
                      <button
                        type="button"
                        onClick={removeBackgroundImage}
                        className="text-red-400 hover:text-red-300 text-[8.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={10} /> GÖRSELİ SİL
                      </button>
                    )}
                  </div>

                  {/* Küratörlü Duvar Kağıdı Kartları */}
                  <div className="grid grid-cols-2 gap-2">
                    {CURATED_WALLPAPERS.map((wall) => {
                      const isCurrent = bgImageUrl === wall.url;
                      return (
                        <button
                          key={wall.name}
                          type="button"
                          onClick={() => selectCuratedWallpaper(wall.url)}
                          className={cn(
                            "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden",
                            isCurrent
                              ? "bg-[#FFD700] text-black border-[#FFD700] font-black"
                              : "bg-black/60 text-zinc-300 border-white/[0.06] hover:border-zinc-700"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[9px] font-bold uppercase truncate">{wall.name}</span>
                          </div>
                          <span className={cn("text-[7.5px] font-mono mt-1", isCurrent ? "text-zinc-900" : "text-zinc-500")}>
                            {isCurrent ? "✓ AKTİF DUVAR KAĞIDI" : "Seç"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Özel Arka Plan Görseli Yükle */}
                  <label className="border border-dashed border-zinc-800 p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-[#FFD700] transition-colors bg-black/20 text-center">
                    <Upload size={13} className="text-zinc-400" />
                    <span className="text-[9px] font-mono uppercase text-zinc-300">+ KENDİ ARKAPLAN GÖRSELİNİ YÜKLE (.JPG/.PNG/.WEBP)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'BG_IMAGE')} />
                  </label>

                  {/* Görsel Opaklık, Bulanıklık & Reaktivite Kontrolü */}
                  {bgImageUrl && (
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8.5px] font-mono text-zinc-400">
                            <span>GÖRSEL OPAKLIĞI:</span>
                            <span className="text-[#FFD700]">%{Math.round((settings.bgImageOpacity ?? 0.85) * 100)}</span>
                          </div>
                          <input 
                            type="range" min="0.1" max="1.0" step="0.05"
                            value={settings.bgImageOpacity ?? 0.85}
                            onChange={(e) => setSettings({ ...settings, bgImageOpacity: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8.5px] font-mono text-zinc-400">
                            <span>BULANIKLIK:</span>
                            <span className="text-[#FFD700]">{(settings.bgImageBlur ?? 0).toFixed(0)}px</span>
                          </div>
                          <input 
                            type="range" min="0" max="25" step="1"
                            value={settings.bgImageBlur ?? 0}
                            onChange={(e) => setSettings({ ...settings, bgImageBlur: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, bgImageReactive: !s.bgImageReactive }))}
                        className={cn(
                          "w-full py-1.5 text-[8.5px] font-mono uppercase border rounded-sm transition-all cursor-pointer",
                          settings.bgImageReactive !== false
                            ? "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]"
                            : "bg-black text-zinc-500 border-zinc-800"
                        )}
                      >
                        BEAT KICK ZOOM & PULSE: {settings.bgImageReactive !== false ? 'AÇIK' : 'KAPALI'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Arka Plan Video Katmanı & Euphoric Döngüler */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                      ARKA PLAN VİDEO DÖNGÜSÜ (EUPHORIC)
                    </span>
                    {bgVideoUrl && (
                      <button
                        type="button"
                        onClick={removeBackgroundVideo}
                        className="text-red-400 hover:text-red-300 text-[8.5px] font-mono uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={10} /> VİDEOYU SİL
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {EUPHORIC_VIDEO_PRESETS.map((v) => {
                      const isCurrent = bgVideoUrl === v.url;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => selectEuphoricVideo(v.url)}
                          className={cn(
                            "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer",
                            isCurrent
                              ? "bg-[#FFD700] text-black border-[#FFD700] font-black"
                              : "bg-black/60 text-zinc-400 border-white/[0.06] hover:border-zinc-700"
                          )}
                        >
                          <span className="text-[9px] font-bold uppercase truncate">{v.name}</span>
                          <span className={cn("text-[7.5px] font-mono mt-1", isCurrent ? "text-zinc-900" : "text-zinc-500")}>
                            {isCurrent ? "✓ AKTİF DÖNGÜ" : "Kullan"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Özel Video Yükle */}
                  <label className="border border-dashed border-zinc-800 p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-[#FFD700] transition-colors bg-black/20 text-center">
                    <Film size={14} className="text-zinc-500" />
                    <span className="text-[9px] font-mono uppercase text-zinc-400">+ KENDİ MP4 VİDEONU YÜKLE</span>
                    <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'VIDEO')} />
                  </label>

                  {/* Video Opaklık & Reaktivite Kontrolü */}
                  {bgVideoUrl && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-900">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8.5px] font-mono text-zinc-400">
                          <span>VİDEO OPAKLIĞI:</span>
                          <span className="text-[#FFD700]">%{Math.round((settings.bgVideoOpacity ?? 0.65) * 100)}</span>
                        </div>
                        <input 
                          type="range" min="0.1" max="1.0" step="0.05"
                          value={settings.bgVideoOpacity ?? 0.65}
                          onChange={(e) => setSettings({ ...settings, bgVideoOpacity: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, bgVideoReactive: !s.bgVideoReactive }))}
                          className={cn(
                            "w-full py-1.5 text-[8.5px] font-mono uppercase border rounded-sm transition-all",
                            settings.bgVideoReactive !== false
                              ? "bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]"
                              : "bg-black text-zinc-500 border-zinc-800"
                          )}
                        >
                          BEAT KICK PULSE: {settings.bgVideoReactive !== false ? 'AÇIK' : 'KAPALI'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. 3D Karakter / VRM Avatar Katmanı */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={13} className="text-[#FFD700]" />
                      3D VRM AVATAR / KARAKTER
                    </span>
                    <span className="text-[8.5px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded border border-[#FFD700]/30 font-bold truncate max-w-[170px]">
                      {settings.vrmModelName || (settings.vrmModelUrl?.includes('Nutachisan') ? 'Nutachisan.vrm' : 'AliciaSolid.vrm')}
                    </span>
                  </div>

                  {/* Küratörlü / Yüklü VRM Modelleri */}
                  <div className="grid grid-cols-2 gap-2">
                    {VRM_AVATAR_MODELS.map((model) => {
                      const isCurrent = (settings.vrmModelUrl || '/models/AliciaSolid.vrm') === model.url;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, mode: 'VRM_ANIME_HYBRID', vrmModelUrl: model.url, vrmModelName: model.name }))}
                          className={cn(
                            "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group relative",
                            isCurrent
                              ? "bg-[#FFD700] text-black border-[#FFD700] font-black"
                              : "bg-black/60 text-zinc-300 border-white/[0.06] hover:border-zinc-700"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[9px] font-bold uppercase truncate">{model.name}</span>
                          </div>
                          <span className={cn("text-[7.5px] font-mono mt-1", isCurrent ? "text-zinc-900" : "text-zinc-500")}>
                            {isCurrent ? "✓ AKTİF MODEL" : "Seç & Kullan"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Özel VRM Dosyası Yükle */}
                  <label className="border border-dashed border-zinc-800 p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-[#FFD700] transition-colors bg-black/20 text-center">
                    <Upload size={13} className="text-zinc-400" />
                    <span className="text-[9px] font-mono uppercase text-zinc-300">+ YENİ 3D .VRM MODELİ YÜKLE</span>
                    <input type="file" className="hidden" accept=".vrm,application/octet-stream,model/gltf-binary" onChange={(e) => handleFileUpload(e, 'VRM')} />
                  </label>
                </div>

              </div>
            )}


            {/* ========================================================== */}
            {/* TAB 5: PRESET & PROFILE MANAGER */}
            {/* ========================================================== */}
            {activeTab === 'presets' && (
              <div className="animate-in fade-in-50 duration-150">
                <PresetManager 
                  currentSettings={settings}
                  onApplySettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
                />
              </div>
            )}


            {/* ========================================================== */}
            {/* TAB 6: EXPORT & 60 FPS RENDER ENGINE */}
            {/* ========================================================== */}
            {activeTab === 'export' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                
                {/* Motor Seçimi (SSR vs CSR) */}
                <div className="bg-black/40 border border-white/[0.08] p-4 rounded-sm space-y-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                    RENDER MOTORU SEÇİMİ
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRenderEngine('server')}
                      className={cn(
                        "p-3 text-left border rounded-sm transition-all flex flex-col gap-1 cursor-pointer",
                        renderEngine === 'server'
                          ? "border-[#FFD700] bg-zinc-900/80 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                          : "border-white/[0.06] bg-black/40 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#FFD700]">SUNUCU (SSR)</span>
                        <span className="text-[7.5px] bg-[#FFD700]/20 text-[#FFD700] px-1 py-0.2 font-mono">ÖNERİLEN</span>
                      </div>
                      <p className="text-[8.5px] text-zinc-400 font-mono leading-relaxed">
                        FFmpeg 60 FPS MP4 kodlama. Kristal netliğinde çıktı verir.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRenderEngine('client')}
                      className={cn(
                        "p-3 text-left border rounded-sm transition-all flex flex-col gap-1 cursor-pointer",
                        renderEngine === 'client'
                          ? "border-[#FFD700] bg-zinc-900/80 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                          : "border-white/[0.06] bg-black/40 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-zinc-300">İSTEMCİ (CSR)</span>
                        <span className="text-[7.5px] bg-zinc-800 text-zinc-400 px-1 py-0.2 font-mono">TARAYICI</span>
                      </div>
                      <p className="text-[8.5px] text-zinc-400 font-mono leading-relaxed">
                        MediaRecorder WebM kaydı. Hızlı önizleme ve yerel indirme.
                      </p>
                    </button>
                  </div>

                  {/* Çözünürlük */}
                  {renderEngine === 'server' && (
                    <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-zinc-400 border-t border-zinc-900">
                      <span>ÇÖZÜNÜRLÜK:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setServerQuality('1080p')}
                          className={cn(
                            "px-2 py-0.5 border text-[8.5px] font-mono font-bold uppercase",
                            serverQuality === '1080p' ? "border-[#FFD700] bg-[#FFD700] text-black" : "border-zinc-800 text-zinc-500"
                          )}
                        >
                          1080P FULL HD
                        </button>
                        <button
                          type="button"
                          onClick={() => setServerQuality('720p')}
                          className={cn(
                            "px-2 py-0.5 border text-[8.5px] font-mono font-bold uppercase",
                            serverQuality === '720p' ? "border-[#FFD700] bg-[#FFD700] text-black" : "border-zinc-800 text-zinc-500"
                          )}
                        >
                          720P HIZLI
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SSR Render Alanı */}
                {renderEngine === 'server' && (
                  <div className="space-y-3">
                    {isServerRendering ? (
                      <div className="p-5 bg-zinc-950 border border-[#FFD700]/50 space-y-3 shadow-[0_0_30px_rgba(255,215,0,0.15)] rounded-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#FFD700] uppercase flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
                            SUNUCUDA RENDER ALINIYOR...
                          </span>
                          <span className="text-xs font-mono font-bold text-[#FFD700]">
                            %{serverProgress}
                          </span>
                        </div>

                        {/* İlerleme Çubuğu */}
                        <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 overflow-hidden rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FFD700] to-yellow-200 transition-all duration-300 shadow-[0_0_10px_#FFD700]"
                            style={{ width: `${serverProgress}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                          <span className="truncate pr-2">{serverStage}</span>
                          <button 
                            type="button"
                            onClick={cancelServerRender}
                            className="text-red-400 hover:text-red-300 font-bold uppercase shrink-0 cursor-pointer underline"
                          >
                            İPTAL
                          </button>
                        </div>
                      </div>
                    ) : serverVideoUrl ? (
                      <div className="space-y-2">
                        <a 
                          href={serverVideoUrl}
                          download={`${settings.trackTitle || 'vidframer_render'}.mp4`}
                          className="block text-center w-full bg-[#FFD700] hover:bg-white text-black py-4 text-xs font-black uppercase tracking-[0.25em] transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] rounded-sm flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> 60 FPS MP4 VİDEOYU İNDİR
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setServerVideoUrl(null);
                            startServerRender();
                          }}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 text-[9px] font-mono uppercase tracking-wider border border-zinc-800 rounded-sm"
                        >
                          YENİDEN RENDER ET
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={startServerRender}
                        disabled={!audioUrl || isServerRendering}
                        className="w-full bg-[#FFD700] text-black py-4 text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all disabled:opacity-25 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.2)] rounded-sm"
                      >
                        <Video size={16} /> 60 FPS MP4 RENDER BAŞLAT (FFMPEG)
                      </button>
                    )}

                    {serverError && (
                      <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono rounded-sm">
                        Hata: {serverError}
                      </div>
                    )}
                  </div>
                )}

                {/* CSR Render Alanı */}
                {renderEngine === 'client' && (
                  <div className="space-y-3">
                    {!videoResultUrl ? (
                      <button 
                        type="button"
                        onClick={startClientRender}
                        disabled={!audioUrl || isRecording}
                        className="w-full bg-zinc-800 text-white hover:bg-zinc-700 py-4 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-20 flex items-center justify-center gap-2 cursor-pointer border border-zinc-700 rounded-sm"
                      >
                        <Video size={16} /> {isRecording ? 'İSTEMCİDE KAYDEDİLİYOR...' : 'WEBM KAYDI BAŞLAT'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <a 
                          href={videoResultUrl} 
                          download={`${settings.trackTitle || 'vidframer_render'}.webm`}
                          className="block text-center w-full bg-[#FFD700] hover:bg-white text-black py-4 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] rounded-sm flex items-center justify-center gap-2"
                        >
                          <Download size={16} /> WEBM VİDEOYU İNDİR
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoResultUrl(null);
                            startClientRender();
                          }}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-2 text-[9px] font-mono uppercase tracking-wider border border-zinc-800 rounded-sm"
                        >
                          YENİDEN KAYDET
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
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
    </main>
  );
}
