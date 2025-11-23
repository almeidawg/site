import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, ClipboardList, HardHat, Hammer } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import FinanceCharts from '@/components/dashboard/FinanceCharts';
import PipelineWidget from '@/components/dashboard/PipelineWidget';
import AlertasCard from '@/components/dashboard/AlertasCard';
import ClientesAtivos from '@/components/dashboard/ClientesAtivos';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    oportunidades: { total: 0, valor: 0 },
    arquitetura: { total: 0, valor: 0 },
    engenharia: { total: 0, valor: 0 },
    marcenaria: { total: 0, valor: 0 },
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: cards, error } = await supabase
          .from('v_kanban_cards_board')
          .select('payload, modulo, status')
          .not('status', 'in', '("concluido", "arquivado")');

        if (error) {
          throw error;
        }

        const newStats = {
          oportunidades: { total: 0, valor: 0 },
          arquitetura: { total: 0, valor: 0 },
          engenharia: { total: 0, valor: 0 },
          marcenaria: { total: 0, valor: 0 },
        };

        if (cards) {
            cards.forEach(card => {
                const modulo = card.modulo;
                const cardPayload = typeof card.payload === 'string' ? JSON.parse(card.payload) : card.payload;
                if (modulo && newStats[modulo]) {
                    newStats[modulo].total += 1;
                    newStats[modulo].valor += parseFloat(cardPayload?.valor || 0);
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
        staggerChildren: 0.1
      }
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-gray-50/50 min-h-screen"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Principal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard index={0} title="Oportunidades" value={formatCurrency(stats.oportunidades.valor)} count={stats.oportunidades.total} icon={DollarSign} color="from-green-400 to-green-600" />
        <StatCard index={1} title="Projetos de Arquitetura" value={formatCurrency(stats.arquitetura.valor)} count={stats.arquitetura.total} icon={ClipboardList} color="from-blue-400 to-blue-600" />
        <StatCard index={2} title="Obras em Andamento" value={formatCurrency(stats.engenharia.valor)} count={stats.engenharia.total} icon={HardHat} color="from-orange-400 to-orange-600" />
        <StatCard index={3} title="Serviços de Marcenaria" value={formatCurrency(stats.marcenaria.valor)} count={stats.marcenaria.total} icon={Hammer} color="from-yellow-400 to-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ClientesAtivos />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinanceCharts />
        </div>
        <div className="space-y-6">
          <PipelineWidget />
          <AlertasCard />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;