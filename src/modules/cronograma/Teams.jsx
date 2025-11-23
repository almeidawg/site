
import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Users as UsersIcon, Edit, Trash2, Camera, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useTeams } from '@/hooks/useTeams';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TeamMemberForm = ({ member, onSubmit, onFinished }) => {
    const { toast } = useToast();
    const { uploadProfilePicture } = useTeams();
    const [formData, setFormData] = useState({
        name: member?.name || '',
        rg: member?.rg || '',
        cpf: member?.cpf || '',
        function: member?.function || '',
        phone: member?.phone || '',
        profile_picture_url: member?.profile_picture_url || '',
    });
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        toast({ title: "Enviando foto..." });
        const publicUrl = await uploadProfilePicture(file);
        setIsUploading(false);

        if (publicUrl) {
            setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }));
            toast({ title: "Foto enviada com sucesso!" });
        } else {
            toast({ variant: 'destructive', title: "Falha no upload da foto." });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
        onFinished();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative">
                    {isUploading ? (
                        <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                        </div>
                    ) : formData.profile_picture_url ? (
                        <img src={formData.profile_picture_url} alt="Foto de perfil" className="h-24 w-24 rounded-full object-cover"/>
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-12 w-12 text-slate-500" />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                        <Camera className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="cpf">CPF</Label><Input id="cpf" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00"/></div>
                <div><Label htmlFor="rg">RG</Label><Input id="rg" value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} placeholder="00.000.000-0"/></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="function">Função</Label><Input id="function" value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="Ex: Eletricista" required/></div>
                <div><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000"/></div>
            </div>
            <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Enviando foto...' : (member ? 'Salvar Alterações' : 'Adicionar Membro')}
            </Button>
        </form>
    );
};

const Teams = () => {
  const { toast } = useToast();
  const { teamMembers, loading, addMember, updateMember, deleteMember } = useTeams();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogState, setEditDialogState] = useState({ open: false, member: null });
  const [deleteMemberState, setDeleteMemberState] = useState({ open: false, member: null });

  const handleAddMember = async (data) => {
    const success = await addMember(data);
    if(success) toast({ title: 'Membro adicionado!' });
    else toast({ variant: 'destructive', title: 'Erro ao adicionar membro.' });
  };

  const handleUpdateMember = async (data) => {
    const success = await updateMember(editDialogState.member.id, data);
    if (success) toast({ title: 'Membro atualizado!' });
    else toast({ variant: 'destructive', title: 'Erro ao atualizar membro.' });
  };

  const handleDeleteMember = async () => {
      if(!deleteMemberState.member) return;
      const success = await deleteMember(deleteMemberState.member.id);
      if (success) toast({ title: `${deleteMemberState.member.name} foi excluído.` });
      else toast({ variant: 'destructive', title: 'Erro ao excluir membro.' });
      setDeleteMemberState({ open: false, member: null });
  };

  return (
    <>
      <Helmet>
        <title>Equipes - WGEasy Cronograma</title>
        <meta name="description" content="Gerencie equipes e calendários de trabalho" />
      </Helmet>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Equipes</h1>
              <p className="text-slate-600 mt-2">Gerencie os membros da sua equipe</p>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"><Plus className="h-4 w-4 mr-2" />Novo Membro</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Novo Membro</DialogTitle></DialogHeader>
                    <TeamMemberForm onSubmit={handleAddMember} onFinished={() => setAddDialogOpen(false)} />
                </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teamMembers.map(member => (
                <motion.div key={member.id} className="bg-white rounded-xl shadow-lg border p-4 text-center flex flex-col items-center group">
                    {member.profile_picture_url ? (
                        <img src={member.profile_picture_url} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
                            <User className="w-12 h-12 text-slate-500" />
                        </div>
                    )}
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{member.function}</p>
                    <p className="text-xs text-slate-500 mt-1">CPF: {member.cpf || 'N/A'}</p>
                    <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" onClick={() => setEditDialogState({ open: true, member })}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteMemberState({open: true, member: member})}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
              <UsersIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum membro na equipe</h3>
              <p className="text-slate-600">Adicione o primeiro membro para começar a montar sua equipe.</p>
            </div>
          )}
            
            <AlertDialog open={deleteMemberState.open} onOpenChange={(open) => !open && setDeleteMemberState({ open: false, member: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>Deseja realmente excluir {deleteMemberState.member?.name}?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteMemberState({ open: false, member: null })}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMember} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

           <Dialog open={editDialogState.open} onOpenChange={(open) => setEditDialogState({ open, member: open ? editDialogState.member : null })}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Editar Membro da Equipe</DialogTitle></DialogHeader>
                    {editDialogState.member && <TeamMemberForm member={editDialogState.member} onSubmit={handleUpdateMember} onFinished={() => setEditDialogState({ open: false, member: null })} />}
                </DialogContent>
            </Dialog>
        </div>
      </div>
    </>
  );
};

export default Teams;
