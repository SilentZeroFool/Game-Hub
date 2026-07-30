import React, { useState, useEffect } from 'react';
import { X, Gamepad2, FolderOpen } from 'lucide-react';
import { Platform, Game } from '../types';
import { useAppContext } from '../context/AppContext';
import { open } from '@tauri-apps/plugin-dialog';

export function GameModal({ onClose, gameToEdit }: { onClose: () => void; gameToEdit?: Game }) {
  const { addGame, updateGame } = useAppContext();
  const [title, setTitle] = useState(gameToEdit?.title || '');
  const [platform, setPlatform] = useState<Platform>(gameToEdit?.platform || 'other');
  const [coverUrl, setCoverUrl] = useState(gameToEdit?.coverUrl || '');
  const [executablePath, setExecutablePath] = useState(gameToEdit?.executablePath || '');
  const [category, setCategory] = useState(gameToEdit?.category || '');

  useEffect(() => {
    if (gameToEdit) {
      setTitle(gameToEdit.title);
      setPlatform(gameToEdit.platform);
      setCoverUrl(gameToEdit.coverUrl);
      setExecutablePath(gameToEdit.executablePath);
      setCategory(gameToEdit.category || '');
    }
  }, [gameToEdit]);

  const handleBrowse = async () => {
    try {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        const selected = await open({
          multiple: false,
          filters: [{
            name: 'Executables',
            extensions: ['exe', 'app', 'sh', 'bat', 'cmd']
          }]
        });
        
        if (selected && typeof selected === 'string') {
          setExecutablePath(selected);
        }
      } else {
        alert("File browsing is only available in the Tauri desktop application.");
      }
    } catch (err) {
      console.error("Failed to open dialog:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // In a full Tauri desktop build, we would use a Rust command to extract the .exe icon
    // e.g. invoke('extract_icon', { path: executablePath }).then(setIcon)
    const finalCoverUrl = coverUrl.trim();

    if (gameToEdit) {
      updateGame(gameToEdit.id, {
        title: title.trim(),
        platform,
        coverUrl: finalCoverUrl,
        executablePath: executablePath.trim() || 'dummy://path',
        category: category.trim() || 'Uncategorized',
      });
    } else {
      addGame({
        title: title.trim(),
        platform,
        coverUrl: finalCoverUrl,
        executablePath: executablePath.trim() || 'dummy://path',
        category: category.trim() || 'Uncategorized',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Gamepad2 className="text-primary" />
          Add to Library
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Witcher 3"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="steam">Steam</option>
                <option value="epic">Epic Games</option>
                <option value="gog">GOG</option>
                <option value="other">Other / Standalone</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <input 
                type="text" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. RPG, Action"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Cover Image URL (Optional)</label>
            <input 
              type="url" 
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Executable Path (Optional)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={executablePath}
                onChange={(e) => setExecutablePath(e.target.value)}
                placeholder="C:\Games\..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleBrowse}
                className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
                title="Browse for executable"
              >
                <FolderOpen size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">In this web prototype, launching is simulated. In the Tauri desktop build, it will launch the game.</p>
          </div>

          <button 
            type="submit"
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 mt-4"
          >
            {gameToEdit ? 'Save Changes' : 'Add Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
