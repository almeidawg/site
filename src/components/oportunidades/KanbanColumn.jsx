
import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { DraggableOportunidadeCard } from './OportunidadeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import KanbanCardDialog from './KanbanCardDialog';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import NovaOportunidadeDialog from './NovaOportunidadeDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const KanbanColumn = ({ column, cards, index, onCardUpdated, boardId, onCardAdded, onCardDeleted, onColumnUpdated }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(column.nome);
    const { toast } = useToast();
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
    const [isNewCardDialogOpen, setIsNewCardDialogOpen] = useState(false);

    const handleTitleChange = async () => {
        if (newTitle.trim() === '' || newTitle === column.nome) {
            setIsEditingTitle(false);
            setNewTitle(column.nome);
            return;
        }

        const { error } = await supabase
            .from('kanban_colunas')
            .update({ nome: newTitle })
            .eq('id', column.id);

        if (error) {
            toast({ title: 'Erro ao renomear coluna', description: error.message, variant: 'destructive' });
            setNewTitle(column.nome);
        } else {
            onColumnUpdated();
        }
        setIsEditingTitle(false);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsCardDialogOpen(true);
    };

    const handleOpenNewCardDialog = () => {
        setIsNewCardDialogOpen(true);
    };

    return (
        <>
            <Draggable draggableId={String(column.id)} index={index}>
                {(provided) => (
                    <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        className="flex flex-col w-80 min-w-[320px] bg-muted/70 rounded-lg h-full max-h-[calc(100vh-16rem)]"
                    >
                        <div {...provided.dragHandleProps} className="p-3 font-semibold text-foreground border-b flex justify-between items-center">
                            {isEditingTitle ? (
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    onBlur={handleTitleChange}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleChange()}
                                    autoFocus
                                    className="h-8"
                                />
                            ) : (
                                <span onDoubleClick={() => setIsEditingTitle(true)} className="flex-grow">{column.nome}</span>
                            )}
                            <span className="ml-2 text-sm font-normal text-muted-foreground bg-background rounded-full px-2 py-0.5">{cards.length}</span>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onSelect={() => setIsEditingTitle(true)}>Renomear</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                        </div>
                        <Droppable droppableId={String(column.id)} type="CARD">
                            {(provided, snapshot) => (
                                <ScrollArea
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`flex-grow p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}
                                >
                                    {cards.map((card, cardIndex) => (
                                        <DraggableOportunidadeCard 
                                            key={card.id} 
                                            card={card} 
                                            index={cardIndex} 
                                            onClick={() => handleCardClick(card)}
                                            onCardDeleted={onCardDeleted}
                                            onCardUpdated={onCardUpdated}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </ScrollArea>
                            )}
                        </Droppable>
                         <div className="p-2 border-t">
                            <Button variant="ghost" className="w-full justify-start" onClick={handleOpenNewCardDialog}>
                                <Plus className="mr-2 h-4 w-4" /> Adicionar um cartão
                            </Button>
                        </div>
                    </div>
                )}
            </Draggable>
            {selectedCard && (
                <KanbanCardDialog
                    card={selectedCard}
                    open={isCardDialogOpen}
                    onOpenChange={setIsCardDialogOpen}
                    onUpdate={onCardUpdated}
                />
            )}
            <NovaOportunidadeDialog
                open={isNewCardDialogOpen}
                onOpenChange={setIsNewCardDialogOpen}
                onSaveSuccess={onCardAdded}
                columnId={column.id}
                boardId={boardId}
                columns={[column]}
            />
        </>
    );
};

export default KanbanColumn;
