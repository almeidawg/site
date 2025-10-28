import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ObrasStatus = ({ obras }) => {
  const statusConfig = {
    planejamento: { label: 'Planejamento', icon: Clock, color: 'text-blue-600 bg-blue-100' },
    em_execucao: { label: 'Em Execução', icon: HardHat, color: 'text-amber-600 bg-amber-100' },
    finalizada: { label: 'Finalizada', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
    atrasada: { label: 'Atrasada', icon: AlertTriangle, color: 'text-red-600 bg-red-100' }
  };

  const getObrasPorStatus = (status) => {
    return obras.filter(o => o.status === status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-6">Status das Obras</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config], index) => {
          const count = getObrasPorStatus(status).length;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon size={20} />
                </div>
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <p className="text-3xl font-bold">{count}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ObrasStatus;