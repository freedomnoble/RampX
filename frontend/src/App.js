import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import TopNav from "@/components/TopNav";
import AuthModal from "@/components/AuthModal";
import TaskDrawer from "@/components/TaskDrawer";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import CompanyPage from "@/pages/CompanyPage";
import BoardPage from "@/pages/BoardPage";
import CompetitorsPage from "@/pages/CompetitorsPage";
import GoalsPage from "@/pages/GoalsPage";
import DecisionsPage from "@/pages/DecisionsPage";
import LearningPage from "@/pages/LearningPage";

function RequireWorkspace({ children }) {
  const { workspace, authChecked } = useApp();
  const location = useLocation();
  if (!authChecked) return <div className="min-h-screen flex items-center justify-center text-slate2">Loading…</div>;
  if (!workspace) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
}

function Shell({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <TopNav onAuthOpen={() => setAuthOpen(true)} />
      {React.cloneElement(children, { onAuthOpen: () => setAuthOpen(true) })}
      <TaskDrawer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function AppRoutes() {
  const { authChecked } = useApp();
  if (!authChecked) return <div className="min-h-screen flex items-center justify-center text-slate2">Loading…</div>;
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/dashboard" element={<RequireWorkspace><Shell><Dashboard /></Shell></RequireWorkspace>} />
      <Route path="/company" element={<RequireWorkspace><Shell><CompanyPage /></Shell></RequireWorkspace>} />
      <Route path="/board" element={<RequireWorkspace><Shell><BoardPage /></Shell></RequireWorkspace>} />
      <Route path="/competitors" element={<RequireWorkspace><Shell><CompetitorsPage /></Shell></RequireWorkspace>} />
      <Route path="/goals" element={<RequireWorkspace><Shell><GoalsPage /></Shell></RequireWorkspace>} />
      <Route path="/decisions" element={<RequireWorkspace><Shell><DecisionsPage /></Shell></RequireWorkspace>} />
      <Route path="/learning" element={<RequireWorkspace><Shell><LearningPage /></Shell></RequireWorkspace>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
