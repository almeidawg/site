
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import KanbanColumn from '@/components/oportunidades/KanbanColumn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const AddColumnForm = ({ boardId, onColumnAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [columnName, setColumnName] = useState('');
  const { toast } = useToast();

  const handleAddColumn = async () => {
    if (!columnName.trim()) {
      setIsAdding(false);
      return;
    }
    const { data: newColumn, error } = await supabase
      .from('kanban_colunas')
      .insert({ board_id: boardId, nome: columnName, pos: 9999 }) // Let trigger handle pos
      .select()
      .single();
    
    if (error) {
      toast({ title: 'Erro ao criar coluna', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Coluna adicionada!' });
      onColumnAdded(newColumn);
      setColumnName('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <Button onClick={() => setIsAdding(true)} variant="outline" className="min-w-[272px]">
        <Plus className="mr-2 h-4 w-4" /> Adicionar outra lista
      </Button>
    );
  }

  return (
    <div className="bg-muted p-2 rounded-lg min-w-[272px]">
      <Input
        placeholder="Insira o título da lista..."
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
        autoFocus
      />
      <div className="mt-2 flex items-center gap-2">
        <Button onClick={handleAddColumn}>Adicionar Lista</Button>
        <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const KanbanBoard = ({ boardId }) => {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [actionCounter, setActionCounter] = useState(0);

  const refreshBoard = useCallback(() => setActionCounter(p => p + 1), []);

  const fetchBoardData = useCallback(async (currentBoardId) => {
    if (!currentBoardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log(`[KanbanBoard] Fetching data for board: ${currentBoardId}`);
      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_colunas')
        .select('*')
        .eq('board_id', currentBoardId)
        .order('pos', { ascending: true });

      if (columnsError) throw columnsError;
      console.log('[KanbanBoard] Columns fetched:', columnsData);
      setColumns(columnsData || []);

      const { data: cardsData, error: cardsError } = await supabase
        .from('kanban_cards')
        .select('*, cliente:cliente_id(nome_razao_social)')
        .eq('board_id', currentBoardId)
        .is('deleted_at', null);

      if (cardsError) throw cardsError;
      console.log('[KanbanBoard] Cards fetched:', cardsData);

      const cardsByColumn = (cardsData || []).reduce((acc, card) => {
        const columnId = card.coluna_id;
        if (!acc[columnId]) {
          acc[columnId] = [];
        }
        acc[columnId].push(card);
        acc[columnId].sort((a,b) => a.ordem - b.ordem);
        return acc;
      }, {});
      setCards(cardsByColumn);

    } catch (error) {
      console.error("[KanbanBoard] Error fetching board data:", error);
      toast({ title: 'Erro ao carregar o quadro', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBoardData(boardId);
  }, [fetchBoardData, boardId, actionCounter]);
  
  const handleColumnAdded = (newColumn) => {
    setColumns(prev => [...prev, newColumn]);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === 'column') {
        // Column reordering is not implemented in this version
        return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const startColumnCards = Array.from(cards[source.droppableId] || []);
    const [movedCard] = startColumnCards.splice(source.index, 1);

    // Optimistic UI Update
    if (source.droppableId === destination.droppableId) {
        startColumnCards.splice(destination.index, 0, movedCard);
        const newCardsState = { ...cards, [source.droppableId]: startColumnCards };
        setCards(newCardsState);
        
        const updates = startColumnCards.map((card, index) => ({ id: card.id, ordem: index }));
        const { error } = await supabase.from('kanban_cards').upsert(updates);
        if (error) {
            toast({ title: 'Erro ao reordenar card.', variant: 'destructive' });
            refreshBoard();
        }
    } else {
        const finishColumnCards = Array.from(cards[destination.droppableId] || []);
        finishColumnCards.splice(destination.index, 0, movedCard);
        const newCardsState = {
            ...cards,
            [source.droppableId]: startColumnCards,
            [destination.droppableId]: finishColumnCards,
        };
        setCards(newCardsState);
        
        const { error: moveError } = await supabase
            .from('kanban_cards')
            .update({ coluna_id: destination.droppableId, ordem: destination.index })
            .eq('id', draggableId);

        if (moveError) {
            toast({ title: 'Erro ao mover card.', variant: 'destructive' });
            refreshBoard();
            return;
        }

        const sourceUpdates = startColumnCards.map((card, index) => ({ id: card.id, ordem: index }));
        const destUpdates = finishColumnCards.map((card, index) => ({ id: card.id, ordem: index }));
        
        const { error: reorderError } = await supabase.from('kanban_cards').upsert([...sourceUpdates, ...destUpdates]);
        if (reorderError) {
            toast({ title: 'Erro ao reordenar listas.', variant: 'destructive' });
            refreshBoard();
        }
    }
  };

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!columns || columns.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <h2 className="text-xl font-semibold">Nenhuma coluna encontrada para este quadro.</h2>
              <p className="text-muted-foreground mt-2">Tente adicionar uma nova coluna para começar a organizar suas tarefas.</p>
              <div className="mt-6">
                <AddColumnForm boardId={boardId} onColumnAdded={handleColumnAdded} />
              </div>
          </div>
      );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex items-start gap-4 p-4 overflow-x-auto h-full"
          >
            {columns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                index={index}
                column={column}
                cards={cards[column.id] || []}
                onCardAdded={refreshBoard}
                onCardUpdated={refreshBoard}
                onCardDeleted={refreshBoard}
                boardId={boardId}
              />
            ))}
            {provided.placeholder}
             <div className="flex-shrink-0 w-80">
                <AddColumnForm boardId={boardId} onColumnAdded={handleColumnAdded} />
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanBoard;
