import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { GenerateReportRequest, GenerateReportResponse, ProgressReportData } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Generates a detailed report for the user.
export const generate = api<GenerateReportRequest, GenerateReportResponse>(
  { auth: true, expose: true, method: "POST", path: "/reports/generate" },
  async (req) => {
    const auth = getAuthData()!;
    const now = new Date();
    
    let reportData: any;
    let title: string;

    switch (req.type) {
      case 'progress':
        reportData = await generateProgressReport(auth.userID, req.contestId);
        title = req.contestId ? 'Relatório de Progresso do Concurso' : 'Relatório de Progresso Geral';
        break;
      case 'performance':
        reportData = await generatePerformanceReport(auth.userID, req.contestId, req.dateRange);
        title = 'Relatório de Performance';
        break;
      case 'comparison':
        reportData = await generateComparisonReport(auth.userID);
        title = 'Relatório Comparativo';
        break;
      case 'detailed':
        reportData = await generateDetailedReport(auth.userID, req.contestId);
        title = 'Relatório Detalhado';
        break;
      default:
        reportData = await generateProgressReport(auth.userID, req.contestId);
        title = 'Relatório de Progresso';
    }

    const reportId = generateId();
    
    await cardfixDB.exec`
      INSERT INTO reports (
        id, "userId", "contestId", title, type, "reportData", "generatedAt"
      ) VALUES (
        ${reportId}, ${auth.userID}, ${req.contestId || null}, 
        ${title}, ${req.type}, ${JSON.stringify(reportData)}, ${now}
      )
    `;

    return {
      report: {
        id: reportId,
        userId: auth.userID,
        contestId: req.contestId,
        title,
        type: req.type,
        reportData,
        generatedAt: now,
      },
    };
  }
);

async function generateProgressReport(userId: string, contestId?: string): Promise<ProgressReportData> {
  let contestFilter = '';
  let params: any[] = [userId];
  
  if (contestId) {
    contestFilter = 'AND c.id = $2';
    params.push(contestId);
  }

  // Get overall stats
  const overallStats = await cardfixDB.rawQueryRow(`
    SELECT 
      COUNT(DISTINCT f.id) as "totalCards",
      COUNT(DISTINCT up.id) as "reviewedCards",
      COUNT(CASE WHEN up.status IN ('GOOD', 'DIFFICULT') THEN 1 END) as "correctAnswers"
    FROM flashcards f
    JOIN subtopics st ON f."subtopicId" = st.id
    JOIN topics t ON st."topicId" = t.id
    JOIN subjects s ON t."subjectId" = s.id
    JOIN contests c ON s."contestId" = c.id
    LEFT JOIN user_progress up ON f.id = up."flashcardId" AND up."userId" = $1
    WHERE c."userId" = $1 ${contestFilter}
  `, ...params);

  // Get user stats
  const userStats = await cardfixDB.queryRow`
    SELECT "studyStreak" FROM user_stats WHERE "userId" = ${userId}
  `;

  // Get subject progress
  const subjectProgress = await cardfixDB.rawQueryAll(`
    SELECT 
      s.name as "subjectName",
      COUNT(DISTINCT f.id) as "totalCards",
      COUNT(DISTINCT up.id) as "reviewedCards",
      COALESCE(
        COUNT(CASE WHEN up.status IN ('GOOD', 'DIFFICULT') THEN 1 END)::float / 
        NULLIF(COUNT(DISTINCT up.id), 0) * 100, 
        0
      ) as accuracy
    FROM subjects s
    JOIN topics t ON s.id = t."subjectId"
    JOIN subtopics st ON t.id = st."topicId"
    JOIN flashcards f ON st.id = f."subtopicId"
    JOIN contests c ON s."contestId" = c.id
    LEFT JOIN user_progress up ON f.id = up."flashcardId" AND up."userId" = $1
    WHERE c."userId" = $1 ${contestFilter}
    GROUP BY s.id, s.name
    ORDER BY s.name
  `, ...params);

  // Get daily progress (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyProgress = await cardfixDB.rawQueryAll(`
    SELECT 
      DATE(up."lastReviewedAt") as date,
      COUNT(*) as "cardsReviewed",
      COALESCE(
        COUNT(CASE WHEN up.status IN ('GOOD', 'DIFFICULT') THEN 1 END)::float / 
        COUNT(*) * 100, 
        0
      ) as accuracy
    FROM user_progress up
    JOIN flashcards f ON up."flashcardId" = f.id
    JOIN subtopics st ON f."subtopicId" = st.id
    JOIN topics t ON st."topicId" = t.id
    JOIN subjects s ON t."subjectId" = s.id
    JOIN contests c ON s."contestId" = c.id
    WHERE up."userId" = $1 
      AND up."lastReviewedAt" >= $${params.length + 1}
      AND c."userId" = $1 
      ${contestFilter}
    GROUP BY DATE(up."lastReviewedAt")
    ORDER BY date DESC
  `, ...params, thirtyDaysAgo);

  const totalCards = parseInt(overallStats?.totalCards || '0');
  const reviewedCards = parseInt(overallStats?.reviewedCards || '0');
  const correctAnswers = parseInt(overallStats?.correctAnswers || '0');

  return {
    totalCards,
    reviewedCards,
    correctAnswers,
    accuracy: reviewedCards > 0 ? (correctAnswers / reviewedCards) * 100 : 0,
    studyStreak: userStats?.studyStreak || 0,
    totalStudyTime: 0, // Would need to track study time
    subjectProgress: subjectProgress.map(sp => ({
      subjectName: sp.subjectName,
      totalCards: parseInt(sp.totalCards),
      reviewedCards: parseInt(sp.reviewedCards),
      accuracy: parseFloat(sp.accuracy),
    })),
    dailyProgress: dailyProgress.map(dp => ({
      date: dp.date,
      cardsReviewed: parseInt(dp.cardsReviewed),
      timeSpent: 0, // Would need to track time
      accuracy: parseFloat(dp.accuracy),
    })),
  };
}

async function generatePerformanceReport(userId: string, contestId?: string, dateRange?: any) {
  // Similar to progress report but focused on performance metrics
  return await generateProgressReport(userId, contestId);
}

async function generateComparisonReport(userId: string) {
  // Compare user's performance with average
  const userStats = await cardfixDB.queryRow`
    SELECT * FROM user_stats WHERE "userId" = ${userId}
  `;

  const avgStats = await cardfixDB.queryRow`
    SELECT 
      AVG("totalPoints") as "avgPoints",
      AVG("studyStreak") as "avgStreak",
      AVG("cardsReviewed") as "avgCards"
    FROM user_stats
  `;

  return {
    user: userStats,
    average: avgStats,
    comparison: {
      pointsVsAverage: userStats ? userStats.totalPoints - (avgStats?.avgPoints || 0) : 0,
      streakVsAverage: userStats ? userStats.studyStreak - (avgStats?.avgStreak || 0) : 0,
      cardsVsAverage: userStats ? userStats.cardsReviewed - (avgStats?.avgCards || 0) : 0,
    },
  };
}

async function generateDetailedReport(userId: string, contestId?: string) {
  // Combine all report types
  const progress = await generateProgressReport(userId, contestId);
  const comparison = await generateComparisonReport(userId);
  
  return {
    progress,
    comparison,
    generatedAt: new Date(),
  };
}
