# H1IT-Powershell

Interaktiv læringsside til **Serverautomatisering I — 16862** (PowerShell) på H1 IT / Infrastruktur og Cyber.

PowerShell dækkes over **2 dage** (uge 37–38) som del af det samlede infrastrukturprojekt.

**Live site:** https://powershell.mercantec.tech (via Dokploy)

## Læringsmål

- Lærlingen kan anvende PowerShell til automatisering og fjernadministration af servere og klienter.
- Lærlingen kan implementere sikkerheden korrekt i forbindelse med scripting i PowerShell.
- Lærlingen kan anvende de grundlæggende cmdlets og forstår at bruge de indbyggede hjælpefunktioner i PowerShell.
- Lærlingen kan anvende pipelinen i PowerShell.
- Lærlingen kan anvende grundlæggende systemkald til WBEM (Web-Based Enterprise Management) funktioner.
- Lærlingen kan anvende `-WhatIf`, `-Confirm` og `-Transcript` i PowerShell.
- Lærlingen kan anvende aliases i PowerShell.
- Lærlingen kan oprette og bruge variabler i PowerShell.
- Lærlingen kan anvende datahåndtering op imod en database struktur.

## Mål → moduler

| Mål | Modul |
|-----|-------|
| 1 — Fjernadministration | Dag 2 — Fjernadministration |
| 2 — Sikker scripting | Dag 2 — Sikker scripting |
| 3 — Cmdlets og hjælp | Dag 1 — Cmdlets og hjælp |
| 4 — Pipeline | Dag 1 — Pipeline |
| 5 — WBEM/CIM | Dag 2 — WBEM/CIM |
| 6 — WhatIf, Confirm, Transcript | Dag 2 — Sikker scripting |
| 7 — Aliases | Dag 1 — Variabler og aliases |
| 8 — Variabler | Dag 1 — Variabler og aliases |
| 9 — Datahåndtering | Dag 2 — Datahåndtering |

## Kør lokalt (uden Docker)

```bash
npm install
npm run dev
```

Åbn http://localhost:5173/

### AI-feedback lokalt

Kør API'en i en separat terminal:

```bash
cd api
npm install
cp ../.env.example ../.env   # tilføj OPENAI_API_KEY
npm run dev
```

Frontend proxyer `/api` til `localhost:3000` under `npm run dev`.

## Kør lokalt med Docker

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

Åbn http://localhost:8080/

## Deploy (Dokploy)

Deploy sker via Dokploy med Docker Compose:

```bash
docker compose up -d --build
```

Sæt `OPENAI_API_KEY` i Dokploy-miljøvariabler for at aktivere AI-feedback på øvelser.

### Routing (Mercantec)

1. Cloudflare: `*.mercantec.tech` (wildcard CNAME → tunnel)
2. Tunnel ingress: `*.mercantec.tech` → `http://localhost:80`
3. Traefik (Dokploy): `Host(powershell.mercantec.tech)` → frontend-container (port 80)

Sæt domæne via miljøvariabel `FRONTEND_DOMAIN` i Dokploy (standard: `powershell.mercantec.tech`).

## Struktur

- `/` — Forside med læringsmål og oversigt
- `/dag-1` — Grundlæggende (cmdlets, pipeline, variabler) + lokale opgaver
- `/dag-2` — Sikkerhed, fjernadmin, WBEM, data + lokale opgaver
- `/projekt` — Projektkobling med use cases, den store opgave (WS 2022 → roller/AD/GPO), deployment og projektopgaver
- `/csv-generator` — generér 1–1.000 fiktive medarbejdere (standard: 100) fra en opkøbt virksomhed til elevernes eget AD.
- `/ordbog` — Opslagsguide til PowerShell-begreber
- `/intune` — PowerShell og Microsoft Intune (bro til praktik/job)

- `/ws2022` — visuel showcase af det modulære Windows Server 2022-bootstrap med fem klikbare faser, kodevisninger, AD-oversigt og demoforløb. Ruten er tilgængelig direkte og vises ikke i navigationen (ingen adgangskontrol).

Lab-demoscript: `scripts/ws2022-bootstrap/` — modulært bootstrap fra clean Windows Server 2022. Showcasesiden importerer de fem fasescripts samt orchestrator og fælles hjælpere som tekst ved build; lokale SSH-hjælpere, adgangskoder og logs indgår ikke.

## CSV-generator: virksomhedsopkøb

Feltet for elevernes eget virksomhedsnavn starter tomt. Når måldomænet indtastes eller anvendes fra AD-import, udfyldes navnet fra første del med stort begyndelsesbogstav: `mags.local` → `Mags`. Resten af navnet skrives med små bogstaver. Navnet kan efterfølgende tilpasses manuelt; en ny domæneændring eller import opdaterer det igen. Historien bruger “I har købt …”.

Måldomæne og OU-stier starter også tomme. Eleverne udfylder deres egne værdier eller anvender en AD-eksport. Ved gruppevalg kan også standardgrupper og beskyttede grupper vælges manuelt til øvelsen; de er tydeligt markeret og vælges aldrig automatisk. Klik på gruppen eller afkrydsningsfeltet, og tryk **Brug AD-oplysninger** for at overføre valgene til adgangspuljen.

Standardscenariet er opkøbet af **OnlyMAGS**, en fiktiv abonnementsplatform for digitale magasiner og tech-guides. 100 medarbejdere skal flyttes fra `onlymags.local` til elevernes AD og kunne arbejde mandag kl. 08.00. Historien bruger kontor- og IT-humor med sloganet “OnlyMAGS — premium content, proper permissions.” Virksomhedsnavn, domæner og medarbejderantal kan stadig tilpasses; fortællingen følger formularens værdier.

Eleverne indtaster kilde- og måldomæne samt rolleprofiler med afdeling, fuld OU-sti, faste sikkerhedsgrupper og forventede GPO’er. Hver medarbejder får en tilfældig rolle med lige sandsynlighed. Ekstra rettigheder trækkes uden gentagelse fra en fælles pulje skrevet som `Gruppenavn | Beskrivelse`; hver medarbejder får mellem 0 og det valgte maksimum. GPO-forventninger følger rollen og skal kontrolleres via OU-links og filtrering i AD.

Nye eksempeldata bruger engelske navne uden æ/ø/å: virksomheder, medarbejdernavne, roller, afdelinger, OU’er, grupper og adgangsbeskrivelser. Eksisterende AD-værdier bevares præcist ved import, også hvis de indeholder danske tegn. Tomme titler får forslaget `Employee`; faktiske jobtitler oversættes ikke.

Forhåndsvisningen kan søges og bladres. Download af `employees.csv` indeholder altid hele den genererede liste; ændringer i opsætningen kræver ny generering før download. CSV bruger UTF-8 med BOM, CRLF og valgfrit semikolon/komma. Felter med flere værdier (`Groups`, `Permissions`, `ExpectedGPOs`) bruger `|`. Alle felter citeres, og indlejrede anførselstegn escapes.

CSV-kolonner: `EmployeeID`, `GivenName`, `Surname`, `DisplayName`, `SourceCompany`, `SourceDomain`, `SourceUserPrincipalName`, `TargetCompany`, `TargetDomain`, `SamAccountName`, `UserPrincipalName`, `Department`, `Title`, `TargetOU`, `Groups`, `Permissions`, `ExpectedGPOs`. `Permissions` beskriver ekstra adgang; `Groups` indeholder både faste og ekstra grupper.

Generatoren kører lokalt i browseren uden API, lagring eller forbindelse til AD. Opsætningen nulstilles ved genindlæsning eller navigation væk. Navne og kontonavne er unikke inden for listen; valgfrie eksisterende SamAccountName-værdier kan reserveres. Elevernes importscript skal stadig kontrollere eksisterende AD-objekter, OU’er, grupper og UPN-suffiks. Der genereres ingen adgangskoder, og CSV’en flytter ikke SID’er eller konti automatisk.

Kør de fokuserede generatortests med `npm run test:csv` og kontrollér hele frontend med `npm run build`.

### Importér eksisterende AD-opsætning

Importen accepterer både en `.json`-fil og JSON indsat direkte i kodefeltet med syntaksfarver og linjenumre. Begge bruger samme validering og forhåndsvisning. Ved tekstimport vælges **Indlæs JSON-tekst**, og derefter **Brug AD-oplysninger**. Ændringer i teksten rydder forhåndsvisningen, så den skal indlæses igen; generatorens anvendte opsætning bevares indtil næste anvendelse. **Formatér JSON** giver to mellemrum pr. niveau; **Kopiér JSON** kopierer hele indholdet. Filimport vises også i kodefeltet. Formatering bevarer indholdet, inklusive ukendte ekstra felter.

På `/csv-generator` kan eleverne downloade og gennemse `scripts/Export-AdGeneratorConfig.ps1` i et PowerShell-kodefelt med kopierknap. Kør det i **Windows PowerShell 5.1** på en domænecontroller eller domænetilknyttet RSAT-pc med læseadgang:

```powershell
.\Export-AdGeneratorConfig.ps1 -OutputPath .\ad-config.json
```

Scriptet kræver `ActiveDirectory`; `GroupPolicy` er valgfrit. Det læser domæne, OU’er, sikkerhedsgrupper med beskrivelser, GPO-kandidater via OU-nedarvning, virksomhedsnavne og eksisterende SamAccountName-værdier (også deaktiverede konti). Rolleforslag grupperes efter aktive kontis titel, afdeling og OU og får kun fælles direkte sikkerhedsgrupper. Manglende titel/afdeling får redigerbare forslag. Konti i fx `CN=Users` giver ikke rolleforslag. Standardgrupper (RID < 1000) og grupper med `adminCount=1` markeres til manuel vurdering og indsættes ikke automatisk; markeringen er ikke en fuld klassifikation af privilegier.

JSON-formatet har `schemaVersion: 1`, `domain` (DNS-navn), `companies` (tekstliste), `ous` (`name`, `dn`, `gpos`), `groups` (`name`, `description`, `reviewOnly`), `roles` (`title`, `department`, `ou`, `groups`), `reservedUsernames` og `warnings`. Alle samlinger er arrays, også ved 0/1 elementer. Eksporten bruger to mellemrums indrykning og kompakte tomme arrays, også i PowerShell 5.1. Filen bruger UTF-8 med BOM; importen accepterer med/uden BOM og højst 5 MB. Importen validerer struktur, version og OU-/gruppereferencer, før opsætningen kan anvendes. Ingen indstillinger ændres ved en importfejl.

Eleverne vælger eksplicit grupper til puljen med ekstra adgang og anvender derefter eksporten. Den erstatter måldomæne, rolleprofiler, adgangspulje og reserverede kontonavne; opkøbsscenarie og antal bevares. OU’er og virksomhedsnavne er tilgængelige som inputforslag. Manglende GPO-modul eller læsefejl vises som bemærkninger, så en delvis eksport kan anvendes. GPO-kandidater er ikke Resultant Set of Policy: sikkerheds-/WMI-filtrering, bruger-/computerindstillinger og faktisk adgang skal kontrolleres særskilt. NTFS-, share- og applikations-ACL’er indsamles ikke.

Scriptet ændrer ingen AD-objekter og skriver kun JSON-filen. Der eksporteres ikke adgangskoder, personnavne eller individuelle medlemskabslister. Filen indeholder dog eksisterende kontonavne. Den bliver behandlet lokalt i browseren. Testpakken kører på Windows også det faktiske eksportscript i Windows PowerShell mod simulerede AD-cmdlets og kontrollerer eksport → import → generering, inklusive manglende GroupPolicy og delvise GPO-læsefejl.

## Præsentationstilstand

På `/ws2022` starter **Vis som slides**, `F5` eller `Shift+F5` et separat forløb med 21 slides: scriptstruktur, de fem faser med manuel sammenligning og kode, AD-resultat og afprøvning. Brug piletasterne til at skifte slide og `Esc` til at afslutte. Siden og slides bruger samme fasedata i `src/data/ws2022.ts`; det almindelige undervisningsforløb indeholder ikke WS2022-slides.

Underviseren kan starte et slide-show direkte fra sitet (PowerPoint-lignende):

| Genvej | Handling |
|--------|----------|
| `F5` | Start præsentation fra første slide |
| `Shift+F5` | Start fra aktuel side (Dag 1, Dag 2, Projektkobling osv.) |
| `→` / `Space` | Næste slide |
| `←` | Forrige slide |
| `Home` / `End` | Første / sidste slide |
| `Esc` | Afslut præsentation |

Slides bygges automatisk fra alt pensum på Dag 1, Dag 2 og Projektkobling i `src/data/buildPresentationSlides.ts` (~70 slides inkl. quiz, lokale opgaver, use cases med kørbare eksempler).
