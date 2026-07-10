import { useEffect, useId, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { mermaidTheme } from '../../data/diagrams/mermaidTheme';
import './MermaidDiagram.css';

let mermaidInitialized = false;

function initMermaid() {
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      ...mermaidTheme,
    });
    mermaidInitialized = true;
  }
}

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const id = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMermaid();
    const render = async () => {
      if (!containerRef.current) return;
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        containerRef.current.innerHTML = svg;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunne ikke rendere diagram');
      }
    };
    render();
  }, [chart, id]);

  return (
    <div className="mermaid-wrapper">
      {title && <p className="mermaid-title">{title}</p>}
      {error ? (
        <pre className="mermaid-error">{error}</pre>
      ) : (
        <div className="mermaid-container" ref={containerRef} />
      )}
    </div>
  );
}
