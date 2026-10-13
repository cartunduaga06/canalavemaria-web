import { useState, useEffect, useRef, useCallback } from 'react';
import audioLibrary from '../data/audioLibrary.json';

const NORMAL_VOLUME = 0.3;
const DUCKED_VOLUME = 0.1;
const FADE_DURATION = 500; // ms

export const useBackgroundMusic = (isPrayerPlaying = false) => {
    const audioRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(NORMAL_VOLUME);
    const fadeIntervalRef = useRef(null);

    // Initialize background music
    useEffect(() => {
        const musicData = audioLibrary.backgroundMusic[0];
        if (!musicData) return;

        audioRef.current = new Audio(musicData.src);
        audioRef.current.loop = true;
        audioRef.current.volume = NORMAL_VOLUME;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = (e) => {
            console.warn('Background music failed to load:', e);
            setIsPlaying(false);
        };

        audioRef.current.addEventListener('play', handlePlay);
        audioRef.current.addEventListener('pause', handlePause);
        audioRef.current.addEventListener('error', handleError);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('play', handlePlay);
                audioRef.current.removeEventListener('pause', handlePause);
                audioRef.current.removeEventListener('error', handleError);
                audioRef.current.pause();
            }
        };
    }, []);

    // Smooth volume transition (fade)
    const fadeTo = useCallback((targetVolume) => {
        if (!audioRef.current) return;

        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        const startVolume = audioRef.current.volume;
        const volumeDiff = targetVolume - startVolume;
        const steps = FADE_DURATION / 50; // 50ms intervals
        const stepSize = volumeDiff / steps;
        let currentStep = 0;

        fadeIntervalRef.current = setInterval(() => {
            if (!audioRef.current) {
                clearInterval(fadeIntervalRef.current);
                return;
            }

            currentStep++;
            const newVolume = startVolume + (stepSize * currentStep);

            if (currentStep >= steps) {
                audioRef.current.volume = targetVolume;
                setVolume(targetVolume);
                clearInterval(fadeIntervalRef.current);
            } else {
                audioRef.current.volume = newVolume;
                setVolume(newVolume);
            }
        }, 50);
    }, []);

    // Apply ducking when prayer is playing
    useEffect(() => {
        if (!isPlaying) return;

        if (isPrayerPlaying) {
            fadeTo(DUCKED_VOLUME);
        } else {
            fadeTo(NORMAL_VOLUME);
        }
    }, [isPrayerPlaying, isPlaying, fadeTo]);

    // Toggle background music
    const toggle = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsEnabled(false);
        } else {
            audioRef.current.play().catch(err => {
                console.error('Failed to play background music:', err);
            });
            setIsEnabled(true);
        }
    }, [isPlaying]);

    // Start background music
    const start = useCallback(() => {
        if (!audioRef.current || isPlaying) return;

        audioRef.current.play().catch(err => {
            console.error('Failed to start background music:', err);
        });
        setIsEnabled(true);
    }, [isPlaying]);

    // Stop background music
    const stop = useCallback(() => {
        if (!audioRef.current) return;

        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsEnabled(false);
    }, []);

    return {
        isEnabled,
        isPlaying,
        volume,
        toggle,
        start,
        stop
    };
};
