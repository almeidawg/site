import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Edit, Target } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LeadCard = ({ lead, index, onEdit, onGenerateOpportunity }) => {
  const { toast } = useToast();

  const handleGenerateClick = () => {
    onGenerateOpportunity(lead);
    toast({
      title: "Oportunidade Gerada! 🎯",
      description: `Um card para "${lead.nome}" foi criado no seu pipeline de vendas.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-effect rounded-xl p-4 border border-purple-200/50 hover:shadow-lg transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="gradient-primary text-white">
              {lead.nome?.charAt(0) || 'L'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{lead.nome}</h3>
            {lead.empresa && (
              <p className="text-sm text-muted-foreground">{lead.empresa}</p>
            )}
          </div>
          <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 capitalize">
            {lead.status || 'Novo'}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={14} />
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.telefone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={14} />
              <span>{lead.telefone}</span>
            </div>
          )}
          {lead.origem && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                Origem: {lead.origem}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
          <Edit size={16} className="mr-2" /> Editar
        </Button>
        <Button variant="outline" size="sm" onClick={handleGenerateClick} className="text-purple-700 border-purple-300 hover:bg-purple-50 hover:text-purple-800">
          <Target size={16} className="mr-2" /> Gerar Oportunidade
        </Button>
      </div>
    </motion.div>
  );
};

export default LeadCard;