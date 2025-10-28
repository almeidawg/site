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
import { Loader2, Save, Search, Building, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const NovoClienteDialog = ({ open, onOpenChange, setClientes, clienteToEdit, setOportunidades }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pegar dados de configuração
  const [procedenciasCadastradas] = useLocalStorage('crm_config_procedencias', []);
  const [equipesCadastradas] = useLocalStorage('crm_config_equipes', []);

  const [formData, setFormData] = useState({
    tipo_pessoa: 'pj',
    equipe: '',
    procedencia: '',
    prazo_obra: '',
    previsao_fechamento: '',
    codigo_fabrica: '',
    razao_social: '',
    nome: '',
    cpf_cnpj: '',
    rg_ie: '',
    sexo: '',
    data_nascimento_abertura: '',
    profissao_atividade: '',
    telefone1: '',
    telefone2: '',
    email: '',
    pais: 'Brasil',
    cep: '',
    estado: '',
    cidade: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    endereco_entrega: {
        cep: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
    },
    observacoes_comerciais: '',
    observacoes_cliente: '',
  });

  useEffect(() => {
    if (clienteToEdit) {
      setIsEditing(true);
      setFormData({ ...clienteToEdit });
    } else {
      setIsEditing(false);
      // Reset form
      setFormData({
        tipo_pessoa: 'pj',
        equipe: '', procedencia: '', prazo_obra: '', previsao_fechamento: '', codigo_fabrica: '',
        razao_social: '', nome: '', cpf_cnpj: '', rg_ie: '', sexo: '', data_nascimento_abertura: '',
        profissao_atividade: '', telefone1: '', telefone2: '', email: '', pais: 'Brasil',
        cep: '', estado: '', cidade: '', endereco: '', numero: '', complemento: '', bairro: '',
        endereco_entrega: { cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' },
        observacoes_comerciais: '', observacoes_cliente: '',
      });
    }
  }, [clienteToEdit, open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleNestedInputChange = (section, e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
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
                endereco: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
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
            razao_social: data.razao_social,
            nome: data.nome_fantasia,
            rg_ie: data.inscricao_estadual,
            data_nascimento_abertura: data.data_inicio_atividade,
            cep: data.cep,
            endereco: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            cidade: data.municipio,
            estado: data.uf,
            email: data.email,
            telefone1: data.ddd_telefone_1,
        }));
        toast({ title: "Dados da empresa preenchidos!" });
    } catch (error) {
        toast({ title: "Erro ao buscar CNPJ", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredField = formData.tipo_pessoa === 'pj' ? 'razao_social' : 'nome';
    if (!formData[requiredField]) {
      toast({ title: "Erro", description: "Nome/Razão Social é obrigatório.", variant: "destructive" });
      return;
    }

    const today = new Date();
    const datePart = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    
    if (isEditing) {
      setClientes(prev => prev.map(c => c.id === clienteToEdit.id ? formData : c));
      toast({ title: "Sucesso!", description: "Cliente atualizado." });
    } else {
      const newId = `cli_${Date.now()}`;
      const newCode = `${datePart}#${newId.slice(-4)}`;
      const newCliente = { ...formData, id: newId, codigo_cliente: newCode };
      setClientes(prev => [newCliente, ...prev]);
      
      const newOportunidade = {
        id: `op-${Date.now()}`,
        nome: `Oportunidade - ${newCliente.nome || newCliente.razao_social}`,
        cliente_id: newId,
        cliente_nome: newCliente.nome || newCliente.razao_social,
        valor_previsto: 0,
        probabilidade: 25,
        fase: 'qualificacao',
        status: 'ativa'
      };
      setOportunidades(prev => [newOportunidade, ...prev]);

      toast({ title: "Sucesso!", description: "Novo cliente e oportunidade criados." });
    }
    
    onOpenChange(false);
  };

  const renderPfFields = () => (
    <>
      <div className="space-y-2 md:col-span-4">
        <Label>Nome Completo</Label>
        <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>CPF</Label>
        <Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} placeholder="000.000.000-00" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>RG</Label>
        <Input id="rg_ie" value={formData.rg_ie} onChange={handleInputChange} />
      </div>
    </>
  );

  const renderPjFields = () => (
    <>
      <div className="space-y-2 md:col-span-2">
        <Label>Razão Social</Label>
        <Input id="razao_social" value={formData.razao_social} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Nome Fantasia</Label>
        <Input id="nome" value={formData.nome} onChange={handleInputChange} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>CNPJ</Label>
        <div className="flex gap-1">
          <Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" />
          <Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCnpj(formData.cpf_cnpj)} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Inscrição Estadual</Label>
        <Input id="rg_ie" value={formData.rg_ie} onChange={handleInputChange} />
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="principal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="principal">Dados Principais</TabsTrigger>
              <TabsTrigger value="entrega">Endereço de Entrega</TabsTrigger>
              <TabsTrigger value="observacoes">Observações</TabsTrigger>
            </TabsList>
            <TabsContent value="principal" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-4 flex justify-center">
                    <div className="inline-flex rounded-lg border p-1">
                        <Button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipo_pessoa: 'pj' }))}
                            className={cn('px-4 py-1.5 text-sm', formData.tipo_pessoa === 'pj' ? 'bg-primary text-primary-foreground rounded-md shadow-sm' : 'bg-transparent text-muted-foreground')}
                        >
                            <Building size={16} className="mr-2"/> Pessoa Jurídica
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipo_pessoa: 'pf' }))}
                            className={cn('px-4 py-1.5 text-sm', formData.tipo_pessoa === 'pf' ? 'bg-primary text-primary-foreground rounded-md shadow-sm' : 'bg-transparent text-muted-foreground')}
                        >
                            <User size={16} className="mr-2"/> Pessoa Física
                        </Button>
                    </div>
                </div>

                <div className="space-y-2"><Label>Equipe</Label><Input id="equipe" value={formData.equipe} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Procedência</Label><Input id="procedencia" value={formData.procedencia} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Prazo da Obra</Label><Input id="prazo_obra" type="date" value={formData.prazo_obra} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Previsão Fechamento</Label><Input id="previsao_fechamento" type="date" value={formData.previsao_fechamento} onChange={handleInputChange} /></div>

                {formData.tipo_pessoa === 'pf' ? renderPfFields() : renderPjFields()}

                <div className="space-y-2"><Label>Telefone 1</Label><Input id="telefone1" value={formData.telefone1} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Telefone 2</Label><Input id="telefone2" value={formData.telefone2} onChange={handleInputChange} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>

                <div className="space-y-2 md:col-span-2">
                  <Label>CEP</Label>
                  <div className="flex gap-1">
                    <Input id="cep" value={formData.cep} onChange={handleInputChange} />
                    <Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCep(formData.cep)} disabled={loading}>
                      {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2"><Label>Estado</Label><Input id="estado" value={formData.estado} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input id="cidade" value={formData.cidade} onChange={handleInputChange} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input id="endereco" value={formData.endereco} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Número</Label><Input id="numero" value={formData.numero} onChange={handleInputChange} /></div>
                <div className="space-y-2"><Label>Bairro</Label><Input id="bairro" value={formData.bairro} onChange={handleInputChange} /></div>
                <div className="space-y-2 md:col-span-4"><Label>Complemento</Label><Input id="complemento" value={formData.complemento} onChange={handleInputChange} /></div>
              </div>
            </TabsContent>
            <TabsContent value="entrega" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2"><Label>CEP</Label><Input id="cep" value={formData.endereco_entrega.cep} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input id="estado" value={formData.endereco_entrega.estado} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input id="cidade" value={formData.endereco_entrega.cidade} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input id="endereco" value={formData.endereco_entrega.endereco} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2"><Label>Número</Label><Input id="numero" value={formData.endereco_entrega.numero} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2"><Label>Bairro</Label><Input id="bairro" value={formData.endereco_entrega.bairro} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
                <div className="space-y-2 md:col-span-4"><Label>Complemento</Label><Input id="complemento" value={formData.endereco_entrega.complemento} onChange={(e) => handleNestedInputChange('endereco_entrega', e)} /></div>
              </div>
            </TabsContent>
            <TabsContent value="observacoes" className="py-4">
              <div className="space-y-4">
                <div><Label>Observações Comerciais (Internas)</Label><Textarea id="observacoes_comerciais" value={formData.observacoes_comerciais} onChange={handleInputChange} /></div>
                <div><Label>Observações para o Cliente (Visível em Documentos)</Label><Textarea id="observacoes_cliente" value={formData.observacoes_cliente} onChange={handleInputChange} /></div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Salvar e Criar Oportunidade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoClienteDialog;