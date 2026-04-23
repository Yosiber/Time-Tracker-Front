// =============================================================================
// components/Dashboard.tsx — Dashboard de rendimiento diario por usuario
// =============================================================================
import { useState } from 'react';
import { api } from '../services/api';
import { getCategoryColor, getCategoryEmoji, CATEGORY_META } from '../constants/categories';
import type { User, Activity } from '../types';

interface DashboardProps {
  currentUser: User;
}

interface DayResult {
  points: number;
  verdict: ReturnType<typeof calculateVerdict>;
  byCategory: { name: string; points: number; count: number; color: string }[];
  totalActivities: number;
}

const calculateVerdict = (points: number): { text: string; emoji: string; color: string; description: string } => {
  if (points <= 0)   return { text: 'Sin actividad',    emoji: '😴', color: '#64748b', description: 'No hay actividades para esta fecha.' };
  if (points <= 100) return { text: 'Día flojo',        emoji: '😐', color: '#f59e0b', description: 'Puedes hacer más. ¡Mañana será mejor!' };
  if (points <= 400) return { text: 'Día equilibrado',  emoji: '💪', color: '#06b6d4', description: '¡Buen balance! Sigue así.' };
  return               { text: 'Alto rendimiento',      emoji: '🔥', color: '#a855f7', description: '¡Rendimiento excepcional! ¡Eres imparable!' };
};

export default function Dashboard({ currentUser }: DashboardProps) {
  const [date, setDate]       = useState('');
  const [results, setResults] = useState<DayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const all: Activity[] = await api.getActivities();
      const filtered = all.filter(act => act.userId === currentUser.id && act.dateActivity.split('T')[0] === date);
      const totalPoints = filtered.reduce((s, a) => s + (a.impactPoints || 0), 0);

      // Group by category
      const catMap: Record<string, { points: number; count: number }> = {};
      for (const act of filtered) {
        if (!catMap[act.categoryActivity]) catMap[act.categoryActivity] = { points: 0, count: 0 };
        catMap[act.categoryActivity].points += act.impactPoints || 0;
        catMap[act.categoryActivity].count++;
      }
      const byCategory = Object.entries(catMap).map(([name, data]) => ({
        name, ...data, color: getCategoryColor(name),
      }));

      setResults({ points: totalPoints, verdict: calculateVerdict(totalPoints), byCategory, totalActivities: filtered.length });
    } catch (err) {
      console.error(err);
      setError('Error al consultar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const maxCategoryPoints = results ? Math.max(...results.byCategory.map(c => c.points), 1) : 1;

  return (
    <div className="space-y-6">

      {/* ── Title ── */}
      <div className="animate-slide-up">
        <h2 className="text-2xl font-bold text-slate-200 mb-1">Mi Dashboard</h2>
        <p className="text-sm text-slate-500">Consulta tu rendimiento del día</p>
      </div>

      {/* ── Date Selector ── */}
      <div className="glass-strong rounded-2xl p-6 animate-slide-up delay-100" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
        <form onSubmit={handleConsult} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.7)' }}>Selecciona una fecha</label>
            <input type="date" required className="input-dark w-full rounded-xl px-4 py-3 text-sm" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <button type="submit" disabled={loading || !date} className="btn-primary rounded-xl px-8 py-3 text-sm whitespace-nowrap">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                Consultando...
              </span>
            ) : '🔍 Ver resultados'}
          </button>
        </form>
        {error && <div className="mt-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>{error}</div>}
      </div>

      {/* ── Results ── */}
      {results && (
        <div className="space-y-4 animate-scale-in">
          {/* Verdict Hero */}
          <div className="glass-strong rounded-2xl p-8 text-center relative overflow-hidden" style={{ border: `1px solid ${results.verdict.color}30` }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${results.verdict.color} 0%, transparent 70%)` }} />
            <div className="text-6xl mb-4">{results.verdict.emoji}</div>
            <div className="text-5xl font-800 mb-2" style={{ color: results.verdict.color }}>{results.points} pts</div>
            <div className="text-xl font-semibold text-slate-200 mb-2">{results.verdict.text}</div>
            <div className="text-sm text-slate-400">{results.verdict.description}</div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 text-center" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: '#06b6d4' }}>{results.totalActivities}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Actividades</div>
            </div>
            <div className="glass rounded-2xl p-5 text-center" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-3xl font-bold mb-1" style={{ color: '#10b981' }}>{results.byCategory.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Categorías</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {results.byCategory.length > 0 && (
            <div className="glass-strong rounded-2xl p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-sm font-semibold text-slate-300 mb-5 uppercase tracking-wider">Desglose por categoría</h3>
              <div className="space-y-4">
                {results.byCategory.map(cat => {
                  const pct = Math.round((cat.points / maxCategoryPoints) * 100);
                  // Use shared helper — falls back gracefully for unknown categories
                  const catEmoji = getCategoryEmoji(cat.name);
                  const catMeta  = CATEGORY_META[cat.name];
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300 flex items-center gap-2">
                          <span>{catEmoji}</span>
                          <span className="font-medium">{catMeta?.label ?? cat.name}</span>
                          <span className="text-xs text-slate-600">× {cat.count}</span>
                        </span>
                        <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.points} pts</span>
                      </div>
                      <div className="progress-bar-track h-2">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cat.color}aa, ${cat.color})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty State ── */}
      {!results && !loading && (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="text-5xl mb-4 animate-float">📅</div>
          <p className="text-slate-400">Selecciona una fecha para ver tu rendimiento</p>
        </div>
      )}
    </div>
  );
}
