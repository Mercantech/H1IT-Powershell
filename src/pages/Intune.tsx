import { Link } from 'react-router-dom';
import { assets } from '../data/assets';
import { CodeBlock } from '../components/CodeBlock';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { intuneOverview } from '../data/diagrams';
import './Intune.css';

const psRelevance = [
  {
    title: 'Massehandlinger',
    text: 'I Intune-portalen klikker du én enhed ad gangen. Med PowerShell kan du opdatere, gruppere eller rapportere over hundredvis af enheder via pipeline og CSV.',
  },
  {
    title: 'Rapporter og dokumentation',
    text: 'Compliance-status, app-installationer og OS-versioner kan eksporteres til CSV — samme mønster som I lærer med Export-Csv og Select-Object.',
  },
  {
    title: 'Reproducerbar drift',
    text: 'Scripts i Git kan køres igen efter ferie, kollega-skift eller incident — præcis som med server-scripts. GUI-klik er svære at genskabe.',
  },
  {
    title: 'Microsoft Graph',
    text: 'Intune administreres via Microsoft Graph API. PowerShell-modulet Microsoft.Graph giver jer cmdlet-stil på cloud-ressourcer — samme tænkemåde som Get-Service og Get-CimInstance.',
  },
  {
    title: 'Script deployment',
    text: 'Intune kan køre PowerShell-scripts på klienter (compliance, remediering, opsætning). Det kræver at I kan skrive sikre scripts med fejlhåndtering.',
  },
];

const h1Parallels = [
  { h1: 'Pipeline og filtrering', intune: 'Find alle ikke-kompatible enheder og eksportér liste' },
  { h1: '-WhatIf / test først', intune: 'Test script lokalt og i pilotgruppe før bred udrulning' },
  { h1: 'Import-Csv / data som tabeller', intune: 'Bulk-opdater enhedsgrupper fra CSV' },
  { h1: 'Fjernadministration', intune: 'Cloud-baseret styring uden fysisk adgang til enheden' },
  { h1: 'Git og scripts', intune: 'Versionsstyring af Intune-relaterede scripts og rapporter' },
];

export function Intune() {
  return (
    <div className="container">
      <section className="intune-hero">
        <div className="intune-hero-bg" aria-hidden />
        <div className="intune-hero-content">
          <div className="intune-hero-logos">
            <img src={assets.intune} alt="Microsoft Intune" className="intune-hero-logo" />
            <span className="intune-hero-plus">+</span>
            <img src={assets.powershell} alt="PowerShell" className="intune-hero-logo intune-hero-logo-ps" />
          </div>
          <div className="intune-hero-text">
            <h1>PowerShell og Microsoft Intune</h1>
            <p>
              Mange elever møder PowerShell først på praktik eller job i forbindelse med
              Intune. Her er hvad det er — og hvorfor det I lærer i Serverautomatisering I
              stadig er relevant, selvom Intune er en cloud-løsning.
            </p>
          </div>
        </div>
      </section>

      <section className="module-section intune-note card">
        <p>
          <strong>Bemærk:</strong> Intune er ikke en del af jeres H1-infrastrukturprojekt
          (AD, DNS, DHCP, on-prem). Siden viser broen fra pensum til moderne
          arbejdspladsdrift — mange af jer vil bruge PowerShell til Intune i praksis.
        </p>
      </section>

      <section className="module-section">
        <h2>Hvad er Microsoft Intune?</h2>
        <p>
          <strong>Microsoft Intune</strong> er Microsofts cloud-baserede løsning til
          administration af enheder og apps — telefoner, tablets og Windows-PC&apos;er.
          Det hører under <em>Microsoft Endpoint Manager</em> og bruges til:
        </p>
        <ul>
          <li>Registrering og styring af virksomhedens enheder (MDM)</li>
          <li>Distribution af apps og opdateringer</li>
          <li>Compliance-politikker (krypteringskrav, OS-version, antivirus)</li>
          <li>Fjernsletning og sikkerhed ved tabt enhed</li>
          <li>Samarbejde med Entra ID (Azure AD) og Conditional Access</li>
        </ul>
        <p>
          I admin centeret gør I det meste via GUI — men når skalaen vokser (mange
          enheder, mange skoler/afdelinger), bliver PowerShell og Graph uundværlige.
        </p>
      </section>

      <section className="module-section">
        <h2>Helhedsdiagram</h2>
        <MermaidDiagram
          chart={intuneOverview}
          title="Intune, Graph og PowerShell i sammenhæng"
        />
      </section>

      <section className="module-section">
        <h2>Hvorfor er PowerShell stadig relevant?</h2>
        <p>
          Intune er &quot;moderne og cloud&quot; — men driftsteam bruger stadig PowerShell
          dagligt. Ikke fordi GUI er dårligt, men fordi <strong>gentagelse, skala og
          dokumentation</strong> kræver automatisering.
        </p>
        <div className="intune-grid">
          {psRelevance.map((item) => (
            <div key={item.title} className="card intune-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="module-section">
        <h2>Eksempler med Microsoft Graph PowerShell</h2>
        <p>
          Intune-data hentes typisk via <code>Microsoft.Graph</code>-modulet (efter
          <code>Connect-MgGraph</code> med de rigtige rettigheder). Principperne er de
          samme som på servere — <strong>get, filtrér, eksporter</strong>.
        </p>
        <CodeBlock
          title="Intune enheder"
          code={`# Kræver Microsoft.Graph og tilkobling til tenant
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.Read.All"

Get-MgDeviceManagementManagedDevice |
    Select-Object DeviceName, OperatingSystem, ComplianceState |
    Export-Csv .\\enheder.csv -NoTypeInformation`}
          showPrompt={false}
        />
        <CodeBlock
          title="Filtrér ikke-kompatible enheder"
          code={`Get-MgDeviceManagementManagedDevice |
    Where-Object { $_.ComplianceState -ne "compliant" } |
    Select-Object DeviceName, UserPrincipalName, ComplianceState`}
          showPrompt={false}
        />
        <CodeBlock
          title="Script til enheder via Intune"
          code={`# Eksempel på remedieringsscript (køres på klienten via Intune)
# Test ALTID lokalt og i lille pilotgruppe først!

$path = "C:\\ProgramData\\Firma"
if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force
}
# Log til Intune rapport
Write-Output "Mappe oprettet: $path"`}
          showPrompt={false}
        />
      </section>

      <section className="module-section">
        <h2>Paralleller til det I lærer i faget</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Serverautomatisering I</th>
              <th>Intune i praksis</th>
            </tr>
          </thead>
          <tbody>
            {h1Parallels.map((row) => (
              <tr key={row.h1}>
                <td>{row.h1}</td>
                <td>{row.intune}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="module-section">
        <h2>GUI vs. PowerShell i Intune</h2>
        <p>
          Brug <strong>Intune admin center</strong> til at forstå politikker, teste på
          én enhed og læse dokumentation. Brug <strong>PowerShell</strong> når du skal:
        </p>
        <ul>
          <li>rapportér til ledelse eller sikkerhed (CSV/Excel)</li>
          <li>opdatere mange enheder eller grupper på én gang</li>
          <li>automatisere noget I gør hver uge</li>
          <li>gemme og reviewe ændringer i Git</li>
        </ul>
        <p>
          Det er samme beslutning som med AD og servere — se også{' '}
          <Link to="/projekt">Projektkobling</Link> om GUI vs. script.
        </p>
      </section>

      <div className="cta-box">
        <h3>Vil du øve det I lærer?</h3>
        <p>
          Intune kræver en rigtig Microsoft-tenant — brug lokale opgaver og
          infrastrukturprojektet til at bygge fundamentet. Så er I klar når praktikken
          kalder på Graph og Intune.
        </p>
        <div className="intune-cta-links">
          <Link to="/dag-1#lokale-opgaver" className="btn btn-primary">
            Lokale opgaver på Dag 1
          </Link>
          <Link to="/ordbog" className="btn btn-secondary">
            Ordbog
          </Link>
          <Link to="/dag-2#data" className="btn btn-secondary">
            Datahåndtering
          </Link>
        </div>
      </div>
    </div>
  );
}
