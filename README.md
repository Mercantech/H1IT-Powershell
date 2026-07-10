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
- `/projekt` — Projektkobling med use cases, deployment og projektopgaver
- `/ordbog` — Opslagsguide til PowerShell-begreber
- `/intune` — PowerShell og Microsoft Intune (bro til praktik/job)

## Præsentationstilstand

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
