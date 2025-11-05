import { useUsuarios } from "../../hooks/useUsuarios";

const UsuariosPage = () => {
  const { usuarios, loading } = useUsuarios();

  if (loading) return <p className="p-6">Cargando usuarios...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-teal-700 mb-4">👥 Usuarios</h2>
      {usuarios.length > 0 ? (
        <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t text-gray-700 hover:bg-gray-50">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}
    </div>
  );
};

export default UsuariosPage;
