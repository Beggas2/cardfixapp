import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, BarChart3, Users, Calendar } from 'lucide-react';
import type { Report } from '~backend/reports/types';
import { useAuth } from '../hooks/useAuth';

export function ReportsPanel() {
  const { getAuthenticatedBackend } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'progress' | 'performance' | 'comparison' | 'detailed'>('progress');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.reports.list();
      setReports(response.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      const backend = getAuthenticatedBackend();
      
      await backend.reports.generate({
        type: selectedType,
      });
      
      await loadReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (report: Report) => {
    // Create a simple text export of the report
    const content = `
RELATÓRIO: ${report.title}
Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}

${JSON.stringify(report.reportData, null, 2)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { value: 'progress', label: 'Progresso', icon: TrendingUp, description: 'Visão geral do seu progresso' },
    { value: 'performance', label: 'Performance', icon: BarChart3, description: 'Análise de desempenho detalhada' },
    { value: 'comparison', label: 'Comparativo', icon: Users, description: 'Compare com outros usuários' },
    { value: 'detailed', label: 'Detalhado', icon: FileText, description: 'Relatório completo e abrangente' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Relatórios</h2>
      
      {/* Generate New Report */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Gerar Novo Relatório</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value as any)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedType === type.value
                  ? 'bg-cyan-600/20 border border-cyan-500'
                  : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              <type.icon className={`h-6 w-6 mb-2 ${
                selectedType === type.value ? 'text-cyan-400' : 'text-slate-400'
              }`} />
              <h4 className={`font-semibold ${
                selectedType === type.value ? 'text-cyan-300' : 'text-white'
              }`}>
                {type.label}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {type.description}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={generateReport}
          disabled={isGenerating}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Gerar Relatório
            </>
          )}
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Relatórios Gerados</h3>
        
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum relatório gerado ainda</p>
            <p className="text-slate-500 text-sm">Gere seu primeiro relatório acima</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div
                key={report.id}
                className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-cyan-600/20 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{report.title}</h4>
                    <p className="text-slate-400 text-sm">
                      Tipo: {report.type} • Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportReport(report)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg"
                    title="Exportar relatório"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
