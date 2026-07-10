export interface LearningGoal {
  id: number;
  text: string;
}

export const learningGoals: LearningGoal[] = [
  {
    id: 1,
    text: 'Anvende PowerShell til automatisering og fjernadministration af servere og klienter.',
  },
  {
    id: 2,
    text: 'Implementere sikkerheden korrekt i forbindelse med scripting i PowerShell.',
  },
  {
    id: 3,
    text: 'Anvende de grundlæggende cmdlets og forstå at bruge de indbyggede hjælpefunktioner.',
  },
  {
    id: 4,
    text: 'Anvende pipelinen i PowerShell.',
  },
  {
    id: 5,
    text: 'Anvende grundlæggende systemkald til WBEM (Web-Based Enterprise Management) funktioner.',
  },
  {
    id: 6,
    text: 'Anvende -WhatIf, -Confirm og -Transcript i PowerShell.',
  },
  {
    id: 7,
    text: 'Anvende aliases i PowerShell.',
  },
  {
    id: 8,
    text: 'Oprette og bruge variabler i PowerShell.',
  },
  {
    id: 9,
    text: 'Anvende datahåndtering op imod en database struktur.',
  },
];

export const goalModuleMap: Record<number, string[]> = {
  1: ['Dag 2 — Fjernadministration'],
  2: ['Dag 2 — Sikker scripting'],
  3: ['Dag 1 — Cmdlets og hjælp'],
  4: ['Dag 1 — Pipeline'],
  5: ['Dag 2 — WBEM/CIM'],
  6: ['Dag 2 — Sikker scripting'],
  7: ['Dag 1 — Variabler og aliases'],
  8: ['Dag 1 — Variabler og aliases'],
  9: ['Dag 2 — Datahåndtering'],
};
