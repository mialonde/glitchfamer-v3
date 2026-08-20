import React, { useState } from 'react';
import { 
  ThumbsUp, ThumbsDown, X, Sparkles, Send, CheckCircle2 
} from 'lucide-react';
import { savePostRenderFeedback } from '../lib/creatorTemplatesData';
import { Button, Badge, Input } from './ui';
import { cn } from '../lib/utils';

interface PostRenderFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualizer: string;
  resolution: string;
  durationSec: number;
}

const POSITIVE_TAGS = [
  'Mükemmel Ses Senkronu',
  'Ultra Akıcı 60 FPS',
  'Renkler ve Işıma Harika',
  'Hızlı Render',
  'Suno AI Lirik Uyumu',
  'Spotify İçin Mükemmel'
];

const NEGATIVE_TAGS = [
  'Yavaş Render Aldı',
  'Görüntü Kalitesiz / Bulanık',
  'Arayüz Karmaşık',
  'Beklediğim Gibi Değil',
  'Ses / Bas Senkron Hatası',
  'Tarayıcı Kasıyor'
];

export const PostRenderFeedbackModal: React.FC<PostRenderFeedbackModalProps> = ({
  isOpen,
  onClose,
  visualizer,
  resolution,
  durationSec
}) => {
  const [rating, setRating] = useState<'THUMBS_UP' | 'THUMBS_DOWN' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (chosenRating?: 'THUMBS_UP' | 'THUMBS_DOWN') => {
    const finalRating = chosenRating || rating || 'THUMBS_UP';
    savePostRenderFeedback({
      id: 'fb_' + Date.now(),
      rating: finalRating,
      reasons: selectedTags,
      comment: comment.trim() || undefined,
      visualizer: visualizer || 'DREAM_PERFORMER',
      resolution: resolution || '9/16',
      durationSec: durationSec || 60,
      timestamp: Date.now()
    });

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setRating(null);
      setSelectedTags([]);
      setComment('');
    }, 1800);
  };

  const handleQuickThumb = (thumb: 'THUMBS_UP' | 'THUMBS_DOWN') => {
    setRating(thumb);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-panel border border-border-subtle rounded-xl w-full max-w-md p-6 shadow-elevation-3 text-content-primary relative">
        {/* CLOSE BUTTON */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="absolute top-4 right-4"
          aria-label="Kapat"
        >
          <X size={15} />
        </Button>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-content-primary">Geri Bildiriminiz Alındı!</h3>
            <p className="text-xs text-content-secondary max-w-xs">
              Değerli geri bildiriminiz GlitchFramer görselleştirici motorunu ve render kalitesini geliştirmek için kaydedildi.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* HEADER */}
            <div className="text-center space-y-1.5">
              <Badge variant="accent" className="text-[10px]">
                <Sparkles size={11} className="mr-1 inline" /> RENDER GERİ BİLDİRİMİ
              </Badge>
              <h3 className="text-base font-bold text-content-primary tracking-wide">
                Bu çıktıyı beğendiniz mi?
              </h3>
              <p className="text-xs text-content-secondary">
                1 saniyede tek tıklamayla deneyiminizi puanlayın:
              </p>
            </div>

            {/* BIG THUMBS BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickThumb('THUMBS_UP')}
                className={cn(
                  "py-3.5 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                  rating === 'THUMBS_UP'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-elevation-2'
                    : 'bg-surface/50 border-border-subtle hover:bg-surface hover:border-emerald-500/50 text-content-secondary'
                )}
              >
                <ThumbsUp size={24} className={rating === 'THUMBS_UP' ? 'text-emerald-400' : 'text-content-tertiary'} />
                <span className="text-xs font-bold font-mono">ÇOK İYİ 👍</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickThumb('THUMBS_DOWN')}
                className={cn(
                  "py-3.5 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
                  rating === 'THUMBS_DOWN'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 shadow-elevation-2'
                    : 'bg-surface/50 border-border-subtle hover:bg-surface hover:border-rose-500/50 text-content-secondary'
                )}
              >
                <ThumbsDown size={24} className={rating === 'THUMBS_DOWN' ? 'text-rose-400' : 'text-content-tertiary'} />
                <span className="text-xs font-bold font-mono">GELİŞTİRİLMELİ 👎</span>
              </button>
            </div>

            {/* REASON TAGS */}
            {rating && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-semibold text-content-primary block">
                  {rating === 'THUMBS_UP' ? 'En çok neyi beğendiniz?' : 'Hangi konuda sorun yaşadınız?'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(rating === 'THUMBS_UP' ? POSITIVE_TAGS : NEGATIVE_TAGS).map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border",
                          isSelected
                            ? rating === 'THUMBS_UP'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-surface text-content-secondary border-border-subtle hover:text-content-primary hover:bg-surface-hover'
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* OPTIONAL SHORT NOTE */}
                <div className="pt-2">
                  <Input
                    placeholder="Eklemek istediğiniz kısa bir not (isteğe bağlı)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {rating && (
              <Button
                variant="accent"
                onClick={() => handleSubmit()}
                className="w-full font-bold text-xs uppercase tracking-wider gap-2"
              >
                <Send size={13} />
                GERİ BİLDİRİMİ GÖNDER
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

