import React, { useEffect, useState, useRef } from 'react';
import { Loader2, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { formatDuration } from '../lib/utils';
import { Command } from '@tauri-apps/plugin-shell';

export function ActiveSessionModal() {
  const { activeSession, stopGame } = useAppContext();
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
        // Check if running in Tauri environment
        if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const exePath = activeSession.game.executablePath;
          if (exePath && exePath !== 'dummy://path') {
            const cmd = Command.create('run-game', [exePath]); // Need configuration in tauri.conf.json for this to work perfectly, but we'll try direct execution
            // Actually, in Tauri v2, we should use Command.create directly if configured, or just open
            const result = await Command.create('cmd', ['/C', 'start', '""', exePath]).spawn().catch(() => 
              Command.create('sh', ['-c', `open "${exePath}" || xdg-open "${exePath}"`]).spawn()
            );
            
            if (isMounted) {
              processRef.current = result;
              // If we could properly hook into process exit, we'd stop the game automatically here.
              // For now, we still rely on the user clicking "Stop" to record playtime, 
              // as detached processes (like game launchers) often exit immediately anyway.
            }
          } else {
            setErrorMsg('Invalid executable path provided.');
          }
        }
      } catch (err) {
        console.error('Failed to launch game:', err);
        if (isMounted) setErrorMsg('Failed to launch the game. Ensure path is correct.');
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-3 text-base font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-all hover:scale-105"
        >
          <Square fill="currentColor" size={18} />
          Stop & Save Session
        </button>
      </div>
    </div>
  );
}
