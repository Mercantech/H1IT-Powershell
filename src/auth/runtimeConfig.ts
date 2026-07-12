export interface AuthRuntimeConfig {
  baseUrl?: string;
  clientId?: string;
  redirectUri?: string;
}

declare global {
  interface Window {
    __AUTH_CONFIG__?: AuthRuntimeConfig;
  }
}

/** Produktion: skrives af docker-entrypoint. Dev: tom → import.meta.env bruges. */
export function getAuthRuntimeConfig(): AuthRuntimeConfig {
  if (typeof window === 'undefined') return {};
  return window.__AUTH_CONFIG__ ?? {};
}

function pick(...values: (string | undefined)[]): string | undefined {
  return values.find((v) => v !== undefined && v !== '');
}

export function resolveAuthBaseUrl(): string {
  const runtime = getAuthRuntimeConfig();
  return (
    pick(runtime.baseUrl, import.meta.env.VITE_AUTH_BASE_URL) ??
    'https://auth.mercantec.tech'
  );
}

export function resolveAuthClientId(): string {
  const runtime = getAuthRuntimeConfig();
  return pick(runtime.clientId, import.meta.env.VITE_AUTH_CLIENT_ID) ?? 'demo';
}

export function resolveAuthRedirectUri(): string | undefined {
  const runtime = getAuthRuntimeConfig();
  return pick(runtime.redirectUri, import.meta.env.VITE_AUTH_REDIRECT_URI);
}
