import { Link } from 'react-router-dom';
import { ToolCard } from '../ToolCard';
import { assets } from '../../data/assets';
import {
  environmentLabels,
  getLocalExercisesForPhase,
  toolLabels,
  type LocalExercise,
  type LocalExercisePhase,
} from '../../data/localExercises';
import './LocalExercisesSection.css';

interface LocalExercisesSectionProps {
  phase: LocalExercisePhase;
  showToolIntro?: boolean;
  showGitSection?: boolean;
}

function ExerciseCard({ exercise }: { exercise: LocalExercise }) {
  return (
    <article id={exercise.id} className="lokal-opgave card">
      <div className="lokal-opgave-meta">
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

export function LocalExercisesSection({
  phase,
  showToolIntro = false,
  showGitSection = false,
}: LocalExercisesSectionProps) {
  const exercises = getLocalExercisesForPhase(phase);

  return (
    <section id="lokale-opgaver" className="module-section">
      <h2>Lokale opgaver</h2>
      <p>
        {phase === 'dag-1' &&
          'Tag teorien med ud af browseren og øv på din PC — terminal til kommandoer, VS Code til scripts.'}
        {phase === 'dag-2' &&
          'Øv sikker scripting, data og fjernadministration på PC eller i jeres driftsetup/lab.'}
        {phase === 'projekt' &&
          'Kobl scripting direkte på jeres infrastrukturprojekt — scripts, Git og dokumentation til rapporten.'}
      </p>

      {showToolIntro && (
        <div className="lokal-anbefaling card">
          <h3>Anbefalede værktøjer</h3>
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
        </div>
      )}

      {showGitSection && (
        <div className="lokal-git card">
          <div className="lokal-git-header">
            <img src={assets.git} alt="" className="lokal-git-logo" />
            <h3>Git — ikke pensum, men stærkt anbefalet</h3>
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
        </div>
      )}

      <div className="lokal-list">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  );
}
