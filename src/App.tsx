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
              <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About This Application</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This is a prototype web interface for a centralized game launcher. Because it is running in a browser environment, true executable launching (e.g., .exe, steam://) is simulated via the Active Session modal, which tracks your "playtime" locally using browser storage.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    To build a true desktop application that can launch executables on the host machine, this React frontend is designed to be wrapped using the <strong>Tauri</strong> framework locally on your desktop.
                  </p>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h3 className="text-lg font-semibold mb-2">How to test locally</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Since the GitHub Actions workflow dynamically generates the Tauri configuration to ensure the latest compatible setup, you can test it locally by running:
                  </p>
                  <pre className="bg-secondary/50 p-4 rounded-lg text-sm font-mono overflow-x-auto text-secondary-foreground border border-border/50">
                    <code>
                      npx tauri init --app-name 'GameHub' --window-title 'Game Hub' --frontend-dist '../dist' --dev-url 'http://localhost:3000' --before-build-command 'npm run build' --before-dev-command 'npm run dev'<br/>
                      <br/>
                      npm run tauri dev
                    </code>
                  </pre>
                </div>
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
