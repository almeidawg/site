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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Search, Building, User, LandPlot, Ruler, HardHat, Construction } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const initialFormState = {
    tipo: 'lead',
    tipo_pessoa: 'pj',
    nome_razao_social: '',
    nome_fantasia: '',
    cpf_cnpj: '',
    rg_ie: '',
    email: '',
    telefone: '',
    endereco_obra: '',
    empreendimento: '',
    area_m2: '',
    arquitetura: true,
    engenharia: false,
    marcenaria: false,
    endereco: {
        cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
    },
    observacoes: '',
    procedencia_id: null,
    setor_id: null,
    categoria_id: null,
    equipe: null,
    especificador: '',
    ativo: true
};

const NovoLeadDialog = ({ open, onOpenChange, leads, setLeads, leadToEdit }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [procedencias, setProcedencias] = useState([]);
    const [setores, setSetores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [equipes, setEquipes] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            if(!open) return;
            const { data: procedenciasData } = await supabase.from('comercial_procedencias').select('*');
            const { data: setoresData } = await supabase.from('comercial_setores').select('*');
            const { data: categoriasData } = await supabase.from('comercial_categorias').select('*');
            const { data: equipesData } = await supabase.from('user_profiles').select('user_id, nome').eq('ativo', true);

            setProcedencias(procedenciasData || []);
            setSetores(setoresData || []);
            setCategorias(categoriasData || []);
            setEquipes(equipesData || []);
        };
        fetchData();
    }, [open]);

    useEffect(() => {
        if (leadToEdit) {
            setIsEditing(true);
            setFormData({ ...initialFormState, ...leadToEdit, tipo: leadToEdit.tipo || 'lead' });
        } else {
            setIsEditing(false);
            setFormData(initialFormState);
        }
    }, [leadToEdit, open]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCheckboxChange = (id, checked) => {
        setFormData(prev => ({ ...prev, [id]: checked }));
    }

    const handleSelectChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
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
                    estado: data.uf,
                }
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
        
        const submissionData = {
            ...formData,
            nome_razao_social: formData.tipo_pessoa === 'pj' ? formData.nome_razao_social : formData.nome_fantasia,
            area_m2: formData.area_m2 ? Number(formData.area_m2) : null,
        };

        let result;
        if (isEditing) {
            result = await supabase
                .from('entities')
                .update(submissionData)
                .eq('id', leadToEdit.id)
                .select()
                .single();
        } else {
            result = await supabase
                .from('entities')
                .insert(submissionData)
                .select()
                .single();
        }

        const { data, error } = result;
        
        if (error) {
            toast({ title: `Erro ao salvar ${formData.tipo}`, description: error.message, variant: "destructive" });
        } else {
            if (isEditing) {
                setLeads(prev => prev.map(item => item.id === data.id ? data : item));
            } else {
                setLeads(prev => [data, ...prev]);
            }
            toast({ title: "Sucesso!", description: `Registro salvo com sucesso.` });
            onOpenChange(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Registro' : 'Novo Registro'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                        <div className="md:col-span-4 flex justify-center">
                            <div className="inline-flex rounded-lg border p-1">
                                <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pj')} className={cn('px-4 py-1.5 text-sm', formData.tipo_pessoa === 'pj' ? 'bg-primary text-primary-foreground rounded-md shadow-sm' : 'bg-transparent text-muted-foreground')}><Building size={16} className="mr-2"/> Pessoa Jurídica</Button>
                                <Button type="button" onClick={() => handleSelectChange('tipo_pessoa', 'pf')} className={cn('px-4 py-1.5 text-sm', formData.tipo_pessoa === 'pf' ? 'bg-primary text-primary-foreground rounded-md shadow-sm' : 'bg-transparent text-muted-foreground')}><User size={16} className="mr-2"/> Pessoa Física</Button>
                            </div>
                        </div>

                        {formData.tipo_pessoa === 'pj' ? (
                        <>
                            <div className="space-y-2 md:col-span-2"><Label>Razão Social</Label><Input id="nome_razao_social" value={formData.nome_razao_social} onChange={handleInputChange} required /></div>
                            <div className="space-y-2 md:col-span-2"><Label>Nome Fantasia</Label><Input id="nome_fantasia" value={formData.nome_fantasia} onChange={handleInputChange} /></div>
                            <div className="space-y-2 md:col-span-2"><Label>CNPJ</Label><div className="flex gap-1"><Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} placeholder="00.000.000/0000-00" /><Button type="button" size="icon" variant="outline" onClick={() => handleBuscaCnpj(formData.cpf_cnpj)} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <Search />}</Button></div></div>
                            <div className="space-y-2 md:col-span-2"><Label>Atividade (CNAE)</Label><Input id="rg_ie" value={formData.rg_ie} onChange={handleInputChange} /></div>
                        </>
                        ) : (
                        <>
                            <div className="space-y-2 md:col-span-4"><Label>Nome Completo</Label><Input id="nome_fantasia" value={formData.nome_fantasia} onChange={handleInputChange} required /></div>
                            <div className="space-y-2 md:col-span-2"><Label>CPF</Label><Input id="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleInputChange} /></div>
                            <div className="space-y-2 md:col-span-2"><Label>RG</Label><Input id="rg_ie" value={formData.rg_ie} onChange={handleInputChange} /></div>
                        </>
                        )}
                        
                        <div className="space-y-2 md:col-span-2"><Label>Telefone</Label><Input id="telefone" value={formData.telefone} onChange={handleInputChange} /></div>
                        <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} /></div>
                        
                        <div className="space-y-2 md:col-span-4"><Label>Endereço da Obra</Label><Input id="endereco_obra" value={formData.endereco_obra} onChange={handleInputChange} /></div>
                        <div className="space-y-2 md:col-span-3"><Label>Empreendimento</Label><Input id="empreendimento" value={formData.empreendimento} onChange={handleInputChange} /></div>
                        <div className="space-y-2 md:col-span-1"><Label>Área (m²)</Label><Input id="area_m2" value={formData.area_m2} onChange={handleInputChange} type="number" step="0.01" /></div>

                        <div className="md:col-span-4 pt-2">
                            <Label className="font-semibold">Módulos de Interesse</Label>
                            <div className="flex items-center gap-6 mt-2">
                                <div className="flex items-center gap-2"><Checkbox id="arquitetura" checked={formData.arquitetura} onCheckedChange={(c) => handleCheckboxChange('arquitetura', c)} /><Label htmlFor="arquitetura" className="flex items-center gap-1"><LandPlot size={14}/> Arquitetura</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="engenharia" checked={formData.engenharia} onCheckedChange={(c) => handleCheckboxChange('engenharia', c)} /><Label htmlFor="engenharia" className="flex items-center gap-1"><Ruler size={14}/> Engenharia</Label></div>
                                <div className="flex items-center gap-2"><Checkbox id="marcenaria" checked={formData.marcenaria} onCheckedChange={(c) => handleCheckboxChange('marcenaria', c)} /><Label htmlFor="marcenaria" className="flex items-center gap-1"><Construction size={14}/> Marcenaria</Label></div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2"><Label>Procedência</Label><Select onValueChange={(v) => handleSelectChange('procedencia_id', v)} value={formData.procedencia_id}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{procedencias.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2 md:col-span-2"><Label>Setor</Label><Select onValueChange={(v) => handleSelectChange('setor_id', v)} value={formData.setor_id}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{setores.map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2 md:col-span-2"><Label>Categoria</Label><Select onValueChange={(v) => handleSelectChange('categoria_id', v)} value={formData.categoria_id}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2 md:col-span-2"><Label>Equipe Responsável</Label><Select onValueChange={(v) => handleSelectChange('equipe', v)} value={formData.equipe}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{equipes.map(e => <SelectItem key={e.user_id} value={e.user_id}>{e.nome}</SelectItem>)}</SelectContent></Select></div>
                         
                         <div className="md:col-span-4"><Label>Observações</Label><Textarea id="observacoes" value={formData.observacoes} onChange={handleInputChange} /></div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{isEditing ? 'Salvar Alterações' : 'Salvar Registro'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NovoLeadDialog;