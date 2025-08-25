import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode, FlowEdge, DiagramEngine } from '../types/diagram';
import { EditableNode } from './EditableNode';
import { Button } from './ui/Button';
import { Plus, Trash2, Download, Eye, Edit3, Maximize2 } from 'lucide-react';
import { parseMermaidToNodes, parseGraphvizToNodes, parseD2ToNodes, parsePlantUMLToNodes } from '../utils/diagramParser';
import { MermaidRenderer } from './renderers/MermaidRenderer';
import { PlantUMLRenderer } from './renderers/PlantUMLRenderer';
import { GraphvizRenderer } from './renderers/GraphvizRenderer';
import { D2Renderer } from './renderers/D2Renderer';

interface UnifiedDiagramViewProps {
  engine: DiagramEngine;
  code: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: (nodes: FlowNode[]) => void;
  onEdgesChange: (edges: FlowEdge[]) => void;
  onCodeChange: (code: string) => void;
}

export function UnifiedDiagramView({ 
  engine, 
  code, 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange,
  onCodeChange 
}: UnifiedDiagramViewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'editor' | 'split'>('split');
  const [internalNodes, setInternalNodes, onNodesChangeInternal] = useNodesState(nodes as Node[]);
  const [internalEdges, setInternalEdges, onEdgesChangeInternal] = useEdgesState(edges as Edge[]);
  const previewRef = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({
    default: (props: any) => (
      <EditableNode 
        {...props} 
        data={{
          ...props.data,
          onLabelChange: handleNodeLabelChange
        }}
      />
    ),
  }), []);

  // Sync internal state with props
  React.useEffect(() => {
    setInternalNodes(nodes as Node[]);
  }, [nodes, setInternalNodes]);

  React.useEffect(() => {
    setInternalEdges(edges as Edge[]);
  }, [edges, setInternalEdges]);

  // Handle changes and sync back to parent
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeInternal(changes);
    setInternalNodes((nodes) => {
      onNodesChange(nodes as FlowNode[]);
      return nodes;
    });
  }, [onNodesChangeInternal, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    setInternalEdges((edges) => {
      onEdgesChange(edges as FlowEdge[]);
      return edges;
    });
  }, [onEdgesChangeInternal, onEdgesChange]);

  const handleConnect = useCallback((connection: Connection) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      type: 'smoothstep',
    };
    
    setInternalEdges((edges) => {
      const updatedEdges = addEdge(newEdge, edges);
      onEdgesChange(updatedEdges as FlowEdge[]);
      return updatedEdges;
    });
  }, [onEdgesChange, setInternalEdges]);

  const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setInternalNodes((nodes) => {
      const updatedNodes = nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      );
      onNodesChange(updatedNodes as FlowNode[]);
      return updatedNodes;
    });
  }, [onNodesChange, setInternalNodes]);

  const addNode = useCallback(() => {
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { label: `Node ${internalNodes.length + 1}` },
      style: { 
        width: 'auto',
        height: 'auto',
      },
    };

    setInternalNodes((nodes) => {
      const updatedNodes = [...nodes, newNode as Node];
      onNodesChange(updatedNodes as FlowNode[]);
      return updatedNodes;
    });
  }, [internalNodes.length, onNodesChange, setInternalNodes]);

  const deleteSelected = useCallback(() => {
    setInternalNodes((nodes) => {
      const updatedNodes = nodes.filter((node) => !node.selected);
      onNodesChange(updatedNodes as FlowNode[]);
      return updatedNodes;
    });
    
    setInternalEdges((edges) => {
      const updatedEdges = edges.filter((edge) => !edge.selected);
      onEdgesChange(updatedEdges as FlowEdge[]);
      return updatedEdges;
    });
  }, [onNodesChange, onEdgesChange, setInternalNodes, setInternalEdges]);

  const convertFromDiagram = useCallback(() => {
    if (!code.trim()) return;
    
    let parsedDiagram;
    switch (engine) {
      case 'mermaid':
        parsedDiagram = parseMermaidToNodes(code);
        break;
      case 'graphviz':
        parsedDiagram = parseGraphvizToNodes(code);
        break;
      case 'd2':
        parsedDiagram = parseD2ToNodes(code);
        break;
      case 'plantuml':
        parsedDiagram = parsePlantUMLToNodes(code);
        break;
      default:
        return;
    }
    
    setInternalNodes(parsedDiagram.nodes as Node[]);
    setInternalEdges(parsedDiagram.edges as Edge[]);
    onNodesChange(parsedDiagram.nodes);
    onEdgesChange(parsedDiagram.edges);
  }, [code, engine, onNodesChange, onEdgesChange, setInternalNodes, setInternalEdges]);

  const generateCodeFromNodes = useCallback(() => {
    if (internalNodes.length === 0) return;

    let generatedCode = '';
    
    switch (engine) {
      case 'mermaid':
        generatedCode = 'flowchart LR\n';
        internalNodes.forEach(node => {
          generatedCode += `  ${node.id}[${node.data.label}]\n`;
        });
        internalEdges.forEach(edge => {
          generatedCode += `  ${edge.source} --> ${edge.target}\n`;
        });
        break;
      
      case 'graphviz':
        generatedCode = 'digraph G {\n';
        internalNodes.forEach(node => {
          generatedCode += `  ${node.id} [label="${node.data.label}"];\n`;
        });
        internalEdges.forEach(edge => {
          generatedCode += `  ${edge.source} -> ${edge.target};\n`;
        });
        generatedCode += '}';
        break;
      
      case 'd2':
        internalNodes.forEach(node => {
          generatedCode += `${node.id}: ${node.data.label}\n`;
        });
        internalEdges.forEach(edge => {
          generatedCode += `${edge.source} -> ${edge.target}\n`;
        });
        break;
      
      case 'plantuml':
        generatedCode = '@startuml\n';
        internalEdges.forEach(edge => {
          const sourceLabel = internalNodes.find(n => n.id === edge.source)?.data.label || edge.source;
          const targetLabel = internalNodes.find(n => n.id === edge.target)?.data.label || edge.target;
          generatedCode += `${sourceLabel} -> ${targetLabel}\n`;
        });
        generatedCode += '@enduml';
        break;
    }
    
    onCodeChange(generatedCode);
  }, [internalNodes, internalEdges, engine, onCodeChange]);

  const renderPreview = () => {
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

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
        {/* View Mode Toggle */}
        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
          <Button
            onClick={() => setViewMode('preview')}
            size="sm"
            variant={viewMode === 'preview' ? 'default' : 'ghost'}
            className="rounded-none border-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode('split')}
            size="sm"
            variant={viewMode === 'split' ? 'default' : 'ghost'}
            className="rounded-none border-0"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setViewMode('editor')}
            size="sm"
            variant={viewMode === 'editor' ? 'default' : 'ghost'}
            className="rounded-none border-0"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Editor Controls */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <>
            <Button
              onClick={addNode}
              size="sm"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
              Add Node
            </Button>
            <Button
              onClick={deleteSelected}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              onClick={convertFromDiagram}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Download className="w-4 h-4" />
              Import
            </Button>
            <Button
              onClick={generateCodeFromNodes}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Edit3 className="w-4 h-4" />
              Generate Code
            </Button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="h-full pt-16">
        {viewMode === 'preview' && (
          <div ref={previewRef} className="h-full bg-white dark:bg-slate-800">
            {renderPreview()}
          </div>
        )}

        {viewMode === 'editor' && (
          <div className="h-full">
            <ReactFlow
              nodes={internalNodes}
              edges={internalEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              nodeTypes={nodeTypes}
              proOptions={proOptions}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              fitView
              className="bg-slate-50 dark:bg-slate-900"
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { stroke: '#6B7280', strokeWidth: 2 },
              }}
            >
              <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#E5E7EB"
                className="dark:opacity-20"
              />
            </ReactFlow>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="h-full flex">
            <div ref={previewRef} className="w-1/2 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
              {renderPreview()}
            </div>
            <div className="w-1/2">
              <ReactFlow
                nodes={internalNodes}
                edges={internalEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                fitView
                className="bg-slate-50 dark:bg-slate-900"
                defaultEdgeOptions={{
                  type: 'smoothstep',
                  style: { stroke: '#6B7280', strokeWidth: 2 },
                }}
              >
                <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600" />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="#E5E7EB"
                  className="dark:opacity-20"
                />
              </ReactFlow>
            </div>
          </div>
        )}
      </div>

      {/* Instructions for empty state */}
      {internalNodes.length === 0 && viewMode !== 'preview' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-16">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <div className="text-lg font-medium mb-2">Interactive Diagram Editor</div>
            <div className="text-sm space-y-1">
              <p>Click "Import" to convert diagram code to editable nodes</p>
              <p>Click "Add Node" to create new nodes</p>
              <p>Drag nodes to reposition • Double-click to edit labels</p>
              <p>Connect nodes by dragging from handles</p>
              <p>Click "Generate Code" to update diagram code from nodes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}