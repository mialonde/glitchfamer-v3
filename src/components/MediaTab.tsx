import React from "react";
import { 
  Music, Image, Film, Upload, Trash2, Zap, Sparkles, User, Type, RefreshCw 
} from "lucide-react";
import { VisualizerSettings } from "../types";
import { 
  CURATED_WALLPAPERS, 
  EUPHORIC_VIDEO_PRESETS, 
  VRM_AVATAR_MODELS 
} from "../lib/visualizerCatalog";
import { TypographyPlacementStudio } from "./TypographyPlacementStudio";
import { Button, Badge, Card, Input, Slider } from "./ui";
import { cn } from "../lib/utils";

interface MediaTabProps {
  settings: VisualizerSettings;
  audioUrl: string | null;
  audioFileName: string | null;
  coverArtUrl: string | null;
  logoUrl: string | null;
  bgImageUrl: string | null;
  bgVideoUrl: string | null;
  onUpdateSettings: (newSettings: Partial<VisualizerSettings>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'AUDIO' | 'COVER' | 'LOGO' | 'BG_IMAGE' | 'VIDEO' | 'VRM') => void;
  onOpenSunoModal: () => void;
  onLoadDemoTrack: () => void;
  onRemoveAudio: () => void;
  onRemoveCoverArt: () => void;
  onRemoveLogo: () => void;
  onRemoveBackgroundImage: () => void;
  onRemoveBackgroundVideo: () => void;
  onSelectWallpaper: (url: string) => void;
  onSelectEuphoricVideo: (url: string) => void;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  settings,
  audioUrl,
  audioFileName,
  coverArtUrl,
  logoUrl,
  bgImageUrl,
  bgVideoUrl,
  onUpdateSettings,
  onFileUpload,
  onOpenSunoModal,
  onLoadDemoTrack,
  onRemoveAudio,
  onRemoveCoverArt,
  onRemoveLogo,
  onRemoveBackgroundImage,
  onRemoveBackgroundVideo,
  onSelectWallpaper,
  onSelectEuphoricVideo
}) => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      
      {/* 1. Parça Bilgileri & Tipografi */}
      <Card className="p-4 space-y-3">
        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider block">
          PARÇA METADATA & BİLGİLERİ
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] uppercase text-content-tertiary block mb-1">ŞARKI / PARÇA ADI</label>
            <Input 
              type="text" 
              value={settings.trackTitle || ''} 
              onChange={(e) => onUpdateSettings({ trackTitle: e.target.value })}
              placeholder="Örn: CYBERNETIC HEARTBEAT"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase text-content-tertiary block mb-1">SANATÇI / PRODÜKTÖR</label>
            <Input 
              type="text" 
              value={settings.artistName || ''} 
              onChange={(e) => onUpdateSettings({ artistName: e.target.value })}
              placeholder="Örn: SYNTH NOIR"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] uppercase text-content-tertiary block mb-1">TARİH / ETİKET</label>
              <Input 
                type="text" 
                value={settings.releaseDate || ''} 
                onChange={(e) => onUpdateSettings({ releaseDate: e.target.value })}
                placeholder="2026 OFFICIAL"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-content-tertiary block mb-1">WATERMARK / LOGO YAZISI</label>
              <Input 
                type="text" 
                value={settings.watermarkText || ''} 
                onChange={(e) => onUpdateSettings({ watermarkText: e.target.value })}
                placeholder="VIDFRAMER"
              />
            </div>
          </div>
        </div>

        {/* Şarkı Kartı Stili */}
        <div className="pt-2 border-t border-border-subtle space-y-1.5">
          <span className="text-[10px] font-bold text-content-secondary uppercase tracking-wider block">
            ŞARKI KARTI YERLEŞİMİ (LAYOUT)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'CENTER_MINIMAL', label: 'ORTA MİNİMAL' },
              { id: 'LEFT_GLASS', label: 'SOL GLASS' },
              { id: 'BRUTALIST_HUD', label: 'BRUTALIST HUD' },
              { id: 'NONE', label: 'GİZLE (KAPALI)' }
            ].map((layout) => (
              <Button
                key={layout.id}
                type="button"
                variant={(settings.songCardLayout || 'CENTER_MINIMAL') === layout.id ? 'accent' : 'outline'}
                size="xs"
                onClick={() => onUpdateSettings({ songCardLayout: layout.id as any })}
                className="text-[9px] uppercase font-mono"
              >
                {layout.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Şarkı & Sanatçı Tipografi & Serbest Yerleşim Stüdyosu */}
      <TypographyPlacementStudio 
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* 3. Ses Kaynağı & Yükleme */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Music size={14} className="text-accent" />
            SES DOSYASI (AUDIO SOURCE)
          </span>
          {audioUrl && (
            <Button
              variant="destructive"
              size="xs"
              onClick={onRemoveAudio}
              className="text-[9px] gap-1"
            >
              <Trash2 size={11} /> PARÇAYI KALDIR
            </Button>
          )}
        </div>

        {audioUrl ? (
          <div className="p-3 bg-surface border border-accent/30 rounded-lg flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-xs font-bold text-content-primary block truncate">
                  {audioFileName || settings.trackTitle || "Audio Track"}
                </span>
                <span className="text-[10px] text-content-tertiary">Yüklendi & Çalmaya Hazır</span>
              </div>
            </div>
            <label className="text-[10px] uppercase font-bold text-accent hover:underline cursor-pointer shrink-0">
              DEĞİŞTİR
              <input type="file" className="hidden" accept="audio/*" onChange={(e) => onFileUpload(e, 'AUDIO')} />
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="border border-dashed border-border-strong p-4 rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-accent transition-colors bg-surface/30 text-center">
              <Upload size={18} className="text-content-tertiary" />
              <span className="text-xs uppercase text-content-secondary font-bold">
                MP3 / WAV / FLAC DOSYASI YÜKLE
              </span>
              <span className="text-[10px] text-content-tertiary">Sürükle bırak veya bilgisayarından seç</span>
              <input type="file" className="hidden" accept="audio/*" onChange={(e) => onFileUpload(e, 'AUDIO')} />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSunoModal}
                className="text-xs font-bold uppercase gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
              >
                <Zap size={13} /> SUNO AI LINK İLE YÜKLE
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadDemoTrack}
                className="text-xs font-bold uppercase gap-1.5"
              >
                <Sparkles size={13} /> ÖRNEK PARÇA YÜKLE
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Kapak Görseli & Logo */}
      <Card className="p-4 space-y-3">
        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider block">
          KAPAK GÖRSELİ & MARKA LOGOSU
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Kapak Görseli */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-content-tertiary">ALBÜM KAPAĞI</span>
              {coverArtUrl && (
                <Button variant="ghost" size="xs" onClick={onRemoveCoverArt} className="text-destructive text-[9px] h-5 px-1">
                  Sil
                </Button>
              )}
            </div>

            {coverArtUrl ? (
              <div className="relative group w-20 h-20 border border-border-strong rounded-lg overflow-hidden bg-surface">
                <img src={coverArtUrl} alt="Cover" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white uppercase cursor-pointer transition-opacity font-bold">
                  Değiştir
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'COVER')} />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-border-strong p-3 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent transition-colors bg-surface/20 text-center h-20">
                <Image size={14} className="text-content-tertiary" />
                <span className="text-[9px] uppercase text-content-secondary font-bold">+ KAPAK SEÇ</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'COVER')} />
              </label>
            )}
          </div>

          {/* Logo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-content-tertiary">LOGO / WATERMARK</span>
              {logoUrl && (
                <Button variant="ghost" size="xs" onClick={onRemoveLogo} className="text-destructive text-[9px] h-5 px-1">
                  Sil
                </Button>
              )}
            </div>

            {logoUrl ? (
              <div className="relative group w-20 h-20 border border-border-strong rounded-lg overflow-hidden bg-surface flex items-center justify-center p-1">
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white uppercase cursor-pointer transition-opacity font-bold">
                  Değiştir
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'LOGO')} />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-border-strong p-3 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent transition-colors bg-surface/20 text-center h-20">
                <Upload size={14} className="text-content-tertiary" />
                <span className="text-[9px] uppercase text-content-secondary font-bold">+ LOGO SEÇ</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'LOGO')} />
              </label>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Arka Plan Görseli & Küratörlü Duvar Kağıtları */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
            ARKA PLAN GÖRSELİ (STATIC WALLPAPER)
          </span>
          {bgImageUrl && (
            <Button
              variant="destructive"
              size="xs"
              onClick={onRemoveBackgroundImage}
              className="text-[9px] gap-1"
            >
              <Trash2 size={11} /> GÖRSELİ SİL
            </Button>
          )}
        </div>

        {/* Küratörlü Duvar Kağıtları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CURATED_WALLPAPERS.map((w) => {
            const isCurrent = bgImageUrl === w.url;
            return (
              <Button
                key={w.name}
                type="button"
                variant={isCurrent ? "accent" : "outline"}
                onClick={() => onSelectWallpaper(w.url)}
                className="p-3 text-left flex flex-col items-start justify-between h-auto"
              >
                <span className="text-xs font-bold uppercase truncate">{w.name}</span>
                <span className={cn("text-[9px] font-mono mt-0.5", isCurrent ? "text-accent-foreground" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF DUVAR KAĞIDI" : "Seç & Uygula"}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Özel Görsel Yükle */}
        <label className="border border-dashed border-border-strong p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-surface/20 text-center">
          <Upload size={15} className="text-content-tertiary" />
          <span className="text-xs uppercase text-content-secondary font-bold">+ KENDİ GÖRSELİNİ YÜKLE</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'BG_IMAGE')} />
        </label>

        {/* Görsel Opaklık, Bulanıklık & Reaktivite Kontrolü */}
        {bgImageUrl && (
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-content-secondary">
                  <span>GÖRSEL OPAKLIĞI:</span>
                  <span className="text-accent">%{Math.round((settings.bgImageOpacity ?? 0.85) * 100)}</span>
                </div>
                <Slider 
                  min={0.1} max={1.0} step={0.05}
                  value={settings.bgImageOpacity ?? 0.85}
                  onChange={(val) => onUpdateSettings({ bgImageOpacity: val })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-content-secondary">
                  <span>BULANIKLIK:</span>
                  <span className="text-accent">{Number(settings.bgImageBlur ?? 0).toFixed(0)}px</span>
                </div>
                <Slider 
                  min={0} max={25} step={1}
                  value={settings.bgImageBlur ?? 0}
                  onChange={(val) => onUpdateSettings({ bgImageBlur: val })}
                />
              </div>
            </div>

            <Button
              type="button"
              variant={settings.bgImageReactive !== false ? "accent" : "outline"}
              size="sm"
              onClick={() => onUpdateSettings({ bgImageReactive: !settings.bgImageReactive })}
              className="w-full text-[10px] font-mono uppercase"
            >
              BEAT KICK ZOOM & PULSE: {settings.bgImageReactive !== false ? 'AÇIK' : 'KAPALI'}
            </Button>
          </div>
        )}
      </Card>

      {/* 5. Arka Plan Video Katmanı & Euphoric Döngüler */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider">
            ARKA PLAN VİDEO DÖNGÜSÜ (EUPHORIC)
          </span>
          {bgVideoUrl && (
            <Button
              variant="destructive"
              size="xs"
              onClick={onRemoveBackgroundVideo}
              className="text-[9px] gap-1"
            >
              <Trash2 size={11} /> VİDEOYU SİL
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EUPHORIC_VIDEO_PRESETS.map((v) => {
            const isCurrent = bgVideoUrl === v.url;
            return (
              <Button
                key={v.name}
                type="button"
                variant={isCurrent ? "accent" : "outline"}
                onClick={() => onSelectEuphoricVideo(v.url)}
                className="p-3 text-left flex flex-col items-start justify-between h-auto"
              >
                <span className="text-xs font-bold uppercase truncate">{v.name}</span>
                <span className={cn("text-[9px] font-mono mt-0.5", isCurrent ? "text-accent-foreground" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF DÖNGÜ" : "Kullan"}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Özel Video Yükle */}
        <label className="border border-dashed border-border-strong p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-surface/20 text-center">
          <Film size={15} className="text-content-tertiary" />
          <span className="text-xs uppercase text-content-secondary font-bold">+ KENDİ MP4 VİDEONU YÜKLE</span>
          <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => onFileUpload(e, 'VIDEO')} />
        </label>

        {/* Video Opaklık & Reaktivite Kontrolü */}
        {bgVideoUrl && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-content-secondary">
                <span>VİDEO OPAKLIĞI:</span>
                <span className="text-accent">%{Math.round((settings.bgVideoOpacity ?? 0.65) * 100)}</span>
              </div>
              <Slider 
                min={0.1} max={1.0} step={0.05}
                value={settings.bgVideoOpacity ?? 0.65}
                onChange={(val) => onUpdateSettings({ bgVideoOpacity: val })}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant={settings.bgVideoReactive !== false ? "accent" : "outline"}
                size="sm"
                onClick={() => onUpdateSettings({ bgVideoReactive: !settings.bgVideoReactive })}
                className="w-full text-[10px] font-mono uppercase"
              >
                BEAT KICK PULSE: {settings.bgVideoReactive !== false ? 'AÇIK' : 'KAPALI'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 6. 3D Karakter / VRM Avatar Katmanı */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-content-secondary uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-accent" />
            3D VRM AVATAR / KARAKTER
          </span>
          <Badge variant="accent" className="text-[9px] font-mono truncate max-w-[170px]">
            {settings.vrmModelName || (settings.vrmModelUrl?.includes('Nutachisan') ? 'Nutachisan.vrm' : 'AliciaSolid.vrm')}
          </Badge>
        </div>

        {/* Küratörlü / Yüklü VRM Modelleri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VRM_AVATAR_MODELS.map((model) => {
            const isCurrent = (settings.vrmModelUrl || '/models/AliciaSolid.vrm') === model.url;
            return (
              <Button
                key={model.id}
                type="button"
                variant={isCurrent ? "accent" : "outline"}
                onClick={() => onUpdateSettings({ mode: 'VRM_ANIME_HYBRID', vrmModelUrl: model.url, vrmModelName: model.name })}
                className="p-3 text-left flex flex-col items-start justify-between h-auto"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold uppercase truncate">{model.name}</span>
                </div>
                <span className={cn("text-[9px] font-mono mt-0.5", isCurrent ? "text-accent-foreground" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF MODEL" : "Seç & Kullan"}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Özel VRM Dosyası Yükle */}
        <label className="border border-dashed border-border-strong p-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-surface/20 text-center">
          <Upload size={14} className="text-content-secondary" />
          <span className="text-xs uppercase text-content-secondary font-bold">+ YENİ 3D .VRM MODELİ YÜKLE</span>
          <input type="file" className="hidden" accept=".vrm,application/octet-stream,model/gltf-binary" onChange={(e) => onFileUpload(e, 'VRM')} />
        </label>
      </Card>

    </div>
  );
};

