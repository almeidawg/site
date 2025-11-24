import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, MessageSquare, CheckSquare, User, Save } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const KanbanCardDialog = ({ card, boardId, columns = [], open, onOpenChange, onUpdate }) => {
  const { toast } = useToast();
  const { profile: currentUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [responsibleUser, setResponsibleUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clients, setClients] = useState([]);

  // Local state for form fields to prevent re-render issues
  const [formState, setFormState] = useState({ titulo: '', descricao: '' });

  const handleFormChange = (field, value) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  const fetchCardData = useCallback(async () => {
    // Buscar lista de clientes (sempre, para modo criação e edição)
    const { data: clientsData } = await supabase
      .from('entities')
      .select('id, nome')
      .order('nome');
    setClients(clientsData || []);

    if (!card?.id) {
      // Modo de criação: novo card
      setLoading(false);
      setCardDetails(null);
      setFormState({ titulo: '', descricao: '' });
      setComments([]);
      setChecklist([]);
      setResponsibleUser(null);
      setSelectedClientId(null);
      // Selecionar primeira coluna por padrão
      if (columns.length > 0) {
        setSelectedColumnId(columns[0].id);
      }
      return;
    }

    // Modo de edição: carregar card existente
    setLoading(true);
    setResponsibleUser(null);

    const { data: cardData, error: cardError } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('id', card.id)
      .maybeSingle();

    if (cardError) {
      toast({ title: 'Erro ao carregar dados do card', description: cardError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    setCardDetails(cardData);
    setFormState({
      titulo: cardData.titulo || '',
      descricao: cardData.descricao || '',
    });
    setSelectedClientId(cardData.entity_id || null);

    const payload = cardData.payload || {};
    setComments(payload.comments || []);
    setChecklist(payload.checklist || []);

    // TODO: Buscar dados do cliente quando entity_id não for null
    // if (cardData.entity_id) {
    //   const { data: clientData } = await supabase
    //     .from('entities')
    //     .select('nome_razao_social, equipe')
    //     .eq('id', cardData.entity_id)
    //     .maybeSingle();
    //   if (clientData?.equipe) {
    //     const { data: userData } = await supabase
    //       .from('user_profiles')
    //       .select('user_id, nome, avatar_path')
    //       .eq('user_id', clientData.equipe)
    //       .maybeSingle();
    //     setResponsibleUser(userData);
    //   }
    // }

    setLoading(false);
  }, [card, columns, toast]);

  useEffect(() => {
    if (open) {
      fetchCardData();
    }
  }, [open, fetchCardData]);

  const handleSaveChanges = async () => {
    // Validação básica
    if (!formState.titulo || !formState.titulo.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    if (!card?.id) {
      // MODO CRIAÇÃO: criar novo card
      if (!boardId || !selectedColumnId) {
        toast({ title: 'Erro: board ou coluna não especificados', variant: 'destructive' });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.rpc('api_criar_card_kanban', {
        p_board_id: boardId,
        p_coluna_id: selectedColumnId,
        p_titulo: formState.titulo,
        p_descricao: formState.descricao || null,
        p_cliente_id: selectedClientId,  // Usar cliente selecionado
        p_payload: {}
      });

      setIsSaving(false);

      if (error) {
        toast({ title: 'Erro ao criar card', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Card criado com sucesso!' });
        onUpdate(); // Trigger refetch on parent
        onOpenChange(false); // Close dialog
      }
    } else {
      // MODO EDIÇÃO: atualizar card existente
      const { error } = await supabase.rpc('api_atualizar_card_kanban', {
        p_card_id: card.id,
        p_dados: {
          titulo: formState.titulo,
          descricao: formState.descricao,
          entity_id: selectedClientId || null
        }
      });

      setIsSaving(false);

      if (error) {
        toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Card atualizado com sucesso!' });
        onUpdate(); // Trigger refetch on parent
        onOpenChange(false); // Close dialog
      }
    }
  };

  const handleUpdatePayload = async (newPayload) => {
    const { error } = await supabase.rpc('api_atualizar_card_kanban', {
      p_card_id: card.id,
      p_dados: {
        payload: { ...cardDetails.payload, ...newPayload }
      }
    });

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      text: newComment,
      author: currentUserProfile?.nome || 'Usuário',
      author_id: currentUserProfile?.user_id,
      created_at: new Date().toISOString(),
    };
    const updatedComments = [...comments, comment];
    if (await handleUpdatePayload({ comments: updatedComments })) {
      setComments(updatedComments);
      setNewComment('');
      toast({ title: 'Comentário adicionado!' });
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    const item = {
      id: Date.now(),
      text: newChecklistItem,
      completed: false,
    };
    const updatedChecklist = [...checklist, item];
    if (await handleUpdatePayload({ checklist: updatedChecklist })) {
      setChecklist(updatedChecklist);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = async (itemId) => {
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    if (await handleUpdatePayload({ checklist: updatedChecklist })) {
      setChecklist(updatedChecklist);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    if (await handleUpdatePayload({ checklist: updatedChecklist })) {
      setChecklist(updatedChecklist);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <>
            <DialogHeader>
              <Input
                className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                placeholder={card?.id ? "Título do card" : "Nova oportunidade"}
                value={formState.titulo || ''}
                onChange={(e) => handleFormChange('titulo', e.target.value)}
              />
              <DialogDescription>
                {card?.id ? (
                  <>Editando card</>
                ) : (
                  <>Preencha os detalhes da nova oportunidade</>
                )}
              </DialogDescription>
              {responsibleUser && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <User className="h-4 w-4"/>
                  <span>Responsável: {responsibleUser.nome}</span>
                </div>
              )}
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">

              <section>
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <Textarea
                  placeholder="Adicione uma descrição mais detalhada..."
                  value={formState.descricao || ''}
                  onChange={(e) => handleFormChange('descricao', e.target.value)}
                  rows={4}
                />
              </section>

              <section>
                <Label htmlFor="client-select" className="text-lg font-semibold mb-3 block">Cliente (opcional)</Label>
                <Select value={selectedClientId || undefined} onValueChange={(value) => setSelectedClientId(value === 'none' ? null : value)}>
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Nenhum cliente vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              {!card?.id && (
                <section>
                  <Label htmlFor="column-select" className="text-lg font-semibold mb-3 block">Coluna</Label>
                  <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                    <SelectTrigger id="column-select">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map(col => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              )}

              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckSquare className="h-5 w-5"/> Checklist</h3>
                <div className="space-y-2">
                  {checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox
                        id={`check-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => handleToggleChecklistItem(item.id)}
                      />
                      <Label
                        htmlFor={`check-${item.id}`}
                        className={`flex-grow ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.text}
                      </Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    placeholder="Novo item..."
                    onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <Button onClick={handleAddChecklistItem}>
                    <PlusCircle className="h-4 w-4 mr-2"/> Adicionar
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5"/> Comentários
                </h3>
                <div className="space-y-4">
                  {comments.slice().reverse().map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.author?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-baseline gap-2">
                          <p className="font-semibold text-sm">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <p className="text-sm bg-muted p-2 rounded-md">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário..."
                  />
                  <Button onClick={handleAddComment} className="mt-2">Enviar Comentário</Button>
                </div>
              </section>

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2" />}
                Salvar e Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KanbanCardDialog;