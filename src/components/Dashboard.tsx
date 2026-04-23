import { useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [date, setDate] = useState('');
  const [points, setPoints] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    setError(null);
    try {
      // Backend expects standard LocalDate formatting YYYY-MM-DD
      const [pointsRes, verdictRes] = await Promise.all([
        api.getDailyPoints(date),
        api.getDailyVerdict(date)
      ]);
      setPoints(pointsRes);
      setVerdict(verdictRes);
    } catch (err) {
      console.error(err);
      setError('Error al consultar datos para la fecha seleccionada.');
      setPoints(null);
      setVerdict(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard Diario</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleConsult} className="flex gap-4 mb-8 items-end max-w-md">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha a consultar</label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !date}
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-[42px]"
        >
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {points !== null && verdict !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 flex flex-col items-center justify-center text-center">
            <span className="text-purple-600 font-medium mb-2 text-sm uppercase tracking-wider">Puntos del Día</span>
            <span className="text-4xl font-bold text-purple-900">{points}</span>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col items-center justify-center text-center">
            <span className="text-blue-600 font-medium mb-2 text-sm uppercase tracking-wider">Veredicto</span>
            <span className="text-xl font-semibold text-blue-900">{verdict}</span>
          </div>
        </div>
      )}
    </div>
  );
}
