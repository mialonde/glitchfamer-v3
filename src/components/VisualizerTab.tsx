import React, { useState } from "react";
import { Sparkles, Search, User, Box, Upload } from "lucide-react";
import { VisualizerSettings, VisualizerMode } from "../types";
import { useCMS } from "../context/CMSContext";
import { 
  VISUALIZER_MODES, 
  VRM_AVATAR_MODELS, 
  COLOR_PALETTES, 
  getVisualizerSupportedFeatures 
} from "../lib/visualizerCatalog";
import { cn } from "../lib/utils";

interface VisualizerTabProps {
  settings: VisualizerSettings;
  onUpdateSettings: (newSettings: Partial<VisualizerSettings>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'VRM') => void;
}

export const VisualizerTab: React.FC<VisualizerTabProps> = ({
  settings,
  onUpdateSettings,
  onFileUpload
}) => {
  const { activeVisualizerModes } = useCMS();
  const [visualizerSearch, setVisualizerSearch] = useState('');
  const [visualizerCategory, setVisualizerCategory] = useState<'ALL' | 'CINEMATIC' | 'LIQUID' | 'MINIMAL' | 'ORB' | 'CONCERT' | 'GEOMETRIC' | 'RHYTHM' | 'ARCHIVE'>('ALL');
  const [showAllModes, setShowAllModes] = useState(false);

  // Filtrelenmiş modlar (CMS aktiflik durumu ile senkron)
  const filteredVisualizers = (activeVisualizerModes || VISUALIZER_MODES).filter(m => {
    if (!showAllModes && !m.isCurated) return false;
    if (visualizerCategory !== 'ALL' && m.cat !== visualizerCategory) return false;
    if (visualizerSearch.trim()) {
      const q = visualizerSearch.toLowerCase();
      return m.label.toLowerCase().includes(q) || 
             m.desc.toLowerCase().includes(q) || 
             m.catLabel.toLowerCase().includes(q) ||
             m.id.toLowerCase().includes(q);
    }
    return true;
  });


  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      {/* Arama ve Kategori Filtreleme */}
      <div className="space-y-3 bg-white/[0.01] p-3 rounded-md border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent" />
            VİSUALİZER MOTORLARI ({showAllModes ? "38 MOD" : "31 PREMİUM SİSTEM"})
          </span>
          <span className="text-[9px] font-sans text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 font-bold">
            AKTİF: {settings.mode}
          </span>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input 
            type="text"
            placeholder="Mod ara (örn: simulation, tunnel, monolith, sacred, orb)..."
            value={visualizerSearch}
            onChange={(e) => setVisualizerSearch(e.target.value)}
            className="w-full bg-panel border border-border-subtle rounded-sm pl-8 pr-3 py-2 text-xs text-content-primary placeholder:text-content-tertiary font-sans outline-none focus:border-accent"
          />
        </div>

        {/* Kategori Filtre Hapları */}
        <div className="flex flex-wrap gap-1 pt-1">
          {[
            { id: 'ALL', label: 'TÜMÜ' },
            { id: 'CINEMATIC', label: 'CINEMATIC PORTRAIT' },
            { id: 'LIQUID', label: 'LIQUID PERFORMER' },
            { id: 'MINIMAL', label: 'MINIMAL RELEASE' },
            { id: 'ORB', label: 'CINEMATIC ORB' },
            { id: 'CONCERT', label: 'LIVE CONCERT' },
            { id: 'GEOMETRIC', label: 'GEOMETRIC / RING' },
            { id: 'RHYTHM', label: 'RHYTHM PLAY' },
            ...(showAllModes ? [{ id: 'ARCHIVE', label: 'KLASİK ARŞİV' }] : [])
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setVisualizerCategory(cat.id as any)}
              className={cn(
                "px-2 py-0.5 text-[8px] font-sans uppercase tracking-wider rounded border transition-all cursor-pointer",
                visualizerCategory === cat.id
                  ? "bg-accent/20 text-accent border-accent/60 font-bold shadow-[0_0_8px_rgba(255,215,0,0.1)]"
                  : "bg-panel text-content-tertiary border-border-strong hover:text-content-secondary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Curation Filter / Advanced Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className="text-[8px] font-sans text-content-tertiary uppercase">
            KÜRASYON: <b className={cn("font-bold", showAllModes ? "text-content-secondary" : "text-accent")}>{showAllModes ? "TÜM ARŞİV (38/38)" : "SADECE PREMIUM (31/38)"}</b>
          </span>
          <button
            type="button"
            onClick={() => {
              setShowAllModes(!showAllModes);
              setVisualizerCategory('ALL');
            }}
            className={cn(
              "px-2 py-0.5 rounded text-[8px] font-sans uppercase tracking-wider transition-all border cursor-pointer",
              showAllModes 
                ? "bg-amber-950/30 text-accent border-accent hover:bg-amber-950/50" 
                : "bg-white/[0.02] text-content-secondary border-border-subtle hover:text-content-primary hover:bg-white/[0.05]"
            )}
          >
            {showAllModes ? "⚡ PREMIUM SÜZGECE DÖN" : "⚡ KLASİK ARŞİVİ DE GÖSTER"}
          </button>
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
              onClick={() => onUpdateSettings({ mode: m.id })}
              className={cn(
                "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group",
                isSelected
                  ? "bg-accent text-black border-accent font-black shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                  : "bg-panel/50 text-content-secondary border-border-subtle hover:border-border-strong hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider truncate pr-1">
                  {m.label}
                </span>
                <span className={cn(
                  "text-[7px] font-sans px-1 py-0.2 rounded border",
                  isSelected ? "border-black/30 bg-panel/10 text-black font-bold" : "border-border-strong text-content-tertiary"
                )}>
                  {m.catLabel}
                </span>
              </div>
              <p className={cn(
                "text-[8px] font-sans mt-1 line-clamp-1",
                isSelected ? "text-zinc-900" : "text-content-tertiary"
              )}>
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* 3D VRM Modeli Özelleştirme */}
      {settings.mode === 'VRM_ANIME_HYBRID' && (
        <div className="space-y-4 pt-3 border-t border-white/10 bg-panel p-3.5 rounded-sm border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest flex items-center gap-1.5">
              <User size={13} className="text-accent" />
              3D VRM AVATAR MODELİ
            </span>
            <span className="text-[8.5px] font-sans text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent font-bold truncate max-w-[170px]">
              {settings.vrmModelName || (settings.vrmModelUrl?.includes('Nutachisan') ? 'Nutachisan.vrm' : 'AliciaSolid.vrm')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VRM_AVATAR_MODELS.map((model) => {
              const isCurrent = (settings.vrmModelUrl || '/models/AliciaSolid.vrm') === model.url;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onUpdateSettings({ vrmModelUrl: model.url, vrmModelName: model.name })}
                  className={cn(
                    "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group relative",
                    isCurrent
                      ? "bg-accent text-black border-accent font-black shadow-[0_0_12px_rgba(255,215,0,0.2)]"
                      : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong hover:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-bold uppercase truncate pr-1">
                      {model.name}
                    </span>
                    <span className={cn(
                      "text-[7px] font-sans px-1 py-0.2 rounded border",
                      isCurrent ? "border-black/30 bg-panel/10 text-black font-bold" : "border-border-strong text-content-tertiary"
                    )}>
                      {model.badge}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[8px] font-sans mt-1 line-clamp-1",
                    isCurrent ? "text-zinc-900" : "text-content-tertiary"
                  )}>
                    {model.desc}
                  </p>
                  <span className={cn(
                    "text-[7.5px] font-sans mt-2 flex items-center gap-1",
                    isCurrent ? "text-black font-bold" : "text-content-tertiary group-hover:text-content-secondary"
                  )}>
                    {isCurrent ? "✓ AKTİF MODEL" : "Modeli Seç →"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="border border-dashed border-border-strong hover:border-accent p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-colors bg-panel text-center group">
              <Upload size={13} className="text-content-tertiary group-hover:text-accent" />
              <span className="text-[8.5px] font-sans uppercase text-content-secondary group-hover:text-content-primary font-bold">
                + BİLGİSAYARINDAN .VRM DOSYASI YÜKLE
              </span>
              <input 
                type="file" 
                className="hidden" 
                accept=".vrm,application/octet-stream,model/gltf-binary" 
                onChange={(e) => onFileUpload(e, 'VRM')} 
              />
            </label>
            
            <div className="flex items-center gap-2 bg-panel border border-border-subtle p-1.5 rounded-sm">
              <Box size={12} className="text-content-tertiary shrink-0 ml-1" />
              <input
                type="text"
                placeholder="veya yol gir: /models/Nutachisan.vrm"
                value={settings.vrmModelUrl || ''}
                onChange={(e) => onUpdateSettings({ vrmModelUrl: e.target.value, vrmModelName: e.target.value.split('/').pop() || 'Custom Model' })}
                className="w-full bg-transparent text-[8.5px] font-sans text-content-secondary placeholder:text-content-tertiary outline-none"
              />
            </div>

            {settings.vrmModelUrl && settings.vrmModelUrl !== '/models/AliciaSolid.vrm' && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ vrmModelUrl: '/models/AliciaSolid.vrm', vrmModelName: 'AliciaSolid.vrm' })}
                className="w-full py-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-800/50 text-red-400 text-[8px] font-sans font-bold uppercase tracking-wider rounded transition-all cursor-pointer text-center"
              >
                🗑️ Modeli Sıfırla (AliciaSolid)
              </button>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border-subtle">
            <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
              AVATAR RENDER STİLİ
            </span>
            <div className="flex bg-panel p-1 border border-border-subtle rounded gap-1">
              <button
                type="button"
                onClick={() => onUpdateSettings({ avatarMode: 'anime' })}
                className={cn(
                  "flex-1 text-[9px] py-1.5 font-bold uppercase tracking-wider rounded cursor-pointer transition-colors",
                  settings.avatarMode === 'anime' ? "bg-accent text-black shadow-sm font-black" : "text-content-secondary hover:text-content-primary"
                )}
              >
                SOLID ANIME
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ avatarMode: 'hologram' })}
                className={cn(
                  "flex-1 text-[9px] py-1.5 font-bold uppercase tracking-wider rounded cursor-pointer transition-colors",
                  settings.avatarMode === 'hologram' ? "bg-accent text-black shadow-sm font-black" : "text-content-secondary hover:text-content-primary"
                )}
              >
                HOLOGRAM 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OBJ Face Mask Paneli */}
      {settings.mode === 'OBJ_FACE_MASK' && (
        <div className="space-y-4 pt-3 border-t border-white/10 bg-panel p-3.5 rounded-sm border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest flex items-center gap-1.5">
              <Box size={13} className="text-accent" />
              OBJ MASK ÖZEL EFEKT PANELİ
            </span>
            <span className="text-[8px] font-sans text-content-tertiary">
              DİNAMİK KONTROL
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
                ARKA PLAN RENGİ
              </span>
              <span className="text-[8px] font-sans text-content-tertiary">
                {settings.objFaceBgColor || '#0a0a0c'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.objFaceBgColor || '#0a0a0c'}
                onChange={(e) => onUpdateSettings({ objFaceBgColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/[0.1] bg-transparent cursor-pointer"
              />
              <div className="flex-1 grid grid-cols-5 gap-1">
                {['#000000', '#0a0a0c', '#111115', '#0f172a', '#1e1b4b'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onUpdateSettings({ objFaceBgColor: color })}
                    className={cn(
                      "h-6 rounded border text-[8px] font-sans",
                      (settings.objFaceBgColor || '#0a0a0c') === color ? "border-accent" : "border-border-subtle"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-panel/30 p-2 rounded border border-white/[0.04]">
            <div className="flex flex-col">
              <span className="text-[9px] font-sans font-bold text-content-secondary uppercase">SESE REAKTİF ARKA PLAN</span>
              <span className="text-[8px] font-sans text-content-tertiary">Bass vuruşlarında arka plan kararır</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ objFaceBgReactive: !settings.objFaceBgReactive })}
              className={cn(
                "px-2.5 py-1 text-[8px] font-sans rounded uppercase tracking-wider transition-all border cursor-pointer",
                settings.objFaceBgReactive
                  ? "bg-accent/20 text-accent border-accent/60 font-bold"
                  : "bg-panel text-content-tertiary border-border-strong hover:text-content-secondary"
              )}
            >
              {settings.objFaceBgReactive ? "AÇIK" : "KAPALI"}
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
                MASKE / OBJE RENGİ
              </span>
              <span className="text-[8px] font-sans text-content-tertiary">
                {settings.objFaceColor || '#4f86f7'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.objFaceColor || '#4f86f7'}
                disabled={(settings.objFaceColorMode || 'solid') === 'rainbow'}
                onChange={(e) => onUpdateSettings({ objFaceColor: e.target.value })}
                className="w-8 h-8 rounded border border-white/[0.1] bg-transparent cursor-pointer disabled:opacity-30"
              />
              <div className="flex-1 grid grid-cols-5 gap-1">
                {['#4f86f7', '#ff0055', '#39ff14', '#ffd700', '#bd00ff'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={(settings.objFaceColorMode || 'solid') === 'rainbow'}
                    onClick={() => onUpdateSettings({ objFaceColor: color })}
                    className={cn(
                      "h-6 rounded border text-[8px] font-sans disabled:opacity-30",
                      (settings.objFaceColor || '#4f86f7') === color ? "border-accent" : "border-border-subtle"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border-subtle">
            <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
              RENK GEÇİŞ EFEKTİ (ZAMANLAYICI)
            </span>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'solid', label: 'SABİT' },
                { id: 'rainbow', label: 'RAINBOW' },
                { id: 'pulse', label: 'NEFES' },
                { id: 'glow-fade', label: 'SOLMA' },
                { id: 'audio', label: 'SES' }
              ].map((modeItem) => (
                <button
                  key={modeItem.id}
                  type="button"
                  onClick={() => onUpdateSettings({ objFaceColorMode: modeItem.id as any })}
                  className={cn(
                    "py-1.5 px-0.5 text-center border rounded-sm text-[8px] font-sans uppercase tracking-wider transition-all cursor-pointer",
                    (settings.objFaceColorMode || 'solid') === modeItem.id
                      ? "bg-accent/20 text-accent border-accent font-bold"
                      : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
                  )}
                >
                  {modeItem.label}
                </button>
              ))}
            </div>
          </div>

          {(settings.objFaceColorMode || 'solid') !== 'solid' && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                <span>EFEKT HIZI / ZAMANLAYICI CARPANI:</span>
                <span className="text-accent font-bold">{Number(settings.objFaceCycleSpeed ?? 1.0).toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={settings.objFaceCycleSpeed ?? 1.0}
                onChange={(e) => onUpdateSettings({ objFaceCycleSpeed: parseFloat(e.target.value) })}
                className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* RENK PALETİ SEÇİCİ */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          RENK PALETİ & VURGU
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = settings.primaryColor === pal.p;
            return (
              <button
                key={pal.name}
                type="button"
                onClick={() => onUpdateSettings({ primaryColor: pal.p, secondaryColor: pal.s })}
                className={cn(
                  "p-2 text-left border rounded-sm transition-all flex flex-col gap-1.5 cursor-pointer",
                  isSelected
                    ? "border-accent bg-surface/90 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                    : "border-border-subtle bg-panel hover:border-border-strong"
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: pal.p }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-black" style={{ backgroundColor: pal.s }} />
                </div>
                <span className="text-[7.5px] font-sans font-bold uppercase text-content-secondary truncate">{pal.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ARKAPLAN ZEMİN SEÇİCİ */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
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
              onClick={() => onUpdateSettings({ bgMode: bg.id as any })}
              className={cn(
                "py-2 px-3 text-center border rounded-sm text-[9px] font-sans uppercase tracking-wider transition-all cursor-pointer",
                settings.bgMode === bg.id
                  ? "bg-accent/20 text-accent border-accent font-bold"
                  : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
              )}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* HAREKET & HASSASİYET MİKRO SLIDERLARI */}
      <div className="space-y-3 pt-2 border-t border-border-subtle bg-panel p-3 rounded-sm border">
        <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          PARAMETRE İNCE AYARLARI
        </span>

        {(() => {
          const feat = getVisualizerSupportedFeatures(settings.mode);
          const hasAny = Object.values(feat).some(Boolean);

          if (!hasAny) {
            return (
              <div className="text-[8.5px] font-sans text-content-tertiary py-2.5 text-center leading-relaxed">
                ⚠️ Bu klasik mod için parametre ayarı bulunmamaktadır.<br />
                Tüm parametreleri kontrol etmek için 3D veya yeni nesil modlardan birini seçin.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feat.speed && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>HIZ:</span>
                    <span className="text-accent font-bold">{Number(settings.visSpeed ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.2" max="2.5" step="0.1" 
                    value={settings.visSpeed ?? 1.0}
                    onChange={(e) => onUpdateSettings({ visSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.scale && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>ÖLÇEK:</span>
                    <span className="text-accent font-bold">{Number(settings.visScale ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="2.0" step="0.05" 
                    value={settings.visScale ?? 1.0}
                    onChange={(e) => onUpdateSettings({ visScale: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.density && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>YOĞUNLUK:</span>
                    <span className="text-accent font-bold">{Number(settings.visDensity ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.4" max="2.0" step="0.1" 
                    value={settings.visDensity ?? 1.0}
                    onChange={(e) => onUpdateSettings({ visDensity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.rotation && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>DÖNME HIZI:</span>
                    <span className="text-accent font-bold">{Number(settings.visRotation ?? 0.5).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="-2.0" max="2.0" step="0.1" 
                    value={settings.visRotation ?? 0.5}
                    onChange={(e) => onUpdateSettings({ visRotation: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.glow && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>PARLAMA / GLOW:</span>
                    <span className="text-accent font-bold">{Number(settings.visGlow ?? 0.5).toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" 
                    value={settings.visGlow ?? 0.5}
                    onChange={(e) => onUpdateSettings({ visGlow: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.beatSensitivity && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>BEAT HASSASİYETİ:</span>
                    <span className="text-accent font-bold">{Number(settings.visBeatSensitivity ?? 1.0).toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" min="0.4" max="2.5" step="0.1" 
                    value={settings.visBeatSensitivity ?? 1.0}
                    onChange={(e) => onUpdateSettings({ visBeatSensitivity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}

              {feat.colorShift && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-sans text-content-secondary">
                    <span>RENK GEÇİŞİ:</span>
                    <span className="text-accent font-bold">{Number(settings.visColorShift ?? 0.2).toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" min="0.0" max="1.0" step="0.05" 
                    value={settings.visColorShift ?? 0.2}
                    onChange={(e) => onUpdateSettings({ visColorShift: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
