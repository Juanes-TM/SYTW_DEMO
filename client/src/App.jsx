import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./components/DashboardLayout";
import PrivateRoute from "./routes/PrivateRoute";

import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ForgotPswPage from "./pages/ForgotPswPage";
import ResetPswPage from "./pages/ResetPswPage";

// --- DASHBOARDS PRINCIPALES ---
import PacienteDashboard from "./pages/dashboard/paciente/PacienteDashboard";
import FisioDashboard from "./pages/dashboard/fisio/FisioDashboard";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

// --- SECCIONES INTERNAS ---
import CitasIndex from "./pages/dashboard/paciente/citas/CitasIndex";
import DisponibilidadPage from "./pages/dashboard/fisio/disponibilidad/DisponibilidadPage";
import UsuariosPage from "./pages/dashboard/admin/usuarios/UsuariosPage";
import ReservarCitaPage from "./pages/dashboard/paciente/citas/ReservarCitaPage";

function App() {
  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/forgot-password" element={<ForgotPswPage />} />
      <Route path="/reset-password" element={<ResetPswPage />} />

      {/* Dashboard protegido general */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* --- PACIENTE --- */}
        <Route path="paciente" element={<PacienteDashboard />} />
        <Route path="paciente/citas" element={<CitasIndex />} />
        <Route path="paciente/reservar" element={<ReservarCitaPage />} />

        {/* --- FISIO --- */}
        <Route path="fisio" element={<FisioDashboard />} />
        <Route path="fisio/disponibilidad" element={<DisponibilidadPage />} />

        {/* --- ADMIN --- */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/usuarios" element={<UsuariosPage />} />
      </Route>

      {/* Ruta protegida exclusiva para admins (puedes mantenerla si la usas) */}
      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
