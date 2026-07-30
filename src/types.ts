export type Platform = 'steam' | 'epic' | 'gog' | 'other';
export type Theme = 'system' | 'light' | 'dark' | 'neon';

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  coverUrl: string;
  executablePath: string;
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

export interface AppState {
  games: Game[];
  sessions: PlaySession[];
  theme: Theme;
}
