export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type?: string;
  actionUrl?: string;
}

export interface ListNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}
