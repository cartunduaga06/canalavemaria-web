import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload audio file to Firebase Storage
 * @param {File} file - The audio file to upload
 * @param {string} type - Type of audio (prayer, rosary_set, background)
 * @param {string} id - Unique identifier for the audio
 * @param {function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<string>} Download URL of uploaded file
 */
export const uploadAudio = async (file, type, id, onProgress) => {
    if (!file) throw new Error('No file provided');

    // Validate file type
    if (!file.type.includes('audio/mpeg') && !file.name.endsWith('.mp3')) {
        throw new Error('File must be an MP3 audio file');
    }

    // Validate file size (20MB limit)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
        throw new Error('File size must be less than 20MB');
    }

    // Generate filename: type-id-timestamp.mp3
    const timestamp = Date.now();
    const filename = `${type}-${id}-${timestamp}.mp3`;
    const storagePath = `audios/${type}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // Progress callback
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(Math.round(progress));
                }
            },
            (error) => {
                // Error callback
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                // Success callback
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        url: downloadURL,
                        filename,
                        path: storagePath,
                        size: file.size
                    });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Delete audio file from Firebase Storage
 * @param {string} storagePath - Path to file in storage (e.g., "audios/prayer/...")
 * @returns {Promise<void>}
 */
export const deleteAudio = async (storagePath) => {
    if (!storagePath) throw new Error('No storage path provided');

    try {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file from storage:', error);
        throw error;
    }
};
