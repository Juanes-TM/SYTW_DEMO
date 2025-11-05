import { useSelector } from "react-redux";
import CitasPage from "./CitasPage";
import CitasCalendar from "./CitasCalendar";

function CitasIndex() {
  const { user } = useSelector((state) => state.user);

  if (!user) return <p className="p-6">No autorizado</p>;

  if (user.role === "patient") {
    return <CitasCalendar modo="paciente" />;
  }

  if (user.role === "therapist") {
    return <CitasCalendar modo="fisio" />;
  }

  // Por defecto: admin
  return <CitasPage />;
}

export default CitasIndex;
