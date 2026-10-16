import {
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    updateDoc,
    increment,
    runTransaction,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const INTENTIONS_COLLECTION = 'intentions';
const PRAYERS_COLLECTION = 'prayer_actions';

/**
 * Create a new intention
 */
export const createIntention = async (userId, intentionData) => {
    try {
        const docRef = await addDoc(collection(db, INTENTIONS_COLLECTION), {
            userId,
            ...intentionData,
            prayersCount: 0,
            status: 'ACTIVE',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating intention:', error);
        throw error;
    }
};

/**
 * Get active intentions ordered by date
 */
export const getIntentions = async (limitCount = 20) => {
    try {
        const q = query(
            collection(db, INTENTIONS_COLLECTION),
            where('status', '==', 'ACTIVE'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting intentions:', error);
        throw error;
    }
};

/**
 * Get user's own intentions
 */
export const getUserIntentions = async (userId) => {
    try {
        const q = query(
            collection(db, INTENTIONS_COLLECTION),
            where('userId', '==', userId),
            where('status', 'in', ['ACTIVE', 'HIDDEN']), // Show active and hidden
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting user intentions:', error);
        return [];
    }
};

/**
 * Delete (soft delete) intention
 */
export const deleteIntention = async (intentionId, userId) => {
    try {
        // First verify ownership or admin (simplified for MVP)
        const intentionRef = doc(db, INTENTIONS_COLLECTION, intentionId);
        await updateDoc(intentionRef, { status: 'DELETED' });
    } catch (error) {
        console.error('Error deleting intention:', error);
        throw error;
    }
};

/**
 * Register a "Prayed" action
 * Uses transaction to ensure counter accuracy and prevent duplicate prayers from same user
 */
export const prayForIntention = async (intentionId, userId) => {
    try {
        await runTransaction(db, async (transaction) => {
            // Check if user already prayed for this specific intention?
            // For MVP simplicity, we might just increment, but let's be cleaner.
            // Check 'prayer_actions' collection logic: ID = intentionId_userId
            const actionId = `${intentionId}_${userId}`;
            const actionRef = doc(db, PRAYERS_COLLECTION, actionId);
            const actionDoc = await transaction.get(actionRef);

            if (!actionDoc.exists()) {
                // Register action
                transaction.set(actionRef, {
                    intentionId,
                    userId,
                    timestamp: Timestamp.now()
                });

                // Increment counter
                const intentionRef = doc(db, INTENTIONS_COLLECTION, intentionId);
                transaction.update(intentionRef, {
                    prayersCount: increment(1)
                });
            } else {
                // User already prayed, maybe do nothing or toggle off?
                // MVP: Do nothing or return message
                throw new Error("Ya rezaste por esta intención");
            }
        });
    } catch (error) {
        console.error('Error praying for intention:', error);
        throw error;
    }
};
