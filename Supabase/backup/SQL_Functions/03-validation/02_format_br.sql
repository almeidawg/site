-- =============================================
-- FORMATAÇÃO: Telefone e CEP (Brasil)
-- Status: OPCIONAL - Criar quando necessário
-- Uso: Formatar dados brasileiros
-- =============================================

-- Formatar telefone brasileiro
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
        RETURN digits;
    END IF;
END;
$$;

-- Formatar CEP brasileiro
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
        RETURN digits;
    END IF;
END;
$$;

COMMENT ON FUNCTION format_phone_br IS 'Formata telefone brasileiro (11) 98765-4321';
COMMENT ON FUNCTION format_cep_br IS 'Formata CEP brasileiro 12345-678';

-- =============================================
-- EXEMPLO DE USO:
-- =============================================
-- SELECT format_phone_br('11987654321');  -- (11) 98765-4321
-- SELECT format_cep_br('12345678');       -- 12345-678
-- =============================================
