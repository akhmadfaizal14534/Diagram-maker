import React, { useEffect, useState } from 'react';
import { instance as viz } from '@viz-js/viz';

interface GraphvizRendererProps {
  code: string;
}

export function GraphvizRenderer({ code }: GraphvizRendererProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code.trim()) {
      setSvgContent(null);
      return;
    }

    const renderGraphviz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const vizInstance = await viz();
        const svg = vizInstance.renderString(code, { format: 'svg' });
        setSvgContent(svg);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render Graphviz diagram');
        setSvgContent(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(renderGraphviz, 300);
    return () => clearTimeout(debounceTimer);
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-600 dark:text-slate-400">Rendering Graphviz diagram...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Graphviz Render Error</div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400">
        Enter Graphviz DOT diagram code to see the preview
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4">
      {svgContent && (
        <div 
          className="flex justify-center items-center min-h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
}