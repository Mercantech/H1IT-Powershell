import { useState } from 'react';
import type { CodeExerciseData } from '../../data/exercises/types';
import { validateAnswer, validatePattern } from '../../utils/validateAnswer';
import './CodeExercise.css';

interface CodeExerciseProps {
  exercise: CodeExerciseData;
}

export function CodeExercise({ exercise }: CodeExerciseProps) {
  const [input, setInput] = useState(exercise.starterCode ?? '');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const checkAnswer = () => {
    let correct = false;
    if (exercise.usePattern && exercise.patterns) {
      correct = validatePattern(input, exercise.patterns);
    }
    if (!correct) {
      correct = validateAnswer(input, exercise.acceptedAnswers);
    }
    setResult(correct ? 'correct' : 'incorrect');
  };

  return (
    <div className="code-exercise card">
      <p className="code-exercise-prompt">{exercise.prompt}</p>

      <div className="code-exercise-input-wrapper">
        <div className="code-exercise-chrome">
          <span className="code-block-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </span>
          <span>Skriv din kommando</span>
        </div>
        <div className="code-exercise-input-line">
          <span className="code-prompt">PS C:\H1IT&gt; </span>
          <textarea
            className="code-exercise-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
            rows={3}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="code-exercise-actions">
        {exercise.hint && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Skjul hint' : 'Vis hint'}
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={checkAnswer}>
          Tjek svar
        </button>
      </div>

      {showHint && exercise.hint && (
        <p className="code-exercise-hint">💡 {exercise.hint}</p>
      )}

      {result && (
        <div className={`code-exercise-result ${result}`}>
          <span>{result === 'correct' ? '✓ Korrekt!' : '✗ Ikke helt rigtigt'}</span>
          <p>{exercise.explanation}</p>
          {result === 'incorrect' && exercise.acceptedAnswers[0] && (
            <p className="code-exercise-facit">
              Eksempel: <code>{exercise.acceptedAnswers[0]}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
