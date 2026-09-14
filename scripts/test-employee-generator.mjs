import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { readFile, mkdtemp, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

async function loadModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { initialConfig, generateEmployees, employeesToCsv, validateConfig, csvColumns } = await loadModule('../src/utils/employeeGenerator.ts');
const { parseAdInventory, configFromInventory, canUseAdValue, formatAdInventory } = await loadModule('../src/utils/adInventory.ts');
const seeded = (seed = 42) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const snapshot = () => ({ schemaVersion: 1, domain: 'skole.local', companies: ['Skole A/S'], ous: [{ name: 'Salg', dn: 'OU=Salg,DC=skole,DC=local', gpos: ['GPO_Basis'] }], groups: [{ name: 'GG_Salg', description: 'Salg', reviewOnly: false }, { name: 'Domain Admins', description: '', reviewOnly: true }], roles: [{ title: 'Sælger', department: 'Salg', ou: 'OU=Salg,DC=skole,DC=local', groups: ['GG_Salg', 'Domain Admins'] }], reservedUsernames: ['anna.jensen'], warnings: [] });

test('AD JSON import fills coherent configuration and preserves the scenario and existing AD names', () => {
  const config = configFromInventory(initialConfig, parseAdInventory('\uFEFF' + JSON.stringify(snapshot())));
  assert.equal(config.targetDomain, 'skole.local');
  assert.equal(config.company, 'Skole A/S');
  assert.equal(config.sourceDomain, initialConfig.sourceDomain);
  assert.equal(config.acquiredCompany, initialConfig.acquiredCompany);
  assert.equal(config.count, 100);
  assert.equal(config.roles[0].groups, 'GG_Salg');
  assert.equal(config.roles[0].title, 'Sælger');
  assert.equal(config.roles[0].gpos, 'GPO_Basis');
  assert.equal(config.roles[0].ou, snapshot().ous[0].dn);
  assert.equal(config.reservedUsernames, 'anna.jensen');
  assert.equal(config.accessPool, '');
  assert.deepEqual(validateConfig(config), []);
  assert.equal(generateEmployees(config, seeded()).length, 100);
});

test('import handles empty inventories, missing role attributes and repeated job titles', () => {
  const value = snapshot();
  value.roles.push({ ...value.roles[0], department: 'Support' }, { ...value.roles[0], department: 'Support' });
  value.companies = [];
  const config = configFromInventory(initialConfig, parseAdInventory(JSON.stringify(value)));
  assert.equal(new Set(config.roles.map((role) => role.title)).size, 3);
  assert.equal(config.company, initialConfig.company);
  value.roles = [];
  assert.equal(configFromInventory(initialConfig, parseAdInventory(JSON.stringify(value))).roles[0].title, 'Employee');
  value.ous = [];
  value.groups = [];
  value.reservedUsernames = [];
  const empty = configFromInventory(initialConfig, parseAdInventory(JSON.stringify(value)));
  assert.equal(empty.roles.length, 0);
  assert.equal(empty.targetDomain, 'skole.local');
  assert.ok(validateConfig(empty).length);
});

test('AD import rejects malformed, oversized, unknown-version and inconsistent inventories', () => {
  for (const value of [null, [], {}, { ...snapshot(), schemaVersion: 2 }, { ...snapshot(), groups: {} }, { ...snapshot(), reservedUsernames: [42] }, { ...snapshot(), domain: '-bad.local' }, { ...snapshot(), ous: [] }, { ...snapshot(), groups: [] }, { ...snapshot(), groups: [{ name: 'GG_Salg', description: '' }] }]) assert.throws(() => parseAdInventory(JSON.stringify(value)));
  assert.throws(() => parseAdInventory('{bad json}'));
  assert.throws(() => parseAdInventory(' '.repeat(5 * 1024 * 1024 + 1)));
  for (const value of ['=1+1', 'GG_A|GG_B', 'GG_A\nGG_B']) assert.equal(canUseAdValue(value), false);
});

test('JSON formatting preserves exact values and unknown fields with two-space indentation', () => {
  const value = snapshot();
  value.groups[0].description = 'Økonomi "read", {write}: [a,b] \\server\\share\nnext';
  value.extraField = { future: true };
  const formatted = formatAdInventory('\uFEFF' + JSON.stringify(value));
  assert.deepEqual(JSON.parse(formatted), value);
  assert.ok(formatted.startsWith('{\n  "schemaVersion": 1,'));
  assert.ok(formatted.includes('"warnings": []'));
  assert.equal(formatAdInventory(formatted), formatted);
  assert.throws(() => formatAdInventory('{invalid'));
});

test('Windows PowerShell exporter -> JSON importer -> 100 employees (mocked AD)', { skip: process.platform !== 'win32' }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ad-export-test-'));
  try {
    for (const flag of ['', '-WithoutGroupPolicy', '-FailedGpoRead']) {
      const path = join(directory, `snapshot${flag}.json`);
      const run = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'RemoteSigned', '-File', 'scripts/test-ad-export.ps1', '-OutputPath', path, ...(flag ? [flag] : [])], { encoding: 'utf8' });
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const raw = await readFile(path, 'utf8');
      assert.ok(raw.replace(/^\uFEFF/, '').startsWith('{\r\n  "schemaVersion": 1,'));
      const inventory = parseAdInventory(raw);
      assert.equal(inventory.roles.length, 1);
      assert.equal(inventory.roles[0].department, 'Økonomi');
      assert.deepEqual(inventory.roles[0].groups, ['GG_Faelles']);
      assert.equal(inventory.reservedUsernames.length, 4);
      assert.ok(inventory.reservedUsernames.includes('disabled.user'));
      assert.equal(inventory.groups.filter((group) => group.reviewOnly).length, 2);
      assert.ok(inventory.warnings.some((warning) => warning.includes('outside an OU')));
      assert.equal(inventory.groups[0].description, 'Adgang til fællesdrev');
      if (flag === '-WithoutGroupPolicy') {
        assert.ok(inventory.ous.every((ou) => ou.gpos.length === 0));
        assert.ok(inventory.warnings.some((warning) => warning.includes('module unavailable')));
        assert.ok(raw.includes('"gpos": []'));
      } else if (flag === '-FailedGpoRead') {
        assert.ok(inventory.warnings.some((warning) => warning.includes('OU=IT')));
      } else assert.ok(inventory.ous.every((ou) => ou.gpos.join() === 'GPO_Basis'));
      const config = configFromInventory(initialConfig, inventory);
      assert.equal(config.company, 'Æble A/S');
      assert.equal(generateEmployees(config, seeded()).length, 100);
    }
  } finally {
    for (const flag of ['', '-WithoutGroupPolicy', '-FailedGpoRead']) await rm(join(directory, `snapshot${flag}.json`), { force: true });
    await rmdir(directory);
  }
});

test('100 unique fictional employees with valid accounts, ASCII defaults and coherent role mappings', () => {
  const employees = generateEmployees(initialConfig, seeded());
  assert.equal(employees.length, 100);
  for (const key of ['EmployeeID', 'DisplayName', 'SamAccountName', 'UserPrincipalName', 'SourceUserPrincipalName']) assert.equal(new Set(employees.map((employee) => employee[key])).size, 100);
  for (const employee of employees) {
    assert.ok(Object.values(employee).every((value) => /^[\x20-\x7E]*$/.test(value)));
    assert.match(employee.SamAccountName, /^[a-z0-9.]{1,20}$/);
    assert.equal(employee.UserPrincipalName, `${employee.SamAccountName}@northstar.local`);
    const role = initialConfig.roles.find((role) => role.title === employee.Title);
    assert.equal(employee.TargetOU, role.ou);
    assert.equal(employee.Department, role.department);
    assert.equal(employee.ExpectedGPOs, role.gpos.replaceAll('\n', '|'));
    const groups = employee.Groups.split('|');
    assert.ok(groups.includes(role.groups));
    assert.equal(new Set(groups).size, groups.length);
    assert.ok(groups.length <= 3);
    const pool = initialConfig.accessPool.split('\n').map((line) => line.split(' | '));
    for (const permission of employee.Permissions.split('|').filter(Boolean)) assert.ok(groups.includes(pool.find((entry) => entry[1] === permission)[0]));
  }
  assert.equal(new Set(employees.map((employee) => employee.Title)).size, 3);
  assert.ok(new Set(employees.map((employee) => employee.Permissions)).size > 3);
});

test('count boundaries, zero extras, empty optional fields and custom single role', () => {
  for (const count of [1, 1000]) {
    const employees = generateEmployees({ ...initialConfig, count, roles: [{ ...initialConfig.roles[0], groups: '', gpos: '' }], accessPool: '', maxExtraAccess: 0 }, seeded());
    assert.equal(employees.length, count);
    assert.equal(new Set(employees.map((employee) => employee.SamAccountName)).size, count);
    assert.ok(employees.every((employee) => !employee.Groups && !employee.Permissions && !employee.ExpectedGPOs));
  }
});

test('reserved accounts are avoided case-insensitively, including numbered collisions', () => {
  const first = generateEmployees({ ...initialConfig, count: 1 }, seeded())[0].SamAccountName;
  const next = first.slice(0, 19) + '1';
  const employee = generateEmployees({ ...initialConfig, count: 1, reservedUsernames: `${first.toUpperCase()}\n${next}` }, seeded())[0];
  assert.notEqual(employee.SamAccountName, first);
  assert.notEqual(employee.SamAccountName, next);
  assert.ok(employee.SamAccountName.length <= 20);
});

test('fresh random draws produce different employee lists', () => {
  assert.notDeepEqual(generateEmployees(initialConfig, seeded(1)), generateEmployees(initialConfig, seeded(2)));
});

test('invalid counts, domains, OU mappings, roles and pools are rejected', () => {
  for (const change of [
    { count: 0 }, { count: 1001 }, { count: 1.5 }, { count: NaN },
    { sourceDomain: 'https://example.com' }, { sourceDomain: initialConfig.targetDomain },
    { targetDomain: 'elsewhere.local' }, { roles: [] },
    { roles: [initialConfig.roles[0], { ...initialConfig.roles[0], id: 'duplicate' }] },
    { roles: [{ ...initialConfig.roles[0], ou: 'OU=,DC=northstar,DC=local' }] },
    { maxExtraAccess: -1 }, { maxExtraAccess: 11 },
    { accessPool: 'GG_Test' }, { accessPool: 'GG_Test | read | write' },
    { accessPool: 'GG_Test | read\ngg_test | write' },
  ]) assert.throws(() => generateEmployees({ ...initialConfig, ...change }, seeded()));
});

test('spreadsheet formulas are rejected without silently changing identifiers', () => {
  for (const company of ['=SUM(1,1)', ' +1', '-1', '@SUM(A1)', 'a\tb']) assert.ok(validateConfig({ ...initialConfig, company }).length);
  assert.ok(validateConfig({ ...initialConfig, accessPool: 'GG_Test | =1+1' }).length);
  assert.ok(validateConfig({ ...initialConfig, roles: [{ ...initialConfig.roles[0], gpos: '=1+1' }] }).length);
});

test('CSV preserves imported Danish text, quotes and delimiters with BOM and CRLF', () => {
  const employees = generateEmployees({ ...initialConfig, company: 'Æble; "Øen", Å A/S', count: 1 }, seeded());
  for (const delimiter of [';', ',']) {
    const csv = employeesToCsv(employees, delimiter);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.equal(csv.split('\r\n').length, 3);
    assert.ok(csv.includes('"Æble; ""Øen"", Å A/S"'));
    assert.equal(csv.split('\r\n')[0].slice(1), csvColumns.map((column) => `"${column}"`).join(delimiter));
    assert.equal(employeesToCsv(employees, delimiter), csv);
  }
});
