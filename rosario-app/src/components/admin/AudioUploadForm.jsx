import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadAudio } from '../../services/storageService';
import { createAudio, updateAudio } from '../../services/firestoreService';

const AUDIO_TYPES = [
    { value: 'prayer', label: 'Oración' },
    { value: 'rosary_set', label: 'Rosario Completo' },
    { value: 'background', label: 'Música de  Fondo' }
];

const AudioUploadForm = ({ onSuccess, editingAudio = null, onCancel }) => {
    const [formData, setFormData] = useState({
        type: editingAudio?.type || 'prayer',
        id: editingAudio?.id || '',
        title: editingAudio?.title || ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.type.includes('audio/mpeg') && !selectedFile.name.endsWith('.mp3')) {
                setError('El archivo debe ser un MP3');
                setFile(null);
                return;
            }
            // Validate file size (20MB)
            if (selectedFile.size > 20 * 1024 * 1024) {
                setError('El archivo debe ser menor a 20MB');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.type || !formData.id || !formData.title) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (!editingAudio && !file) {
            setError('Debes seleccionar un archivo MP3');
            return;
        }

        try {
            setUploading(true);
            setProgress(0);

            let audioUrl = editingAudio?.src;
            let storagePath = editingAudio?.storagePath;
            let fileSize = editingAudio?.size;
            let filename = editingAudio?.filename;

            // Upload new file if provided
            if (file) {
                const uploadResult = await uploadAudio(
                    file,
                    formData.type,
                    formData.id,
                    (progressPercent) => setProgress(progressPercent)
                );
                audioUrl = uploadResult.url;
                storagePath = uploadResult.path;
                fileSize = uploadResult.size;
                filename = uploadResult.filename;
            }

            const audioData = {
                id: formData.id,
                type: formData.type,
                title: formData.title,
                src: audioUrl,
                storagePath,
                size: fileSize,
                filename
            };

            if (editingAudio) {
                // Update existing
                await updateAudio(editingAudio.docId, audioData);
            } else {
                // Create new
                await createAudio(audioData);
            }

            // Reset form
            setFormData({ type: 'prayer', id: '', title: '' });
            setFile(null);
            setProgress(0);

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error uploading audio:', error);

            // Detailed error message
            let errorMessage = error.message || 'Error al subir el audio';
            if (error.code === 'storage/unauthorized') {
                errorMessage = 'No tienes permiso para subir archivos. Verifica que has iniciado sesión.';
            } else if (error.code === 'storage/canceled') {
                errorMessage = 'Subida cancelada por el usuario.';
            } else if (error.code === 'storage/unknown') {
                errorMessage = 'Ocurrió un error desconocido. Intenta de nuevo.';
            }

            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="audio-upload-form">
            <h3>{editingAudio ? '✏️ Editar Audio' : '➕ Subir Nuevo Audio'}</h3>

            {error && (
                <div className="error-alert">
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="type">Tipo</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        disabled={uploading}
                        required
                    >
                        {AUDIO_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="id">ID</label>
                    <input
                        type="text"
                        id="id"
                        name="id"
                        value={formData.id}
                        onChange={handleInputChange}
                        placeholder="ej: ave_maria, padre_nuestro"
                        disabled={uploading || editingAudio}
                        required
                    />
                    <small>Identificador único (sin espacios, usar guiones bajos)</small>
                </div>

                <div className="form-group">
                    <label htmlFor="title">Título</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="ej: Ave María - Voz femenina"
                        disabled={uploading}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="file">Archivo MP3 {editingAudio && '(opcional para edición)'}</label>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="file"
                            accept=".mp3,audio/mpeg"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        {file && <span className="file-name">📎 {file.name}</span>}
                    </div>
                    <small>Máximo 20MB, solo archivos .mp3</small>
                </div>

                {
                    uploading && progress > 0 && (
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="progress-text">{progress}%</span>
                        </div>
                    )
                }

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                        {uploading ? (
                            <>
                                <div className="btn-spinner"></div>
                                {editingAudio ? 'Guardando...' : 'Subiendo...'}
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                {editingAudio ? 'Guardar Cambios' : 'Subir Audio'}
                            </>
                        )}
                    </button>
                    {editingAudio && (
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={uploading}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form >

            <style>{`
        .audio-upload-form {
          background: var(--color-surface);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
        }
        .audio-upload-form h3 {
          color: var(--color-primary);
          margin-bottom: 1.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-family: var(--font-main);
          font-size: 1rem;
        }
        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: var(--color-text-light);
          font-size: 0.85rem;
        }
        .file-input-wrapper {
          position: relative;
        }
        .file-name {
          display: block;
          margin-top: 0.5rem;
          color: var(--color-primary);
          font-size: 0.9rem;
        }
        .error-alert {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 0.875rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }
        .progress-container {
          margin: 1rem 0;
        }
        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s;
        }
        .progress-text {
          display: block;
          text-align: center;
          margin-top: 0.5rem;
          color: var(--color-text-light);
          font-size: 0.9rem;
        }
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #e2e8f0;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div >
    );
};

export default AudioUploadForm;
