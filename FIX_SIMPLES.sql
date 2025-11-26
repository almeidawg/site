-- Adicionar coluna ativo na tabela fin_categories
ALTER TABLE public.fin_categories ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.fin_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.fin_categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.fin_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Verificar
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'fin_categories'
ORDER BY column_name;
