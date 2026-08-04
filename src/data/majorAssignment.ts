export interface MajorAssignmentPhase {
  id: string;
  title: string;
  summary: string;
}

export interface MajorAssignmentInspiration {
  label: string;
  href: string;
}

/** Den store opgave — clean WS 2022 til driftsklar lab-server via PowerShell. */
export const majorAssignment = {
  title: 'Den store opgave',
  subtitle: 'Fra clean Windows Server 2022 til roller, AD og GPO',
  chefBrief:
    'MAGS har en ny, ren Windows Server 2022. Den skal være klar som lab-domænecontroller med de nødvendige roller, en fornuftig AD-struktur og mindst én gruppepolitik. Automatisér så meget som muligt med PowerShell — GUI er kun til fejlfinding.',
  scenario: [
    'Startpunktet er en clean opsat Windows Server 2022 (lab-VM) til MAGS.',
    'Målet er en driftsklar server: roller installeret, Active Directory opsat (fx mags.local), OU/grupper/brugere på plads og mindst én eksempel-GPO linket.',
    'I skriver jeres egne scripts i projektgruppens Git-repo under scripts/. Brug use cases nedenfor som inspiration — ikke som facit.',
    'Test altid i lab først. Genstart kan være nødvendig efter AD DS-promotion.',
  ],
  goals: [
    'Installere og verificere server-roller (fx AD DS, DNS, DHCP, File Services)',
    'Promovere serveren til domain controller (ny forest i lab)',
    'Opbygge OU-struktur, sikkerhedsgrupper og eksempelbrugere',
    'Oprette og linke mindst én GPO med en simpel, dokumenteret indstilling',
    'Dokumentere kørsel med transcript/log og forklare valg i rapporten',
  ],
  requirements: [
    'Scripts er parametriserede (domæne, hostname, stier) — ikke hardcodede hemmeligheder',
    'Idempotente hvor det er muligt: spring over hvis rolle/OU/GPO allerede findes',
    'Første test med -WhatIf (eller tilsvarende dry-run) når noget ændres',
    'Start-Transcript eller logfil ved lab-kørsel',
    'Kommentarer forklarer cmdlets, flags og pipeline — ikke kun «opretter bruger»',
    'Passwords (fx DSRM) håndteres som SecureString / prompt — aldrig plaintext i Git',
  ],
  phases: [
    {
      id: 'prepare',
      title: '1. Forbered host',
      summary: 'Hostname, netværk og grundlæggende serverindstillinger klar til AD.',
    },
    {
      id: 'roles',
      title: '2. Installer roller',
      summary: 'AD DS, DNS, DHCP og File Services — tjek InstallState før installation.',
    },
    {
      id: 'promote',
      title: '3. Promote til DC',
      summary: 'Ny forest/domæne. Planlæg genstart — næste faser kører efter reboot.',
    },
    {
      id: 'ad-structure',
      title: '4. AD-struktur',
      summary: 'OU’er, grupper og eksempelbrugere der matcher jeres projektcase.',
    },
    {
      id: 'gpo',
      title: '5. Eksempel-GPO',
      summary: 'New-GPO, link til OU og én dokumenteret policy-indstilling.',
    },
  ] satisfies MajorAssignmentPhase[],
  inspiration: [
    { label: 'Installation af server-roller', href: '/projekt#server-roles' },
    { label: 'Active Directory-brugere', href: '/projekt#ad' },
    { label: 'AD-grupper', href: '/projekt#ad-groups' },
    { label: 'Deployment og GPO (tekst)', href: '/projekt#deployment' },
  ] satisfies MajorAssignmentInspiration[],
  deliverableNote:
    'Aflever scripts i jeres eget Git-repo under scripts/, testoutput til rapporten, og brug vurderingskriterierne ovenfor ved peer review og fremlæggelse.',
} as const;
