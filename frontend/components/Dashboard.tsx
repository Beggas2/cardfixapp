import React from 'react';
import type { User } from '~backend/users/types';
import type { Contest } from '~backend/contests/types';

interface DashboardProps {
  user: User;
  contests: Contest[];
  onSelectContest: (contest: Contest) => void;
}

export function Dashboard({ user, contests, onSelectContest }: DashboardProps) {
  const displayName = user.isAnonymous 
    ? 'Concurseiro(a)' 
    : user.name || user.email.split('@')[0];

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">
        Bem-vindo(a), {displayName}!
      </h2>
      <p className="text-slate-400 mb-8">
        Selecione um concurso para ver seu progresso ou crie um novo para começar.
      </p>

      {contests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map(contest => (
            <div
              key={contest.id}
              onClick={() => onSelectContest(contest)}
              className="bg-slate-800/50 rounded-xl p-6 cursor-pointer hover:bg-slate-800/70 transition-colors border border-slate-700 hover:border-cyan-500/50"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {contest.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Cargo: {contest.role}
              </p>
              <p className="text-slate-500 text-xs">
                Criado em: {new Date(contest.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}

      {contests.length === 0 && (
        <div className="text-center bg-slate-800/30 rounded-2xl p-12">
          <h3 className="text-xl font-bold text-white mb-4">
            Nenhum concurso criado ainda
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Clique em "Novo Concurso" para começar a criar seu plano de estudos personalizado.
          </p>
        </div>
      )}
    </div>
  );
}
