import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { GetStatsResponse, Badge } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Gets the user's gamification stats and badges.
export const getStats = api<void, GetStatsResponse>(
  { auth: true, expose: true, method: "GET", path: "/gamification/stats" },
  async () => {
    const auth = getAuthData()!;
    
    // Get or create user stats
    let stats = await cardfixDB.queryRow`
      SELECT * FROM user_stats WHERE "userId" = ${auth.userID}
    `;

    if (!stats) {
      const now = new Date();
      const statsId = generateId();
      
      await cardfixDB.exec`
        INSERT INTO user_stats (
          id, "userId", "totalPoints", "studyStreak", "longestStreak", 
          "cardsReviewed", "correctAnswers", badges, "createdAt", "updatedAt"
        ) VALUES (
          ${statsId}, ${auth.userID}, 0, 0, 0, 0, 0, '[]', ${now}, ${now}
        )
      `;
      
      stats = {
        id: statsId,
        userId: auth.userID,
        totalPoints: 0,
        studyStreak: 0,
        longestStreak: 0,
        cardsReviewed: 0,
        correctAnswers: 0,
        badges: '[]',
        lastStudyDate: null,
        createdAt: now,
        updatedAt: now,
      };
    }

    const userBadges = JSON.parse(stats.badges || '[]');
    const availableBadges = getAvailableBadges();
    const recentAchievements = getRecentAchievements(userBadges);

    return {
      stats: {
        id: stats.id,
        userId: stats.userId,
        totalPoints: stats.totalPoints,
        studyStreak: stats.studyStreak,
        longestStreak: stats.longestStreak,
        cardsReviewed: stats.cardsReviewed,
        correctAnswers: stats.correctAnswers,
        badges: userBadges,
        lastStudyDate: stats.lastStudyDate,
        createdAt: stats.createdAt,
        updatedAt: stats.updatedAt,
      },
      availableBadges,
      recentAchievements,
    };
  }
);

function getAvailableBadges(): Badge[] {
  return [
    {
      id: 'first_study',
      name: 'Primeiro Passo',
      description: 'Complete sua primeira sessão de estudo',
      icon: '🎯',
      requirement: 'Revisar 1 flashcard',
      points: 10,
    },
    {
      id: 'study_streak_7',
      name: 'Sequência de Fogo',
      description: 'Estude por 7 dias consecutivos',
      icon: '🔥',
      requirement: '7 dias de sequência',
      points: 100,
    },
    {
      id: 'cards_100',
      name: 'Estudioso',
      description: 'Revise 100 flashcards',
      icon: '📚',
      requirement: '100 cards revisados',
      points: 200,
    },
    {
      id: 'accuracy_90',
      name: 'Precisão',
      description: 'Mantenha 90% de acertos',
      icon: '🎯',
      requirement: '90% de acertos em 50+ cards',
      points: 150,
    },
    {
      id: 'top_10',
      name: 'Elite',
      description: 'Entre no top 10 do ranking',
      icon: '👑',
      requirement: 'Top 10 do ranking mensal',
      points: 500,
    },
    {
      id: 'study_streak_30',
      name: 'Dedicação Total',
      description: 'Estude por 30 dias consecutivos',
      icon: '💎',
      requirement: '30 dias de sequência',
      points: 1000,
    },
  ];
}

function getRecentAchievements(userBadges: string[]): Badge[] {
  const allBadges = getAvailableBadges();
  return allBadges.filter(badge => userBadges.includes(badge.id)).slice(-3);
}
