
import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
import { Hammer, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Marcenaria = () => {
    const { toast } = useToast();
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [pipelineId, setPipelineId] = useState(null);

    const fetchBoardAndCards = useCallback(async () => {
        setLoading(true);

        const { data: boardData, error: boardError } = await supabase
            .from('pipelines')
            .select('id, pipeline_stages(id, nome, pos)')
            .eq('modulo', 'marcenaria')
            .single();

        if (boardError || !boardData) {
            toast({ title: 'Erro ao carregar o quadro de Marcenaria', variant: 'destructive' });
            setLoading(false);
            return;
        }
        
        setPipelineId(boardData.id);

        const { data: cardsData, error: cardsError } = await supabase
            .from('kanban_cards')
            .select('*')
            .eq('modulo', 'marcenaria')
            .eq('pipeline_id', boardData.id);

        if (cardsError) {
            toast({ title: 'Erro ao carregar os projetos', variant: 'destructive' });
            setLoading(false);
            return;
        }
        setCards(cardsData);

        const initialColumns = {};
        boardData.pipeline_stages
            .sort((a, b) => a.pos - b.pos)
            .forEach(stage => {
                initialColumns[stage.id] = {
                    id: stage.id,
                    name: stage.nome,
                    items: cardsData.filter(card => card.stage_id === stage.id).sort((a, b) => a.ordem - b.ordem)
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
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-marcenaria">
                        <Hammer /> Projetos de Marcenaria
                    </h1>
                    <p className="text-wg-gray-medium mt-1">
                        Gerencie o fluxo de produção da marcenaria.
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
                        onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
                    />
                </div>
            ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-2xl flex-grow flex flex-col justify-center items-center shadow-sm">
                    <Hammer className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-wg-gray-medium">Nenhum projeto de marcenaria ativo no momento.</p>
                    <p className="text-sm text-gray-500">Projetos de marcenaria aparecerão aqui automaticamente.</p>
                </div>
            )}
        </div>
    );
};

export default Marcenaria;
