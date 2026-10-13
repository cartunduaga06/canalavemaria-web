import React, { useState, useEffect, useRef } from 'react';
import { useRosary } from '../hooks/useRosary';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';
import AudioPlayer from '../components/AudioPlayer';
import { ChevronRight, ChevronLeft, BookOpen, Play, Pause, Square, Headphones, Music } from 'lucide-react';
import mysteriesData from '../data/mysteries.json';
import { getTodayMessage } from '../utils/rosaryUtils';
import { getPrayerIdForStep, getAudioTitleForStep } from '../utils/audioUtils';

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const Pray = () => {
  const {
    activeMysterySet,
    currentMysteryIndex,
    step,
    hailMaryCount,
    isFinished,
    changeMysterySet,
    nextStep,
    prevStep,
    getCurrentContent,
    resetRosary,
    // Auto mode
    isAutoMode,
    isAutoPaused,
    startAutoMode,
    pauseAutoMode,
    resumeAutoMode,
    stopAutoMode
  } = useRosary();

  const [showMeditation, setShowMeditation] = useState(true);
  const content = getCurrentContent();

  // MP3 Audio Player
  const {
    isPlaying: isMP3Playing,
    isLoading: isMP3Loading,
    hasError: hasMP3Error,
    currentTime,
    duration,
    volume,
    isMuted,
    play: playMP3,
    pause: pauseMP3,
    stop: stopMP3,
    seek,
    setVolume,
    toggleMute,
    playPrayerAudio,
  } = useAudioPlayer();

  // Background Music
  const backgroundMusic = useBackgroundMusic(isMP3Playing);

  // Determine current prayer ID for audio
  const currentPrayerId = React.useMemo(() => {
    if (step === 'mystery-intro' && activeMysterySet) {
      // Construct ID like 'gozosos_1', 'luminosos_3'
      // Note: mysteries are 1-indexed in IDs usually, but index is 0-based
      const mysteryNum = currentMysteryIndex + 1;
      return `${activeMysterySet.id}_${mysteryNum}`;
    }
    return getPrayerIdForStep(step);
  }, [step, activeMysterySet, currentMysteryIndex]);

  // Stop background music when finished
  useEffect(() => {
    if (isFinished && backgroundMusic.isEnabled) {
      backgroundMusic.stop();
    }
  }, [isFinished]);

  // Auto-advance Logic (Event Driven)
  // This effect orchestrates the flow when in Auto Mode
  useEffect(() => {
    let isActive = true; // prevent race conditions

    const handleAutoStep = async () => {
      if (isAutoMode && !isAutoPaused && !isFinished) {

        // 1. If we have a prayer ID, try to play it
        if (currentPrayerId) {
          // We use the new callback capability of playPrayerAudio if we added it, 
          // OR we rely on the implementation we did in useAudioPlayer which accepts onEnded.
          const playedCodes = playPrayerAudio(currentPrayerId, async () => {
            // Audio finished! Wait 1s then move to next step.
            if (isActive && isAutoMode && !isAutoPaused) {
              await delay(1000);
              if (isActive && isAutoMode && !isAutoPaused) {
                nextStep();
              }
            }
          });

          if (!playedCodes) {
            // Audio file not found or failed to start immediately?
            // Fallback: wait a bit and advance.
            console.warn("Audio not found for step, auto-advancing with delay");
            await delay(5000);
            if (isActive && isAutoMode && !isAutoPaused) nextStep();
          }
        } else {
          // 2. No prayer audio for this step (e.g. mystery intro/meditation text only?)
          // Wait for reading time then advance
          // For now hardcoded delay, could be based on text length
          const readingTime = 8000;
          await delay(readingTime);
          if (isActive && isAutoMode && !isAutoPaused) nextStep();
        }
      } else if (!isAutoMode) {
        // If we exit auto mode, stop audio? 
        // Maybe let it finish or stop? Let's stop to be safe.
        // stopMP3(); // Uncomment if we want silence immediately on stop auto
      }
    };

    handleAutoStep();

    return () => {
      isActive = false;
    };
  }, [isAutoMode, isAutoPaused, isFinished, step, currentPrayerId, nextStep, playPrayerAudio]);
  // Important: remove playPrayerAudio from deps if it's not stable (it is wrapped in useCallback)


  // Stop audio when unmounting
  useEffect(() => {
    return () => {
      stopMP3();
    };
  }, [stopMP3]);

  // Handle listen to prayer button (Manual Mode)
  const handleListenToPrayer = () => {
    if (currentPrayerId) {
      playPrayerAudio(currentPrayerId);
    }
  };

  // Handle play/pause for MP3 player
  const handleMP3PlayPause = () => {
    if (isMP3Playing) {
      pauseMP3();
    } else {
      playMP3();
    }
  };

  if (!activeMysterySet) return <div>Cargando...</div>;

  return (
    <div className="pray-container">
      {/* Day Message Banner */}
      <div className="day-message-banner">
        <span className="day-icon">📅</span>
        {getTodayMessage()}
      </div>

      {/* Header / Mystery Selector */}
      <div className="mystery-header">
        <select
          value={activeMysterySet.id}
          onChange={(e) => changeMysterySet(e.target.value)}
          className="mystery-select"
        >
          {mysteriesData.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <div className="progress-indicator">
          Misterio {currentMysteryIndex + 1}/5
        </div>
      </div>

      {/* Main Content Card */}
      <div className="prayer-card card">
        {content && (
          <>
            <div className="card-header">
              <h2 className="prayer-title">{content.title}</h2>
              {content.subtitle && <h3 className="prayer-subtitle">{content.subtitle}</h3>}
            </div>

            <div className="card-body">
              {step === 'mystery-intro' && (
                <div className="meditation-box">
                  <p className="meditation-text">{content.text}</p>
                </div>
              )}

              {step !== 'mystery-intro' && step !== 'end' && (
                <div className={`prayer-text ${!showMeditation ? 'text-only' : ''}`}>
                  {content.intention && (
                    <div className="intention-box">
                      <p className="intention-text">"{content.intention}"</p>
                    </div>
                  )}
                  <p>{content.text}</p>
                </div>
              )}

              {step === 'end' && (
                <div className="completion-message">
                  <p>{content.text}</p>
                  <button onClick={resetRosary} className="btn btn-primary mt-4">
                    Rezar otro Rosario
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {!isFinished && (
        <div className="controls-area">
          {/* Auto Mode Controls */}
          {!isAutoMode ? (
            <button
              onClick={() => {
                // Start the first audio inside the user's click gesture so mobile
                // browsers do not classify it as unsolicited autoplay.
                handleListenToPrayer();
                startAutoMode();
              }}
              className="btn btn-primary w-full auto-start-btn"
            >
              <Play size={20} fill="currentColor" /> Rezar Rosario automáticamente
            </button>
          ) : (
            <div className="auto-controls">
              <div className="auto-status">
                <span className="auto-badge">🤖 Modo Automático</span>
                {currentPrayerId ? (
                  <span className="auto-speed">Reproduciendo audio...</span>
                ) : (
                  <span className="auto-speed">Esperando...</span>
                )}
              </div>
              <div className="auto-buttons">
                {!isAutoPaused ? (
                  <button onClick={() => { pauseAutoMode(); pauseMP3(); }} className="btn btn-secondary">
                    <Pause size={18} /> Pausar
                  </button>
                ) : (
                  <button onClick={() => { resumeAutoMode(); if (!isMP3Playing && currentPrayerId) playMP3(); }} className="btn btn-primary">
                    <Play size={18} /> Reanudar
                  </button>
                )}
                <button onClick={() => { stopAutoMode(); stopMP3(); }} className="btn btn-secondary">
                  <Square size={18} /> Detener
                </button>
              </div>

              {/* Audio controls in auto mode - Simplified */}
              <div className="auto-audio-controls">
                <button
                  onClick={backgroundMusic.toggle}
                  className={`btn btn-secondary w-full music-btn ${backgroundMusic.isPlaying ? 'active' : ''}`}
                >
                  <Music size={18} />
                  {backgroundMusic.isPlaying ? 'Desactivar música' : 'Activar música'}
                </button>
              </div>
            </div>
          )}

          {/* Manual Controls - Only show when NOT in auto mode */}
          {!isAutoMode && (
            <>
              {/* Listen to Prayer Button (MP3 mode only) */}
              {currentPrayerId && (
                <button onClick={handleListenToPrayer} className="btn btn-secondary w-full listen-btn">
                  <Headphones size={18} /> Escuchar esta oración
                </button>
              )}

              {/* MP3 Audio Player Interface */}
              {(isMP3Playing || isMP3Loading) && (
                <AudioPlayer
                  isPlaying={isMP3Playing}
                  isLoading={isMP3Loading}
                  hasError={hasMP3Error}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  isMuted={isMuted}
                  onPlayPause={handleMP3PlayPause}
                  onSeek={seek}
                  onVolumeChange={setVolume}
                  onToggleMute={toggleMute}
                  title={getAudioTitleForStep(step, content)}
                />
              )}

              {/* Background Music Toggle */}
              <button
                onClick={backgroundMusic.toggle}
                className={`btn btn-secondary w-full music-btn ${backgroundMusic.isPlaying ? 'active' : ''}`}
              >
                <Music size={18} />
                {backgroundMusic.isPlaying ? 'Desactivar música de fondo' : 'Activar música de fondo'}
              </button>

              {/* Bead Counter for Hail Marys */}
              {step === 'hail-mary' && (
                <div className="bead-counter">
                  <div className="bead-progress">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bead ${i < hailMaryCount ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="counter-text">{hailMaryCount}/10</span>
                </div>
              )}

              <div className="action-buttons">
                <button onClick={prevStep} className="btn btn-secondary icon-btn" disabled={step === 'start'}>
                  <ChevronLeft /> Anterior
                </button>

                <button onClick={nextStep} className="btn btn-primary flex-1">
                  {step === 'start' ? 'Comenzar' : 'Siguiente'} <ChevronRight />
                </button>
              </div>

              <div className="options-bar">
                <button
                  className="text-btn"
                  onClick={() => setShowMeditation(!showMeditation)}
                >
                  <BookOpen size={16} /> {showMeditation ? 'Ocultar texto' : 'Mostrar texto'}
                </button>
              </div>
            </>
          )}
        </div>
      )
      }

      <style>{`
        .pray-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: 100%;
        }
        .day-message-banner {
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          color: var(--color-primary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .day-icon {
          font-size: 1.2rem;
        }
        .mystery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0.5rem;
        }
        .mystery-select {
          padding: 0.5rem;
          border-radius: var(--radius-md);
          border: 1px solid #ccc;
          font-family: var(--font-main);
          color: var(--color-primary);
          font-weight: 600;
        }
        .progress-indicator {
          font-size: 0.9rem;
          color: var(--color-text-light);
        }
        .prayer-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          min-height: 300px;
        }
        .prayer-title {
          color: var(--color-primary);
          font-size: 1.5rem;
        }
        .prayer-subtitle {
          color: var(--color-secondary);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .meditation-text {
          font-style: italic;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .intention-box {
          background-color: #f0fdf4;
          border-left: 4px solid var(--color-primary);
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
        }
        .intention-text {
          font-style: italic;
          color: var(--color-primary-dark);
          font-weight: 500;
          font-size: 1.15rem;
        }
        .prayer-text p {
          font-size: 1.1rem;
        }
        .controls-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .auto-start-btn {
          font-size: 1rem;
          padding: 1rem;
        }
        .auto-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: var(--radius-lg);
          border: 2px solid var(--color-primary-light);
        }
        .auto-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }
        .auto-badge {
          background: var(--color-primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .auto-speed {
          color: var(--color-text-light);
          font-size: 0.85rem;
        }
        .auto-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .auto-buttons .btn {
          flex: 1;
        }
        .auto-audio-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 83, 156, 0.2);
        }
        .
        .listen-btn {
          margin-top: 0.5rem;
        }
        .music-btn {
          margin-top: 0.5rem;
        }
        .music-btn.active {
          background: var(--color-primary);
          color: white;
        }
        .bead-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .bead-progress {
          display: flex;
          gap: 0.5rem;
        }
        .bead {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #e2e8f0;
          border: 1px solid #cbd5e1;
        }
        .bead.active {
          background-color: var(--color-primary);
          border-color: var(--color-primary);
          box-shadow: 0 0 4px var(--color-primary-light);
        }
        .counter-text {
          color: var(--color-text-light);
          font-size: 0.9rem;
        }
        .action-buttons {
          display: flex;
          gap: 1rem;
        }
        .icon-btn {
          padding: 0.75rem;
        }
        .options-bar {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .text-btn {
          background: none;
          border: none;
          color: var(--color-text-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        .text-btn.active {
          color: var(--color-primary);
          background-color: #e0f2fe;
        }
      `}</style>
    </div >
  );
};

export default Pray;
