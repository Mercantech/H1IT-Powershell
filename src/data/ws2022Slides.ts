import type { PresentationSlide } from './presentationSlides';
import { ws2022Phases } from './ws2022';

export const ws2022Slides: PresentationSlide[] = [
  {
    id: 'ws2022-intro', section: 'ws2022', layout: 'title',
    title: 'Serveropsætning med PowerShell',
    subtitle: 'Windows Server 2022 · Gennemgang af ws2022-bootstrap',
    highlight: 'Hvad ændrer scriptet, og hvilke manuelle trin erstatter det?',
  },
  {
    id: 'ws2022-struktur', section: 'ws2022', layout: 'bullets',
    title: 'Opdelingen i data og scripts',
    bullets: [
      'Config.psd1 indeholder servernavn, domæne, roller, OU’er, grupper og brugere.',
      'Invoke-Bootstrap.ps1 styrer rækkefølgen og gemmer konsollens output med Start-Transcript.',
      'Fase 01–05 løser hver sin opgave og kan startes enkeltvis.',
      'Common.ps1 samler administratortjek, konfigurationsindlæsning og AD-stier.',
    ],
  },
  ...ws2022Phases.flatMap((phase, index): PresentationSlide[] => {
    const prefix = `ws2022-fase-${index + 1}`;
    const title = `0${index + 1} · ${phase.title}`;
    return [
      {
        id: `${prefix}-forklaring`, section: 'ws2022', layout: 'bullets',
        title, subtitle: phase.description, bullets: phase.actions,
      },
      {
        id: `${prefix}-sammenligning`, section: 'ws2022', layout: 'table',
        title: `0${index + 1} · Manuelt og med PowerShell`,
        tableHeaders: ['Arbejdsgang', 'Hvad du gør'],
        rows: [['Manuelt', phase.manual], ['Med PowerShell', phase.lesson]],
      },
      {
        id: `${prefix}-kode`, section: 'ws2022', layout: 'code',
        title: `0${index + 1} · ${phase.concept}`,
        subtitle: `${phase.file} · Forkortet kodeudsnit til forklaring`,
        code: phase.code, bullets: [phase.explanation, phase.note],
      },
    ];
  }),
  {
    id: 'ws2022-ad', section: 'ws2022', layout: 'table',
    title: 'AD-strukturen på DC01 · mags.local',
    tableHeaders: ['OU', 'Gruppe', 'Bruger / politik'],
    rows: [
      ['IT', 'GG-IT', 'Anna Jensen · anna.jensen'],
      ['Salg', 'GG-Salg', 'Bo Nielsen · bo.nielsen'],
      ['Brugere', 'GG-Alle (uden medlemmer)', 'GPO-link: Lab-Workstation-Baseline'],
    ],
  },
  {
    id: 'ws2022-afproevning', section: 'ws2022', layout: 'code',
    title: 'Afprøvning af fase 1 og 2',
    subtitle: 'Lab-VM · Windows PowerShell 5.1 som administrator',
    code: '.\\Invoke-Bootstrap.ps1 -Phase 1 -WhatIf\n.\\Invoke-Bootstrap.ps1 -Phase 2 -WhatIf',
    bullets: [
      'Tilpas Config.psd1, og kør fra mappen scripts/ws2022-bootstrap.',
      'WhatIf viser de ændringer, der er beskyttet af ShouldProcess. Det er ikke en fuld test af alle senere faser.',
      'Kør derefter fase 1 og 2 hver for sig uden -WhatIf. Følg beskeder om genstart før promotion.',
    ],
  },
  {
    id: 'ws2022-genstart', section: 'ws2022', layout: 'code',
    title: 'Promotion og fortsættelse efter genstart',
    code: '# Tag snapshot før promotion. Indtast DSRM-adgangskoden.\n.\\Invoke-Bootstrap.ps1 -Phase 3\n\n# Efter genstart: log på som domæneadministrator,\n# og åbn scriptmappen igen.\n.\\Invoke-Bootstrap.ps1 -FromPhase 4 -All',
    bullets: [
      'Fase 3 genstarter normalt serveren. Fortsættelsen fra fase 4 startes manuelt.',
      'Fase 4 beder om en midlertidig adgangskode til eksempelbrugerne.',
    ],
  },
  {
    id: 'ws2022-graenser', section: 'ws2022', layout: 'bullets',
    title: 'Genbrug af scriptet og dets begrænsninger',
    bullets: [
      'Ved genopbygning af labbet kan de samme valg genbruges og gennemgås i Git.',
      'En enkelt ændring kan være hurtigere manuelt. Et script skal først forstås og afprøves.',
      'Eksisterende objekter springes ofte over. En ændret OU i konfigurationen flytter fx ikke en eksisterende bruger.',
      'DHCP og File Server installeres som roller. Scopes og fildelinger kræver yderligere opsætning.',
    ],
  },
];
