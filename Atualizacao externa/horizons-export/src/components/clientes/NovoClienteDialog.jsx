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
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NovoClienteDialog = ({ open, onOpenChange, setClientes, clienteToEdit, setOportunidades }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [procedenciasCadastradas, setProcedenciasCadastradas] = useState([]);
  const [equipesCadastradas, setEquipesCadastradas] = useState([]);

  const initialFormState = {
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
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['procedencias', 'equipes']);

      if (error) {
        console.error("Erro ao buscar configurações:", error);
      } else {
        const procedencias = data.find(d => d.chave === 'procedencias')?.valor || [];
        const equipes = data.find(d => d.chave === 'equipes')?.valor || [];
        setProcedenciasCadastradas(procedencias);
        setEquipesCadastradas(equipes);
      }
    };
    if (open) {
      fetchConfig();
    }
  }, [open]);

  useEffect(() => {
    if (clienteToEdit) {
      setIsEditing(true);
      setFormData({ ...initialFormState, ...clienteToEdit });
    } else {
      setIsEditing(false);
      setFormData(initialFormState);
    }
  }, [clienteToEdit, open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nomeRazaoSocial = formData.tipo_pessoa === 'pj' ? formData.razao_social : formData.nome;
    if (!nomeRazaoSocial) {
        toast({ title: "Erro", description: "Nome/Razão Social é obrigatório.", variant: "destructive" });
        setLoading(false);
        return;
    }
    
    const entityData = {
        tipo: 'cliente',
        nome_razao_social: nomeRazaoSocial,
        nome_fantasia: formData.nome,
        cpf_cnpj: formData.cpf_cnpj,
        rg_ie: formData.rg_ie,
        email: formData.email,
        telefone: formData.telefone1,
        observacoes: formData.observacoes_cliente,
        setor_categoria: formData.procedencia,
        endereco: {
            cep: formData.cep,
            logradouro: formData.endereco,
            numero: formData.numero,
            complemento: formData.complemento,
            bairro: formData.bairro,
            cidade: formData.cidade,
            estado: formData.estado,
        }
    };
    
    if (isEditing) {
        const { data, error } = await supabase
            .from('entities')
            .update(entityData)
            .eq('id', clienteToEdit.id)
            .select()
            .single();

        if (error) {
            toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
        } else {
            setClientes(prev => prev.map(c => c.id === data.id ? data : c));
            toast({ title: "Sucesso!", description: "Cliente atualizado." });
            onOpenChange(false);
        }
    } else {
        const { data, error } = await supabase
            .from('entities')
            .insert(entityData)
            .select()
            .single();

        if (error) {
            toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
        } else {
            setClientes(prev => [data, ...prev]);
            
            // Opcional: criar oportunidade automaticamente.
            // Esta lógica pode ser movida para o backend (edge function) se for complexa.
            if (setOportunidades) {
              const newOportunidade = {
                titulo: `Oportunidade - ${data.nome_razao_social}`,
                cliente_id: data.id,
                modulo: 'oportunidades',
                payload: {
                  valor_previsto: 0,
                  probabilidade: 25,
                }
              };

              // Você precisaria buscar o pipeline e a primeira fase para criar o card corretamente.
              // Simplificando por agora:
              console.log("Nova oportunidade a ser criada:", newOportunidade);
            }

            toast({ title: "Sucesso!", description: "Novo cliente criado." });
            onOpenChange(false);
        }
    }
    setLoading(false);
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

                <div className="space-y-2">
                    <Label>Equipe</Label>
                    <Select onValueChange={(v) => handleSelectChange('equipe', v)} value={formData.equipe}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            {equipesCadastradas.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Procedência</Label>
                    <Select onValueChange={(v) => handleSelectChange('procedencia', v)} value={formData.procedencia}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                            {procedenciasCadastradas.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

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
              {isEditing ? 'Salvar Alterações' : 'Salvar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovoClienteDialog;