import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ReviewCardRequest, CardStatus } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Reviews a flashcard and updates spaced repetition data.
export const reviewCard = api<ReviewCardRequest, void>(
  { auth: true, expose: true, method: "POST", path: "/study/review" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get current progress
    const progress = await cardfixDB.queryRow`
      SELECT up.*, c."userId" as "contestUserId"
      FROM user_progress up
      JOIN contests c ON up."contestId" = c.id
      WHERE up."flashcardId" = ${req.flashcardId} AND up."userId" = ${auth.userID}
    `;

    if (!progress || progress.contestUserId !== auth.userID) {
      throw APIError.notFound("progress not found");
    }

    // Calculate next review using spaced repetition algorithm
    const { nextReviewDate, easeFactor, interval, repetitions } = calculateNextReview(
      progress,
      req.rating
    );

    const now = new Date();

    await cardfixDB.exec`
      UPDATE user_progress 
      SET 
        status = ${req.rating},
        repetitions = ${repetitions},
        "easeFactor" = ${easeFactor},
        "interval" = ${interval},
        "nextReviewDate" = ${nextReviewDate},
        "lastReviewedAt" = ${now},
        "updatedAt" = ${now}
      WHERE id = ${progress.id}
    `;
  }
);

function calculateNextReview(progress: any, rating: CardStatus) {
  const qualityMap: Record<CardStatus, number> = {
    'WRONG': 0,
    'DIFFICULT': 3,
    'GOOD': 5,
    'NOT_SEEN': 0,
  };

  const q = qualityMap[rating] || 0;
  let { repetitions = 0, easeFactor = 2.5, interval = 0 } = progress;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
  }

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0); // Start of day

  return {
    repetitions,
    easeFactor,
    interval,
    nextReviewDate,
  };
}
