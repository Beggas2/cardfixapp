import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Contest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

interface GetContestParams {
  id: string;
}

// Gets a specific contest by ID.
export const get = api<GetContestParams, Contest>(
  { auth: true, expose: true, method: "GET", path: "/contests/:id" },
  async (params) => {
    const auth = getAuthData()!;
    
    const contest = await cardfixDB.queryRow`
      SELECT * FROM contests 
      WHERE id = ${params.id} AND "userId" = ${auth.userID}
    `;

    if (!contest) {
      throw APIError.notFound("contest not found");
    }

    return {
      id: contest.id,
      name: contest.name,
      role: contest.role,
      contestDate: contest.contestDate,
      editalText: contest.editalText,
      userId: contest.userId,
      createdAt: contest.createdAt,
      updatedAt: contest.updatedAt,
    };
  }
);
