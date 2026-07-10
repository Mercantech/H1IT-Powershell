import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  title?: string;
  showPrompt?: boolean;
}

export function CodeBlock({ code, title, showPrompt = true }: CodeBlockProps) {
  return (
    <div className="code-block">
      <div className="code-block-chrome">
        <span className="code-block-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </span>
        <span className="code-block-title">{title ?? 'PowerShell'}</span>
      </div>
      <pre className="code-block-content">
        {showPrompt && <span className="code-prompt">PS C:\H1IT&gt; </span>}
        <code>{code}</code>
      </pre>
    </div>
  );
}
