# 📥 Pasta de Atualizações do Cliente

**Esta pasta contém os exports do app desenvolvido pelo cliente na plataforma visual (Horizons/FlutterFlow).**

---

## 📊 Análise do Export Atual

### Arquivo Recebido
- **Nome:** `horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip`
- **Tamanho:** 336 KB
- **Data:** 28 Out 2025

### Estrutura do App
```
App React + Vite + Supabase
├── 📦 118 componentes React (.jsx)
├── 🎨 UI components (Radix UI + Tailwind)
├── 🔄 Contexts (Auth, Financial)
├── 🚀 7 Supabase Edge Functions
├── 📊 Features:
│   ├── Clientes
│   ├── Compras
│   ├── Assistência
│   ├── Pessoas
│   ├── Leads
│   ├── Propostas
│   ├── Contratos
│   └── Financeiro
└── 🎯 Integrações: Google Sheets, PDF
```

### Tecnologias Detectadas
- **React** 18.2
- **Vite** 4.4.5
- **Supabase** 2.30.0
- **React Router** 6.16.0
- **Tailwind CSS** 3.3.3
- **jsPDF** (geração de PDFs)
- **Recharts** (gráficos)
- **date-fns** (manipulação de datas)

---

## 🔄 Workflow de Atualização

### Como Funciona Agora (ANTES do Sistema)

```
❌ PROBLEMA:

1. Cliente faz mudanças no app visual
2. Cliente exporta → você baixa ZIP aqui
3. Você SUBSTITUI código local inteiro
4. Perde mudanças que você fez localmente
5. Não sabe o que cliente mudou
6. Difícil rastrear problemas
```

### Como Vai Funcionar (DEPOIS do Sistema)

```
✅ SOLUÇÃO:

1. Cliente faz mudanças no app visual
2. Cliente exporta → você baixa ZIP AQUI nesta pasta
3. Você roda: npm run sync:snapshot horizons-export-[id].zip
4. Sistema cria snapshot com timestamp
5. Sistema compara com versão anterior
6. Sistema gera relatório: O QUE MUDOU
7. Você aplica SÓ as mudanças que fazem sentido
8. Mantém controle total do código local
9. Histórico completo no Git
```

---

## 📋 Passo a Passo (Quando Cliente Enviar Atualização)

### Passo 1: Cliente Avisa

💬 **Cliente:** "Oi! Fiz mudanças X, Y, Z no app"

### Passo 2: Cliente Exporta

Cliente faz export do app e envia ZIP (por email, Google Drive, etc)

### Passo 3: Você Baixa Aqui

```bash
# Baixar para ESTA pasta:
# /Users/valdair/Documents/Projetos/William WG/Atualizacao externa/

# Exemplo:
# horizons-export-novo-id.zip
```

### Passo 4: Criar Snapshot

```bash
cd ../sync-manager

# Criar snapshot do novo export:
npm run sync:snapshot "../Atualizacao externa/horizons-export-novo-id.zip"
```

**O que acontece:**
```
📸 Criando snapshot: 2025-10-28_15-30

✅ Extraindo ZIP...
✅ Copiando 118 arquivos...
✅ Criando metadata...
✅ Commitando no Git...
✅ Atualizando symlink latest/

Snapshot criado com sucesso!
```

### Passo 5: Ver O Que Mudou

**Opção A: Usando o Agente (RECOMENDADO!)**

```
No Claude Code:

@app-migration-expert analise o último snapshot e me diga o que mudou
```

**O agente vai:**
- ✅ Ler o diff automaticamente
- ✅ Listar novos componentes
- ✅ Listar componentes modificados
- ✅ Listar componentes deletados
- ✅ Detectar breaking changes
- ✅ Sugerir O QUE aplicar primeiro
- ✅ Gerar comandos prontos pra executar

**Opção B: Manual**

```bash
# Gerar relatório de diff:
npm run sync:diff

# Ler relatório:
cat reports/latest-diff.md
```

### Passo 6: Aplicar Mudanças Seletivamente

**NÃO aplicar tudo de uma vez!**

```bash
# ❌ ERRADO (perigoso):
npm run sync:apply --all

# ✅ CERTO (seguro e controlado):

# 1. Aplicar novos componentes primeiro:
npm run sync:apply --components ProductCard CheckoutButton

# 2. Testar:
cd ../wg-crm
npm run dev
# ✅ Funcionou? Próximo!

# 3. Aplicar componentes modificados (revisar antes):
npm run sync:apply --pages Dashboard

# 4. Testar novamente:
npm run dev
# ✅ Funcionou? Próximo!

# 5. Commitar se tudo OK:
git add .
git commit -m "Sync: Added ProductCard, CheckoutButton, updated Dashboard"
git push
```

---

## 🎯 Exemplo Prático Completo

### Cenário: Cliente Adicionou Carrinho de Compras

```bash
# 1. CLIENTE AVISA
💬 "Oi! Adicionei carrinho e checkout no app"

# 2. CLIENTE EXPORTA E ENVIA
# horizons-export-abc123.zip → você baixa aqui

# 3. VOCÊ CRIA SNAPSHOT
cd ../sync-manager
npm run sync:snapshot "../Atualizacao externa/horizons-export-abc123.zip"

# ✅ Snapshot 2025-10-28_16-00 criado!

# 4. VOCÊ ANALISA COM AGENTE
@app-migration-expert analise o último snapshot

# AGENTE RESPONDE:
# "Detectei:
#  ✅ ShoppingCart.jsx (novo componente)
#  ✅ CheckoutButton.jsx (novo componente)
#  ✅ CartContext.jsx (novo context)
#  🟡 ProductCard.jsx (modificado - adicionou botão +)
#
#  Plano:
#  1. npm run sync:apply --components ShoppingCart CheckoutButton
#  2. npm run sync:apply --contexts CartContext
#  3. Revisar ProductCard.jsx antes de aplicar
#  4. Testar tudo"

# 5. VOCÊ APLICA (seguindo plano do agente)
npm run sync:apply --components ShoppingCart CheckoutButton
npm run sync:apply --contexts CartContext

# 6. REVISA ProductCard manualmente
cat ../sync-manager/snapshots/latest/src/components/ProductCard.jsx
# Parece OK!

npm run sync:apply --components ProductCard

# 7. TESTA
cd ../wg-crm
npm run dev
# ✅ Tudo funcionando!

# 8. COMMITA
git add .
git commit -m "feat: Add shopping cart and checkout"
git push

# 9. AVISA CLIENTE
💬 "Carrinho aplicado! Testei e está funcionando ✅"

# ⏱️ Tempo total: ~12 minutos
# (vs 2-3 horas fazendo manual)
```

---

## 📁 Organização de Arquivos

### Esta Pasta (`Atualizacao externa/`)

```
Atualizacao externa/
├── README.md (este arquivo)
├── horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip (atual)
├── horizons-export-abc123.zip (próximo)
├── horizons-export-def456.zip (futuro)
└── ... (histórico de exports recebidos)
```

**Mantenha todos os ZIPs aqui!**
- Histórico de exports recebidos do cliente
- Facilita consultar versões antigas se necessário

### Pasta de Snapshots (`../sync-manager/snapshots/`)

```
sync-manager/snapshots/
├── 2025-10-28_14-30/ (primeiro snapshot - este!)
│   ├── src/
│   ├── supabase/
│   ├── package.json
│   └── _snapshot-metadata.json
├── 2025-10-29_10-00/ (segundo snapshot)
├── 2025-10-30_15-30/ (terceiro snapshot)
└── latest/ → symlink para mais recente
```

**Versionados no Git!**
- Histórico completo de mudanças
- Pode voltar a qualquer versão
- Comparar qualquer snapshot com outro

---

## 🚨 Regras Importantes

### ✅ SEMPRE FAZER

1. **Criar snapshot ANTES de aplicar mudanças**
   ```bash
   npm run sync:snapshot "../Atualizacao externa/novo-export.zip"
   ```

2. **Usar o agente para análise**
   ```
   @app-migration-expert analise o último snapshot
   ```

3. **Aplicar mudanças incrementalmente**
   - Aplicar 1-2 componentes por vez
   - Testar depois de cada aplicação
   - Commitar se funcionar

4. **Fazer backup antes de aplicar**
   ```bash
   cd ../wg-crm
   git checkout -b sync-backup-$(date +%Y%m%d)
   ```

### ❌ NUNCA FAZER

1. **NUNCA aplicar --all sem revisar**
   ```bash
   # ❌ PERIGO!
   npm run sync:apply --all
   ```

2. **NUNCA sobrescrever código local diretamente**
   - Use o sistema de snapshots
   - Mantenha controle

3. **NUNCA deletar snapshots antigos**
   - São seu histórico
   - Ocupam pouco espaço
   - Podem ser úteis

4. **NUNCA pular testes**
   - Sempre testar após aplicar
   - Sempre verificar console

---

## 🛠️ Setup Inicial (Primeira Vez)

Se ainda não instalou o sync-manager:

```bash
# 1. Ir para sync-manager
cd ../sync-manager

# 2. Instalar dependências
npm install

# 3. Configurar
cp config/sync-config.example.json config/sync-config.json
code config/sync-config.json
# (Adicionar credenciais do Supabase antigo se necessário)

# 4. Criar primeiro snapshot (do export atual)
npm run sync:snapshot "../Atualizacao externa/horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip"

# ✅ Pronto! Sistema configurado
```

---

## 📊 Estatísticas do App Atual

Baseado no export `horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip`:

| Categoria | Quantidade |
|-----------|------------|
| 📦 Componentes React (.jsx) | 118 arquivos |
| 🚀 Edge Functions | 7 funções |
| 🎨 UI Components | ~25 (Radix UI) |
| 🔄 Contexts | 2 (Auth, Financial) |
| 📄 Páginas | ~15 |
| 🎯 Features principais | 8 módulos |
| 📦 Dependências | 50+ pacotes |

---

## 🔗 Links Úteis

- **Documentação Completa:** `/MIGRATION_STRATEGY.md`
- **Guia Rápido:** `/QUICKSTART.md`
- **Manual do Sync Manager:** `/sync-manager/README.md`

---

## 🆘 Ajuda Rápida

### Problema: "Cliente enviou export mas não sei o que mudou"

```
@app-migration-expert analise o último snapshot e me explique o que mudou
```

### Problema: "Apliquei mudança e quebrou tudo"

```bash
cd ../wg-crm
git log --oneline  # Ver commits
git reset --hard [hash-do-backup]  # Voltar
```

### Problema: "Quero ver código antigo"

```bash
cd ../sync-manager
cat snapshots/2025-10-28_14-30/src/components/ProductCard.jsx
```

### Problema: "Não sei se devo aplicar mudança X"

```
@app-migration-expert devo aplicar mudança em [nome do arquivo]? Por quê?
```

---

## 💡 Dicas Pro

### Dica 1: Sincronize Semanalmente
- Toda segunda-feira, pedir export atualizado
- Evita acúmulo de mudanças

### Dica 2: Documente Cada Sync
```bash
echo "## Sync $(date)" >> SYNC_LOG.md
echo "- Cliente mudou: X, Y, Z" >> SYNC_LOG.md
echo "- Aplicado: A, B" >> SYNC_LOG.md
echo "- Testes: ✅ OK" >> SYNC_LOG.md
```

### Dica 3: Comunique com Cliente
```
Cliente muda → Avisa você → Exporta → Você sincroniza → Avisa que aplicou
```

### Dica 4: Use Branches para Syncs Grandes
```bash
git checkout -b sync-2025-10-28
# Aplicar mudanças
# Testar muito
git checkout main
git merge sync-2025-10-28
```

---

## 📞 Precisa de Ajuda?

**Use os agentes especializados:**

- `@app-migration-expert` - Para sincronização e análise
- `@supabase-mcp-expert` - Para operações Supabase
- `@doc-research-expert` - Para pesquisar documentação

**Comandos mais usados:**

```bash
# Ver último diff
cat ../sync-manager/reports/latest-diff.md

# Listar snapshots
ls -la ../sync-manager/snapshots/

# Ver comandos disponíveis
cd ../sync-manager
npm run
```

---

## 🎉 Resumo

**Antes:** Cliente envia → Você substitui tudo → 😫 Trabalho manual de 2-3 horas

**Depois:** Cliente envia → Snapshot → Diff → Agente analisa → Você aplica seletivo → ✅ 10-15 minutos

**Ganho:** 85-90% de redução de tempo + Controle total + Histórico completo!

---

**Última atualização:** 28 Out 2025
**Export atual:** `horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip` (28 Out 2025)
**Snapshots criados:** 0 (criar primeiro agora!)

---

🚀 **Pronto para começar? Rode:**

```bash
cd ../sync-manager
npm install
npm run sync:snapshot "../Atualizacao externa/horizons-export-480e77e6-d3aa-4ba8-aa6c-70d9820f550f.zip"
```
