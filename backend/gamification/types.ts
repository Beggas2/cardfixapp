export interface UserStats {
  id: string;
  userId: string;
  totalPoints: number;
  studyStreak: number;
  longestStreak: number;
  cardsReviewed: number;
  correctAnswers: number;
  badges: string[];
  lastStudyDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
}

export interface Ranking {
  userId: string;
  userName: string;
  userEmail: string;
  totalPoints: number;
  studyStreak: number;
  cardsReviewed: number;
  position: number;
}

export interface GetStatsResponse {
  stats: UserStats;
  availableBadges: Badge[];
  recentAchievements: Badge[];
}

export interface GetRankingResponse {
  rankings: Ranking[];
  userPosition: number;
  totalUsers: number;
}

export interface AddPointsRequest {
  points: number;
  reason: string;
  metadata?: any;
}
