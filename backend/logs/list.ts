import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ListLogsResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Lists recent log entries (admin only).
export const list = api<void, ListLogsResponse>(
  { auth: true, expose: true, method: "GET", path: "/logs" },
  async () => {
    const auth = getAuthData()!;
    
    // Check if user is admin
    const user = await cardfixDB.queryRow`
      SELECT "isAdmin" FROM users WHERE id = ${auth.userID}
    `;

    if (!user?.isAdmin) {
      return { logs: [] };
    }

    const logs = await cardfixDB.queryAll`
      SELECT * FROM logs 
      ORDER BY "createdAt" DESC 
      LIMIT 100
    `;

    return {
      logs: logs.map(log => ({
        id: log.id,
        level: log.level,
        message: log.message,
        details: log.details ? JSON.parse(log.details) : null,
        userId: log.userId,
        createdAt: log.createdAt,
      })),
    };
  }
);
