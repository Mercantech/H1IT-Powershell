import { Link } from 'react-router-dom';
import './ModuleCard.css';

interface ModuleCardProps {
  title: string;
  description: string;
  to?: string;
  anchor?: string;
}

export function ModuleCard({ title, description, to, anchor }: ModuleCardProps) {
  const content = (
    <>
      <h3>{title}</h3>
      <p>{description}</p>
    </>
  );

  if (to) {
    return (
      <Link to={anchor ? `${to}#${anchor}` : to} className="module-card">
        {content}
      </Link>
    );
  }

  return <div className="module-card">{content}</div>;
}
