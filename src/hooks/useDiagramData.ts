import { useState, useCallback } from 'react';
import { DiagramData, DiagramEngine, FlowNode, FlowEdge } from '../types/diagram';

const DEFAULT_DIAGRAM_CODE = {
  mermaid: `flowchart LR
  U[User] --> A[App]
  A --> P[(PDF)]`,
  plantuml: `@startuml
User -> App: Request
App -> PDF: Generate
PDF --> App: Document
App --> User: Response
@enduml`,
  graphviz: `digraph G {
  User -> App;
  App -> PDF;
}`,
  d2: `User -> App: Request
App -> PDF: Generate`
};

export function useDiagramData() {
  const [engine, setEngine] = useState<DiagramEngine>('mermaid');
  const [code, setCode] = useState(DEFAULT_DIAGRAM_CODE.mermaid);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [mode, setMode] = useState<'preview' | 'editor'>('preview');

  const handleEngineChange = useCallback((newEngine: DiagramEngine) => {
    setEngine(newEngine);
    setCode(DEFAULT_DIAGRAM_CODE[newEngine]);
  }, []);

  const exportDiagram = useCallback(() => {
    const diagramData: DiagramData = {
      id: crypto.randomUUID(),
      engine,
      code,
      nodes,
      edges,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const exportData = {
      version: '1.0',
      diagram: diagramData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [engine, code, nodes, edges]);

  const importDiagram = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importData = JSON.parse(result);
        
        if (importData.diagram) {
          const { engine: importEngine, code: importCode, nodes: importNodes, edges: importEdges } = importData.diagram;
          setEngine(importEngine);
          setCode(importCode);
          if (importNodes) setNodes(importNodes);
          if (importEdges) setEdges(importEdges);
        }
      } catch (error) {
        console.error('Failed to import diagram:', error);
        alert('Invalid diagram file format');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    engine,
    code,
    nodes,
    edges,
    mode,
    setEngine: handleEngineChange,
    setCode,
    setNodes,
    setEdges,
    setMode,
    exportDiagram,
    importDiagram
  };
}