# Plano de Ação - Migração Horizons → Local

**Objetivo:** Aplicar as mudanças do export do Horizons no código local de forma segura e incremental.

---

## RESUMO EXECUTIVO

**Total de arquivos a copiar:** 5
**Total de arquivos a modificar:** 4
**Mudanças de Backend:** 7 (migrations, views, functions)
**Edge Functions:** 10+ (já existem, verificar integração)
**Tempo estimado:** 6-8 horas
**Complexidade:** Alta (envolve backend + frontend)

---

## 📋 CHECKLIST MASTER - Para TodoWrite

Copie e cole este checklist no TodoWrite quando iniciar a migração:

```markdown
### FASE 0: Preparação Ambiente (30 min)
- [ ] Git checkout dev-supabase-local
- [ ] Supabase start (aguardar containers)
- [ ] Verificar migrations aplicadas
- [ ] Frontend rodando (npm run dev porta 3001)
- [ ] Edge Functions servindo (supabase functions serve)
- [ ] Backup completo do banco local

### FASE 1: Backend - Schema (1h)
- [ ] Criar migration: 050_adicionar_campos_kanban_horizons.sql
- [ ] Adicionar campo 'modulo' em kanban_boards
- [ ] Alterar campo 'titulo' → 'nome' em kanban_colunas
- [ ] Alterar campo 'posicao' → 'pos' em kanban_colunas
- [ ] Garantir campo 'cor' em kanban_colunas
- [ ] Adicionar campo 'ordem' em kanban_cards
- [ ] Adicionar campo 'deleted_at' em kanban_cards
- [ ] Garantir campo 'payload' é JSONB
- [ ] Aplicar migration localmente
- [ ] Validar schema com queries

### FASE 2: Backend - Views (30 min)
- [ ] Criar view v_kanban_cards (compatível com Horizons)
- [ ] Incluir campos: id, titulo, descricao, coluna_id, board_id
- [ ] Incluir joins: cliente, responsavel
- [ ] Incluir campo 'ordem' para sorting
- [ ] Incluir filtro deleted_at IS NULL
- [ ] Testar view com SELECT

### FASE 3: Backend - Functions (1h)
- [ ] Criar função: api_criar_coluna_kanban
- [ ] Criar função: api_renomear_coluna
- [ ] Criar função: api_mover_card
- [ ] Criar função: api_atualizar_payload_card
- [ ] Testar functions com BEGIN/ROLLBACK
- [ ] Salvar .test.sql

### FASE 4: Backend - RLS (30 min)
- [ ] Verificar RLS em kanban_boards
- [ ] Verificar RLS em kanban_colunas
- [ ] Verificar RLS em kanban_cards
- [ ] Criar policies se necessário
- [ ] Testar RLS com diferentes users

### FASE 5: Edge Functions (1h)
- [ ] Verificar Edge Functions existentes
- [ ] Comparar com Horizons export
- [ ] Função contrato-pdf existe e funciona
- [ ] Função proposta-pdf existe e funciona
- [ ] Função sheets-export-* existe
- [ ] Testar localmente (curl)
- [ ] Validar resposta

### FASE 6: Frontend - Componentes (2h)
- [ ] Instalar dependências (shadcn/ui, framer-motion, etc)
- [ ] Copiar KanbanBoard.jsx
- [ ] Copiar KanbanCardDialog.jsx
- [ ] Copiar NovaOportunidadeDialog.jsx
- [ ] Copiar AddColumnCard.jsx
- [ ] Copiar ColumnHeader.jsx
- [ ] Copiar kanbanServices.js
- [ ] Testar componentes isolados

### FASE 7: Frontend - Páginas (1h)
- [ ] Atualizar Arquitetura.jsx
- [ ] Atualizar Engenharia.jsx
- [ ] Atualizar Marcenaria.jsx
- [ ] Verificar prop 'modulo' passada
- [ ] Testar todas páginas

### FASE 8: Validação Final (1h)
- [ ] Criar oportunidade
- [ ] Editar card (comentários, checklist)
- [ ] Adicionar coluna
- [ ] Renomear coluna
- [ ] Drag and drop
- [ ] Verificar persistência no banco
- [ ] Performance aceitável
- [ ] Sem erros no console
```

---

## 🔄 RETOMANDO TRABALHO APÓS QUEDA DO CHAT

Se este chat cair, siga estes passos para retomar:

### 1. Identificar Estado Atual

```bash
# Ver branch atual
git branch --show-current  # Deve ser: dev-supabase-local

# Ver última migration aplicada
docker exec -it supabase_db_WG psql -U postgres -d postgres -c \
  "SELECT filename FROM supabase_migrations.schema_migrations ORDER BY inserted_at DESC LIMIT 5;"

# Ver arquivos modificados (não commitados)
git status

# Ver commits recentes
git log --oneline -10
```

### 2. Verificar Ambiente

```bash
# Supabase rodando?
supabase status

# Se não estiver, iniciar:
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase
supabase start

# Frontend rodando?
lsof -i :3001

# Se não estiver, iniciar:
cd /Users/valdair/Documents/Projetos/William\ WG/wg-crm
npm run dev

# Edge Functions rodando?
lsof -i :54321
# Se não, servir:
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase
supabase functions serve
```

### 3. Consultar Documentação

Todos arquivos estão em:
`/Users/valdair/Documents/Projetos/William WG/Atualizacao externa/`

- INDEX.md - Visão geral
- PLANO_DE_ACAO_MIGRACAO.md - Este arquivo (passo a passo)
- RESUMO_VISUAL.md - Diagramas
- RELATORIO_ANALISE.md - Análise técnica completa

### 4. Retomar do TodoWrite

```bash
# Ver última tarefa em progresso
cat .claude/todolist.json 2>/dev/null || echo "Nenhuma todo salva"
```

### 5. Validar Onde Parou

```bash
# Backend: Verificar se migrations foram aplicadas
docker exec -it supabase_db_WG psql -U postgres -d postgres -c \
  "SELECT * FROM supabase_migrations.schema_migrations WHERE filename LIKE '%horizons%';"

# Verificar se view existe
docker exec -it supabase_db_WG psql -U postgres -d postgres -c \
  "\dv v_kanban_cards"

# Frontend: Verificar se componentes existem
ls -la /Users/valdair/Documents/Projetos/William\ WG/wg-crm/src/services/kanbanServices.js
ls -la /Users/valdair/Documents/Projetos/William\ WG/wg-crm/src/components/oportunidades/AddColumnCard.jsx
```

### 6. Continuar do Ponto Certo

Baseado no que encontrou acima:
- Fase 0-2 (Backend schema/views): Continue em FASE 3
- Fase 3-5 (Backend completo): Continue em FASE 6
- Fase 6-7 (Frontend): Continue em FASE 8
- Fase 8: Fazer validação final e deploy

---

## 🚀 SETUP COMPLETO - SUPABASE LOCAL

### Pré-requisitos

```bash
# Docker rodando
docker ps

# Supabase CLI instalado
supabase --version

# PostgreSQL client (para testes)
psql --version || echo "psql não instalado (opcional)"
```

### Iniciar Supabase Local (Terminal 1)

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Iniciar todos containers
supabase start

# AGUARDAR até ver:
# "Started supabase local development setup."

# Verificar status
supabase status

# Deve mostrar:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL: http://127.0.0.1:54323
# Anon key: sb_publishable_...
# Service Role key: sb_secret_...
```

### Edge Functions (Terminal 2 - Se precisar)

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Servir todas functions (hot reload ativado)
supabase functions serve

# Ou servir função específica
supabase functions serve contrato-pdf

# Testar Edge Function
curl -X POST http://127.0.0.1:54321/functions/v1/contrato-pdf \
  -H "Authorization: Bearer $(supabase status | grep 'Publishable key' | awk '{print $3}')" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Frontend React (Terminal 3)

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/wg-crm
npm run dev

# App em: http://localhost:3001
```

### Testar Conexão

```bash
# 1. PostgreSQL direto
docker exec -it supabase_db_WG psql -U postgres -d postgres -c "SELECT version();"

# 2. API REST
curl http://127.0.0.1:54321/rest/v1/ \
  -H "apikey: $(supabase status | grep 'Publishable key' | awk '{print $3}')"

# 3. Studio (navegador)
open http://127.0.0.1:54323
```

---

## 🔍 DEBUG E TROUBLESHOOTING

### Ver Logs

```bash
# Logs do PostgreSQL
docker logs supabase_db_WG --tail 50 --follow

# Logs da API
docker logs supabase_kong_WG --tail 50 --follow

# Logs Edge Functions
docker logs supabase_edge_runtime_WG --tail 50 --follow

# Logs de tudo (Supabase CLI)
supabase logs --follow
```

### Resetar Banco Local

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Resetar (reaplicar migrations)
supabase db reset

# CUIDADO: Apaga TODOS dados locais e reaplica migrations do zero
```

### Testar Queries Manualmente

```bash
# Abrir psql
docker exec -it supabase_db_WG psql -U postgres -d postgres

# Dentro do psql:
\dt                -- Listar tabelas
\dv                -- Listar views
\df api_*          -- Listar functions que começam com api_
\d+ kanban_cards   -- Descrever estrutura da tabela

-- Testar query
SELECT * FROM kanban_boards;
SELECT * FROM kanban_colunas LIMIT 5;
SELECT * FROM v_kanban_cards LIMIT 5;

-- Sair
\q
```

### Validar RLS

```bash
# Via psql
docker exec -it supabase_db_WG psql -U postgres -d postgres << 'EOF'
-- Ver RLS de uma tabela
SELECT
  schemaname, tablename,
  pg_catalog.pg_get_userbyid(tableowner) AS owner,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('kanban_boards', 'kanban_colunas', 'kanban_cards');

-- Ver policies
SELECT * FROM pg_policies WHERE tablename = 'kanban_cards';
EOF
```

---

## 🛠️ MUDANÇAS DE BACKEND NECESSÁRIAS

### 1. Schema do Banco de Dados

**Tabela: kanban_boards**
- ✅ Já existe: id, ambiente, titulo, descricao
- ❌ FALTANDO: campo 'modulo' (alias para 'ambiente')
- 📝 AÇÃO: Adicionar alias ou renomear campo

**Tabela: kanban_colunas**
- ✅ Já existe: id, board_id, cor
- ❌ DIFERENTE: campo 'titulo' deveria ser 'nome'
- ❌ DIFERENTE: campo 'posicao' deveria ser 'pos'
- 📝 AÇÃO: Renomear campos ou criar aliases

**Tabela: kanban_cards**
- ✅ Já existe: id, coluna_id, titulo, descricao
- ❌ FALTANDO: campo 'ordem' (para ordenação)
- ❌ FALTANDO: campo 'deleted_at' (soft delete)
- ❌ DIFERENTE: campo 'dados' deveria ser 'payload' (JSONB)
- 📝 AÇÃO: Adicionar campos faltantes

### 2. Views Necessárias

**View: v_kanban_cards**
```sql
CREATE OR REPLACE VIEW v_kanban_cards AS
SELECT
  k.id,
  k.titulo,
  k.descricao,
  k.coluna_id,
  kb.id as board_id,
  kb.modulo, -- ou ambiente AS modulo
  k.ordem,
  k.deleted_at,
  k.payload, -- ou dados AS payload
  e.id as cliente_id,
  e.nome as cliente,
  p.id as responsavel_id,
  p.nome as responsavel
FROM kanban_cards k
JOIN kanban_colunas kc ON k.coluna_id = kc.id
JOIN kanban_boards kb ON kc.board_id = kb.id
LEFT JOIN entities e ON k.entity_id = e.id
LEFT JOIN profiles p ON k.responsavel_id = p.id;
```

### 3. Funções SQL Necessárias

**Função: api_criar_coluna**
```sql
CREATE OR REPLACE FUNCTION api_criar_coluna(
  p_board_id uuid,
  p_nome text,
  p_cor text DEFAULT '#E5E7EB'
) RETURNS json AS $$
-- Implementação
$$ LANGUAGE plpgsql;
```

**Função: api_renomear_coluna**
```sql
CREATE OR REPLACE FUNCTION api_renomear_coluna(
  p_coluna_id uuid,
  p_nome text
) RETURNS json AS $$
-- Implementação
$$ LANGUAGE plpgsql;
```

---

## PRÉ-REQUISITOS

### 1. Verificar Dependências

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Verificar se shadcn/ui está instalado
ls -la src/components/ui/

# Deve conter:
# - button.jsx
# - dialog.jsx
# - input.jsx
# - label.jsx
# - textarea.jsx
# - select.jsx
# - checkbox.jsx
# - avatar.jsx
# - scroll-area.jsx
# - toast.jsx / use-toast.js

# Verificar dependências NPM
npm list framer-motion @hello-pangea/dnd date-fns lucide-react
```

**Se alguma dependência estiver faltando:**

```bash
# Instalar shadcn/ui components (se necessário)
npx shadcn-ui@latest add button dialog input label textarea select checkbox avatar scroll-area toast

# Instalar dependências NPM
npm install framer-motion @hello-pangea/dnd date-fns lucide-react
```

### 2. Verificar Schema do Banco

```bash
cd "/Users/valdair/Documents/Projetos/William WG/Supabase"
supabase start

# Conectar ao PostgreSQL
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

```sql
-- Verificar estrutura de kanban_cards
\d kanban_cards

-- Deve ter:
-- - payload JSONB (não TEXT!)

-- Verificar view v_kanban_cards
\d v_kanban_cards

-- Deve retornar:
-- - id, titulo, descricao, coluna_id, board_id, cliente_id
-- - cliente (nome_razao_social)
-- - equipe (user_id do responsável)

-- Verificar se existe
SELECT * FROM v_kanban_cards LIMIT 1;
```

**Se payload não for JSONB:**

```sql
-- Converter payload para JSONB
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
```

### 3. Criar Backup

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Git status limpo
git status

# Se houver mudanças não commitadas, commitar primeiro
git add .
git commit -m "chore: Pre-migration backup"

# Criar branch de backup
git checkout -b backup-pre-horizons-migration
git checkout dev-supabase-local

# Backup manual dos arquivos que serão modificados
mkdir -p wg-crm/src-backup-$(date +%Y%m%d)
cp -r wg-crm/src/components/oportunidades wg-crm/src-backup-$(date +%Y%m%d)/
cp -r wg-crm/src/components/layout wg-crm/src-backup-$(date +%Y%m%d)/
cp -r wg-crm/src/components/pages wg-crm/src-backup-$(date +%Y%m%d)/
```

---

## FASE 1: COMPONENTES AUXILIARES (30 min)

### Passo 1.1: Criar Serviço `kanbanServices.js`

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Criar diretório services se não existir
mkdir -p wg-crm/src/services

# Copiar serviço
cp "Atualizacao externa/horizons-export/src/services/kanbanServices.js" \
   wg-crm/src/services/
```

**Verificar:**
```bash
cat wg-crm/src/services/kanbanServices.js
```

### Passo 1.2: Criar `AddColumnCard.jsx`

```bash
# Copiar componente
cp "Atualizacao externa/horizons-export/src/components/oportunidades/AddColumnCard.jsx" \
   wg-crm/src/components/oportunidades/
```

**Verificar imports:**
```bash
head -10 wg-crm/src/components/oportunidades/AddColumnCard.jsx
```

Deve ter:
```jsx
import { createColumn } from '@/services/kanbanServices';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
```

### Passo 1.3: Criar `ColumnHeader.jsx`

```bash
# Copiar componente
cp "Atualizacao externa/horizons-export/src/components/oportunidades/ColumnHeader.jsx" \
   wg-crm/src/components/oportunidades/
```

### Passo 1.4: Testar Imports

```bash
cd wg-crm
npm run dev
```

**Se houver erros de import:**
- Verificar se `@/services/kanbanServices` resolve
- Verificar se `@/components/ui/use-toast` existe
- Ajustar caminhos se necessário

---

## FASE 2: DIALOGS (1h)

### Passo 2.1: Criar `KanbanCardDialog.jsx`

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar componente
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanCardDialog.jsx" \
   wg-crm/src/components/oportunidades/
```

**Verificar imports necessários:**
```bash
grep "^import" wg-crm/src/components/oportunidades/KanbanCardDialog.jsx
```

Deve ter:
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
```

**Se algum import falhar, instalar:**
```bash
cd wg-crm
npm install date-fns
npx shadcn-ui@latest add avatar
```

### Passo 2.2: Criar `NovaOportunidadeDialog.jsx`

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar componente
cp "Atualizacao externa/horizons-export/src/components/oportunidades/NovaOportunidadeDialog.jsx" \
   wg-crm/src/components/oportunidades/
```

### Passo 2.3: Testar Dialogs Isoladamente

Criar arquivo de teste temporário:

```bash
cat > wg-crm/src/pages/TestDialogs.jsx << 'EOF'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import KanbanCardDialog from '@/components/oportunidades/KanbanCardDialog';
import NovaOportunidadeDialog from '@/components/oportunidades/NovaOportunidadeDialog';

const TestDialogs = () => {
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [novaOppDialogOpen, setNovaOppDialogOpen] = useState(false);

  const mockCard = {
    id: 'test-id',
    titulo: 'Teste Card',
    descricao: 'Descrição de teste',
    cliente_id: 'cliente-1',
    payload: { comments: [], checklist: [] }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Teste de Dialogs</h1>

      <Button onClick={() => setCardDialogOpen(true)}>
        Abrir KanbanCardDialog
      </Button>

      <Button onClick={() => setNovaOppDialogOpen(true)}>
        Abrir NovaOportunidadeDialog
      </Button>

      <KanbanCardDialog
        card={mockCard}
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
        onUpdate={() => console.log('Update triggered')}
      />

      <NovaOportunidadeDialog
        open={novaOppDialogOpen}
        onOpenChange={setNovaOppDialogOpen}
        onSave={() => console.log('Save triggered')}
        boardId="test-board-id"
        columns={[{ id: 'col-1', nome: 'Coluna 1' }]}
      />
    </div>
  );
};

export default TestDialogs;
EOF
```

```bash
# Adicionar rota temporária em App.jsx
# <Route path="/test-dialogs" element={<TestDialogs />} />

cd wg-crm
npm run dev

# Abrir: http://localhost:5173/test-dialogs
# Testar os 2 dialogs
```

**Verificar:**
- [ ] KanbanCardDialog abre sem erros
- [ ] NovaOportunidadeDialog abre sem erros
- [ ] Inputs funcionam
- [ ] Botões funcionam

**Se tudo OK, deletar TestDialogs.jsx**

---

## FASE 3: REFATORAR KANBANBOARD (2h)

### Passo 3.1: Backup do KanbanBoard Atual

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Backup com timestamp
cp src/components/oportunidades/KanbanBoard.jsx \
   src/components/oportunidades/KanbanBoard.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

### Passo 3.2: Copiar Novo KanbanBoard

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar novo KanbanBoard
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanBoard.jsx" \
   wg-crm/src/components/oportunidades/
```

### Passo 3.3: Ajustar Imports

Verificar se os imports estão corretos:

```bash
head -20 wg-crm/src/components/oportunidades/KanbanBoard.jsx
```

Deve ter:
```jsx
import { supabase } from '@/lib/customSupabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import OportunidadeCard from './OportunidadeCard';  // ✅ Verificar se existe!
import NovaOportunidadeDialog from './NovaOportunidadeDialog';
import NovoLeadDialog from '@/components/leads/NovoLeadDialog';  // ⚠️ Pode não existir!
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ColumnHeader } from './ColumnHeader';
import { AddColumnCard } from './AddColumnCard';
import KanbanCardDialog from './KanbanCardDialog';
```

**Se `NovoLeadDialog` não existir:**
- Comentar as linhas que usam `NovoLeadDialog`
- Ou criar componente vazio temporário

**Se `OportunidadeCard` não existir ou for diferente:**
- Verificar props que o KanbanBoard passa
- Ajustar componente OportunidadeCard local

### Passo 3.4: Testar KanbanBoard Isoladamente

```bash
cd wg-crm
npm run dev

# Abrir: http://localhost:5173/oportunidades
# (ou qualquer página que use KanbanBoard)
```

**Verificar:**
- [ ] Botão "Nova Oportunidade" aparece
- [ ] Colunas renderizam
- [ ] Cards aparecem
- [ ] Drag and drop funciona
- [ ] Botão "+ Nova coluna" aparece

**Se houver erros:**
1. Verificar console do navegador
2. Verificar view `v_kanban_cards` no banco
3. Verificar se `modulo` está correto ('oportunidades', 'arquitetura', etc)

---

## FASE 4: REFATORAR PÁGINAS KANBAN (1h)

### Passo 4.1: Refatorar Arquitetura.jsx

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Backup
cp src/components/pages/Arquitetura.jsx \
   src/components/pages/Arquitetura.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar nova versão
cp "Atualizacao externa/horizons-export/src/components/pages/Arquitetura.jsx" \
   wg-crm/src/components/pages/
```

**Verificar código:**
```bash
cat wg-crm/src/components/pages/Arquitetura.jsx
```

Deve ser simples (17 linhas):
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

**Testar:**
```bash
cd wg-crm
npm run dev

# Abrir: http://localhost:5173/arquitetura
```

**Verificar:**
- [ ] Página carrega
- [ ] Botão "Nova Oportunidade" aparece
- [ ] Kanban funciona
- [ ] Drag and drop funciona

### Passo 4.2: Refatorar Engenharia.jsx

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Backup
cp src/components/pages/Engenharia.jsx \
   src/components/pages/Engenharia.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar nova versão
cp "Atualizacao externa/horizons-export/src/components/pages/Engenharia.jsx" \
   wg-crm/src/components/pages/
```

**Ajustar modulo:**
```jsx
<KanbanBoard modulo="engenharia" />
```

**Testar:** http://localhost:5173/engenharia

### Passo 4.3: Refatorar Marcenaria.jsx

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Backup
cp src/components/pages/Marcenaria.jsx \
   src/components/pages/Marcenaria.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar nova versão
cp "Atualizacao externa/horizons-export/src/components/pages/Marcenaria.jsx" \
   wg-crm/src/components/pages/
```

**Ajustar modulo:**
```jsx
<KanbanBoard modulo="marcenaria" />
```

**Testar:** http://localhost:5173/marcenaria

---

## FASE 5: SIDEBAR COM SUBMENUS (1h - OPCIONAL)

⚠️ **ATENÇÃO:** Esta fase é opcional e envolve mudanças na navegação. Pule se preferir manter Sidebar atual.

### Passo 5.1: Backup Sidebar Atual

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Backup
cp src/components/layout/Sidebar.jsx \
   src/components/layout/Sidebar.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

### Passo 5.2: Copiar Novo Sidebar

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Copiar novo Sidebar
cp "Atualizacao externa/horizons-export/src/components/layout/Sidebar.jsx" \
   wg-crm/src/components/layout/
```

### Passo 5.3: Ajustar Props

O novo Sidebar **NÃO** usa props `currentPage`, `setCurrentPage`, `isOpen`, `setIsOpen`.

**ANTES (código local):**
```jsx
<Sidebar
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
/>
```

**DEPOIS (código Horizons):**
```jsx
<Sidebar />
// Gerencia estado internamente!
```

**Ajustar em `CrmLayout.jsx` ou onde Sidebar é usado:**

```bash
# Encontrar onde Sidebar é usado
grep -r "Sidebar" wg-crm/src/components/layout/*.jsx
```

**Remover props desnecessárias:**
```jsx
// ANTES
const [sidebarOpen, setSidebarOpen] = useState(true);
const [currentPage, setCurrentPage] = useState('dashboard');

<Sidebar
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
  isOpen={sidebarOpen}
  setIsOpen={setSidebarOpen}
/>

// DEPOIS
<Sidebar />
// Pronto! Sidebar gerencia tudo internamente com useLocation() e NavLink
```

### Passo 5.4: Testar Navegação

```bash
cd wg-crm
npm run dev
```

**Verificar:**
- [ ] Sidebar abre/fecha
- [ ] Submenu "Comercial" funciona
- [ ] Submenu "Operacional" funciona
- [ ] Navegação entre páginas funciona
- [ ] Ícones aparecem corretamente
- [ ] Tooltip aparece quando sidebar collapsed

---

## FASE 6: TESTES FINAIS (1h)

### Checklist Completo de Testes

#### 6.1 Botão "Nova Oportunidade"

- [ ] Aparece em `/oportunidades`
- [ ] Aparece em `/arquitetura`
- [ ] Aparece em `/engenharia`
- [ ] Aparece em `/marcenaria`
- [ ] Click abre dialog

#### 6.2 Dialog Nova Oportunidade

- [ ] Campos renderizam (Título, Cliente, Valor, Descrição)
- [ ] Checkboxes de módulos funcionam
- [ ] Select de cliente carrega dados
- [ ] Botão "Criar Oportunidade" funciona
- [ ] Salva no banco corretamente
- [ ] Fecha dialog após salvar
- [ ] Kanban atualiza (novo card aparece)

#### 6.3 Dialog Edição de Card

- [ ] Click no card abre dialog
- [ ] Título editável inline
- [ ] Descrição editável
- [ ] Seção "Checklist" aparece
- [ ] Adicionar item checklist funciona
- [ ] Toggle checklist item funciona
- [ ] Deletar item checklist funciona
- [ ] Seção "Comentários" aparece
- [ ] Adicionar comentário funciona
- [ ] Comentários mostram autor e timestamp
- [ ] Botão "Salvar e Fechar" funciona
- [ ] Mudanças salvam no banco (payload JSONB)

#### 6.4 Sistema de Colunas

- [ ] Botão "+ Nova coluna" aparece
- [ ] Click vira input
- [ ] Enter ou Blur cria coluna
- [ ] Nova coluna aparece no board
- [ ] Coluna salva no banco
- [ ] Click no título da coluna ativa edição
- [ ] Editar título funciona
- [ ] Enter ou Blur salva renomeação
- [ ] Título atualiza no banco

#### 6.5 Drag and Drop

- [ ] Arrastar card entre colunas funciona
- [ ] Reordenar na mesma coluna funciona
- [ ] Posição salva no banco
- [ ] Visual feedback durante drag (opacidade, etc)
- [ ] Animações suaves

#### 6.6 Sidebar (se aplicado)

- [ ] Submenu "Comercial" abre/fecha
- [ ] Submenu "Operacional" abre/fecha
- [ ] Navegação funciona
- [ ] Sidebar colapsa/expande
- [ ] Tooltip aparece quando collapsed
- [ ] Animações suaves (Framer Motion)

#### 6.7 Performance

- [ ] Kanban carrega em < 2 segundos
- [ ] Sem lag ao arrastar cards
- [ ] Dialogs abrem instantaneamente
- [ ] Sem erros no console

---

## FASE 7: CLEANUP E DOCUMENTAÇÃO (30 min)

### Passo 7.1: Remover Arquivos de Backup

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Listar backups
find src -name "*.backup-*"

# Se tudo está funcionando OK, deletar backups:
find src -name "*.backup-*" -delete
```

### Passo 7.2: Remover Página de Teste

```bash
rm src/pages/TestDialogs.jsx  # Se criou na Fase 2
```

### Passo 7.3: Git Commit

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

git add .
git status

# Verificar mudanças
git diff --stat

# Commit
git commit -m "feat: Migração completa Horizons - Kanban com dialogs, adicionar colunas, renomeação

✅ Adicionados:
- KanbanCardDialog (edição completa com comentários e checklist)
- NovaOportunidadeDialog (criar oportunidades)
- AddColumnCard (adicionar colunas dinamicamente)
- ColumnHeader (renomear colunas inline)
- kanbanServices.js (serviço para operações de colunas)

✅ Refatorados:
- KanbanBoard (agora com prop 'modulo', toda lógica interna)
- Arquitetura.jsx (simplificado de 192 para 17 linhas)
- Engenharia.jsx (simplificado)
- Marcenaria.jsx (simplificado)
- Sidebar (opcional - com submenus animados)

✅ Funcionalidades:
- Botão 'Nova Oportunidade' em todas páginas Kanban
- Dialog de edição com comentários e checklist
- Sistema de adicionar/renomear colunas
- Drag and drop mantido e otimizado
- Submenus no Sidebar (se aplicado)

🧪 Testes: Todos passaram conforme checklist"

git push origin dev-supabase-local
```

### Passo 7.4: Atualizar Documentação

Criar arquivo `CHANGELOG.md` ou atualizar existente:

```bash
cat >> CHANGELOG.md << 'EOF'

## [Versão] - 2025-11-04

### Adicionado
- Sistema completo de edição de cards no Kanban (comentários, checklist)
- Dialog para criar novas oportunidades
- Funcionalidade de adicionar colunas dinamicamente
- Renomeação inline de colunas
- Botão "Nova Oportunidade" em todas páginas Kanban
- Serviço `kanbanServices.js` para operações de colunas

### Modificado
- KanbanBoard refatorado com prop `modulo` (simplificou código)
- Páginas Arquitetura/Engenharia/Marcenaria simplificadas (17 linhas cada)
- Sidebar com submenus animados (opcional)

### Melhorias
- Performance do Kanban otimizada
- UX melhorada com dialogs completos
- Código mais limpo e manutenível
EOF
```

---

## ROLLBACK (Se algo der errado)

### Opção 1: Rollback Parcial (Arquivo Específico)

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Restaurar arquivo específico do backup
cp src/components/oportunidades/KanbanBoard.jsx.backup-YYYYMMDD-HHMMSS \
   src/components/oportunidades/KanbanBoard.jsx

# Ou do Git
git checkout HEAD -- src/components/oportunidades/KanbanBoard.jsx
```

### Opção 2: Rollback Completo (Git)

```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Ver commits recentes
git log --oneline -10

# Reverter para commit anterior
git reset --hard <commit-hash-antes-da-migracao>

# OU criar branch de backup e resetar
git checkout backup-pre-horizons-migration
git branch -D dev-supabase-local
git checkout -b dev-supabase-local
```

### Opção 3: Rollback Total (Backup Manual)

```bash
cd "/Users/valdair/Documents/Projetos/William WG/wg-crm"

# Restaurar do backup completo
rm -rf src/components/oportunidades
rm -rf src/components/layout
rm -rf src/components/pages

cp -r src-backup-YYYYMMDD/oportunidades src/components/
cp -r src-backup-YYYYMMDD/layout src/components/
cp -r src-backup-YYYYMMDD/pages src/components/
```

---

## TROUBLESHOOTING

### Erro: "Cannot find module '@/services/kanbanServices'"

**Causa:** Alias `@/` não está configurado ou serviço não foi copiado.

**Solução:**
```bash
# Verificar se arquivo existe
ls wg-crm/src/services/kanbanServices.js

# Se não existir, copiar novamente
cp "Atualizacao externa/horizons-export/src/services/kanbanServices.js" \
   wg-crm/src/services/

# Verificar vite.config.js tem alias @ configurado
grep "@" wg-crm/vite.config.js
```

### Erro: "Cannot find module '@/components/ui/use-toast'"

**Causa:** shadcn/ui toast não está instalado.

**Solução:**
```bash
cd wg-crm
npx shadcn-ui@latest add toast
```

### Erro: "v_kanban_cards does not exist"

**Causa:** View não existe no banco local.

**Solução:**
```bash
# Verificar no Supabase
docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\dv"

# Se não existir, criar view
# (consultar migrations do projeto LIVE ou documentação)
```

### Erro: "payload is not valid JSON"

**Causa:** Coluna payload é TEXT, não JSONB.

**Solução:**
```sql
-- Conectar ao banco
docker exec -it supabase_db_WG psql -U postgres -d postgres

-- Converter payload
ALTER TABLE kanban_cards
ALTER COLUMN payload TYPE JSONB USING payload::jsonb;
```

### Erro: Drag and drop não funciona

**Causa:** Ordem dos cards incorreta ou view `v_kanban_cards` não retorna `ordem`.

**Solução:**
```sql
-- Verificar estrutura
SELECT id, titulo, ordem FROM v_kanban_cards LIMIT 5;

-- Se 'ordem' não existe, view precisa ser atualizada
```

### Erro: Sidebar não navega corretamente

**Causa:** Props antigas sendo passadas ou rotas não existem.

**Solução:**
1. Remover props `currentPage`, `setCurrentPage`, etc
2. Verificar se rotas em `navItems` batem com as rotas do react-router
3. Verificar se `NavLink` do react-router-dom está instalado

---

## COMANDOS RÁPIDOS (RESUMO)

### Backup Completo
```bash
cd "/Users/valdair/Documents/Projetos/William WG"
git checkout -b backup-pre-horizons-migration
git checkout dev-supabase-local
mkdir -p wg-crm/src-backup-$(date +%Y%m%d)
cp -r wg-crm/src/components wg-crm/src-backup-$(date +%Y%m%d)/
```

### Copiar Todos Arquivos
```bash
cd "/Users/valdair/Documents/Projetos/William WG"

# Serviço
mkdir -p wg-crm/src/services
cp "Atualizacao externa/horizons-export/src/services/kanbanServices.js" wg-crm/src/services/

# Componentes Oportunidades
cp "Atualizacao externa/horizons-export/src/components/oportunidades/AddColumnCard.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/ColumnHeader.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanCardDialog.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/NovaOportunidadeDialog.jsx" wg-crm/src/components/oportunidades/
cp "Atualizacao externa/horizons-export/src/components/oportunidades/KanbanBoard.jsx" wg-crm/src/components/oportunidades/

# Páginas
cp "Atualizacao externa/horizons-export/src/components/pages/Arquitetura.jsx" wg-crm/src/components/pages/
cp "Atualizacao externa/horizons-export/src/components/pages/Engenharia.jsx" wg-crm/src/components/pages/
cp "Atualizacao externa/horizons-export/src/components/pages/Marcenaria.jsx" wg-crm/src/components/pages/

# Sidebar (opcional)
cp "Atualizacao externa/horizons-export/src/components/layout/Sidebar.jsx" wg-crm/src/components/layout/
```

### Testar
```bash
cd wg-crm
npm run dev
# Abrir: http://localhost:5173/arquitetura
```

---

## PRÓXIMOS PASSOS APÓS MIGRAÇÃO

1. **Testar em produção (LIVE):**
   - Após validar localmente, fazer deploy no LIVE
   - Verificar se view `v_kanban_cards` existe no LIVE
   - Verificar se payload é JSONB no LIVE

2. **Documentar mudanças:**
   - Atualizar README com novas funcionalidades
   - Documentar estrutura de payload JSONB
   - Criar guia para usuários finais

3. **Melhorias futuras:**
   - Adicionar notificações quando alguém comenta
   - Adicionar menções (@usuario) em comentários
   - Adicionar anexos em cards
   - Adicionar filtros/busca no Kanban

---

---

## 📝 MIGRATION EXEMPLO COMPLETA - BACKEND

Criar arquivo: `/Users/valdair/Documents/Projetos/William WG/Supabase/supabase/migrations/050_adicionar_campos_kanban_horizons.sql`

```sql
-- =============================================
-- MIGRATION: 050_adicionar_campos_kanban_horizons
-- Descrição: Ajustar schema para compatibilidade com Horizons
-- Data: 2025-11-04
-- =============================================

-- ========================================
-- 1. AJUSTAR kanban_boards
-- ========================================

-- Adicionar alias 'modulo' para campo 'ambiente'
ALTER TABLE kanban_boards
ADD COLUMN IF NOT EXISTS modulo TEXT
GENERATED ALWAYS AS (ambiente) STORED;

-- ========================================
-- 2. AJUSTAR kanban_colunas
-- ========================================

-- Renomear campos para compatibilidade
ALTER TABLE kanban_colunas
RENAME COLUMN titulo TO nome;

ALTER TABLE kanban_colunas
RENAME COLUMN posicao TO pos;

-- ========================================
-- 3. AJUSTAR kanban_cards
-- ========================================

-- Adicionar campo ordem
ALTER TABLE kanban_cards
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Adicionar soft delete
ALTER TABLE kanban_cards
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Renomear campo dados para payload
ALTER TABLE kanban_cards
RENAME COLUMN dados TO payload;

-- Garantir que payload é JSONB
ALTER TABLE kanban_cards
ALTER COLUMN payload TYPE JSONB USING payload::jsonb;

-- Adicionar default para payload
ALTER TABLE kanban_cards
ALTER COLUMN payload SET DEFAULT '{
  "arquitetura": false,
  "engenharia": false,
  "marcenaria": false,
  "comments": [],
  "checklist": []
}'::jsonb;

-- ========================================
-- 4. CRIAR VIEW v_kanban_cards
-- ========================================

DROP VIEW IF EXISTS v_kanban_cards;

CREATE OR REPLACE VIEW v_kanban_cards AS
SELECT
  k.id,
  k.titulo,
  k.descricao,
  k.valor,
  k.coluna_id,
  kc.nome as coluna_nome,
  kc.cor as coluna_cor,
  kb.id as board_id,
  kb.modulo,
  k.ordem,
  k.deleted_at,
  k.payload,
  k.posicao,
  k.created_at,
  k.updated_at,
  -- Cliente info
  e.id as cliente_id,
  e.nome as cliente,
  e.tipo as cliente_tipo,
  -- Responsável info
  p.id as responsavel_id,
  p.nome as responsavel,
  -- Equipe (array de IDs)
  COALESCE(k.payload->>'equipe', '[]')::jsonb as equipe
FROM kanban_cards k
JOIN kanban_colunas kc ON k.coluna_id = kc.id
JOIN kanban_boards kb ON kc.board_id = kb.id
LEFT JOIN entities e ON k.entity_id = e.id
LEFT JOIN profiles p ON k.responsavel_id = p.id
WHERE k.deleted_at IS NULL
ORDER BY kb.modulo, kc.pos, k.ordem, k.posicao;

COMMENT ON VIEW v_kanban_cards IS 'View completa de cards do kanban compatível com Horizons';

-- ========================================
-- 5. FUNÇÕES AUXILIARES
-- ========================================

-- Função para criar coluna
CREATE OR REPLACE FUNCTION api_criar_coluna(
  p_board_id uuid,
  p_nome text,
  p_cor text DEFAULT '#E5E7EB'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coluna_id uuid;
  v_max_pos integer;
BEGIN
  -- Buscar maior posição
  SELECT COALESCE(MAX(pos), 0) INTO v_max_pos
  FROM kanban_colunas
  WHERE board_id = p_board_id;

  -- Inserir nova coluna
  INSERT INTO kanban_colunas (board_id, nome, cor, pos)
  VALUES (p_board_id, p_nome, p_cor, v_max_pos + 1)
  RETURNING id INTO v_coluna_id;

  -- Retornar coluna criada
  RETURN json_build_object(
    'id', v_coluna_id,
    'nome', p_nome,
    'cor', p_cor,
    'pos', v_max_pos + 1
  );
END;
$$;

-- Função para renomear coluna
CREATE OR REPLACE FUNCTION api_renomear_coluna(
  p_coluna_id uuid,
  p_nome text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result record;
BEGIN
  UPDATE kanban_colunas
  SET nome = p_nome
  WHERE id = p_coluna_id
  RETURNING id, nome, cor, pos INTO v_result;

  RETURN row_to_json(v_result);
END;
$$;

-- Função para atualizar payload do card
CREATE OR REPLACE FUNCTION api_atualizar_payload_card(
  p_card_id uuid,
  p_payload jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE kanban_cards
  SET
    payload = p_payload,
    updated_at = NOW()
  WHERE id = p_card_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Payload atualizado com sucesso'
  );
END;
$$;

-- ========================================
-- 6. DADOS DE TESTE
-- ========================================

-- Inserir boards se não existirem
INSERT INTO kanban_boards (ambiente, titulo, descricao)
VALUES
  ('oportunidades', 'Kanban de Oportunidades', 'Gestão de oportunidades comerciais'),
  ('arquitetura', 'Projetos de Arquitetura', 'Gestão de projetos de arquitetura'),
  ('engenharia', 'Projetos de Engenharia', 'Gestão de projetos de engenharia'),
  ('marcenaria', 'Projetos de Marcenaria', 'Gestão de projetos de marcenaria')
ON CONFLICT (ambiente) DO NOTHING;

-- Para cada board, criar colunas padrão se não existirem
DO $$
DECLARE
  v_board record;
BEGIN
  FOR v_board IN SELECT id, ambiente FROM kanban_boards LOOP
    -- Verificar se já tem colunas
    IF NOT EXISTS (SELECT 1 FROM kanban_colunas WHERE board_id = v_board.id) THEN
      -- Criar colunas padrão
      INSERT INTO kanban_colunas (board_id, nome, cor, pos)
      VALUES
        (v_board.id, 'A Fazer', '#94a3b8', 1),
        (v_board.id, 'Em Progresso', '#60a5fa', 2),
        (v_board.id, 'Em Revisão', '#fbbf24', 3),
        (v_board.id, 'Concluído', '#34d399', 4);

      RAISE NOTICE 'Colunas padrão criadas para board: %', v_board.ambiente;
    END IF;
  END LOOP;
END;
$$;

-- ========================================
-- FIM DA MIGRATION
-- ========================================
```

## Aplicar Migration

```bash
cd /Users/valdair/Documents/Projetos/William\ WG/Supabase

# Aplicar migration
supabase db reset

# Ou se quiser aplicar sem resetar:
docker exec -it supabase_db_WG psql -U postgres -d postgres < supabase/migrations/050_adicionar_campos_kanban_horizons.sql

# Verificar
docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\dv v_kanban_cards"
docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\d kanban_cards"
docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\d kanban_colunas"
```

---

**FIM DO PLANO DE AÇÃO**

**Boa sorte com a migração! 🚀**
