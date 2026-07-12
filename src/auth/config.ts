import {
  resolveAuthBaseUrl,
  resolveAuthClientId,
  resolveAuthRedirectUri,
} from './runtimeConfig';

/** Mercantec Auth — værdier fra https://auth.mercantec.tech/.well-known/mercantec-auth.json */
const baseUrl = resolveAuthBaseUrl();

export const authConfig = {
  baseUrl,
  clientId: resolveAuthClientId(),
  issuer: 'https://auth.mercantec.tech',
  audience: 'mercantec-apps',
  jwksUri: 'https://auth.mercantec.tech/.well-known/jwks.json',
  authorizeEndpoint: `${baseUrl}/oauth/authorize`,
  tokenEndpoint: `${baseUrl}/oauth/token`,
  signoutEndpoint: `${baseUrl}/signout`,
} as const;

export function getRedirectUri(): string {
  const configured = resolveAuthRedirectUri();
  if (configured) return configured;
  return `${window.location.origin}/auth/callback`;
}

export function getPostLogoutReturnUrl(): string {
  return `${window.location.origin}/`;
}
