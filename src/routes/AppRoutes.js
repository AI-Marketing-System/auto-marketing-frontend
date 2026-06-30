import { Routes, Route } from "react-router-dom";

import HomePage from "../public-site/pages/HomePage";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import ForgotPasswordPage from "../modules/auth/pages/ForgotPasswordPage";
import DashboardPage from "../modules/analytics/pages/DashboardPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
    );
}

export default AppRoutes;