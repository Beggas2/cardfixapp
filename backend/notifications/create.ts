import { api } from "encore.dev/api";
import { CreateNotificationRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId } from "../users/utils";

// Creates a new notification for a user.
export const create = api<CreateNotificationRequest, void>(
  { expose: true, method: "POST", path: "/notifications" },
  async (req) => {
    try {
      const notificationId = generateId();
      const now = new Date();

      await cardfixDB.exec`
        INSERT INTO notifications (
          id, "userId", title, message, type, "isRead", "actionUrl", "createdAt"
        ) VALUES (
          ${notificationId}, ${req.userId}, ${req.title}, ${req.message}, 
          ${req.type || 'info'}, false, ${req.actionUrl || null}, ${now}
        )
      `;
    } catch (error) {
      // If notifications table doesn't exist or there's an error, silently fail
      console.error('Error creating notification:', error);
    }
  }
);
