import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { Notification } from '~backend/notifications/types';
import { useAuth } from '../hooks/useAuth';

export function NotificationCenter() {
  const { getAuthenticatedBackend, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setHasError(false);
      const backend = getAuthenticatedBackend();
      const response = await backend.notifications.list();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setHasError(true);
      // Set empty state on error to prevent UI issues
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    if (!user || notificationIds.length === 0) return;
    
    try {
      setIsLoading(true);
      const backend = getAuthenticatedBackend();
      await backend.notifications.markAsRead({ notificationIds });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-50">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Notificações</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && !hasError && (
                  <button
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {hasError ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="mb-2">Erro ao carregar notificações</p>
                <button
                  onClick={loadNotifications}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-700/50 cursor-pointer ${
                      !notification.isRead ? 'bg-cyan-500/10 border-l-2 border-l-cyan-500' : ''
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead([notification.id]);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${
                          !notification.isRead ? 'text-white' : 'text-slate-300'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([notification.id]);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 ml-2"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
