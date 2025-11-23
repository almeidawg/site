-- =============================================
-- VALIDAÇÃO: CPF/CNPJ (Brasil)
-- Status: OPCIONAL - Criar quando necessário
-- Uso: Validar CPF/CNPJ no backend
-- =============================================

-- Helper: Apenas dígitos
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

-- Validar CPF
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
    IF length(s) <> 11 THEN RETURN FALSE; END IF;
    IF s ~ '^(\d)\1{10}$' THEN RETURN FALSE; END IF;

    sum := 0;
    FOR i IN 1..9 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (11 - i);
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    sum := 0;
    FOR i IN 1..10 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * (12 - i);
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    RETURN (dv1 = CAST(substr(s,10,1) AS INT) AND dv2 = CAST(substr(s,11,1) AS INT));
END;
$$;

-- Validar CNPJ
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
    IF length(s) <> 14 THEN RETURN FALSE; END IF;
    IF s ~ '^(\d)\1{13}$' THEN RETURN FALSE; END IF;

    sum := 0;
    FOR i IN 1..12 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights1[i];
    END LOOP;
    rest := sum % 11;
    dv1 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    sum := 0;
    FOR i IN 1..13 LOOP
        sum := sum + CAST(substr(s,i,1) AS INT) * weights2[i];
    END LOOP;
    rest := sum % 11;
    dv2 := CASE WHEN rest < 2 THEN 0 ELSE 11 - rest END;

    RETURN (dv1 = CAST(substr(s,13,1) AS INT) AND dv2 = CAST(substr(s,14,1) AS INT));
END;
$$;

-- Validar CPF ou CNPJ
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

COMMENT ON FUNCTION is_cpf_valid IS 'Valida CPF brasileiro (11 dígitos)';
COMMENT ON FUNCTION is_cnpj_valid IS 'Valida CNPJ brasileiro (14 dígitos)';
COMMENT ON FUNCTION is_cpf_cnpj_valid IS 'Valida CPF ou CNPJ automaticamente';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================
-- SELECT is_cpf_valid('123.456.789-00');  -- FALSE
-- SELECT is_cpf_valid('111.444.777-35');  -- TRUE
-- SELECT is_cnpj_valid('11.222.333/0001-81');  -- TRUE
-- =============================================
