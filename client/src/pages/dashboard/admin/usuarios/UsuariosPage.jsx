//client/src/pages/dashboard/admin/usuarios/UsuariosPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { 
    AlertTriangle, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Users, 
    ChevronUp, 
    ChevronDown, 
    Calendar, 
    Phone, 
    Mail, 
    User, 
    Loader2,
    RotateCw
} from "lucide-react";


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
    
    // ESTADO : Datos del usuario al abrir el modal
    const [datosOriginales, setDatosOriginales] = useState({});

    const [formData, setFormData] = useState({});
    const [sortField, setSortField] = useState("nombre");
    const [sortOrder, setSortOrder] = useState("asc");
    const [modalVisible, setModalVisible] = useState(false);
    
    // NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN DE ROL
    const [confirmModalData, setConfirmModalData] = useState(null); 

    const token = user?.token || localStorage.getItem('token'); 

    // --- Lógica funcional  ---

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
    
    const ejecutarCambioRol = async (id, nuevoRol) => {
        setConfirmModalData(null); // Cerrar el modal inmediatamente al ejecutar la acción
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
    
    const cambiarRol = (id, nuevoRol, nombre) => {
        setConfirmModalData({ id, nuevoRol, nombre });
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
        const currentData = {
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
            telephone: u.telephone,
            especialidad: u.rol === "fisioterapeuta" ? (u.especialidad || "") : "", 
        };
        
        setUsuarioEditando(u);
        setFormData(currentData);
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
            const res = await axios.put(
                `/api/admin/users/${usuarioEditando._id}`,
                formData, 
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

    // --- Renderizado de Carga ---
    if (loading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 size={32} className="text-teal-600 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">Cargando usuarios del sistema...</p>
            </div>
        );
    }

    // --- Renderizado Principal ---
    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50">
            
            {/* Título Principal */}
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
                <Users className="text-teal-600 w-8 h-8" />
                <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Usuarios</h1>
            </div>
            <p className="text-gray-600 mb-8 max-w-2xl">
                Panel de control para consultar, editar roles y datos, o eliminar usuarios del sistema.
            </p>

            {/* Controles: Búsqueda y Filtro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-4 bg-white rounded-xl shadow-md border border-gray-100">
                
                {/* Búsqueda */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-xl px-4 pl-10 py-2 text-sm w-full focus:ring-2 focus:ring-teal-500 outline-none transition"
                    />
                </div>

                {/* Filtro por Rol */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-teal-600 shrink-0" />
                    <select
                        value={rolFiltro}
                        onChange={(e) => setRolFiltro(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition appearance-none cursor-pointer"
                    >
                        <option value="todos">Todos los roles</option>
                        <option value="cliente">Clientes</option>
                        <option value="fisioterapeuta">Fisioterapeutas</option>
                        <option value="admin">Administradores</option>
                    </select>
                </div>
            </div>

            {/* Mensajes de Estado */}
            {mensaje && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium shadow-lg ${
                    mensaje.includes("Error") ? "bg-red-100 text-red-800 border-l-4 border-red-500" : "bg-green-100 text-green-800 border-l-4 border-green-500"
                }`}>
                    {mensaje}
                </div>
            )}

            {/* Tabla de Usuarios */}
            <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-gray-100">
                <table className="min-w-full text-sm text-gray-700">
                    
                    {/* Encabezado de la Tabla */}
                    <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b border-gray-200">
                        <tr>
                            {/* Nombres de las Columnas */}
                            {[{name: "Nombre", field: "nombre"}, {name: "Email", field: "email"}, {name: "Teléfono", field: "telephone"}, {name: "Rol", field: "rol"}, {name: "Especialidad", field: "especialidad"}, {name: "Registrado", field: "createdAt"}, {name: "Acciones", field: null}].map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 text-left font-bold tracking-wider ${col.field ? "cursor-pointer hover:bg-gray-200 transition" : ""}`}
                                    onClick={() => col.field && handleSort(col.field)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.name}
                                        {col.field && sortField === col.field && (sortOrder === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Cuerpo de la Tabla */}
                    <tbody>
                        {usuariosOrdenados.map((u, index) => (
                            <tr key={u._id} className={`hover:bg-teal-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-6 py-3 font-semibold text-gray-800">
                                    {u.nombre} {u.apellido}
                                </td>
                                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                <td className="px-6 py-3 text-gray-500">{u.telephone}</td>
                                
                                {/* Columna: Rol */}
                                <td className="px-6 py-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase shadow-md ${
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
                                
                                {/* Columna: Especialidad */}
                                <td className="px-6 py-3">
                                    {u.rol === "fisioterapeuta" ? (u.especialidad || <span className="text-gray-400 italic">No asignada</span>) : '-'}
                                </td>
                                
                                {/* Columna: Registrado */}
                                <td className="px-6 py-3 text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                
                                {/* Columna: Acciones */}
                                <td className="px-6 py-3 space-x-2 whitespace-nowrap">
                                    
                                    {/* Selector de Rol. Llama a 'cambiarRol' que ahora abre el modal integrado */}
                                    <select
                                        value={u.rol}
                                        onChange={(e) => cambiarRol(u._id, e.target.value, u.nombre)}
                                        className="border border-gray-300 rounded-lg text-xs font-semibold px-2 py-1 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
                                    >
                                        <option value="cliente">Cliente</option>
                                        <option value="fisioterapeuta">Fisioterapeuta</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    
                                    {/* Botón Editar */}
                                    <button
                                        onClick={() => abrirModalEdicion(u)}
                                        title="Editar usuario"
                                        className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 p-2 rounded-full transition shadow-sm"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    
                                    {/* Botón Eliminar  */}
                                    <button
                                        onClick={() => eliminarUsuario(u._id)}
                                        title="Eliminar usuario"
                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 p-2 rounded-full transition shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {usuariosOrdenados.length === 0 && (
                    <p className="p-10 text-center text-gray-500 font-medium">
                        No se encontraron usuarios con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.
                    </p>
                )}
            </div>

            {/* Modal de Edición */}
            {modalVisible && usuarioEditando && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div
                        onClick={cerrarModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    ></div>

                    <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform scale-100 animate-fade-in border-t-4 border-teal-600">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                            Editar Perfil: <span className="text-teal-600">{usuarioEditando.nombre}</span>
                        </h2>

                        <div className="space-y-5">
                            {/* Lista de Campos del Formulario */}
                            {[
                                { field: "nombre", label: "Nombre", icon: <User size={18} /> }, 
                                { field: "apellido", label: "Apellido", icon: <User size={18} /> }, 
                                { field: "email", label: "Email", icon: <Mail size={18} /> }, 
                                { field: "telephone", label: "Teléfono", icon: <Phone size={18} /> },
                            ].map(({ field, label, icon }) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <div className="relative">
                                        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                            (field === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ||
                                            (field === "telephone" && formData.telephone && !/^[0-9]{9}$/.test(formData.telephone))
                                                ? "text-red-500" 
                                                : "text-gray-400"
                                        }`}>
                                            {icon}
                                        </div>
                                        <input
                                            type="text"
                                            value={formData[field] || ""}
                                            onChange={(e) => handleInputChange(field, e.target.value)}
                                            className={`border rounded-xl px-4 pl-10 py-2 w-full shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition text-gray-800 ${
                                                (field === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) ||
                                                (field === "telephone" && formData.telephone && !/^[0-9]{9}$/.test(formData.telephone))
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {field === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">Formato de email incorrecto.</p>
                                        )}
                                        {field === "telephone" && formData.telephone && !/^[0-9]{9}$/.test(formData.telephone) && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">Debe tener 9 dígitos numéricos.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* CAMPO: Especialidad */}
                            {usuarioEditando.rol === "fisioterapeuta" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                                    <select
                                        value={formData.especialidad || ""}
                                        onChange={(e) => handleInputChange("especialidad", e.target.value)}
                                        className="border rounded-xl px-4 py-2 w-full shadow-sm focus:ring-2 focus:ring-teal-500 outline-none transition border-gray-300 bg-white cursor-pointer"
                                    >
                                        <option value="">-- No asignada --</option>
                                        {ESPECIALIDADES.map(esp => (
                                            <option key={esp} value={esp}>{esp}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Indicador de cambios */}
                        {formHasChanged && (
                            <div className="mt-6 flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-sm font-medium rounded-lg border border-amber-200">
                                <AlertTriangle size={18} className="shrink-0" />
                                <span>Hay cambios pendientes de guardar.</span>
                            </div>
                        )}
                        
                        {/* Botones del Modal */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={cerrarModal}
                                className="px-5 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-semibold transition shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarEdicion}
                                disabled={!formHasChanged}
                                className={`px-5 py-2 text-white rounded-lg font-semibold transition shadow-md ${
                                    !formHasChanged 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-teal-600 hover:bg-teal-700'
                                }`}
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Cambio de Rol */}
            {confirmModalData && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4"> 
                    <div
                        onClick={() => setConfirmModalData(null)}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                    ></div>

                    <div className="relative bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform scale-100 border-t-4 border-amber-500">
                        <div className="flex flex-col items-center text-center">
                            
                            {/* Icono de advertencia */}
                            <RotateCw className="w-12 h-12 text-amber-500 mb-4" /> 
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                ¿Confirmar Cambio de Rol?
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Está a punto de cambiar el rol de **{confirmModalData.nombre}** a **{confirmModalData.nuevoRol.toUpperCase()}**. 
                                Esta acción puede modificar sus permisos de acceso.
                            </p>
                        </div>

                        <div className="flex justify-between gap-3 mt-4">
                            <button
                                onClick={() => setConfirmModalData(null)}
                                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => ejecutarCambioRol(confirmModalData.id, confirmModalData.nuevoRol)}
                                className="w-full px-4 py-2 text-white rounded-lg font-semibold transition bg-teal-600 hover:bg-teal-700 shadow-md"
                            >
                                Sí, Cambiar Rol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}