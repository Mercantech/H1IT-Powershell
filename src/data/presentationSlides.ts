export type SlideLayout = 'title' | 'section' | 'bullets' | 'code' | 'highlight';

export type SlideSection = 'intro' | 'dag-1' | 'dag-2' | 'projekt' | 'afslutning';

export interface PresentationSlide {
  id: string;
  layout: SlideLayout;
  section: SlideSection;
  title: string;
  subtitle?: string;
  bullets?: string[];
  code?: string;
  highlight?: string;
}

export const presentationSlides: PresentationSlide[] = [
  {
    id: 'title',
    layout: 'title',
    section: 'intro',
    title: 'Serverautomatisering I',
    subtitle: 'PowerShell · 16862 · H1 IT / Infrastruktur og Cyber',
    highlight: 'Uge 37–38 · Koblet på infrastrukturprojekt',
  },
  {
    id: 'intro-mal',
    layout: 'bullets',
    section: 'intro',
    title: 'Hvad skal I kunne?',
    bullets: [
      'Automatisere og fjernadministrere servere med PowerShell',
      'Scripte sikkert med -WhatIf, -Confirm og transcript',
      'Bruge cmdlets, pipeline, variabler og aliases',
      'Hente systeminfo via WBEM/CIM og håndtere CSV-data',
      'Koble scripting på jeres H1-infrastrukturprojekt',
    ],
  },
  {
    id: 'intro-forlob',
    layout: 'bullets',
    section: 'intro',
    title: 'Undervisningsforløb',
    bullets: [
      'Dag 1 (uge 37): Cmdlets, pipeline, variabler',
      'Dag 2 (uge 38): Sikkerhed, fjernadmin, WBEM, data',
      'Projektkobling: AD, DNS, DHCP, backup, netværk, drift',
      'Lokale opgaver og øvelser på sitet — øv i lab bagefter',
    ],
  },
  {
    id: 'intro-gui',
    layout: 'highlight',
    section: 'intro',
    title: 'Shell vs. GUI',
    highlight: 'GUI til engangsopgaver · PowerShell når opgaver gentages, skal dokumenteres eller køres på mange servere.',
  },
  {
    id: 'dag1-section',
    layout: 'section',
    section: 'dag-1',
    title: 'Dag 1',
    subtitle: 'Grundlæggende PowerShell',
  },
  {
    id: 'dag1-intro',
    layout: 'bullets',
    section: 'dag-1',
    title: 'Introduktion',
    bullets: [
      'PowerShell = kommandolinje + scripting til Windows-administration',
      'Cmdlet-mønster: Verb-Noun (Get-Service, New-Item)',
      'Objekter i pipelinen — ikke bare tekst som i cmd',
      'PS C:\\Serverauto> — jeres arbejdsmappe i lab',
    ],
  },
  {
    id: 'dag1-cmdlets',
    layout: 'code',
    section: 'dag-1',
    title: 'Cmdlets og hjælp',
    code: `Get-Help Get-Service -Examples
Get-Command -Noun Service
Get-Command -Verb Get | Select-Object -First 5`,
    bullets: ['Get-Help — dokumentation', 'Get-Command — find cmdlets', 'Get-Member — se objektets egenskaber'],
  },
  {
    id: 'dag1-pipeline',
    layout: 'code',
    section: 'dag-1',
    title: 'Pipeline',
    highlight: 'Output fra én cmdlet sendes videre som input til næste med |',
    code: `Get-Service |
  Where-Object { $_.Status -eq "Stopped" } |
  Select-Object Name, Status`,
  },
  {
    id: 'dag1-variabler',
    layout: 'code',
    section: 'dag-1',
    title: 'Variabler og aliases',
    code: `$server = "DC01"
$services = Get-Service | Where-Object Status -eq "Running"
$services.Count

Set-Alias -Name svc -Value Get-Service
svc`,
    bullets: ['Alias = kun andet navn — ingen ekstra logik', 'Brug funktioner til genbrugelig kode'],
  },
  {
    id: 'dag1-oevelser',
    layout: 'bullets',
    section: 'dag-1',
    title: 'Dag 1 — øv det af',
    bullets: [
      'Interaktive kodeøvelser og quiz på sitet',
      'Lokale opgaver: Get-Help på PC, pipeline, intro.ps1 i VS Code',
      'Supplerende videoer under hvert modul',
      'Git anbefales til alle scripts',
    ],
  },
  {
    id: 'dag2-section',
    layout: 'section',
    section: 'dag-2',
    title: 'Dag 2',
    subtitle: 'Sikkerhed og anvendelse',
  },
  {
    id: 'dag2-sikkerhed',
    layout: 'code',
    section: 'dag-2',
    title: 'Sikker scripting',
    code: `Remove-Item C:\\Temp\\old.log -WhatIf
Remove-Item C:\\Temp\\old.log -Confirm

Start-Transcript -Path C:\\Logs\\session.log
Get-Service
Stop-Transcript`,
    bullets: ['-WhatIf viser hvad der ville ske', '-Confirm beder om OK', 'Transcript = log til rapport'],
  },
  {
    id: 'dag2-fjernadmin',
    layout: 'code',
    section: 'dag-2',
    title: 'Fjernadministration',
    code: `$servere = "SRV01", "SRV02", "SRV03"
Invoke-Command -ComputerName $servere -ScriptBlock {
    Get-Service | Where-Object Status -eq "Stopped"
}

Enter-PSSession -ComputerName SRV01`,
    highlight: 'Administrér mange servere uden RDP — kræver WinRM',
  },
  {
    id: 'dag2-wbem',
    layout: 'code',
    section: 'dag-2',
    title: 'WBEM / CIM',
    code: `Get-CimInstance Win32_OperatingSystem |
  Select-Object Caption, Version

Get-CimInstance Win32_LogicalDisk |
  Select-Object DeviceID, Size, FreeSpace`,
    bullets: ['Moderne erstatning for WMI-cmdlets', 'Inventér maskiner til dokumentation'],
  },
  {
    id: 'dag2-data',
    layout: 'code',
    section: 'dag-2',
    title: 'Datahåndtering',
    code: `$brugere = Import-Csv .\\brugere.csv
$brugere | Where-Object Afdeling -eq "IT"

Get-Service |
  Select-Object Name, Status |
  Export-Csv .\\services.csv`,
    bullets: ['Import-Csv ≈ SELECT *', 'Where-Object ≈ WHERE', 'Select-Object ≈ SELECT kolonner'],
  },
  {
    id: 'dag2-oevelser',
    layout: 'bullets',
    section: 'dag-2',
    title: 'Dag 2 — øv det af',
    bullets: [
      'Test -WhatIf og transcript på din PC',
      'Eksportér og filtrér CSV i VS Code',
      'CIM-inventar og Invoke-Command i driftsetup',
    ],
  },
  {
    id: 'projekt-section',
    layout: 'section',
    section: 'projekt',
    title: 'Projektkobling',
    subtitle: 'Fra teori til infrastrukturprojekt',
  },
  {
    id: 'projekt-flow',
    layout: 'bullets',
    section: 'projekt',
    title: 'Fra krav til fremlæggelse',
    bullets: [
      '1. Læs krav fra case — find gentagne opgaver',
      '2. Skriv PowerShell-script i VS Code',
      '3. Test med -WhatIf og i pilotmiljø',
      '4. Kør i projektmiljø og log output',
      '5. Dokumentér i rapport og præsentér',
    ],
  },
  {
    id: 'projekt-usecases',
    layout: 'bullets',
    section: 'projekt',
    title: 'Use cases i projektet',
    bullets: [
      'AD — bulk-brugere fra CSV, GPO-status',
      'DNS/DHCP — service-tjek og zone-eksport',
      'Backup — job-status og transcript',
      'Netværk — IP/VLAN-dokumentation',
      'Serverdrift — Invoke-Command på member servers',
    ],
  },
  {
    id: 'projekt-deploy',
    layout: 'bullets',
    section: 'projekt',
    title: 'Deployment i drift',
    bullets: [
      'Windows Task Scheduler — planlagt kørsel (som cron)',
      'Dedikeret servicekonto med mindst mulige rettigheder',
      'Scripts i Git — versionsstyring og review',
      'Logfiler til projektrapport og incident-håndtering',
    ],
  },
  {
    id: 'projekt-gui',
    layout: 'highlight',
    section: 'projekt',
    title: 'Hvornår GUI vs. script?',
    highlight: '50 brugere i AD? Script. Engangsopgave på én server? GUI kan være fint. Dokumentation til rapport? Script + Export-Csv slår screenshots.',
  },
  {
    id: 'afslutning',
    layout: 'title',
    section: 'afslutning',
    title: 'Spørgsmål?',
    subtitle: 'Øv på sitet · Lokale opgaver · Projektkobling',
    highlight: 'Tryk Esc for at afslutte præsentationen',
  },
];

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
