import React, { useState } from 'react';
import { LogOut, Music } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AudioUploadForm from '../../components/admin/AudioUploadForm';
import AudioList from '../../components/admin/AudioList';
import RosaryGenerator from '../../components/admin/RosaryGenerator';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingAudio, setEditingAudio] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditingAudio(null);
  };

  const handleEdit = (audio) => {
    setEditingAudio(audio);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAudio(null);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <Music size={32} />
            <div>
              <h1>Panel de Administración</h1>
              <p>Gestión de Audios - Ave María Rosario</p>
            </div>
          </div>
          <div className="header-right">
            <div className="user-info">
              <img
                src={user?.photoURL || '/rosario/icon.svg'}
                alt="User"
                className="user-avatar"
              />
              <div>
                <div className="user-name">{user?.displayName || 'Admin'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
            <button onClick={handleSignOut} className="btn btn-secondary">
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Upload Form */}
          <AudioUploadForm
            onSuccess={handleSuccess}
            editingAudio={editingAudio}
            onCancel={handleCancelEdit}
          />

          {/* Audio List */}
          <AudioList
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </main>

      <style>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8fafc;
        }
        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-left svg {
          color: var(--color-primary);
        }
        .header-left h1 {
          font-size: 1.5rem;
          color: var(--color-primary);
          margin: 0;
        }
        .header-left p {
          font-size: 0.9rem;
          color: var(--color-text-light);
          margin: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
        }
        .user-name {
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.9rem;
        }
        .user-email {
          font-size: 0.8rem;
          color: var(--color-text-light);
        }
        .dashboard-main {
          padding: 2rem;
        }
        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1rem;
          }
          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
          .user-info {
            flex: 1;
          }
          .dashboard-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
