import type { GeneratorConfig, RoleProfile } from './employeeGenerator';

export interface AdInventory {
  schemaVersion: 1;
  domain: string;
  companies: string[];
  ous: { name: string; dn: string; gpos: string[] }[];
  groups: { name: string; description: string; reviewOnly: boolean }[];
  roles: { title: string; department: string; ou: string; groups: string[] }[];
  reservedUsernames: string[];
  warnings: string[];
}

export const maxInventoryBytes = 5 * 1024 * 1024;

export function formatAdInventory(text: string): string {
  parseAdInventory(text);
  // Format the original object so unknown fields and AD values are preserved.
  return JSON.stringify(JSON.parse(text.replace(/^\uFEFF/, '')), null, 2);
}

export function parseAdInventory(text: string): AdInventory {
  if (new TextEncoder().encode(text).length > maxInventoryBytes) throw new Error('JSON-indholdet må højst fylde 5 MB.');
  let input: unknown;
  try { input = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('Indholdet er ikke gyldig JSON. Vælg filen fra eksportscriptet, eller indsæt hele dens JSON-indhold.'); }
  const object = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JSON-filen har en forkert struktur. Brug eksportscriptet på siden.');
    return value as Record<string, unknown>;
  };
  const string = (value: unknown): string => {
    if (typeof value !== 'string' || value.length > 4096 || value.includes('\0')) throw new Error('Et tekstfelt i JSON-filen har et ugyldigt format.');
    return value.trim();
  };
  const array = (value: unknown): unknown[] => {
    if (!Array.isArray(value) || value.length > 20000) throw new Error('JSON-filen skal indeholde lister med højst 20.000 elementer.');
    return value;
  };
  const strings = (value: unknown) => [...new Set(array(value).map(string).filter(Boolean))];
  const root = object(input);
  if (root.schemaVersion !== 1) throw new Error('Ukendt eksportversion. Hent det aktuelle PowerShell-script på siden.');
  const domain = string(root.domain).toLowerCase();
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain)) throw new Error('Eksporten mangler et gyldigt AD-domæne.');
  const inventory: AdInventory = {
    schemaVersion: 1, domain,
    companies: strings(root.companies), reservedUsernames: strings(root.reservedUsernames), warnings: strings(root.warnings),
    ous: array(root.ous).map((entry) => { const item = object(entry); return { name: string(item.name), dn: string(item.dn), gpos: strings(item.gpos) }; }),
    groups: array(root.groups).map((entry) => {
      const item = object(entry);
      if (typeof item.reviewOnly !== 'boolean') throw new Error('En gruppe mangler reviewOnly-markeringen. Brug det aktuelle eksportscript.');
      return { name: string(item.name), description: string(item.description), reviewOnly: item.reviewOnly };
    }),
    roles: array(root.roles).map((entry) => { const item = object(entry); return { title: string(item.title), department: string(item.department), ou: string(item.ou), groups: strings(item.groups) }; }),
  };
  const suffix = ',' + domain.split('.').map((part) => `dc=${part}`).join(',');
  if (inventory.ous.some((ou) => !/^OU=.+,/i.test(ou.dn) || !ou.dn.toLowerCase().endsWith(suffix))) throw new Error('En OU-sti ligger uden for eksportens domæne eller har et forkert format.');
  const ouSet = new Set(inventory.ous.map((ou) => ou.dn.toLowerCase()));
  const groupSet = new Set(inventory.groups.map((group) => group.name.toLowerCase()));
  if (ouSet.size !== inventory.ous.length || groupSet.size !== inventory.groups.length || inventory.groups.some((group) => !group.name)) throw new Error('Eksporten indeholder tomme gruppenavne eller dubletter i OU’er/grupper.');
  if (inventory.roles.some((role) => !ouSet.has(role.ou.toLowerCase()) || role.groups.some((group) => !groupSet.has(group.toLowerCase())))) throw new Error('Et rolleforslag henviser til en OU eller gruppe, som mangler i eksporten.');
  if (inventory.roles.length > 500) throw new Error('Eksporten indeholder mere end 500 rolleforslag. Begræns eksporten til jeres undervisningsmiljø.');
  return inventory;
}

// Newline/pipe separators are reserved by the generator; identifiers must stay exact.
export function canUseAdValue(value: string): boolean {
  return !!value && !/[|\r\n\t\u0000]/.test(value) && !/^\s*[=+@-]/.test(value);
}

export function configFromInventory(current: GeneratorConfig, inventory: AdInventory): GeneratorConfig {
  const usableGroups = new Set(inventory.groups.filter((group) => !group.reviewOnly && canUseAdValue(group.name)).map((group) => group.name.toLowerCase()));
  const usedTitles = new Set<string>();
  const suggestions = inventory.roles.length ? inventory.roles : inventory.ous.slice(0, 1).map((ou) => ({ title: 'Employee', department: ou.name, ou: ou.dn, groups: [] }));
  const roles: RoleProfile[] = suggestions.map((role, index) => {
    let title = role.title || 'Employee';
    if (usedTitles.has(title.toLowerCase())) title = `${title} · ${role.department}`;
    const base = title;
    let suffix = 2;
    while (usedTitles.has(title.toLowerCase())) title = `${base} (${suffix++})`;
    usedTitles.add(title.toLowerCase());
    const ou = inventory.ous.find((item) => item.dn.toLowerCase() === role.ou.toLowerCase());
    return { id: `ad-${index}`, title, department: role.department || ou?.name || '', ou: role.ou,
      groups: role.groups.filter((group) => usableGroups.has(group.toLowerCase())).join('\n'),
      gpos: (ou?.gpos ?? []).filter(canUseAdValue).join('\n') };
  });
  return { ...current, company: inventory.companies.length === 1 ? inventory.companies[0] : current.company,
    targetDomain: inventory.domain, roles, reservedUsernames: inventory.reservedUsernames.join('\n'), accessPool: '' };
}
