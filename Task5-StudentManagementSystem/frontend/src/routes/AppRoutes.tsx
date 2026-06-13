import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'
import LandingPage from '../pages/landing/LandingPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import StudentsPage from '../pages/students/StudentsPage'
import StudentDetailPage from '../pages/students/StudentDetailPage'
import PortfolioPage from '../pages/portfolio/PortfolioPage'
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import AiRecommendationsPage from '../pages/ai/AiRecommendationsPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import UserManagementPage from '../pages/admin/UserManagementPage'
import { ProtectedRoute } from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Core Dashboard Portal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route
          path="analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="ai" element={<AiRecommendationsPage />} />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect wildcards to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}
