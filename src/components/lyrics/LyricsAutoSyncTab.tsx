import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '../ui';

interface LyricsAutoSyncTabProps {
  rawTextInput: string;
  duration: number;
  onRawTextChange: (val: string) => void;
  onAutoSync: () => void;
}

export const LyricsAutoSyncTab: React.FC<LyricsAutoSyncTabProps> = ({
  rawTextInput,
  duration,
  onRawTextChange,
  onAutoSync,
}) => {
  const lineCount = rawTextInput.split('\n').filter(l => l.trim().length > 0).length;

  return (
    <div className="space-y-3.5 bg-panel/70 p-4 border border-border-subtle rounded-lg">
      <div className="space-y-1">
        <label className="text-xs font-bold text-content-primary uppercase flex items-center gap-1.5">
          <Zap size={14} className="text-accent" />
          HAM ŞARKI SÖZLERİNİ ŞARKI SÜRESİNE OTOMATİK DAĞIT
        </label>
        <p className="text-[10px] text-content-secondary">
          Şarkı sözlerini satır satır yapıştırın. Sistem şarkının toplam süresine ({Math.floor(duration || 180)} sn) göre akıllıca eşit aralıklarla başlangıç/bitiş zamanları oluşturur.
        </p>
      </div>

      <textarea
        rows={8}
        value={rawTextInput}
        onChange={(e) => onRawTextChange(e.target.value)}
        placeholder="Şarkı sözlerini buraya yapıştırın..."
        className="w-full bg-panel border border-border-subtle p-3 text-xs text-content-primary rounded-md outline-none focus:border-accent font-sans"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-content-tertiary">
          {lineCount} satır tespit edildi.
        </span>

        <Button
          type="button"
          variant="accent"
          size="sm"
          onClick={onAutoSync}
          className="font-bold text-xs uppercase tracking-wider gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
        >
          <Zap size={14} />
          <span>AKILLI SENKRONİZASYONU ÇALIŞTIR</span>
        </Button>
      </div>
    </div>
  );
};
