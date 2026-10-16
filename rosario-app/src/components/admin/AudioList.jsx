import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Play } from 'lucide-react';
import { getAllAudios, deleteAudio as deleteFirestoreAudio } from '../../services/firestoreService';
import { deleteAudio as deleteStorageAudio } from '../../services/storageService';

const AUDIO_TYPE_LABELS = {
    'prayer': 'Oración',
    'rosary_set': 'Rosario Completo',
    'background': 'Música de Fondo'
};

const AudioList = ({ onEdit, refreshTrigger }) => {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const loadAudios = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllAudios();
            setAudios(data);
        } catch (error) {
            console.error('Error loading audios:', error);
            setError('Error al cargar los audios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAudios();
    }, [refreshTrigger]);

    const handleDelete = async (audio) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${audio.title}"?`)) {
            return;
        }

        try {
            setDeleting(audio.docId);

            // Delete from Firestore
            await deleteFirestoreAudio(audio.docId);

            // Delete from Storage (if storage path exists)
            if (audio.storagePath) {
                try {
                    await deleteStorageAudio(audio.storagePath);
                } catch (storageError) {
                    console.warn('Could not delete from storage:', storageError);
                }
            }

            // Refresh list
            await loadAudios();
        } catch (error) {
            console.error('Error deleting audio:', error);
            alert('Error al eliminar el audio');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    if (loading) {
        return (
            <div className="audio-list loading">
                <div className="spinner"></div>
                <p>Cargando audios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="audio-list error">
                <p>⚠️ {error}</p>
                <button onClick={loadAudios} className="btn btn-primary">
                    Reintentar
                </button>
            </div>
        );
    }

    if (audios.length === 0) {
        return (
            <div className="audio-list empty">
                <p>📭 No hay audios subidos aún</p>
                <p className="hint">Usa el formulario de arriba para subir tu primer audio</p>
            </div>
        );
    }

    return (
        <div className="audio-list">
            <h3>📚 Audios Guardados ({audios.length})</h3>

            <div className="audio-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo</th>
                            <th>Título</th>
                            <th>Tamaño</th>
                            <th>Fecha</th>
                            <th>Preview</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audios.map((audio) => (
                            <tr key={audio.docId}>
                                <td><code>{audio.id}</code></td>
                                <td>
                                    <span className={`badge badge-${audio.type}`}>
                                        {AUDIO_TYPE_LABELS[audio.type] || audio.type}
                                    </span>
                                </td>
                                <td className="audio-title">{audio.title}</td>
                                <td>{formatFileSize(audio.size)}</td>
                                <td>{formatDate(audio.createdAt)}</td>
                                <td>
                                    <audio controls className="audio-preview">
                                        <source src={audio.src} type="audio/mpeg" />
                                    </audio>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        onClick={() => onEdit(audio)}
                                        className="action-btn edit-btn"
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(audio)}
                                        className="action-btn delete-btn"
                                        disabled={deleting === audio.docId}
                                        title="Eliminar"
                                    >
                                        {deleting === audio.docId ? (
                                            <div className="btn-spinner small"></div>
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
        .audio-list {
          background: var(--color-surface);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          margin-top: 2rem;
        }
        .audio-list.loading,
        .audio-list.error,
        .audio-list.empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
        }
        .audio-list h3 {
          color: var(--color-primary);
          margin-bottom: 1.5rem;
        }
        .hint {
          color: var(--color-text-light);
          font-size: 0.9rem;
        }
        .audio-table {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.875rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: var(--color-text);
          font-size: 0.875rem;
          text-transform: uppercase;
        }
        td {
          color: var(--color-text);
        }
        code {
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-prayer {
          background: #e0f2fe;
          color: #0369a1;
        }
        .badge-rosary_set {
          background: #f0fdf4;
          color: #15803d;
        }
        .badge-background {
          background: #fef3c7;
          color: #92400e;
        }
        .audio-title {
          font-weight: 500;
          max-width: 250px;
        }
        .audio-preview {
          height: 32px;
          max-width: 200px;
        }
        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          background: none;
          border: 1px solid #cbd5e1;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .action-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .edit-btn {
          color: #0369a1;
          border-color: #0369a1;
        }
        .edit-btn:hover:not(:disabled) {
          background: #e0f2fe;
        }
        .delete-btn {
          color: #dc2626;
          border-color: #dc2626;
        }
        .delete-btn:hover:not(:disabled) {
          background: #fee2e2;
        }
        .spinner,
        .btn-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .btn-spinner.small {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default AudioList;
