import React, { createContext, useContext, useMemo } from 'react';

// Create a new context for authentication.
const AuthContext = createContext(undefined);

/**
 * A dummy AuthProvider that provides a consistent, non-functional authentication context.
 * This ensures that components using `useAuth` do not break, even without a real
 * authentication backend connected. It offers a stable API for a logged-out state.
 */
export const AuthProvider = ({ children }) => {
  // Memoize the context value to prevent unnecessary re-renders.
  // The provided values mimic a logged-out state.
  const value = useMemo(() => ({
    user: null, // No user is logged in.
    session: null, // No active session.
    loading: false, // Authentication is not in a loading state.
    // Provide dummy functions for compatibility. They do nothing.
    signUp: async () => ({ error: { message: "Not implemented" } }),
    signIn: async () => ({ error: { message: "Not implemented" } }),
    signOut: async () => ({ error: { message: "Not implemented" } }),
  }), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook to access the authentication context.
 * It ensures that it is used within an `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * A safe version of the `useAuth` hook that never throws an error.
 * If the context is missing, it returns a default (logged-out) state.
 * This is useful for components that might be rendered outside the AuthProvider
 * during testing or in storybooks.
 */
export const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    // In case of an error (e.g., context not found), return a safe, default value.
    return {
      user: null,
      session: null,
      loading: false,
      signUp: async () => ({ error: { message: "Context not available" } }),
      signIn: async () => ({ error: { message: "Context not available" } }),
      signOut: async () => ({ error: { message: "Context not available" } }),
    };
  }
};