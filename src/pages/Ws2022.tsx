import { useEffect, useState } from 'react';
import prepareSource from '../../scripts/ws2022-bootstrap/01-Prepare-Host.ps1?raw';
import rolesSource from '../../scripts/ws2022-bootstrap/02-Install-Roles.ps1?raw';
import promoteSource from '../../scripts/ws2022-bootstrap/03-Promote-DomainController.ps1?raw';
import adSource from '../../scripts/ws2022-bootstrap/04-Configure-ADStructure.ps1?raw';
import gpoSource from '../../scripts/ws2022-bootstrap/05-Create-ExampleGpo.ps1?raw';
import orchestratorSource from '../../scripts/ws2022-bootstrap/Invoke-Bootstrap.ps1?raw';
import commonSource from '../../scripts/ws2022-bootstrap/Common.ps1?raw';
import './Ws2022.css';

const phases = [
  {
    title: 'Forbered serveren', short: 'Klargør', cmdlet: 'Rename-Computer',
    file: '01-Prepare-Host.ps1', source: prepareSource,
    description: 'Giv serveren en identitet og et fælles udgangspunkt, før infrastrukturen bygges ovenpå.',
    actions: ['Sæt servernavnet til DC01.', 'Indstil tidszonen til København.', 'Konfigurér valgfrit statisk IPv4, gateway og DNS.'],
    result: 'En klargjort Windows Server med en kendt konfiguration.',
    concept: 'Konfiguration som data',
    lesson: 'Navne og indstillinger læses fra Config.psd1. Den samme logik kan derfor bruges i et andet lab ved at ændre datafilen.',
    note: 'Netværksændringer er slået fra i lab-konfigurationen. Hvis servernavnet ændres, anbefaler scriptet en genstart før næste fase.',
    code: "# Indstillinger læses fra en separat datafil\n$config = Get-BootstrapConfig -ConfigPath $ConfigPath\n\nRename-Computer -NewName $config.ComputerName -Force\nSet-TimeZone -Id $config.TimeZoneId",
  },
  {
    title: 'Installér serverroller', short: 'Roller', cmdlet: 'Install-WindowsFeature',
    file: '02-Install-Roles.ps1', source: rolesSource,
    description: 'En løkke omsætter listen af ønskede roller til installerede Windows-komponenter med administrationsværktøjer.',
    actions: ['Installér Active Directory Domain Services og DNS.', 'Tilføj DHCP og File Server.', 'Spring allerede installerede roller over.'],
    result: 'Fire serverroller er installeret og klar til videre opsætning.',
    concept: 'Løkker og tilstandstjek',
    lesson: 'Scriptet undersøger først serverens tilstand med Get-WindowsFeature. Det installerer kun roller, der mangler, og stopper ved installationsfejl.',
    note: 'DHCP og File Server installeres som roller. Dette script opretter ikke DHCP-scopes eller fildelinger. Følg en eventuel besked om genstart før fase 03.',
    code: "foreach ($rolle in $config.Roles) {\n    $feature = Get-WindowsFeature -Name $rolle\n    if ($feature.InstallState -eq 'Installed') {\n        continue\n    }\n    Install-WindowsFeature -Name $rolle -IncludeManagementTools\n}",
  },
  {
    title: 'Opret domænet', short: 'Domæne', cmdlet: 'Install-ADDSForest',
    file: '03-Promote-DomainController.ps1', source: promoteSource,
    description: 'Den selvstændige server bliver til en domain controller i en ny Active Directory-forest: mags.local.',
    actions: ['Kontrollér, at AD DS-rollen er installeret.', 'Indlæs DSRM-adgangskoden som SecureString.', 'Opret forest og DNS, og genstart serveren.'],
    result: 'DC01 bliver domain controller for mags.local.',
    concept: 'Parametre samlet i en hashtable',
    lesson: 'Splatting sender en samlet pakke af indstillinger til Install-ADDSForest. Det gør et stort kald lettere at læse og vedligeholde.',
    note: 'Efter genstart logger man på som domæneadministrator og starter fase 04 manuelt med -FromPhase 4 -All. Fortsættelsen er ikke automatisk.',
    code: "$SafeModeAdministratorPassword = Read-Host -AsSecureString\n\n# $params indeholder domæne, DNS og øvrige indstillinger\nInstall-ADDSForest @params\n\n# Efter genstart og login som domæneadministrator:\n.\\Invoke-Bootstrap.ps1 -FromPhase 4 -All",
  },
  {
    title: 'Byg Active Directory', short: 'AD-struktur', cmdlet: 'New-ADUser',
    file: '04-Configure-ADStructure.ps1', source: adSource,
    description: 'Omsæt organisationens struktur til OU’er, sikkerhedsgrupper og brugere med faste tilhørsforhold.',
    actions: ['Opret OU’erne IT, Salg og Brugere.', 'Opret GG-IT, GG-Salg og GG-Alle.', 'Opret Anna og Bo, og tilføj dem til deres respektive grupper.'],
    result: 'Tre OU’er, tre grupper og to eksempelbrugere.',
    concept: 'Datadrevet oprettelse',
    lesson: 'Foreach-løkker læser objekterne fra konfigurationen. Flere afdelinger eller brugere tilføjes som data, og eksisterende objekter springes over.',
    note: 'Brugernes midlertidige adgangskode indtastes ved kørsel. Nye brugere skal skifte den ved første login. GG-Alle oprettes uden medlemmer i eksemplet.',
    code: "# Forenklet eksempel på den datadrevne oprettelse\nforeach ($user in $config.SampleUsers) {\n    $path = Get-OuDn -OuName $user.OuName -DomainName $config.DomainName\n    # Scriptet tjekker først, om brugeren allerede findes\n    # Derefter: New-ADUser og Add-ADGroupMember\n}",
  },
  {
    title: 'Sæt en fælles politik', short: 'Gruppepolitik', cmdlet: 'Set-GPRegistryValue',
    file: '05-Create-ExampleGpo.ps1', source: gpoSource,
    description: 'Afslut med en konkret Group Policy, så også en central indstilling bliver beskrevet og oprettet med kode.',
    actions: ['Opret Lab-Workstation-Baseline, hvis den mangler.', 'Link politikken til OU’en Brugere.', 'Sæt en brugerpolitik, der skjuler Server Manager ved login.'],
    result: 'En eksempel-GPO er oprettet, linket og konfigureret.',
    concept: 'Politikker som kode',
    lesson: 'New-GPO, New-GPLink og Set-GPRegistryValue gør opsætningen læsbar i et script. Ændringer kan gennemgås og versionsstyres sammen med resten af løsningen.',
    note: 'Politikken er en brugerindstilling linket til Brugere. Anna og Bo ligger i IT og Salg og modtager derfor ikke denne politik via det viste OU-link.',
    code: "Set-GPRegistryValue `\n    -Name $config.GpoName `\n    -Key $config.GpoRegistryPath `\n    -ValueName $config.GpoRegistryValueName `\n    -Type $config.GpoRegistryType `\n    -Value $config.GpoRegistryValue",
  },
];

function Source({ name, code }: { name: string; code: string }) {
  return <div className="ws-source"><div className="ws-source-bar"><span aria-hidden="true">&gt;_</span><span>{name}</span><span>PowerShell</span></div><pre tabIndex={0} aria-label={name}><code>{code}</code></pre></div>;
}

export function Ws2022() {
  const [selected, setSelected] = useState(0);
  const phase = phases[selected];

  useEffect(() => {
    const previous = document.title;
    document.title = 'WS2022 · Fra server til infrastruktur | PowerShell';
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="ws-page">
      <section className="ws-hero" aria-labelledby="ws-title">
        <div className="ws-eyebrow"><span className="ws-dot" /> PowerShell i praksis <span>/</span> Windows Server 2022</div>
        <div className="ws-hero-grid">
          <div>
            <h1 id="ws-title">Fra en ren server<br />til <em>infrastruktur.</em></h1>
            <p className="ws-lead">Fem faser. Én fælles konfiguration. Se, hvordan et større PowerShell-script bygger et helt lab op — fra servernavn til Active Directory og gruppepolitik.</p>
            <div className="ws-actions"><a className="ws-primary" href="#ws-flow">Udforsk de 5 faser <span aria-hidden="true">↗</span></a><a className="ws-secondary" href="#ws-demo">Se demoforløbet <span aria-hidden="true">↓</span></a></div>
            <div className="ws-hero-meta"><span>Windows PowerShell 5.1</span><span>Modulært lab-script</span></div>
          </div>
          <div className="ws-blueprint" aria-label="Fra ren Windows Server til DC01 med domænet mags.local">
            <div className="ws-blueprint-top"><span>OPSKRIFTEN PÅ ET LAB</span><span aria-hidden="true">＋</span></div>
            <div className="ws-server"><div className="ws-rack" aria-hidden="true"><i /><i /><i /></div><div><small>UDGANGSPUNKT</small><strong>Windows Server 2022</strong><span>Ren installation · selvstændig server</span></div></div>
            <div className="ws-connector"><span>Invoke-Bootstrap.ps1</span><b aria-hidden="true">↓</b></div>
            <div className="ws-domain"><div><small>RESULTAT EFTER ALLE FASER</small><strong>DC01 <span>/ mags.local</span></strong></div><span className="ws-tag">DOMAIN CONTROLLER</span><div className="ws-role-tags"><span>AD DS</span><span>DNS</span><span>DHCP</span><span>File Server</span></div><div className="ws-domain-bottom"><span>3 OU’er</span><span>3 grupper</span><span>2 brugere</span><span>1 GPO</span></div></div>
            <p className="ws-blueprint-caption">Illustration af scriptets måltilstand</p>
          </div>
        </div>
        <div className="ws-stats"><div><strong>05</strong><span>afgrænsede faser</span></div><div><strong>04</strong><span>Windows-serverroller</span></div><div><strong>01</strong><span>fælles konfigurationsfil</span></div><div><strong>∞</strong><span>muligheder for at udvide</span></div></div>
      </section>

      <section id="ws-flow" className="ws-section" aria-labelledby="ws-flow-title">
        <div className="ws-section-heading"><div><span className="ws-eyebrow">01 / Fra start til slut</span><h2 id="ws-flow-title">Et stort script. Små, tydelige trin.</h2></div><p>Vælg en fase og kig ind i maskinrummet.<br />Visningen forklarer scriptet og kører ingen serverkommandoer.</p></div>
        <div className="ws-phase-buttons" role="group" aria-label="Vælg bootstrap-fase">{phases.map((item, index) => <button key={item.file} type="button" aria-pressed={selected === index} aria-controls="ws-phase-detail" onClick={() => setSelected(index)}><span className="ws-step-number">0{index + 1}</span><strong>{item.short}</strong><small>{index === 2 ? 'Genstart efter denne fase' : item.cmdlet}</small></button>)}</div>
        <div id="ws-phase-detail" className="ws-phase-detail" aria-live="polite">
          <div className="ws-phase-copy"><span className="ws-eyebrow">Fase 0{selected + 1} / 05</span><h3>{phase.title}</h3><p>{phase.description}</p><ul>{phase.actions.map(action => <li key={action}>{action}</li>)}</ul><div className="ws-result"><small>DET STÅR DU MED</small><p>{phase.result}</p></div></div>
          <div className="ws-phase-code"><Source name="Forklarende kodeudsnit" code={phase.code} /><div className="ws-concept"><span>POWERSHELL-GREBET</span><h4>{phase.concept}</h4><p>{phase.lesson}</p></div></div>
          <div className="ws-phase-note"><strong>I dette lab</strong><p>{phase.note}</p></div>
          <details className="ws-full-source" key={phase.file}><summary>Læs hele scriptet <span>{phase.file}</span></summary><Source name={phase.file} code={phase.source} /></details>
        </div>
      </section>

      <section className="ws-section" aria-labelledby="ws-architecture-title">
        <div className="ws-section-heading"><div><span className="ws-eyebrow">02 / Byg til at vokse</span><h2 id="ws-architecture-title">Strukturen gør forskellen.</h2></div><p>Et større script bliver overskueligt, når data, styring og opgaver har hver deres plads.</p></div>
        <div className="ws-architecture"><div><span className="ws-file-kind">DATA</span><h3>Config.psd1</h3><p>Domæne, servernavn, roller, OU’er, grupper og brugere. Ét sted at tilpasse labbet.</p></div><span className="ws-arch-arrow" aria-hidden="true">→</span><div className="ws-architecture-center"><span className="ws-file-kind">STYRING</span><h3>Invoke-Bootstrap.ps1</h3><p>Vælger fase og rækkefølge, sender konfigurationen videre og starter transcript.</p></div><span className="ws-arch-arrow" aria-hidden="true">→</span><div><span className="ws-file-kind">HANDLING</span><h3>01 → 05.ps1</h3><p>Hver fil løser én opgave. Kør en enkelt fase, eller saml dem i et kontrolleret forløb.</p></div></div>
        <div className="ws-common"><span aria-hidden="true">↳</span><p><strong>Common.ps1 binder det sammen.</strong> Fælles funktioner til konfiguration, administratortjek, statusbeskeder og AD-stier genbruges på tværs af faserne.</p></div>
        <div className="ws-principles"><article><span>01</span><h3>Se planen først</h3><p><code>-WhatIf</code> viser planlagte ændringer via <code>ShouldProcess</code>. Start demoen med fase 1 og 2 hver for sig.</p></article><article><span>02</span><h3>Undersøg før oprettelse</h3><p>Roller og AD-objekter kontrolleres, før de oprettes. Statusbeskeden <code>[SKIP]</code> forklarer, når noget allerede findes.</p></article><article><span>03</span><h3>Gør forløbet læsbart</h3><p><code>Start-Transcript</code> gemmer konsollens output. Fejl stopper forløbet, og fasevalget gør det muligt at fortsætte fra et valgt trin.</p></article></div>
        <details className="ws-full-source"><summary>Læs styringen bag faserne <span>Invoke-Bootstrap.ps1</span></summary><Source name="Invoke-Bootstrap.ps1" code={orchestratorSource} /></details>
        <details className="ws-full-source"><summary>Læs de fælles hjælpefunktioner <span>Common.ps1</span></summary><Source name="Common.ps1" code={commonSource} /></details>
      </section>

      <section className="ws-section" aria-labelledby="ws-ad-title">
        <div className="ws-section-heading"><div><span className="ws-eyebrow">03 / Resultatet i Active Directory</span><h2 id="ws-ad-title">Fra konfigurationsdata til organisation.</h2></div><p>Dette er de eksempelobjekter, som scriptet opretter med den medfølgende lab-konfiguration.</p></div>
        <div className="ws-directory"><div className="ws-directory-root"><span aria-hidden="true">▦</span><strong>mags.local</strong><span>DC01</span></div><div className="ws-ou-grid"><article><small>ORGANIZATIONAL UNIT</small><h3>IT</h3><p className="ws-group">GG-IT <span>Sikkerhedsgruppe</span></p><p className="ws-user">Anna Jensen <code>anna.jensen</code></p></article><article><small>ORGANIZATIONAL UNIT</small><h3>Salg</h3><p className="ws-group">GG-Salg <span>Sikkerhedsgruppe</span></p><p className="ws-user">Bo Nielsen <code>bo.nielsen</code></p></article><article><small>ORGANIZATIONAL UNIT</small><h3>Brugere</h3><p className="ws-group">GG-Alle <span>Ingen medlemmer endnu</span></p><p className="ws-policy">↳ Lab-Workstation-Baseline <span>GPO-link · brugerpolitik</span></p></article></div></div>
      </section>

      <section id="ws-demo" className="ws-section ws-demo" aria-labelledby="ws-demo-title">
        <div className="ws-section-heading"><div><span className="ws-eyebrow">04 / Vis det i praksis</span><h2 id="ws-demo-title">Et demoforløb med naturlige pauser.</h2></div><p>Brug en Windows Server 2022-lab-VM, PowerShell 5.1 som administrator og et snapshot før promotion.</p></div>
        <ol className="ws-demo-steps"><li><div><h3>Tilpas og undersøg</h3><p>Åbn mappen <code>scripts/ws2022-bootstrap</code>, tilpas <code>Config.psd1</code>, og vis først planen.</p></div><Source name="Vis planlagte ændringer" code={'.\\Invoke-Bootstrap.ps1 -Phase 1 -WhatIf\n.\\Invoke-Bootstrap.ps1 -Phase 2 -WhatIf'} /></li><li><div><h3>Klargør og installér</h3><p>Kør de første faser hver for sig. Genstart efter navneskift og efter rolleinstallation, hvis det anbefales, inden promotion.</p></div><Source name="Fase 01 og 02 · følg genstartsbeskeder" code={'.\\Invoke-Bootstrap.ps1 -Phase 1\n# Genstart efter navneskift, og åbn PowerShell igen\n.\\Invoke-Bootstrap.ps1 -Phase 2'} /></li><li><div><h3>Gør serveren til domain controller</h3><p>Indtast DSRM-adgangskoden. Promotion udløser normalt en genstart — her skifter serveren rolle.</p></div><Source name="Fase 03 · promotion" code={'.\\Invoke-Bootstrap.ps1 -Phase 3'} /></li><li><div><h3>Fortsæt efter genstart</h3><p>Log på som domæneadministrator, åbn scriptmappen igen, og opret AD-struktur og GPO. Indtast den midlertidige brugeradgangskode.</p></div><Source name="Fase 04 og 05 · fortsæt manuelt" code={'.\\Invoke-Bootstrap.ps1 -FromPhase 4 -All'} /></li></ol>
        <div className="ws-demo-end"><span aria-hidden="true">&gt;_</span><div><h3>Den samme idé kan drive meget mere.</h3><p>Udvid konfigurationen med flere brugere. Tilføj en fase til DHCP-scopes eller fildelinger. Bevar den fælles struktur, og lad PowerShell tage gentagelserne.</p></div></div>
      </section>
      <p className="ws-footnote">Showcase af ws2022-bootstrap · Kodevisningerne hentes fra projektets PowerShell-filer ved build.</p>
    </div>
  );
}
