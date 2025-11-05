// src/routes/PrivateRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Ruta protegida que redirige al login si el usuario no está autenticado.
 */
function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    // Si no hay usuario logueado, redirige al login
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, renderiza la página
  return children;
}

export default PrivateRoute;
