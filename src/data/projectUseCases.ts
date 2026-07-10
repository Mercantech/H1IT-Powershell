export interface ProjectUseCase {
  id: string;
  title: string;
  component: string;
  description: string;
  code: string;
  sampleOutput: string;
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
    sampleOutput: `PS C:\\Serverauto> $brugere = Import-Csv .\\brugere.csv
PS C:\\Serverauto> foreach ($b in $brugere) {
>>     New-ADUser -Name $b.Navn -SamAccountName $b.Brugernavn -Path "OU=Brugere,DC=firma,DC=local"
>> }

DisplayName    SamAccountName Path
-----------    -------------- ----
Anna Jensen    ajensen        OU=Brugere,DC=firma,DC=local
Bo Nielsen     bnielsen       OU=Brugere,DC=firma,DC=local
Mia Larsen     mlarsen        OU=Brugere,DC=firma,DC=local

PS C:\\Serverauto> Get-GPO -All | Select-Object DisplayName, GpoStatus

DisplayName              GpoStatus
-----------              ---------
Default Domain Policy    AllSettingsEnabled
Windows Firewall Policy  AllSettingsEnabled
USB-blokering            UserSettingsDisabled`,
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
    sampleOutput: `PS C:\\Serverauto> Get-Service -Name DNS, DHCPServer | Select-Object Name, Status, StartType

Name        Status  StartType
----        ------  ---------
DNS         Running Automatic
DHCPServer  Running Automatic

PS C:\\Serverauto> Get-DnsServerZone | Export-Csv .\\dns-zoner.csv
PS C:\\Serverauto> Get-Content .\\dns-zoner.csv
"ZoneName","ZoneType","IsReverseLookupZone"
"firma.local","Primary","False"
"10.in-addr.arpa","Primary","True"`,
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
    sampleOutput: `PS C:\\Serverauto> Get-WBJob | Select-Object JobType, State, ErrorDescription

JobType  State      ErrorDescription
-------  -----      ----------------
Backup   Completed
Restore  Completed

PS C:\\Serverauto> Start-Transcript -Path .\\backup-tjek.log
Transcript started, output file is C:\\Serverauto\\backup-tjek.log
PS C:\\Serverauto> Get-WBJob

JobType  State
-------  -----
Backup   Completed
Restore  Completed

PS C:\\Serverauto> Stop-Transcript
Transcript stopped, output file is C:\\Serverauto\\backup-tjek.log`,
    relatedModule: '/dag-2#sikkerhed',
  },
  {
    id: 'netværk',
    title: 'Netværk og VLAN',
    component: 'Netværk',
    description:
      'Dokumentér netværkskonfiguration og VLAN-opsætning. Parse og analysér konfigurationsfiler.',
    code: `# Vis netværksadaptere og IP-konfiguration
Get-NetIPAddress -AddressFamily IPv4 | 
    Select-Object InterfaceAlias, IPAddress, PrefixLength

# Tjek VLAN-konfiguration (Windows NIC teaming)
Get-NetLbfoTeam | Select-Object Name, Status`,
    sampleOutput: `PS C:\\Serverauto> Get-NetIPAddress -AddressFamily IPv4 |
>>     Select-Object InterfaceAlias, IPAddress, PrefixLength

InterfaceAlias IPAddress    PrefixLength
-------------- ---------    ------------
Ethernet0      192.168.1.10           24
vEthernet-VLAN 10.0.10.5              24
Loopback       127.0.0.1               8

PS C:\\Serverauto> Get-NetLbfoTeam | Select-Object Name, Status

Name          Status
----          ------
Team-VLAN01   Up
Team-Uplink   Up`,
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
    sampleOutput: `PS C:\\Serverauto> Get-ADDefaultDomainPasswordPolicy |
>>     Select-Object MinPasswordLength, LockoutThreshold, ComplexityEnabled

MinPasswordLength LockoutThreshold ComplexityEnabled
----------------- ---------------- -----------------
                8                5              True

PS C:\\Serverauto> Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly

Name          SamAccountName  LastLogonDate
----          --------------  -------------
svc_gammel    svc_gammel      12-01-2025
test_bruger   test_bruger     15-11-2024
praktikant22  praktikant22    03-09-2024`,
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
    sampleOutput: `PS C:\\Serverauto> $servere = "SRV01", "SRV02", "SRV03"
PS C:\\Serverauto> Invoke-Command -ComputerName $servere -ScriptBlock {
>>     Get-Service | Where-Object Status -eq "Stopped"
>> }

PSComputerName Name              Status DisplayName
-------------- ----              ------ -----------
SRV01          Spooler           Stopped Print Spooler
SRV01          RemoteRegistry    Stopped Remote Registry
SRV02          Themes            Stopped Themes
SRV03          W32Time           Stopped Windows Time

PS C:\\Serverauto> Enter-PSSession -ComputerName SRV01
[SRV01]: PS C:\\Users\\admin> _`,
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
