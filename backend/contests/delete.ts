import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

interface DeleteContestParams {
  id: string;
}

// Deletes a contest and all related data.
export const deleteContest = api<DeleteContestParams, void>(
  { auth: true, expose: true, method: "DELETE", path: "/contests/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    // Verify ownership
    const contest = await cardfixDB.queryRow`
      SELECT id FROM contests 
      WHERE id = ${params.id} AND "userId" = ${auth.userID}
    `;

    if (!contest) {
      throw APIError.notFound("contest not found");
    }

    // Delete related data first
    await cardfixDB.exec`
      DELETE FROM user_progress 
      WHERE "contestId" = ${params.id} AND "userId" = ${auth.userID}
    `;

    await cardfixDB.exec`
      DELETE FROM flashcards 
      WHERE "subtopicId" IN (
        SELECT st.id FROM subtopics st
        JOIN topics t ON st."topicId" = t.id
        JOIN subjects s ON t."subjectId" = s.id
        WHERE s."contestId" = ${params.id}
      )
    `;

    await cardfixDB.exec`
      DELETE FROM subtopics 
      WHERE "topicId" IN (
        SELECT t.id FROM topics t
        JOIN subjects s ON t."subjectId" = s.id
        WHERE s."contestId" = ${params.id}
      )
    `;

    await cardfixDB.exec`
      DELETE FROM topics 
      WHERE "subjectId" IN (
        SELECT id FROM subjects WHERE "contestId" = ${params.id}
      )
    `;

    await cardfixDB.exec`
      DELETE FROM subjects WHERE "contestId" = ${params.id}
    `;

    await cardfixDB.exec`
      DELETE FROM contests WHERE id = ${params.id}
    `;
  }
);
