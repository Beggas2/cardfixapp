import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  LogOut, 
  PlusCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Bell,
  BarChart3
} from 'lucide-react';
import type { User } from '~backend/users/types';
import type { Contest } from '~backend/contests/types';
import { useAuth } from '../hooks/useAuth';
import { Dashboard } from './Dashboard';
import { ContestView } from './ContestView';
import { AdminDashboard } from './AdminDashboard';
import { GamificationPanel } from './GamificationPanel';
import { ReportsPanel } from './ReportsPanel';
import { NotificationCenter } from './NotificationCenter';
import { CreateContestModal } from './CreateContestModal';
import { OnboardingModal } from './OnboardingModal';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const { getAuthenticatedBackend } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'contest' | 'admin' | 'gamification' | 'reports'>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!user.onboardingCompleted);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadContests();
    }
  }, [user]);

  const loadContests = async () => {
    if (!user) return;
    
    try {
      setError(null);
      setIsLoading(true);
      const backend = getAuthenticatedBackend();
      const response = await backend.contests.list();
      setContests(response.contests);
    } catch (error: any) {
      console.error('Failed to load contests:', error);
      setError('Falha ao carregar concursos. Tente novamente.');
      // Set empty contests array on error to prevent UI issues
      setContests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContestCreated = (contest: Contest) => {
    setContests(prev => [contest, ...prev]);
    setSelectedContest(contest);
    setCurrentView('contest');
    setIsCreateModalOpen(false);
  };

  const handleContestDeleted = (contestId: string) => {
    setContests(prev => prev.filter(c => c.id !== contestId));
    if (selectedContest?.id === contestId) {
      setSelectedContest(null);
      setCurrentView('dashboard');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const backend = getAuthenticatedBackend();
      await backend.users.completeOnboarding();
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <>
      <div className="bg-slate-900 text-white min-h-screen font-sans">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-1/3 max-w-sm bg-slate-950/50 p-6 flex flex-col border-r border-slate-800">
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <BrainCircuit className="h-8 w-8 mr-3 text-cyan-400" />
                CardFix
              </h1>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-400 truncate" title={user.email}>
                  {user.email}
                </p>
                <NotificationCenter />
              </div>
            </header>
            
            <nav className="flex-grow overflow-y-auto pr-2">
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setSelectedContest(null);
                }}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors flex items-center font-semibold ${
                  currentView === 'dashboard' 
                    ? 'bg-cyan-600/20 text-cyan-300' 
                    : 'hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard Geral
              </button>

              <button
                onClick={() => {
                  setCurrentView('gamification');
                  setSelectedContest(null);
                }}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors flex items-center font-semibold ${
                  currentView === 'gamification' 
                    ? 'bg-orange-600/20 text-orange-300' 
                    : 'hover:bg-slate-800'
                }`}
              >
                <Trophy className="h-5 w-5 mr-3" />
                Gamificação
              </button>

              <button
                onClick={() => {
                  setCurrentView('reports');
                  setSelectedContest(null);
                }}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors flex items-center font-semibold ${
                  currentView === 'reports' 
                    ? 'bg-green-600/20 text-green-300' 
                    : 'hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Relatórios
              </button>

              {user.isAdmin && (
                <button
                  onClick={() => {
                    setCurrentView('admin');
                    setSelectedContest(null);
                  }}
                  className={`w-full text-left p-3 mb-4 rounded-lg transition-colors flex items-center font-semibold ${
                    currentView === 'admin' 
                      ? 'bg-purple-600/20 text-purple-300' 
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5 mr-3" />
                  Painel Admin
                </button>
              )}
              
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-300">
                    Seus Concursos
                  </h2>
                  {error && (
                    <button
                      onClick={loadContests}
                      className="text-xs text-red-400 hover:text-red-300"
                      title="Tentar carregar novamente"
                    >
                      Recarregar
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-center text-sm">
                    <p className="mb-2">{error}</p>
                    <button
                      onClick={loadContests}
                      className="text-red-300 hover:text-red-200 underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {contests.map(contest => (
                      <li key={contest.id}>
                        <button
                          onClick={() => {
                            setSelectedContest(contest);
                            setCurrentView('contest');
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${
                            selectedContest?.id === contest.id 
                              ? 'bg-cyan-600/20 text-cyan-300' 
                              : 'hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            {contest.name}
                          </span>
                          <ArrowRight className={`h-5 w-5 transition-transform ${
                            selectedContest?.id === contest.id ? 'translate-x-1' : ''
                          }`} />
                        </button>
                      </li>
                    ))}
                    {contests.length === 0 && !isLoading && !error && (
                      <li className="text-slate-500 text-sm text-center py-4">
                        Nenhum concurso criado ainda
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 transition-all text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-lg mb-4"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Novo Concurso
              </button>
              <button
                onClick={onLogout}
                className="w-full bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 md:p-12 overflow-y-auto">
            {currentView === 'dashboard' && (
              <Dashboard 
                user={user} 
                contests={contests}
                onSelectContest={(contest) => {
                  setSelectedContest(contest);
                  setCurrentView('contest');
                }}
              />
            )}
            
            {currentView === 'gamification' && (
              <GamificationPanel />
            )}
            
            {currentView === 'reports' && (
              <ReportsPanel />
            )}
            
            {currentView === 'admin' && user.isAdmin && (
              <AdminDashboard />
            )}
            
            {currentView === 'contest' && selectedContest && (
              <ContestView 
                contest={selectedContest}
                onContestDeleted={handleContestDeleted}
              />
            )}
          </main>
        </div>
      </div>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />

      <CreateContestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContestCreated={handleContestCreated}
      />
    </>
  );
}
