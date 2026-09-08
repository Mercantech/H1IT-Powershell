import { useEffect, useState } from 'react';
import { usePresentation } from '../context/PresentationContext';
import { ws2022Phases as phases, orchestratorSource, commonSource } from '../data/ws2022';
import './Ws2022.css';
function Source({ name, code }: { name: string; code: string }) {
  return (
    <figure className="ws-source">
      <figcaption>{name}</figcaption>
      <pre tabIndex={0} aria-label={name}><code>{code}</code></pre>
    </figure>
  );
}

export function Ws2022() {
  const { start } = usePresentation();
  const [selected, setSelected] = useState(0);
  const phase = phases[selected];

  useEffect(() => {
    const previous = document.title;
    document.title = 'WS2022 · Serveropsætning med PowerShell';
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="ws-page">
      <section className="ws-hero" aria-labelledby="ws-title">
        <p className="ws-kicker">Windows Server 2022 <span>/</span> PowerShell i praksis</p>
        <h1 id="ws-title">Serveropsætning<br /><em>med PowerShell.</em></h1>
        <div className="ws-intro">
          <p>Servernavn, roller, domæne og brugere kan sættes op i Windows’ administrationsværktøjer. Her udfører fem scripts de samme opgaver ud fra en fælles konfigurationsfil.</p>
          <p>Gennemgangen viser, hvad kommandoerne ændrer, og hvordan du kan gentage og dokumentere opsætningen uden at indtaste de samme valg i flere guider.</p>
          <a href="#ws-flow">Gennemgå faserne <span aria-hidden="true">↘</span></a>
          <button type="button" className="ws-slides-button" onClick={() => start()}>Vis som slides <span>F5</span></button>
        </div>
        <div className="ws-command" aria-label="Vis de planlagte ændringer i fase 1">
          <span className="ws-prompt">PS C:\lab&gt;</span>
          <code>.\Invoke-Bootstrap.ps1 <span>-Phase 1 -WhatIf</span></code>
          <span className="ws-command-note">Vis planlagte ændringer i fase 1</span>
        </div>
      </section>

      <section id="ws-flow" className="ws-section ws-flow" aria-labelledby="ws-flow-title">
        <div className="ws-section-heading">
          <h2 id="ws-flow-title">Hvad sker der<br />i de fem faser?</h2>
          <p>Klik dig gennem forløbet.<br />Visningen forklarer koden og kører ingen serverkommandoer.</p>
        </div>
        <div className="ws-workbench">
          <nav className="ws-phases" aria-label="Vælg bootstrap-fase">
            {phases.map((item, index) => (
              <button key={item.file} type="button" aria-pressed={selected === index} aria-controls="ws-phase-detail" onClick={() => setSelected(index)}>
                <span className="ws-step-number">0{index + 1}</span>
                <span>{item.short}{index === 2 && <small>↳ genstart</small>}</span>
                <span className="ws-phase-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </nav>
          <div id="ws-phase-detail" className="ws-phase-detail" aria-live="polite">
            <div className="ws-phase-story" key={phase.file}>
              <p className="ws-file-label">{phase.file}</p>
              <h3>{phase.title}</h3>
              <p className="ws-phase-description">{phase.description}</p>
              <ul className="ws-actions">{phase.actions.map(action => <li key={action}>{action}</li>)}</ul>
              <dl className="ws-comparison">
                <div><dt>Manuelt</dt><dd>{phase.manual}</dd></div>
                <div><dt>Med PowerShell</dt><dd>{phase.lesson}</dd></div>
              </dl>
              <Source name="Kodeudsnit · forkortet til forklaring" code={phase.code} />
              <p className="ws-code-explanation">{phase.explanation}</p>
              <p className="ws-phase-note">{phase.note}</p>
              <details className="ws-reading">
                <summary>Åbn hele scriptet <span aria-hidden="true">+</span></summary>
                <Source name={phase.file} code={phase.source} />
              </details>
            </div>
            <div className="ws-phase-bottom">
              <span>0{selected + 1} / 05</span>
              <button type="button" onClick={() => setSelected((selected + 1) % phases.length)} aria-label={selected === 4 ? 'Tilbage til fase 1' : `Næste fase: ${phases[(selected + 1) % phases.length].short}`}>
                {selected === 4 ? 'Tilbage til starten' : 'Næste fase'} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="ws-section ws-result" aria-labelledby="ws-ad-title">
        <div className="ws-result-intro">
          <p className="ws-kicker">Efter de fem faser</p>
          <h2 id="ws-ad-title">AD-strukturen<br />på <em>DC01.</em></h2>
          <p><strong>mags.local</strong> er domænet. IT, Salg og Brugere er OU’er, som organiserer AD-objekter og kan bruges til at afgrænse gruppepolitikker. Grupperne samler brugere, så rettigheder senere kan tildeles til en gruppe.</p>
          <p>Anna ligger i IT og er medlem af GG-IT. Bo ligger i Salg og er medlem af GG-Salg. GPO’en er linket til Brugere og gælder derfor ikke Anna og Bo via det viste link.</p>
          <p className="ws-roles">AD DS <span>·</span> DNS <span>·</span> DHCP <span>·</span> File Server</p>
        </div>
        <div className="ws-directory" aria-label="Active Directory-struktur i mags.local">
          <div className="ws-directory-root">mags.local<span> / </span></div>
          <ul className="ws-tree">
            <li><h3>IT</h3><p><strong>GG-IT</strong><span>Anna Jensen <small>anna.jensen</small></span></p></li>
            <li><h3>Salg</h3><p><strong>GG-Salg</strong><span>Bo Nielsen <small>bo.nielsen</small></span></p></li>
            <li><h3>Brugere</h3><p><strong>GG-Alle</strong><span>Ingen medlemmer endnu</span></p><p className="ws-policy">↳ Lab-Workstation-Baseline<small>GPO-link · brugerpolitik</small></p></li>
          </ul>
        </div>
      </section>

      <section className="ws-section ws-behind" aria-labelledby="ws-architecture-title">
        <h2 id="ws-architecture-title">Hvorfor dele<br /><em>scriptet op?</em></h2>
        <div>
          <p><code>Config.psd1</code> indeholder data: navne, roller, OU’er og brugere. Når du tilføjer en bruger, ændrer du listen frem for at kopiere en blok kommandoer. Du kan gennemgå dataene for tastefejl før kørsel.</p>
          <p><code>Invoke-Bootstrap.ps1</code> vælger og starter faserne og gemmer konsollens output med <code>Start-Transcript</code>. Efter promotion og genstart vælger du selv at fortsætte fra fase 4. Du behøver dermed ikke starte hele forløbet forfra.</p>
          <p><code>Common.ps1</code> samler funktioner til blandt andet administratortjek, konfigurationsindlæsning og AD-stier. En rettelse i en fælles funktion kan bruges af alle faserne.</p>
          <p>Fordelen bliver især tydelig, når labbet skal genopbygges, eller en kollega skal lave samme opsætning. En enkelt ændring kan være hurtigere manuelt; scriptet kræver først, at valgene er forstået og afprøvet. Det automatiserer også forkerte værdier, hvis konfigurationen er forkert.</p>
          <p>Tilstandstjek gør det muligt at springe mange eksisterende objekter over, men scriptet retter ikke alle afvigelser. En eksisterende bruger flyttes fx ikke automatisk til en ny OU, blot fordi du ændrer OU’en i konfigurationen.</p>
          <details className="ws-reading"><summary>Se hvordan faserne styres <span>Invoke-Bootstrap.ps1</span></summary><Source name="Invoke-Bootstrap.ps1" code={orchestratorSource} /></details>
          <details className="ws-reading"><summary>Se de fælles funktioner <span>Common.ps1</span></summary><Source name="Common.ps1" code={commonSource} /></details>
        </div>
      </section>

      <section id="ws-demo" className="ws-section ws-demo" aria-labelledby="ws-demo-title">
        <div className="ws-section-heading"><h2 id="ws-demo-title">Afprøv forløbet i en lab-VM.</h2><p>Windows Server 2022 · PowerShell 5.1 som administrator.<br />Tag et snapshot før promotion.</p></div>
        <details className="ws-demo-script">
          <summary><span>Åbn demoforløbet</span><span aria-hidden="true">↗</span></summary>
          <p>Åbn <code>scripts/ws2022-bootstrap</code>, og tilpas først <code>Config.psd1</code> til din VM. Kør kommandoerne trinvis med pauser ved genstart.</p>
          <Source name="Demoforløb · kør ét trin ad gangen" code={'# 1. Vis først de planlagte ændringer\n.\\Invoke-Bootstrap.ps1 -Phase 1 -WhatIf\n.\\Invoke-Bootstrap.ps1 -Phase 2 -WhatIf\n\n# 2. Klargør serveren\n.\\Invoke-Bootstrap.ps1 -Phase 1\n# Genstart efter navneskift. Åbn PowerShell og scriptmappen igen.\n.\\Invoke-Bootstrap.ps1 -Phase 2\n# Genstart før promotion, hvis installationen anbefaler det.\n\n# 3. Opret domænet. Indtast DSRM-adgangskoden.\n.\\Invoke-Bootstrap.ps1 -Phase 3\n# Serveren genstarter normalt efter promotion.\n\n# 4. Log på som domæneadministrator, og åbn scriptmappen igen.\n# Indtast den midlertidige adgangskode til eksempelbrugerne.\n.\\Invoke-Bootstrap.ps1 -FromPhase 4 -All'} />
        </details>
      </section>
      <p className="ws-signoff"><span aria-hidden="true">&gt;_</span> ws2022-bootstrap</p>
    </div>
  );
}
