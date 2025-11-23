-- =============================================
-- Migration: Funções de Validação e Formatação Brasil
-- Data: 2025-11-03
-- Descrição: Validação de CPF/CNPJ e formatação de telefone/CEP
-- =============================================

-- =============================================
-- 1. HELPER: only_digits
-- Remove todos caracteres não numéricos
-- =============================================

DROP FUNCTION IF EXISTS only_digits(text) CASCADE;

CREATE OR REPLACE FUNCTION only_digits(text)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN regexp_replace($1, '[^0-9]', '', 'g');
END;
$$;

COMMENT ON FUNCTION only_digits IS 'Remove caracteres não numéricos de uma string';

-- =============================================
-- 2. VALIDAÇÃO: is_cpf_valid
-- Valida CPF brasileiro com algoritmo oficial
-- =============================================

DROP FUNCTION IF EXISTS is_cpf_valid(text) CASCADE;

CREATE OR REPLACE FUNCTION is_cpf_valid(doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(doc);
    sum INT;
    rest INT;
    dv1 INT;
    dv2 INT;
    i INT;
BEGIN
    -- CPF deve ter 11 dígitos
    IF length(s) <> 11 THEN RETURN FALSE; END IF;

    -- Rejeita CPFs com todos dígitos iguais (111.111.111-11)
    IF s ~ '^(\d)\1{10}$' THEN RETURN FALSE; END IF;

    -- Calcula primeiro dígito verificador
    sum := 0;
    FOR i IN 1..9 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (11 - i);
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Calcula segundo dígito verificador
    sum := 0;
    FOR i IN 1..10 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (12 - i);
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Verifica se os dígitos calculados correspondem aos informados
    RETURN (dv1 = CAST(substr(s,10,1) AS INT) AND dv2 = CAST(substr(s,11,1) AS INT));
END;
$$;

COMMENT ON FUNCTION is_cpf_valid IS 'Valida CPF brasileiro (11 dígitos)';

-- =============================================
-- 3. VALIDAÇÃO: is_cnpj_valid
-- Valida CNPJ brasileiro com algoritmo oficial
-- =============================================

DROP FUNCTION IF EXISTS is_cnpj_valid(text) CASCADE;

CREATE OR REPLACE FUNCTION is_cnpj_valid(doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(doc);
    weights1 INT[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
    weights2 INT[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
    sum INT;
    rest INT;
    dv1 INT;
    dv2 INT;
    i INT;
BEGIN
    -- CNPJ deve ter 14 dígitos
    IF length(s) <> 14 THEN RETURN FALSE; END IF;

    -- Rejeita CNPJs com todos dígitos iguais
    IF s ~ '^(\d)\1{13}$' THEN RETURN FALSE; END IF;

    -- Calcula primeiro dígito verificador
    sum := 0;
    FOR i IN 1..12 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights1[i];
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Calcula segundo dígito verificador
    sum := 0;
    FOR i IN 1..13 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights2[i];
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    -- Verifica se os dígitos calculados correspondem aos informados
    RETURN (dv1 = CAST(substr(s,13,1) AS INT) AND dv2 = CAST(substr(s,14,1) AS INT));
END;
$$;

COMMENT ON FUNCTION is_cnpj_valid IS 'Valida CNPJ brasileiro (14 dígitos)';

-- =============================================
-- 4. VALIDAÇÃO: is_cpf_cnpj_valid
-- Detecta automaticamente e valida CPF ou CNPJ
-- =============================================

DROP FUNCTION IF EXISTS is_cpf_cnpj_valid(text) CASCADE;

CREATE OR REPLACE FUNCTION is_cpf_cnpj_valid(doc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(doc);
BEGIN
    RETURN CASE
        WHEN length(s) = 11 THEN is_cpf_valid(doc)
        WHEN length(s) = 14 THEN is_cnpj_valid(doc)
        ELSE FALSE
    END;
END;
$$;

COMMENT ON FUNCTION is_cpf_cnpj_valid IS 'Valida CPF ou CNPJ automaticamente baseado no tamanho';

-- =============================================
-- 5. FORMATAÇÃO: format_phone_br
-- Formata telefone brasileiro
-- =============================================

DROP FUNCTION IF EXISTS format_phone_br(text) CASCADE;

CREATE OR REPLACE FUNCTION format_phone_br(digits TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 11 THEN
        -- Celular: (11) 98765-4321
        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,5) || '-' || substr(s,8,4);
    ELSIF length(s) = 10 THEN
        -- Fixo: (11) 3456-7890
        RETURN '(' || substr(s,1,2) || ') ' || substr(s,3,4) || '-' || substr(s,7,4);
    ELSE
        RETURN digits; -- Retorna original se não for formato conhecido
    END IF;
END;
$$;

COMMENT ON FUNCTION format_phone_br IS 'Formata telefone brasileiro: (11) 98765-4321';

-- =============================================
-- 6. FORMATAÇÃO: format_cep_br
-- Formata CEP brasileiro
-- =============================================

DROP FUNCTION IF EXISTS format_cep_br(text) CASCADE;

CREATE OR REPLACE FUNCTION format_cep_br(digits TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 8 THEN
        -- CEP: 12345-678
        RETURN substr(s,1,5) || '-' || substr(s,6,3);
    ELSE
        RETURN digits; -- Retorna original se não for formato conhecido
    END IF;
END;
$$;

COMMENT ON FUNCTION format_cep_br IS 'Formata CEP brasileiro: 12345-678';

-- =============================================
-- 7. FORMATAÇÃO: format_cpf
-- Formata CPF brasileiro
-- =============================================

DROP FUNCTION IF EXISTS format_cpf(text) CASCADE;

CREATE OR REPLACE FUNCTION format_cpf(digits TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 11 THEN
        -- CPF: 123.456.789-00
        RETURN substr(s,1,3) || '.' || substr(s,4,3) || '.' || substr(s,7,3) || '-' || substr(s,10,2);
    ELSE
        RETURN digits;
    END IF;
END;
$$;

COMMENT ON FUNCTION format_cpf IS 'Formata CPF brasileiro: 123.456.789-00';

-- =============================================
-- 8. FORMATAÇÃO: format_cnpj
-- Formata CNPJ brasileiro
-- =============================================

DROP FUNCTION IF EXISTS format_cnpj(text) CASCADE;

CREATE OR REPLACE FUNCTION format_cnpj(digits TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    s TEXT := only_digits(digits);
BEGIN
    IF length(s) = 14 THEN
        -- CNPJ: 12.345.678/0001-90
        RETURN substr(s,1,2) || '.' || substr(s,3,3) || '.' || substr(s,6,3) ||
               '/' || substr(s,9,4) || '-' || substr(s,13,2);
    ELSE
        RETURN digits;
    END IF;
END;
$$;

COMMENT ON FUNCTION format_cnpj IS 'Formata CNPJ brasileiro: 12.345.678/0001-90';

-- =============================================
-- TESTES E EXEMPLOS
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Funções de validação BR criadas:';
    RAISE NOTICE '  - only_digits(text) - Remove não numéricos';
    RAISE NOTICE '  - is_cpf_valid(text) - Valida CPF';
    RAISE NOTICE '  - is_cnpj_valid(text) - Valida CNPJ';
    RAISE NOTICE '  - is_cpf_cnpj_valid(text) - Valida CPF ou CNPJ';
    RAISE NOTICE '  - format_phone_br(text) - Formata telefone';
    RAISE NOTICE '  - format_cep_br(text) - Formata CEP';
    RAISE NOTICE '  - format_cpf(text) - Formata CPF';
    RAISE NOTICE '  - format_cnpj(text) - Formata CNPJ';
    RAISE NOTICE '';
    RAISE NOTICE 'Exemplos de uso:';
    RAISE NOTICE '  SELECT is_cpf_valid(''111.444.777-35''); -- TRUE';
    RAISE NOTICE '  SELECT is_cnpj_valid(''11.222.333/0001-81''); -- TRUE';
    RAISE NOTICE '  SELECT format_phone_br(''11987654321''); -- (11) 98765-4321';
    RAISE NOTICE '  SELECT format_cep_br(''12345678''); -- 12345-678';
END;
$$;