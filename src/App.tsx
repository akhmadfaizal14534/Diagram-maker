import React from 'react';
import { Header } from './components/Layout/Header';
import { DiagramInput } from './components/DiagramInput';
import { DiagramRenderer } from './components/DiagramRenderer';
import { DiagramEditor } from './components/DiagramEditor';
import { useTheme } from './hooks/useTheme';
import { useDiagramData } from './hooks/useDiagramData';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    engine,
    code,
    nodes,
    edges,
    mode,
    setEngine,
    setCode,
    setNodes,
    setEdges,
    setMode,
    exportDiagram,
    importDiagram,
  } = useDiagramData();

  const handleModeToggle = () => {
    setMode(mode === 'preview' ? 'editor' : 'preview');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header theme={theme} onThemeToggle={toggleTheme} />
      
      <main className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
        {/* Input Panel */}
        <div className="w-full lg:w-1/2 lg:max-w-md xl:max-w-lg h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
          <DiagramInput
            engine={engine}
            code={code}
            mode={mode}
            onEngineChange={setEngine}
            onCodeChange={setCode}
            onModeToggle={handleModeToggle}
            onExport={exportDiagram}
            onImport={importDiagram}
          />
        </div>

        {/* Output Panel */}
        <div className="flex-1 h-1/2 lg:h-full">
          {mode === 'preview' ? (
            <DiagramRenderer engine={engine} code={code} />
          ) : (
            <DiagramEditor
              nodes={nodes}
              edges={edges}
              engine={engine}
              code={code}
              onNodesChange={setNodes}
              onEdgesChange={setEdges}
            />
          )}
        </div>
      </main>

      {/* Status Bar */}
      <div className="bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-600 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Engine: {engine.toUpperCase()}</span>
            <span>Mode: {mode === 'preview' ? 'Preview' : 'Editor'}</span>
            {mode === 'editor' && (
              <span>Nodes: {nodes.length} | Edges: {edges.length}</span>
            )}
          </div>
          <div>
            Ready
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;