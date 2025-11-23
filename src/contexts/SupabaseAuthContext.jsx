
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndOrg = async (user) => {
    if (!user) {
      setProfile(null);
      setOrgId(null);
      return;
    }
    
    const [profileRes, orgRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('usuarios_perfis').select('org_id').eq('user_id', user.id).maybeSingle()
    ]);
    
    if (profileRes.error && profileRes.error.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileRes.error.message);
    }
    setProfile(profileRes.data);

    if (orgRes.error && orgRes.error.code !== 'PGRST116') {
      console.error('Error fetching org:', orgRes.error.message);
    }
    setOrgId(orgRes.data?.org_id || null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
      }
      setSession(currentSession);
      await fetchProfileAndOrg(currentSession?.user);
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setLoading(true);
      setSession(newSession);
      await fetchProfileAndOrg(newSession?.user);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user,
    profile,
    orgId,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, userData) => supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: userData } 
    }),
    signOut: () => supabase.auth.signOut(),
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
