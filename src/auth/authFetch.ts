import { getStoredTokens } from './tokenStorage';
import { refreshAccessToken } from './oauth';

let refreshPromise: Promise<string> | null = null;

async function getValidAccessToken(): Promise<string | null> {
  const stored = getStoredTokens();
  if (!stored) return null;

  const expiresSoon = stored.expiresAt <= Date.now() + 60_000;
  if (!expiresSoon) return stored.accessToken;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(stored.refreshToken)
      .then((data) => data.access_token)
      .finally(() => {
        refreshPromise = null;
      });
  }

  try {
    return await refreshPromise;
  } catch {
    return null;
  }
}

export interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch-wrapper med Bearer-token og én refresh-forsøg ved 401.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuth, headers, ...rest } = init;
  const mergedHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (token) {
      mergedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let response = await fetch(input, { ...rest, headers: mergedHeaders });

  if (!skipAuth && response.status === 401) {
    const stored = getStoredTokens();
    if (stored) {
      try {
        const newToken = await refreshAccessToken(stored.refreshToken).then(
          (d) => d.access_token
        );
        mergedHeaders.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(input, { ...rest, headers: mergedHeaders });
      } catch {
        // refresh fejlede — returner original 401
      }
    }
  }

  return response;
}
