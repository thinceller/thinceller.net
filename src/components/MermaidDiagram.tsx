'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const id = useId();
  const renderCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    renderCountRef.current += 1;
    const sanitizedId = id.replace(/:/g, '');
    const diagramId = `mermaid-${sanitizedId}-${renderCountRef.current}`;

    async function renderDiagram(): Promise<void> {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
        fontFamily: 'inherit',
      });

      try {
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, id]);

  if (isLoading) {
    return (
      <div
        className="mb-6 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-8"
        style={{ minHeight: '200px' }}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">
          Loading diagram...
        </span>
      </div>
    );
  }

  return (
    <div
      className="mb-6 flex justify-center overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 [&>svg]:max-w-full"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG output from mermaid.render()
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
