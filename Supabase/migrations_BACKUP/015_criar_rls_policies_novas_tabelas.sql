-- =============================================
-- MIGRATION: 015
-- Descrição: RLS Policies para novas tabelas
-- Data: 2025-11-02
-- Autor: Supabase MCP Expert
-- =============================================
-- Políticas criadas para:
--   - contratos
--   - propostas
--   - obras
--   - lancamentos_financeiros
--   - registros_trabalho
--   - registro_categorias
-- =============================================


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HABILITAR RLS EM TODAS AS TABELAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_categorias ENABLE ROW LEVEL SECURITY;


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: contratos
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Usuários autenticados podem ver contratos
DROP POLICY IF EXISTS "Usuários podem ver contratos" ON contratos;
CREATE POLICY "Usuários podem ver contratos"
ON contratos FOR SELECT
TO authenticated
USING (true);

-- INSERT: Admins e gestores podem criar contratos
DROP POLICY IF EXISTS "Admins e gestores podem criar contratos" ON contratos;
CREATE POLICY "Admins e gestores podem criar contratos"
ON contratos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- UPDATE: Admins, gestores e responsáveis podem atualizar contratos
DROP POLICY IF EXISTS "Admins, gestores e responsáveis podem atualizar contratos" ON contratos;
CREATE POLICY "Admins, gestores e responsáveis podem atualizar contratos"
ON contratos FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
  OR responsavel_id = auth.uid()
);

-- DELETE: Apenas admins podem deletar contratos
DROP POLICY IF EXISTS "Apenas admins podem deletar contratos" ON contratos;
CREATE POLICY "Apenas admins podem deletar contratos"
ON contratos FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: propostas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Usuários autenticados podem ver propostas
DROP POLICY IF EXISTS "Usuários podem ver propostas" ON propostas;
CREATE POLICY "Usuários podem ver propostas"
ON propostas FOR SELECT
TO authenticated
USING (true);

-- INSERT: Admins, gestores e vendedores podem criar propostas
DROP POLICY IF EXISTS "Admins, gestores e vendedores podem criar propostas" ON propostas;
CREATE POLICY "Admins, gestores e vendedores podem criar propostas"
ON propostas FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'vendedor')
  )
);

-- UPDATE: Admins, gestores, vendedores e responsáveis podem atualizar propostas
DROP POLICY IF EXISTS "Admins, gestores, vendedores e responsáveis podem atualizar propostas" ON propostas;
CREATE POLICY "Admins, gestores, vendedores e responsáveis podem atualizar propostas"
ON propostas FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'vendedor')
  )
  OR responsavel_id = auth.uid()
);

-- DELETE: Apenas admins podem deletar propostas
DROP POLICY IF EXISTS "Apenas admins podem deletar propostas" ON propostas;
CREATE POLICY "Apenas admins podem deletar propostas"
ON propostas FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: obras
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Usuários autenticados podem ver obras
DROP POLICY IF EXISTS "Usuários podem ver obras" ON obras;
CREATE POLICY "Usuários podem ver obras"
ON obras FOR SELECT
TO authenticated
USING (true);

-- INSERT: Admins, gestores e arquitetos podem criar obras
DROP POLICY IF EXISTS "Admins, gestores e arquitetos podem criar obras" ON obras;
CREATE POLICY "Admins, gestores e arquitetos podem criar obras"
ON obras FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'arquiteto')
  )
);

-- UPDATE: Admins, gestores, arquitetos e responsáveis podem atualizar obras
DROP POLICY IF EXISTS "Admins, gestores, arquitetos e responsáveis podem atualizar obras" ON obras;
CREATE POLICY "Admins, gestores, arquitetos e responsáveis podem atualizar obras"
ON obras FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'arquiteto')
  )
  OR responsavel_id = auth.uid()
);

-- DELETE: Apenas admins podem deletar obras
DROP POLICY IF EXISTS "Apenas admins podem deletar obras" ON obras;
CREATE POLICY "Apenas admins podem deletar obras"
ON obras FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: lancamentos_financeiros
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Usuários autenticados podem ver lançamentos
DROP POLICY IF EXISTS "Usuários podem ver lançamentos financeiros" ON lancamentos_financeiros;
CREATE POLICY "Usuários podem ver lançamentos financeiros"
ON lancamentos_financeiros FOR SELECT
TO authenticated
USING (true);

-- INSERT: Admins, gestores e financeiro podem criar lançamentos
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem criar lançamentos" ON lancamentos_financeiros;
CREATE POLICY "Admins, gestores e financeiro podem criar lançamentos"
ON lancamentos_financeiros FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'financeiro')
  )
);

-- UPDATE: Admins, gestores e financeiro podem atualizar lançamentos
DROP POLICY IF EXISTS "Admins, gestores e financeiro podem atualizar lançamentos" ON lancamentos_financeiros;
CREATE POLICY "Admins, gestores e financeiro podem atualizar lançamentos"
ON lancamentos_financeiros FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor', 'financeiro')
  )
);

-- DELETE: Apenas admins podem deletar lançamentos
DROP POLICY IF EXISTS "Apenas admins podem deletar lançamentos financeiros" ON lancamentos_financeiros;
CREATE POLICY "Apenas admins podem deletar lançamentos financeiros"
ON lancamentos_financeiros FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: registros_trabalho
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Usuários podem ver seus próprios registros ou todos se admin/gestor
DROP POLICY IF EXISTS "Usuários podem ver seus registros de trabalho" ON registros_trabalho;
CREATE POLICY "Usuários podem ver seus registros de trabalho"
ON registros_trabalho FOR SELECT
TO authenticated
USING (
  profissional_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- INSERT: Usuários podem criar seus próprios registros
DROP POLICY IF EXISTS "Usuários podem criar seus registros de trabalho" ON registros_trabalho;
CREATE POLICY "Usuários podem criar seus registros de trabalho"
ON registros_trabalho FOR INSERT
TO authenticated
WITH CHECK (profissional_id = auth.uid());

-- UPDATE: Usuários podem atualizar seus próprios registros não aprovados
DROP POLICY IF EXISTS "Usuários podem atualizar seus registros de trabalho" ON registros_trabalho;
CREATE POLICY "Usuários podem atualizar seus registros de trabalho"
ON registros_trabalho FOR UPDATE
TO authenticated
USING (
  (profissional_id = auth.uid() AND aprovado = false)
  OR EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- DELETE: Apenas usuários podem deletar seus próprios registros não aprovados ou admins
DROP POLICY IF EXISTS "Usuários podem deletar seus registros não aprovados" ON registros_trabalho;
CREATE POLICY "Usuários podem deletar seus registros não aprovados"
ON registros_trabalho FOR DELETE
TO authenticated
USING (
  (profissional_id = auth.uid() AND aprovado = false)
  OR EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES: registro_categorias
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- SELECT: Todos usuários autenticados podem ver categorias
DROP POLICY IF EXISTS "Usuários podem ver categorias de registro" ON registro_categorias;
CREATE POLICY "Usuários podem ver categorias de registro"
ON registro_categorias FOR SELECT
TO authenticated
USING (true);

-- INSERT: Apenas admins e gestores podem criar categorias
DROP POLICY IF EXISTS "Admins e gestores podem criar categorias" ON registro_categorias;
CREATE POLICY "Admins e gestores podem criar categorias"
ON registro_categorias FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- UPDATE: Apenas admins e gestores podem atualizar categorias
DROP POLICY IF EXISTS "Admins e gestores podem atualizar categorias" ON registro_categorias;
CREATE POLICY "Admins e gestores podem atualizar categorias"
ON registro_categorias FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil IN ('admin', 'gestor')
  )
);

-- DELETE: Apenas admins podem deletar categorias
DROP POLICY IF EXISTS "Apenas admins podem deletar categorias" ON registro_categorias;
CREATE POLICY "Apenas admins podem deletar categorias"
ON registro_categorias FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_perfis
    WHERE user_id = auth.uid()
    AND perfil = 'admin'
  )
);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIM DA MIGRATION 015
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
