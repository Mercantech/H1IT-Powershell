import { practicalGlossaryEntries } from './glossaryPractical';

export interface GlossaryEntry {
  id: string;
  term: string;
  category: 'grundlæggende' | 'sikkerhed' | 'fjernadministration' | 'data' | 'wbem' | 'scripts' | 'filer' | 'server';
  summary: string;
  detail: string;
  example?: string;
  relatedLink?: string;
  keywords?: string[];
  advanced?: boolean;
  pitfall?: string;
  requires?: string;
  docsUrl?: string;
}

export const glossaryCategories: Record<GlossaryEntry['category'], string> = {
  grundlæggende: 'Grundlæggende',
  sikkerhed: 'Sikkerhed',
  fjernadministration: 'Fjernadministration',
  data: 'Datahåndtering',
  wbem: 'WBEM / CIM',
  scripts: 'Scriptlogik',
  filer: 'Filer og stier',
  server: 'Server og AD',
};

export const glossaryEntries: GlossaryEntry[] = [
  {
    id: 'cmdlet',
    term: 'Cmdlet',
    category: 'grundlæggende',
    summary: 'En indbygget PowerShell-kommando med verb-substantiv-navngivning.',
    detail:
      'Cmdlets er de grundlæggende byggeklodser i PowerShell. De følger mønsteret Verb-Substantiv, f.eks. Get-Service, Set-Location eller New-ADUser. De er designet til at arbejde sammen via pipelinen.',
    example: 'Get-Service -Name Spooler',
    requires: 'Windows med Print Spooler-servicen.',
    relatedLink: '/dag-1#cmdlets',
    keywords: ['kommando', 'command'],
  },
  {
    id: 'pipeline',
    term: 'Pipeline',
    category: 'grundlæggende',
    summary: 'Kæder cmdlets sammen med | så output sendes videre som input.',
    detail:
      'Pipeline-operatoren (|) sender resultatet fra én cmdlet videre til næste. Det gør det muligt at filtrere, sortere og transformere data i én kommando — uden mellemvariabler.',
    example: 'Get-Service | Where-Object Status -eq "Running" | Select-Object Name',
    relatedLink: '/dag-1#pipeline',
    keywords: ['pipe', '|'],
  },
  {
    id: 'get-help',
    term: 'Get-Help',
    category: 'grundlæggende',
    summary: 'Viser dokumentation og eksempler for cmdlets.',
    detail:
      'Get-Help er din indbyggede manual. Brug -Examples for praktiske eksempler, -Full for al dokumentation, eller -Online for Microsofts webdokumentation.',
    example: 'Get-Help Get-Service -Examples',
    relatedLink: '/dag-1#cmdlets',
    keywords: ['hjælp', 'help', 'dokumentation'],
  },
  {
    id: 'get-command',
    term: 'Get-Command',
    category: 'grundlæggende',
    summary: 'Finder cmdlets, funktioner og aliases på systemet.',
    detail:
      'Brug Get-Command når du ved hvad du vil gøre, men ikke hvilken cmdlet der hedder det. Filtrér på -Verb (f.eks. Get) eller -Noun (f.eks. Service).',
    example: 'Get-Command -Noun Process',
    relatedLink: '/dag-1#cmdlets',
    keywords: ['find kommando', 'søg'],
  },
  {
    id: 'get-member',
    term: 'Get-Member',
    category: 'grundlæggende',
    summary: 'Viser egenskaber og metoder på et objekt.',
    detail:
      'Når du ikke ved hvilke felter et objekt har, pipeliner du det til Get-Member (alias: gm). Nyttigt til at opdage hvad du kan filtrere med i Where-Object.',
    example: 'Get-Service | Get-Member',
    relatedLink: '/dag-1#pipeline',
    keywords: ['gm', 'member', 'egenskaber'],
  },
  {
    id: 'variabel',
    term: 'Variabel',
    category: 'grundlæggende',
    summary: 'Gemmer data midlertidigt med $ foran navnet.',
    detail:
      'Variabler oprettes med $navn = værdi. De kan holde tekst, tal, objekter eller hele lister fra pipelinen. Bruges til at genbruge data og gøre scripts læsbare.',
    example: '$server = "DC01"\n$services = Get-Service',
    relatedLink: '/dag-1#variabler',
    keywords: ['$', 'variable'],
  },
  {
    id: 'alias',
    term: 'Alias',
    category: 'grundlæggende',
    summary: 'Et kort alternativt navn for en cmdlet.',
    detail:
      'Et alias er kun et andet navn — ikke en funktion med egen logik. Eksempler: ls (Get-ChildItem), dir, gc (Get-Content). Du kan oprette egne med Set-Alias.',
    example: 'Set-Alias -Name svc -Value Get-Service',
    relatedLink: '/dag-1#variabler',
    keywords: ['forkortelse', 'navn'],
  },
  {
    id: 'where-object',
    term: 'Where-Object',
    category: 'grundlæggende',
    summary: 'Filtrerer objekter i pipelinen (som SQL WHERE).',
    detail:
      'Where-Object (alias: ?) vælger kun objekter der matcher en betingelse. Bruges konstant sammen med Get-* cmdlets til at finde præcis det du leder efter.',
    example: 'Get-Process | Where-Object { $_.CPU -gt 100 }',
    relatedLink: '/dag-1#pipeline',
    keywords: ['filter', 'where', '?'],
  },
  {
    id: 'select-object',
    term: 'Select-Object',
    category: 'grundlæggende',
    summary: 'Vælger bestemte egenskaber (som SQL SELECT).',
    detail:
      'Select-Object (alias: select) viser kun de kolonner/egenskaber du angiver. Kan også bruges til at vælge de første N objekter med -First.',
    example: 'Get-Service | Select-Object Name, Status',
    relatedLink: '/dag-1#pipeline',
    keywords: ['select', 'kolonner'],
  },
  {
    id: 'whatif',
    term: '-WhatIf',
    category: 'sikkerhed',
    summary: 'Viser planlagte ændringer i kommandoer, der understøtter ShouldProcess.',
    detail:
      'WhatIf springer de ændringer over, som kommandoen har beskyttet med ShouldProcess. Brug det til at kontrollere mål og handling før kørsel. Det er ikke en fuld simulering af resultatet eller en garanti for, at et helt script er uden sideeffekter.',
    docsUrl: 'https://learn.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-shouldprocess',
    example: 'Remove-Item C:\\Temp\\old.log -WhatIf',
    relatedLink: '/dag-2#sikkerhed',
    keywords: ['what-if', 'what if', 'simulering', 'test'],
  },
  {
    id: 'confirm',
    term: '-Confirm',
    category: 'sikkerhed',
    summary: 'Beder om bekræftelse før en understøttet handling udføres.',
    detail:
      'Confirm pauser kommandoen og spørger "Er du sikker?" før den kører. Godt til destruktive handlinger som sletning af filer eller AD-objekter.',
    example: 'Remove-ADUser -Identity "testbruger" -Confirm',
    requires: 'ActiveDirectory-modulet og rettighed til at slette den angivne lab-bruger. Bekræfter du, slettes brugeren.',
    relatedLink: '/dag-2#sikkerhed',
    keywords: ['bekræftelse', 'confirmation'],
  },
  {
    id: 'transcript',
    term: 'Start-Transcript',
    category: 'sikkerhed',
    summary: 'Gemmer en tekstregistrering af sessionens kommandoer og konsoloutput.',
    detail:
      'Transcripts dokumenterer hvad du har kørt — vigtigt til audit, fejlfinding og jeres projektrapport. Husk Stop-Transcript når du er færdig.',
    example: "$log = Join-Path $env:TEMP ('lab-session-{0}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'))\nStart-Transcript -Path $log\ntry {\n    Get-Service\n} finally {\n    Stop-Transcript\n}",
    pitfall: 'Skriv ikke adgangskoder eller andre hemmeligheder til konsollen, mens der logges.',
    relatedLink: '/dag-2#sikkerhed',
    keywords: ['log', 'dokumentation', 'transcript'],
  },
  {
    id: 'execution-policy',
    term: 'Execution Policy',
    category: 'sikkerhed',
    summary: 'Styrer om scripts må køres på computeren.',
    detail:
      'Execution Policy hjælper med at undgå utilsigtet scriptkørsel på Windows, men er ikke en sikkerhedsgrænse eller adgangskontrol. RemoteSigned kræver normalt signatur på scripts markeret som hentet fra internettet. Get-ExecutionPolicy -List viser scopes; en gruppepolitik kan have højere prioritet end dine lokale valg.',
    example: 'Get-ExecutionPolicy -List',
    docsUrl: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies',
    relatedLink: '/dag-2#sikkerhed',
    keywords: ['script policy', 'sikkerhedspolitik'],
  },
  {
    id: 'invoke-command',
    term: 'Invoke-Command',
    category: 'fjernadministration',
    summary: 'Kører kommandoer på en eller flere fjerncomputere.',
    detail:
      'Invoke-Command er standardmetoden til at køre scriptblocks på andre servere uden RDP. Kan køre på flere servere samtidig — ideelt til jeres member servers.',
    example: 'Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Service }',
    requires: 'Fjernserveren SRV01 med WinRM og en konto med fjernadgang.',
    relatedLink: '/dag-2#fjernadmin',
    keywords: ['fjern', 'remote', 'icm'],
  },
  {
    id: 'enter-pssession',
    term: 'Enter-PSSession',
    category: 'fjernadministration',
    summary: 'Åbner en interaktiv PowerShell-session på en fjerncomputer.',
    detail:
      'Enter-PSSession (alias: etsn) giver dig en prompt på fjernserveren — som om du sad lokalt. Afslut med Exit-PSSession. Kræver WinRM konfigureret.',
    example: 'Enter-PSSession -ComputerName SRV01',
    requires: 'Fjernserveren SRV01 med WinRM og en konto med fjernadgang.',
    relatedLink: '/dag-2#fjernadmin',
    keywords: ['pssession', 'winrm', 'interaktiv'],
  },
  {
    id: 'import-csv',
    term: 'Import-Csv',
    category: 'data',
    summary: 'Læser en CSV-fil ind som PowerShell-objekter.',
    detail:
      'Import-Csv behandler CSV som en databasetabel med rækker og kolonner. Perfekt til brugerlister, inventar og rapporter i infrastrukturprojektet.',
    example: '$brugere = Import-Csv .\\brugere.csv',
    requires: 'En brugere.csv-fil med kolonneoverskrifter i den aktuelle mappe.',
    relatedLink: '/dag-2#data',
    keywords: ['csv', 'import', 'database'],
  },
  {
    id: 'export-csv',
    term: 'Export-Csv',
    category: 'data',
    summary: 'Gemmer pipeline-output som en CSV-fil.',
    detail:
      'Export-Csv skriver objekter til en CSV-fil. Brug -NoTypeInformation for ren CSV uden PowerShell-typeinfo i toppen.',
    example: 'Get-Service | Export-Csv .\\services.csv -NoTypeInformation',
    relatedLink: '/dag-2#data',
    keywords: ['csv', 'export', 'rapport'],
  },
  {
    id: 'cim',
    term: 'CIM / WBEM',
    category: 'wbem',
    summary: 'Standard til at hente systeminformation fra Windows.',
    detail:
      'CIM er en model til at beskrive blandt andet operativsystem, diske og services. WMI er Microsofts implementering af administrationsinfrastrukturen på Windows; CIM-cmdlets som Get-CimInstance kan hente data fra den. WBEM er en samling standarder til denne type administration.',
    example: 'Get-CimInstance Win32_OperatingSystem',
    requires: 'Windows med den viste Win32-klasse.',
    relatedLink: '/dag-2#wbem',
    keywords: ['wmi', 'wbem', 'get-ciminstance', 'systeminfo'],
  },
  {
    id: 'scriptblock',
    term: 'Scriptblock',
    category: 'grundlæggende',
    summary: 'En blok af PowerShell-kode omgivet af { }.',
    detail:
      'Scriptblocks bruges i Where-Object, Invoke-Command og funktioner. En scriptblock gemmer kode; den køres ikke alene ved at blive oprettet. I pipeline-behandling med fx Where-Object er $_ det aktuelle objekt, men ikke enhver scriptblock har et aktuelt pipeline-objekt.',
    example: 'Where-Object { $_.Status -eq "Stopped" }',
    relatedLink: '/dag-1#pipeline',
    keywords: ['{ }', 'blok', '$_'],
  },
  {
    id: 'wildcard',
    term: 'Wildcard',
    category: 'grundlæggende',
    summary: 'Jokertegn som * og ? til mønstermatch.',
    detail:
      '* matcher et vilkårligt antal tegn, ? matcher præcis ét tegn. Bruges i -Name, -Path og -Filter parametre.',
    example: 'Get-Process -Name s*',
    relatedLink: '/dag-1#cmdlets',
    keywords: ['*', '?', 'jokertegn'],
  },
  ...practicalGlossaryEntries,
];

export function filterGlossaryEntries(
  entries: GlossaryEntry[],
  query: string
): GlossaryEntry[] {
  const words = query.trim().toLocaleLowerCase('da').split(/\s+/).filter(Boolean);
  if (!words.length) return entries;

  return entries.filter((entry) => {
    const haystack = [
      entry.term,
      entry.summary,
      entry.detail,
      entry.example ?? '',
      entry.pitfall ?? '',
      entry.requires ?? '',
      entry.category,
      glossaryCategories[entry.category],
      ...(entry.keywords ?? []),
    ]
      .join(' ')
      .toLocaleLowerCase('da');

    return words.every((word) => haystack.includes(word));
  });
}
