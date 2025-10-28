
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
import { HardHat, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Obras = () => {
    const [oportunidades] = useLocalStorage('crm_oportunidades', []);
    const { toast } = useToast();
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchColumnsAndProjects = useCallback(async () => {
        setLoading(true);

        const { data: boardData, error: boardError } = await supabase
            .from('kanban_boards')
            .select('id, kanban_colunas(*, color:cor)')
            .eq('ambiente', 'engenharia')
            .single();

        if (boardError || !boardData) {
            toast({ title: 'Erro ao carregar o quadro Kanban', variant: 'destructive' });
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
        
        const projetosEngenharia = oportunidades.filter(op =>
            op.servicos_contratados?.includes('engenharia') && op.fase === 'ganha'
        );

        projetosEngenharia.forEach(op => {
            const faseProjeto = op.fase_engenharia || Object.keys(initialColumns)[0] || 'planejamento';
            if (initialColumns[faseProjeto]) {
                initialColumns[faseProjeto].items.push(op);
            } else if (Object.keys(initialColumns).length > 0) {
                initialColumns[Object.keys(initialColumns)[0]].items.push(op);
            }
        });

        setColumns(initialColumns);
        setLoading(false);
    }, [oportunidades, toast]);

    useEffect(() => {
        fetchColumnsAndProjects();
    }, [fetchColumnsAndProjects]);
    
    const handleRenameColumn = async (columnId, newName) => {
        const { error } = await supabase
            .from('kanban_colunas')
            .update({ titulo: newName })
            .eq('id', columnId);

        if (error) {
            toast({ title: "Erro ao renomear coluna", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Coluna renomeada!" });
            fetchColumnsAndProjects();
        }
    };

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
            {oportunidades.filter(op => op.servicos_contratados?.includes('engenharia') && op.fase === 'ganha').length > 0 ? (
                <div className="flex-grow overflow-hidden">
                    <KanbanBoard
                        columns={columns}
                        onDragEnd={handleNotImplemented}
                        onRenameColumn={handleRenameColumn}
                        onDeleteColumn={handleNotImplemented}
                        onUpdateOportunidade={handleNotImplemented}
                        onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
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

export default Obras;
