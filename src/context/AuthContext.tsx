import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  decodeJwtPayload,
  formatUserLabel,
  getRoles,
  isTokenExpired,
  type JwtPayload,
} from '../auth/jwt';
import { logout as oauthLogout, startLogin } from '../auth/oauth';
import { clearAllAuthStorage, getStoredTokens } from '../auth/tokenStorage';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: JwtPayload | null;
  displayName: string;
  roles: string[];
  login: () => Promise<void>;
  logout: () => void;
  reload: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUserFromStorage(): JwtPayload | null {
  const stored = getStoredTokens();
  if (!stored) return null;
  const payload = decodeJwtPayload(stored.accessToken);
  if (!payload || isTokenExpired(payload)) return null;
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(() => {
    setUser(loadUserFromStorage());
  }, []);

  useEffect(() => {
    reload();
    setIsLoading(false);
  }, [reload]);

  const login = useCallback(async () => {
    await startLogin();
  }, []);

  const logout = useCallback(() => {
    clearAllAuthStorage();
    oauthLogout();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      user,
      displayName: formatUserLabel(user),
      roles: getRoles(user),
      login,
      logout,
      reload,
    }),
    [user, isLoading, login, logout, reload]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth skal bruges inden for AuthProvider');
  return ctx;
}
