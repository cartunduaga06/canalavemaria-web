import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const { user, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Navigation happens after redirect return, via the useEffect above
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <h1>🔐 Panel de Administración</h1>
          <p>Ave María Rosario</p>
        </div>

        <div className="login-body">
          <p className="login-description">
            Inicia sesión con tu cuenta de Google para acceder al panel de administración.
          </p>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="google-signin-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.96H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.04l3.007-2.333z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.462.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Iniciar sesión con Google
              </>
            )}
          </button>

          <p className="login-note">
            Solo usuarios autorizados pueden acceder.
          </p>
        </div>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          padding: 2rem;
        }
        .login-card {
          max-width: 450px;
          width: 100%;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          color: var(--color-primary);
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: var(--color-text-light);
          font-size: 1.1rem;
        }
        .login-description {
          text-align: center;
          color: var(--color-text);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .google-signin-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: white;
          border: 1px solid #dadce0;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 500;
          color: #3c4043;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }
        .google-signin-btn:hover:not(:disabled) {
          background: #f8f9fa;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .google-signin-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e2e8f0;
          border-top-color: #3c4043;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.875rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .login-note {
          text-align: center;
          color: var(--color-text-light);
          font-size: 0.875rem;
          margin-top: 1.5rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
