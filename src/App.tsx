import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { GameGrid } from './components/GameGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { AddGameModal } from './components/AddGameModal';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { Plus } from 'lucide-react';

function Dashboard() {
  const [currentTab, setCurrentTab] = useState<'library' | 'stats' | 'settings'>('library');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {currentTab === 'library' && 'My Library'}
                {currentTab === 'stats' && 'Playtime Statistics'}
                {currentTab === 'settings' && 'Settings'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {currentTab === 'library' && 'Organize and launch your favorite games.'}
                {currentTab === 'stats' && 'Track your gaming habits over time.'}
                {currentTab === 'settings' && 'Manage application preferences.'}
              </p>
            </div>
            
            {currentTab === 'library' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Plus size={18} />
                Add Game
              </button>
            )}
          </header>

          <div className="animate-in fade-in duration-300">
            {currentTab === 'library' && <GameGrid />}
            {currentTab === 'stats' && <StatsDashboard />}
            {currentTab === 'settings' && (
              <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">About This Application</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This is a prototype web interface for a centralized game launcher. Because it is running in a browser environment, true executable launching (e.g., .exe, steam://) is simulated via the Active Session modal, which tracks your "playtime" locally using browser storage.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  To build a true desktop application that can launch executables on the host machine, this React frontend is designed to be wrapped using the <strong>Tauri</strong> framework locally on your desktop.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isAddModalOpen && <AddGameModal onClose={() => setIsAddModalOpen(false)} />}
      <ActiveSessionModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
