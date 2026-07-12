/** Mercantec Auth — værdier fra https://auth.mercantec.tech/.well-known/mercantec-auth.json */
export const authConfig = {
  baseUrl: import.meta.env.VITE_AUTH_BASE_URL ?? 'https://auth.mercantec.tech',
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID ?? 'demo',
  issuer: 'https://auth.mercantec.tech',
  audience: 'mercantec-apps',
  jwksUri: 'https://auth.mercantec.tech/.well-known/jwks.json',
  authorizeEndpoint: 'https://auth.mercantec.tech/oauth/authorize',
  tokenEndpoint: 'https://auth.mercantec.tech/oauth/token',
  signoutEndpoint: 'https://auth.mercantec.tech/signout',
} as const;

export function getRedirectUri(): string {
  const configured = import.meta.env.VITE_AUTH_REDIRECT_URI;
  if (configured) return configured;
  return `${window.location.origin}/auth/callback`;
}

export function getPostLogoutReturnUrl(): string {
  return `${window.location.origin}/`;
}
