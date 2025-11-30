
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import StudentDashboard from './components/dashboards/StudentDashboard';
import TeacherDashboard from './components/dashboards/TeacherDashboard';
import PreceptorDashboard from './components/dashboards/PreceptorDashboard';
import DirectorDashboard from './components/dashboards/DirectorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import CalendarView from './components/CalendarView';
import NotificationsView from './components/NotificationsView';
import SettingsView from './components/SettingsView';
import ChatView from './components/ChatView';
import { User, UserRole, AppTheme } from './types';
import { initializeDatabase } from './services/mockDatabase';

// Color Palettes for Themes
const THEME_COLORS: Record<AppTheme, Record<number, string>> = {
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'notifications' | 'settings' | 'chat'>('dashboard');

  useEffect(() => {
    // Initialize mock DB
    initializeDatabase();

    // Check for persisted session (simple mock)
    const savedUser = localStorage.getItem('edunexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Apply dark mode effect based on user preference
  useEffect(() => {
      if (user?.preferences?.darkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [user]);

  // Apply color theme effect based on user preference
  useEffect(() => {
    const theme = user?.preferences?.theme || 'indigo';
    const colors = THEME_COLORS[theme] || THEME_COLORS.indigo;

    const root = document.documentElement;
    root.style.setProperty('--color-primary-50', colors[50]);
    root.style.setProperty('--color-primary-100', colors[100]);
    root.style.setProperty('--color-primary-200', colors[200]);
    root.style.setProperty('--color-primary-500', colors[500]);
    root.style.setProperty('--color-primary-600', colors[600]);
    root.style.setProperty('--color-primary-700', colors[700]);
    root.style.setProperty('--color-primary-800', colors[800]);
    root.style.setProperty('--color-primary-900', colors[900]);
    
  }, [user?.preferences?.theme]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
    localStorage.setItem('edunexus_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    document.documentElement.classList.remove('dark');
    // Reset to default indigo for login screen
    const root = document.documentElement;
    const colors = THEME_COLORS.indigo;
    root.style.setProperty('--color-primary-50', colors[50]);
    root.style.setProperty('--color-primary-100', colors[100]);
    root.style.setProperty('--color-primary-200', colors[200]);
    root.style.setProperty('--color-primary-500', colors[500]);
    root.style.setProperty('--color-primary-600', colors[600]);
    root.style.setProperty('--color-primary-700', colors[700]);
    root.style.setProperty('--color-primary-800', colors[800]);
    root.style.setProperty('--color-primary-900', colors[900]);

    localStorage.removeItem('edunexus_user');
  };

  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('edunexus_user', JSON.stringify(updatedUser));
  };

  const renderContent = () => {
    if (!user) return null;

    if (currentView === 'calendar') {
        return <CalendarView currentUser={user} />;
    }

    if (currentView === 'notifications') {
        return <NotificationsView currentUser={user} />;
    }

    if (currentView === 'settings') {
        return <SettingsView currentUser={user} onUpdateUser={handleUserUpdate} />;
    }

    if (currentView === 'chat') {
        return <ChatView currentUser={user} />;
    }

    switch (user.role) {
      case UserRole.ALUMNO:
        return <StudentDashboard />;
      case UserRole.DOCENTE:
        return <TeacherDashboard />;
      case UserRole.PRECEPTOR:
        return <PreceptorDashboard />;
      case UserRole.DIRECTIVO:
        return <DirectorDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <div className="p-8 text-center">Rol no reconocido.</div>;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView}
        onNavigate={setCurrentView}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
