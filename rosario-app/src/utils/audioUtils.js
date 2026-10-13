// Map rosary step to prayer ID for audio playback
export const getPrayerIdForStep = (step) => {
    const stepToPrayerMap = {
        'start': 'sign_of_cross',
        'our-father': 'padre_nuestro',
        'hail-mary': 'ave_maria',
        'glory': 'gloria',
        'fatima': 'fatima',
        'salve': 'salve'
    };

    return stepToPrayerMap[step] || null;
};

// Format audio title for display
export const getAudioTitleForStep = (step, content) => {
    if (!content) return '';

    if (step === 'hail-mary' && content.subtitle) {
        return `${content.title} (${content.subtitle})`;
    }

    return content.title || '';
};
