import { Link } from 'react-router-dom';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { ModuleCard } from '../components/ModuleCard';
import { learningGoals, goalModuleMap } from '../data/learningGoals';
import { overviewFlow, siteFlow } from '../data/diagrams';
import './Home.css';

export function Home() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>PowerShell — H1 IT</h1>
        <p>
          Interaktiv læringsside til PowerShell-undervisningen som del af
          infrastruktur- og cyberforløbet. PowerShell dækkes over 2 dage
          (uge 37–38) og kobles direkte på jeres samlede infrastrukturprojekt.
        </p>
      </header>

      <MermaidDiagram chart={overviewFlow} title="Undervisningsforløb" />

      <section>
        <h2>Undervisningsdage</h2>
        <div className="card-grid">
          <ModuleCard
            title="Dag 1 — Grundlæggende"
            description="Cmdlets, hjælpefunktioner, pipeline, variabler og aliases. Uge 37, 10. september."
            to="/dag-1"
          />
          <ModuleCard
            title="Dag 2 — Sikkerhed og anvendelse"
            description="Sikker scripting, fjernadministration, WBEM/CIM og datahåndtering. Uge 38, 17. september."
            to="/dag-2"
          />
          <ModuleCard
            title="Projektkobling"
            description="Se hvordan PowerShell integreres i jeres infrastrukturprojekt med konkrete use cases."
            to="/projekt"
          />
        </div>
      </section>

      <section>
        <h2>Læringsmål</h2>
        <p>Alle mål fra pensum — og hvilke moduler der dækker dem:</p>
        <ul className="goal-list">
          {learningGoals.map((goal) => (
            <li key={goal.id}>
              <strong>Mål {goal.id}:</strong> {goal.text}
              <br />
              <span className="goal-modules">
                {goalModuleMap[goal.id]?.join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <MermaidDiagram chart={siteFlow} title="Fra teori til projekt" />

      <div className="cta-box">
        <h3>Klar til at koble PowerShell på jeres projekt?</h3>
        <p>
          Se konkrete eksempler på hvordan scripting bruges i AD, backup,
          netværk og serverdrift.
        </p>
        <Link to="/projekt" className="btn btn-primary">
          Gå til Projektkobling →
        </Link>
      </div>
    </div>
  );
}
