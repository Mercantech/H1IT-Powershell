import type { QuizQuestion } from './types';

export const dag1Quiz: QuizQuestion[] = [
  {
    id: 'd1-q1',
    type: 'multiple',
    question: 'Hvilken cmdlet bruger du til at få hjælp til en anden cmdlet?',
    options: ['Get-Command', 'Get-Help', 'Get-Member', 'Get-Process'],
    correctAnswer: 'Get-Help',
    explanation: 'Get-Help viser dokumentation, syntaks og eksempler for cmdlets.',
  },
  {
    id: 'd1-q2',
    type: 'boolean',
    question: 'Pipeline-operatoren (|) sender output fra én cmdlet videre som input til næste.',
    correctAnswer: true,
    explanation: 'Pipelinen er en af PowerShells stærkeste funktioner — den kæder cmdlets sammen.',
  },
  {
    id: 'd1-q3',
    type: 'multiple',
    question: 'Hvad starter alle variabelnavne med i PowerShell?',
    options: ['@', '#', '$', '%'],
    correctAnswer: '$',
    explanation: 'Variabler i PowerShell præfixes med $, f.eks. $brugernavn.',
  },
  {
    id: 'd1-q4',
    type: 'boolean',
    question: 'Et alias er det samme som en funktion — begge kan have kompleks logik.',
    correctAnswer: false,
    explanation: 'Et alias er kun et alternativt navn for en cmdlet. Funktioner kan indeholde egen logik.',
  },
];
