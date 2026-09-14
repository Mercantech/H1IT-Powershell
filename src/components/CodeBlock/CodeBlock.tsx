import { course } from '../../data/course';
import { useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  codeBlockHeight,
  readOnlyBlockOptions,
  setupPowerShellTheme,
} from '../../lib/monaco/theme';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  title?: string;
  filename?: string;
  showPrompt?: boolean;
  showCopy?: boolean;
  maxHeight?: number;
}

export function CodeBlock({
  code,
  title,
  filename,
  showPrompt = true,
  showCopy = false,
  maxHeight,
}: CodeBlockProps) {
  const displayName = filename ?? (title ? `${title}.ps1` : 'script.ps1');
  const [copyStatus, setCopyStatus] = useState<{ code: string; success: boolean } | null>(null);
  const currentCopyStatus = copyStatus?.code === code ? copyStatus : null;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus({ code, success: true });
    } catch {
      setCopyStatus({ code, success: false });
    }
  }

  const handleMount: OnMount = (_editor, monaco) => {
    setupPowerShellTheme(monaco);
  };

  return (
    <div className="code-block">
      <div className="code-block-chrome">
        <span className="code-block-title">{displayName}</span>
        {showPrompt && (
          <span className="code-block-path">{course.promptPath}</span>
        )}
        {showCopy && (
          <button type="button" className="code-block-copy" onClick={copyCode} aria-label={`Kopiér ${displayName}`}>
            {currentCopyStatus?.success ? 'Kopieret!' : 'Kopiér kode'}
          </button>
        )}
      </div>
      {showCopy && <div className="code-block-copy-status" role="status">
        {currentCopyStatus && (currentCopyStatus.success
          ? 'Koden er kopieret til udklipsholderen.'
          : 'Kunne ikke kopiere automatisk. Markér koden i feltet, og kopiér med Ctrl+C.')}
      </div>}
      <div className="code-block-editor">
        <Editor
          height={`${Math.min(codeBlockHeight(code), maxHeight ?? Infinity)}px`}
          defaultLanguage="powershell"
          value={code}
          onMount={handleMount}
          options={readOnlyBlockOptions}
          loading={
            <div className="code-block-loading">Indlæser syntax highlight…</div>
          }
        />
      </div>
    </div>
  );
}
