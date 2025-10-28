import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, User, Building, HardHat, Hammer, Tag, Edit, UserCheck, GitBranch } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';


const OportunidadeCard = ({ data, isDragging, onUpdateOportunidade, onEdit }) => {
  const { id, nome, cliente_nome, valor_previsto, responsavel_avatar, servicos_contratados = [], vendedor, indicador } = data;

  const servicosDisponiveis = [
    { id: 'arquitetura', label: 'Projeto Arquitetônico', icon: Building },
    { id: 'engenharia', label: 'Engenharia', icon: HardHat },
    { id: 'marcenaria', label: 'Marcenaria', icon: Hammer },
  ];

  const handleServiceToggle = (serviceId) => {
    const newServices = servicos_contratados.includes(serviceId)
      ? servicos_contratados.filter(s => s !== serviceId)
      : [...servicos_contratados, serviceId];
    
    onUpdateOportunidade(id, { servicos_contratados: newServices });
  };
  
  const getServiceIcon = (serviceId) => {
    const service = servicosDisponiveis.find(s => s.id === serviceId);
    return service ? <service.icon className="h-3 w-3" /> : null;
  };

  return (
    <motion.div
      layout
      className={cn(
        "bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-3 border border-gray-100",
        isDragging && "shadow-xl scale-105 rotate-2"
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm mb-1.5 pr-2">{nome}</h4>
        <Avatar className="h-7 w-7">
          <AvatarImage src={responsavel_avatar} alt={cliente_nome} />
          <AvatarFallback className="text-xs">{cliente_nome?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <p className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5">
        <User size={12} /> {cliente_nome}
      </p>

      <div className="flex justify-between items-center text-xs mb-3">
        <div className="flex items-center gap-1 text-green-600 font-semibold">
          <DollarSign size={14} />
          <span>{valor_previsto?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-muted-foreground mb-3">
        {vendedor && <div className="flex items-center gap-1.5"><UserCheck size={12} /> Vendedor: <span className="font-medium text-gray-700">{vendedor}</span></div>}
        {indicador && <div className="flex items-center gap-1.5"><GitBranch size={12} /> Indicador: <span className="font-medium text-gray-700">{indicador}</span></div>}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
         <div className="flex items-center gap-1.5">
           {servicos_contratados.map(serviceId => (
             <div key={serviceId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                {getServiceIcon(serviceId)}
             </div>
           ))}
         </div>

        <div className="flex items-center">
          {data.fase === 'ganha' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Tag size={12} className="mr-1" />
                  Serviços
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Serviços Contratados</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {servicosDisponiveis.map(service => (
                  <DropdownMenuCheckboxItem
                    key={service.id}
                    checked={servicos_contratados.includes(service.id)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  >
                    <service.icon className="mr-2 h-4 w-4" />
                    {service.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
            <Edit size={12} />
          </Button>
        </div>
      </div>

    </motion.div>
  );
};

export default OportunidadeCard;