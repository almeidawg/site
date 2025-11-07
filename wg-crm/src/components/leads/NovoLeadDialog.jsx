import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Copy, Building, User, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const NovoLeadDialog = ({ open, onOpenChange, leads, setLeads, leadToEdit }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    tipo_pessoa: 'pf',
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    empresa: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    origem: '',
  });
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setIsEditing(true);
      setFormData({
        ...formData,
        ...leadToEdit,
        tipo_pessoa: leadToEdit.cpf_cnpj?.length > 11 ? 'pj' : 'pf',
      });
    } else {
      setIsEditing(false);
      setFormData({
        tipo_pessoa: 'pf', nome: '', cpf_cnpj: '', email: '', telefone: '', empresa: '', cep: '',
        logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', origem: '',
      });
    }
  }, [leadToEdit, open]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCepSearch = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast({ title: "CEP inválido", description: "Por favor, digite um CEP com 8 dígitos.", variant: "destructive" });
      return;
    }
    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast({ title: "CEP não encontrado", variant: "destructive" });
      } else {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }));
        toast({ title: "Endereço preenchido!", description: "O endereço foi encontrado e preenchido automaticamente." });
      }
    } catch (error) {
      toast({ title: "Erro ao buscar CEP", description: "Não foi possível conectar à API de CEP.", variant: "destructive" });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCnpjSearch = async () => {
    const cnpj = formData.cpf_cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      toast({ title: "CNPJ inválido", description: "Por favor, digite um CNPJ com 14 dígitos.", variant: "destructive" });
      return;
    }
    setIsSearchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        empresa: data.nome_fantasia || data.razao_social || prev.empresa,
        cep: data.cep?.replace(/\D/g, '') || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        estado: data.uf || prev.estado,
        telefone: data.ddd_telefone_1 || prev.telefone,
        email: data.email || prev.email,
      }));
      toast({ title: "Dados da empresa preenchidos!", description: "Os dados do CNPJ foram preenchidos automaticamente." });
    } catch (error) {
      toast({ title: "Erro ao buscar CNPJ", description: "Verifique o CNPJ e tente novamente.", variant: "destructive" });
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      toast({ title: "Campo obrigatório", description: "O nome é obrigatório.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    // Preparar dados para salvar no Supabase
    // Schema real: id, tipo, nome, email, telefone, cpf_cnpj, endereco, cidade, estado, cep, dados (jsonb), ativo, created_at, updated_at
    const entityData = {
      tipo: 'cliente', // Obrigatório: tipo de entidade (cliente, fornecedor, colaborador)
      nome: formData.nome,
      cpf_cnpj: formData.cpf_cnpj || null,
      email: formData.email || null,
      telefone: formData.telefone || null,
      cep: formData.cep || null,
      endereco: formData.logradouro || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      // Campos extras armazenados no JSONB 'dados'
      dados: {
        tipo_pessoa: formData.tipo_pessoa === 'pj' ? 'juridica' : 'fisica',
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro: formData.bairro || null,
        origem: formData.origem || null,
        empresa: formData.empresa || null, // Nome fantasia para PJ
      },
    };

    if (isEditing) {
      // Atualizar cliente existente
      const { data, error } = await supabase
        .from('entities')
        .update(entityData)
        .eq('id', leadToEdit.id)
        .select()
        .single();

      setIsSaving(false);

      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Registro atualizado!", description: "Os dados do cliente foram atualizados com sucesso." });
      setLeads(data); // Passa cliente atualizado
    } else {
      // Criar novo cliente
      const { data, error } = await supabase
        .from('entities')
        .insert([entityData])
        .select()
        .single();

      setIsSaving(false);

      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Novo registro criado!", description: "O lead/cliente foi adicionado com sucesso." });
      setLeads(data); // Passa cliente criado para callback
    }

    onOpenChange(false);
  };
  
  const generateLink = (type) => {
    const token = btoa(`${type}-${Date.now()}`).slice(0, 20);
    const link = `${window.location.origin}/cadastro/${type}/novo?token=${token}`;
    setGeneratedLink(link);
    toast({ title: 'Link Gerado!', description: 'O link de cadastro foi copiado para a área de transferência.' });
    navigator.clipboard.writeText(link);
  }

  const renderFormFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">{formData.tipo_pessoa === 'pf' ? 'Nome Completo *' : 'Razão Social *'}</Label>
          <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="cpf_cnpj">{formData.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ *'}</Label>
          <div className="flex">
            <Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} className="rounded-r-none" />
            {formData.tipo_pessoa === 'pj' && (
              <Button type="button" onClick={handleCnpjSearch} className="rounded-l-none" disabled={isSearchingCnpj}>
                {isSearchingCnpj ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {formData.tipo_pessoa === 'pj' && (
        <div>
          <Label htmlFor="empresa">Nome Fantasia</Label>
          <Input id="empresa" value={formData.empresa} onChange={handleInputChange} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input id="telefone" value={formData.telefone} onChange={handleInputChange} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Label htmlFor="cep">CEP</Label>
          <div className="flex">
            <Input id="cep" value={formData.cep} onChange={handleInputChange} className="rounded-r-none" />
            <Button type="button" onClick={handleCepSearch} className="rounded-l-none" disabled={isSearchingCep}>
              {isSearchingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
            </Button>
          </div>
        </div>
        <div className="col-span-2">
          <Label htmlFor="logradouro">Endereço</Label>
          <Input id="logradouro" value={formData.logradouro} onChange={handleInputChange} />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" value={formData.numero} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="complemento">Complemento</Label>
          <Input id="complemento" value={formData.complemento} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" value={formData.bairro} onChange={handleInputChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" value={formData.cidade} onChange={handleInputChange} />
        </div>
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" value={formData.estado} onChange={handleInputChange} />
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados do lead ou cliente.' : 'Crie um novo lead, cliente, colaborador ou fornecedor.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cadastro" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cadastro">Formulário de Cadastro</TabsTrigger>
            <TabsTrigger value="link">Gerar Link de Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cadastro" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Tipo de Pessoa</Label>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="pf" name="tipo_pessoa" value="pf" checked={formData.tipo_pessoa === 'pf'} onChange={handleInputChange} />
                  <Label htmlFor="pf">Física</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="pj" name="tipo_pessoa" value="pj" checked={formData.tipo_pessoa === 'pj'} onChange={handleInputChange} />
                  <Label htmlFor="pj">Jurídica</Label>
                </div>
              </div>
              
              {renderFormFields()}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
                <Button type="submit" className="gradient-primary text-white" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Registro')}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="link" className="pt-4">
            <div className="space-y-4 text-center">
              <h3 className="font-semibold text-lg">Gerar Link Público</h3>
              <p className="text-muted-foreground">Crie um link para que outras pessoas possam se cadastrar diretamente no sistema. Os dados ficarão pendentes de validação.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => generateLink('cliente')}>
                  <User className="mr-2 h-4 w-4"/> Cliente
                </Button>
                <Button onClick={() => generateLink('colaborador')}>
                  <Building className="mr-2 h-4 w-4"/> Colaborador
                </Button>
                <Button onClick={() => generateLink('fornecedor')}>
                  <Building className="mr-2 h-4 w-4"/> Fornecedor
                </Button>
              </div>
              {generatedLink && (
                 <div className="mt-4 p-4 border rounded-lg bg-muted">
                  <Label>Link Gerado:</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input readOnly value={generatedLink} className="bg-background"/>
                    <Button size="icon" onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        toast({ title: 'Copiado!' });
                    }}>
                        <Copy size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NovoLeadDialog;