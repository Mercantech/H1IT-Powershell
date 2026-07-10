export interface ProjectUseCase {
  id: string;
  title: string;
  component: string;
  description: string;
  code: string;
  relatedModule: string;
}

export const projectUseCases: ProjectUseCase[] = [
  {
    id: 'ad',
    title: 'Active Directory',
    component: 'AD',
    description:
      'Automatisér oprettelse af brugere og OU-struktur fra en CSV-fil. Tjek GPO-status på domænecontrollere.',
    code: `# Importer brugere fra CSV og opret i AD
$brugere = Import-Csv .\\brugere.csv
foreach ($b in $brugere) {
    New-ADUser -Name $b.Navn -SamAccountName $b.Brugernavn -Path "OU=Brugere,DC=firma,DC=local"
}

# Tjek GPO-status
Get-GPO -All | Select-Object DisplayName, GpoStatus`,
    relatedModule: '/dag-2#data',
  },
  {
    id: 'dns-dhcp',
    title: 'DNS og DHCP',
    component: 'DNS / DHCP',
    description:
      'Verificér at kritiske netværksservices kører på jeres servere og eksportér konfiguration til dokumentation.',
    code: `# Tjek at DNS og DHCP kører
Get-Service -Name DNS, DHCPServer | Select-Object Name, Status, StartType

# Eksportér DNS-zoner til rapport
Get-DnsServerZone | Export-Csv .\\dns-zoner.csv`,
    relatedModule: '/dag-1#pipeline',
  },
  {
    id: 'backup',
    title: 'Backup',
    component: 'Backup',
    description:
      'Tjek status på backup-jobs og log resultater til en fil — nyttigt til jeres projektrapport og driftsdokumentation.',
    code: `# Tjek Windows Backup status
Get-WBJob | Select-Object JobType, State, ErrorDescription

# Start transcript til dokumentation
Start-Transcript -Path .\\backup-tjek.log
Get-WBJob
Stop-Transcript`,
    relatedModule: '/dag-2#sikkerhed',
  },
  {
    id: 'netvaerk',
    title: 'Netværk og VLAN',
    component: 'Netværk',
    description:
      'Dokumentér netværkskonfiguration og VLAN-opsætning. Parse og analysér konfigurationsfiler.',
    code: `# Vis netværksadaptere og IP-konfiguration
Get-NetIPAddress -AddressFamily IPv4 | 
    Select-Object InterfaceAlias, IPAddress, PrefixLength

# Tjek VLAN-konfiguration (Windows NIC teaming)
Get-NetLbfoTeam | Select-Object Name, Status`,
    relatedModule: '/dag-2#wbem',
  },
  {
    id: 'sikkerhed',
    title: 'Netværkssikkerhed',
    component: 'Sikkerhed',
    description:
      'Audit passwordpolitikker og generér rapporter om sikkerhedsindstillinger i AD.',
    code: `# Tjek passwordpolitik i AD
Get-ADDefaultDomainPasswordPolicy | 
    Select-Object MinPasswordLength, LockoutThreshold, ComplexityEnabled

# Find inaktive brugere (sikkerhedsrisiko)
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly`,
    relatedModule: '/dag-2#sikkerhed',
  },
  {
    id: 'serverdrift',
    title: 'Serverdrift',
    component: 'Serverdrift',
    description:
      'Fjernadministrér member servers uden RDP. Kør scripts på flere servere samtidig.',
    code: `# Kør kommando på fjernservere
$servere = "SRV01", "SRV02", "SRV03"
Invoke-Command -ComputerName $servere -ScriptBlock {
    Get-Service | Where-Object Status -eq "Stopped"
}

# Interaktiv session
Enter-PSSession -ComputerName SRV01`,
    relatedModule: '/dag-2#fjernadmin',
  },
];

export const guiVsScript = [
  {
    situation: 'Engangsopgave på én server',
    gui: 'Godt valg — hurtigt og visuelt',
    script: 'Overkill — unødvendig kompleksitet',
  },
  {
    situation: 'Gentagne opgaver (opret 50 brugere)',
    gui: 'Tidskrævende og fejlbehæftet',
    script: 'Ideelt — hurtigt, reproducerbart og dokumentérbart',
  },
  {
    situation: 'Tjek status på 10 servere',
    gui: 'Kræver login på hver server',
    script: 'Invoke-Command på alle på én gang',
  },
  {
    situation: 'Test farlig ændring (slet filer)',
    gui: 'Ingen forhåndsvisning',
    script: '-WhatIf viser hvad der ville ske',
  },
  {
    situation: 'Dokumentation til rapport',
    gui: 'Screenshots — manuelt og ufuldstændigt',
    script: 'Transcript + Export-Csv — komplet log',
  },
];
