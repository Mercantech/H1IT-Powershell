export const beginnerPlaylistId = 'PLnK11SQMNnE4vcvuAahz4KhNOS7zOfmB3';

export const beginnerPlaylistUrl = `https://www.youtube.com/playlist?list=${beginnerPlaylistId}`;

export type VideoDay = 'dag-1' | 'dag-2';

export interface CourseVideo {
  id: string;
  episode: number;
  title: string;
  summary: string;
  relatedDay: VideoDay;
}

export const beginnerVideos: CourseVideo[] = [
  {
    id: 'NECE5CX69tk',
    episode: 1,
    title: 'Fundamentals',
    summary:
      'Introduktion til PowerShell 7, terminalen og de grundlæggende begreber. God start før Dag 1.',
    relatedDay: 'dag-1',
  },
  {
    id: 'I-UIXcXhvcY',
    episode: 2,
    title: 'Variables',
    summary: 'Variabler, typer og tildeling — supplerer variabel-modulet på Dag 1.',
    relatedDay: 'dag-1',
  },
  {
    id: 'kpYCCs_sgW4',
    episode: 3,
    title: 'Arrays',
    summary: 'Arbejd med lister af data og indeksering i arrays.',
    relatedDay: 'dag-1',
  },
  {
    id: 'rxafOc0tA_o',
    episode: 4,
    title: 'Hashtables',
    summary: 'Nøgle-værdi-strukturer til opslag og struktureret data.',
    relatedDay: 'dag-1',
  },
  {
    id: 'IAta2emKMvU',
    episode: 5,
    title: 'Pipeline',
    summary: 'Send output mellem cmdlets — direkte kobling til pipeline-øvelserne på Dag 1.',
    relatedDay: 'dag-1',
  },
  {
    id: 'kd8iNjUbJZc',
    episode: 6,
    title: 'If, Else og ElseIf',
    summary: 'Betingelser og forgrening i scripts.',
    relatedDay: 'dag-1',
  },
  {
    id: 'nsRcfy9dlYY',
    episode: 7,
    title: 'Switch',
    summary: 'Mange valg med switch i stedet for lange if-kæder.',
    relatedDay: 'dag-1',
  },
  {
    id: 'bOWucOWCjKA',
    episode: 8,
    title: 'ForEach',
    summary: 'Gentag handlinger for hvert element i en samling.',
    relatedDay: 'dag-1',
  },
  {
    id: 'h4XG-etlWuI',
    episode: 9,
    title: 'For og Do',
    summary: 'Løkker til gentagne opgaver og tællere.',
    relatedDay: 'dag-1',
  },
  {
    id: '6iGSKCdPCjY',
    episode: 10,
    title: 'Error handling',
    summary: 'Try, catch og fejlhåndtering — relevant til sikker scripting på Dag 2.',
    relatedDay: 'dag-2',
  },
  {
    id: 'CsvgbpddM3o',
    episode: 11,
    title: 'Modules',
    summary: 'Importér og brug moduler til at udvide PowerShell.',
    relatedDay: 'dag-2',
  },
];

export const dayLabels: Record<VideoDay, string> = {
  'dag-1': 'Dag 1',
  'dag-2': 'Dag 2',
};
