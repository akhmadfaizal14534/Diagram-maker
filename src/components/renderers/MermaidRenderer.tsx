import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#3B82F6',
        primaryTextColor: '#1F2937',
        primaryBorderColor: '#E5E7EB',
        lineColor: '#6B7280',
        secondaryColor: '#F3F4F6',
        tertiaryColor: '#FAFAFA',
      }
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !code.trim()) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render Mermaid diagram');
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Mermaid Render Error</div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400">
        Enter Mermaid diagram code to see the preview
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4">
      <div 
        ref={containerRef}
        className="flex justify-center items-center min-h-full"
      />
    </div>
  );
}