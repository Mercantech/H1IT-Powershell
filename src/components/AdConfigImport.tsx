import { useRef, useState } from 'react';
import exportScript from '../../scripts/Export-AdGeneratorConfig.ps1?raw';
import { canUseAdValue, configFromInventory, formatAdInventory, maxInventoryBytes, parseAdInventory, type AdInventory } from '../utils/adInventory';
import type { GeneratorConfig } from '../utils/employeeGenerator';
import { CodeBlock } from './CodeBlock';
import Editor from '@monaco-editor/react';
import { readOnlyBlockOptions, setupPowerShellTheme } from '../lib/monaco/theme';

interface Props {
  config: GeneratorConfig;
  onApply: (config: GeneratorConfig, inventory: AdInventory) => void;
}

export function AdConfigImport({ config, onApply }: Props) {
  const [inventory, setInventory] = useState<AdInventory | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [showScript, setShowScript] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const jsonTextRef = useRef('');
  const request = useRef(0);
  const command = '.\\Export-AdGeneratorConfig.ps1 -OutputPath .\\ad-config.json';
  const matchingGroups = inventory?.groups.filter((group) => `${group.name} ${group.description}`.toLocaleLowerCase('da').includes(search.toLocaleLowerCase('da'))) ?? [];

  function updateJsonText(text: string) {
    jsonTextRef.current = text;
    setJsonText(text);
  }

  function resetPreview() {
    const id = ++request.current;
    setLoading(false);
    setError('');
    setStatus('');
    setInventory(null);
    setSelected([]);
    setSearch('');
    return id;
  }

  async function readInventory(source: File | string | undefined) {
    if (source === undefined) return;
    const id = resetPreview();
    setLoading(true);
    try {
      if (typeof source !== 'string' && source.size > maxInventoryBytes) throw new Error('JSON-indholdet må højst fylde 5 MB.');
      const text = typeof source === 'string' ? source : await source.text();
      const parsed = parseAdInventory(text);
      if (id === request.current) {
        updateJsonText(formatAdInventory(text));
        setInventory(parsed);
      }
    } catch (cause) {
      if (id === request.current) setError(cause instanceof Error ? cause.message : 'JSON-indholdet kunne ikke læses. Prøv igen.');
    } finally {
      if (id === request.current) setLoading(false);
    }
  }

  function downloadScript() {
    const url = URL.createObjectURL(new Blob(['\uFEFF', exportScript.replace(/^\uFEFF/, '')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Export-AdGeneratorConfig.ps1';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function apply() {
    if (!inventory) return;
    const next = configFromInventory(config, inventory);
    next.accessPool = inventory.groups.filter((group) => selected.includes(group.name) && canUseAdValue(group.name)).map((group) => {
      const description = group.description.replace(/[|\r\n\t]/g, ' ').trim();
      return `${group.name} | ${canUseAdValue(description) ? description : 'Access through group membership (review required)'}`;
    }).join('\n');
    onApply(next, inventory);
    setStatus('AD-oplysningerne er indsat nedenfor. Gennemgå rolleforslag og adgang, og generér derefter en ny medarbejderliste.');
  }

  return <section className="card csv-guide csv-import" aria-labelledby="csv-import-title">
    <h2 id="csv-import-title">Start med jeres nuværende AD</h2>
    <p>Hent opsætningen fra jeres måldomæne, og brug den som udgangspunkt. Eksporten læser AD og skriver én lokal JSON-fil. Importen behandles i browseren.</p>
    <ol>
      <li>Download scriptet til en domænecontroller eller en domænetilknyttet pc med RSAT. Brug <strong>Windows PowerShell 5.1</strong> med læseadgang til AD. Modulet <code>ActiveDirectory</code> kræves; <code>GroupPolicy</code> bruges til GPO-oplysninger.</li>
      <li>Åbn PowerShell i mappen med scriptet, gennemse det, og kør kommandoen nedenfor.</li>
      <li>Vælg JSON-filen eller indsæt dens indhold som tekst her på siden. Gennemgå oplysningerne, og tryk “Brug AD-oplysninger”.</li>
    </ol>
    <div className="csv-actions">
      <button type="button" className="btn btn-secondary" onClick={downloadScript}>Download PowerShell-script</button>
      <button type="button" className="btn btn-secondary" onClick={async () => {
        try { await navigator.clipboard.writeText(command); setStatus('Kommandoen er kopieret.'); }
        catch { setStatus('Markér og kopiér kommandoen nedenfor manuelt.'); }
      }}>Kopiér kommando</button>
    </div>
    <pre><code>{command}</code></pre>
    <details className="csv-spaced" onToggle={(event) => setShowScript(event.currentTarget.open)}>
      <summary>Vis hele eksportscriptet</summary>
      {showScript && <CodeBlock code={exportScript.replace(/^\uFEFF/, '')} filename="Export-AdGeneratorConfig.ps1" showPrompt={false} showCopy maxHeight={420} />}
    </details>
    <p className="csv-note">Hvis Windows har blokeret den downloadede fil, kan du efter gennemsyn køre <code>Unblock-File .\Export-AdGeneratorConfig.ps1</code>. Følg skolens scriptpolitik.</p>
    <label className="csv-spaced">Importér AD-opsætning (.json)
      <input type="file" accept=".json,application/json" onChange={(event) => { void readInventory(event.target.files?.[0]); event.target.value = ''; }} />
      <small>Højst 5 MB. Indeholder domæne, OU’er, grupper, GPO-navne, rolleforslag og eksisterende brugernavne. Ingen adgangskoder eller virkelige medarbejdernavne eksporteres.</small>
    </label>
    <div className="code-block csv-spaced">
      <div className="code-block-chrome"><span className="code-block-title">ad-config.json · Indsæt eller redigér JSON</span>
        <button type="button" className="code-block-copy" disabled={!jsonText.trim()} onClick={() => {
          try { updateJsonText(formatAdInventory(jsonTextRef.current)); setError(''); setStatus('JSON er formateret med to mellemrum pr. niveau.'); }
          catch (cause) { setError(cause instanceof Error ? cause.message : 'JSON kunne ikke formateres.'); }
        }}>Formatér JSON</button>
        <button type="button" className="code-block-copy" disabled={!jsonText.trim()} onClick={async () => {
          try { await navigator.clipboard.writeText(jsonText); setStatus('JSON er kopieret.'); }
          catch { setStatus('Markér JSON i kodefeltet, og kopiér med Ctrl+C.'); }
        }}>Kopiér JSON</button>
      </div>
      <Editor height="340px" language="json" value={jsonText}
        onMount={(_editor, monaco) => setupPowerShellTheme(monaco)}
        onChange={(value) => { const next = value ?? ''; if (next !== jsonTextRef.current) { updateJsonText(next); resetPreview(); } }}
        options={{ ...readOnlyBlockOptions, language: 'json', readOnly: false, domReadOnly: false, lineNumbers: 'on', tabSize: 2, insertSpaces: true, ariaLabel: 'AD-opsætning som JSON-tekst' }}
        loading={<div className="code-block-loading">Indlæser JSON-kodefelt…</div>} />
    </div>
    <p className="csv-note">Indsæt hele JSON-indholdet her, eller vælg en fil ovenfor. Begge vises med to mellemrum pr. niveau, når de indlæses. Højst 5 MB. Tryk “Indlæs JSON-tekst” efter ændringer.</p>
    <div className="csv-actions">
      <button type="button" className="btn btn-secondary" disabled={!jsonText.trim()} onClick={() => { void readInventory(jsonTextRef.current); }}>Indlæs JSON-tekst</button>
    </div>
    {loading && <p role="status">Læser AD-opsætningen…</p>}
    {error && <p className="csv-errors csv-spaced" role="alert">{error} Den nuværende opsætning er bevaret.</p>}
    {inventory && <div className="csv-spaced">
      <h3>Gennemgå eksporten fra {inventory.domain}</h3>
      <div className="csv-badges"><span>{inventory.ous.length} OU’er</span><span>{inventory.groups.length} sikkerhedsgrupper</span><span>{inventory.roles.length} rolleforslag</span><span>{inventory.reservedUsernames.length} reserverede brugernavne</span></div>
      {inventory.warnings.length > 0 && <div className="csv-warning csv-spaced"><strong>Eksporten har bemærkninger</strong><ul>{inventory.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
      {!inventory.ous.length && <p className="csv-warning csv-spaced">Eksporten indeholder ingen OU’er. Importér domæne og grupper, og opret derefter en rolle med en OU fra jeres AD.</p>}
      {!inventory.roles.length && inventory.ous.length > 0 && <p className="csv-note">Ingen roller kunne udledes. Der indsættes ét redigerbart forslag i den første OU. Vælg den OU, der skal indeholde jeres nye medarbejdere.</p>}
      <details className="csv-spaced"><summary>OU’er, GPO-links og rolleforslag</summary>
        <div className="csv-inventory-list"><ul>{inventory.ous.map((ou) => <li key={ou.dn}><strong>{ou.name}</strong><small>{ou.dn}</small><small>GPO-kandidater: {ou.gpos.join(', ') || 'Ingen registreret'}</small></li>)}</ul>
        <ul>{inventory.roles.map((role, index) => <li key={index}><strong>{role.title} · {role.department}</strong><small>{role.ou}</small><small>Fælles direkte grupper: {role.groups.join(', ') || 'Ingen registreret'}</small></li>)}</ul></div>
      </details>
      <h3>Vælg grupper til tilfældig ekstra adgang</h3>
      <p className="csv-muted">Alle valg starter tomme. Beskrivelsen fra AD bruges som tekst til permission; faktiske NTFS-, share- og applikationsrettigheder skal I kontrollere separat.</p>
      <label>Søg i eksporterede grupper<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Gruppenavn eller beskrivelse" /></label>
      <div className="csv-inventory-list csv-spaced">{matchingGroups.slice(0, 100).map((group) => <label className="csv-group-choice" key={group.name}>
        <input type="checkbox" disabled={!canUseAdValue(group.name)} checked={selected.includes(group.name)} onChange={(event) => {
          const checked = event.currentTarget.checked;
          setSelected((current) => checked ? [...new Set([...current, group.name])] : current.filter((name) => name !== group.name));
        }} />
        <span>{group.name}<small>{group.description || 'Ingen beskrivelse i AD'}</small>{group.reviewOnly && <small>Standardgruppe eller beskyttet gruppe — vælg kun, hvis adgangen er relevant for øvelsen.</small>}{!canUseAdValue(group.name) && <small>Gruppenavnet kan ikke repræsenteres i generatorens listeformat.</small>}</span>
      </label>)}{!matchingGroups.length && <p>Ingen grupper matcher søgningen.</p>}</div>
      <p className="csv-note" role="status">{selected.length} valgt · Viser {Math.min(matchingGroups.length, 100)} af {matchingGroups.length} match. Brug søgningen til at finde flere grupper.</p>
      <p className="csv-note">Klik på gruppens navn eller afkrydsningsfelt. Valgene overføres til adgangspuljen, når I trykker “Brug AD-oplysninger”.</p>
      <p className="csv-note">Rolleforslag er udledt fra aktive konti med samme titel, afdeling og OU. Kun deres fælles direkte sikkerhedsgrupper foreslås. Indlejrede grupper og primærgruppen udledes ikke. Standardgrupper og grupper markeret som beskyttede indsættes ikke automatisk; det er ikke en fuld rettighedsvurdering.</p>
      <p className="csv-note">GPO-kandidater tager højde for OU-links og nedarvning. Sikkerhedsfiltrering, WMI-filtre og bruger-/computerindstillinger kan ændre det faktiske resultat. Kontrollér forventningerne efter import.</p>
      <p className="csv-spaced">“Brug AD-oplysninger” erstatter måldomæne, roller, adgangspulje og reserverede brugernavne. Virksomhedsnavnet dannes fra første del af måldomænet med stort begyndelsesbogstav, fx mags.local → Mags. Opkøbsscenariet og medarbejderantallet bevares.</p>
      <button type="button" className="btn btn-primary" onClick={apply}>Brug AD-oplysninger</button>
    </div>}
    {status && <p className="csv-note" role="status">{status}</p>}
  </section>;
}
