import React from 'react';
import { Button } from '../ui/Button';
import { Moon, Sun, Zap } from 'lucide-react';
import { Theme } from '../../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Diagram Builder
            </h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
            Multi-engine diagram editor with React Flow
          </div>
        </div>

        <Button
          onClick={onThemeToggle}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </span>
        </Button>
      </div>
    </header>
  );
}