import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Trash, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useBancos } from '@/hooks/useBancos';

const BankAccountsCard = ({ entityId, entityName }) => {
    const { data: accounts, isLoading, addAccount, updateAccount, deleteAccount } = useBankAccounts(entityId);
    const { data: bancos } = useBancos();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        banco: '',
        agencia: '',
        conta: '',
        titular: '',
        cpf_cnpj_titular: '',
        pix_tipo: '',
        pix_chave: '',
        is_principal: false
    });

    const resetForm = () => {
        setFormData({
            banco: '',
            agencia: '',
            conta: '',
            titular: '',
            cpf_cnpj_titular: '',
            pix_tipo: '',
            pix_chave: '',
            is_principal: false
        });
        setIsFormOpen(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await addAccount.mutateAsync(formData);
            toast({ title: "Conta bancária adicionada!" });
            resetForm();
        } catch (error) {
            toast({ title: "Erro ao adicionar conta", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteAccount.mutateAsync(id);
            toast({ title: "Conta removida!", variant: "destructive" });
        } catch (error) {
            toast({ title: "Erro ao remover conta", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Contas Bancárias</h3>
                </div>
                <Button size="sm" onClick={() => setIsFormOpen(!isFormOpen)}>
                    <Plus className="h-4 w-4 mr-1" />
                    {isFormOpen ? 'Cancelar' : 'Adicionar'}
                </Button>
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSave}
                        className="space-y-4 p-4 border rounded-lg bg-white/70"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="banco">Banco</Label>
                                <Select value={formData.banco} onValueChange={(value) => setFormData({ ...formData, banco: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o banco" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bancos?.map(banco => (
                                            <SelectItem key={banco.id} value={banco.nome}>
                                                {banco.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="titular">Titular</Label>
                                <Input
                                    id="titular"
                                    value={formData.titular}
                                    onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                                    placeholder={entityName || "Nome do titular"}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="agencia">Agência</Label>
                                <Input
                                    id="agencia"
                                    value={formData.agencia}
                                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="conta">Conta</Label>
                                <Input
                                    id="conta"
                                    value={formData.conta}
                                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf_cnpj_titular">CPF/CNPJ do Titular</Label>
                                <Input
                                    id="cpf_cnpj_titular"
                                    value={formData.cpf_cnpj_titular}
                                    onChange={(e) => setFormData({ ...formData, cpf_cnpj_titular: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pix_tipo">Tipo de Chave PIX</Label>
                                <Select value={formData.pix_tipo} onValueChange={(value) => setFormData({ ...formData, pix_tipo: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cpf">CPF</SelectItem>
                                        <SelectItem value="cnpj">CNPJ</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="telefone">Telefone</SelectItem>
                                        <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pix_chave">Chave PIX</Label>
                                <Input
                                    id="pix_chave"
                                    value={formData.pix_chave}
                                    onChange={(e) => setFormData({ ...formData, pix_chave: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_principal"
                                checked={formData.is_principal}
                                onChange={(e) => setFormData({ ...formData, is_principal: e.target.checked })}
                                className="rounded"
                            />
                            <Label htmlFor="is_principal">Conta Principal</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                            <Button type="submit">Salvar</Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Carregando...</div>
                ) : accounts && accounts.length > 0 ? (
                    accounts.map(account => (
                        <div key={account.id} className="p-4 bg-white/80 rounded-lg border flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{account.banco}</p>
                                    {account.is_principal && (
                                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Principal</span>
                                    )}
                                </div>
                                {account.titular && <p className="text-sm text-gray-600">Titular: {account.titular}</p>}
                                <p className="text-sm text-gray-600">
                                    Ag: {account.agencia} / Conta: {account.conta}
                                </p>
                                {account.pix_chave && (
                                    <p className="text-sm text-gray-600">
                                        PIX ({account.pix_tipo}): {account.pix_chave}
                                    </p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-white/50 rounded-lg border border-dashed">
                        <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>Nenhuma conta bancária cadastrada</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankAccountsCard;
