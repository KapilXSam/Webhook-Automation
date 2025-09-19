import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import Icon from '../components/ui/Icon';

type NotificationType = 'success' | 'error';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const notificationStyles = {
    success: {
        bg: 'bg-accent/20 border-accent/50',
        iconColor: 'text-accent',
        icon: 'check' as const,
    },
    error: {
        bg: 'bg-red-500/20 border-red-500/50',
        iconColor: 'text-red-400',
        icon: 'alert-circle' as const,
    }
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    const styles = notificationStyles[notification.type];

    return (
        <div className={`flex items-start p-4 mb-4 w-full max-w-sm rounded-lg shadow-lg ${styles.bg} border text-text-primary animate-fade-in-up`}>
            <div className={`flex-shrink-0 ${styles.iconColor}`}>
                <Icon name={styles.icon} className="w-6 h-6" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button onClick={() => onDismiss(notification.id)} className="inline-flex rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-0 right-0 p-4 sm:p-6 w-full max-w-sm z-[100]">
        <div className="flex flex-col items-end">
            {notifications.map(notification => (
            <Toast key={notification.id} notification={notification} onDismiss={removeNotification} />
            ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};
