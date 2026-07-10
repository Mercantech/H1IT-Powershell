import { course } from '../../data/course';
import { assets } from '../../data/assets';
import {
  presentationSlides,
  sectionLabels,
  type PresentationSlide,
} from '../../data/presentationSlides';
import { usePresentation } from '../../context/PresentationContext';
import './PresentationMode.css';

function SlideContent({ slide }: { slide: PresentationSlide }) {
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
      return (
        <div className="pres-slide pres-slide--content">
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.highlight && <p className="pres-callout">{slide.highlight}</p>}
          {slide.bullets && (
            <ul className="pres-bullets">
              {slide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'code':
      return (
        <div className="pres-slide pres-slide--content">
          <h2 className="pres-heading">{slide.title}</h2>
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
        </div>
      );

    case 'bullets':
    default:
      return (
        <div className="pres-slide pres-slide--content">
          <h2 className="pres-heading">{slide.title}</h2>
          {slide.subtitle && <p className="pres-lead">{slide.subtitle}</p>}
          {slide.bullets && (
            <ul className="pres-bullets">
              {slide.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
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
          F5 fra start · Shift+F5 fra aktuel sektion · Piletaster eller mellemrum · Klik venstre/højre
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
