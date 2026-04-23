// =============================================================================
// components/UserSelect.tsx — Pantalla de selección/creación de usuario
// =============================================================================
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

// Re-exportamos User para que App.tsx no tenga que cambiar su import path
export type { User } from '../types';

interface UserSelectProps {
  onSelectUser: (user: User) => void;
}

const AVATAR_COLORS = [
  ['#a855f7', '#7c3aed'],
  ['#06b6d4', '#0284c7'],
  ['#10b981', '#059669'],
  ['#f59e0b', '#d97706'],
  ['#f43f5e', '#e11d48'],
];

function getAvatarGradient(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function UserSelect({ onSelectUser }: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar usuarios');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createUser({ name, email });
      setName('');
      setEmail('');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError('Error al crear el usuario. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl btn-primary flex items-center justify-center animate-pulse-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <h1 className="text-5xl font-800 mb-3 tracking-tight">
          <span className="gradient-text">TimeTracker</span>
        </h1>
        <p className="text-slate-400 text-lg font-light">
          Tu productividad, cuantificada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up delay-200">
        {/* Create User Card */}
        <div className="glass-strong rounded-2xl p-6 gradient-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h3 className="font-semibold text-slate-200">Nuevo Usuario</h3>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Nombre</label>
              <input
                type="text"
                required
                className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(148,163,184,0.8)' }}>Email</label>
              <input
                type="email"
                required
                className="input-dark w-full rounded-xl px-4 py-2.5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-2.5 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Creando...
                </span>
              ) : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm font-medium text-slate-400">Selecciona tu perfil</p>
            {!fetchLoading && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                {users.length}
              </span>
            )}
          </div>

          {fetchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-4xl mb-3">🧑‍💻</div>
              <p className="text-slate-400 text-sm">No hay usuarios todavía.</p>
              <p className="text-slate-500 text-xs mt-1">Crea uno con el formulario.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {users.map((u, i) => {
                const [c1, c2] = getAvatarGradient(u.name);
                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className="glass rounded-2xl p-5 cursor-pointer group transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${i * 0.07}s`, animationFillMode: 'both' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(168,85,247,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(168,85,247,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-slate-200 truncate">{u.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
