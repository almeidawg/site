import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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

const SERVICE_MODULES = ['arquitetura', 'engenharia', 'marcenaria'];

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
  const [isClearingModules, setIsClearingModules] = useState(false);

  const { toast } = useToast();
  const columnsRef = useRef(columns);
  const replicatedCardsRef = useRef(new Set());

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    replicatedCardsRef.current = new Set();
  }, [modulo]);

  const replicateToServiceBoards = useCallback(
    async (card, destinationColumnId, currentColumns) => {
      const columnsToUse = currentColumns ?? columnsRef.current;
      if (!card || modulo !== 'oportunidades') return;
      const closingColumnId = columnsToUse[columnsToUse.length - 1]?.id;
      if (!closingColumnId || destinationColumnId !== closingColumnId) return;

      const payload = card.payload || {};
      const explicitServices = Array.isArray(card.servicos_contratados)
        ? card.servicos_contratados.filter(Boolean)
        : [];
      const derivedServices = SERVICE_MODULES.filter((service) => {
        const status = payload?.[service];
        return status && status !== 'nao_previsto';
      });
      const services = [...new Set([...explicitServices, ...derivedServices])].filter((service) =>
        SERVICE_MODULES.includes(service)
      );
      if (services.length === 0) return;

      for (const service of services) {
        const replicationKey = `${card.id}:${service}`;
        if (replicatedCardsRef.current.has(replicationKey)) {
          continue;
        }

        const { data: targetBoard, error: boardError } = await supabase
          .from('kanban_boards')
          .select('id')
          .eq('modulo', service)
          .maybeSingle();

        if (boardError || !targetBoard?.id) {
          console.warn(`[KanbanBoard] Board para serviço ${service} não encontrado ou erro:`, boardError?.message);
          continue;
        }

        const { data: firstColumn, error: colError } = await supabase
          .from('kanban_colunas')
          .select('id')
          .eq('board_id', targetBoard.id)
          .order('pos', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (colError || !firstColumn?.id) {
          console.warn(`[KanbanBoard] Primeira coluna não encontrada para board ${service}:`, colError?.message);
          continue;
        }

        const { data: existingCard } = await supabase
          .from('v_kanban_cards')
          .select('id')
          .eq('board_id', targetBoard.id)
          .eq('payload->>origem_card_id', card.id)
          .maybeSingle();

        if (existingCard?.id) continue;

        const payloadToPersist = {
          ...payload,
          origem_card_id: card.id,
          modulo_origem: modulo,
        };

        const { error: insertError } = await supabase.rpc('api_criar_card_kanban', {
          p_coluna_id: firstColumn.id,
          p_titulo: card.titulo || card.nome || 'Oportunidade',
          p_descricao: card.descricao || null,
          p_entity_id: card.entity_id || null,
          p_responsavel_id: card.responsavel_id || null,
          p_servicos_contratados: [service],
          p_payload: payloadToPersist,
        });

        if (insertError) {
          console.warn(`[KanbanBoard] Erro ao replicar card ${card.id} para ${service}:`, insertError.message);
        } else {
          replicatedCardsRef.current.add(replicationKey);
        }
      }
    },
    [modulo]
  );

  const ensureClosingCardsReplicated = useCallback(
    async (cardsList, currentColumns) => {
      const columnsToUse = currentColumns ?? columnsRef.current;
      if (modulo !== 'oportunidades' || columnsToUse.length === 0) return;
      const closingColumnId = columnsToUse[columnsToUse.length - 1]?.id;
      if (!closingColumnId) return;

      const closingCards = cardsList.filter((card) => card.coluna_id === closingColumnId);
      for (const card of closingCards) {
        await replicateToServiceBoards(card, closingColumnId, columnsToUse);
      }
    },
    [modulo, replicateToServiceBoards]
  );

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
    const safeCards = kcards || [];
    setCards(safeCards);
    setLoading(false);
    await ensureClosingCardsReplicated(safeCards, cols || []);
  }, [modulo, toast, ensureClosingCardsReplicated]);

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

  const handleClearServiceBoards = useCallback(async () => {
    if (modulo !== 'oportunidades') return;
    const confirmed = window.confirm('Remover todos os cards replicados dos módulos de Arquitetura, Engenharia e Marcenaria?');
    if (!confirmed) return;

    setIsClearingModules(true);
    try {
      const { data: serviceBoards, error: boardsError } = await supabase
        .from('kanban_boards')
        .select('id, modulo')
        .in('modulo', SERVICE_MODULES);

      if (boardsError) {
        throw boardsError;
      }

      for (const board of serviceBoards || []) {
        const { data: cardsToDelete, error: cardsError } = await supabase
          .from('v_kanban_cards')
          .select('id')
          .eq('board_id', board.id);

        if (cardsError) {
          console.warn(`[KanbanBoard] Erro ao listar cards do módulo ${board.modulo}:`, cardsError.message);
          continue;
        }

        for (const card of cardsToDelete || []) {
          const { error: deleteError } = await supabase.rpc('api_deletar_card_kanban', {
            p_card_id: card.id,
          });

          if (deleteError) {
            console.warn(`[KanbanBoard] Erro ao excluir card ${card.id}:`, deleteError.message);
          }
        }
      }

      toast({ title: 'Cards removidos dos módulos de serviço.' });
      fetchBoardData();
    } catch (error) {
      toast({
        title: 'Erro ao remover cards',
        description: error.message || String(error),
        variant: 'destructive',
      });
    } finally {
      setIsClearingModules(false);
    }
  }, [fetchBoardData, modulo, toast]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const originalCards = [...cards];
    const cardToMove = originalCards.find(c => c.id === draggableId);
    const destinationColumnId = destination.droppableId;

    const optimisticState = originalCards.filter(c => c.id !== draggableId);
    optimisticState.splice(destination.index, 0, {...cardToMove, coluna_id: destinationColumnId});

    setCards(optimisticState.map((c, i) => ({...c, ordem: i})));

    // Usar função api_mover_card_kanban
    const { error } = await supabase.rpc('api_mover_card_kanban', {
      p_card_id: draggableId,
      p_nova_coluna_id: destinationColumnId,
      p_nova_ordem: destination.index + 1
    });

    if (error) {
      toast({ title: "Erro ao mover card", description: error.message, variant: "destructive" });
      setCards(originalCards); // Reverte
    } else {
      await replicateToServiceBoards(cardToMove, destinationColumnId);
      fetchBoardData(); // Refetch para pegar o estado correto do DB
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4 space-x-2">
        {modulo === 'oportunidades' && (
          <Button
            variant="outline"
            onClick={handleClearServiceBoards}
            disabled={isClearingModules}
          >
            {isClearingModules ? 'Removendo cards...' : 'Limpar módulos'}
          </Button>
        )}
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
