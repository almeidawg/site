
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createMongoAbility, AbilityBuilder } from '@casl/ability';
import { useAuth } from './SupabaseAuthContext';

export const AbilityContext = createContext(undefined);

export const Can = ({ children, I, a, field }) => {
    const ability = useContext(AbilityContext);
    if (!ability) return null;

    const isAllowed = field ? ability.can(I, a, field) : ability.can(I, a);
    
    return isAllowed ? children : null;
};

const guestAbility = createMongoAbility([]);

export const AbilityProvider = ({ children }) => {
    const { profile, loading } = useAuth();
    const [ability, setAbility] = useState(guestAbility);
    
    useEffect(() => {
        if (!loading && profile) {
            const { can, build } = new AbilityBuilder(createMongoAbility);

            const role = profile.role || 'guest';
            
            if (role === 'admin' || profile.master) {
                can('manage', 'all'); 
            } else {
                can('read', 'all');

                if (role === 'gestor') {
                    can('manage', 'assistencia');
                    can('manage', 'oportunidades');
                    can('manage', 'configuracoes');
                }

                if (role === 'comercial') {
                    can('manage', 'oportunidades');
                    can('manage', 'propostas');
                    can('manage', 'pessoas');
                }
                
                if (role === 'financeiro') {
                    can('manage', 'financeiro');
                }
            }
            
            setAbility(build());
        } else if (!loading && !profile) {
            setAbility(guestAbility);
        }
    }, [profile, loading]);
    
    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
};
