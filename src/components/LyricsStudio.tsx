import React, { useState, useEffect } from 'react';
import { VisualizerSettings, LyricsStyle, LyricsPosition } from '../types';
import { parseLrcText, exportToLrcText, autoSyncLyricsByDuration } from '../services/lyricSyncService';
import { 
  Type, Upload, Download, Plus, Trash2, Zap, Play, Clock, 
  RotateCcw, Eye, EyeOff, Radio
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LyricsStudioProps {
  settings: VisualizerSettings;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onChange: (updated: Partial<VisualizerSettings>) => void;
}

const DEMO_LYRICS_TEXT = `Gecenin içinde kaybolan ışıklar
Neon sokaklarda yankılanan sesler
Zaman durur ama ritim devam eder
Gözlerini kapat ve akışa bırak`;

export const LyricsStudio: React.FC<LyricsStudioProps> = ({
  settings,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState<'AUTO' | 'LRC' | 'MANUAL'>('AUTO');
  const [rawTextInput, setRawTextInput] = useState(DEMO_LYRICS_TEXT);
  const [rawLrcInput, setRawLrcInput] = useState('');
  const [liveTapIndex, setLiveTapIndex] = useState(0);

  // Klavye Space Tuşu ile Canlı Senkronizasyon desteği
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Eğer input veya textarea odağında değilsek space ile canlı tap yap
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyT' && activeTab === 'MANUAL') {
        e.preventDefault();
        handleLiveTapNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, liveTapIndex, currentTime, settings.syncedLyrics]);

  // 1. Akıllı Otomatik Senkronizasyon (Süreye Göre Dağıt)
  const handleAutoSync = () => {
    const effectiveDuration = duration > 5 ? duration : 180;
    const synced = autoSyncLyricsByDuration(rawTextInput, effectiveDuration);
    onChange({
      syncedLyrics: synced,
      lyricsEnabled: true
    });
    setLiveTapIndex(0);
  };

  // 2. LRC Metnini veya Dosyasını Ayrıştır
  const handleImportLrc = (lrcString: string) => {
    const parsed = parseLrcText(lrcString);
    if (parsed.length > 0) {
      onChange({
        syncedLyrics: parsed,
        lyricsEnabled: true
      });
      setLiveTapIndex(0);
    }
  };

  const handleLrcFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawLrcInput(text);
        handleImportLrc(text);
      }
    };
    reader.readAsText(file);
  };

  // 3. LRC Formatında İndir
  const handleDownloadLrc = () => {
    const lrcContent = exportToLrcText(settings.syncedLyrics);
    if (!lrcContent) return;
    const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${settings.trackTitle || 'vidframer_lyrics'}.lrc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 4. Canlı Tap / Dokunarak Zaman Damgası Mühürleme
  const handleLiveTapNext = () => {
    if (!settings.syncedLyrics || settings.syncedLyrics.length === 0) return;
    if (liveTapIndex >= settings.syncedLyrics.length) return;

    const updated = [...settings.syncedLyrics];
    const now = Math.round(currentTime * 100) / 100;
    
    // Aktif satırın başlangıç zamanını şu anki saniye yap
    updated[liveTapIndex] = {
      ...updated[liveTapIndex],
      startTime: now
    };

    // Bir önceki satır varsa onun bitiş zamanını bu an yap
    if (liveTapIndex > 0) {
      updated[liveTapIndex - 1] = {
        ...updated[liveTapIndex - 1],
        endTime: now
      };
    }

    // Sıradaki satıra geç
    onChange({ syncedLyrics: updated });
    setLiveTapIndex(prev => Math.min(updated.length, prev + 1));
  };

  // Satır Ekleme / Silme / Düzenleme
  const handleAddLine = () => {
    const updated = [...(settings.syncedLyrics || [])];
    const lastLine = updated[updated.length - 1];
    const start = lastLine ? lastLine.endTime : 0;
    updated.push({
      startTime: start,
      endTime: start + 4.0,
      text: 'Yeni Şarkı Sözü Satırı'
    });
    onChange({ syncedLyrics: updated });
  };

  const handleDeleteLine = (index: number) => {
    const updated = (settings.syncedLyrics || []).filter((_, idx) => idx !== index);
    onChange({ syncedLyrics: updated });
    if (liveTapIndex >= updated.length) {
      setLiveTapIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleUpdateLine = (index: number, field: 'startTime' | 'endTime' | 'text', val: string | number) => {
    const updated = [...(settings.syncedLyrics || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
      onChange({ syncedLyrics: updated });
    }
  };

  const lyricsCount = settings.syncedLyrics?.length || 0;

  return (
    <section className="space-y-6">
      {/* 1. ÜST BAŞLIK & GENEL AÇ/KAPA DÜĞMESİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Type className={cn("w-4 h-4 transition-colors", settings.lyricsEnabled !== false ? "text-[#FFD700]" : "text-zinc-600")} />
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">
              ŞARKI SÖZLERİ (KINETIC LYRICS)
            </h3>
            <p className="text-[8.5px] text-zinc-500 font-mono">
              Otomatik süre dağıtıcı, .LRC içe/dışa aktarma veya canlı senkronizasyon.
            </p>
          </div>
        </div>

        {/* Şarkı Sözleri Genel Aç/Kapa */}
        <button
          onClick={() => onChange({ lyricsEnabled: !(settings.lyricsEnabled !== false) })}
          className={cn(
            "px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider border rounded-sm transition-all flex items-center gap-1.5 cursor-pointer",
            settings.lyricsEnabled !== false
              ? "bg-[#FFD700] text-black border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.25)]"
              : "bg-black/60 text-zinc-500 border-white/[0.08] hover:border-zinc-700"
          )}
        >
          {settings.lyricsEnabled !== false ? <Eye size={12} /> : <EyeOff size={12} />}
          <span>{settings.lyricsEnabled !== false ? 'LİRİKLER: AÇIK' : 'LİRİKLER: KAPALI'}</span>
        </button>
      </div>

      {/* 2. GÖRSEL TİPOGRAFİ VE KONUM AYARLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-black/40 p-3.5 border border-white/[0.08] rounded-sm">
        {/* Stil Seçici */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono uppercase text-zinc-400">TİPOGRAFİ STİLİ:</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'KINETIC', label: 'KINETIC GLOW', desc: 'Vuruşlu brütalist' },
              { id: 'KARAOKE', label: 'KARAOKE BOUNCE', desc: 'Kelime kelime parlama' },
              { id: 'SUBTITLE', label: 'SUBTITLE BOX', desc: 'Sinematik altyazı kutusu' },
              { id: 'NEON_BOX', label: 'NEON BADGE', desc: 'Retro neon çerçeve' },
              { id: 'CYBER_GLITCH', label: 'CYBER GLITCH', desc: 'Glitch piksel kayması' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onChange({ lyricsStyle: st.id as LyricsStyle })}
                className={cn(
                  "p-2 text-left border transition-all cursor-pointer",
                  (settings.lyricsStyle || 'KINETIC') === st.id
                    ? "bg-[#FFD700] text-black border-[#FFD700] font-black"
                    : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700"
                )}
              >
                <div className="text-[8px] font-bold uppercase">{st.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Konum Seçici */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono uppercase text-zinc-400">EKRAN KONUMU:</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'TOP', label: 'ÜST' },
              { id: 'CENTER', label: 'ORTA' },
              { id: 'BOTTOM', label: 'ALT' }
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => onChange({ lyricsPosition: pos.id as LyricsPosition })}
                className={cn(
                  "py-3 text-center border transition-all cursor-pointer font-bold text-[9px] uppercase",
                  (settings.lyricsPosition || 'BOTTOM') === pos.id
                    ? "bg-[#FFD700] text-black border-[#FFD700]"
                    : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>

          {/* Yazı Boyutu */}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-[8px] font-mono">
              <span className="text-zinc-500 uppercase">YAZI BOYUTU:</span>
              <span className="text-[#FFD700] font-bold">{settings.lyricsFontSize || 42}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="68"
              step="2"
              value={settings.lyricsFontSize || 42}
              onChange={(e) => onChange({ lyricsFontSize: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-800 accent-[#FFD700] appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Vurgu Rengi */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono uppercase text-zinc-400">LİRİK VURGU RENGİ:</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { name: 'GOLD', color: '#FFD700' },
              { name: 'CYAN', color: '#00F0FF' },
              { name: 'WHITE', color: '#FFFFFF' },
              { name: 'LIME', color: '#39FF14' },
              { name: 'CRIMSON', color: '#FF003C' },
              { name: 'PURPLE', color: '#BD00FF' }
            ].map((c) => (
              <button
                key={c.name}
                onClick={() => onChange({ lyricsColor: c.color })}
                className={cn(
                  "p-2 flex items-center gap-1.5 border transition-all cursor-pointer",
                  (settings.lyricsColor || '#FFD700') === c.color
                    ? "border-[#FFD700] bg-zinc-900"
                    : "border-zinc-800 bg-black hover:border-zinc-700"
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[8px] font-bold text-zinc-300">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SENKRONİZASYON SEKMELERİ (AUTO / LRC / MANUAL) */}
      <div className="space-y-4">
        <div className="flex border-b border-zinc-800">
          {[
            { id: 'AUTO', label: '1. AKILLI OTOMATİK SENKRONİZASYON (SÜREYE DAĞIT)' },
            { id: 'LRC', label: '2. .LRC DOSYASI / METİN İÇE-DIŞA AKTAR' },
            { id: 'MANUAL', label: `3. CANLI DOKUN & DÜZENLE (${lyricsCount} SATIR)` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                activeTab === tab.id
                  ? "border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SEKME 1: AKILLI OTOMATİK SENKRONİZASYON */}
        {activeTab === 'AUTO' && (
          <div className="space-y-4 bg-zinc-950 p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-zinc-400">
                Şarkı sözlerini alt alta yapıştırın. Sistem şarkının toplam süresine ({Math.round(duration || 180)} sn) göre satırları akıcı ve eşit şekilde senkronize eder.
              </span>
              <button
                onClick={() => setRawTextInput(DEMO_LYRICS_TEXT)}
                className="text-[8px] font-mono text-[#FFD700] hover:underline cursor-pointer"
              >
                Örnek Demo Metin Doldur
              </button>
            </div>

            <textarea
              rows={5}
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              placeholder="Her satıra bir lirik gelecek şekilde yapıştırın..."
              className="w-full bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 focus:border-[#FFD700] outline-none"
            />

            <button
              onClick={handleAutoSync}
              className="w-full py-3 bg-[#FFD700] hover:bg-white text-black font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              <Zap size={14} />
              <span>ŞARKI SÜRESİNE GÖRE ANINDA SENKRONİZE ET & UYGULA</span>
            </button>
          </div>
        )}

        {/* SEKME 2: LRC DOSYASI VE İÇE/DIŞA AKTAR */}
        {activeTab === 'LRC' && (
          <div className="space-y-4 bg-zinc-950 p-4 border border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LRC Dosyası Yükle */}
              <label className="border border-dashed border-zinc-800 p-6 text-center cursor-pointer hover:border-[#FFD700] transition-colors bg-black flex flex-col items-center justify-center">
                <input type="file" accept=".lrc,text/plain" onChange={handleLrcFileUpload} className="hidden" />
                <Upload size={20} className="text-[#FFD700] mb-2" />
                <span className="text-[10px] font-black uppercase text-zinc-200">.LRC DOSYASI YÜKLE</span>
                <span className="text-[8px] font-mono text-zinc-500 mt-1">Zaman damgalı standart lirik dosyası</span>
              </label>

              {/* Mevcut Sözleri LRC Olarak İndir */}
              <button
                onClick={handleDownloadLrc}
                disabled={lyricsCount === 0}
                className="border border-zinc-800 p-6 text-center hover:border-[#FFD700] transition-colors bg-black flex flex-col items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                <Download size={20} className="text-[#FFD700] mb-2" />
                <span className="text-[10px] font-black uppercase text-zinc-200">.LRC OLARAK İNDİR</span>
                <span className="text-[8px] font-mono text-zinc-500 mt-1">{lyricsCount} adet senkronize satırı dışa aktar</span>
              </button>
            </div>

            {/* LRC Metin Yapıştırma */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">VEYA LRC FORMATINDA METİN YAPIŞTIRIN:</span>
              <textarea
                rows={4}
                value={rawLrcInput}
                onChange={(e) => setRawLrcInput(e.target.value)}
                placeholder="[00:12.30] Şarkı sözü satırı..."
                className="w-full bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 focus:border-[#FFD700] outline-none"
              />
              <button
                onClick={() => handleImportLrc(rawLrcInput)}
                className="px-4 py-2 bg-zinc-900 hover:bg-[#FFD700] text-zinc-200 hover:text-black font-black text-[9px] uppercase tracking-wider border border-zinc-800 cursor-pointer"
              >
                YAPIŞTIRILAN LRC'Yİ AKTİF ET
              </button>
            </div>
          </div>
        )}

        {/* SEKME 3: MANUEL CANLI SENKRONİZASYON STÜDYOSU */}
        {activeTab === 'MANUAL' && (
          <div className="space-y-4 bg-zinc-950 p-4 border border-zinc-800">
            {/* CANLI TAP KONTROL PANELİ */}
            <div className="bg-black p-4 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Clock size={13} className="text-[#FFD700]" />
                  <span>ŞARKI ZAMANI: {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')} sn</span>
                </div>
                <p className="text-[8px] font-mono text-zinc-500">
                  Şarkıyı oynatın. Şarkıcı bir sonraki satıra her geçtiğinde büyük sarı butona dokunun (veya 'T' tuşuna basın).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePlay}
                  className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Play size={12} className={isPlaying ? "text-[#FFD700]" : ""} />
                  <span>{isPlaying ? 'DURAKLAT' : 'ŞARKIYI ÇAL'}</span>
                </button>

                {/* BÜYÜK CANLI DOKUN BUTONU */}
                <button
                  onClick={handleLiveTapNext}
                  disabled={lyricsCount === 0 || liveTapIndex >= lyricsCount}
                  className="px-5 py-2.5 bg-[#FFD700] hover:bg-white text-black font-black text-[10px] tracking-widest uppercase border border-[#FFD700] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-40"
                >
                  <Radio size={14} className="animate-pulse" />
                  <span>BU SATIRA DOKUN (CANLI TAP) [{liveTapIndex + 1}/{lyricsCount}]</span>
                </button>
              </div>
            </div>

            {/* SATIR SATIR DÜZENLEME TABLOSU */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {settings.syncedLyrics && settings.syncedLyrics.length > 0 ? (
                settings.syncedLyrics.map((line, idx) => {
                  const isCurrentLive = idx === liveTapIndex;
                  const isCurrentTimeActive = currentTime >= line.startTime && currentTime <= line.endTime;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2.5 border flex items-center gap-3 transition-all",
                        isCurrentLive
                          ? "border-[#FFD700] bg-[#FFD700]/10"
                          : isCurrentTimeActive
                          ? "border-zinc-600 bg-zinc-900/50"
                          : "border-zinc-900 bg-black"
                      )}
                    >
                      {/* Sıra Numarası */}
                      <span className="text-[9px] font-mono text-zinc-500 w-5 text-right font-bold">
                        {idx + 1}.
                      </span>

                      {/* Başlangıç Saniyesi */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-zinc-600">BAŞLA:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={line.startTime}
                          onChange={(e) => handleUpdateLine(idx, 'startTime', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-zinc-900 border border-zinc-800 px-1 py-0.5 text-[9px] font-mono text-[#FFD700] text-center"
                        />
                      </div>

                      {/* Bitiş Saniyesi */}
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-mono text-zinc-600">BİTİR:</span>
                        <input
                          type="number"
                          step="0.1"
                          value={line.endTime}
                          onChange={(e) => handleUpdateLine(idx, 'endTime', parseFloat(e.target.value) || 0)}
                          className="w-14 bg-zinc-900 border border-zinc-800 px-1 py-0.5 text-[9px] font-mono text-zinc-400 text-center"
                        />
                      </div>

                      {/* Satır Metni */}
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => handleUpdateLine(idx, 'text', e.target.value)}
                        className="flex-1 bg-transparent border-b border-zinc-800 focus:border-[#FFD700] px-2 py-0.5 text-xs text-white outline-none font-bold"
                      />

                      {/* Canlı Tap Seçimi */}
                      <button
                        onClick={() => setLiveTapIndex(idx)}
                        title="Bu satırı canlı tap hedefi yap"
                        className={cn(
                          "px-2 py-1 text-[8px] font-mono uppercase border cursor-pointer",
                          isCurrentLive ? "bg-[#FFD700] text-black border-[#FFD700] font-bold" : "text-zinc-500 border-zinc-800 hover:text-white"
                        )}
                      >
                        {isCurrentLive ? 'HEDEF' : 'SEÇ'}
                      </button>

                      {/* Sil */}
                      <button
                        onClick={() => handleDeleteLine(idx)}
                        className="text-red-500 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-[10px] font-mono text-zinc-600">
                  Henüz lirik eklenmedi. Yukarıdaki "1. Akıllı Senkronizasyon" sekmesinden veya "Satır Ekle" butonundan başlayabilirsiniz.
                </div>
              )}
            </div>

            {/* Satır Ekle & Sıfırla Butonları */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <button
                onClick={handleAddLine}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-[#FFD700] text-zinc-300 hover:text-black border border-zinc-800 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} /> SATIR EKLE
              </button>

              <button
                onClick={() => setLiveTapIndex(0)}
                className="text-[8px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={10} /> Canlı Tap Hedefini Başa Al
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
