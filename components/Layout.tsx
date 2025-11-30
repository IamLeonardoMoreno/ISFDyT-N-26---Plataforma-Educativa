
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Menu, X, LogOut, School, LayoutDashboard, Calendar, Bell, Settings, MessageSquare } from 'lucide-react';
import { getUnreadCount, getUnreadMessagesCount } from '../services/mockDatabase';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  currentView: 'dashboard' | 'calendar' | 'notifications' | 'settings' | 'chat';
  onNavigate: (view: 'dashboard' | 'calendar' | 'notifications' | 'settings' | 'chat') => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, currentView, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
      // Simple interval to check for notifications mock real-time
      const checkUpdates = () => {
          setUnreadNotifs(getUnreadCount(user.id));
          setUnreadMessages(getUnreadMessagesCount(user.id));
      };
      
      checkUpdates();
      const interval = setInterval(checkUpdates, 2000);
      return () => clearInterval(interval);
  }, [user.id, currentView]); // Re-check when view changes in case we read them

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
            {/* Logo Area */}
            <div className="h-20 flex flex-col items-center justify-center border-b border-gray-100 bg-indigo-900 text-white px-4">
                <div className="flex items-center space-x-2 mb-1">
                    <School className="w-6 h-6 text-indigo-300" />
                    <span className="text-lg font-bold">ISFDyT N° 26</span>
                </div>
                <span className="text-[10px] text-indigo-300 uppercase tracking-widest">Plataforma Educativa</span>
            </div>

            {/* User Profile Snippet */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-3"
                />
                <h3 className="font-semibold text-gray-800 text-center">{user.name}</h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 mt-1">
                    {user.role}
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Menú Principal
                </div>
                
                <button 
                    onClick={() => onNavigate('dashboard')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        currentView === 'dashboard' 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </button>
                
                <button 
                     onClick={() => onNavigate('calendar')}
                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        currentView === 'calendar' 
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Calendar className="w-5 h-5" />
                    <span>Calendario</span>
                </button>

                <button 
                    onClick={() => onNavigate('chat')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${
                        currentView === 'chat'
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span>Mensajes</span>
                    {unreadMessages > 0 && (
                        <span className="absolute right-4 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadMessages}
                        </span>
                    )}
                </button>

                <button 
                    onClick={() => onNavigate('notifications')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${
                        currentView === 'notifications'
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Bell className="w-5 h-5" />
                    <span>Notificaciones</span>
                    {unreadNotifs > 0 && (
                        <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadNotifs}
                        </span>
                    )}
                </button>
                
                 <button 
                    onClick={() => onNavigate('settings')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        currentView === 'settings'
                        ? 'bg-indigo-50 text-indigo-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Settings className="w-5 h-5" />
                    <span>Configuración</span>
                </button>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Mobile Header */}
        <header className="h-16 bg-white shadow-sm lg:hidden flex items-center justify-between px-4 z-40">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-600">
                <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-gray-800 text-sm">ISFDyT N° 26</span>
            <div className="w-6" /> {/* Spacer */}
        </header>
        
        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>

         {/* Overlay for mobile sidebar */}
         {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}
      </div>
    </div>
  );
};

export default Layout;
