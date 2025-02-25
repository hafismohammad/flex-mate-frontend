import React, { createContext, useState, useContext, useCallback, ReactNode } from "react";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string,
}

interface NotificationContextProps {
  userNotifications: Notification[];
  trainerNotifications: Notification[];
  addUserNotification: (message: string) => void;
  addTrainerNotification: (message: string) => void;
  clearUserNotifications: () => void;
  clearTrainerNotifications: () => void;
  updateTrainerNotificationReadStatus: (notificationId: string) => void;
  updateUserNotificationReadStatus: (notificationId: string) => void;
  countUnreadNotificationsUser: number;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [trainerNotifications, setTrainerNotifications] = useState<Notification[]>([]);

  const countUnreadNotifications = (notifications: Notification[]) => {
    return notifications.filter(notif => !notif.read).length;
  };

  const addUserNotification = useCallback((message: string) => {
    setUserNotifications((prev) => {
      const isDuplicate = prev.some((notif) => notif.message === message);
      if (isDuplicate) return prev;

      const newNotification: Notification = {
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return [...prev, newNotification];
    });
  }, []);

  const addTrainerNotification = useCallback((message: string) => {
    setTrainerNotifications((prev) => {
      const isDuplicate = prev.some((notif) => notif.message === message);
      if (isDuplicate) return prev;

      const newNotification: Notification = {
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return [...prev, newNotification];
    });
  }, []);

  const updateTrainerNotificationReadStatus = (notificationId: string) => {
    setTrainerNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const updateUserNotificationReadStatus = (notificationId: string) => {
    setUserNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const clearUserNotifications = useCallback(() => {
    setUserNotifications([]);
  }, []);

  const clearTrainerNotifications = useCallback(() => {
    setTrainerNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        userNotifications,
        trainerNotifications,
        addUserNotification,
        addTrainerNotification,
        clearUserNotifications,
        clearTrainerNotifications,
        updateTrainerNotificationReadStatus,
        updateUserNotificationReadStatus,
        countUnreadNotificationsUser: countUnreadNotifications(userNotifications),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
