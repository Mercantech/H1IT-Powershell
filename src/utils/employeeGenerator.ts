export interface RoleProfile {
  id: string;
  title: string;
  department: string;
  ou: string;
  groups: string;
  gpos: string;
}

export interface GeneratorConfig {
  company: string;
  acquiredCompany: string;
  sourceDomain: string;
  targetDomain: string;
  count: number;
  roles: RoleProfile[];
  accessPool: string;
  maxExtraAccess: number;
  reservedUsernames: string;
}

export const initialConfig: GeneratorConfig = {
  company: '',
  acquiredCompany: 'OnlyMAGS',
  sourceDomain: 'onlymags.local',
  targetDomain: 'JeresDomæne.local',
  count: 100,
  roles: [
    { id: 'sales', title: 'Sales Representative', department: 'Sales', ou: 'OU=Sales,OU=Users,DC=JeresDomæne,DC=local', groups: 'GG_Sales', gpos: 'GPO_Baseline\nGPO_Sales' },
    { id: 'finance', title: 'Accountant', department: 'Finance', ou: 'OU=Finance,OU=Users,DC=JeresDomæne,DC=local', groups: 'GG_Finance', gpos: 'GPO_Baseline\nGPO_Finance' },
    { id: 'support', title: 'Support Specialist', department: 'IT', ou: 'OU=IT,OU=Users,DC=JeresDomæne,DC=local', groups: 'GG_IT', gpos: 'GPO_Baseline\nGPO_IT' },
  ],
  accessPool: 'GG_Shared_Read | Shared drive: read access\nGG_Projects_Modify | Project drive: modify access\nGG_VPN | VPN access\nGG_Print | Shared printers',
  maxExtraAccess: 2,
  reservedUsernames: '',
};

export const csvColumns = [
  'EmployeeID', 'GivenName', 'Surname', 'DisplayName', 'SourceCompany',
  'SourceDomain', 'SourceUserPrincipalName', 'TargetCompany', 'TargetDomain',
  'SamAccountName', 'UserPrincipalName', 'Department', 'Title', 'TargetOU',
  'Groups', 'Permissions', 'ExpectedGPOs',
] as const;

export type Employee = Record<typeof csvColumns[number], string>;

const firstNames = 'Alice,Emma,Olivia,Charlotte,Amelia,Sophia,Emily,Isabella,Grace,Victoria,Lily,Chloe,Lucy,Hannah,Ella,Ruby,Amber,Jessica,Sarah,Claire,James,William,Oliver,George,Henry,Noah,Lucas,Thomas,Jack,Daniel,Charles,Alfred,Ethan,Samuel,Joseph,Matthew,Michael,Andrew,Benjamin,Jacob'.split(',');
const lastNames = 'Smith,Jones,Taylor,Brown,Williams,Wilson,Johnson,Davies,Robinson,Wright,Thompson,Evans,Walker,White,Roberts,Green,Hall,Wood,Jackson,Clarke,Harris,Edwards,Turner,Martin,Cooper,Hill,Ward,Hughes,Moore,Clark,King,Allen,Scott,Young,Morris,Parker,Mitchell,Phillips,Campbell,Baker'.split(',');

export function lines(value: string): string[] {
  return [...new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
}

function accessEntries(value: string) {
  return lines(value).map((line) => {
    const [group, permission, ...rest] = line.split('|').map((part) => part.trim());
    if (!group || !permission || rest.length) throw new Error('Skriv hver ekstra rettighed som Gruppenavn | Beskrivelse.');
    return { group, permission };
  });
}

export function validateConfig(config: GeneratorConfig): string[] {
  const errors: string[] = [];
  const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  if (!config.company.trim() || !config.acquiredCompany.trim()) errors.push('Udfyld begge virksomhedsnavne.');
  if (!domainPattern.test(config.sourceDomain.trim()) || !domainPattern.test(config.targetDomain.trim())) errors.push('Angiv gyldige domæner, fx firma.local, uden @ eller https://.');
  if (config.sourceDomain.trim().toLowerCase() === config.targetDomain.trim().toLowerCase()) errors.push('Kilde- og måldomænet skal være forskellige.');
  if (!Number.isInteger(config.count) || config.count < 1 || config.count > 1000) errors.push('Vælg mellem 1 og 1.000 medarbejdere.');
  if (!Number.isInteger(config.maxExtraAccess) || config.maxExtraAccess < 0 || config.maxExtraAccess > 10) errors.push('Vælg mellem 0 og 10 ekstra rettigheder.');
  if (!config.roles.length) errors.push('Tilføj mindst én rolle.');
  if (new Set(config.roles.map((role) => role.title.trim().toLowerCase())).size !== config.roles.length) errors.push('Giv hver rolle et unikt rollenavn.');
  const suffix = config.targetDomain.trim().split('.').map((part) => `DC=${part}`).join(',').toLowerCase();
  config.roles.forEach((role, i) => {
    if (!role.title.trim() || !role.department.trim()) errors.push(`Rolle ${i + 1}: udfyld rollenavn og afdeling.`);
    const ou = role.ou.trim().replace(/\s*,\s*/g, ',').toLowerCase();
    if (!/^ou=(?:\\.|[^,\\\r\n])+,(?:(?:ou|cn)=(?:\\.|[^,\\\r\n])+,)*dc=/.test(ou) || !ou.endsWith(`,${suffix}`) || /[\r\n\t]/.test(ou)) errors.push(`Rolle ${i + 1}: angiv en OU-sti i måldomænet (fx OU=Brugere,${suffix}).`);
    if (/[|]/.test(role.groups + role.gpos)) errors.push(`Rolle ${i + 1}: brug én gruppe eller GPO pr. linje uden |.`);
  });
  try {
    const entries = accessEntries(config.accessPool);
    if (new Set(entries.map((entry) => entry.group.toLowerCase())).size !== entries.length) errors.push('Brug kun hver gruppe én gang i adgangspuljen.');
  } catch (error) { errors.push((error as Error).message); }
  // Reject spreadsheet formula prefixes rather than silently changing AD identifiers.
  const cells = [config.company, config.acquiredCompany, ...config.roles.flatMap((role) => [role.title, role.department, ...lines(role.groups), ...lines(role.gpos)]), ...lines(config.accessPool).flatMap((line) => line.split('|'))];
  if (cells.some((cell) => /^\s*[=+@-]/.test(cell))) errors.push('Navne og beskrivelser må ikke starte med =, +, - eller @ (formler i regneark).');
  if (cells.some((cell) => /[\r\n\t\u0000]/.test(cell))) errors.push('Brug almindelig tekst uden tabulatorer eller linjeskift i navne og beskrivelser.');
  return errors;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function accountBase(value: string): string {
  return value.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.]/g, '').slice(0, 20);
}

export function generateEmployees(config: GeneratorConfig, random = Math.random): Employee[] {
  const errors = validateConfig(config);
  if (errors.length) throw new Error(errors.join('\n'));
  const names = shuffled(firstNames.flatMap((first) => lastNames.map((last) => ({ first, last }))), random);
  const pool = accessEntries(config.accessPool);
  const usedAccounts = new Set(lines(config.reservedUsernames).map((name) => name.toLowerCase()));
  const sourceDomain = config.sourceDomain.trim().toLowerCase();
  const targetDomain = config.targetDomain.trim().toLowerCase();
  return names.slice(0, config.count).map(({ first, last }, index) => {
    const role = config.roles[Math.floor(random() * config.roles.length)];
    const extras = shuffled(pool, random).slice(0, Math.floor(random() * (Math.min(config.maxExtraAccess, pool.length) + 1)));
    const base = accountBase(`${first}.${last}`);
    let account = base;
    let suffix = 1;
    while (usedAccounts.has(account)) {
      const number = String(suffix++);
      account = base.slice(0, 20 - number.length) + number;
    }
    usedAccounts.add(account);
    return {
      EmployeeID: `MIG${String(index + 1).padStart(4, '0')}`,
      GivenName: first, Surname: last, DisplayName: `${first} ${last}`,
      SourceCompany: config.acquiredCompany.trim(), SourceDomain: sourceDomain,
      SourceUserPrincipalName: `employee${String(index + 1).padStart(4, '0')}@${sourceDomain}`,
      TargetCompany: config.company.trim(), TargetDomain: targetDomain,
      SamAccountName: account, UserPrincipalName: `${account}@${targetDomain}`,
      Department: role.department.trim(), Title: role.title.trim(), TargetOU: role.ou.trim(),
      Groups: [...new Set([...lines(role.groups), ...extras.map((entry) => entry.group)])].join('|'),
      Permissions: [...new Set(extras.map((entry) => entry.permission))].join('|'),
      ExpectedGPOs: lines(role.gpos).join('|'),
    };
  });
}

export function employeesToCsv(employees: Employee[], delimiter: ';' | ',' = ';'): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return '\uFEFF' + [csvColumns.map(quote).join(delimiter), ...employees.map((employee) => csvColumns.map((column) => quote(employee[column])).join(delimiter))].join('\r\n') + '\r\n';
}
