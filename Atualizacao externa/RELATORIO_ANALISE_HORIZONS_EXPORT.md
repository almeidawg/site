# Relatório de Análise - Horizons Export vs Código Local

**Data:** 04/11/2025
**Origem:** `horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip`
**Destino:** `/wg-crm/`

---

## RESUMO EXECUTIVO

Foram identificadas **8 mudanças críticas** e **15 componentes novos** que precisam ser migrados do export do Horizons para o código React local. As principais diferenças estão relacionadas a:

1. **Botão "Nova Oportunidade"** nas páginas de Kanban
2. **Dialog de edição completo** (KanbanCardDialog) com comentários e checklist
3. **Sistema de adicionar colunas** dinamicamente
4. **Renomeação inline** de colunas
5. **Submenus no Sidebar** (Comercial, Operacional)
6. **Novo serviço** `kanbanServices.js`
7. **Estrutura de dados payload** em cards

---

## 1. MUDANÇAS CRÍTICAS DETECTADAS

### 1.1 Botão "Nova Oportunidade" - CONFIRMADO AUSENTE

**STATUS:** Código local NÃO TEM o botão!

**Código Horizons (linhas 126-130 de KanbanBoard.jsx):**
```jsx
<div className="flex justify-end mb-4">
  <Button onClick={() => setIsNewOpportunityDialogOpen(true)}>
    <PlusCircle className="mr-2 h-4 w-4" /> Nova Oportunidade
  </Button>
</div>
```

**Código Local (Arquitetura.jsx):**
```jsx
// NÃO TEM BOTÃO! Apenas:
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold">
      <Building /> Projetos de Arquitetura
    </h1>
    <p>Gerencie o fluxo de trabalho...</p>
  </div>
  {/* FALTA O BOTÃO AQUI! */}
</div>
```

**O QUE ESTÁ FALTANDO:**
- Botão "Nova Oportunidade" visível
- State `isNewOpportunityDialogOpen`
- Dialog `<NovaOportunidadeDialog />`

---

### 1.2 Dialog de Edição de Cards (KanbanCardDialog) - AUSENTE

**STATUS:** Componente COMPLETAMENTE NOVO, não existe no código local!

**Funcionalidades do Dialog (253 linhas!):**
- ✅ Edição de título e descrição do card
- ✅ Sistema de comentários com avatar e timestamp
- ✅ Checklist com toggle/delete de itens
- ✅ Exibição do responsável (equipe)
- ✅ Salvar alterações com botão "Salvar e Fechar"

**Código Horizons (KanbanCardDialog.jsx - linhas chave):**
```jsx
const KanbanCardDialog = ({ card, open, onOpenChange, onUpdate }) => {
  // States:
  const [comments, setComments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [responsibleUser, setResponsibleUser] = useState(null);

  // Funções:
  const handleAddComment = async () => { /* ... */ }
  const handleAddChecklistItem = async () => { /* ... */ }
  const handleToggleChecklistItem = async (itemId) => { /* ... */ }
  const handleSaveChanges = async () => { /* ... */ }

  // UI: Título editável, descrição, checklist, comentários
}
```

**No código local:**
```jsx
// NÃO EXISTE! Apenas:
onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
```

---

### 1.3 Sistema de Adicionar Colunas - AUSENTE

**STATUS:** Componente `AddColumnCard.jsx` não existe no código local!

**Código Horizons (linhas 171-178 de KanbanBoard.jsx):**
```jsx
{boardId && (
  <div className="flex-shrink-0 w-80 min-w-[320px]">
    <AddColumnCard
      boardId={boardId}
      onCreated={(col) => setColumns((prev) => [...prev, col])}
    />
  </div>
)}
```

**AddColumnCard.jsx (67 linhas):**
```jsx
export function AddColumnCard({ boardId, onCreated }) {
  const [adding, setAdding] = useState(false);
  const [nome, setNome] = useState('');

  const submit = async () => {
    const col = await createColumn(boardId, nome.trim());
    onCreated(col);
    toast({ title: 'Coluna adicionada!' });
  };

  // UI: Botão "+ Nova coluna" que vira input
}
```

**No código local:**
```jsx
// NÃO EXISTE! Sem possibilidade de adicionar colunas pelo frontend
```

---

### 1.4 Renomeação Inline de Colunas - AUSENTE

**STATUS:** Componente `ColumnHeader.jsx` não existe no código local!

**Código Horizons (ColumnHeader.jsx - linhas 42-64):**
```jsx
export function ColumnHeader({ column, onRenamed, count, badgeColor }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(column.nome);

  const save = async () => {
    const updated = await renameColumn(column.id, newName);
    onRenamed(updated);
    toast({ title: 'Coluna renomeada!' });
  };

  return (
    <div className="flex items-center justify-between">
      {editing ? (
        <input onBlur={save} /* ... */ />
      ) : (
        <button onClick={() => setEditing(true)}>
          {column.nome}
        </button>
      )}
      <span style={{ background: badgeColor }}>{count}</span>
    </div>
  );
}
```

**No código local:**
```jsx
// NÃO EXISTE! Apenas:
onRenameColumn={handleNotImplemented}
```

---

### 1.5 Submenus no Sidebar - PARCIALMENTE IMPLEMENTADO

**STATUS:** Sidebar do Horizons tem submenus animados com Framer Motion!

**Código Horizons (Sidebar.jsx - linhas 22-39):**
```jsx
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users2, label: 'Pessoas', path: '/pessoas' },
  {
    icon: Briefcase, label: 'Comercial', path: '#', children: [
      { icon: FolderKanban, label: 'Oportunidades', path: '/oportunidades' },
      { icon: FileText, label: 'Propostas', path: '/propostas' },
      { icon: FileText, label: 'Contratos', path: '/contratos' },
    ]
  },
  {
    icon: Wrench, label: 'Operacional', path: '#', children: [
      { icon: Wrench, label: 'Assistência', path: '/assistencia' },
      { icon: GanttChart, label: 'Cronogramas', path: '/cronograma' },
      { icon: Archive, label: 'Doc./Exigências', path: '/documentos' },
    ]
  },
];
```

**Componente NavItem com animação (linhas 66-98):**
```jsx
const NavItem = ({ item, collapsed }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <div onClick={toggleSubMenu}>
          {/* Item principal */}
          {isSubMenuOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        <AnimatePresence>
          {isSubMenuOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="pl-6 border-l-2 border-primary/20">
                {item.children.map(child => <NavItem ... />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  // ...
}
```

**No código local (Sidebar.jsx):**
```jsx
const menuItems = [
  { name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { name: 'oportunidades', icon: Target, label: 'Oportunidades' },
  { name: 'propostas', icon: FileText, label: 'Propostas' },
  { name: 'contratos', icon: FileSignature, label: 'Contratos' },
  // ... (todos flat, sem children!)
];
```

**DIFERENÇA:** Sidebar local é flat (sem submenus), Horizons tem hierarquia com animação!

---

### 1.6 Serviço `kanbanServices.js` - AUSENTE

**STATUS:** Arquivo não existe no código local!

**Código Horizons (kanbanServices.js):**
```js
import { supabase } from '@/lib/customSupabaseClient';

export async function createColumn(boardId, nome, cor) {
  const payload = { board_id: boardId, nome: nome.trim(), cor: cor ?? '#E5E7EB' };
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

**No código local:**
```js
// NÃO EXISTE! Operações feitas inline nas páginas
```

---

### 1.7 Estrutura de Dados `payload` - DIFERENTE

**Código Horizons:**
```jsx
// NovaOportunidadeDialog.jsx (linhas 26-30)
payload: {
  arquitetura: false,
  engenharia: false,
  marcenaria: false,
}

// KanbanCardDialog.jsx (linhas 57-59)
const payload = cardData.payload || {};
setComments(payload.comments || []);
setChecklist(payload.checklist || []);
```

**Estrutura completa do payload:**
```json
{
  "arquitetura": boolean,
  "engenharia": boolean,
  "marcenaria": boolean,
  "comments": [
    {
      "id": timestamp,
      "text": string,
      "author": string,
      "author_id": uuid,
      "created_at": ISO string
    }
  ],
  "checklist": [
    {
      "id": timestamp,
      "text": string,
      "completed": boolean
    }
  ]
}
```

**No código local:**
```jsx
// Payload não é usado ou é diferente!
```

---

### 1.8 Click Handler em Cards - DIFERENTE

**Código Horizons (KanbanBoard.jsx - linhas 64-67, 158):**
```jsx
const handleCardClick = (card) => {
  setSelectedCard(card);
  setIsCardDialogOpen(true);
};

// ...
<div onClick={() => handleCardClick(card)}>
  <OportunidadeCard card={card} ... />
</div>
```

**No código local (Arquitetura.jsx):**
```jsx
onEditOportunidade={() => toast({ title: 'Edição de projeto em breve!' })}
// Não abre dialog!
```

---

## 2. COMPONENTES NOVOS/AUSENTES

### Componentes que EXISTEM no Horizons mas NÃO no código local:

| Componente | Caminho Horizons | Status Local | Linhas |
|------------|------------------|--------------|--------|
| `KanbanCardDialog.jsx` | `components/oportunidades/` | ❌ Ausente | 256 |
| `NovaOportunidadeDialog.jsx` | `components/oportunidades/` | ❌ Ausente | 190 |
| `AddColumnCard.jsx` | `components/oportunidades/` | ❌ Ausente | 67 |
| `ColumnHeader.jsx` | `components/oportunidades/` | ❌ Ausente | 75 |
| `kanbanServices.js` | `services/` | ❌ Ausente | 14 |

---

## 3. COMPARAÇÃO LINHA POR LINHA

### 3.1 KanbanBoard.jsx

| Funcionalidade | Horizons | Local | Status |
|----------------|----------|-------|--------|
| Botão "Nova Oportunidade" | ✅ Sim (linha 126) | ❌ Não | FALTA |
| Dialog NovaOportunidadeDialog | ✅ Sim (linha 184) | ❌ Não | FALTA |
| AddColumnCard | ✅ Sim (linha 171) | ❌ Não | FALTA |
| ColumnHeader | ✅ Sim (linha 142) | ❌ Não | FALTA |
| handleCardClick | ✅ Sim (linha 64) | ❌ Não | FALTA |
| KanbanCardDialog | ✅ Sim (linha 195) | ❌ Não | FALTA |
| State `boardId` | ✅ Sim (linha 18) | ⚠️ `pipelineId` | NOME DIFERENTE |
| State `selectedCard` | ✅ Sim (linha 23) | ❌ Não | FALTA |
| State `isCardDialogOpen` | ✅ Sim (linha 24) | ❌ Não | FALTA |

### 3.2 Arquitetura.jsx (e Engenharia.jsx, Marcenaria.jsx)

| Funcionalidade | Horizons | Local | Status |
|----------------|----------|-------|--------|
| Estrutura simples | ✅ 17 linhas | ❌ 192 linhas | LOCAL MAIS COMPLEXO |
| Passa `modulo` prop | ✅ Sim (linha 11) | ❌ Passa `columns`, `onDragEnd`, etc | DIFERENTE |
| Lógica de fetch | ❌ No KanbanBoard | ✅ Na página | ARQUITETURA DIFERENTE |

**Horizons (simples):**
```jsx
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
```

**Local (complexo):**
```jsx
const Arquitetura = () => {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [pipelineId, setPipelineId] = useState(null);

  const fetchBoardAndCards = useCallback(async () => {
    // 60 linhas de lógica de fetch!
  }, [toast]);

  // ... mais 100 linhas de lógica!

  return (
    <div className="h-full flex flex-col">
      {/* ... */}
      <KanbanBoard
        columns={columns}
        onDragEnd={onDragEnd}
        onRenameColumn={handleNotImplemented}
        // ... 5+ props!
      />
    </div>
  );
};
```

---

## 4. SIDEBAR - ANÁLISE COMPARATIVA

### 4.1 Estrutura de Menu

**Horizons (hierárquico):**
```
├── Dashboard
├── Pessoas
├── Comercial (submenu) ▾
│   ├── Oportunidades
│   ├── Propostas
│   └── Contratos
├── Financeiro
├── Arquitetura
├── Engenharia
├── Marcenaria
├── Compras
├── Operacional (submenu) ▾
│   ├── Assistência
│   ├── Cronogramas
│   └── Doc./Exigências
├── Onboarding
└── WG Store
```

**Local (flat):**
```
├── Dashboard
├── Oportunidades
├── Propostas
├── Contratos
├── Arquitetura
├── Engenharia
├── Marcenaria
├── Compras
├── Assistência
├── Financeiro
├── Pessoas
├── Usuários
└── Configurações
```

### 4.2 Componente NavItem

**Horizons:** Componente recursivo com suporte a children
**Local:** Componente simples sem hierarquia

---

## 5. BREAKING CHANGES

### 5.1 Estrutura de Props do KanbanBoard

**ANTES (Local):**
```jsx
<KanbanBoard
  columns={columns}           // Objeto { [columnId]: { id, name, items } }
  onDragEnd={onDragEnd}
  onRenameColumn={fn}
  onDeleteColumn={fn}
  onUpdateOportunidade={fn}
  onEditOportunidade={fn}
/>
```

**DEPOIS (Horizons):**
```jsx
<KanbanBoard
  modulo="arquitetura"        // String: 'arquitetura' | 'engenharia' | 'marcenaria'
/>
// TUDO é feito internamente no KanbanBoard!
```

### 5.2 Schema do Banco

**Tabela `kanban_cards.payload` deve suportar:**
```sql
payload JSONB DEFAULT '{
  "arquitetura": false,
  "engenharia": false,
  "marcenaria": false,
  "comments": [],
  "checklist": []
}'::jsonb
```

**View `v_kanban_cards` deve incluir:**
```sql
-- Já existe ou precisa adicionar colunas?
SELECT
  k.*,
  e.nome_razao_social as cliente,
  e.equipe
FROM kanban_cards k
LEFT JOIN entities e ON k.cliente_id = e.id
```

---

## 6. PLANO DE MIGRAÇÃO

### FASE 1: Setup Inicial (30min)

1. **Criar serviço:**
   ```bash
   cp horizons-export/src/services/kanbanServices.js wg-crm/src/services/
   ```

2. **Criar componentes base:**
   ```bash
   cp horizons-export/src/components/oportunidades/AddColumnCard.jsx wg-crm/src/components/oportunidades/
   cp horizons-export/src/components/oportunidades/ColumnHeader.jsx wg-crm/src/components/oportunidades/
   ```

3. **Validar imports:**
   - Verificar se `@/services/kanbanServices` resolve
   - Verificar se `@/components/ui/use-toast` existe
   - Verificar se `@hello-pangea/dnd` está instalado

### FASE 2: Dialog de Edição (1h)

4. **Criar KanbanCardDialog:**
   ```bash
   cp horizons-export/src/components/oportunidades/KanbanCardDialog.jsx wg-crm/src/components/oportunidades/
   ```

5. **Ajustar:**
   - Verificar imports de UI (Dialog, Button, Input, etc)
   - Verificar hook `useAuth()` compatível
   - Testar payload JSONB no Supabase

### FASE 3: Nova Oportunidade (45min)

6. **Criar NovaOportunidadeDialog:**
   ```bash
   cp horizons-export/src/components/oportunidades/NovaOportunidadeDialog.jsx wg-crm/src/components/oportunidades/
   ```

7. **Ajustar:**
   - Verificar Select/Checkbox components
   - Verificar estrutura de `entities` table
   - Testar criação de card

### FASE 4: Refatorar KanbanBoard (2h)

8. **Substituir KanbanBoard:**
   ```bash
   # BACKUP PRIMEIRO!
   cp wg-crm/src/components/oportunidades/KanbanBoard.jsx wg-crm/src/components/oportunidades/KanbanBoard.jsx.backup

   # Copiar novo
   cp horizons-export/src/components/oportunidades/KanbanBoard.jsx wg-crm/src/components/oportunidades/
   ```

9. **Refatorar páginas (Arquitetura, Engenharia, Marcenaria):**
   ```jsx
   // ANTES (192 linhas!)
   const Arquitetura = () => {
     const [columns, setColumns] = useState({});
     // ... muita lógica
     return <KanbanBoard columns={columns} onDragEnd={onDragEnd} ... />
   }

   // DEPOIS (17 linhas!)
   const Arquitetura = () => {
     return (
       <div className="flex flex-col h-full">
         <div className="p-4 border-b">
           <h1>Projetos de Arquitetura</h1>
         </div>
         <div className="flex-grow overflow-hidden">
           <KanbanBoard modulo="arquitetura" />
         </div>
       </div>
     );
   };
   ```

### FASE 5: Sidebar com Submenus (1h)

10. **Refatorar Sidebar:**
    ```bash
    # BACKUP
    cp wg-crm/src/components/layout/Sidebar.jsx wg-crm/src/components/layout/Sidebar.jsx.backup

    # Copiar novo
    cp horizons-export/src/components/layout/Sidebar.jsx wg-crm/src/components/layout/
    ```

11. **Ajustar:**
    - Verificar props (Horizons não usa `currentPage`, `setCurrentPage`)
    - Usar `useLocation()` e `NavLink` do react-router-dom
    - Verificar `useAuth()` compatível
    - Testar animações Framer Motion

### FASE 6: Testes e Validação (2h)

12. **Testar fluxo completo:**
    - [ ] Botão "Nova Oportunidade" aparece
    - [ ] Dialog de nova oportunidade funciona
    - [ ] Criação de oportunidade salva no banco
    - [ ] Click no card abre KanbanCardDialog
    - [ ] Edição de título/descrição funciona
    - [ ] Adicionar comentário funciona
    - [ ] Adicionar item checklist funciona
    - [ ] Toggle checklist item funciona
    - [ ] Botão "+ Nova coluna" aparece
    - [ ] Criar coluna funciona
    - [ ] Renomear coluna (click no título) funciona
    - [ ] Drag and drop funciona
    - [ ] Submenus no Sidebar funcionam
    - [ ] Navegação entre páginas funciona

---

## 7. COMANDOS DE MIGRAÇÃO

### Método Automático (recomendado):

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# 1. Criar diretório de backup
mkdir -p wg-crm/src-backup-pre-horizons-migration
cp -r wg-crm/src/components/oportunidades wg-crm/src-backup-pre-horizons-migration/
cp -r wg-crm/src/components/layout wg-crm/src-backup-pre-horizons-migration/
cp -r wg-crm/src/components/pages wg-crm/src-backup-pre-horizons-migration/

# 2. Criar serviços
mkdir -p wg-crm/src/services
cp "Atualizacao externa/horizons-export/src/services/kanbanServices.js" wg-crm/src/services/

# 3. Copiar novos componentes de Oportunidades
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanBoard.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanCardDialog.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/NovaOportunidadeDialog.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/AddColumnCard.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/ColumnHeader.jsx" wg-crm/src/components/oportunidades/

# 4. Copiar páginas simplificadas
cp "Atualizacao externa/horizons-export/src/components/pages/Arquitetura.jsx" wg-crm/src/components/pages/
cp "Atualizacao externa/horizons-export/src/components/pages/Engenharia.jsx" wg-crm/src/components/pages/
cp "Atualizacao externa/horizons-export/src/components/pages/Marcenaria.jsx" wg-crm/src/components/pages/

# 5. Copiar Sidebar com submenus
cp "Atualizacao externa/horizons-export/src/components/layout/Sidebar.jsx" wg-crm/src/components/layout/

# 6. Testar
cd wg-crm
npm run dev
```

---

## 8. RISCOS E CONSIDERAÇÕES

### 8.1 Riscos Altos

1. **Breaking Change em KanbanBoard:**
   - Props antigas (`columns`, `onDragEnd`, etc) não funcionarão mais
   - Páginas Arquitetura/Engenharia/Marcenaria precisam refatoração completa
   - **Risco:** Quebrar drag-and-drop se view `v_kanban_cards` estiver diferente

2. **Estrutura de Dados:**
   - Payload JSONB pode não existir ou ter estrutura diferente
   - **Risco:** Erros ao salvar comments/checklist se banco não suporta

3. **Sidebar:**
   - Props diferentes (não usa `currentPage`, `setCurrentPage`)
   - **Risco:** Navegação quebrar se rotas estiverem diferentes

### 8.2 Riscos Médios

4. **Imports de UI:**
   - Horizons usa shadcn/ui (Dialog, Select, Checkbox, etc)
   - **Risco:** Se wg-crm não tem esses componentes, precisará instalar

5. **Hooks:**
   - `useAuth()` pode ter interface diferente
   - `useToast()` pode não existir
   - **Risco:** Erros de runtime se hooks incompatíveis

### 8.3 Riscos Baixos

6. **Estilos:**
   - Tailwind classes diferentes
   - **Risco:** Layout ligeiramente diferente, mas funcional

---

## 9. CHECKLIST PRÉ-MIGRAÇÃO

Antes de aplicar qualquer mudança, verificar:

- [ ] Branch `dev-supabase-local` está ativa
- [ ] Supabase local rodando (`supabase status`)
- [ ] Backup do código atual criado
- [ ] Git commit atual limpo (`git status`)
- [ ] Tabela `kanban_cards` tem coluna `payload JSONB`
- [ ] View `v_kanban_cards` existe e retorna dados
- [ ] Componentes shadcn/ui instalados (Dialog, Select, etc)
- [ ] Framer Motion instalado (`npm list framer-motion`)
- [ ] Hook `useAuth()` existe em `contexts/SupabaseAuthContext`
- [ ] Hook `useToast()` existe em `components/ui/use-toast`

---

## 10. DIFERENÇAS NO SCHEMA DO BANCO

### Verificar se existe:

```sql
-- 1. View v_kanban_cards
SELECT * FROM v_kanban_cards LIMIT 1;

-- Deve retornar pelo menos:
-- id, titulo, descricao, coluna_id, board_id, cliente_id, ordem, payload, cliente (nome_razao_social), equipe

-- 2. Payload JSONB
SELECT payload FROM kanban_cards LIMIT 1;

-- Deve ser JSONB, não TEXT!

-- 3. Coluna 'equipe' em entities
SELECT equipe FROM entities LIMIT 1;

-- Deve existir (UUID do user_id responsável)
```

### Se não existir, criar:

```sql
-- Migration para suportar payload
ALTER TABLE kanban_cards
ALTER COLUMN payload TYPE JSONB USING payload::jsonb;

-- Default payload
ALTER TABLE kanban_cards
ALTER COLUMN payload SET DEFAULT '{
  "arquitetura": false,
  "engenharia": false,
  "marcenaria": false,
  "comments": [],
  "checklist": []
}'::jsonb;

-- Coluna equipe em entities
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS equipe UUID REFERENCES auth.users(id);
```

---

## 11. RESUMO FINAL

### O que DEVE ser aplicado (CRÍTICO):

1. ✅ Botão "Nova Oportunidade" (todas 3 páginas Kanban)
2. ✅ KanbanCardDialog completo (edição de cards)
3. ✅ AddColumnCard (adicionar colunas dinamicamente)
4. ✅ ColumnHeader (renomear colunas inline)
5. ✅ NovaOportunidadeDialog (criar oportunidades)

### O que PODE ser aplicado (MELHORIA):

6. ⚠️ Sidebar com submenus (melhora UX, mas não essencial)
7. ⚠️ Refatoração completa do KanbanBoard (simplifica código, mas é breaking)

### O que NÃO deve ser aplicado (RISCO):

8. ❌ Substituir KanbanBoard sem backup (pode quebrar tudo!)
9. ❌ Substituir Sidebar sem ajustar props (navegação quebra)

---

## 12. PRÓXIMOS PASSOS RECOMENDADOS

### Opção A: Migração Incremental (RECOMENDADO)

```
Fase 1: Adicionar componentes novos SEM quebrar os antigos
├── Copiar AddColumnCard.jsx
├── Copiar ColumnHeader.jsx
├── Copiar KanbanCardDialog.jsx
├── Copiar NovaOportunidadeDialog.jsx
└── Copiar kanbanServices.js

Fase 2: Refatorar KanbanBoard COM TESTES
├── Criar KanbanBoard.new.jsx com código do Horizons
├── Criar Arquitetura.new.jsx usando KanbanBoard.new
├── Testar em localhost
└── Se OK, renomear .new para substituir originais

Fase 3: Aplicar Sidebar com submenus (OPCIONAL)
├── Criar Sidebar.new.jsx com código do Horizons
├── Ajustar props para compatibilidade
├── Testar navegação
└── Se OK, substituir
```

### Opção B: Migração Completa (MAIS RÁPIDO, MAIS ARRISCADO)

```
1. Backup completo do código atual
2. Substituir TODOS os arquivos de uma vez
3. Corrigir erros conforme aparecem
4. Testar fluxo completo
```

---

## 13. CONTATO PARA DÚVIDAS

Se houver dúvidas durante a migração:

1. Consultar código do Horizons: `Atualizacao externa/horizons-export/`
2. Consultar este relatório para referências de linha
3. Criar issues no repositório para tracking

---

**FIM DO RELATÓRIO**

**Próxima ação recomendada:** Aplicar Fase 1 da Opção A (migração incremental)
