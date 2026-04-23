import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from './UserSelect';

interface Activity {
  id: string;
  nameActivity: string;
  durationActivity: number;
  dateActivity: string;
  categoryActivity: string;
  userId: string;
}

interface ActivityManagementProps {
  currentUser: User;
}

export default function ActivityManagement({ currentUser }: ActivityManagementProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Form state
  const [nameActivity, setNameActivity] = useState('');
  const [durationActivity, setDurationActivity] = useState<number | ''>('');
  const [dateActivity, setDateActivity] = useState('');
  const [categoryActivity, setCategoryActivity] = useState('STUDY');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const activitiesData = await api.getActivities();
      // Filter activities for the current user only
      const userActivities = activitiesData.filter((a: Activity) => a.userId === currentUser.id);
      setActivities(userActivities);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos');
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]); // re-fetch if user changes

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationActivity) return;

    setLoading(true);
    setError(null);
    try {
      const formattedDate = dateActivity.includes('T') ? dateActivity : `${dateActivity}T00:00:00`;
      
      await api.createActivity({
        nameActivity,
        durationActivity: Number(durationActivity),
        dateActivity: formattedDate,
        categoryActivity,
        userId: currentUser.id // Use the injected user ID
      });
      
      setNameActivity('');
      setDurationActivity('');
      setDateActivity('');
      setCategoryActivity('STUDY');
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Mis Actividades</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateActivity} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="lg:col-span-4 mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Registrar nueva actividad</h3>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            value={nameActivity}
            onChange={(e) => setNameActivity(e.target.value)}
            placeholder="Ej. Leer un libro"
            minLength={3}
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Duración (min)</label>
          <input
            type="number"
            required
            min="1"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            value={durationActivity}
            onChange={(e) => setDurationActivity(Number(e.target.value))}
            placeholder="Ej. 60"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            value={dateActivity}
            onChange={(e) => setDateActivity(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-sm"
            value={categoryActivity}
            onChange={(e) => setCategoryActivity(e.target.value)}
          >
            <option value="STUDY">STUDY</option>
            <option value="GYM">GYM</option>
            <option value="REST">REST</option>
          </select>
        </div>
        
        <div className="lg:col-span-4 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? 'Guardando...' : 'Guardar Actividad'}
          </button>
        </div>
      </form>

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
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No tienes actividades registradas aún.
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
