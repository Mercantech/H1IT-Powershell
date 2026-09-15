$ListOfStudents = @(
    @{
        Name = "Allan"
        Role = "Lord"
        Company = "OnlyMAGS"
    },
    @{
        Name = "Mikkel"
        Role = "Lord"
        Company = "OnlyMAGS"
    },
    @{
        Name = "Frederik S. N."
        Role = "Ikke H1'er"
        Company = "No clue"
    }
    @{
        Name = "Lise"
        Role = "Not Lord :("
        Company = "OnlyMAGS"
    }
)

function Show-Students {
    param(
        [string]$Title,
        [array]$Students
    )

    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
    Write-Host ("Antal personer: {0}" -f $Students.Count) -ForegroundColor DarkCyan
    if ($Students.Count -eq 0) {
        Write-Host 'Ingen elever matcher udvalget.' -ForegroundColor Yellow
        return
    }

    # Kolonnerne tilpasser sig automatisk til navne, roller og firmaer.
    $rows = foreach ($student in $Students) {
        [pscustomobject]@{
            Navn = $student.Name
            Rolle = $student.Role
            Firma = $student.Company
        }
    }
    $rows | Format-Table -AutoSize -Wrap | Out-Host
}

Show-Students -Title 'Alle elever' -Students $ListOfStudents

# Udvælg kun elever med rollen Lord, som arbejder hos OnlyMAGS.
$lords = @(foreach ($student in $ListOfStudents) {
    if ($student.Role -eq 'Lord' -and $student.Company -eq 'OnlyMAGS') {
        $student
    }
})
Show-Students -Title 'OnlyLords hos OnlyMAGS' -Students $lords
