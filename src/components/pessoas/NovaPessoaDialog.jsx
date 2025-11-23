
import React, { useState, useEffect } from 'react';
    import { Button } from "@/components/ui/button";
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { useToast } from "@/components/ui/use-toast";
    import { Textarea } from '@/components/ui/textarea';
    import { Loader2, Save, Search, User, Briefcase, Truck, Building, Link, PlusCircle, Trash, Banknote } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Switch } from '@/components/ui/switch';
    import { buildEntityPayload } from '@/lib/entitiesPayload';

    const NovaPessoaDialog = ({ open, onOpenChange, onSave, entityToEdit, defaultTipo }) => {
      const { toast } = useToast();
      const [isEditing, setIsEditing] = useState(false);
      const [loading, setLoading] = useState(false);
      const [procedencias, setProcedencias] = useState([]);
      const [users, setUsers] = useState([]);
      const [especificadores, setEspecificadores] = useState([]);

      const initialFormState = {
        tipo: defaultTipo || 'cliente',
        tipo_pessoa: 'pf',
        nome_razao_social: '',
        nome_fantasia: '',
        cpf_cnpj: '',
        rg_ie: '',
        email: '',
        telefone: '',
        ativo: true,
        endereco: {},
        observacoes: '',
        procedencia_id: null,
        responsavel_id: null,
        especificador: null,
        drive_link: '',
        dados_bancarios: [],
        arquitetura: false,
        engenharia: false,
        marcenaria: false,
      };

      const [formData, setFormData] = useState(initialFormState);

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
      
      useEffect(() => {
        const fetchInitialData = async () => {
          setLoading(true);
          const { data: procedenciasData, error: procedenciasError } = await supabase.from('comercial_procedencias').select('id, nome').eq('ativo', true);
          if (procedenciasError) toast({ title: "Erro ao buscar procedências", variant: "destructive" });
          else setProcedencias(procedenciasData || []);

          const { data: usersData, error: usersError } = await supabase.from('user_profiles').select('user_id, nome').eq('ativo', true);
          if (usersError) toast({ title: "Erro ao buscar usuários", variant: "destructive" });
          else setUsers(usersData || []);

          const { data: especificadoresData, error: especificadoresError } = await supabase.from('especificadores').select('id, nome_empresa');
          if (especificadoresError) toast({ title: "Erro ao buscar especificadores", variant: "destructive" });
          else setEspecificadores(especificadoresData || []);

          if (entityToEdit) {
            setIsEditing(true);
            const { data: fullEntity, error: entityError } = await supabase.from('v_entities_full').select('*, dados_bancarios:bank_accounts(*)').eq('id', entityToEdit.id).single();
            if(entityError) toast({ title: "Erro ao buscar dados completos", variant: "destructive" });
            else setFormData({ ...initialFormState, ...fullEntity, tipo: fullEntity.tipo || defaultTipo });
          } else {
            setIsEditing(false);
            setFormData({...initialFormState, tipo: defaultTipo});
          }
          setLoading(false);
        };

        if (open) fetchInitialData();
      }, [entityToEdit, open, toast, defaultTipo]);
      
      useEffect(() => {
        if(open) {
            setFormData(prev => ({...prev, tipo: defaultTipo}));
        }
      }, [defaultTipo, open])

      const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
      };
      
      const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value === 'none' ? null : value }));
      };
      
      const handleAddressChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, endereco: { ...(prev.endereco || {}), [id]: value } }));
      };

      const handleBankAccountChange = (index, e) => {
        const { id, value } = e.target;
        const updatedAccounts = [...formData.dados_bancarios];
        updatedAccounts[index][id] = value;
        setFormData(prev => ({ ...prev, dados_bancarios: updatedAccounts }));
      };

      const addBankAccount = () => {
        setFormData(prev => ({
          ...prev,
          dados_bancarios: [...(prev.dados_bancarios || []), { banco: '', agencia: '', conta: '' }]
        }));
      };

      const removeBankAccount = (index) => {
        const updatedAccounts = formData.dados_bancarios.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, dados_bancarios: updatedAccounts }));
      };

      const handleBuscaCep = async (cep) => {
        if (!cep || cep.length < 8) return;
        setLoading(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({ ...prev, endereco: { ...prev.endereco, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }}));
                toast({ title: "Endereço preenchido!" });
            } else {
                toast({ title: "CEP não encontrado", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Erro ao buscar CEP", variant: "destructive" });
        }
        setLoading(false);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nome_razao_social) {
            toast({ title: "Campo obrigatório", description: "O nome/razão social é obrigatório.", variant: "destructive" });
            return;
        }
        setLoading(true);

        try {
          const payload = buildEntityPayload(formData);
          
          let entityData;

          if (isEditing) {
            const { data, error } = await supabase.from('entities').update(payload).eq('id', payload.id).select().single();
            if (error) throw error;
            entityData = data;
          } else {
            const { data, error } = await supabase.from('entities').insert(payload).select().single();
            if (error) throw error;
            entityData = data;
          }

          if (formData.dados_bancarios && formData.dados_bancarios.length > 0) {
            const bankPayload = formData.dados_bancarios.map(acc => ({ ...acc, entity_id: entityData.id, id: acc.id || undefined }));
            const { error: bankError } = await supabase.from('bank_accounts').upsert(bankPayload, { onConflict: 'id' });
            if (bankError) throw bankError;
          }
          
          toast({ title: "Sucesso!", description: `Cadastro ${isEditing ? 'atualizado' : 'criado'}.` });
          onSave();

        } catch (error) {
          console.error("Erro ao salvar entidade:", error)
          const errorMessage = error.message.includes('cpf_cnpj') || error.message.includes('entities_cpf_cnpj_tipo_unique')
            ? 'CPF/CNPJ inválido ou já existente para este tipo de cadastro.'
            : `Erro ao salvar: ${error.message}`;
          toast({ title: "Erro ao salvar", description: errorMessage, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };

      const tipoIconMap = {
        cliente: <User className="mr-2 h-5 w-5" />,
        fornecedor: <Truck className="mr-2 h-5 w-5" />,
        colaborador: <Briefcase className="mr-2 h-5 w-5" />,
      };
      
      const renderCommercialDetails = () => (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">Detalhes Comerciais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Responsável</Label>
              <Select onValueChange={(val) => handleSelectChange('responsavel_id', val)} value={formData.responsavel_id || 'none'}>
                <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
                <SelectContent><SelectItem value="none">Nenhum</SelectItem>{users.map(u => (<SelectItem key={u.user_id} value={u.user_id}>{u.nome}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Procedência</Label>
              <Select onValueChange={(val) => handleSelectChange('procedencia_id', val)} value={formData.procedencia_id || 'none'}>
                <SelectTrigger><SelectValue placeholder="Selecione a procedência" /></SelectTrigger>
                <SelectContent><SelectItem value="none">Nenhum</SelectItem>{procedencias.map(p => (<SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2"><Label htmlFor="drive_link">Link Google Drive</Label><div className="flex items-center gap-2"><Link className="h-5 w-5 text-muted-foreground" /><Input id="drive_link" value={formData.drive_link || ''} onChange={handleInputChange} placeholder="https://..."/></div></div>
          </div>
        </div>
      );
      
      const renderAreaOfInterest = () => (
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Área de Interesse</h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                   <Switch id="arquitetura" checked={formData.arquitetura} onCheckedChange={(c) => setFormData(p=>({...p, arquitetura: c}))} />
                   <Label htmlFor="arquitetura">Arquitetura</Label>
               </div>
               <div className="flex items-center space-x-2">
                   <Switch id="engenharia" checked={formData.engenharia} onCheckedChange={(c) => setFormData(p=>({...p, engenharia: c}))} />
                   <Label htmlFor="engenharia">Engenharia</Label>
               </div>
               <div className="flex items-center space-x-2">
                   <Switch id="marcenaria" checked={formData.marcenaria} onCheckedChange={(c) => setFormData(p=>({...p, marcenaria: c}))} />
                   <Label htmlFor="marcenaria">Marcenaria</Label>
               </div>
            </div>
        </div>
      );

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle className="flex items-center">{tipoIconMap[formData.tipo]} {isEditing ? 'Editar' : 'Novo'} <span className="capitalize ml-2">{formData.tipo}</span></DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto pr-4">
              <div className="space-y-6">
                
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Identificação</h3>
                  <div className="inline-flex rounded-lg border p-1 w-full">
                      <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pj')} className={cn('w-1/2', formData.tipo_pessoa === 'pj' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground')}><Building size={16} className="mr-2"/> Pessoa Jurídica</Button>
                      <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pf')} className={cn('w-1/2', formData.tipo_pessoa === 'pf' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground')}><User size={16} className="mr-2"/> Pessoa Física</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{formData.tipo_pessoa === 'pj' ? 'Razão Social' : 'Nome'}</Label><Input id="nome_razao_social" value={formData.nome_razao_social || ''} onChange={handleInputChange} required /></div>
                    {formData.tipo_pessoa === 'pj' && (<div className="space-y-2"><Label>Nome Fantasia</Label><Input id="nome_fantasia" value={formData.nome_fantasia || ''} onChange={handleInputChange} /></div>)}
                    <div className="space-y-2"><Label>CPF/CNPJ</Label>
                        <div className="flex gap-1">
                            <Input id="cpf_cnpj" value={formData.cpf_cnpj || ''} onChange={handleInputChange} />
                            {formData.tipo_pessoa === 'pj' && (
                               <Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCnpj(formData.cpf_cnpj)} disabled={loading}>
                                 {loading ? <Loader2 className="animate-spin" /> : <Search />}
                               </Button>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2"><Label>RG/IE</Label><Input id="rg_ie" value={formData.rg_ie || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>Telefone</Label><Input id="telefone" value={formData.telefone || ''} onChange={handleInputChange} /></div>
                  </div>
                </div>

                {formData.tipo === 'cliente' && renderAreaOfInterest()}
                {formData.tipo === 'cliente' && renderCommercialDetails()}

                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2 md:col-span-2"><Label>CEP</Label><div className="flex gap-1"><Input id="cep" value={formData.endereco?.cep || ''} onChange={handleAddressChange} /><Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCep(formData.endereco?.cep)} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Search />}</Button></div></div>
                      <div className="space-y-2"><Label>Estado</Label><Input id="uf" value={formData.endereco?.uf || ''} onChange={handleAddressChange} /></div>
                      <div className="space-y-2"><Label>Cidade</Label><Input id="cidade" value={formData.endereco?.cidade || ''} onChange={handleAddressChange} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Endereço</Label><Input id="logradouro" value={formData.endereco?.logradouro || ''} onChange={handleAddressChange} /></div>
                      <div className="space-y-2"><Label>Número</Label><Input id="numero" value={formData.endereco?.numero || ''} onChange={handleAddressChange} /></div>
                      <div className="space-y-2"><Label>Bairro</Label><Input id="bairro" value={formData.endereco?.bairro || ''} onChange={handleAddressChange} /></div>
                      <div className="space-y-2 md:col-span-4"><Label>Complemento</Label><Input id="complemento" value={formData.endereco?.complemento || ''} onChange={handleAddressChange} /></div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Banknote /> Dados Bancários</h3>
                    <Button type="button" size="sm" variant="outline" onClick={addBankAccount}><PlusCircle className="h-4 w-4 mr-2" /> Adicionar</Button>
                  </div>
                  {formData.dados_bancarios?.map((acc, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded-md relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeBankAccount(index)}><Trash className="h-4 w-4" /></Button>
                      <div className="space-y-1"><Label>Banco</Label><Input id="banco" value={acc.banco} onChange={(e) => handleBankAccountChange(index, e)} /></div>
                      <div className="space-y-1"><Label>Agência</Label><Input id="agencia" value={acc.agencia} onChange={(e) => handleBankAccountChange(index, e)} /></div>
                      <div className="space-y-1"><Label>Conta</Label><Input id="conta" value={acc.conta} onChange={(e) => handleBankAccountChange(index, e)} /></div>
                    </div>
                  ))}
                  {(!formData.dados_bancarios || formData.dados_bancarios.length === 0) && <p className="text-sm text-center text-muted-foreground">Nenhuma conta adicionada.</p>}
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">Observações</h3>
                  <Textarea id="observacoes" value={formData.observacoes || ''} onChange={handleInputChange} />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };

    export default NovaPessoaDialog;
