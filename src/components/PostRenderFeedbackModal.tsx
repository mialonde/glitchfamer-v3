import React, { useState } from 'react';
import { 
  ThumbsUp, ThumbsDown, X, Check, Heart, 
  MessageSquare, Sparkles, Send, CheckCircle2 
} from 'lucide-react';
import { savePostRenderFeedback } from '../lib/creatorTemplatesData';

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
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl text-zinc-100 relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
        >
          <X size={16} />
        </button>

        {isSubmitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Geri Bildiriminiz Alındı!</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              Değerli geri bildiriminiz GlitchFramer görselleştirici motorunu ve render kalitesini geliştirmek için kaydedildi.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* HEADER */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase">
                <Sparkles size={11} /> RENDER GERİ BİLDİRİMİ
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Bu çıktıyı beğendiniz mi?
              </h3>
              <p className="text-xs text-zinc-400">
                1 saniyede tek tıklamayla deneyiminizi puanlayın:
              </p>
            </div>

            {/* BIG THUMBS BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickThumb('THUMBS_UP')}
                className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  rating === 'THUMBS_UP'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-emerald-500/50 text-zinc-300'
                }`}
              >
                <ThumbsUp size={28} className={rating === 'THUMBS_UP' ? 'text-emerald-400' : 'text-zinc-400'} />
                <span className="text-xs font-bold font-mono">ÇOK İYİ 👍</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickThumb('THUMBS_DOWN')}
                className={`py-4 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  rating === 'THUMBS_DOWN'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 shadow-lg'
                    : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-rose-500/50 text-zinc-300'
                }`}
              >
                <ThumbsDown size={28} className={rating === 'THUMBS_DOWN' ? 'text-rose-400' : 'text-zinc-400'} />
                <span className="text-xs font-bold font-mono">GELİŞTİRİLMELİ 👎</span>
              </button>
            </div>

            {/* REASON TAGS */}
            {rating && (
              <div className="space-y-2 animate-in fade-in-50 duration-200">
                <label className="text-[11px] font-semibold text-zinc-300 block">
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
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                          isSelected
                            ? rating === 'THUMBS_UP'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-850'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* OPTIONAL SHORT NOTE */}
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Eklemek istediğiniz kısa bir not (isteğe bağlı)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {rating && (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Send size={13} />
                GERİ BİLDİRİMİ GÖNDER
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
