export type LocalExercisePhase = 'dag-1' | 'dag-2' | 'projekt';
export type LocalEnvironment = 'pc' | 'driftsetup' | 'begge';

export interface LocalExercise {
  id: string;
  phase: LocalExercisePhase;
  title: string;
  environment: LocalEnvironment;
  tool: 'terminal' | 'vscode' | 'begge';
  description: string;
  steps: string[];
  deliverable: string;
  relatedLink: string;
}

export const phaseLabels: Record<LocalExercisePhase, string> = {
  'dag-1': 'Efter Dag 1',
  'dag-2': 'Efter Dag 2',
  projekt: 'I jeres infrastrukturprojekt',
};

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
      'Vælg én opgave fra Projektkobling (fx tjek DNS/DHCP, eksportér service-status).',
      'Opret scripts\\<navn>.ps1 i jeres projektmappe / Git-repo.',
      'Skriv scriptet med kommentarer der forklarer hvert trin.',
      'Test med -WhatIf først hvis scriptet ændrer noget.',
      'Kør i lab og gem output til rapporten.',
    ],
    deliverable: 'Et .ps1-script i Git med README eller kommentarer — klar til fremlæggelse.',
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
