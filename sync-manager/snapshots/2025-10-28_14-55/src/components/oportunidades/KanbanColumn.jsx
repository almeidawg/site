import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import OportunidadeCard from './OportunidadeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import KanbanCardDialog from './KanbanCardDialog';

const KanbanColumn = ({ column, index, fetchBoard, boardColumns }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(column.nome);
    const { toast } = useToast();
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

    const handleTitleChange = async () => {
        if (newTitle.trim() === '' || newTitle === column.nome) {
            setIsEditingTitle(false);
            return;
        }

        const { error } = await supabase
            .from('kanban_colunas')
            .update({ nome: newTitle })
            .eq('id', column.id);

        if (error) {
            toast({ title: 'Erro ao renomear coluna', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Coluna renomeada com sucesso!' });
            fetchBoard();
        }
        setIsEditingTitle(false);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsCardDialogOpen(true);
    };

    const cards = column.kanban_cards || [];

    return (
        <>
            <Draggable draggableId={column.id.toString()} index={index}>
                {(provided) => (
                    <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="flex flex-col w-80 min-w-[320px] bg-gray-100 dark:bg-gray-800/50 rounded-lg h-full max-h-[calc(100vh-12rem)]"
                    >
                        <div {...provided.dragHandleProps} className="p-3 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 cursor-pointer" onDoubleClick={() => setIsEditingTitle(true)}>
                            {isEditingTitle ? (
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={handleTitleChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleChange()}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    {column.nome}
                                    <span className="ml-2 text-sm font-normal text-gray-500">{cards.length}</span>
                                </>
                            )}
                        </div>
                        <Droppable droppableId={column.id.toString()} type="CARD">
                            {(provided, snapshot) => (
                                <ScrollArea
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-grow p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                                >
                                    {cards.map((card, cardIndex) => (
                                        <OportunidadeCard key={card.id} card={card} index={cardIndex} onClick={() => handleCardClick(card)} />
                                    ))}
                                    {provided.placeholder}
                                </ScrollArea>
                            )}
                        </Droppable>
                    </div>
                )}
            </Draggable>
            {selectedCard && (
                <KanbanCardDialog
                    card={selectedCard}
                    open={isCardDialogOpen}
                    onOpenChange={setIsCardDialogOpen}
                    onUpdate={fetchBoard}
                    boardColumns={boardColumns}
                />
            )}
        </>
    );
};

export default KanbanColumn;