import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { CreateLogRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Creates a new log entry.
export const create = api<CreateLogRequest, void>(
  { expose: true, method: "POST", path: "/logs" },
  async (req) => {
    let userId: string | null = null;
    
    try {
      const auth = getAuthData();
      userId = auth?.userID || null;
    } catch {
      // No auth data available, continue without user ID
    }

    const logId = generateId();
    const now = new Date();

    await cardfixDB.exec`
      INSERT INTO logs (id, level, message, details, "userId", "createdAt")
      VALUES (${logId}, ${req.level}, ${req.message}, ${JSON.stringify(req.details || {})}, ${userId}, ${now})
    `;
  }
);
