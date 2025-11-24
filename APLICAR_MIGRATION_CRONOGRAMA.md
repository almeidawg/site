# 🚀 Aplicar Migration do Módulo Cronograma no LIVE

**Data**: 2025-11-24
**Migration**: `20251124000000_criar_modulo_cronograma.sql`
**Método**: Via Dashboard Supabase (recomendado)

---

## ⚠️ Por Que Via Dashboard?

O comando `supabase db push` está falhando devido a **connection pool timeout** no Supabase LIVE:

```
connection not available and request was dropped from queue after 10000ms
```

**Solução**: Aplicar migration diretamente via Dashboard é mais confiável.

---

## 📋 Passo a Passo (5 minutos)

### PASSO 1: Abrir SQL Editor

1. Acesse: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new
2. Faça login se necessário
3. Você verá o SQL Editor em branco

### PASSO 2: Copiar Migration

1. Abra o arquivo: `Supabase/supabase/migrations/20251124000000_criar_modulo_cronograma.sql`
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)

**Ou use este caminho completo**:
```
C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\Supabase\supabase\migrations\20251124000000_criar_modulo_cronograma.sql
```

### PASSO 3: Colar no SQL Editor

1. **Cole** o conteúdo no SQL Editor do Dashboard (Ctrl+V)
2. Você deve ver ~500 linhas de SQL começando com:
   ```sql
   -- =============================================
   -- MIGRATION: Criar Módulo Cronograma Completo
   -- Data: 2025-11-24
   ...
   ```

### PASSO 4: Executar

1. Clique no botão **"RUN"** (canto inferior direito)
2. Aguarde a execução (pode demorar 10-30 segundos)
3. Você verá mensagens de sucesso na parte inferior

### PASSO 5: Verificar Sucesso

**Mensagem Esperada**:
```
Success. No rows returned
```

**Ou**:
```
✅ Command completed successfully
```

---

## ✅ O Que a Migration Cria

Após executar, você terá **9 novas tabelas**:

### Cronograma
1. ✅ `projects` - Projetos vinculados a obras
2. ✅ `tasks` - Tarefas com WBS
3. ✅ `task_dependencies` - Dependências entre tarefas (FS, SS, FF, SF)
4. ✅ `teams` - Equipes de trabalho
5. ✅ `team_members` - Membros das equipes
6. ✅ `project_contracts` - Contratos de projetos
7. ✅ `project_measurements` - Medições físico-financeiras

### Financeiro (Complementares)
8. ✅ `categorias_financeiras` - Categorias de receitas/despesas
9. ✅ `contas_bancarias` - Contas bancárias

### Recursos Adicionais
- ✅ **RLS habilitado** em todas as tabelas
- ✅ **Policies** de multi-tenancy (empresa_id)
- ✅ **Índices** otimizados
- ✅ **Triggers** automáticos (cálculo de progresso do projeto)
- ✅ **Funções SQL** úteis (`calcular_progresso_projeto`)

---

## 🔍 Validar Aplicação

Após executar, valide que as tabelas foram criadas:

### Via SQL Editor (mesma aba):

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'projects', 'tasks', 'task_dependencies',
    'teams', 'team_members',
    'project_contracts', 'project_measurements',
    'categorias_financeiras', 'contas_bancarias'
  )
ORDER BY table_name;
```

**Resultado Esperado**: 9 linhas

### Via Table Editor:

1. Vá para: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/editor
2. Você deve ver as novas tabelas na lista lateral:
   - `categorias_financeiras`
   - `contas_bancarias`
   - `project_contracts`
   - `project_measurements`
   - `projects`
   - `task_dependencies`
   - `tasks`
   - `team_members`
   - `teams`

---

## 🐛 Troubleshooting

### Erro: "relation already exists"

**Causa**: Tabela já foi criada antes.

**Solução**: A migration já tem `CREATE TABLE IF NOT EXISTS`, então é seguro. Ignore o erro.

### Erro: "syntax error at or near..."

**Causa**: SQL copiado incorretamente ou incompleto.

**Solução**:
1. Copie novamente TODO o arquivo (Ctrl+A, Ctrl+C)
2. Limpe o SQL Editor (Ctrl+A, Delete)
3. Cole novamente (Ctrl+V)
4. Execute novamente

### Erro: "permission denied"

**Causa**: Usuário sem permissões de admin.

**Solução**:
1. Verifique se está logado como owner do projeto
2. Ou use Service Role Key (não recomendado)

### Erro: "timeout"

**Causa**: Migration muito grande ou banco sobrecarregado.

**Solução**:
1. Aguarde 5-10 minutos
2. Tente novamente
3. Se persistir, divida a migration em partes menores

---

## 📝 Checklist de Execução

Marque conforme for completando:

- [ ] ✅ Abri SQL Editor no Dashboard
- [ ] ✅ Copiei migration completa do arquivo local
- [ ] ✅ Colei no SQL Editor
- [ ] ✅ Executei (cliquei em RUN)
- [ ] ✅ Vi mensagem de sucesso
- [ ] ✅ Validei que 9 tabelas foram criadas
- [ ] ✅ Verifiquei RLS habilitado
- [ ] ✅ Testei criação de um projeto de teste

---

## 🧪 Teste Rápido (Opcional)

Após aplicar migration, teste criando um projeto:

```sql
-- Inserir projeto de teste
INSERT INTO projects (
  empresa_id,
  codigo,
  titulo,
  data_inicio,
  data_fim_prevista,
  status
) VALUES (
  (SELECT empresa_id FROM profiles WHERE id = auth.uid() LIMIT 1),
  'PROJ-TEST-001',
  'Projeto de Teste - Cronograma',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'planejamento'
) RETURNING *;
```

**Resultado Esperado**: 1 linha retornada com o projeto criado.

**Limpar teste**:
```sql
DELETE FROM projects WHERE codigo = 'PROJ-TEST-001';
```

---

## ✅ Após Aplicar a Migration

Marque o que já foi feito:

- [ ] ✅ Migration aplicada no LIVE
- [ ] ✅ 9 tabelas criadas
- [ ] ✅ RLS validado
- [ ] ✅ Teste de inserção OK
- [ ] ⏳ Criar usuário master (`create_master_user.sql`)
- [ ] ⏳ Deploy frontend no Vercel
- [ ] ⏳ Começar implementação (FASE 2-6)

---

## 🚀 Próximo Passo

**Depois de aplicar esta migration**:

1. ✅ Criar usuário master
   - Arquivo: `create_master_user.sql`
   - Guia: `INSTRUÇÕES_CRIAR_USUARIO_MASTER.md`

2. ✅ Deploy frontend no Vercel
   - Guia: `DEPLOY_VERCEL.md`

3. ✅ Começar implementação do código
   - Guia: `ARQUITETURA_MODULOS_INTEGRADOS.md` → Guia de Migração

---

## 📞 Suporte

### Logs do Supabase

Se precisar ver logs de erros:
https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/logs/postgres-logs

### Documentação Oficial

- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Boa sorte! 🎉**

**Criado por**: Claude Code
**Data**: 2025-11-24
**Versão**: 1.0
**Projeto**: WGEasy CRM - Migration Cronograma
