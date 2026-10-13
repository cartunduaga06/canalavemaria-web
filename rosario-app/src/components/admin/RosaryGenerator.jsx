import React, { useState } from 'react';
import { Download, Loader, Music, AlertCircle, CheckCircle } from 'lucide-react';
import { buildRosarySequence, generateRosaryAudio } from '../../utils/rosaryGenerator';
import { getAllAudios } from '../../services/firestoreService';

const RosaryGenerator = () => {
    const [mysteryId, setMysteryId] = useState('gozosos');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        setDownloadUrl(null);
        setProgress(0);

        try {
            setStatusText('Obteniendo catálogo de audios...');
            // Fetch latest audios from Firestore to ensure we use the admin's uploads
            const audioCatalog = await getAllAudios();

            setStatusText('Calculando secuencia...');
            const sequence = buildRosarySequence(mysteryId, audioCatalog);

            const blob = await generateRosaryAudio(sequence, (pct, text) => {
                if (pct) setProgress(pct);
                if (text) setStatusText(text);
            });

            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setStatusText('¡Rosario generado correctamente!');
            setProgress(100);

        } catch (err) {
            console.error(err);
            setError(err.message || "Error generando audio. Verifica que tu navegador soporte SharedArrayBuffer.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="card generator-card">
            <div className="card-header">
                <h3><Music size={20} /> Generador de Rosario MP3</h3>
                <p className="text-sm text-muted">Crea un archivo MP3 único con el Rosario completo para usar en videos o podcast.</p>
            </div>

            <div className="generator-body">
                <div className="control-group">
                    <label>Misterios:</label>
                    <select
                        value={mysteryId}
                        onChange={(e) => setMysteryId(e.target.value)}
                        className="form-select"
                        disabled={isGenerating}
                    >
                        <option value="gozosos">Gozosos (Lunes/Sábado)</option>
                        <option value="dolorosos">Dolorosos (Martes/Viernes)</option>
                        <option value="gloriosos">Gloriosos (Miércoles/Domingo)</option>
                        <option value="luminosos">Luminosos (Jueves)</option>
                    </select>
                </div>

                {!isGenerating && !downloadUrl && (
                    <button onClick={handleGenerate} className="btn btn-primary w-full">
                        <Download size={18} /> Generar MP3 Completo
                    </button>
                )}

                {isGenerating && (
                    <div className="progress-area">
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="progress-status">
                            <Loader size={14} className="spin" /> {statusText} ({progress}%)
                        </div>
                    </div>
                )}

                {downloadUrl && (
                    <div className="success-area">
                        <div className="success-msg">
                            <CheckCircle size={18} color="green" />
                            <span>¡Archivo listo!</span>
                        </div>
                        <a
                            href={downloadUrl}
                            download={`rosario-${mysteryId}.mp3`}
                            className="btn btn-success w-full"
                        >
                            <Download size={18} /> Descargar Archivo ({mysteryId})
                        </a>
                        <button onClick={() => setDownloadUrl(null)} className="btn btn-text text-sm mt-2">
                            Generar otro
                        </button>
                    </div>
                )}

                {error && (
                    <div className="error-msg">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <style>{`
                .generator-card {
                    margin-top: 2rem;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .card-header {
                    background: #f8fafc;
                    padding: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .card-header h3 {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-primary-dark);
                }
                .text-muted { color: #64748b; margin-top: 0.25rem; margin-bottom: 0; }
                .generator-body { padding: 1.5rem; }
                .control-group { margin-bottom: 1rem; }
                .form-select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                }
                .progress-area { margin-top: 1rem; }
                .progress-bar-bg {
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--color-primary);
                    transition: width 0.3s ease;
                }
                .progress-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    font-size: 0.85rem;
                    color: var(--color-text-light);
                }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .success-area {
                    text-align: center;
                    animation: fadeIn 0.5s ease;
                }
                .success-msg {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: green;
                    font-weight: 500;
                    margin-bottom: 1rem;
                }
                .btn-success {
                    background-color: #22c55e;
                    color: white;
                    border: none;
                }
                .btn-success:hover { background-color: #16a34a; }
                .error-msg {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: #fee2e2;
                    color: #991b1b;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default RosaryGenerator;
