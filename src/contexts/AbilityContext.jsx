
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createMongoAbility, AbilityBuilder } from '@casl/ability';
import { useAuth } from './SupabaseAuthContext';

// 1. Create Ability context
export const AbilityContext = createContext(undefined);

// 2. Create CASL `Can` component
export const Can = ({ children, I, a, field }) => {
    const ability = useContext(AbilityContext);

    const isAllowed = field ? ability.can(I, a, field) : ability.can(I, a);
    
    return isAllowed ? children : null;
};


// Define a default ability for guests (no permissions)
const guestAbility = createMongoAbility([]);

// 3. Create Ability provider
export const AbilityProvider = ({ children }) => {
    const { profile, loading } = useAuth();
    const [ability, setAbility] = useState(guestAbility);
    
    useEffect(() => {
        if (!loading && profile) {
            const { can, build } = new AbilityBuilder(createMongoAbility);

            // Define rules based on user role
            const role = profile.role || 'guest';
            
            if (role === 'admin' || profile.master) {
                can('manage', 'all'); // Admin can do anything
            } else {
                // General authenticated user permissions
                can('read', 'all');

                // Specific permissions for roles
                if (role === 'gestor') {
                    can('manage', 'assistencia');
                    can('manage', 'oportunidades');
                }

                if (role === 'comercial') {
                    can('create', 'oportunidades');
                    can('update', 'oportunidades');
                }
                
                // Example: Only admins can delete
                can('delete', 'assistencia', { role: 'admin' });
            }
            
            setAbility(build());
        } else if (!loading && !profile) {
            setAbility(guestAbility); // Reset to guest if logged out
        }
    }, [profile, loading]);
    
    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
};
