import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Notification, User } from '../types';
import { getNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead } from '../services/mockDatabase';

interface NotificationsViewProps {
  currentUser: User;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const loadNotifications = () => {
    setNotifications(getNotifications(currentUser.id));
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
      markAllNotificationsAsRead(currentUser.id);
      loadNotifications();
  }

  const handleDelete = (id: string) => {
    deleteNotification(id);
    loadNotifications();
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
        case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
                <p className="text-gray-500 text-sm">Mantente al día con las novedades del instituto</p>
            </div>
        </div>
        {notifications.length > 0 && (
            <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
            >
                <Check className="w-4 h-4 mr-2" /> Marcar todas como leídas
            </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No tienes notificaciones pendientes</p>
            </div>
        ) : (
            notifications.map(notification => (
                <div 
                    key={notification.id} 
                    className={`relative group bg-white p-5 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center gap-4
                    ${notification.read ? 'border-gray-100 opacity-75' : 'border-l-4 border-l-indigo-500 border-gray-200 shadow-md'}`}
                >
                    {/* Icon Container */}
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                        notification.type === 'alert' ? 'bg-orange-50' : 
                        notification.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
                    }`}>
                        {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className={`font-bold text-base ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.title}
                            </h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {new Date(notification.date).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                            <button 
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Marcar como leída"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                            onClick={() => handleDelete(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default NotificationsView;