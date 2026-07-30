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
    </div>
  );
}
