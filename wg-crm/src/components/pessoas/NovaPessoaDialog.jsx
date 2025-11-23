
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Search, User, Briefcase, Truck, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NovaPessoaDialog = ({ open, onOpenChange, setEntities, entityToEdit, onClientCreated }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [procedenciasCadastradas] = useLocalStorage('crm_config_procedencias', []);
  const [equipesCadastradas] = useLocalStorage('crm_config_equipes', []);
  const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);

  const initialFormState = {
    tipo: 'cliente',
    tipo_pessoa: 'pf',
    nome_razao_social: '',
    nome_fantasia: '',
    cpf_cnpj: '',
    rg_ie: '',
    email: '',
    telefone: '',
    setor_categoria: '',
    ativo: true,
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
    dados_bancarios: [{ banco: '', agencia: '', conta: '', titular: '', cpf_cnpj_titular: '', pix_chave: '', pix_tipo: '' }],
    observacoes: '',
    // campos específicos de cliente
    procedencia: '',
    equipe: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (entityToEdit) {
      setIsEditing(true);
      setFormData({ ...initialFormState, ...entityToEdit });
    } else {
      setIsEditing(false);
      setFormData(initialFormState);
    }
  }, [entityToEdit, open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddressChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
        ...prev,
        endereco: {
            ...prev.endereco,
            [id]: value
        }
    }));
  };
  
  const handleBuscaCep = async (cep) => {
    if (!cep || cep.length < 8) return;
    setLoading(true);
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
        const data = await response.json();
        if (data.erro) {
            toast({ title: "CEP não encontrado", variant: "destructive" });
        } else {
            setFormData(prev => ({
                ...prev,
                endereco: {
                  ...prev.endereco,
                  logradouro: data.logradouro,
                  bairro: data.bairro,
                  cidade: data.localidade,
                  uf: data.uf,
                }
            }));
            toast({ title: "Endereço preenchido!" });
        }
    } catch (error) {
        toast({ title: "Erro ao buscar CEP", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleBuscaCnpj = async (cnpj) => {
    if (!cnpj || cnpj.length < 14) return;
    setLoading(true);
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g, '')}`);
        if (!response.ok) throw new Error('CNPJ não encontrado ou inválido');
        const data = await response.json();
        setFormData(prev => ({
            ...prev,
            nome_razao_social: data.razao_social,
            nome_fantasia: data.nome_fantasia,
            cpf_cnpj: data.cnpj,
            rg_ie: data.cnae_fiscal_descricao,
            email: data.email,
            telefone: data.ddd_telefone_1,
            endereco: {
              ...prev.endereco,
              cep: data.cep,
              logradouro: data.logradouro,
              numero: data.numero,
              complemento: data.complemento,
              bairro: data.bairro,
              cidade: data.municipio,
              uf: data.uf,
            }
        }));
        toast({ title: "Dados da empresa preenchidos!" });
    } catch (error) {
        toast({ title: "Erro ao buscar CNPJ", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_razao_social) {
      toast({ title: "Erro", description: "Nome/Razão Social é obrigatório.", variant: "destructive" });
      return;
    }
    
    if (isEditing) {
      setEntities(prev => prev.map(c => c.id === entityToEdit.id ? formData : c));
      toast({ title: "Sucesso!", description: "Cadastro atualizado." });
    } else {
      const newId = `ent_${Date.now()}`;
      const newEntity = { ...formData, id: newId };
      setEntities(prev => [newEntity, ...prev]);

      if (newEntity.tipo === 'cliente') {
        const newOportunidade = {
          id: `op-${Date.now()}`,
          nome: `Oportunidade - ${newEntity.nome_fantasia || newEntity.nome_razao_social}`,
          cliente_id: newId,
          cliente_nome: newEntity.nome_fantasia || newEntity.nome_razao_social,
          valor_previsto: 0,
          probabilidade: 25,
          fase: 'qualificacao',
          status: 'ativa'
        };
        setOportunidades(prev => [newOportunidade, ...prev]);
        toast({ title: "Sucesso!", description: "Novo cliente e oportunidade criados." });

        // Chamar callback para refetch dos clientes do banco
        if (onClientCreated) {
          onClientCreated();
        }
      } else {
        toast({ title: "Sucesso!", description: `Novo ${newEntity.tipo} cadastrado.` });
      }
    }

    onOpenChange(false);
  };

  const renderFieldsByTipo = () => {
    const commonFields = (
        <>
        <div className="space-y-2 md:col-span-2">
            <Label>CPF / CNPJ</Label>
            <div className="flex gap-1">
            <Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} />
            {formData.tipo_pessoa === 'pj' && (
                <Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCnpj(formData.cpf_cnpj)} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
            )}
            </div>
        </div>
        <div className="space-y-2 md:col-span-2"><Label>RG / I.E.</Label><Input id="rg_ie" value={formData.rg_ie} onChange={handleInputChange} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Telefone</Label><Input id="telefone" value={formData.telefone} onChange={handleInputChange} /></div>
        </>
    );
      
    if (formData.tipo === 'cliente') {
      return (
        <>
          <div className="space-y-2"><Label>Equipe</Label><Input id="equipe" value={formData.equipe || ''} onChange={handleInputChange} /></div>
          <div className="space-y-2"><Label>Procedência</Label><Input id="procedencia" value={formData.procedencia || ''} onChange={handleInputChange} /></div>
          {commonFields}
        </>
      );
    }
    return (
        <>
            <div className="space-y-2 md:col-span-2"><Label>Setor / Categoria</Label><Input id="setor_categoria" value={formData.setor_categoria} onChange={handleInputChange} /></div>
            {commonFields}
        </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
              <div className="flex justify-center">
                  <Select onValueChange={(val) => handleSelectChange('tipo', val)} value={formData.tipo} disabled={isEditing}>
                      <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Selecione o tipo de cadastro" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="cliente"><User className="inline-block mr-2 h-4 w-4" /> Cliente</SelectItem>
                          <SelectItem value="colaborador"><Briefcase className="inline-block mr-2 h-4 w-4" /> Colaborador</SelectItem>
                          <SelectItem value="fornecedor"><Truck className="inline-block mr-2 h-4 w-4" /> Fornecedor</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

            <div className="inline-flex rounded-lg border p-1 w-full">
                 <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pf')} className={cn('w-1/2', formData.tipo_pessoa === 'pf' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground')}>
                    <User size={16} className="mr-2"/> Pessoa Física
                </Button>
                <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pj')} className={cn('w-1/2', formData.tipo_pessoa === 'pj' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground')}>
                    <Building size={16} className="mr-2"/> Pessoa Jurídica
                </Button>
            </div>
          </div>

          <Tabs defaultValue="principal">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="principal">Dados Principais</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="principal" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>{formData.tipo_pessoa === 'pj' ? 'Razão Social' : 'Nome Completo'}</Label>
                  <Input id="nome_razao_social" value={formData.nome_razao_social} onChange={handleInputChange} required />
                </div>
                {formData.tipo_pessoa === 'pj' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nome Fantasia</Label>
                    <Input id="nome_fantasia" value={formData.nome_fantasia} onChange={handleInputChange} />
                  </div>
                )}
                {renderFieldsByTipo()}
              </div>
            </TabsContent>
            
            <TabsContent value="endereco" className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label>CEP</Label>
                        <div className="flex gap-1">
                            <Input id="cep" value={formData.endereco.cep} onChange={handleAddressChange} />
                            <Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCep(formData.endereco.cep)} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2"><Label>Estado</Label><Input id="uf" value={formData.endereco.uf} onChange={handleAddressChange} /></div>
                    <div className="space-y-2"><Label>Cidade</Label><Input id="cidade" value={formData.endereco.cidade} onChange={handleAddressChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input id="logradouro" value={formData.endereco.logradouro} onChange={handleAddressChange} /></div>
                    <div className="space-y-2"><Label>Número</Label><Input id="numero" value={formData.endereco.numero} onChange={handleAddressChange} /></div>
                    <div className="space-y-2"><Label>Bairro</Label><Input id="bairro" value={formData.endereco.bairro} onChange={handleAddressChange} /></div>
                    <div className="space-y-2 md:col-span-4"><Label>Complemento</Label><Input id="complemento" value={formData.endereco.complemento} onChange={handleAddressChange} /></div>
                </div>
            </TabsContent>

             <TabsContent value="financeiro" className="py-4">
                <p className="text-center text-muted-foreground">A gestão de dados bancários será implementada em breve.</p>
            </TabsContent>

            <TabsContent value="observacoes" className="py-4">
              <div className="space-y-4">
                <div>
                    <Label>Observações Gerais</Label>
                    <Textarea id="observacoes" value={formData.observacoes} onChange={handleInputChange} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaPessoaDialog;
