import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ListNotificationsResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Lists notifications for the current user.
export const list = api<void, ListNotificationsResponse>(
  { auth: true, expose: true, method: "GET", path: "/notifications" },
  async () => {
    const auth = getAuthData()!;
    
    try {
      const notifications = await cardfixDB.queryAll`
        SELECT * FROM notifications 
        WHERE "userId" = ${auth.userID}
        ORDER BY "createdAt" DESC
        LIMIT 50
      `;

      const unreadCount = await cardfixDB.queryRow`
        SELECT COUNT(*) as count FROM notifications 
        WHERE "userId" = ${auth.userID} AND "isRead" = false
      `;

      return {
        notifications: notifications.map(n => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          actionUrl: n.actionUrl,
          createdAt: n.createdAt,
        })),
        unreadCount: parseInt(unreadCount?.count || '0'),
      };
    } catch (error) {
      // If notifications table doesn't exist or there's an error, return empty state
      console.error('Error loading notifications:', error);
      return {
        notifications: [],
        unreadCount: 0,
      };
    }
  }
);
