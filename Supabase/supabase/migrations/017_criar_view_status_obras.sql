-- =============================================
-- Migration 017: View para Status das Obras
-- =============================================
-- Criado em: 03/Nov/2025
-- Descrição: View para agregar status das obras do sistema
-- =============================================

-- Criar view para status das obras
CREATE OR REPLACE VIEW public.v_obras_status AS
SELECT
  status,
  COUNT(*) as total
FROM public.obras
GROUP BY status;

-- Comentário
COMMENT ON VIEW public.v_obras_status IS 'Agregação de obras por status (planejamento, em_execucao, finalizada, atrasada)';

-- Permitir SELECT para usuários autenticados
GRANT SELECT ON public.v_obras_status TO authenticated;
GRANT SELECT ON public.v_obras_status TO anon;

-- =============================================
-- Verificação
-- =============================================
-- SELECT * FROM public.v_obras_status;
