import { useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { reviewExerciseWithAi } from '../../api/exerciseReview';
import { course } from '../../data/course';
import type { CodeExerciseData } from '../../data/exercises/types';
import { exerciseEditorOptions, setupPowerShellTheme } from '../../lib/monaco/theme';
import { validateAnswer, validatePattern } from '../../utils/validateAnswer';
import './CodeExercise.css';

interface CodeExerciseProps {
  exercise: CodeExerciseData;
  initialInput?: string;
  onInputChange?: (input: string) => void;
}

function checkLocally(exercise: CodeExerciseData, input: string): boolean {
  if (exercise.usePattern && exercise.patterns) {
    if (validatePattern(input, exercise.patterns)) return true;
  }
  return validateAnswer(input, exercise.acceptedAnswers);
}

export function CodeExercise({
  exercise,
  initialInput,
  onInputChange,
}: CodeExerciseProps) {
  const [input, setInput] = useState(initialInput ?? exercise.starterCode ?? '');
  const [visibleHintCount, setVisibleHintCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSource, setFeedbackSource] = useState<'ai' | 'local' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMount: OnMount = (_editor, monaco) => {
    setupPowerShellTheme(monaco);
  };

  const hints = exercise.hints ?? [];
  const allHintsVisible = visibleHintCount === hints.length;

  const resetFeedback = () => {
    setResult(null);
    setFeedback(null);
    setFeedbackSource(null);
    setError(null);
  };

  const checkAnswer = async () => {
    if (!input.trim()) {
      setError('Skriv en kommando før du tjekker svar.');
      return;
    }

    setLoading(true);
    resetFeedback();

    try {
      const aiResult = await reviewExerciseWithAi({
        exerciseId: exercise.id,
        prompt: exercise.prompt,
        studentAnswer: input,
        acceptedAnswers: exercise.acceptedAnswers,
        explanation: exercise.explanation,
        hint: hints.join(' '),
      });

      setResult(aiResult.correct ? 'correct' : 'incorrect');
      setFeedback(aiResult.feedback);
      setFeedbackSource('ai');
    } catch {
      const correct = checkLocally(exercise, input);
      setResult(correct ? 'correct' : 'incorrect');
      setFeedbackSource('local');
      setFeedback(
        correct
          ? exercise.explanation
          : `${exercise.explanation} AI-feedback er midlertidigt utilgængelig — du får standardsvar.`
      );
      if (!correct) {
        setError('AI ikke tilgængelig. Prøv igen senere for mere detaljeret feedback.');
      }
    } finally {
      setLoading(false);
    }
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
          <span className="code-exercise-prompt-label">øvelse.ps1</span>
          <span
            className="code-exercise-shortcut"
            title="Åbn PowerShell-forslag"
          >
            Ctrl+Space · forslag
          </span>
          <span className="code-exercise-path">{course.promptPath}</span>
        </div>
        <div className="code-exercise-editor">
          <Editor
            height="120px"
            defaultLanguage="powershell"
            value={input}
            onChange={(value) => {
              const nextInput = value ?? '';
              setInput(nextInput);
              onInputChange?.(nextInput);
              resetFeedback();
            }}
            onMount={handleMount}
            options={exerciseEditorOptions}
            loading={
              <div className="code-exercise-editor-loading">Indlæser editor…</div>
            }
          />
        </div>
      </div>

      <div className="code-exercise-actions">
        {hints.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              setVisibleHintCount(allHintsVisible ? 0 : visibleHintCount + 1)
            }
            disabled={loading}
          >
            {allHintsVisible
              ? 'Skjul hints'
              : `Vis hint ${visibleHintCount + 1}`}
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={checkAnswer}
          disabled={loading}
        >
          {loading ? 'AI vurderer…' : 'Tjek svar med AI'}
        </button>
      </div>

      {visibleHintCount > 0 && (
        <ol className="code-exercise-hints">
          {hints.slice(0, visibleHintCount).map((hint, index) => (
            <li key={hint}>
              <strong>Hint {index + 1}:</strong> {hint}
            </li>
          ))}
        </ol>
      )}

      {error && <p className="code-exercise-error">{error}</p>}

      {result && feedback && (
        <div className={`code-exercise-result ${result}`}>
          <div className="code-exercise-result-header">
            <span>{result === 'correct' ? '✓ Korrekt!' : '✗ Ikke helt rigtigt'}</span>
            {feedbackSource === 'ai' && (
              <span className="code-exercise-ai-badge">AI-feedback</span>
            )}
          </div>
          <p>{feedback}</p>
          {result === 'incorrect' &&
            feedbackSource === 'local' &&
            exercise.acceptedAnswers[0] && (
              <p className="code-exercise-facit">
                Eksempel: <code>{exercise.acceptedAnswers[0]}</code>
              </p>
            )}
        </div>
      )}
    </div>
  );
}
