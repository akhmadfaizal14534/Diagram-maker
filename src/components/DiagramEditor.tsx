import React, { useCallback, useMemo } from 'react';
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
  NodeResizer,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowNode, FlowEdge } from '../types/diagram';
import { EditableNode } from './EditableNode';
import { Button } from './ui/Button';
import { Plus, Trash2, Download } from 'lucide-react';
import { parseMermaidToNodes, parseGraphvizToNodes, parseD2ToNodes, parsePlantUMLToNodes } from '../utils/diagramParser';
import { DiagramEngine } from '../types/diagram';

interface DiagramEditorProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  engine: DiagramEngine;
  code: string;
  onNodesChange: (nodes: FlowNode[]) => void;
  onEdgesChange: (edges: FlowEdge[]) => void;
}

export function DiagramEditor({ nodes, edges, engine, code, onNodesChange, onEdgesChange }: DiagramEditorProps) {
  const [internalNodes, setInternalNodes, onNodesChangeInternal] = useNodesState(nodes as Node[]);
  const [internalEdges, setInternalEdges, onEdgesChangeInternal] = useEdgesState(edges as Edge[]);

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
    // Get updated nodes after changes
    setInternalNodes((nodes) => {
      onNodesChange(nodes as FlowNode[]);
      return nodes;
    });
  }, [onNodesChangeInternal, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChangeInternal(changes);
    // Get updated edges after changes
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

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
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
          Delete Selected
        </Button>
        <Button
          onClick={convertFromDiagram}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950"
        >
          <Download className="w-4 h-4" />
          Convert from {engine.toUpperCase()}
        </Button>
      </div>

      {/* React Flow */}
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
        
        {/* Node Resizer for selected nodes */}
        {internalNodes.map((node) => 
          node.selected ? (
            <NodeResizer
              key={`resizer-${node.id}`}
              nodeId={node.id}
              isVisible={node.selected}
              minWidth={80}
              minHeight={40}
              handleClassName="bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-slate-800"
              lineClassName="border-blue-500 dark:border-blue-400"
            />
          ) : null
        )}
      </ReactFlow>

      {/* Instructions */}
      {internalNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-500 dark:text-slate-400">
            <div className="text-lg font-medium mb-2">Interactive Diagram Editor</div>
            <div className="text-sm space-y-1">
              <p>Click "Convert from {engine.toUpperCase()}" to import diagram as editable nodes</p>
              <p>Click "Add Node" to create new nodes</p>
              <p>Drag nodes to reposition them</p>
              <p>Double-click nodes to edit their labels</p>
              <p>Select nodes and drag corners to resize</p>
              <p>Connect nodes by dragging from node handles</p>
              <p>Select and delete nodes/edges as needed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}