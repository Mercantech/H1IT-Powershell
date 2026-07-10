import { useState } from 'react';
import './PipelineVisualizer.css';

interface PipelineStep {
  id: string;
  label: string;
}

interface PipelineChallenge {
  id: string;
  goal: string;
  steps: PipelineStep[];
  correctOrder: string[];
  explanation: string;
}

const challenge: PipelineChallenge = {
  id: 'pipeline-1',
  goal: 'Find stoppede services og vis kun navnet',
  steps: [
    { id: 'get-service', label: 'Get-Service' },
    { id: 'where', label: 'Where-Object { $_.Status -eq "Stopped" }' },
    { id: 'select', label: 'Select-Object Name' },
    { id: 'sort', label: 'Sort-Object Name' },
  ],
  correctOrder: ['get-service', 'where', 'select'],
  explanation:
    'Get-Service henter alle services → Where-Object filtrerer på Stopped → Select-Object viser kun Name.',
};

export function PipelineVisualizer() {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const available = challenge.steps.filter((s) => !selected.includes(s.id));

  const addStep = (id: string) => {
    setSelected((prev) => [...prev, id]);
    setResult(null);
  };

  const removeStep = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const reset = () => {
    setSelected([]);
    setResult(null);
  };

  const checkOrder = () => {
    const correct =
      selected.length === challenge.correctOrder.length &&
      selected.every((id, i) => id === challenge.correctOrder[i]);
    setResult(correct ? 'correct' : 'incorrect');
  };

  const getLabel = (id: string) => challenge.steps.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="pipeline-visualizer card">
      <h4>Pipeline-øvelse</h4>
      <p className="pipeline-goal">
        <strong>Mål:</strong> {challenge.goal}
      </p>

      <div className="pipeline-build">
        <p className="pipeline-label">Din pipeline:</p>
        <div className="pipeline-chain">
          {selected.length === 0 ? (
            <span className="pipeline-empty">Klik på cmdlets nedenfor for at bygge pipelinen</span>
          ) : (
            selected.map((id, index) => (
              <span key={`${id}-${index}`} className="pipeline-step-wrapper">
                {index > 0 && <span className="pipeline-pipe">|</span>}
                <button
                  type="button"
                  className="pipeline-step"
                  onClick={() => removeStep(index)}
                  title="Klik for at fjerne"
                >
                  {getLabel(id)}
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="pipeline-available">
        <p className="pipeline-label">Tilgængelige cmdlets:</p>
        <div className="pipeline-options">
          {available.map((step) => (
            <button
              key={step.id}
              type="button"
              className="pipeline-option"
              onClick={() => addStep(step.id)}
            >
              {step.label}
            </button>
          ))}
          {available.length === 0 && (
            <span className="pipeline-empty">Alle cmdlets er valgt</span>
          )}
        </div>
      </div>

      <div className="pipeline-actions">
        <button type="button" className="btn btn-secondary" onClick={reset}>
          Nulstil
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={checkOrder}
          disabled={selected.length === 0}
        >
          Tjek rækkefølge
        </button>
      </div>

      {result && (
        <div className={`pipeline-result ${result}`}>
          <span>{result === 'correct' ? '✓ Korrekt pipeline!' : '✗ Forkert rækkefølge'}</span>
          <p>{challenge.explanation}</p>
        </div>
      )}
    </div>
  );
}
