import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = ({
    isPlaying,
    isLoading,
    hasError,
    currentTime,
    duration,
    volume,
    isMuted,
    onPlayPause,
    onSeek,
    onVolumeChange,
    onToggleMute,
    title = "Audio"
}) => {
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const newTime = percent * duration;
        onSeek(newTime);
    };

    if (hasError) {
        return (
            <div className="audio-player error">
                <span className="error-message">⚠️ Audio no disponible. Usando voz sintética.</span>
            </div>
        );
    }

    return (
        <div className="audio-player">
            <div className="player-header">
                <span className="player-title">{title}</span>
                {isLoading && <span className="loading-indicator">Cargando...</span>}
            </div>

            <div className="player-controls">
                <button
                    onClick={onPlayPause}
                    className="play-btn"
                    aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    disabled={isLoading}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                </button>

                <div className="progress-section">
                    <span className="time-display">{formatTime(currentTime)}</span>
                    <div
                        className="progress-bar"
                        onClick={handleSeek}
                        role="slider"
                        aria-label="Progreso del audio"
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        aria-valuenow={currentTime}
                    >
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        <div className="progress-thumb" style={{ left: `${progressPercent}%` }} />
                    </div>
                    <span className="time-display">{formatTime(duration)}</span>
                </div>

                <div className="volume-controls">
                    <button
                        onClick={onToggleMute}
                        className="mute-btn"
                        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="volume-slider"
                        aria-label="Control de volumen"
                        disabled={isMuted}
                    />
                </div>
            </div>

            <style jsx>{`
        .audio-player {
          background: var(--color-surface);
          border-radius: var(--radius-md);
          padding: 1rem;
          box-shadow: var(--shadow-sm);
          margin: 0.5rem 0;
        }
        .audio-player.error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          padding: 0.75rem;
        }
        .error-message {
          color: #dc2626;
          font-size: 0.9rem;
        }
        .player-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .player-title {
          font-weight: 600;
          color: var(--color-primary);
          font-size: 0.9rem;
        }
        .loading-indicator {
          font-size: 0.85rem;
          color: var(--color-text-light);
        }
        .player-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .play-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .play-btn:hover:not(:disabled) {
          background: #003d80;
        }
        .play-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .progress-section {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .time-display {
          font-size: 0.85rem;
          color: var(--color-text-light);
          min-width: 40px;
        }
        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        }
        .progress-fill {
          height: 100%;
          background: var(--color-primary);
          border-radius: 3px;
          transition: width 0.1s;
        }
        .progress-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          background: var(--color-primary);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: left 0.1s;
        }
        .volume-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .mute-btn {
          background: none;
          border: none;
          color: var(--color-text-light);
          cursor: pointer;
          padding: 0.25rem;
        }
        .volume-slider {
          width: 80px;
        }
        
        @media (max-width: 600px) {
          .volume-controls {
            display: none;
          }
        }
      `}</style>
        </div>
    );
};

export default AudioPlayer;
