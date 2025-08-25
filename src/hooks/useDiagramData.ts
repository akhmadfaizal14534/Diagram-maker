import { useState, useCallback } from 'react';
import { DiagramData, DiagramEngine, FlowNode, FlowEdge } from '../types/diagram';
import html2canvas from 'html2canvas';

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

  const exportImage = useCallback(async (format: 'png' | 'jpg' | 'jpeg') => {
    try {
      // Find the diagram preview element
      const previewElement = document.querySelector('[data-diagram-preview]') as HTMLElement;
      if (!previewElement) {
        // Fallback to finding common diagram containers
        const fallbackElement = document.querySelector('.mermaid, svg, [class*="diagram"]') as HTMLElement;
        if (!fallbackElement) {
          alert('No diagram found to export');
          return;
        }
        await captureAndDownload(fallbackElement, format);
        return;
      }
      
      await captureAndDownload(previewElement, format);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    }
  }, []);

  const captureAndDownload = async (element: HTMLElement, format: 'png' | 'jpg' | 'jpeg') => {
    const canvas = await html2canvas(element, {
      backgroundColor: format === 'png' ? null : '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
    });
    
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'png' ? undefined : 0.9;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagram-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, mimeType, quality);
  };
  return {
    engine,
    code,
    nodes,
    edges,
    setEngine: handleEngineChange,
    setCode,
    setNodes,
    setEdges,
    exportDiagram,
    importDiagram,
    exportImage,
  };
}