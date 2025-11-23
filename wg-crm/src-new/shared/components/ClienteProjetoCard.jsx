
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Building, HardHat, Hammer } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ClienteProjetoCard = ({ cliente, index }) => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Em breve!",
      description: "A página detalhada do projeto será implementada em breve.",
    });
  };

  const servicosContratados = cliente.servicos_contratados || [];
  
  const serviceStyles = {
    arquitetura: { icon: Building, color: 'text-wg-arquitetura', bgColor: 'bg-wg-arquitetura/10', label: 'Arquitetura' },
    engenharia: { icon: HardHat, color: 'text-wg-engenharia', bgColor: 'bg-wg-engenharia/10', label: 'Engenharia' },
    marcenaria: { icon: Hammer, color: 'text-wg-marcenaria', bgColor: 'bg-wg-marcenaria/10', label: 'Marcenaria' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-effect rounded-xl p-4 flex flex-col justify-between cursor-pointer border border-purple-200/50 hover:shadow-lg transition-all"
      onClick={handleNotImplemented}
    >
      <div>
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={cliente.responsavel_avatar} />
            <AvatarFallback className="gradient-primary text-white">
              {cliente.cliente_nome?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{cliente.cliente_nome}</h3>
            <p className="text-xs text-muted-foreground">{cliente.nome}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-green-600 font-semibold mb-3">
            <div className="flex items-center gap-1.5">
                <DollarSign size={14} />
                <span>{cliente.valor_previsto?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-600">Serviços Contratados:</p>
          <div className="flex flex-wrap gap-2">
            {servicosContratados.map(serviceId => {
              const style = serviceStyles[serviceId];
              if (!style) return null;
              const Icon = style.icon;
              return (
                <Badge key={serviceId} variant="outline" className={`${style.bgColor} ${style.color} border-current/30`}>
                  <Icon className="h-3 w-3 mr-1.5" />
                  {style.label}
                </Badge>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <Button variant="link" size="sm" className="w-full">
            Ver Projeto
        </Button>
      </div>
    </motion.div>
  );
};

export default ClienteProjetoCard;
