
export async function parseFnError(err) {
      if (!err) return 'Erro desconhecido';
      const ctx = err?.context;

      if (typeof ctx?.error === 'string') {
        try {
          const j = JSON.parse(ctx.error);
          return j.error || j.message || ctx.error;
        } catch {
          return ctx.error;
        }
      }

      const res = ctx?.response;
      if (res && typeof res.text === 'function') {
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          return j.error || j.message || text;
        } catch {
          return text || err?.message || 'Falha ao chamar a função';
        }
      }
      
      return err?.message || 'Falha ao chamar a função';
    }
