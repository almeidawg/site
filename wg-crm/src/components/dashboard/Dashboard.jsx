import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, ClipboardList, HardHat, Hammer, Users, HeartHandshake as Handshake } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import FinanceCharts from '@/components/dashboard/FinanceCharts';
import AlertasCard from '@/components/dashboard/AlertasCard';
import ClientesAtivos from '@/components/dashboard/ClientesAtivos';
import PipelineChart from '@/components/dashboard/PipelineChart';
import ObrasStatus from '@/components/dashboard/ObrasStatus';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    novos_clientes: { total: 0, valor: 0 },
    oportunidades: { total: 0, valor: 0 },
    negociacao: { total: 0, valor: 0 },
    arquitetura: { total: 0, valor: 0 },
    engenharia: { total: 0, valor: 0 },
    marcenaria: { total: 0, valor: 0 },
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: newClientsCount, error: clientError } = await supabase
          .from('entities')
          .select('id', { count: 'exact', head: true })
          .eq('tipo', 'cliente')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (clientError) throw clientError;

        const { data: cardsData, error: cardsError } = await supabase
          .from('v_kanban_cards_board')
          .select('payload, modulo, coluna_id')
          .in('status', ['aberto', 'em_andamento', 'negociacao']);

        if (cardsError) throw cardsError;

        const { data: colunas, error: colunasError } = await supabase.from('kanban_colunas').select('id, nome');
        if (colunasError) throw colunasError;

        const colunaMap = colunas.reduce((acc, col) => {
            acc[col.id] = col.nome;
            return acc;
        }, {});

        const newStats = {
          novos_clientes: { total: newClientsCount || 0, valor: 0 },
          oportunidades: { total: 0, valor: 0 },
          negociacao: { total: 0, valor: 0 },
          arquitetura: { total: 0, valor: 0 },
          engenharia: { total: 0, valor: 0 },
          marcenaria: { total: 0, valor: 0 },
        };

        if (cardsData) {
            cardsData.forEach(card => {
                const modulo = card.modulo;
                const cardPayload = typeof card.payload === 'string' ? JSON.parse(card.payload) : card.payload;
                const valor = parseFloat(cardPayload?.valor || 0);

                if (modulo && newStats[modulo]) {
                    newStats[modulo].total += 1;
                    newStats[modulo].valor += valor;
                }

                if (modulo === 'oportunidades') {
                    newStats.oportunidades.total += 1;
                    newStats.oportunidades.valor += valor;

                    const nomeColuna = colunaMap[card.coluna_id] || '';
                    if (nomeColuna.toLowerCase().includes('negocia')) {
                        newStats.negociacao.total += 1;
                        newStats.negociacao.valor += valor;
                    }
                }
            });
        }

        setStats(newStats);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Erro ao carregar estatísticas",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 bg-gray-50/50 min-h-screen space-y-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Principal</h1>

      {/* Row 1: Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard index={0} title="Valor em Oportunidades" value={formatCurrency(stats.oportunidades.valor)} count={`${stats.oportunidades.total} cards`} icon={DollarSign} color="from-green-400 to-green-600" />
        <StatCard index={1} title="Valor em Negociação" value={formatCurrency(stats.negociacao.valor)} count={`${stats.negociacao.total} cards`} icon={Handshake} color="from-amber-400 to-amber-600" />
        <StatCard index={2} title="Novos Clientes (Mês)" value={stats.novos_clientes.total} count="clientes" icon={Users} color="from-sky-400 to-sky-600" />
      </div>

      {/* Row 2: Operacional */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard index={0} title="Projetos de Arquitetura" value={stats.arquitetura.total} count="em andamento" icon={ClipboardList} color="from-blue-400 to-blue-600" />
        <StatCard index={1} title="Obras em Andamento" value={stats.engenharia.total} count="em andamento" icon={HardHat} color="from-orange-400 to-orange-600" />
        <StatCard index={2} title="Serviços de Marcenaria" value={stats.marcenaria.total} count="em andamento" icon={Hammer} color="from-yellow-400 to-yellow-600" />
      </div>

      {/* Row 2.5: Status das Obras */}
      <div>
        <ObrasStatus />
      </div>

      {/* Row 3: Clientes Ativos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Clientes Ativos</h2>
        <ClientesAtivos />
      </div>

      {/* Row 4: Pipeline */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Pipeline de Vendas</h2>
        <PipelineChart />
      </div>

      {/* Row 5: Financeiro */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Visão Financeira</h2>
        <FinanceCharts />
      </div>

      {/* Row 6: Alertas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Alertas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertasCard />
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
