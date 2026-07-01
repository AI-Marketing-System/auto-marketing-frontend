import { Routes, Route } from 'react-router-dom';

import HomePage from '../public-site/pages/HomePage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import AuthApiLabPage from '../modules/auth/pages/AuthApiLabPage';
import DashboardPage from '../modules/analytics/pages/DashboardPage';
import CampaignListPage from '../modules/campaigns/pages/CampaignListPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth-lab" element={<AuthApiLabPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/campaigns" element={<CampaignListPage />} />
    </Routes>
  );
}

export default AppRoutes;
