import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDuration } from '../lib/utils';

export function ActiveSessionModal() {
  const { activeSession, stopGame, userSettings } = useAppContext();
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const processRef = useRef<any>(null);

  useEffect(() => {
    if (!activeSession) {
      setElapsed(0);
      setErrorMsg('');
      processRef.current = null;
      return;
    }
    
    let isMounted = true;

    const launchGame = async () => {
      try {
        // Detect Tauri environment without static imports
        const core = await import('@tauri-apps/api/core').catch(() => null);
        const isTauriEnv = core?.isTauri ? core.isTauri : !!(window as any).__TAURI__;

        if (isTauriEnv) {
          const exePath = activeSession.game.executablePath;
          if (exePath && exePath !== 'dummy://path') {
            const [{ invoke }, windowApi] = await Promise.all([
              import('@tauri-apps/api/tauri'),
              import('@tauri-apps/api/window').catch(() => null),
            ]);

            await invoke('run_game', { path: exePath });

            if (userSettings.closeOnLaunch && windowApi?.getCurrentWindow) {
              const { getCurrentWindow } = windowApi;
              await getCurrentWindow().minimize();
            }
          } else {
            setErrorMsg('Invalid executable path provided.');
          }
        } else {
          setErrorMsg('Launching is only supported in the Tauri desktop application.');
        }
      } catch (err: any) {
        console.error('Failed to launch game:', err);
        if (isMounted) setErrorMsg(`Failed to launch: ${err?.message ?? String(err)}`);
      }
    };

    launchGame();

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeSession.startTime) / 1000));
    }, 1000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeSession]);

  if (!activeSession) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-card p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 text-center flex flex-col items-center">
        
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <div className="h-24 w-24 rounded-full border-4 border-background overflow-hidden relative z-10 mx-auto shadow-xl">
              {activeSession.game.coverUrl ? (
                <img src={activeSession.game.coverUrl} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-secondary flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-1">{activeSession.game.title}</h2>
          <p className="text-muted-foreground mb-6 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> Running...
          </p>

          {errorMsg && (
            <p className="text-destructive text-sm font-medium mb-4">{errorMsg}</p>
          )}

          <div className="text-4xl font-mono tracking-wider mb-8 text-primary font-bold">
            {formatDuration(elapsed)}
          </div>

          <button 
            onClick={stopGame}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-3 text-base font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-all"
          >
            <Square fill="currentColor" size={18} />
            Stop & Save Session
          </button>
      </div>
    </div>
  );
}
