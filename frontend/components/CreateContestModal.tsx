import React, { useState } from 'react';
import { X, UploadCloud, FileCheck2, PlusCircle, Loader2 } from 'lucide-react';
import type { Contest } from '~backend/contests/types';
import { useAuth } from '../hooks/useAuth';
import { Modal } from './Modal';

interface CreateContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContestCreated: (contest: Contest) => void;
}

export function CreateContestModal({ isOpen, onClose, onContestCreated }: CreateContestModalProps) {
  const { getAuthenticatedBackend } = useAuth();
  const [step, setStep] = useState(1);
  const [contestName, setContestName] = useState('');
  const [contestDate, setContestDate] = useState('');
  const [editalFile, setEditalFile] = useState<File | null>(null);
  const [editalText, setEditalText] = useState('');
  const [identifiedRoles, setIdentifiedRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setStep(1);
    setContestName('');
    setContestDate('');
    setEditalFile(null);
    setEditalText('');
    setIdentifiedRoles([]);
    setSelectedRole('');
    setIsProcessing(false);
    setProcessingStatus('');
    setError('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const parsePdf = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Simple text extraction - in a real app, you'd use a proper PDF library
          const text = e.target?.result as string;
          resolve(text || '');
        } catch (err) {
          reject(new Error('Failed to parse PDF'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleParseAndExtractRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editalFile) {
      setError('Por favor, selecione um arquivo PDF.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      setProcessingStatus('Lendo o PDF...');
      const text = await parsePdf(editalFile);
      setEditalText(text);

      setProcessingStatus('Identificando cargos com IA...');
      const backend = getAuthenticatedBackend();
      const rolesResponse = await backend.ai.extractRoles({ editalText: text });
      setIdentifiedRoles(rolesResponse.roles);
      setStep(2);
    } catch (error: any) {
      setError(error.message || 'Falha ao processar edital');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleCreateContest = async () => {
    if (!contestName || !contestDate || !selectedRole || !editalText) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Criando concurso...');

    try {
      const backend = getAuthenticatedBackend();
      const contest = await backend.contests.create({
        name: contestName,
        role: selectedRole,
        contestDate: new Date(contestDate),
        editalText,
      });

      onContestCreated(contest);
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Falha ao criar concurso');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Novo Concurso">
      {step === 1 && (
        <form onSubmit={handleParseAndExtractRoles} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contest-name" className="block text-sm font-medium text-slate-300 mb-2">
                Nome do Concurso
              </label>
              <input
                type="text"
                id="contest-name"
                value={contestName}
                onChange={(e) => setContestName(e.target.value)}
                required
                placeholder="Ex: Concurso EsFCEx 2025"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
              />
            </div>
            
            <div>
              <label htmlFor="contest-date" className="block text-sm font-medium text-slate-300 mb-2">
                Data da Prova
              </label>
              <input
                type="date"
                id="contest-date"
                value={contestDate}
                onChange={(e) => setContestDate(e.target.value)}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Edital em PDF
            </label>
            <label
              htmlFor="edital-file"
              className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-700"
            >
              {editalFile ? (
                <div className="text-center text-cyan-400">
                  <FileCheck2 className="h-10 w-10 mx-auto mb-2" />
                  <p className="font-semibold">{editalFile.name}</p>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <UploadCloud className="h-10 w-10 mx-auto mb-2" />
                  <p className="font-semibold">Clique para fazer upload</p>
                </div>
              )}
              <input
                id="edital-file"
                type="file"
                className="sr-only"
                accept=".pdf,.txt"
                onChange={(e) => setEditalFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end items-center pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg mr-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !contestName || !contestDate || !editalFile}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 min-w-[180px] h-[40px] text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">{processingStatus}</span>
                </div>
              ) : (
                'Analisar Edital'
              )}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Selecione o seu Cargo</h3>
            <p className="text-slate-400 text-sm">
              A IA identificou os seguintes cargos. Escolha o seu para continuar.
            </p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {identifiedRoles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
                  selectedRole === role 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <span>{role}</span>
                {selectedRole === role && (
                  <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-cyan-600"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end items-center pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg mr-4"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleCreateContest}
              disabled={isProcessing || !selectedRole}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 min-w-[180px] h-[40px] text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">{processingStatus}</span>
                </div>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Criar Concurso
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
