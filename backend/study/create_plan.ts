import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { CreateStudyPlanRequest, StudyPlanResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Creates a study plan structure for a contest.
export const createPlan = api<CreateStudyPlanRequest, StudyPlanResponse>(
  { auth: true, expose: true, method: "POST", path: "/study/plans" },
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
    const createdSubjects = [];

    for (const subjectData of req.subjects) {
      const subjectId = generateId();
      
      await cardfixDB.exec`
        INSERT INTO subjects (id, name, "order", "contestId", "createdAt", "updatedAt")
        VALUES (${subjectId}, ${subjectData.name}, ${subjectData.order}, ${req.contestId}, ${now}, ${now})
      `;

      const createdTopics = [];

      for (const topicData of subjectData.topics) {
        const topicId = generateId();
        
        await cardfixDB.exec`
          INSERT INTO topics (id, name, "order", "subjectId", "createdAt", "updatedAt")
          VALUES (${topicId}, ${topicData.name}, ${topicData.order}, ${subjectId}, ${now}, ${now})
        `;

        const createdSubtopics = [];

        for (const subtopicData of topicData.subtopics) {
          const subtopicId = generateId();
          
          await cardfixDB.exec`
            INSERT INTO subtopics (id, name, "order", "estimatedCount", "topicId", "createdAt", "updatedAt")
            VALUES (${subtopicId}, ${subtopicData.name}, ${subtopicData.order}, ${subtopicData.estimatedCount || 0}, ${topicId}, ${now}, ${now})
          `;

          createdSubtopics.push({
            id: subtopicId,
            name: subtopicData.name,
            order: subtopicData.order,
            estimatedCount: subtopicData.estimatedCount || 0,
            topicId,
            createdAt: now,
            updatedAt: now,
          });
        }

        createdTopics.push({
          id: topicId,
          name: topicData.name,
          order: topicData.order,
          subjectId,
          createdAt: now,
          updatedAt: now,
          subtopics: createdSubtopics,
        });
      }

      createdSubjects.push({
        id: subjectId,
        name: subjectData.name,
        order: subjectData.order,
        contestId: req.contestId,
        createdAt: now,
        updatedAt: now,
        topics: createdTopics,
      });
    }

    return { subjects: createdSubjects };
  }
);
