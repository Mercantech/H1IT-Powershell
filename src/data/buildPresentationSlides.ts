import { getLocalExercisesForPhase } from './localExercises';
import { dag1Exercises, dag2Exercises, projectExercise } from './exercises';
import { dag1Quiz } from './quizzes/dag1';
import { dag2Quiz } from './quizzes/dag2';
import { projectUseCases, guiVsScript } from './projectUseCases';
import {
  cronExample,
  deploymentBestPractices,
  deploymentMethods,
  taskSchedulerCode,
} from './deploymentGuide';
import { beginnerVideos } from './videos';
import type { PresentationSlide, SlideSection } from './presentationSlides';

function learningGoalsSlide(): PresentationSlide {
  return {
    id: 'intro-mal',
    layout: 'learning-goals',
    section: 'intro',
    title: 'Læringsmål',
  };
}

function sectionSlide(
  id: string,
  section: SlideSection,
  title: string,
  subtitle?: string
): PresentationSlide {
  return { id, layout: 'section', section, title, subtitle };
}

function bulletsSlide(
  id: string,
  section: SlideSection,
  title: string,
  bullets: string[],
  subtitle?: string
): PresentationSlide {
  return { id, layout: 'bullets', section, title, bullets, subtitle };
}

function codeSlide(
  id: string,
  section: SlideSection,
  title: string,
  code: string,
  extras?: Partial<PresentationSlide>
): PresentationSlide {
  return { id, layout: 'code', section, title, code, ...extras };
}

function runnableSlide(
  id: string,
  section: SlideSection,
  title: string,
  code: string,
  sampleOutput: string,
  extras?: Partial<PresentationSlide>
): PresentationSlide {
  return {
    id,
    layout: 'runnable',
    section,
    title,
    code,
    sampleOutput,
    ...extras,
  };
}

export function buildPresentationSlides(): PresentationSlide[] {
  const slides: PresentationSlide[] = [];

  slides.push({
    id: 'title',
    layout: 'title',
    section: 'intro',
    title: 'Serverautomatisering I',
    subtitle: 'PowerShell · 16862 · H1 IT / Infrastruktur og Cyber',
    highlight: 'Uge 37–38 · Koblet på infrastrukturprojekt',
  });

  slides.push(
    bulletsSlide('intro-forlob', 'intro', 'Undervisningsforløb', [
      'Dag 1 (uge 37, 10. sep.): Cmdlets, pipeline, variabler, aliases',
      'Dag 2 (uge 38, 17. sep.): Sikkerhed, fjernadmin, WBEM/CIM, data',
      'Projektkobling: AD, DNS, DHCP, backup, netværk, serverdrift',
      'Lokale opgaver, quizzer og kodeøvelser på hver side',
    ])
  );

  slides.push(learningGoalsSlide());

  slides.push({
    id: 'intro-gui',
    layout: 'highlight',
    section: 'intro',
    title: 'Shell vs. GUI',
    highlight:
      'GUI er godt til engangsopgaver og visuel oversigt. PowerShell er stærkt når opgaver gentages, skal dokumenteres eller køres på mange servere.',
  });

  // ─── DAG 1 ───────────────────────────────────────────────
  slides.push(
    sectionSlide('dag1-section', 'dag-1', 'Dag 1', 'Grundlæggende · Uge 37 · 10. september')
  );

  slides.push(
    bulletsSlide('dag1-intro', 'dag-1', 'Introduktion', [
      'PowerShell = kommandolinje og scripting til Windows-administration',
      'Automatisér gentagne opgaver i infrastrukturprojektet',
      'Objekter i pipelinen — ikke bare tekst som i cmd',
      'PS C:\\Serverauto> — arbejdsmappe i lab',
    ])
  );

  slides.push(
    runnableSlide(
      'dag1-intro-run',
      'dag-1',
      'Introduktion — kør eksempel',
      'Get-ComputerInfo | Select-Object WindowsProductName, OsArchitecture',
      `PS C:\\Serverauto> Get-ComputerInfo | Select-Object WindowsProductName, OsArchitecture

WindowsProductName              OsArchitecture
------------------              --------------
Windows Server 2022 Standard    64-bit`,
      { highlight: 'Klik Kør eksempel — simuleret output fra et servermiljø' }
    )
  );

  const dag1Videos = beginnerVideos.filter((v) =>
    ['intro', 'pipeline', 'variabler', 'scriptlogik'].includes(v.module)
  );
  slides.push(
    bulletsSlide(
      'dag1-videoer',
      'dag-1',
      'Supplerende videoer (Dag 1)',
      dag1Videos.map((v) => `Video ${v.episode}: ${v.title} — ${v.summary}`)
    )
  );

  slides.push(
    bulletsSlide('dag1-cmdlets-intro', 'dag-1', 'Cmdlets og hjælp', [
      'Verb-Noun: Get-Process, Set-Service, New-Item',
      'Get-Help — dokumentation og eksempler',
      'Get-Command — find cmdlets, funktioner og aliases',
      'Get-Member — se egenskaber og metoder på objekter',
    ])
  );

  slides.push(
    runnableSlide(
      'dag1-cmdlets-run',
      'dag-1',
      'Cmdlets — kør eksempel',
      `Get-Help Get-Service -Examples
Get-Command -Noun Service
Get-Command -Verb Get | Select-Object -First 5`,
      `PS C:\\Serverauto> Get-Command -Noun Service

CommandType     Name               Version    Source
-----------     ----               -------    ------
Cmdlet          Get-Service        3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Restart-Service    3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Set-Service        3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Start-Service      3.1.0.0    Microsoft.PowerShell.Management
Cmdlet          Stop-Service       3.1.0.0    Microsoft.PowerShell.Management`
    )
  );

  slides.push(
    bulletsSlide('dag1-pipeline-intro', 'dag-1', 'Pipeline', [
      'Operatoren | sender output videre som input til næste cmdlet',
      'Get-Service → Where-Object → Select-Object',
      'Kernen i PowerShells styrke — brug den i hele projektet',
    ])
  );

  slides.push(
    runnableSlide(
      'dag1-pipeline-run',
      'dag-1',
      'Pipeline — kør eksempel',
      `Get-Service |
  Where-Object { $_.Status -eq "Stopped" } |
  Select-Object Name, Status`,
      `PS C:\\Serverauto> Get-Service |
>>   Where-Object { $_.Status -eq "Stopped" } |
>>   Select-Object Name, Status

Name              Status
----              ------
Spooler           Stopped
RemoteRegistry    Stopped
Themes            Stopped`
    )
  );

  slides.push(
    bulletsSlide('dag1-pipeline-ovelse', 'dag-1', 'Pipeline-visualizer (på sitet)', [
      'Øv rækkefølgen: Get-Service → Where-Object → Select-Object',
      'Mål: Find stoppede services og vis kun navnet',
      'Eleverne kan øve interaktivt på /dag-1#pipeline',
    ])
  );

  slides.push(
    codeSlide(
      'dag1-variabler',
      'dag-1',
      'Variabler og aliases',
      `$server = "DC01"
$services = Get-Service | Where-Object Status -eq "Running"
$services.Count

Set-Alias -Name svc -Value Get-Service
svc`,
      {
        bullets: [
          'Variabler gemmer tekst, tal og objekter fra pipelinen',
          'Alias = kun andet navn — ingen ekstra logik',
          'Brug funktioner til genbrugelig kode',
        ],
      }
    )
  );

  slides.push(
    runnableSlide(
      'dag1-variabler-run',
      'dag-1',
      'Variabler — kør eksempel',
      `$stopped = Get-Service | Where-Object Status -eq "Stopped"
$stopped.Count`,
      `PS C:\\Serverauto> $stopped = Get-Service | Where-Object Status -eq "Stopped"
PS C:\\Serverauto> $stopped.Count
3`
    )
  );

  slides.push(
    bulletsSlide('dag1-scriptlogik', 'dag-1', 'Betingelser og løkker (video)', [
      'If/Else, Switch, ForEach, For/Do — supplerende pensum',
      'Nyttigt når scripts skal træffe valg eller gentage handlinger',
      'Videoer indlejret under /dag-1#scriptlogik',
    ])
  );

  slides.push(
    bulletsSlide('dag1-tools', 'dag-1', 'Anbefalede værktøjer', [
      'PowerShell-terminal: enkeltlinjer, pipeline, -WhatIf, Invoke-Command',
      'VS Code: scripts (.ps1), CSV-arbejde, projektscripts med extension',
      'Git anbefales: versionsstyring, deling i gruppe, klar til H2/praktik',
    ])
  );

  slides.push(
    bulletsSlide('dag1-git', 'dag-1', 'Git — stærkt anbefalet', [
      'Ikke pensumkrav — men læg al kode i et repo (GitHub/GitLab)',
      'Historik, review i gruppen, scripts samlet i scripts/',
      'Minimum: mappe med scripts/, README og regelmæssige commits',
    ])
  );

  dag1Exercises.forEach((ex) => {
    slides.push({
      id: `dag1-ex-${ex.id}`,
      layout: 'bullets',
      section: 'dag-1',
      title: 'Kodeøvelse',
      subtitle: ex.prompt,
      bullets: [ex.hint ? `Hint: ${ex.hint}` : '', `Facit: ${ex.explanation}`].filter(Boolean),
    });
  });

  dag1Quiz.forEach((q) => {
    slides.push({
      id: `dag1-quiz-${q.id}`,
      layout: 'quiz',
      section: 'dag-1',
      title: 'Dag 1 — Quiz',
      quizQuestion: q.question,
      quizOptions: q.type === 'multiple' ? q.options : ['Sandt', 'Falsk'],
      quizAnswer:
        q.type === 'boolean'
          ? q.correctAnswer
            ? 'Sandt'
            : 'Falsk'
          : String(q.correctAnswer),
      quizExplanation: q.explanation,
    });
  });

  getLocalExercisesForPhase('dag-1').forEach((ex) => {
    slides.push({
      id: `dag1-lok-${ex.id}`,
      layout: 'local',
      section: 'dag-1',
      title: ex.title,
      subtitle: ex.description,
      steps: ex.steps,
      deliverable: ex.deliverable,
      bullets: [`Miljø: ${ex.environment} · Værktøj: ${ex.tool}`],
    });
  });

  // ─── DAG 2 ───────────────────────────────────────────────
  slides.push(
    sectionSlide('dag2-section', 'dag-2', 'Dag 2', 'Sikkerhed og anvendelse · Uge 38 · 17. september')
  );

  slides.push(
    bulletsSlide('dag2-sikkerhed-intro', 'dag-2', 'Sikker scripting', [
      'Test scripts sikkert før produktion',
      '-WhatIf — simuler handlingen',
      '-Confirm — bed om bekræftelse',
      'Start-Transcript — log session til fil (rapport/audit)',
    ])
  );

  slides.push(
    runnableSlide(
      'dag2-sikkerhed-run',
      'dag-2',
      'Sikker scripting — kør eksempel',
      `Remove-Item C:\\Temp\\old.log -WhatIf

Start-Transcript -Path C:\\Logs\\session.log
Get-Service | Select-Object -First 3
Stop-Transcript`,
      `PS C:\\Serverauto> Remove-Item C:\\Temp\\old.log -WhatIf
What if: Performing the operation "Remove File" on target "C:\\Temp\\old.log".

PS C:\\Serverauto> Start-Transcript -Path C:\\Logs\\session.log
Transcript started, output file is C:\\Logs\\session.log
PS C:\\Serverauto> Get-Service | Select-Object -First 3

Name    Status
----    ------
AppIDSvc Running
Appinfo Running
AppXSvc Running

PS C:\\Serverauto> Stop-Transcript
Transcript stopped, output file is C:\\Logs\\session.log`
    )
  );

  slides.push(
    bulletsSlide('dag2-fjernadmin-intro', 'dag-2', 'Fjernadministration', [
      'Administrér servere uden RDP',
      'Invoke-Command — kør scriptblock på fjernserver(e)',
      'Enter-PSSession — interaktiv prompt på fjernserver',
      'Kræver WinRM og netværksadgang',
    ])
  );

  slides.push(
    runnableSlide(
      'dag2-fjernadmin-run',
      'dag-2',
      'Fjernadministration — kør eksempel',
      `$servere = "SRV01", "SRV02"
Invoke-Command -ComputerName $servere -ScriptBlock {
    Get-Service | Where-Object Status -eq "Stopped" | Select-Object -First 2 Name
}`,
      `PS C:\\Serverauto> Invoke-Command -ComputerName $servere -ScriptBlock {
>>     Get-Service | Where-Object Status -eq "Stopped" | Select-Object -First 2 Name
>> }

PSComputerName Name
-------------- ----
SRV01          Spooler
SRV01          RemoteRegistry
SRV02          Themes
SRV02          W32Time`
    )
  );

  slides.push(
    bulletsSlide('dag2-wbem-intro', 'dag-2', 'WBEM / CIM', [
      'WBEM = Web-Based Enterprise Management',
      'Get-CimInstance — moderne standard (erstatter Get-WmiObject)',
      'Inventér OS, disk, processer til dokumentation',
    ])
  );

  slides.push(
    runnableSlide(
      'dag2-wbem-run',
      'dag-2',
      'WBEM / CIM — kør eksempel',
      `Get-CimInstance Win32_OperatingSystem |
  Select-Object Caption, Version

Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
  Select-Object DeviceID, @{N="GB fri";E={[math]::Round($_.FreeSpace/1GB,1)}}`,
      `PS C:\\Serverauto> Get-CimInstance Win32_OperatingSystem |
>>   Select-Object Caption, Version

Caption                            Version
-------                            -------
Microsoft Windows Server 2022 Standard 10.0.20348

PS C:\\Serverauto> Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
>>   Select-Object DeviceID, @{N="GB fri";E={[math]::Round($_.FreeSpace/1GB,1)}}

DeviceID GB fri
-------- ------
C:       124.5
D:       512.0`
    )
  );

  slides.push(
    bulletsSlide('dag2-data-intro', 'dag-2', 'Datahåndtering', [
      'CSV = rækker og kolonner som en databasetabel',
      'Import-Csv ≈ SELECT * · Where-Object ≈ WHERE',
      'Select-Object ≈ SELECT kolonner · Export-Csv til rapport',
    ])
  );

  slides.push(
    runnableSlide(
      'dag2-data-run',
      'dag-2',
      'Datahåndtering — kør eksempel',
      `$brugere = Import-Csv .\\brugere.csv
$brugere | Where-Object Afdeling -eq "IT" | Select-Object Navn, Email

Get-Service | Select-Object Name, Status | Export-Csv .\\services.csv`,
      `PS C:\\Serverauto> $brugere = Import-Csv .\\brugere.csv
PS C:\\Serverauto> $brugere | Where-Object Afdeling -eq "IT" |
>>   Select-Object Navn, Email

Navn         Email
----         -----
Anna Jensen  anna@firma.local
Bo Nielsen   bo@firma.local

PS C:\\Serverauto> Get-Service | Select-Object Name, Status |
>>   Export-Csv .\\services.csv`
    )
  );

  dag2Exercises.forEach((ex) => {
    slides.push({
      id: `dag2-ex-${ex.id}`,
      layout: 'bullets',
      section: 'dag-2',
      title: 'Kodeøvelse',
      subtitle: ex.prompt,
      bullets: [ex.hint ? `Hint: ${ex.hint}` : '', `Facit: ${ex.explanation}`].filter(Boolean),
    });
  });

  dag2Quiz.forEach((q) => {
    slides.push({
      id: `dag2-quiz-${q.id}`,
      layout: 'quiz',
      section: 'dag-2',
      title: 'Dag 2 — Quiz',
      quizQuestion: q.question,
      quizOptions: q.type === 'multiple' ? q.options : ['Sandt', 'Falsk'],
      quizAnswer:
        q.type === 'boolean'
          ? q.correctAnswer
            ? 'Sandt'
            : 'Falsk'
          : String(q.correctAnswer),
      quizExplanation: q.explanation,
    });
  });

  getLocalExercisesForPhase('dag-2').forEach((ex) => {
    slides.push({
      id: `dag2-lok-${ex.id}`,
      layout: 'local',
      section: 'dag-2',
      title: ex.title,
      subtitle: ex.description,
      steps: ex.steps,
      deliverable: ex.deliverable,
      bullets: [`Miljø: ${ex.environment} · Værktøj: ${ex.tool}`],
    });
  });

  // ─── PROJEKT ─────────────────────────────────────────────
  slides.push(
    sectionSlide('projekt-section', 'projekt', 'Projektkobling', 'Fra teori til infrastrukturprojekt')
  );

  slides.push(
    bulletsSlide('projekt-helhed', 'projekt', 'Helhedsdiagram', [
      'PowerShell binder infrastruktur og automatisering',
      'AD, DNS, DHCP, backup, netværk, sikkerhed',
      'Scripts, fjernadmin, overvågning, sikker test med WhatIf',
      'Kravspecifikation → script → dokumentation i rapport',
    ])
  );

  slides.push(
    bulletsSlide('projekt-arbejdsgang', 'projekt', 'Arbejdsgang', [
      '1. Læs krav fra case — identificér gentagne opgaver',
      '2. Skriv PowerShell-script i VS Code',
      '3. Test med -WhatIf',
      '4. Virker det? → Kør i projektmiljø',
      '5. Dokumentér i rapport → præsentér i fremlæggelse',
    ])
  );

  slides.push({
    id: 'projekt-gui-table',
    layout: 'table',
    section: 'projekt',
    title: 'Hvornår GUI vs. script?',
    tableHeaders: ['Situation', 'GUI', 'PowerShell'],
    rows: guiVsScript.map((r) => [r.situation, r.gui, r.script]),
  });

  projectUseCases.forEach((uc) => {
    slides.push({
      id: `projekt-uc-${uc.id}-intro`,
      layout: 'bullets',
      section: 'projekt',
      title: `${uc.title} (${uc.component})`,
      bullets: [uc.description],
    });
    slides.push(
      runnableSlide(
        `projekt-uc-${uc.id}-run`,
        'projekt',
        `${uc.title} — kør eksempel`,
        uc.code,
        uc.sampleOutput
      )
    );
  });

  slides.push({
    id: 'projekt-mini-ex',
    layout: 'bullets',
    section: 'projekt',
    title: 'Mini-opgave — projektrelevans',
    subtitle: projectExercise.prompt,
    bullets: [
      projectExercise.hint ? `Hint: ${projectExercise.hint}` : '',
      projectExercise.explanation,
    ].filter(Boolean),
  });

  getLocalExercisesForPhase('projekt').forEach((ex) => {
    slides.push({
      id: `projekt-lok-${ex.id}`,
      layout: 'local',
      section: 'projekt',
      title: ex.title,
      subtitle: ex.description,
      steps: ex.steps,
      deliverable: ex.deliverable,
      bullets: [`Miljø: ${ex.environment} · Værktøj: ${ex.tool}`],
    });
  });

  slides.push(
    bulletsSlide('projekt-deploy-intro', 'projekt', 'Fra script til drift', [
      'Et script er ikke færdigt før det kører pålideligt i miljøet',
      'Planlæg kørsel, sikr rettigheder og log resultater',
      'Ikke manuel Run hver gang',
    ])
  );

  deploymentMethods.forEach((m) => {
    slides.push({
      id: `deploy-${m.title.replace(/\s+/g, '-').toLowerCase()}`,
      layout: 'bullets',
      section: 'projekt',
      title: m.title,
      subtitle: m.subtitle,
      bullets: [m.text, `Brug når: ${m.when}`],
    });
  });

  slides.push(
    runnableSlide(
      'projekt-task-scheduler',
      'projekt',
      'Task Scheduler — kør eksempel',
      taskSchedulerCode,
      `PS C:\\Serverauto> Register-ScheduledTask \`
>>     -TaskName "Backup-tjek projekt" \`
>>     -Action $action \`
>>     -Trigger $trigger \`
>>     -Settings $settings \`
>>     -User "FIRMA\\svc_ps_scripts" \`
>>     -RunLevel Highest

TaskPath  TaskName              State
--------  --------              -----
\\        Backup-tjek projekt   Ready`
    )
  );

  slides.push(
    codeSlide('projekt-cron', 'projekt', 'Linux: cron', cronExample, {
      subtitle: 'PowerShell 7 (pwsh) på Linux — samme scripts, anden scheduler',
    })
  );

  slides.push(
    bulletsSlide(
      'projekt-best-practice',
      'projekt',
      'Best practice før produktion',
      deploymentBestPractices.map((b) => `${b.title}: ${b.text}`)
    )
  );

  slides.push({
    id: 'afslutning',
    layout: 'title',
    section: 'afslutning',
    title: 'Spørgsmål?',
    subtitle: 'Øv på sitet · Lokale opgaver · Projektkobling',
    highlight: 'Esc afslutter · F5 starter forfra · Shift+F5 fra aktuel sektion',
  });

  return slides;
}
