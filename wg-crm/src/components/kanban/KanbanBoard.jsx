import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import OportunidadeCard from './OportunidadeCard';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [cardToLinkClient, setCardToLinkClient] = useState(null); // Card esperando vinculação de cliente

  const { toast } = useToast();

  const fetchBoardData = useCallback(async () => {
    setLoading(true);

    // Buscar board pelo módulo (campo mudou de ambiente para modulo)
    const { data: board } = await supabase
      .from('kanban_boards')
      .select('id')
      .eq('modulo', modulo) // mudança: ambiente → modulo
      .maybeSingle();

    if (!board) {
      toast({ title: `Board para módulo "${modulo}" não encontrado.`, variant: 'destructive'});
      setLoading(false);
      return;
    }
    setBoardId(board.id);

    // Buscar colunas (campos já corretos: nome, pos)
    const { data: cols } = await supabase
      .from('kanban_colunas')
      .select('id,nome,pos,cor')
      .eq('board_id', board.id)
      .order('pos', { ascending: true }); // já está correto: pos
    setColumns(cols || []);

    // Buscar cards usando a view v_kanban_cards
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
    const { data, error } = await supabase.from('entities').select('*').eq('id', clientId).maybeSingle();
    if (error) {
      toast({ title: 'Erro ao carregar cliente', description: error.message, variant: 'destructive' });
      return;
    }
    setClientToEdit(data);
    setCardToLinkClient(null); // Limpa vinculação pendente
    setIsEditClientDialogOpen(true);
  }

  const handleCreateClientForCard = (card) => {
    setClientToEdit(null); // Modo criação
    setCardToLinkClient(card); // Guarda card para vincular
    setIsEditClientDialogOpen(true);
  }

  const handleClientSaved = async (updatedLeadsOrClient) => {
    // NovoLeadDialog pode passar array (legado) ou objeto único (novo)
    let savedClient = null;

    if (Array.isArray(updatedLeadsOrClient)) {
      // Legado: array de leads (pega o primeiro, que é o mais recente)
      savedClient = updatedLeadsOrClient[0];
    } else {
      // Novo: objeto único
      savedClient = updatedLeadsOrClient;
    }

    // Se há card esperando vinculação, vincular agora
    if (cardToLinkClient && savedClient?.id) {
      const { error } = await supabase.rpc('api_atualizar_card_kanban', {
        p_card_id: cardToLinkClient.id,
        p_dados: { entity_id: savedClient.id }
      });

      if (error) {
        toast({ title: 'Erro ao vincular cliente ao card', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Cliente vinculado com sucesso!' });
      }
      setCardToLinkClient(null);
    }

    // Refetch para atualizar dados
    fetchBoardData();
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

    // Usar função api_mover_card_kanban
    const { error } = await supabase.rpc('api_mover_card_kanban', {
      p_card_id: draggableId,
      p_nova_coluna_id: destination.droppableId,
      p_nova_ordem: destination.index + 1
    });

    if (error) {
      toast({ title: "Erro ao mover card", description: error.message, variant: "destructive" });
      setCards(originalCards); // Reverte
    } else {
      fetchBoardData(); // Refetch para pegar o estado correto do DB
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => {
          setSelectedCard(null);
          setIsCardDialogOpen(true);
        }}>
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
                              <OportunidadeCard
                                card={card}
                                onCardClick={handleCardClick}
                                onEditClient={handleEditClient}
                                onCreateClient={handleCreateClientForCard}
                                onCardDeleted={handleCardDeleted}
                                onCardUpdated={fetchBoardData}
                              />
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

      <KanbanCardDialog
        card={selectedCard}
        boardId={boardId}
        columns={columns}
        open={isCardDialogOpen}
        onOpenChange={setIsCardDialogOpen}
        onUpdate={fetchBoardData}
      />

      <NovoLeadDialog
         open={isEditClientDialogOpen}
         onOpenChange={setIsEditClientDialogOpen}
         leadToEdit={clientToEdit}
         leads={cards.map(c => c.cliente)}
         setLeads={handleClientSaved}
      />
    </>
  );
};

export default KanbanBoard;