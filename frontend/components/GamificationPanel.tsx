import React, { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Star, Award, TrendingUp } from 'lucide-react';
import type { UserStats, Badge, Ranking } from '~backend/gamification/types';
import { useAuth } from '../hooks/useAuth';

export function GamificationPanel() {
  const { getAuthenticatedBackend, user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [userPosition, setUserPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setError(null);
      const backend = getAuthenticatedBackend();
      
      const [statsResponse, rankingResponse] = await Promise.all([
        backend.gamification.getStats().catch(err => {
          console.error('Stats error:', err);
          // Return default stats if there's an error
          return {
            stats: {
              id: '',
              userId: user?.id || '',
              totalPoints: 0,
              studyStreak: 0,
              longestStreak: 0,
              cardsReviewed: 0,
              correctAnswers: 0,
              badges: [],
              lastStudyDate: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            availableBadges: [],
            recentAchievements: [],
          };
        }),
        backend.gamification.getRanking().catch(err => {
          console.error('Ranking error:', err);
          // Return empty ranking if there's an error
          return {
            rankings: [],
            userPosition: 0,
            totalUsers: 0,
          };
        }),
      ]);

      setStats(statsResponse.stats);
      setBadges(statsResponse.availableBadges);
      setRankings(rankingResponse.rankings);
      setUserPosition(rankingResponse.userPosition);
    } catch (error: any) {
      console.error('Failed to load gamification data:', error);
      setError('Falha ao carregar dados de gamificação');
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

  if (error) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white">Gamificação</h2>
        <div className="bg-red-500/10 text-red-400 p-6 rounded-xl text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={loadGamificationData}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white">Gamificação</h2>
        <div className="bg-slate-800/50 rounded-xl p-6 text-center">
          <p className="text-slate-400">Nenhum dado de gamificação encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Gamificação</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pontos Totais</p>
              <p className="text-2xl font-bold text-cyan-400">{stats.totalPoints}</p>
            </div>
            <Star className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Sequência Atual</p>
              <p className="text-2xl font-bold text-orange-400">{stats.studyStreak} dias</p>
            </div>
            <Flame className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Cards Revisados</p>
              <p className="text-2xl font-bold text-green-400">{stats.cardsReviewed}</p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Posição no Ranking</p>
              <p className="text-2xl font-bold text-purple-400">#{userPosition || 'N/A'}</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Award className="h-6 w-6 mr-2" />
          Conquistas
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map(badge => {
            const isEarned = stats.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg text-center transition-all ${
                  isEarned 
                    ? 'bg-cyan-600/20 border border-cyan-500' 
                    : 'bg-slate-700/50 border border-slate-600'
                }`}
              >
                <div className={`text-3xl mb-2 ${isEarned ? '' : 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                <h4 className={`font-semibold text-sm ${isEarned ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {badge.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {badge.description}
                </p>
                {isEarned && (
                  <div className="mt-2 text-xs text-cyan-400 font-semibold">
                    +{badge.points} pts
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2" />
          Ranking Global
        </h3>
        
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum ranking disponível ainda</p>
            <p className="text-slate-500 text-sm">Comece a estudar para aparecer no ranking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.slice(0, 10).map((ranking, index) => (
              <div
                key={ranking.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : 'bg-slate-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {ranking.position}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{ranking.userName}</p>
                    <p className="text-xs text-slate-400">
                      {ranking.cardsReviewed} cards • {ranking.studyStreak} dias
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400">{ranking.totalPoints}</p>
                  <p className="text-xs text-slate-400">pontos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
