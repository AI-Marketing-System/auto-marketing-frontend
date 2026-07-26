import { Routes, Route } from 'react-router-dom';

import HomePage from '../public-site/pages/HomePage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import AuthApiLabPage from '../modules/auth/pages/AuthApiLabPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import SocialAccountsPage from '../modules/social-accounts/pages/SocialAccountsPage';
import AnalyticsDashboard from '../modules/analytics/pages/AnalyticsDashboard';
import CampaignListPage from '../modules/campaigns/pages/CampaignListPage';
import WorkspacePlannerPage from '../modules/planner/pages/WorkspacePlannerPage';
import PlanManagementPage from '../modules/admin/plans/pages/PlanManagementPage';
import ErrorPage from '../public-site/pages/ErrorPage';
import InvitationsPage from '../modules/workspace/pages/InvitationsPage';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/ProtectedRoute';
import AdminHomePage from '../modules/admin/home/pages/AdminHomePage';
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth-lab" element={<AuthApiLabPage />} />
      <Route
        path="/unauthorized"
        element={
          <ErrorPage
            status={403}
            title="Không có quyền truy cập"
            message="Bạn không có quyền truy cập trang này."
          />
        }
      />
      <Route
        path="/401"
        element={
          <ErrorPage
            status={401}
            title="Chưa đăng nhập"
            message="Vui lòng đăng nhập để tiếp tục."
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/social-accounts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SocialAccountsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AnalyticsDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics-v2"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CampaignListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId/campaigns"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CampaignListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:workspaceId/planner"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkspacePlannerPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/admin" element={<AdminHomePage />} />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InvitationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/plans"
        element={
          <AdminRoute>
            <DashboardLayout variant="admin">
              <PlanManagementPage />
            </DashboardLayout>
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
