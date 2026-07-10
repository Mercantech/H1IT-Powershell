import { useState } from 'react';
import type { PresentationSlide } from '../../data/presentationSlides';
import './PresentationQuizSlide.css';

interface PresentationQuizSlideProps {
  slide: PresentationSlide;
}

export function PresentationQuizSlide({ slide }: PresentationQuizSlideProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = slide.quizOptions ?? [];
  const correctAnswer = slide.quizAnswer ?? '';
  const answered = selected !== null;
  const isCorrect = selected === correctAnswer;

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
  };

  return (
    <div className="pres-quiz" onClick={(e) => e.stopPropagation()}>
      <h2 className="pres-heading">{slide.title}</h2>
      {slide.quizQuestion && <p className="pres-quiz-question">{slide.quizQuestion}</p>}

      <div className="pres-quiz-options" role="listbox" aria-label="Svarmuligheder">
        {options.map((opt) => {
          let stateClass = '';
          if (answered) {
            if (opt === correctAnswer) stateClass = 'pres-quiz-option--correct';
            else if (opt === selected) stateClass = 'pres-quiz-option--wrong';
          }

          return (
            <button
              key={opt}
              type="button"
              className={`pres-quiz-option ${stateClass}`}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              aria-pressed={selected === opt}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`pres-quiz-feedback ${isCorrect ? 'pres-quiz-feedback--correct' : 'pres-quiz-feedback--wrong'}`}>
          <span className="pres-quiz-feedback-icon">{isCorrect ? '✓ Korrekt!' : '✗ Ikke helt rigtigt'}</span>
          {slide.quizExplanation && <p>{slide.quizExplanation}</p>}
          {!isCorrect && (
            <p className="pres-quiz-correct-answer">
              Rigtigt svar: <strong>{correctAnswer}</strong>
            </p>
          )}
        </div>
      )}

      {!answered && <p className="pres-quiz-prompt">Vælg et svar — klik på en mulighed</p>}
    </div>
  );
}
