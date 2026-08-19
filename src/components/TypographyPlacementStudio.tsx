import React, { useState } from 'react';
import { 
  Type, Move, Sparkles, AlignLeft, AlignCenter, AlignRight, 
  RotateCcw, Sliders, Layers, Eye, EyeOff, Link, Unlink, 
  Check, Palette, Compass, ArrowUp, Smartphone, Focus
} from 'lucide-react';
import { VisualizerSettings } from '../types';
import { 
  AVAILABLE_FONTS, 
  TEXT_PLACEMENT_PRESETS, 
  TEXT_BADGE_STYLES, 
  FontOption 
} from '../lib/visualizerCatalog';
import { cn } from '../lib/utils';

interface TypographyPlacementStudioProps {
  settings: VisualizerSettings;
  onUpdateSettings: (newSettings: Partial<VisualizerSettings>) => void;
}

const QUICK_COLORS = [
  '#FFFFFF', '#FFD700', '#0057FF', '#FF0055', '#00FF88', 
  '#A855F7', '#FF6600', '#00F0FF', '#E2E8F0', '#0A0A0E'
];

export const TypographyPlacementStudio: React.FC<TypographyPlacementStudioProps> = ({
  settings,
  onUpdateSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PLACEMENT' | 'TYPOGRAPHY' | 'COLOR_FX'>('PLACEMENT');

  const titleX = settings.titleX ?? 50;
  const titleY = settings.titleY ?? 78;
  const isIndependent = settings.titlePositionMode === 'independent';
  const artistX = isIndependent ? (settings.artistX ?? 50) : titleX;
  const artistY = isIndependent ? (settings.artistY ?? 84) : (titleY + 5.5);

  const currentFontId = settings.titleFontFamily || 'Space Grotesk';
  const currentBadge = settings.titleBadgeStyle || 'NONE';

  const applyPreset = (preset: typeof TEXT_PLACEMENT_PRESETS[0]) => {
    onUpdateSettings({
      titleX: preset.titleX,
      titleY: preset.titleY,
      artistX: preset.artistX,
      artistY: preset.artistY,
      titleAlign: preset.align,
      artistAlign: preset.align
    });
  };

  const resetPlacement = () => {
    onUpdateSettings({
      titleX: 50,
      titleY: 78,
      artistX: 50,
      artistY: 84,
      titleFontSize: 48,
      artistFontSize: 26,
      titleAlign: 'center',
      artistAlign: 'center',
      titleFontFamily: 'Space Grotesk',
      artistFontFamily: 'Space Grotesk',
      titleColor: '#FFFFFF',
      artistColor: settings.primaryColor || '#FFD700',
      titleGlow: 0.4,
      artistGlow: 0.0,
      titleBadgeStyle: 'NONE',
      titlePositionMode: 'unified'
    });
  };

  return (
    <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-4">
      {/* BAŞLIK & SUB-TABS */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-accent/15 border border-accent/30 rounded text-accent">
            <Type size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-content-primary font-sans uppercase tracking-wider">
              Şarkı & Sanatçı Tipografi & Serbest Yerleşim
            </h3>
            <p className="text-[9px] text-content-tertiary font-sans">
              Player üzerinde serbest sürükleyin veya buradan ince ayarlarını yapın
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetPlacement}
          title="Tüm yerleşim ve tipografi ayarlarını varsayılana döndür"
          className="flex items-center gap-1 text-[9px] text-content-tertiary hover:text-content-primary px-2 py-1 bg-surface border border-border-subtle rounded cursor-pointer transition-colors"
        >
          <RotateCcw size={10} />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* GÖRÜNÜRLÜK & BAĞLANTI BUTONLARI */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onUpdateSettings({ showTrackTitle: settings.showTrackTitle === false ? true : false })}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer",
            settings.showTrackTitle !== false
              ? "bg-accent/20 border-accent text-accent"
              : "bg-surface border-border-subtle text-content-tertiary opacity-70"
          )}
        >
          {settings.showTrackTitle !== false ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>Şarkı Adı</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ showArtistName: settings.showArtistName === false ? true : false })}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer",
            settings.showArtistName !== false
              ? "bg-accent/20 border-accent text-accent"
              : "bg-surface border-border-subtle text-content-tertiary opacity-70"
          )}
        >
          {settings.showArtistName !== false ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>Sanatçı Adı</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateSettings({ 
            titlePositionMode: isIndependent ? 'unified' : 'independent',
            artistX: isIndependent ? titleX : (settings.artistX ?? titleX),
            artistY: isIndependent ? (titleY + 5.5) : (settings.artistY ?? (titleY + 5.5))
          })}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer",
            !isIndependent
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
          )}
          title={!isIndependent ? "Başlık ve sanatçı birlikte taşınır" : "Başlık ve sanatçı bağımsız konumlandırılır"}
        >
          {!isIndependent ? <Link size={12} /> : <Unlink size={12} />}
          <span>{!isIndependent ? "Birlikte Taşı" : "Bağımsız"}</span>
        </button>
      </div>

      {/* SUB-TAB NAVIGATOR */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded border border-border-subtle">
        {[
          { id: 'PLACEMENT', label: '📍 YERLEŞİM & KONUM', icon: Move },
          { id: 'TYPOGRAPHY', label: '🔤 FONT & BOYUT', icon: Type },
          { id: 'COLOR_FX', label: '✨ RENK & EFEKT', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeSubTab === tab.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-content-secondary hover:text-content-primary hover:bg-hover"
              )}
            >
              <Icon size={11} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. SEKME: YERLEŞİM & KOORDİNATLAR */}
      {activeSubTab === 'PLACEMENT' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Hızlı Konum Şablonları */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1">
                <Compass size={11} className="text-accent" />
                HIZLI YERLEŞİM ÖN AYARLARI
              </label>
              <span className="text-[8.5px] text-content-tertiary">Tek tıkla konumlandır</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TEXT_PLACEMENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "p-2 text-left bg-surface hover:bg-hover border rounded transition-all cursor-pointer flex flex-col gap-1",
                    Math.abs(titleX - preset.titleX) < 2 && Math.abs(titleY - preset.titleY) < 3
                      ? "border-accent bg-accent/10"
                      : "border-border-subtle"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-content-primary">{preset.name}</span>
                    {Math.abs(titleX - preset.titleX) < 2 && Math.abs(titleY - preset.titleY) < 3 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    )}
                  </div>
                  <span className="text-[8px] text-content-tertiary line-clamp-1">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Şarkı Adı Koordinatları */}
          <div className="p-3 bg-surface border border-border-subtle rounded space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-content-primary uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Şarkı Adı Konumu
              </span>
              <div className="flex items-center gap-2 text-[9px] font-mono text-accent">
                <span>X: %{titleX.toFixed(1)}</span>
                <span>Y: %{titleY.toFixed(1)}</span>
              </div>
            </div>

            {/* X Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8.5px] text-content-secondary">
                <span>Yatay Konum (X Axis)</span>
                <button 
                  type="button" 
                  onClick={() => onUpdateSettings({ titleX: 50 })}
                  className="text-accent hover:underline cursor-pointer"
                >
                  Merkeze Al (%50)
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={titleX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ 
                    titleX: val,
                    ...(!isIndependent ? { artistX: val } : {})
                  });
                }}
                className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Y Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8.5px] text-content-secondary">
                <span>Dikey Konum (Y Axis)</span>
                <span className="text-content-tertiary">Üst (%0) ➔ Alt (%100)</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="0.5"
                value={titleY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ 
                    titleY: val,
                    ...(!isIndependent ? { artistY: Math.min(96, val + 5.5) } : {})
                  });
                }}
                className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-accent"
              />
            </div>
          </div>

          {/* Sanatçı Adı Koordinatları (Bağımsız Mod Aktifse) */}
          {isIndependent && (
            <div className="p-3 bg-surface border border-amber-500/30 rounded space-y-2.5 animate-in fade-in-50">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Sanatçı Adı Bağımsız Konumu
                </span>
                <div className="flex items-center gap-2 text-[9px] font-mono text-amber-400">
                  <span>X: %{artistX.toFixed(1)}</span>
                  <span>Y: %{artistY.toFixed(1)}</span>
                </div>
              </div>

              {/* Artist X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] text-content-secondary">
                  <span>Sanatçı Yatay (X)</span>
                  <button 
                    type="button" 
                    onClick={() => onUpdateSettings({ artistX: 50 })}
                    className="text-amber-400 hover:underline cursor-pointer"
                  >
                    Merkeze Al (%50)
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={artistX}
                  onChange={(e) => onUpdateSettings({ artistX: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Artist Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] text-content-secondary">
                  <span>Sanatçı Dikey (Y)</span>
                  <span className="text-content-tertiary">%0 - %100</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="0.5"
                  value={artistY}
                  onChange={(e) => onUpdateSettings({ artistY: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SEKME: FONT & BOYUT AYARLARI */}
      {activeSubTab === 'TYPOGRAPHY' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Font Ailesi Seçici */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1">
              <Type size={11} className="text-accent" />
              FONT AİLESİ SEÇİMİ (14 SEÇKİN GOOGLE FONT)
            </label>

            <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {AVAILABLE_FONTS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onUpdateSettings({ 
                    titleFontFamily: font.id,
                    artistFontFamily: font.id
                  })}
                  className={cn(
                    "p-2 text-left rounded border transition-all cursor-pointer flex flex-col justify-between",
                    currentFontId === font.id
                      ? "bg-accent/15 border-accent text-accent-foreground"
                      : "bg-surface border-border-subtle hover:border-border-strong text-content-secondary"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9.5px] font-bold truncate">{font.name}</span>
                    {currentFontId === font.id && <Check size={12} className="text-accent shrink-0" />}
                  </div>
                  <div 
                    className="text-xs text-content-primary truncate"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    CYBER BEAT 2026
                  </div>
                  <span className="text-[7.5px] text-content-tertiary mt-1">{font.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Boyutları */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-surface border border-border-subtle rounded">
            {/* Şarkı Başlığı Boyutu */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[8.5px] font-bold text-content-secondary">
                <span>Şarkı Font Boyutu</span>
                <span className="text-accent font-mono">{settings.titleFontSize ?? 48}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="100"
                step="2"
                value={settings.titleFontSize ?? 48}
                onChange={(e) => onUpdateSettings({ titleFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-accent"
              />
              <div className="flex gap-1">
                {[32, 48, 64, 80].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateSettings({ titleFontSize: sz })}
                    className={cn(
                      "flex-1 py-0.5 text-[8px] font-mono border rounded transition-colors cursor-pointer",
                      (settings.titleFontSize ?? 48) === sz
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-panel text-content-tertiary border-border-subtle"
                    )}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>

            {/* Sanatçı Font Boyutu */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[8.5px] font-bold text-content-secondary">
                <span>Sanatçı Font Boyutu</span>
                <span className="text-accent font-mono">{settings.artistFontSize ?? 26}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="1"
                value={settings.artistFontSize ?? 26}
                onChange={(e) => onUpdateSettings({ artistFontSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-accent"
              />
              <div className="flex gap-1">
                {[18, 24, 30, 36].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateSettings({ artistFontSize: sz })}
                    className={cn(
                      "flex-1 py-0.5 text-[8px] font-mono border rounded transition-colors cursor-pointer",
                      (settings.artistFontSize ?? 26) === sz
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-panel text-content-tertiary border-border-subtle"
                    )}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hizalama, Kalınlık & Harf Stili */}
          <div className="grid grid-cols-3 gap-2">
            {/* Hizalama */}
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-content-tertiary uppercase block">Hizalama</span>
              <div className="flex border border-border-subtle rounded overflow-hidden">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'right', icon: AlignRight }
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdateSettings({ 
                      titleAlign: id as any,
                      artistAlign: id as any
                    })}
                    className={cn(
                      "flex-1 py-1.5 flex items-center justify-center transition-colors cursor-pointer",
                      (settings.titleAlign || 'center') === id
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface text-content-secondary hover:bg-hover"
                    )}
                  >
                    <Icon size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Harf Durumu */}
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-content-tertiary uppercase block">Harf Durumu</span>
              <div className="flex border border-border-subtle rounded overflow-hidden">
                {[
                  { id: 'uppercase', label: 'AA' },
                  { id: 'normal', label: 'Aa' },
                  { id: 'lowercase', label: 'aa' }
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdateSettings({ 
                      titleCase: id as any,
                      artistCase: id as any
                    })}
                    className={cn(
                      "flex-1 py-1.5 text-[9px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer",
                      (settings.titleCase || 'uppercase') === id
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface text-content-secondary hover:bg-hover"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kalınlık / İtalik */}
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-content-tertiary uppercase block">Ağırlık & Stil</span>
              <div className="flex border border-border-subtle rounded overflow-hidden">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ 
                    titleFontWeight: (settings.titleFontWeight === '900' ? 'bold' : settings.titleFontWeight === 'bold' ? 'normal' : '900')
                  })}
                  className={cn(
                    "flex-1 py-1.5 text-[9px] font-sans font-bold flex items-center justify-center transition-colors cursor-pointer",
                    (settings.titleFontWeight || '900') === '900' ? "bg-accent text-accent-foreground" : "bg-surface text-content-secondary"
                  )}
                >
                  {(settings.titleFontWeight || '900') === '900' ? '900 (Black)' : (settings.titleFontWeight === 'bold' ? '700 (Bold)' : '400')}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ titleItalic: !settings.titleItalic, artistItalic: !settings.titleItalic })}
                  className={cn(
                    "px-2 py-1.5 text-[9px] italic font-serif flex items-center justify-center transition-colors cursor-pointer border-l border-border-subtle",
                    settings.titleItalic ? "bg-accent text-accent-foreground" : "bg-surface text-content-secondary"
                  )}
                >
                  I
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEKME: RENK, IŞIMA & EFEKTLER */}
      {activeSubTab === 'COLOR_FX' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Renk Seçimi */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-surface border border-border-subtle rounded">
            {/* Şarkı Başlığı Rengi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-content-secondary uppercase">Başlık Rengi</span>
                <span className="text-[8.5px] font-mono text-content-primary">{settings.titleColor || '#FFFFFF'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={settings.titleColor || '#FFFFFF'}
                  onChange={(e) => onUpdateSettings({ titleColor: e.target.value })}
                  className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {QUICK_COLORS.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onUpdateSettings({ titleColor: color })}
                      style={{ backgroundColor: color }}
                      className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Sanatçı Yazı Rengi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-content-secondary uppercase">Sanatçı Rengi</span>
                <span className="text-[8.5px] font-mono text-content-primary">{settings.artistColor || settings.primaryColor || '#FFD700'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={settings.artistColor || settings.primaryColor || '#FFD700'}
                  onChange={(e) => onUpdateSettings({ artistColor: e.target.value })}
                  className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer shrink-0"
                />
                <div className="flex flex-wrap gap-1">
                  {QUICK_COLORS.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onUpdateSettings({ artistColor: color })}
                      style={{ backgroundColor: color }}
                      className="w-4 h-4 rounded-full border border-black/40 cursor-pointer transition-transform hover:scale-110"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Neon Parlama & Audio Reactive Pulse */}
          <div className="p-3 bg-surface border border-border-subtle rounded space-y-3">
            {/* Neon Parlama */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[8.5px] font-bold text-content-secondary">
                <span>Neon Işıma / Glow Şiddeti</span>
                <span className="text-accent font-mono">{Math.round((settings.titleGlow ?? 0.4) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.titleGlow ?? 0.4}
                onChange={(e) => onUpdateSettings({ 
                  titleGlow: parseFloat(e.target.value),
                  artistGlow: parseFloat(e.target.value) * 0.5
                })}
                className="w-full h-1.5 bg-panel rounded appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Audio Reactive Pulse */}
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
              <div>
                <span className="text-[9px] font-bold text-content-primary block">Ritme Duyarlı Titreşim (Audio Beat Pulse)</span>
                <span className="text-[8px] text-content-tertiary">Bas vuruşlarında yazı dinamik olarak genişler</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ 
                  titleReactive: settings.titleReactive === false ? true : false,
                  artistReactive: settings.artistReactive === false ? true : false
                })}
                className={cn(
                  "px-3 py-1 text-[8.5px] font-bold rounded border uppercase tracking-wider transition-colors cursor-pointer",
                  settings.titleReactive !== false
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-panel text-content-tertiary border-border-subtle"
                )}
              >
                {settings.titleReactive !== false ? 'AKTİF' : 'KAPALI'}
              </button>
            </div>
          </div>

          {/* Metin Rozeti / Kutu Stili */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} className="text-accent" />
              METİN ARKA PLAN ROZETİ (BACKDROP BADGE)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TEXT_BADGE_STYLES.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => onUpdateSettings({ titleBadgeStyle: badge.id as any })}
                  className={cn(
                    "p-2 text-left border rounded transition-all cursor-pointer flex flex-col justify-between",
                    currentBadge === badge.id
                      ? "bg-accent/15 border-accent text-accent-foreground"
                      : "bg-surface border-border-subtle hover:border-border-strong text-content-secondary"
                  )}
                >
                  <span className="text-[9px] font-bold truncate">{badge.label}</span>
                  <span className="text-[7.5px] text-content-tertiary mt-0.5 line-clamp-1">{badge.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
