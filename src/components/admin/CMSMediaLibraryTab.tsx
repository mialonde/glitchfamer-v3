import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CMSMediaItem } from '../../types';
import { Image as ImageIcon, Plus, Trash2, Copy, Check, Search, Filter, UploadCloud, Tag, Film, Music, Shield, Box } from 'lucide-react';

export const CMSMediaLibraryTab: React.FC = () => {
  const { mediaAssets, saveMediaAsset, deleteMediaAsset } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Media Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | '3D_AVATAR' | 'LOGO' | 'WATERMARK';
    url: string;
    tags: string;
  }>({
    name: '',
    type: 'IMAGE',
    url: '',
    tags: 'general'
  });

  const mediaTypes = [
    { id: 'ALL', label: 'Tüm Medyalar' },
    { id: 'IMAGE', label: 'Görseller' },
    { id: 'LOGO', label: 'Logolar & Amblemler' },
    { id: 'WATERMARK', label: 'Filigranlar (Watermark)' },
    { id: 'VIDEO', label: 'Arkaplan Videoları' },
    { id: 'AUDIO', label: 'Ses & Müzikler' },
    { id: '3D_AVATAR', label: '3D VRM Avatarlar' }
  ];

  const filteredAssets = (mediaAssets || []).filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`'${name}' medyasını kütüphaneden silmek istediğinize emin misiniz?`)) {
      const ok = await deleteMediaAsset(id);
      if (ok) {
        setMessage({ text: 'Medya silindi.', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Medya silinemedi.', type: 'error' });
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.url) {
      setMessage({ text: 'Medya adı ve URL zorunludur.', type: 'error' });
      return;
    }

    setIsUploading(true);
    const tagsArray = newAsset.tags.split(',').map(t => t.trim()).filter(Boolean);
    const ok = await saveMediaAsset({
      name: newAsset.name,
      type: newAsset.type,
      url: newAsset.url,
      tags: tagsArray.length > 0 ? tagsArray : ['general']
    });
    setIsUploading(false);

    if (ok) {
      setMessage({ text: 'Yeni medya başarıyla eklendi.', type: 'success' });
      setShowAddModal(false);
      setNewAsset({ name: '', type: 'IMAGE', url: '', tags: 'general' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: 'Medya ekleme başarısız oldu.', type: 'error' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Film className="w-4 h-4 text-purple-400" />;
      case 'AUDIO': return <Music className="w-4 h-4 text-blue-400" />;
      case 'WATERMARK': return <Shield className="w-4 h-4 text-amber-400" />;
      case 'LOGO': return <Shield className="w-4 h-4 text-emerald-400" />;
      case '3D_AVATAR': return <Box className="w-4 h-4 text-pink-400" />;
      default: return <ImageIcon className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            Medya & Dosya Kütüphanesi
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Görseller, logolar, filigranlar, video arka planları ve 3D VRM varlıklarını yönetin.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-400/20"
        >
          <Plus className="w-4 h-4" /> Medya Ekle
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="İsim veya etiket ile medya ara..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {mediaTypes.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedType === t.id ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid Display */}
      {filteredAssets.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
          <UploadCloud className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="text-sm font-medium">Kütüphanede bu filtreye uygun medya bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="group bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all flex flex-col justify-between">
              {/* Media Thumbnail */}
              <div className="relative h-44 bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-800/80">
                {asset.type === 'IMAGE' || asset.type === 'LOGO' || asset.type === 'WATERMARK' ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    {getTypeIcon(asset.type)}
                    <span className="text-xs font-mono text-zinc-400 truncate max-w-[180px]">{asset.name}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-zinc-800">
                  {getTypeIcon(asset.type)}
                  {asset.type}
                </div>
              </div>

              {/* Info Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white truncate" title={asset.name}>{asset.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{asset.url}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {asset.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[9px] font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <button
                    onClick={() => handleCopyUrl(asset.url, asset.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === asset.id ? 'Kopyalandı' : 'URL Kopyala'}
                  </button>

                  <button
                    onClick={() => handleDelete(asset.id, asset.name)}
                    className="p-1.5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                    title="Medyayı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Yeni Medya / Varlık Ekle</h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Medya Adı *</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="örn: Siberpunk Banner 4K"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Medya Türü</label>
                <select
                  value={newAsset.type}
                  onChange={e => setNewAsset({ ...newAsset, type: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="IMAGE">Görsel / Banner</option>
                  <option value="LOGO">Logo / Amblem</option>
                  <option value="WATERMARK">Filigran / Filigran Katmanı</option>
                  <option value="VIDEO">Video Arkaplan</option>
                  <option value="AUDIO">Ses Dosyası</option>
                  <option value="3D_AVATAR">3D VRM Model</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Medya Bağlantısı (URL) *</label>
                <input
                  type="text"
                  value={newAsset.url}
                  onChange={e => setNewAsset({ ...newAsset, url: e.target.value })}
                  placeholder="https://..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Etiketler (Virgülle ayırın)</label>
                <input
                  type="text"
                  value={newAsset.tags}
                  onChange={e => setNewAsset({ ...newAsset, tags: e.target.value })}
                  placeholder="cyberpunk, background, gold"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-medium"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-xl"
                >
                  {isUploading ? 'Ekleniyor...' : 'Kütüphaneye Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
