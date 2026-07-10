import type { QuizQuestion } from './types';

export const dag2Quiz: QuizQuestion[] = [
  {
    id: 'd2-q1',
    type: 'multiple',
    question: 'Hvilken parameter viser hvad en cmdlet VILLE gøre uden at udføre det?',
    options: ['-Confirm', '-Verbose', '-WhatIf', '-Transcript'],
    correctAnswer: '-WhatIf',
    explanation: '-WhatIf simulerer handlingen — perfekt til at teste scripts sikkert.',
  },
  {
    id: 'd2-q2',
    type: 'boolean',
    question: 'Get-CimInstance er den moderne erstatning for WMI-cmdlets som Get-WmiObject.',
    correctAnswer: true,
    explanation: 'CIM (Common Information Model) er standarden for WBEM-systemkald i moderne PowerShell.',
  },
  {
    id: 'd2-q3',
    type: 'multiple',
    question: 'Hvilken cmdlet bruger du til at køre kommandoer på en fjernserver?',
    options: ['Enter-PSSession', 'Invoke-Command', 'Start-Process', 'Send-MailMessage'],
    correctAnswer: 'Invoke-Command',
    explanation: 'Invoke-Command kører scriptblocks på fjerncomputere. Enter-PSSession åbner en interaktiv session.',
  },
  {
    id: 'd2-q4',
    type: 'boolean',
    question: 'Import-Csv kan bruges til at læse data fra en CSV-fil — ligesom en database-tabel med rækker og kolonner.',
    correctAnswer: true,
    explanation: 'CSV-filer kan behandles som tabeller med Select-Object, Where-Object osv.',
  },
  {
    id: 'd2-q5',
    type: 'multiple',
    question: 'Hvad gør Start-Transcript?',
    options: [
      'Starter en fjernsession',
      'Logger al konsol-output til en fil',
      'Kører et script i baggrunden',
      'Eksporterer data til CSV',
    ],
    correctAnswer: 'Logger al konsol-output til en fil',
    explanation: 'Transcripts er vigtige til dokumentation og audit — især i driftsmiljøer.',
  },
];
