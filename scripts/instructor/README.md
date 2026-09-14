# Instructor solution: OnlyMAGS import

`Import-Employees.ps1` is the reference solution for the CSV exercise. It is not linked or imported by the website and is outside `public/`. The entire `scripts/instructor/` folder is excluded from the Docker build context. The production container only serves the built `dist/` directory. This is not a secrecy boundary for anyone with repository access.

Use **Windows PowerShell 5.1**, the **ActiveDirectory RSAT module**, and an account with delegated permissions to create users, set passwords and manage the selected groups. Run against a writable domain controller in the target lab domain.

```powershell
# First validate the complete file and preview the proposed changes.
.\Import-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -WhatIf

# Then execute. The password stays a SecureString and is not exported.
$password = Read-Host 'Temporary lab password' -AsSecureString
.\Import-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -InitialPassword $password |
    Export-Csv .\import-results.csv -NoTypeInformation -Encoding UTF8
```

Default CSV separator is `;`. For comma-separated exports add `-Delimiter ','`. Relative paths are resolved from the current PowerShell folder.

The script validates all required columns, the domain, UPNs, unique usernames, OUs and security groups before making changes. `Groups` is split on `|`. New users are created disabled, receive a password and group memberships, and are then enabled with password change required at first logon. The unique `SamAccountName` is used as the object's CN; the readable name is stored in `DisplayName`.

Existing accounts matching both username and UPN are skipped without updates. A conflicting username/UPN aborts preflight. Inspect any existing account manually to confirm that it is the intended employee. A rerun does not resume partially created accounts. Runtime failures are reported per employee; successful changes are retained. The script throws after emitting results if any user failed.

`Permissions` and `ExpectedGPOs` remain a review checklist. The script does not configure filesystem permissions, create groups/OUs, link GPOs, migrate SIDs, or transfer source-domain passwords. Verify actual access and GPO application after login.

The shared temporary password is only for the classroom lab. A production onboarding process should issue individual credentials through an approved channel.

Run `Test-ImportEmployees.ps1` in Windows PowerShell to test the solution against simulated AD cmdlets. It tests dry run, operation order, groups, rerun, preflight failure, delimiters and partial failure without connecting to AD.
