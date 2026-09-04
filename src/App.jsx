import { Routes, Route } from "react-router-dom";
import PublicSurvey from "./components/surveys/PublicSurvey";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Surveys from "./pages/Surveys";
import NotFound from "./pages/NotFound";
import DemoSurvey from "./pages/DemoSurvey";
import Reports from "./pages/Reports";
import Vendors from "./pages/Vendors";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Clients from "./pages/Clients";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/demo/surveys/:surveyId" element={<DemoSurvey />} />
      <Route path="/survey/:publicToken" element={<PublicSurvey />} />
      <Route path="/public-survey/:publicToken" element={<PublicSurvey />} />
      <Route path="/public-surveys/:publicToken" element={<PublicSurvey />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/surveys" element={<ProtectedRoute><Surveys /></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;