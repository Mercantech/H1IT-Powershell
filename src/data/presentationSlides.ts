import { buildPresentationSlides } from './buildPresentationSlides';
import { ws2022Slides } from './ws2022Slides';
import type { CodeExerciseData } from './exercises/types';

export type SlideLayout =
  | 'title'
  | 'section'
  | 'bullets'
  | 'exercise'
  | 'code'
  | 'highlight'
  | 'runnable'
  | 'table'
  | 'quiz'
  | 'local'
  | 'learning-goals';

export type SlideSection = 'intro' | 'dag-1' | 'dag-2' | 'projekt' | 'ws2022' | 'afslutning';

export interface PresentationSlide {
  id: string;
  layout: SlideLayout;
  section: SlideSection;
  title: string;
  subtitle?: string;
  bullets?: string[];
  code?: string;
  sampleOutput?: string;
  highlight?: string;
  steps?: string[];
  deliverable?: string;
  tableHeaders?: string[];
  rows?: string[][];
  quizQuestion?: string;
  quizOptions?: string[];
  quizAnswer?: string;
  quizExplanation?: string;
  exercise?: CodeExerciseData;
}

export const presentationSlides: PresentationSlide[] = buildPresentationSlides();

export function getPresentationSlidesForPath(pathname: string): PresentationSlide[] {
  return pathname.replace(/\/+$/, '') === '/ws2022' ? ws2022Slides : presentationSlides;
}

const pathSectionMap: Record<string, SlideSection> = {
  '/': 'intro',
  '/dag-1': 'dag-1',
  '/dag-2': 'dag-2',
  '/projekt': 'projekt',
  '/ws2022': 'ws2022',
};

export function getSlideIndexForPath(pathname: string): number {
  const section = pathSectionMap[pathname.replace(/\/+$/, '') || '/'];
  if (!section) return 0;

  const index = getPresentationSlidesForPath(pathname).findIndex((slide) => slide.section === section);
  return index >= 0 ? index : 0;
}

export const sectionLabels: Record<SlideSection, string> = {
  intro: 'Intro',
  'dag-1': 'Dag 1',
  'dag-2': 'Dag 2',
  projekt: 'Projektkobling',
  ws2022: 'Windows Server 2022',
  afslutning: 'Afslutning',
};
