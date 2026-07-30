import React, { useState } from 'react';
import { LayoutGrid, BarChart2, Settings, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  currentTab: 'library' | 'stats' | 'settings';
  setCurrentTab: (tab: 'library' | 'stats' | 'settings') => void;
}

export function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const { theme, setTheme } = useAppContext();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/50 bg-card">
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <Monitor className="mr-3 h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">Hub</h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {[
          { id: 'library', icon: LayoutGrid, label: 'Library' },
          { id: 'stats', icon: BarChart2, label: 'Statistics' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id as any)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              currentTab === item.id 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-1">
          <button
            onClick={() => setTheme('light')}
            className={cn("flex-1 rounded-md p-1.5 flex justify-center", theme === 'light' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            title="Light Theme"
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn("flex-1 rounded-md p-1.5 flex justify-center", theme === 'dark' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            title="Dark Theme"
          >
            <Moon size={16} />
          </button>
          <button
            onClick={() => setTheme('neon')}
            className={cn("flex-1 rounded-md p-1.5 flex justify-center text-xs font-bold", theme === 'neon' ? "bg-background shadow-sm text-[#ff00ff]" : "text-muted-foreground")}
            title="Neon Theme"
          >
            N
          </button>
        </div>
      </div>
    </div>
  );
}
