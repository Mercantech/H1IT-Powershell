import { authConfig, getPostLogoutReturnUrl, getRedirectUri } from './config';
import { createPkcePair, generateState } from './pkce';
import {
  clearAllAuthStorage,
  clearTokens,
  consumePkceSession,
  savePkceSession,
  saveTokens,
} from './tokenStorage';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  microsoft_access_token?: string;
  microsoft_expires_in?: number;
}

export async function startLogin(): Promise<void> {
  const { codeVerifier, codeChallenge } = await createPkcePair();
  const state = generateState();
  savePkceSession(codeVerifier, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: authConfig.clientId,
    redirect_uri: getRedirectUri(),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.assign(`${authConfig.authorizeEndpoint}?${params.toString()}`);
}

export async function handleOAuthCallback(
  code: string,
  returnedState: string
): Promise<TokenResponse> {
  const session = consumePkceSession();
  if (!session) {
    throw new Error('PKCE-session mangler — prøv at logge ind igen.');
  }
  if (returnedState !== session.state) {
    throw new Error('Ugyldig state — muligt CSRF-forsøg. Afvist.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: authConfig.clientId,
    code_verifier: session.codeVerifier,
  });

  const response = await fetch(authConfig.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Token-udveksling fejlede (${response.status})`);
  }

  const data = (await response.json()) as TokenResponse;
  saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: authConfig.clientId,
  });

  const response = await fetch(authConfig.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    clearTokens();
    const err = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Refresh fejlede (${response.status})`);
  }

  const data = (await response.json()) as TokenResponse;
  saveTokens(data.access_token, data.refresh_token, data.expires_in);
  return data;
}

export function logout(): void {
  clearAllAuthStorage();
  const returnUrl = encodeURIComponent(getPostLogoutReturnUrl());
  window.location.assign(`${authConfig.signoutEndpoint}?returnUrl=${returnUrl}`);
}
