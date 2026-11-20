import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import RemindersPage from './pages/RemindersPage';
import ImportantDatesPage from './pages/ImportantDatesPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { CalendarViewPage, ProfilePage } from './pages/AdditionalPages';
import './App.css';

// Toast Notification
function GlobalToast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 text-sm animate-bounce-short">
      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated Dashboard & Feature routes */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="important-dates" element={<ImportantDatesPage />} />
            <Route path="calendar" element={<CalendarViewPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalToast />
      </BrowserRouter>
    </AppProvider>
  );
}
