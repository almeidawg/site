-- =============================================
-- TRIGGER: Atualizar status do título automaticamente
-- Descrição: Quando a soma dos lançamentos atingir o valor total,
--            marca o título como 'Pago' automaticamente
-- Tabela: lancamentos (AFTER INSERT)
-- Criado: 2025-10-30
-- =============================================

-- Função do trigger
DROP FUNCTION IF EXISTS trigger_atualizar_status_titulo() CASCADE;

CREATE OR REPLACE FUNCTION trigger_atualizar_status_titulo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_lancado numeric;
  v_valor_titulo numeric;
BEGIN
  -- Buscar valor total do título
  SELECT valor INTO v_valor_titulo
  FROM titulos_financeiros
  WHERE id = NEW.titulo_id;

  -- Somar todos os lançamentos do título
  SELECT COALESCE(SUM(valor), 0)
  INTO v_total_lancado
  FROM lancamentos
  WHERE titulo_id = NEW.titulo_id;

  -- Se total lançado >= valor do título, marcar como Pago
  IF v_total_lancado >= v_valor_titulo THEN
    UPDATE titulos_financeiros
    SET
      status = 'Pago',
      updated_at = NOW()
    WHERE id = NEW.titulo_id;

    RAISE NOTICE 'Título % marcado como Pago (total lançado: %, valor título: %)',
      NEW.titulo_id, v_total_lancado, v_valor_titulo;
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger
DROP TRIGGER IF EXISTS after_insert_lancamento_atualizar_status ON lancamentos;

CREATE TRIGGER after_insert_lancamento_atualizar_status
  AFTER INSERT ON lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION trigger_atualizar_status_titulo();

COMMENT ON FUNCTION trigger_atualizar_status_titulo() IS
'Atualiza automaticamente o status do título para "Pago" quando a soma dos lançamentos atingir o valor total';


-- ==========================================
-- EXEMPLO DE USO
-- ==========================================
/*
-- Título de R$ 15.000
INSERT INTO titulos_financeiros (empresa_id, tipo, descricao, valor, data_emissao, data_vencimento, status)
VALUES ('empresa-id', 'Receber', 'Projeto Silva', 15000.00, '2025-10-30', '2025-11-30', 'Aprovado');

-- Lançamento 1: R$ 5.000
INSERT INTO lancamentos (titulo_id, valor, data)
VALUES ('titulo-id', 5000.00, '2025-10-30');
-- Status ainda é 'Aprovado'

-- Lançamento 2: R$ 5.000
INSERT INTO lancamentos (titulo_id, valor, data)
VALUES ('titulo-id', 5000.00, '2025-11-15');
-- Status ainda é 'Aprovado'

-- Lançamento 3: R$ 5.000
INSERT INTO lancamentos (titulo_id, valor, data)
VALUES ('titulo-id', 5000.00, '2025-11-30');
-- 🎯 TRIGGER dispara! Status muda para 'Pago'
*/
