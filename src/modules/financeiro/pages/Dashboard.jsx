import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: transacoes, error: transacoesError } = await supabase.from('transacoes').select('valor, tipo, data_ocorrencia');
      const { data: obras, error: obrasError } = await supabase.from('obras').select('id, status');
      const { data: solicitacoes, error: solicitacoesError } = await supabase.from('solicitacoes_pagamento').select('status').eq('status', 'Pendente');
      const { data: custosCategoriaData, error: custosCategoriaError } = await supabase.from('transacoes').select('valor, categorias_custo(nome)').eq('tipo', 'saida');

      if (transacoesError) throw transacoesError;
      if (obrasError) throw obrasError;
      if (solicitacoesError) throw solicitacoesError;
      if (custosCategoriaError) throw custosCategoriaError;


      const totalEntradas = (transacoes || []).filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
      const totalSaidas = (transacoes || []).filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);

      const fluxoMensal = (transacoes || []).reduce((acc, t) => {
        const mes = new Date(t.data_ocorrencia).toLocaleString('default', { month: 'short' });
        if (!acc[mes]) acc[mes] = { mes, entrada: 0, saida: 0 };
        if (t.tipo === 'entrada') acc[mes].entrada += t.valor;
        else acc[mes].saida += t.valor;
        return acc;
      }, {});

      const custosPorCategoria = (custosCategoriaData || []).reduce((acc, item) => {
          const catNome = item.categorias_custo?.nome || 'Sem Categoria';
          if (!acc[catNome]) acc[catNome] = 0;
          acc[catNome] += item.valor;
          return acc;
      }, {});
      
      const custosCategoriaFormatted = Object.entries(custosPorCategoria).map(([categoria, valor]) => ({ categoria, valor }));
      const obrasAtivasCount = (obras || []).filter(o => o.status === 'Em Andamento').length;
      const solicitacoesPendentesCount = (solicitacoes || []).length;

      const data = {
        resumo: {
          saldoTotal: totalEntradas - totalSaidas,
          custosTotal: totalSaidas,
          fluxoCaixa: totalEntradas - totalSaidas, 
          obrasAtivas: obrasAtivasCount,
        },
        custosCategoria: custosCategoriaFormatted,
        fluxoMensal: Object.values(fluxoMensal),
        alertas: [
          obrasAtivasCount > 10 
            ? { tipo: 'warning', mensagem: `Atenção: ${obrasAtivasCount} obras ativas simultaneamente.` }
            : { tipo: 'info', mensagem: `${obrasAtivasCount} obras em andamento.` },
          solicitacoesPendentesCount > 0
            ? { tipo: 'info', mensagem: `${solicitacoesPendentesCount} solicitações de pagamento aguardando aprovação.` }
            : { tipo: 'success', mensagem: 'Nenhuma solicitação pendente.' }
        ]
      };
      
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar o dashboard',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F25C26]"></div>
      </div>
    );
  }

  const COLORS = ['#F25C26', '#2B4580', '#5E9B94', '#8B5E3C', '#94A3B8'];

  return (
    <>
      <Helmet>
        <title>Dashboard - WG Almeida Gestão Financeira</title>
        <meta name="description" content="Visão consolidada das finanças do Grupo WG Almeida" />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-gray-600 mt-1">Visão consolidada do Grupo WG Almeida</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="wg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Saldo Atual</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">R$ {dashboardData.resumo.saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg"><DollarSign className="text-green-600" size={24} /></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="wg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Custos Totais (Mês)</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">R$ {dashboardData.resumo.custosTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg"><TrendingDown className="text-red-600" size={24} /></div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="wg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Obras Ativas</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardData.resumo.obrasAtivas}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg"><Building2 className="text-[#F25C26]" size={24} /></div>
            </div>
          </motion.div>
          
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="wg-card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="text-[#F25C26]" size={20} /> Alertas</h2>
            <div className="space-y-3">
              {dashboardData.alertas.map((alerta, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 rounded-lg ${alerta.tipo === 'warning' ? 'bg-yellow-50' : alerta.tipo === 'info' ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-700">{alerta.mensagem}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="wg-card p-6 lg:col-span-3">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Fluxo de Caixa Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.fluxoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Line type="monotone" dataKey="entrada" stroke="#5E9B94" strokeWidth={2} name="Entradas" />
                <Line type="monotone" dataKey="saida" stroke="#F25C26" strokeWidth={2} name="Saídas" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="wg-card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Custos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dashboardData.custosCategoria} cx="50%" cy="50%" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="valor" nameKey="categoria">
                  {dashboardData.custosCategoria.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;