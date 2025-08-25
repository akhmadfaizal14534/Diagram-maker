import React from 'react';
import { DiagramEngine } from '../types/diagram';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { FileUp, Download, Image } from 'lucide-react';

interface DiagramInputProps {
  engine: DiagramEngine;
  code: string;
  onEngineChange: (engine: DiagramEngine) => void;
  onCodeChange: (code: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onExportImage: (format: 'png' | 'jpg' | 'jpeg') => void;
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
  onEngineChange,
  onCodeChange,
  onExport,
  onImport,
  onExportImage,
}: DiagramInputProps) {
  const [showImageExport, setShowImageExport] = React.useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  };

  const handleImageExport = (format: 'png' | 'jpg' | 'jpeg') => {
    onExportImage(format);
    setShowImageExport(false);
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
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <div className="relative">
            <Button
              onClick={() => setShowImageExport(!showImageExport)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Image
            </Button>
            {showImageExport && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => handleImageExport('png')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-lg"
                >
                  Export PNG
                </button>
                <button
                  onClick={() => handleImageExport('jpg')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export JPG
                </button>
                <button
                  onClick={() => handleImageExport('jpeg')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 last:rounded-b-lg"
                >
                  Export JPEG
                </button>
              </div>
            )}
          </div>
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