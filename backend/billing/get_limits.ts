import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { GetLimitsResponse, PlanLimits } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Gets the user's plan limits and current usage.
export const getLimits = api<void, GetLimitsResponse>(
  { auth: true, expose: true, method: "GET", path: "/billing/limits" },
  async () => {
    const auth = getAuthData()!;
    
    // Get user's current plan
    const user = await cardfixDB.queryRow`
      SELECT plan FROM users WHERE id = ${auth.userID}
    `;

    const plan = user?.plan || 'FREE';
    const limits = getPlanLimits(plan);

    // Calculate current usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [flashcardsCount, contestsCount, aiRequestsCount] = await Promise.all([
      cardfixDB.queryRow`
        SELECT COUNT(*) as count FROM flashcards f
        JOIN subtopics st ON f."subtopicId" = st.id
        JOIN topics t ON st."topicId" = t.id
        JOIN subjects s ON t."subjectId" = s.id
        JOIN contests c ON s."contestId" = c.id
        WHERE c."userId" = ${auth.userID} AND f."createdAt" >= ${startOfMonth}
      `,
      cardfixDB.queryRow`
        SELECT COUNT(*) as count FROM contests 
        WHERE "userId" = ${auth.userID}
      `,
      cardfixDB.queryRow`
        SELECT COUNT(*) as count FROM ia_queue 
        WHERE "userId" = ${auth.userID} AND "createdAt" >= ${startOfDay}
      `
    ]);

    return {
      limits,
      usage: {
        flashcardsThisMonth: parseInt(flashcardsCount?.count || '0'),
        activeContests: parseInt(contestsCount?.count || '0'),
        aiRequestsToday: parseInt(aiRequestsCount?.count || '0'),
      },
    };
  }
);

function getPlanLimits(plan: string): PlanLimits {
  switch (plan) {
    case 'PRO':
      return {
        flashcardsPerMonth: 500,
        activeContests: 5,
        aiRequestsPerDay: 100,
        features: ['advanced_reports', 'priority_support', 'export_pdf'],
      };
    case 'PREMIUM':
      return {
        flashcardsPerMonth: -1, // unlimited
        activeContests: -1, // unlimited
        aiRequestsPerDay: -1, // unlimited
        features: ['advanced_reports', 'priority_support', 'export_pdf', 'custom_ai', '24_7_support'],
      };
    default: // FREE
      return {
        flashcardsPerMonth: 50,
        activeContests: 1,
        aiRequestsPerDay: 10,
        features: ['basic_reports'],
      };
  }
}
