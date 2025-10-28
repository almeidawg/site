# 🧠 Filosofia de Desenvolvimento - Valdair

**Este documento define a abordagem de desenvolvimento que SEMPRE deve ser seguida em todos os projetos.**

---

## 🎯 Princípios Fundamentais

### 1. **SQL First - Backend em SQL** ⭐⭐⭐

**Regra de Ouro:** SQL resolve 90% dos problemas de backend. Use-o!

#### ✅ Preferência SEMPRE:
```sql
-- ✅ PREFERIDO: Função SQL com HTTP
CREATE OR REPLACE FUNCTION api_get_user_data(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Lógica completa em SQL
  SELECT json_build_object(
    'user', u.*,
    'orders', (SELECT json_agg(o.*) FROM orders o WHERE o.user_email = p_email),
    'stats', (SELECT json_build_object(
      'total_orders', COUNT(*),
      'total_spent', SUM(total)
    ) FROM orders WHERE user_email = p_email)
  ) INTO v_result
  FROM users u
  WHERE u.email = p_email;

  RETURN v_result;
END;
$$;

-- Chamar via HTTP direto:
-- POST /rest/v1/rpc/api_get_user_data
-- { "p_email": "user@example.com" }
```

#### ❌ Evitar (só usar SE necessário):
```typescript
// ❌ EVITAR: Edge Function para lógica simples
// Edge Functions custam mais, são mais lentas, mais difíceis de debugar
export default async function handler(req) {
  const { email } = await req.json();

  const user = await supabase.from('users').select('*').eq('email', email);
  const orders = await supabase.from('orders').select('*').eq('user_email', email);
  // ... múltiplas queries, lógica complexa

  return Response.json({ user, orders });
}
```

#### 🎯 Quando Usar Edge Functions (EXCEÇÕES):
1. **Integrações externas** (YouTube API, Google Sheets, Stripe)
2. **Processamento de arquivos** (upload de imagens, conversão)
3. **Webhooks** (receber dados de serviços externos)
4. **Operações assíncronas longas** (> 60 segundos)
5. **Lógica que REALMENTE precisa de JavaScript/TypeScript**

**Exemplo de exceção válida:**
```typescript
// ✅ OK: Edge Function para integração YouTube
export default async function handler(req) {
  const { videoId } = await req.json();

  // Buscar dados da API do YouTube (externa)
  const response = await fetch(`https://youtube.googleapis.com/.../${videoId}`);
  const data = await response.json();

  // Salvar no Supabase
  await supabase.from('videos').insert({
    youtube_id: videoId,
    title: data.title,
    views: data.viewCount
  });

  return Response.json({ success: true });
}
```

---

### 2. **DROP IF EXISTS - Sempre Limpar Antes** 🧹

**Regra:** NUNCA criar função sem dropar versão antiga primeiro.

#### ✅ Template OBRIGATÓRIO:
```sql
-- =============================================
-- Função: nome_descritivo_da_funcao
-- Descrição: O que ela faz
-- Parâmetros: p_param1 (tipo) - descrição
-- Retorno: tipo - descrição
-- Criado: YYYY-MM-DD
-- Modificado: YYYY-MM-DD (se aplicável)
-- =============================================

-- 1. SEMPRE começar com DROP (todas versões antigas)
DROP FUNCTION IF EXISTS nome_funcao();
DROP FUNCTION IF EXISTS nome_funcao(uuid);
DROP FUNCTION IF EXISTS nome_funcao(uuid, text);
DROP FUNCTION IF EXISTS nome_funcao(text); -- nova versão

-- 2. Depois criar versão nova
CREATE OR REPLACE FUNCTION nome_funcao(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- código aqui
END;
$$;

-- 3. Comentário para documentação
COMMENT ON FUNCTION nome_funcao(text) IS
'Descrição detalhada do que a função faz';
```

#### 🚨 Por que é CRÍTICO:
- ✅ Evita funções duplicadas com assinaturas diferentes
- ✅ Garante que versão antiga é removida
- ✅ Facilita refatoração
- ✅ Evita confusão no autocomplete
- ✅ Mantém banco limpo e organizado

---

### 3. **Mínimo de Tabelas - Otimização Sempre** 📊

**Regra:** Criar SOMENTE o necessário. Otimizar é melhor que criar tabela nova.

#### ✅ Abordagem Preferida:
```sql
-- ❌ EVITAR: Criar tabela separada para tudo
CREATE TABLE users (...);
CREATE TABLE user_settings (...);
CREATE TABLE user_preferences (...);
CREATE TABLE user_notifications (...);

-- ✅ PREFERIDO: Consolidar dados relacionados
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,

  -- Settings (JSONB é seu amigo!)
  settings jsonb DEFAULT '{
    "theme": "light",
    "language": "pt-BR",
    "notifications": {
      "email": true,
      "push": false
    }
  }'::jsonb,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para buscar dentro do JSONB (se necessário)
CREATE INDEX idx_users_settings_theme
ON users ((settings->>'theme'));
```

#### 🎯 Quando Criar Tabela Separada:
1. **Relação 1:N verdadeira** (user → orders, user → posts)
2. **Dados que crescem indefinidamente** (logs, eventos, histórico)
3. **Necessidade de queries complexas** nos dados relacionados
4. **Performance** (se JSONB ficar muito pesado)

#### ✅ Use JSONB para:
- Configurações
- Metadados
- Dados semi-estruturados
- Listas pequenas (< 50 itens)
- Dados que raramente são consultados isoladamente

---

### 4. **Organização Mental - Pastas e Snippets** 🗂️

**Regra:** Organizar código localmente ANTES de aplicar no Supabase.

#### 📂 Estrutura de Pastas Obrigatória:
```
/Supabase/
├── backup/                        ← Código salvo localmente
│   ├── SQL_Functions/             ← Funções SQL
│   │   ├── api/                   ← APIs (funções chamadas via HTTP)
│   │   │   ├── api_get_user.sql
│   │   │   ├── api_create_order.sql
│   │   │   └── api_update_profile.sql
│   │   ├── triggers/              ← Triggers automáticos
│   │   │   ├── trg_update_timestamp.sql
│   │   │   └── trg_validate_email.sql
│   │   ├── utilities/             ← Funções auxiliares
│   │   │   ├── fn_calculate_age.sql
│   │   │   └── fn_format_currency.sql
│   │   └── views/                 ← Views materializadas
│   │       ├── vw_user_stats.sql
│   │       └── vw_sales_dashboard.sql
│   └── Edge_Functions/            ← Edge Functions (SOMENTE quando necessário)
│       ├── youtube-integration.ts
│       ├── google-sheets-sync.ts
│       └── stripe-webhook.ts
├── migrations/                    ← Migrations (futuro)
└── snippets/                      ← Snippets reutilizáveis (NOVO!)
    ├── templates/                 ← Templates base
    │   ├── api_function_template.sql
    │   ├── trigger_template.sql
    │   └── view_template.sql
    └── common/                    ← Snippets comuns
        ├── jsonb_aggregation.sql
        ├── date_calculations.sql
        └── text_search.sql
```

#### 🎯 Workflow de Organização:
1. **Pensar** → Qual a melhor abordagem? SQL ou Edge?
2. **Pesquisar** → Já tenho snippet/template similar?
3. **Criar localmente** → Escrever código na pasta correta
4. **Testar mentalmente** → Ler código, imaginar edge cases
5. **Salvar** → Commitar localmente
6. **Aplicar** → Rodar no Supabase (manualmente ou via agente)
7. **Verificar** → Testar no Supabase
8. **Documentar** → Adicionar comentários, atualizar README

---

### 5. **Análise Antes de Ação - Think First, Code Later** 🤔

**Regra:** SEMPRE pensar na melhor abordagem ANTES de implementar.

#### ✅ Checklist Mental Obrigatório:

Antes de criar qualquer função/tabela/feature, perguntar:

**1. Necessidade:**
- [ ] Isso é REALMENTE necessário?
- [ ] Posso resolver com o que já existe?
- [ ] Posso otimizar algo existente ao invés de criar novo?

**2. Abordagem:**
- [ ] SQL resolve? (90% dos casos = SIM)
- [ ] Precisa Edge Function? (raramente)
- [ ] Precisa tabela nova? (ou JSONB resolve?)

**3. Performance:**
- [ ] Vai escalar? (100 registros? 1000? 1 milhão?)
- [ ] Precisa de índice?
- [ ] Query vai ser rápida?

**4. Manutenibilidade:**
- [ ] Vou entender esse código daqui 6 meses?
- [ ] Está bem documentado?
- [ ] Tem nome descritivo?

**5. Organização:**
- [ ] Salvei localmente na pasta certa?
- [ ] Criei snippet se for reutilizável?
- [ ] Dropei versões antigas?

#### Exemplo de Análise:

**Requisito:** "Criar sistema de notificações"

**❌ Abordagem Errada (sem pensar):**
```sql
-- Criar logo tabela de notificações
CREATE TABLE notifications (...);
CREATE TABLE notification_settings (...);
-- Edge Function para enviar
-- Mais 3 tabelas...
```

**✅ Abordagem Certa (pensar primeiro):**

**Análise:**
1. **Quantas notificações por usuário?** → ~10-20 (pequeno!)
2. **SQL resolve?** → SIM! JSONB perfeito
3. **Precisa Edge?** → NÃO! Só precisa flag no user
4. **Tabela nova?** → NÃO! Adicionar campo JSONB em users

**Solução:**
```sql
-- Adicionar campo em tabela existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications jsonb DEFAULT '[]'::jsonb;

-- Função SQL para adicionar notificação
CREATE OR REPLACE FUNCTION add_notification(
  p_user_id uuid,
  p_message text,
  p_type text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET notifications = notifications || jsonb_build_object(
    'id', gen_random_uuid(),
    'message', p_message,
    'type', p_type,
    'read', false,
    'created_at', now()
  )
  WHERE id = p_user_id;
END;
$$;

-- Função para marcar como lida
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_user_id uuid,
  p_notification_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE users
  SET notifications = (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'id' = p_notification_id::text
        THEN jsonb_set(elem, '{read}', 'true'::jsonb)
        ELSE elem
      END
    )
    FROM jsonb_array_elements(notifications) elem
  )
  WHERE id = p_user_id;
END;
$$;
```

**Resultado:**
- ✅ 0 tabelas novas
- ✅ 2 funções SQL simples
- ✅ 0 Edge Functions
- ✅ Fácil manutenção
- ✅ Performance excelente
- ✅ Código limpo e organizado

---

## 🛠️ Templates e Snippets

### Template: Função API (HTTP)
```sql
-- =============================================
-- API: api_nome_da_operacao
-- Descrição: Breve descrição do que faz
-- Parâmetros:
--   p_param1 (tipo) - descrição
-- Retorno: json
-- HTTP: POST /rest/v1/rpc/api_nome_da_operacao
-- Criado: YYYY-MM-DD
-- =============================================

-- Limpar versões antigas
DROP FUNCTION IF EXISTS api_nome_da_operacao();
DROP FUNCTION IF EXISTS api_nome_da_operacao(uuid);
DROP FUNCTION IF EXISTS api_nome_da_operacao(text);

-- Criar função nova
CREATE OR REPLACE FUNCTION api_nome_da_operacao(
  p_param1 text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  -- 1. Validação de entrada
  IF p_param1 IS NULL OR p_param1 = '' THEN
    RAISE EXCEPTION 'Parâmetro obrigatório não fornecido';
  END IF;

  -- 2. Lógica principal
  SELECT json_build_object(
    'success', true,
    'data', row_to_json(t.*)
  ) INTO v_result
  FROM tabela t
  WHERE t.campo = p_param1;

  -- 3. Retornar resultado
  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro
    RAISE LOG 'Erro em api_nome_da_operacao: %', SQLERRM;
    -- Retornar erro formatado
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Documentação
COMMENT ON FUNCTION api_nome_da_operacao(text) IS
'Descrição detalhada da função e seu propósito';
```

### Template: Trigger
```sql
-- =============================================
-- Trigger: trg_nome_do_trigger
-- Descrição: O que ele faz
-- Tabela: nome_tabela
-- Quando: BEFORE/AFTER INSERT/UPDATE/DELETE
-- Criado: YYYY-MM-DD
-- =============================================

-- Limpar versões antigas
DROP TRIGGER IF EXISTS trg_nome_do_trigger ON nome_tabela;
DROP FUNCTION IF EXISTS fn_trg_nome_do_trigger();

-- Criar função do trigger
CREATE OR REPLACE FUNCTION fn_trg_nome_do_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Lógica aqui
  -- NEW = registro novo
  -- OLD = registro antigo

  NEW.updated_at = now();

  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trg_nome_do_trigger
  BEFORE UPDATE ON nome_tabela
  FOR EACH ROW
  EXECUTE FUNCTION fn_trg_nome_do_trigger();
```

---

## 🚨 Anti-Padrões (O Que NÃO Fazer)

### ❌ Anti-Padrão 1: Edge Function para Tudo
```typescript
// ❌ ERRADO
// Edge Function só pra buscar dados simples
export default async function getUser(req) {
  const { email } = await req.json();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);
  return Response.json(data);
}
```

**✅ Solução:**
```sql
-- Função SQL direto
CREATE FUNCTION api_get_user(p_email text)
RETURNS json AS $$
  SELECT row_to_json(u.*) FROM users u WHERE email = p_email;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

### ❌ Anti-Padrão 2: Tabelas Demais
```sql
-- ❌ ERRADO
CREATE TABLE users (...);
CREATE TABLE user_settings (...);  -- Podia ser JSONB em users
CREATE TABLE user_prefs (...);     -- Podia ser JSONB em users
CREATE TABLE user_meta (...);      -- Podia ser JSONB em users
```

**✅ Solução:**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text,
  -- Consolidar tudo em JSONB
  data jsonb DEFAULT '{
    "settings": {},
    "preferences": {},
    "metadata": {}
  }'::jsonb
);
```

---

### ❌ Anti-Padrão 3: Funções Duplicadas
```sql
-- ❌ ERRADO (esqueceu de dropar)
CREATE FUNCTION get_user(uuid) ...;  -- versão antiga
CREATE FUNCTION get_user(text) ...;  -- versão nova

-- Agora tem 2 funções com nomes iguais! Confusão garantida
```

**✅ Solução:**
```sql
-- Sempre dropar TODAS versões antigas
DROP FUNCTION IF EXISTS get_user(uuid);
DROP FUNCTION IF EXISTS get_user(text);
DROP FUNCTION IF EXISTS get_user(int);

-- Criar versão única e definitiva
CREATE FUNCTION get_user(p_email text) ...;
```

---

## 📋 Checklist de Code Review (Auto-Revisão)

Antes de aplicar QUALQUER código no Supabase, verificar:

### Geral:
- [ ] Pensei na MELHOR abordagem? (SQL first!)
- [ ] Salvei localmente na pasta correta?
- [ ] Dropei versões antigas?
- [ ] Nome é descritivo?
- [ ] Tem comentários explicativos?

### SQL Functions:
- [ ] Usa `DROP FUNCTION IF EXISTS` antes?
- [ ] Tem `SECURITY DEFINER`?
- [ ] Tem `SET search_path = public`?
- [ ] Validação de parâmetros?
- [ ] Tratamento de exceções?
- [ ] Retorna formato consistente (json)?

### Edge Functions:
- [ ] REALMENTE precisa ser Edge? (não resolve em SQL?)
- [ ] Headers CORS configurados?
- [ ] Validação de auth?
- [ ] Try/catch com logs?
- [ ] Timeout considerado (<60s)?

### Tabelas:
- [ ] REALMENTE precisa tabela nova? (JSONB não resolve?)
- [ ] Mínimo de campos necessários?
- [ ] Índices planejados?
- [ ] RLS configurado?
- [ ] Timestamps (created_at, updated_at)?

---

## 🎯 Resumo - Filosofia em 5 Pontos

1. **SQL First** → 90% backend em SQL, Edge só quando necessário
2. **DROP First** → Sempre limpar antes de criar, zero duplicatas
3. **Minimal Tables** → Menos tabelas, mais JSONB, sempre otimizar
4. **Organize First** → Pastas locais, snippets, controle mental
5. **Think First** → Analisar melhor abordagem ANTES de codificar

---

## 🤖 Para os Agentes Claude Code

**Todos os agentes devem seguir esta filosofia AUTOMATICAMENTE:**

### `@supabase-mcp-expert`:
- ✅ SEMPRE sugerir SQL ao invés de Edge Function
- ✅ SEMPRE incluir DROP antes de CREATE
- ✅ SEMPRE perguntar "Precisa tabela nova ou JSONB resolve?"
- ✅ SEMPRE salvar localmente antes de aplicar
- ✅ SEMPRE validar com checklist acima

### `@app-migration-expert`:
- ✅ Ao analisar snapshot, identificar se cliente usou Edge desnecessariamente
- ✅ Sugerir refatoração para SQL quando aplicável
- ✅ Avisar se encontrar funções duplicadas
- ✅ Recomendar consolidação de tabelas quando possível

### `@doc-research-expert`:
- ✅ Priorizar docs de PostgreSQL/plpgsql sobre Edge Functions
- ✅ Buscar exemplos de SQL avançado (JSONB, CTEs, etc)
- ✅ Sugerir otimizações SQL

---

**Última atualização:** 28 Out 2025
**Autor:** Valdair
**Revisões:** Sempre que filosofia evoluir

---

🧠 **Esta é a FILOSOFIA que guia TODAS as decisões de desenvolvimento no projeto WG!**
