import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { User, Building, Phone, Mail, MapPin, FileText, Banknote, AlertCircle, Users2, PlusCircle, Trash, Edit, Loader2, Link, Briefcase } from 'lucide-react';
    import { Badge } from '@/components/ui/badge';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
    import ActionIcons from '@/components/shared/ActionIcons';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    const BankAccountDialog = ({ open, onOpenChange, onSave, accountToEdit, entityId }) => {
        const [formData, setFormData] = useState({});
        const [isSaving, setIsSaving] = useState(false);
        const { toast } = useToast();

        useEffect(() => {
            if (accountToEdit) {
                setFormData(accountToEdit);
            } else {
                setFormData({
                    banco: '', agencia: '', conta: '', titular: '', cpf_cnpj_titular: '', pix_chave: '', pix_tipo: '', is_principal: false, entity_id: entityId
                });
            }
        }, [accountToEdit, open, entityId]);

        const handleChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSaving(true);
            const dataToSave = { ...formData };
            if (!dataToSave.id) { 
                const { data: existingAccounts, error: fetchError } = await supabase.from('bank_accounts').select('id').eq('entity_id', entityId).eq('is_principal', true);
                if (!fetchError && existingAccounts.length === 0) {
                    dataToSave.is_principal = true;
                }
            }

            const { error } = await supabase.from('bank_accounts').upsert(dataToSave);
            if (error) {
                toast({ title: "Erro ao salvar conta", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Conta salva com sucesso!" });
                onSave();
            }
            setIsSaving(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{formData.id ? 'Editar' : 'Nova'} Conta Bancária</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Banco</Label><Input id="banco" value={formData.banco || ''} onChange={handleChange} /></div>
                            <div className="space-y-1"><Label>Agência</Label><Input id="agencia" value={formData.agencia || ''} onChange={handleChange} /></div>
                        </div>
                        <div className="space-y-1"><Label>Conta</Label><Input id="conta" value={formData.conta || ''} onChange={handleChange} /></div>
                        <div className="space-y-1"><Label>Titular</Label><Input id="titular" value={formData.titular || ''} onChange={handleChange} /></div>
                        <div className="space-y-1"><Label>CPF/CNPJ do Titular</Label><Input id="cpf_cnpj_titular" value={formData.cpf_cnpj_titular || ''} onChange={handleChange} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><Label>Tipo de Chave PIX</Label>
                                <Select value={formData.pix_tipo || ''} onValueChange={(v) => setFormData(p => ({...p, pix_tipo: v}))}><SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger><SelectContent><SelectItem value="CPF/CNPJ">CPF/CNPJ</SelectItem><SelectItem value="Email">Email</SelectItem><SelectItem value="Telefone">Telefone</SelectItem><SelectItem value="Aleatória">Aleatória</SelectItem></SelectContent></Select>
                            </div>
                            <div className="space-y-1"><Label>Chave PIX</Label><Input id="pix_chave" value={formData.pix_chave || ''} onChange={handleChange} /></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isSaving}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    const FichaCliente = ({ pessoa, onEdit, onUpdate }) => {
        const { toast } = useToast();
        const [isAlertOpen, setIsAlertOpen] = useState(false);
        const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
        const [editingAccount, setEditingAccount] = useState(null);
        const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
        const [responsavelNome, setResponsavelNome] = useState('');

        useEffect(() => {
            const fetchResponsavel = async () => {
                if (pessoa?.responsavel_id) {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('nome')
                        .eq('user_id', pessoa.responsavel_id)
                        .single();
                    if (!error && data) {
                        setResponsavelNome(data.nome);
                    }
                } else {
                    setResponsavelNome('');
                }
            };
            fetchResponsavel();
        }, [pessoa]);

        const handleDelete = async () => {
            if (!pessoa) return;
            const { error } = await supabase.from('entities').delete().eq('id', pessoa.id);
            if (error) {
                toast({ title: "Erro ao excluir", description: error.message, variant: "destructive"});
            } else {
                toast({ title: "Excluído com sucesso!" });
                onUpdate();
            }
            setIsAlertOpen(false);
        };

        const handleBankDialog = (account = null) => {
            setEditingAccount(account);
            setIsBankDialogOpen(true);
        };
        
        const handleDeleteBankAccount = async (accountId) => {
            const { error } = await supabase.from('bank_accounts').delete().eq('id', accountId);
            if (error) {
                toast({ title: "Erro ao excluir conta", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Conta excluída" });
                onUpdate();
            }
        };

        const handleSetPrincipal = async (accountId) => {
            const { error } = await supabase.from('bank_accounts').update({ is_principal: true }).eq('id', accountId);
            if (error) {
                toast({ title: "Erro ao definir conta principal", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Conta principal atualizada!" });
                onUpdate();
            }
        };

        const handleGeneratePdf = async () => {
            if (!pessoa) return;
            setIsGeneratingPdf(true);
            try {
                const { data, error } = await supabase.functions.invoke('ficha-cadastral-pdf', {
                    body: { entity_id: pessoa.id }
                });
                if (error) throw error;
                
                const pdfUrl = data.url || (data instanceof Blob ? URL.createObjectURL(data) : null);

                if (pdfUrl) {
                    window.open(pdfUrl, '_blank');
                    toast({ title: "Ficha Cadastral Gerada!", description: "O download começará em breve." });
                } else {
                    throw new Error("URL do PDF não encontrada na resposta.");
                }

            } catch (error) {
                toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
            } finally {
                setIsGeneratingPdf(false);
            }
        };

        if (!pessoa) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg border-2 border-dashed">
                    <Users2 className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground">Nenhuma pessoa selecionada</h3>
                    <p className="text-muted-foreground">Clique em um cliente, fornecedor ou outro na lista para ver os detalhes.</p>
                </div>
            );
        }
        
        const { nome_razao_social, nome_fantasia, tipo, tipo_pessoa, email, telefone, cpf_cnpj, rg_ie, endereco, observacoes, dados_bancarios, drive_link, especificador } = pessoa;

        const renderInfoItem = (Icon, label, value, isLink = false) => value && (
            <div className="flex items-start">
                <Icon className="h-5 w-5 text-muted-foreground mr-3 mt-1 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-sm">{label}</p>
                    {isLink ? 
                        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{value}</a> :
                        <p className="text-muted-foreground text-sm">{value}</p>
                    }
                </div>
            </div>
        );

        return (
            <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                {tipo_pessoa === 'pf' ? <User className="h-6 w-6" /> : <Building className="h-6 w-6" />}
                                {nome_razao_social}
                            </CardTitle>
                            <CardDescription>{nome_fantasia || (tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica')}</CardDescription>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant={tipo === 'cliente' ? 'default' : 'secondary'}>{tipo}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {isGeneratingPdf ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ActionIcons onPdf={handleGeneratePdf} />}
                            <ActionIcons onEdit={() => onEdit(pessoa)} onDelete={() => setIsAlertOpen(true)} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {renderInfoItem(Mail, "Email", email)}
                                {renderInfoItem(Phone, "Telefone", telefone)}
                                {renderInfoItem(Link, "Google Drive", drive_link, true)}
                            </div>
                            <div className="space-y-4">
                                {renderInfoItem(FileText, tipo_pessoa === 'pf' ? "CPF" : "CNPJ", cpf_cnpj)}
                                {renderInfoItem(FileText, tipo_pessoa === 'pf' ? "RG" : "IE", rg_ie)}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {renderInfoItem(Briefcase, "Responsável", responsavelNome)}
                            </div>
                             <div className="space-y-4">
                                {renderInfoItem(Building, "Especificador", especificador)}
                            </div>
                        </div>
                        {endereco && (<div><h4 className="font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5"/> Endereço</h4><p className="text-muted-foreground text-sm">{endereco.logradouro}, {endereco.numero} {endereco.complemento && `- ${endereco.complemento}`}<br/>{endereco.bairro} - {endereco.cidade}/{endereco.uf}<br/>CEP: {endereco.cep}</p></div>)}
                        {observacoes && (<div><h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="h-5 w-5"/> Observações</h4><p className="text-muted-foreground text-sm bg-muted/50 p-3 rounded-md">{observacoes}</p></div>)}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold flex items-center gap-2"><Banknote className="h-5 w-5"/> Contas Bancárias</h4>
                                <Button size="sm" variant="outline" onClick={() => handleBankDialog()}><PlusCircle className="h-4 w-4 mr-2" /> Nova</Button>
                            </div>
                            <div className="space-y-2">
                                {dados_bancarios && dados_bancarios.length > 0 ? dados_bancarios.map(acc => (
                                    <div key={acc.id} className={`p-3 border rounded-md text-sm text-muted-foreground relative group ${acc.is_principal ? 'border-primary bg-primary/5' : ''}`}>
                                        {acc.is_principal && <Badge variant="secondary" className="absolute top-2 right-2">Principal</Badge>}
                                        <p><strong>{acc.banco}</strong> - Ag: {acc.agencia} | CC: {acc.conta}</p>
                                        <p>Titular: {acc.titular}</p>
                                        {acc.pix_chave && <p>PIX: {acc.pix_chave} ({acc.pix_tipo})</p>}
                                        <div className="absolute top-1 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                            {!acc.is_principal && <Button variant="link" size="sm" className="h-auto p-1 text-xs" onClick={() => handleSetPrincipal(acc.id)}>Tornar principal</Button>}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleBankDialog(acc)}><Edit className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteBankAccount(acc.id)}><Trash className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-center text-muted-foreground p-4">Nenhuma conta bancária cadastrada.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
            
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação excluirá permanentemente <span className="font-bold">{pessoa.nome_razao_social}</span>.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <BankAccountDialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen} onSave={() => { onUpdate(); setIsBankDialogOpen(false); }} accountToEdit={editingAccount} entityId={pessoa.id} />
            </>
        );
    };

    export default FichaCliente;