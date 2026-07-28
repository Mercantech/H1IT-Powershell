import type { Monaco } from '@monaco-editor/react';
import type { languages } from 'monaco-editor';

interface PowerShellCommand {
  name: string;
  category: string;
  description: string;
  aliases?: string[];
  parameters?: string[];
  supportsShouldProcess?: boolean;
}

interface PowerShellSnippet {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}

const commands: PowerShellCommand[] = [
  {
    name: 'Get-Help',
    category: 'Hjælp',
    description: 'Viser dokumentation, syntaks og eksempler for PowerShell-kommandoer.',
    aliases: ['help', 'man'],
    parameters: ['-Name', '-Examples', '-Detailed', '-Full', '-Online', '-Parameter'],
  },
  {
    name: 'Get-Command',
    category: 'Hjælp',
    description: 'Finder cmdlets, funktioner, aliases og programmer i den aktuelle session.',
    aliases: ['gcm'],
    parameters: ['-Name', '-Verb', '-Noun', '-Module', '-CommandType', '-Syntax', '-All'],
  },
  {
    name: 'Get-Member',
    category: 'Hjælp',
    description: 'Viser properties og metoder på objekter i pipelinen.',
    aliases: ['gm'],
    parameters: ['-InputObject', '-MemberType', '-Name', '-Static', '-Force', '-View'],
  },
  {
    name: 'Get-Alias',
    category: 'Hjælp',
    description: 'Viser PowerShell-aliases og de kommandoer, de peger på.',
    aliases: ['gal'],
    parameters: ['-Name', '-Definition', '-Exclude', '-Scope'],
  },
  {
    name: 'Set-Alias',
    category: 'Hjælp',
    description: 'Opretter eller ændrer et alias i den aktuelle PowerShell-session.',
    aliases: ['sal'],
    parameters: ['-Name', '-Value', '-Description', '-Scope', '-Force'],
  },
  {
    name: 'Get-Process',
    category: 'Processer',
    description: 'Henter processer på den lokale computer eller via et angivet navn eller id.',
    aliases: ['gps', 'ps'],
    parameters: ['-Name', '-Id', '-IncludeUserName', '-FileVersionInfo', '-Module'],
  },
  {
    name: 'Start-Process',
    category: 'Processer',
    description: 'Starter en proces eller åbner en fil med det tilknyttede program.',
    aliases: ['start', 'saps'],
    parameters: ['-FilePath', '-ArgumentList', '-WorkingDirectory', '-Verb', '-Wait', '-PassThru', '-NoNewWindow'],
  },
  {
    name: 'Stop-Process',
    category: 'Processer',
    description: 'Stopper en proces efter navn eller id.',
    aliases: ['kill', 'spps'],
    parameters: ['-Name', '-Id', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Wait-Process',
    category: 'Processer',
    description: 'Venter på, at en eller flere processer stopper.',
    parameters: ['-Name', '-Id', '-Timeout', '-Any'],
  },
  {
    name: 'Get-Service',
    category: 'Services',
    description: 'Henter Windows-services og deres status.',
    aliases: ['gsv'],
    parameters: ['-Name', '-DisplayName', '-Include', '-Exclude', '-DependentServices', '-RequiredServices'],
  },
  {
    name: 'Start-Service',
    category: 'Services',
    description: 'Starter en stoppet Windows-service.',
    aliases: ['sasv'],
    parameters: ['-Name', '-DisplayName', '-InputObject', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Stop-Service',
    category: 'Services',
    description: 'Stopper en kørende Windows-service.',
    aliases: ['spsv'],
    parameters: ['-Name', '-DisplayName', '-InputObject', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Restart-Service',
    category: 'Services',
    description: 'Stopper og starter en Windows-service igen.',
    aliases: ['rsv'],
    parameters: ['-Name', '-DisplayName', '-InputObject', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Set-Service',
    category: 'Services',
    description: 'Ændrer navn, beskrivelse, starttype eller status for en service.',
    aliases: ['ssv'],
    parameters: ['-Name', '-DisplayName', '-Description', '-StartupType', '-Status'],
    supportsShouldProcess: true,
  },
  {
    name: 'New-Service',
    category: 'Services',
    description: 'Opretter en ny Windows-service.',
    parameters: ['-Name', '-BinaryPathName', '-DisplayName', '-Description', '-StartupType', '-Credential'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-ChildItem',
    category: 'Filer',
    description: 'Lister filer, mapper, registry keys og andre provider-elementer.',
    aliases: ['dir', 'ls', 'gci'],
    parameters: ['-Path', '-LiteralPath', '-Filter', '-Include', '-Exclude', '-Recurse', '-Depth', '-File', '-Directory', '-Force'],
  },
  {
    name: 'Get-Item',
    category: 'Filer',
    description: 'Henter et bestemt element fra en PowerShell-provider.',
    aliases: ['gi'],
    parameters: ['-Path', '-LiteralPath', '-Filter', '-Include', '-Exclude', '-Force'],
  },
  {
    name: 'New-Item',
    category: 'Filer',
    description: 'Opretter en fil, mappe, registry key eller et andet provider-element.',
    aliases: ['ni'],
    parameters: ['-Path', '-Name', '-ItemType', '-Value', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Copy-Item',
    category: 'Filer',
    description: 'Kopierer filer, mapper eller andre provider-elementer.',
    aliases: ['copy', 'cp', 'cpi'],
    parameters: ['-Path', '-LiteralPath', '-Destination', '-Recurse', '-Container', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Move-Item',
    category: 'Filer',
    description: 'Flytter filer, mapper eller andre provider-elementer.',
    aliases: ['move', 'mv', 'mi'],
    parameters: ['-Path', '-LiteralPath', '-Destination', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Remove-Item',
    category: 'Filer',
    description: 'Sletter filer, mapper eller andre provider-elementer.',
    aliases: ['del', 'erase', 'rd', 'ri', 'rm', 'rmdir'],
    parameters: ['-Path', '-LiteralPath', '-Filter', '-Include', '-Exclude', '-Recurse', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Rename-Item',
    category: 'Filer',
    description: 'Omdøber et provider-element.',
    aliases: ['ren', 'rni'],
    parameters: ['-Path', '-LiteralPath', '-NewName', '-Force', '-PassThru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-Content',
    category: 'Filer',
    description: 'Læser indhold fra en fil.',
    aliases: ['cat', 'gc', 'type'],
    parameters: ['-Path', '-LiteralPath', '-TotalCount', '-Tail', '-Raw', '-Encoding', '-Delimiter', '-Wait'],
  },
  {
    name: 'Set-Content',
    category: 'Filer',
    description: 'Erstatter indholdet i en fil.',
    aliases: ['sc'],
    parameters: ['-Path', '-LiteralPath', '-Value', '-Encoding', '-NoNewline', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Add-Content',
    category: 'Filer',
    description: 'Tilføjer indhold til slutningen af en fil.',
    aliases: ['ac'],
    parameters: ['-Path', '-LiteralPath', '-Value', '-Encoding', '-NoNewline', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Clear-Content',
    category: 'Filer',
    description: 'Fjerner indholdet fra en fil uden at slette filen.',
    aliases: ['clc'],
    parameters: ['-Path', '-LiteralPath', '-Filter', '-Include', '-Exclude', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Test-Path',
    category: 'Filer',
    description: 'Kontrollerer, om en sti eller et element findes.',
    parameters: ['-Path', '-LiteralPath', '-PathType', '-IsValid', '-NewerThan', '-OlderThan'],
  },
  {
    name: 'Resolve-Path',
    category: 'Filer',
    description: 'Finder den fulde sti og udvider wildcard-stier.',
    aliases: ['rvpa'],
    parameters: ['-Path', '-LiteralPath', '-Relative', '-RelativeBasePath'],
  },
  {
    name: 'Join-Path',
    category: 'Filer',
    description: 'Kombinerer en hovedsti og en underordnet sti.',
    parameters: ['-Path', '-ChildPath', '-AdditionalChildPath', '-Resolve'],
  },
  {
    name: 'Split-Path',
    category: 'Filer',
    description: 'Returnerer en bestemt del af en sti.',
    parameters: ['-Path', '-LiteralPath', '-Parent', '-Leaf', '-LeafBase', '-Extension', '-Qualifier', '-NoQualifier'],
  },
  {
    name: 'Get-Location',
    category: 'Filer',
    description: 'Viser den aktuelle placering.',
    aliases: ['gl', 'pwd'],
    parameters: ['-PSProvider', '-PSDrive', '-Stack'],
  },
  {
    name: 'Set-Location',
    category: 'Filer',
    description: 'Skifter den aktuelle placering.',
    aliases: ['cd', 'chdir', 'sl'],
    parameters: ['-Path', '-LiteralPath', '-PassThru', '-StackName'],
  },
  {
    name: 'Where-Object',
    category: 'Pipeline',
    description: 'Filtrerer pipeline-objekter efter en betingelse.',
    aliases: ['where', '?'],
    parameters: ['-FilterScript', '-Property', '-EQ', '-NE', '-GT', '-GE', '-LT', '-LE', '-Like', '-Match', '-Contains'],
  },
  {
    name: 'ForEach-Object',
    category: 'Pipeline',
    description: 'Udfører en handling for hvert objekt i pipelinen.',
    aliases: ['foreach', '%'],
    parameters: ['-Process', '-Begin', '-End', '-RemainingScripts', '-Parallel', '-ThrottleLimit', '-AsJob'],
  },
  {
    name: 'Select-Object',
    category: 'Pipeline',
    description: 'Vælger properties eller et udsnit af pipeline-objekter.',
    aliases: ['select'],
    parameters: ['-Property', '-InputObject', '-First', '-Last', '-Skip', '-SkipLast', '-Unique', '-ExpandProperty', '-ExcludeProperty'],
  },
  {
    name: 'Sort-Object',
    category: 'Pipeline',
    description: 'Sorterer objekter efter en eller flere properties.',
    aliases: ['sort'],
    parameters: ['-Property', '-Descending', '-Unique', '-Stable', '-CaseSensitive', '-Culture', '-Top', '-Bottom'],
  },
  {
    name: 'Group-Object',
    category: 'Pipeline',
    description: 'Grupperer objekter med samme property-værdi.',
    aliases: ['group'],
    parameters: ['-Property', '-NoElement', '-AsHashTable', '-AsString', '-CaseSensitive', '-Culture'],
  },
  {
    name: 'Measure-Object',
    category: 'Pipeline',
    description: 'Tæller objekter eller beregner sum, gennemsnit, minimum og maksimum.',
    aliases: ['measure'],
    parameters: ['-Property', '-Sum', '-Average', '-Maximum', '-Minimum', '-AllStats', '-Word', '-Line', '-Character'],
  },
  {
    name: 'Compare-Object',
    category: 'Pipeline',
    description: 'Sammenligner to samlinger af objekter.',
    aliases: ['compare', 'diff'],
    parameters: ['-ReferenceObject', '-DifferenceObject', '-Property', '-PassThru', '-IncludeEqual', '-ExcludeDifferent', '-SyncWindow'],
  },
  {
    name: 'Tee-Object',
    category: 'Pipeline',
    description: 'Gemmer pipeline-output i en fil eller variabel og sender det samtidig videre.',
    aliases: ['tee'],
    parameters: ['-FilePath', '-Variable', '-InputObject', '-Append', '-Encoding'],
  },
  {
    name: 'Format-Table',
    category: 'Output',
    description: 'Formaterer output som en tabel.',
    aliases: ['ft'],
    parameters: ['-Property', '-AutoSize', '-Wrap', '-GroupBy', '-View', '-HideTableHeaders'],
  },
  {
    name: 'Format-List',
    category: 'Output',
    description: 'Formaterer output som en liste med én property pr. linje.',
    aliases: ['fl'],
    parameters: ['-Property', '-GroupBy', '-View', '-Force'],
  },
  {
    name: 'Out-File',
    category: 'Output',
    description: 'Sender formateret output til en fil.',
    parameters: ['-FilePath', '-Encoding', '-Append', '-Force', '-NoClobber', '-NoNewline', '-Width'],
  },
  {
    name: 'Out-GridView',
    category: 'Output',
    description: 'Viser output i en søgbar grafisk tabel på Windows.',
    aliases: ['ogv'],
    parameters: ['-InputObject', '-Title', '-PassThru', '-OutputMode', '-Wait'],
  },
  {
    name: 'Write-Output',
    category: 'Output',
    description: 'Sender objekter til pipelinen.',
    aliases: ['echo', 'write'],
    parameters: ['-InputObject', '-NoEnumerate'],
  },
  {
    name: 'Write-Host',
    category: 'Output',
    description: 'Skriver tekst direkte i værtsprogrammet.',
    parameters: ['-Object', '-NoNewline', '-Separator', '-ForegroundColor', '-BackgroundColor'],
  },
  {
    name: 'Write-Verbose',
    category: 'Output',
    description: 'Skriver en detaljeret besked til verbose-strømmen.',
    parameters: ['-Message'],
  },
  {
    name: 'Write-Warning',
    category: 'Output',
    description: 'Skriver en advarsel til warning-strømmen.',
    parameters: ['-Message'],
  },
  {
    name: 'Write-Error',
    category: 'Output',
    description: 'Skriver en fejl til error-strømmen.',
    parameters: ['-Message', '-Exception', '-ErrorId', '-Category', '-TargetObject', '-RecommendedAction'],
  },
  {
    name: 'Export-Csv',
    category: 'Data',
    description: 'Gemmer objekter som CSV-rækker.',
    aliases: ['epcsv'],
    parameters: ['-Path', '-LiteralPath', '-NoTypeInformation', '-Delimiter', '-UseCulture', '-Encoding', '-Append', '-Force'],
  },
  {
    name: 'Import-Csv',
    category: 'Data',
    description: 'Læser CSV-rækker som PowerShell-objekter.',
    aliases: ['ipcsv'],
    parameters: ['-Path', '-LiteralPath', '-Delimiter', '-UseCulture', '-Encoding', '-Header'],
  },
  {
    name: 'ConvertTo-Csv',
    category: 'Data',
    description: 'Konverterer objekter til CSV-tekst.',
    parameters: ['-InputObject', '-NoTypeInformation', '-Delimiter', '-UseCulture'],
  },
  {
    name: 'ConvertFrom-Csv',
    category: 'Data',
    description: 'Konverterer CSV-tekst til PowerShell-objekter.',
    parameters: ['-InputObject', '-Delimiter', '-UseCulture', '-Header'],
  },
  {
    name: 'ConvertTo-Json',
    category: 'Data',
    description: 'Konverterer objekter til JSON.',
    parameters: ['-InputObject', '-Depth', '-Compress', '-EnumsAsStrings', '-EscapeHandling', '-AsArray'],
  },
  {
    name: 'ConvertFrom-Json',
    category: 'Data',
    description: 'Konverterer JSON til PowerShell-objekter.',
    parameters: ['-InputObject', '-AsHashtable', '-Depth', '-DateKind', '-NoEnumerate'],
  },
  {
    name: 'Export-Clixml',
    category: 'Data',
    description: 'Serialiserer PowerShell-objekter til CLIXML.',
    parameters: ['-Path', '-LiteralPath', '-InputObject', '-Depth', '-Encoding', '-Force', '-NoClobber'],
  },
  {
    name: 'Import-Clixml',
    category: 'Data',
    description: 'Indlæser serialiserede PowerShell-objekter fra CLIXML.',
    parameters: ['-Path', '-LiteralPath'],
  },
  {
    name: 'Get-ComputerInfo',
    category: 'System',
    description: 'Henter et samlet overblik over operativsystem og hardware.',
    parameters: ['-Property'],
  },
  {
    name: 'Get-CimInstance',
    category: 'CIM',
    description: 'Henter instanser fra en CIM-klasse lokalt eller via en CIM-session.',
    parameters: ['-ClassName', '-Namespace', '-Filter', '-Property', '-KeyOnly', '-Shallow', '-Query', '-ComputerName', '-CimSession'],
  },
  {
    name: 'Get-CimClass',
    category: 'CIM',
    description: 'Finder CIM-klasser og deres properties og metoder.',
    parameters: ['-ClassName', '-Namespace', '-MethodName', '-PropertyName', '-QualifierName', '-ComputerName', '-CimSession'],
  },
  {
    name: 'Invoke-CimMethod',
    category: 'CIM',
    description: 'Kalder en metode på en CIM-klasse eller CIM-instans.',
    parameters: ['-ClassName', '-MethodName', '-Arguments', '-InputObject', '-Namespace', '-ComputerName', '-CimSession'],
  },
  {
    name: 'New-CimSession',
    category: 'CIM',
    description: 'Opretter en vedvarende CIM-forbindelse til en computer.',
    parameters: ['-ComputerName', '-Credential', '-Authentication', '-Port', '-SessionOption', '-Name'],
  },
  {
    name: 'Remove-CimSession',
    category: 'CIM',
    description: 'Fjerner en CIM-session.',
    parameters: ['-CimSession', '-Id', '-Name', '-ComputerName'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-WinEvent',
    category: 'System',
    description: 'Læser Windows-eventlogs med filtrering på log, provider eller hashtable.',
    parameters: ['-LogName', '-ProviderName', '-FilterHashtable', '-FilterXml', '-FilterXPath', '-MaxEvents', '-Oldest', '-ComputerName'],
  },
  {
    name: 'Get-Counter',
    category: 'System',
    description: 'Henter performance counters fra Windows.',
    parameters: ['-Counter', '-SampleInterval', '-MaxSamples', '-Continuous', '-ComputerName', '-ListSet'],
  },
  {
    name: 'Get-Date',
    category: 'System',
    description: 'Henter eller formaterer dato og klokkeslæt.',
    parameters: ['-Date', '-Format', '-UFormat', '-AsUTC', '-UnixTimeSeconds'],
  },
  {
    name: 'Get-Random',
    category: 'System',
    description: 'Returnerer et tilfældigt tal eller et tilfældigt element fra en samling.',
    parameters: ['-Minimum', '-Maximum', '-InputObject', '-Count', '-SetSeed', '-Shuffle'],
  },
  {
    name: 'Get-ExecutionPolicy',
    category: 'Sikkerhed',
    description: 'Viser den aktuelle PowerShell execution policy.',
    parameters: ['-Scope', '-List'],
  },
  {
    name: 'Set-ExecutionPolicy',
    category: 'Sikkerhed',
    description: 'Ændrer PowerShell execution policy for et bestemt scope.',
    parameters: ['-ExecutionPolicy', '-Scope', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-Acl',
    category: 'Sikkerhed',
    description: 'Henter adgangskontrollisten for en fil, mappe eller registry key.',
    parameters: ['-Path', '-LiteralPath', '-Audit', '-AllCentralAccessPolicies', '-Filter', '-Include', '-Exclude'],
  },
  {
    name: 'Set-Acl',
    category: 'Sikkerhed',
    description: 'Anvender en adgangskontrolliste på et element.',
    parameters: ['-Path', '-LiteralPath', '-AclObject', '-ClearCentralAccessPolicy', '-Passthru'],
    supportsShouldProcess: true,
  },
  {
    name: 'Invoke-Command',
    category: 'Remoting',
    description: 'Kører en scriptblok lokalt, på fjerncomputere eller i en PSSession.',
    aliases: ['icm'],
    parameters: ['-ComputerName', '-Session', '-ScriptBlock', '-FilePath', '-ArgumentList', '-Credential', '-AsJob', '-ThrottleLimit'],
  },
  {
    name: 'Enter-PSSession',
    category: 'Remoting',
    description: 'Starter en interaktiv PowerShell-session på en fjerncomputer.',
    aliases: ['etsn'],
    parameters: ['-ComputerName', '-Session', '-Credential', '-ConfigurationName', '-Port', '-UseSSL'],
  },
  {
    name: 'New-PSSession',
    category: 'Remoting',
    description: 'Opretter en vedvarende PowerShell-session.',
    aliases: ['nsn'],
    parameters: ['-ComputerName', '-Credential', '-Name', '-Port', '-UseSSL', '-ConfigurationName', '-SessionOption'],
  },
  {
    name: 'Get-PSSession',
    category: 'Remoting',
    description: 'Henter PowerShell-sessioner i den aktuelle session.',
    aliases: ['gsn'],
    parameters: ['-Name', '-Id', '-InstanceId', '-ComputerName', '-State'],
  },
  {
    name: 'Remove-PSSession',
    category: 'Remoting',
    description: 'Lukker og fjerner en PowerShell-session.',
    aliases: ['rsn'],
    parameters: ['-Session', '-Name', '-Id', '-InstanceId', '-ComputerName'],
    supportsShouldProcess: true,
  },
  {
    name: 'Test-WSMan',
    category: 'Remoting',
    description: 'Tester, om WS-Management svarer på en lokal eller ekstern computer.',
    parameters: ['-ComputerName', '-Port', '-UseSSL', '-Authentication', '-Credential'],
  },
  {
    name: 'Enable-PSRemoting',
    category: 'Remoting',
    description: 'Konfigurerer computeren til PowerShell-remoting.',
    parameters: ['-Force', '-SkipNetworkProfileCheck'],
    supportsShouldProcess: true,
  },
  {
    name: 'Start-Job',
    category: 'Jobs',
    description: 'Starter en PowerShell-kommando som et baggrundsjob.',
    aliases: ['sajb'],
    parameters: ['-ScriptBlock', '-FilePath', '-ArgumentList', '-Name', '-InitializationScript', '-WorkingDirectory'],
  },
  {
    name: 'Get-Job',
    category: 'Jobs',
    description: 'Henter PowerShell-baggrundsjobs.',
    aliases: ['gjb'],
    parameters: ['-Name', '-Id', '-InstanceId', '-State', '-HasMoreData', '-Command'],
  },
  {
    name: 'Receive-Job',
    category: 'Jobs',
    description: 'Henter resultater fra et PowerShell-job.',
    aliases: ['rcjb'],
    parameters: ['-Job', '-Name', '-Id', '-InstanceId', '-Wait', '-Keep', '-AutoRemoveJob', '-WriteEvents', '-WriteJobInResults'],
  },
  {
    name: 'Wait-Job',
    category: 'Jobs',
    description: 'Venter på, at et eller flere PowerShell-jobs afsluttes.',
    aliases: ['wjb'],
    parameters: ['-Job', '-Name', '-Id', '-InstanceId', '-State', '-Any', '-Timeout', '-Force'],
  },
  {
    name: 'Remove-Job',
    category: 'Jobs',
    description: 'Fjerner PowerShell-jobs fra sessionen.',
    aliases: ['rjb'],
    parameters: ['-Job', '-Name', '-Id', '-InstanceId', '-State', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Test-Connection',
    category: 'Netværk',
    description: 'Sender ICMP-echo requests og tester netværksforbindelse.',
    parameters: ['-TargetName', '-Count', '-Delay', '-TimeoutSeconds', '-Quiet', '-Traceroute', '-IPv4', '-IPv6'],
  },
  {
    name: 'Test-NetConnection',
    category: 'Netværk',
    description: 'Tester ping, TCP-port, route eller diagnostik til en destination.',
    aliases: ['tnc'],
    parameters: ['-ComputerName', '-Port', '-CommonTCPPort', '-TraceRoute', '-DiagnoseRouting', '-InformationLevel'],
  },
  {
    name: 'Get-NetIPAddress',
    category: 'Netværk',
    description: 'Henter IP-adresser fra netværksinterfaces.',
    parameters: ['-IPAddress', '-InterfaceAlias', '-InterfaceIndex', '-AddressFamily', '-PrefixLength', '-AddressState'],
  },
  {
    name: 'New-NetIPAddress',
    category: 'Netværk',
    description: 'Konfigurerer en ny IP-adresse på et netværksinterface.',
    parameters: ['-IPAddress', '-InterfaceAlias', '-InterfaceIndex', '-PrefixLength', '-DefaultGateway', '-AddressFamily'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-NetAdapter',
    category: 'Netværk',
    description: 'Henter netværksadaptere og deres status.',
    parameters: ['-Name', '-InterfaceDescription', '-InterfaceIndex', '-Physical', '-IncludeHidden'],
  },
  {
    name: 'Get-NetRoute',
    category: 'Netværk',
    description: 'Henter poster fra IP-routingtabellen.',
    parameters: ['-DestinationPrefix', '-InterfaceAlias', '-InterfaceIndex', '-NextHop', '-AddressFamily', '-RouteMetric'],
  },
  {
    name: 'Resolve-DnsName',
    category: 'DNS',
    description: 'Udfører en DNS-forespørgsel.',
    parameters: ['-Name', '-Type', '-Server', '-DnsOnly', '-CacheOnly', '-NoHostsFile', '-QuickTimeout', '-TcpOnly'],
  },
  {
    name: 'Get-DnsClientServerAddress',
    category: 'DNS',
    description: 'Henter konfigurerede DNS-serveradresser på netværksinterfaces.',
    parameters: ['-InterfaceAlias', '-InterfaceIndex', '-AddressFamily'],
  },
  {
    name: 'Set-DnsClientServerAddress',
    category: 'DNS',
    description: 'Konfigurerer DNS-serveradresser på et netværksinterface.',
    parameters: ['-InterfaceAlias', '-InterfaceIndex', '-ServerAddresses', '-ResetServerAddresses', '-Validate'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-LocalUser',
    category: 'Brugere',
    description: 'Henter lokale brugerkonti.',
    parameters: ['-Name', '-SID'],
  },
  {
    name: 'New-LocalUser',
    category: 'Brugere',
    description: 'Opretter en lokal brugerkonto.',
    parameters: ['-Name', '-Password', '-Description', '-FullName', '-NoPassword', '-AccountExpires', '-UserMayNotChangePassword'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-LocalGroup',
    category: 'Brugere',
    description: 'Henter lokale grupper.',
    parameters: ['-Name', '-SID'],
  },
  {
    name: 'Add-LocalGroupMember',
    category: 'Brugere',
    description: 'Tilføjer brugere eller grupper til en lokal gruppe.',
    parameters: ['-Group', '-Name', '-SID', '-Member'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-ScheduledTask',
    category: 'Planlagte opgaver',
    description: 'Henter Windows-planlagte opgaver.',
    parameters: ['-TaskName', '-TaskPath', '-State'],
  },
  {
    name: 'Register-ScheduledTask',
    category: 'Planlagte opgaver',
    description: 'Opretter eller registrerer en Windows-planlagt opgave.',
    parameters: ['-TaskName', '-TaskPath', '-Action', '-Trigger', '-Principal', '-Settings', '-Description', '-User', '-Password', '-Force'],
    supportsShouldProcess: true,
  },
  {
    name: 'Start-ScheduledTask',
    category: 'Planlagte opgaver',
    description: 'Starter en Windows-planlagt opgave.',
    parameters: ['-TaskName', '-TaskPath', '-InputObject'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-ADUser',
    category: 'Active Directory',
    description: 'Henter Active Directory-brugere.',
    parameters: ['-Identity', '-Filter', '-LDAPFilter', '-Properties', '-SearchBase', '-SearchScope', '-Server', '-Credential'],
  },
  {
    name: 'New-ADUser',
    category: 'Active Directory',
    description: 'Opretter en Active Directory-bruger.',
    parameters: ['-Name', '-SamAccountName', '-UserPrincipalName', '-Path', '-AccountPassword', '-Enabled', '-GivenName', '-Surname', '-DisplayName'],
    supportsShouldProcess: true,
  },
  {
    name: 'Set-ADUser',
    category: 'Active Directory',
    description: 'Ændrer properties på en Active Directory-bruger.',
    parameters: ['-Identity', '-Add', '-Remove', '-Replace', '-Clear', '-Enabled', '-Description', '-Department', '-Title', '-EmailAddress'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-ADGroup',
    category: 'Active Directory',
    description: 'Henter Active Directory-grupper.',
    parameters: ['-Identity', '-Filter', '-LDAPFilter', '-Properties', '-SearchBase', '-SearchScope', '-Server'],
  },
  {
    name: 'Add-ADGroupMember',
    category: 'Active Directory',
    description: 'Tilføjer brugere, computere eller grupper til en AD-gruppe.',
    parameters: ['-Identity', '-Members', '-MemberTimeToLive', '-Server'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-ADComputer',
    category: 'Active Directory',
    description: 'Henter Active Directory-computere.',
    parameters: ['-Identity', '-Filter', '-LDAPFilter', '-Properties', '-SearchBase', '-SearchScope', '-Server'],
  },
  {
    name: 'Get-DnsServerZone',
    category: 'DNS Server',
    description: 'Henter DNS-zoner fra en Windows DNS-server.',
    parameters: ['-Name', '-ComputerName', '-ZoneScope', '-VirtualizationInstance'],
  },
  {
    name: 'Get-DnsServerResourceRecord',
    category: 'DNS Server',
    description: 'Henter resource records fra en DNS-zone.',
    parameters: ['-ZoneName', '-Name', '-RRType', '-ComputerName', '-ZoneScope'],
  },
  {
    name: 'Add-DnsServerResourceRecordA',
    category: 'DNS Server',
    description: 'Opretter en IPv4 A-record i en DNS-zone.',
    parameters: ['-ZoneName', '-Name', '-IPv4Address', '-TimeToLive', '-CreatePtr', '-ComputerName'],
    supportsShouldProcess: true,
  },
  {
    name: 'Get-DhcpServerv4Scope',
    category: 'DHCP Server',
    description: 'Henter IPv4-scopes fra en DHCP-server.',
    parameters: ['-ComputerName', '-ScopeId'],
  },
  {
    name: 'Get-DhcpServerv4Lease',
    category: 'DHCP Server',
    description: 'Henter IPv4-leases fra et DHCP-scope.',
    parameters: ['-ComputerName', '-ScopeId', '-IPAddress', '-ClientId', '-HostName', '-AllLeases'],
  },
];

const commonParameters = [
  '-Verbose',
  '-Debug',
  '-ErrorAction',
  '-WarningAction',
  '-InformationAction',
  '-ProgressAction',
  '-ErrorVariable',
  '-WarningVariable',
  '-InformationVariable',
  '-OutVariable',
  '-OutBuffer',
  '-PipelineVariable',
];

const automaticVariables = [
  { name: '$_', description: 'Det aktuelle pipeline-objekt.' },
  { name: '$PSItem', description: 'Det aktuelle pipeline-objekt; samme værdi som $_.' },
  { name: '$true', description: 'Boolesk sand værdi.' },
  { name: '$false', description: 'Boolesk falsk værdi.' },
  { name: '$null', description: 'En manglende eller tom værdi.' },
  { name: '$?', description: 'Om den seneste kommando lykkedes.' },
  { name: '$LASTEXITCODE', description: 'Exit code fra det senest kørte native program.' },
  { name: '$Error', description: 'Samling af de seneste PowerShell-fejl.' },
  { name: '$HOME', description: 'Den aktuelle brugers hjemmemappe.' },
  { name: '$PWD', description: 'Den aktuelle PowerShell-placering.' },
  { name: '$PSVersionTable', description: 'Versionsoplysninger for PowerShell og platformen.' },
  { name: '$PSScriptRoot', description: 'Mappen, der indeholder det kørende script.' },
  { name: '$PSCommandPath', description: 'Den fulde sti til det kørende script.' },
  { name: '$args', description: 'Argumenter, som ikke er bundet til navngivne parametre.' },
  { name: '$input', description: 'Enumerator med pipeline-input til en funktion eller scriptblok.' },
  { name: '$foreach', description: 'Enumeratoren i den aktuelle foreach-løkke.' },
  { name: '$Matches', description: 'Resultater fra den seneste -match-operation.' },
  { name: '$env:Path', description: 'PATH-miljøvariablen.' },
  { name: '$env:COMPUTERNAME', description: 'Computerens Windows-navn.' },
  { name: '$env:USERNAME', description: 'Den aktuelle brugers Windows-navn.' },
];

const snippets: PowerShellSnippet[] = [
  {
    label: 'if',
    detail: 'Snippet · if-betingelse',
    documentation: 'Opretter en if-blok med plads til betingelse og handling.',
    insertText: 'if (${1:condition}) {\n\t${0}\n}',
  },
  {
    label: 'ifelse',
    detail: 'Snippet · if/else',
    documentation: 'Opretter en if/else-struktur.',
    insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${0}\n}',
  },
  {
    label: 'foreach',
    detail: 'Snippet · foreach-løkke',
    documentation: 'Opretter en foreach-løkke over en samling.',
    insertText: 'foreach (\\$${1:item} in \\$${2:collection}) {\n\t${0}\n}',
  },
  {
    label: 'foreach-pipeline',
    detail: 'Snippet · ForEach-Object',
    documentation: 'Opretter en pipeline med ForEach-Object.',
    insertText: '${1:Get-Process} | ForEach-Object {\n\t\\$PSItem${0}\n}',
  },
  {
    label: 'where',
    detail: 'Snippet · Where-Object-filter',
    documentation: 'Opretter en pipeline med et property-filter.',
    insertText: '${1:Get-Service} | Where-Object { \\$_.${2:Status} -eq ${3:\'Running\'} }',
  },
  {
    label: 'select',
    detail: 'Snippet · Select-Object',
    documentation: 'Opretter en pipeline, der vælger properties.',
    insertText: '${1:Get-Process} | Select-Object ${2:Name, Id}',
  },
  {
    label: 'sort',
    detail: 'Snippet · Sort-Object',
    documentation: 'Opretter en pipeline, der sorterer faldende efter en property.',
    insertText: '${1:Get-Process} | Sort-Object ${2:CPU} -Descending',
  },
  {
    label: 'exportcsv',
    detail: 'Snippet · Export-Csv',
    documentation: 'Eksporterer pipeline-objekter til en CSV-fil.',
    insertText: '${1:Get-Service} | Export-Csv -Path ${2:\'.\\\\output.csv\'} -NoTypeInformation',
  },
  {
    label: 'function',
    detail: 'Snippet · avanceret funktion',
    documentation: 'Opretter en PowerShell-funktion med CmdletBinding og param-blok.',
    insertText: 'function ${1:Get-Something} {\n\t[CmdletBinding()]\n\tparam(\n\t\t${2}\n\t)\n\n\t${0}\n}',
  },
  {
    label: 'param',
    detail: 'Snippet · parameter',
    documentation: 'Opretter en obligatorisk, typet parameter.',
    insertText: '[Parameter(Mandatory)]\n[${1:string}]\\$${2:Name}',
  },
  {
    label: 'trycatch',
    detail: 'Snippet · try/catch',
    documentation: 'Opretter fejlhåndtering med try og catch.',
    insertText: 'try {\n\t${1}\n} catch {\n\tWrite-Error \\$_\n\t${0}\n}',
  },
  {
    label: 'switch',
    detail: 'Snippet · switch',
    documentation: 'Opretter en switch-struktur.',
    insertText: 'switch (${1:value}) {\n\t${2:\'Option\'} { ${3} }\n\tdefault { ${0} }\n}',
  },
  {
    label: 'hashtable',
    detail: 'Snippet · hashtable',
    documentation: 'Opretter en PowerShell-hashtable.',
    insertText: '\\$${1:data} = @{\n\t${2:Name} = ${3:\'Value\'}\n}',
  },
  {
    label: 'pscustomobject',
    detail: 'Snippet · PSCustomObject',
    documentation: 'Opretter et struktureret PowerShell-objekt.',
    insertText: '\\$${1:result} = [PSCustomObject]@{\n\t${2:Name} = ${3:\'Value\'}\n}',
  },
  {
    label: 'invoke-remote',
    detail: 'Snippet · PowerShell-remoting',
    documentation: 'Kører en scriptblok på en fjerncomputer.',
    insertText: 'Invoke-Command -ComputerName ${1:SERVER01} -ScriptBlock {\n\t${0}\n}',
  },
  {
    label: 'whatif',
    detail: 'Snippet · sikker ændring',
    documentation: 'Tilføjer -WhatIf til en kommando, der understøtter ShouldProcess.',
    insertText: '${1:Remove-Item} ${2:path} -WhatIf',
  },
];

const keywords = [
  'begin',
  'break',
  'catch',
  'class',
  'continue',
  'data',
  'do',
  'dynamicparam',
  'else',
  'elseif',
  'end',
  'enum',
  'exit',
  'filter',
  'finally',
  'for',
  'foreach',
  'from',
  'function',
  'if',
  'in',
  'param',
  'process',
  'return',
  'switch',
  'throw',
  'trap',
  'try',
  'until',
  'using',
  'while',
  'workflow',
];

const operators = [
  '-and',
  '-as',
  '-band',
  '-bnot',
  '-bor',
  '-bxor',
  '-contains',
  '-eq',
  '-ceq',
  '-ieq',
  '-ge',
  '-cge',
  '-ige',
  '-gt',
  '-cgt',
  '-igt',
  '-in',
  '-is',
  '-isnot',
  '-join',
  '-le',
  '-cle',
  '-ile',
  '-like',
  '-clike',
  '-ilike',
  '-lt',
  '-clt',
  '-ilt',
  '-match',
  '-cmatch',
  '-imatch',
  '-ne',
  '-cne',
  '-ine',
  '-not',
  '-notcontains',
  '-notin',
  '-notlike',
  '-notmatch',
  '-or',
  '-replace',
  '-shl',
  '-shr',
  '-split',
  '-xor',
];

const aliasNames = commands.flatMap((command) => command.aliases ?? []);

const nativeCommands = [
  'cmd',
  'hostname',
  'ipconfig',
  'netstat',
  'nslookup',
  'ping',
  'robocopy',
  'route',
  'schtasks',
  'ssh',
  'tracert',
  'whoami',
  'winget',
];

const powershellLanguage: languages.IMonarchLanguage = {
  defaultToken: '',
  ignoreCase: true,
  tokenPostfix: '.ps1',
  keywords,
  operators,
  aliases: aliasNames,
  nativeCommands,
  symbols: /[=><!~?&%|+\-*/^;.,]+/,
  escapes: /`(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  tokenizer: {
    root: [
      { include: '@whitespace' },
      [/<#/, 'comment', '@comment'],
      [/#.*$/, 'comment'],
      [/@"/, 'string', '@hereStringDouble'],
      [/@'/, 'string', '@hereStringSingle'],
      [/"/, 'string', '@doubleQuotedString'],
      [/'/, 'string', '@singleQuotedString'],
      [/\$(?:\?|_|\^|\$)/, 'variable.predefined'],
      [
        /\$(?:args|Error|foreach|HOME|input|LASTEXITCODE|Matches|MyInvocation|NestedPromptLevel|PROFILE|PSBoundParameters|PSCmdlet|PSCommandPath|PSScriptRoot|PSSenderInfo|PSUICulture|PSVersionTable|PWD|ShellId|StackTrace|this|true|false|null)\b/,
        'variable.predefined',
      ],
      [/\$env:[A-Za-z_][\w]*/, 'variable.predefined'],
      [/\$(?:\{(?:global:|local:|private:|script:|using:)?[^}]+\}|(?:global:|local:|private:|script:|using:)?[A-Za-z_][\w]*)/, 'variable'],
      [/@[A-Za-z_][\w]*/, 'variable'],
      [/\[(?:[A-Za-z_][\w]*\.)*[A-Za-z_][\w]*(?:\[\])?\]/, 'type'],
      [/[A-Za-z_][\w]*-[A-Za-z_][\w-]*/, 'keyword.cmdlet'],
      [
        /-[A-Za-z][\w-]*/,
        {
          cases: {
            '@operators': 'keyword.operator',
            '@default': 'attribute.name',
          },
        },
      ],
      [
        /[A-Za-z_][\w]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@aliases': 'keyword.alias',
            '@nativeCommands': 'type.identifier',
            '@default': '',
          },
        },
      ],
      [/\.[A-Za-z_][\w]*/, 'variable.property'],
      [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, 'number.hex'],
      [/\d+/, 'number'],
      [/[{}()[\]]/, '@brackets'],
      [/@symbols/, 'delimiter'],
    ],
    whitespace: [[/[ \t\r\n]+/, 'white']],
    comment: [
      [/[^#]+/, 'comment'],
      [/#>/, 'comment', '@pop'],
      [/#/, 'comment'],
    ],
    doubleQuotedString: [
      [/[^"`$]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/`./, 'string.escape.invalid'],
      [/\$env:[A-Za-z_][\w]*/, 'variable.predefined'],
      [/\$(?:\?|_|\^|\$|[A-Za-z_][\w]*)/, 'variable'],
      [/"/, 'string', '@pop'],
    ],
    singleQuotedString: [
      [/[^']+/, 'string'],
      [/''/, 'string.escape'],
      [/'/, 'string', '@pop'],
    ],
    hereStringDouble: [
      [/^\s*"@/, 'string', '@pop'],
      [/@escapes/, 'string.escape'],
      [/\$env:[A-Za-z_][\w]*/, 'variable.predefined'],
      [/\$(?:\?|_|\^|\$|[A-Za-z_][\w]*)/, 'variable'],
      [/./, 'string'],
    ],
    hereStringSingle: [
      [/^\s*'@/, 'string', '@pop'],
      [/./, 'string'],
    ],
  },
};

const commandByName = new Map(
  commands.map((command) => [command.name.toLowerCase(), command])
);

const commandByAlias = new Map(
  commands.flatMap((command) =>
    (command.aliases ?? []).map((alias) => [alias.toLowerCase(), command] as const)
  )
);

function findLastCommand(linePrefix: string): PowerShellCommand | undefined {
  const words = linePrefix.match(/[A-Za-z_?%][\w-]*/g) ?? [];
  let found: PowerShellCommand | undefined;

  for (const word of words) {
    const normalized = word.toLowerCase();
    found = commandByName.get(normalized) ?? commandByAlias.get(normalized) ?? found;
  }

  return found;
}

function commandDocumentation(command: PowerShellCommand): string {
  const aliases = command.aliases?.length
    ? `\n\n**Genveje:** \`${command.aliases.join('`, `')}\``
    : '';
  return `${command.description}${aliases}`;
}

function registerCompletions(monaco: Monaco): void {
  monaco.languages.registerCompletionItemProvider('powershell', {
    triggerCharacters: ['-', '$'],
    provideCompletionItems(model, position) {
      const linePrefix = model
        .getLineContent(position.lineNumber)
        .slice(0, position.column - 1);
      const parameterFragment = linePrefix.match(/(?:^|\s)(-[A-Za-z]*)$/);
      const variableFragment = linePrefix.match(/\$[A-Za-z_:?^]*$/);

      if (parameterFragment) {
        const command = findLastCommand(
          linePrefix.slice(0, -parameterFragment[1].length)
        );
        const parameters = [
          ...(command?.parameters ?? []),
          ...commonParameters,
          ...(command?.supportsShouldProcess ? ['-WhatIf', '-Confirm'] : []),
        ];
        const uniqueParameters = [...new Set(parameters)];
        const range = new monaco.Range(
          position.lineNumber,
          position.column - parameterFragment[1].length,
          position.lineNumber,
          position.column
        );

        return {
          suggestions: uniqueParameters.map((parameter) => ({
            label: parameter,
            kind: monaco.languages.CompletionItemKind.Property,
            detail: command
              ? `Parameter · ${command.name}`
              : 'Fælles PowerShell-parameter',
            insertText: parameter,
            range,
            sortText: parameter.startsWith('-Error') ? `2${parameter}` : `1${parameter}`,
          })),
        };
      }

      if (variableFragment) {
        const range = new monaco.Range(
          position.lineNumber,
          position.column - variableFragment[0].length,
          position.lineNumber,
          position.column
        );

        return {
          suggestions: automaticVariables.map((variable) => ({
            label: variable.name,
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: 'Automatisk PowerShell-variabel',
            documentation: variable.description,
            insertText: variable.name,
            range,
          })),
        };
      }

      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      );

      const commandSuggestions = commands.map((command) => ({
        label: command.name,
        kind: monaco.languages.CompletionItemKind.Function,
        detail: `Cmdlet · ${command.category}`,
        documentation: {
          value: commandDocumentation(command),
        },
        filterText: [command.name, ...(command.aliases ?? [])].join(' '),
        insertText: command.name,
        range,
        sortText: `2${command.name}`,
      }));

      const aliasSuggestions = commands.flatMap((command) =>
        (command.aliases ?? []).map((alias) => ({
          label: alias,
          kind: monaco.languages.CompletionItemKind.Reference,
          detail: `Genvej → ${command.name}`,
          documentation: {
            value: `Udvider genvejen \`${alias}\` til den læsbare cmdlet \`${command.name}\`.`,
          },
          filterText: alias,
          insertText: command.name,
          range,
          sortText: `1${alias}`,
        }))
      );

      const snippetSuggestions = snippets.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: snippet.detail,
        documentation: snippet.documentation,
        insertText: snippet.insertText,
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: `0${snippet.label}`,
      }));

      return {
        suggestions: [
          ...snippetSuggestions,
          ...aliasSuggestions,
          ...commandSuggestions,
        ],
      };
    },
  });
}

function registerHoverHelp(monaco: Monaco): void {
  monaco.languages.registerHoverProvider('powershell', {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const normalized = word.word.toLowerCase();
      const command =
        commandByName.get(normalized) ?? commandByAlias.get(normalized);
      if (!command) return null;

      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${command.name}** · ${command.category}` },
          { value: commandDocumentation(command) },
        ],
      };
    },
  });
}

let languageFeaturesRegistered = false;

export function setupPowerShellLanguage(monaco: Monaco): void {
  if (languageFeaturesRegistered) return;

  monaco.languages.setMonarchTokensProvider('powershell', powershellLanguage);
  registerCompletions(monaco);
  registerHoverHelp(monaco);
  languageFeaturesRegistered = true;
}
