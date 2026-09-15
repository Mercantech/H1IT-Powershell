# OnlyMAGS AD Console

Blazor Server-app (.NET 10, Interactive Server) til import og oprydning af medarbejdere i et Windows Server 2022-lab. Siden har CSV-upload, prøvekørsel, live-log, resultattabel, slutrapport og download af resultater. Den genbruger `scripts/instructor/Import-Employees.ps1` og `Revert-Employees.ps1`; scripts kopieres automatisk med ved build/publish.

## Kør på Windows Server 2022

1. Byg pakken på udviklermaskinen med .NET 10 SDK:

   ```powershell
   .\server\Publish-Admin.ps1
   ```

2. Kopiér hele den nye mappe under `server/artifacts/` til fx `C:\OnlyMagsAdmin` på serveren. Behold `Scripts/`, `wwwroot/` og alle de øvrige filer.
3. Kontrollér, at Windows PowerShell 5.1 kan indlæse AD-modulet:

   ```powershell
   powershell.exe -NoProfile -Command "Import-Module ActiveDirectory -ErrorAction Stop"
   ```

   Hvis modulet mangler, kan en administrator installere serverens AD PowerShell-feature:

   ```powershell
   Install-WindowsFeature RSAT-AD-PowerShell
   ```

4. Start `Start-Admin.cmd` som den domænekonto, der skal udføre arbejdet, og åbn **http://localhost:5088** i browseren på serveren (fx i en RDP-session). Kontoen skal have de nødvendige delegerede AD-rettigheder. Appen skifter ikke identitet til browserbrugeren.

Pakken indeholder .NET-runtime, så serveren behøver hverken .NET SDK, en separat ASP.NET-runtime, IIS eller Node.js. Windows PowerShell 5.1 og AD-modulet bruges stadig fra serveren. Første version er en lokal app til en betroet administrator på en server med Desktop Experience. Den installerer ikke en Windows-service og starter ikke automatisk ved genstart. En ny self-contained pakke skal bygges og kopieres ved .NET-sikkerhedsopdateringer.

Appen lytter kun på loopback, port 5088. Den er ikke et netværksportal med login: andre lokale brugere/processer kan også nå localhost. Brug den derfor i et betroet lab, og læg den ikke bag en reverse proxy. Fjernadgang/multibrugerdrift kræver en særskilt løsning med autentifikation og rettighedsstyring.

## Arbejdsgang

1. Vælg **Importér** eller **Fjern medarbejdere**, og angiv den konkrete skrivbare domænecontroller, fx `dc01.mags.local`.
2. Upload generatorens oprindelige CSV (UTF-8, højst 5 MB / 1.000 medarbejdere). Vælg semikolon eller komma.
3. Kør en prøvekørsel. Den læser AD og validerer hele batchen uden ændringer. Resultater og log vises løbende.
4. Gennemgå resultaterne. Ved import skal du indtaste den midlertidige lab-adgangskode. Bekræft handlingen og start kørslen.
5. Download resultat-CSV'en, før en ny kørsel startes. Den komplette PowerShell-slutrapport, inklusive importens benchmark, vises i loggen.

Appen kræver en vellykket prøvekørsel med samme filindhold, handling, separator og server før en rigtig kørsel. Godkendelsen forbruges ved start. Der kan kun køre ét job ad gangen. De eksisterende scripts validerer AD igen ved selve kørslen.

Revert sletter matchende brugere efter kontrol af domæne, brugernavn, UPN, EmployeeID og original CN/OU. Den oprindelige CSV beviser ikke, om en bruger blev oprettet af importen: allerede eksisterende konti, der matcher alle felter, kan også blive slettet. Grupper, OU'er og GPO'er slettes ikke. Delvist gennemførte ændringer rulles ikke automatisk tilbage.

## Status, data og drift

- PowerShell kører i en separat proces; browserens forbindelse er ikke nødvendig for at færdiggøre jobbet. Efter genindlæsning vises seneste kørsel igen, så længe app-processen stadig lever.
- Luk ikke serverappen under en kørsel. Resultater og de seneste 2.000 loglinjer ligger kun i hukommelsen; skærmen viser de seneste 150. Historik mistes ved genstart og erstattes ved næste job.
- CSV gemmes midlertidigt i app-kontoens temp-mappe og fjernes efter kørslen. Ved et procescrash kan en `OnlyMags-*`-mappe blive liggende dér og skal ryddes manuelt efter kontrol.
- Adgangskoden sendes som JSON via den lokale PowerShell-proces' stdin og omdannes til SecureString. Den gemmes ikke i filer, kommandolinjeargumenter eller logs. Den findes kortvarigt som tekst i appens hukommelse og transporteres fra den lokale browser til appen.
- Scriptstier og handlinger er faste. CSV/serverdata bliver aldrig sammensat til PowerShell-kode. Processen bruger `-NoProfile -NonInteractive -ExecutionPolicy RemoteSigned`; ingen permanent execution-policy ændres. En domænepolitik om signerede scripts skal stadig overholdes.
- Status og fejl holdes adskilt fra resultatobjekter. CSV-download citerer felter og beskytter regneark mod formeludførelse i importerede tekstfelter.

## Udvikling og test

```powershell
dotnet run --project server/OnlyMags.Admin
dotnet run --project server/OnlyMags.Admin.Tests -c Release
```

Testprojektet bruger de rigtige scripts og Windows PowerShell 5.1 med et isoleret, simuleret ActiveDirectory-modul. Det tester uploadvalidering, godkendelse af præcis samme input, samtidighed, prøvekørsel, import, revert, fejl, log og eksport uden at kontakte et rigtigt AD.

`server/` er udeladt fra hjemmesidens Docker-build. Appen og instruktørscriptet bliver ikke offentliggjort på undervisningssiden.
