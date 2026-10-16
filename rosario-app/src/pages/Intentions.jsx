import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createIntention, getIntentions, getUserIntentions, prayForIntention, deleteIntention } from '../services/intentionsService';
import { Heart, Plus, User, LogIn, MessageCircle, Share2, HandHeart, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'salud', label: 'Salud' },
  { value: 'familia', label: 'Familia' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'conversion', label: 'Conversión' },
  { value: 'difuntos', label: 'Difuntos' },
  { value: 'agradecimiento', label: 'Agradecimiento' },
  { value: 'otros', label: 'Otros' }
];

const Intentions = () => {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('community'); // 'community' | 'mine'
  const [feed, setFeed] = useState([]);
  const [myIntentions, setMyIntentions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form State
  const [newText, setNewText] = useState('');
  const [category, setCategory] = useState('otros');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (user && activeTab === 'mine') {
      loadMyIntentions();
    }
  }, [user, activeTab]);

  const loadFeed = async () => {
    setLoadingData(true);
    try {
      const data = await getIntentions();
      setFeed(data);
    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes('index')) {
        alert("Falta índice en Firebase. Abre la consola (F12) y haz clic en el link del error.");
      } else {
        // Only alert if it's not a permissions error (we know that works now) 
        // or just silent log? let's alert to be safe
        console.error("Error loading feed:", error);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const loadMyIntentions = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const data = await getUserIntentions(user.uid);
      setMyIntentions(data);
    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes('index')) {
        alert("Falta índice en Firebase (Mis Intenciones). Abre la consola (F12) y haz clic en el link.");
      } else {
        alert("Error cargando mis intenciones: " + error.message);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (intentionId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta intención?")) return;
    try {
      await deleteIntention(intentionId, user.uid);
      loadFeed();
      loadMyIntentions();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user || !newText.trim()) return;

    setIsSubmitting(true);
    try {
      await createIntention(user.uid, {
        text: newText,
        category,
        authorName: isAnonymous ? 'Anónimo' : (user.displayName || 'Usuario'),
        privacy: 'PUBLIC'
      });
      setNewText('');
      loadFeed(); // Refresh feed
      if (activeTab === 'mine') loadMyIntentions();
      alert('Intención publicada con éxito');
    } catch (error) {
      console.error(error);
      alert('Error al publicar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePray = async (intentionId) => {
    if (!user) {
      alert('Debes iniciar sesión para marcar que rezaste.');
      return;
    }
    try {
      await prayForIntention(intentionId, user.uid);
      // Optimistic update
      setFeed(prev => prev.map(item =>
        item.id === intentionId
          ? { ...item, prayersCount: (item.prayersCount || 0) + 1 }
          : item
      ));
    } catch (error) {
      if (error.message.includes("Ya rezaste")) {
        alert("Ya has marcado tu oración por esta intención.");
      }
    }
  };

  if (authLoading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="community-container">
      {/* Header */}
      <div className="community-header">
        <h2>Comunidad de Oración</h2>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            Comunidad
          </button>
          {user && (
            <button
              className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
              onClick={() => setActiveTab('mine')}
            >
              Mis Intenciones
            </button>
          )}
        </div>
      </div>

      {/* Auth Wall / Form */}
      {!user ? (
        <div className="auth-card card">
          <Heart size={48} className="auth-icon" />
          <h3>Únete a la Comunidad</h3>
          <p>Comparte tus intenciones y reza por los demás.</p>
          <button onClick={signInWithGoogle} className="btn btn-primary google-btn">
            <LogIn size={20} /> Entrar con Google
          </button>
        </div>
      ) : (
        <div className="create-card card">
          <h3>Publicar Intención</h3>
          <form onSubmit={handleCreate}>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="¿Por qué o por quién deseas pedir oración hoy?"
              rows={3}
              className="intention-input"
            />
            <div className="form-footer">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-select"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                Anónimo
              </label>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Publicando...' : <><Plus size={18} /> Publicar</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed */}
      <div className="feed-list">
        {loadingData ? (
          <p className="text-center">Cargando intenciones...</p>
        ) : (
          (activeTab === 'community' ? feed : myIntentions).map(item => (
            <div key={item.id} className="intention-card card">
              <div className="card-top">
                <span className="cat-badge">{CATEGORIES.find(c => c.value === item.category)?.label || item.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="date">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}</span>
                  {user && item.userId === user.uid && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="intention-body">{item.text}</p>
              <div className="card-footer">
                <span className="author">
                  <User size={14} /> {item.authorName}
                </span>
                <button
                  className="pray-btn"
                  onClick={() => handlePray(item.id)}
                  title="Marcar que recé por esta intención"
                >
                  <HandHeart size={18} />
                  <span>{item.prayersCount || 0} oraciones</span>
                </button>
              </div>
            </div>
          ))
        )}
        {!loadingData && feed.length === 0 && (
          <p className="text-center text-muted">Aún no hay intenciones. ¡Sé el primero!</p>
        )}
      </div>

      <style>{`
                .community-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .community-header {
                    text-align: center;
                }
                .tabs {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .tab {
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: var(--color-text-light);
                }
                .tab.active {
                    color: var(--color-primary);
                    border-bottom-color: var(--color-primary);
                }
                .auth-card {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 2rem;
                }
                .auth-icon {
                    color: var(--color-primary);
                }
                .create-card h3 {
                    margin-top: 0;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: var(--color-primary-dark);
                }
                .intention-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    font-family: inherit;
                    resize: vertical;
                }
                .form-footer {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    align-items: center;
                    justify-content: space-between;
                }
                .category-select {
                    padding: 0.5rem;
                    border-radius: 4px;
                    border: 1px solid #e2e8f0;
                }
                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .feed-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .intention-card {
                    padding: 1rem;
                }
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-size: 0.85rem;
                }
                .cat-badge {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 500;
                }
                .date {
                    color: #94a3b8;
                }
                .intention-body {
                    font-size: 1rem;
                    color: var(--color-text);
                    margin-bottom: 1rem;
                    line-height: 1.5;
                }
                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 0.75rem;
                }
                .author {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--color-text-light);
                }
                .pray-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: #f0fdf4;
                    color: var(--color-primary);
                    border: 1px solid var(--color-primary-light);
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pray-btn:hover {
                    background: var(--color-primary);
                    color: white;
                }
            `}</style>
    </div>
  );
};

export default Intentions;
