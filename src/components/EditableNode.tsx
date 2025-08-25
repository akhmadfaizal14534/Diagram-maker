import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface EditableNodeData {
  label: string;
  onLabelChange?: (id: string, newLabel: string) => void;
}

export function EditableNode({ id, data, selected }: NodeProps<EditableNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    if (data.onLabelChange && label !== data.label) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setLabel(data.label);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-slate-800 border-2 transition-all duration-200 min-w-[100px] min-h-[50px] flex items-center justify-center ${
        selected 
          ? 'border-blue-500 dark:border-blue-400 shadow-blue-200 dark:shadow-blue-900' 
          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-slate-800"
      />
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 text-center border-none outline-none w-full"
          style={{ minWidth: '60px' }}
        />
      ) : (
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 text-center cursor-pointer select-none">
          {data.label}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-slate-800"
      />
      
      {/* Resize handles */}
      <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full cursor-se-resize ${selected ? 'block' : 'hidden'}`} />
    </div>
  );
}