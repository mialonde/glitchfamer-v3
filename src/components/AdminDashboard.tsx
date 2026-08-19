import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Layout, Sparkles, 
  Plus, Trash2, Save, LogOut, Bell, 
  Search, ChevronRight, User, Settings, ArrowUpRight,
  FolderOpen, Palette, BarChart3, Navigation, CheckSquare, Square,
  Users, Activity, AlertTriangle, MessageSquare, Sliders, Music,
  Zap, Download, CheckCircle2, XCircle, Clock, Shield, Eye,
  Edit3, ExternalLink, RefreshCw, Smartphone, TrendingUp, Layers, HelpCircle,
  Flame, Filter, Check, Award
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  CMSPage, CMSLayout, StudioModulesConfig, StudioTabConfig,
  AdminUser, VisualizerAnalyticsItem, RenderLogItem,
  FeedbackItem, ErrorLogItem, SunoAnalyticsData,
  MasteringAnalyticsData, ABTestItem, LandingPageCMS, AppColorTheme
} from '../types';
import {
  INITIAL_TABS, INITIAL_USERS, INITIAL_VISUALIZER_ANALYTICS,
  INITIAL_RENDER_LOGS, INITIAL_FEEDBACK, INITIAL_ERRORS,
  INITIAL_SUNO_ANALYTICS, INITIAL_MASTERING_ANALYTICS,
  INITIAL_AB_TESTS, INITIAL_LANDING_CMS
} from '../lib/adminData';

interface AdminDashboardProps {
  onClose: () => void;
}

type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'visualizers' 
  | 'render_logs' 
  | 'landing_cms' 
  | 'feedback' 
  | 'errors' 
  | 'suno_mastering' 
  | 'ab_testing' 
  | 'files' 
  | 'theme' 
  | 'navigation' 
  | 'pages' 
  | 'layout' 
  | 'modules';

// Analytics trend seed data
const renderTrendData = [
  { day: '01 Ağu', renders: 340, webm: 210, mp4: 130 },
  { day: '02 Ağu', renders: 420, webm: 250, mp4: 170 },
  { day: '03 Ağu', renders: 390, webm: 230, mp4: 160 },
  { day: '04 Ağu', renders: 510, webm: 300, mp4: 210 },
  { day: '05 Ağu', renders: 680, webm: 400, mp4: 280 },
  { day: '06 Ağu', renders: 820, webm: 490, mp4: 330 },
  { day: '07 Ağu', renders: 950, webm: 580, mp4: 370 },
];

const userGrowthData = [
  { day: 'Pzt', totalUsers: 13200, activeUsers: 2100 },
  { day: 'Sal', totalUsers: 13500, activeUsers: 2340 },
  { day: 'Çar', totalUsers: 13850, activeUsers: 2420 },
  { day: 'Per', totalUsers: 14100, activeUsers: 2510 },
  { day: 'Cum', totalUsers: 14420, activeUsers: 2780 },
  { day: 'Cts', totalUsers: 14680, activeUsers: 3100 },
  { day: 'Paz', totalUsers: 14820, activeUsers: 3450 },
];

const funnelData = [
  { step: '1. Şarkı / Suno Yükleme', count: 5200, dropoff: '0%' },
  { step: '2. Görselleştirici Seçimi', count: 4600, dropoff: '-11.5%' },
  { step: '3. Efekt / VRM / Lirik Ayarı', count: 3850, dropoff: '-16.3%' },
  { step: '4. Render Başlatma (Dönüşüm)', count: 2980, dropoff: '-22.6%' },
];

const resolutionPieData = [
  { name: '9:16 Reels / TikTok', value: 62, color: '#0057FF' },
  { name: '16:9 YouTube Cinema', value: 26, color: '#0ea5e9' },
  { name: '1:1 Square Spotify Canvas', value: 12, color: '#6366f1' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vf_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Güvenlik: Admin erişimi için yetkili parola doğrulaması
    if (adminPassword === 'admin2026' || adminPassword === 'glitchframer_admin_secret') {
      sessionStorage.setItem('vf_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Hatalı yönetici şifresi. Erişim reddedildi.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('vf_admin_auth');
    setIsAuthenticated(false);
    onClose();
  };

  // --- STATE FOR ALL MODULES WITH LOCALSTORAGE PERSISTENCE ---
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'ALL' | 'FREE' | 'CREATOR' | 'PRO'>('ALL');

  const [visualizerAnalytics, setVisualizerAnalytics] = useState<VisualizerAnalyticsItem[]>(INITIAL_VISUALIZER_ANALYTICS);
  const [renderLogs, setRenderLogs] = useState<RenderLogItem[]>(INITIAL_RENDER_LOGS);
  const [logFilterStatus, setLogFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');

  const [landingCms, setLandingCms] = useState<LandingPageCMS>(INITIAL_LANDING_CMS);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [newFeedbackModal, setNewFeedbackModal] = useState(false);
  const [newFeedbackForm, setNewFeedbackForm] = useState<{ title: string; desc: string; category: FeedbackItem['category']; priority: FeedbackItem['priority'] }>({
    title: '',
    desc: '',
    category: 'FEATURE',
    priority: 'MEDIUM'
  });

  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(INITIAL_ERRORS);
  const [sunoAnalytics, setSunoAnalytics] = useState<SunoAnalyticsData>(INITIAL_SUNO_ANALYTICS);
  const [masteringAnalytics, setMasteringAnalytics] = useState<MasteringAnalyticsData>(INITIAL_MASTERING_ANALYTICS);
  const [abTests, setAbTests] = useState<ABTestItem[]>(INITIAL_AB_TESTS);

  // Pages & Layout
  const [pages, setPages] = useState<CMSPage[]>([
    { id: '1', title: 'Hakkımızda', slug: 'about', content: 'GlitchFramer 2.0 hakkında detaylı bilgi...', createdAt: Date.now() - 1000000 },
    { id: '2', title: 'Kullanım Koşulları', slug: 'terms', content: 'Kullanım şartları ve telif hakları...', createdAt: Date.now() - 2000000 },
  ]);
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);

  const [layout, setLayout] = useState<CMSLayout>({
    headerTitle: 'GlitchFramer 2.0',
    headerLinks: [{ id: '1', label: 'Ana Sayfa', url: '/' }],
    footerText: '© 2024 GlitchFramer Studio. 60 FPS Cyberpunk Müzik Render Motoru.'
  });

  // Modules & Tabs & Theme
  const [modules, setModules] = useState<StudioModulesConfig>({
    enableSocial: true,
    enableEffects: true,
    enableLyrics: true,
    enablePresets: true,
    theme: { accent: '#0057FF', accentHover: '#0045CC' },
    tabs: INITIAL_TABS
  });

  // Files State
  const [files, setFiles] = useState([
    { id: '1', name: 'demo_phonk_master.mp3', type: 'Audio', size: '6.4 MB', date: '2024-08-10', format: 'Audio/MP3' },
    { id: '2', name: 'cyber_tunnel_loop_1080p.mp4', type: 'Video', size: '24.2 MB', date: '2024-08-09', format: 'Video/MP4' },
    { id: '3', name: 'single_cover_art_highres.jpg', type: 'Image', size: '2.1 MB', date: '2024-08-08', format: 'Image/JPEG' },
    { id: '4', name: 'vocal_stem_isolated.wav', type: 'Audio', size: '38.0 MB', date: '2024-08-07', format: 'Audio/WAV' },
    { id: '5', name: 'Nutachisan_3d_avatar.vrm', type: '3D Model', size: '14.5 MB', date: '2024-08-05', format: 'VRM/3D' },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileSearch, setFileSearch] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedModules = localStorage.getItem('vidframer_cms_modules');
      if (savedModules) {
        const parsed = JSON.parse(savedModules);
        setModules({
          ...parsed,
          theme: parsed.theme || { accent: '#0057FF', accentHover: '#0045CC' },
          tabs: parsed.tabs || INITIAL_TABS
        });
      }

      const savedUsers = localStorage.getItem('vidframer_admin_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedVisualizerAnalytics = localStorage.getItem('vidframer_admin_vis_analytics');
      if (savedVisualizerAnalytics) setVisualizerAnalytics(JSON.parse(savedVisualizerAnalytics));

      const savedFeedback = localStorage.getItem('vidframer_admin_feedback');
      if (savedFeedback) setFeedbackList(JSON.parse(savedFeedback));

      const savedErrors = localStorage.getItem('vidframer_admin_errors');
      if (savedErrors) setErrorLogs(JSON.parse(savedErrors));

      const savedAbTests = localStorage.getItem('vidframer_admin_abtests');
      if (savedAbTests) setAbTests(JSON.parse(savedAbTests));

      const savedLanding = localStorage.getItem('vidframer_admin_landing_cms');
      if (savedLanding) setLandingCms(JSON.parse(savedLanding));

      const savedPages = localStorage.getItem('vidframer_cms_pages');
      if (savedPages) setPages(JSON.parse(savedPages));

      const savedLayout = localStorage.getItem('vidframer_cms_layout');
      if (savedLayout) setLayout(JSON.parse(savedLayout));
    } catch (e) {
      console.warn('LocalStorage yükleme hatası:', e);
    }
  }, []);

  // Save all to localStorage
  const saveAll = () => {
    try {
      localStorage.setItem('vidframer_cms_modules', JSON.stringify(modules));
      localStorage.setItem('vidframer_admin_users', JSON.stringify(users));
      localStorage.setItem('vidframer_admin_vis_analytics', JSON.stringify(visualizerAnalytics));
      localStorage.setItem('vidframer_admin_feedback', JSON.stringify(feedbackList));
      localStorage.setItem('vidframer_admin_errors', JSON.stringify(errorLogs));
      localStorage.setItem('vidframer_admin_abtests', JSON.stringify(abTests));
      localStorage.setItem('vidframer_admin_landing_cms', JSON.stringify(landingCms));
      localStorage.setItem('vidframer_cms_pages', JSON.stringify(pages));
      localStorage.setItem('vidframer_cms_layout', JSON.stringify(layout));

      if (modules.theme) {
        document.documentElement.style.setProperty('--accent', modules.theme.accent);
        document.documentElement.style.setProperty('--accent-hover', modules.theme.accentHover);
      }

      alert('✅ Tüm veriler, ayarlar ve tema konfigürasyonları başarıyla kaydedildi!');
    } catch (e) {
      alert('Kaydedilirken bir hata oluştu: ' + e);
    }
  };

  // Color picker change handler
  const handleColorChange = (newColor: string) => {
    const updatedTheme: AppColorTheme = {
      accent: newColor,
      accentHover: newColor
    };
    setModules(prev => ({
      ...prev,
      theme: updatedTheme
    }));
    document.documentElement.style.setProperty('--accent', newColor);
    document.documentElement.style.setProperty('--accent-hover', newColor);
  };

  // File operations
  const toggleFileSelection = (id: string) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter(fId => fId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const deleteSelectedFiles = () => {
    if (window.confirm(`Seçilen ${selectedFiles.length} dosyayı depolama alanından kalıcı olarak silmek istiyor musunuz?`)) {
      setFiles(files.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(fileSearch.toLowerCase()));

  // Visualizer toggle status
  const toggleVisualizerStatus = (id: string) => {
    setVisualizerAnalytics(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus: VisualizerAnalyticsItem['status'] = 
          item.status === 'ACTIVE' ? 'PRO' :
          item.status === 'PRO' ? 'BETA' :
          item.status === 'BETA' ? 'HIDDEN' : 'ACTIVE';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Feedback upvote
  const handleUpvoteFeedback = (id: string) => {
    setFeedbackList(prev => prev.map(fb => fb.id === id ? { ...fb, upvotes: fb.upvotes + 1 } : fb));
  };

  // Error resolve
  const handleToggleErrorStatus = (id: string) => {
    setErrorLogs(prev => prev.map(err => {
      if (err.id === id) {
        return { ...err, status: err.status === 'RESOLVED' ? 'INVESTIGATING' : 'RESOLVED' };
      }
      return err;
    }));
  };

  // A/B test winner pick
  const handleSelectWinningVariant = (testId: string, variantId: string) => {
    setAbTests(prev => prev.map(test => {
      if (test.id === testId) {
        return { ...test, winningVariantId: variantId, status: 'COMPLETED' };
      }
      return test;
    }));
    alert('🏆 Kazanan varyant başarıyla seçildi ve stüdyo üretim trafiğine %100 uygulandı!');
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = userPlanFilter === 'ALL' || u.plan === userPlanFilter;
    return matchesSearch && matchesPlan;
  });

  // Filtered Render Logs
  const filteredRenderLogs = renderLogs.filter(log => {
    if (logFilterStatus === 'ALL') return true;
    return log.status === logFilterStatus;
  });

  // --- REUSABLE SHADCN DESIGN SYSTEM PRIMITIVES ---
  const NavItem = ({ id, icon: Icon, label, badge, badgeColor }: { id: AdminTab, icon: any, label: string, badge?: React.ReactNode, badgeColor?: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => { setActiveTab(id); setEditingPage(null); }}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          isActive 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
          <span className="tracking-tight">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${badgeColor || (isActive ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200')}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
    <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );

  const StatCard = ({ title, value, subtext, icon: Icon, trend, color = "text-slate-900" }: any) => (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xs font-semibold text-slate-500 uppercase">{title}</h3>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon size={16} className="text-slate-600" />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          {trend && <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">{trend}</span>}
          <p className="text-xs text-slate-500">{subtext}</p>
        </div>
      </div>
    </Card>
  );

  const Input = (props: any) => (
    <input 
      {...props} 
      className={`flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    />
  );

  const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer";
    const variants = {
      primary: "bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-sm",
      outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 text-slate-700",
      ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
      destructive: "bg-red-600 text-slate-50 hover:bg-red-700 shadow-sm",
      accent: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
    };
    return (
      <button className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 text-slate-900 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">YÖNETİCİ GİRİŞİ (ADMIN)</h3>
                <p className="text-[11px] text-slate-400">GlitchFramer 2.0 Telemetri & CMS Hub</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Yönetici Şifresi (Admin Password)
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Şifrenizi girin..."
                autoFocus
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-mono"
              />
              {authError && (
                <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center gap-1.5">
                  ⚠️ {authError}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
              >
                İptal / Stüdyoya Dön
              </button>
              <button
                type="submit"
                className="flex-1 h-10 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex text-slate-950 font-sans bg-slate-50 overflow-hidden select-none">
      
      {/* ============================================================ */}
      {/* 🧭 1. SIDEBAR NAVIGATION */}
      {/* ============================================================ */}
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5 font-bold">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-sm">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-xs tracking-wider uppercase font-black text-slate-900 leading-none">GlitchFramer</div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">Product & CMS Hub</div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">v2.4</span>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          
          {/* Dashboard & Product Decisions */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Ürün & Karar Paneli</h4>
            <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="visualizers" icon={Flame} label="Visualizer Heatmap" badge="Retention" badgeColor="bg-amber-50 text-amber-700 border-amber-200" />
            <NavItem id="render_logs" icon={Activity} label="Render Analytics" badge={renderLogs.length} />
            <NavItem id="ab_testing" icon={Zap} label="A/B Test Merkezi" badge="2 Aktif" badgeColor="bg-purple-50 text-purple-700 border-purple-200" />
          </div>

          {/* User Management & Customer Feedback */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Kullanıcı & Geri Bildirim</h4>
            <NavItem id="users" icon={Users} label="Kullanıcılar" badge={users.length} />
            <NavItem id="feedback" icon={MessageSquare} label="Geri Bildirimler" badge={feedbackList.filter(f => f.status === 'NEW').length + ' Yeni'} badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200" />
            <NavItem id="errors" icon={AlertTriangle} label="Hata Takibi (Sentry)" badge={errorLogs.filter(e => e.status === 'INVESTIGATING').length + ' Açık'} badgeColor="bg-rose-50 text-rose-700 border-rose-200" />
          </div>

          {/* Suno & Audio Modules */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Ses & Entegrasyonlar</h4>
            <NavItem id="suno_mastering" icon={Music} label="Suno & Mastering" />
            <NavItem id="files" icon={FolderOpen} label="Dosya Gezgini" badge={files.length} />
          </div>

          {/* CMS & Marketing */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">İçerik Yönetimi (CMS)</h4>
            <NavItem id="landing_cms" icon={Layout} label="Landing Page CMS" />
            <NavItem id="pages" icon={FileText} label="Özel Sayfalar" badge={pages.length} />
          </div>

          {/* Studio System Settings */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Sistem & Görünüm</h4>
            <NavItem id="theme" icon={Palette} label="Tema & Renkler" />
            <NavItem id="navigation" icon={Navigation} label="Stüdyo Menüleri" />
            <NavItem id="modules" icon={Settings} label="Sistem Modülleri" />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <Button variant="outline" className="w-full justify-center gap-2 text-xs" onClick={onClose}>
            <LogOut size={14} /> Stüdyoya Geri Dön
          </Button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 👑 2. MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top App Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer font-medium" onClick={() => setActiveTab('overview')}>Yönetim</span>
            <ChevronRight size={14} />
            <span className="font-bold text-slate-900 capitalize">
              {activeTab === 'overview' && 'Genel Bakış & Ürün Kararları'}
              {activeTab === 'users' && 'Kullanıcı Yönetimi'}
              {activeTab === 'visualizers' && 'Visualizer Heatmap & Retention'}
              {activeTab === 'render_logs' && 'Render Performansı & Loglar'}
              {activeTab === 'ab_testing' && 'A/B Test & Optimizasyon'}
              {activeTab === 'feedback' && 'Kullanıcı İstekleri & Hata Bildirimleri'}
              {activeTab === 'errors' && 'Hata & Çökme Merkezi (Sentry-like)'}
              {activeTab === 'suno_mastering' && 'Suno AI & Mastering İstatistikleri'}
              {activeTab === 'files' && 'Dosya Gezgini & Depolama'}
              {activeTab === 'landing_cms' && 'Landing Page & Fiyatlandırma CMS'}
              {activeTab === 'pages' && 'Statik Sayfalar'}
              {activeTab === 'theme' && 'Görünüm & Tema Renkleri'}
              {activeTab === 'navigation' && 'Stüdyo Sekme / Menü Yönetimi'}
              {activeTab === 'modules' && 'Sistem Modülleri'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={saveAll} className="gap-1.5 text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100">
              <Save size={14} /> Değişiklikleri Kaydet
            </Button>
            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
            <Button variant="ghost" onClick={handleAdminLogout} className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              Çıkış Yap
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs text-slate-700 hover:bg-slate-100">
              Stüdyoya Dön
            </Button>
            <div className="h-4 w-[1px] bg-slate-200 mx-1" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                SP
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">Sadık Poyraz</div>
                <div className="text-[10px] text-slate-400 font-medium">Head of Product</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50/60">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ============================================================ */}
            {/* 📊 TAB 1: OVERVIEW & PRODUCT METRICS */}
            {/* ============================================================ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* 8 Ana KPI Kartı */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard 
                    title="Toplam Kullanıcı" 
                    value="14,820" 
                    trend="+18%" 
                    subtext="Son 30 günde" 
                    icon={Users} 
                  />
                  <StatCard 
                    title="Aktif Kullanıcı (24s / 7g)" 
                    value="2,450 / 8,120" 
                    trend="+24%" 
                    subtext="Haftalık bağlılık" 
                    icon={Activity} 
                  />
                  <StatCard 
                    title="Oluşturulan Video" 
                    value="38,940" 
                    trend="+32%" 
                    subtext="Toplam tamamlanan" 
                    icon={VideoIconFallback} 
                  />
                  <StatCard 
                    title="Ort. Render Süresi" 
                    value="18.4 sn" 
                    trend="-12%" 
                    subtext="GPU hızlandırmalı" 
                    icon={Clock} 
                  />
                  <StatCard 
                    title="En Çok Kullanılan Görsel" 
                    value="DREAM PERFORMER" 
                    subtext="%34.2 pazar payı" 
                    icon={Flame} 
                    color="text-blue-600"
                  />
                  <StatCard 
                    title="En Popüler Boyut" 
                    value="9:16 Reels (%62)" 
                    subtext="TikTok / Shorts odaklı" 
                    icon={Smartphone} 
                  />
                  <StatCard 
                    title="Günlük Gelir (MRR)" 
                    value="$1,420 / gün" 
                    trend="+15%" 
                    subtext="$42,600 aylık projeksiyon" 
                    icon={Award} 
                    color="text-emerald-600"
                  />
                  <StatCard 
                    title="Hata Oranı" 
                    value="%0.42" 
                    trend="-0.1%" 
                    subtext="Sentry sağlıklı eşik" 
                    icon={Shield} 
                    color="text-emerald-600"
                  />
                </div>

                {/* Grafikler Alanı */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Günlük Render Sayısı & Format Dağılımı */}
                  <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Günlük Render & Format Trendi</h3>
                        <p className="text-xs text-slate-500">MP4 (Sunucu) vs WebM (İstemci) üretimi</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Son 7 Gün</span>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={renderTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                          <Legend verticalAlign="top" height={36} iconType="circle" />
                          <Bar dataKey="webm" name="WebM (İstemci Kaydı)" fill="#0057FF" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="mp4" name="MP4 (Sunucu H.264)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Çözünürlük Dağılımı Pie */}
                  <Card className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-sm text-slate-900">Çözünürlük Payı</h3>
                      <p className="text-xs text-slate-500">Sosyal medya vs YouTube</p>
                    </div>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={resolutionPieData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={75} 
                            innerRadius={45} 
                            paddingAngle={4}
                          >
                            {resolutionPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-2">
                      {resolutionPieData.map(item => (
                        <div key={item.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">%{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Kullanıcı Büyümesi ve Conversion Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Kullanıcı Büyümesi Trendi */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Kullanıcı Büyümesi & Aktiflik</h3>
                        <p className="text-xs text-slate-500">Toplam kayıtlı ve günlük aktif müzik üreticileri</p>
                      </div>
                    </div>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowthData}>
                          <defs>
                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0057FF" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0057FF" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                          <Area type="monotone" dataKey="activeUsers" stroke="#0057FF" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrad)" name="Aktif Kullanıcı" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Ürün Dönüşüm Hunisi (Conversion Funnel) */}
                  <Card className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-sm text-slate-900">Stüdyo Dönüşüm Hunisi (Funnel)</h3>
                      <p className="text-xs text-slate-500">İlk sesten son videoya kadar terk oranları</p>
                    </div>
                    <div className="space-y-3">
                      {funnelData.map((step, idx) => {
                        const percent = Math.round((step.count / 5200) * 100);
                        return (
                          <div key={step.step} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-800">{step.step}</span>
                              <span className="text-slate-500">{step.count} ({percent}%) <span className="text-rose-500 text-[11px]">{step.dropoff}</span></span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all bg-gradient-to-r from-blue-600 to-indigo-600"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 👥 TAB 2: USER MANAGEMENT */}
            {/* ============================================================ */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                
                {/* Filtre ve Arama Çubuğu */}
                <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                    <div className="relative w-full">
                      <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <Input 
                        placeholder="İsim veya e-posta ile ara..." 
                        value={userSearch} 
                        onChange={(e: any) => setUserSearch(e.target.value)} 
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50 text-xs">
                      {(['ALL', 'FREE', 'CREATOR', 'PRO'] as const).map(plan => (
                        <button
                          key={plan}
                          onClick={() => setUserPlanFilter(plan)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${userPlanFilter === plan ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          {plan === 'ALL' ? 'Tüm Planlar' : plan}
                        </button>
                      ))}
                    </div>
                    <Button variant="primary" className="text-xs gap-1.5" onClick={() => alert('Yeni kullanıcı davet bağlantısı oluşturuldu.')}>
                      <Plus size={14} /> Kullanıcı Ekle
                    </Button>
                  </div>
                </Card>

                {/* Kullanıcılar Tablosu */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-4">Kullanıcı</th>
                          <th className="p-4">Plan</th>
                          <th className="p-4">Render Sayısı</th>
                          <th className="p-4">Son Giriş</th>
                          <th className="p-4">Ülke</th>
                          <th className="p-4">Disk Kullanımı</th>
                          <th className="p-4">Durum</th>
                          <th className="p-4 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={8} className="p-8 text-center text-slate-400">Kullanıcı bulunamadı.</td></tr>
                        ) : (
                          filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                                  <div>
                                    <div className="font-bold text-slate-900">{user.name}</div>
                                    <div className="text-slate-400 text-[11px]">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border ${
                                  user.plan === 'PRO' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  user.plan === 'CREATOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {user.plan}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-slate-800">{user.renderCount} video</td>
                              <td className="p-4 text-slate-500">{user.lastActive}</td>
                              <td className="p-4 text-slate-600">{user.country}</td>
                              <td className="p-4 font-mono text-slate-600">{user.storageUsedMb} MB</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                  {user.status === 'ACTIVE' ? 'Aktif' : 'Askıda'}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5">
                                <Button variant="outline" className="h-7 px-2.5 text-[11px]" onClick={() => setSelectedUser(user)}>
                                  Detay & Projeler
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Kullanıcı Detay Modalı */}
                {selectedUser && (
                  <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <img src={selectedUser.avatar} className="w-12 h-12 rounded-full border" />
                          <div>
                            <h3 className="font-bold text-base text-slate-900">{selectedUser.name}</h3>
                            <p className="text-xs text-slate-500">{selectedUser.email} • {selectedUser.country}</p>
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => setSelectedUser(null)}>Kapat</Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs text-slate-500 font-medium">Toplam Export</div>
                          <div className="text-xl font-bold text-slate-900">{selectedUser.totalExports}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs text-slate-500 font-medium">Ort. Render Süresi</div>
                          <div className="text-xl font-bold text-blue-600">{selectedUser.avgRenderTime}s</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs text-slate-500 font-medium">Hata Sayısı</div>
                          <div className="text-xl font-bold text-emerald-600">{selectedUser.totalErrors}</div>
                        </div>
                      </div>

                      {/* Son Projeler */}
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">Son Projeler & Render Geçmişi</h4>
                        <div className="space-y-2">
                          {selectedUser.recentProjects.map(p => (
                            <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900">{p.title}</div>
                                <div className="text-[11px] text-slate-500">Visualizer: {p.visualizer} • Süre: {p.duration}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-slate-700">{p.renderTime}</div>
                                <div className="text-[10px] text-slate-400">{p.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Plan Yönetimi Aksiyonları */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
                            setSelectedUser(null);
                          }}
                        >
                          {selectedUser.status === 'ACTIVE' ? 'Hesabı Askıya Al' : 'Hesabı Aktifleştir'}
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="primary"
                            onClick={() => {
                              const newPlan = selectedUser.plan === 'PRO' ? 'CREATOR' : 'PRO';
                              setUsers(users.map(u => u.id === selectedUser.id ? { ...u, plan: newPlan } : u));
                              setSelectedUser(null);
                            }}
                          >
                            Planı Değiştir ({selectedUser.plan === 'PRO' ? 'Creator Yap' : 'Pro Yap'})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* 🔬 TAB 3: VISUALIZER HEATMAP & RETENTION (ALTIN MADENİ) */}
            {/* ============================================================ */}
            {activeTab === 'visualizers' && (
              <div className="space-y-6">
                
                {/* Ürün Geliştirme Karar Panosu */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <Flame size={16} className="text-emerald-600" />
                      En Yüksek Dönüşüm Getirenler (Odaklan & Geliştir)
                    </div>
                    <p className="text-emerald-700">
                      <b>DREAM PERFORMER</b> (%81.9) ve <b>CIRCULAR AURA EQ</b> (%80.0) kullanıcıların açıp doğrudan video kaydı aldığı şampiyon modlar. Bu modlara yeni shader efektleri ekleyin.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-rose-800">
                      <AlertTriangle size={16} className="text-rose-600" />
                      Düşük Etkileşim & Yüksek Terk (Kaldır veya Yenile)
                    </div>
                    <p className="text-rose-700">
                      <b>CHAOS THEORY</b> (%14.0) ve <b>GLITCH DESTRUCTION</b> (%16.5) modlarına kullanıcılar 6-7 saniye bakıp terk ediyor. Varsayılan listeden gizlendi.
                    </p>
                  </div>
                </div>

                {/* Visualizer Heatmap Tablosu */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Visualizer Kullanım, Export ve Terk Analitiği</h3>
                      <p className="text-xs text-slate-500">Kullanıcıların hangi görselleştiricide ne kadar durduğu ve kaç kez render aldığı</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600">Toplam 12 Modül</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-4">Visualizer Adı</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Görüntülenme (Views)</th>
                          <th className="p-4">Export Sayısı</th>
                          <th className="p-4">Dönüşüm / Başarı</th>
                          <th className="p-4">Ort. İnceleme</th>
                          <th className="p-4">Terk Oranı (Bounce)</th>
                          <th className="p-4">Durum (Panel Kontrolü)</th>
                          <th className="p-4 text-right">Eylem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visualizerAnalytics.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                              {item.conversionRate > 70 ? <Flame size={14} className="text-orange-500" /> : <Layers size={14} className="text-slate-400" />}
                              {item.label}
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 border border-slate-200">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-slate-700">{item.views.toLocaleString()}</td>
                            <td className="p-4 font-bold text-slate-900">{item.exports.toLocaleString()}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${item.conversionRate > 70 ? 'bg-emerald-500' : item.conversionRate > 40 ? 'bg-blue-500' : 'bg-rose-500'}`}
                                    style={{ width: `${item.conversionRate}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-800">%{item.conversionRate}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 font-mono">{item.avgPreviewSeconds} sn</td>
                            <td className="p-4 font-mono text-slate-600">
                              <span className={item.bounceRate > 30 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                %{item.bounceRate}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                item.status === 'PRO' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                item.status === 'BETA' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Button 
                                variant="outline" 
                                className="h-7 px-2 text-[10px]"
                                onClick={() => toggleVisualizerStatus(item.id)}
                              >
                                Durumu Değiştir
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================ */}
            {/* ⚡ TAB 4: RENDER ANALYTICS & LOGS */}
            {/* ============================================================ */}
            {activeTab === 'render_logs' && (
              <div className="space-y-6">
                <Card className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Durum Filtresi:</span>
                    {(['ALL', 'SUCCESS', 'FAILED'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setLogFilterStatus(st)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${logFilterStatus === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {st === 'ALL' ? 'Tümü' : st === 'SUCCESS' ? 'Başarılı' : 'Hatalı / İptal'}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">Son 24 saatteki render kuyruğu</span>
                </Card>

                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-4">Render ID</th>
                          <th className="p-4">Kullanıcı</th>
                          <th className="p-4">Visualizer</th>
                          <th className="p-4">Süre</th>
                          <th className="p-4">FPS & RAM</th>
                          <th className="p-4">Çözünürlük</th>
                          <th className="p-4">Ortam / OS</th>
                          <th className="p-4">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredRenderLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-600">{log.id}</td>
                            <td className="p-4 font-medium text-slate-800">{log.userEmail}</td>
                            <td className="p-4 font-bold text-blue-600">{log.visualizer}</td>
                            <td className="p-4 font-mono text-slate-700">{log.durationSec}s</td>
                            <td className="p-4 font-mono text-slate-600">
                              <span className="text-emerald-600 font-bold">{log.fps} FPS</span> • {log.memoryMb} MB
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                                {log.resolution} ({log.quality})
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 text-[11px]">{log.browser} • {log.os}</td>
                            <td className="p-4">
                              {log.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                  <CheckCircle2 size={14} /> Başarılı
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                                    <XCircle size={14} /> Başarısız
                                  </span>
                                  {log.errorDetail && <div className="text-[10px] text-rose-500 font-mono">{log.errorDetail}</div>}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================ */}
            {/* 🧪 TAB 5: A/B TESTING */}
            {/* ============================================================ */}
            {activeTab === 'ab_testing' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">A/B Test ve Dönüşüm Optimizasyonu</h3>
                    <p className="text-xs text-slate-500">Stüdyodaki buton renkleri, varsayılan şablonlar ve metinlerin ihracat oranlarına etkisi</p>
                  </div>
                  <Button variant="primary" onClick={() => alert('Yeni A/B test deneyi sihirbazı başlatıldı.')}>
                    <Plus size={14} /> Yeni Test Oluştur
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {abTests.map(test => (
                    <Card key={test.id} className="p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{test.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${test.status === 'RUNNING' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                              {test.status === 'RUNNING' ? '🟢 Test Devam Ediyor' : '✅ Tamamlandı'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{test.description}</p>
                        </div>
                      </div>

                      {/* Varyant Karşılaştırma Kutuları */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {test.variants.map(v => {
                          const isWinner = test.winningVariantId === v.id;
                          return (
                            <div key={v.id} className={`p-4 rounded-xl border transition-all ${isWinner ? 'border-emerald-300 bg-emerald-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-xs text-slate-900">{v.name}</span>
                                {isWinner && <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Award size={12} /> Kazanan Varyant</span>}
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                <div className="p-2 bg-slate-50 rounded border text-xs">
                                  <div className="text-[10px] text-slate-400">Trafik Payı</div>
                                  <div className="font-bold text-slate-800">%{v.trafficSplit}</div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded border text-xs">
                                  <div className="text-[10px] text-slate-400">Ziyaretçi</div>
                                  <div className="font-bold text-slate-800">{v.visitors}</div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded border text-xs">
                                  <div className="text-[10px] text-slate-400">Dönüşüm</div>
                                  <div className="font-bold text-emerald-600">%{v.conversionRate}</div>
                                </div>
                              </div>

                              {test.status === 'RUNNING' && (
                                <Button 
                                  variant="outline" 
                                  className="w-full text-xs" 
                                  onClick={() => handleSelectWinningVariant(test.id, v.id)}
                                >
                                  Bu Varyantı Yayına Al (%100 Uygula)
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 💬 TAB 6: FEEDBACK & FEATURE REQUESTS */}
            {/* ============================================================ */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Kullanıcı Geri Bildirim & İstek Merkezi</h3>
                    <p className="text-xs text-slate-500">Müzik yapımcılarından gelen özellik talepleri, bug bildirimleri ve UI iyileştirmeleri</p>
                  </div>
                  <Button variant="primary" onClick={() => setNewFeedbackModal(true)}>
                    <Plus size={14} /> Yeni Bildirim Ekle
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbackList.map(item => (
                    <Card key={item.id} className="p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            item.category === 'BUG' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            item.category === 'FEATURE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            item.category === 'UI' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button 
                          onClick={() => handleUpvoteFeedback(item.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                        >
                          <TrendingUp size={13} className="text-blue-600" />
                          <span>{item.upvotes} Oy</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <select 
                            value={item.status}
                            onChange={(e: any) => {
                              setFeedbackList(feedbackList.map(f => f.id === item.id ? { ...f, status: e.target.value } : f));
                            }}
                            className="h-8 text-xs rounded border border-slate-200 bg-white px-2 font-semibold"
                          >
                            <option value="NEW">Yeni</option>
                            <option value="IN_REVIEW">İnceleniyor</option>
                            <option value="IN_PROGRESS">Geliştiriliyor</option>
                            <option value="COMPLETED">Tamamlandı</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Yeni Feedback Ekleme Modalı */}
                {newFeedbackModal && (
                  <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                      <div className="flex justify-between items-center border-b pb-3">
                        <h3 className="font-bold text-sm text-slate-900">Yeni Geri Bildirim Ekle</h3>
                        <Button variant="ghost" onClick={() => setNewFeedbackModal(false)}>İptal</Button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700">Başlık</label>
                          <Input 
                            value={newFeedbackForm.title} 
                            onChange={(e: any) => setNewFeedbackForm({ ...newFeedbackForm, title: e.target.value })} 
                            placeholder="Kısa ve net başlık..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">Kategori</label>
                          <select 
                            value={newFeedbackForm.category} 
                            onChange={(e: any) => setNewFeedbackForm({ ...newFeedbackForm, category: e.target.value })}
                            className="w-full h-9 rounded border border-slate-200 text-xs px-3 bg-white"
                          >
                            <option value="BUG">Bug (Hata)</option>
                            <option value="FEATURE">Feature (Özellik Talebi)</option>
                            <option value="UI">UI / UX Estetik</option>
                            <option value="PERFORMANCE">Performans / Render</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700">Açıklama</label>
                          <textarea 
                            value={newFeedbackForm.desc} 
                            onChange={e => setNewFeedbackForm({ ...newFeedbackForm, desc: e.target.value })} 
                            className="w-full h-24 rounded border border-slate-200 text-xs p-3"
                            placeholder="Detaylı kullanıcı talebi..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="primary" 
                          onClick={() => {
                            if (!newFeedbackForm.title) return;
                            const newFb: FeedbackItem = {
                              id: 'fb_' + Date.now(),
                              title: newFeedbackForm.title,
                              description: newFeedbackForm.desc,
                              userEmail: 'admin@glitchframer.studio',
                              category: newFeedbackForm.category,
                              upvotes: 1,
                              priority: newFeedbackForm.priority,
                              status: 'NEW',
                              createdAt: Date.now()
                            };
                            setFeedbackList([newFb, ...feedbackList]);
                            setNewFeedbackModal(false);
                            setNewFeedbackForm({ title: '', desc: '', category: 'FEATURE', priority: 'MEDIUM' });
                          }}
                        >
                          Kaydet ve Yayınla
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* ⚠️ TAB 7: ERROR TRACKING (SENTRY-LIKE) */}
            {/* ============================================================ */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sentry Benzeri Hata & Çökme İzleme</h3>
                    <p className="text-xs text-slate-500">WebGL context kayıpları, Web Audio senkron hataları ve FFmpeg render çökme logları</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {errorLogs.map(err => (
                    <Card key={err.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-200">
                              {err.type}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{err.message}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Etkilenen Kullanıcı: <b>{err.affectedUsers}</b> • Toplam Olay: <b>{err.occurrences}</b> • Son Görülme: {new Date(err.lastSeen).toLocaleTimeString()}
                          </p>
                        </div>

                        <Button 
                          variant={err.status === 'RESOLVED' ? 'outline' : 'destructive'} 
                          className="h-8 text-xs"
                          onClick={() => handleToggleErrorStatus(err.id)}
                        >
                          {err.status === 'RESOLVED' ? '✅ Çözüldü Olarak İşaretli' : 'Çözüldü Olarak İşaretle'}
                        </Button>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        {err.stacktrace}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* 🎵 TAB 8: SUNO AI & MASTERING ANALYTICS */}
            {/* ============================================================ */}
            {activeTab === 'suno_mastering' && (
              <div className="space-y-6">
                
                {/* Suno AI URL Çözümleme Oranları */}
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Suno AI Bağlantı Çözümleme Başarı Oranları</h3>
                    <p className="text-xs text-slate-500">Suno URL'lerinden metadata, kapak, şarkı sözü ve timestamp çıkarma performansı</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border text-center">
                      <div className="text-xs text-slate-500">Metadata Başarısı</div>
                      <div className="text-2xl font-bold text-emerald-600">%{sunoAnalytics.metadataSuccessRate}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border text-center">
                      <div className="text-xs text-slate-500">Lirik Çıkarma Başarısı</div>
                      <div className="text-2xl font-bold text-emerald-600">%{sunoAnalytics.lyricsSuccessRate}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border text-center">
                      <div className="text-xs text-slate-500">Word Timestamp Başarısı</div>
                      <div className="text-2xl font-bold text-blue-600">%{sunoAnalytics.timestampSuccessRate}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border text-center">
                      <div className="text-xs text-slate-500">Kapak Resmi Çekme</div>
                      <div className="text-2xl font-bold text-emerald-600">%{sunoAnalytics.coverArtSuccessRate}</div>
                    </div>
                  </div>
                </Card>

                {/* Mastering Modülü İstatistikleri */}
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">DSP Mastering Motoru Kullanımı</h3>
                    <p className="text-xs text-slate-500">Kullanıcıların en çok tercih ettiği mastering presetleri ve LUFS hedefleri</p>
                  </div>

                  <div className="space-y-3">
                    {masteringAnalytics.topPresets.map(p => (
                      <div key={p.preset} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800">{p.preset}</span>
                          <span className="text-slate-500">{p.count} parça (%{p.percentage})</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================ */}
            {/* 📁 TAB 9: FILE EXPLORER & BULK DELETION */}
            {/* ============================================================ */}
            {activeTab === 'files' && (
              <Card>
                <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={toggleSelectAll} className="gap-2 text-xs">
                      {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                      Tümünü Seç
                    </Button>
                    {selectedFiles.length > 0 && (
                      <Button variant="destructive" onClick={deleteSelectedFiles} className="gap-2 text-xs">
                        <Trash2 size={16} /> ({selectedFiles.length}) Seçileni Sil
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <Input 
                        placeholder="Dosya ara..." 
                        value={fileSearch} 
                        onChange={(e: any) => setFileSearch(e.target.value)} 
                        className="pl-9 text-xs w-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-xs text-left">
                    <thead className="border-b bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="h-10 px-4 w-[40px]"></th>
                        <th className="h-10 px-4">Dosya Adı</th>
                        <th className="h-10 px-4">Tür</th>
                        <th className="h-10 px-4">Boyut</th>
                        <th className="h-10 px-4">Yükleme Tarihi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFiles.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Dosya bulunamadı.</td></tr>
                      ) : (
                        filteredFiles.map(file => (
                          <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <button onClick={() => toggleFileSelection(file.id)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                                {selectedFiles.includes(file.id) ? <CheckSquare size={18} className="text-slate-900" /> : <Square size={18} />}
                              </button>
                            </td>
                            <td className="p-4 font-bold text-slate-900">{file.name}</td>
                            <td className="p-4">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 text-slate-600">
                                {file.type}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-600">{file.size}</td>
                            <td className="p-4 text-slate-500">{file.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ============================================================ */}
            {/* 📝 TAB 10: LANDING PAGE CMS */}
            {/* ============================================================ */}
            {activeTab === 'landing_cms' && (
              <div className="space-y-6 max-w-4xl">
                <Card className="p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Hero & Karşılama Bölümü</h3>
                    <p className="text-xs text-slate-500">Ana sayfa karşılama başlığı ve aksiyon butonu</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Hero Başlığı</label>
                      <Input 
                        value={landingCms.heroTitle} 
                        onChange={(e: any) => setLandingCms({ ...landingCms, heroTitle: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Alt Açıklama</label>
                      <Input 
                        value={landingCms.heroSubtitle} 
                        onChange={(e: any) => setLandingCms({ ...landingCms, heroSubtitle: e.target.value })} 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">CTA Buton Metni</label>
                      <Input 
                        value={landingCms.heroCtaText} 
                        onChange={(e: any) => setLandingCms({ ...landingCms, heroCtaText: e.target.value })} 
                      />
                    </div>
                  </div>
                </Card>

                {/* Fiyatlandırma Planları Düzenleme */}
                <Card className="p-6 space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Fiyatlandırma Planları</h3>
                    <p className="text-xs text-slate-500">Free, Creator ve Pro planlarının fiyat ve maddeleri</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {landingCms.pricingPlans.map((plan, idx) => (
                      <div key={plan.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="font-bold text-xs text-slate-900">{plan.name} Planı</div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Fiyat</label>
                          <Input 
                            value={plan.price} 
                            onChange={(e: any) => {
                              const newPlans = [...landingCms.pricingPlans];
                              newPlans[idx] = { ...plan, price: e.target.value };
                              setLandingCms({ ...landingCms, pricingPlans: newPlans });
                            }} 
                            className="font-bold text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================ */}
            {/* 🎨 TAB 11: THEME & ACCENT PICKER */}
            {/* ============================================================ */}
            {activeTab === 'theme' && (
              <div className="max-w-3xl space-y-6">
                <Card className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Uygulama Vurgu Rengi (Accent Color)</h3>
                    <p className="text-xs text-slate-500">Stüdyo genelindeki tüm butonların, aktif sekmelerin ve parlama efektlerinin ana rengi</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={modules.theme?.accent || '#0057FF'}
                      onChange={e => handleColorChange(e.target.value)}
                      className="w-14 h-14 rounded-xl cursor-pointer border border-slate-300 p-1"
                    />
                    <div>
                      <label className="text-xs font-bold text-slate-700">HEX Kodu</label>
                      <Input 
                        value={modules.theme?.accent || '#0057FF'}
                        onChange={(e: any) => handleColorChange(e.target.value)}
                        className="w-36 font-mono uppercase text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Hazır Paletler */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Popüler Tasarım Paletleri</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Elektrik Mavi (Varsayılan)', color: '#0057FF' },
                        { name: 'Cyber Neon Altın', color: '#FFD700' },
                        { name: 'Siberpunk Fuşya', color: '#FF0055' },
                        { name: 'Matrix Neon Yeşil', color: '#00FF66' },
                        { name: 'Kuantum Mor', color: '#8A2BE2' },
                        { name: 'Deep Space Cyan', color: '#00E5FF' },
                      ].map(p => (
                        <button
                          key={p.color}
                          onClick={() => handleColorChange(p.color)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer shadow-sm"
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canlı Önizleme Kutusu */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Canlı Arayüz Önizlemesi</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded text-white shadow"
                        style={{ backgroundColor: modules.theme?.accent || '#0057FF' }}
                      >
                        DIŞA AKTAR
                      </button>
                      <div 
                        className="px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2"
                        style={{ borderColor: modules.theme?.accent || '#0057FF', color: modules.theme?.accent || '#0057FF' }}
                      >
                        GÖRSEL (AKTİF SEKME)
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================ */}
            {/* 🧭 TAB 12: NAVIGATION MANAGER */}
            {/* ============================================================ */}
            {activeTab === 'navigation' && (
              <Card>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900">Stüdyo Sekme / Menü Yönetimi</h3>
                  <p className="text-xs text-slate-500">Stüdyo modundaki alt gezinme sekmelerini yeniden adlandırın veya gizleyin</p>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Sıra</th>
                      <th className="p-4">Sistem ID</th>
                      <th className="p-4">Görünen Ad (Etiket)</th>
                      <th className="p-4 text-right">Durum (Açık / Kapalı)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(modules.tabs || INITIAL_TABS).map((tab, idx) => (
                      <tr key={tab.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-400 font-mono font-bold">{idx + 1}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{tab.id}</td>
                        <td className="p-4">
                          <Input 
                            value={tab.label}
                            onChange={(e: any) => {
                              const newTabs = [...(modules.tabs || INITIAL_TABS)];
                              newTabs[idx] = { ...tab, label: e.target.value };
                              setModules({ ...modules, tabs: newTabs });
                            }}
                            className="w-56 uppercase text-xs font-bold"
                          />
                        </td>
                        <td className="p-4 text-right">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={tab.enabled}
                              onChange={() => {
                                const newTabs = [...(modules.tabs || INITIAL_TABS)];
                                newTabs[idx] = { ...tab, enabled: !tab.enabled };
                                setModules({ ...modules, tabs: newTabs });
                              }}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}

            {/* ============================================================ */}
            {/* ⚙️ TAB 13: MODULES */}
            {/* ============================================================ */}
            {activeTab === 'modules' && (
              <Card>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900">Sistem Modülleri</h3>
                  <p className="text-xs text-slate-500">Stüdyonun ana modüllerini merkezi olarak devre dışı bırakın veya açın</p>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'enableSocial', title: 'Sosyal Medya Çıktıları', desc: 'TikTok/Reels dikey format desteği.' },
                    { key: 'enableEffects', title: 'Post-Processing Efektleri', desc: 'Bloom, CRT, Glitch gibi VFX efektleri.' },
                    { key: 'enableLyrics', title: 'Şarkı Sözü Motoru', desc: 'Senkronize lirik sistemi.' },
                    { key: 'enablePresets', title: 'Kullanıcı Profilleri', desc: 'Görselleştirici ayarlarını kaydetme desteği.' },
                  ].map((mod) => {
                    const isEnabled = modules[mod.key as keyof StudioModulesConfig];
                    return (
                      <div key={mod.key} className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-slate-900">{mod.title}</label>
                          <p className="text-xs text-slate-500">{mod.desc}</p>
                        </div>
                        <button 
                          onClick={() => setModules({...modules, [mod.key]: !isEnabled})}
                          className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${isEnabled ? 'bg-slate-900' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* ============================================================ */}
            {/* 📄 TAB 14: PAGES */}
            {/* ============================================================ */}
            {activeTab === 'pages' && (
              <div>
                {!editingPage ? (
                  <Card>
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-sm text-slate-900">Özel Statik Sayfalar</h3>
                      <Button onClick={() => setEditingPage({ id: Date.now().toString(), title: '', slug: '', content: '', createdAt: Date.now() })} className="gap-1.5 text-xs">
                        <Plus size={14} /> Yeni Sayfa
                      </Button>
                    </div>
                    <div className="w-full overflow-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="border-b bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                          <tr>
                            <th className="p-4">Başlık</th>
                            <th className="p-4">URL</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pages.map(page => (
                            <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-bold text-slate-900">{page.title}</td>
                              <td className="p-4 text-slate-500">/{page.slug}</td>
                              <td className="p-4">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">Yayında</span>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <Button variant="outline" className="h-7 px-2.5 text-[11px]" onClick={() => setEditingPage(page)}>Düzenle</Button>
                                <Button variant="destructive" className="h-7 px-2.5 text-[11px]" onClick={() => setPages(pages.filter(p => p.id !== page.id))}>Sil</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="font-bold text-sm text-slate-900">{editingPage.title ? 'Sayfayı Düzenle' : 'Yeni Sayfa'}</h3>
                      <Button variant="ghost" onClick={() => setEditingPage(null)}>İptal</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Başlık</label>
                        <Input value={editingPage.title} onChange={(e: any) => setEditingPage({ ...editingPage, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">URL Slug</label>
                        <Input value={editingPage.slug} onChange={(e: any) => setEditingPage({ ...editingPage, slug: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">İçerik</label>
                      <textarea 
                        value={editingPage.content} 
                        onChange={e => setEditingPage({ ...editingPage, content: e.target.value })} 
                        className="w-full h-40 border rounded p-3 text-xs font-mono"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button variant="primary" onClick={() => {
                        if (pages.find(p => p.id === editingPage.id)) {
                          setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
                        } else {
                          setPages([...pages, editingPage]);
                        }
                        setEditingPage(null);
                      }}>
                        Kaydet
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

function VideoIconFallback(props: any) {
  return (
    <svg {...props} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z"/>
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
    </svg>
  );
}
