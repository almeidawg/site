import React, { useState } from 'react';
import { DollarSign, Phone, Home, Edit, MapPin, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
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

const OportunidadeCard = ({ card, onEditClient, onCardDeleted, onCardUpdated }) => {
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(card.titulo);
  const valor = parseFloat(card.valor || 0);

  const handleTitleSave = async () => {
    const newTitle = title.trim();
    if (!newTitle || newTitle === card.titulo) {
      setIsEditingTitle(false);
      setTitle(card.titulo); // revert
      return;
    }

    // Usar função api_atualizar_card_kanban
    const { error } = await supabase.rpc('api_atualizar_card_kanban', {
      p_card_id: card.id,
      p_dados: { titulo: newTitle }
    });

    if (error) {
      toast({ title: 'Erro ao salvar título', description: error.message, variant: 'destructive' });
      setTitle(card.titulo); // revert
    } else {
      toast({ title: 'Título atualizado!' });
      onCardUpdated();
    }
    setIsEditingTitle(false);
  };

  const handleDeleteCard = async () => {
    // Usar função api_deletar_card_kanban ou atualizar deleted_at
    const { error } = await supabase.rpc('api_deletar_card_kanban', {
      p_card_id: card.id
    });

    if (error) {
      toast({ title: 'Erro ao excluir card', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Card excluído com sucesso!' });
      if (onCardDeleted) {
        onCardDeleted(card.id);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 ease-in-out group cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') setIsEditingTitle(false);
            }}
            className="font-bold text-gray-800 dark:text-gray-100 p-0 h-auto border-0 focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h3
            className="font-bold text-gray-800 dark:text-gray-100 flex-grow"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingTitle(true);
            }}
            title="Dê um duplo clique para editar"
          >
            {card.titulo}
          </h3>
        )}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {card.entity_id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClient(card.entity_id);
              }}
              className="text-gray-400 hover:text-blue-500 p-1"
              title="Editar Cliente"
            >
              <Edit size={16} />
            </button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-red-500 p-1"
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
                <AlertDialogAction onClick={handleDeleteCard} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {card.cliente_nome}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-green-600 dark:text-green-400">
          <DollarSign size={14} className="mr-2" />
          <span>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}
          </span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Phone size={14} className="mr-2" />
          <span>{card.telefone || '-'}</span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <MapPin size={14} className="mr-2" />
          <span className="truncate">{card.endereco_obra || '-'}</span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Home size={14} className="mr-2" />
          <span className="truncate">{card.empreendimento || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default OportunidadeCard;