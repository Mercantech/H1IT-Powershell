@{
    # Lab-defaults - tilpas før kørsel på clean Windows Server 2022
    ComputerName     = 'DC01'
    TimeZoneId       = 'Romance Standard Time'   # (UTC+01:00) Brussels, Copenhagen, Madrid, Paris

    # Statisk IP - behold eksisterende lab-IP via SSH (10.133.71.101)
    ConfigureNetwork = $false
    InterfaceAlias   = 'Ethernet'
    IPv4Address      = '10.133.71.101'
    PrefixLength     = 24
    DefaultGateway   = '10.133.71.1'
    DnsServers       = @('127.0.0.1')

    # AD DS forest - MAGS lab
    DomainName       = 'mags.local'
    DomainNetbiosName = 'MAGS'
    ForestMode       = 'WinThreshold'   # Windows Server 2016+
    DomainMode       = 'WinThreshold'

    # Roller der installeres før promotion
    Roles = @(
        'AD-Domain-Services'
        'DNS'
        'DHCP'
        'FS-FileServer'
    )

    # AD-struktur (køres efter reboot som DC)
    OrganizationalUnits = @(
        'IT'
        'Salg'
        'Brugere'
    )
    SecurityGroups = @(
        @{ Name = 'GG-IT';      PathOU = 'IT' }
        @{ Name = 'GG-Salg';    PathOU = 'Salg' }
        @{ Name = 'GG-Alle';     PathOU = 'Brugere' }
    )
    SampleUsers = @(
        @{
            GivenName      = 'Anna'
            Surname        = 'Jensen'
            SamAccountName = 'anna.jensen'
            OuName         = 'IT'
            GroupName      = 'GG-IT'
        }
        @{
            GivenName      = 'Bo'
            Surname        = 'Nielsen'
            SamAccountName = 'bo.nielsen'
            OuName         = 'Salg'
            GroupName      = 'GG-Salg'
        }
    )

    # Eksempel-GPO
    GpoName          = 'Lab-Workstation-Baseline'
    GpoLinkOuName    = 'Brugere'
    # Registry-baseret eksempel: skjuler server manager ved logon for brugere i OU
    GpoRegistryPath  = 'HKCU\Software\Microsoft\ServerManager'
    GpoRegistryValueName = 'DoNotOpenServerManagerAtLogon'
    GpoRegistryValue = 1
    GpoRegistryType  = 'DWord'
}
