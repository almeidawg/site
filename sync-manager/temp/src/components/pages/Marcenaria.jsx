import React from 'react';
    import KanbanBoard from '@/components/oportunidades/KanbanBoard';
    import { Button } from '@/components/ui/button';
    import { PlusCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const Marcenaria = () => {
        const { toast } = useToast();
        const [isNewItemOpen, setIsNewItemOpen] = React.useState(false);

        const handleNotImplemented = () => {
            toast({
                title: "🚧 Em construção",
                description: "A criação de novos itens de marcenaria será implementada em breve.",
                variant: "default",
            });
        };

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Fluxo da Marcenaria</h1>
                        <Button onClick={handleNotImplemented}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Serviço
                        </Button>
                    </div>
                </div>
                <div className="flex-grow overflow-hidden">
                    <KanbanBoard modulo="marcenaria" />
                </div>
            </div>
        );
    };

    export default Marcenaria;