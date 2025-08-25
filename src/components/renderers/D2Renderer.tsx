import React from 'react';

interface D2RendererProps {
  code: string;
}

export function D2Renderer({ code }: D2RendererProps) {
  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400">
        Enter D2 diagram code to see the preview
      </div>
    );
  }

  // Placeholder implementation for D2
  // In a real implementation, you would integrate with D2's WASM module
  return (
    <div className="w-full h-full overflow-auto p-4" data-diagram-preview>
      <div className="flex flex-col items-center justify-center min-h-full space-y-4">
        <div className="w-64 h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-600 dark:text-slate-400 text-lg font-semibold mb-2">D2 Preview</div>
            <div className="text-slate-500 dark:text-slate-500 text-sm">
              D2 rendering is not fully implemented
            </div>
          </div>
        </div>
        
        <div className="max-w-md bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Input Code:</div>
          <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
            {code}
          </pre>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
          D2 WASM integration would be implemented here. For now, this shows the input code as a placeholder.
        </div>
      </div>
    </div>
  );
}