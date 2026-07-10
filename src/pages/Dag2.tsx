import { Link } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { CodeExercise } from '../components/CodeExercise';
import { Quiz } from '../components/Quiz';
import { dag2Exercises } from '../data/exercises';
import { dag2Quiz } from '../data/quizzes/dag2';

export function Dag2() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Dag 2 — Sikkerhed og anvendelse</h1>
        <p>
          Uge 38 · 17. september. Sikker scripting, fjernadministration,
          WBEM/CIM og datahåndtering.
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
        <Link to="/projekt#backup" className="project-link">
          → Se projektkobling: Backup
        </Link>
      </section>

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

      <div className="cta-box">
        <h3>Klar til at anvende det i jeres projekt?</h3>
        <p>
          Se den dedikerede Projektkobling-side med helhedsdiagram, use cases
          og en projektrelevant mini-opgave.
        </p>
        <Link to="/projekt" className="btn btn-primary">
          Gå til Projektkobling →
        </Link>
      </div>
    </div>
  );
}
