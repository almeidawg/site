-- Adiciona coluna para armazenar listas de compras importadas nas assistências
ALTER TABLE IF EXISTS public.assistencias
  ADD COLUMN IF NOT EXISTS pecas_lista JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.assistencias.pecas_lista IS
  'Itens importados de pedidos de compra vinculados ao cliente para manutenção.';
