import prepareSource from '../../scripts/ws2022-bootstrap/01-Prepare-Host.ps1?raw';
import rolesSource from '../../scripts/ws2022-bootstrap/02-Install-Roles.ps1?raw';
import promoteSource from '../../scripts/ws2022-bootstrap/03-Promote-DomainController.ps1?raw';
import adSource from '../../scripts/ws2022-bootstrap/04-Configure-ADStructure.ps1?raw';
import gpoSource from '../../scripts/ws2022-bootstrap/05-Create-ExampleGpo.ps1?raw';
import orchestratorSource from '../../scripts/ws2022-bootstrap/Invoke-Bootstrap.ps1?raw';
import commonSource from '../../scripts/ws2022-bootstrap/Common.ps1?raw';


export { orchestratorSource, commonSource };

export const ws2022Phases = [
  {
    title: 'Forbered serveren', short: 'Klargør', cmdlet: 'Rename-Computer',
    file: '01-Prepare-Host.ps1', source: prepareSource,
    description: 'Scriptet læser det ønskede servernavn og tidszonen fra Config.psd1 og sammenligner dem med serverens aktuelle indstillinger. Det ændrer dem, hvis de er forskellige.',
    actions: ['Sæt servernavnet til DC01.', 'Indstil tidszonen til København.', 'Konfigurér valgfrit statisk IPv4, gateway og DNS.'],
    result: 'En klargjort Windows Server med en kendt konfiguration.',
    concept: 'Konfiguration som data',
    manual: 'Du åbner indstillingerne for servernavn, tidszone og eventuelt netværksadapteren og indtaster værdierne hver for sig. Ved en ny lab-installation gentager du arbejdet.',
    lesson: 'Værdierne står samlet i Config.psd1. Når labbet genopbygges, kan du bruge de samme indstillinger uden at indtaste dem igen. Et andet lab får sin egen konfiguration, mens kommandoerne kan genbruges.',
    explanation: '$config er dataene fra konfigurationsfilen. Punktnotationen henter fx ComputerName, som sendes til Rename-Computer. Det fulde script tjekker først den aktuelle værdi og bruger ShouldProcess, så ændringen kan vises med -WhatIf.',
    note: 'Netværksændringer er slået fra i lab-konfigurationen. Hvis servernavnet ændres, anbefaler scriptet en genstart før næste fase.',
    code: "# Indstillinger læses fra en separat datafil\n$config = Get-BootstrapConfig -ConfigPath $ConfigPath\n\nRename-Computer -NewName $config.ComputerName -Force\nSet-TimeZone -Id $config.TimeZoneId",
  },
  {
    title: 'Installér serverroller', short: 'Roller', cmdlet: 'Install-WindowsFeature',
    file: '02-Install-Roles.ps1', source: rolesSource,
    description: 'Scriptet går gennem listen Roles i Config.psd1. For hver rolle undersøger det, om den er installeret, og installerer den ellers sammen med administrationsværktøjerne.',
    actions: ['Installér Active Directory Domain Services og DNS.', 'Tilføj DHCP og File Server.', 'Spring allerede installerede roller over.'],
    result: 'Fire serverroller er installeret og klar til videre opsætning.',
    concept: 'Løkker og tilstandstjek',
    manual: 'I Server Managers rolleguide vælger du AD DS, DNS, DHCP og File Server samt de relevante administrationsværktøjer. Du skal selv holde styr på, hvad der allerede er installeret.',
    lesson: 'Listen over roller fungerer som en fælles opskrift. Scriptet kontrollerer hver rolle, springer installerede roller over og stopper ved installationsfejl. Ved næste lab-installation kan du genbruge listen og se i outputtet, hvad der blev installeret.',
    explanation: 'foreach behandler én rolle ad gangen. Get-WindowsFeature læser dens tilstand. continue går videre til næste rolle, hvis den allerede er installeret; ellers kaldes Install-WindowsFeature.',
    note: 'DHCP og File Server installeres som roller. Dette script opretter ikke DHCP-scopes eller fildelinger. Følg en eventuel besked om genstart før fase 03.',
    code: "foreach ($rolle in $config.Roles) {\n    $feature = Get-WindowsFeature -Name $rolle\n    if ($feature.InstallState -eq 'Installed') {\n        continue\n    }\n    Install-WindowsFeature -Name $rolle -IncludeManagementTools\n}",
  },
  {
    title: 'Opret domænet', short: 'Domæne', cmdlet: 'Install-ADDSForest',
    file: '03-Promote-DomainController.ps1', source: promoteSource,
    description: 'Install-ADDSForest opretter en ny Active Directory-forest med domænet mags.local og gør serveren til domænecontroller. DNS installeres som del af promotion, så domænets tjenester kan findes via navneopslag.',
    actions: ['Kontrollér, at AD DS-rollen er installeret.', 'Indlæs DSRM-adgangskoden som SecureString.', 'Opret forest og DNS, og genstart serveren.'],
    result: 'DC01 bliver domain controller for mags.local.',
    concept: 'Parametre samlet i en hashtable',
    manual: 'I konfigurationsguiden til AD DS vælger du en ny forest og angiver domænenavn, DNS, funktionsniveauer, databasestier og DSRM-adgangskode.',
    lesson: 'Valgene står i konfigurationen og scriptets parametre, så de kan gennemgås før promotion og genbruges ved en ny installation. Adgangskoden indtastes stadig ved kørsel, og genstarten kræver stadig, at du logger på igen.',
    explanation: 'Read-Host -AsSecureString læser DSRM-adgangskoden, som bruges til gendannelsestilstand. @params sender den hashtable af indstillinger, som det fulde script opbygger, til Install-ADDSForest. Kommandoen efter genstart starter en ny kørsel fra fase 4.',
    note: 'Efter genstart logger man på som domæneadministrator og starter fase 04 manuelt med -FromPhase 4 -All. Fortsættelsen er ikke automatisk.',
    code: "$SafeModeAdministratorPassword = Read-Host -AsSecureString\n\n# $params indeholder domæne, DNS og øvrige indstillinger\nInstall-ADDSForest @params\n\n# Efter genstart og login som domæneadministrator:\n.\\Invoke-Bootstrap.ps1 -FromPhase 4 -All",
  },
  {
    title: 'Byg Active Directory', short: 'AD-struktur', cmdlet: 'New-ADUser',
    file: '04-Configure-ADStructure.ps1', source: adSource,
    description: 'Scriptet opretter først OU’er, derefter sikkerhedsgrupper og til sidst brugere og gruppemedlemskaber. Rækkefølgen sikrer, at OU’en og gruppen findes, når en bruger skal placeres og tilføjes.',
    actions: ['Opret OU’erne IT, Salg og Brugere.', 'Opret GG-IT, GG-Salg og GG-Alle.', 'Opret Anna og Bo, og tilføj dem til deres respektive grupper.'],
    result: 'Tre OU’er, tre grupper og to eksempelbrugere.',
    concept: 'Datadrevet oprettelse',
    manual: 'I Active Directory Users and Computers opretter du hver OU og gruppe, udfylder hver bruger og tilføjer brugeren til den rigtige gruppe. For hver ny bruger gentager du felterne og medlemskabet.',
    lesson: 'Hver bruger beskrives én gang i konfigurationen med navn, login, OU og gruppe. Den samme løkke behandler alle brugerne. Det reducerer gentagen indtastning og gør placering og gruppemedlemskab synligt, før du kører scriptet.',
    explanation: 'SampleUsers er en liste af brugerobjekter. I hver omgang henter $user ét objekt, og Get-OuDn bygger AD-stien ud fra brugerens OU og domænet. Det fulde script bruger stien ved New-ADUser og tjekker medlemskabet før Add-ADGroupMember.',
    note: 'Brugernes midlertidige adgangskode indtastes ved kørsel. Nye brugere skal skifte den ved første login. GG-Alle oprettes uden medlemmer i eksemplet.',
    code: "# Forenklet eksempel på den datadrevne oprettelse\nforeach ($user in $config.SampleUsers) {\n    $path = Get-OuDn -OuName $user.OuName -DomainName $config.DomainName\n    # Scriptet tjekker først, om brugeren allerede findes\n    # Derefter: New-ADUser og Add-ADGroupMember\n}",
  },
  {
    title: 'Sæt en fælles politik', short: 'Gruppepolitik', cmdlet: 'Set-GPRegistryValue',
    file: '05-Create-ExampleGpo.ps1', source: gpoSource,
    description: 'Scriptet opretter en Group Policy, linker den til OU’en Brugere og sætter registry-værdien DoNotOpenServerManagerAtLogon til 1. Det er en brugerindstilling, der skjuler Server Manager ved login.',
    actions: ['Opret Lab-Workstation-Baseline, hvis den mangler.', 'Link politikken til OU’en Brugere.', 'Sæt en brugerpolitik, der skjuler Server Manager ved login.'],
    result: 'En eksempel-GPO er oprettet, linket og konfigureret.',
    concept: 'Politikker som kode',
    manual: 'I Group Policy Management opretter du en GPO, linker den til den ønskede OU og redigerer den relevante brugerindstilling. Du skal bagefter dokumentere både placeringen og værdien.',
    lesson: 'GPO-navn, OU-link og registry-værdi er beskrevet i kode og konfiguration. En kollega kan gennemgå valgene, og Git kan vise senere ændringer. Det fulde script tjekker, om GPO’en og linket findes, før de oprettes.',
    explanation: 'Set-GPRegistryValue skriver en indstilling i GPO’en. -Name vælger politikken, -Key og -ValueName vælger registry-værdien, og -Type og -Value angiver datatype og indhold. OU-linket afgør, hvem brugerpolitikken kan gælde for.',
    note: 'Politikken er en brugerindstilling linket til Brugere. Anna og Bo ligger i IT og Salg og modtager derfor ikke denne politik via det viste OU-link.',
    code: "Set-GPRegistryValue `\n    -Name $config.GpoName `\n    -Key $config.GpoRegistryPath `\n    -ValueName $config.GpoRegistryValueName `\n    -Type $config.GpoRegistryType `\n    -Value $config.GpoRegistryValue",
  },
];

