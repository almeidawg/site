# 🚀 APLICAR IMPLEMENTAÇÃO - GUIA RÁPIDO

**Data:** 2025-11-26
**Status:** ✅ Pronto para aplicar

---

## ⚡ APLICAÇÃO RÁPIDA (3 PASSOS)

### **PASSO 1: Aplicar Migrations no Banco**

Abra o terminal no diretório do projeto:

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema"
```

Execute os comandos na ordem:

```bash
# 1. Script principal (cronograma + financeiro + contratos)
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126150000_cronograma_financeiro_contratos_completo.sql"

# 2. Funções de aprovação
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126151000_funcoes_aprovacao_contratos.sql"

# 3. Storage de avatars
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126141000_storage_avatars_bucket.sql"
```

**✅ Mensagens esperadas:**
- `BEGIN`
- `CREATE TABLE` / `ALTER TABLE`
- `CREATE INDEX`
- `CREATE POLICY`
- `COMMIT`

**❌ Se der erro:** Verifique se Supabase local está rodando (`supabase status`)

---

### **PASSO 2: Atualizar Componente nas Rotas**

**Arquivo:** `wg-crm\src\App.jsx` (ou onde as rotas são definidas)

Procure por:
```jsx
import Contratos from '@/components/pages/Contratos';
```

Substitua por:
```jsx
import Contratos from '@/components/pages/ContratosSupabase';
```

---

### **PASSO 3: Iniciar Frontend**

```bash
cd wg-crm
npm run dev
```

App abrirá em: **http://localhost:5173**

---

## 🧪 TESTE RÁPIDO

### **1. Testar Avatar:**
1. Ir em **Pessoas** → **Nova Pessoa**
2. Clicar em **"Carregar Foto"**
3. Selecionar imagem (JPG/PNG)
4. ✅ Deve fazer upload e mostrar preview

### **2. Criar Contrato:**
1. Ir em **Contratos** → **Novo Contrato**
2. Selecionar cliente
3. Preencher valor
4. Salvar
5. ✅ Deve aparecer na lista com status "Pendente"

### **3. Aprovar Contrato (Fluxo Automático):**
1. Clicar no ícone **✓ verde** do contrato
2. Confirmar aprovação
3. ✅ Sistema deve:
   - Mudar status para "Aprovado"
   - Gerar projeto no cronograma
   - Gerar cobranças no financeiro

---

## 🔍 VERIFICAR NO BANCO

Abrir psql:
```bash
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

Executar queries:
```sql
-- Verificar projeto gerado
SELECT id, codigo, titulo, status FROM projects ORDER BY created_at DESC LIMIT 1;

-- Verificar cobranças geradas
SELECT id, descricao, valor, vencimento, status FROM cobrancas ORDER BY created_at DESC;

-- Verificar contrato aprovado
SELECT id, numero, aprovado, cronograma_gerado, financeiro_gerado FROM project_contracts WHERE aprovado = TRUE LIMIT 1;
```

---

## ❓ TROUBLESHOOTING

### **Problema: "Erro ao aplicar migration"**

**Solução:**
```bash
# Verificar se Supabase está rodando
cd supabase
supabase status

# Se não estiver rodando
supabase start
```

### **Problema: "Bucket avatars não existe"**

**Solução:**
1. Acessar: http://127.0.0.1:54323
2. Ir em **Storage**
3. Criar bucket manualmente:
   - Nome: `avatars`
   - Public: ✅ SIM

### **Problema: "Função api_aprovar_contrato não encontrada"**

**Solução:**
```bash
# Reaplicar migration de funções
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126151000_funcoes_aprovacao_contratos.sql"
```

---

## 📊 O QUE FOI IMPLEMENTADO

### ✅ **Sistema de Avatar**
- Upload direto para Supabase Storage
- Componente reutilizável `AvatarUpload.jsx`
- Integrado em dialogs de cadastro

### ✅ **Módulo de Contratos**
- Aprovação visual com ícones
- Condições de pagamento configuráveis
- Status: Pendente/Aprovado/Rejeitado

### ✅ **Fluxo Automático**
Ao aprovar contrato:
1. 🟢 Gera projeto no cronograma
2. 🟢 Cria tarefa inicial
3. 🟢 Gera cobranças no financeiro

### ✅ **Tabelas Criadas**
- `projects` (cronograma)
- `tasks` (tarefas)
- `teams` e `team_members` (equipes)
- `project_contracts` (contratos)
- `cobrancas` (financeiro)
- `fin_categories`, `fin_transactions`, etc.

### ✅ **Funções SQL**
- `api_aprovar_contrato()`
- `api_gerar_projeto_contrato()`
- `api_gerar_cobrancas_contrato()`
- `api_rejeitar_contrato()`

---

## 📝 CHECKLIST

Antes de considerar completo:

- [ ] Migrations aplicadas sem erro
- [ ] Bucket `avatars` criado
- [ ] Frontend iniciado sem erro
- [ ] Upload de avatar funciona
- [ ] Contrato pode ser criado
- [ ] Aprovação gera projeto
- [ ] Aprovação gera cobranças
- [ ] UI mostra status correto

---

## 📞 SUPORTE

**Documentação completa:**
📄 `INSTRUCOES_IMPLEMENTACAO_CONTRATOS.md`

**Logs do Supabase:**
```bash
docker logs supabase_db_WG -f
```

**Logs do Frontend:**
Console do navegador (F12)

---

## 🎯 RESULTADO ESPERADO

✅ Sistema completo funcionando com:
- Avatar em todos os cadastros
- Contratos com aprovação visual
- Geração automática de projetos
- Geração automática de cobranças
- Fluxo integrado: **Contrato → Cronograma → Financeiro**

**🚀 Pronto para produção após testes!**
