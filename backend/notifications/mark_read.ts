import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { MarkAsReadRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Marks notifications as read.
export const markAsRead = api<MarkAsReadRequest, void>(
  { auth: true, expose: true, method: "POST", path: "/notifications/mark-read" },
  async (req) => {
    const auth = getAuthData()!;
    
    if (req.notificationIds.length === 0) return;

    try {
      // Build the query with proper parameter placeholders
      const placeholders = req.notificationIds.map((_, index) => `$${index + 2}`).join(',');
      const query = `
        UPDATE notifications 
        SET "isRead" = true 
        WHERE "userId" = $1 AND id IN (${placeholders})
      `;

      await cardfixDB.rawExec(query, auth.userID, ...req.notificationIds);
    } catch (error) {
      // If notifications table doesn't exist or there's an error, silently fail
      console.error('Error marking notifications as read:', error);
    }
  }
);
