import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useEntities = () => {
    const [loading, setLoading] = useState(false);

    const getEntities = useCallback(async () => {
        console.log("Fetching all entities...");
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('entities')
                .select('*')
                .eq('tipo', 'cliente')
                .order('nome_razao_social', { ascending: true });

            if (error) throw error;
            
            console.log("Entities fetched successfully:", data);
            return data || [];
        } catch (error) {
            console.error("Error fetching entities:", error.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getEntityById = useCallback(async (id) => {
        if (!id) {
            console.error("getEntityById: ID is required.");
            return null;
        }
        console.log(`Fetching entity with ID: ${id}`);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('entities')
                .select('id, nome_razao_social, endereco')
                .eq('id', id)
                .single();

            if (error) throw error;

            console.log("Entity fetched by ID successfully:", data);
            return data;
        } catch (error) {
            console.error(`Error fetching entity with ID ${id}:`, error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, getEntities, getEntityById };
};