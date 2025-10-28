import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const AlertasCard = () => {
  const [propostas] = useLocalStorage('crm_propostas', []);
  const [compras] = useLocalStorage('crm_compras', []);

  const alertas = [
    {
      tipo: 'desconto',
      mensagem: 'Propostas com desconto abaixo do limite',
      count: propostas.filter(p => p.requer_aprovacao).length,
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-100'
    },
    {
      tipo: 'compras',
      mensagem: 'PCs pendentes de aprovação',
      count: compras.filter(c => c.status === 'pendente').length,
      icon: Clock,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      tipo: 'atraso',
      mensagem: 'Obras com atraso no cronograma',
      count: 0,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <AlertTriangle className="text-amber-500" size={24} />
        Alertas
      </h2>
      
      <div className="space-y-4">
        {alertas.map((alerta, index) => {
          const Icon = alerta.icon;
          
          return (
            <motion.div
              key={alerta.tipo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${alerta.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">{alerta.mensagem}</p>
                  <p className="text-2xl font-bold">{alerta.count}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AlertasCard;