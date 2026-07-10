import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { Quiz } from '../components/Quiz';
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
        <CodeBlock code="Get-ComputerInfo | Select-Object WindowsProductName, OsArchitecture" />
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
      </section>

      <section id="øvelser" className="module-section">
        <h2>Øvelser</h2>
        <p>Test din viden med disse kodeøvelser:</p>
        {dag1Exercises.map((ex) => (
          <CodeExercise key={ex.id} exercise={ex} />
        ))}
        <Quiz questions={dag1Quiz} title="Dag 1 — Quiz" />
      </section>

      <div className="cta-box">
        <h3>Øv i jeres eget miljø</h3>
        <p>
          Gå videre til lokale opgaver på PC eller i driftsetup — terminal til test,
          VS Code til scripts.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/lokalt" className="btn btn-primary">
            Lokale opgaver →
          </Link>
          <Link to="/dag-2" className="btn btn-secondary">
            Dag 2
          </Link>
          <Link to="/projekt" className="btn btn-secondary">
            Projektkobling
          </Link>
        </div>
      </div>
    </div>
  );
}
