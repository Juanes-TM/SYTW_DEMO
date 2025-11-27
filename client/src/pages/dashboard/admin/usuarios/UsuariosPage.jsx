//client/src/pages/dashboard/admin/usuarios/UsuariosPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

// Lista de especialidades para el selector
const ESPECIALIDADES = [
    "Traumatología",
    "Deportiva",
    "Neurología",
    "Respiratoria",
    "General",
    "Pediátrica",
    "Acupuntura",
];

export default function UsuariosPage() {
  const { user } = useSelector((state) => state.user);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState("");
  const [rolFiltro, setRolFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  
  // ESTADO CLAVE: Datos del usuario al abrir el modal (para comparación)
  const [datosOriginales, setDatosOriginales] = useState({});

  const [formData, setFormData] = useState({});
  const [sortField, setSortField] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalVisible, setModalVisible] = useState(false);

  const token = user?.token || localStorage.getItem('token'); 

  const fetchUsuarios = async () => {
    if (!token) return;
    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setMensaje("Error al cargar usuarios");
      setTimeout(() => setMensaje(""), 5000);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [token]);

  // LÓGICA CLAVE: Comparar formData (actual) con datosOriginales (al abrir)
  const formHasChanged = JSON.stringify(formData) !== JSON.stringify(datosOriginales);

  const handleSort = (field) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideNombre = `${u.nombre} ${u.apellido}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const coincideRol =
      rolFiltro === "todos" ? true : u.rol === rolFiltro;
    return coincideNombre && coincideRol;
  });

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    const aValue = a[sortField]?.toString().toLowerCase() || "";
    const bValue = b[sortField]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const cambiarRol = async (id, nuevoRol, nombre) => {
    if (!confirm(`¿Cambiar el rol de ${nombre} a ${nuevoRol}?`)) return;
    try {
      await axios.put(
        `/api/admin/users/${id}/role`,
        { rol: nuevoRol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje("Rol actualizado correctamente");
      setTimeout(() => setMensaje(""), 3000);
      fetchUsuarios();
    } catch (err) {
      console.error("Error al cambiar rol:", err);
      setMensaje(err.response?.data?.msg || "Error al cambiar rol");
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("Usuario eliminado correctamente");
      setTimeout(() => setMensaje(""), 3000);
      fetchUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setMensaje(err.response?.data?.msg || "Error al eliminar usuario");
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const abrirModalEdicion = (u) => {
    // 1. Datos que se deben editar
    const currentData = {
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telephone: u.telephone,
      // Incluir la especialidad, sea string o "" o null
      especialidad: u.rol === "fisioterapeuta" ? (u.especialidad || "") : "", 
    };
    
    setUsuarioEditando(u);
    setFormData(currentData);
    // 2. Guardar una copia exacta del estado original para la comparación
    setDatosOriginales(JSON.parse(JSON.stringify(currentData))); 
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setTimeout(() => setUsuarioEditando(null), 200);
  };

  const guardarEdicion = async () => {
    if (!formHasChanged) {
      setMensaje("No hay cambios para guardar");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    
    try {
      console.log("📤 Enviando datos al servidor:", formData);
      
      const res = await axios.put(
        `/api/admin/users/${usuarioEditando._id}`,
        formData, // Enviamos todo el formData
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensaje(res.data.msg || "Usuario actualizado correctamente");
      setTimeout(() => setMensaje(""), 3000);
      cerrarModal();
      fetchUsuarios();
    } catch (err) {
      console.error("❌ Error al editar usuario:", err.response?.data);
      setMensaje(err.response?.data?.msg || "Error al actualizar usuario");
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <p className="p-6">Cargando usuarios...</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h1>
      <p className="text-gray-600 mb-6">
        Desde aquí puedes consultar, editar o eliminar usuarios del sistema.
      </p>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:ring-2 focus:ring-teal-500 outline-none"
          />

          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="todos">Todos los roles</option>
            <option value="cliente">Clientes</option>
            <option value="fisioterapeuta">Fisioterapeutas</option>
            <option value="admin">Administradores</option>
          </select>
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 rounded mb-4 text-sm shadow-sm ${
          mensaje.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}>
          {mensaje}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs uppercase">
            <tr>
              {["Nombre", "Email", "Teléfono", "Rol", "Especialidad", "Registrado", "Acciones"].map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-left font-semibold cursor-pointer ${
                    idx < 6 ? "hover:bg-teal-800 transition" : ""
                  }`}
                  onClick={() =>
                    idx === 0
                      ? handleSort("nombre")
                      : idx === 1
                      ? handleSort("email")
                      : idx === 3
                      ? handleSort("rol")
                      : idx === 4
                      ? handleSort("especialidad")
                      : idx === 5
                      ? handleSort("createdAt")
                      : null
                  }
                >
                  {col}
                  {/* Se deja el icono de ordenación solo si es un campo de la tabla */}
                  {idx < 6 && sortField === (
                      idx === 0 ? "nombre" : idx === 1 ? "email" : idx === 3 ? "rol" : idx === 4 ? "especialidad" : idx === 5 ? "createdAt" : ""
                  ) && (sortOrder === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {usuariosOrdenados.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-medium">
                  {u.nombre} {u.apellido}
                </td>
                <td className="px-6 py-3">{u.email}</td>
                <td className="px-6 py-3">{u.telephone}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                      u.rol === "admin"
                        ? "bg-rose-600"
                        : u.rol === "fisioterapeuta"
                        ? "bg-amber-500"
                        : "bg-teal-600"
                    }`}
                  >
                    {u.rol}
                  </span>
                </td>
                {/* COLUMNA: Especialidad */}
                <td className="px-6 py-3">
                   {u.rol === "fisioterapeuta" ? (u.especialidad || 'No asignada') : '-'}
                </td>
                
                <td className="px-6 py-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-3 text-center space-x-2">
                  <select
                    value={u.rol}
                    onChange={(e) => cambiarRol(u._id, e.target.value, u.nombre)}
                    className="border border-gray-300 rounded-lg text-sm px-2 py-1 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="cliente">Cliente</option>
                    <option value="fisioterapeuta">Fisioterapeuta</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => abrirModalEdicion(u)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded-lg transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarUsuario(u._id)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-3 py-1 rounded-lg transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosOrdenados.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No se encontraron usuarios con los filtros seleccionados.
          </p>
        )}
      </div>

      {/* Modal de Edición */}
      {modalVisible && usuarioEditando && (
        <div className="fixed inset-0 flex items-center justify-center z-50 transition-all duration-300">
          <div
            onClick={cerrarModal}
            className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm"
          ></div>

          <div className="relative bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Editar {usuarioEditando.nombre}
            </h2>

            <div className="space-y-4">
              {["nombre", "apellido", "email", "telephone"].map((campo) => (
                <div key={campo}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {campo.charAt(0).toUpperCase() + campo.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={formData[campo] || ""}
                    onChange={(e) => handleInputChange(campo, e.target.value)}
                    className={`border rounded-xl px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition ${
                      (campo === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ||
                      (campo === "telephone" && formData.telephone && !/^[0-9]{9}$/.test(formData.telephone))
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
              ))}
              
              {/* CAMPO: Especialidad (Solo para fisioterapeutas) */}
              {usuarioEditando.rol === "fisioterapeuta" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Especialidad
                  </label>
                  <select
                    value={formData.especialidad || ""}
                    onChange={(e) => handleInputChange("especialidad", e.target.value)}
                    className="border rounded-xl px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition border-gray-300"
                  >
                    <option value="">-- No asignada --</option>
                    {ESPECIALIDADES.map(esp => (
                        <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={!formHasChanged}
                className={`px-4 py-2 text-white rounded-lg shadow-sm transition ${
                  !formHasChanged 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                Guardar cambios
              </button>
            </div>

            {/* Indicador de cambios */}
            {formHasChanged && (
              <div className="mt-4 p-2 bg-blue-50 text-blue-700 text-sm rounded-lg">
                ⚠️ Tienes cambios sin guardar
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}