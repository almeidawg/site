import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

function Cronogramas() {
  const [cronogramas, setCronogramas] = useState([]);
  const [cronogramaSelecionado, setCronogramaSelecionado] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoEtapas, setCarregandoEtapas] = useState(false);

  const [novoCronograma, setNovoCronograma] = useState({
    nome_obra: '',
    cliente: '',
    endereco: '',
    data_inicio: '',
    data_prevista_fim: '',
  });

  const [novaEtapa, setNovaEtapa] = useState({
    nome_etapa: '',
    descricao: '',
    responsavel: '',
    data_inicio: '',
    data_prevista_fim: '',
    peso: 1,
  });

  const carregarCronogramas = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('obra_cronogramas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCronogramas(data || []);

      if (data && data.length > 0 && !cronogramaSelecionado) {
        setCronogramaSelecionado(data[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar cronogramas:', err.message);
      alert('Erro ao carregar cronogramas: ' + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const carregarEtapas = async (cronogramaId) => {
    if (!cronogramaId) {
      setEtapas([]);
      return;
    }
    try {
      setCarregandoEtapas(true);
      const { data, error } = await supabase
        .from('obra_cronograma_etapas')
        .select('*')
        .eq('cronograma_id', cronogramaId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setEtapas(data || []);
    } catch (err) {
      console.error('Erro ao carregar etapas:', err.message);
      alert('Erro ao carregar etapas: ' + err.message);
    } finally {
      setCarregandoEtapas(false);
    }
  };

  useEffect(() => {
    carregarCronogramas();
  }, []);

  useEffect(() => {
    if (cronogramaSelecionado) {
      carregarEtapas(cronogramaSelecionado.id);
    }
  }, [cronogramaSelecionado?.id]);

  const handleCriarCronograma = async (e) => {
    e.preventDefault();
    try {
      if (!novoCronograma.nome_obra) {
        alert('Informe o nome da obra.');
        return;
      }

      const { data, error } = await supabase
        .from('obra_cronogramas')
        .insert({
          nome_obra: novoCronograma.nome_obra,
          cliente: novoCronograma.cliente,
          endereco: novoCronograma.endereco,
          data_inicio: novoCronograma.data_inicio || null,
          data_prevista_fim: novoCronograma.data_prevista_fim || null,
        })
        .select()
        .single();

      if (error) throw error;

      setNovoCronograma({
        nome_obra: '',
        cliente: '',
        endereco: '',
        data_inicio: '',
        data_prevista_fim: '',
      });

      await carregarCronogramas();
      setCronogramaSelecionado(data);
    } catch (err) {
      console.error('Erro ao criar cronograma:', err.message);
      alert('Erro ao criar cronograma: ' + err.message);
    }
  };

  const handleCriarEtapa = async (e) => {
    e.preventDefault();
    if (!cronogramaSelecionado) {
      alert('Selecione um cronograma primeiro.');
      return;
    }
    try {
      if (!novaEtapa.nome_etapa) {
        alert('Informe o nome da etapa.');
        return;
      }

      const ordem =
        etapas.length > 0
          ? Math.max(...etapas.map((e) => e.ordem || 0)) + 1
          : 1;

      const { error } = await supabase
        .from('obra_cronograma_etapas')
        .insert({
          cronograma_id: cronogramaSelecionado.id,
          nome_etapa: novaEtapa.nome_etapa,
          descricao: novaEtapa.descricao,
          responsavel: novaEtapa.responsavel,
          data_inicio: novaEtapa.data_inicio || null,
          data_prevista_fim: novaEtapa.data_prevista_fim || null,
          peso: Number(novaEtapa.peso) || 1,
          ordem,
        });

      if (error) throw error;

      setNovaEtapa({
        nome_etapa: '',
        descricao: '',
        responsavel: '',
        data_inicio: '',
        data_prevista_fim: '',
        peso: 1,
      });

      await carregarEtapas(cronogramaSelecionado.id);
    } catch (err) {
      console.error('Erro ao criar etapa:', err.message);
      alert('Erro ao criar etapa: ' + err.message);
    }
  };

  const atualizarStatusEtapa = async (etapaId, novoStatus) => {
    try {
      const { error } = await supabase
        .from('obra_cronograma_etapas')
        .update({ status: novoStatus })
        .eq('id', etapaId);

      if (error) throw error;
      await carregarEtapas(cronogramaSelecionado.id);
    } catch (err) {
      console.error('Erro ao atualizar etapa:', err.message);
      alert('Erro ao atualizar etapa: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', padding: 16, gap: 16 }}>
      {/* Lista de cronogramas (obras) */}
      <div
        style={{
          width: '28%',
          borderRight: '1px solid #ddd',
          paddingRight: 12,
        }}
      >
        <h2>Cronogramas de Obras</h2>

        {carregando ? (
          <p>Carregando cronogramas...</p>
        ) : cronogramas.length === 0 ? (
          <p>Nenhum cronograma cadastrado.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cronogramas.map((c) => (
              <li
                key={c.id}
                onClick={() => setCronogramaSelecionado(c)}
                style={{
                  padding: 8,
                  marginBottom: 4,
                  cursor: 'pointer',
                  borderRadius: 4,
                  backgroundColor:
                    cronogramaSelecionado?.id === c.id ? '#e3f2fd' : '#f5f5f5',
                }}
              >
                <strong>{c.nome_obra}</strong>
                <br />
                <span style={{ fontSize: 12 }}>
                  {c.cliente || 'Sem cliente'} –{' '}
                  {c.status === 'em_andamento'
                    ? 'Em andamento'
                    : c.status === 'planejamento'
                    ? 'Planejamento'
                    : c.status === 'concluido'
                    ? 'Concluída'
                    : c.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        <hr style={{ margin: '12px 0' }} />

        <h3>Novo cronograma</h3>
        <form onSubmit={handleCriarCronograma}>
          <div>
            <input
              placeholder="Nome da obra"
              value={novoCronograma.nome_obra}
              onChange={(e) =>
                setNovoCronograma({
                  ...novoCronograma,
                  nome_obra: e.target.value,
                })
              }
              style={{ width: '100%', marginBottom: 6 }}
            />
          </div>
          <div>
            <input
              placeholder="Cliente"
              value={novoCronograma.cliente}
              onChange={(e) =>
                setNovoCronograma({ ...novoCronograma, cliente: e.target.value })
              }
              style={{ width: '100%', marginBottom: 6 }}
            />
          </div>
          <div>
            <input
              placeholder="Endereço"
              value={novoCronograma.endereco}
              onChange={(e) =>
                setNovoCronograma({
                  ...novoCronograma,
                  endereco: e.target.value,
                })
              }
              style={{ width: '100%', marginBottom: 6 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12 }}>Início previsto</label>
            <input
              type="date"
              value={novoCronograma.data_inicio}
              onChange={(e) =>
                setNovoCronograma({
                  ...novoCronograma,
                  data_inicio: e.target.value,
                })
              }
              style={{ width: '100%', marginBottom: 6 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12 }}>Fim previsto</label>
            <input
              type="date"
              value={novoCronograma.data_prevista_fim}
              onChange={(e) =>
                setNovoCronograma({
                  ...novoCronograma,
                  data_prevista_fim: e.target.value,
                })
              }
              style={{ width: '100%', marginBottom: 6 }}
            />
          </div>
          <button type="submit">Salvar cronograma</button>
        </form>
      </div>

      {/* Etapas do cronograma selecionado */}
      <div style={{ flex: 1 }}>
        <h2>Etapas</h2>
        {cronogramaSelecionado ? (
          <>
            <p>
              <strong>Obra:</strong> {cronogramaSelecionado.nome_obra}
              <br />
              <strong>Cliente:</strong> {cronogramaSelecionado.cliente || '-'}
            </p>

            <h3>Nova etapa</h3>
            <form onSubmit={handleCriarEtapa} style={{ marginBottom: 12 }}>
              <div>
                <input
                  placeholder="Nome da etapa"
                  value={novaEtapa.nome_etapa}
                  onChange={(e) =>
                    setNovaEtapa({ ...novaEtapa, nome_etapa: e.target.value })
                  }
                  style={{ width: '100%', marginBottom: 6 }}
                />
              </div>
              <div>
                <input
                  placeholder="Responsável"
                  value={novaEtapa.responsavel}
                  onChange={(e) =>
                    setNovaEtapa({ ...novaEtapa, responsavel: e.target.value })
                  }
                  style={{ width: '100%', marginBottom: 6 }}
                />
              </div>
              <div>
                <input
                  placeholder="Descrição"
                  value={novaEtapa.descricao}
                  onChange={(e) =>
                    setNovaEtapa({ ...novaEtapa, descricao: e.target.value })
                  }
                  style={{ width: '100%', marginBottom: 6 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12 }}>Início</label>
                  <input
                    type="date"
                    value={novaEtapa.data_inicio}
                    onChange={(e) =>
                      setNovaEtapa({
                        ...novaEtapa,
                        data_inicio: e.target.value,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12 }}>Fim previsto</label>
                  <input
                    type="date"
                    value={novaEtapa.data_prevista_fim}
                    onChange={(e) =>
                      setNovaEtapa({
                        ...novaEtapa,
                        data_prevista_fim: e.target.value,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label style={{ fontSize: 12 }}>Peso</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={novaEtapa.peso}
                    onChange={(e) =>
                      setNovaEtapa({
                        ...novaEtapa,
                        peso: e.target.value,
                      })
                    }
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <button type="submit">Adicionar etapa</button>
            </form>

            <h3>Etapas cadastradas</h3>
            {carregandoEtapas ? (
              <p>Carregando etapas...</p>
            ) : etapas.length === 0 ? (
              <p>Nenhuma etapa cadastrada.</p>
            ) : (
              <table border="1" cellPadding="4" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Ordem</th>
                    <th>Etapa</th>
                    <th>Responsável</th>
                    <th>Período</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {etapas.map((e) => (
                    <tr key={e.id}>
                      <td style={{ textAlign: 'center' }}>{e.ordem}</td>
                      <td>{e.nome_etapa}</td>
                      <td>{e.responsavel || '-'}</td>
                      <td style={{ fontSize: 12 }}>
                        {e.data_inicio || '-'} ⇒ {e.data_prevista_fim || '-'}
                      </td>
                      <td>{e.status}</td>
                      <td>
                        <select
                          value={e.status}
                          onChange={(ev) =>
                            atualizarStatusEtapa(e.id, ev.target.value)
                          }
                        >
                          <option value="nao_iniciada">Não iniciada</option>
                          <option value="em_andamento">Em andamento</option>
                          <option value="concluida">Concluída</option>
                          <option value="atrasada">Atrasada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>Selecione ou crie um cronograma à esquerda.</p>
        )}
      </div>
    </div>
  );
}

export default Cronogramas;
