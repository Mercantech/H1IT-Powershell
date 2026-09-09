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
  const [showExample, setShowExample] = useState(false);
  return (
    <article id={entry.id} className="ordbog-entry card">
      <div className="ordbog-entry-header">
        <h3><a href={`#${entry.id}`}>{entry.term}</a></h3>
        <span className="ordbog-category">{glossaryCategories[entry.category]}{entry.advanced ? ' · Videregående' : ''}</span>
      </div>
      <p className="ordbog-summary">{entry.summary}</p>
      <p className="ordbog-detail">{entry.detail}</p>
      {entry.requires && <p className="ordbog-requires"><strong>Kræver:</strong> {entry.requires}</p>}
      {entry.pitfall && <p className="ordbog-pitfall"><strong>Typisk faldgrube:</strong> {entry.pitfall}</p>}
      {entry.example && (
        <details className="ordbog-example" onToggle={(event) => setShowExample(event.currentTarget.open)}>
          <summary>Vis PowerShell-eksempel</summary>
          {showExample && <CodeBlock code={entry.example} title={entry.term} showPrompt={false} />}
        </details>
      )}
      {entry.docsUrl && <a className="ordbog-docs" href={entry.docsUrl} target="_blank" rel="noreferrer">Dokumentation på Microsoft Learn ↗</a>}
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
  const [level, setLevel] = useState<'alle' | 'basis' | 'videregående'>('alle');

  const filtered = useMemo(() => {
    let entries = filterGlossaryEntries(glossaryEntries, query);
    if (category !== 'alle') {
      entries = entries.filter((e) => e.category === category);
    }
    if (level !== 'alle') entries = entries.filter((entry) => Boolean(entry.advanced) === (level === 'videregående'));
    return [...entries].sort((a, b) => a.term.localeCompare(b.term, 'da'));
  }, [query, category, level]);

  function resetFilters() {
    setQuery('');
    setCategory('alle');
    setLevel('alle');
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Ordbog</h1>
        <p>
          Slå kommandoer, symboler og scriptmønstre op. Søg fx efter &quot;oprette bruger&quot;,
          &quot;CSV semikolon&quot; eller &quot;try catch&quot;. Opslagene har forklaringer og kodeeksempler;
          krav til serverroller og moduler står ved de eksempler, der behøver dem.
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
          placeholder="Begreb, kommando, symbol eller opgave…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="ordbog-shortcuts" aria-label="Forslag til opslag">
          <span>Slå op:</span>
          {['foreach', 'CSV semikolon', 'try catch', 'oprette bruger', '$PSScriptRoot', 'splatting'].map((term) => (
            <button type="button" key={term} onClick={() => { resetFilters(); setQuery(term); }}>{term}</button>
          ))}
        </div>

        <div className="ordbog-filters">
          <button
            type="button"
            className={`ordbog-filter ${category === 'alle' ? 'active' : ''}`}
            onClick={() => setCategory('alle')}
            aria-pressed={category === 'alle'}
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
                aria-pressed={category === key}
              >
                {label}
              </button>
            )
          )}
        </div>
        <div className="ordbog-level">
          <label htmlFor="ordbog-level">Niveau</label>
          <select id="ordbog-level" value={level} onChange={(event) => setLevel(event.target.value as typeof level)}>
            <option value="alle">Alle niveauer</option>
            <option value="basis">Basis og daglig brug</option>
            <option value="videregående">Videregående</option>
          </select>
          <button type="button" onClick={resetFilters} disabled={!query && category === 'alle' && level === 'alle'}>Nulstil søgning og filtre</button>
        </div>
      </div>

      <p className="ordbog-count" role="status">
        {filtered.length} af {glossaryEntries.length} opslag
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

    </div>
  );
}
