import { Routes, Route } from "react-router-dom";
import PublicSurvey from "./components/surveys/PublicSurvey";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Surveys from "./pages/Surveys";
import NotFound from "./pages/NotFound";
import DemoSurvey from "./pages/DemoSurvey";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/surveys" element={<Surveys />} />
      <Route path="/demo/surveys/:surveyId" element={<DemoSurvey />} />
      <Route path="/survey/:publicToken" element={<PublicSurvey />} />
      <Route path="/public-survey/:publicToken" element={<PublicSurvey />} />
      <Route path="/public-surveys/:publicToken" element={<PublicSurvey />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;