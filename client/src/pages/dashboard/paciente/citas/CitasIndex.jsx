import { useSelector } from "react-redux";
import CitasPage from "./CitasPage";
import CitasCalendar from "./CitasCalendar";

function CitasIndex() {
  // Extrae el usuario real del store
  const { user } = useSelector((state) => state.user);
  const currentUser = user?.user || user; // Compatibilidad con ambas estructuras

  if (!currentUser) return <p className="p-6">No autorizado</p>;

  // Usa la propiedad "rol" real que viene del backend
  if (currentUser.rol === "cliente") {
    return <CitasCalendar modo="paciente" />;
  }

  if (currentUser.rol === "fisioterapeuta") {
    return <CitasCalendar modo="fisio" />;
  }

  // Por defecto: admin
  return <CitasPage />;
}

export default CitasIndex;
