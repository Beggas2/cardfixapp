import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ListContestsResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Lists all contests for the current user.
export const list = api<void, ListContestsResponse>(
  { auth: true, expose: true, method: "GET", path: "/contests" },
  async () => {
    const auth = getAuthData()!;
    
    const contests = await cardfixDB.queryAll`
      SELECT * FROM contests 
      WHERE "userId" = ${auth.userID}
      ORDER BY "createdAt" DESC
    `;

    return {
      contests: contests.map(contest => ({
        id: contest.id,
        name: contest.name,
        role: contest.role,
        contestDate: contest.contestDate,
        editalText: contest.editalText,
        userId: contest.userId,
        createdAt: contest.createdAt,
        updatedAt: contest.updatedAt,
      })),
    };
  }
);
