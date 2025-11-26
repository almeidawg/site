import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook para gerenciar alertas de pagamento
 * @returns {Object} - Alertas, loading, e funções de controle
 */
export const useAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  // Buscar alertas pendentes
  const fetchAlertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('api_get_alertas_pendentes');

      if (rpcError) {
        throw rpcError;
      }

      setAlertas(data || []);

      // Mostrar popup se houver alertas
      if (data && data.length > 0) {
        setMostrarPopup(true);
      }
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar alerta como lido
  const marcarComoLido = useCallback(async (alertaId) => {
    try {
      const { error } = await supabase
        .from('alertas_pagamento')
        .update({
          status: 'lido',
          lido_em: new Date().toISOString()
        })
        .eq('id', alertaId);

      if (error) throw error;

      // Remover alerta da lista
      setAlertas(prev => prev.filter(a => a.alerta_id !== alertaId));
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
      throw err;
    }
  }, []);

  // Ignorar alerta
  const ignorarAlerta = useCallback(async (alertaId) => {
    try {
      const { error } = await supabase
        .from('alertas_pagamento')
        .update({ status: 'ignorado' })
        .eq('id', alertaId);

      if (error) throw error;

      // Remover alerta da lista
      setAlertas(prev => prev.filter(a => a.alerta_id !== alertaId));
    } catch (err) {
      console.error('Erro ao ignorar alerta:', err);
      throw err;
    }
  }, []);

  // Marcar todos como lidos
  const marcarTodosComoLidos = useCallback(async () => {
    try {
      const alertaIds = alertas.map(a => a.alerta_id);

      const { error } = await supabase
        .from('alertas_pagamento')
        .update({
          status: 'lido',
          lido_em: new Date().toISOString()
        })
        .in('id', alertaIds);

      if (error) throw error;

      setAlertas([]);
      setMostrarPopup(false);
    } catch (err) {
      console.error('Erro ao marcar todos como lidos:', err);
      throw err;
    }
  }, [alertas]);

  // Gerar novos alertas (executar periodicamente)
  const gerarAlertas = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('api_gerar_alertas_pagamento');

      if (error) throw error;

      console.log('Alertas gerados:', data);

      // Buscar alertas atualizados
      await fetchAlertas();

      return data;
    } catch (err) {
      console.error('Erro ao gerar alertas:', err);
      throw err;
    }
  }, [fetchAlertas]);

  // Buscar alertas ao montar componente
  useEffect(() => {
    fetchAlertas();

    // Atualizar alertas a cada 5 minutos
    const interval = setInterval(fetchAlertas, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAlertas]);

  // Estatísticas dos alertas
  const stats = {
    total: alertas.length,
    vencidos: alertas.filter(a => a.urgencia === 'VENCIDO').length,
    urgentes: alertas.filter(a => ['VENCE HOJE', 'VENCE AMANHÃ', 'URGENTE'].includes(a.urgencia)).length,
    normais: alertas.filter(a => a.urgencia === 'NORMAL').length,
    valorTotal: alertas.reduce((sum, a) => sum + (parseFloat(a.valor) || 0), 0)
  };

  return {
    alertas,
    loading,
    error,
    mostrarPopup,
    setMostrarPopup,
    stats,
    marcarComoLido,
    ignorarAlerta,
    marcarTodosComoLidos,
    gerarAlertas,
    refetch: fetchAlertas
  };
};
