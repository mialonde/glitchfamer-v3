import React, { useRef } from 'react';
import { 
  Music, Disc, Radio, Tv, Smartphone, Layers, 
  Sparkles, Image as ImageIcon, Video, Upload, Trash2, 
  Check, Sliders, Scissors, Clock, Flame, Sun, RotateCcw
} from 'lucide-react';
import { VisualizerSettings } from '../types';
import { Button, Badge, Card, Input, Slider } from './ui';
import { cn } from '../lib/utils';

interface SocialMediaStudioProps {
  settings: VisualizerSettings;
  coverUrl: string | null;
  onCoverChange: (url: string | null) => void;
  bgVideoUrl: string | null;
  onBgVideoChange: (url: string | null) => void;
  bgImageUrl: string | null;
  onBgImageChange: (url: string | null) => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPlayTrimStart?: () => void;
  onChange: (updated: Partial<VisualizerSettings>) => void;
}

const SOCIAL_CARD_TEMPLATES = [
  // 1. DÖRT YENİ ÖZGÜN TASARIM (İLHAM GÖRSELLERİNDEN ESİNLENEN ÖZGÜN ŞABLONLAR)
  {
    id: 'NEON_FRAME',
    title: 'SİBER IŞIMA KARTI',
    desc: 'Neon parlayan cam kenarlar, derin karanlık sahne ve altta zıplayan dikey VU equalizer barları.',
    badge: 'CYBER GLOW',
    recommendedRatio: '9/16',
    icon: Flame,
    color: '#00F0FF'
  },
  {
    id: 'POLAROID',
    title: 'VINTAGE POLAROID',
    desc: 'Sıcak günbatımı şeftali/krem tonları, retro polaroid çerçevesi, altta dairesel radar sunburst equalizer.',
    badge: 'RETRO 70s SUNSET',
    recommendedRatio: '9/16',
    icon: Sun,
    color: '#E8590C'
  },
  {
    id: 'NOIR_VINYL',
    title: 'NOIR DERİN VİNİL',
    desc: 'Merkezde dönen gerçekçi mat vinil plak, stardust parçacıkları ve altta akan çift katmanlı sinüs ribbon dalgası.',
    badge: 'LUXURY NOIR',
    recommendedRatio: '9/16',
    icon: Disc,
    color: '#E11D48'
  },
  {
    id: 'HOLO_CD',
    title: 'Y2K HOLOGRAFİK CD',
    desc: '3D açılı prizmatik gökkuşağı kompakt disk, 4-noktalı parıldayan yıldız ışıltıları ve neon ses şeridi.',
    badge: 'Y2K PRISM 3D',
    recommendedRatio: '9/16',
    icon: Sparkles,
    color: '#C084FC'
  },

  // 2. KLASİK VE STREAMING ŞABLONLARI
  {
    id: 'COVER_BIG',
    title: 'KAPAK BÜYÜK (POSTER)',
    desc: 'Büyük albüm kapağı odaklı, brütalist tipografi ve simetrik dikey dalga formu.',
    badge: 'KLASİK POPÜLER',
    recommendedRatio: '1/1',
    icon: ImageIcon,
    color: '#FFD700'
  },
  {
    id: 'VINYL',
    title: 'DÖNEN PLAK & İĞNE',
    desc: 'Karton kılıftan çıkan, groovelı dönen vinil plak ve baslara tepki veren iğne kolu.',
    badge: 'ANALOG RETRO',
    recommendedRatio: '1/1',
    icon: Disc,
    color: '#FFD700'
  },
  {
    id: 'CD',
    title: 'KOMPAKT DİSK & KUTU',
    desc: 'Gökkuşağı hologram parlamalı dönen CD ve akrilik şeffaf mücevher kutusu.',
    badge: '90s COMPACT DISC',
    recommendedRatio: '1/1',
    icon: Radio,
    color: '#38BDF8'
  },
  {
    id: 'SPOTIFY',
    title: 'SPOTIFY CANVAS',
    desc: 'Kayan 3 satırlı lirik akışı, sol altta cam player çubuğu ve aktif equalizer.',
    badge: 'STREAMING STYLE',
    recommendedRatio: '9/16',
    icon: Music,
    color: '#1DB954'
  },
  {
    id: 'TIKTOK',
    title: 'TIKTOK & REELS',
    desc: 'Büyük odaklı parlayan altyazı kutusu, alt süre çizgisi ve dönen mini plak.',
    badge: 'VİRAL DİKEY VİDEO',
    recommendedRatio: '9/16',
    icon: Smartphone,
    color: '#FF0050'
  },
  {
    id: 'RETRO_TAPE',
    title: 'RETRO KASET',
    desc: '80ler kaset gövdesi, dönen dişli makaralar, teyp sayacı ve el yazısı etiket.',
    badge: 'VINTAGE CASSETTE',
    recommendedRatio: '16/9',
    icon: Tv,
    color: '#F59E0B'
  },
  {
    id: 'GLASS_CARD',
    title: 'FROSTED GLASS CARD',
    desc: 'Modern Apple Music tarzı buzlu cam kart, yuvarlak kapak ve canlı zaman sayaçları.',
    badge: 'PREMIUM GLASS',
    recommendedRatio: '9/16',
    icon: Layers,
    color: '#818CF8'
  },
  {
    id: 'DEFAULT',
    title: 'STANDART VİSUALİZER',
    desc: 'Sosyal medya kartı olmadan sadece standart visualizer ve altyazı katmanı.',
    badge: 'VİSUALİZER ODAKLI',
    recommendedRatio: '16/9',
    icon: Sliders,
    color: '#A1A1AA'
  }
];

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

export const SocialMediaStudio: React.FC<SocialMediaStudioProps> = ({
  settings,
  coverUrl,
  onCoverChange,
  bgVideoUrl,
  onBgVideoChange,
  bgImageUrl,
  onBgImageChange,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onPlayTrimStart,
  onChange
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const activeLayout = settings.cardLayout || 'DEFAULT';

  // Audio Trim / Snippet State Variables
  const trimEnabled = settings.trimEnabled ?? false;
  const trimStart = settings.trimStart ?? 0;
  const maxTrackDuration = duration > 0 ? duration : 180;
  const trimEnd = Math.min(settings.trimEnd ?? (duration > 0 ? Math.min(duration, 30) : 30), maxTrackDuration);
  const trimLoop = settings.trimLoop ?? true;
  const snippetLength = Math.max(0.1, trimEnd - trimStart);

  const formatSecs = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.floor(Math.max(0, secs) % 60);
    const ms = Math.floor((Math.max(0, secs) % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const setSnippetLength = (seconds: number) => {
    const currentStart = trimStart;
    let newEnd = currentStart + seconds;
    if (duration > 0 && newEnd > duration) {
      newEnd = duration;
      const newStart = Math.max(0, newEnd - seconds);
      onChange({
        trimEnabled: true,
        trimStart: Math.round(newStart * 10) / 10,
        trimEnd: Math.round(newEnd * 10) / 10
      });
    } else {
      onChange({
        trimEnabled: true,
        trimStart: Math.round(currentStart * 10) / 10,
        trimEnd: Math.round(newEnd * 10) / 10
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      
      {/* 1. BAŞLIK VE AÇIKLAMA */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider">
              SOSYAL MEDYA MÜZİK KARTLARI STÜDYOSU
            </h3>
          </div>
          <Badge variant="accent" className="text-[9px]">
            AKTİF: {activeLayout}
          </Badge>
        </div>
        <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
          TikTok, Instagram Reels, YouTube Shorts ve Spotify Canvas için özel tasarlanmış 12 farklı interaktif müzik kartı şablonu ve sese duyarlı snippet motoru.
        </p>
      </Card>

      {/* 2. AUDIO TRIMMING & SNIPPET STÜDYOSU (ÖZEL KESİT / 15s - 30s - 60s) */}
      <Card className="p-4 space-y-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scissors size={13} />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                SES KESME & SNIPPET YÖNETİCİSİ (TRIM)
              </span>
              <span className="text-[10px] text-content-secondary">
                Sosyal medya klipleri için istediğiniz şarkı aralığını kesin ve döngüde dinleyin
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant={trimEnabled ? "accent" : "outline"}
            size="xs"
            onClick={() => onChange({ trimEnabled: !trimEnabled })}
            className="text-[9px] font-mono gap-1"
          >
            {trimEnabled && <Check size={11} />}
            <span>{trimEnabled ? "TRIM AKTİF" : "TRIM KAPALI"}</span>
          </Button>
        </div>

        {/* Hazır Snippet Süreleri Butonları */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] text-content-secondary flex items-center justify-between uppercase">
            <span className="flex items-center gap-1"><Clock size={10} className="text-amber-400" /> HIZLI SNIPPET ŞABLONLARI</span>
            <span className="text-amber-400 font-mono font-bold">Kesit: {Number(snippetLength || 0).toFixed(1)} sn</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '15 SN', sub: 'Story', secs: 15 },
              { label: '30 SN', sub: 'TikTok / Reels', secs: 30 },
              { label: '60 SN', sub: 'Shorts', secs: 60 },
              { label: 'TÜMÜ', sub: 'Sıfırla', secs: maxTrackDuration },
            ].map((btn) => {
              const isCurrent = trimEnabled && Math.abs(snippetLength - btn.secs) < 0.5;
              return (
                <Button
                  key={btn.label}
                  type="button"
                  variant={isCurrent ? "accent" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (btn.label === 'TÜMÜ') {
                      onChange({
                        trimEnabled: false,
                        trimStart: 0,
                        trimEnd: maxTrackDuration
                      });
                    } else {
                      setSnippetLength(btn.secs);
                    }
                  }}
                  className="flex flex-col items-center justify-center h-auto py-2 px-1"
                >
                  <span className="text-[10px] font-bold">{btn.label}</span>
                  <span className="text-[8px] opacity-70">{btn.sub}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Görsel Timeline & Trim Slider Çift Kulpu */}
        <div className="space-y-3 pt-2 bg-surface p-3 rounded-lg border border-border-subtle">
          {/* Track Progress Bar Preview */}
          <div className="relative w-full h-4 bg-panel rounded overflow-hidden flex items-center border border-border-subtle">
            {/* Trim Highlight Active Window */}
            {duration > 0 && (
              <div 
                className="absolute top-0 bottom-0 bg-amber-500/30 border-x-2 border-amber-400 transition-all pointer-events-none"
                style={{
                  left: `${(trimStart / duration) * 100}%`,
                  width: `${((trimEnd - trimStart) / duration) * 100}%`
                }}
              />
            )}
            {/* Current playback needle */}
            {duration > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_#fff] z-10 transition-all pointer-events-none"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            )}
          </div>

          {/* Başlangıç Saniyesi Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-content-secondary">
              <span>BAŞLANGIÇ (START): <strong className="text-content-primary">{formatSecs(trimStart)}</strong></span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onChange({ trimEnabled: true, trimStart: Math.max(0, trimStart - 1) })}
                  className="h-5 px-1 text-[8px]"
                >
                  -1s
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onChange({ trimEnabled: true, trimStart: Math.min(trimEnd - 0.5, trimStart + 1) })}
                  className="h-5 px-1 text-[8px]"
                >
                  +1s
                </Button>
              </div>
            </div>
            <Slider
              min={0}
              max={Math.max(1, trimEnd - 0.5)}
              step={0.1}
              value={[trimStart]}
              onValueChange={(val) => {
                onChange({
                  trimEnabled: true,
                  trimStart: val[0]
                });
              }}
            />
          </div>

          {/* Bitiş Saniyesi Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-content-secondary">
              <span>BİTİŞ (END): <strong className="text-content-primary">{formatSecs(trimEnd)}</strong></span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onChange({ trimEnabled: true, trimEnd: Math.max(trimStart + 0.5, trimEnd - 1) })}
                  className="h-5 px-1 text-[8px]"
                >
                  -1s
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onChange({ trimEnabled: true, trimEnd: Math.min(maxTrackDuration, trimEnd + 1) })}
                  className="h-5 px-1 text-[8px]"
                >
                  +1s
                </Button>
              </div>
            </div>
            <Slider
              min={trimStart + 0.5}
              max={maxTrackDuration}
              step={0.1}
              value={[trimEnd]}
              onValueChange={(val) => {
                onChange({
                  trimEnabled: true,
                  trimEnd: val[0]
                });
              }}
            />
          </div>

          {/* Snippet Playback Action & Loop Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <Button
              type="button"
              variant="accent"
              size="xs"
              onClick={() => {
                if (onPlayTrimStart) {
                  onPlayTrimStart();
                } else {
                  onTogglePlay();
                }
              }}
              className="gap-1.5 uppercase font-bold text-[9px]"
            >
              <RotateCcw size={11} />
              KESİTİ BAŞTAN OYNAT
            </Button>

            <Button
              type="button"
              variant={trimLoop ? "accent" : "outline"}
              size="xs"
              onClick={() => onChange({ trimLoop: !trimLoop })}
              className="text-[9px] font-mono"
            >
              {trimLoop ? "DÖNGÜ: AÇIK" : "DÖNGÜ: KAPALI"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. EN-BOY ORANI SEÇİCİ (ASPECT RATIO) */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Tv size={12} className="text-accent" />
            EN-BOY ORANI / SOSYAL MEDYA FORMATI
          </span>
          <Badge variant="outline" className="text-[9px] uppercase font-mono">
            {settings.aspectRatio}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '9/16', label: '9:16 DİKEY', sub: 'TikTok, Reels, Shorts' },
            { id: '1/1',  label: '1:1 KARE',  sub: 'Instagram Post, Feed' },
            { id: '16/9', label: '16:9 YATAY', sub: 'YouTube, Desktop' },
          ].map((ratio) => {
            const isSelected = settings.aspectRatio === ratio.id;
            return (
              <Button
                key={ratio.id}
                type="button"
                variant={isSelected ? "accent" : "outline"}
                onClick={() => onChange({ aspectRatio: ratio.id as any })}
                className="flex flex-col items-center justify-center h-auto py-2.5 px-2"
              >
                <span className="text-xs font-bold">{ratio.label}</span>
                <span className="text-[9px] opacity-70">{ratio.sub}</span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 4. ŞABLON GALERİSİ (12 ŞABLON SEÇİCİ) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Disc size={12} className="text-accent" />
            MÜZİK KARTI TASARIMINI SEÇİN ({SOCIAL_CARD_TEMPLATES.length} ŞABLON)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SOCIAL_CARD_TEMPLATES.map((tmpl) => {
            const isSelected = activeLayout === tmpl.id;
            const Icon = tmpl.icon;
            return (
              <Card
                key={tmpl.id}
                onClick={() => onChange({ cardLayout: tmpl.id as any })}
                className={cn(
                  "p-3.5 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between min-h-[95px]",
                  isSelected
                    ? "border-accent bg-accent/5 shadow-md"
                    : "bg-surface border-border-subtle hover:border-border-strong hover:bg-surface/80"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} style={{ color: tmpl.color }} />
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isSelected ? "text-accent" : "text-content-primary"
                      )}>
                        {tmpl.title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[8px]">
                      {tmpl.badge}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-content-secondary leading-relaxed line-clamp-2">
                    {tmpl.desc}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between text-[9px] text-content-tertiary">
                  <span>Önerilen: {tmpl.recommendedRatio}</span>
                  {isSelected && (
                    <span className="text-accent font-bold flex items-center gap-1">
                      <Check size={10} /> SEÇİLDİ
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. ŞARKI VE SANATÇI BİLGİLERİ */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Music size={12} className="text-accent" />
            ŞARKI VE SANATÇI ADI
          </span>
          <Badge variant="outline" className="text-[8px] uppercase">
            KART ÜZERİNDE GÖRÜNÜR
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] uppercase text-content-tertiary block mb-1">ŞARKI BAŞLIĞI (TRACK TITLE)</label>
            <Input
              type="text"
              value={settings.trackTitle || ''}
              onChange={(e) => onChange({ trackTitle: e.target.value })}
              placeholder="Örn: DON'T STOP"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-content-tertiary block mb-1">SANATÇI ADI (ARTIST NAME)</label>
            <Input
              type="text"
              value={settings.artistName || ''}
              onChange={(e) => onChange({ artistName: e.target.value })}
              placeholder="Örn: JERRY J"
              className="text-xs"
            />
          </div>
        </div>
      </Card>

      {/* 6. ALBÜM KAPAĞI YÖNETİMİ */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={12} className="text-accent" />
            ALBÜM KAPAĞI FOTOĞRAFI
          </span>
          <Badge variant="outline" className="text-[8px] uppercase">
            {coverUrl ? "YÜKLENDİ" : "VARSAYILAN"}
          </Badge>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const url = URL.createObjectURL(file);
              onCoverChange(url);
            }
          }}
        />

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-surface border border-border-subtle rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-content-tertiary" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => coverInputRef.current?.click()}
                className="flex-1 text-[9px] font-bold uppercase tracking-wider gap-1.5"
              >
                <Upload size={11} />
                {coverUrl ? "KAPAĞI DEĞİŞTİR" : "KAPAK YÜKLE"}
              </Button>

              {coverUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() => onCoverChange(null)}
                  className="px-2.5 text-[9px]"
                >
                  <Trash2 size={11} />
                </Button>
              )}
            </div>
            <p className="text-[9px] text-content-tertiary">
              Plak, CD, Kaset, Polaroid ve Kart şablonlarının merkezinde yer alır.
            </p>
          </div>
        </div>
      </Card>

      {/* 7. VİSUALİZER VE ARKA PLAN ATMOSFERİ */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent" />
            ARKA PLAN VİSUALİZER & RENK
          </span>
          <Badge variant="outline" className="text-[8px] uppercase">
            {settings.mode === 'NONE' ? "SADECE ŞABLON" : settings.mode}
          </Badge>
        </div>

        {/* Visualizer Arka Planda Çalışsın mı? */}
        <div className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-border-subtle">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-content-secondary uppercase">ARKA PLAN VİSUALİZERİ</span>
            <span className="text-[9px] text-content-tertiary">Kartın arkasında parçacık ve tüneller çalışır</span>
          </div>
          <Button
            type="button"
            variant={settings.mode !== 'NONE' ? "accent" : "outline"}
            size="xs"
            onClick={() => {
              if (settings.mode === 'NONE') {
                onChange({ mode: 'NEON_TUNNEL' });
              } else {
                onChange({ mode: 'NONE' });
              }
            }}
            className="text-[9px] font-mono"
          >
            {settings.mode !== 'NONE' ? "AKTİF (AÇIK)" : "KAPALI (SADECE KART)"}
          </Button>
        </div>

        {/* Renk Seçimi */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-content-secondary uppercase">VURGU & IŞIMA RENGİ</span>
            <span className="text-[9px] font-mono text-content-tertiary">{settings.primaryColor}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['#FFD700', '#00F0FF', '#E8590C', '#E11D48', '#C084FC', '#1DB954', '#38BDF8', '#FFFFFF'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ primaryColor: color })}
                style={{ backgroundColor: color }}
                className={cn(
                  "w-5 h-5 rounded-full border transition-all cursor-pointer",
                  settings.primaryColor === color
                    ? "scale-125 border-white ring-2 ring-accent/30 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* 8. SİNEMATİK ARKA PLAN VİDEO DÖNGÜLERİ */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Video size={12} className="text-accent" />
            HAZIR SİNEMATİK VİDEO DÖNGÜLERİ (CANVAS BG)
          </span>
          {bgVideoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onBgVideoChange(null)}
              className="text-[9px] text-destructive hover:text-destructive h-5 p-0"
            >
              VİDEOYU KALDIR
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {EUPHORIC_VIDEO_PRESETS.map((vid) => {
            const isCurrent = bgVideoUrl === vid.url;
            return (
              <Button
                key={vid.name}
                type="button"
                variant={isCurrent ? "accent" : "outline"}
                onClick={() => onBgVideoChange(vid.url)}
                className="flex flex-col items-start justify-center h-auto py-2 px-2.5 text-left"
              >
                <div className="text-[10px] font-bold uppercase truncate w-full">{vid.name}</div>
                <div className="text-[8px] opacity-70 truncate w-full">{vid.desc}</div>
              </Button>
            );
          })}
        </div>
      </Card>

    </div>
  );
};

