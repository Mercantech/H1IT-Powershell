export interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string | string[];
  login_method?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

/** Kun til visning i UI — rigtig validering sker på backend med JWKS. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoles(payload: JwtPayload | null): string[] {
  if (!payload?.role) return [];
  return Array.isArray(payload.role) ? payload.role : [payload.role];
}

export function isTokenExpired(payload: JwtPayload | null, skewSeconds = 30): boolean {
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function formatUserLabel(payload: JwtPayload | null): string {
  if (!payload) return 'Ukendt bruger';
  if (payload.name && payload.email) return `${payload.name} (${payload.email})`;
  return payload.name ?? payload.email ?? payload.sub ?? 'Ukendt bruger';
}
