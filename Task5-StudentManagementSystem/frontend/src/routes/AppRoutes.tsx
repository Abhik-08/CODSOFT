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

      {/* Core Admin Dashboard Portal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="ai" element={<AiRecommendationsPage />} />
      </Route>

      {/* Redirect wildcards to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  )
}
