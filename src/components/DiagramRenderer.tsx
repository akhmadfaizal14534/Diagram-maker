import React from 'react';
import { DiagramEngine } from '../types/diagram';
import { MermaidRenderer } from './renderers/MermaidRenderer';
import { PlantUMLRenderer } from './renderers/PlantUMLRenderer';
import { GraphvizRenderer } from './renderers/GraphvizRenderer';
import { D2Renderer } from './renderers/D2Renderer';

interface DiagramRendererProps {
  engine: DiagramEngine;
  code: string;
}

export function DiagramRenderer({ engine, code }: DiagramRendererProps) {
  const renderDiagram = () => {
    switch (engine) {
      case 'mermaid':
        return <MermaidRenderer code={code} />;
      case 'plantuml':
        return <PlantUMLRenderer code={code} />;
      case 'graphviz':
        return <GraphvizRenderer code={code} />;
      case 'd2':
        return <D2Renderer code={code} />;
      default:
        return (
          <div className="flex items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400">
            Unsupported diagram engine: {engine}
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
      {renderDiagram()}
    </div>
  );
}