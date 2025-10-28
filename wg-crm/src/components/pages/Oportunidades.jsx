
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import NovaOportunidadeDialog from '@/components/oportunidades/NovaOportunidadeDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useLocalStorage('crm_oportunidades', []);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [oportunidadeToEdit, setOportunidadeToEdit] = useState(null);
  const [users, setUsers] = useState([]);
  const [entities] = useLocalStorage('crm_entities', []);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('id, nome');
    if (!error) setUsers(data);
  }, []);

  const fetchColumns = useCallback(async () => {
    setLoading(true);
    const { data: boardData, error: boardError } = await supabase
      .from('kanban_boards')
      .select('id, kanban_colunas(*, color:cor)')
      .eq('ambiente', 'oportunidades')
      .single();

    if (boardError || !boardData) {
      toast({ title: 'Erro ao carregar funil', description: boardError?.message || 'Quadro não encontrado', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const initialColumns = {};
    boardData.kanban_colunas
      .sort((a, b) => a.posicao - b.posicao)
      .forEach(col => {
        initialColumns[col.titulo.toLowerCase().replace(/ /g, '_')] = {
          id: col.id,
          name: col.titulo,
          color: col.color,
          items: []
        };
      });
    
    setColumns(initialColumns); // Set columns first
    distributeOportunidades(initialColumns); // Then distribute
    setLoading(false);
  }, [toast]);

  const distributeOportunidades = (currentColumns) => {
    const newColumns = JSON.parse(JSON.stringify(currentColumns));
    Object.keys(newColumns).forEach(key => newColumns[key].items = []);

    oportunidades.forEach(op => {
      const fase = op.fase;
      if (newColumns[fase]) {
        if (!newColumns[fase].items.some(item => item.id === op.id)) {
          newColumns[fase].items.push(op);
        }
      } else if (newColumns['qualificacao']) { // fallback
         newColumns['qualificacao'].items.push(op);
      }
    });
    setColumns(newColumns);
  };
  
  useEffect(() => {
    fetchUsers();
    fetchColumns();
  }, [fetchUsers, fetchColumns]);

  useEffect(() => {
    distributeOportunidades(columns);
  }, [oportunidades]);


  const handleOpenDialog = (oportunidade = null) => {
    setOportunidadeToEdit(oportunidade);
    setDialogOpen(true);
  };

  const onDragEnd = result => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const updatedItem = oportunidades.find(op => op.id === draggableId);
      if(!updatedItem) return;
      
      const newFase = destination.droppableId;
      updatedItem.fase = newFase;

      if (newFase === 'ganha') {
        updatedItem.status = 'ganha';
      } else if (newFase === 'perdida') {
        updatedItem.status = 'perdida';
      } else {
        updatedItem.status = 'ativa';
      }
      
      setOportunidades(prev => prev.map(op => op.id === draggableId ? updatedItem : op));
      
      toast({
        title: "Oportunidade Movida!",
        description: `Movida para a fase "${newFase}".`,
      });

    } else {
      // Reordering within the same column
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      const newColumns = {...columns, [source.droppableId]: { ...column, items: copiedItems }};
      setColumns(newColumns);
      
      // Update the main 'oportunidades' array to persist order if needed, though not strictly necessary for visual reordering.
    }
  };

  const updateOportunidade = (id, updates) => {
    setOportunidades(prevOportunidades => prevOportunidades.map(op => op.id === id ? { ...op, ...updates } : op));
  };
  
  const handleRenameColumn = async (columnId, newName) => {
    const { error } = await supabase
        .from('kanban_colunas')
        .update({ titulo: newName })
        .eq('id', columnId);

    if (error) {
        toast({ title: "Erro ao renomear coluna", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Coluna renomeada!", description: `A coluna foi renomeada para "${newName}".` });
        fetchColumns(); // Refresh all columns
    }
  };


  const handleNotImplemented = (feature) => {
    toast({
        title: `🚧 ${feature} em Breve!`,
        description: "Esta funcionalidade ainda não foi implementada.",
    });
  };

  const handleGenerateLink = (type) => {
    const url = `${window.location.origin}/cadastro/${type}/novo`;
    navigator.clipboard.writeText(url);
    toast({
      title: '🔗 Link de Cadastro Gerado!',
      description: `O link para cadastro de ${type} foi copiado.`,
    });
  };

  if(loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin text-wg-orange-base" /></div>
  }

  return <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Funil de Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu pipeline de vendas com o Kanban editável.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleGenerateLink('cliente')}>
            <LinkIcon size={16} className="mr-2" />
            Gerar Link
          </Button>
          <Button variant="outline" onClick={() => handleNotImplemented('Nova Coluna')}>
            <Plus size={16} className="mr-2" />
            Coluna
          </Button>
          <Button onClick={() => handleOpenDialog()} className="gradient-primary text-white">
            <Plus size={16} className="mr-2" />
            Oportunidade
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <KanbanBoard columns={columns} onDragEnd={onDragEnd} onRenameColumn={handleRenameColumn} onDeleteColumn={() => handleNotImplemented('Excluir')} onUpdateOportunidade={updateOportunidade} onEditOportunidade={handleOpenDialog} />
      </div>
      <NovaOportunidadeDialog open={dialogOpen} onOpenChange={setDialogOpen} setOportunidades={setOportunidades} oportunidadeToEdit={oportunidadeToEdit} users={users} clientes={entities.filter(e => e.tipo === 'cliente')} />
    </div>;
};
export default Oportunidades;
