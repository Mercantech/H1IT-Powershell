import { useState } from 'react';
import { course } from '../../data/course';
import './PresentationSlideRunner.css';

interface PresentationSlideRunnerProps {
  code: string;
  sampleOutput: string;
}

export function PresentationSlideRunner({ code, sampleOutput }: PresentationSlideRunnerProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

  const run = () => {
    setStatus('running');
    window.setTimeout(() => setStatus('done'), 650);
  };

  return (
    <div className="pres-runner" onClick={(e) => e.stopPropagation()}>
      <pre className="pres-code pres-code--runner">
        <code>{code}</code>
      </pre>
      <div className="pres-runner-actions">
        <button type="button" className="pres-run-btn" onClick={run} disabled={status === 'running'}>
          {status === 'running' ? 'Kører…' : status === 'done' ? 'Kør igen' : '▶ Kør eksempel'}
        </button>
      </div>
      {status === 'running' && (
        <div className="pres-runner-output pres-runner-output--loading">
          <span className="pres-runner-path">{course.promptPath}</span>
          <span className="pres-runner-cursor">▋</span>
        </div>
      )}
      {status === 'done' && (
        <div className="pres-runner-output">
          <span className="pres-runner-path">{course.promptPath}</span>
          <pre>{sampleOutput}</pre>
          <p className="pres-runner-note">Simuleret output</p>
        </div>
      )}
    </div>
  );
}
