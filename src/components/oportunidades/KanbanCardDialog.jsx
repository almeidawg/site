
import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2, PlusCircle, Trash2, MessageSquare, CheckSquare, User, Save } from 'lucide-react';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { format } from 'date-fns';
    import { ptBR } from 'date-fns/locale';

    const KanbanCardDialog = ({ card, open, onOpenChange, onUpdate }) => {
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

        const [formState, setFormState] = useState({ titulo: '', descricao: '' });

        const handleFormChange = (field, value) => {
            setFormState(prevState => ({ ...prevState, [field]: value }));
        };

        const fetchCardData = useCallback(async () => {
            if (!card?.id) return;
            setLoading(true);
            setResponsibleUser(null);
            
            const { data: cardData, error: cardError } = await supabase
                .from('kanban_cards')
                .select('*, cliente:cliente_id(nome_razao_social, equipe)')
                .eq('id', card.id)
                .single();

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
            
            const payload = cardData.payload || {};
            setComments(payload.comments || []);
            setChecklist(payload.checklist || []);

            if (cardData.cliente?.equipe) {
                const { data: userData, error: userError } = await supabase
                    .from('user_profiles')
                    .select('user_id, nome, avatar_path')
                    .eq('user_id', cardData.cliente.equipe)
                    .single();
                if (userError) console.error("Error fetching responsible user:", userError.message);
                else setResponsibleUser(userData);
            }

            setLoading(false);
        }, [card, toast]);

        useEffect(() => {
            if (open) {
                fetchCardData();
            }
        }, [open, fetchCardData]);
        
        const handleSaveChanges = async () => {
            setIsSaving(true);
            const { error } = await supabase
                .from('kanban_cards')
                .update({
                    titulo: formState.titulo,
                    descricao: formState.descricao
                })
                .eq('id', card.id);
            setIsSaving(false);

            if (error) {
                toast({ title: 'Erro ao salvar alterações', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Card atualizado com sucesso!' });
                onUpdate();
                onOpenChange(false);
            }
        };

        const handleUpdatePayload = async (newPayload) => {
            const { error } = await supabase
                .from('kanban_cards')
                .update({ payload: { ...cardDetails.payload, ...newPayload }, updated_at: new Date().toISOString() })
                .eq('id', card.id);
            
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
                    {loading || !cardDetails ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <>
                            <DialogHeader>
                                <Input 
                                    className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 p-0"
                                    value={formState.titulo || ''}
                                    onChange={(e) => handleFormChange('titulo', e.target.value)}
                                />
                                <DialogDescription>
                                    Cliente: {cardDetails.cliente?.nome_razao_social || 'Não especificado'}
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
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckSquare className="h-5 w-5"/> Checklist</h3>
                                    <div className="space-y-2">
                                        {checklist.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 group">
                                                <Checkbox id={`check-${item.id}`} checked={item.completed} onCheckedChange={() => handleToggleChecklistItem(item.id)} />
                                                <Label htmlFor={`check-${item.id}`} className={`flex-grow ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</Label>

                                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteChecklistItem(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Input value={newChecklistItem} onChange={e => setNewChecklistItem(e.target.value)} placeholder="Novo item..." onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}/>
                                        <Button onClick={handleAddChecklistItem}><PlusCircle className="h-4 w-4 mr-2"/> Adicionar</Button>
                                    </div>
                                </section>
                                
                                <section>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5"/> Comentários</h3>
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
                                        <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Adicionar um comentário..."/>
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
