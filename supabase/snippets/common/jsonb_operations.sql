-- =============================================
-- SNIPPETS COMUNS - Operações JSONB
-- =============================================
-- Coleção de snippets reutilizáveis para trabalhar com JSONB
-- Use JSONB para consolidar dados ao invés de criar tabelas!
-- =============================================

-- ==========================================
-- 1. ADICIONAR ITEM A ARRAY JSONB
-- ==========================================
/*
Exemplo: Adicionar notificação a array de notificações do usuário
*/
UPDATE users
SET notifications = notifications || jsonb_build_object(
  'id', gen_random_uuid(),
  'message', 'Nova notificação',
  'type', 'info',
  'read', false,
  'created_at', now()
)
WHERE id = user_id;

-- ==========================================
-- 2. ATUALIZAR ITEM ESPECÍFICO EM ARRAY JSONB
-- ==========================================
/*
Exemplo: Marcar notificação específica como lida
*/
UPDATE users
SET notifications = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'id' = notification_id::text
      THEN jsonb_set(elem, '{read}', 'true'::jsonb)
      ELSE elem
    END
  )
  FROM jsonb_array_elements(notifications) elem
)
WHERE id = user_id;

-- ==========================================
-- 3. REMOVER ITEM DE ARRAY JSONB
-- ==========================================
/*
Exemplo: Deletar notificação específica
*/
UPDATE users
SET notifications = (
  SELECT jsonb_agg(elem)
  FROM jsonb_array_elements(notifications) elem
  WHERE elem->>'id' != notification_id::text
)
WHERE id = user_id;

-- ==========================================
-- 4. BUSCAR EM JSONB
-- ==========================================
/*
Exemplo: Buscar usuários com configuração específica
*/
SELECT *
FROM users
WHERE settings->>'theme' = 'dark';

-- Buscar em nested JSONB
SELECT *
FROM users
WHERE settings->'notifications'->>'email' = 'true';

-- ==========================================
-- 5. AGREGAR DADOS EM JSONB
-- ==========================================
/*
Exemplo: Retornar dados agregados em formato JSON
*/
SELECT json_build_object(
  'user', row_to_json(u.*),
  'orders', (
    SELECT json_agg(row_to_json(o.*))
    FROM orders o
    WHERE o.user_id = u.id
  ),
  'stats', json_build_object(
    'total_orders', (SELECT COUNT(*) FROM orders WHERE user_id = u.id),
    'total_spent', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id)
  )
)
FROM users u
WHERE u.id = target_user_id;

-- ==========================================
-- 6. ÍNDICE EM JSONB (para performance)
-- ==========================================
/*
Exemplo: Criar índice para buscar em campo JSONB
*/
CREATE INDEX idx_users_settings_theme
ON users ((settings->>'theme'));

-- Índice GIN para busca full-text em JSONB
CREATE INDEX idx_users_settings_gin
ON users USING gin (settings);

-- ==========================================
-- 7. VALIDAR JSONB COM CHECK CONSTRAINT
-- ==========================================
/*
Exemplo: Garantir que campo JSONB tenha estrutura esperada
*/
ALTER TABLE users
ADD CONSTRAINT check_settings_structure
CHECK (
  settings ? 'theme' AND
  settings ? 'language' AND
  (settings->>'theme') IN ('light', 'dark')
);

-- ==========================================
-- 8. MERGE DE JSONB OBJECTS
-- ==========================================
/*
Exemplo: Fazer merge de configurações (novos valores sobrescrevem antigos)
*/
UPDATE users
SET settings = settings || jsonb_build_object(
  'theme', 'dark',
  'language', 'en-US'
)
WHERE id = user_id;

-- ==========================================
-- 9. TRANSFORMAR TABELA EM JSONB
-- ==========================================
/*
Exemplo: Consolidar tabela relacionada em JSONB
*/
-- Antes: tabela user_settings separada
-- Depois: campo settings JSONB em users

-- Migração:
UPDATE users u
SET settings = (
  SELECT jsonb_object_agg(key, value)
  FROM user_settings us
  WHERE us.user_id = u.id
);

-- Depois deletar tabela antiga
DROP TABLE user_settings;

-- ==========================================
-- 10. FILTRAR ARRAY JSONB
-- ==========================================
/*
Exemplo: Retornar apenas notificações não lidas
*/
SELECT
  id,
  email,
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(notifications) elem
    WHERE (elem->>'read')::boolean = false
  ) as unread_notifications
FROM users
WHERE id = user_id;
