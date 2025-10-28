
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Users2, ShieldAlert, Edit, Trash2, Send, Loader2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Can } from '@/contexts/SupabaseAuthContext';

const EditUsuarioDialog = ({ open, onOpenChange, userToEdit, onUserUpdate }) => {
    const [nome, setNome] = useState('');
    const [role, setRole] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (userToEdit) {
            setNome(userToEdit.nome || '');
            setRole(userToEdit.role || 'operacional');
        }
    }, [userToEdit]);

    const handleSave = async () => {
        if (!nome || !role) {
            toast({ title: 'Campos obrigatórios', variant: 'destructive' });
            return;
        }
        setIsSaving(true);

        const { data: profileData, error: profileError } = await supabase
            .from('usuarios_perfis')
            .update({ nome, role })
            .eq('user_id', userToEdit.id)
            .select()
            .single();

        if (profileError) {
            toast({ title: 'Erro ao atualizar perfil', description: profileError.message, variant: 'destructive' });
        } else {
            toast({ title: 'Usuário atualizado!' });
            onUserUpdate(profileData);
            onOpenChange(false);
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                    <DialogDescription>Altere o nome e o perfil de acesso do usuário.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Perfil de Acesso</Label>
                        <Select onValueChange={setRole} value={role}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="operacional">Operacional</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                <SelectItem value="comercial">Comercial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditUsuarioDialogOpen, setIsEditUsuarioDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const { toast } = useToast();
    const { user, session } = useAuth();
    const [profile, setProfile] = useState(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    
    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const { data, error } = await supabase.from('usuarios_perfis').select('*').eq('user_id', user.id).maybeSingle();
                if (error) {
                    toast({title: 'Erro ao buscar perfil do usuário', description: error.message, variant: 'destructive'});
                }
                if (data) setProfile(data);
            }
        };
        fetchProfile();
    }, [user, toast]);

    const fetchUsers = async () => {
        setLoading(true);
        const { data: authUsers, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            toast({ title: "Erro ao buscar usuários", description: error.message, variant: "destructive" });
            setUsuarios([]);
        } else {
            const userIds = authUsers.users.map(u => u.id);
            const { data: profilesData, error: profilesError } = await supabase
                .from('usuarios_perfis')
                .select('*')
                .in('user_id', userIds);

            if(profilesError){
                 toast({ title: "Erro ao buscar perfis", description: profilesError.message, variant: "destructive" });
                 setUsuarios([]);
            } else {
                 const combinedUsers = authUsers.users.map((u) => {
                    const userProfile = profilesData.find(p => p.user_id === u.id) || {};
                    return {
                        id: u.id,
                        email: u.email,
                        ...userProfile
                    };
                });
                setUsuarios(combinedUsers);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [toast, profile]);

    const handleNotImplemented = () => {
        toast({
            title: "🚧 Funcionalidade em desenvolvimento",
        });
    };

    const handleEditUser = (user) => {
        setUserToEdit(user);
        setIsEditUsuarioDialogOpen(true);
    };

    const handleUserUpdate = (updatedUser) => {
        setUsuarios(prev => prev.map(u => u.user_id === updatedUser.user_id ? { ...u, ...updatedUser } : u));
    };

    const getProfileBadgeColor = (role) => {
        const colors = {
            admin: 'bg-red-700 text-white',
            gestor: 'bg-orange-500 text-white',
            comercial: 'bg-blue-500 text-white',
            financeiro: 'bg-green-500 text-white',
            operacional: 'bg-gray-500 text-white',
        };
        return colors[role] || 'bg-gray-400 text-white';
    }
    
    if (profile && profile.role !== 'admin') {
         return (
             <div className="max-w-4xl mx-auto text-center mt-8">
                <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
                <h3 className="mt-4 text-lg font-semibold">Acesso Restrito</h3>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    Apenas usuários com perfil "Admin" podem visualizar e gerenciar os usuários do sistema.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <EditUsuarioDialog 
                open={isEditUsuarioDialogOpen} 
                onOpenChange={setIsEditUsuarioDialogOpen} 
                userToEdit={userToEdit}
                onUserUpdate={handleUserUpdate}
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-3">
                        <Users2 /> Usuários e Permissões
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os acessos e perfis da sua equipe.
                    </p>
                </div>
                <Button onClick={handleNotImplemented}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                </Button>
            </div>

            <div className="space-y-3">
                {usuarios.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-200"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar_url} alt={user.nome} style={{objectFit: 'cover'}} />
                                <AvatarFallback className="gradient-primary text-white font-semibold">
                                    {user.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.nome || 'Nome não definido'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getProfileBadgeColor(user.role)}`}>
                                {user.role || 'indefinido'}
                            </span>
                           <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                           <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-100" onClick={handleNotImplemented}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Usuarios;
