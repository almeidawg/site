import { useCallback, useRef, useState } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { parseFnError } from '@/lib/parseFnError';

    export function useSupabaseFunction(fnName) {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [data, setData] = useState(null);
      const controllerRef = useRef(null);

      const cancel = useCallback(() => controllerRef.current?.abort(), []);

      const invoke = useCallback(async (opts = {}) => {
        setLoading(true); 
        setError(null);
        controllerRef.current = new AbortController();
        const { body, headers, timeoutMs = 30000, onSuccess, onError } = opts;
        const tid = setTimeout(() => controllerRef.current?.abort(), timeoutMs);

        try {
          const { data, error } = await supabase.functions.invoke(fnName, {
            body, headers, signal: controllerRef.current.signal
          });
          
          if (error) {
            const msg = await parseFnError(error);
            setError(msg); 
            if(onError) onError(msg); 
            throw new Error(msg);
          }
          
          if (!data || data?.ok === false) {
            const msg = data?.error || 'Erro desconhecido ao executar função';
            setError(msg); 
            if(onError) onError(msg); 
            throw new Error(msg);
          }
          
          setData(data); 
          if(onSuccess) onSuccess(data); 
          return data;
          
        } finally {
          clearTimeout(tid); 
          setLoading(false);
        }
      }, [fnName]);

      return { invoke, loading, error, data, cancel };
    }