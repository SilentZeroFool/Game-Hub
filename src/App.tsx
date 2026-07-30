import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { GameGrid } from './components/GameGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { GameModal } from './components/GameModal';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { Plus } from 'lucide-react';
import { useAppContext } from './context/AppContext';

function Dashboard() {
  const [currentTab, setCurrentTab] = useState<'library' | 'stats' | 'settings'>('library');
  const { editingGame, setEditingGame, userSettings, updateUserSettings } = useAppContext();
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
              <div className="space-y-6">
                <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
                  <h3 className="text-lg font-semibold mb-6">Preferences</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors">
                      <div>
                        <span className="block font-medium">Show Playtime on Cards</span>
                        <span className="block text-sm text-muted-foreground mt-1">Display total hours played directly on library cards</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={userSettings.showPlaytimeOnCard}
                        onChange={(e) => updateUserSettings({ showPlaytimeOnCard: e.target.checked })}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors">
                      <div>
                        <span className="block font-medium">Close on Launch (Tauri only)</span>
                        <span className="block text-sm text-muted-foreground mt-1">Minimize or close the launcher when starting a game</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={userSettings.closeOnLaunch}
                        onChange={(e) => updateUserSettings({ closeOnLaunch: e.target.checked })}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors">
                      <div>
                        <span className="block font-medium">Start with Windows</span>
                        <span className="block text-sm text-muted-foreground mt-1">Automatically launch Game Hub on system startup</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={userSettings.startWithWindows}
                        onChange={(e) => updateUserSettings({ startWithWindows: e.target.checked })}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

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
                        npx tauri add dialog<br/>
                        npx tauri add shell<br/>
                        <br/>
                        npm run tauri dev
                      </code>
                    </pre>
                    <p className="text-sm text-muted-foreground mt-2">
                      Note: You must also edit <code>src-tauri/capabilities/default.json</code> to include <code>{`{ "identifier": "shell:allow-open", "allow": [{ "path": "**" }] }`}</code> in the permissions array to allow launching executables.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {(isAddModalOpen || editingGame) && (
        <GameModal 
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingGame(null);
          }} 
          gameToEdit={editingGame || undefined}
        />
      )}
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
