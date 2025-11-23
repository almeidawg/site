# 📋 Padrões de Código - Projeto WG CRM

**Objetivo**: Manter consistência, qualidade e manutenibilidade do código

---

## 🎯 Princípios Fundamentais

1. **Clareza > Cleverness**: Código claro é melhor que código "esperto"
2. **DRY (Don't Repeat Yourself)**: Evite duplicação, crie abstrações
3. **KISS (Keep It Simple, Stupid)**: Soluções simples primeiro
4. **YAGNI (You Aren't Gonna Need It)**: Não adicione features "por precaução"
5. **Single Responsibility**: Cada função/componente faz UMA coisa bem feita

---

## 💻 TypeScript

### Tipos e Interfaces

```typescript
// ✅ BOM: Tipos explícitos
interface Oportunidade {
  id: string;
  titulo: string;
  valor: number;
  entity_id: string;
  status: 'aberta' | 'em_negociacao' | 'fechada' | 'perdida';
  created_at: string;
}

// ✅ BOM: Usar `unknown` quando tipo é realmente desconhecido
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  // ...
}

// ❌ EVITAR: any (perde type safety)
function processData(data: any) {
  return data.toUpperCase(); // Sem validação!
}

// ✅ BOM: Union types para variações
type Status = 'loading' | 'success' | 'error';

// ✅ BOM: Generics para reutilização
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}
```

### Nomenclatura

```typescript
// ✅ BOM: camelCase para variáveis e funções
const userName = 'João';
function calculateTotal() { }

// ✅ BOM: PascalCase para classes e tipos
class UserService { }
interface UserData { }

// ✅ BOM: UPPER_SNAKE_CASE para constantes
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// ✅ BOM: Prefixo 'is/has' para booleans
const isLoading = false;
const hasError = true;
const canEdit = true;

// ✅ BOM: Verbos para funções
function fetchOportunidades() { }
function createTitulo() { }
function updateKanbanCard() { }
```

### Imports

```typescript
// ✅ BOM: Organizar imports por categoria

// 1. React e libs externas
import { useState, useEffect } from 'react';
import { supabase } from '@supabase/supabase-js';

// 2. Libs de terceiros
import styled from 'styled-components';
import { toast } from 'react-toastify';

// 3. Arquivos locais (componentes, utils, hooks)
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatters';

// 4. Tipos e interfaces
import type { Oportunidade } from '@/types/oportunidade';
```

---

## ⚛️ React

### Componentes Funcionais

```typescript
// ✅ BOM: Componente funcional com tipagem
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <StyledButton
      onClick={onClick}
      variant={variant}
      disabled={disabled}
    >
      {label}
    </StyledButton>
  );
}

// ✅ BOM: Hooks no topo, lógica separada
function OportunidadesPage() {
  // 1. Hooks primeiro
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 2. Efeitos
  useEffect(() => {
    fetchOportunidades();
  }, []);

  // 3. Funções handlers
  const handleCreate = async () => {
    // ...
  };

  const handleDelete = async (id: string) => {
    // ...
  };

  // 4. Render
  if (loading) return <Loading />;

  return (
    <Container>
      {/* JSX */}
    </Container>
  );
}
```

### Custom Hooks

```typescript
// ✅ BOM: Hook reutilizável com tipagem
export function useOportunidades() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('oportunidades')
        .select('*');

      if (error) throw error;
      setOportunidades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { oportunidades, loading, error, refetch: fetch };
}

// Uso:
function MyComponent() {
  const { oportunidades, loading, refetch } = useOportunidades();
  // ...
}
```

### Estrutura de Pastas

```
src/
├── components/           ← Componentes reutilizáveis
│   ├── Button/
│   │   ├── index.tsx
│   │   └── styles.ts
│   └── Card/
│       ├── index.tsx
│       └── styles.ts
├── pages/                ← Páginas/rotas
│   ├── Dashboard/
│   ├── Oportunidades/
│   └── Financeiro/
├── hooks/                ← Custom hooks
│   ├── useAuth.ts
│   └── useOportunidades.ts
├── lib/                  ← Configurações (Supabase, etc)
│   └── customSupabaseClient.js
├── utils/                ← Funções utilitárias
│   ├── formatters.ts
│   └── validators.ts
├── types/                ← TypeScript types/interfaces
│   ├── oportunidade.ts
│   └── kanban.ts
└── styles/               ← Estilos globais
    └── theme.ts
```

---

## 🗄️ Supabase / SQL

### Funções SQL

```sql
-- ✅ BOM: Header documentado
-- =============================================
-- Função: api_criar_oportunidade
-- Descrição: Cria uma nova oportunidade no pipeline
-- Parâmetros:
--   p_titulo: Título da oportunidade
--   p_valor: Valor estimado
--   p_entity_id: ID da entidade (cliente/prospect)
-- Retorno: uuid da oportunidade criada
-- Criado: 2025-11-02
-- =============================================

-- ✅ BOM: SEMPRE DROP antes de CREATE
DROP FUNCTION IF EXISTS api_criar_oportunidade(text, numeric, uuid);

CREATE OR REPLACE FUNCTION api_criar_oportunidade(
  p_titulo text,
  p_valor numeric,
  p_entity_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com permissões do dono
SET search_path = public  -- Evita SQL injection
AS $$
DECLARE
  v_oportunidade_id uuid;
BEGIN
  -- ✅ BOM: Validar inputs
  IF p_titulo IS NULL OR p_titulo = '' THEN
    RAISE EXCEPTION 'Título não pode ser vazio';
  END IF;

  IF p_valor < 0 THEN
    RAISE EXCEPTION 'Valor não pode ser negativo';
  END IF;

  -- ✅ BOM: Lógica principal
  INSERT INTO oportunidades (
    titulo,
    valor,
    entity_id,
    status,
    created_at
  ) VALUES (
    p_titulo,
    p_valor,
    p_entity_id,
    'aberta',
    now()
  )
  RETURNING id INTO v_oportunidade_id;

  -- ✅ BOM: Log de auditoria
  INSERT INTO audit_logs (
    action,
    table_name,
    record_id,
    user_id
  ) VALUES (
    'CREATE',
    'oportunidades',
    v_oportunidade_id,
    auth.uid()
  );

  RETURN v_oportunidade_id;

EXCEPTION
  WHEN OTHERS THEN
    -- ✅ BOM: Log de erros
    RAISE LOG 'Erro em api_criar_oportunidade: %', SQLERRM;
    RAISE;
END;
$$;

-- ✅ BOM: Comentário para documentação
COMMENT ON FUNCTION api_criar_oportunidade IS
  'Cria uma nova oportunidade no pipeline de vendas';
```

### Queries

```typescript
// ✅ BOM: Select específico (não SELECT *)
const { data } = await supabase
  .from('oportunidades')
  .select('id, titulo, valor, status')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

// ✅ BOM: Usar RPC para lógica complexa
const { data } = await supabase
  .rpc('api_criar_oportunidade', {
    p_titulo: 'Nova Oportunidade',
    p_valor: 15000,
    p_entity_id: entityId
  });

// ❌ EVITAR: Lógica complexa no frontend
const allData = await supabase.from('table').select('*');
const filtered = allData.filter(/* lógica complexa */);
const calculated = filtered.map(/* cálculos */);
// ❌ Melhor: fazer isso no backend (SQL function)
```

---

## 🎨 Styled Components

```typescript
// ✅ BOM: Usar props tipadas
interface ButtonStyledProps {
  variant: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const StyledButton = styled.button<ButtonStyledProps>`
  padding: ${props => {
    switch (props.size) {
      case 'sm': return '8px 16px';
      case 'lg': return '16px 32px';
      default: return '12px 24px';
    }
  }};

  background-color: ${props =>
    props.variant === 'primary'
      ? props.theme.colors.primary
      : props.theme.colors.secondary
  };

  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ✅ BOM: Usar tema global
const theme = {
  colors: {
    primary: '#8B5CF6',
    secondary: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};
```

---

## 🧪 Testes

```typescript
// ✅ BOM: Testes descritivos
describe('api_criar_oportunidade', () => {
  it('deve criar oportunidade com dados válidos', async () => {
    const { data, error } = await supabase.rpc('api_criar_oportunidade', {
      p_titulo: 'Teste',
      p_valor: 1000,
      p_entity_id: 'uuid-valido'
    });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });

  it('deve rejeitar título vazio', async () => {
    const { error } = await supabase.rpc('api_criar_oportunidade', {
      p_titulo: '',
      p_valor: 1000,
      p_entity_id: 'uuid-valido'
    });

    expect(error).toBeTruthy();
    expect(error.message).toContain('Título não pode ser vazio');
  });
});
```

---

## 📝 Comentários

```typescript
// ✅ BOM: Comentar o "porquê", não o "o quê"

// Força refresh porque cache do Supabase pode estar desatualizado
// após operação em Edge Function
await refetchOportunidades();

// ❌ RUIM: Comentário óbvio
// Incrementa contador
counter++;

// ✅ BOM: JSDoc para funções públicas
/**
 * Formata valor para moeda brasileira
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}
```

---

## 🚨 Error Handling

```typescript
// ✅ BOM: Try/catch com mensagens claras
async function createOportunidade(data: OportunidadeInput) {
  try {
    const { data: oportunidade, error } = await supabase
      .rpc('api_criar_oportunidade', data);

    if (error) throw error;

    toast.success('Oportunidade criada com sucesso!');
    return oportunidade;

  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    toast.error('Erro ao criar oportunidade. Tente novamente.');
    throw error; // Re-throw para quem chamou tratar se necessário
  }
}

// ✅ BOM: Validação de dados antes de enviar
function validateOportunidadeInput(data: OportunidadeInput): string[] {
  const errors: string[] = [];

  if (!data.titulo?.trim()) {
    errors.push('Título é obrigatório');
  }

  if (data.valor < 0) {
    errors.push('Valor não pode ser negativo');
  }

  if (!data.entity_id) {
    errors.push('Cliente/Prospect é obrigatório');
  }

  return errors;
}
```

---

## ✅ Git Commits

```bash
# ✅ BOM: Conventional Commits
git commit -m "feat: Adiciona página de oportunidades"
git commit -m "fix: Corrige cálculo de total em títulos"
git commit -m "refactor: Reorganiza componentes de kanban"
git commit -m "docs: Atualiza README com instruções de deploy"
git commit -m "chore: Atualiza dependências do projeto"

# Tipos:
# feat: Nova feature
# fix: Correção de bug
# refactor: Refatoração (sem mudança de comportamento)
# docs: Documentação
# chore: Manutenção (deps, config, etc)
# test: Testes
# perf: Melhoria de performance
```

---

## 🎯 Checklist Antes de Commit

- [ ] Código funciona localmente
- [ ] Sem erros no console
- [ ] Sem warnings do TypeScript
- [ ] Seguiu padrões deste documento
- [ ] Nomes descritivos (variáveis, funções, componentes)
- [ ] Sem código comentado (deletar ou documentar porquê)
- [ ] Sem console.log de debug (ou remover antes de commit)
- [ ] Commit message seguindo Conventional Commits

---

**Lembre-se**: Estes padrões existem para facilitar a manutenção. Use bom senso!

**Última atualização**: 02/11/2025
