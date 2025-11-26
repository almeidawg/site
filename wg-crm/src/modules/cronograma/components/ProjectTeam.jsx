import React, { useState, useMemo } from 'react';
import { useProjects } from '@/modules/cronograma/hooks/useProjects';
import { useTeams } from '@/modules/cronograma/hooks/useTeams';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Trash2, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
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

const ProjectTeam = ({ project }) => {
  const { members: allTeamMembers } = useTeams();
  const { addMemberToProject, removeMemberFromProject } = useProjects();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);

  const projectMembers = useMemo(() => {
    return project?.team?.map(pt => pt.member).filter(Boolean) || [];
  }, [project]);

  const availableMembers = useMemo(() => {
    const projectMemberIds = new Set(projectMembers.map(m => m.id));
    return allTeamMembers.filter(m => !projectMemberIds.has(m.id));
  }, [allTeamMembers, projectMembers]);
  
  const handleRemoveMember = async () => {
      if (!memberToRemove) return;
      const success = await removeMemberFromProject(project.id, memberToRemove.id);
      if(success) {
          toast({ title: 'Membro removido do projeto.' });
      } else {
          toast({ variant: 'destructive', title: 'Erro ao remover membro.' });
      }
      setMemberToRemove(null);
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Equipe do Projeto</h3>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full sm:w-[300px] justify-between">
              {value ? availableMembers.find((member) => member.id === value)?.name : "Adicionar membro..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full sm:w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Buscar membro..." />
              <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
              <CommandGroup>
                {availableMembers.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.id}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      setOpen(false);
                      addMemberToProject(project.id, currentValue)
                        .then(success => {
                           if (success) toast({ title: 'Membro adicionado!' });
                           else toast({ variant: 'destructive', title: 'Falha ao adicionar.' });
                           setValue('');
                        });
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === member.id ? "opacity-100" : "opacity-0")} />
                    {member.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {projectMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projectMembers.map(member => (
            <div key={member.id} className="border rounded-lg p-4 flex items-center gap-4 relative group">
              <Avatar>
                <AvatarImage src={member.profile_picture_url} alt={member.name} />
                <AvatarFallback>
                  {member.name ? member.name.charAt(0) : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-slate-500">{member.function}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setMemberToRemove(member)}
              >
                  <Trash2 className="h-4 w-4 text-red-500"/>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p>Nenhum membro na equipe deste projeto.</p>
          <p className="text-sm">Use o botão acima para adicionar membros.</p>
        </div>
      )}

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                <AlertDialogDescription>Deseja realmente remover {memberToRemove?.name} da equipe do projeto?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveMember} className="bg-red-500 hover:bg-red-600">Remover</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectTeam;
