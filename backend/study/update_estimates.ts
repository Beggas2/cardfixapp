import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

interface UpdateEstimatesRequest {
  contestId: string;
  estimates: {
    subtopicId: string;
    estimatedCount: number;
  }[];
}

// Updates estimated flashcard counts for subtopics.
export const updateEstimates = api<UpdateEstimatesRequest, void>(
  { auth: true, expose: true, method: "PUT", path: "/study/estimates" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify contest ownership
    const contest = await cardfixDB.queryRow`
      SELECT id FROM contests 
      WHERE id = ${req.contestId} AND "userId" = ${auth.userID}
    `;

    if (!contest) {
      throw APIError.notFound("contest not found");
    }

    const now = new Date();

    for (const estimate of req.estimates) {
      await cardfixDB.exec`
        UPDATE subtopics 
        SET "estimatedCount" = ${estimate.estimatedCount}, "updatedAt" = ${now}
        WHERE id = ${estimate.subtopicId}
        AND "topicId" IN (
          SELECT t.id FROM topics t
          JOIN subjects s ON t."subjectId" = s.id
          WHERE s."contestId" = ${req.contestId}
        )
      `;
    }
  }
);
