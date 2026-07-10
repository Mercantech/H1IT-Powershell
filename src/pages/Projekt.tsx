import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { LocalExercisesSection } from '../components/LocalExercisesSection';
import { UseCaseRunner } from '../components/UseCaseRunner';
import {
  cronExample,
  deploymentBestPractices,
  deploymentMethods,
  taskSchedulerCode,
} from '../data/deploymentGuide';
import { projectOverview, projectWorkflow } from '../data/diagrams';
import { guiVsScript, projectUseCases } from '../data/projectUseCases';
import { projectExercise } from '../data/exercises';
import './Projekt.css';

export function Projekt() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Projektkobling</h1>
        <p>
          Hvordan PowerShell integreres i jeres H1-infrastrukturprojekt — fra
          kravspecifikation til dokumentation og fremlæggelse.
        </p>
      </header>

      <section id="helhedsdiagram" className="module-section">
        <h2>Helhedsdiagram</h2>
        <p>
          PowerShell er bindeleddet mellem jeres tekniske infrastruktur og
          automatisering af drift, overvågning og dokumentation.
        </p>
        <MermaidDiagram chart={projectOverview} title="PowerShell i infrastrukturprojektet" />
      </section>

      <section className="module-section">
        <h2>Arbejdsgang</h2>
        <p>
          Sådan bør I tænke PowerShell ind i jeres projektforløb — altid med
          sikker test før produktion:
        </p>
        <MermaidDiagram chart={projectWorkflow} title="Fra krav til fremlæggelse" />
      </section>

      <section id="gui-vs-script" className="module-section">
        <h2>Hvornår GUI vs. script?</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Situation</th>
              <th>GUI</th>
              <th>PowerShell</th>
            </tr>
          </thead>
          <tbody>
            {guiVsScript.map((row) => (
              <tr key={row.situation}>
                <td>{row.situation}</td>
                <td>{row.gui}</td>
                <td>{row.script}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="use-cases" className="module-section">
        <h2>Konkrete use cases</h2>
        <p>
          Her er eksempler på hvordan PowerShell bruges i hver del af jeres
          infrastruktur — med kode I kan tilpasse til jeres case. Klik{' '}
          <strong>Kør eksempel</strong> for at se simuleret output.
        </p>
        {projectUseCases.map((uc) => (
          <div key={uc.id} id={uc.id} className="card module-section">
            <h3>
              {uc.title}{' '}
              <span style={{ color: 'var(--ps-text-muted)', fontWeight: 400 }}>
                ({uc.component})
              </span>
            </h3>
            <p>{uc.description}</p>
            <UseCaseRunner
              title={uc.title}
              code={uc.code}
              sampleOutput={uc.sampleOutput}
            />
            <Link to={uc.relatedModule} className="project-link">
              → Gå til relateret modul
            </Link>
          </div>
        ))}
      </section>

      <section className="module-section">
        <h2>Mini-opgave — projektrelevans</h2>
        <p>
          Prøv denne opgave der direkte relaterer til jeres infrastrukturprojekt:
        </p>
        <CodeExercise exercise={projectExercise} />
      </section>

      <LocalExercisesSection phase="projekt" />

      <section id="deployment" className="module-section">
        <h2>Fra script til drift — planlægning og deployment</h2>
        <p>
          Et script i VS Code er ikke færdigt, før det kører pålideligt i jeres
          miljø. I infrastrukturprojektet handler deployment typisk om at{' '}
          <strong>planlægge</strong> kørslen, <strong>sikre</strong> rettigheder
          og <strong>logge</strong> resultater — ikke om at klikke Run manuelt hver
          gang.
        </p>

        <div className="deployment-methods">
          {deploymentMethods.map((method) => (
            <article key={method.title} className="deployment-card card">
              <h3>{method.title}</h3>
              <p className="deployment-card-subtitle">{method.subtitle}</p>
              <p>{method.text}</p>
              <p className="deployment-card-when">
                <strong>Brug når:</strong> {method.when}
              </p>
            </article>
          ))}
        </div>

        <h3>Windows: Opgaveplanlægning (Task Scheduler)</h3>
        <p>
          På Windows-servere i jeres projekt er Task Scheduler det mest brugte
          værktøj — tilsvarende <em>cron</em> på Linux. Scriptet ligger som
          <code>.ps1</code>-fil på disk; opgaven angiver tidspunkt, konto og
          eventuelle genstart ved fejl.
        </p>
        <CodeBlock
          code={taskSchedulerCode}
          title="Register-ScheduledTask"
          showPrompt={false}
        />

        <h3>Linux: cron (hvis I har Linux-servere)</h3>
        <p>
          Har I Linux i netværks- eller serverdelen, planlægges scripts med{' '}
          <code>crontab</code>. PowerShell 7 (<code>pwsh</code>) kan installeres
          på Linux — samme scripts, anden scheduler.
        </p>
        <CodeBlock code={cronExample} title="crontab" showPrompt={false} />

        <h3>Best practice før produktion</h3>
        <ul className="deployment-checklist">
          {deploymentBestPractices.map((item) => (
            <li key={item.title}>
              <strong>{item.title}:</strong> {item.text}
            </li>
          ))}
        </ul>

        <div className="deployment-links card">
          <p>
            <strong>Relateret pensum:</strong>{' '}
            <Link to="/dag-2#sikkerhed">Sikker scripting</Link> (-WhatIf,
            transcript) · <Link to="/dag-2#fjernadmin">Fjernadministration</Link>{' '}
            (Invoke-Command) · <Link to="/dag-1#lokale-opgaver">Lokale opgaver</Link>{' '}
            (Git og VS Code) · <Link to="/intune">Intune</Link> (script deployment på
            enheder)
          </p>
        </div>
      </section>

      <div className="cta-box">
        <h3>Manglende teori?</h3>
        <p>Gå tilbage til undervisningsmodulerne for at dykke dybere ned.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dag-1" className="btn btn-secondary">
            ← Dag 1
          </Link>
          <Link to="/dag-2" className="btn btn-secondary">
            ← Dag 2
          </Link>
        </div>
      </div>
    </div>
  );
}
