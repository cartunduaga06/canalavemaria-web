import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { signInWithGoogle as googleSignIn, signOut as authSignOut, isAdminEmail } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return undefined;
        }
        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("Auth state changed:", firebaseUser?.email);
            setUser(firebaseUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            setLoading(true);
            await googleSignIn();
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await authSignOut();
        } catch (error) {
            setError(error.message);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        error,
        isAdmin: user ? isAdminEmail(user.email) : false,
        signInWithGoogle,
        signOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
