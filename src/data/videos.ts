export const beginnerPlaylistId = 'PLnK11SQMNnE4vcvuAahz4KhNOS7zOfmB3';

export const beginnerPlaylistUrl = `https://www.youtube.com/playlist?list=${beginnerPlaylistId}`;

export type VideoModule =
  | 'intro'
  | 'pipeline'
  | 'variabler'
  | 'scriptlogik'
  | 'sikkerhed'
  | 'data';

export interface CourseVideo {
  id: string;
  episode: number;
  title: string;
  summary: string;
  module: VideoModule;
}

export const beginnerVideos: CourseVideo[] = [
  {
    id: 'NECE5CX69tk',
    episode: 1,
    title: 'Fundamentals',
    summary: 'Introduktion til PowerShell 7, terminalen og grundlæggende begreber.',
    module: 'intro',
  },
  {
    id: 'I-UIXcXhvcY',
    episode: 2,
    title: 'Variables',
    summary: 'Variabler, typer og tildeling.',
    module: 'variabler',
  },
  {
    id: 'kpYCCs_sgW4',
    episode: 3,
    title: 'Arrays',
    summary: 'Arbejd med lister af data og indeksering.',
    module: 'variabler',
  },
  {
    id: 'rxafOc0tA_o',
    episode: 4,
    title: 'Hashtables',
    summary: 'Nøgle-værdi-strukturer til opslag og struktureret data.',
    module: 'variabler',
  },
  {
    id: 'IAta2emKMvU',
    episode: 5,
    title: 'Pipeline',
    summary: 'Send output mellem cmdlets via pipelinen.',
    module: 'pipeline',
  },
  {
    id: 'kd8iNjUbJZc',
    episode: 6,
    title: 'If, Else og ElseIf',
    summary: 'Betingelser og forgrening i scripts.',
    module: 'scriptlogik',
  },
  {
    id: 'nsRcfy9dlYY',
    episode: 7,
    title: 'Switch',
    summary: 'Mange valg med switch i stedet for lange if-kæder.',
    module: 'scriptlogik',
  },
  {
    id: 'bOWucOWCjKA',
    episode: 8,
    title: 'ForEach',
    summary: 'Gentag handlinger for hvert element i en samling.',
    module: 'scriptlogik',
  },
  {
    id: 'h4XG-etlWuI',
    episode: 9,
    title: 'For og Do',
    summary: 'Løkker til gentagne opgaver og tællere.',
    module: 'scriptlogik',
  },
  {
    id: '6iGSKCdPCjY',
    episode: 10,
    title: 'Error handling',
    summary: 'Try, catch og fejlhåndtering i scripts.',
    module: 'sikkerhed',
  },
  {
    id: 'CsvgbpddM3o',
    episode: 11,
    title: 'Modules',
    summary: 'Importér og brug moduler til at udvide PowerShell.',
    module: 'data',
  },
];

export function getVideosForModule(module: VideoModule): CourseVideo[] {
  return beginnerVideos.filter((video) => video.module === module);
}
