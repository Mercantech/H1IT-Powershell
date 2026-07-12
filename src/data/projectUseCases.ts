export interface ProjectUseCase {
  id: string;
  title: string;
  component: string;
  /** Realistisk bestilling — som i sidste års script-opgave */
  chefBrief: string;
  description: string;
  code: string;
  sampleOutput: string;
  relatedModule: string;
  /** Med i F5-præsentation — alle vises på Projektkobling-siden */
  featuredInPresentation?: boolean;
}

export const projectUseCases: ProjectUseCase[] = [
  {
    id: 'server-report',
    title: 'Serverinfo-rapport',
    component: 'Serverdrift',
    chefBrief:
      'Jeg vil have en hurtig oversigt over serveren: hvad kører den, hvornår blev den sidst opdateret, og hvad er netværkskonfigurationen?',
    description:
      'Samler OS-version, seneste hotfix, netværksadaptere og kørende services i én læsbar rapport. Output skal formateres — ikke bare rå objekter.',
    code: `# Variabel øverst — nem at tilpasse til andre servere
$rapportSti = ".\\server-rapport.txt"
Start-Transcript -Path $rapportSti

Write-Host "=== Operativsystem ===" -ForegroundColor Cyan
Get-CimInstance Win32_OperatingSystem |
    Select-Object Caption, Version, LastBootUpTime |
    Format-List

Write-Host "=== Seneste Windows Update ===" -ForegroundColor Cyan
Get-HotFix | Sort-Object InstalledOn -Descending |
    Select-Object -First 1 HotFixID, Description, InstalledOn |
    Format-Table -AutoSize

Write-Host "=== Netværk ===" -ForegroundColor Cyan
Get-NetIPConfiguration |
    Where-Object { $_.IPv4Address } |
    Select-Object InterfaceAlias,
        @{N="IP";E={$_.IPv4Address.IPAddress}},
        @{N="Gateway";E={$_.IPv4DefaultGateway.NextHop}} |
    Format-Table -AutoSize

Write-Host "=== Services (alfabetisk) ===" -ForegroundColor Cyan
Get-Service | Where-Object Status -eq "Running" |
    Sort-Object Name |
    Select-Object Name, DisplayName, Status |
    Format-Table -AutoSize

Stop-Transcript`,
    sampleOutput: `PS C:\\Serverauto> .\\server-rapport.ps1
Transcript started, output file is .\\server-rapport.txt
=== Operativsystem ===

Caption       : Microsoft Windows Server 2022 Datacenter
Version       : 10.0.20348
LastBootUpTime: 08-09-2025 06:12:33

=== Seneste Windows Update ===

HotFixID  Description     InstalledOn
--------  -----------     -----------
KB5043055 Security Update 15-09-2025

=== Netværk ===

InterfaceAlias IP          Gateway
-------------- --          -------
Ethernet0      10.10.1.10  10.10.1.1

=== Services (alfabetisk) ===

Name   DisplayName        Status
----   -----------        ------
DNS    DNS Server         Running
DHCPServer DHCP Server    Running

Transcript stopped, output file is .\\server-rapport.txt`,
    relatedModule: '/dag-2#wbem',
    featuredInPresentation: true,
  },
  {
    id: 'ad',
    title: 'Bulk-oprettelse af AD-brugere',
    component: 'AD',
    chefBrief:
      'Vi har ansat 15 nye medarbejdere. Lav dem alle som AD-brugere med det samme — jeg sender jer en CSV-liste.',
    description:
      'Importer brugere fra CSV med korrekt OU-placering, standardpassword og krav om passwordskift ved næste login. Log med transcript og test med -WhatIf først.',
    code: `$csvSti = ".\\brugere.csv"
$logSti = ".\\ad-oprettelse.log"
$standardPw = ConvertTo-SecureString "SkiftMig123!" -AsPlainText -Force

Start-Transcript -Path $logSti
$brugere = Import-Csv $csvSti

foreach ($b in $brugere) {
    # -WhatIf første gang — fjern når I er klar til rigtig kørsel
    New-ADUser -Name "$($b.Fornavn) $($b.Efternavn)" \`
        -SamAccountName $b.Brugernavn \`
        -Path $b.OU \`
        -Department $b.Afdeling \`
        -AccountPassword $standardPw \`
        -ChangePasswordAtLogon $true \`
        -PasswordNeverExpires $false \`
        -Enabled $true \`
        -WhatIf
}

Stop-Transcript

# Eksportér oprettede brugere som dokumentation (efter rigtig kørsel)
# Get-ADUser -Filter * -SearchBase "OU=Brugere,DC=firma,DC=local" |
#     Select-Object Name, SamAccountName | Export-Csv .\\oprettede.csv -NoTypeInformation`,
    sampleOutput: `PS C:\\Serverauto> $brugere = Import-Csv .\\brugere.csv
PS C:\\Serverauto> foreach ($b in $brugere) {
>>     New-ADUser -Name "$($b.Fornavn) $($b.Efternavn)" -SamAccountName $b.Brugernavn ...
>> }

What if: Performing the operation "Create" on target "CN=Anna Jensen,OU=IT,DC=firma,DC=local".
What if: Performing the operation "Create" on target "CN=Bo Nielsen,OU=Salg,DC=firma,DC=local".

PS C:\\Serverauto> Stop-Transcript
Transcript stopped, output file is .\\ad-oprettelse.log`,
    relatedModule: '/dag-2#data',
    featuredInPresentation: true,
  },
  {
    id: 'dhcp-leases',
    title: 'DHCP-lease rapport',
    component: 'DHCP',
    chefBrief:
      'Vi har fået en fejl på netværket. Jeg har brug for at vide præcis hvilke IP-adresser der er udlånt fra vores DHCP-scope og til hvilke maskiner.',
    description:
      'Udtræk aktive leaser fra en specifik scope. Scope-IP angives som variabel øverst i scriptet.',
    code: `# Scope-IP — tilpas til jeres lab
$scopeId = "10.10.1.0"
$udSti = ".\\dhcp-leases.csv"

Get-DhcpServerv4Lease -ScopeId $scopeId |
    Where-Object AddressState -eq "Active" |
    Select-Object IPAddress, ClientId, HostName, LeaseExpiryTime |
    Sort-Object IPAddress |
    Export-Csv $udSti -NoTypeInformation

Write-Host "[OK] Eksporteret til $udSti" -ForegroundColor Green
Get-Content $udSti`,
    sampleOutput: `PS C:\\Serverauto> Get-DhcpServerv4Lease -ScopeId 10.10.1.0 | ...
[OK] Eksporteret til .\\dhcp-leases.csv

"IPAddress","ClientId","HostName","LeaseExpiryTime"
"10.10.1.50","00-11-22-33-44-55","SRV-WEB01","18-09-2025 14:00:00"
"10.10.1.51","00-AA-BB-CC-DD-EE","SRV-DB01","18-09-2025 14:05:00"`,
    relatedModule: '/projekt#dns-dhcp',
    featuredInPresentation: true,
  },
  {
    id: 'dns-a-records',
    title: 'DNS A-records export',
    component: 'DNS',
    chefBrief:
      'Vi er ved at rydde op i DNS. Jeg har brug for en liste over alle A-records i vores zone, så vi kan se om der er forældede poster.',
    description:
      'Hent alle IPv4 A-records fra en zone, sorter på hostname og eksporter til CSV.',
    code: `$zoneNavn = "firma.local"
$udSti = ".\\dns-a-records.csv"

Get-DnsServerResourceRecord -ZoneName $zoneNavn |
    Where-Object { $_.RecordType -eq "A" } |
    ForEach-Object {
        [PSCustomObject]@{
            Hostname = $_.HostName
            IP       = $_.RecordData.IPv4Address.ToString()
            TTL      = $_.TimeToLive.ToString()
        }
    } |
    Sort-Object Hostname |
    Export-Csv $udSti -NoTypeInformation

Write-Host "[OK] $(Import-Csv $udSti).Count A-records eksporteret" -ForegroundColor Green`,
    sampleOutput: `PS C:\\Serverauto> Get-DnsServerResourceRecord -ZoneName firma.local | ...
[OK] 12 A-records eksporteret

"Hostname","IP","TTL"
"dc01","10.10.1.5","01:00:00"
"srv-web01","10.10.1.10","01:00:00"
"srv-db01","10.10.2.10","01:00:00"`,
    relatedModule: '/dag-1#pipeline',
    featuredInPresentation: true,
  },
  {
    id: 'dns-a-bulk',
    title: 'Bulk-oprettelse af DNS A-records',
    component: 'DNS',
    chefBrief:
      'Vi har fået 20 nye servere. Kan du oprette DNS-poster for dem alle på én gang i stedet for at klikke dem ind én ad gangen?',
    description:
      'Importer hostname og IP fra CSV og opret A-records. Kør med -WhatIf første gang.',
    code: `$csvSti = ".\\servere-dns.csv"

Import-Csv $csvSti | ForEach-Object {
    Add-DnsServerResourceRecordA \`
        -ZoneName $_.Zone \`
        -Name $_.Hostname \`
        -IPv4Address $_.IPAdresse \`
        -WhatIf

    # Efter test — fjern -WhatIf:
    # Write-Host "[OK] $($_.Hostname) -> $($_.IPAdresse)" -ForegroundColor Green
}`,
    sampleOutput: `PS C:\\Serverauto> Import-Csv .\\servere-dns.csv | ForEach-Object { ... }

What if: Performing the operation "Add-DnsServerResourceRecordA" on target
"srv-web01.firma.local A 10.10.1.10".
What if: Performing the operation "Add-DnsServerResourceRecordA" on target
"srv-db01.firma.local A 10.10.2.10".`,
    relatedModule: '/dag-2#sikkerhed',
    featuredInPresentation: true,
  },
  {
    id: 'server-roles',
    title: 'Installation af server-roller',
    component: 'Serverdrift',
    chefBrief:
      'Vi ruller en ny server ud. Den skal have DNS, DHCP og File Services installeret. Kan du automatisere det?',
    description:
      'Installer roller med Install-WindowsFeature. Tjek først om rollen allerede findes — spring over hvis den er installeret. Ingen automatisk genstart.',
    code: `$roller = @("DNS", "DHCP", "FS-FileServer")

foreach ($rolle in $roller) {
    $status = (Get-WindowsFeature -Name $rolle).InstallState
    if ($status -eq "Installed") {
        Write-Host "[SKIP] $rolle er allerede installeret" -ForegroundColor Yellow
        continue
    }
    Write-Host "[INSTALL] Installerer $rolle ..." -ForegroundColor Cyan
    Install-WindowsFeature -Name $rolle -IncludeManagementTools
}

# Rapport over installerede roller
Get-WindowsFeature | Where-Object InstallState -eq "Installed" |
    Select-Object Name, DisplayName |
    Out-File .\\installerede-roller.txt

Write-Host "Bemærk: Genstart kan være nødvendig — tjek Windows Update/Server Manager." -ForegroundColor Magenta`,
    sampleOutput: `PS C:\\Serverauto> foreach ($rolle in $roller) { ... }
[INSTALL] Installerer DNS ...
Success Restart Needed Exit Code Feature Result
------- -------------- --------- --------------
True    No             Success   DNS
[SKIP] DHCP er allerede installeret
[INSTALL] Installerer FS-FileServer ...
True    No             Success   FS-FileServer

Bemærk: Genstart kan være nødvendig — tjek Windows Update/Server Manager.`,
    relatedModule: '/dag-2#fjernadmin',
    featuredInPresentation: true,
  },
  {
    id: 'ad-groups',
    title: 'AD-gruppe rapport',
    component: 'AD / Sikkerhed',
    chefBrief:
      'Sikkerhedsrevision. Jeg har brug for at vide hvem der er med i alle vores sikkerhedsgrupper.',
    description:
      'Hent sikkerhedsgrupper (ikke distributionslister), list direkte medlemmer og eksporter til CSV. Ekstra: filtrér grupper med mindst ét medlem.',
    code: `$udSti = ".\\ad-grupper.csv"
$rapport = @()

Get-ADGroup -Filter 'GroupCategory -eq "Security"' | ForEach-Object {
    $medlemmer = Get-ADGroupMember -Identity $_.DistinguishedName -Recursive:$false
    if ($medlemmer.Count -eq 0) { return }  # spring tomme grupper over

    foreach ($m in $medlemmer) {
        $rapport += [PSCustomObject]@{
            Gruppenavn  = $_.Name
            Medarbejder = $m.Name
            Brugernavn  = $m.SamAccountName
        }
    }
}

$rapport | Sort-Object Gruppenavn, Medarbejder | Export-Csv $udSti -NoTypeInformation
Write-Host "[OK] $($rapport.Count) medlemskaber eksporteret" -ForegroundColor Green`,
    sampleOutput: `PS C:\\Serverauto> Get-ADGroup -Filter 'GroupCategory -eq "Security"' | ...
[OK] 24 medlemskaber eksporteret

"Gruppenavn","Medarbejder","Brugernavn"
"IT-Admin","Anna Jensen","ajensen"
"IT-Admin","Bo Nielsen","bnielsen"
"Backup-Operatører","svc_backup","svc_backup"`,
    relatedModule: '/projekt#sikkerhed',
    featuredInPresentation: true,
  },
  {
    id: 'dns-dhcp',
    title: 'DNS og DHCP — servicetjek',
    component: 'DNS / DHCP',
    chefBrief:
      'Før vi ruller ændringer ud: kører DNS og DHCP overhovedet på serveren, og hvilke zoner har vi?',
    description:
      'Hurtigt helbredstjek af kritiske netværksservices og eksport af zoneoversigt til dokumentation.',
    code: `# Tjek at DNS og DHCP kører
Get-Service -Name DNS, DHCPServer | Select-Object Name, Status, StartType

# Eksportér DNS-zoner til rapport
Get-DnsServerZone | Export-Csv .\\dns-zoner.csv -NoTypeInformation`,
    sampleOutput: `PS C:\\Serverauto> Get-Service -Name DNS, DHCPServer | Select-Object Name, Status, StartType

Name        Status  StartType
----        ------  ---------
DNS         Running Automatic
DHCPServer  Running Automatic

PS C:\\Serverauto> Get-DnsServerZone | Export-Csv .\\dns-zoner.csv -NoTypeInformation`,
    relatedModule: '/dag-1#pipeline',
  },
  {
    id: 'backup',
    title: 'Backup',
    component: 'Backup',
    chefBrief:
      'Jeg skal have dokumentation til rapporten: kører backup-jobbene, og hvornår fejlede noget sidst?',
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
Transcript started, output file is .\\backup-tjek.log
PS C:\\Serverauto> Stop-Transcript
Transcript stopped, output file is .\\backup-tjek.log`,
    relatedModule: '/dag-2#sikkerhed',
  },
  {
    id: 'netværk',
    title: 'Netværk og VLAN',
    component: 'Netværk',
    chefBrief:
      'Dokumentér netværksopsætningen til VLAN-projektet — hvilke IP-adresser og teams har vi på serveren?',
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

PS C:\\Serverauto> Get-NetLbfoTeam | Select-Object Name, Status

Name          Status
----          ------
Team-VLAN01   Up`,
    relatedModule: '/dag-2#wbem',
  },
  {
    id: 'sikkerhed',
    title: 'Netværkssikkerhed',
    component: 'Sikkerhed',
    chefBrief:
      'Vi skal dokumentere sikkerhedsstatus: passwordpolitik og brugere der ikke har logget ind i 90 dage.',
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
svc_gammel    svc_gammel      12-01-2025`,
    relatedModule: '/dag-2#sikkerhed',
  },
  {
    id: 'serverdrift',
    title: 'Fjernadministration',
    component: 'Serverdrift',
    chefBrief:
      'Vi har tre member servers — jeg vil tjekke stoppede services på dem alle uden at logge ind med RDP på hver.',
    description:
      'Fjernadministrér member servers uden RDP. Kør scripts på flere servere samtidig.',
    code: `# Kør kommando på fjernservere
$servere = "SRV01", "SRV02", "SRV03"
Invoke-Command -ComputerName $servere -ScriptBlock {
    Get-Service | Where-Object Status -eq "Stopped"
}

# Interaktiv session
Enter-PSSession -ComputerName SRV01`,
    sampleOutput: `PS C:\\Serverauto> Invoke-Command -ComputerName $servere -ScriptBlock { ... }

PSComputerName Name              Status DisplayName
-------------- ----              ------ -----------
SRV01          Spooler           Stopped Print Spooler
SRV02          Themes            Stopped Themes
SRV03          W32Time           Stopped Windows Time

PS C:\\Serverauto> Enter-PSSession -ComputerName SRV01
[SRV01]: PS C:\\Users\\admin> _`,
    relatedModule: '/dag-2#fjernadmin',
    featuredInPresentation: true,
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
