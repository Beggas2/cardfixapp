import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { GetRankingResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Gets the global ranking of users.
export const getRanking = api<void, GetRankingResponse>(
  { auth: true, expose: true, method: "GET", path: "/gamification/ranking" },
  async () => {
    const auth = getAuthData()!;
    
    // Get top 100 users by points
    const rankings = await cardfixDB.queryAll`
      SELECT 
        us."userId",
        u.name as "userName",
        u.email as "userEmail",
        us."totalPoints",
        us."studyStreak",
        us."cardsReviewed",
        ROW_NUMBER() OVER (ORDER BY us."totalPoints" DESC) as position
      FROM user_stats us
      JOIN users u ON us."userId" = u.id
      WHERE u."isAnonymous" = false
      ORDER BY us."totalPoints" DESC
      LIMIT 100
    `;

    // Get user's position
    const userPosition = await cardfixDB.queryRow`
      SELECT position FROM (
        SELECT 
          us."userId",
          ROW_NUMBER() OVER (ORDER BY us."totalPoints" DESC) as position
        FROM user_stats us
        JOIN users u ON us."userId" = u.id
        WHERE u."isAnonymous" = false
      ) ranked
      WHERE "userId" = ${auth.userID}
    `;

    // Get total number of users
    const totalUsers = await cardfixDB.queryRow`
      SELECT COUNT(*) as count FROM user_stats us
      JOIN users u ON us."userId" = u.id
      WHERE u."isAnonymous" = false
    `;

    return {
      rankings: rankings.map(r => ({
        userId: r.userId,
        userName: r.userName || 'Usuário',
        userEmail: r.userEmail,
        totalPoints: r.totalPoints,
        studyStreak: r.studyStreak,
        cardsReviewed: r.cardsReviewed,
        position: r.position,
      })),
      userPosition: userPosition?.position || 0,
      totalUsers: parseInt(totalUsers?.count || '0'),
    };
  }
);
