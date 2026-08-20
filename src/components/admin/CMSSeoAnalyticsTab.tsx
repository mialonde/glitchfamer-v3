import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CMSSeoAnalytics } from '../../types';
import { Search, Save, Globe, Code, ShieldCheck, FileCode, Check, AlertCircle } from 'lucide-react';

export const CMSSeoAnalyticsTab: React.FC = () => {
  const { config, updateSeoAnalytics } = useCMS();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [seoState, setSeoState] = useState<CMSSeoAnalytics>({
    metaTitleTemplate: '%s | GlitchFramer Studio 2.0',
    defaultOgImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    twitterHandle: '@GlitchFramer',
    googleAnalyticsId: 'G-VIDFRAMER20',
    customHeadScripts: '<!-- Analytics Scripts -->',
    customBodyScripts: '',
    robotsTxtContent: 'User-agent: *\nAllow: /\nSitemap: https://vidframer.studio/sitemap.xml',
    sitemapEnabled: true
  });

  useEffect(() => {
    if (config.seoAnalytics) {
      setSeoState(config.seoAnalytics);
    }
  }, [config.seoAnalytics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateSeoAnalytics(seoState);
    setIsSaving(false);

    if (ok) {
      setMessage({ text: 'SEO & Analitik ayarları başarıyla kaydedildi.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: 'Ayarlar güncellenirken bir hata oluştu.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" />
          SEO, Meta & Analitik Ayarları
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Arama motoru indeksleme, OpenGraph sosyal medya paylaşımları, Google Analytics ve özel JavaScript script enjeksiyonlarını yapılandırın.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: OpenGraph & Social Sharing */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
            <Globe className="w-4 h-4" /> Sosyal Medya & OpenGraph Şablonu
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Meta Başlık Şablonu (%s = Sayfa Adı)</label>
              <input
                type="text"
                value={seoState.metaTitleTemplate}
                onChange={e => setSeoState({ ...seoState, metaTitleTemplate: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Twitter Kullanıcı Adı (Twitter Card)</label>
              <input
                type="text"
                value={seoState.twitterHandle}
                onChange={e => setSeoState({ ...seoState, twitterHandle: e.target.value })}
                placeholder="@GlitchFramer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Varsayılan OpenGraph Sosyal Medya Görsel URL'i</label>
            <input
              type="text"
              value={seoState.defaultOgImage}
              onChange={e => setSeoState({ ...seoState, defaultOgImage: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Section 2: Google Analytics & Script Injections */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
            <Code className="w-4 h-4" /> Analitik & Özel Script Enjeksiyonları
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Google Analytics / Tag Manager ID</label>
            <input
              type="text"
              value={seoState.googleAnalyticsId}
              onChange={e => setSeoState({ ...seoState, googleAnalyticsId: e.target.value })}
              placeholder="G-XXXXXX veya GTM-XXXXXX"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Özel &lt;head&gt; Kodları (Pixel / Tracking Code)</label>
            <textarea
              rows={4}
              value={seoState.customHeadScripts}
              onChange={e => setSeoState({ ...seoState, customHeadScripts: e.target.value })}
              placeholder="<!-- <script>...</script> -->"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Özel &lt;body&gt; Kodları (Chat Widget / Live Scripts)</label>
            <textarea
              rows={3}
              value={seoState.customBodyScripts}
              onChange={e => setSeoState({ ...seoState, customBodyScripts: e.target.value })}
              placeholder="<!-- <script>...</script> -->"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Section 3: Robots.txt & Sitemap */}
        <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
            <FileCode className="w-4 h-4" /> Robots.txt & Otomatik Sitemap
          </h4>

          <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
            <div>
              <p className="text-xs font-bold text-white">Otomatik XML Sitemap Oluştur</p>
              <p className="text-[10px] text-zinc-400">Yayınlanan tüm CMS sayfalarını /sitemap.xml adresinde yayınlar.</p>
            </div>
            <input
              type="checkbox"
              checked={seoState.sitemapEnabled}
              onChange={e => setSeoState({ ...seoState, sitemapEnabled: e.target.checked })}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">robots.txt İçeriği</label>
            <textarea
              rows={4}
              value={seoState.robotsTxtContent}
              onChange={e => setSeoState({ ...seoState, robotsTxtContent: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Kaydediliyor...' : 'SEO Ayarlarını Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};
