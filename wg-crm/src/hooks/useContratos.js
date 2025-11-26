import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook personalizado para gerenciar contratos (project_contracts)
 * Integrado com Supabase e fluxo de aprovação
 */
export const useContratos = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  /**
   * Buscar todos os contratos
   */
  const fetchContratos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('project_contracts')
        .select(`
          *,
          cliente:entities!cliente_id (
            id,
            nome,
            tipo,
            avatar_url
          ),
          projeto:projects (
            id,
            codigo,
            titulo,
            status,
            progresso_percentual
          ),
          aprovador:profiles!aprovado_por (
            id,
            nome_completo
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setContratos(data || []);
      return data;
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar contratos',
        description: err.message,
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Criar novo contrato
   */
  const createContrato = useCallback(async (contratoData) => {
    try {
      setLoading(true);
      setError(null);

      // Obter empresa_id do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      const newContrato = {
        empresa_id: profile.empresa_id,
        ...contratoData,
        status: contratoData.status || 'em_negociacao',
        aprovado: false,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('project_contracts')
        .insert([newContrato])
        .select(`
          *,
          cliente:entities!cliente_id (
            id,
            nome,
            tipo,
            avatar_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      setContratos(prev => [data, ...prev]);

      toast({
        title: 'Contrato criado!',
        description: 'Novo contrato cadastrado com sucesso.',
      });

      return data;
    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      setError(err.message);
      toast({
        title: 'Erro ao criar contrato',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Atualizar contrato
   */
  const updateContrato = useCallback(async (id, contratoData) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('project_contracts')
        .update({
          ...contratoData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          cliente:entities!cliente_id (
            id,
            nome,
            tipo,
            avatar_url
          ),
          projeto:projects (
            id,
            codigo,
            titulo
          )
        `)
        .single();

      if (updateError) throw updateError;

      setContratos(prev =>
        prev.map(c => (c.id === id ? data : c))
      );

      toast({
        title: 'Contrato atualizado!',
        description: 'As alterações foram salvas.',
      });

      return data;
    } catch (err) {
      console.error('Erro ao atualizar contrato:', err);
      setError(err.message);
      toast({
        title: 'Erro ao atualizar contrato',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Aprovar contrato (chama função SQL que gera projeto e financeiro)
   */
  const aprovarContrato = useCallback(async (contratoId, gerarIntegracao = true) => {
    try {
      setLoading(true);
      setError(null);

      // Chamar função SQL de aprovação
      const { data, error: rpcError } = await supabase
        .rpc('api_aprovar_contrato', {
          p_contrato_id: contratoId,
          p_gerar_integracao: gerarIntegracao
        });

      if (rpcError) throw rpcError;

      // Atualizar lista local
      await fetchContratos();

      toast({
        title: 'Contrato aprovado!',
        description: gerarIntegracao
          ? 'Projeto e cobranças foram gerados automaticamente.'
          : 'Contrato aprovado com sucesso.',
      });

      return data;
    } catch (err) {
      console.error('Erro ao aprovar contrato:', err);
      setError(err.message);
      toast({
        title: 'Erro ao aprovar contrato',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos, toast]);

  /**
   * Rejeitar contrato
   */
  const rejeitarContrato = useCallback(async (contratoId, motivo) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('api_rejeitar_contrato', {
          p_contrato_id: contratoId,
          p_motivo: motivo
        });

      if (rpcError) throw rpcError;

      await fetchContratos();

      toast({
        title: 'Contrato rejeitado',
        description: 'O contrato foi cancelado.',
        variant: 'destructive'
      });

      return data;
    } catch (err) {
      console.error('Erro ao rejeitar contrato:', err);
      setError(err.message);
      toast({
        title: 'Erro ao rejeitar contrato',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContratos, toast]);

  /**
   * Deletar contrato
   */
  const deleteContrato = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setContratos(prev => prev.filter(c => c.id !== id));

      toast({
        title: 'Contrato excluído',
        description: 'O contrato foi removido do sistema.',
      });

      return true;
    } catch (err) {
      console.error('Erro ao deletar contrato:', err);
      setError(err.message);
      toast({
        title: 'Erro ao deletar contrato',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Buscar contratos de um cliente específico
   */
  const fetchContratosByCliente = useCallback(async (clienteId) => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contratos do cliente:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar contratos ao montar o componente
  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  return {
    contratos,
    loading,
    error,
    fetchContratos,
    createContrato,
    updateContrato,
    aprovarContrato,
    rejeitarContrato,
    deleteContrato,
    fetchContratosByCliente
  };
};
