# ✅ Checklist de Deploy - Projeto WG CRM

**Objetivo**: Garantir qualidade e segurança antes de deployer em produção

---

## 🎯 Princípio Fundamental

**NUNCA** faça deploy sem validar todos itens deste checklist!

Um erro em produção pode afetar usuários reais e dados reais.

---

## 📋 CHECKLIST COMPLETO

### 🔵 FASE 1: Desenvolvimento Local

#### ✅ Código e Testes

- [ ] **Código funciona localmente**
  - App roda sem erros (`npm run dev`)
  - Funcionalidade testada manualmente
  - Dados de teste validados

- [ ] **Funções SQL testadas**
  - Criadas com `supabase-local-expert`
  - Testadas com `BEGIN/ROLLBACK`
  - Arquivo `.test.sql` executado com sucesso
  - Validações de input funcionando

- [ ] **Sem erros no console**
  - Console do navegador limpo
  - Sem warnings React
  - Sem erros TypeScript (`npm run build`)

- [ ] **Performance OK**
  - Queries SQL otimizadas (não demora >1s)
  - Componentes React sem re-renders desnecessários
  - Imagens otimizadas se houver

#### ✅ Qualidade de Código

- [ ] **Padrões seguidos**
  - Code Standards respeitados
  - Nomenclatura consistente
  - Imports organizados

- [ ] **Tipos TypeScript**
  - Sem `any` (usar `unknown` se necessário)
  - Interfaces/types definidos
  - Props tipadas

- [ ] **Comentários adequados**
  - Lógica complexa documentada
  - TODOs removidos ou documentados
  - Headers em funções SQL

#### ✅ Segurança

- [ ] **Sem credenciais hardcoded**
  - Nenhum token/senha no código
  - Variáveis de ambiente usadas
  - `.env.local` não commitado

- [ ] **Validações de input**
  - Funções SQL validam parâmetros
  - Frontend valida forms
  - Sanitização de strings

- [ ] **RLS (Row Level Security)**
  - Políticas definidas se tabela nova
  - Usuários só veem dados permitidos
  - Testado com diferentes roles

---

### 🟢 FASE 2: Git e Versionamento

#### ✅ Git Commit

- [ ] **Branch correta**
  - Desenvolvendo em `dev-supabase-local`
  - Merge para `main` após aprovação

- [ ] **Commit limpo**
  - Só arquivos relevantes
  - Sem `node_modules/`, `.env.local`
  - Sem arquivos temporários

- [ ] **Mensagem descritiva**
  - Segue Conventional Commits
  - Descreve "o quê" e "por quê"
  - Exemplos:
    ```
    feat: Adiciona página de oportunidades
    fix: Corrige cálculo de total em títulos
    refactor: Reorganiza componentes kanban
    ```

- [ ] **Migrations versionadas**
  - Arquivo em `Supabase/migrations/`
  - Nome descritivo: `YYYYMMDDHHMMSS_descricao.sql`
  - Timestamp único

#### ✅ Code Review (se aplicável)

- [ ] **Pull Request criado**
  - Descrição clara do que mudou
  - Screenshots se mudança visual
  - Testes descritos

- [ ] **Aprovação recebida**
  - Outro dev revisou código
  - Feedback aplicado
  - Merge aprovado

---

### 🔴 FASE 3: Preparação para Deploy

#### ✅ Arquivos e Estrutura

- [ ] **Migration SQL pronta**
  - Arquivo `.sql` salvo em `Supabase/migrations/`
  - **DROP IF EXISTS** antes de CREATE (funções)
  - Comentários e documentação
  - Testada localmente

- [ ] **Frontend buildável**
  - `npm run build` sem erros
  - `npm run preview` funciona
  - Tamanho bundle OK (<500KB se possível)

- [ ] **Dependências atualizadas**
  - `package.json` commitado
  - `package-lock.json` commitado
  - Sem vulnerabilidades (`npm audit`)

#### ✅ Ambiente Correto

- [ ] **Branch main**
  - `git checkout main`
  - `git merge dev-supabase-local`
  - `git push origin main`

- [ ] **Credentials LIVE**
  - `.env.local` (wg-crm/) aponta para LIVE
  - `VITE_SUPABASE_URL`: https://vyxscnevgeubfgfstmtf.supabase.co
  - Tokens corretos

- [ ] **Supabase local parado**
  - `supabase stop` executado
  - Nenhum container Docker rodando
  - Evita confusão de ambiente

---

### 🚀 FASE 4: Deploy em Produção

#### ✅ Deploy de Função SQL

- [ ] **Via agente MCP**
  ```
  Task → supabase-mcp-expert → "deploy função api_criar_oportunidade
  do arquivo Supabase/migrations/XXX_nome.sql no LIVE"
  ```

- [ ] **Verificar sucesso**
  - Agente confirma deploy OK
  - Logs sem erros
  - Função aparece no Dashboard

- [ ] **Testar em LIVE**
  - Executar teste básico via MCP
  - Verificar resultado esperado
  - Sem erros nos logs

#### ✅ Deploy de Frontend (se aplicável)

- [ ] **Build de produção**
  ```bash
  cd wg-crm
  npm run build
  ```

- [ ] **Deploy conforme hosting**
  - Vercel/Netlify/Outro
  - Build automático via Git push
  - Ou upload manual de `dist/`

- [ ] **Verificar deploy**
  - Site acessível
  - Sem erros console
  - Funcionalidades OK

---

### 🔍 FASE 5: Validação Pós-Deploy

#### ✅ Monitoramento Imediato (primeiros 5 min)

- [ ] **Logs OK**
  ```
  Task → supabase-mcp-expert → "verificar logs postgres
  últimos 5min procurando por erros"
  ```

- [ ] **Funcionalidade testada**
  - Criar oportunidade (se função nova)
  - Atualizar kanban (se mudança)
  - Qualquer feature deployada

- [ ] **Performance OK**
  - Queries não demorando
  - Frontend responsivo
  - Sem timeouts

#### ✅ Monitoramento Estendido (primeiras 24h)

- [ ] **Uso real validado**
  - Usuários conseguem usar feature
  - Nenhum report de erro
  - Métricas normais

- [ ] **Sem regressões**
  - Features antigas continuam funcionando
  - Nenhuma quebra inesperada

---

## 🚨 CHECKLIST DE EMERGÊNCIA

### Se algo der errado em LIVE:

#### 🔴 Rollback Imediato

- [ ] **Git revert**
  ```bash
  git revert <commit-hash>
  git push origin main
  ```

- [ ] **Migration de rollback**
  ```sql
  -- Criar migration reversa
  DROP FUNCTION IF EXISTS funcao_com_problema;
  -- Recriar versão anterior se necessário
  ```

- [ ] **Deploy de rollback**
  ```
  Task → supabase-mcp-expert → "aplicar rollback da função X"
  ```

- [ ] **Verificar recuperação**
  - Sistema voltou ao normal?
  - Usuários conseguem usar?
  - Logs sem erros?

#### 🟡 Comunicação

- [ ] **Avisar stakeholders**
  - Informar problema detectado
  - Explicar impacto
  - Estimar tempo de correção

- [ ] **Documentar incidente**
  - O que aconteceu
  - Por que aconteceu
  - Como foi resolvido
  - Como prevenir no futuro

---

## 📊 CHECKLIST RÁPIDO (TL;DR)

Para uso rápido, versão resumida:

### Pré-Deploy

- [ ] ✅ Testado localmente
- [ ] ✅ Commit no Git
- [ ] ✅ Branch main
- [ ] ✅ `.env.local` = LIVE

### Deploy

- [ ] 🚀 Via `supabase-mcp-expert`
- [ ] 🔍 Verificar logs
- [ ] 🧪 Testar em LIVE

### Pós-Deploy

- [ ] ✅ Funciona
- [ ] ✅ Sem erros
- [ ] ✅ Performance OK

---

## 🎓 Exemplos Práticos

### Exemplo 1: Deploy de Nova Função SQL

```markdown
## Checklist: api_criar_oportunidade

### FASE 1: Local
- [x] Função criada com supabase-local-expert
- [x] Testada com BEGIN/ROLLBACK
- [x] Validações implementadas
- [x] Arquivo .test.sql executado
- [x] Sem erros console

### FASE 2: Git
- [x] Branch dev-supabase-local
- [x] Migration salva em migrations/
- [x] Commit: "feat: Adiciona api_criar_oportunidade"
- [x] Push origin dev-supabase-local

### FASE 3: Preparação
- [x] Merge para main
- [x] .env.local = LIVE
- [x] Supabase local parado

### FASE 4: Deploy
- [x] Deploy via supabase-mcp-expert
- [x] Logs OK
- [x] Teste em LIVE OK

### FASE 5: Validação
- [x] Monitoramento 5min OK
- [x] Sem erros
- [x] Performance OK
```

### Exemplo 2: Deploy de Feature Frontend

```markdown
## Checklist: Página de Oportunidades

### FASE 1: Local
- [x] Componentes funcionando
- [x] Queries Supabase OK
- [x] Formulários validados
- [x] TypeScript sem erros
- [x] Build local OK

### FASE 2: Git
- [x] Commit: "feat: Adiciona página de oportunidades"
- [x] Screenshots no PR
- [x] Code review aprovado

### FASE 3: Preparação
- [x] npm run build OK
- [x] npm audit sem vulnerabilidades
- [x] .env.local = LIVE

### FASE 4: Deploy
- [x] Push para main
- [x] Build automático OK
- [x] Site acessível

### FASE 5: Validação
- [x] Página carrega
- [x] Formulário funciona
- [x] Dados salvos corretamente
```

---

## 🔧 Scripts de Validação (Futuro)

```bash
#!/bin/bash
# ./validate-deploy.sh

echo "🔍 Validando pré-deploy..."

# Check branch
if [ "$(git branch --show-current)" != "main" ]; then
  echo "❌ Você não está na branch main!"
  exit 1
fi

# Check environment
if ! grep -q "vyxscnevgeubfgfstmtf" wg-crm/.env.local; then
  echo "❌ .env.local não está apontando para LIVE!"
  exit 1
fi

# Check Supabase local
if docker ps | grep -q "supabase_db_WG"; then
  echo "⚠️  Supabase local ainda rodando! Rode: supabase stop"
  exit 1
fi

# Check build
cd wg-crm
if ! npm run build; then
  echo "❌ Build falhou!"
  exit 1
fi

echo "✅ Tudo OK! Pode fazer deploy."
```

---

## 📝 Template de Checklist

Copie e use este template para cada deploy:

```markdown
# Deploy Checklist - [Nome da Feature/Fix]

**Data**: YYYY-MM-DD
**Tipo**: [ ] Feature [ ] Fix [ ] Refactor
**Impacto**: [ ] Baixo [ ] Médio [ ] Alto

## Pré-Deploy
- [ ] Testado localmente
- [ ] Funções SQL testadas
- [ ] Sem erros console
- [ ] Code standards OK
- [ ] Segurança validada
- [ ] Git commit limpo
- [ ] Branch main

## Deploy
- [ ] Migration deployada
- [ ] Logs OK
- [ ] Teste em LIVE

## Pós-Deploy
- [ ] Funcionalidade OK
- [ ] Sem erros
- [ ] Performance OK
- [ ] Monitoramento 24h

## Notas
<!-- Adicionar observações importantes -->
```

---

**Lembre-se**: Melhor prevenir que remediar! Use este checklist sempre.

**Última atualização**: 02/11/2025
