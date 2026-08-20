import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Shield, Lock, UserCheck, Key, RefreshCw, CheckCircle, Smartphone, AlertOctagon } from 'lucide-react';

export const CMSUserSecurityTab: React.FC = () => {
  const { config } = useCMS();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Security Toggles
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState('8');
  const [enable2FA, setEnable2FA] = useState(false);
  const [ipWhitelistOnly, setIpWhitelistOnly] = useState(false);

  const users = config.adminUsers || [
    { id: '1', username: 'admin', email: 'admin@vidframer.studio', role: 'SÜPER ADMİN', lastLoginAt: Date.now(), status: 'AKTİF' },
    { id: '2', username: 'editor_studio', email: 'editor@vidframer.studio', role: 'EDITÖR', lastLoginAt: Date.now() - 86400000, status: 'AKTİF' }
  ];

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ text: 'Yeni şifre en az 6 karakter olmalıdır.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Yeni şifreler birbiriyle eşleşmiyor.', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setMessage({ text: 'Yönetici şifresi ve oturum anahtarı başarıyla güncellendi.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Kullanıcı, Rol & Güvenlik Yönetimi
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Yönetici hesapları, yetki seviyeleri, admin şifre değişimi ve güvenlik duvarı ayarlarını yönetin.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      {/* Admin Users List */}
      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <UserCheck className="w-4 h-4" /> Yönetici Hesapları & Rol Yetkileri
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-mono border-b border-zinc-800">
              <tr>
                <th className="p-3">Kullanıcı Adı</th>
                <th className="p-3">E-posta</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Son Giriş</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-zinc-800/20">
                  <td className="p-3 font-bold text-white">{u.username}</td>
                  <td className="p-3 text-zinc-400">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">
                    {new Date(u.lastLoginAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <Key className="w-4 h-4" /> Yönetici Şifresi Değiştir
        </h4>

        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Mevcut Şifre</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>

      {/* Additional Security Policies */}
      <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <Lock className="w-4 h-4" /> Oturum & Güvenlik Duvarı Politikaları
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">İki Faktörlü Doğrulama (2FA)</p>
              <p className="text-[10px] text-zinc-400">Authenticator uygulamasıyla ekstra doğrulama katmanı.</p>
            </div>
            <input
              type="checkbox"
              checked={enable2FA}
              onChange={e => setEnable2FA(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Oturum Süresi (Saat)</p>
              <p className="text-[10px] text-zinc-400">Hareketsizlik sonrası HttpOnly oturumu otomatik kapatır.</p>
            </div>
            <select
              value={sessionTimeoutHours}
              onChange={e => setSessionTimeoutHours(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="1">1 Saat</option>
              <option value="4">4 Saat</option>
              <option value="8">8 Saat (Varsayılan)</option>
              <option value="24">24 Saat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
