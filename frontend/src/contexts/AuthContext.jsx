import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    /**
     * Returns headers object with Authorization Bearer token if the user is logged in.
     * Pass into fetch calls: fetch(url, { headers: getAuthHeaders() })
     */
    const getAuthHeaders = () => {
        const token = session?.access_token;
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, getAuthHeaders, signOut: () => supabase.auth.signOut() }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
