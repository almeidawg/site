
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Users2, Edit, Loader2, UserPlus, Mail, KeyRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CriarUsuarioSenha from '@/components/usuarios/CriarUsuarioSenha';
import EditarUsuarioDialog from '@/components/usuarios/EditarUsuarioDialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const Usuarios = () => {
    const { profile, orgId } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const { toast } = useToast();
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isInviting, setIsInviting] = useState(false);

    const fetchUsers = useCallback(async () => {
        if (!orgId) {
            setLoadingUsers(false);
            return;
        }
        setLoadingUsers(true);
        const { data: profiles, error: profilesError } = await supabase
            .from('usuarios_perfis')
            .select('*')
            .eq('org_id', orgId);

        if (profilesError) {
            toast({ title: 'Erro ao buscar perfis', description: profilesError.message, variant: 'destructive' });
            setLoadingUsers(false);
            return;
        }

        try {
            const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
            if (usersError) throw usersError;

            const authUsersMap = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
            
            const combined = profiles.map(p => ({
                ...p,
                ...(authUsersMap[p.user_id] || {}), // merge auth data safely
            }));
            
            setUsuarios(combined);

        } catch (error) {
            toast({ title: 'Erro ao listar usuários', description: error.message, variant: 'destructive' });
            // Fallback to profiles only, but enrich with what we have
            const enrichedProfiles = profiles.map(p => ({ ...p, id: p.user_id, email: p.email || 'Não disponível' }));
            setUsuarios(enrichedProfiles);
        } finally {
            setLoadingUsers(false);
        }
    }, [toast, orgId]);

    useEffect(() => {
        if (orgId) {
            fetchUsers();
        }
    }, [fetchUsers, orgId]);
    
    const handleOpenEdit = (user) => {
        setEditUser({ ...user, new_email: '', new_password: '' });
        setIsEditOpen(true);
    };
    
    const handleSendInvite = async () => {
      if (!inviteEmail) {
        toast({ title: 'E-mail é obrigatório', variant: 'destructive'});
        return;
      }
      setIsInviting(true);
      const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
          data: { org_id: orgId, role: 'operacional' }
      });
      setIsInviting(false);
      
      if (error) {
          toast({ title: 'Erro ao enviar convite', description: error.message, variant: 'destructive' });
      } else {
          toast({ title: 'Convite enviado!', description: `Um link de acesso foi enviado para ${inviteEmail}.`});
          setIsInviteOpen(false);
          setInviteEmail('');
      }
    };

    const getProfileBadgeColor = (profileRole) => {
        const colors = {
            diretoria: 'bg-red-500 text-white',
            admin: 'bg-red-500 text-white',
            gestor: 'bg-yellow-500 text-black',
            arquitetura: 'bg-purple-500 text-white',
            engenharia: 'bg-orange-500 text-white',
            marcenaria: 'bg-amber-700 text-white',
            comercial: 'bg-blue-500 text-white',
            financeiro: 'bg-green-500 text-white',
            operacional: 'bg-gray-500 text-white'
        };
        return colors[profileRole] || 'bg-gray-400 text-white';
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users2 /> Usuários e Permissões
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os acessos e perfis da sua equipe.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsInviteOpen(true)} variant="outline">
                        <Mail className="mr-2 h-4 w-4" /> Convidar por E-mail
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <KeyRound className="mr-2 h-4 w-4" /> Criar com Senha
                    </Button>
                </div>
            </div>

            {loadingUsers ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : (
                <div className="space-y-3">
                    {usuarios.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-card rounded-lg border"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar_path} alt={user.nome} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                        {user.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.nome}</p>
                                    <p className="text-sm text-muted-foreground">{user.email || 'E-mail não disponível'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getProfileBadgeColor(user.role)}`}>
                                    {user.role}
                                </span>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.email_confirmed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {user.email_confirmed_at ? 'Ativo' : 'Pendente'}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            
            {isEditOpen && editUser && (
                <EditarUsuarioDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    user={editUser}
                    onUserUpdated={fetchUsers}
                    currentUserProfile={profile}
                />
            )}

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Convidar Usuário por E-mail</DialogTitle>
                        <DialogDescription>Um link mágico de login será enviado para o e-mail informado.</DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-2">
                        <Label htmlFor="invite-email">E-mail do Convidado</Label>
                        <Input id="invite-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@dominio.com"/>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSendInvite} disabled={isInviting}>
                             {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Enviar Convite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <CriarUsuarioSenha open={isCreateOpen} onOpenChange={setIsCreateOpen} onUserCreated={fetchUsers} />
            </Dialog>
        </div>
    );
};

export default Usuarios;
