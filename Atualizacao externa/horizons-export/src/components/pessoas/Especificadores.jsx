import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, UserCheck, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActionIcons from '@/components/shared/ActionIcons';

const NovoEspecificadorDialog = ({ open, onOpenChange, onSave, especificadorToEdit, allEspecificadores, allUsers }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const initialFormData = { 
        nome_empresa: '', email: '', telefone1: '', cpf: '', is_master: false, master_id: null, indicado_por: null 
    };
    const [formData, setFormData] = useState(initialFormData);
    const [comissaoNiveis, setComissaoNiveis] = useState([{ valor_de: '', valor_ate: '', percentual: '' }]);

    const fetchComissaoNiveis = useCallback(async (especificadorId) => {
        if (!especificadorId) {
            setComissaoNiveis([{ valor_de: '', valor_ate: '', percentual: '' }]);
            return;
        }
        const { data, error } = await supabase.from('especificador_comissao_niveis').select('*').eq('especificador_id', especificadorId);
        if (error) {
            toast({ title: 'Erro ao buscar níveis de comissão', variant: 'destructive' });
        } else {
            setComissaoNiveis(data.length > 0 ? data : [{ valor_de: '', valor_ate: '', percentual: '' }]);
        }
    }, [toast]);

    useEffect(() => {
        if (especificadorToEdit) {
            setIsEditing(true);
            const dataToEdit = { ...initialFormData, ...especificadorToEdit };
            dataToEdit.master_id = dataToEdit.master_id || 'none';
            dataToEdit.indicado_por = dataToEdit.indicado_por || 'none';
            setFormData(dataToEdit);
            fetchComissaoNiveis(especificadorToEdit.id);
        } else {
            setIsEditing(false);
            setFormData(initialFormData);
            setComissaoNiveis([{ valor_de: '', valor_ate: '', percentual: '' }]);
        }
    }, [especificadorToEdit, open, fetchComissaoNiveis]);

    const handleComissaoChange = (index, field, value) => {
        const newNiveis = [...comissaoNiveis];
        newNiveis[index][field] = value;
        setComissaoNiveis(newNiveis);
    };

    const addComissaoNivel = () => setComissaoNiveis([...comissaoNiveis, { valor_de: '', valor_ate: '', percentual: '' }]);
    const removeComissaoNivel = (index) => setComissaoNiveis(comissaoNiveis.filter((_, i) => i !== index));

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value === 'none' ? null : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Salvar ou atualizar o especificador principal
            let especificadorData;
            const { error: especError, data: especData } = await supabase
                .from('especificadores')
                .upsert({ ...formData }, { onConflict: 'id' })
                .select()
                .single();
            
            if (especError) throw especError;
            especificadorData = especData;
            
            // 2. Apagar níveis antigos para simplificar
            const { error: deleteError } = await supabase.from('especificador_comissao_niveis').delete().eq('especificador_id', especificadorData.id);
            if(deleteError) throw deleteError;

            // 3. Inserir novos níveis de comissão
            const niveisParaSalvar = comissaoNiveis
                .filter(n => n.valor_de && n.valor_ate && n.percentual)
                .map(n => ({ ...n, especificador_id: especificadorData.id }));
            
            if (niveisParaSalvar.length > 0) {
                const { error: niveisError } = await supabase.from('especificador_comissao_niveis').insert(niveisParaSalvar);
                if (niveisError) throw niveisError;
            }

            toast({ title: 'Sucesso!', description: `Especificador ${isEditing ? 'atualizado' : 'criado'}.` });
            onSave();
        } catch (error) {
            console.error("Erro DB:", error);
            toast({ title: 'Erro ao salvar especificador', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Especificador' : 'Novo Especificador'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                    {/* Campos Principais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="nome_empresa">Nome</Label><Input id="nome_empresa" value={formData.nome_empresa || ''} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label htmlFor="telefone1">Telefone</Label><Input id="telefone1" value={formData.telefone1 || ''} onChange={handleChange} /></div>
                        <div className="space-y-2"><Label htmlFor="cpf">CPF</Label><Input id="cpf" value={formData.cpf || ''} onChange={handleChange} /></div>
                    </div>

                    {/* Hierarquia */}
                    <div className="border-t pt-4 mt-4 space-y-4">
                         <h3 className="text-md font-semibold">Hierarquia e Vínculos</h3>
                        <div className="flex items-center space-x-2"><Switch id="is_master" checked={formData.is_master} onCheckedChange={c => setFormData(p => ({...p, is_master: c}))} /><Label htmlFor="is_master">É um especificador Master?</Label></div>
                        <div className="space-y-2"><Label>Master (Líder da Rede)</Label>
                            <Select value={formData.master_id || 'none'} onValueChange={v => handleSelectChange('master_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                <SelectContent><SelectItem value="none">Nenhum</SelectItem>{allEspecificadores.filter(e => e.is_master && e.id !== formData.id).map(e => <SelectItem key={e.id} value={e.id}>{e.nome_empresa}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Indicado Por (Usuário do Sistema)</Label>
                            <Select value={formData.indicado_por || 'none'} onValueChange={v => handleSelectChange('indicado_por', v)}>
                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                <SelectContent><SelectItem value="none">Nenhum</SelectItem>{allUsers.map(u => <SelectItem key={u.user_id} value={u.user_id}>{u.nome}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Níveis de Comissão */}
                    <div className="border-t pt-4 mt-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-semibold">Níveis de Comissão (Cotas)</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addComissaoNivel}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nível</Button>
                        </div>
                        {comissaoNiveis.map((nivel, index) => (
                            <div key={index} className="grid grid-cols-10 gap-2 items-center">
                                <div className="space-y-1 col-span-3"><Label>De (R$)</Label><Input type="number" placeholder="0" value={nivel.valor_de} onChange={(e) => handleComissaoChange(index, 'valor_de', e.target.value)} /></div>
                                <div className="space-y-1 col-span-3"><Label>Até (R$)</Label><Input type="number" placeholder="40000" value={nivel.valor_ate} onChange={(e) => handleComissaoChange(index, 'valor_ate', e.target.value)} /></div>
                                <div className="space-y-1 col-span-3"><Label>Percentual (%)</Label><Input type="number" placeholder="3" value={nivel.percentual} onChange={(e) => handleComissaoChange(index, 'percentual', e.target.value)} /></div>
                                <div className="col-span-1 self-end">
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeComissaoNivel(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading && <Loader2 className="animate-spin mr-2 h-4 w-4"/>} Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const Especificadores = () => {
    const [especificadores, setEspecificadores] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [{ data: especData, error: especError }, { data: usersData, error: usersError }] = await Promise.all([
            supabase.from('especificadores').select('*').order('created_at', { ascending: false }),
            supabase.from('user_profiles').select('user_id, nome')
        ]);
        
        if (especError) toast({ title: 'Erro ao buscar especificadores', variant: 'destructive' });
        else setEspecificadores(especData || []);

        if (usersError) toast({ title: 'Erro ao buscar usuários', variant: 'destructive' });
        else setUsers(usersData || []);

        setLoading(false);
    }, [toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = () => {
        fetchData();
        setIsDialogOpen(false);
        setEditing(null);
    };

    const handleOpenDialog = (item = null) => {
        setEditing(item);
        setIsDialogOpen(true);
    };
    
    const handleDelete = async (id) => {
        const { error } = await supabase.from('especificadores').delete().eq('id', id);
        if(error) {
            console.error("Erro ao excluir:", error)
            toast({title: 'Erro ao excluir', description: error.message, variant: 'destructive'});
        }
        else {
            toast({title: 'Excluído com sucesso!'});
            fetchData();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                 <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Novo Especificador</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Master</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan="4" className="h-24 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></TableCell></TableRow>
                        ) : especificadores.length > 0 ? (
                            especificadores.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.nome_empresa} {item.is_master && <UserCheck className="h-4 w-4 inline ml-2 text-amber-500"/>}</TableCell>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{especificadores.find(e => e.id === item.master_id)?.nome_empresa || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <ActionIcons
                                            onEdit={() => handleOpenDialog(item)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                           <TableRow><TableCell colSpan="4" className="h-24 text-center">Nenhum especificador cadastrado.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <NovoEspecificadorDialog 
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
                especificadorToEdit={editing}
                allEspecificadores={especificadores}
                allUsers={users}
            />
        </div>
    );
};

export default Especificadores;