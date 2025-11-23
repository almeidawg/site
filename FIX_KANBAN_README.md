# Correção do Erro da View v_kanban_cards_board

## 🐛 Problema Identificado

O erro ocorria porque a view `v_kanban_cards_board` no Supabase estava tentando acessar uma coluna `b.titulo` que não existe na tabela `kanban_boards`.

**Erro original:**
```
ERROR: 42703: column b.titulo does not exist
LINE 61: coalesce(b.titulo, b.nome, b.name) as board_name,
```

## ✅ Solução Implementada

### 1. Arquivos Corrigidos

- **[supabase/migrations/20251123140000_create_v_kanban_cards_board.sql](supabase/migrations/20251123140000_create_v_kanban_cards_board.sql)**: Migração SQL corrigida com `DROP VIEW IF EXISTS` para forçar recriação
- **[fix_kanban_view.sql](fix_kanban_view.sql)**: Script SQL standalone para aplicar a correção
- **[apply_fix_kanban.mjs](apply_fix_kanban.mjs)**: Script Node.js para tentar aplicar via API

### 2. Mudanças na View

A view agora usa corretamente:
- `coalesce(b.nome, b.name)` para `board_name` (removido `b.titulo`)
- `coalesce(c.nome, c.name)` para `column_title` (removido `c.titulo`)

### 3. Estrutura da View Corrigida

```sql
drop view if exists public.v_kanban_cards_board cascade;

-- Detecção dinâmica se usa coluna_id ou column_id
do $$
declare
  col text;
begin
  select column_name into col
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'kanban_cards'
    and column_name in ('coluna_id', 'column_id')
  order by case when column_name = 'coluna_id' then 1 else 2 end
  limit 1;

  if col is null then
    -- Sem colunas: apenas cards + boards
    create or replace view public.v_kanban_cards_board as
    select
      b.id as board_id,
      coalesce(b.nome, b.name) as board_name,
      null::uuid as column_id,
      null::text as column_title,
      k.id as card_id,
      k.titulo as card_title,
      k.ordem as card_pos,
      k.descricao as card_description,
      k.org_id as card_org_id,
      k.due_date,
      k.status,
      k.payload as metadata,
      k.valor_proposta
    from public.kanban_cards k
    left join public.kanban_boards b on b.id = k.board_id
    where k.deleted_at is null;
  else
    -- Com colunas: cards + boards + colunas
    execute format($f$
      create or replace view public.v_kanban_cards_board as
      select
        b.id as board_id,
        coalesce(b.nome, b.name) as board_name,
        c.id as column_id,
        coalesce(c.nome, c.name) as column_title,
        k.id as card_id,
        k.titulo as card_title,
        k.ordem as card_pos,
        k.descricao as card_description,
        k.org_id as card_org_id,
        k.due_date,
        k.status,
        k.payload as metadata,
        k.valor_proposta
      from public.kanban_cards k
      left join public.kanban_colunas c on c.id = k.%I
      left join public.kanban_boards b on b.id = k.board_id
      where k.deleted_at is null;
    $f$, col);
  end if;
end$$;
```

## 🚀 Como Aplicar a Correção

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. Acesse o [SQL Editor do Supabase](https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr/sql/new)
2. Copie e cole o conteúdo do arquivo `fix_kanban_view.sql`
3. Execute o SQL
4. Aguarde a confirmação de sucesso

### Opção 2: Via Script Node.js (Automático)

```bash
# Certifique-se de ter as variáveis de ambiente configuradas
node apply_fix_kanban.mjs
```

### Opção 3: Via Supabase CLI (se o histórico de migrações for resolvido)

```bash
# Primeiro resolver histórico de migrações
npx supabase migration repair --status applied 20251123140000

# Depois push
npx supabase db push
```

## 📊 Onde a View é Usada

A view `v_kanban_cards_board` é utilizada nos seguintes componentes:

1. **[src/components/pages/Dashboard.jsx](src/components/pages/Dashboard.jsx:43-44)**
   - Busca cards do Kanban para estatísticas do Dashboard
   - Filtra por status (exclui "concluido" e "arquivado")
   - Agrega valores por board (oportunidades, arquitetura, engenharia, marcenaria)

2. **[src/components/dashboard/Dashboard.jsx](src/components/dashboard/Dashboard.jsx:43-44)**
   - Mesmo uso que acima (arquivo duplicado)

## ✨ Próximos Passos

1. ✅ Aplicar a correção SQL no Supabase
2. ✅ Testar o Dashboard para verificar se os dados carregam corretamente
3. ✅ Verificar os logs do browser para confirmar ausência de erros
4. ✅ Validar que as estatísticas estão sendo exibidas

## 🔍 Validação

Após aplicar a correção, teste:

```javascript
// No console do browser ou em um teste
import { supabase } from './config/supabaseClient';

const { data, error } = await supabase
  .from('v_kanban_cards_board')
  .select('*')
  .limit(10);

console.log('✅ Dados:', data);
console.log('❌ Erro:', error);
```

Se `error` for `null` e `data` contiver registros, a correção foi aplicada com sucesso!

## 📝 Notas Técnicas

- **Compatibilidade**: A view usa detecção dinâmica de colunas para suportar tanto `coluna_id` quanto `column_id`
- **Performance**: Usa `LEFT JOIN` para incluir cards sem board ou coluna associada
- **Soft Delete**: Filtra registros com `deleted_at IS NULL`
- **Campos Expostos**: board_name, column_title, card_title, valor_proposta, status, metadata, etc.

---

**Data da Correção**: 2025-11-23
**Versão da Migração**: 20251123140000
**Status**: ✅ Pronto para aplicar
