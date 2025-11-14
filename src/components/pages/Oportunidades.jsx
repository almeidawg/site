
import React from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const Oportunidades = ({ modulo = 'oportunidades', title = 'Oportunidades' }) => {
    const { orgId } = useAuth();
    const [boardId, setBoardId] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const getBoard = async () => {
            if (!orgId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase.rpc('kanban_ensure_board', { p_modulo: modulo, p_org_id: orgId });
                if (error) throw error;
                setBoardId(data);
            } catch (err) {
                console.error(`Error ensuring board for ${modulo}:`, err);
                toast({ title: `Erro Crítico no Kanban de ${title}`, description: "Não foi possível carregar ou criar o quadro.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        };
        getBoard();
    }, [orgId, toast, modulo, title]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando quadro de {title}...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{title} | Grupo WG Almeida</title>
                <meta name="description" content={`Gerencie ${title.toLowerCase()} com o pipeline de vendas.`} />
            </Helmet>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-background sticky top-0 z-10">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
                <div className="flex-grow overflow-auto">
                   {boardId ? <KanbanBoard boardId={boardId} /> : <p>Quadro não encontrado.</p>}
                </div>
            </div>
        </>
    );
};

export default Oportunidades;
