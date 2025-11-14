
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [orgId, setOrgId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const navigate = useNavigate();

    const fetchProfileData = useCallback(async (userId, currentSession) => {
        try {
            const { data: userProfile, error: profileError } = await supabase
                .from('usuarios_perfis')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error("Error fetching user profile:", profileError);
                throw profileError;
            }
            
            setProfile(userProfile);
            setOrgId(userProfile?.org_id || null);

            const firstLoginCheck = !userProfile || !userProfile.nome || !userProfile.empresa_id;
            setIsFirstLogin(firstLoginCheck);

            if (userProfile?.org_id && currentSession?.access_token) {
                // Not strictly necessary for most queries due to RLS, but good for functions
                await supabase.functions.setAuth(currentSession.access_token);
            }

        } catch (error) {
            console.error("Critical error in fetchProfileData:", error.message);
            setProfile(null);
            setOrgId(null);
            setIsFirstLogin(false);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        const handleAuthStateChange = async (_event, newSession) => {
            setLoading(true);
            setSession(newSession);
            const currentUser = newSession?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfileData(currentUser.id, newSession);
            } else {
                setProfile(null);
                setOrgId(null);
                setIsFirstLogin(false);
                setLoading(false);
                if (_event === 'SIGNED_OUT') {
                    navigate('/login', { replace: true });
                }
            }
        };
        
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            handleAuthStateChange('INITIAL_SESSION', initialSession);
        }).catch(err => {
            console.error("Error on initial getSession:", err);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfileData, navigate]);

    const signIn = async (email, password) => {
        setLoading(true);
        // onAuthStateChange will handle the result
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setLoading(false); // only stop loading on error
            return { error };
        }
        // On success, loading will be set to false inside onAuthStateChange
        return {};
    };



    const signOut = async () => {
        await supabase.auth.signOut();
    };
    
    const hasRole = useCallback((role) => {
        if (!profile) return false;
        if (profile.master) return true;
        if (Array.isArray(role)) {
            return role.includes(profile.role);
        }
        return profile.role === role;
    }, [profile]);
    
    const refreshProfile = useCallback(async () => {
        if (!user || !session) return;
        setLoading(true);
        await fetchProfileData(user.id, session);
    }, [user, session, fetchProfileData]);


    const value = {
        session,
        user,
        profile,
        orgId,
        loading,
        isFirstLogin,
        signIn,
        signOut,
        hasRole,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
