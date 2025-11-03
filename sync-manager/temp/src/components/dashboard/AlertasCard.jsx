import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign, UserX } from 'lucide-react';

const AlertasCard = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlertas = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('v_alertas').select('*').limit(20);
      if (!error) {
        setAlertas(data);
      }
      setLoading(false);
    };
    fetchAlertas();
  }, []);

  const getAlertInfo = (alerta) => {
    switch (alerta.tipo) {
      case 'Título vencido':
        return { icon: DollarSign, color: 'text-red-600 bg-red-100', message: `Título de ${alerta.cliente} vencido em ${new Date(alerta.data).toLocaleDateString()}` };
      case 'Card sem responsável':
        return { icon: UserX, color: 'text-amber-600 bg-amber-100', message: `Card de ${alerta.cliente} sem responsável` };
      case 'Tarefa atrasada':
        return { icon: Clock, color: 'text-blue-600 bg-blue-100', message: `Tarefa "${alerta.ref.substring(0, 20)}..." atrasada no cronograma ${alerta.cliente}` };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600 bg-gray-100', message: alerta.tipo };
    }
  };

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
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {loading ? <p>Carregando...</p> : alertas.length === 0 ? <p className="text-muted-foreground">Nenhum alerta no momento.</p> :
        alertas.map((alerta, index) => {
          const { icon: Icon, color, message } = getAlertInfo(alerta);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{message}</p>
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