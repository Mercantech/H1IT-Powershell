import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import {
  filterGlossaryEntries,
  glossaryCategories,
  glossaryEntries,
  type GlossaryEntry,
} from '../data/glossary';
import './Ordbog.css';

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  return (
    <article id={entry.id} className="ordbog-entry card">
      <div className="ordbog-entry-header">
        <h3>{entry.term}</h3>
        <span className="ordbog-category">{glossaryCategories[entry.category]}</span>
      </div>
      <p className="ordbog-summary">{entry.summary}</p>
      <p className="ordbog-detail">{entry.detail}</p>
      {entry.example && (
        <CodeBlock code={entry.example} title={entry.term} showPrompt={false} />
      )}
      {entry.relatedLink && (
        <Link to={entry.relatedLink} className="project-link">
          → Læs mere i undervisningsmaterialet
        </Link>
      )}
    </article>
  );
}

export function Ordbog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<GlossaryEntry['category'] | 'alle'>('alle');

  const filtered = useMemo(() => {
    let entries = filterGlossaryEntries(glossaryEntries, query);
    if (category !== 'alle') {
      entries = entries.filter((e) => e.category === category);
    }
    return entries.sort((a, b) => a.term.localeCompare(b.term, 'da'));
  }, [query, category]);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Ordbog</h1>
        <p>
          Hurtig opslagsguide til vigtige PowerShell-begreber. Søg efter f.eks.
          &quot;WhatIf&quot;, &quot;pipeline&quot; eller &quot;CSV&quot;.
        </p>
      </header>

      <div className="ordbog-toolbar card">
        <label className="ordbog-search-label" htmlFor="ordbog-search">
          Søg
        </label>
        <input
          id="ordbog-search"
          type="search"
          className="ordbog-search"
          placeholder="Søg i ordbogen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="ordbog-filters">
          <button
            type="button"
            className={`ordbog-filter ${category === 'alle' ? 'active' : ''}`}
            onClick={() => setCategory('alle')}
          >
            Alle
          </button>
          {(Object.entries(glossaryCategories) as [GlossaryEntry['category'], string][]).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                className={`ordbog-filter ${category === key ? 'active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <p className="ordbog-count">
        {filtered.length} {filtered.length === 1 ? 'opslag' : 'opslag'}
      </p>

      {filtered.length === 0 ? (
        <div className="ordbog-empty card">
          <p>Ingen opslag matcher din søgning. Prøv et andet ord.</p>
        </div>
      ) : (
        <div className="ordbog-list">
          {filtered.map((entry) => (
            <GlossaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <div className="ordbog-quick card">
        <h3>Populære opslag</h3>
        <div className="ordbog-quick-links">
          {['whatif', 'pipeline', 'cmdlet', 'import-csv', 'invoke-command'].map((id) => {
            const entry = glossaryEntries.find((e) => e.id === id);
            if (!entry) return null;
            return (
              <a key={id} href={`#${id}`} className="ordbog-quick-link">
                {entry.term}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
