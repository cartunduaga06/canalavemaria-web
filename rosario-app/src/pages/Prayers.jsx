import React from 'react';
import prayersData from '../data/prayers.json';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Headphones, Square, Play } from 'lucide-react';

const PRAYER_AUDIO_MAP = {
  signOfCross: 'sign_of_cross',
  creed: 'credo',
  ourFather: 'padre_nuestro',
  hailMary: 'ave_maria',
  glory: 'gloria',
  fatima: 'fatima',
  salve: 'salve'
};

const Prayers = () => {
  const {
    playPrayerAudio,
    stop,
    currentAudioId,
    isPlaying
  } = useAudioPlayer();

  const handleToggleAudio = (prayerKey) => {
    const audioId = PRAYER_AUDIO_MAP[prayerKey];
    if (!audioId) return;

    if (currentAudioId === audioId && isPlaying) {
      stop();
    } else {
      playPrayerAudio(audioId);
    }
  };

  return (
    <div className="prayers-container">
      <h2>Oraciones Básicas</h2>
      <div className="prayers-list">
        {Object.entries(prayersData).map(([key, prayer]) => {
          const audioId = PRAYER_AUDIO_MAP[key];
          const isActive = currentAudioId === audioId && isPlaying;

          return (
            <div key={key} className={`card ${isActive ? 'active-audio' : ''}`}>
              <div className="card-header">
                <h3>{prayer.title}</h3>
                {audioId && (
                  <button
                    className={`btn-icon ${isActive ? 'active' : ''}`}
                    onClick={() => handleToggleAudio(key)}
                    aria-label={isActive ? "Detener audio" : "Escuchar oración"}
                  >
                    {isActive ? <Square size={20} /> : <Headphones size={20} />}
                  </button>
                )}
              </div>
              <p>{prayer.text}</p>
            </div>
          );
        })}
      </div>
      <style>{`
        .prayers-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .prayers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        .card h3 {
          margin: 0;
          color: var(--color-primary);
        }
        .card p {
          line-height: 1.6;
          color: var(--color-text);
        }
        .btn-icon {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-text-light);
            padding: 0.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .btn-icon:hover {
            background-color: var(--color-bg-alt);
            color: var(--color-primary);
        }
        .btn-icon.active {
            color: var(--color-accent);
            background-color: rgba(239, 68, 68, 0.1);
        }
        .card.active-audio {
            border-color: var(--color-primary-light);
            background-color: #f0fdf4; /* Light green tint */
        }
      `}</style>
    </div>
  );
};

export default Prayers;
