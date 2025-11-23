import { useEffect, useState, useCallback } from "react";
import { kanbanService } from "../services/kanbanService";

export function useKanban() {
  const [status, setStatus] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [s, l] = await Promise.all([
        kanbanService.listarStatus(),
        kanbanService.listarLeads(),
      ]);

      if (s.error) throw s.error;
      if (l.error) throw l.error;

      setStatus(s.data || []);
      setLeads(l.data || []);
    } catch (err) {
      console.error("Erro ao carregar Kanban de leads:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const mover = useCallback(
    async (id, novoStatus) => {
      try {
        const { error } = await kanbanService.moverLead(id, novoStatus);
        if (error) throw error;
        await carregar();
      } catch (err) {
        console.error("Erro ao mover lead:", err);
        setError(err);
      }
    },
    [carregar]
  );

  const criarLead = useCallback(
    async (payload) => {
      try {
        const { error } = await kanbanService.criarLead(payload);
        if (error) throw error;
        await carregar();
      } catch (err) {
        console.error("Erro ao criar lead:", err);
        setError(err);
        throw err; // se o form quiser tratar
      }
    },
    [carregar]
  );

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    status,
    leads,
    loading,
    error,
    mover,
    criarLead,
    recarregar: carregar,
  };
}
