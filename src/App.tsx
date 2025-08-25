import React from 'react';
import { Header } from './components/Layout/Header';
import { DiagramInput } from './components/DiagramInput';
import { UnifiedDiagramView } from './components/UnifiedDiagramView';
import { useTheme } from './hooks/useTheme';
import { useDiagramData } from './hooks/useDiagramData';

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    engine,
    code,
    nodes,
    edges,
    setEngine,
    setCode,
    setNodes,
    setEdges,
    exportDiagram,
    importDiagram,
    exportImage,
  } = useDiagramData();


  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-900 ${theme}`}>
      <Header theme={theme} onThemeToggle={toggleTheme} />
      
      <main className="h-[calc(100vh-80px)] flex flex-col lg:flex-row">
        {/* Input Panel */}
        <div className="w-full lg:w-1/2 lg:max-w-md xl:max-w-lg h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
          <DiagramInput
            engine={engine}
            code={code}
            onEngineChange={setEngine}
            onCodeChange={setCode}
            onExport={exportDiagram}
            onImport={importDiagram}
            onExportImage={exportImage}
          />
        </div>

        {/* Output Panel */}
        <div className="flex-1 h-1/2 lg:h-full">
          <UnifiedDiagramView
            engine={engine}
            code={code}
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onCodeChange={setCode}
          />
        </div>
      </main>

      {/* Status Bar */}
      <div className="bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-600 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span>Engine: {engine.toUpperCase()}</span>
            <span>Nodes: {nodes.length} | Edges: {edges.length}</span>
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