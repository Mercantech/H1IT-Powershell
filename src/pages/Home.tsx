import { course } from '../data/course';
import { assets } from '../data/assets';
import { Link } from 'react-router-dom';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { ModuleCard } from '../components/ModuleCard';
import { SiteFlowDiagram } from '../components/SiteFlowDiagram';
import { learningGoals, goalModuleMap } from '../data/learningGoals';
import { overviewFlow } from '../data/diagrams';
import './Home.css';

export function Home() {
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <div className="hero-logo-wrap">
            <img
              src={assets.powershell}
              alt="PowerShell"
              className="hero-logo"
            />
          </div>
          <div className="hero-text">
            <p className="hero-eyebrow">{course.fullName}</p>
            <h1 className="hero-title">
              Lær <span className="hero-highlight">{course.topic}</span> til
              serverautomatisering
            </h1>
            <p className="hero-desc">
              Interaktiv læring til {course.title} som del af {course.program}.
              To undervisningsdage ({course.teachingPeriod}) — koblet direkte på
              jeres infrastrukturprojekt.
            </p>
            <div className="hero-actions">
              <Link to="/dag-1" className="btn btn-primary btn-glow">
                Start Dag 1
              </Link>
              <Link to="/lokalt" className="btn btn-secondary">
                Lokale opgaver
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MermaidDiagram chart={overviewFlow} title="Undervisningsforløb" />

      <section>
        <h2>Undervisningsdage</h2>
        <div className="card-grid">
          <ModuleCard
            title="Dag 1 — Grundlæggende"
            description="Cmdlets, hjælpefunktioner, pipeline, variabler og aliases. Uge 37, 10. september."
            to="/dag-1"
            accent="blue"
          />
          <ModuleCard
            title="Dag 2 — Sikkerhed og anvendelse"
            description="Sikker scripting, fjernadministration, WBEM/CIM og datahåndtering. Uge 38, 17. september."
            to="/dag-2"
            accent="purple"
          />
          <ModuleCard
            title="Projektkobling"
            description="Se hvordan PowerShell integreres i jeres infrastrukturprojekt med konkrete use cases."
            to="/projekt"
            accent="cyan"
          />
          <ModuleCard
            title="Ordbog"
            description="Hurtig opslagsguide til PowerShell-begreber som -WhatIf, pipeline, cmdlets og mere."
            to="/ordbog"
            accent="yellow"
          />
          <ModuleCard
            title="Lokale opgaver"
            description="Øvelser på jeres PC eller i driftsetup — terminal, VS Code og Git-anbefaling."
            to="/lokalt"
            accent="green"
          />
          <ModuleCard
            title="Intune og PowerShell"
            description="Hvad Intune er, og hvorfor PowerShell stadig bruges i moderne endpoint-styring."
            to="/intune"
            accent="blue"
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

      <SiteFlowDiagram />

      <div className="cta-box">
        <h3>Klar til at koble PowerShell på jeres projekt?</h3>
        <p>
          Se konkrete eksempler på hvordan scripting bruges i AD, backup,
          netværk og serverdrift.
        </p>
        <Link to="/projekt" className="btn btn-primary btn-glow">
          Gå til Projektkobling →
        </Link>
      </div>
    </div>
  );
}
