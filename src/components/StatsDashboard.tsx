import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { useAppContext } from '../context/AppContext';

export function StatsDashboard() {
  const { sessions, games } = useAppContext();

  const last7DaysData = useMemo(() => {
    const data = [];
    const today = startOfDay(new Date());

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'MMM dd');
      
      const dayPlaytime = sessions
        .filter((s) => {
          const sessionDate = startOfDay(new Date(s.startTime));
          return sessionDate.getTime() === date.getTime();
        })
        .reduce((acc, curr) => acc + curr.duration, 0);

      data.push({
        date: dateStr,
        hours: Number((dayPlaytime / 3600).toFixed(2)),
      });
    }
    return data;
  }, [sessions]);

  const totalPlaytime = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  
  let mostPlayedGameId: string | null = null;
  if (sessions.length > 0) {
    const gameTimes: Record<string, number> = {};
    sessions.forEach((s) => {
      gameTimes[s.gameId] = (gameTimes[s.gameId] || 0) + s.duration;
    });
    
    let maxTime = -1;
    for (const [id, time] of Object.entries(gameTimes)) {
      if (time > maxTime) {
        maxTime = time;
        mostPlayedGameId = id;
      }
    }
  }

  const mostPlayedGame = games.find((g) => g.id === mostPlayedGameId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Playtime</p>
          <p className="mt-2 text-3xl font-bold">
            {(totalPlaytime / 3600).toFixed(1)} <span className="text-xl text-muted-foreground font-normal">hrs</span>
          </p>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Library Size</p>
          <p className="mt-2 text-3xl font-bold">{games.length} <span className="text-xl text-muted-foreground font-normal">titles</span></p>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Most Played</p>
          <p className="mt-2 text-xl font-bold truncate" title={mostPlayedGame?.title || 'None'}>
            {mostPlayedGame?.title || 'None'}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold">Playtime (Last 7 Days)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Bar dataKey="hours" name="Hours" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm mb-8">
        <h3 className="mb-4 text-lg font-semibold">Game Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/50 text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Platform</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Total Playtime</th>
                <th className="pb-3 font-medium text-right">Last Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {games.map((game) => {
                const gameSessions = sessions.filter(s => s.gameId === game.id);
                const gamePlaytime = gameSessions.reduce((acc, curr) => acc + curr.duration, 0);
                const lastPlayed = gameSessions.length > 0 
                  ? new Date(Math.max(...gameSessions.map(s => s.startTime)))
                  : null;

                return (
                  <tr key={game.id} className="transition-colors hover:bg-muted/50">
                    <td className="py-3 font-medium flex items-center gap-3">
                      {game.coverUrl ? (
                        <img src={game.coverUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-xs opacity-50">?</div>
                      )}
                      {game.title}
                    </td>
                    <td className="py-3 capitalize text-muted-foreground">{game.platform}</td>
                    <td className="py-3 text-muted-foreground">{game.category || 'Uncategorized'}</td>
                    <td className="py-3 text-right">{(gamePlaytime / 3600).toFixed(1)} hrs</td>
                    <td className="py-3 text-right text-muted-foreground">
                      {lastPlayed ? format(lastPlayed, 'MMM dd, yyyy') : 'Never'}
                    </td>
                  </tr>
                );
              })}
              {games.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No games in library.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
