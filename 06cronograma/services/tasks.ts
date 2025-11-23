import { supabase } from "@/lib/customSupabaseClient";

export type KanbanStatus = "pendente" | "em_execucao" | "concluida" | "bloqueada";

export interface Task {
  id: string;
  project_id: string;
  titulo: string;
  descricao: string | null;
  status: KanbanStatus;
  ordem: number | null;
  empresa_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

export async function fetchKanbanTasks(projectId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      id,
      project_id,
      titulo,
      descricao,
      status,
      ordem,
      empresa_id,
      criado_em,
      atualizado_em
    `)
    .eq("project_id", projectId)
    .order("status", { ascending: true })
    .order("ordem", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function updateTaskStatusAndOrder(
  taskId: string,
  status: KanbanStatus,
  ordem: number
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      ordem,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(input: {
  project_id: string;
  titulo: string;
  descricao?: string;
  status?: KanbanStatus;
}) {
  const { project_id, titulo, descricao, status = "pendente" } = input;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id,
      titulo,
      descricao: descricao ?? null,
      status,
      ordem: 999,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}
