import React, { useEffect, useState } from 'react';

interface PlantUMLRendererProps {
  code: string;
}

export function PlantUMLRenderer({ code }: PlantUMLRendererProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code.trim()) {
      setImageUrl(null);
      return;
    }

    const renderPlantUML = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using Kroki API for PlantUML rendering
        const encodedCode = btoa(unescape(encodeURIComponent(code)));
        const krokoUrl = `https://kroki.io/plantuml/svg/${encodedCode}`;
        
        // Test if the URL is accessible
        const response = await fetch(krokoUrl, { method: 'HEAD' });
        if (response.ok) {
          setImageUrl(krokoUrl);
        } else {
          throw new Error('Failed to generate PlantUML diagram');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render PlantUML diagram');
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(renderPlantUML, 500);
    return () => clearTimeout(debounceTimer);
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-slate-600 dark:text-slate-400">Rendering PlantUML diagram...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">PlantUML Render Error</div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">{error}</div>
          <div className="text-xs text-slate-500 mt-2">
            Note: PlantUML rendering requires internet connection via Kroki API
          </div>
        </div>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-slate-500 dark:text-slate-400">
        Enter PlantUML diagram code to see the preview
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4" data-diagram-preview>
      {imageUrl && (
        <div className="flex justify-center items-center min-h-full">
          <img
            src={imageUrl}
            alt="PlantUML Diagram"
            className="max-w-full max-h-full object-contain"
            onError={() => setError('Failed to load diagram image')}
          />
        </div>
      )}
    </div>
  );
}