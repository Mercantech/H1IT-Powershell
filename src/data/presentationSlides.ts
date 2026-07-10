import { buildPresentationSlides } from './buildPresentationSlides';

export type SlideLayout =
  | 'title'
  | 'section'
  | 'bullets'
  | 'code'
  | 'highlight'
  | 'runnable'
  | 'table'
  | 'quiz'
  | 'local';

export type SlideSection = 'intro' | 'dag-1' | 'dag-2' | 'projekt' | 'afslutning';

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
}

export const presentationSlides: PresentationSlide[] = buildPresentationSlides();

const pathSectionMap: Record<string, SlideSection> = {
  '/': 'intro',
  '/dag-1': 'dag-1',
  '/dag-2': 'dag-2',
  '/projekt': 'projekt',
};

export function getSlideIndexForPath(pathname: string): number {
  const section = pathSectionMap[pathname];
  if (!section) return 0;

  const index = presentationSlides.findIndex((slide) => slide.section === section);
  return index >= 0 ? index : 0;
}

export const sectionLabels: Record<SlideSection, string> = {
  intro: 'Intro',
  'dag-1': 'Dag 1',
  'dag-2': 'Dag 2',
  projekt: 'Projektkobling',
  afslutning: 'Afslutning',
};
