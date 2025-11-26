import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Loader2, HardHat, BellRing, FileText, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const statusLabels = {
  Pendente: 'Pendente',
  EmAberto: 'Em Aberto',
  Pago: 'Pago',
};

const Obras = () => {
  const { toast } = useToast();
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectsFinanceiro = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cobrancas')
        .select(`
          *,
          cliente:entities(nome_razao_social),
          projeto:projects(name),
          alertas:alertas_pagamento(*)
        `)
        .order('vencimento', { ascending: true });

      if (error) throw error;
      setFinanceData(data || []);
    } catch (err) {
      console.error('Erro ao buscar finanças:', err);
      toast({
        title: 'Erro ao carregar projetos financeiros',
        description: err.message,
        variant: 'destructive',
      });
      setFinanceData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjectsFinanceiro();
  }, [fetchProjectsFinanceiro]);

  const statusCounts = useMemo(() => {
    return financeData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [financeData]);

  const getAlertBadge = (alertas) => {
    const pending = alertas?.find((alert) => alert.status === 'pendente');
    if (!pending) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 uppercase">
        <BellRing className="h-3 w-3" />
        {pending.tipo_alerta.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Projetos em Financeiro - WG Almeida</title>
        <meta name="description" content="Visão financeira dos contratos, cobranças e alertas gerados automaticamente." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-engenharia">
            <HardHat /> Projetos em Financeiro
          </h1>
          <p className="text-wg-gray-medium mt-1">
            Acompanhe contratos, cobranças e alertas criados diretamente no Supabase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(statusLabels).map((status) => (
            <div key={status} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-gray-500">{statusLabels[status]}</p>
              <p className="text-3xl font-semibold mt-2">{statusCounts[status] || 0}</p>
              <p className="text-sm text-gray-500 mt-1">cobranças</p>
            </div>
          ))}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">Alertas pendentes</p>
              <p className="text-3xl font-semibold mt-2">
                {financeData.reduce((sum, item) => sum + (item.alertas?.length || 0), 0)}
              </p>
            </div>
            <Button variant="outline" className="mt-3" onClick={fetchProjectsFinanceiro}>
              <ChevronRight size={16} />
              Atualizar dados
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {financeData.length === 0 && (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-6 text-center">
              <FileText className="mx-auto h-10 w-10 mb-3 text-gray-400" />
              <p className="text-gray-500">Nenhuma cobrança encontrada para mostrar.</p>
            </div>
          )}
          {financeData.map((cobranca) => (
            <div key={cobranca.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{cobranca.descricao || 'Cobrança sem título'}</span>
                <span className="uppercase text-xs tracking-wide text-gray-500">{cobranca.status}</span>
              </div>
              <p className="text-sm text-gray-500">Cliente: {cobranca.cliente?.nome_razao_social || 'Não informado'}</p>
              <p className="text-sm text-gray-500">Projeto: {cobranca.projeto?.name || 'Não vinculado'}</p>
              <p className="text-lg font-semibold text-gray-900">
                {(cobranca.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-gray-500">Vencimento: {cobranca.vencimento}</p>
              <div className="flex items-center justify-between text-xs text-gray-700">
                {getAlertBadge(cobranca.alertas)}
                <Button variant="ghost" size="sm" onClick={fetchProjectsFinanceiro} className="text-blue-600 hover:text-blue-800 gap-1">
                  Atualizar <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Obras;
