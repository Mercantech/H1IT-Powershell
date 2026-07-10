import type { ReactNode } from 'react';
import { assets } from '../../data/assets';
import './ToolCard.css';

interface ToolCardProps {
  name: string;
  icon: keyof typeof assets;
  children: ReactNode;
  hint?: string;
  variant?: 'default' | 'git';
}

export function ToolCard({ name, icon, children, hint, variant = 'default' }: ToolCardProps) {
  return (
    <div className={`tool-card ${variant === 'git' ? 'tool-card-git' : ''}`}>
      <div className="tool-card-icon-wrap">
        <img src={assets[icon]} alt="" className="tool-card-icon" />
      </div>
      <div className="tool-card-body">
        <h3>{name}</h3>
        {children}
        {hint && <p className="tool-card-hint">{hint}</p>}
      </div>
    </div>
  );
}
