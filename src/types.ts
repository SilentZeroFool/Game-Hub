export type Platform = 'steam' | 'epic' | 'gog' | 'other';
export type Theme = 'system' | 'light' | 'dark' | 'neon';
export type LaunchMethod = 'cmd_start' | 'direct' | 'explorer' | 'tauri_shell';

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  coverUrl: string;
  executablePath: string;
  launchMethod?: LaunchMethod;
  addedAt: number;
  isFavorite?: boolean;
  category?: string;
}

export interface PlaySession {
  id: string;
  gameId: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
}

export interface UserSettings {
  closeOnLaunch: boolean;
  startWithWindows: boolean;
  showPlaytimeOnCard: boolean;
}

export interface AppState {
  games: Game[];
  sessions: PlaySession[];
  theme: Theme;
}
