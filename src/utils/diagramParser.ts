import { FlowNode, FlowEdge } from '../types/diagram';

export interface ParsedDiagram {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function parseMermaidToNodes(code: string): ParsedDiagram {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  
  // Simple parser for flowchart syntax
  const nodeMap = new Map<string, string>();
  let nodeCounter = 0;
  
  for (const line of lines) {
    if (line.startsWith('flowchart') || line.startsWith('graph')) continue;
    
    // Parse connections like: A --> B or A[Label] --> B[Label]
    const connectionMatch = line.match(/(\w+)(?:\[([^\]]+)\])?\s*-->\s*(\w+)(?:\[([^\]]+)\])?/);
    if (connectionMatch) {
      const [, sourceId, sourceLabel, targetId, targetLabel] = connectionMatch;
      
      // Add source node if not exists
      if (!nodeMap.has(sourceId)) {
        nodeMap.set(sourceId, sourceLabel || sourceId);
        nodes.push({
          id: sourceId,
          type: 'default',
          position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
          data: { label: sourceLabel || sourceId },
          style: { width: 120, height: 60 }
        });
        nodeCounter++;
      }
      
      // Add target node if not exists
      if (!nodeMap.has(targetId)) {
        nodeMap.set(targetId, targetLabel || targetId);
        nodes.push({
          id: targetId,
          type: 'default',
          position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
          data: { label: targetLabel || targetId },
          style: { width: 120, height: 60 }
        });
        nodeCounter++;
      }
      
      // Add edge
      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep'
      });
    }
    
    // Parse standalone nodes like: A[Label]
    const nodeMatch = line.match(/(\w+)\[([^\]]+)\]/);
    if (nodeMatch && !nodeMap.has(nodeMatch[1])) {
      const [, nodeId, nodeLabel] = nodeMatch;
      nodeMap.set(nodeId, nodeLabel);
      nodes.push({
        id: nodeId,
        type: 'default',
        position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
        data: { label: nodeLabel },
        style: { width: 120, height: 60 }
      });
      nodeCounter++;
    }
  }
  
  return { nodes, edges };
}

export function parseGraphvizToNodes(code: string): ParsedDiagram {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  const nodeMap = new Map<string, string>();
  let nodeCounter = 0;
  
  for (const line of lines) {
    if (line.startsWith('digraph') || line.startsWith('{') || line.startsWith('}')) continue;
    
    // Parse connections like: A -> B;
    const connectionMatch = line.match(/(\w+)\s*->\s*(\w+);?/);
    if (connectionMatch) {
      const [, sourceId, targetId] = connectionMatch;
      
      // Add nodes if not exists
      [sourceId, targetId].forEach(nodeId => {
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, nodeId);
          nodes.push({
            id: nodeId,
            type: 'default',
            position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
            data: { label: nodeId },
            style: { width: 120, height: 60 }
          });
          nodeCounter++;
        }
      });
      
      // Add edge
      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep'
      });
    }
    
    // Parse node labels like: A [label="Label"];
    const labelMatch = line.match(/(\w+)\s*\[label="([^"]+)"\];?/);
    if (labelMatch) {
      const [, nodeId, nodeLabel] = labelMatch;
      const existingNode = nodes.find(n => n.id === nodeId);
      if (existingNode) {
        existingNode.data.label = nodeLabel;
      }
    }
  }
  
  return { nodes, edges };
}

export function parseD2ToNodes(code: string): ParsedDiagram {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  const nodeMap = new Map<string, string>();
  let nodeCounter = 0;
  
  for (const line of lines) {
    // Parse connections like: A -> B: Label
    const connectionMatch = line.match(/(\w+)\s*->\s*(\w+)(?::\s*(.+))?/);
    if (connectionMatch) {
      const [, sourceId, targetId, edgeLabel] = connectionMatch;
      
      // Add nodes if not exists
      [sourceId, targetId].forEach(nodeId => {
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, nodeId);
          nodes.push({
            id: nodeId,
            type: 'default',
            position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
            data: { label: nodeId },
            style: { width: 120, height: 60 }
          });
          nodeCounter++;
        }
      });
      
      // Add edge
      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        label: edgeLabel
      });
    }
  }
  
  return { nodes, edges };
}

export function parsePlantUMLToNodes(code: string): ParsedDiagram {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  const nodeMap = new Map<string, string>();
  let nodeCounter = 0;
  
  for (const line of lines) {
    if (line.startsWith('@start') || line.startsWith('@end')) continue;
    
    // Parse connections like: User -> App: Request
    const connectionMatch = line.match(/(\w+)\s*->\s*(\w+)(?::\s*(.+))?/);
    if (connectionMatch) {
      const [, sourceId, targetId, edgeLabel] = connectionMatch;
      
      // Add nodes if not exists
      [sourceId, targetId].forEach(nodeId => {
        if (!nodeMap.has(nodeId)) {
          nodeMap.set(nodeId, nodeId);
          nodes.push({
            id: nodeId,
            type: 'default',
            position: { x: (nodeCounter % 3) * 250 + 100, y: Math.floor(nodeCounter / 3) * 150 + 100 },
            data: { label: nodeId },
            style: { width: 120, height: 60 }
          });
          nodeCounter++;
        }
      });
      
      // Add edge
      edges.push({
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        label: edgeLabel
      });
    }
  }
  
  return { nodes, edges };
}