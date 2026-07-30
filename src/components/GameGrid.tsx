import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { GameCard } from './GameCard';
import { useAppContext } from '../context/AppContext';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

type SortOption = 'custom' | 'name-asc' | 'name-desc' | 'recent' | 'playtime';

export function GameGrid() {
  const { games, reorderGames, sessions } = useAppContext();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('custom');

  const categories = useMemo(() => {
    const cats = new Set(games.map(g => g.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [games]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = games.findIndex((game) => game.id === active.id);
      const newIndex = games.findIndex((game) => game.id === over.id);
      reorderGames(arrayMove(games, oldIndex, newIndex));
    }
  };

  const getGamePlaytime = (gameId: string) => {
    return sessions
      .filter((s) => s.gameId === gameId)
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    if (filterCategory !== 'all') {
      result = result.filter(g => (g.category || 'Uncategorized') === filterCategory);
    }
    
    if (filterFavorites) {
      result = result.filter(g => g.isFavorite);
    }

    if (sortOption === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === 'recent') {
      result.sort((a, b) => b.addedAt - a.addedAt);
    } else if (sortOption === 'playtime') {
      result.sort((a, b) => getGamePlaytime(b.id) - getGamePlaytime(a.id));
    }

    return result;
  }, [games, filterCategory, filterFavorites, sortOption, sessions]);

  const isCustomSort = sortOption === 'custom' && filterCategory === 'all' && !filterFavorites;

  if (games.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card/30">
        <h3 className="text-lg font-medium text-foreground">No games added</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Click "Add Game" to add your first title to the library.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mr-auto">
          <Filter size={18} className="text-muted-foreground" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm ml-4 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFavorites}
              onChange={(e) => setFilterFavorites(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4"
            />
            Favorites Only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <SortAsc size={18} className="text-muted-foreground" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="custom">Custom (Drag & Drop)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="recent">Recently Added</option>
            <option value="playtime">Most Played</option>
          </select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredAndSortedGames} 
          strategy={rectSortingStrategy}
        >
          {filteredAndSortedGames.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredAndSortedGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  totalPlaytime={getGamePlaytime(game.id)} 
                  disabled={!isCustomSort}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card/30">
              <h3 className="text-lg font-medium text-foreground">No games match filters</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your category or favorites filter.
              </p>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}
