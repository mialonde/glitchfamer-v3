import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CMSFormSubmission } from '../../types';
import { Inbox, Mail, Trash2, CheckCircle, Clock, AlertTriangle, Search, Filter, MessageSquare, Send } from 'lucide-react';

export const CMSInboxFeedbackTab: React.FC = () => {
  const { inboxMessages, updateInboxMessageStatus, deleteInboxMessage } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeMessage, setActiveMessage] = useState<CMSFormSubmission | null>(null);
  const [replyText, setReplyText] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const statuses = ['ALL', 'YENİ', 'İNCELENİYOR', 'YANITLANDI', 'ARŞİV'];

  const filteredMessages = (inboxMessages || []).filter(msg => {
    const matchesSearch = msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || msg.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    const ok = await updateInboxMessageStatus(id, status);
    if (ok) {
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, status: status as any });
      }
      setMessage({ text: `Mesaj durumu '${status}' yapıldı.`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      const ok = await deleteInboxMessage(id);
      if (ok) {
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage(null);
        }
        setMessage({ text: 'Mesaj silindi.', type: 'success' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeMessage) return;

    handleStatusChange(activeMessage.id, 'YANITLANDI');
    alert(`E-posta Simülasyonu: '${activeMessage.senderEmail}' adresine yanıt başarıyla gönderildi!\n\nYanıt Metni:\n${replyText}`);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            Gelen Kutusu & Kullanıcı Görüşleri
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            İletişim formları, hata bildirimleri, feature isteği ve destek mesajlarını yönetin.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Gönderen veya konu ara..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedStatus === st ? 'bg-amber-400 text-black font-bold' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Split View: List on left, active message on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs">Gelen kutusunda mesaj bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setActiveMessage(msg)}
                  className={`p-4 cursor-pointer transition-colors space-y-2 ${activeMessage?.id === msg.id ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-zinc-800/40'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">{msg.senderName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${msg.status === 'YENİ' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-300 truncate">{msg.subject}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                    <span>{msg.category}</span>
                    <span>{new Date(msg.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail & Reply Box */}
        <div className="lg:col-span-7 bg-zinc-900/60 rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between min-h-[400px]">
          {activeMessage ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">{activeMessage.subject}</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Gönderen: <span className="text-amber-400 font-medium">{activeMessage.senderName}</span> ({activeMessage.senderEmail})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={activeMessage.status}
                    onChange={e => handleStatusChange(activeMessage.id, e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                  >
                    <option value="YENİ">YENİ</option>
                    <option value="İNCELENİYOR">İNCELENİYOR</option>
                    <option value="YANITLANDI">YANITLANDI</option>
                    <option value="ARŞİV">ARŞİV</option>
                  </select>
                  <button
                    onClick={() => handleDelete(activeMessage.id)}
                    className="p-1.5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 rounded-lg"
                    title="Mesajı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                {activeMessage.message}
              </div>

              {/* Reply Section */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-zinc-800">
                <label className="text-xs font-semibold text-zinc-400 uppercase flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  Kullanıcıya Doğrudan Yanıt Gönder
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Yanıtınızı buraya yazın..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> E-posta İle Yanıtla
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto text-center text-zinc-500 space-y-2">
              <Mail className="w-10 h-10 text-zinc-600" />
              <p className="text-xs">Detaylarını ve yanıt seçeneklerini görmek için sol listeden bir mesaj seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
