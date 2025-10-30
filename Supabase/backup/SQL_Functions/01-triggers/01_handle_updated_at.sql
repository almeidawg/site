-- =============================================
-- TRIGGER FUNCTION: handle_updated_at
-- Descrição: Atualiza automaticamente o campo updated_at
-- Uso: Em qualquer tabela com campo updated_at
-- =============================================

DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION handle_updated_at IS 'Atualiza automaticamente o campo updated_at antes de UPDATE';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================
-- CREATE TRIGGER set_updated_at
--     BEFORE UPDATE ON tabela_exemplo
--     FOR EACH ROW
--     EXECUTE FUNCTION handle_updated_at();
-- =============================================
