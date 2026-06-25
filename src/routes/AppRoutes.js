import { Routes, Route } from "react-router-dom";

import HomePage from "../public-site/pages/HomePage";
import LoginPage from "../modules/auth/pages/LoginPage";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login"
                element={<LoginPage />}/>
        </Routes>

    );
}

export default AppRoutes;