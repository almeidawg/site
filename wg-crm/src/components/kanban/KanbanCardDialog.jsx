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
  const [serviceStatus, setServiceStatus] = useState({
    arquitetura: 'nao_previsto',
    engenharia: 'nao_previsto',
    marcenaria: 'nao_previsto',
  });
  const [moduleValues, setModuleValues] = useState({
    arquitetura: '',
    engenharia: '',
    marcenaria: '',
  });

  const [formState, setFormState] = useState({ titulo: '', descricao: '' });

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCardData = useCallback(async () => {
    const { data: clientsData } = await supabase.from('entities').select('id, nome, dados').order('nome');
    setClients(clientsData || []);

    if (!card?.id) {
      setLoading(false);
      setCardDetails({ payload: {} });
      setFormState({ titulo: '', descricao: '' });
      setComments([]);
      setChecklist([]);
      setResponsibleUser(null);
      setSelectedClientId(null);
      setServiceStatus({
        arquitetura: 'nao_previsto',
        engenharia: 'nao_previsto',
        marcenaria: 'nao_previsto',
      });
      if (columns.length > 0) setSelectedColumnId(columns[0].id);
      return;
    }

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
      titulo: cardData.nome || '',
      descricao: cardData.descricao || '',
    });
    setSelectedClientId(cardData.entity_id || null);

    const payload = cardData.payload || {};
    setComments(payload.comments || []);
    setChecklist(payload.checklist || []);
    const normalizeStatus = (val) => {
      if (val === true) return 'confirmado';
      if (val === false || val === undefined || val === null) return 'nao_previsto';
      return val;
    };
    setServiceStatus({
      arquitetura: normalizeStatus(payload.arquitetura),
      engenharia: normalizeStatus(payload.engenharia),
      marcenaria: normalizeStatus(payload.marcenaria),
    });
    setModuleValues({
      arquitetura: payload?.module_values?.arquitetura ?? '',
      engenharia: payload?.module_values?.engenharia ?? '',
      marcenaria: payload?.module_values?.marcenaria ?? '',
    });

    setLoading(false);
  }, [card, columns, toast]);

  useEffect(() => {
    if (open) {
      fetchCardData();
    }
  }, [open, fetchCardData]);

  const handleSaveChanges = async () => {
    if (!formState.titulo || !formState.titulo.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    const selectedServices = Object.entries(serviceStatus)
      .filter(([, status]) => status && status !== 'nao_previsto')
      .map(([key]) => key);

    if (!card?.id) {
      if (!boardId || !selectedColumnId) {
        toast({ title: 'Erro: board ou coluna não especificados', variant: 'destructive' });
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.rpc('api_criar_card_kanban', {
        p_coluna_id: selectedColumnId,
        p_descricao: formState.descricao || null,
        p_entity_id: selectedClientId || null,
        p_payload: { ...serviceStatus },
        p_responsavel_id: currentUserProfile?.user_id ?? null,
        p_servicos_contratados: selectedServices.length ? selectedServices : null,
        p_titulo: formState.titulo,
      });

      setIsSaving(false);

      if (error) {
        toast({ title: 'Erro ao criar card', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Card criado com sucesso!' });
        onUpdate();
        onOpenChange(false);
      }
    } else {
      const basePayload = cardDetails?.payload || {};
    const payloadWithStatus = { ...basePayload, ...serviceStatus, module_values: moduleValues };

      const { error } = await supabase.rpc('api_atualizar_card_kanban', {
        p_card_id: card.id,
        p_dados: {
          titulo: formState.titulo,
          descricao: formState.descricao,
          entity_id: selectedClientId || null,
          payload: payloadWithStatus,
          servicos_contratados: selectedServices,
        },
      });

      setIsSaving(false);

      if (error) {
        toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Card atualizado com sucesso!' });
        onUpdate();
        onOpenChange(false);
      }
    }
  };

  const handleUpdatePayload = async (newPayload) => {
    const { error } = await supabase.rpc('api_atualizar_card_kanban', {
      p_card_id: card.id,
      p_dados: {
        payload: { ...(cardDetails?.payload || {}), ...newPayload },
      },
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
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    if (await handleUpdatePayload({ checklist: updatedChecklist })) {
      setChecklist(updatedChecklist);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    const updatedChecklist = checklist.filter((item) => item.id !== itemId);
    if (await handleUpdatePayload({ checklist: updatedChecklist })) {
      setChecklist(updatedChecklist);
    }
  };

  const toggleService = (svc) => {
    setServiceStatus((prev) => ({
      ...prev,
      [svc]: prev[svc] !== 'nao_previsto' ? 'nao_previsto' : 'confirmado',
    }));
    if (moduleValues[svc] === '') {
      setModuleValues((prev) => ({ ...prev, [svc]: '' }));
    }
  };

  const serviceColors = {
    arquitetura: {
      on: 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700',
      off: 'bg-white text-black border border-teal-500 hover:bg-teal-50',
    },
    engenharia: {
      on: 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800',
      off: 'bg-white text-black border border-blue-500 hover:bg-blue-50',
    },
    marcenaria: {
      on: 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700',
      off: 'bg-white text-black border border-amber-500 hover:bg-amber-50',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <Input
                className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                placeholder={card?.id ? 'Título do card' : 'Nova oportunidade'}
                value={formState.titulo || ''}
                onChange={(e) => handleFormChange('titulo', e.target.value)}
              />
              <DialogDescription>
                {card?.id ? <>Editando card</> : <>Preencha os detalhes da nova oportunidade</>}
              </DialogDescription>
              {responsibleUser && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <User className="h-4 w-4" />
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
                <Label htmlFor="client-select" className="text-lg font-semibold mb-3 block">
                  Cliente (opcional)
                </Label>
                <Select
                  value={selectedClientId || undefined}
                  onValueChange={(value) => setSelectedClientId(value === 'none' ? null : value)}
                >
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Nenhum cliente vinculado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-2">
                <Label className="text-lg font-semibold block">Módulos</Label>
                <div className="flex gap-3">
                  {['arquitetura', 'engenharia', 'marcenaria'].map((svc) => {
                    const active = serviceStatus[svc] !== 'nao_previsto';
                    const colors = serviceColors[svc];
                    const labels = {
                      arquitetura: 'Arquitetura',
                      engenharia: 'Engenharia',
                      marcenaria: 'Marcenaria',
                    };
                    return (
                      <Button
                        key={svc}
                        type="button"
                        className={`flex-1 ${active ? colors.on : colors.off}`}
                        onClick={() => toggleService(svc)}
                      >
                        {labels[svc]}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se estiver selecionado, ao mover para Fechamento o card será replicado automaticamente no Kanban do módulo.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {['arquitetura', 'engenharia', 'marcenaria'].map((svc) => (
                    <div key={`valor-${svc}`} className="space-y-1">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{svc}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={moduleValues[svc] ?? ''}
                        onChange={(e) =>
                          setModuleValues((prev) => ({
                            ...prev,
                            [svc]: e.target.value,
                          }))
                        }
                        placeholder="Valor estimado"
                        disabled={serviceStatus[svc] === 'nao_previsto'}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {!card?.id && (
                <section>
                  <Label htmlFor="column-select" className="text-lg font-semibold mb-3 block">
                    Coluna
                  </Label>
                  <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                    <SelectTrigger id="column-select">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>
              )}

              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" /> Checklist
                </h3>
                <div className="space-y-2">
                  {checklist.map((item) => (
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
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Novo item..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <Button onClick={handleAddChecklistItem}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Comentários
                </h3>
                <div className="space-y-4">
                  {comments
                    .slice()
                    .reverse()
                    .map((comment) => (
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
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário..."
                  />
                  <Button onClick={handleAddComment} className="mt-2">
                    Enviar Comentário
                  </Button>
                </div>
              </section>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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
