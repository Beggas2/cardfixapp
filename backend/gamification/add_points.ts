import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { AddPointsRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Adds points to user's stats and checks for new badges.
export const addPoints = api<AddPointsRequest, void>(
  { auth: true, expose: true, method: "POST", path: "/gamification/points" },
  async (req) => {
    const auth = getAuthData()!;
    const now = new Date();
    
    // Get or create user stats
    let stats = await cardfixDB.queryRow`
      SELECT * FROM user_stats WHERE "userId" = ${auth.userID}
    `;

    if (!stats) {
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
        createdAt: now,
        updatedAt: now,
      };
    }

    // Update points and stats based on reason
    let newPoints = stats.totalPoints + req.points;
    let newCardsReviewed = stats.cardsReviewed;
    let newCorrectAnswers = stats.correctAnswers;
    let newStudyStreak = stats.studyStreak;
    let newLongestStreak = stats.longestStreak;

    if (req.reason === 'card_reviewed') {
      newCardsReviewed += 1;
    }
    
    if (req.reason === 'correct_answer') {
      newCorrectAnswers += 1;
    }
    
    if (req.reason === 'daily_study') {
      // Check if it's a consecutive day
      const lastStudy = stats.lastStudyDate;
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastStudy && isSameDay(lastStudy, yesterday)) {
        newStudyStreak += 1;
      } else if (!lastStudy || !isSameDay(lastStudy, now)) {
        newStudyStreak = 1;
      }
      
      if (newStudyStreak > newLongestStreak) {
        newLongestStreak = newStudyStreak;
      }
    }

    // Check for new badges
    const currentBadges = JSON.parse(stats.badges || '[]');
    const newBadges = checkForNewBadges(currentBadges, {
      totalPoints: newPoints,
      studyStreak: newStudyStreak,
      cardsReviewed: newCardsReviewed,
      correctAnswers: newCorrectAnswers,
    });

    // Update stats
    await cardfixDB.exec`
      UPDATE user_stats 
      SET 
        "totalPoints" = ${newPoints},
        "cardsReviewed" = ${newCardsReviewed},
        "correctAnswers" = ${newCorrectAnswers},
        "studyStreak" = ${newStudyStreak},
        "longestStreak" = ${newLongestStreak},
        badges = ${JSON.stringify(newBadges)},
        "lastStudyDate" = ${req.reason === 'daily_study' ? now : stats.lastStudyDate},
        "updatedAt" = ${now}
      WHERE id = ${stats.id}
    `;
  }
);

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function checkForNewBadges(currentBadges: string[], stats: any): string[] {
  const newBadges = [...currentBadges];
  
  // First study
  if (stats.cardsReviewed >= 1 && !newBadges.includes('first_study')) {
    newBadges.push('first_study');
  }
  
  // Study streak 7 days
  if (stats.studyStreak >= 7 && !newBadges.includes('study_streak_7')) {
    newBadges.push('study_streak_7');
  }
  
  // 100 cards reviewed
  if (stats.cardsReviewed >= 100 && !newBadges.includes('cards_100')) {
    newBadges.push('cards_100');
  }
  
  // 90% accuracy (if more than 50 cards)
  if (stats.cardsReviewed >= 50) {
    const accuracy = stats.correctAnswers / stats.cardsReviewed;
    if (accuracy >= 0.9 && !newBadges.includes('accuracy_90')) {
      newBadges.push('accuracy_90');
    }
  }
  
  // Study streak 30 days
  if (stats.studyStreak >= 30 && !newBadges.includes('study_streak_30')) {
    newBadges.push('study_streak_30');
  }
  
  return newBadges;
}
