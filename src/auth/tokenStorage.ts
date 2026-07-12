const KEYS = {
  codeVerifier: 'mercantec_oauth_code_verifier',
  state: 'mercantec_oauth_state',
  accessToken: 'mercantec_access_token',
  refreshToken: 'mercantec_refresh_token',
  expiresAt: 'mercantec_token_expires_at',
} as const;

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export function savePkceSession(codeVerifier: string, state: string): void {
  sessionStorage.setItem(KEYS.codeVerifier, codeVerifier);
  sessionStorage.setItem(KEYS.state, state);
}

export function consumePkceSession(): { codeVerifier: string; state: string } | null {
  const codeVerifier = sessionStorage.getItem(KEYS.codeVerifier);
  const state = sessionStorage.getItem(KEYS.state);
  sessionStorage.removeItem(KEYS.codeVerifier);
  sessionStorage.removeItem(KEYS.state);
  if (!codeVerifier || !state) return null;
  return { codeVerifier, state };
}

export function saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  const expiresAt = Date.now() + expiresIn * 1000;
  sessionStorage.setItem(KEYS.accessToken, accessToken);
  sessionStorage.setItem(KEYS.refreshToken, refreshToken);
  sessionStorage.setItem(KEYS.expiresAt, String(expiresAt));
}

export function getStoredTokens(): StoredTokens | null {
  const accessToken = sessionStorage.getItem(KEYS.accessToken);
  const refreshToken = sessionStorage.getItem(KEYS.refreshToken);
  const expiresAtRaw = sessionStorage.getItem(KEYS.expiresAt);
  if (!accessToken || !refreshToken || !expiresAtRaw) return null;
  return {
    accessToken,
    refreshToken,
    expiresAt: Number(expiresAtRaw),
  };
}

export function clearTokens(): void {
  sessionStorage.removeItem(KEYS.accessToken);
  sessionStorage.removeItem(KEYS.refreshToken);
  sessionStorage.removeItem(KEYS.expiresAt);
}

export function clearAllAuthStorage(): void {
  Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
}
