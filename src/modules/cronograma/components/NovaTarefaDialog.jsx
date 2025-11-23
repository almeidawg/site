// src/modules/cronograma/components/NovaTarefaDialog.jsx
import React, { useState } from "react";
import { criarTarefa, listarMembrosEquipe } from "../services/cronogramaService";

export default function NovaTarefaDialog({ onClose, projetos }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    status: "pendente",
    progresso: 0,
    projeto_id: "",
    responsavel: "",
    dependencia: "",
  });

  const [loading, setLoading] = useState(false);
  const [membros, setMembros] = useState([]);
  const [loadingMembros, setLoadingMembros] = useState(false);

  // Carregar membros quando o dialog abrir
  React.useEffect(() => {
    async function load() {
      setLoadingMembros(true);
      try {
        const data = await listarMembrosEquipe();
        setMembros(data);
      } catch (err) {
        console.error("Erro ao carregar membros:", err);
      } finally {
        setLoadingMembros(false);
      }
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      alert("Informe o título da tarefa");
      return;
    }

    if (!formData.data_inicio) {
      alert("Informe a data de início");
      return;
    }

    if (!formData.projeto_id) {
      alert("Selecione um projeto");
      return;
    }

    setLoading(true);
    try {
      await criarTarefa({
        ...formData,
        progresso: Number(formData.progresso),
        responsavel: formData.responsavel || null,
        dependencia: formData.dependencia || null,
        data_fim: formData.data_fim || null,
      });

      onClose(true);
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      alert("Erro ao criar tarefa. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Nova Tarefa do Cronograma
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Título da Tarefa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="Ex: Fundação, Alvenaria, Instalações..."
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="Descreva os detalhes da tarefa..."
              rows={3}
            />
          </div>

          {/* Projeto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Projeto/Obra <span className="text-red-500">*</span>
            </label>
            <select
              name="projeto_id"
              value={formData.projeto_id}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              required
            >
              <option value="">Selecione um projeto</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.name}
                </option>
              ))}
            </select>
          </div>

          {/* Datas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Fim (Prevista)
              </label>
              <input
                type="date"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          {/* Status e Progresso */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Progresso (%) - {formData.progresso}%
              </label>
              <input
                type="range"
                name="progresso"
                value={formData.progresso}
                onChange={handleChange}
                className="w-full"
                min="0"
                max="100"
                step="5"
              />
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Responsável
            </label>
            <select
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              disabled={loadingMembros}
            >
              <option value="">
                {loadingMembros ? "Carregando..." : "Nenhum responsável"}
              </option>
              {membros.map((membro) => (
                <option key={membro.id} value={membro.id}>
                  {membro.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dependência (opcional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Depende de outra tarefa? (ID)
            </label>
            <input
              type="text"
              name="dependencia"
              value={formData.dependencia}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="ID da tarefa (opcional)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Se esta tarefa depende de outra, informe o ID da tarefa anterior
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
