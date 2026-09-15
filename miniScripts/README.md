# PowerShell-legeplads

Start menuen fra denne mappe:

```powershell
powershell -ExecutionPolicy Bypass -File .\script.ps1
```

Vælg digital regn, raketkapløb eller spåkuglen. Afslut menuen med `Q`,
eller afbryd en demo med `Ctrl+C`. Demoerne skriver kun i terminalen.
De er lavet til Windows PowerShell 5.1 og PowerShell 7 (`pwsh`).

Kør en demo direkte:

```powershell
.\script.ps1 -Demo Race
.\demos\digital-regn.ps1 -Lines 100 -DelayMs 30
.\demos\raket-race.ps1 -Distance 20 -DelayMs 100
.\demos\spaakugle.ps1 -Question 'Bliver det en god demo?'
```

Prøv at ændre farver og tegn i regnen, raketternes navne eller spåkuglens svar.
