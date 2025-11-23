
import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { DollarSign, Phone, Edit, MapPin, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NovaOportunidadeDialog from './NovaOportunidadeDialog';

const OportunidadeCard = ({ card, onClick, onCardDeleted, onCardUpdated }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const valor = parseFloat(card.valor_proposta || 0);

    const handleDeleteCard = async (e) => {
        e.stopPropagation();
        const { error } = await supabase
            .from('kanban_cards')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', card.id);

        if (error) {
            toast({ title: 'Erro ao excluir card', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Card excluído com sucesso!' });
            onCardDeleted(card.id);
        }
    };
    
    return (
        <>
            <div 
                className="bg-card p-4 rounded-lg shadow-sm border mb-3 hover:shadow-md transition-shadow duration-200 ease-in-out group"
                onClick={onClick}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground flex-grow pr-2">{card.titulo}</h3>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="text-muted-foreground hover:text-primary p-1"
                            title="Editar Card"
                        >
                            <Edit size={16} />
                        </button>
                        <AlertDialog onOpenChange={e => e.stopPropagation()}>
                            <AlertDialogTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground hover:text-destructive p-1"
                                    title="Excluir Card"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação irá excluir o card "{card.titulo}". Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteCard} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2"><User size={14} />{card.cliente?.nome_razao_social || 'Cliente não definido'}</p>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                        <DollarSign size={14} className="mr-2" />
                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}</span>
                    </div>
                    {card.telefone && 
                        <div className="flex items-center text-muted-foreground">
                            <Phone size={14} className="mr-2" />
                            <span>{card.telefone}</span>
                        </div>
                    }
                    {card.endereco_obra &&
                        <div className="flex items-center text-muted-foreground">
                            <MapPin size={14} className="mr-2" />
                            <span className="truncate">{card.endereco_obra}</span>
                        </div>
                    }
                </div>
            </div>
            {isEditing && (
                 <NovaOportunidadeDialog 
                    open={isEditing}
                    onOpenChange={setIsEditing}
                    onSaveSuccess={() => { setIsEditing(false); onCardUpdated(); }}
                    cardToEdit={card}
                    boardId={card.board_id}
                />
            )}
        </>
    );
};

export const DraggableOportunidadeCard = ({ card, index, ...props }) => {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <OportunidadeCard card={card} {...props} />
        </div>
      )}
    </Draggable>
  );
};
