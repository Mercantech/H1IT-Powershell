export type LocalExercisePhase = 'dag-1' | 'dag-2' | 'projekt';
export type LocalEnvironment = 'pc' | 'driftsetup' | 'begge';

export interface LocalExercise {
  id: string;
  phase: LocalExercisePhase;
  title: string;
  environment: LocalEnvironment;
  tool: 'terminal' | 'vscode' | 'begge';
  /** Låst lab med præcis forventet deliverable — som sidste års formelle øvelser */
  locked?: boolean;
  description: string;
  steps: string[];
  deliverable: string;
  relatedLink: string;
}

export const environmentLabels: Record<LocalEnvironment, string> = {
  pc: 'Egen PC',
  driftsetup: 'Driftsetup / lab',
  begge: 'PC eller driftsetup',
};

export const toolLabels = {
  terminal: 'PowerShell-terminal',
  vscode: 'VS Code',
  begge: 'Terminal + VS Code',
} as const;

export const localExercises: LocalExercise[] = [
  {
    id: 'lok-1',
    phase: 'dag-1',
    title: 'Udforsk cmdlets med Get-Help',
    environment: 'pc',
    tool: 'terminal',
    description:
      'Åbn PowerShell på din PC og find selv cmdlets til at arbejde med filer og services.',
    steps: [
      'Åbn PowerShell 7 (eller Windows PowerShell) som terminal — ikke ISE.',
      'Kør Get-Command -Noun Service og notér 3 cmdlets du ikke kendte.',
      'Vælg én cmdlet og kør Get-Help <cmdlet> -Examples.',
      'Kør Get-ComputerInfo | Select-Object WindowsProductName, OsVersion.',
    ],
    deliverable: 'Skriv 3 cmdlets og én ting du lærte i notater — eller i jeres projektrapport.',
    relatedLink: '/dag-1#cmdlets',
  },
  {
    id: 'lok-2',
    phase: 'dag-1',
    title: 'Byg en pipeline på din PC',
    environment: 'pc',
    tool: 'terminal',
    description:
      'Øv pipeline på rigtige data fra din egen maskine — services og processer.',
    steps: [
      'Kør: Get-Service | Where-Object Status -eq "Stopped" | Select-Object Name, Status.',
      'Kør: Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU.',
      'Tilføj en variabel: $stopped = Get-Service | Where-Object Status -eq "Stopped".',
      'Vis antal: $stopped.Count.',
    ],
    deliverable: 'Gem kommandoerne du brugte — du skal bruge pipelinen igen i projektet.',
    relatedLink: '/dag-1#pipeline',
  },
  {
    id: 'lok-2b',
    phase: 'dag-1',
    title: 'Låst lab: Kun terminal — ingen File Explorer',
    locked: true,
    environment: 'pc',
    tool: 'terminal',
    description:
      'Navigér filsystemet udelukkende via PowerShell. File Explorer er ikke tilladt i denne øvelse.',
    steps: [
      'Start i din brugermappe: Get-Location.',
      'List indhold: Get-ChildItem (eller alias ls).',
      'Opret mappen C:\\Serverauto\\lab med New-Item -ItemType Directory -Force.',
      'Skift til mappen med Set-Location C:\\Serverauto\\lab.',
      'Opret filen noter.txt med "Hej fra pipeline" | Out-File noter.txt.',
      'Bekræft med Get-Content noter.txt.',
      'Brug Get-Help og Get-Command hvis du er i tvivl — ikke Google som første valg.',
    ],
    deliverable:
      'Screenshot eller transcript der viser hele sekvensen — fra Get-Location til Get-Content.',
    relatedLink: '/dag-1#cmdlets',
  },
  {
    id: 'lok-2c',
    phase: 'dag-1',
    title: 'Låst lab: 10 største filer i System32',
    locked: true,
    environment: 'pc',
    tool: 'terminal',
    description:
      'Brug pipeline til at finde de 10 største filer i C:\\Windows\\System32. Skriv -WhatIf er ikke relevant her — det er kun læsning.',
    steps: [
      'Kør: Get-ChildItem C:\\Windows\\System32 -File -ErrorAction SilentlyContinue.',
      'Pipe videre: Sort-Object Length -Descending.',
      'Vælg top 10: Select-Object -First 10 Name, @{N="MB";E={[math]::Round($_.Length/1MB,2)}}.',
      'Prøv Format-Table og Out-GridView for at sammenligne visning.',
      'Gem resultatet: ... | Export-Csv .\\top10-system32.csv -NoTypeInformation.',
    ],
    deliverable: 'top10-system32.csv med præcis 10 rækker + kommandoen du brugte.',
    relatedLink: '/dag-1#pipeline',
  },
  {
    id: 'lok-2d',
    phase: 'dag-1',
    title: 'Låst lab: Stoppede services til fil',
    locked: true,
    environment: 'pc',
    tool: 'vscode',
    description:
      'Kombinér Where-Object, Select-Object og Out-File — som i sidste års script-øvelse.',
    steps: [
      'Kør: Get-Service | Where-Object {$_.Status -eq "Stopped"} | Select-Object Name, DisplayName.',
      'Gem til fil: ... | Out-File C:\\Serverauto\\stoppede-services.txt.',
      'Gem samme som script stoppede-services.ps1 og kør det.',
      'Tjek Execution Policy med Get-ExecutionPolicy hvis scriptet blokeres.',
    ],
    deliverable: 'stoppede-services.ps1 + stoppede-services.txt der kører uden fejl.',
    relatedLink: '/dag-1#scriptlogik',
  },
  {
    id: 'lok-3',
    phase: 'dag-1',
    title: 'Opret dit første .ps1-script i VS Code',
    environment: 'pc',
    tool: 'vscode',
    description:
      'Når du går fra enkeltlinjer til scripts, er VS Code det rigtige værktøj.',
    steps: [
      'Opret en mappe f.eks. C:\\Serverauto eller i dit Git-repo.',
      'Åbn mappen i VS Code og opret filen intro.ps1.',
      'Installér PowerShell-extensionen i VS Code hvis du ikke har den.',
      'Skriv et script der viser dato, brugernavn og antal services der kører.',
      'Kør scriptet fra terminalen: .\\intro.ps1',
    ],
    deliverable: 'intro.ps1 der kører uden fejl. Commit til Git hvis du har et repo.',
    relatedLink: '/dag-1#variabler',
  },
  {
    id: 'lok-4',
    phase: 'dag-2',
    title: 'Test -WhatIf på en testfil',
    environment: 'pc',
    tool: 'terminal',
    description:
      'Øv sikker scripting lokalt før du kører noget i driftsetup.',
    steps: [
      'Opret en testmappe: New-Item -ItemType Directory -Path C:\\Temp\\Serverauto-Test -Force.',
      'Opret en testfil: "test" | Out-File C:\\Temp\\Serverauto-Test\\test.txt.',
      'Kør Remove-Item C:\\Temp\\Serverauto-Test\\test.txt -WhatIf — læg mærke til output.',
      'Kør uden -WhatIf og bekræft at filen er væk.',
      'Start-Transcript -Path C:\\Temp\\Serverauto-Test\\log.txt, kør en cmdlet, Stop-Transcript.',
    ],
    deliverable: 'Logfilen fra transcript — vis den for din makker eller gem til rapport.',
    relatedLink: '/dag-2#sikkerhed',
  },
  {
    id: 'lok-5',
    phase: 'dag-2',
    title: 'Eksporter og importer CSV',
    environment: 'pc',
    tool: 'vscode',
    description:
      'Simuler datahåndtering som i et AD-projekt med en lokal CSV-fil.',
    steps: [
      'Eksporter services: Get-Service | Select-Object Name, Status | Export-Csv .\\services.csv -NoTypeInformation.',
      'Åbn services.csv i VS Code og se strukturen (rækker/kolonner).',
      'Importer: $data = Import-Csv .\\services.csv.',
      'Filtrér: $data | Where-Object Status -eq "Running".',
      'Opret brugere.csv med kolonnerne Navn, Afdeling, Email (3 testbrugere).',
    ],
    deliverable: 'brugere.csv og én pipeline der filtrerer på Afdeling.',
    relatedLink: '/dag-2#data',
  },
  {
    id: 'lok-6',
    phase: 'dag-2',
    title: 'Hent systeminfo med CIM',
    environment: 'begge',
    tool: 'terminal',
    description:
      'Brug Get-CimInstance til at inventere en maskine — PC eller server i lab.',
    steps: [
      'Kør Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version.',
      'Kør Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, @{N="GB fri";E={[math]::Round($_.FreeSpace/1GB,1)}}.',
      'Gem output til CSV for brug i rapport.',
    ],
    deliverable: 'CSV med diskplads — kan indgå i dokumentation af jeres miljø.',
    relatedLink: '/dag-2#wbem',
  },
  {
    id: 'lok-7',
    phase: 'dag-2',
    title: 'Fjernadministration i driftsetup',
    environment: 'driftsetup',
    tool: 'terminal',
    description:
      'Kør Invoke-Command mod en member server i jeres lab — kræver WinRM og netværk.',
    steps: [
      'Bekræft at du kan ping\'e serveren fra din admin-PC.',
      'Kør Invoke-Command -ComputerName <SERVER> -ScriptBlock { hostname }.',
      'Kør Invoke-Command -ComputerName <SERVER> -ScriptBlock { Get-Service DNS, DHCP | Select Name, Status }.',
      'Dokumentér eventuelle fejl (adgang, WinRM, firewall).',
    ],
    deliverable: 'Output fra fjernkommando + kort note om hvad der skulle til for at det virkede.',
    relatedLink: '/dag-2#fjernadmin',
  },
  {
    id: 'lok-8',
    phase: 'projekt',
    title: 'Skriv et projektscript i VS Code',
    environment: 'driftsetup',
    tool: 'vscode',
    description:
      'Lav et script der løser en konkret opgave i jeres infrastrukturprojekt.',
    steps: [
      'Vælg én use case fra Projektkobling (fx serverrapport, DHCP-leases eller AD-grupper).',
      'Opret scripts\\<navn>.ps1 i jeres projektmappe / Git-repo.',
      'Skriv scriptet med kommentarer der forklarer cmdlets, flags og pipeline-valg.',
      'Test med -WhatIf først hvis scriptet ændrer noget.',
      'Kør i lab, gem output til rapporten og tjek mod vurderingskriterierne på Projektkobling.',
    ],
    deliverable:
      'Et .ps1-script i Git med kommentarer — klar til klassens gennemgang og fremlæggelse.',
    relatedLink: '/projekt',
  },
  {
    id: 'lok-9',
    phase: 'projekt',
    title: 'Dokumentér script i projektrapporten',
    environment: 'driftsetup',
    tool: 'begge',
    description:
      'Forbind jeres scripting til helhedsprojektet: krav → script → test → drift.',
    steps: [
      'Beskriv i rapporten: Hvilket krav fra casen løser scriptet?',
      'Indsæt kodeudsnit eller henvis til Git-repo.',
      'Forklar hvorfor PowerShell er bedre end GUI til netop denne opgave.',
      'Beskriv hvordan I testede med -WhatIf eller transcript.',
    ],
    deliverable: 'Afsnit i projektrapport om automatisering — med link til Git.',
    relatedLink: '/projekt#serverdrift',
  },
];

export function getLocalExercisesForPhase(phase: LocalExercisePhase): LocalExercise[] {
  return localExercises.filter((exercise) => exercise.phase === phase);
}
