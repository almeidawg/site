import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Hook para gerenciar dados do Gráfico de Gantt
 * @param {string} projectId - ID do projeto
 * @returns {Object} - Tasks, comentários, loading, e funções de controle
 */
export const useGantt = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar tarefas do projeto
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          responsavel:responsavel_id (
            id,
            nome,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('ordem_exibicao', { ascending: true })
        .order('data_inicio', { ascending: true });

      if (fetchError) throw fetchError;

      setTasks(data || []);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Buscar comentários das tarefas
  const fetchComments = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('vw_task_comments_detailed')
        .select('*')
        .eq('project_id', projectId)
        .order('data_comentario', { ascending: true });

      if (fetchError) throw fetchError;

      setComments(data || []);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
    }
  }, [projectId]);

  // Buscar categorias disponíveis
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categorias_tarefa')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }, []);

  // Criar nova tarefa
  const createTask = useCallback(async (taskData) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          ...taskData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTasks();
      return data;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      throw err;
    }
  }, [projectId, fetchTasks]);

  // Atualizar tarefa
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

      return data;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      throw err;
    }
  }, []);

  // Deletar tarefa
  const deleteTask = useCallback(async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err);
      throw err;
    }
  }, []);

  // Adicionar comentário
  const addComment = useCallback(async (commentData) => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          project_id: projectId,
          author_id: (await supabase.auth.getUser()).data.user.id,
          ...commentData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchComments();
      return data;
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
      throw err;
    }
  }, [projectId, fetchComments]);

  // Atualizar progresso da tarefa
  const updateProgress = useCallback(async (taskId, progress) => {
    try {
      await updateTask(taskId, { progresso_percentual: progress });
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      throw err;
    }
  }, [updateTask]);

  // Atualizar datas da tarefa (drag no Gantt)
  const updateDates = useCallback(async (taskId, startDate, endDate) => {
    try {
      await updateTask(taskId, {
        data_inicio: startDate,
        data_fim: endDate
      });
    } catch (err) {
      console.error('Erro ao atualizar datas:', err);
      throw err;
    }
  }, [updateTask]);

  // Converter tarefas para formato Frappe Gantt
  const toGanttFormat = useCallback(() => {
    return tasks.map(task => ({
      id: task.id,
      name: task.titulo,
      start: task.data_inicio || new Date().toISOString().split('T')[0],
      end: task.data_fim || new Date().toISOString().split('T')[0],
      progress: task.progresso_percentual || 0,
      dependencies: task.dependencias?.join(',') || '',
      custom_class: task.categoria ? `gantt-${task.categoria.toLowerCase().replace(/\s/g, '-')}` : '',
      category: task.categoria,
      color: task.cor_categoria,
      description: task.descricao,
      status: task.status,
      responsavel: task.responsavel?.nome
    }));
  }, [tasks]);

  // Buscar dados ao montar
  useEffect(() => {
    if (projectId) {
      fetchTasks();
      fetchComments();
      fetchCategories();
    }
  }, [projectId, fetchTasks, fetchComments, fetchCategories]);

  // Estatísticas
  const stats = {
    total: tasks.length,
    concluidas: tasks.filter(t => t.status === 'concluida').length,
    emAndamento: tasks.filter(t => t.status === 'em_andamento').length,
    atrasadas: tasks.filter(t => {
      if (!t.data_fim || t.status === 'concluida') return false;
      return new Date(t.data_fim) < new Date();
    }).length,
    progressoMedio: tasks.length > 0
      ? tasks.reduce((sum, t) => sum + (t.progresso_percentual || 0), 0) / tasks.length
      : 0
  };

  return {
    tasks,
    comments,
    categories,
    loading,
    error,
    stats,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    updateProgress,
    updateDates,
    toGanttFormat,
    refetch: fetchTasks,
    refetchComments: fetchComments
  };
};
