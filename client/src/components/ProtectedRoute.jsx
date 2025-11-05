import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
