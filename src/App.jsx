import { Routes, Route } from "react-router-dom";

import PublicSurvey from "./components/surveys/PublicSurvey";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPortal from "./pages/AdminPortal";
import ProjectManagerRegister from "./pages/ProjectManagerRegister";
import ProjectManagers from "./pages/ProjectManagers";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Surveys from "./pages/Surveys";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import DemoSurvey from "./pages/DemoSurvey";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login adminMode />} />
            <Route path="/register" element={<ProjectManagerRegister />} />
            <Route path="/register/complete" element={<ProjectManagerRegister />} />

            <Route
                path="/demo/surveys/:surveyId"
                element={<DemoSurvey />}
            />

            <Route
                path="/survey/:publicToken"
                element={<PublicSurvey />}
            />

            <Route
                path="/public-survey/:publicToken"
                element={<PublicSurvey />}
            />

            <Route
                path="/public-surveys/:publicToken"
                element={<PublicSurvey />}
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/projects"
                element={
                    <ProtectedRoute>
                        <Projects />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/surveys"
                element={
                    <ProtectedRoute>
                        <Surveys />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/surveys/:surveyId"
                element={
                    <ProtectedRoute>
                        <SurveyDetailPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/vendors"
                element={
                    <ProtectedRoute>
                        <Vendors />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/clients"
                element={
                    <ProtectedRoute>
                        <Clients />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute adminOnly>
                        <AdminPortal />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/project-managers"
                element={
                    <ProtectedRoute adminOnly>
                        <ProjectManagers />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
}

export default App;