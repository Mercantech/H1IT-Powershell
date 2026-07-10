import { course } from '../../data/course';
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
}

export function CodeBlock({
  code,
  title,
  filename,
  showPrompt = true,
}: CodeBlockProps) {
  const displayName = filename ?? (title ? `${title}.ps1` : 'script.ps1');

  const handleMount: OnMount = (_editor, monaco) => {
    setupPowerShellTheme(monaco);
  };

  return (
    <div className="code-block">
      <div className="code-block-chrome">
        <span className="code-block-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </span>
        <span className="code-block-title">{displayName}</span>
        {showPrompt && (
          <span className="code-block-path">{course.promptPath}</span>
        )}
      </div>
      <div className="code-block-editor">
        <Editor
          height={`${codeBlockHeight(code)}px`}
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
