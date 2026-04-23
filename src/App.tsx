import { useState } from 'react';
import type { User } from './components/UserSelect';
import UserSelect from './components/UserSelect';
import ActivityManagement from './components/ActivityManagement';
import Dashboard from './components/Dashboard';
import KaizenHub from './components/KaizenHub';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'dashboard' | 'kaizen'>('activities');

  if (!currentUser) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        {/* Aurora background */}
        <div className="aurora-bg">
          <div className="aurora-blob animate-aurora" style={{ width: '600px', height: '600px', background: '#a855f7', top: '-10%', left: '-10%' }} />
          <div className="aurora-blob animate-aurora delay-300" style={{ width: '500px', height: '500px', background: '#06b6d4', bottom: '-10%', right: '-5%' }} />
          <div className="aurora-blob animate-aurora delay-500" style={{ width: '400px', height: '400px', background: '#7c3aed', top: '40%', left: '40%' }} />
        </div>
        {/* Subtle grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 w-full">
          <UserSelect onSelectUser={setCurrentUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Aurora background always present */}
      <div className="aurora-bg">
        <div className="aurora-blob animate-aurora" style={{ width: '700px', height: '700px', background: '#a855f7', top: '-20%', left: '-15%' }} />
        <div className="aurora-blob animate-aurora delay-400" style={{ width: '600px', height: '600px', background: '#06b6d4', bottom: '-20%', right: '-10%' }} />
      </div>
      <div className="absolute inset-0 z-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* HEADER */}
      <header className="relative z-20 glass-strong sticky top-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo + User pill */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl btn-primary flex items-center justify-center animate-pulse-glow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
              </div>
              <span className="text-lg font-800 gradient-text hidden sm:block tracking-tight">TimeTracker</span>
            </div>

            <div className="hidden sm:block w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass" style={{ border: '1px solid rgba(168,85,247,0.25)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #06b6d4)' }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-200">{currentUser.name}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {([
              { key: 'activities', label: 'Actividades' },
              { key: 'dashboard',  label: 'Dashboard'   },
              { key: 'kaizen',     label: '♾️ Kaizen'   },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: activeTab === key
                    ? key === 'kaizen' ? '#67e8f9' : '#c084fc'
                    : 'rgba(148,163,184,0.8)',
                  background: activeTab === key
                    ? key === 'kaizen' ? 'rgba(6,182,212,0.15)' : 'rgba(168,85,247,0.15)'
                    : 'transparent',
                }}
              >
                {activeTab === key && (
                  <span className="absolute inset-0 rounded-lg" style={{
                    background: key === 'kaizen' ? 'rgba(6,182,212,0.08)' : 'rgba(168,85,247,0.08)',
                    boxShadow: `inset 0 0 0 1px ${key === 'kaizen' ? 'rgba(6,182,212,0.3)' : 'rgba(168,85,247,0.3)'}`
                  }} />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}

            <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <button
              onClick={() => setCurrentUser(null)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: 'rgba(148,163,184,0.7)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f43f5e')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.7)')}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="animate-slide-up">
          {activeTab === 'activities' && <ActivityManagement currentUser={currentUser} />}
          {activeTab === 'dashboard'  && <Dashboard currentUser={currentUser} />}
          {activeTab === 'kaizen'     && <KaizenHub currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
}

export default App;
