import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback } from '../auth/oauth';
import { useAuth } from '../context/AuthContext';
import './AuthCallback.css';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reload } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError(searchParams.get('error_description') ?? oauthError);
      return;
    }

    if (!code || !state) {
      setError('Manglende code eller state i callback.');
      return;
    }

    handleOAuthCallback(code, state)
      .then(() => {
        reload();
        navigate('/', { replace: true });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Login fejlede.');
      });
  }, [searchParams, navigate, reload]);

  if (error) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-card card">
          <h1>Login fejlede</h1>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            Tilbage til forsiden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback">
      <div className="auth-callback-card card">
        <p>Logger ind via Mercantec Auth…</p>
      </div>
    </div>
  );
}
