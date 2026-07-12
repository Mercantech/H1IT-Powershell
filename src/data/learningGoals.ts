export interface CoreLearningGoal {
  id: number;
  title: string;
  summary: string;
  bullets: string[];
}

/** De 9 officielle målpinde fra pensum */
export interface GoalPin {
  id: number;
  text: string;
  coreGoalId: number;
}

export const coreLearningGoals: CoreLearningGoal[] = [
  {
    id: 1,
    title: 'Forstå PowerShell-grundlaget',
    summary:
      'Du kan læse, skrive og forstå grundlæggende PowerShell — ikke bare kopiere kommandoer.',
    bullets: [
      'Finde og bruge cmdlets med Get-Help og Get-Command',
      'Sende data gennem pipelinen (|)',
      'Gemme data i variabler og bruge aliases',
    ],
  },
  {
    id: 2,
    title: 'Arbejd sikkert med servere og data',
    summary:
      'Du kan scripte uden at ødelægge noget — og hente/administrere information fra rigtige miljøer.',
    bullets: [
      'Teste med -WhatIf, -Confirm og logge med transcript',
      'Fjernadministrere servere (Invoke-Command)',
      'Hente systeminfo via WBEM/CIM',
      'Importere, filtrere og eksportere CSV-data',
    ],
  },
  {
    id: 3,
    title: 'Lever scripting i jeres infrastrukturprojekt',
    summary:
      'Du kan koble det, I lærer, direkte på H1-projektet — fra script til rapport.',
    bullets: [
      'Vælge hvornår script slår GUI',
      'Skrive og teste scripts til AD, DNS, backup, drift osv.',
      'Dokumentere og planlægge kørsel (Task Scheduler, Git)',
    ],
  },
];

export const goalPins: GoalPin[] = [
  {
    id: 1,
    text: 'Anvende PowerShell til automatisering og fjernadministration af servere og klienter.',
    coreGoalId: 2,
  },
  {
    id: 2,
    text: 'Implementere sikkerheden korrekt i forbindelse med scripting i PowerShell.',
    coreGoalId: 2,
  },
  {
    id: 3,
    text: 'Anvende de grundlæggende cmdlets og forstå at bruge de indbyggede hjælpefunktioner.',
    coreGoalId: 1,
  },
  {
    id: 4,
    text: 'Anvende pipelinen i PowerShell.',
    coreGoalId: 1,
  },
  {
    id: 5,
    text: 'Anvende grundlæggende systemkald til WBEM (Web-Based Enterprise Management) funktioner.',
    coreGoalId: 2,
  },
  {
    id: 6,
    text: 'Anvende -WhatIf, -Confirm og -Transcript i PowerShell.',
    coreGoalId: 2,
  },
  {
    id: 7,
    text: 'Anvende aliases i PowerShell.',
    coreGoalId: 1,
  },
  {
    id: 8,
    text: 'Oprette og bruge variabler i PowerShell.',
    coreGoalId: 1,
  },
  {
    id: 9,
    text: 'Anvende datahåndtering op imod en database struktur.',
    coreGoalId: 2,
  },
];

/** @deprecated Brug goalPins — beholdt for bagudkompatibilitet */
export const learningGoals = goalPins.map((pin) => ({
  id: pin.id,
  text: pin.text,
}));

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

export function getPinsForCoreGoal(coreGoalId: number): GoalPin[] {
  return goalPins.filter((pin) => pin.coreGoalId === coreGoalId);
}
