import { useState, type FormEvent } from 'react';
import { employeesToCsv, generateEmployees, initialConfig, validateConfig, type Employee, type GeneratorConfig, type RoleProfile } from '../utils/employeeGenerator';
import './CsvGenerator.css';
import { AdConfigImport } from '../components/AdConfigImport';
import { companyFromDomain, type AdInventory } from '../utils/adInventory';

export function CsvGenerator() {
  const [config, setConfig] = useState<GeneratorConfig>(initialConfig);
  const [result, setResult] = useState<{ employees: Employee[]; config: GeneratorConfig } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState<';' | ','>(';');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [adInventory, setAdInventory] = useState<AdInventory | null>(null);
  const stale = result !== null && result.config !== config;
  const filtered = result?.employees.filter((employee) => Object.values(employee).some((value) => value.toLocaleLowerCase('da').includes(search.toLocaleLowerCase('da')))) ?? [];
  const pages = Math.max(1, Math.ceil(filtered.length / 10));

  function update<K extends keyof GeneratorConfig>(key: K, value: GeneratorConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value,
      ...(key === 'targetDomain' && typeof value === 'string' ? { company: companyFromDomain(value) } : {}),
    }));
    setErrors([]);
    setDownloaded(false);
  }

  function updateRole(id: string, key: keyof RoleProfile, value: string) {
    update('roles', config.roles.map((role) => role.id === id ? { ...role, [key]: value } : role));
  }

  function generate(event: FormEvent) {
    event.preventDefault();
    const issues = validateConfig(config);
    setErrors(issues);
    if (issues.length) return;
    setResult({ employees: generateEmployees(config), config });
    setSearch('');
    setPage(0);
    setDownloaded(false);
  }

  function download() {
    if (!result || stale) return;
    const url = URL.createObjectURL(new Blob([employeesToCsv(result.employees, delimiter)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }

  return (
    <div className="container csv-generator">
      <header className="page-header">
        <p className="csv-eyebrow">AD-LAB / VIRKSOMHEDSOPKØB</p>
        <h1>{config.acquiredCompany || 'OnlyMAGS'} flytter ind i jeres AD.</h1>
        <p>Din virksomhed har købt et stort firma. Nu skal I tage imod {Number.isFinite(config.count) ? config.count : 0} nye kolleger med hver deres rolle og adgangsbehov. Ledelsen har underskrevet. Resten er op til IT.</p>
        <div className="csv-badges"><span>Vælg 1–1.000 medarbejdere</span><span>Kun fiktive persondata</span><span>Genereres i browseren</span></div>
      </header>

      <aside className="card csv-story" aria-label="Opgavens fortælling">
        <span className="csv-eyebrow">INTERN BESKED · OPERATION: NYE KOLLEGER</span>
        <h2>Handlen er lukket. Kan de logge ind på mandag?</h2>
        <p>I har købt det store firma <strong>{config.acquiredCompany || 'OnlyMAGS'}</strong>: en abonnementsplatform for digitale magasiner, tastaturtests og overraskende populære guides til kabelstyring. Deres kunder elsker eksklusivt indhold. Deres medarbejdere vil mest bare have adgang til fællesdrevet.</p>
        <p>Med opkøbet følger <strong>{Number.isFinite(config.count) ? config.count : 0} medarbejdere</strong>, som I nu skal have over i jeres AD. Konti skal oprettes fra <strong>{config.sourceDomain || 'kildedomænet'}</strong> i <strong>{config.targetDomain || 'jeres domæne'}</strong>, placeres i de rigtige OU’er og have grupper og GPO’er, der passer til deres arbejde.</p>
        <p>HR leverer en medarbejderliste. Ledelsen forventer, at alle kan arbejde <strong>mandag kl. 08.00</strong>. Salg skal kunne sælge abonnementer, Finance skal kunne sende fakturaer, og Support skal kunne hjælpe, når nogen har glemt deres password igen. “Giv alle administratorrettigheder” er allerede blevet afvist på det første møde.</p>
        <p><em>“OnlyMAGS — premium content, proper permissions.”</em></p>
        <p className="csv-muted">Jeres mission: tilpas roller og adgang til jeres eksisterende AD, generér HR’s CSV-liste, og byg et PowerShell-script, der opretter de nye kolleger. Afprøv med -WhatIf, dokumentér resultatet, og kontrollér, at hver medarbejder har den nødvendige adgang.</p>
      </aside>

      <AdConfigImport config={config} onApply={(next, inventory) => {
        setConfig(next);
        setAdInventory(inventory);
        setErrors([]);
        setDownloaded(false);
      }} />
      <datalist id="csv-ad-ous">{adInventory?.ous.map((ou) => <option value={ou.dn} key={ou.dn}>{ou.name}</option>)}</datalist>
      <datalist id="csv-ad-companies">{adInventory?.companies.map((company) => <option value={company} key={company} />)}</datalist>

      <form onSubmit={generate} noValidate>
        <section className="card" aria-labelledby="csv-company">
          <h2 id="csv-company"><span className="csv-step">01</span> Virksomheder og domæner</h2>
          <p className="csv-muted">Eksemplerne er fiktive. Erstat måldomæne, OU-stier, grupper og GPO’er med jeres egen opsætning.</p>
          <div className="csv-grid">
            <label>Jeres virksomhed<input list="csv-ad-companies" value={config.company} onChange={(e) => update('company', e.target.value)} /><small>Udfyldes fra måldomænet, fx mags.local → Mags. Kan tilpasses.</small></label>
            <label>Opkøbt virksomhed<input value={config.acquiredCompany} onChange={(e) => update('acquiredCompany', e.target.value)} /></label>
            <label>Jeres måldomæne<input value={config.targetDomain} onChange={(e) => update('targetDomain', e.target.value)} spellCheck={false} placeholder="fx firma.local" /><small>Udfyld jeres eget AD-domæne, eller indlæs det fra AD-eksporten. Tilpas OU-stierne nedenfor.</small></label>
            <label>Virksomhedens gamle domæne<input value={config.sourceDomain} onChange={(e) => update('sourceDomain', e.target.value)} spellCheck={false} /></label>
            <div className="csv-full">
              <label>Antal medarbejdere<input type="number" min="1" max="1000" step="1" value={Number.isNaN(config.count) ? '' : config.count} onChange={(e) => update('count', e.target.valueAsNumber)} /><small>100 er standard. Skriv selv et antal fra 1 til 1.000, eller vælg nedenfor.</small></label>
              <div className="csv-actions" role="group" aria-label="Vælg antal medarbejdere">
                {[100, 200, 500, 1000].map((count) => <button key={count} type="button" className={`btn ${config.count === count ? 'btn-primary' : 'btn-secondary'}`} aria-pressed={config.count === count} onClick={() => update('count', count)}>{count.toLocaleString('da-DK')} medarbejdere</button>)}
              </div>
            </div>
          </div>
        </section>

        <section className="card" aria-labelledby="csv-roles">
          <h2 id="csv-roles"><span className="csv-step">02</span> Roller fra jeres AD</h2>
          <p>Hver medarbejder får én tilfældig rolle med lige sandsynlighed. Afdeling, OU, faste grupper og forventede GPO’er følger rollen.</p>
          <div className="csv-role-list">
            {config.roles.map((role, index) => (
              <fieldset className="csv-role" key={role.id}>
                <legend>Rolle {index + 1}{role.title ? ` · ${role.title}` : ''}</legend>
                <div className="csv-grid">
                  <label>Rollenavn<input value={role.title} onChange={(e) => updateRole(role.id, 'title', e.target.value)} placeholder="fx Sales Representative" /></label>
                  <label>Afdeling<input value={role.department} onChange={(e) => updateRole(role.id, 'department', e.target.value)} placeholder="fx Sales" /></label>
                  <label className="csv-full">OU-sti i måldomænet<input list="csv-ad-ous" value={role.ou} onChange={(e) => updateRole(role.id, 'ou', e.target.value)} spellCheck={false} placeholder="OU=Sales,OU=Users,DC=company,DC=local" /></label>
                  <label>Faste sikkerhedsgrupper<textarea rows={3} value={role.groups} onChange={(e) => updateRole(role.id, 'groups', e.target.value)} spellCheck={false} /><small>Én pr. linje. Alle i rollen får disse grupper. Kan stå tomt.</small></label>
                  <label>Forventede GPO’er<textarea rows={3} value={role.gpos} onChange={(e) => updateRole(role.id, 'gpos', e.target.value)} spellCheck={false} /><small>Én pr. linje. Krav til jeres OU/filtrering. Kan stå tomt.</small></label>
                </div>
                <button className="btn btn-secondary csv-remove" type="button" disabled={config.roles.length === 1} onClick={() => update('roles', config.roles.filter((item) => item.id !== role.id))}>Fjern rolle {index + 1}</button>
              </fieldset>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => update('roles', [...config.roles, { id: crypto.randomUUID(), title: '', department: '', ou: config.targetDomain.trim() ? `OU=Users,${config.targetDomain.trim().split('.').map((part) => `DC=${part}`).join(',')}` : '', groups: '', gpos: '' }])}>+ Tilføj rolle</button>
          <p className="csv-note">GPO’er tildeles ikke direkte gennem CSV’en. I skal kontrollere links, nedarvning og filtrering i AD. <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-scope" target="_blank" rel="noreferrer">Læs om GPO-anvendelse hos Microsoft</a>.</p>
        </section>

        <section className="card" aria-labelledby="csv-access">
          <h2 id="csv-access"><span className="csv-step">03</span> Tilfældige ekstra rettigheder</h2>
          <p>Brug grupper fra jeres AD og beskriv deres adgang. Hver medarbejder får mellem 0 og det valgte maksimum, uden gentagelser. Puljen gælder alle roller.</p>
          <label>Adgangspulje<textarea rows={5} value={config.accessPool} onChange={(e) => update('accessPool', e.target.value)} spellCheck={false} aria-describedby="csv-access-help" /><small id="csv-access-help">Én pr. linje: Gruppenavn | Beskrivelse af permission. Lad feltet være tomt for kun at bruge rollernes faste grupper.</small></label>
          <div className="csv-grid csv-spaced">
            <label>Maks. ekstra rettigheder pr. medarbejder<input type="number" min="0" max="10" value={Number.isNaN(config.maxExtraAccess) ? '' : config.maxExtraAccess} onChange={(e) => update('maxExtraAccess', e.target.valueAsNumber)} /><small>Højst antallet af tilgængelige rettigheder i puljen.</small></label>
            <label>Eksisterende brugernavne (valgfrit)<textarea rows={3} value={config.reservedUsernames} onChange={(e) => update('reservedUsernames', e.target.value)} placeholder={'anna.jensen\nsoren.holm'} spellCheck={false} /><small>SamAccountName, ét pr. linje. Generatoren undgår disse navne.</small></label>
          </div>
        </section>

        {errors.length > 0 && <div className="csv-errors" role="alert"><strong>Ret opsætningen før generering:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <div className="csv-actions"><button className="btn btn-primary btn-glow" type="submit">{result ? 'Generér en ny medarbejderliste' : 'Generér medarbejderliste'}</button><span className="csv-muted">Opsætningen nulstilles ved genindlæsning, eller når du forlader siden.</span></div>
      </form>

      <section className="card csv-results" aria-labelledby="csv-result-title">
        <h2 id="csv-result-title"><span className="csv-step">04</span> Medarbejderliste og CSV</h2>
        <div aria-live="polite">
          {!result && <p className="csv-empty">Klar til overtagelsen? Tilpas jeres AD ovenfor, og generér listen for at se medarbejderne her.</p>}
          {result && <p><strong>{result.employees.length} fiktive medarbejdere</strong> fra {result.config.acquiredCompany} er klar i listen.</p>}
          {stale && <p className="csv-warning">Opsætningen er ændret. Generér listen igen, før du downloader, så CSV’en passer til dine nye valg.</p>}
        </div>
        {result && <>
          <div className="csv-badges csv-distribution">{result.config.roles.map((role) => <span key={role.id}>{role.title}: {result.employees.filter((employee) => employee.Title === role.title.trim()).length}</span>)}</div>
          <div className="csv-grid csv-spaced">
            <label>Søg i medarbejderlisten<input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Navn, rolle, gruppe eller OU…" /></label>
            <label>CSV-separator<select value={delimiter} onChange={(e) => setDelimiter(e.target.value as ';' | ',')}><option value=";">Semikolon (;) — dansk Excel / PowerShell</option><option value=",">Komma (,) — standard CSV</option></select></label>
          </div>
          <div className="csv-table-wrap" tabIndex={0} role="region" aria-label="Forhåndsvisning af medarbejdere, rul vandret for flere kolonner">
            <table className="comparison-table"><caption>Forhåndsvisning · {filtered.length} match · CSV’en indeholder alle {result.employees.length} medarbejdere og 17 kolonner</caption><thead><tr>{['Medarbejder', 'Brugernavn / UPN', 'Rolle / afdeling', 'OU', 'Grupper', 'Permissions', 'Forventede GPO’er'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
              {filtered.slice(page * 10, page * 10 + 10).map((employee) => <tr key={employee.EmployeeID}>
                <td><strong>{employee.DisplayName}</strong><small>{employee.EmployeeID}</small></td><td>{employee.SamAccountName}<small>{employee.UserPrincipalName}</small></td><td>{employee.Title}<small>{employee.Department}</small></td><td>{employee.TargetOU}</td><td>{employee.Groups.split('|').join(' · ') || '—'}</td><td>{employee.Permissions.split('|').join(' · ') || '—'}</td><td>{employee.ExpectedGPOs.split('|').join(' · ') || '—'}</td>
              </tr>)}
              {!filtered.length && <tr><td colSpan={7}>Ingen medarbejdere matcher søgningen.</td></tr>}
            </tbody></table>
          </div>
          <div className="csv-actions csv-pagination"><button className="btn btn-secondary" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Forrige</button><span>Side {page + 1} af {pages}</span><button className="btn btn-secondary" type="button" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Næste</button></div>
          <div className="csv-actions"><button className="btn btn-primary" type="button" disabled={stale} onClick={download}>Download CSV · {result.employees.length} medarbejdere</button><span className="csv-muted">UTF-8 med BOM · {delimiter === ';' ? 'semikolon' : 'komma'} · samme data som listen</span></div>
          {downloaded && <p role="status" className="csv-note">Download af employees.csv er startet.</p>}
        </>}
      </section>

      <section className="card csv-guide" aria-labelledby="csv-guide-title">
        <h2 id="csv-guide-title">Fra CSV til jeres AD</h2>
        <p>CSV’en er et migrationsgrundlag til øvelsen. Den opretter ikke konti, flytter adgangskoder eller overfører SID’er fra det gamle domæne.</p>
        <ol><li>Læs filen, og kontrollér antal, rollefordeling og felter.</li><li>Kontrollér, at OU’er og grupper findes, og at brugernavne og UPN’er er ledige i jeres AD.</li><li>Lav jeres oprettelsesscript med <code>New-ADUser</code> og gruppemedlemskaber med <code>Add-ADGroupMember</code>. Afprøv med <code>-WhatIf</code>, og håndtér adgangskoder separat.</li><li>Kontrollér adgang og forventede GPO’er efter login, fx med <code>gpresult /r</code>.</li></ol>
        <pre><code>{`$employees = Import-Csv -Path .\\employees.csv -Delimiter '${delimiter}' -Encoding UTF8\n$employees.Count\n$employees | Group-Object Title | Select-Object Name, Count\n\n# Felter med flere værdier bruger | som separator\n$employees[0].Groups -split '\\|' | Where-Object { $_ }`}</code></pre>
        <p className="csv-note"><code>Groups</code> indeholder faste rollegrupper og tilfældige ekstragrupper. <code>Permissions</code> beskriver de ekstra adgangsbehov; jeres eksisterende gruppeopsætning skal give adgangen. <code>ExpectedGPOs</code> er en tjekliste. <code>TargetOU</code> er den fulde OU-sti. <code>SourceUserPrincipalName</code> er en fiktiv kildeidentitet.</p>
        <p className="csv-muted">Navne og brugernavne er unikke inden for listen. Generatoren har ingen forbindelse til jeres AD. <a href="https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/import-csv" target="_blank" rel="noreferrer">Microsofts dokumentation for Import-Csv</a>.</p>
      </section>
    </div>
  );
}
