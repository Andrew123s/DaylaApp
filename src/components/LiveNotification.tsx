import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, Plus, Trash2, Users, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'user_joined' | 'user_left' | 'note_added' | 'note_updated' | 'note_deleted' | 'user_editing';
  message: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  autoHide?: boolean;
}

interface LiveNotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const LiveNotification: React.FC<LiveNotificationProps> = ({ notifications, onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Add new notifications to visible list
    notifications.forEach(notification => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        setVisibleNotifications(prev => [...prev, notification]);
        
        // Auto-hide after 5 seconds if specified
        if (notification.autoHide !== false) {
          setTimeout(() => {
            handleDismiss(notification.id);
          }, 5000);
        }
      }
    });
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_joined': return UserPlus;
      case 'user_left': return Users;
      case 'note_added': return Plus;
      case 'note_updated': return Edit3;
      case 'note_deleted': return Trash2;
      case 'user_editing': return Edit3;
      default: return CheckCircle;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'user_joined': return 'bg-green-50 border-green-200 text-green-800';
      case 'user_left': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'note_added': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'note_updated': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'note_deleted': return 'bg-red-50 border-red-200 text-red-800';
      case 'user_editing': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 space-y-2 max-w-[calc(100vw-16px)] sm:max-w-sm">
      {visibleNotifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const colorClass = getNotificationColor(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${colorClass} border rounded-lg p-3 sm:p-4 shadow-lg backdrop-blur-sm animate-slide-in-right`}
          >
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                {notification.userAvatar ? (
                  <img
                    src={notification.userAvatar}
                    alt={notification.userName}
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium text-xs sm:text-sm truncate">{notification.userName}</span>
                </div>
                <p className="text-xs sm:text-sm mt-1 break-words">{notification.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveNotification;