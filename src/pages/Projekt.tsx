import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { projectOverview, projectWorkflow } from '../data/diagrams';
import { guiVsScript, projectUseCases } from '../data/projectUseCases';
import { projectExercise } from '../data/exercises';

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
          infrastruktur — med kode I kan tilpasse til jeres case.
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
            <CodeBlock code={uc.code} title={uc.title} showPrompt={false} />
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
