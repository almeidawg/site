import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';

const addBusinessDays = (start, days) => {
  if (!start || Number.isNaN(days)) return '';
  const date = new Date(`${start}T00:00:00`);
  if (Number(days) <= 0) return start;

  let added = 0;
  while (added < Number(days)) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return date.toISOString().split('T')[0];
};

const getTipoContratoLabel = (tipo) => {
  const map = {
    arquitetura: 'Projeto Arquitetonico',
    engenharia: 'Engenharia',
    marcenaria: 'Marcenaria',
    prestacao_servicos: 'Prestacao de Servicos',
  };
  return map[tipo] || 'Contrato';
};

const NovoContratoDialog = ({ open, onOpenChange, setContratos, propostaBase, onContratoGerado }) => {
  const { toast } = useToast();

  const [entities] = useLocalStorage('crm_entities', []);
  const [propostas, setPropostas] = useLocalStorage('crm_propostas', []);
  const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);

  const [targets, setTargets] = useState([]);
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [tipoContrato, setTipoContrato] = useState('');
  const [modelos, setModelos] = useState([]);
  const [modeloSelecionado, setModeloSelecionado] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [propostaSelecionada, setPropostaSelecionada] = useState(null);
  const [itensProposta, setItensProposta] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [diasUteis, setDiasUteis] = useState(10);
  const [dataFimPrevista, setDataFimPrevista] = useState('');
  const [loading, setLoading] = useState(false);

  const propostasAprovadas = useMemo(
    () => propostas.filter((p) => ['aprovada', 'contrato_gerado'].includes(p.status)),
    [propostas]
  );

  const propostasDoCliente = useMemo(() => {
    if (!targetId) return [];
    return propostasAprovadas.filter((p) => p.cliente_id === targetId);
  }, [propostasAprovadas, targetId]);

  useEffect(() => {
    if (open) {
      const clientes = entities.filter((e) => e.tipo === 'cliente');
      setTargets(clientes);
      const hoje = new Date().toISOString().split('T')[0];
      setDataInicio(hoje);
    }
  }, [open, entities]);

  useEffect(() => {
    const storedModelos = JSON.parse(localStorage.getItem('crm_contratos_modelos') || '[]');
    setModelos(storedModelos);
  }, [open]);

  useEffect(() => {
    if (modeloSelecionado) {
      const modelo = modelos.find((m) => m.id === modeloSelecionado);
      if (modelo) {
        setConteudo(modelo.conteudo);
        setTipoContrato(modelo.tipo);
      }
    }
  }, [modeloSelecionado, modelos]);

  useEffect(() => {
    setDataFimPrevista(addBusinessDays(dataInicio, Number(diasUteis) || 0));
  }, [dataInicio, diasUteis]);

  useEffect(() => {
    const base = propostaBase || propostaSelecionada;
    if (!open || !base) return;

    setTargetId(base.cliente_id || '');
    setTargetName(base.cliente_nome || '');
    const itens = Array.isArray(base.itens) ? base.itens : [];
    setItensProposta(itens);

    const itensDescritivos =
      itens.length > 0
        ? itens
            .map(
              (item) =>
                `- ${item.nome || item.descricao} (Qtd: ${item.quantidade || 1}, Valor: ${Number(
                  item.valor_unitario || item.valor_total || 0
                ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
            )
            .join('\n')
        : 'Nenhum item detalhado.';

    const valorFormatado = (base.valor_total || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const conteudoInicial = `CONTRATO DE PRESTACAO DE SERVICOS

Baseado na Proposta #${base.numero}
Cliente: ${base.cliente_nome}

Descricao: ${base.descricao || 'Nao informada'}

Itens Incluidos:
${itensDescritivos}

Valor Total: ${valorFormatado}

[... restante do corpo do contrato ...]`;
    setConteudo(conteudoInicial);
  }, [propostaBase, propostaSelecionada, open]);

  const persistContratoInSupabase = async (contractDraft, base) => {
    const generateContractNumber = () => `CTR-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const mapTipoContrato = (tipo) => {
      if (['arquitetura', 'marcenaria', 'engenharia'].includes(tipo)) {
        return tipo;
      }
      return 'outros';
    };

    const formatISO = (value) => (value ? new Date(value).toISOString().split('T')[0] : null);
    const safeDate = formatISO(dataInicio || new Date().toISOString());
    const vencimentoBase = formatISO(dataFimPrevista || addBusinessDays(dataInicio || new Date().toISOString(), 30));
    const descricaoContrato = conteudo || base?.descricao || 'Contrato gerado via sistema';

    const contratoPayload = {
      numero: generateContractNumber(),
      cliente_id: targetId,
      proposta_id: base?.id,
      titulo: getTipoContratoLabel(tipoContrato),
      descricao: descricaoContrato,
      valor_total: Number(base?.valor_total || contractDraft.valor_total || 0),
      data_inicio: safeDate,
      data_fim: vencimentoBase,
      data_assinatura: safeDate,
      status: 'ativo',
      tipo: mapTipoContrato(tipoContrato),
      responsavel_id: null,
      observacoes: base?.descricao || '',
      dados: {
        proposta: {
          id: base?.id,
          numero: base?.numero,
        },
        itens: itensProposta,
        cliente_nome: targetName,
      },
    };

    const { data: contratoRow, error: contratoError } = await supabase
      .from('contratos')
      .insert([contratoPayload])
      .select('*')
      .single();

    if (contratoError) throw contratoError;

    const obra = await criarObraFinanceiro(contratoRow.id, base?.descricao, contractDraft.valor_total);
    const project = await criarProjetoCronograma(contratoRow.id, base);

    const tituloPayload = {
      empresa_id: null,
      tipo: 'Receber',
      descricao: `Contrato ${contratoPayload.numero} - ${targetName}`,
      valor: Number(base?.valor_total || contractDraft.valor_total || 0),
      data_emissao: safeDate,
      data_vencimento: vencimentoBase,
      status: 'Previsto',
      centro_custo_id: null,
      observacao: `Contrato vinculado a ${targetName}`,
      fornecedor_cliente: targetName || base?.cliente_nome,
    };

    const { data: tituloRow, error: tituloError } = await supabase
      .from('titulos_financeiros')
      .insert([tituloPayload])
      .select('*')
      .single();

    if (tituloError) throw tituloError;

    const cobrancaPayload = {
      cliente_id: targetId,
      project_id: project?.id || null,
      descricao: `Cobrança do contrato ${contratoPayload.numero}`,
      valor: Number(base?.valor_total || contractDraft.valor_total || 0),
      vencimento: vencimentoBase,
      status: 'Pendente',
    };

    const { data: cobrancaRow, error: cobrancaError } = await supabase
      .from('cobrancas')
      .insert([cobrancaPayload])
      .select('*')
      .single();

    if (cobrancaError) throw cobrancaError;

    const alertTypes = [
      { tipo: '5_dias_antes', offset: -5 },
      { tipo: '1_dia_antes', offset: -1 },
    ];

    const baseDate = new Date(vencimentoBase || safeDate);
    for (const alert of alertTypes) {
      const alertaDate = new Date(baseDate);
      alertaDate.setDate(alertaDate.getDate() + alert.offset);
      await supabase.from('alertas_pagamento').insert([
        {
          cobranca_id: cobrancaRow.id,
          tipo_alerta: alert.tipo,
          data_alerta: alertaDate.toISOString().split('T')[0],
          data_vencimento: vencimentoBase,
          status: 'pendente',
          metodo_envio: 'popup',
        },
      ]);
    }
  };

  const criarObraFinanceiro = async (contratoId, descricaoTexto, valor) => {
    try {
      const { data } = await supabase
      .from('obras')
      .insert([
        {
          codigo: `OBR-${Date.now()}`,
          cliente_id: targetId,
          contrato_id: contratoId,
          titulo: descricaoTexto || 'Obra vinculada',
          descricao: descricaoTexto,
          status: 'Planejamento',
          data_inicio: dataInicio || null,
          data_fim_prevista: dataFimPrevista || null,
          valor_orcado: Number(valor || 0),
        },
      ])
        .select('*')
        .single();
      return data;
    } catch (err) {
      console.error('Erro ao criar obra financeira:', err);
      return null;
    }
  };

  const criarProjetoCronograma = async (contratoId, baseData) => {
    try {
      const { data } = await supabase
        .from('projects')
        .insert([
          {
            name: baseData?.descricao || `Projeto da proposta ${baseData?.numero}`,
            client_id: targetId || baseData?.cliente_id,
            client_name: targetName || baseData?.cliente_nome,
            start_date: dataInicio || new Date().toISOString().split('T')[0],
            status: 'draft',
            payload: { origem_contrato_id: contratoId, proposta_id: baseData?.id },
          },
        ])
        .select('*')
        .single();
      return data;
    } catch (err) {
      console.error('Erro ao criar projeto no cronograma:', err);
      return null;
    }
  };

  const handleSaveContrato = async () => {
    const base = propostaBase || propostaSelecionada;
    if (!base) {
      toast({
        title: 'Selecione uma proposta aprovada',
        description: 'O contrato precisa nascer de uma proposta aprovada do cliente.',
        variant: 'destructive',
      });
      return;
    }

    if (!targetId || !tipoContrato) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Selecione o cliente e o tipo de contrato.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const newContrato = {
      id: `cont_${Date.now()}`,
      targetId,
      targetName,
      cliente_id: targetId,
      cliente_nome: targetName,
      tipoContrato,
      conteudo,
      status: 'Rascunho',
      propostaOrigemId: base.id,
      propostaNumero: base.numero,
      propostaDescricao: base.descricao,
      itens: itensProposta,
      valor_total: base.valor_total,
      dataInicioPrevista: dataInicio,
      diasUteis,
      dataTerminoPrevista: dataFimPrevista,
      dataCriacao: new Date().toISOString(),
    };

    setContratos((prev) => [...prev, newContrato]);
    setPropostas((prev) => prev.map((p) => (p.id === base.id ? { ...p, status: 'contrato_gerado' } : p)));

    if (onContratoGerado) {
      onContratoGerado(newContrato);
    }

    if (base.oportunidade_id) {
      const updatedOportunidades = oportunidades.map((op) => {
        if (op.id === base.oportunidade_id) {
          const servicos = new Set(op.servicos_contratados || []);
          servicos.add(tipoContrato);
          return { ...op, servicos_contratados: Array.from(servicos), fase: 'ganha', status: 'ganha' };
        }
        return op;
      });
      setOportunidades(updatedOportunidades);
    }

    try {
      await persistContratoInSupabase(newContrato, base);
    } catch (err) {
      console.error('Erro ao persistir contrato no Supabase:', err);
      toast({
        title: 'Contrato salvo localmente',
        description: 'Não foi possível persistir todos os dados no backend. Verifique o log.',
        variant: 'destructive',
      });
    }

    toast({
      title: 'Contrato salvo!',
      description: 'Geramos o contrato e criamos projetos no Financeiro e Cronograma.',
    });

    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-center" style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '1.5rem' }}>
            Gerar Novo Contrato
          </DialogTitle>
          <DialogDescription>
            {propostaBase ? `Gerando contrato a partir da Proposta #${propostaBase.numero}.` : 'Selecione um cliente e escolha a proposta aprovada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                onValueChange={(value) => {
                  const selected = targets.find((t) => t.id === value);
                  setTargetId(value);
                  setTargetName(selected?.nome_razao_social || '');
                  setPropostaSelecionada(null);
                }}
                value={targetId}
                disabled={!!propostaBase}
              >
                <SelectTrigger>
                  <SelectValue placeholder={propostaBase ? propostaBase.cliente_nome : 'Selecione o cliente...'} />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome_razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proposta aprovada</Label>
              {propostaBase ? (
                <div className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
                  Proposta #{propostaBase.numero} - {propostaBase.cliente_nome}
                </div>
              ) : propostasDoCliente.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma proposta aprovada para este cliente.</p>
              ) : (
                <Select
                  value={propostaSelecionada?.id || ''}
                  onValueChange={(value) => {
                    const selecionada = propostasDoCliente.find((p) => p.id === value);
                    setPropostaSelecionada(selecionada || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a proposta aprovada" />
                  </SelectTrigger>
                  <SelectContent>
                    {propostasDoCliente.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        #{p.numero} - {p.descricao || 'Sem descricao'} ({(p.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Início previsto</Label>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Dias úteis</Label>
                <Input type="number" min="0" value={diasUteis} onChange={(e) => setDiasUteis(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label>Término previsto</Label>
                <Input type="date" value={dataFimPrevista} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Usar Modelo</Label>
              <Select onValueChange={setModeloSelecionado} value={modeloSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Comece de um modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Contrato</Label>
              <Select onValueChange={setTipoContrato} value={tipoContrato}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arquitetura">Projeto Arquitetonico</SelectItem>
                  <SelectItem value="engenharia">Engenharia</SelectItem>
                  <SelectItem value="marcenaria">Marcenaria</SelectItem>
                  <SelectItem value="prestacao_servicos">Prestacao de Servicos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Itens aprovados</Label>
              <div className="border rounded-md p-3 max-h-[220px] overflow-y-auto text-sm bg-muted/30">
                {itensProposta.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum item cadastrado na proposta.</p>
                ) : (
                  itensProposta.map((item) => (
                    <div key={item.id || item.nome} className="flex justify-between gap-3 py-1 border-b last:border-b-0 border-dashed border-muted">
                      <span>
                        {item.nome || item.descricao} {item.quantidade ? `(${item.quantidade}x)` : ''}
                      </span>
                      <span className="font-semibold">
                        {(item.valor_total || (item.quantidade || 1) * (item.valor_unitario || 0)).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteudo do Contrato</Label>
              <Textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Digite ou cole o conteudo do contrato aqui."
                className="h-full min-h-[260px] text-sm leading-relaxed p-4"
                style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', fontFamily: "'Bahnschrift', sans-serif" }}
              />
              <p className="text-xs text-muted-foreground">
                O conteudo foi pre-preenchido com base na proposta aprovada. Ajuste conforme necessario.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveContrato} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar rascunho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovoContratoDialog;
