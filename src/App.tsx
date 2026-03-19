import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Biosecurity from './pages/Biosecurity';
import AIAdvisor from './pages/AIAdvisor';
import Animals from './pages/Animals';
import Vaccinations from './pages/Vaccinations';
import Visitors from './pages/Visitors';
import Inventory from './pages/Inventory';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/biosecurity"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Biosecurity /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/animals"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Animals /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vaccinations"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Vaccinations /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Visitors /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-advisor"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'staff']}>
              <Layout profile={profile}><AIAdvisor /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Inventory /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'worker', 'staff']}>
              <Layout profile={profile}><Tasks /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute profile={profile} allowedRoles={['admin', 'manager', 'staff']}>
              <Layout profile={profile}><Reports /></Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
