import React, { createContext, useContext, useEffect, useState } from 'react';
import { Game, PlaySession, Theme, UserSettings } from '../types';

interface AppContextType {
  games: Game[];
  sessions: PlaySession[];
  theme: Theme;
  userSettings: UserSettings;
  activeSession: { game: Game; startTime: number } | null;
  addGame: (game: Omit<Game, 'id' | 'addedAt'>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  removeGame: (id: string) => void;
  reorderGames: (newGames: Game[]) => void;
  setTheme: (theme: Theme) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  startGame: (gameId: string) => void;
  stopGame: () => void;
  editingGame: Game | null;
  setEditingGame: (game: Game | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultGames: Game[] = [
  {
    id: '1',
    title: 'Cyber-Explorer 2077',
    platform: 'gog',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    executablePath: 'C:\\Games\\Cyber\\launcher.exe',
    addedAt: Date.now() - 10000000,
    category: 'RPG',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Void Survivor',
    platform: 'steam',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400',
    executablePath: 'steam://rungameid/12345',
    addedAt: Date.now() - 5000000,
    category: 'Action',
  },
  {
    id: '3',
    title: 'Block Builder Deluxe',
    platform: 'epic',
    coverUrl: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&q=80&w=400',
    executablePath: 'com.epicgames.launcher://apps/blockbuilder',
    addedAt: Date.now() - 1000000,
    category: 'Simulation',
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('launcher_games');
    return saved ? JSON.parse(saved) : defaultGames;
  });

  const [sessions, setSessions] = useState<PlaySession[]>(() => {
    const saved = localStorage.getItem('launcher_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('launcher_theme') as Theme;
    return saved || 'dark';
  });

  const [userSettings, setUserSettingsState] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('launcher_settings');
    return saved ? JSON.parse(saved) : {
      closeOnLaunch: false,
      startWithWindows: false,
      showPlaytimeOnCard: true,
    };
  });

  const [activeSession, setActiveSession] = useState<{ game: Game; startTime: number } | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  useEffect(() => {
    localStorage.setItem('launcher_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('launcher_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('launcher_theme', theme);
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('launcher_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const addGame = (gameData: Omit<Game, 'id' | 'addedAt'>) => {
    const newGame: Game = {
      ...gameData,
      id: Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };
    setGames((prev) => [...prev, newGame]);
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const removeGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const reorderGames = (newGames: Game[]) => {
    setGames(newGames);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettingsState((prev) => ({ ...prev, ...settings }));
  };

  const startGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      setActiveSession({ game, startTime: Date.now() });
    }
  };

  const stopGame = () => {
    if (activeSession) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - activeSession.startTime) / 1000);
      
      if (duration > 0) {
        const newSession: PlaySession = {
          id: Math.random().toString(36).substr(2, 9),
          gameId: activeSession.game.id,
          startTime: activeSession.startTime,
          endTime,
          duration,
        };
        setSessions((prev) => [...prev, newSession]);
      }
      setActiveSession(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        games,
        sessions,
        theme,
        userSettings,
        activeSession,
        addGame,
        updateGame,
        removeGame,
        reorderGames,
        setTheme,
        updateUserSettings,
        startGame,
        stopGame,
        editingGame,
        setEditingGame,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
