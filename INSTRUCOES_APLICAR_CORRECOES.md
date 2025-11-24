# Instruções para Aplicar Correções no Supabase

## Contexto
Este documento contém as instruções para corrigir os problemas identificados no banco de dados Supabase.

## Problemas Identificados e Soluções

### 1. Tabelas Faltantes
- ❌ `usuarios_perfis` - não existe
- ❌ `user_profiles` - não existe
- ❌ `propostas` - não existe (existe `proposals`)

### 2. Views Faltantes
- ❌ `v_kanban_cards_board` - não existe
- ❌ `v_clientes_ativos_contratos` - não existe

### 3. Coluna Faltante
- ❌ `storage_items.name` - não existe

## Como Aplicar as Correções

### Opção 1: Executar via Supabase Dashboard (RECOMENDADO)

1. Acesse: https://supabase.com/dashboard/project/ahlqzzkxuutwoepirpzr
2. Vá para: **SQL Editor**
3. Execute os arquivos SQL NA ORDEM:

```
01_criar_tabelas_usuarios.sql    → Cria usuarios_perfis e user_profiles
02_ajustar_storage_items.sql     → Adiciona coluna name em storage_items
03_criar_tabela_propostas.sql    → Cria tabela propostas
04_criar_tabelas_kanban.sql      → Garante kanban_cards e kanban_colunas
05_criar_view_kanban.sql         → Cria v_kanban_cards_board
06_criar_view_clientes.sql       → Cria v_clientes_ativos_contratos
07_verificar_estrutura.sql       → Verifica se tudo foi criado
```

**IMPORTANTE**: Execute arquivo por arquivo, copiando o conteúdo e colando no SQL Editor.

### Opção 2: Executar arquivo completo

Se preferir executar tudo de uma vez:
- Use o arquivo: `fix_supabase_schema.sql`
- Este arquivo contém TODAS as correções em um único script

## Ordem de Execução (IMPORTANTE!)

Execute na ordem abaixo para evitar erros de dependência:

1. **01_criar_tabelas_usuarios.sql**
   - Cria função `update_updated_at_column()` (usada por outros)
   - Cria `usuarios_perfis` e `user_profiles`

2. **02_ajustar_storage_items.sql**
   - Adiciona colunas `name` e `description` em `storage_items`

3. **03_criar_tabela_propostas.sql**
   - Cria tabela `propostas`

4. **04_criar_tabelas_kanban.sql**
   - Garante que `kanban_colunas` e `kanban_cards` existem

5. **05_criar_view_kanban.sql**
   - Cria view `v_kanban_cards_board` (depende de kanban_cards/colunas)

6. **06_criar_view_clientes.sql**
   - Cria view `v_clientes_ativos_contratos` (depende de entities/contratos)

7. **07_verificar_estrutura.sql**
   - Query para verificar se tudo foi criado corretamente

## Validação Final

Após executar todos os scripts, execute `07_verificar_estrutura.sql` e você deve ver:

**Tabelas:**
- ✅ kanban_cards
- ✅ kanban_colunas
- ✅ propostas
- ✅ storage_items (com coluna name)
- ✅ user_profiles
- ✅ usuarios_perfis

**Views:**
- ✅ v_clientes_ativos_contratos
- ✅ v_kanban_cards_board

## Estrutura Criada

### usuarios_perfis / user_profiles
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- nome (text)
- sobrenome (text)
- telefone (text)
- cargo (text)
- empresa_id (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### propostas
```sql
- id (uuid, PK)
- titulo (text, NOT NULL)
- descricao (text)
- valor (numeric)
- status (text) → 'rascunho', 'enviada', 'aprovada', 'rejeitada'
- cliente_id (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### kanban_cards
```sql
- id (uuid, PK)
- titulo (text, NOT NULL)
- descricao (text)
- coluna_id (uuid, FK → kanban_colunas)
- ordem (integer)
- prioridade (text) → 'baixa', 'media', 'alta', 'urgente'
- tags (text[])
- created_at (timestamptz)
- updated_at (timestamptz)
```

### kanban_colunas
```sql
- id (uuid, PK)
- titulo (text, NOT NULL)
- ordem (integer)
- cor (text)
- limite_wip (integer)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### storage_items (colunas adicionadas)
```sql
- name (text) → NOVA!
- description (text) → NOVA!
```

### v_kanban_cards_board (view)
```sql
SELECT
  kc.id,
  kc.titulo,
  kc.descricao,
  kc.coluna_id,
  kc.ordem as card_ordem,
  kc.prioridade,
  kc.tags,
  kc.created_at,
  kc.updated_at,
  col.titulo as coluna_titulo,
  col.ordem as coluna_ordem,
  col.cor as coluna_cor,
  col.limite_wip
FROM kanban_cards kc
LEFT JOIN kanban_colunas col ON kc.coluna_id = col.id
```

### v_clientes_ativos_contratos (view)
```sql
SELECT
  e.id as cliente_id,
  e.nome_razao_social,
  e.cnpj_cpf,
  e.tipo,
  e.cidade,
  e.uf,
  COUNT(DISTINCT c.id) as total_contratos,
  SUM(CASE WHEN c.status_geral = 'Em andamento' THEN 1 ELSE 0 END) as contratos_ativos,
  SUM(CASE WHEN c.status_geral = 'Concluído' THEN 1 ELSE 0 END) as contratos_concluidos,
  COALESCE(SUM(co.valor_total), 0) as valor_total_contratos,
  MAX(c.created_at) as ultimo_contrato_em
FROM entities e
LEFT JOIN contratos c ON c.empresa_id = e.id
LEFT JOIN contratos_obras co ON co.projeto_id = c.id
WHERE e.ativo = true
GROUP BY e.id, e.nome_razao_social, e.cnpj_cpf, e.tipo, e.cidade, e.uf
```

## Observações Importantes

1. **Todos os scripts usam `IF NOT EXISTS`**: Seguro executar múltiplas vezes
2. **Triggers automáticos**: Todas tabelas com `updated_at` têm trigger
3. **Índices otimizados**: Criados para melhor performance
4. **Foreign Keys**: Configuradas com `ON DELETE CASCADE` onde apropriado
5. **Constraints**: Status com CHECK para garantir valores válidos

## Troubleshooting

### Erro: "relation already exists"
- **Solução**: Normal se executar script duas vezes. Use `DROP TABLE IF EXISTS` antes se quiser recriar.

### Erro: "function update_updated_at_column does not exist"
- **Solução**: Execute `01_criar_tabelas_usuarios.sql` primeiro (cria a função).

### Erro: "column already exists"
- **Solução**: Normal para storage_items. O script verifica antes de adicionar.

## Credenciais (para referência)

```
URL: https://ahlqzzkxuutwoepirpzr.supabase.co
Project ID: ahlqzzkxuutwoepirpzr
```

## SQL Completo (alternativa)

Se preferir executar tudo de uma vez, use:
```
fix_supabase_schema.sql
```

Este arquivo contém TODAS as correções em ordem correta.

---

**Data de criação**: 2025-11-23
**Versão**: 1.0
**Status**: Pronto para execução
