import { Link } from 'react-router-dom';
import './ModuleCard.css';

type Accent = 'blue' | 'purple' | 'cyan' | 'yellow' | 'green';

interface ModuleCardProps {
  title: string;
  description: string;
  to?: string;
  anchor?: string;
  accent?: Accent;
}

export function ModuleCard({
  title,
  description,
  to,
  anchor,
  accent = 'blue',
}: ModuleCardProps) {
  const content = (
    <>
      <span className={`module-card-accent accent-${accent}`} aria-hidden />
      <h3>{title}</h3>
      <p>{description}</p>
      {to && <span className="module-card-arrow">→</span>}
    </>
  );

  if (to) {
    return (
      <Link
        to={anchor ? `${to}#${anchor}` : to}
        className={`module-card accent-${accent}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={`module-card accent-${accent}`}>{content}</div>;
}
