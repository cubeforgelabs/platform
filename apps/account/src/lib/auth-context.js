import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    async function loadProfile(userId) {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setProfile(data);
    }
    async function refreshProfile() {
        if (session?.user)
            await loadProfile(session.user.id);
    }
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            if (data.session?.user)
                loadProfile(data.session.user.id).finally(() => setLoading(false));
            else
                setLoading(false);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            if (s?.user)
                loadProfile(s.user.id);
            else
                setProfile(null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);
    async function signOut() {
        await supabase.auth.signOut();
    }
    return (_jsx(AuthContext.Provider, { value: { session, user: session?.user ?? null, profile, loading, signOut, refreshProfile }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
