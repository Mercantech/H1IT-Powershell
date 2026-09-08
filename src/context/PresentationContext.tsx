import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  getSlideIndexForPath,
  getPresentationSlidesForPath,
  type PresentationSlide,
} from '../data/presentationSlides';

interface PresentationContextValue {
  slides: PresentationSlide[];
  isActive: boolean;
  slideIndex: number;
  totalSlides: number;
  start: (fromIndex?: number) => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const PresentationContext = createContext<PresentationContextValue | null>(null);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (target.closest('.monaco-editor')) return true;
  if (target.closest('.pres-runner')) return true;
  if (target.closest('.pres-quiz')) return true;
  if (target.closest('.pres-exercise')) return true;
  return false;
}

export function PresentationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const slides = getPresentationSlidesForPath(location.pathname);
  const [isActive, setIsActive] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const totalSlides = slides.length;

  const exit = useCallback(() => {
    setIsActive(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    }
  }, []);

  const start = useCallback((fromIndex = 0) => {
    setSlideIndex(Math.max(0, Math.min(fromIndex, slides.length - 1)));
    setIsActive(true);
    void document.documentElement.requestFullscreen().catch(() => {
      /* Fuldskærm kan blokeres — præsentation virker stadig */
    });
  }, [slides]);

  const next = useCallback(() => {
    setSlideIndex((current) => Math.min(current + 1, slides.length - 1));
  }, [slides]);

  const prev = useCallback(() => {
    setSlideIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setSlideIndex(Math.max(0, Math.min(index, slides.length - 1)));
  }, [slides]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if (event.key === 'F5') {
        event.preventDefault();
        if (event.shiftKey) {
          start(getSlideIndexForPath(location.pathname));
        } else {
          start(0);
        }
        return;
      }

      if (!isActive) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          exit();
          break;
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          event.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          prev();
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(slides.length - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exit, goTo, isActive, location.pathname, next, prev, start, slides]);

  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsActive(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive]);

  const value = useMemo(
    () => ({
      slides,
      isActive,
      slideIndex,
      totalSlides,
      start,
      exit,
      next,
      prev,
      goTo,
    }),
    [exit, goTo, isActive, next, prev, slideIndex, start, totalSlides, slides]
  );

  return (
    <PresentationContext.Provider value={value}>{children}</PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation skal bruges inden for PresentationProvider');
  }
  return context;
}
