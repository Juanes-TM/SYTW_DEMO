import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PacienteDashboard from "./pages/dashboard/PacienteDashboard";
import FisioDashboard from "./pages/dashboard/FisioDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="paciente" element={<PacienteDashboard />} />
        <Route path="fisio" element={<FisioDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
