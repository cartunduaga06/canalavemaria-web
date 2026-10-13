import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, ADMIN_EMAILS } from '../config/firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google Popup (Restored)
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase no está configurado para este despliegue.');
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Check if email is in admin whitelist
 * @param {string} email 
 * @returns {boolean}
 */
export const isAdminEmail = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};
