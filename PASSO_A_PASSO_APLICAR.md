# 🚀 PASSO A PASSO - APLICAR E TESTAR

**Data:** 2025-11-26
**Tempo estimado:** 10-15 minutos

---

## ✅ PRÉ-REQUISITOS

Antes de começar, certifique-se que:

- [ ] Docker Desktop está **instalado**
- [ ] Docker Desktop está **rodando** (ícone na bandeja do sistema)
- [ ] Supabase local foi iniciado ao menos uma vez (`supabase start`)

---

## 📋 PASSO 1: INICIAR DOCKER E SUPABASE

### **1.1 Iniciar Docker Desktop**

1. Abrir **Docker Desktop** (se não estiver rodando)
2. Aguardar até ver "Engine running" na janela

### **1.2 Verificar se Supabase está rodando**

Abrir terminal **PowerShell** ou **CMD**:

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema"
cd supabase
supabase status
```

**Se não estiver rodando:**
```bash
supabase start
```

Aguardar até ver:
```
✅ Started supabase local development setup.
```

---

## 📋 PASSO 2: APLICAR MIGRATIONS

### **Método 1: Script Automático (RECOMENDADO)**

1. Navegar até a pasta do projeto no Windows Explorer
2. Localizar o arquivo: **`aplicar_migrations.bat`**
3. **Botão direito** → **Executar como administrador**
4. Aguardar mensagem de sucesso

**✅ Deve mostrar:**
```
[1/3] OK - Migration principal aplicada
[2/3] OK - Funcoes de aprovacao aplicadas
[3/3] OK - Storage configurado
========================================
MIGRATIONS APLICADAS COM SUCESSO!
```

---

### **Método 2: Manual (se script não funcionar)**

Abrir terminal **como Administrador**:

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema"

# 1. Migration principal
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126150000_cronograma_financeiro_contratos_completo.sql"

# 2. Funções de aprovação
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126151000_funcoes_aprovacao_contratos.sql"

# 3. Storage de avatars
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126141000_storage_avatars_bucket.sql"
```

---

## 📋 PASSO 3: VERIFICAR APLICAÇÃO

### **3.1 Executar Script de Verificação**

1. Localizar: **`verificar_migrations.bat`**
2. **Duplo clique** para executar
3. Verificar mensagens de OK

**✅ Deve mostrar:**
```
OK - Tabela projects existe
OK - Tabela tasks existe
OK - Tabela cobrancas existe
OK - Funcao api_aprovar_contrato existe
OK - Funcao api_gerar_projeto_contrato existe
```

---

### **3.2 Verificar Manualmente no Banco**

Abrir psql:
```bash
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

Executar queries:
```sql
-- Listar tabelas
\dt

-- Verificar colunas de project_contracts
\d project_contracts

-- Listar funções
\df api_*

-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Sair
\q
```

---

## 📋 PASSO 4: ATUALIZAR CÓDIGO REACT

### **4.1 Abrir Arquivo de Rotas**

**Arquivo:** `wg-crm\src\App.jsx` (ou onde as rotas são definidas)

Procurar por:
```jsx
import Contratos from '@/components/pages/Contratos';
```

**Substituir por:**
```jsx
import Contratos from '@/components/pages/ContratosSupabase';
```

**Salvar o arquivo** (Ctrl+S)

---

## 📋 PASSO 5: INICIAR FRONTEND

Abrir terminal:

```bash
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema\wg-crm"
npm run dev
```

**✅ Deve mostrar:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Acessar:** http://localhost:5173

---

## 📋 PASSO 6: TESTAR FUNCIONALIDADES

### **Teste 1: Avatar ✅**

1. Clicar em **"Pessoas"** no menu
2. Clicar em **"Nova Pessoa"**
3. Preencher nome
4. Clicar em **"Carregar Foto"**
5. Selecionar uma imagem (JPG/PNG)
6. ✅ **Verificar:** Imagem aparece no preview
7. Salvar cadastro
8. ✅ **Verificar:** Avatar aparece na lista

---

### **Teste 2: Criar Contrato ✅**

1. Clicar em **"Contratos"** no menu
2. Clicar em **"Novo Contrato"**
3. Preencher:
   - **Cliente:** Selecionar um cliente existente
   - **Número:** 001/2025
   - **Valor Total:** 15000
   - **Descrição:** Contrato de teste
4. Salvar
5. ✅ **Verificar:** Contrato aparece na lista com status **"Pendente"** e ícone ⏰

---

### **Teste 3: Aprovar Contrato (Fluxo Automático) ✅**

1. Na lista de contratos, localizar o contrato criado
2. Clicar no ícone **✓ verde** (CheckCircle)
3. ✅ **Verificar:** Dialog de confirmação aparece
4. Ler mensagem: "Ao aprovar este contrato, serão gerados automaticamente..."
5. Clicar em **"Aprovar Contrato"**
6. ✅ **Verificar:**
   - Toast de sucesso aparece
   - Status muda para **"Aprovado"** com ícone ✓ verde
   - Contrato desaparece dos botões de aprovação/rejeição

---

### **Teste 4: Verificar Integrações no Banco ✅**

Abrir terminal e conectar ao banco:

```bash
docker exec -it supabase_db_WG psql -U postgres -d postgres
```

**Verificar projeto gerado:**
```sql
SELECT id, codigo, titulo, status, orcamento_total
FROM projects
ORDER BY created_at DESC
LIMIT 1;
```

**✅ Deve mostrar:** Projeto com título "Projeto - Contrato 001/2025"

**Verificar tarefa inicial:**
```sql
SELECT id, titulo, descricao, status
FROM tasks
ORDER BY criado_em DESC
LIMIT 1;
```

**✅ Deve mostrar:** Tarefa "Início do Projeto"

**Verificar cobranças geradas:**
```sql
SELECT id, descricao, valor, vencimento, status
FROM cobrancas
ORDER BY created_at DESC;
```

**✅ Deve mostrar:** Cobranças baseadas nas condições de pagamento

Sair do psql:
```sql
\q
```

---

### **Teste 5: Rejeitar Contrato ✅**

1. Criar um novo contrato de teste
2. Clicar no ícone **✗ vermelho** (XCircle)
3. ✅ **Verificar:** Dialog de rejeição aparece
4. Preencher motivo: "Valor fora do orçamento"
5. Clicar em **"Rejeitar"**
6. ✅ **Verificar:**
   - Status muda para **"Rejeitado"** com ícone ✗ vermelho
   - Motivo aparece abaixo do contrato

---

## 📋 PASSO 7: VALIDAÇÃO FINAL

### **Checklist de Validação:**

- [ ] ✅ Migrations aplicadas sem erro
- [ ] ✅ Tabelas criadas (projects, tasks, cobrancas)
- [ ] ✅ Funções SQL criadas (api_aprovar_contrato, etc.)
- [ ] ✅ Bucket `avatars` criado
- [ ] ✅ Upload de avatar funciona
- [ ] ✅ Preview de avatar aparece
- [ ] ✅ Contrato pode ser criado
- [ ] ✅ Aprovação mostra dialog
- [ ] ✅ Aprovação gera projeto (verificado no banco)
- [ ] ✅ Aprovação gera cobranças (verificado no banco)
- [ ] ✅ UI mostra ícones corretos (✓/✗/⏰)
- [ ] ✅ Rejeição funciona com motivo

---

## ❌ TROUBLESHOOTING

### **Problema: Docker não está rodando**

**Solução:**
1. Abrir **Docker Desktop**
2. Aguardar inicialização completa
3. Tentar novamente

---

### **Problema: "Tabela já existe"**

**Causa:** Normal - migration é idempotente

**Solução:** Ignorar - script continua normalmente

---

### **Problema: "Função não encontrada"**

**Solução:**
```bash
# Reaplicar migration de funções
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126151000_funcoes_aprovacao_contratos.sql"
```

---

### **Problema: "Bucket não existe"**

**Solução Manual:**
1. Acessar: http://127.0.0.1:54323
2. Ir em **Storage**
3. Clicar em **"New bucket"**
4. Nome: `avatars`
5. Public: ✅ **Marcar como público**
6. Criar

---

### **Problema: Frontend não inicia**

**Solução:**
```bash
cd wg-crm
npm install  # Reinstalar dependências
npm run dev
```

---

## 🎯 RESULTADO ESPERADO

Após concluir todos os passos:

✅ **Sistema 100% funcional** com:
- Upload de avatar em cadastros
- Criação de contratos
- Aprovação visual com ícones
- Fluxo automático: Contrato → Projeto → Cobranças
- Rejeição com motivo
- Geração de PDF mantida

---

## 📞 PRÓXIMOS PASSOS

1. ✅ **Testar com dados reais**
2. ✅ **Validar todas as funcionalidades**
3. ✅ **Fazer ajustes visuais se necessário**
4. ✅ **Preparar para deploy em LIVE**

---

## 📄 DOCUMENTAÇÃO ADICIONAL

- 📄 `INSTRUCOES_IMPLEMENTACAO_CONTRATOS.md` - Guia completo
- 📄 `APLICAR_AGORA.md` - Guia rápido
- 📄 Scripts: `aplicar_migrations.bat`, `verificar_migrations.bat`

---

**🚀 Boa sorte com os testes!**

Qualquer problema, consulte a documentação ou verifique os logs:
```bash
docker logs supabase_db_WG -f
```
