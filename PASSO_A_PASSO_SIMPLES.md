# 🚀 Passo a Passo SIMPLES - Aplicar Migrations e Testar Gantt

## ⚡ Versão Rápida (3 comandos)

```bash
# 1. Iniciar Supabase (se ainda não estiver rodando)
cd Supabase
supabase start

# 2. Aplicar migrations
supabase db reset

# 3. Iniciar frontend
cd ../wg-crm
npm run dev
```

Pronto! Abra http://localhost:5173

---

## 📋 Versão Detalhada

### Passo 1: Verificar Docker

- Abra o Docker Desktop
- Aguarde até ver ícone verde (Docker running)
- Não precisa fazer nada mais, apenas deixar rodando

### Passo 2: Iniciar Supabase Local

Abra um terminal na pasta do projeto e execute:

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\Supabase"
supabase start
```

**Aguarde até ver:**
```
Started supabase local development setup.
API URL: http://127.0.0.1:54321
...
```

### Passo 3: Aplicar Migrations

**Opção A - Automático (Recomendado):**

Dê duplo clique em: `APLICAR_MIGRATIONS_SIMPLES.bat`

**Opção B - Manual:**

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\Supabase"
supabase db reset
```

**O que vai acontecer:**
- ✅ Supabase vai aplicar todas as 9 migrations
- ✅ Vai criar as 4 funções SQL
- ✅ Vai resetar o banco local (dados de teste serão perdidos, mas isso é ok)

### Passo 4: Iniciar Frontend

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\wg-crm"
npm run dev
```

**Aguarde ver:**
```
➜  Local:   http://localhost:5173/
```

### Passo 5: Abrir no Navegador

Abra: http://localhost:5173

---

## ✅ Verificar se Funcionou

### Teste 1: Alertas de Pagamento

1. No navegador, vá para qualquer página do sistema
2. No canto superior direito, deve aparecer um popup com alertas
3. Se não aparecer alertas, é porque não há cobranças com vencimento próximo (isso é normal)

### Teste 2: Gantt Chart

1. Vá para: **Módulo Cronograma**
2. Deve ver componente de Gantt Chart
3. Se não houver tarefas, clique em "Nova Tarefa" para criar uma
4. Arraste as barras para alterar datas
5. Clique em uma tarefa para ver detalhes

### Teste 3: Team Builder

1. Vá para: **Módulo Cronograma → Team Builder**
2. Deve ver interface com 2 colunas:
   - Esquerda: Lista de colaboradores disponíveis
   - Direita: Time selecionado
3. Clique no botão "+" para adicionar membros ao time

---

## 🐛 Problemas Comuns

### "Error: Cannot connect to database"

**Solução:**
```bash
cd Supabase
supabase stop
supabase start
```

### "Error: Migration already applied"

**Isso é normal!** As migrations já foram aplicadas. Pule para o passo 4 (iniciar frontend).

### "Docker not running"

**Solução:**
1. Abra Docker Desktop
2. Aguarde inicializar completamente (ícone verde)
3. Tente novamente

### "Port 5173 already in use"

**Solução:**
```bash
# Parar processo na porta 5173
netstat -ano | findstr :5173
# Anotar o PID (último número)
taskkill /PID [numero_do_pid] /F

# Ou fechar navegador e tentar de novo
npm run dev
```

---

## 📊 O Que Foi Implementado

### ✅ Banco de Dados (9 Migrations)
1. `cobrancas` → centro_custo_id, categoria_id
2. `entities` → centro_custo_padrao_id, nucleo
3. `alertas_pagamento` → tabela completa
4. `tasks` → campos para Gantt
5. `task_comments` → comentários na timeline

### ✅ Funções SQL (4 Functions)
6. `api_sync_cobranca_titulo` → Sincroniza cobrança com título
7. `api_lancar_cobranca_paga` → Lança pagamento
8. `api_gerar_alertas_pagamento` → Gera alertas automáticos
9. `api_get_alertas_pendentes` → Busca alertas do usuário

### ✅ Componentes React (7 Files)
- `AlertasPagamentoPopup.jsx` → Popup de alertas
- `TeamBuilder.jsx` → Construtor de equipes
- `GanttChart.jsx` → Gráfico de Gantt
- `GanttCommentDialog.jsx` → Adicionar comentários
- `GanttTaskDialog.jsx` → Criar/editar tarefas
- `useAlertas.js` → Hook de alertas
- `useGantt.js` → Hook do Gantt

---

## 🎯 Próximos Passos

Após testar localmente:

1. **Integrar no código existente**
   - Importar `<AlertasPagamentoPopup />` no layout principal
   - Adicionar `<GanttChart />` na página de projetos
   - Adicionar `<TeamBuilder />` onde necessário

2. **Testar fluxo completo**
   - Criar contrato
   - Gerar cobrança
   - Verificar alerta aparece
   - Marcar como pago
   - Verificar lançamento criado

3. **Deploy quando estável**
   - Aplicar migrations no Supabase LIVE
   - Deploy do frontend

---

**Dúvidas?** Consulte `GUIA_INTEGRACAO_COMPONENTES.md` para detalhes técnicos.

**Documentação Completa:** Veja `RESUMO_FINAL_IMPLEMENTACAO.md` (18.000+ linhas).
