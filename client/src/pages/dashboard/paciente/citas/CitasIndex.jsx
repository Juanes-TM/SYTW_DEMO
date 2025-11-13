import { useSelector } from "react-redux";
import CitasPage from "./CitasPage";
import CitasCalendar from "./CitasCalendar";

function CitasIndex() {
  const { user } = useSelector((state) => state.user);

  if (!user) return <p className="p-6">No autorizado</p>;

  if (user.rol === "cliente") {
    return <CitasCalendar modo="paciente" />;
  }

  if (user.rol === "fisioterapeuta") {
    return <CitasCalendar modo="fisio" />;
  }

  return <CitasPage />;
}

export default CitasIndex;
