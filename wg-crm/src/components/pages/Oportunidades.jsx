
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import KanbanColumn from '@/components/oportunidades/KanbanColumn';
import NovaOportunidadeDialog from '@/components/oportunidades/NovaOportunidadeDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react';

const Oportunidades = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [oportunidadeToEdit, setOportunidadeToEdit] = useState(null);
  const [users, setUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('id, nome');
    if (!error) setUsers(data);
  }, []);

  const fetchEntities = useCallback(async () => {
    const { data, error } = await supabase.from('entities').select('*');
    if (!error) setEntities(data || []);
  }, []);

  const fetchColumns = useCallback(async () => {
    setLoading(true);
    const { data: boardData, error: boardError } = await supabase
      .from('kanban_boards')
      .select('id, kanban_colunas(*, color:cor)')
      .eq('ambiente', 'oportunidades')
      .maybeSingle();

    if (boardError || !boardData) {
      toast({ title: 'Erro ao carregar funil', description: boardError?.message || 'Quadro não encontrado', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const initialColumns = {};
    const columnIdsMap = {}; // Map column IDs to column keys

    boardData.kanban_colunas
      .sort((a, b) => a.pos - b.pos)
      .forEach(col => {
        const key = col.nome.toLowerCase().replace(/ /g, '_');
        initialColumns[key] = {
          id: col.id,
          name: col.nome,
          color: col.cor,
          items: []
        };
        columnIdsMap[col.id] = key;
      });

    // Fetch all cards for this board
    const colunaIds = Object.values(initialColumns).map(col => col.id);
    if (colunaIds.length > 0) {
      const { data: cardsData, error: cardsError } = await supabase
        .from('kanban_cards')
        .select('*, entity:entities(nome)')
        .in('coluna_id', colunaIds);

      if (!cardsError && cardsData) {
        // Convert kanban_cards to oportunidades format
        const ops = cardsData.map(card => ({
          id: card.id,
          titulo: card.titulo,
          descricao: card.descricao,
          valor_previsto: parseFloat(card.valor) || 0,
          entity_id: card.entity_id,
          cliente_nome: card.entity?.nome || '',
          responsavel_id: card.responsavel_id,
          fase: columnIdsMap[card.coluna_id] || 'qualificacao',
          coluna_id: card.coluna_id,
          posicao: card.posicao,
          dados: card.dados,
          created_at: card.created_at,
          updated_at: card.updated_at
        }));
        setOportunidades(ops);

        // Distribute cards into columns and sort by position
        ops.forEach(op => {
          if (initialColumns[op.fase]) {
            initialColumns[op.fase].items.push(op);
          }
        });

        // Sort items within each column by position
        Object.keys(initialColumns).forEach(key => {
          initialColumns[key].items.sort((a, b) => a.posicao - b.posicao);
        });
      }
    }

    setColumns(initialColumns);
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
    fetchEntities();
    fetchColumns();
  }, [fetchUsers, fetchEntities, fetchColumns]);


  const handleOpenDialog = (oportunidade = null) => {
    setOportunidadeToEdit(oportunidade);
    setDialogOpen(true);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Moving to a different column
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      if (!sourceColumn || !destColumn) return;

      // Find the item being moved
      const movedItem = sourceColumn.items.find(item => item.id === draggableId);
      if (!movedItem) {
        console.error('❌ Item não encontrado:', draggableId);
        return;
      }

      const newFase = destination.droppableId;
      const newColunaId = destColumn.id;

      // Create updated item with new column info
      // Usar múltiplo de 10 para manter consistência com o banco
      const novaPosicao = (destination.index + 1) * 10;
      const updatedItem = {
        ...movedItem,
        fase: newFase,
        coluna_id: newColunaId,
        posicao: novaPosicao,
        status: newFase === 'ganha' ? 'ganha' : newFase === 'perdida' ? 'perdida' : 'ativa'
      };

      // 🔍 DEBUG: Log antes do UPDATE
      console.log('🎯 Movendo card:', {
        id: draggableId,
        de_coluna: movedItem.coluna_id,
        para_coluna: newColunaId,
        nova_posicao: novaPosicao,
        responsavel_id: movedItem.responsavel_id,
        user_atual: user?.id
      });

      // Update local state immediately (optimistic update)
      // 1. Remove from source column
      const sourceItems = [...sourceColumn.items];
      sourceItems.splice(source.index, 1);

      // 2. Add to destination column
      const destItems = [...destColumn.items];
      destItems.splice(destination.index, 0, updatedItem);

      // 3. Update columns state
      const newColumns = {
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      };
      setColumns(newColumns);

      // 4. Update oportunidades array
      setOportunidades(prev => prev.map(op => op.id === draggableId ? updatedItem : op));

      // Save to database
      // IMPORTANTE: O trigger espera posições como múltiplos de 10
      // E precisa ser diferente da posição antiga para não ser sobrescrito
      const { data, error } = await supabase
        .from('kanban_cards')
        .update({
          coluna_id: newColunaId,
          posicao: novaPosicao, // Já definida acima como (destination.index + 1) * 10
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId)
        .select(); // Adicionar .select() para retornar dados

      // 🔍 DEBUG: Log após UPDATE
      console.log('📝 Resultado do UPDATE:', {
        data: data,
        error: error,
        data_length: data?.length
      });

      if (error) {
        console.error('❌ Error moving card:', error);
        toast({
          title: "Erro ao mover card",
          description: error.message,
          variant: "destructive"
        });
        // Revert on error - reload from database
        fetchColumns();
      } else if (!data || data.length === 0) {
        // 🚨 UPDATE não encontrou o registro ou foi bloqueado por RLS
        console.error('⚠️ UPDATE não retornou dados - possível bloqueio RLS');
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para mover este card. Apenas o responsável ou gestores podem movê-lo.",
          variant: "destructive"
        });
        // Revert - reload from database
        fetchColumns();
      } else {
        // Show success toast ONLY after successful save
        console.log('✅ Card movido com sucesso!');
        toast({
          title: "Oportunidade Movida!",
          description: `Movida para a fase "${destColumn.name || newFase}".`,
        });
      }

    } else {
      // Reordering within the same column
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      // Update positions for all affected items
      const updatedItems = copiedItems.map((item, index) => ({
        ...item,
        posicao: index
      }));

      const newColumns = {
        ...columns,
        [source.droppableId]: { ...column, items: updatedItems }
      };
      setColumns(newColumns);

      // Save new position to database
      // IMPORTANTE: Converter para múltiplo de 10 para compatibilidade com o trigger
      const novaPosicao = (destination.index + 1) * 10;

      // 🔍 DEBUG: Log reordenação
      console.log('🔄 Reordenando card:', {
        id: draggableId,
        coluna: source.droppableId,
        de_posicao: source.index,
        para_posicao: destination.index,
        nova_posicao_db: novaPosicao
      });

      const { data, error } = await supabase
        .from('kanban_cards')
        .update({
          posicao: novaPosicao,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId)
        .select(); // Adicionar .select() para verificar resultado

      // 🔍 DEBUG: Log resultado
      console.log('📝 Resultado reordenação:', {
        data: data,
        error: error,
        data_length: data?.length
      });

      if (error) {
        console.error('❌ Error updating card position:', error);
        toast({
          title: "Erro ao reordenar card",
          description: error.message,
          variant: "destructive"
        });
        // Revert on error
        fetchColumns();
      } else if (!data || data.length === 0) {
        console.error('⚠️ Reordenação bloqueada por RLS');
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para reordenar este card.",
          variant: "destructive"
        });
        fetchColumns();
      } else {
        console.log('✅ Card reordenado com sucesso!');
      }
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto p-2 h-full">
            {Object.entries(columns).map(([columnId, column]) => (
              <KanbanColumn
                key={columnId}
                column={column}
                columnId={columnId}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={() => handleNotImplemented('Excluir')}
                onUpdateOportunidade={updateOportunidade}
                onEditOportunidade={handleOpenDialog}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
      <NovaOportunidadeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        setOportunidades={setOportunidades}
        oportunidadeToEdit={oportunidadeToEdit}
        users={users}
        clientes={entities.filter(e => e.tipo === 'cliente')}
        onClientCreated={fetchEntities}
      />
    </div>;
};
export default Oportunidades;
