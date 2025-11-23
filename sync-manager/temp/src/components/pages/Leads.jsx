import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import LeadCard from '@/components/leads/LeadCard';
import NovoLeadDialog from '@/components/leads/NovoLeadDialog';
import { useNavigate } from 'react-router-dom';

const Leads = () => {
  const [leads, setLeads] = useLocalStorage('crm_leads', []);
  const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadToEdit, setLeadToEdit] = useState(null);
  const navigate = useNavigate();

  const filteredLeads = leads.filter(lead => 
    lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

  const handleOpenDialog = (lead = null) => {
    setLeadToEdit(lead);
    setDialogOpen(true);
  };
  
  const handleGenerateOpportunity = (lead) => {
    const newOportunidade = {
      id: `op-${Date.now()}`,
      nome: `Projeto ${lead.nome}`,
      cliente_nome: lead.nome,
      cliente_id: lead.id,
      valor_previsto: 0,
      probabilidade: 25,
      fase: 'qualificacao',
      responsavel_avatar: `https://i.pravatar.cc/150?u=${lead.email}`,
      status: 'ativa',
      data_criacao: new Date().toISOString()
    };
    
    setOportunidades(prev => [newOportunidade, ...prev]);
    setLeads(prevLeads => prevLeads.map(l => l.id === lead.id ? { ...l, status: 'oportunidade' } : l));
    
    navigate('/oportunidades');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Leads & Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus contatos, leads e clientes.
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="gradient-primary text-white shadow-lg shadow-purple-500/30"
        >
          <Plus size={20} className="mr-2" />
          Novo Registro
        </Button>
      </div>

      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, empresa, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-purple-200/50 bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead, index) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              index={index} 
              onEdit={handleOpenDialog} 
              onGenerateOpportunity={handleGenerateOpportunity}
            />
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum registro encontrado</p>
          </div>
        )}
      </div>

      <NovoLeadDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        leads={leads}
        setLeads={setLeads}
        leadToEdit={leadToEdit}
      />
    </div>
  );
};

export default Leads;