import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserSelectProps {
  onSelectUser: (user: User) => void;
}

export default function UserSelect({ onSelectUser }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createUser({ name, email });
      setName('');
      setEmail('');
      fetchUsers();
      // Optional: automatically select the new user
      // onSelectUser(newUser); 
    } catch (err) {
      console.error(err);
      setError('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido a TimeTracker</h2>
        <p className="text-gray-500">Selecciona tu usuario para continuar o crea uno nuevo.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Create User */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Nuevo Usuario</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* Right Column: User List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.length === 0 ? (
            <div className="col-span-full bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              No hay usuarios registrados. ¡Crea uno a la izquierda!
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUser(u)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all group flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{u.name}</h4>
                  <p className="text-xs text-gray-500 truncate w-40">{u.email}</p>
                </div>
                <button className="mt-2 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ingresar &rarr;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
