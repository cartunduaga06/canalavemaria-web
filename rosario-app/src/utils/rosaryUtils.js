import mysteriesData from '../data/mysteries.json';

const DAYS_MAP = {
    0: 'gloriosos', // Sunday
    1: 'gozosos',   // Monday
    2: 'dolorosos', // Tuesday
    3: 'gloriosos', // Wednesday
    4: 'luminosos', // Thursday
    5: 'dolorosos', // Friday
    6: 'gozosos'    // Saturday
};

const DAY_NAMES = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miércoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sábado'
};

/**
 * Get the mystery set ID for today
 * @returns {string} Mystery set ID (e.g., 'gozosos', 'dolorosos')
 */
export const getMysteriesForToday = () => {
    const today = new Date().getDay();
    return DAYS_MAP[today];
};

/**
 * Get the Spanish name for a day of the week
 * @param {number} dayIndex - Day index (0-6, Sunday-Saturday)
 * @returns {string} Spanish day name
 */
export const getDayName = (dayIndex = new Date().getDay()) => {
    return DAY_NAMES[dayIndex];
};

/**
 * Get the mystery set name for a specific day
 * @param {number} dayIndex - Day index (0-6, Sunday-Saturday)
 * @returns {string} Mystery set name (e.g., 'Misterios Gozosos')
 */
export const getMysteryNameForDay = (dayIndex = new Date().getDay()) => {
    const mysteryId = DAYS_MAP[dayIndex];
    const mysterySet = mysteriesData.find(m => m.id === mysteryId);
    return mysterySet ? mysterySet.name : '';
};

/**
 * Get today's message for the Rosary
 * @returns {string} Formatted message (e.g., "Hoy es lunes: rezamos los Misterios Gozosos")
 */
export const getTodayMessage = () => {
    const dayName = getDayName();
    const mysteryName = getMysteryNameForDay();
    return `Hoy es ${dayName}: rezamos los ${mysteryName}`;
};
