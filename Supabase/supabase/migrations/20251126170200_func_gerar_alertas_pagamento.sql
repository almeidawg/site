-- =============================================
-- Função: Gerar alertas de pagamento
-- Data: 2025-11-26
-- Descrição: Gera alertas automáticos de vencimento (5 dias antes, 1 dia antes, vencido)
--            Deve ser executada diariamente via cron job
-- =============================================

BEGIN;

DROP FUNCTION IF EXISTS api_gerar_alertas_pagamento();

CREATE OR REPLACE FUNCTION api_gerar_alertas_pagamento()
RETURNS TABLE(alertas_criados INTEGER, cobr ancas_analisadas INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cobranca RECORD;
  v_alertas_criados INTEGER := 0;
  v_cobrancas_analisadas INTEGER := 0;
  v_data_5_dias DATE;
  v_data_1_dia DATE;
BEGIN
  RAISE NOTICE 'api_gerar_alertas_pagamento - Iniciando geração de alertas em %', CURRENT_DATE;

  -- Para cada cobrança pendente ou em aberto
  FOR v_cobranca IN
    SELECT * FROM cobrancas
    WHERE status IN ('Pendente', 'EmAberto')
    AND vencimento >= CURRENT_DATE - INTERVAL '10 days' -- Inclui vencidos até 10 dias atrás
    ORDER BY vencimento ASC
  LOOP
    v_cobrancas_analisadas := v_cobrancas_analisadas + 1;
    v_data_5_dias := v_cobranca.vencimento - INTERVAL '5 days';
    v_data_1_dia := v_cobranca.vencimento - INTERVAL '1 day';

    -- Alerta de 5 dias antes
    IF CURRENT_DATE >= v_data_5_dias AND CURRENT_DATE < v_cobranca.vencimento THEN
      BEGIN
        INSERT INTO alertas_pagamento (
          cobranca_id,
          tipo_alerta,
          data_alerta,
          data_vencimento,
          metodo_envio
        ) VALUES (
          v_cobranca.id,
          '5_dias_antes',
          CURRENT_DATE,
          v_cobranca.vencimento,
          ARRAY['popup', 'email']
        )
        ON CONFLICT (cobranca_id, tipo_alerta, data_alerta) DO NOTHING;

        IF FOUND THEN
          v_alertas_criados := v_alertas_criados + 1;
          RAISE NOTICE 'Alerta 5 dias antes criado para cobrança %', v_cobranca.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar alerta 5 dias antes para cobrança %: %', v_cobranca.id, SQLERRM;
      END;
    END IF;

    -- Alerta de 1 dia antes
    IF CURRENT_DATE >= v_data_1_dia AND CURRENT_DATE < v_cobranca.vencimento THEN
      BEGIN
        INSERT INTO alertas_pagamento (
          cobranca_id,
          tipo_alerta,
          data_alerta,
          data_vencimento,
          metodo_envio
        ) VALUES (
          v_cobranca.id,
          '1_dia_antes',
          CURRENT_DATE,
          v_cobranca.vencimento,
          ARRAY['popup', 'email']
        )
        ON CONFLICT (cobranca_id, tipo_alerta, data_alerta) DO NOTHING;

        IF FOUND THEN
          v_alertas_criados := v_alertas_criados + 1;
          RAISE NOTICE 'Alerta 1 dia antes criado para cobrança %', v_cobranca.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar alerta 1 dia antes para cobrança %: %', v_cobranca.id, SQLERRM;
      END;
    END IF;

    -- Alerta de vencido
    IF CURRENT_DATE > v_cobranca.vencimento THEN
      BEGIN
        INSERT INTO alertas_pagamento (
          cobranca_id,
          tipo_alerta,
          data_alerta,
          data_vencimento,
          metodo_envio
        ) VALUES (
          v_cobranca.id,
          'vencido',
          CURRENT_DATE,
          v_cobranca.vencimento,
          ARRAY['popup', 'email']
        )
        ON CONFLICT (cobranca_id, tipo_alerta, data_alerta) DO NOTHING;

        IF FOUND THEN
          v_alertas_criados := v_alertas_criados + 1;
          RAISE NOTICE 'Alerta vencido criado para cobrança %', v_cobranca.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar alerta vencido para cobrança %: %', v_cobranca.id, SQLERRM;
      END;
    END IF;
  END LOOP;

  RAISE NOTICE 'Geração de alertas concluída. Alertas criados: %, Cobranças analisadas: %',
    v_alertas_criados, v_cobrancas_analisadas;

  RETURN QUERY SELECT v_alertas_criados, v_cobrancas_analisadas;
END;
$$;

COMMENT ON FUNCTION api_gerar_alertas_pagamento IS 'Gera alertas de vencimento (5 dias antes, 1 dia antes, vencido) - Executar diariamente via cron';

COMMIT;

-- =============================================
-- FIM DA MIGRATION
-- =============================================
-- ✅ Função api_gerar_alertas_pagamento criada
-- ✅ Gera alertas automáticos baseados em datas
-- ✅ Evita duplicação com constraint única
