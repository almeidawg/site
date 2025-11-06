# Exemplos de Código Comparativo - Horizons vs Local

**Objetivo:** Facilitar a migração mostrando código lado a lado

---

## 1. ARQUITETURA.JSX - ANTES E DEPOIS

### ANTES (Código Local - 192 linhas)

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';
import { useToast } from '@/components/ui/use-toast';
import { Building, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Arquitetura = () => {
    const { toast } = useToast();
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(true);
    const [cards, setCards] = useState([]);
    const [pipelineId, setPipelineId] = useState(null);

    const fetchBoardAndCards = useCallback(async () => {
        setLoading(true);

        const { data: boardData, error: boardError } = await supabase
            .from('kanban_boards')
            .select('id, titulo, kanban_colunas(id, titulo, posicao)')
            .eq('ambiente', 'arquitetura')
            .single();

        if (boardError || !boardData) {
            toast({ title: 'Erro ao carregar o quadro de Arquitetura', variant: 'destructive' });
            setLoading(false);
            return;
        }

        setPipelineId(boardData.id);

        const { data: cardsData, error: cardsError } = await supabase
            .from('kanban_cards')
            .select('*')
            .in('coluna_id', boardData.kanban_colunas.map(c => c.id));

        if (cardsError) {
            toast({ title: 'Erro ao carregar os projetos', variant: 'destructive' });
            setLoading(false);
            return;
        }
        setCards(cardsData || []);

        const initialColumns = {};
        (boardData.kanban_colunas || [])
            .sort((a, b) => a.posicao - b.posicao)
            .forEach(coluna => {
                initialColumns[coluna.id] = {
                    id: coluna.id,
                    name: coluna.titulo,
                    items: (cardsData || []).filter(card => card.coluna_id === coluna.id).sort((a, b) => a.posicao - b.posicao)
                };
            });

        setColumns(initialColumns);
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchBoardAndCards();
    }, [fetchBoardAndCards]);

    const handleNotImplemented = () => toast({ title: "Funcionalidade em desenvolvimento" });

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        // 80 linhas de lógica de drag-and-drop...
    };

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
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-wg-arquitetura">
                        <Building /> Projetos de Arquitetura
                    </h1>
                    <p className="text-wg-gray-medium mt-1">
                        Gerencie o fluxo de trabalho dos seus projetos arquitetônicos.
                    </p>
                </div>
                {/* ❌ FALTA BOTÃO "NOVA OPORTUNIDADE" AQUI! */}
            </div>
            {cards.length > 0 ? (
                <div className="flex-grow overflow-hidden">
                    <KanbanBoard
                        columns={columns}
                        onDragEnd={onDragEnd}
                        onRenameColumn={handleNotImplemented}
                        onDeleteColumn={handleNotImplemented}
                        onUpdateOportunidade={handleNotImplemented}
                        onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
                    />
                </div>
            ) : (
                 <div className="col-span-full text-center py-16 bg-white rounded-2xl flex-grow flex flex-col justify-center items-center shadow-sm">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-wg-gray-medium">Nenhum projeto de arquitetura ativo no momento.</p>
                </div>
            )}
        </div>
    );
};

export default Arquitetura;
```

### DEPOIS (Código Horizons - 17 linhas!)

```jsx
import React from 'react';
import KanbanBoard from '@/components/oportunidades/KanbanBoard';

const Arquitetura = () => {
  return (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Projetos de Arquitetura</h1>
        </div>
        <div className="flex-grow overflow-hidden">
            <KanbanBoard modulo="arquitetura" />
        </div>
    </div>
  );
};

export default Arquitetura;
```

**DIFERENÇA:**
- ❌ Local: 192 linhas, lógica complexa de fetch, estado, drag-and-drop
- ✅ Horizons: 17 linhas, tudo delegado ao KanbanBoard!

---

## 2. KANBANBOARD.JSX - COMPARAÇÃO

### ANTES (Código Local - 27 linhas)

```jsx
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from '@/components/oportunidades/KanbanColumn';

const KanbanBoard = ({
  columns,
  onDragEnd,
  onRenameColumn,
  onDeleteColumn,
  onUpdateOportunidade,
  onEditOportunidade
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-2">
        {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              column={column}
              columnId={columnId}
              onRenameColumn={onRenameColumn}
              onDeleteColumn={onDeleteColumn}
              onUpdateOportunidade={onUpdateOportunidade}
              onEditOportunidade={onEditOportunidade}
            />
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
```

**PROPS:**
```jsx
columns={columns}           // Objeto { [columnId]: { id, name, items } }
onDragEnd={onDragEnd}       // Função
onRenameColumn={fn}         // Função
onDeleteColumn={fn}         // Função
onUpdateOportunidade={fn}   // Função
onEditOportunidade={fn}     // Função
```

### DEPOIS (Código Horizons - 217 linhas)

```jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import OportunidadeCard from './OportunidadeCard';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NovaOportunidadeDialog from '@/components/oportunidades/NovaOportunidadeDialog';
import NovoLeadDialog from '@/components/leads/NovoLeadDialog';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ColumnHeader } from './ColumnHeader';
import { AddColumnCard } from './AddColumnCard';
import KanbanCardDialog from './KanbanCardDialog';

const KanbanBoard = ({ modulo = 'oportunidades' }) => {
  const [columns, setColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [boardId, setBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewOpportunityDialogOpen, setIsNewOpportunityDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  const { toast } = useToast();

  const fetchBoardData = useCallback(async () => {
    setLoading(true);
    const { data: board } = await supabase
      .from('kanban_boards')
      .select('id')
      .eq('modulo', modulo)
      .single();

    if (!board) {
        toast({ title: `Board para módulo "${modulo}" não encontrado.`, variant: 'destructive'});
        setLoading(false);
        return;
    }
    setBoardId(board.id);

    const { data: cols } = await supabase
      .from('kanban_colunas')
      .select('id,nome,pos,cor')
      .eq('board_id', board.id)
      .order('pos', { ascending: true });
    setColumns(cols || []);

    const { data: kcards, error: cardsError } = await supabase
      .from('v_kanban_cards')
      .select('*')
      .eq('board_id', board.id)
      .is('deleted_at', null)
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true });

    if (cardsError) {
        toast({ title: 'Erro ao carregar cards', description: cardsError.message, variant: 'destructive' });
    }
    setCards(kcards || []);
    setLoading(false);
  }, [modulo, toast]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsCardDialogOpen(true);
  };

  const cardsByColumn = useMemo(() => {
    const map = {};
    columns.forEach(c => (map[c.id] = []));
    cards.forEach(card => {
      if (!map[card.coluna_id]) map[card.coluna_id] = [];
      map[card.coluna_id].push(card);
    });
    return map;
  }, [cards, columns]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Lógica completa de drag-and-drop...

    const { error } = await supabase.from('kanban_cards').update({
      coluna_id: destination.droppableId,
      ordem: destination.index + 1,
    }).eq('id', draggableId);

    if (error) {
        toast({ title: "Erro ao mover card", description: error.message, variant: "destructive" });
    } else {
        fetchBoardData();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      {/* ✅ BOTÃO "NOVA OPORTUNIDADE" */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsNewOpportunityDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Oportunidade
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex items-start space-x-4 pb-4">
                {columns.map((col) => (
                    <Droppable droppableId={String(col.id)} key={col.id}>
                        {(provided, snapshot) => (
                            <div
                                className="flex-shrink-0 w-80 min-w-[320px] rounded-lg p-3 bg-gray-100"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {/* ✅ HEADER COM RENOMEAÇÃO INLINE */}
                                <ColumnHeader
                                  column={col}
                                  count={cardsByColumn[col.id]?.length || 0}
                                  badgeColor={col.cor}
                                  onRenamed={(updated) =>
                                    setColumns((prev) => prev.map((c) => (c.id === updated.id ? { ...c, nome: updated.nome } : c)))
                                  }
                                />

                                <div className="space-y-3 min-h-[400px]">
                                    {(cardsByColumn[col.id] || []).map((card, index) => (
                                        <Draggable draggableId={card.id} index={index} key={card.id}>
                                            {(prov) => (
                                                <div
                                                    ref={prov.innerRef}
                                                    {...prov.draggableProps}
                                                    {...prov.dragHandleProps}
                                                    onClick={() => handleCardClick(card)}
                                                >
                                                    <OportunidadeCard card={card} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}

                {/* ✅ BOTÃO "NOVA COLUNA" */}
                {boardId && (
                  <div className="flex-shrink-0 w-80 min-w-[320px]">
                    <AddColumnCard
                      boardId={boardId}
                      onCreated={(col) => setColumns((prev) => [...prev, col])}
                    />
                  </div>
                )}
            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DragDropContext>

      {/* ✅ DIALOG NOVA OPORTUNIDADE */}
      <NovaOportunidadeDialog
        open={isNewOpportunityDialogOpen}
        onOpenChange={setIsNewOpportunityDialogOpen}
        onSave={() => {
          setIsNewOpportunityDialogOpen(false);
          fetchBoardData();
        }}
        boardId={boardId}
        columns={columns}
      />

      {/* ✅ DIALOG EDIÇÃO DE CARD */}
      {selectedCard && (
        <KanbanCardDialog
          card={selectedCard}
          open={isCardDialogOpen}
          onOpenChange={setIsCardDialogOpen}
          onUpdate={fetchBoardData}
        />
      )}
    </>
  );
};

export default KanbanBoard;
```

**PROPS:**
```jsx
modulo="arquitetura"  // String simples!
// TUDO é gerenciado internamente!
```

**DIFERENÇA:**
- ✅ Botão "Nova Oportunidade" incluído
- ✅ Dialog de edição de cards
- ✅ Sistema de adicionar colunas
- ✅ Renomeação inline de colunas
- ✅ Toda lógica de fetch dentro do componente

---

## 3. ADDCOLUMNCARD.JSX (NOVO)

```jsx
import React, { useState, useRef, useEffect } from 'react';
import { createColumn } from '@/services/kanbanServices';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function AddColumnCard({ boardId, onCreated }) {
  const [adding, setAdding] = useState(false);
  const [nome, setNome] = useState('');
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (adding) {
      inputRef.current?.focus();
    }
  }, [adding]);

  const submit = async () => {
    if (!nome.trim()) {
        setAdding(false);
        return;
    }
    try {
        const col = await createColumn(boardId, nome.trim());
        onCreated(col);
        toast({ title: 'Coluna adicionada!' });
    } catch(error) {
        toast({ title: 'Erro ao criar coluna', description: error.message, variant: 'destructive' });
    } finally {
        setNome('');
        setAdding(false);
    }
  };

  if (!adding)
    return (
      <Button
        onClick={() => setAdding(true)}
        variant="outline"
        className="w-full h-[44px] rounded-lg border-dashed text-muted-foreground hover:bg-muted/50"
      >
        <Plus className="mr-2 h-4 w-4" /> Nova coluna
      </Button>
    );

  return (
    <div className="p-2 bg-muted rounded-lg border shadow-sm">
      <input
        ref={inputRef}
        className="w-full border rounded px-2 py-1 text-sm"
        placeholder="Título da coluna"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setNome(''); setAdding(false); }
        }}
        onBlur={submit}
      />
      <div className="flex gap-2 mt-2">
        <Button onClick={submit} size="sm">Adicionar</Button>
        <Button onClick={() => { setNome(''); setAdding(false); }} size="sm" variant="ghost">Cancelar</Button>
      </div>
    </div>
  );
}
```

**USO:**
```jsx
<AddColumnCard
  boardId={boardId}
  onCreated={(newColumn) => setColumns((prev) => [...prev, newColumn])}
/>
```

---

## 4. COLUMNHEADER.JSX (NOVO)

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { renameColumn } from '@/services/kanbanServices';
import { useToast } from '@/components/ui/use-toast';

export function ColumnHeader({ column, onRenamed, count, badgeColor }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(column.nome);
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = async () => {
    const newName = value.trim();
    if (!newName || newName === column.nome) {
      setEditing(false);
      setValue(column.nome);
      return;
    }
    try {
      const updated = await renameColumn(column.id, newName);
      onRenamed(updated);
      toast({ title: 'Coluna renomeada!' });
    } catch(error) {
      toast({ title: 'Erro ao renomear', description: error.message, variant: 'destructive' });
      setValue(column.nome);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      {editing ? (
        <input
          ref={inputRef}
          className="border rounded px-2 py-1 text-sm w-full font-semibold"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setValue(column.nome); setEditing(false); }
          }}
        />
      ) : (
        <button
          className="font-semibold text-left hover:underline"
          title="Renomear coluna"
          onClick={() => setEditing(true)}
        >
          {column.nome}
        </button>
      )}

      <span
        className="text-xs px-2 py-0.5 rounded-full select-none"
        style={{ background: badgeColor ?? '#eee', color: '#1f2937' }}
        title="Quantidade de cards"
      >
        {count}
      </span>
    </div>
  );
}
```

**USO:**
```jsx
<ColumnHeader
  column={col}
  count={cardsByColumn[col.id]?.length || 0}
  badgeColor={col.cor}
  onRenamed={(updated) =>
    setColumns((prev) => prev.map((c) => c.id === updated.id ? { ...c, nome: updated.nome } : c))
  }
/>
```

---

## 5. KANBANSERVICES.JS (NOVO)

```js
import { supabase } from '@/lib/customSupabaseClient';

export async function createColumn(boardId, nome, cor) {
  const payload = {
    board_id: boardId,
    nome: nome.trim(),
    cor: cor ?? '#E5E7EB'
  };

  const { data, error } = await supabase
    .from('kanban_colunas')
    .insert(payload)
    .select('id,nome,pos,cor')
    .single();

  if (error) throw error;
  return data;
}

export async function renameColumn(columnId, nome) {
  const { data, error } = await supabase
    .from('kanban_colunas')
    .update({ nome: nome.trim() })
    .eq('id', columnId)
    .select('id,nome,pos,cor')
    .single();

  if (error) throw error;
  return data;
}
```

**USO:**
```jsx
import { createColumn, renameColumn } from '@/services/kanbanServices';

// Criar coluna
const newCol = await createColumn(boardId, 'Novo Status');

// Renomear coluna
const updated = await renameColumn(columnId, 'Status Atualizado');
```

---

## 6. SIDEBAR COM SUBMENUS

### ANTES (Código Local - flat)

```jsx
const menuItems = [
  { name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { name: 'oportunidades', icon: Target, label: 'Oportunidades' },
  { name: 'propostas', icon: FileText, label: 'Propostas' },
  { name: 'contratos', icon: FileSignature, label: 'Contratos' },
  { name: 'arquitetura', icon: Building2, label: 'Arquitetura' },
  // ... (todos no mesmo nível!)
];

// Renderização simples:
{menuItems.map((item) => (
  <button onClick={() => handleNavigation(item.name)}>
    <item.icon size={20} />
    {isOpen && <span className="ml-4">{item.label}</span>}
  </button>
))}
```

### DEPOIS (Código Horizons - hierárquico)

```jsx
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users2, label: 'Pessoas', path: '/pessoas' },
  {
    icon: Briefcase,
    label: 'Comercial',
    path: '#',
    children: [  // ✅ SUBMENU!
      { icon: FolderKanban, label: 'Oportunidades', path: '/oportunidades' },
      { icon: FileText, label: 'Propostas', path: '/propostas' },
      { icon: FileText, label: 'Contratos', path: '/contratos' },
    ]
  },
  {
    icon: Wrench,
    label: 'Operacional',
    path: '#',
    children: [  // ✅ SUBMENU!
      { icon: Wrench, label: 'Assistência', path: '/assistencia' },
      { icon: GanttChart, label: 'Cronogramas', path: '/cronograma' },
      { icon: Archive, label: 'Doc./Exigências', path: '/documentos' },
    ]
  },
];

// Componente recursivo:
const NavItem = ({ item, collapsed }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <div onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}>
          <item.icon className="h-5 w-5" />
          {!collapsed && <span>{item.label}</span>}
          {!collapsed && (isSubMenuOpen ? <ChevronDown /> : <ChevronRight />)}
        </div>

        {/* ✅ ANIMAÇÃO DO SUBMENU */}
        <AnimatePresence>
          {isSubMenuOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="pl-6 border-l-2">
                {item.children.map(child => (
                  <NavItem key={child.path} item={child} collapsed={collapsed} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Item normal (sem children)
  return (
    <NavLink to={item.path}>
      <item.icon />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
};
```

---

## 7. KANBANCARDIALOG.JSX (RESUMO)

```jsx
const KanbanCardDialog = ({ card, open, onOpenChange, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [formState, setFormState] = useState({ titulo: '', descricao: '' });

  // Fetch card data + payload
  useEffect(() => {
    if (open) {
      const fetchCardData = async () => {
        const { data: cardData } = await supabase
          .from('kanban_cards')
          .select('*, cliente:cliente_id(nome_razao_social, equipe)')
          .eq('id', card.id)
          .single();

        setFormState({
          titulo: cardData.titulo,
          descricao: cardData.descricao
        });

        const payload = cardData.payload || {};
        setComments(payload.comments || []);
        setChecklist(payload.checklist || []);
      };
      fetchCardData();
    }
  }, [open, card]);

  // Salvar título/descrição
  const handleSaveChanges = async () => {
    await supabase
      .from('kanban_cards')
      .update({ titulo: formState.titulo, descricao: formState.descricao })
      .eq('id', card.id);

    onUpdate();
    onOpenChange(false);
  };

  // Adicionar comentário
  const handleAddComment = async () => {
    const comment = {
      id: Date.now(),
      text: newComment,
      author: currentUserProfile?.nome || 'Usuário',
      author_id: currentUserProfile?.user_id,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...comments, comment];

    await supabase
      .from('kanban_cards')
      .update({ payload: { ...cardDetails.payload, comments: updatedComments } })
      .eq('id', card.id);

    setComments(updatedComments);
    setNewComment('');
  };

  // Adicionar item checklist
  const handleAddChecklistItem = async () => {
    const item = {
      id: Date.now(),
      text: newChecklistItem,
      completed: false,
    };

    const updatedChecklist = [...checklist, item];

    await supabase
      .from('kanban_cards')
      .update({ payload: { ...cardDetails.payload, checklist: updatedChecklist } })
      .eq('id', card.id);

    setChecklist(updatedChecklist);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          {/* ✅ Título editável inline */}
          <Input
            value={formState.titulo}
            onChange={(e) => setFormState({ ...formState, titulo: e.target.value })}
          />
        </DialogHeader>

        <div className="overflow-y-auto space-y-6">
          {/* ✅ Descrição editável */}
          <Textarea
            value={formState.descricao}
            onChange={(e) => setFormState({ ...formState, descricao: e.target.value })}
          />

          {/* ✅ Checklist */}
          <section>
            <h3>Checklist</h3>
            {checklist.map(item => (
              <div key={item.id}>
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleChecklistItem(item.id)}
                />
                <Label>{item.text}</Label>
                <Button onClick={() => handleDeleteChecklistItem(item.id)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Input
              value={newChecklistItem}
              onChange={e => setNewChecklistItem(e.target.value)}
            />
            <Button onClick={handleAddChecklistItem}>Adicionar</Button>
          </section>

          {/* ✅ Comentários */}
          <section>
            <h3>Comentários</h3>
            {comments.map(comment => (
              <div key={comment.id}>
                <Avatar><AvatarFallback>{comment.author?.[0]}</AvatarFallback></Avatar>
                <div>
                  <p><strong>{comment.author}</strong> - {format(new Date(comment.created_at), "dd/MM/yy HH:mm")}</p>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}
            <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} />
            <Button onClick={handleAddComment}>Enviar Comentário</Button>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleSaveChanges}>Salvar e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 8. NOVAOPORTUNIDADEDIALOG.JSX (RESUMO)

```jsx
const NovaOportunidadeDialog = ({ open, onOpenChange, onSave, boardId, columns }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    cliente_id: '',
    descricao: '',
    coluna_id: columns?.[0]?.id || '',
    valor_proposta: '',
    payload: {
      arquitetura: false,
      engenharia: false,
      marcenaria: false,
    },
  });

  const handleSalvarCard = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      board_id: boardId,
      created_by: user.id,
      valor_proposta: parseFloat(formData.valor_proposta) || 0,
    };

    const { error } = await supabase
      .from('kanban_cards')
      .insert(payload);

    if (!error) {
      toast({ title: 'Oportunidade criada!' });
      onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Oportunidade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSalvarCard}>
          {/* ✅ Título */}
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
          />

          {/* ✅ Cliente (Select) */}
          <Select
            onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
            value={formData.cliente_id}
          >
            <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
            <SelectContent>
              {clientes.map(cliente => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome_razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ✅ Valor Proposta */}
          <Input
            id="valor_proposta"
            type="number"
            value={formData.valor_proposta}
            onChange={handleChange}
          />

          {/* ✅ Descrição */}
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={handleChange}
          />

          {/* ✅ Módulos de Interesse (Checkboxes) */}
          <div className="flex items-center space-x-4">
            <Checkbox
              id="arquitetura"
              checked={formData.payload?.arquitetura}
              onCheckedChange={() =>
                setFormData({
                  ...formData,
                  payload: { ...formData.payload, arquitetura: !formData.payload.arquitetura }
                })
              }
            />
            <Label htmlFor="arquitetura">Arquitetura</Label>

            <Checkbox id="engenharia" ... />
            <Label htmlFor="engenharia">Engenharia</Label>

            <Checkbox id="marcenaria" ... />
            <Label htmlFor="marcenaria">Marcenaria</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Oportunidade</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 9. RESUMO DE IMPORTS NECESSÁRIOS

### shadcn/ui Components (verificar se existem):

```jsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
```

### Dependências externas (verificar se instaladas):

```bash
npm list framer-motion        # Animações
npm list @hello-pangea/dnd    # Drag and drop
npm list date-fns             # Formatação de datas
npm list lucide-react         # Ícones
```

---

**FIM DOS EXEMPLOS**

**Uso recomendado:** Use este arquivo como referência durante a migração para copiar trechos de código específicos.
