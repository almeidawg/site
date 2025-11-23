import { supabase } from '@/lib/customSupabaseClient';

    export const isUUID = (v) =>
      !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    export async function resolveClienteId(idOrCodigo) {
      if (!idOrCodigo) throw new Error('ID ou código do cliente não fornecido.');
      if (isUUID(idOrCodigo)) return idOrCodigo;

      const { data, error } = await supabase
        .from('entities')
        .select('id')
        .eq('codigo', idOrCodigo)
        .limit(1)
        .maybeSingle();
      
      if (error || !data) {
        console.error('Erro ao resolver ID do cliente:', error);
        throw new Error('Cliente não encontrado pelo código fornecido.');
      }
      return data.id;
    }

    export async function resolvePropostaId(idOrCodigo) {
        if (!idOrCodigo) throw new Error('ID ou código da proposta não fornecido.');
        if (isUUID(idOrCodigo)) return idOrCodigo;

        const { data, error } = await supabase
            .from('propostas')
            .select('id')
            .eq('codigo', idOrCodigo)
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            console.error('Erro ao resolver ID da proposta:', error);
            throw new Error('Proposta não encontrada pelo código fornecido.');
        }
        return data.id;
    }

    export async function resolveContratoId(idOrCodigo) {
        if (!idOrCodigo) throw new Error('ID ou código do contrato não fornecido.');
        if (isUUID(idOrCodigo)) return idOrCodigo;

        const { data, error } = await supabase
            .from('contratos')
            .select('id')
            .eq('codigo', idOrCodigo)
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            console.error('Erro ao resolver ID do contrato:', error);
            throw new Error('Contrato não encontrado pelo código fornecido.');
        }
        return data.id;
    }