import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { TodaysCardsResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

interface GetTodaysCardsParams {
  contestId: string;
  subtopicId?: string;
}

// Gets flashcards due for review today.
export const getTodaysCards = api<GetTodaysCardsParams, TodaysCardsResponse>(
  { auth: true, expose: true, method: "GET", path: "/study/todays-cards/:contestId" },
  async (params) => {
    const auth = getAuthData()!;
    
    // Verify contest ownership
    const contest = await cardfixDB.queryRow`
      SELECT id FROM contests 
      WHERE id = ${params.contestId} AND "userId" = ${auth.userID}
    `;

    if (!contest) {
      throw APIError.notFound("contest not found");
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let query = `
      SELECT up.*, f.question, f.answer, f."importanceRank", f."subtopicId", f."isApproved", f."createdAt" as "flashcardCreatedAt", f."updatedAt" as "flashcardUpdatedAt"
      FROM user_progress up
      JOIN flashcards f ON up."flashcardId" = f.id
      WHERE up."userId" = $1 AND up."contestId" = $2
      AND (up."nextReviewDate" IS NULL OR up."nextReviewDate" <= $3)
    `;
    
    const queryParams = [auth.userID, params.contestId, today];

    if (params.subtopicId) {
      query += ` AND f."subtopicId" = $4`;
      queryParams.push(params.subtopicId);
    }

    query += ` ORDER BY up."createdAt"`;

    const cards = await cardfixDB.rawQueryAll(query, ...queryParams);

    return {
      cards: cards.map(card => ({
        id: card.id,
        userId: card.userId,
        contestId: card.contestId,
        flashcardId: card.flashcardId,
        status: card.status,
        repetitions: card.repetitions,
        easeFactor: card.easeFactor,
        interval: card.interval,
        nextReviewDate: card.nextReviewDate,
        lastReviewedAt: card.lastReviewedAt,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        flashcard: {
          id: card.flashcardId,
          question: card.question,
          answer: card.answer,
          importanceRank: card.importanceRank,
          subtopicId: card.subtopicId,
          isApproved: card.isApproved,
          createdAt: card.flashcardCreatedAt,
          updatedAt: card.flashcardUpdatedAt,
        },
      })),
    };
  }
);
