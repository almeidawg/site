export async function callFn(path, payload, session) {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const res = await fetch(`${base}/functions/v1/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apikey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorBody.error || `${path}: ${res.status} ${res.statusText}`);
      }

      return res.json();
    }