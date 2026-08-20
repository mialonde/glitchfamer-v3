import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CMSPageItem } from '../../types';
import { FileText, Plus, Edit, Trash2, Eye, CheckCircle, Clock, Search, Globe, Tag, Sparkles, ArrowLeft } from 'lucide-react';

export const CMSPagesTab: React.FC = () => {
  const { pages, savePage, deletePage } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingPage, setEditingPage] = useState<Partial<CMSPageItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [previewPage, setPreviewPage] = useState<CMSPageItem | null>(null);

  const categories: ('ALL' | 'SAYFA' | 'DUYURU' | 'BLOG' | 'YASAL' | 'SSS')[] = ['ALL', 'SAYFA', 'DUYURU', 'BLOG', 'YASAL', 'SSS'];

  const filteredPages = (pages || []).filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateNew = () => {
    setEditingPage({
      title: '',
      slug: '',
      category: 'SAYFA',
      content: '',
      coverImageUrl: '',
      status: 'YAYINDA',
      author: 'GlitchFramer Admin',
      seoTitle: '',
      seoDescription: ''
    });
  };

  const handleEdit = (page: CMSPageItem) => {
    setEditingPage({ ...page });
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`'${title}' sayfasını silmek istediğinize emin misiniz?`)) {
      const ok = await deletePage(id);
      if (ok) {
        setMessage({ text: 'Sayfa silindi.', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Sayfa silinemedi.', type: 'error' });
      }
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title || !editingPage?.content) {
      setMessage({ text: 'Lütfen sayfa başlığı ve içerik alanını doldurun.', type: 'error' });
      return;
    }

    setIsSaving(true);
    const ok = await savePage(editingPage);
    setIsSaving(false);

    if (ok) {
      setMessage({ text: 'Sayfa başarıyla kaydedildi.', type: 'success' });
      setEditingPage(null);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: 'Kaydetme sırasında bir hata oluştu.', type: 'error' });
    }
  };

  // Render Full Page Preview Modal
  if (previewPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <button
            onClick={() => setPreviewPage(null)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Editöre Dön
          </button>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${previewPage.status === 'YAYINDA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {previewPage.status}
            </span>
            <span className="text-xs text-zinc-400">Yazar: {previewPage.author}</span>
          </div>
        </div>

        <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 space-y-6 max-w-4xl mx-auto shadow-2xl">
          {previewPage.coverImageUrl && (
            <img 
              src={previewPage.coverImageUrl} 
              alt={previewPage.title} 
              className="w-full h-64 object-cover rounded-xl border border-zinc-800"
            />
          )}
          <div className="space-y-2">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">{previewPage.category}</span>
            <h1 className="text-3xl font-bold text-white tracking-tight">{previewPage.title}</h1>
            <p className="text-xs text-zinc-500 font-mono">/pages/{previewPage.slug}</p>
          </div>
          <div className="border-t border-zinc-800 pt-6 text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
            {previewPage.content}
          </div>
        </div>
      </div>
    );
  }

  // Render Page Form Editor
  if (editingPage) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingPage(null)}
              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white">
              {editingPage.id ? 'Sayfayı Düzenle' : 'Yeni Sayfa / Duyuru Ekle'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSaveSubmit} className="space-y-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sayfa / İçerik Başlığı *</label>
              <input
                type="text"
                value={editingPage.title || ''}
                onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                placeholder="örn: Stüdyo Kullanım Rehberi"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kategori</label>
              <select
                value={editingPage.category || 'SAYFA'}
                onChange={e => setEditingPage({ ...editingPage, category: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="SAYFA">SAYFA (Genel Statik Sayfa)</option>
                <option value="DUYURU">DUYURU (Güncelleme & Haber)</option>
                <option value="BLOG">BLOG (Rehber & Makale)</option>
                <option value="YASAL">YASAL (Gizlilik, Kullanım Şartları)</option>
                <option value="SSS">SSS (Sıkça Sorulan Sorular)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">URL Bağlantı Adı (Slug)</label>
              <input
                type="text"
                value={editingPage.slug || ''}
                onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })}
                placeholder="otomatik olusturulur (orn: kullanim-rehberi)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 text-sm focus:outline-none focus:border-amber-400 font-mono transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Yayın Durumu</label>
              <select
                value={editingPage.status || 'YAYINDA'}
                onChange={e => setEditingPage({ ...editingPage, status: e.target.value as any })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              >
                <option value="YAYINDA">YAYINDA (Canlıda Aktif)</option>
                <option value="TASLAK">TASLAK (Gizli / Taslak)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kapak Görseli URL (Opsiyonel)</label>
            <input
              type="text"
              value={editingPage.coverImageUrl || ''}
              onChange={e => setEditingPage({ ...editingPage, coverImageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sayfa İçeriği (Markdown / Metin) *</label>
              <span className="text-xs text-zinc-500 font-mono">Markdown Format Destekli</span>
            </div>
            <textarea
              rows={12}
              value={editingPage.content || ''}
              onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
              placeholder="# Başlık&#10;&#10;Sayfa içeriğini buraya yazın..."
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white text-sm font-mono focus:outline-none focus:border-amber-400 leading-relaxed transition-colors"
            />
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Özel SEO & Arama Motoru Ayarları
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={editingPage.seoTitle || ''}
                onChange={e => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                placeholder="Özel SEO Başlığı (Meta Title)"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={editingPage.seoDescription || ''}
                onChange={e => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                placeholder="Arama Motoru Açıklaması (Meta Description)"
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20 disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : 'Sayfayı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Sayfa & İçerik Yönetimi
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Statik sayfalar, duyurular, rehberler ve yasal kullanım şartları metinlerini yönetin.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20"
        >
          <Plus className="w-4 h-4" /> Yeni Sayfa Ekle
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Sayfalar arasında ara..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedCategory === cat ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <FileText className="w-10 h-10 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">Kriterlere uygun kayıtlı sayfa bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-4">Sayfa Başlığı</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Görüntülenme</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredPages.map(page => (
                  <tr key={page.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        {page.coverImageUrl ? (
                          <img src={page.coverImageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-zinc-800" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white font-medium">{page.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">Yazar: {page.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md font-mono text-[10px] font-bold">
                        {page.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      /pages/{page.slug}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${page.status === 'YAYINDA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                        {page.status === 'YAYINDA' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {page.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">
                      {page.views || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewPage(page)}
                          title="Önizle"
                          className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(page)}
                          title="Düzenle"
                          className="p-2 hover:bg-zinc-800 text-amber-400 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          title="Sil"
                          className="p-2 hover:bg-zinc-800 text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
