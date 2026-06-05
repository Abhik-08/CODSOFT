import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/routes/ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Deposit } from '../pages/Deposit';
import { Withdraw } from '../pages/Withdraw';
import { History } from '../pages/History';
import { Profile } from '../pages/Profile';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Endpoint */}
      <Route path="/login" element={<Login />} />

      {/* Secure Terminal Area wrapped in MainLayout and ProtectedRoute */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect empty root path to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
