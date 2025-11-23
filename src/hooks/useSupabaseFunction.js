
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
          const { data, error: invokeError } = await supabase.functions.invoke(fnName, {
            body, headers, signal: controllerRef.current.signal
          });
          
          if (invokeError) {
            const msg = await parseFnError(invokeError);
            setError(msg); 
            if(onError) onError(msg); 
            throw new Error(msg);
          }
          
          if (data && data.error) {
            const msg = data.error;
            setError(msg);
            if(onError) onError(msg);
            throw new Error(msg);
          }
          
          setData(data); 
          if(onSuccess) onSuccess(data); 
          return data;
          
        } catch (err) {
            // Error is already set and handled, re-throw to signal failure to caller
            throw err;
        }
        finally {
          clearTimeout(tid); 
          setLoading(false);
        }
      }, [fnName]);

      return { invoke, loading, error, data, cancel };
    }
