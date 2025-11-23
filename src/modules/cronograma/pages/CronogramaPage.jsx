// src/modules/cronograma/pages/CronogramaPage.jsx
import React, { useEffect, useState } from "react";
import {
  listarTarefas,
  removerTarefa,
  listarProjetos,
} from "../services/cronogramaService";
import NovaTarefaDialog from "../components/NovaTarefaDialog";

export default function CronogramaPage() {
  const [tarefas, setTarefas] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtros
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  async function carregar() {
    setLoading(true);
    try {
      const filters = {};
      if (filterProject) filters.projectId = filterProject;
      if (filterStatus) filters.status = filterStatus;

      const [tarefasData, projetosData] = await Promise.all([
        listarTarefas(filters),
        listarProjetos(),
      ]);

      setTarefas(tarefasData);
      setProjetos(projetosData);
    } catch (err) {
      console.error("Erro ao carregar cronograma:", err);
      alert("Erro ao carregar dados do cronograma");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id) {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;

    try {
      await removerTarefa(id);
      carregar();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir tarefa");
    }
  }

  function handleNova() {
    setDialogOpen(true);
  }

  function handleDialogClose(saved) {
    setDialogOpen(false);
    if (saved) carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  // Calcular estatísticas
  const stats = tarefas.reduce(
    (acc, item) => {
      acc.total++;
      switch (item.status) {
        case "pendente":
          acc.pendentes++;
          break;
        case "em_andamento":
          acc.emAndamento++;
          break;
        case "concluido":
          acc.concluidas++;
          break;
        case "atrasado":
          acc.atrasadas++;
          break;
      }
      return acc;
    },
    { total: 0, pendentes: 0, emAndamento: 0, concluidas: 0, atrasadas: 0 }
  );

  if (loading) {
    return (
      <div className="p-6 text-slate-600">Carregando cronograma...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Cronograma de Obras
        </h1>
        <button
          onClick={handleNova}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          + Nova Tarefa
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-700">{stats.total}</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Pendentes</p>
          <p className="text-2xl font-bold text-gray-600">{stats.pendentes}</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Concluídas</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.concluidas}</p>
        </div>

        <div className="p-4 border rounded-xl bg-white shadow-sm">
          <p className="text-xs text-slate-500 uppercase">Atrasadas</p>
          <p className="text-2xl font-bold text-red-600">{stats.atrasadas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 border rounded-xl bg-white shadow-sm">
        <div className="grid md:grid-cols-3 gap-3">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">Todos os projetos</option>
            {projetos.map((projeto) => (
              <option key={projeto.id} value={projeto.id}>
                {projeto.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="atrasado">Atrasado</option>
          </select>

          <button
            onClick={carregar}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded text-sm font-medium transition"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabela de Tarefas */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Projeto
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Tarefa
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Início
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">
                Fim
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                Progresso
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {tarefas.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">
                  {item.projeto?.name || "-"}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.titulo}</p>
                    {item.descricao && (
                      <p className="text-xs text-slate-500 mt-1">
                        {item.descricao.substring(0, 60)}
                        {item.descricao.length > 60 && "..."}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.status === "pendente" && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      Pendente
                    </span>
                  )}
                  {item.status === "em_andamento" && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      Em Andamento
                    </span>
                  )}
                  {item.status === "concluido" && (
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">
                      Concluído
                    </span>
                  )}
                  {item.status === "atrasado" && (
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                      Atrasado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.data_inicio
                    ? new Date(item.data_inicio).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.data_fim
                    ? new Date(item.data_fim).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${item.progresso || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {item.progresso || 0}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleExcluir(item.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}

            {!tarefas.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma tarefa encontrada.
                  <br />
                  <button
                    onClick={handleNova}
                    className="mt-2 text-slate-900 underline"
                  >
                    Criar primeira tarefa
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog de Nova Tarefa */}
      {dialogOpen && (
        <NovaTarefaDialog
          onClose={handleDialogClose}
          projetos={projetos}
        />
      )}
    </div>
  );
}
