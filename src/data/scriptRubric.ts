export interface RubricRow {
  criterion: string;
  good: string;
  poor: string;
}

/** Vurderingskriterier fra sidste års script-opgave — brug ved fremlæggelse og peer review. */
export const scriptRubric: RubricRow[] = [
  {
    criterion: 'Virker scriptet?',
    good: 'Kører uden fejl i testmiljøet og producerer korrekt output',
    poor: 'Fejler ved kørsel eller output matcher ikke opgaven',
  },
  {
    criterion: 'Pipeline',
    good: 'Data flyder naturligt fra cmdlet til cmdlet — få unødvendige mellemvariabler',
    poor: 'Alt gemmes i variabler uden grund, eller pipelinen bruges forkert',
  },
  {
    criterion: 'Forklaring',
    good: 'Hvert cmdlet og vigtigt flag er forklaret i kommentarer — ikke bare "opretter en bruger"',
    poor: 'Generelle beskrivelser uden at nævne hvad cmdlets og parametre gør',
  },
  {
    criterion: 'Læsbarhed',
    good: 'Meningsfulde variabelnavne, logisk struktur, én handling per blok',
    poor: 'Alt på én linje, uforståelige forkortelser, ingen struktur',
  },
  {
    criterion: 'Sikkerhed',
    good: '-WhatIf ved første test, passwords håndteres korrekt, transcript ved ændringer',
    poor: 'Scripts ændrer produktion uden test eller bekræftelse',
  },
];

export const scriptDeliverableChecklist = [
  'Scriptet ligger i Git under scripts/ med beskrivende filnavn',
  'Kommentarer forklarer cmdlets, flags og pipeline-valg',
  'Første testkørsel med -WhatIf (hvis scriptet ændrer noget)',
  'Start-Transcript eller logfil ved kørsel i lab',
  'Output eksporteret (CSV/tekst) som dokumentation i rapporten',
  'Kort afsnit i rapport: hvilket krav løser scriptet, og hvorfor PowerShell frem for GUI?',
];
