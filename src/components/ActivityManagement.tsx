import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
}

interface Activity {
  id: string;
  nameActivity: string;
  durationActivity: number;
  dateActivity: string;
  categoryActivity: string;
  userId: string;
}

export default function ActivityManagement() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state
  const [nameActivity, setNameActivity] = useState('');
  const [durationActivity, setDurationActivity] = useState<number | ''>('');
  const [dateActivity, setDateActivity] = useState('');
  const [categoryActivity, setCategoryActivity] = useState('STUDY');
  const [userId, setUserId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [activitiesData, usersData] = await Promise.all([
        api.getActivities(),
        api.getUsers()
      ]);
      setActivities(activitiesData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationActivity || !userId) return;

    setLoading(true);
    setError(null);
    try {
      // Assuming dateActivity is in 'YYYY-MM-DD' format, backend expects LocalDateTime
      // So appending 'T00:00:00' to match LocalDateTime parsing, if necessary.
      // Often just 'YYYY-MM-DD' fails if the backend expects time as well. Let's send a full ISO string or at least midnight time.
      const formattedDate = dateActivity.includes('T') ? dateActivity : `${dateActivity}T00:00:00`;
      
      await api.createActivity({
        nameActivity,
        durationActivity: Number(durationActivity),
        dateActivity: formattedDate,
        categoryActivity,
        userId
      });
      
      setNameActivity('');
      setDurationActivity('');
      setDateActivity('');
      setCategoryActivity('STUDY');
      setUserId('');
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error al crear actividad. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await api.deleteActivity(id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('Error al eliminar actividad');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Gestión de Actividades</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateActivity} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={nameActivity}
            onChange={(e) => setNameActivity(e.target.value)}
            placeholder="Ej. Leer un libro"
            minLength={3}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
          <input
            type="number"
            required
            min="1"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={durationActivity}
            onChange={(e) => setDurationActivity(Number(e.target.value))}
            placeholder="Ej. 60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={dateActivity}
            onChange={(e) => setDateActivity(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            value={categoryActivity}
            onChange={(e) => setCategoryActivity(e.target.value)}
          >
            <option value="STUDY">STUDY</option>
            <option value="GYM">GYM</option>
            <option value="REST">REST</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <select
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="" disabled>Seleccione un usuario</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading || users.length === 0}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-[42px]"
        >
          {loading ? 'Guardando...' : 'Crear Actividad'}
        </button>
      </form>

      {users.length === 0 && !loading && (
        <p className="text-sm text-orange-600 mb-4">
          Crea primero un usuario para poder registrar actividades.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Nombre</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Duración</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Categoría</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600">Fecha</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No hay actividades registradas
                </td>
              </tr>
            ) : (
              activities.map((act) => (
                <tr key={act.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">{act.nameActivity}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{act.durationActivity} min</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">{act.categoryActivity}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(act.dateActivity).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteActivity(act.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
