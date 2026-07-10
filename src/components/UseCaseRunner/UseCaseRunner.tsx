import { useState } from 'react';
import { course } from '../../data/course';
import { CodeBlock } from '../CodeBlock';
import './UseCaseRunner.css';

interface UseCaseRunnerProps {
  title: string;
  code: string;
  sampleOutput: string;
}

export function UseCaseRunner({ title, code, sampleOutput }: UseCaseRunnerProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const runExample = () => {
    setStatus('running');
    window.setTimeout(() => setStatus('done'), 700);
  };

  return (
    <div className="use-case-runner">
      <CodeBlock code={code} title={title} showPrompt={false} />

      <div className="use-case-runner-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={runExample}
          disabled={status === 'running'}
        >
          {status === 'running' ? 'Kører…' : status === 'done' ? 'Kør igen' : 'Kør eksempel'}
        </button>
        {status === 'done' && (
          <span className="use-case-runner-hint">Simuleret output nedenfor</span>
        )}
      </div>

      {status === 'running' && (
        <div className="use-case-output use-case-output--loading" aria-live="polite">
          <div className="use-case-output-chrome">
            <span className="code-block-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </span>
            <span className="use-case-output-title">Output</span>
            <span className="use-case-output-path">{course.promptPath}</span>
          </div>
          <div className="use-case-output-body">
            <span className="use-case-output-cursor">▋</span>
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="use-case-output" aria-live="polite">
          <div className="use-case-output-chrome">
            <span className="code-block-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </span>
            <span className="use-case-output-title">Output</span>
            <span className="use-case-output-path">{course.promptPath}</span>
          </div>
          <pre className="use-case-output-body">{sampleOutput}</pre>
          <p className="use-case-output-note">
            Simuleret output — sådan kunne resultatet se ud i jeres projektmiljø.
          </p>
        </div>
      )}
    </div>
  );
}
