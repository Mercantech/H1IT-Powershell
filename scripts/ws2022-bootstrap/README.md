# WS 2022 bootstrap (lab demoscript)

Modulært PowerShell-sæt der tager en **clean Windows Server 2022** til en MAGS lab-DC (`mags.local`) med roller, AD-struktur og en eksempel-GPO.

**Demo/reference til underviser og lab-test.** En visuel showcase findes på hjemmesidens direkte rute `/ws2022` (uden link i navigationen). Den viser faser, PowerShell-kode, AD-struktur og et demoforløb. Elevernes egne scripts ligger i deres projekt-repo.

## Krav

- Windows Server 2022 (lab-VM), engelsk/dansk UI
- PowerShell 5.1 (Windows PowerShell) som Administrator
- Netværk/IP tilpasset i `Config.psd1`
- Snapshot før promotion anbefales

## Filer

| Fil | Formål |
|-----|--------|
| `Config.psd1` | Domæne, hostname, IP, roller, OU/GPO |
| `Common.ps1` | Hjælpere (config, logging, DN) |
| `01-Prepare-Host.ps1` | Hostname, timezone, valgfrit netværk |
| `02-Install-Roles.ps1` | AD DS, DNS, DHCP, File Services |
| `03-Promote-DomainController.ps1` | `Install-ADDSForest` (genstart) |
| `04-Configure-ADStructure.ps1` | OU, grupper, eksempelbrugere |
| `05-Create-ExampleGpo.ps1` | New-GPO + link + registry-setting |
| `Invoke-Bootstrap.ps1` | Orchestrator med transcript |

## Hurtig start

1. Tilpas `Config.psd1` (domæne, IP, adapter-navn).
2. Åbn elevated PowerShell på den clean server.
3. Tillad scriptkørsel i sessionen:

```powershell
Set-Location C:\sti\til\H1IT-Powershell\scripts\ws2022-bootstrap
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

4. Dry-run:

```powershell
.\Invoke-Bootstrap.ps1 -Phase 1 -WhatIf
.\Invoke-Bootstrap.ps1 -Phase 2 -WhatIf
```

5. Kør frem til promotion:

```powershell
.\Invoke-Bootstrap.ps1 -All
```

Indtast DSRM-password når fase 03 beder om det. Serveren genstarter typisk.

6. Efter reboot (log på som domæne-admin):

```powershell
Set-Location C:\sti\til\H1IT-Powershell\scripts\ws2022-bootstrap
.\Invoke-Bootstrap.ps1 -FromPhase 4 -All
```

## Enkeltfaser

```powershell
.\01-Prepare-Host.ps1 -WhatIf
.\02-Install-Roles.ps1
.\03-Promote-DomainController.ps1 -NoRebootOnCompletion   # avanceret
.\04-Configure-ADStructure.ps1
.\05-Create-ExampleGpo.ps1
```

## Sikkerhed

- Ingen plaintext-passwords i repo
- DSRM og bruger-passwords indtastes som `SecureString`
- Transcript skrives under `logs\` (mappen oprettes automatisk; hold lab-logs ude af Git hvis de indeholder følsomt output)

## Fejlfinding

| Symptom | Tjek |
|---------|------|
| Adapter findes ikke | `Get-NetAdapter` → ret `InterfaceAlias` i config |
| Promotion fejler | DNS/IP, hostname unik, AD DS installeret |
| Fase 04: modul mangler | Logget ind efter reboot? `Import-Module ActiveDirectory` |
| GPO-cmdlets mangler | RSAT/Group Policy Management (følger med AD DS tools) |
