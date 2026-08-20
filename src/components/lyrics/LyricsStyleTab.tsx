import React from 'react';
import { Layers, MoveVertical, MoveHorizontal, AlignLeft, AlignCenter, AlignRight, Zap, Sparkles } from 'lucide-react';
import { Card, Button, Slider, Input } from '../ui';
import { VisualizerSettings, LyricsStyle, LyricsPosition } from '../../types';
import { cn } from '../../lib/utils';

interface LyricsStyleTabProps {
  settings: VisualizerSettings;
  onChange: (updated: Partial<VisualizerSettings>) => void;
}

const FONT_OPTIONS = [
  { id: 'Space Grotesk', label: 'Space Grotesk (Brutalist)' },
  { id: 'Syne', label: 'Syne (Avant-Garde)' },
  { id: 'Outfit', label: 'Outfit (Modern Clean)' },
  { id: 'Inter', label: 'Inter (Precision)' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Cyber)' },
  { id: 'Cinzel', label: 'Cinzel (Cinematic Serif)' },
  { id: 'Montserrat', label: 'Montserrat (Bold Impact)' },
  { id: 'Bebas Neue', label: 'Bebas Neue (Condensed)' }
];

const PRESET_COLORS = [
  { name: 'GOLD', color: '#FFD700' },
  { name: 'CYAN', color: '#00F0FF' },
  { name: 'WHITE', color: '#FFFFFF' },
  { name: 'LIME', color: '#39FF14' },
  { name: 'CRIMSON', color: '#FF003C' },
  { name: 'PURPLE', color: '#BD00FF' },
  { name: 'AMBER', color: '#F59E0B' },
  { name: 'PINK', color: '#EC4899' }
];

export const LyricsStyleTab: React.FC<LyricsStyleTabProps> = ({
  settings,
  onChange,
}) => {
  const currentYPercent = settings.lyricsY !== undefined 
    ? settings.lyricsY 
    : (settings.lyricsPosition === 'TOP' ? 12 : settings.lyricsPosition === 'CENTER' ? 50 : 88);

  const currentXPercent = settings.lyricsX !== undefined ? settings.lyricsX : 50;

  return (
    <div className="space-y-4 bg-panel/70 p-4 border border-border-subtle rounded-lg">
      
      {/* 2.1 TİPOGRAFİK STİL SEÇİCİ (8 FARKLI MOD) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-content-primary flex items-center gap-1.5">
            <Layers size={13} className="text-accent" />
            <span>TİPOGRAFİ & ANİMASYON STİLİ:</span>
          </label>
          <span className="text-[9px] text-accent font-mono font-bold uppercase">
            {settings.lyricsStyle || 'BETTER_FLOW'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'BETTER_FLOW', label: 'BETTER FLOW ✦', desc: 'Apple Music kelime süpürme & derinlik bulanıklığı' },
            { id: 'APPLE_SCROLL', label: 'APPLE SCROLL', desc: '3-Satır dikey akıcı kaydırma' },
            { id: 'KARAOKE', label: 'KARAOKE BOUNCE', desc: 'Sürekli degrade parlayan akış' },
            { id: 'KINETIC', label: 'KINETIC PUNCH', desc: 'Vuruşlu brütalist büyüme' },
            { id: 'SUBTITLE', label: 'SUBTITLE BOX', desc: 'Buzlu cam sinematik altyazı' },
            { id: 'NEON_BOX', label: 'NEON BADGE', desc: 'Cyber neon çerçeve rozet' },
            { id: 'CYBER_GLITCH', label: 'CYBER GLITCH', desc: 'RGB 3D kromatik kayma' },
            { id: 'MINIMAL', label: 'MINIMAL SHADOW', desc: 'Sade ve net tipografi' }
          ].map((st) => {
            const isSelected = (settings.lyricsStyle || 'BETTER_FLOW') === st.id;
            return (
              <Card
                key={st.id}
                onClick={() => onChange({ lyricsStyle: st.id as LyricsStyle })}
                className={cn(
                  "p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between select-none",
                  isSelected
                    ? "bg-accent text-accent-foreground border-accent font-bold shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                    : "bg-surface text-content-primary border-border-subtle hover:border-border-strong hover:bg-surface/80"
                )}
              >
                <div className="text-[9px] font-black uppercase tracking-wider">{st.label}</div>
                <div className={cn(
                  "text-[8px] mt-1 font-sans",
                  isSelected ? "text-accent-foreground/80 font-medium" : "text-content-secondary"
                )}>
                  {st.desc}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2.2 DERİNLEMESİNE EKRAN KONUMLANDIRMA (%Y VE %X SERBEST SLIDER) */}
      <Card className="p-3.5 bg-surface border border-border-subtle rounded-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-content-primary flex items-center gap-1.5">
            <MoveVertical size={13} className="text-accent" />
            <span>EKRAN KONUMU & HASSAS DİKEY YÜKSEKLİK (%Y):</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-accent font-bold">Y: %{currentYPercent}</span>
            <span className="text-[10px] font-mono text-content-secondary">X: %{currentXPercent}</span>
          </div>
        </div>

        {/* Hızlı Önayarlar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { pos: 'TOP', y: 12, label: 'ÜST (%12)' },
            { pos: 'CUSTOM', y: 30, label: 'ORTA-ÜST (%30)' },
            { pos: 'CENTER', y: 50, label: 'TAM ORTA (%50)' },
            { pos: 'BOTTOM', y: 88, label: 'ALT (%88)' },
            { pos: 'CUSTOM', y: 93, label: 'EN ALT (%93)' }
          ].map((preset, idx) => (
            <Button
              key={idx}
              type="button"
              variant={currentYPercent === preset.y ? "accent" : "outline"}
              size="xs"
              onClick={() => onChange({ 
                lyricsPosition: preset.pos as LyricsPosition,
                lyricsY: preset.y
              })}
              className="py-2 text-[9px] font-bold uppercase"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Hassas Dikey Yükseklik (%Y) Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[9px]">
            <span className="text-content-secondary uppercase font-bold flex items-center gap-1">
              <MoveVertical size={11} className="text-accent" /> DİKEY YÜKSEKLİK (%5 = EN ÜST, %95 = EN ALT):
            </span>
            <span className="text-accent font-mono font-bold">%{currentYPercent}</span>
          </div>
          <Slider
            min={5}
            max={95}
            step={1}
            value={[currentYPercent]}
            onValueChange={([val]) => onChange({ 
              lyricsY: val,
              lyricsPosition: 'CUSTOM'
            })}
          />
        </div>

        {/* Yatay Konum (%X) ve Hizalama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* X Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-content-secondary uppercase font-bold flex items-center gap-1">
                <MoveHorizontal size={11} className="text-accent" /> YATAY KONUM (%X):
              </span>
              <span className="text-accent font-mono font-bold">%{currentXPercent}</span>
            </div>
            <Slider
              min={10}
              max={90}
              step={1}
              value={[currentXPercent]}
              onValueChange={([val]) => onChange({ lyricsX: val })}
            />
          </div>

          {/* Metin Hizalama (Sol, Orta, Sağ) */}
          <div className="space-y-1">
            <span className="text-[9px] text-content-secondary uppercase font-bold block">
              METİN HİZALAMA:
            </span>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'left', label: 'SOL', icon: AlignLeft },
                { id: 'center', label: 'ORTA', icon: AlignCenter },
                { id: 'right', label: 'SAĞ', icon: AlignRight }
              ].map((al) => {
                const AlIcon = al.icon;
                const isSelected = (settings.lyricsAlign || 'center') === al.id;
                return (
                  <Button
                    key={al.id}
                    type="button"
                    variant={isSelected ? "accent" : "outline"}
                    size="xs"
                    onClick={() => onChange({ lyricsAlign: al.id as any })}
                    className="gap-1 text-[9px] font-bold uppercase py-1.5"
                  >
                    <AlIcon size={12} />
                    <span>{al.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 2.3 TİPOGRAFİ, FONT, BOYUT VE IŞIMA PARAMETRELERİ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold uppercase text-content-secondary">
            FONT AİLESİ:
          </label>
          <select
            value={settings.lyricsFontFamily || 'Space Grotesk'}
            onChange={(e) => onChange({ lyricsFontFamily: e.target.value })}
            className="w-full bg-surface border border-border-subtle px-3 py-2 text-xs text-content-primary rounded-md outline-none focus:border-accent"
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.id} value={f.id} className="bg-panel text-content-primary">{f.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px]">
            <span className="text-content-secondary uppercase font-bold">YAZI BOYUTU:</span>
            <span className="text-accent font-mono font-bold">{settings.lyricsFontSize || 42}px</span>
          </div>
          <Slider
            min={20}
            max={84}
            step={2}
            value={[settings.lyricsFontSize || 42]}
            onValueChange={([val]) => onChange({ lyricsFontSize: val })}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px]">
            <span className="text-content-secondary uppercase font-bold">IŞIMA / GLOW:</span>
            <span className="text-accent font-mono font-bold">{settings.lyricsGlow ?? 20}px</span>
          </div>
          <Slider
            min={0}
            max={50}
            step={2}
            value={[settings.lyricsGlow ?? 20]}
            onValueChange={([val]) => onChange({ lyricsGlow: val })}
          />
        </div>
      </div>

      {/* 2.4 DİNAMİK VURUŞ TEPKİSİ VE APPLE SCROLL ÖZEL AYARLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Card className="p-3 bg-surface border border-border-subtle rounded-lg space-y-1.5">
          <div className="flex justify-between text-[9px]">
            <span className="text-content-secondary uppercase font-bold flex items-center gap-1">
              <Zap size={12} className="text-accent" /> RİTİM TEPKİSİ (KICK BOUNCE):
            </span>
            <span className="text-accent font-mono font-bold">{(settings.lyricsBeatScale ?? 1.0).toFixed(1)}x</span>
          </div>
          <Slider
            min={0}
            max={2.5}
            step={0.1}
            value={[settings.lyricsBeatScale ?? 1.0]}
            onValueChange={([val]) => onChange({ lyricsBeatScale: val })}
          />
        </Card>

        <Card className="p-3 bg-surface border border-border-subtle rounded-lg space-y-2">
          <span className="text-[9px] text-content-secondary uppercase font-bold block">
            APPLE SCROLL GÖRÜNÜR SATIR SAYISI:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { count: 1, label: '1 SATIR' },
              { count: 3, label: '3 SATIR' },
              { count: 5, label: '5 SATIR' }
            ].map((sc) => (
              <Button
                key={sc.count}
                type="button"
                variant={(settings.lyricsLineCount || 3) === sc.count ? "accent" : "outline"}
                size="xs"
                onClick={() => onChange({ lyricsLineCount: sc.count as any })}
                className="py-1.5 text-[9px] font-bold uppercase"
              >
                {sc.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* 2.5 BETTER LYRICS İLERİ SEVİYE GÖRSEL EFEKTLERİ */}
      <Card className="p-3.5 bg-surface/90 border border-border-subtle rounded-lg space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
          <Sparkles size={13} />
          <span>BETTER LYRICS GELİŞMİŞ AKIŞ AYARLARI:</span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {/* Vocal Gap Countdown Dots */}
          <button
            type="button"
            onClick={() => onChange({ lyricsShowVocalGapDots: !(settings.lyricsShowVocalGapDots !== false) })}
            className={cn(
              "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
              settings.lyricsShowVocalGapDots !== false
                ? "bg-accent/10 border-accent text-accent font-bold"
                : "bg-panel border-border-subtle text-content-secondary hover:border-border-strong"
            )}
          >
            <div>
              <div className="text-[9px] font-bold uppercase">••• Vokal Geri Sayım</div>
              <div className="text-[8px] text-content-tertiary">Enstrümantal nefes noktaları</div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full shrink-0 border",
              settings.lyricsShowVocalGapDots !== false ? "bg-accent border-accent" : "border-border-strong"
            )} />
          </button>

          {/* Long Note Sustained Glow */}
          <button
            type="button"
            onClick={() => onChange({ lyricsLongNoteGlow: !(settings.lyricsLongNoteGlow !== false) })}
            className={cn(
              "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
              settings.lyricsLongNoteGlow !== false
                ? "bg-accent/10 border-accent text-accent font-bold"
                : "bg-panel border-border-subtle text-content-secondary hover:border-border-strong"
            )}
          >
            <div>
              <div className="text-[9px] font-bold uppercase">✨ Uzun Hece Işıması</div>
              <div className="text-[8px] text-content-tertiary">0.75s+ tutulan notalarda aura</div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full shrink-0 border",
              settings.lyricsLongNoteGlow !== false ? "bg-accent border-accent" : "border-border-strong"
            )} />
          </button>

          {/* Inactive Line Blur */}
          <button
            type="button"
            onClick={() => onChange({ lyricsBlurInactive: !Boolean(settings.lyricsBlurInactive) })}
            className={cn(
              "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
              settings.lyricsBlurInactive
                ? "bg-accent/10 border-accent text-accent font-bold"
                : "bg-panel border-border-subtle text-content-secondary hover:border-border-strong"
            )}
          >
            <div>
              <div className="text-[9px] font-bold uppercase">🌫️ Derinlik Bulanıklığı</div>
              <div className="text-[8px] text-content-tertiary">Aktif olmayan satırları flulaştır</div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full shrink-0 border",
              settings.lyricsBlurInactive ? "bg-accent border-accent" : "border-border-strong"
            )} />
          </button>

          {/* Translation Display */}
          <button
            type="button"
            onClick={() => onChange({ lyricsTranslationEnabled: !Boolean(settings.lyricsTranslationEnabled) })}
            className={cn(
              "p-2.5 text-left border rounded-md transition-all cursor-pointer flex items-center justify-between",
              settings.lyricsTranslationEnabled
                ? "bg-accent/10 border-accent text-accent font-bold"
                : "bg-panel border-border-subtle text-content-secondary hover:border-border-strong"
            )}
          >
            <div>
              <div className="text-[9px] font-bold uppercase">🌐 Çeviri / Romanizasyon</div>
              <div className="text-[8px] text-content-tertiary">İkinci dil satırını göster</div>
            </div>
            <div className={cn(
              "w-3 h-3 rounded-full shrink-0 border",
              settings.lyricsTranslationEnabled ? "bg-accent border-accent" : "border-border-strong"
            )} />
          </button>
        </div>
      </Card>

      {/* 2.6 LİRİK VURGU RENGİ & ÖZEL HEX */}
      <div className="space-y-2 pt-1">
        <label className="text-[9px] font-bold uppercase text-content-secondary block">
          LİRİK VURGU RENGİ (AKTİF KELİME & IŞIMA):
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((c) => {
            const isSelected = (settings.lyricsColor || '#FFD700') === c.color;
            return (
              <Button
                key={c.name}
                type="button"
                variant={isSelected ? "accent" : "outline"}
                size="xs"
                onClick={() => onChange({ lyricsColor: c.color })}
                className="gap-1.5 py-1.5"
              >
                <span className="w-3 h-3 rounded-full shrink-0 border border-black/20" style={{ backgroundColor: c.color }} />
                <span className="text-[8.5px] font-bold">{c.name}</span>
              </Button>
            );
          })}

          <div className="flex items-center gap-1.5 pl-2 border-l border-border-subtle">
            <input
              type="color"
              value={settings.lyricsColor || '#FFD700'}
              onChange={(e) => onChange({ lyricsColor: e.target.value })}
              className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
            />
            <span className="text-[8.5px] font-mono text-content-tertiary uppercase">Özel</span>
          </div>
        </div>
      </div>

    </div>
  );
};
