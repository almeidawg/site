# 🚀 Migrations 012-015: Sistema Completo WG

**Data de Criação**: 2025-11-02
**Criado por**: Supabase MCP Expert
**Status**: ✅ Pronto para aplicar

---

## 📋 RESUMO EXECUTIVO

Foram criadas **4 migrations completas** que implementam:
- ✅ 6 Tabelas novas (4 base + 2 registros)
- ✅ 7 Views SQL críticas para componentes do cliente
- ✅ 1 Bucket storage para anexos
- ✅ 6 SQL Functions para gestão de usuários
- ✅ RLS Policies completas para segurança

**Total**: ~1200 linhas de SQL organizado e documentado

---

## 📂 MIGRATIONS CRIADAS

### Migration 012: Tabelas e Views
**Arquivo**: `012_criar_tabelas_views_sistema_completo.sql`

#### Parte 1: Tabelas Base Faltantes (4 tabelas)

1. **contratos**
   - Contratos firmados com clientes
   - Campos: numero, cliente_id, proposta_id, titulo, valor_total, status, datas, responsavel_id
   - Relaciona: entities (cliente), propostas, profiles (responsavel)

2. **propostas**
   - Propostas comerciais enviadas
   - Campos: numero, cliente_id, titulo, valor_total, validade, status, itens (JSONB)
   - Relaciona: entities (cliente), profiles (responsavel)

3. **obras**
   - Gestão de obras/projetos em execução
   - Campos: codigo, cliente_id, contrato_id, titulo, endereco completo, status, progresso
   - Relaciona: entities (cliente), contratos, profiles (responsavel)

4. **lancamentos_financeiros**
   - Lançamentos financeiros detalhados (a pagar/receber)
   - Campos: empresa_id, cliente_id, tipo, categoria, valor, datas, status, forma_pagamento
   - Relaciona: empresas, entities, plano_contas, contas_financeiras, centros_custo, titulos, contratos, obras

#### Parte 2: Sistema de Registros de Trabalho (2 tabelas)

5. **registro_categorias**
   - Categorias para classificar registros (Horas, Materiais, Equipamentos, etc)
   - Campos: nome, descricao, cor, ativo
   - Seed: 6 categorias padrão

6. **registros_trabalho**
   - Registros diários de trabalho dos profissionais
   - Campos: profissional_id, cliente_id, data, categoria_id, descricao, quantidade, valor
   - Features: aprovação, geração automática de lançamento financeiro
   - Relaciona: profiles (profissional + aprovador), entities (cliente), obras, propostas, contratos

#### Parte 3: Views SQL Críticas (7 views)

1. **v_clientes_ativos_contratos**
   - Clientes ativos com estatísticas de contratos
   - Retorna: total_contratos, contratos_ativos, valor_total, último contrato

2. **v_fluxo_caixa**
   - Fluxo de caixa diário (entradas vs saídas)
   - Retorna: data, total_receber, total_pagar, saldo_dia, quantidade

3. **v_despesas_mes_categoria**
   - Despesas agrupadas por mês e categoria
   - Retorna: mes, categoria, quantidade, total, media, status

4. **v_top10_clientes_receita**
   - Top 10 clientes por receita realizada
   - Retorna: cliente, receita_realizada, receita_prevista, última receita

5. **vw_pipeline_oportunidades** (ATUALIZADA)
   - Pipeline de oportunidades com estatísticas
   - Retorna: etapa, qtde_cards, valor_total, valor_medio, novos_ultimos_7_dias

6. **v_kanban_cards_board**
   - Cards do kanban com informações completas
   - Retorna: card + board + coluna + responsável + entity

7. **v_registros_trabalho**
   - Registros de trabalho com informações completas
   - Retorna: registro + profissional + cliente + categoria + obra + proposta + contrato + lançamento

---

### Migration 013: Storage Bucket
**Arquivo**: `013_criar_storage_bucket_registros.sql`

#### Bucket 'registros'
- **Propósito**: Armazenar anexos de registros_trabalho
- **Público**: Não (requer autenticação)
- **Limite**: 10MB por arquivo
- **Tipos aceitos**: Imagens (jpeg, png, webp), PDF, Word, Excel

#### RLS Policies (5 policies)
1. Usuários podem fazer upload
2. Usuários veem seus próprios uploads
3. Admins veem todos os arquivos
4. Usuários podem deletar seus uploads
5. Admins podem deletar qualquer arquivo

---

### Migration 014: SQL Functions
**Arquivo**: `014_criar_funcoes_gestao_usuarios.sql`

#### Funções Criadas (6 funções)

1. **users_invite(email, nome, perfil, cargo)**
   - Convida novo usuário criando perfil pré-configurado
   - Retorna: JSON com sucesso/erro + dados do usuário
   - Perfis: admin, gestor, vendedor, arquiteto, financeiro, readonly

2. **users_reset_password(email)**
   - Valida usuário para reset de senha
   - Retorna: JSON com sucesso/erro
   - Nota: Reset real via supabase.auth.resetPasswordForEmail()

3. **users_role_toggle(user_id, novo_perfil)**
   - Altera perfil/role e atualiza permissões automaticamente
   - Retorna: JSON com perfil_antigo, perfil_novo, permissoes

4. **users_list(apenas_ativos)**
   - Lista usuários com perfis e permissões
   - Retorna: TABLE com id, nome, email, cargo, perfil, permissoes, ativo

5. **users_deactivate(user_id)**
   - Desativa usuário (soft delete)
   - Retorna: JSON com sucesso/erro

6. **users_activate(user_id)**
   - Reativa usuário previamente desativado
   - Retorna: JSON com sucesso/erro

---

### Migration 015: RLS Policies
**Arquivo**: `015_criar_rls_policies_novas_tabelas.sql`

#### Políticas por Tabela

**contratos** (4 policies)
- SELECT: Todos usuários autenticados
- INSERT: Admins + Gestores
- UPDATE: Admins + Gestores + Responsáveis
- DELETE: Apenas Admins

**propostas** (4 policies)
- SELECT: Todos usuários autenticados
- INSERT: Admins + Gestores + Vendedores
- UPDATE: Admins + Gestores + Vendedores + Responsáveis
- DELETE: Apenas Admins

**obras** (4 policies)
- SELECT: Todos usuários autenticados
- INSERT: Admins + Gestores + Arquitetos
- UPDATE: Admins + Gestores + Arquitetos + Responsáveis
- DELETE: Apenas Admins

**lancamentos_financeiros** (4 policies)
- SELECT: Todos usuários autenticados
- INSERT: Admins + Gestores + Financeiro
- UPDATE: Admins + Gestores + Financeiro
- DELETE: Apenas Admins

**registros_trabalho** (4 policies)
- SELECT: Próprio profissional OU Admins/Gestores
- INSERT: Próprio profissional
- UPDATE: Próprio profissional (se não aprovado) OU Admins/Gestores
- DELETE: Próprio profissional (se não aprovado) OU Admins

**registro_categorias** (4 policies)
- SELECT: Todos usuários autenticados
- INSERT: Admins + Gestores
- UPDATE: Admins + Gestores
- DELETE: Apenas Admins

---

## 🔄 ORDEM DE APLICAÇÃO

**IMPORTANTE**: Aplicar migrations na ordem correta!

```bash
# 1. Migration 012 (PRIMEIRO - cria tabelas)
# Executa em: Supabase Dashboard > SQL Editor
# Arquivo: 012_criar_tabelas_views_sistema_completo.sql

# 2. Migration 013 (Storage bucket)
# Arquivo: 013_criar_storage_bucket_registros.sql

# 3. Migration 014 (SQL Functions)
# Arquivo: 014_criar_funcoes_gestao_usuarios.sql

# 4. Migration 015 (RLS Policies)
# Arquivo: 015_criar_rls_policies_novas_tabelas.sql
```

---

## ✅ CHECKLIST DE APLICAÇÃO

### Antes de Aplicar:
- [ ] Fazer backup do banco de dados
- [ ] Verificar que migrations anteriores (001-007) estão aplicadas
- [ ] Confirmar que tabelas base existem (entities, profiles, empresas, etc)

### Durante Aplicação:
- [ ] Aplicar Migration 012 e verificar sem erros
- [ ] Testar SELECT em cada view criada
- [ ] Aplicar Migration 013 e verificar bucket criado
- [ ] Aplicar Migration 014 e testar cada função
- [ ] Aplicar Migration 015 e verificar RLS habilitado

### Após Aplicação:
- [ ] Testar views com SELECT
- [ ] Testar funções users_* com dados reais
- [ ] Verificar bucket storage no dashboard
- [ ] Confirmar RLS policies funcionando
- [ ] Fazer seed de dados de teste se necessário

---

## 🧪 COMANDOS DE TESTE

### Testar Views:

```sql
-- View de clientes
SELECT * FROM v_clientes_ativos_contratos LIMIT 5;

-- View de fluxo de caixa
SELECT * FROM v_fluxo_caixa
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY data;

-- View de despesas
SELECT * FROM v_despesas_mes_categoria
WHERE mes >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
ORDER BY mes DESC, total DESC;

-- View top clientes
SELECT * FROM v_top10_clientes_receita;

-- View pipeline
SELECT * FROM vw_pipeline_oportunidades;

-- View kanban
SELECT * FROM v_kanban_cards_board LIMIT 10;

-- View registros
SELECT * FROM v_registros_trabalho
WHERE data >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY data DESC;
```

### Testar Funções:

```sql
-- Listar usuários
SELECT * FROM users_list(true);

-- Convidar usuário (teste)
SELECT users_invite(
  'teste@empresa.com',
  'João Teste',
  'vendedor',
  'Vendedor Júnior'
);

-- Alterar perfil
SELECT users_role_toggle(
  'user-uuid-aqui',
  'gestor'
);
```

### Testar Storage:

```javascript
// No frontend, teste upload:
const { data, error } = await supabase.storage
  .from('registros')
  .upload('teste/arquivo.pdf', file);
```

---

## 📊 ESTATÍSTICAS

**Linhas de SQL**: ~1200
**Tabelas criadas**: 6
**Views criadas**: 7
**Functions criadas**: 6
**Policies criadas**: 24
**Buckets criados**: 1

**Tempo estimado de aplicação**: 5-10 minutos

---

## 🚨 TROUBLESHOOTING

### Erro: "relation propostas does not exist"
**Causa**: Migration 012 não foi aplicada corretamente
**Solução**: Aplicar Migration 012 primeiro

### Erro: "permission denied for schema storage"
**Causa**: Usuário sem permissão para criar bucket
**Solução**: Executar como superuser ou via Dashboard

### Erro: "function users_perfis does not exist"
**Causa**: Tabela usuarios_perfis não existe
**Solução**: Verificar se migration 001 foi aplicada

### Views retornam vazio
**Causa**: Sem dados nas tabelas base
**Solução**: Normal se banco novo, inserir dados de teste

---

## 📝 BACKUP DAS FUNCTIONS

Todas as SQL Functions também foram salvas em:
```
/Supabase/backup/SQL_Functions/api/
├── users_invite.sql
├── users_reset_password.sql
├── users_role_toggle.sql
├── users_list.sql
├── users_deactivate.sql
└── users_activate.sql
```

---

## 🎯 PRÓXIMOS PASSOS

Após aplicar estas migrations:

1. ✅ Testar todas as views
2. ✅ Testar todas as funções
3. ✅ Verificar RLS funcionando
4. ⏳ Criar dados de exemplo (seed)
5. ⏳ Integrar com frontend React
6. ⏳ Documentar APIs para equipe

---

**Documentação completa**: Ver README.md em `/Supabase/backup/SQL_Functions/`
**Suporte**: @supabase-mcp-expert
**Última atualização**: 2025-11-02
