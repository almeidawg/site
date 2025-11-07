
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import NovaPessoaDialog from '@/components/pessoas/NovaPessoaDialog';
import { Plus, Building, HardHat, Hammer } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';


const servicosDisponiveis = [
  { id: 'arquitetura', label: 'Arquitetura', icon: Building },
  { id: 'engenharia', label: 'Engenharia', icon: HardHat },
  { id: 'marcenaria', label: 'Marcenaria', icon: Hammer },
];

const NovaOportunidadeDialog = ({ open, onOpenChange, setOportunidades, oportunidadeToEdit, users, clientes, onClientCreated }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [entities, setEntities] = useLocalStorage('crm_entities', []);
  const [novoClienteDialogOpen, setNovoClienteDialogOpen] = useState(false);

  const initialFormData = {
    nome: '',
    cliente_id: '',
    valor_previsto: '',
    responsavel_id: '',
    servicos_contratados: [],
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (oportunidadeToEdit) {
      setIsEditing(true);
      const cliente = clientes.find(c => c.id === oportunidadeToEdit.cliente_id);
      setFormData({
        nome: oportunidadeToEdit.nome || '',
        cliente_id: oportunidadeToEdit.cliente_id || '',
        cliente_nome: cliente ? (cliente.nome_razao_social || cliente.nome) : 'Cliente não encontrado',
        valor_previsto: oportunidadeToEdit.valor_previsto || '',
        responsavel_id: oportunidadeToEdit.responsavel_id || '',
        servicos_contratados: oportunidadeToEdit.servicos_contratados || [],
      });
    } else {
      setIsEditing(false);
      setFormData(initialFormData);
    }
  }, [oportunidadeToEdit, open, clientes]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    if (id === 'cliente_id') {
        const cliente = clientes.find(c => c.id === value);
        setFormData(prev => ({
            ...prev,
            cliente_id: value,
            cliente_nome: cliente ? (cliente.nome_razao_social || cliente.nome) : ''
        }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };
  
  const handleServiceToggle = (services) => {
    setFormData(prev => ({ ...prev, servicos_contratados: services }));
  };

  const handleClientCreated = () => {
    // Refetch clients from database
    if (onClientCreated) {
      onClientCreated();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cliente_id || !formData.valor_previsto) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      const updatedOportunidade = { ...oportunidadeToEdit, ...formData, valor_previsto: parseFloat(formData.valor_previsto) };
      setOportunidades(prev => prev.map(op => op.id === oportunidadeToEdit.id ? updatedOportunidade : op));
      toast({ title: "Sucesso!", description: "Oportunidade atualizada." });
    } else {
      const newOportunidade = {
        id: `op-${Date.now()}`,
        ...formData,
        valor_previsto: parseFloat(formData.valor_previsto),
        probabilidade: 25,
        fase: 'qualificacao',
        status: 'ativa',
        responsavel_avatar: `https://i.pravatar.cc/150?u=${formData.cliente_nome}`,
      };
      setOportunidades(prev => [...prev, newOportunidade]);
      toast({ title: "Sucesso!", description: "Nova oportunidade criada." });
    }

    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Oportunidade' : 'Criar Nova Oportunidade'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da oportunidade de negócio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Oportunidade *</Label>
              <Input id="nome" value={formData.nome} onChange={handleInputChange} placeholder="Ex: Reforma Apartamento" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleSelectChange('cliente_id', value)} value={formData.cliente_id}>
                    <SelectTrigger id="cliente_id">
                    <SelectValue placeholder="Selecione um cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                    {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome_razao_social || cliente.nome}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={() => setNovoClienteDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Serviços Envolvidos</Label>
              <ToggleGroup 
                type="multiple"
                variant="outline"
                value={formData.servicos_contratados}
                onValueChange={handleServiceToggle}
                className="justify-start"
              >
                {servicosDisponiveis.map(service => (
                   <ToggleGroupItem key={service.id} value={service.id} aria-label={`Toggle ${service.label}`}>
                      <service.icon className="h-4 w-4 mr-2" />
                      {service.label}
                   </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor_previsto">Valor Previsto (R$) *</Label>
              <Input id="valor_previsto" type="number" value={formData.valor_previsto} onChange={handleInputChange} placeholder="50000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel_id">Responsável</Label>
              <Select onValueChange={(value) => handleSelectChange('responsavel_id', value)} value={formData.responsavel_id}>
                <SelectTrigger id="responsavel_id">
                  <SelectValue placeholder="Selecione um responsável..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar Oportunidade'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <NovaPessoaDialog
        open={novoClienteDialogOpen}
        onOpenChange={setNovoClienteDialogOpen}
        setEntities={setEntities}
        onClientCreated={handleClientCreated}
    />
    </>
  );
};

export default NovaOportunidadeDialog;
