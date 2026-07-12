import { useAuth } from '../../context/AuthContext';
import './AuthBar.css';

export function AuthBar() {
  const { isAuthenticated, isLoading, displayName, roles, login, logout } = useAuth();

  if (isLoading) return null;

  return (
    <div className="auth-bar">
      {isAuthenticated ? (
        <>
          <div className="auth-user">
            <span className="auth-user-name">{displayName}</span>
            {roles.length > 0 && (
              <span className="auth-user-roles">{roles.join(' · ')}</span>
            )}
          </div>
          <button type="button" className="auth-btn auth-btn--logout" onClick={logout}>
            Log ud
          </button>
        </>
      ) : (
        <button type="button" className="auth-btn auth-btn--login" onClick={() => void login()}>
          Log ind
        </button>
      )}
    </div>
  );
}
