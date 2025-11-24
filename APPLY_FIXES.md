# 🔧 Aplicar Correções de Schema no Supabase LIVE

## 📋 Passo a Passo

### 1. Acesse o SQL Editor
```
https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new
```

### 2. Execute este script SQL completo

Copie e cole TODO o conteúdo abaixo no SQL Editor e clique em **RUN**:

```sql
-- =============================================
-- FIX SCHEMA ERRORS - Supabase LIVE
-- Data: 2025-11-23
-- =============================================

BEGIN;

-- =============================================
-- FIX 1: Criar tabela propostas
-- =============================================

CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES entities(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(12,2),
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'aprovada', 'rejeitada', 'cancelada')),
  validade_dias INTEGER DEFAULT 30,
  observacoes TEXT,
  itens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_propostas_cliente_id ON propostas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_user_id ON propostas(user_id);

ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS propostas_select ON propostas;
CREATE POLICY propostas_select ON propostas FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS propostas_insert ON propostas;
CREATE POLICY propostas_insert ON propostas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS propostas_update ON propostas;
CREATE POLICY propostas_update ON propostas FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- FIX 2: Remover FK duplicada em obras
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'obras_cliente_fk'
    AND table_name = 'obras'
  ) THEN
    ALTER TABLE obras DROP CONSTRAINT obras_cliente_fk;
  END IF;
END $$;

-- =============================================
-- FIX 3: Corrigir FK em joinery_orders
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'joinery_orders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'joinery_orders_client_id_fkey'
    ) THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'joinery_orders' AND column_name = 'client_id'
      ) THEN
        ALTER TABLE joinery_orders
          ADD CONSTRAINT joinery_orders_client_id_fkey
          FOREIGN KEY (client_id) REFERENCES entities(id);
      END IF;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'joinery_orders_project_id_fkey'
    ) THEN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'joinery_orders' AND column_name = 'project_id'
      ) THEN
        ALTER TABLE joinery_orders
          ADD CONSTRAINT joinery_orders_project_id_fkey
          FOREIGN KEY (project_id) REFERENCES obras(id);
      END IF;
    END IF;
  END IF;
END $$;

-- =============================================
-- FIX 4: Adicionar coluna name em storage_items
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'storage_items' AND column_name = 'name'
    ) THEN
      ALTER TABLE storage_items ADD COLUMN name TEXT;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_items' AND column_name = 'filename'
      ) THEN
        UPDATE storage_items SET name = filename WHERE name IS NULL;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_items' AND column_name = 'item_name'
      ) THEN
        UPDATE storage_items SET name = item_name WHERE name IS NULL;
      END IF;
    END IF;
  END IF;
END $$;

COMMIT;
```

### 3. Verificar Sucesso

Após executar, você deve ver uma mensagem de sucesso no SQL Editor.

Se houver algum erro, copie a mensagem e me envie para análise.

### 4. Recarregar a Aplicação

Após aplicar as correções, recarregue sua aplicação React para verificar se os erros foram resolvidos.

---

## ✅ Checklist de Verificação

Após executar o script:

- [ ] Mensagem de sucesso no SQL Editor
- [ ] Tabela `propostas` criada
- [ ] FK duplicada em `obras` removida
- [ ] FKs em `joinery_orders` corrigidas
- [ ] Coluna `name` em `storage_items` adicionada
- [ ] Aplicação React sem erros de schema

---

## 🚨 Em Caso de Erro

Se algo der errado, o script usa `BEGIN` e `COMMIT`, então ou tudo é aplicado ou nada é aplicado (transação atômica).

Todas as verificações usam `IF EXISTS` e `IF NOT EXISTS`, então é seguro executar múltiplas vezes.

---

**Data de criação**: 2025-11-23
**Arquivo original**: FIX_SCHEMA_ERRORS.sql
