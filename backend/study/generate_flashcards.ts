import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { GenerateFlashcardsRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Generates and stores flashcards for a subtopic.
export const generateFlashcards = api<GenerateFlashcardsRequest, void>(
  { auth: true, expose: true, method: "POST", path: "/study/flashcards" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Verify subtopic exists and user has access
    const subtopic = await cardfixDB.queryRow`
      SELECT st.*, t."subjectId", s."contestId" 
      FROM subtopics st
      JOIN topics t ON st."topicId" = t.id
      JOIN subjects s ON t."subjectId" = s.id
      JOIN contests c ON s."contestId" = c.id
      WHERE st.id = ${req.subtopicId} AND c."userId" = ${auth.userID}
    `;

    if (!subtopic) {
      throw APIError.notFound("subtopic not found");
    }

    const now = new Date();

    for (const flashcardData of req.flashcards) {
      const flashcardId = generateId();
      
      await cardfixDB.exec`
        INSERT INTO flashcards (id, question, answer, "importanceRank", "subtopicId", "isApproved", "createdAt", "updatedAt")
        VALUES (${flashcardId}, ${flashcardData.question}, ${flashcardData.answer}, ${flashcardData.importanceRank}, ${req.subtopicId}, true, ${now}, ${now})
      `;

      // Create initial user progress entry
      const progressId = generateId();
      await cardfixDB.exec`
        INSERT INTO user_progress (id, "userId", "contestId", "flashcardId", status, repetitions, "easeFactor", "interval", "createdAt", "updatedAt")
        VALUES (${progressId}, ${auth.userID}, ${subtopic.contestId}, ${flashcardId}, 'NOT_SEEN', 0, 2.5, 0, ${now}, ${now})
      `;
    }
  }
);
