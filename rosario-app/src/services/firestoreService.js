import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'audios';

/**
 * Create a new audio document in Firestore
 * @param {Object} audioData - Audio metadata
 * @returns {Promise<string>} Document ID
 */
export const createAudio = async (audioData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...audioData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating audio document:', error);
        throw error;
    }
};

/**
 * Get all audio documents
 * @returns {Promise<Array>} Array of audio objects with IDs
 */
export const getAllAudios = async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting audios:', error);
        throw error;
    }
};

/**
 * Get audios filtered by type
 * @param {string} type - Audio type (prayer, rosary_set, background)
 * @returns {Promise<Array>}
 */
export const getAudiosByType = async (type) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('type', '==', type),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting audios by type:', error);
        throw error;
    }
};

/**
 * Get a specific audio by its ID field (not docId)
 * @param {string} audioId - The audio ID (e.g., 'ave_maria')
 * @returns {Promise<Object|null>}
 */
export const getAudioById = async (audioId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('id', '==', audioId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return null;

        const doc = querySnapshot.docs[0];
        return {
            docId: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error('Error getting audio by ID:', error);
        throw error;
    }
};

/**
 * Update an audio document
 * @param {string} docId - Firestore document ID
 * @param {Object} audioData - Updated audio data
 * @returns {Promise<void>}
 */
export const updateAudio = async (docId, audioData) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, docId);
        await updateDoc(docRef, {
            ...audioData,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('Error updating audio:', error);
        throw error;
    }
};

/**
 * Delete an audio document
 * @param {string} docId - Firestore document ID
 * @returns {Promise<void>}
 */
export const deleteAudio = async (docId) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, docId));
    } catch (error) {
        console.error('Error deleting audio:', error);
        throw error;
    }
};
