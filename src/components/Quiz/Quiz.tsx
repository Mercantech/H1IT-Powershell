import { useState } from 'react';
import type { QuizQuestion } from '../../data/quizzes/types';
import './Quiz.css';

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
}

export function Quiz({ questions, title = 'Quiz' }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const handleAnswer = (questionId: string, answer: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    setSubmitted((prev) => ({ ...prev, [questionId]: true }));
  };

  const isCorrect = (q: QuizQuestion) => {
    const answer = answers[q.id];
    if (answer === undefined) return null;
    if (q.type === 'boolean') return answer === q.correctAnswer;
    return answer === q.correctAnswer;
  };

  return (
    <div className="quiz">
      <h3>{title}</h3>
      {questions.map((q, index) => {
        const answered = submitted[q.id];
        const correct = isCorrect(q);

        return (
          <div key={q.id} className="quiz-question card">
            <p className="quiz-question-text">
              <strong>{index + 1}.</strong> {q.question}
            </p>

            {q.type === 'boolean' ? (
              <div className="quiz-options">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    className={`quiz-option ${answered && answers[q.id] === val ? (correct ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => handleAnswer(q.id, val)}
                    disabled={answered}
                  >
                    {val ? 'Sandt' : 'Falsk'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="quiz-options">
                {q.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`quiz-option ${answered && answers[q.id] === option ? (correct ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => handleAnswer(q.id, option)}
                    disabled={answered}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {answered && (
              <div className={`quiz-feedback ${correct ? 'correct' : 'incorrect'}`}>
                <span className="quiz-icon">{correct ? '✓' : '✗'}</span>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
