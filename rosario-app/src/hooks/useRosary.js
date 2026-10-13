import { useState, useEffect, useRef, useCallback } from 'react';
import mysteriesData from '../data/mysteries.json';
import prayersData from '../data/prayers.json';
import { getMysteriesForToday } from '../utils/rosaryUtils';

const DAYS_MAP = {
    0: 'gloriosos', // Sunday
    1: 'gozosos',   // Monday
    2: 'dolorosos', // Tuesday
    3: 'gloriosos', // Wednesday
    4: 'luminosos', // Thursday
    5: 'dolorosos', // Friday
    6: 'gozosos'    // Saturday
};

export const useRosary = () => {
    const [activeMysterySet, setActiveMysterySet] = useState(null);
    const [currentMysteryIndex, setCurrentMysteryIndex] = useState(0);
    const [step, setStep] = useState('start'); // start, mystery-intro, our-father, hail-mary, glory, fatima, end
    const [hailMaryCount, setHailMaryCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // Automatic mode state
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [isAutoPaused, setIsAutoPaused] = useState(false);

    // Initialize with today's mystery
    useEffect(() => {
        const mysteryId = getMysteriesForToday();
        const mysterySet = mysteriesData.find(m => m.id === mysteryId);
        setActiveMysterySet(mysterySet);
    }, []);

    const changeMysterySet = (id) => {
        const mysterySet = mysteriesData.find(m => m.id === id);
        setActiveMysterySet(mysterySet);
        resetRosary();
    };

    const resetRosary = () => {
        setCurrentMysteryIndex(0);
        setStep('start');
        setHailMaryCount(0);
        setIsFinished(false);
        setIsAutoMode(false);
        setIsAutoPaused(false);
    };

    const nextStep = useCallback(() => {
        if (isFinished) return;

        setStep(currentStep => {
            let nextStepVal = currentStep;

            // We need to use functional updates correctly to ensure we have the latest state values for counts
            // But since step is the dependency, we need to be careful.
            // Actually, we should probably calculate the next state based on current state refs or just rely on React's batched updates if we structure this right.
            // Simplified state logic for readability inside this function:

            switch (currentStep) {
                case 'start':
                    return 'mystery-intro';
                case 'mystery-intro':
                    return 'our-father';
                case 'our-father':
                    setHailMaryCount(1);
                    return 'hail-mary';
                case 'hail-mary':
                    // We need to check hailMaryCount, but it's a separate state variable. 
                    // To avoid stale closures, we might need a ref or check the value in the render cycle?
                    // Or better, let's use the setState callback pattern but hailMaryCount is separate.
                    // Let's rely on the outer scope variable `hailMaryCount` if we include it in dependency array or use a ref.
                    // NOTE: This function `nextStep` is recreated when `hailMaryCount` changes if we include it in deps.

                    // Actually, simpler approach for state dependent logic:
                    // We can't access `hailMaryCount` reliably if it's stale. 
                    // Let's fix this by not doing logic *inside* the setStep callback that depends on other state unless we are sure.
                    return 'hail-mary'; // Placeholder, logic below
                case 'glory':
                    return 'fatima';
                case 'fatima':
                    return 'fatima'; // Placeholder
                case 'salve':
                    setIsFinished(true);
                    return 'end';
                default:
                    return currentStep;
            }
        });

        // Effect-like logic but synchronous for state consistency
        if (step === 'hail-mary') {
            if (hailMaryCount < 10) {
                setHailMaryCount(prev => prev + 1);
                // Step remains hail-mary
            } else {
                setStep('glory');
            }
        } else if (step === 'fatima') {
            if (currentMysteryIndex < 4) {
                setCurrentMysteryIndex(prev => prev + 1);
                setStep('mystery-intro');
                setHailMaryCount(0);
            } else {
                setStep('salve');
            }
        } else {
            // For other steps, just advance (handled by the switch above largely)
            switch (step) {
                case 'start':
                    setStep('mystery-intro');
                    break;
                case 'mystery-intro':
                    setStep('our-father');
                    break;
                case 'our-father':
                    setStep('hail-mary');
                    setHailMaryCount(1);
                    break;
                case 'glory':
                    setStep('fatima');
                    break;
                case 'salve':
                    setStep('end');
                    setIsFinished(true);
                    break;
            }
        }
    }, [step, hailMaryCount, currentMysteryIndex, isFinished]);


    const prevStep = () => {
        // Basic implementation of previous step logic
        if (step === 'hail-mary' && hailMaryCount > 1) {
            setHailMaryCount(prev => prev - 1);
        } else if (step === 'hail-mary' && hailMaryCount === 1) {
            setStep('our-father');
        }
        // Add more cases as needed
    };

    const getCurrentContent = () => {
        if (!activeMysterySet) return null;

        const currentMystery = activeMysterySet.mysteries[currentMysteryIndex];

        switch (step) {
            case 'start':
                return {
                    title: "Iniciar Rosario",
                    subtitle: activeMysterySet.name,
                    text: "Por la señal de la Santa Cruz...",
                    prayer: prayersData.signOfCross
                };
            case 'mystery-intro':
                return {
                    title: `${currentMysteryIndex + 1}º Misterio`,
                    subtitle: currentMystery.title,
                    text: currentMystery.meditations?.breve_intro || currentMystery.meditation,
                    type: 'meditation'
                };
            case 'our-father':
                return {
                    title: "Padre Nuestro",
                    text: prayersData.ourFather.text,
                    prayer: prayersData.ourFather
                };
            case 'hail-mary':
                // Get intention for this specific Hail Mary if available
                const intention = currentMystery.meditations?.por_ave_maria?.[hailMaryCount - 1];

                return {
                    title: "Ave María",
                    subtitle: `${currentMystery.title} (${hailMaryCount}/10)`,
                    text: prayersData.hailMary.text,
                    prayer: prayersData.hailMary,
                    count: hailMaryCount,
                    intention: intention // Pass the intention to the UI
                };
            case 'glory':
                return {
                    title: "Gloria",
                    text: prayersData.glory.text,
                    prayer: prayersData.glory
                };
            case 'fatima':
                return {
                    title: "Jaculatoria",
                    text: prayersData.fatima.text,
                    prayer: prayersData.fatima
                };
            case 'salve':
                return {
                    title: "La Salve",
                    text: prayersData.salve.text,
                    prayer: prayersData.salve
                };
            case 'end':
                return {
                    title: "Rosario Finalizado",
                    text: "Has completado el Santo Rosario. Que la Virgen te acompañe.",
                    type: 'end'
                };
            default:
                return null;
        }
    };

    // Automatic mode functions
    const startAutoMode = useCallback(() => {
        setIsAutoMode(true);
        setIsAutoPaused(false);
        if (step === 'end' || isFinished) {
            resetRosary();
        }
    }, [step, isFinished]);

    const pauseAutoMode = useCallback(() => {
        setIsAutoPaused(true);
    }, []);

    const resumeAutoMode = useCallback(() => {
        setIsAutoPaused(false);
    }, []);

    const stopAutoMode = useCallback(() => {
        setIsAutoMode(false);
        setIsAutoPaused(false);
        // resetRosary(); // Optional: do we reset or just stop?
    }, []);

    // Stop auto mode when finished
    useEffect(() => {
        if (isFinished && isAutoMode) {
            setIsAutoMode(false);
            setIsAutoPaused(false);
        }
    }, [isFinished, isAutoMode]);

    return {
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
        stopAutoMode,
    };
};
