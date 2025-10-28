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
        const [loading, setLoading] = useState(true);
        const [isFirstLogin, setIsFirstLogin] = useState(null);
        const navigate = useNavigate();

        useEffect(() => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    const { data: userProfile, error } = await supabase
                        .from('user_profiles')
                        .select('*, empresa:empresas(id, razao_social)')
                        .eq('user_id', session.user.id)
                        .single();
                    
                    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is ok.
                        console.error("Error fetching profile:", error);
                    }
                    
                    setProfile(userProfile || null);
                    
                    const firstLoginCheck = !userProfile || !userProfile.nome || !userProfile.empresa_id;
                    setIsFirstLogin(firstLoginCheck);

                } else {
                    setProfile(null);
                    setIsFirstLogin(false);
                }
                setLoading(false);
            });
    
            return () => {
                subscription.unsubscribe();
            };
        }, []);

        const signIn = async (email, password) => {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            setLoading(false);
            return { data, error };
        };

        const signOut = async () => {
            setLoading(true);
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsFirstLogin(false);
            setLoading(false);
            navigate('/login'); 
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
            if (!user) return;
            const { data: userProfile, error } = await supabase
                .from('user_profiles')
                .select('*, empresa:empresas(id, razao_social)')
                .eq('user_id', user.id)
                .single();

            if (error) console.error("Error refreshing profile:", error);
            setProfile(userProfile || null);
            const firstLoginCheck = !userProfile || !userProfile.nome || !userProfile.empresa_id;
            setIsFirstLogin(firstLoginCheck);
        }, [user]);


        const value = {
            session,
            user,
            profile,
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