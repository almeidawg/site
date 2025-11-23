// src/modules/cronograma/services/cronogramaService.js
import { supabase } from "../../../config/supabaseClient";

/**
 * Service de Cronograma - WGEasy
 * Tabela principal: cronograma_tarefas
 * Relacionamentos: projects, team_members
 */

/**
 * Lista todas as tarefas do cronograma com filtros opcionais
 * @param {Object} filters - Filtros opcionais
 * @param {string} filters.projectId - ID do projeto
 * @param {string} filters.status - Status da tarefa
 * @param {string} filters.responsavel - ID do responsável
 * @returns {Promise<Array>}
 */
export async function listarTarefas(filters = {}) {
  try {
    let query = supabase
      .from("cronograma_tarefas")
      .select(`
        *,
        projeto:projeto_id(id, name),
        responsavel_info:responsavel(id, name)
      `)
      .order("data_inicio", { ascending: true });

    // Filtro por projeto
    if (filters.projectId) {
      query = query.eq("projeto_id", filters.projectId);
    }

    // Filtro por status
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // Filtro por responsável
    if (filters.responsavel) {
      query = query.eq("responsavel", filters.responsavel);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[cronogramaService] Erro ao listar tarefas:", err);
    throw err;
  }
}

/**
 * Busca uma tarefa específica por ID
 * @param {string} id - ID da tarefa
 * @returns {Promise<Object|null>}
 */
export async function buscarTarefaPorId(id) {
  try {
    const { data, error } = await supabase
      .from("cronograma_tarefas")
      .select(`
        *,
        projeto:projeto_id(id, name),
        responsavel_info:responsavel(id, name)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[cronogramaService] Erro ao buscar tarefa:", err);
    throw err;
  }
}

/**
 * Cria uma nova tarefa no cronograma
 * @param {Object} tarefa - Dados da tarefa
 * @param {string} tarefa.titulo - Título da tarefa
 * @param {string} tarefa.descricao - Descrição
 * @param {string} tarefa.data_inicio - Data de início (ISO)
 * @param {string} tarefa.data_fim - Data de fim (ISO)
 * @param {string} tarefa.status - Status ('pendente', 'em_andamento', 'concluido', 'atrasado')
 * @param {number} tarefa.progresso - Progresso (0-100)
 * @param {string} tarefa.projeto_id - ID do projeto
 * @param {string} tarefa.responsavel - ID do responsável (opcional)
 * @param {string} tarefa.dependencia - ID da tarefa dependente (opcional)
 * @returns {Promise<Object>}
 */
export async function criarTarefa(tarefa) {
  try {
    const payload = {
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || "",
      data_inicio: tarefa.data_inicio,
      data_fim: tarefa.data_fim || null,
      status: tarefa.status || "pendente",
      progresso: Number(tarefa.progresso) || 0,
      projeto_id: tarefa.projeto_id,
      responsavel: tarefa.responsavel || null,
      dependencia: tarefa.dependencia || null,
    };

    const { data, error } = await supabase
      .from("cronograma_tarefas")
      .insert(payload)
      .select(`
        *,
        projeto:projeto_id(id, name),
        responsavel_info:responsavel(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[cronogramaService] Erro ao criar tarefa:", err);
    throw err;
  }
}

/**
 * Atualiza uma tarefa existente
 * @param {string} id - ID da tarefa
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>}
 */
export async function atualizarTarefa(id, updates) {
  try {
    const payload = {};

    if (updates.titulo !== undefined) payload.titulo = updates.titulo;
    if (updates.descricao !== undefined) payload.descricao = updates.descricao;
    if (updates.data_inicio !== undefined) payload.data_inicio = updates.data_inicio;
    if (updates.data_fim !== undefined) payload.data_fim = updates.data_fim;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.progresso !== undefined) payload.progresso = Number(updates.progresso);
    if (updates.projeto_id !== undefined) payload.projeto_id = updates.projeto_id;
    if (updates.responsavel !== undefined) payload.responsavel = updates.responsavel;
    if (updates.dependencia !== undefined) payload.dependencia = updates.dependencia;

    const { data, error } = await supabase
      .from("cronograma_tarefas")
      .update(payload)
      .eq("id", id)
      .select(`
        *,
        projeto:projeto_id(id, name),
        responsavel_info:responsavel(id, name)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("[cronogramaService] Erro ao atualizar tarefa:", err);
    throw err;
  }
}

/**
 * Remove uma tarefa
 * @param {string} id - ID da tarefa
 * @returns {Promise<boolean>}
 */
export async function removerTarefa(id) {
  try {
    const { error } = await supabase
      .from("cronograma_tarefas")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("[cronogramaService] Erro ao remover tarefa:", err);
    throw err;
  }
}

/**
 * Lista todos os projetos para seleção
 * @returns {Promise<Array>}
 */
export async function listarProjetos() {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[cronogramaService] Erro ao listar projetos:", err);
    throw err;
  }
}

/**
 * Lista membros da equipe para seleção
 * @returns {Promise<Array>}
 */
export async function listarMembrosEquipe() {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[cronogramaService] Erro ao listar membros:", err);
    throw err;
  }
}

/**
 * Calcula estatísticas do cronograma por projeto
 * @param {string} projectId - ID do projeto
 * @returns {Promise<Object>}
 */
export async function getEstatisticasPorProjeto(projectId) {
  try {
    const { data, error } = await supabase
      .from("cronograma_tarefas")
      .select("status, progresso")
      .eq("projeto_id", projectId);

    if (error) throw error;

    const stats = {
      total: data.length,
      pendentes: 0,
      emAndamento: 0,
      concluidas: 0,
      atrasadas: 0,
      progressoMedio: 0,
    };

    let somaProgresso = 0;

    (data || []).forEach((item) => {
      somaProgresso += Number(item.progresso) || 0;

      switch (item.status) {
        case "pendente":
          stats.pendentes++;
          break;
        case "em_andamento":
          stats.emAndamento++;
          break;
        case "concluido":
          stats.concluidas++;
          break;
        case "atrasado":
          stats.atrasadas++;
          break;
      }
    });

    stats.progressoMedio = stats.total > 0 ? Math.round(somaProgresso / stats.total) : 0;

    return stats;
  } catch (err) {
    console.error("[cronogramaService] Erro ao calcular estatísticas:", err);
    throw err;
  }
}

export const cronogramaService = {
  listarTarefas,
  buscarTarefaPorId,
  criarTarefa,
  atualizarTarefa,
  removerTarefa,
  listarProjetos,
  listarMembrosEquipe,
  getEstatisticasPorProjeto,
};

export default cronogramaService;
