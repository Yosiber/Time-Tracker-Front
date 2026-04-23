// =============================================================================
// components/KaizenHub.tsx — Módulo de mejora continua basado en Kaizen
// Incluye: tablero PDCA, detector Muda, tendencia +1% y checklist 5S.
// Estado persistido en localStorage bajo clave `kaizen_{userId}`.
// =============================================================================
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { User, Activity } from '../types';

interface KaizenHubProps { currentUser: User; }

type PDCAPhase = 'plan' | 'do' | 'check' | 'act';

interface PDCACard {
  id: string;
  title: string;
  description: string;
  category: string;
  phase: PDCAPhase;
  createdAt: string;
}

interface FiveSEntry {
  date: string;
  seiri: boolean; seiton: boolean; seiso: boolean; seiketsu: boolean; shitsuke: boolean;
}

interface Activity {
  id: string; userId: string; dateActivity: string;
  impactPoints?: number; durationActivity: number;
  categoryActivity: string; nameActivity: string;
}

const PDCA_PHASES: { key: PDCAPhase; label: string; emoji: string; color: string; bg: string }[] = [
  { key: 'plan',  label: 'Planificar', emoji: '🎯', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  { key: 'do',    label: 'Hacer',      emoji: '⚡', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)'   },
  { key: 'check', label: 'Verificar',  emoji: '🔍', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { key: 'act',   label: 'Actuar',     emoji: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
];

const FIVE_S = [
  { key: 'seiri'    as const, label: 'Seiri — Clasificar',    desc: '¿Eliminaste distracciones hoy?',     emoji: '🗂️' },
  { key: 'seiton'   as const, label: 'Seiton — Ordenar',      desc: '¿Tenías tus herramientas listas?',   emoji: '📐' },
  { key: 'seiso'    as const, label: 'Seiso — Limpiar',       desc: '¿Terminaste lo que empezaste?',      emoji: '✨' },
  { key: 'seiketsu' as const, label: 'Seiketsu — Estandarizar', desc: '¿Seguiste tu rutina?',             emoji: '🔄' },
  { key: 'shitsuke' as const, label: 'Shitsuke — Disciplina', desc: '¿Cumpliste tus metas del día?',      emoji: '💪' },
];

const TODAY = new Date().toISOString().split('T')[0];
const SEV_COLOR = { high: '#f43f5e', medium: '#f59e0b', low: '#10b981' };

export default function KaizenHub({ currentUser }: KaizenHubProps) {
  const storageKey = `kaizen_${currentUser.id}`;

  const [cards, setCards]           = useState<PDCACard[]>([]);
  const [newTitle, setNewTitle]     = useState('');
  const [newDesc, setNewDesc]       = useState('');
  const [newCat, setNewCat]         = useState('STUDY');
  const [showForm, setShowForm]     = useState(false);

  const [fiveSToday, setFiveSToday]       = useState<FiveSEntry>({ date: TODAY, seiri: false, seiton: false, seiso: false, seiketsu: false, shitsuke: false });
  const [fiveSHistory, setFiveSHistory]   = useState<FiveSEntry[]>([]);

  const [activities, setActivities]         = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // ── Load localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      setCards(data.cards || []);
      const history: FiveSEntry[] = data.fiveSHistory || [];
      setFiveSHistory(history);
      const todayEntry = history.find(e => e.date === TODAY);
      if (todayEntry) setFiveSToday(todayEntry);
    }
  }, [storageKey]);

  const persist = useCallback((c: PDCACard[], h: FiveSEntry[]) => {
    localStorage.setItem(storageKey, JSON.stringify({ cards: c, fiveSHistory: h }));
  }, [storageKey]);

  // ── Fetch activities ──
  useEffect(() => {
    (async () => {
      try {
        const all = await api.getActivities();
        setActivities(all.filter((a: Activity) => a.userId === currentUser.id));
      } catch (e) { console.error(e); }
      finally { setActivitiesLoading(false); }
    })();
  }, [currentUser.id]);

  // ── PDCA handlers ──
  const addCard = () => {
    if (!newTitle.trim()) return;
    const card: PDCACard = { id: Date.now().toString(), title: newTitle.trim(), description: newDesc.trim(), category: newCat, phase: 'plan', createdAt: TODAY };
    const updated = [card, ...cards];
    setCards(updated); persist(updated, fiveSHistory);
    setNewTitle(''); setNewDesc(''); setShowForm(false);
  };

  const moveCard = (id: string, dir: 1 | -1) => {
    const order: PDCAPhase[] = ['plan', 'do', 'check', 'act'];
    const updated = cards.map(c => {
      if (c.id !== id) return c;
      const i = order.indexOf(c.phase);
      return { ...c, phase: order[Math.max(0, Math.min(3, i + dir))] };
    });
    setCards(updated); persist(updated, fiveSHistory);
  };

  const deleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated); persist(updated, fiveSHistory);
  };

  // ── 5S handlers ──
  const toggle5S = (key: keyof Omit<FiveSEntry, 'date'>) => {
    const updated = { ...fiveSToday, [key]: !fiveSToday[key] };
    setFiveSToday(updated);
    const history = [updated, ...fiveSHistory.filter(e => e.date !== TODAY)];
    setFiveSHistory(history); persist(cards, history);
  };

  // ── Analytics ──
  const getLast30 = () => {
    const days: { date: string; points: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push({ date: ds, points: activities.filter(a => a.dateActivity.split('T')[0] === ds).reduce((s, a) => s + (a.impactPoints || 0), 0) });
    }
    return days;
  };

  const getMuda = (last30: { date: string; points: number }[]) => {
    const ins: { message: string; severity: 'high' | 'medium' | 'low'; emoji: string; type: string }[] = [];
    const emptyDays = last30.filter(d => d.points === 0).length;
    if (emptyDays > 10) ins.push({ type: 'Tiempo muerto',    message: `${emptyDays} días sin actividad en el último mes`, severity: 'high',   emoji: '⏸️' });
    else if (emptyDays > 5) ins.push({ type: 'Tiempo muerto', message: `${emptyDays} días sin actividad en el último mes`, severity: 'medium', emoji: '⏸️' });

    const short = activities.filter(a => a.durationActivity < 10).length;
    if (short > 3) ins.push({ type: 'Micro-actividades', message: `${short} actividades de menos de 10 min (bajo impacto)`, severity: 'medium', emoji: '⚡' });

    let streak = 0;
    for (let i = last30.length - 1; i >= 0; i--) { if (last30[i].points > 0) streak++; else break; }
    if (streak === 0) ins.push({ type: 'Racha rota', message: 'Sin racha activa. ¡Hoy es el día para empezar!', severity: 'high', emoji: '🔥' });

    const cats = [...new Set(activities.map(a => a.categoryActivity))];
    if (cats.length === 1) ins.push({ type: 'Desbalance', message: `Solo usas la categoría "${cats[0]}". ¡Diversifica!`, severity: 'low', emoji: '⚖️' });

    if (ins.length === 0) ins.push({ type: 'Sin desperdicios', message: '¡Sin desperdicios detectados! Estás en modo Kaizen 🎯', severity: 'low', emoji: '✅' });
    return { insights: ins, streak };
  };

  const getSparkline = (data: { date: string; points: number }[]) => {
    const max = Math.max(...data.map(d => d.points), 1);
    const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - (d.points / max) * 40}`).join(' ');
    const avg7first = data.slice(0, 7).reduce((s, d) => s + d.points, 0) / 7;
    const avg7last  = data.slice(-7).reduce((s, d) => s + d.points, 0) / 7;
    return { pts, improving: avg7last >= avg7first, avgFirst: Math.round(avg7first), avgLast: Math.round(avg7last) };
  };

  const last30 = getLast30();
  const { insights, streak } = getMuda(last30);
  const { pts, improving, avgFirst, avgLast } = getSparkline(last30);
  const fiveSScore = [fiveSToday.seiri, fiveSToday.seiton, fiveSToday.seiso, fiveSToday.seiketsu, fiveSToday.shitsuke].filter(Boolean).length;
  const totalPts   = activities.reduce((s, a) => s + (a.impactPoints || 0), 0);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="animate-slide-up">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">♾️</span>
          <h2 className="text-2xl font-bold text-slate-200">Kaizen Hub</h2>
        </div>
        <p className="text-sm text-slate-500 ml-12">改善 · Mejora continua — pequeños pasos, grandes resultados</p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up delay-100">
        {[
          { label: 'Racha actual',   value: `${streak}d`,    icon: '🔥', color: '#f59e0b' },
          { label: 'Tarjetas PDCA',  value: cards.length,    icon: '🔄', color: '#a855f7' },
          { label: 'Score 5S hoy',   value: `${fiveSScore}/5`, icon: '🏭', color: '#06b6d4' },
          { label: 'Puntos totales', value: totalPts,         icon: '⭐', color: '#10b981' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-strong rounded-2xl p-4" style={{ border: `1px solid ${kpi.color}25` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">{kpi.label}</span>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: PDCA Board ── */}
      <section className="animate-slide-up delay-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">🔄 Ciclo PDCA</h3>
            <p className="text-xs text-slate-500 mt-0.5">Planificar → Hacer → Verificar → Actuar</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary rounded-xl px-4 py-2 text-sm">
            {showForm ? '✕ Cancelar' : '＋ Nueva mejora'}
          </button>
        </div>

        {showForm && (
          <div className="glass-strong rounded-2xl p-5 mb-4 animate-scale-in" style={{ border: '1px solid rgba(168,85,247,0.3)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input className="input-dark rounded-xl px-4 py-2.5 text-sm sm:col-span-2" placeholder="¿Qué quieres mejorar? Ej: Estudiar 30 min más al día" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <select className="input-dark rounded-xl px-4 py-2.5 text-sm" value={newCat} onChange={e => setNewCat(e.target.value)}>
                <option value="STUDY">📚 Estudio</option>
                <option value="GYM">🏋️ Gym</option>
                <option value="REST">🌙 Descanso</option>
                <option value="GENERAL">⚙️ General</option>
              </select>
            </div>
            <textarea className="input-dark rounded-xl px-4 py-2.5 text-sm w-full mb-3 resize-none" rows={2} placeholder="Descripción (opcional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <button onClick={addCard} disabled={!newTitle.trim()} className="btn-primary rounded-xl px-6 py-2 text-sm">Añadir al tablero</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PDCA_PHASES.map(phase => {
            const phaseCards = cards.filter(c => c.phase === phase.key);
            return (
              <div key={phase.key} className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${phase.color}20` }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ background: phase.bg, borderBottom: `1px solid ${phase.color}20` }}>
                  <span>{phase.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: phase.color }}>{phase.label}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: `${phase.color}25`, color: phase.color }}>{phaseCards.length}</span>
                </div>
                <div className="p-3 space-y-2 min-h-[120px]">
                  {phaseCards.length === 0 && <div className="text-center py-6 text-xs text-slate-600">Vacío</div>}
                  {phaseCards.map(card => (
                    <div key={card.id} className="kaizen-card glass rounded-xl p-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-slate-200 leading-tight">{card.title}</span>
                        <button onClick={() => deleteCard(card.id)} className="text-slate-600 hover:text-red-400 transition-colors text-xs flex-shrink-0">✕</button>
                      </div>
                      {card.description && <p className="text-xs text-slate-500 mb-2 leading-tight">{card.description}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: phase.color }}>{card.category}</span>
                        <div className="flex gap-1">
                          {phase.key !== 'plan' && <button onClick={() => moveCard(card.id, -1)} className="text-xs px-1.5 py-0.5 rounded glass text-slate-400 hover:text-white transition-colors">◀</button>}
                          {phase.key !== 'act'  && <button onClick={() => moveCard(card.id,  1)} className="text-xs px-1.5 py-0.5 rounded glass text-slate-400 hover:text-white transition-colors">▶</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: Muda Detector ── */}
      <section className="animate-slide-up delay-300">
        <h3 className="text-lg font-semibold text-slate-200 mb-1">🗑️ Muda Detector</h3>
        <p className="text-xs text-slate-500 mb-4">Análisis de desperdicios en tus hábitos — basado en tus actividades reales</p>
        {activitiesLoading ? (
          <div className="glass-strong rounded-2xl p-8 text-center" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-slate-500 text-sm">Analizando actividades...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="glass-strong rounded-xl px-5 py-4 flex items-center gap-4" style={{ border: `1px solid ${SEV_COLOR[ins.severity]}25` }}>
                <span className="text-2xl">{ins.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{ins.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ins.type}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ background: `${SEV_COLOR[ins.severity]}20`, color: SEV_COLOR[ins.severity] }}>
                  {ins.severity === 'high' ? 'Crítico' : ins.severity === 'medium' ? 'Medio' : 'OK'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SECTION 3: +1% Trend ── */}
      <section className="animate-slide-up delay-400">
        <h3 className="text-lg font-semibold text-slate-200 mb-1">📈 Tendencia +1%</h3>
        <p className="text-xs text-slate-500 mb-4">Tu curva de mejora en los últimos 30 días</p>
        <div className="glass-strong rounded-2xl p-6" style={{ border: '1px solid rgba(168,85,247,0.2)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Promedio últimos 7 días</div>
              <div className="text-3xl font-bold" style={{ color: improving ? '#10b981' : '#f43f5e' }}>{avgLast} pts</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">vs 7 días anteriores</div>
              <div className="flex items-center gap-1 justify-end" style={{ color: improving ? '#10b981' : '#f43f5e' }}>
                <span className="text-2xl">{improving ? '↗' : '↘'}</span>
                <span className="text-xl font-bold">{improving ? '+' : ''}{avgLast - avgFirst} pts</span>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <svg viewBox="0 0 100 42" className="w-full" style={{ height: '80px' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="kzGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={improving ? '#10b981' : '#f43f5e'} stopOpacity="0.35" />
                <stop offset="100%" stopColor={improving ? '#10b981' : '#f43f5e'} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map(f => (
              <line key={f} x1="0" y1={40 * f} x2="100" y2={40 * f} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            ))}
            <polyline points={pts} fill="none" stroke={improving ? '#10b981' : '#f43f5e'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex justify-between mt-1 mb-4">
            <span className="text-xs text-slate-600">Hace 30 días</span>
            <span className="text-xs text-slate-600">Hoy</span>
          </div>

          <div className="px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: improving ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${improving ? '#10b98130' : '#f43f5e30'}` }}>
            <span className="text-xl">{improving ? '🎯' : '💡'}</span>
            <p className="text-sm" style={{ color: improving ? '#6ee7b7' : '#fb7185' }}>
              {improving
                ? '¡Tendencia positiva! Mentalidad Kaizen activa — sigue acumulando esos +1% diarios.'
                : 'Tendencia a la baja. Momento ideal para revisar tu ciclo PDCA y hacer ajustes.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: 5S Checklist ── */}
      <section className="animate-slide-up delay-500 pb-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-1">🏭 5S Personal</h3>
        <p className="text-xs text-slate-500 mb-4">Checklist de organización diaria — {TODAY}</p>
        <div className="glass-strong rounded-2xl p-6" style={{ border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-slate-400">Score de hoy</span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{ background: n <= fiveSScore ? '#06b6d4' : 'rgba(255,255,255,0.1)', boxShadow: n <= fiveSScore ? '0 0 6px rgba(6,182,212,0.6)' : 'none' }} />
                ))}
              </div>
              <span className="text-lg font-bold" style={{ color: '#06b6d4' }}>{fiveSScore}/5</span>
            </div>
          </div>

          <div className="space-y-3">
            {FIVE_S.map(item => {
              const checked = fiveSToday[item.key];
              return (
                <button key={item.key} onClick={() => toggle5S(item.key)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-left"
                  style={{ background: checked ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${checked ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: checked ? '#67e8f9' : '#94a3b8' }}>{item.label}</div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </div>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{ background: checked ? '#06b6d4' : 'rgba(255,255,255,0.08)', border: `1px solid ${checked ? '#06b6d4' : 'rgba(255,255,255,0.15)'}` }}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Weekly 5S mini-history */}
          {fiveSHistory.length > 1 && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Historial reciente</p>
              <div className="flex gap-2 flex-wrap">
                {fiveSHistory.slice(0, 7).map(entry => {
                  const score = [entry.seiri, entry.seiton, entry.seiso, entry.seiketsu, entry.shitsuke].filter(Boolean).length;
                  const color = score >= 4 ? '#10b981' : score >= 2 ? '#f59e0b' : '#f43f5e';
                  return (
                    <div key={entry.date} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>{score}</div>
                      <span className="text-xs text-slate-600">{entry.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
