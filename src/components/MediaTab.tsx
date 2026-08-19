import React from "react";
import { 
  Music, Image, Film, Upload, Trash2, Zap, Sparkles, User, Type 
} from "lucide-react";
import { VisualizerSettings } from "../types";
import { 
  CURATED_WALLPAPERS, 
  EUPHORIC_VIDEO_PRESETS, 
  VRM_AVATAR_MODELS 
} from "../lib/visualizerCatalog";
import { TypographyPlacementStudio } from "./TypographyPlacementStudio";
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
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          PARÇA METADATA & BİLGİLERİ
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[8.5px] font-sans uppercase text-content-tertiary block mb-1">ŞARKI / PARÇA ADI</label>
            <input 
              type="text" 
              value={settings.trackTitle || ''} 
              onChange={(e) => onUpdateSettings({ trackTitle: e.target.value })}
              placeholder="Örn: CYBERNETIC HEARTBEAT"
              className="w-full bg-surface border border-border-subtle rounded-sm px-3 py-1.5 text-xs text-content-primary font-sans outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-[8.5px] font-sans uppercase text-content-tertiary block mb-1">SANATÇI / PRODÜKTÖR</label>
            <input 
              type="text" 
              value={settings.artistName || ''} 
              onChange={(e) => onUpdateSettings({ artistName: e.target.value })}
              placeholder="Örn: SYNTH NOIR"
              className="w-full bg-surface border border-border-subtle rounded-sm px-3 py-1.5 text-xs text-content-primary font-sans outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[8.5px] font-sans uppercase text-content-tertiary block mb-1">TARİH / ETİKET</label>
              <input 
                type="text" 
                value={settings.releaseDate || ''} 
                onChange={(e) => onUpdateSettings({ releaseDate: e.target.value })}
                placeholder="2026 OFFICIAL"
                className="w-full bg-surface border border-border-subtle rounded-sm px-2.5 py-1.5 text-[10px] text-content-primary font-sans outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[8.5px] font-sans uppercase text-content-tertiary block mb-1">WATERMARK / LOGO YAZISI</label>
              <input 
                type="text" 
                value={settings.watermarkText || ''} 
                onChange={(e) => onUpdateSettings({ watermarkText: e.target.value })}
                placeholder="VIDFRAMER"
                className="w-full bg-surface border border-border-subtle rounded-sm px-2.5 py-1.5 text-[10px] text-content-primary font-sans outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Şarkı Kartı Stili */}
        <div className="pt-2 border-t border-border-subtle space-y-1.5">
          <span className="text-[9px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
            ŞARKI KARTI YERLEŞİMİ (LAYOUT)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'CENTER_MINIMAL', label: 'ORTA MİNİMAL' },
              { id: 'LEFT_GLASS', label: 'SOL GLASS' },
              { id: 'BRUTALIST_HUD', label: 'BRUTALIST HUD' },
              { id: 'NONE', label: 'GİZLE (KAPALI)' }
            ].map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => onUpdateSettings({ songCardLayout: layout.id as any })}
                className={cn(
                  "py-1.5 px-2 text-center border rounded-sm text-[8px] font-sans uppercase tracking-wider transition-all cursor-pointer",
                  (settings.songCardLayout || 'CENTER_MINIMAL') === layout.id
                    ? "bg-accent/20 text-accent border-accent font-bold"
                    : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
                )}
              >
                {layout.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Şarkı & Sanatçı Tipografi & Serbest Yerleşim Stüdyosu */}
      <TypographyPlacementStudio 
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />

      {/* 3. Ses Kaynağı & Yükleme */}
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest flex items-center gap-1.5">
            <Music size={13} className="text-accent" />
            SES DOSYASI (AUDIO SOURCE)
          </span>
          {audioUrl && (
            <button
              type="button"
              onClick={onRemoveAudio}
              className="text-red-400 hover:text-red-300 text-[8.5px] font-sans uppercase flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={10} /> PARÇAYI KALDIR
            </button>
          )}
        </div>

        {audioUrl ? (
          <div className="p-3 bg-surface border border-accent/30 rounded-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-sans font-bold text-content-primary block truncate">
                  {audioFileName || settings.trackTitle || "Audio Track"}
                </span>
                <span className="text-[8px] font-sans text-content-tertiary">Yüklendi & Çalmaya Hazır</span>
              </div>
            </div>
            <label className="text-[8.5px] font-sans uppercase text-accent hover:underline cursor-pointer shrink-0">
              DEĞİŞTİR
              <input type="file" className="hidden" accept="audio/*" onChange={(e) => onFileUpload(e, 'AUDIO')} />
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="border border-dashed border-border-strong p-4 rounded-sm flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-accent transition-colors bg-panel/30 text-center">
              <Upload size={16} className="text-content-tertiary" />
              <span className="text-[9.5px] font-sans uppercase text-content-secondary font-bold">
                MP3 / WAV / FLAC DOSYASI YÜKLE
              </span>
              <span className="text-[8px] font-sans text-content-tertiary">Sürükle bırak veya bilgisayarından seç</span>
              <input type="file" className="hidden" accept="audio/*" onChange={(e) => onFileUpload(e, 'AUDIO')} />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOpenSunoModal}
                className="p-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-sm text-[9px] font-sans text-accent font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Zap size={12} /> SUNO AI LINK İLE YÜKLE
              </button>
              <button
                type="button"
                onClick={onLoadDemoTrack}
                className="p-2.5 bg-surface hover:bg-hover border border-border-strong rounded-sm text-[9px] font-sans text-content-secondary uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Sparkles size={12} /> ÖRNEK PARÇA YÜKLE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Kapak Görseli & Logo */}
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest block">
          KAPAK GÖRSELİ & MARKA LOGOSU
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Kapak Görseli */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-sans uppercase text-content-tertiary">ALBÜM KAPAĞI</span>
              {coverArtUrl && (
                <button type="button" onClick={onRemoveCoverArt} className="text-red-400 text-[8px] hover:underline cursor-pointer">
                  Sil
                </button>
              )}
            </div>

            {coverArtUrl ? (
              <div className="relative group w-20 h-20 border border-border-strong rounded-sm overflow-hidden bg-surface">
                <img src={coverArtUrl} alt="Cover" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7.5px] text-white uppercase font-sans cursor-pointer transition-opacity">
                  Değiştir
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'COVER')} />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-border-strong p-3 rounded-sm flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent transition-colors bg-panel/20 text-center h-20">
                <Image size={13} className="text-content-tertiary" />
                <span className="text-[8px] font-sans uppercase text-content-secondary">+ KAPAK SEÇ</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'COVER')} />
              </label>
            )}
          </div>

          {/* Logo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-sans uppercase text-content-tertiary">LOGO / WATERMARK</span>
              {logoUrl && (
                <button type="button" onClick={onRemoveLogo} className="text-red-400 text-[8px] hover:underline cursor-pointer">
                  Sil
                </button>
              )}
            </div>

            {logoUrl ? (
              <div className="relative group w-20 h-20 border border-border-strong rounded-sm overflow-hidden bg-surface flex items-center justify-center p-1">
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7.5px] text-white uppercase font-sans cursor-pointer transition-opacity">
                  Değiştir
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'LOGO')} />
                </label>
              </div>
            ) : (
              <label className="border border-dashed border-border-strong p-3 rounded-sm flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent transition-colors bg-panel/20 text-center h-20">
                <Upload size={13} className="text-content-tertiary" />
                <span className="text-[8px] font-sans uppercase text-content-secondary">+ LOGO SEÇ</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'LOGO')} />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 4. Arka Plan Görseli & Küratörlü Duvar Kağıtları */}
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest">
            ARKA PLAN GÖRSELİ (STATIC WALLPAPER)
          </span>
          {bgImageUrl && (
            <button
              type="button"
              onClick={onRemoveBackgroundImage}
              className="text-red-400 hover:text-red-300 text-[8.5px] font-sans uppercase flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={10} /> GÖRSELİ SİL
            </button>
          )}
        </div>

        {/* Küratörlü Duvar Kağıtları */}
        <div className="grid grid-cols-2 gap-2">
          {CURATED_WALLPAPERS.map((w) => {
            const isCurrent = bgImageUrl === w.url;
            return (
              <button
                key={w.name}
                type="button"
                onClick={() => onSelectWallpaper(w.url)}
                className={cn(
                  "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer",
                  isCurrent
                    ? "bg-accent text-black border-accent font-black shadow-[0_0_12px_rgba(255,215,0,0.2)]"
                    : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
                )}
              >
                <span className="text-[9px] font-bold uppercase truncate">{w.name}</span>
                <span className={cn("text-[7.5px] font-sans mt-1", isCurrent ? "text-zinc-900" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF DUVAR KAĞIDI" : "Seç & Uygula"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Özel Görsel Yükle */}
        <label className="border border-dashed border-border-strong p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-panel/20 text-center">
          <Upload size={14} className="text-content-tertiary" />
          <span className="text-[9px] font-sans uppercase text-content-secondary">+ KENDİ GÖRSELİNİ YÜKLE</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, 'BG_IMAGE')} />
        </label>

        {/* Görsel Opaklık, Bulanıklık & Reaktivite Kontrolü */}
        {bgImageUrl && (
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] font-sans text-content-secondary">
                  <span>GÖRSEL OPAKLIĞI:</span>
                  <span className="text-accent">%{Math.round((settings.bgImageOpacity ?? 0.85) * 100)}</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.05"
                  value={settings.bgImageOpacity ?? 0.85}
                  onChange={(e) => onUpdateSettings({ bgImageOpacity: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px] font-sans text-content-secondary">
                  <span>BULANIKLIK:</span>
                  <span className="text-accent">{(settings.bgImageBlur ?? 0).toFixed(0)}px</span>
                </div>
                <input 
                  type="range" min="0" max="25" step="1"
                  value={settings.bgImageBlur ?? 0}
                  onChange={(e) => onUpdateSettings({ bgImageBlur: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateSettings({ bgImageReactive: !settings.bgImageReactive })}
              className={cn(
                "w-full py-1.5 text-[8.5px] font-sans uppercase border rounded-sm transition-all cursor-pointer",
                settings.bgImageReactive !== false
                  ? "bg-accent/20 text-accent border-accent"
                  : "bg-panel text-content-tertiary border-border-strong"
              )}
            >
              BEAT KICK ZOOM & PULSE: {settings.bgImageReactive !== false ? 'AÇIK' : 'KAPALI'}
            </button>
          </div>
        )}
      </div>

      {/* 5. Arka Plan Video Katmanı & Euphoric Döngüler */}
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest">
            ARKA PLAN VİDEO DÖNGÜSÜ (EUPHORIC)
          </span>
          {bgVideoUrl && (
            <button
              type="button"
              onClick={onRemoveBackgroundVideo}
              className="text-red-400 hover:text-red-300 text-[8.5px] font-sans uppercase flex items-center gap-1 cursor-pointer"
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
                onClick={() => onSelectEuphoricVideo(v.url)}
                className={cn(
                  "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer",
                  isCurrent
                    ? "bg-accent text-black border-accent font-black shadow-[0_0_12px_rgba(255,215,0,0.2)]"
                    : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
                )}
              >
                <span className="text-[9px] font-bold uppercase truncate">{v.name}</span>
                <span className={cn("text-[7.5px] font-sans mt-1", isCurrent ? "text-zinc-900" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF DÖNGÜ" : "Kullan"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Özel Video Yükle */}
        <label className="border border-dashed border-border-strong p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-panel/20 text-center">
          <Film size={14} className="text-content-tertiary" />
          <span className="text-[9px] font-sans uppercase text-content-secondary">+ KENDİ MP4 VİDEONU YÜKLE</span>
          <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={(e) => onFileUpload(e, 'VIDEO')} />
        </label>

        {/* Video Opaklık & Reaktivite Kontrolü */}
        {bgVideoUrl && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-subtle">
            <div className="space-y-1">
              <div className="flex justify-between text-[8.5px] font-sans text-content-secondary">
                <span>VİDEO OPAKLIĞI:</span>
                <span className="text-accent">%{Math.round((settings.bgVideoOpacity ?? 0.65) * 100)}</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05"
                value={settings.bgVideoOpacity ?? 0.65}
                onChange={(e) => onUpdateSettings({ bgVideoOpacity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-hover accent-[#FFD700] appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onUpdateSettings({ bgVideoReactive: !settings.bgVideoReactive })}
                className={cn(
                  "w-full py-1.5 text-[8.5px] font-sans uppercase border rounded-sm transition-all",
                  settings.bgVideoReactive !== false
                    ? "bg-accent/20 text-accent border-accent"
                    : "bg-panel text-content-tertiary border-border-strong"
                )}
              >
                BEAT KICK PULSE: {settings.bgVideoReactive !== false ? 'AÇIK' : 'KAPALI'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. 3D Karakter / VRM Avatar Katmanı */}
      <div className="bg-panel border border-border-subtle p-4 rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold text-content-secondary uppercase tracking-widest flex items-center gap-1.5">
            <User size={13} className="text-accent" />
            3D VRM AVATAR / KARAKTER
          </span>
          <span className="text-[8.5px] font-sans text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent font-bold truncate max-w-[170px]">
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
                onClick={() => onUpdateSettings({ mode: 'VRM_ANIME_HYBRID', vrmModelUrl: model.url, vrmModelName: model.name })}
                className={cn(
                  "p-2.5 text-left border rounded-sm transition-all flex flex-col justify-between cursor-pointer group relative",
                  isCurrent
                    ? "bg-accent text-black border-accent font-black shadow-[0_0_12px_rgba(255,215,0,0.2)]"
                    : "bg-panel text-content-secondary border-border-subtle hover:border-border-strong"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-bold uppercase truncate">{model.name}</span>
                </div>
                <span className={cn("text-[7.5px] font-sans mt-1", isCurrent ? "text-zinc-900" : "text-content-tertiary")}>
                  {isCurrent ? "✓ AKTİF MODEL" : "Seç & Kullan"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Özel VRM Dosyası Yükle */}
        <label className="border border-dashed border-border-strong p-2.5 rounded-sm flex items-center justify-center gap-2 cursor-pointer hover:border-accent transition-colors bg-panel/20 text-center">
          <Upload size={13} className="text-content-secondary" />
          <span className="text-[9px] font-sans uppercase text-content-secondary">+ YENİ 3D .VRM MODELİ YÜKLE</span>
          <input type="file" className="hidden" accept=".vrm,application/octet-stream,model/gltf-binary" onChange={(e) => onFileUpload(e, 'VRM')} />
        </label>
      </div>

    </div>
  );
};
