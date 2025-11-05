import { Home, Calendar, Users, LogOut } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { icon: <Home size={20} />, label: "Inicio" },
    { icon: <Calendar size={20} />, label: "Citas" },
    { icon: <Users size={20} />, label: "Pacientes" },
  ];

  return (
    <aside className="w-60 bg-teal-600 text-white h-screen p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">FisioTrack</h2>
        <ul className="space-y-4">
          {menuItems.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 hover:bg-teal-700 p-2 rounded-md cursor-pointer">
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="flex items-center gap-3 text-sm hover:bg-teal-700 p-2 rounded-md">
        <LogOut size={18} /> Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;
