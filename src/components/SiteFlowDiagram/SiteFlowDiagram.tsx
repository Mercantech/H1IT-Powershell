import { Link } from 'react-router-dom';
import './SiteFlowDiagram.css';

interface FlowItem {
  label: string;
  to: string;
}

interface FlowGroup {
  title: string;
  accent: 'blue' | 'purple' | 'cyan';
  to?: string;
  items: FlowItem[];
}

const flowGroups: FlowGroup[] = [
  {
    title: 'Dag 1 Moduler',
    accent: 'blue',
    to: '/dag-1',
    items: [
      { label: 'Intro', to: '/dag-1#intro' },
      { label: 'Cmdlets', to: '/dag-1#cmdlets' },
      { label: 'Pipeline', to: '/dag-1#pipeline' },
      { label: 'Variabler', to: '/dag-1#variabler' },
    ],
  },
  {
    title: 'Dag 2 Moduler',
    accent: 'purple',
    to: '/dag-2',
    items: [
      { label: 'Sikkerhed', to: '/dag-2#sikkerhed' },
      { label: 'Fjernadmin', to: '/dag-2#fjernadmin' },
      { label: 'WBEM', to: '/dag-2#wbem' },
      { label: 'Data', to: '/dag-2#data' },
    ],
  },
  {
    title: 'Projektkobling',
    accent: 'cyan',
    to: '/projekt',
    items: [
      { label: 'Helhedsdiagram', to: '/projekt#helhedsdiagram' },
      { label: 'Use cases', to: '/projekt#use-cases' },
      { label: 'GUI vs Script', to: '/projekt#gui-vs-script' },
    ],
  },
];

export function SiteFlowDiagram() {
  return (
    <section className="site-flow" aria-labelledby="site-flow-title">
      <h2 id="site-flow-title" className="site-flow-title">
        Fra teori til projekt
      </h2>

      <div className="site-flow-track">
        {flowGroups.map((group, index) => (
          <div key={group.title} className="site-flow-step">
            <article className={`site-flow-group accent-${group.accent}`}>
              {group.to ? (
                <Link to={group.to} className="site-flow-group-title">
                  {group.title}
                </Link>
              ) : (
                <h3 className="site-flow-group-title">{group.title}</h3>
              )}
              <ul className="site-flow-items">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </article>

            {index < flowGroups.length - 1 && (
              <div className="site-flow-arrow" aria-hidden>
                <span className="site-flow-arrow-line" />
                <span className="site-flow-arrow-head">→</span>
              </div>
            )}
          </div>
        ))}

        <div className="site-flow-step site-flow-step--outcome">
          <div className="site-flow-arrow site-flow-arrow--final" aria-hidden>
            <span className="site-flow-arrow-line" />
            <span className="site-flow-arrow-head">→</span>
          </div>
          <div className="site-flow-outcome">
            <span className="site-flow-outcome-label">Resultat</span>
            <p>Projektrapport og fremlæggelse</p>
          </div>
        </div>
      </div>
    </section>
  );
}
