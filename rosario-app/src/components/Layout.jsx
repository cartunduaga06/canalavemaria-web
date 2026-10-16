import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, BookOpen, Heart, Settings } from 'lucide-react';

const Layout = () => {
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="container">
          <nav className="nav-bar">
            <a href="/" className="logo">
              ✦ Ave María TV
            </a>
            <div className="nav-links">
              <a href="/" className="nav-item">Inicio</a>
              <a href="/videos/" className="nav-item">Vídeos</a>
              <a href="/oraciones/" className="nav-item">Oraciones</a>
              <a href="/rosario/" className="nav-item" aria-current="page">Rezar</a>
              <a href="/contacto/" className="nav-item">Contacto</a>
            </div>
          </nav>
        </div>
      </header>

      <main className="app-main container">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <nav className="bottom-nav">
            <Link to="/" className="bottom-nav-item">
              <Home size={24} />
              <span>Inicio</span>
            </Link>
            <Link to="/rezar" className="bottom-nav-item">
              <div className="rosary-icon-placeholder">📿</div>
              <span>Rezar</span>
            </Link>
            <Link to="/intenciones" className="bottom-nav-item">
              <Heart size={24} />
              <span>Intenciones</span>
            </Link>
            <Link to="/oraciones" className="bottom-nav-item">
              <BookOpen size={24} />
              <span>Oraciones</span>
            </Link>
          </nav>
        </div>
      </footer>

      <style>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-header {
          background: var(--color-surface);
          box-shadow: var(--shadow-sm);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: var(--font-serif);
          font-weight: bold;
          font-size: 1.25rem;
          color: var(--color-primary);
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .nav-item {
          color: var(--color-text-light);
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
        }
        .nav-item:hover {
          color: var(--color-primary);
        }
        .admin-link {
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .admin-link:hover {
          opacity: 1;
        }
        .app-main {
          flex: 1;
          padding-top: 2rem;
          padding-bottom: 6rem; /* Space for bottom nav */
          width: 100%;
        }
        .app-footer {
          background: var(--color-surface);
          border-top: 1px solid #e2e8f0;
          position: fixed;
          bottom: 0;
          width: 100%;
          padding: 0.5rem 0;
          z-index: 10;
        }
        .bottom-nav {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: var(--color-text-light);
          font-size: 0.75rem;
          gap: 0.25rem;
        }
        .bottom-nav-item:hover, .bottom-nav-item:active {
          color: var(--color-primary);
        }
        .rosary-icon-placeholder {
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default Layout;
