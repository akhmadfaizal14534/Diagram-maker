export type DiagramEngine = 'mermaid' | 'plantuml' | 'graphviz' | 'd2';

export interface DiagramData {
  id: string;
  engine: DiagramEngine;
  code: string;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string };
  style?: React.CSSProperties;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface DiagramExport {
  version: string;
  diagram: DiagramData;
}