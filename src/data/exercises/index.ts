import type { CodeExerciseData } from './types';

export const dag1Exercises: CodeExerciseData[] = [
  {
    id: 'd1-e1',
    prompt: 'Skriv en kommando der viser alle processer hvis navn starter med "s".',
    hint: 'Brug Get-Process med -Name og wildcard (*)',
    acceptedAnswers: ['Get-Process -Name s*', 'Get-Process s*'],
    usePattern: true,
    patterns: [/^Get-Process\s+(-Name\s+)?s\*$/i],
    explanation: 'Get-Process -Name s* bruger wildcard til at filtrere processnavne.',
  },
  {
    id: 'd1-e2',
    prompt: 'Skriv en pipeline der henter alle services og viser kun dem med status "Running".',
    hint: 'Get-Service | Where-Object { $_.Status -eq "Running" }',
    acceptedAnswers: [
      'Get-Service | Where-Object { $_.Status -eq "Running" }',
      'Get-Service | Where-Object Status -eq Running',
    ],
    usePattern: true,
    patterns: [
      /^Get-Service\s*\|\s*Where-Object.*Running/i,
    ],
    explanation: 'Pipeline kæder Get-Service med Where-Object til at filtrere på status.',
  },
  {
    id: 'd1-e3',
    prompt: 'Opret en variabel $server der indeholder teksten "DC01" og vis den.',
    hint: 'Tildel med = og skriv variabelnavnet for at vise indholdet',
    acceptedAnswers: ['$server = "DC01"; $server', '$server = "DC01"\n$server'],
    usePattern: true,
    patterns: [/\$server\s*=\s*["']DC01["']/i],
    explanation: 'Variabler oprettes med $navn = værdi. PowerShell viser værdien når du skriver variabelnavnet.',
  },
];

export const dag2Exercises: CodeExerciseData[] = [
  {
    id: 'd2-e1',
    prompt: 'Tilføj -WhatIf til denne kommando: Remove-Item C:\\Temp\\old.log',
    acceptedAnswers: ['Remove-Item C:\\Temp\\old.log -WhatIf', 'Remove-Item -Path C:\\Temp\\old.log -WhatIf'],
    usePattern: true,
    patterns: [/Remove-Item.*-WhatIf/i],
    explanation: '-WhatIf viser hvad der ville ske uden at slette filen.',
  },
  {
    id: 'd2-e2',
    prompt: 'Skriv en kommando der eksporterer alle services til en CSV-fil kaldet services.csv',
    hint: 'Get-Service | Export-Csv',
    acceptedAnswers: [
      'Get-Service | Export-Csv services.csv',
      'Get-Service | Export-Csv -Path services.csv',
    ],
    usePattern: true,
    patterns: [/Get-Service\s*\|\s*Export-Csv.*services\.csv/i],
    explanation: 'Export-Csv gemmer pipeline-output som en CSV-fil — nyttigt til rapporter.',
  },
  {
    id: 'd2-e3',
    prompt: 'Skriv en kommando der henter information om det lokale operativsystem via CIM.',
    hint: 'Get-CimInstance med Win32_OperatingSystem',
    acceptedAnswers: [
      'Get-CimInstance Win32_OperatingSystem',
      'Get-CimInstance -ClassName Win32_OperatingSystem',
    ],
    usePattern: true,
    patterns: [/Get-CimInstance.*Win32_OperatingSystem/i],
    explanation: 'Get-CimInstance er standardmetoden til WBEM-forespørgsler i moderne PowerShell.',
  },
  {
    id: 'd2-e4',
    prompt: 'Skriv en kommando der importerer brugere fra brugere.csv',
    acceptedAnswers: [
      'Import-Csv brugere.csv',
      'Import-Csv -Path brugere.csv',
    ],
    usePattern: true,
    patterns: [/Import-Csv.*brugere\.csv/i],
    explanation: 'Import-Csv læser CSV-data som objekter — klar til pipeline og videre behandling.',
  },
];

export const projectExercise: CodeExerciseData = {
  id: 'proj-e1',
  prompt: 'Skriv en pipeline der tjekker om DNS- og DHCP-services kører (vis Name og Status).',
  hint: 'Get-Service med -Name og filtrer på DNS og DHCP',
  acceptedAnswers: [
    'Get-Service -Name DNS,DHCP | Select-Object Name, Status',
    'Get-Service DNS,DHCP | Select-Object Name, Status',
  ],
  usePattern: true,
  patterns: [
    /Get-Service.*DNS.*DHCP.*Select-Object.*Name.*Status/i,
    /Get-Service.*DNS.*DHCP.*Select.*Name.*Status/i,
  ],
  explanation: 'I jeres infrastrukturprojekt kan I bruge denne type tjek til at verificere at kritiske services kører på DC.',
};
