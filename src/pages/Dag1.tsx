import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { LocalExercisesSection } from '../components/LocalExercisesSection';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { ModuleVideos } from '../components/ModuleVideos';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { Quiz } from '../components/Quiz';
import { beginnerPlaylistUrl } from '../data/videos';
import { dag1Exercises } from '../data/exercises';
import { pipelineExample } from '../data/diagrams';
import { dag1Quiz } from '../data/quizzes/dag1';

export function Dag1() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Dag 1 — Grundlæggende</h1>
        <p>
          Uge 37 · 10. september. Cmdlets, pipeline, variabler og aliases.
          Supplerende videoer er indlejret under de relevante moduler.
        </p>
      </header>

      <section id="intro" className="module-section">
        <h2>Introduktion</h2>
        <p>
          PowerShell er Microsofts kommandolinje og scripting-sprog til
          automatisering af Windows-administration. I jeres infrastrukturprojekt
          bruges det til at automatisere gentagne opgaver, som ellers ville
          tage lang tid via GUI.
        </p>
        <p>
          <strong>Shell vs. GUI:</strong> GUI er godt til engangsopgaver og
          visuel oversigt. PowerShell er stærkt når opgaver gentages, skal
          dokumenteres eller køres på mange servere.
        </p>
        <div className="module-note card">
          <p>
            <strong>Windows PowerShell 5.1 vs. PowerShell 7:</strong> I lab og
            på Windows Server møder I typisk <strong>5.1</strong> (indbygget).
            PowerShell 7 er cross-platform og aktivt udviklet — fint på egen PC.
            <strong> ISE</strong> er forældet; brug <strong>Windows Terminal</strong>{' '}
            til kommandoer og <strong>VS Code</strong> til scripts.
          </p>
        </div>
        <CodeBlock code="Get-ComputerInfo | Select-Object WindowsProductName, OsArchitecture" />
        <ModuleVideos module="intro" />
        <Link to="/projekt#serverdrift" className="project-link">
          → Se projektkobling: Serverdrift
        </Link>
      </section>

      <section id="cmdlets" className="module-section">
        <h2>Cmdlets og hjælp</h2>
        <p>
          Cmdlets følger verb-substantiv-mønsteret: <code>Get-Process</code>,{' '}
          <code>Set-Service</code>, <code>New-Item</code>. Brug de indbyggede
          hjælpefunktioner til at lære nye cmdlets:
        </p>
        <CodeBlock
          code={`Get-Help Get-Service -Examples
Get-Command -Noun Service
Get-Command -Verb Get | Select-Object -First 10`}
        />
        <ul>
          <li>
            <code>Get-Help</code> — dokumentation og eksempler
          </li>
          <li>
            <code>Get-Command</code> — find cmdlets, funktioner og aliases
          </li>
          <li>
            <code>Get-Member</code> — se egenskaber og metoder på objekter
          </li>
        </ul>
      </section>

      <section id="pipeline" className="module-section">
        <h2>Pipeline</h2>
        <p>
          Pipeline-operatoren <code>|</code> sender output fra én cmdlet videre
          som input til næste. Det er kernen i PowerShells styrke.
        </p>
        <MermaidDiagram chart={pipelineExample} title="Pipeline-eksempel" />
        <CodeBlock
          code={`Get-Service | Where-Object { $_.Status -eq "Stopped" } | Select-Object Name, Status`}
        />
        <PipelineVisualizer />
        <h3>Formatering af output</h3>
        <p>
          Pipeline returnerer objekter — formaterings-cmdlets styrer hvordan de
          vises. Brug dem til rapporter og overblik, ikke som del af en ny
          pipeline (output stopper her).
        </p>
        <CodeBlock
          code={`Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 |
    Format-Table Name, CPU, WorkingSet -AutoSize

Get-Service DNS | Format-List *

Get-Process | Out-GridView   # grafisk filter (kun Windows)

Get-ChildItem C:\\Windows\\System32 -File -ErrorAction SilentlyContinue |
    Measure-Object -Property Length -Sum`}
        />
        <ul>
          <li>
            <code>Format-Table</code> — kompakt tabel, god til overblik
          </li>
          <li>
            <code>Format-List</code> — én egenskab per linje, god til detaljer
          </li>
          <li>
            <code>Out-GridView</code> — søgbar GUI-tabel (Windows)
          </li>
          <li>
            <code>Measure-Object</code> — summer, tæller, gennemsnit
          </li>
        </ul>
        <ModuleVideos module="pipeline" />
        <Link to="/projekt#dns-dhcp" className="project-link">
          → Se projektkobling: DNS og DHCP
        </Link>
      </section>

      <section id="variabler" className="module-section">
        <h2>Variabler og aliases</h2>
        <p>
          Variabler oprettes med <code>$</code> og kan gemme alt fra tekst til
          objekter fra pipelinen:
        </p>
        <CodeBlock
          code={`$server = "DC01"
$services = Get-Service | Where-Object Status -eq "Running"
$services.Count

# Alias — kort navn for en cmdlet
Set-Alias -Name svc -Value Get-Service
svc`}
        />
        <p>
          <strong>Vigtigt:</strong> Et alias er kun et alternativt navn — det
          indeholder ingen logik. Brug funktioner når du har brug for
          genbrugelig kode.
        </p>
        <ModuleVideos module="variabler" />
      </section>

      <section id="scriptlogik" className="module-section">
        <h2>Betingelser og løkker</h2>
        <p>
          Supplerende pensum til scripts der skal træffe valg eller gentage
          handlinger — nyttigt når I bygger automatisering til projektet.
        </p>
        <CodeBlock
          code={`# Betingelse
$tal = 42
if ($tal -gt 10) { "Stor" } else { "Lille" }

# foreach — når du kender listen
$liste = @("Alpha", "Beta", "Gamma")
foreach ($item in $liste) {
    Write-Host "Element: $item"
}

# ForEach-Object — direkte i pipeline
1..5 | ForEach-Object { Write-Host "Nummer: $_" }

# Funktion med parametre
function Hilsen {
    param($Navn)
    Write-Host "Hej, $Navn!"
}
Hilsen -Navn "Elev01"`}
        />
        <ModuleVideos module="scriptlogik" />
        <p className="module-video-playlist">
          Hele playlisten:{' '}
          <a href={beginnerPlaylistUrl} target="_blank" rel="noreferrer">
            Beginner PowerShell 7 Tutorials på YouTube
          </a>
        </p>
      </section>

      <section id="øvelser" className="module-section">
        <h2>Øvelser</h2>
        <p>Test din viden med disse kodeøvelser:</p>
        {dag1Exercises.map((ex) => (
          <CodeExercise key={ex.id} exercise={ex} />
        ))}
        <Quiz questions={dag1Quiz} title="Dag 1 — Quiz" />
      </section>

      <LocalExercisesSection phase="dag-1" showToolIntro showGitSection />

      <div className="cta-box">
        <h3>Klar til Dag 2?</h3>
        <p>
          Fortsæt med sikker scripting, fjernadministration og datahåndtering —
          eller kig forud på projektkoblingen.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dag-2" className="btn btn-primary">
            Dag 2 →
          </Link>
          <Link to="/projekt" className="btn btn-secondary">
            Projektkobling
          </Link>
        </div>
      </div>
    </div>
  );
}
