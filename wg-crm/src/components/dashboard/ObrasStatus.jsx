import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ObrasStatus = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    planejamento: 0,
    em_andamento: 0,
    concluida: 0,
    pausada: 0
  });
  const { toast } = useToast();

  const statusConfig = {
    planejamento: { label: 'Planejamento', icon: Clock, color: 'text-blue-600 bg-blue-100' },
    em_andamento: { label: 'Em Andamento', icon: HardHat, color: 'text-amber-600 bg-amber-100' },
    concluida: { label: 'Concluída', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
    pausada: { label: 'Pausada', icon: AlertTriangle, color: 'text-red-600 bg-red-100' }
  };

  useEffect(() => {
    const fetchObrasStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('v_obras_status')
          .select('*');

        if (error) throw error;

        // Transformar array em objeto
        const newStats = {
          planejamento: 0,
          em_andamento: 0,
          concluida: 0,
          pausada: 0
        };

        if (data) {
          data.forEach(item => {
            if (newStats.hasOwnProperty(item.status)) {
              newStats[item.status] = item.total;
            }
          });
        }

        setStats(newStats);
      } catch (error) {
        console.error('Erro ao buscar status das obras:', error);
        toast({
          title: "Erro ao carregar status das obras",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchObrasStatus();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-800">Status das Obras</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config], index) => {
          const count = stats[status];
          const Icon = config.icon;

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon size={20} />
                </div>
                <span className="font-medium text-sm text-gray-700">{config.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{count}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ObrasStatus;