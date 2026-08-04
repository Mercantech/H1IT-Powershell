<#
.SYNOPSIS
  Fase 4 — OU'er, sikkerhedsgrupper og eksempelbrugere (efter DC-reboot).
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1'),

    [SecureString]$DefaultUserPassword
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator
$config = Get-BootstrapConfig -ConfigPath $ConfigPath

Write-BootstrapStep 'Fase 04 — AD-struktur'

Import-Module ActiveDirectory -ErrorAction Stop

$domainDn = Get-DomainDn -DomainName $config.DomainName

# OU'er
foreach ($ouName in $config.OrganizationalUnits) {
    $ouDn = Get-OuDn -OuName $ouName -DomainName $config.DomainName
    $existing = Get-ADOrganizationalUnit -Filter "Name -eq '$ouName'" -SearchBase $domainDn -ErrorAction SilentlyContinue
    if ($existing) {
        Write-BootstrapStep "OU $ouName findes allerede" -Level Skip
        continue
    }

    if ($PSCmdlet.ShouldProcess($ouDn, 'New-ADOrganizationalUnit')) {
        New-ADOrganizationalUnit -Name $ouName -Path $domainDn -ProtectedFromAccidentalDeletion $true
        Write-BootstrapStep "OU $ouName oprettet" -Level Ok
    }
}

# Grupper
foreach ($group in $config.SecurityGroups) {
    $path = Get-OuDn -OuName $group.PathOU -DomainName $config.DomainName
    $existing = Get-ADGroup -Filter "SamAccountName -eq '$($group.Name)'" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-BootstrapStep "Gruppe $($group.Name) findes allerede" -Level Skip
        continue
    }

    if ($PSCmdlet.ShouldProcess($group.Name, 'New-ADGroup')) {
        New-ADGroup `
            -Name $group.Name `
            -SamAccountName $group.Name `
            -GroupCategory Security `
            -GroupScope Global `
            -Path $path
        Write-BootstrapStep "Gruppe $($group.Name) oprettet" -Level Ok
    }
}

# Brugere
if (-not $DefaultUserPassword) {
    $DefaultUserPassword = Read-Host -AsSecureString -Prompt 'Midlertidigt password til eksempelbrugere'
}

foreach ($user in $config.SampleUsers) {
    $existing = Get-ADUser -Filter "SamAccountName -eq '$($user.SamAccountName)'" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-BootstrapStep "Bruger $($user.SamAccountName) findes allerede" -Level Skip
    }
    else {
        $path = Get-OuDn -OuName $user.OuName -DomainName $config.DomainName
        $displayName = "$($user.GivenName) $($user.Surname)"

        if ($PSCmdlet.ShouldProcess($user.SamAccountName, 'New-ADUser')) {
            New-ADUser `
                -Name $displayName `
                -GivenName $user.GivenName `
                -Surname $user.Surname `
                -SamAccountName $user.SamAccountName `
                -UserPrincipalName "$($user.SamAccountName)@$($config.DomainName)" `
                -Path $path `
                -AccountPassword $DefaultUserPassword `
                -Enabled $true `
                -ChangePasswordAtLogon $true
            Write-BootstrapStep "Bruger $($user.SamAccountName) oprettet" -Level Ok
        }
    }

    if ($PSCmdlet.ShouldProcess("$($user.SamAccountName) -> $($user.GroupName)", 'Add-ADGroupMember')) {
        $member = Get-ADUser -Filter "SamAccountName -eq '$($user.SamAccountName)'" -ErrorAction SilentlyContinue
        $groupObj = Get-ADGroup -Filter "SamAccountName -eq '$($user.GroupName)'" -ErrorAction SilentlyContinue
        if ($member -and $groupObj) {
            $already = Get-ADGroupMember -Identity $groupObj -ErrorAction SilentlyContinue |
                Where-Object SamAccountName -eq $user.SamAccountName
            if ($already) {
                Write-BootstrapStep "$($user.SamAccountName) allerede i $($user.GroupName)" -Level Skip
            }
            else {
                Add-ADGroupMember -Identity $groupObj -Members $member
                Write-BootstrapStep "$($user.SamAccountName) tilføjet til $($user.GroupName)" -Level Ok
            }
        }
    }
}

Write-BootstrapStep 'Fase 04 færdig' -Level Ok
