import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2 } from 'lucide-react';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { useSupabaseFunction } from '@/hooks/useSupabaseFunction';
    
    const CriarUsuarioSenha = ({ open, onOpenChange, onUserCreated }) => {
        const { toast } = useToast();
        const { invoke: createUser, loading } = useSupabaseFunction('users-create');
        const [formData, setFormData] = useState({
            nome: '',
            email: '',
            password: '',
            telefone: '',
            role: 'operacional',
        });

        useEffect(() => {
            if (!open) {
                setFormData({ nome: '', email: '', password: '', telefone: '', role: 'operacional' });
            }
        }, [open]);

        const handleInputChange = (e) => {
            const { id, value } = e.target;
            setFormData(prev => ({ ...prev, [id]: value }));
        };
        
        const handleSelectChange = (value) => {
            setFormData(prev => ({ ...prev, role: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            const payload = {
                email: formData.email.trim(),
                password: formData.password,
                nome: formData.nome.trim(),
                telefone: formData.telefone.trim(),
                role: formData.role
            };

            if (!payload.email || !payload.password || !payload.nome) {
                toast({
                    title: 'Campos obrigatórios',
                    description: 'Nome, e-mail e senha são obrigatórios.',
                    variant: 'destructive',
                });
                return;
            }

            try {
                await createUser({
                    body: payload,
                    onSuccess: () => {
                        toast({
                            title: 'Sucesso!',
                            description: 'Novo usuário criado e perfil associado.',
                        });
                        onUserCreated();
                        onOpenChange(false);
                    },
                    onError: (errorMessage) => {
                         toast({
                            title: 'Erro ao criar usuário',
                            description: errorMessage,
                            variant: 'destructive',
                        });
                    }
                });
            } catch (err) {
                console.error("Submit failed:", err.message);
            }
        };

        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário com Senha</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar um novo acesso ao sistema. O usuário poderá fazer login imediatamente.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" value={formData.nome} onChange={handleInputChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" value={formData.telefone} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha Temporária</Label>
                                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Perfil de Acesso</Label>
                                <Select onValueChange={handleSelectChange} value={formData.role}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="gestor">Gestor</SelectItem>
                                        <SelectItem value="comercial">Comercial</SelectItem>
                                        <SelectItem value="operacional">Operacional</SelectItem>
                                        <SelectItem value="financeiro">Financeiro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Usuário
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        );
    };

    export default CriarUsuarioSenha;