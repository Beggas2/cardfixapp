import React, { useState, useEffect } from 'react';
import type { LogEntry } from '~backend/logs/types';
import { useAuth } from '../hooks/useAuth';

export function AdminDashboard() {
  const { getAuthenticatedBackend } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.logs.list();
      setLogs(response.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Painel de Administração</h2>
      
      <div className="bg-slate-800 p-6 rounded-xl">
        <h3 className="font-semibold text-white mb-4">Logs de Atividade Recentes</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {logs.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded-lg ${
                log.level === 'ERROR' ? 'bg-red-500/10' : 'bg-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-bold text-sm ${
                  log.level === 'ERROR' ? 'text-red-400' : 'text-cyan-400'
                }`}>
                  {log.level}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">{log.message}</p>
              {log.details && (
                <pre className="text-xs text-slate-500 mt-2 overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
