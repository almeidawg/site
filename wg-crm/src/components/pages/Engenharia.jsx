
import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
import { HardHat, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Engenharia = () => {
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
            .eq('ambiente', 'engenharia')
            .single();

        if (boardError || !boardData) {
            toast({ title: 'Erro ao carregar o quadro de Engenharia', variant: 'destructive' });
            setLoading(false);
            return;
        }

        setPipelineId(boardData.id);

        const { data: cardsData, error: cardsError } = await supabase
            .from('kanban_cards')
            .select('*')
            .in('coluna_id', boardData.kanban_colunas.map(c => c.id));

        if (cardsError) {
            toast({ title: 'Erro ao carregar as obras', variant: 'destructive' });
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
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-engenharia">
                        <HardHat /> Projetos de Engenharia
                    </h1>
                    <p className="text-wg-gray-medium mt-1">
                        Gerencie o fluxo de trabalho das suas obras e reformas.
                    </p>
                </div>
            </div>
            {cards.length > 0 ? (
                <div className="flex-grow overflow-hidden">
                    <KanbanBoard
                        columns={columns}
                        onDragEnd={handleNotImplemented}
                        onRenameColumn={handleNotImplemented}
                        onDeleteColumn={handleNotImplemented}
                        onUpdateOportunidade={handleNotImplemented}
                        onEditOportunidade={() => toast({ title: 'Edição de obra em breve!' })}
                    />
                </div>
            ) : (
                 <div className="col-span-full text-center py-16 bg-white rounded-2xl flex-grow flex flex-col justify-center items-center shadow-sm">
                    <HardHat className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-wg-gray-medium">Nenhuma obra ou reforma ativa no momento.</p>
                    <p className="text-sm text-gray-500">Projetos aparecerão aqui quando uma oportunidade for ganha com o serviço de "Engenharia".</p>
                </div>
            )}
        </div>
    );
};

export default Engenharia;
