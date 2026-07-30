import React from 'react';
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

export function GameGrid() {
  const { games, reorderGames, sessions } = useAppContext();

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={games} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {games.map((game) => (
            <GameCard 
              key={game.id} 
              game={game} 
              totalPlaytime={getGamePlaytime(game.id)} 
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
