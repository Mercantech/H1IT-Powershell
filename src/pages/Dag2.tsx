import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { LocalExercisesSection } from '../components/LocalExercisesSection';
import { ModuleVideos } from '../components/ModuleVideos';
import { Quiz } from '../components/Quiz';
import { beginnerPlaylistUrl } from '../data/videos';
import { dag2Exercises } from '../data/exercises';
import { dag2Quiz } from '../data/quizzes/dag2';

export function Dag2() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Dag 2 — Sikkerhed og anvendelse</h1>
        <p>
          Uge 38 · 17. september. Sikker scripting, fjernadministration,
          WBEM/CIM og datahåndtering. Supplerende videoer er indlejret under
          relevante moduler.
        </p>
      </header>

      <section id="sikkerhed" className="module-section">
        <h2>Sikker scripting</h2>
        <p>
          I et produktionsmiljø er det kritisk at teste scripts sikkert før de
          køres. PowerShell har indbyggede sikkerhedsparametre:
        </p>
        <CodeBlock
          code={`# Vis hvad der VILLE ske — uden at gøre det
Remove-Item C:\\Temp\\old.log -WhatIf

# Bed om bekræftelse før handling
Remove-Item C:\\Temp\\old.log -Confirm

# Log alt output til en fil
Start-Transcript -Path C:\\Logs\\session.log
Get-Service
Stop-Transcript`}
        />
        <ul>
          <li>
            <code>-WhatIf</code> — simuler handlingen
          </li>
          <li>
            <code>-Confirm</code> — bed om bekræftelse
          </li>
          <li>
            <code>Start-Transcript</code> — log session til fil
          </li>
        </ul>
        <ModuleVideos module="sikkerhed" />
        <Link to="/projekt#backup" className="project-link">
          → Se projektkobling: Backup
        </Link>
      </section>

      <section id="execution-policy" className="module-section">
        <h2>Execution Policy og script signing</h2>
        <p>
          Execution Policy beskytter mod at scripts kører ved et uheld. Det er
          en <strong>intentionssignal</strong> — ikke en sikkerhedsgrænse der
          ikke kan omgås.
        </p>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Betydning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>Restricted</code></td>
              <td>Ingen scripts tilladt (typisk default)</td>
            </tr>
            <tr>
              <td><code>RemoteSigned</code></td>
              <td>Lokale scripts kører; scripts fra netværk skal signeres</td>
            </tr>
            <tr>
              <td><code>Unrestricted</code></td>
              <td>Alt kører — frarådes i produktion</td>
            </tr>
            <tr>
              <td><code>Bypass</code></td>
              <td>Ingen begrænsninger — kun til kontrollerede deployments</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`Get-ExecutionPolicy
Get-ExecutionPolicy -List

# Typisk på egen PC til udvikling:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`}
        />
        <p>
          <strong>Script signing:</strong> Scripts kan signeres digitalt med et
          certifikat, så I kan se om de er ændret siden signering. Kræver PKI
          i enterprise-miljøer — relevant når RemoteSigned er politikken.
        </p>
        <Link to="/ordbog" className="project-link">
          → Se også i ordbogen: Execution Policy
        </Link>

      <section id="fjernadmin" className="module-section">
        <h2>Fjernadministration</h2>
        <p>
          Administrér servere uden at logge ind via RDP. Essentielt i
          infrastrukturprojekter med flere member servers.
        </p>
        <CodeBlock
          code={`# Kør script på fjernserver
Invoke-Command -ComputerName SRV01 -ScriptBlock {
    Get-Service | Where-Object Status -eq "Stopped"
}

# Interaktiv session
Enter-PSSession -ComputerName SRV01
# ... arbejd som om du var lokalt ...
Exit-PSSession`}
        />
        <Link to="/projekt#serverdrift" className="project-link">
          → Se projektkobling: Serverdrift
        </Link>
      </section>

      <section id="wbem" className="module-section">
        <h2>WBEM / CIM</h2>
        <p>
          WBEM (Web-Based Enterprise Management) giver adgang til systeminformation.
          Brug <code>Get-CimInstance</code> i moderne PowerShell:
        </p>
        <CodeBlock
          code={`# Operativsystem-info
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version

# Diskplads
Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace

# Kørende processer
Get-CimInstance Win32_Process | Select-Object Name, ProcessId -First 10`}
        />
        <p>
          CIM er erstatningen for ældre WMI-cmdlets og er standarden fremadrettet.
        </p>
        <Link to="/projekt#netværk" className="project-link">
          → Se projektkobling: Netværk
        </Link>
      </section>

      <section id="data" className="module-section">
        <h2>Datahåndtering</h2>
        <p>
          CSV-filer kan behandles som databaser med rækker og kolonner.
          Importér, filtrér og eksportér data via pipelinen:
        </p>
        <CodeBlock
          code={`# Importer CSV — som en databasetabel
$brugere = Import-Csv .\\brugere.csv
$brugere | Where-Object Afdeling -eq "IT" | Select-Object Navn, Email

# Eksporter til CSV
Get-Service | Select-Object Name, Status, StartType | Export-Csv .\\services.csv

# Sammenligning med database:
# Import-Csv = SELECT * FROM tabel
# Where-Object = WHERE betingelse
# Select-Object = SELECT kolonner
# Sort-Object = ORDER BY`}
        />
        <ModuleVideos module="data" />
        <p className="module-video-playlist">
          Hele playlisten:{' '}
          <a href={beginnerPlaylistUrl} target="_blank" rel="noreferrer">
            Beginner PowerShell 7 Tutorials på YouTube
          </a>
        </p>
        <Link to="/projekt#ad" className="project-link">
          → Se projektkobling: Active Directory
        </Link>
      </section>

      <section id="øvelser" className="module-section">
        <h2>Øvelser</h2>
        <p>Test din viden med disse kodeøvelser:</p>
        {dag2Exercises.map((ex) => (
          <CodeExercise key={ex.id} exercise={ex} />
        ))}
        <Quiz questions={dag2Quiz} title="Dag 2 — Quiz" />
      </section>

      <LocalExercisesSection phase="dag-2" />

      <div className="cta-box">
        <h3>Klar til projektet?</h3>
        <p>
          Kobl scripting på jeres infrastrukturprojekt med use cases, deployment
          og lokale projektopgaver.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/projekt" className="btn btn-primary">
            Projektkobling →
          </Link>
          <Link to="/dag-1" className="btn btn-secondary">
            ← Dag 1
          </Link>
        </div>
      </div>
    </div>
  );
}
