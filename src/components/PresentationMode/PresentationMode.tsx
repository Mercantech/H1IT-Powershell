import { type ReactNode } from 'react';
import { course } from '../../data/course';
import { assets } from '../../data/assets';
import {
  presentationSlides,
  sectionLabels,
  type PresentationSlide,
} from '../../data/presentationSlides';
import { usePresentation } from '../../context/PresentationContext';
import { PresentationSlideRunner } from './PresentationSlideRunner';
import './PresentationMode.css';

const scrollLayouts = new Set(['bullets', 'code', 'runnable', 'table', 'quiz', 'local']);

function SlideContent({ slide }: { slide: PresentationSlide }) {
  const scrollable = scrollLayouts.has(slide.layout);

  const wrap = (children: ReactNode, className = '') => (
    <div className={`pres-slide pres-slide--content ${scrollable ? 'pres-slide--scroll' : ''} ${className}`}>
      {children}
    </div>
  );

  switch (slide.layout) {
    case 'title':
      return (
        <div className="pres-slide pres-slide--title">
          <img src={assets.powershell} alt="" className="pres-logo" />
          <h1 className="pres-title">{slide.title}</h1>
          {slide.subtitle && <p className="pres-subtitle">{slide.subtitle}</p>}
          {slide.highlight && <p className="pres-highlight">{slide.highlight}</p>}
        </div>
      );

    case 'section':
      return (
        <div className="pres-slide pres-slide--section">
          <p className="pres-section-eyebrow">{course.fullName}</p>
          <h1 className="pres-section-title">{slide.title}</h1>
          {slide.subtitle && <p className="pres-section-subtitle">{slide.subtitle}</p>}
        </div>
      );

    case 'highlight':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.highlight && <p className="pres-callout">{slide.highlight}</p>}
          {slide.bullets && (
            <ul className="pres-bullets">
              {slide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </>
      );

    case 'runnable':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.highlight && <p className="pres-lead">{slide.highlight}</p>}
          {slide.subtitle && <p className="pres-lead">{slide.subtitle}</p>}
          {slide.code && slide.sampleOutput && (
            <PresentationSlideRunner code={slide.code} sampleOutput={slide.sampleOutput} />
          )}
        </>
      );

    case 'table':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.tableHeaders && slide.rows && (
            <div className="pres-table-wrap">
              <table className="pres-table">
                <thead>
                  <tr>
                    {slide.tableHeaders.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slide.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );

    case 'quiz':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.quizQuestion && <p className="pres-quiz-question">{slide.quizQuestion}</p>}
          {slide.quizOptions && (
            <ul className="pres-bullets pres-bullets--quiz">
              {slide.quizOptions.map((opt) => (
                <li
                  key={opt}
                  className={opt === slide.quizAnswer ? 'pres-quiz-correct' : undefined}
                >
                  {opt}
                  {opt === slide.quizAnswer && ' ✓'}
                </li>
              ))}
            </ul>
          )}
          {slide.quizExplanation && (
            <p className="pres-quiz-explanation">{slide.quizExplanation}</p>
          )}
        </>
      );

    case 'local':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.subtitle && <p className="pres-lead">{slide.subtitle}</p>}
          {slide.bullets && (
            <p className="pres-local-meta">{slide.bullets.join(' · ')}</p>
          )}
          {slide.steps && (
            <ol className="pres-steps">
              {slide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {slide.deliverable && (
            <p className="pres-deliverable">
              <strong>Aflevering:</strong> {slide.deliverable}
            </p>
          )}
        </>
      );

    case 'code':
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.subtitle && <p className="pres-lead">{slide.subtitle}</p>}
          {slide.highlight && <p className="pres-lead">{slide.highlight}</p>}
          {slide.code && (
            <pre className="pres-code">
              <code>{slide.code}</code>
            </pre>
          )}
          {slide.bullets && (
            <ul className="pres-bullets pres-bullets--compact">
              {slide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </>
      );

    case 'bullets':
    default:
      return wrap(
        <>
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.subtitle && <p className="pres-lead pres-lead--prompt">{slide.subtitle}</p>}
          {slide.bullets && (
            <ul className="pres-bullets">
              {slide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </>
      );
  }
}

export function PresentationMode() {
  const { isActive, slideIndex, totalSlides, exit, next, prev, goTo } = usePresentation();

  if (!isActive) return null;

  const slide = presentationSlides[slideIndex];
  const progress = ((slideIndex + 1) / totalSlides) * 100;

  return (
    <div className="presentation-mode" role="dialog" aria-modal="true" aria-label="Præsentation">
      <div className="presentation-backdrop" aria-hidden />

      <button
        type="button"
        className="presentation-nav presentation-nav--prev"
        onClick={prev}
        disabled={slideIndex === 0}
        aria-label="Forrige slide"
      />

      <button
        type="button"
        className="presentation-nav presentation-nav--next"
        onClick={next}
        disabled={slideIndex === totalSlides - 1}
        aria-label="Næste slide"
      />

      <div className="presentation-stage" key={slide.id}>
        <SlideContent slide={slide} />
      </div>

      <footer className="presentation-footer">
        <div className="presentation-progress">
          <div className="presentation-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="presentation-footer-inner">
          <span className="presentation-section">{sectionLabels[slide.section]}</span>
          <span className="presentation-counter">
            {slideIndex + 1} / {totalSlides}
          </span>
          <div className="presentation-controls">
            <button type="button" className="presentation-btn" onClick={prev} disabled={slideIndex === 0}>
              ←
            </button>
            <button
              type="button"
              className="presentation-btn"
              onClick={next}
              disabled={slideIndex === totalSlides - 1}
            >
              →
            </button>
            <button type="button" className="presentation-btn presentation-btn--exit" onClick={exit}>
              Esc · Afslut
            </button>
          </div>
        </div>

        <p className="presentation-hint">
          F5 fra start · Shift+F5 fra sektion · Kør eksempel på slides med ▶ · Esc afslut
        </p>
      </footer>

      <div className="presentation-dots" aria-hidden>
        {presentationSlides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`presentation-dot ${index === slideIndex ? 'active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Gå til slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
