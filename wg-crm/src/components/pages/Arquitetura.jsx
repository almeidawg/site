
import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
import { Building, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Arquitetura = () => {
    const { toast } = useToast();
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [pipelineId, setPipelineId] = useState(null);

    const fetchBoardAndCards = useCallback(async () => {
        setLoading(true);

        const { data: boardData, error: boardError } = await supabase
            .from('kanban_boards')
            .select('id, titulo, kanban_colunas(id, titulo, posicao)')
            .eq('ambiente', 'arquitetura')
            .single();

        if (boardError || !boardData) {
            toast({ title: 'Erro ao carregar o quadro de Arquitetura', variant: 'destructive' });
            setLoading(false);
            return;
        }

        setPipelineId(boardData.id);

        const { data: cardsData, error: cardsError } = await supabase
            .from('kanban_cards')
            .select('*')
            .in('coluna_id', boardData.kanban_colunas.map(c => c.id));

        if (cardsError) {
            toast({ title: 'Erro ao carregar os projetos', variant: 'destructive' });
            setLoading(false);
            return;
        }
        setCards(cardsData || []);

        const initialColumns = {};
        (boardData.kanban_colunas || [])
            .sort((a, b) => a.posicao - b.posicao)
            .forEach(coluna => {
                initialColumns[coluna.id] = {
                    id: coluna.id,
                    name: coluna.titulo,
                    items: (cardsData || []).filter(card => card.coluna_id === coluna.id).sort((a, b) => a.posicao - b.posicao)
                };
            });
        
        setColumns(initialColumns);
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchBoardAndCards();
    }, [fetchBoardAndCards]);

    const handleNotImplemented = () => toast({ title: "Funcionalidade em desenvolvimento" });

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        // Movendo para coluna diferente
        if (source.droppableId !== destination.droppableId) {
            const sourceCol = columns[source.droppableId];
            const destCol = columns[destination.droppableId];

            if (!sourceCol || !destCol) return;

            const movedCard = sourceCol.items.find(item => item.id === draggableId);
            if (!movedCard) return;

            const novaPosicao = (destination.index + 1) * 10;

            // Update local state (optimistic)
            const sourceItems = [...sourceCol.items];
            sourceItems.splice(source.index, 1);

            const destItems = [...destCol.items];
            destItems.splice(destination.index, 0, movedCard);

            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceCol, items: sourceItems },
                [destination.droppableId]: { ...destCol, items: destItems }
            });

            // Update database
            const { error } = await supabase
                .from('kanban_cards')
                .update({
                    coluna_id: destCol.id,
                    posicao: novaPosicao,
                    updated_at: new Date().toISOString()
                })
                .eq('id', draggableId);

            if (error) {
                toast({
                    title: "Erro ao mover card",
                    description: error.message,
                    variant: "destructive"
                });
                fetchBoardAndCards(); // Revert
            } else {
                toast({
                    title: "Card movido!",
                    description: `Movido para "${destCol.name}".`
                });
            }
        } else {
            // Reordenando na mesma coluna
            const column = columns[source.droppableId];
            const items = [...column.items];
            const [removed] = items.splice(source.index, 1);
            items.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: { ...column, items }
            });

            const novaPosicao = (destination.index + 1) * 10;
            const { error } = await supabase
                .from('kanban_cards')
                .update({
                    posicao: novaPosicao,
                    updated_at: new Date().toISOString()
                })
                .eq('id', draggableId);

            if (error) {
                toast({
                    title: "Erro ao reordenar",
                    description: error.message,
                    variant: "destructive"
                });
                fetchBoardAndCards(); // Revert
            }
        }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-wg-orange-base" />
        </div>
      );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-arquitetura">
                        <Building /> Projetos de Arquitetura
                    </h1>
                    <p className="text-wg-gray-medium mt-1">
                        Gerencie o fluxo de trabalho dos seus projetos arquitetônicos.
                    </p>
                </div>
            </div>
            {cards.length > 0 ? (
                <div className="flex-grow overflow-hidden">
                    <KanbanBoard
                        columns={columns}
                        onDragEnd={onDragEnd}
                        onRenameColumn={handleNotImplemented}
                        onDeleteColumn={handleNotImplemented}
                        onUpdateOportunidade={handleNotImplemented}
                        onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
                    />
                </div>
            ) : (
                 <div className="col-span-full text-center py-16 bg-white rounded-2xl flex-grow flex flex-col justify-center items-center shadow-sm">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-wg-gray-medium">Nenhum projeto de arquitetura ativo no momento.</p>
                    <p className="text-sm text-gray-500">Projetos de arquitetura aparecerão aqui automaticamente.</p>
                </div>
            )}
        </div>
    );
};

export default Arquitetura;
