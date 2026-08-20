import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { History, Search, RefreshCw, ShieldAlert, Activity, User, Calendar } from 'lucide-react';

export const CMSAuditLogsTab: React.FC = () => {
  const { config, refreshConfig } = useCMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const logs = config.auditLogs || [];

  const filteredLogs = logs.filter(log => {
    return log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.user.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshConfig();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Denetim & Aktivite Logları (Audit Logs)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Yönetici panelinde gerçekleşen tüm yapılandırma değişiklikleri, oturum açma işlemleri ve veri silme olayları zaman damgasıyla günlüğe kaydedilir.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs rounded-xl transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Logları Yenile
        </button>
      </div>

      {/* Filter and Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="İşlem veya kullanıcı adı ile log ara..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-2">
            <Activity className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-xs">Henüz kayıtlı aktivite logu bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-4">Zaman Damgası</th>
                  <th className="p-4">Yapılan İşlem</th>
                  <th className="p-4">Kullanıcı</th>
                  <th className="p-4">Detay / Değişiklik</th>
                  <th className="p-4">IP Adresi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('tr-TR')}
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      {log.action}
                    </td>
                    <td className="p-4 text-white">
                      {log.user}
                    </td>
                    <td className="p-4 text-zinc-300 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-4 text-zinc-500">
                      {log.ip || '127.0.0.1'}
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
