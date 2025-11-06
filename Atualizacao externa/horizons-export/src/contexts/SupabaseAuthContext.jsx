import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const checkPermission = (profile, action, subject) => {
    if (!profile) return false;

    if (profile.master || profile.role === 'admin' || profile.role === 'gestor') {
        return true;
    }

    const permissions = {
        comercial: {
            entities: ['create', 'read', 'update'],
            propostas: ['create', 'read', 'update'],
            kanban_cards: ['create', 'read', 'update', 'delete'],
        },
        operacional: {
            assistencias: ['create', 'read', 'update'],
            purchase_orders: ['create', 'read', 'update'],
            kanban_cards: ['read', 'update'],
        },
        financeiro: {
            lancamentos: ['create', 'read', 'update', 'delete'],
        }
    };

    const userPermissions = permissions[profile.role] || {};
    const subjectPermissions = userPermissions[subject] || [];

    return subjectPermissions.includes(action);
};


export const Can = ({ I: action, a: subject, children }) => {
    const { profile } = useAuth();

    const canPerformAction = useMemo(() => 
        checkPermission(profile, action, subject),
    [profile, action, subject]);

    return canPerformAction ? <>{children}</> : null;
};


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
                .select('user_id, nome, role, empresa_id')
                .eq('user_id', userId)
                .single();

            // Handle case where profile doesn't exist, but don't throw an error for it.
            if (profileError && profileError.code !== 'PGRST116') {
                console.error("Error fetching user profile:", profileError);
                throw profileError;
            }
            
            setProfile(userProfile);

            // A "first login" is specifically when the profile is missing crucial info.
            const firstLoginCheck = !userProfile || !userProfile.nome || !userProfile.empresa_id;
            setIsFirstLogin(firstLoginCheck);

            if (userProfile?.empresa_id) {
                const { data: empresaData, error: empresaError } = await supabase
                    .from('empresas')
                    .select('id') // Just check for existence
                    .eq('id', userProfile.empresa_id)
                    .single();

                if (empresaError && empresaError.code !== 'PGRST116') {
                    throw empresaError;
                }
                
                // If empresa exists, we can assume org_id context is handled elsewhere or not needed immediately
                // For now, let's set the orgId from the profile if it exists
                const { data: orgData, error: orgError } = await supabase.from('empresas').select('org_id').eq('id', userProfile.empresa_id).single();
                if(orgData?.org_id) {
                    setOrgId(orgData.org_id);
                     if (currentSession?.access_token) {
                        await supabase.functions.setAuth(currentSession.access_token);
                    }
                } else if(orgError) {
                    console.error("Error fetching org_id:", orgError);
                }

            } else {
                setOrgId(null);
            }
        } catch (error) {
            console.error("Critical error in fetchProfileData:", error.message);
            // Reset state on critical error to prevent loops
            setProfile(null);
            setOrgId(null);
            setIsFirstLogin(false); // Assume not first login to avoid onboarding loop on error
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
                // Clear all state on sign out or if there's no session
                setProfile(null);
                setOrgId(null);
                setIsFirstLogin(false);
                setLoading(false);
                if (_event === 'SIGNED_OUT') {
                    navigate('/login');
                }
            }
        };
        
        // Check session on initial load
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthStateChange('INITIAL_SESSION', session);
        }).catch(err => {
            console.error("Error on initial getSession:", err);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfileData, navigate]);

    const signIn = async (email, password) => {
        setLoading(true);
        // Let onAuthStateChange handle the result of this
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setLoading(false);
        }
        return { data, error };
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