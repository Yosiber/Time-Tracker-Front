import { useState } from 'react';
import UserManagement from './components/UserManagement';
import ActivityManagement from './components/ActivityManagement';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<'users' | 'activities' | 'dashboard'>('users');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
              TimeTracker
            </h1>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'activities' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Actividades
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'activities' && <ActivityManagement />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>
      </main>
    </div>
  );
}

export default App;
