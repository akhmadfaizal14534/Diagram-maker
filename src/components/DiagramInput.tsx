import React from 'react';
import { DiagramEngine } from '../types/diagram';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { FileUp, Download } from 'lucide-react';

interface DiagramInputProps {
  engine: DiagramEngine;
  code: string;
  mode: 'preview' | 'editor';
  onEngineChange: (engine: DiagramEngine) => void;
  onCodeChange: (code: string) => void;
  onModeToggle: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const ENGINE_OPTIONS = [
  { value: 'mermaid', label: 'Mermaid' },
  { value: 'plantuml', label: 'PlantUML' },
  { value: 'graphviz', label: 'Graphviz DOT' },
  { value: 'd2', label: 'D2 (Preview)' },
];

export function DiagramInput({
  engine,
  code,
  mode,
  onEngineChange,
  onCodeChange,
  onModeToggle,
  onExport,
  onImport,
}: DiagramInputProps) {
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 bg-slate-50 dark:bg-slate-900">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={ENGINE_OPTIONS}
          value={engine}
          onChange={(e) => onEngineChange(e.target.value as DiagramEngine)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            onClick={onModeToggle}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            {mode === 'preview' ? 'Switch to Editor' : 'Switch to Preview'}
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <label className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              as="span"
            >
              <FileUp className="w-4 h-4" />
              Import
            </Button>
          </label>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Diagram Code ({engine.toUpperCase()})
        </label>
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={`Enter your ${engine} diagram code here...`}
          className="flex-1 font-mono text-sm resize-none"
          spellCheck={false}
        />
      </div>

      {/* Engine Info */}
      <div className="text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <p>
          <strong>Current Engine:</strong> {ENGINE_OPTIONS.find(opt => opt.value === engine)?.label}
        </p>
        <p className="mt-1">
          {engine === 'mermaid' && 'Live rendering with Mermaid.js'}
          {engine === 'plantuml' && 'Rendered via Kroki API (requires internet)'}
          {engine === 'graphviz' && 'Rendered with Viz.js (GraphViz WASM)'}
          {engine === 'd2' && 'D2 preview mode (placeholder implementation)'}
        </p>
      </div>
    </div>
  );
}