import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { CreateContestRequest, Contest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Creates a new contest.
export const create = api<CreateContestRequest, Contest>(
  { auth: true, expose: true, method: "POST", path: "/contests" },
  async (req) => {
    const auth = getAuthData()!;
    const contestId = generateId();
    const now = new Date();

    await cardfixDB.exec`
      INSERT INTO contests (
        id, name, role, "contestDate", "editalText", "userId", "createdAt", "updatedAt"
      ) VALUES (
        ${contestId}, ${req.name}, ${req.role}, ${req.contestDate}, 
        ${req.editalText}, ${auth.userID}, ${now}, ${now}
      )
    `;

    return {
      id: contestId,
      name: req.name,
      role: req.role,
      contestDate: req.contestDate,
      editalText: req.editalText,
      userId: auth.userID,
      createdAt: now,
      updatedAt: now,
    };
  }
);
