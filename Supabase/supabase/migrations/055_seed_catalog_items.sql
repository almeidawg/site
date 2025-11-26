-- =============================================
-- MIGRATION: 055
-- Descrição: Seed inicial do catálogo de itens (Price List)
-- Data: 2025-11-27
-- =============================================

INSERT INTO public.catalog_items (code, name, category, type, unit, productivity, setup_days, value, trade)
VALUES
  ('CAT-ARQ-01', 'Projeto Arquitetônico Completo', 'Arquitetura', 'Serviço', 'm2', 12, 0.5, 150.00, 'Arquiteto'),
  ('CAT-ENG-01', 'Execução de Engenharia Estrutural', 'Engenharia', 'Serviço', 'm2', 18, 0.5, 220.00, 'Engenheiro'),
  ('CAT-MAR-01', 'Fabricação de Mobiliário Sob Medida', 'Marcenaria', 'Produto', 'un', 3, 1, 890.00, 'Marceneiro'),
  ('CAT-ELT-01', 'Instalação Elétrica Condominial', 'Elétrica', 'Serviço', 'ponto', 25, 0.2, 65.00, 'Eletricista'),
  ('CAT-PIS-01', 'Piso Porcelanato 90x90', 'Pisos', 'Produto', 'm2', 20, 0.1, 120.00, 'Pisos');

-- evitar duplicatas em deployments subsequentes
ON CONFLICT (code) DO NOTHING;
