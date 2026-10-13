import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllAudios } from '../services/firestoreService';

import audioLibrary from '../data/audioLibrary.json';

export const useAudioPlayer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentAudioId, setCurrentAudioId] = useState(null);
    const [audioCatalog, setAudioCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);

    // Callback ref to notify when audio ends
    const onEndedRef = useRef(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;

        // Event listeners
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (onEndedRef.current) {
                onEndedRef.current();
            }
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => {
            setIsLoading(false);
            setHasError(false);
        };
        const handleError = (e) => {
            setIsLoading(false);
            setHasError(true);
            console.error('Audio failed to load:', e);
            // In auto-mode, we might want to auto-advance even on error after a delay
            // But for now, we leave it to manual intervention or smart error handling in the consumer
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.pause();
        };
    }, []);

    // Load audio catalog from Firestore
    useEffect(() => {
        const loadCatalog = async () => {
            try {
                setCatalogLoading(true);
                const audios = await getAllAudios();
                setAudioCatalog(audios);
                console.log('Loaded audio catalog from Firestore:', audios.length, 'audios');
            } catch (error) {
                console.error('Error loading audio catalog:', error);
            } finally {
                setCatalogLoading(false);
            }
        };

        loadCatalog();
    }, []);

    // Update volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Find audio by prayer ID from Firestore catalog OR local library
    const getAudioByPrayerId = useCallback((prayerId) => {
        // 1. Try Firestore
        const firestoreAudio = audioCatalog.find(a => a.id === prayerId && a.type === 'prayer');
        if (firestoreAudio) return firestoreAudio;

        // 2. Try Local Library
        // 2. Try Local Library
        let localAudio = audioLibrary.prayers.find(p => p.id === prayerId);
        if (!localAudio && audioLibrary.mysteries) {
            localAudio = audioLibrary.mysteries.find(m => m.id === prayerId);
        }

        if (localAudio) {
            console.log(`Found local audio for ${prayerId}`);
            return localAudio;
        }

        return null;
    }, [audioCatalog]);

    // Find rosary audio by mystery set ID from Firestore catalog OR local library
    const getAudioByMysterySet = useCallback((mysterySetId) => {
        // 1. Try Firestore
        const firestoreAudio = audioCatalog.find(a => a.id === mysterySetId || a.id === `rosario_${mysterySetId}`);
        if (firestoreAudio) return firestoreAudio;

        // 2. Try Local Library
        const localAudio = audioLibrary.rosarySets.find(r => r.id === `rosario_${mysterySetId}` || r.mysterySetId === mysterySetId);
        if (localAudio) {
            console.log(`Found local audio for ${mysterySetId}`);
            return localAudio;
        }

        return null;
    }, [audioCatalog]);

    // Play prayer audio
    const playPrayerAudio = useCallback((prayerId, onEnded = null) => {
        onEndedRef.current = onEnded; // Register callback

        const audioData = getAudioByPrayerId(prayerId);
        if (!audioData) {
            console.warn(`No audio found for prayer: ${prayerId}`);
            return false;
        }

        setCurrentAudioId(prayerId);
        setHasError(false);

        if (audioRef.current) {
            audioRef.current.src = audioData.src;
            audioRef.current.load();
            audioRef.current.play().catch(err => {
                console.error('Playback failed:', err);
                setHasError(true);
            });
        }

        return true;
    }, [getAudioByPrayerId]);

    // Play full rosary audio
    const playRosarySetAudio = useCallback((mysterySetId) => {
        const audioData = getAudioByMysterySet(mysterySetId);
        if (!audioData) {
            console.warn(`No rosary audio found for: ${mysterySetId}`);
            return false;
        }

        setCurrentAudioId(`rosario_${mysterySetId}`);
        setHasError(false);

        if (audioRef.current) {
            audioRef.current.src = audioData.src;
            audioRef.current.load();
            audioRef.current.play().catch(err => {
                console.error('Playback failed:', err);
                setHasError(true);
            });
        }

        return true;
    }, [getAudioByMysterySet]);

    // Control functions
    const play = useCallback(() => {
        if (audioRef.current && !isPlaying) {
            audioRef.current.play().catch(err => console.error('Play error:', err));
        }
    }, [isPlaying]);

    const pause = useCallback(() => {
        if (audioRef.current && isPlaying) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const stop = useCallback(() => {
        onEndedRef.current = null; // Clear callback on stop
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
            setCurrentAudioId(null);
        }
    }, []);

    const seek = useCallback((time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return {
        // State
        isPlaying,
        isLoading,
        hasError,
        currentTime,
        duration,
        volume,
        isMuted,
        currentAudioId,
        catalogLoading,
        // Controls
        play,
        pause,
        stop,
        seek,
        setVolume,
        toggleMute,
        playPrayerAudio,
        playRosarySetAudio,
        // Helpers
        getAudioByPrayerId,
        getAudioByMysterySet
    };
};
