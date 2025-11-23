import { supabase } from "../../config/supabaseClient";

// Config padrão do modelo no Storage
const BUCKET_NAME = "wgeasy-models";
const MODELO_PATH = "cronogramas/cronograma_modelo_turnkey_wg_premium.json";

/**
 * Baixa e parseia o JSON do Storage
 */
async function carregarModeloDoStorage() {
  // 1. Download do arquivo
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .download(MODELO_PATH);

  if (error) {
    console.error("Erro ao baixar modelo de cronograma do Storage:", error);
    throw new Error("Não foi possível carregar o modelo de cronograma.");
  }

  // 2. Converter Blob -> texto -> JSON
  try {
    const texto = await data.text();
    const json = JSON.parse(texto);
    return json;
  } catch (err) {
    console.error("Erro ao converter JSON do cronograma:", err);
    throw new Error("Modelo de cronograma inválido ou corrompido.");
  }
}

/**
 * Cria um cronograma completo a partir do modelo do Storage
 * @param {string} projetoId - ID da obra/projeto no banco
 */
export async function criarCronogramaAPartirDoStorage(projetoId) {
  try {
    // 1. Carregar modelo
    const modelo = await carregarModeloDoStorage();

    // 2. Criar o cronograma base
    const { data: cronogramaBase, error: erroBase } = await supabase
      .from("cronograma_projetos")
      .insert({
        projeto_id: projetoId,
        status: "em_andamento",
        percentual_execucao: 0
      })
      .select()
      .single();

    if (erroBase) {
      console.error("Erro ao criar cronograma_projetos:", erroBase);
      throw new Error("Não foi possível criar o cronograma base.");
    }

    const cronogramaId = cronogramaBase.id;

    // 3. Montar array de etapas a partir do JSON
    const etapasModelo = modelo.etapas || [];

    const etapasParaInserir = etapasModelo.map((etapa) => ({
      cronograma_id: cronogramaId,
      etapa_codigo: etapa.etapa_codigo,
      slug: etapa.slug,
      nome: etapa.nome,
      descricao: etapa.descricao,
      macrocelula: etapa.macrocelula_id,           // ARQ / ENG / MAR
      ordem: etapa.ordem,
      duracao_prevista_dias: etapa.duracao_padrao_dias,
      peso: etapa.peso_progresso,
      dependencias: etapa.dependencias || [],
      status: "nao_iniciada"
    }));

    // 4. Inserir as etapas no banco
    const { error: erroEtapas } = await supabase
      .from("cronograma_etapas")
      .insert(etapasParaInserir);

    if (erroEtapas) {
      console.error("Erro ao inserir etapas do cronograma:", erroEtapas);
      throw new Error("Não foi possível salvar as etapas do cronograma.");
    }

    return {
      sucesso: true,
      cronogramaId
    };

  } catch (err) {
    console.error("Erro geral ao criar cronograma a partir do Storage:", err);
    return {
      sucesso: false,
      erro: err.message
    };
  }
}
