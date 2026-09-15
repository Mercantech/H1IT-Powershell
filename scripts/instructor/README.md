# Instructor solution: OnlyMAGS import

A local Blazor Server GUI for these scripts is available in [server/README.md](../../server/README.md), including a standalone Windows Server package and startup instructions.

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

While running, the script displays timestamped status lines and a progress bar. You can see module loading, connection to the domain controller, CSV loading, validation (phase 1/2), and creation (phase 2/2). Each employee shows the current operation: password setup, group membership or account activation. The final summary reports created, skipped, previewed, declined and failed accounts plus elapsed time. Status is visible with `-WhatIf` and when results are piped to `Export-Csv`; status messages do not become CSV rows. A pending AD call keeps its last operation visible until it returns; the script does not estimate its duration.

The final console report uses a framed, colored layout with result counts, unprocessed rows, successful group additions and elapsed time for startup, validation and processing. Its benchmark shows successful users/second, sample size, average, P95 (nearest rank), fastest and slowest provisioning time. Each sample measures account creation through activation, including status output but excluding password/confirmation prompts, validation, skipped accounts and failed attempts. This is a measurement of this run, not a prediction of production capacity. Phase and total times include user waits. Preview-only runs show no provisioning benchmark. Failed runs include up to five error details and retain a failing exit. The report stays on the host stream so CSV output still contains only employee results.

The script validates all required columns, the domain, UPNs, unique usernames, OUs and security groups before making changes. `Groups` is split on `|`. New users are created disabled, receive a password and group memberships, and are then enabled with password change required at first logon. The unique `SamAccountName` is used as the object's CN; the readable name is stored in `DisplayName`.

Existing accounts matching both username and UPN are skipped without updates. A conflicting username/UPN aborts preflight. Inspect any existing account manually to confirm that it is the intended employee. A rerun does not resume partially created accounts. Runtime failures are reported per employee; successful changes are retained. The script throws after emitting results if any user failed.

`Permissions` and `ExpectedGPOs` remain a review checklist. The script does not configure filesystem permissions, create groups/OUs, link GPOs, migrate SIDs, or transfer source-domain passwords. Verify actual access and GPO application after login.

The shared temporary password is only for the classroom lab. A production onboarding process should issue individual credentials through an approved channel.

Run `Test-ImportEmployees.ps1` in Windows PowerShell to test the solution against simulated AD cmdlets. It tests dry run, operation order, groups, rerun, preflight failure, delimiters and partial failure without connecting to AD.

## Remove the lab users

`Revert-Employees.ps1` reads the same original employee CSV. Run with an account permitted to delete users:

```powershell
.\Revert-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -WhatIf
.\Revert-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local |
    Export-Csv .\revert-results.csv -NoTypeInformation -Encoding UTF8
```

The execution asks for confirmation per user; use `-Confirm:$false` after reviewing the preview to run the batch without individual prompts. Comma CSVs use `-Delimiter ','`.

The whole batch is checked before deletion: target domain, account, UPN, EmployeeID and original account CN/OU must match. A mismatch stops the batch. Missing users are skipped. Users are deleted by GUID after another identity check. Moved or renamed users require manual review. Groups, OUs and GPOs are retained. Runtime errors are reported per row and cause the script to fail after processing; completed deletions are not rolled back.

The original CSV cannot prove which users were created by a previous import: a pre-existing user matching all these fields can also be deleted. This is lab cleanup, not a restoration of the previous AD state. Preview and check the selected identities before execution.

Timestamped status and the final report stay separate from CSV result objects. Run `Test-RevertEmployees.ps1` to verify the behavior with simulated AD cmdlets, without contacting AD.
