import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as notificationApi from '../api/notificationApi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread notifications count');
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getNotifications(params);
      setNotifications(res.data.data.notifications);
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch notifications');
      return null;
    }
  }, [isAuthenticated]);

  const markRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read');
    }
  };

  // Poll for unread count every 30 seconds
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  const value = {
    unreadCount,
    notifications,
    fetchNotifications,
    markRead,
    markAllRead,
    refreshCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
