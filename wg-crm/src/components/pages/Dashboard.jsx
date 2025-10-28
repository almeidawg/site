import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import PipelineChart from '@/components/dashboard/PipelineChart';
import ObrasStatus from '@/components/dashboard/ObrasStatus';
import { Target, FileText, Building, Hammer, HardHat, AlertTriangle, Clock, ShieldAlert, Wrench } from 'lucide-react';
import InteractiveStatCard from '@/components/dashboard/InteractiveStatCard';
import { motion } from 'framer-motion';

const Dashboard = ({ navigate }) => {
  const [oportunidades] = useLocalStorage('crm_oportunidades', []);
  const [propostas] = useLocalStorage('crm_propostas', []);
  const [compras] = useLocalStorage('crm_compras', []);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  const valorOportunidades = oportunidades
    .filter(o => o.status !== 'perdida' && o.status !== 'ganha')
    .reduce((sum, o) => sum + (o.valor_previsto || 0), 0);

  const valorPropostas = propostas
    .filter(p => ['enviada', 'em_negociacao', 'aprovacao_pendente'].includes(p.status))
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  const valorArquitetura = oportunidades
    .filter(op => op.servicos_contratados?.includes('arquitetura'))
    .reduce((sum, op) => sum + (op.valor_previsto || 0), 0);

  const valorEngenharia = oportunidades
    .filter(op => op.servicos_contratados?.includes('engenharia'))
    .reduce((sum, op) => sum + (op.valor_previsto || 0), 0);

  const valorMarcenaria = oportunidades
    .filter(op => op.servicos_contratados?.includes('marcenaria'))
    .reduce((sum, op) => sum + (op.valor_previsto || 0), 0);

  const commercialStats = [
    {
      title: 'Oportunidades',
      value: formatCurrency(valorOportunidades),
      icon: Target,
      color: 'from-orange-400 to-red-500',
      onClick: () => navigate('/oportunidades')
    },
    {
      title: 'Propostas em Negociação',
      value: formatCurrency(valorPropostas),
      icon: FileText,
      color: 'from-blue-400 to-indigo-500',
      onClick: () => navigate('/propostas?status=negociacao')
    }
  ];

  const operationalStats = [
    {
      title: 'Contratos Arquitetura',
      value: formatCurrency(valorArquitetura),
      icon: Building,
      color: 'bg-wg-arquitetura',
      onClick: () => navigate('/arquitetura?status=ativo')
    },
    {
      title: 'Contratos Engenharia',
      value: formatCurrency(valorEngenharia),
      icon: HardHat,
      color: 'bg-wg-engenharia',
      onClick: () => navigate('/engenharia?status=execucao')
    },
    {
      title: 'Contratos Marcenaria',
      value: formatCurrency(valorMarcenaria),
      icon: Hammer,
      color: 'bg-wg-marcenaria',
      onClick: () => navigate('/marcenaria?status=producao')
    }
  ];

  const alertas = [
    {
      id:"criticos",
      label:"Materiais críticos",
      icon: AlertTriangle,
      link:"/compras?criticos=true",
      count: 0,
      color: 'text-red-600 bg-red-100'
    },
    {
      id:"pcs_atrasados",
      label:"PCs atrasados",
      icon: Clock,
      link:"/compras?status=atrasado",
      count: compras.filter(c => c.status === 'pendente').length,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id:"abaixo_piso",
      label:"Itens < piso H",
      icon: ShieldAlert,
      link:"/propostas?alerta=baixoH",
      count: propostas.filter(p => p.requer_aprovacao).length,
      color: 'text-amber-600 bg-amber-100'
    },
    {
      id:"os_pendentes",
      label:"OS pendentes",
      icon: Wrench,
      link:"/assistencia?status=aberta",
      count: 0,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1>DASHBOARD GRUPO WG ALMEIDA</h1>
        <p className="text-wg-gray-medium mt-1">Visão geral do seu negócio.</p>
      </div>

      <div className="space-y-4">
        <h2>Gerenciamento Comercial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {commercialStats.map((stat, index) => (
            <InteractiveStatCard key={index} {...stat} index={index} />
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h2>Operacional em Andamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operationalStats.map((stat, index) => (
            <InteractiveStatCard key={index} {...stat} index={index + 2} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <PipelineChart oportunidades={oportunidades} />
        <ObrasStatus obras={oportunidades.filter(op => op.servicos_contratados?.includes('engenharia'))} />
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {alertas.map((alerta, index) => (
              <motion.div
                key={alerta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(alerta.link)}
                className="bg-white rounded-xl p-4 cursor-pointer flex flex-col items-center text-center shadow-sm"
              >
                <div className={`p-3 rounded-full ${alerta.color} mb-2`}>
                  <alerta.icon size={24} />
                </div>
                <p className="font-semibold text-sm">{alerta.label}</p>
                <p className="text-2xl font-bold">{alerta.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;