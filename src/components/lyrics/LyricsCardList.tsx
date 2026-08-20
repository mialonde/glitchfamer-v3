import React from 'react';
import { Play, Copy, Trash2, Music } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { SyncedLine } from '../../types';
import { cn } from '../../lib/utils';

interface LyricsCardListProps {
  syncedLyrics: SyncedLine[];
  currentTime: number;
  liveTapIndex: number;
  lyricsTranslationEnabled?: boolean;
  onPreviewLine: (startTime: number) => void;
  onUpdateLine: (index: number, field: keyof SyncedLine, value: any) => void;
  onNudgeLineTime: (index: number, delta: number) => void;
  onSetLiveTapIndex: (index: number) => void;
  onDuplicateLine: (index: number) => void;
  onDeleteLine: (index: number) => void;
  onSeek?: (time: number) => void;
  onLoadDemoLyrics?: () => void;
}

export const LyricsCardList: React.FC<LyricsCardListProps> = ({
  syncedLyrics,
  currentTime,
  liveTapIndex,
  lyricsTranslationEnabled = false,
  onPreviewLine,
  onUpdateLine,
  onNudgeLineTime,
  onSetLiveTapIndex,
  onDuplicateLine,
  onDeleteLine,
  onSeek,
  onLoadDemoLyrics
}) => {
  const formatTimeSeconds = (sec: number) => {
    const numSec = Number(sec) || 0;
    const m = Math.floor(numSec / 60);
    const s = Number(numSec % 60 || 0).toFixed(2);
    return `${m}:${s.padStart(5, '0')}`;
  };

  return (
    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 border border-border-subtle p-2 bg-panel/60 rounded-lg custom-scrollbar">
      {syncedLyrics.length > 0 ? (
        syncedLyrics.map((line, idx) => {
          const isCurrentLive = idx === liveTapIndex;
          const isCurrentTimeActive = currentTime >= line.startTime && currentTime <= line.endTime;
          const durationSpan = Math.max(0.1, line.endTime - line.startTime);

          return (
            <Card
              key={idx}
              id={`lyric-line-card-${idx}`}
              className={cn(
                "p-2.5 transition-all space-y-2",
                isCurrentLive
                  ? "border-accent bg-accent/10 ring-1 ring-accent/40 shadow-sm"
                  : isCurrentTimeActive
                  ? "border-accent/60 bg-accent/10"
                  : "border-border-subtle bg-surface/60 hover:bg-surface hover:border-border-strong"
              )}
            >
              {/* ÜST SATIR: Sıra, Zaman Rozetleri, Nudge ve Aksiyonlar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Sol: Sıra No ve Çal Butonu */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onPreviewLine(line.startTime)}
                    title="Bu satırı dinle (0.3sn öncesinden çalar)"
                    className="w-6 h-6 bg-surface hover:bg-accent hover:text-accent-foreground border border-border-subtle rounded flex items-center justify-center text-accent transition-all cursor-pointer shadow-sm"
                  >
                    <Play size={10} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-content-secondary px-1.5 py-0.5 bg-panel rounded border border-border-subtle">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Orta: Başlangıç / Bitiş Zaman Damgaları & Süre */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 bg-panel px-2 py-0.5 rounded border border-border-subtle">
                    <span className="text-[8px] font-bold text-content-tertiary uppercase">BŞL:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={line.startTime}
                      onChange={(e) => onUpdateLine(idx, 'startTime', parseFloat(e.target.value) || 0)}
                      className="w-13 bg-transparent text-accent font-mono text-xs font-bold text-center outline-none"
                    />
                    <span className="text-content-tertiary text-xs">➔</span>
                    <span className="text-[8px] font-bold text-content-tertiary uppercase">BTM:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={line.endTime}
                      onChange={(e) => onUpdateLine(idx, 'endTime', parseFloat(e.target.value) || 0)}
                      className="w-13 bg-transparent text-content-primary font-mono text-xs font-bold text-center outline-none"
                    />
                  </div>

                  <span className="text-[9px] font-mono text-content-secondary bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                    {Number(durationSpan || 0).toFixed(1)}s
                  </span>
                </div>

                {/* Sağ: Mikro Nudge (-0.1 / +0.1) & Aksiyon Araçları */}
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onNudgeLineTime(idx, -0.1)}
                    title="0.1s geriye al"
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold h-6"
                  >
                    -0.1s
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => onNudgeLineTime(idx, 0.1)}
                    title="0.1s ileriye al"
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold h-6"
                  >
                    +0.1s
                  </Button>

                  <Button
                    type="button"
                    variant={isCurrentLive ? "accent" : "outline"}
                    size="xs"
                    onClick={() => onSetLiveTapIndex(idx)}
                    title="Canlı tap hedefine ayarla"
                    className="text-[8.5px] font-bold uppercase h-6 px-2"
                  >
                    {isCurrentLive ? 'HEDEF' : 'TAP SEÇ'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onDuplicateLine(idx)}
                    title="Satırı çoğalt"
                    className="h-6 w-6 p-0 text-content-secondary hover:text-content-primary"
                  >
                    <Copy size={11} />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onDeleteLine(idx)}
                    title="Satırı sil"
                    className="h-6 w-6 p-0 text-content-tertiary hover:text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>

              </div>

              {/* ALT SATIR: TAM GENİŞLİK ŞARKI SÖZÜ METİN GİRİŞİ & ÇEVİRİ ALANI */}
              <div className="w-full space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Input
                    type="text"
                    value={line.text}
                    onChange={(e) => onUpdateLine(idx, 'text', e.target.value)}
                    placeholder="Şarkı sözü metnini girin..."
                    className="flex-1 text-xs font-semibold"
                  />
                  {onSeek && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSeek(line.startTime)}
                      title="Zaman çizgisine atla"
                      className="text-[10px] font-mono font-bold shrink-0 h-8"
                    >
                      {formatTimeSeconds(line.startTime)}
                    </Button>
                  )}
                </div>

                {/* İsteğe Bağlı Çeviri / Romanizasyon Alanı */}
                {lyricsTranslationEnabled && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[8px] font-bold uppercase text-accent shrink-0">ÇEVİRİ:</span>
                    <Input
                      type="text"
                      value={line.translation || ''}
                      onChange={(e) => onUpdateLine(idx, 'translation', e.target.value)}
                      placeholder="Alt satır çevirisi veya romanizasyon..."
                      className="flex-1 text-[11px] h-7"
                    />
                  </div>
                )}
              </div>

              {/* Satırlar Arası Enstrümantal / Solo Boşluğu Tespiti */}
              {idx < syncedLyrics.length - 1 && (
                (() => {
                  const next = syncedLyrics[idx + 1];
                  const gap = next ? next.startTime - line.endTime : 0;
                  if (gap >= 2.4) {
                    return (
                      <div className="mt-2 py-1 px-2.5 bg-accent/5 border border-accent/20 rounded-md flex items-center justify-between text-[9px] font-mono text-accent">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Music size={11} className="text-accent" />
                          <span>{Number(gap || 0).toFixed(1)}s ENSTRÜMANTAL BOŞLUK / NEFES</span>
                        </span>
                        <span className="font-bold tracking-widest text-[10px]">• • •</span>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </Card>
          );
        })
      ) : (
        <div className="text-center py-10 space-y-3">
          <Music size={28} className="mx-auto text-content-tertiary" />
          <p className="text-xs text-content-secondary font-semibold">Henüz senkronize edilmiş şarkı sözü bulunmuyor.</p>
          {onLoadDemoLyrics && (
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={onLoadDemoLyrics}
                className="text-xs font-bold uppercase"
              >
                Demo Sözleri Yükle
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
