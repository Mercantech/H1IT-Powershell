export const taskSchedulerCode = `# Opret en planlagt opgave der kører backup-tjek hver nat kl. 02:00
$action = New-ScheduledTaskAction -Execute "pwsh.exe" \`
    -Argument "-NoProfile -File C:\\Scripts\\backup-tjek.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 02:00

$settings = New-ScheduledTaskSettingsSet \`
    -StartWhenAvailable \`
    -DontStopOnIdleEnd \`
    -RestartCount 3 \`
    -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask \`
    -TaskName "Backup-tjek projekt" \`
    -Action $action \`
    -Trigger $trigger \`
    -Settings $settings \`
    -User "FIRMA\\svc_ps_scripts" \`
    -RunLevel Highest`;

export const cronExample = `# Linux cron — tilsvarende "kør hver nat kl. 02:00"
# Redigér med: crontab -e
0 2 * * * /usr/bin/pwsh /opt/scripts/backup-tjek.ps1 >> /var/log/backup-tjek.log 2>&1`;

export const deploymentMethods = [
  {
    title: 'Windows Opgaveplanlægning',
    subtitle: 'Task Scheduler — jeres primære værktøj i on-prem projekt',
    text: 'Bruges til gentagne scripts på servere og domænecontrollere: backup-tjek, AD-rapporter, DNS-eksport. Svarer til cron på Linux, men med GUI og Group Policy-integration.',
    when: 'Backup, rapporter, status-tjek på Windows-servere',
  },
  {
    title: 'Gruppepolitik (GPO)',
    subtitle: 'Scripts ved opstart, logon eller shutdown',
    text: 'I AD-projektet kan scripts køres via GPO på OU-niveau. Godt til ensartet klientopsætning — men sværere at fejlsøge end en planlagt opgave med logfil.',
    when: 'Klient- eller serveropsætning der skal følge OU-strukturen',
  },
  {
    title: 'Fjernservere med Invoke-Command',
    subtitle: 'Én planlagt opgave — mange servere',
    text: 'Læg scriptet på en administrations-server og kør det mod SRV01–03 via Invoke-Command. Undgår at vedligeholde identiske opgaver på hver maskine.',
    when: 'Serverdrift og ensartet tjek på member servers',
  },
  {
    title: 'Git + manuel/CI-kørsel',
    subtitle: 'Versionsstyret før produktion',
    text: 'Gem scripts i Git (jeres repo eller GitHub). Kør først manuelt i testmiljø, derefter via planlagt opgave. Ved CI/CD kan pipeline køre tests før deploy — samme tankegang som -WhatIf.',
    when: 'Alle scripts der skal dokumenteres i projektrapporten',
  },
];

export const deploymentBestPractices = [
  {
    title: 'Dedikeret servicekonto',
    text: 'Kør planlagte scripts med en konto der kun har de rettigheder opgaven kræver — ikke Domain Admin som standard.',
  },
  {
    title: 'Log altid output',
    text: 'Brug Start-Transcript eller skriv til en logfil med dato i navnet. Gør det muligt at dokumentere i rapporten og fejlsøge efter ferie.',
  },
  {
    title: 'Test før produktion',
    text: 'Kør med -WhatIf hvor det er muligt. Test i pilot-OU eller på én server før bred udrulning.',
  },
  {
    title: 'Fejlhåndtering og exit codes',
    text: 'Brug try/catch og afslut med exit 0 (OK) eller exit 1 (fejl). Task Scheduler og overvågning kan reagere på fejl.',
  },
  {
    title: 'Dokumentér i rapporten',
    text: 'Beskriv hvad scriptet gør, hvornår det kører, hvilken konto der bruges, og vedlæg eksempel på log-output.',
  },
];
