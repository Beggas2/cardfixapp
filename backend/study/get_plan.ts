import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { StudyPlanResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

interface GetPlanParams {
  contestId: string;
}

// Gets the study plan for a contest.
export const getPlan = api<GetPlanParams, StudyPlanResponse>(
  { auth: true, expose: true, method: "GET", path: "/study/plans/:contestId" },
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

    const subjects = await cardfixDB.queryAll`
      SELECT * FROM subjects 
      WHERE "contestId" = ${params.contestId}
      ORDER BY "order"
    `;

    const result = [];

    for (const subject of subjects) {
      const topics = await cardfixDB.queryAll`
        SELECT * FROM topics 
        WHERE "subjectId" = ${subject.id}
        ORDER BY "order"
      `;

      const topicsWithSubtopics = [];

      for (const topic of topics) {
        const subtopics = await cardfixDB.queryAll`
          SELECT * FROM subtopics 
          WHERE "topicId" = ${topic.id}
          ORDER BY "order"
        `;

        topicsWithSubtopics.push({
          ...topic,
          subtopics,
        });
      }

      result.push({
        ...subject,
        topics: topicsWithSubtopics,
      });
    }

    return { subjects: result };
  }
);
