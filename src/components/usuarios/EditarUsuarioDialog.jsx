
import React, { useState, useEffect } from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Switch } from '@/components/ui/switch';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useSupabaseFunction } from '@/hooks/useSupabaseFunction';
    import { supabase } from '@/lib/customSupabaseClient';

    const EditarUsuarioDialog = ({ open, onOpenChange, user, onUserUpdated, currentUserProfile }) => {
        const [editUser, setEditUser] = useState(user);
        const { toast } = useToast();
        const { invoke: adminUpdateUser, loading: isUpdatingLogin } = useSupabaseFunction('admin-update-user');
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            if (user) {
                setEditUser({ ...user, new_email: '', new_password: '' });
            }
        }, [user]);
        
        const handleUpdateUser = async () => {
            if (!editUser) return;
            setIsSubmitting(true);

            try {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update({
                        nome: editUser.nome,
                        role: editUser.role,
                        ativo: editUser.ativo
                    })
                    .eq('user_id', editUser.user_id);
                
                if (profileError) throw new Error(`Falha ao atualizar perfil: ${profileError.message}`);

                const hasLoginChanges = editUser.new_email || editUser.new_password;

                if (currentUserProfile?.master && hasLoginChanges) {
                    await adminUpdateUser({
                        body: {
                            target_user_id: editUser.user_id,
                            email: editUser.new_email || undefined,
                            password: editUser.new_password || undefined,
                        },
                        onError: (msg) => { throw new Error(`Falha ao atualizar login: ${msg}`); }
                    });
                }
                
                toast({ title: 'Usuário atualizado com sucesso!' });
                onUserUpdated();
                onOpenChange(false);
            
            } catch (error) {
                toast({ title: 'Erro ao atualizar usuário', description: error.message, variant: 'destructive' });
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>Ajuste as informações e permissões do usuário.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input id="nome" value={editUser?.nome || ''} onChange={(e) => setEditUser({...editUser, nome: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Perfil</Label>
                            <Select value={editUser?.role || ''} onValueChange={(value) => setEditUser({...editUser, role: value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {["admin","gestor","comercial","operacional","financeiro"].map(r=><SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                           <Switch id="ativo" checked={editUser?.ativo || false} onCheckedChange={(checked) => setEditUser({...editUser, ativo: checked})} />
                            <Label htmlFor="ativo">Usuário Ativo</Label>
                        </div>
                        
                        {currentUserProfile?.master && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-destructive">Controle Master</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="new_email">Novo E-mail de Login</Label>
                                    <Input id="new_email" type="email" placeholder="Deixe em branco para não alterar" value={editUser?.new_email || ''} onChange={(e) => setEditUser({...editUser, new_email: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">Nova Senha</Label>
                                    <Input id="new_password" type="password" placeholder="Deixe em branco para não alterar" value={editUser?.new_password || ''} onChange={(e) => setEditUser({...editUser, new_password: e.target.value})} />
                                </div>
                            </div>
                        )}

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateUser} disabled={isSubmitting || isUpdatingLogin}>
                            {(isSubmitting || isUpdatingLogin) && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    export default EditarUsuarioDialog;
