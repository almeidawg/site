// src/services/cronogramaService.js

export async function criarCronogramaAPartirDoStorage(projetoId, valorTotalContrato) {
  try {
    const modelo = await carregarModeloDoStorage();

    // 1. Criar cronograma base já com valor_total_contrato
    const { data: cronogramaBase, error: erroBase } = await supabase
      .from("cronograma_projetos")
      .insert({
        projeto_id: projetoId,
        status: "em_andamento",
        percentual_execucao: 0,
        valor_total_contrato: valorTotalContrato ?? null
      })
      .select()
      .single();

    if (erroBase) throw erroBase;

    const cronogramaId = cronogramaBase.id;

    // 2. Etapas – agora preenchendo peso_financeiro
    const etapasModelo = modelo.etapas || [];

    const etapasParaInserir = etapasModelo.map((etapa) => ({
      cronograma_id: cronogramaId,
      etapa_codigo: etapa.etapa_codigo,
      slug: etapa.slug,
      nome: etapa.nome,
      descricao: etapa.descricao,
      macrocelula: etapa.macrocelula_id,
      ordem: etapa.ordem,
      duracao_prevista_dias: etapa.duracao_padrao_dias,
      peso: etapa.peso_progresso,
      peso_financeiro: etapa.peso_progresso, // financeiro = progresso por padrão
      dependencias: etapa.dependencias || [],
      status: "nao_iniciada"
    }));

    const { error: erroEtapas } = await supabase
      .from("cronograma_etapas")
      .insert(etapasParaInserir);

    if (erroEtapas) throw erroEtapas;

    // 3. Recalcular valores financeiros (chamando a function SQL)
    if (valorTotalContrato) {
      await supabase.rpc("recalcular_valores_etapas", {
        p_cronograma_id: cronogramaId
      });
    }

    return { sucesso: true, cronogramaId };
  } catch (err) {
    console.error("Erro ao criar cronograma a partir do Storage:", err);
    return { sucesso: false, erro: err.message };
  }
}
