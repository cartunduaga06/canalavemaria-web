import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin, signOut } = useAuth(); // Add signOut

  // ... (loading state logic) 

  if (loading) {
    // ... existing loading logic ...
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando permisos...</p>
        <style>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        gap: 1rem;
                    }
                    .spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid #e2e8f0;
                        border-top-color: var(--color-primary);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="unauthorized-container">
        <div className="card">
          <h2>⚠️ Acceso Denegado</h2>
          <p>No tienes permisos de administrador.</p>
          <p className="email-info">Usuario: {user.email}</p>
          <div className="actions">
            <button onClick={() => window.location.href = '/'} className="btn btn-primary">
              Ir al inicio
            </button>
            <button onClick={() => signOut()} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
        <style>{`
          .unauthorized-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
          }
           .unauthorized-container .card {
            max-width: 500px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .email-info {
            color: var(--color-text-light);
            font-size: 0.9rem;
          }
          .actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return children;
};



export default ProtectedRoute;
