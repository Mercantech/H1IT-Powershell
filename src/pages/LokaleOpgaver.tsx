import { Link } from 'react-router-dom';
import { ToolCard } from '../components/ToolCard';
import { assets } from '../data/assets';
import {
  environmentLabels,
  localExercises,
  phaseLabels,
  toolLabels,
  type LocalExercisePhase,
} from '../data/localExercises';
import './LokaleOpgaver.css';

function ExerciseCard({ exercise }: { exercise: (typeof localExercises)[0] }) {
  return (
    <article id={exercise.id} className="lokal-opgave card">
      <div className="lokal-opgave-meta">
        <span className="lokal-badge lokal-badge-phase">{phaseLabels[exercise.phase]}</span>
        <span className="lokal-badge">{environmentLabels[exercise.environment]}</span>
        <span className="lokal-badge lokal-badge-tool">{toolLabels[exercise.tool]}</span>
      </div>
      <h3>{exercise.title}</h3>
      <p>{exercise.description}</p>
      <ol className="lokal-steps">
        {exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="lokal-deliverable">
        <strong>Aflevering:</strong> {exercise.deliverable}
      </p>
      <Link to={exercise.relatedLink} className="project-link">
        → Relateret teori på sitet
      </Link>
    </article>
  );
}

export function LokaleOpgaver() {
  const phases: LocalExercisePhase[] = ['dag-1', 'dag-2', 'projekt'];

  return (
    <div className="container">
      <header className="page-header">
        <h1>Lokale opgaver</h1>
        <p>
          Disse opgaver tager jer ud af hjemmesiden og ned i jeres eget miljø — på
          PC eller i driftsetup. Brug dem til at øve det I læser på sitet.
        </p>
      </header>

      <section className="lokal-anbefaling card">
        <h2>Anbefalede værktøjer</h2>
        <div className="lokal-tools">
          <ToolCard
            name="PowerShell-terminalen"
            icon="powershell"
            hint="God til: Get-Help, pipeline, -WhatIf, Invoke-Command"
          >
            <p>
              Brug terminalen når du <strong>skriver og tester</strong> enkeltlinjer,
              pipeliner og hurtige kommandoer. Åbn PowerShell 7 eller Windows
              PowerShell — skriv direkte og se resultatet med det samme.
            </p>
          </ToolCard>
          <ToolCard
            name="Visual Studio Code"
            icon="vscode"
            hint="God til: projektscripts, CSV-arbejde, rapport-eksempler"
          >
            <p>
              Brug VS Code når du laver <strong>scripts (.ps1)</strong> med flere
              linjer, kommentarer og genbrugelig logik. Installér PowerShell-extensionen
              for syntax highlight, kørsel og fejlfindning.
            </p>
          </ToolCard>
        </div>
      </section>

      <section className="lokal-git card">
        <div className="lokal-git-header">
          <img src={assets.git} alt="" className="lokal-git-logo" />
          <h2>Git — ikke pensum, men stærkt anbefalet</h2>
        </div>
        <p>
          Det står ikke i pensum at I <em>skal</em> bruge Git — men vi anbefaler på det
          kraftigste at I lægger <strong>al jeres kode i et Git-repo</strong> (GitHub,
          GitLab eller jeres skoles løsning).
        </p>
        <ul>
          <li>Scripts og noter samles ét sted — ikke spredt i Downloads</li>
          <li>I kan se historik: hvad ændrede I, og hvorfor?</li>
          <li>Projektgruppen kan dele og reviewe kode</li>
          <li>På <strong>H2</strong> genbruger mange det samme — scripts, snippets og erfaringer fra H1</li>
        </ul>
        <p className="lokal-git-foot">
          Minimum: en mappe med <code>scripts/</code>, README og regelmæssige commits.
          Det gør jer klar til praktik og H2 uden at starte forfra.
        </p>
      </section>

      {phases.map((phase) => {
        const items = localExercises.filter((e) => e.phase === phase);
        return (
          <section key={phase} className="module-section">
            <h2>{phaseLabels[phase]}</h2>
            <div className="lokal-list">
              {items.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="cta-box">
        <h3>Mangler du et begreb?</h3>
        <p>Slå op i ordbogen eller gå tilbage til teori på Dag 1 / Dag 2.</p>
        <div className="lokal-cta-links">
          <Link to="/ordbog" className="btn btn-secondary">
            Ordbog
          </Link>
          <Link to="/dag-1" className="btn btn-secondary">
            Dag 1
          </Link>
          <Link to="/projekt" className="btn btn-primary">
            Projektkobling
          </Link>
        </div>
      </div>
    </div>
  );
}
