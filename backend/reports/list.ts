import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ListReportsResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Lists all reports for the current user.
export const list = api<void, ListReportsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reports" },
  async () => {
    const auth = getAuthData()!;
    
    const reports = await cardfixDB.queryAll`
      SELECT * FROM reports 
      WHERE "userId" = ${auth.userID}
      ORDER BY "generatedAt" DESC
      LIMIT 50
    `;

    return {
      reports: reports.map(r => ({
        id: r.id,
        userId: r.userId,
        contestId: r.contestId,
        title: r.title,
        type: r.type,
        reportData: JSON.parse(r.reportData),
        generatedAt: r.generatedAt,
      })),
    };
  }
);
