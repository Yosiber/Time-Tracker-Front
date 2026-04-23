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
  impactPoints?: number;
}

interface ActivityManagementProps {
  currentUser: User;
}

const CATEGORY_META: Record<string, { label: string; emoji: string; badgeClass: string; color: string }> = {
  STUDY: { label: 'Estudio',  emoji: '📚', badgeClass: 'badge-study', color: '#a855f7' },
  GYM:   { label: 'Gym',     emoji: '🏋️', badgeClass: 'badge-gym',   color: '#06b6d4' },
  REST:  { label: 'Descanso',emoji: '🌙', badgeClass: 'badge-rest',  color: '#10b981' },
};

export default function ActivityManagement({ currentUser }: ActivityManagementProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [nameActivity, setNameActivity] = useState('');
  const [durationActivity, setDurationActivity] = useState<number | ''>('');
  const [dateActivity, setDateActivity] = useState('');
  const [categoryActivity, setCategoryActivity] = useState('STUDY');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const activitiesData = await api.getActivities();
      const userActivities = activitiesData.filter((a: Activity) => a.userId === currentUser.id);
      setActivities(userActivities);
    } catch (err) {
      console.error(err);
      setError('Error al cargar actividades');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser.id]);

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
        userId: currentUser.id,
      });
      setNameActivity('');
      setDurationActivity('');
      setDateActivity('');
      setCategoryActivity('STUDY');
      setSuccessMsg('¡Actividad registrada!');
      setTimeout(() => setSuccessMsg(null), 3000);
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

  const totalPoints = activities.reduce((s, a) => s + (a.impactPoints || 0), 0);
  const totalMinutes = activities.reduce((s, a) => s + a.durationActivity, 0);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 animate-slide-up">
        {[
          { label: 'Actividades', value: activities.length, icon: '⚡', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
          { label: 'Minutos Totales', value: totalMinutes, icon: '⏱️', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Puntos Totales', value: totalPoints, icon: '🏆', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        ].map(stat => (
          <div key={stat.label} className="glass-strong rounded-2xl p-5" style={{ border: `1px solid ${stat.color}25` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="glass-strong rounded-2xl p-6 animate-slide-up delay-100" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <h2 className="font-semibold text-slate-200">Registrar Actividad</h2>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleCreateActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.7)' }}>Nombre</label>
            <input
              type="text" required minLength={3} maxLength={100}
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
              value={nameActivity}
              onChange={e => setNameActivity(e.target.value)}
              placeholder="Ej. Leer un libro"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.7)' }}>Duración (min)</label>
            <input
              type="number" required min="1"
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
              value={durationActivity}
              onChange={e => setDurationActivity(Number(e.target.value))}
              placeholder="Ej. 60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.7)' }}>Fecha</label>
            <input
              type="date" required
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
              value={dateActivity}
              onChange={e => setDateActivity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.7)' }}>Categoría</label>
            <select
              className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
              value={categoryActivity}
              onChange={e => setCategoryActivity(e.target.value)}
            >
              {Object.entries(CATEGORY_META).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={loading} className="btn-primary rounded-xl py-2.5 px-8 text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Guardando...
                </span>
              ) : '＋ Guardar Actividad'}
            </button>
          </div>
        </form>
      </div>

      {/* Activities Table */}
      <div className="glass-strong rounded-2xl overflow-hidden animate-slide-up delay-200" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-semibold text-slate-200">Mis Actividades</h3>
          <span className="text-xs text-slate-500">{activities.length} registros</span>
        </div>

        {fetchLoading ? (
          <div className="p-8 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full" style={{ border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', animation: 'spin-slow 1s linear infinite' }} />
              <span className="text-sm text-slate-500">Cargando...</span>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-400 text-sm">No tienes actividades registradas.</p>
            <p className="text-slate-600 text-xs mt-1">¡Usa el formulario de arriba para empezar!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {['Actividad', 'Categoría', 'Duración', 'Puntos', 'Fecha', ''].map(h => (
                    <th key={h} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.6)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activities.map((act, i) => {
                  const meta = CATEGORY_META[act.categoryActivity] || { label: act.categoryActivity, emoji: '📌', badgeClass: 'badge-study' };
                  return (
                    <tr key={act.id} className="table-row-hover transition-all border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', animationDelay: `${i * 0.04}s` }}>
                      <td className="py-3.5 px-5">
                        <span className="font-medium text-slate-200 text-sm">{act.nameActivity}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`${meta.badgeClass} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium`}>
                          <span>{meta.emoji}</span>{meta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-slate-400">{act.durationActivity} min</td>
                      <td className="py-3.5 px-5">
                        <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{act.impactPoints ?? '—'}</span>
                      </td>
                      <td className="py-3.5 px-5 text-sm text-slate-500">{new Date(act.dateActivity).toLocaleDateString()}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ color: 'rgba(148,163,184,0.6)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#f43f5e';
                            e.currentTarget.style.background = 'rgba(244,63,94,0.12)';
                            e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'rgba(148,163,184,0.6)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
