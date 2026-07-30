import React from 'react';
import { Play, MoreVertical, X, Star } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Game } from '../types';
import { cn, formatDuration } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface GameCardProps {
  game: Game;
  totalPlaytime: number;
  disabled?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, totalPlaytime, disabled }) => {
  const { startGame, removeGame, updateGame, setEditingGame, userSettings } = useAppContext();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateGame(game.id, { isFavorite: !game.isFavorite });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md",
        isDragging && "opacity-50 scale-105 shadow-xl"
      )}
    >
      <div 
        className="relative aspect-[3/4] w-full overflow-hidden cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {game.coverUrl ? (
          <img 
            src={game.coverUrl} 
            alt={game.title} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-4xl font-bold text-muted-foreground opacity-20">?</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-all group-hover:opacity-100">
          <button
            onClick={toggleFavorite}
            className="rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-all hover:bg-yellow-500/20 hover:text-yellow-500"
            title={game.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star size={14} className={cn(game.isFavorite && "fill-yellow-500 text-yellow-500")} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setEditingGame(game); }}
            className="rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground"
            title="Edit Game"
          >
            <MoreVertical size={14} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); removeGame(game.id); }}
            className="rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-all hover:bg-destructive hover:text-destructive-foreground"
            title="Remove Game"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-semibold leading-tight line-clamp-1" title={game.title}>
          {game.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize px-2 py-0.5 rounded-full bg-secondary/50 font-medium">
            {game.platform}
          </span>
          {userSettings.showPlaytimeOnCard && (
            <span>{formatDuration(totalPlaytime)}</span>
          )}
        </div>

        <button
          onClick={() => startGame(game.id)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Play size={16} className="fill-current" />
          Play
        </button>
      </div>
    </div>
  );
}
