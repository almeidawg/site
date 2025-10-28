
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import OportunidadeCard from './OportunidadeCard';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NovaOportunidadeDialog from '@/components/oportunidades/NovaOportunidadeDialog';
import NovoLeadDialog from '@/components/leads/NovoLeadDialog';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ColumnHeader } from './ColumnHeader';
import { AddColumnCard } from './AddColumnCard';
import KanbanCardDialog from './KanbanCardDialog';

const KanbanBoard = ({ modulo = 'oportunidades' }) => {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [boardId, setBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewOpportunityDialogOpen, setIsNewOpportunityDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  const { toast } = useToast();

  const fetchBoardData = useCallback(async () => {
    setLoading(true);
    const { data: board } = await supabase.from('kanban_boards').select('id').eq('modulo', modulo).single();
    if (!board) {
        toast({ title: `Board para módulo "${modulo}" não encontrado.`, variant: 'destructive'});
        setLoading(false);
        return;
    }
    setBoardId(board.id);

    const { data: cols } = await supabase
      .from('kanban_colunas')
      .select('id,nome,pos,cor')
      .eq('board_id', board.id)
      .order('pos', { ascending: true });
    setColumns(cols || []);

    const { data: kcards, error: cardsError } = await supabase
      .from('v_kanban_cards')
      .select('*')
      .eq('board_id', board.id)
      .is('deleted_at', null)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });
    
    if (cardsError) {
        toast({ title: 'Erro ao carregar cards', description: cardsError.message, variant: 'destructive' });
    }
    setCards(kcards || []);
    setLoading(false);
  }, [modulo, toast]);
  
  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);
  
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsCardDialogOpen(true);
  };
  
  const handleCardDeleted = (cardId) => {
    setCards(prevCards => prevCards.filter(c => c.id !== cardId));
  };


  const cardsByColumn = useMemo(() => {
    const map = {};
    columns.forEach(c => (map[c.id] = []));
    cards.forEach(card => {
      if (!map[card.coluna_id]) map[card.coluna_id] = [];
      map[card.coluna_id].push(card);
    });
    return map;
  }, [cards, columns]);
  
  const handleEditClient = async (clientId) => {
    const { data, error } = await supabase.from('entities').select('*').eq('id', clientId).single();
    if (error) {
        toast({ title: 'Erro ao carregar cliente', description: error.message, variant: 'destructive' });
        return;
    }
    setClientToEdit(data);
    setIsEditClientDialogOpen(true);
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const originalCards = [...cards];
    const cardToMove = originalCards.find(c => c.id === draggableId);
    
    const optimisticState = originalCards.filter(c => c.id !== draggableId);
    optimisticState.splice(destination.index, 0, {...cardToMove, coluna_id: destination.droppableId});
    
    setCards(optimisticState.map((c, i) => ({...c, ordem: i})));

    const { error } = await supabase.from('kanban_cards').update({
      coluna_id: destination.droppableId,
      ordem: destination.index + 1,
    }).eq('id', draggableId);

    if (error) {
        toast({ title: "Erro ao mover card", description: error.message, variant: "destructive" });
        setCards(originalCards); // Reverte
    } else {
        fetchBoardData(); // Refetch para pegar o estado correto do DB, incluindo a trigger
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsNewOpportunityDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Oportunidade
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-start space-x-4 pb-4">
                {columns.map((col) => (
                    <Droppable droppableId={String(col.id)} key={col.id}>
                        {(provided, snapshot) => (
                            <div
                                className="flex-shrink-0 w-80 min-w-[320px] rounded-lg p-3 bg-gray-100 dark:bg-gray-800/50 border"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <ColumnHeader
                                  column={col}
                                  count={cardsByColumn[col.id]?.length || 0}
                                  badgeColor={col.cor}
                                  onRenamed={(updated) =>
                                    setColumns((prev) => prev.map((c) => (c.id === updated.id ? { ...c, nome: updated.nome } : c)))
                                  }
                                />
                                <div className={`space-y-3 transition-colors min-h-[400px] ${snapshot.isDraggingOver ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''} rounded-md pt-2`}>
                                    {(cardsByColumn[col.id] || []).map((card, index) => (
                                        <Draggable draggableId={card.id} index={index} key={card.id}>
                                            {(prov) => (
                                                <div
                                                    ref={prov.innerRef}
                                                    {...prov.draggableProps}
                                                    {...prov.dragHandleProps}
                                                    onClick={() => handleCardClick(card)}
                                                >
                                                    <OportunidadeCard card={card} onEditClient={handleEditClient} onCardDeleted={handleCardDeleted} onCardUpdated={fetchBoardData}/>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
                {boardId && (
                  <div className="flex-shrink-0 w-80 min-w-[320px]">
                    <AddColumnCard
                      boardId={boardId}
                      onCreated={(col) => setColumns((prev) => [...prev, col])}
                    />
                  </div>
                )}
            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DragDropContext>
      
      <NovaOportunidadeDialog 
        open={isNewOpportunityDialogOpen} 
        onOpenChange={setIsNewOpportunityDialogOpen}
        onSave={() => {
          setIsNewOpportunityDialogOpen(false);
          fetchBoardData();
        }}
        boardId={boardId}
        columns={columns}
      />

      {selectedCard && (
        <KanbanCardDialog 
          card={selectedCard}
          open={isCardDialogOpen}
          onOpenChange={setIsCardDialogOpen}
          onUpdate={fetchBoardData}
        />
      )}
      
      {clientToEdit && (
         <NovoLeadDialog
            open={isEditClientDialogOpen}
            onOpenChange={setIsEditClientDialogOpen}
            leadToEdit={clientToEdit}
            leads={cards.map(c => c.cliente)}
            setLeads={() => fetchBoardData()} // Simplificado para refetch
         />
      )}
    </>
  );
};

export default KanbanBoard;
