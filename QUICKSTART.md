# 🚀 Guia de Início Rápido - Sincronização de App Low-Code

**Objetivo:** Sincronizar mudanças do app do cliente (desenvolvido em FlutterFlow/Bubble/etc) com sua versão React local, de forma segura e organizada.

---

## ⚡ Setup Inicial (5 minutos)

### 1. Instalar Dependências do Sync Manager

```bash
cd sync-manager
npm install
```

### 2. Configurar Credenciais

```bash
# Copiar arquivo de exemplo
cp config/sync-config.example.json config/sync-config.json

# Editar com suas credenciais
code config/sync-config.json
```

**O que configurar:**
- `supabase.old.url` → URL do Supabase do cliente
- `supabase.old.serviceRoleKey` → Service role key do Supabase antigo
- `supabase.new.*` → Suas credenciais do novo Supabase (já configuradas no .env.local)

### 3. Primeiro Snapshot

```bash
# Cliente enviou export.zip?
npm run sync:snapshot ~/Downloads/app-export.zip

# OU se já extraiu:
npm run sync:snapshot ~/Downloads/app-extracted-folder
```

**Pronto!** Sistema configurado ✅

---

## 🔄 Workflow Diário (quando cliente faz mudanças)

### Passo 1: Cliente Avisa que Fez Mudanças

💬 Cliente: "Oi! Fiz alterações no produto, adicionei checkout e modifiquei o dashboard"

### Passo 2: Cliente Exporta e Envia

Cliente faz export do app e manda ZIP para você (Google Drive, email, etc)

### Passo 3: Você Cria Snapshot

```bash
cd sync-manager

# Baixou export.zip? Crie snapshot:
npm run sync:snapshot ~/Downloads/app-export-novo.zip
```

**Output esperado:**
```
📸 Criando snapshot: 2025-01-28_15-30
✅ Arquivos copiados
✅ Snapshot criado com sucesso!
```

### Passo 4: Ver O Que Mudou

```bash
# Gerar diff automaticamente:
npm run sync:diff
```

**Output esperado:**
```
📊 Resumo:
  ✅ Novos:        5 arquivos
  ❌ Deletados:    1 arquivo
  ✏️  Modificados:  3 arquivos

📄 Relatório salvo em: reports/latest-diff.md
```

### Passo 5: Analisar com Agente (Recomendado!)

Ao invés de ler diff manualmente, use o agente especializado:

```
@app-migration-expert analise o último snapshot e sugira o que aplicar
```

**O agente vai:**
- ✅ Ler o diff automaticamente
- ✅ Categorizar mudanças (seguras, revisar, alto risco)
- ✅ Gerar plano de aplicação passo-a-passo
- ✅ Fornecer comandos prontos para executar
- ✅ Alertar sobre breaking changes

**Exemplo de resposta do agente:**
```markdown
## 📊 Análise do Último Snapshot

✅ MUDANÇAS SEGURAS (aplicar):
1. ProductCard.jsx - Novo componente
2. CheckoutButton.jsx - Novo componente

Comando:
npm run sync:apply --components ProductCard CheckoutButton

🟡 PARA REVISAR:
1. Dashboard.jsx - 45 linhas alteradas

🔴 ALTO RISCO:
(nenhum)

📋 PLANO:
1. Aplicar componentes novos
2. Revisar Dashboard
3. Testar
4. Commitar
```

### Passo 6: Aplicar Mudanças (Seguindo Plano do Agente)

```bash
# 1. Aplicar mudanças seguras primeiro
npm run sync:apply --components ProductCard CheckoutButton

# 2. Revisar mudanças em Dashboard manualmente
cat sync-manager/snapshots/latest/Dashboard.jsx
# Comparar com local e decidir

# 3. Aplicar Dashboard se OK
npm run sync:apply --pages Dashboard
```

### Passo 7: Testar Localmente

```bash
cd ../wg-crm
npm run dev
```

**Checklist de testes:**
- [ ] App inicia sem erros?
- [ ] Novos componentes aparecem?
- [ ] Funcionalidades antigas ainda funcionam?
- [ ] Console sem erros?

### Passo 8: Commitar Se Tudo OK

```bash
git add .
git commit -m "Sync: Added ProductCard, CheckoutButton, updated Dashboard"
git push
```

**✅ Sincronização completa!**

---

## 📊 Comandos Mais Usados

| Comando | O Que Faz | Quando Usar |
|---------|-----------|-------------|
| `npm run sync:snapshot /path/to/export.zip` | Cria snapshot de export | Cliente enviou novo export |
| `npm run sync:diff` | Compara snapshots | Ver o que mudou |
| `@app-migration-expert analise o último snapshot` | Análise inteligente | Sempre! Facilita tudo |
| `npm run sync:apply --components Nome` | Aplica componente específico | Aplicar mudanças |
| `cat reports/latest-diff.md` | Ver relatório completo | Análise manual |

---

## 🆘 Troubleshooting Rápido

### "Erro ao criar snapshot - ZIP corrompido"
```bash
# Tente extrair manualmente primeiro:
unzip ~/Downloads/export.zip -d ~/Downloads/extracted
npm run sync:snapshot ~/Downloads/extracted
```

### "Muitas mudanças, não sei por onde começar"
```
# Use o agente!
@app-migration-expert analise o último snapshot e crie plano detalhado
```

### "Apliquei mudança e quebrou tudo"
```bash
# Rollback rápido:
cd ../wg-crm
git log --oneline  # Encontrar último commit bom
git reset --hard [commit-hash]
npm run dev  # Testar se voltou a funcionar
```

### "Cliente faz mudanças todo dia, muito trabalho"
```bash
# Configure automação (Fase 2):
# 1. Script roda todo dia às 18h
# 2. Baixa export do Google Drive automaticamente
# 3. Cria snapshot
# 4. Gera diff
# 5. Envia notificação com resumo
```

---

## 🎯 Dicas Pro

### Dica 1: Use Branches Para Syncs Grandes
```bash
cd ../wg-crm
git checkout -b sync-2025-01-28
# Aplicar mudanças
# Testar tudo
git checkout main
git merge sync-2025-01-28
```

### Dica 2: Sincronize Semanalmente (Mínimo)
- Toda segunda-feira, baixe export mais recente
- Evita acúmulo de mudanças difíceis de rastrear

### Dica 3: Documente Cada Sync
```bash
# Criar log:
echo "## Sync $(date)" >> SYNC_LOG.md
echo "- Aplicado: X, Y, Z" >> SYNC_LOG.md
echo "- Problemas: nenhum" >> SYNC_LOG.md
```

### Dica 4: Comunique com Cliente
```
Cliente faz mudança → Avisa você → Exporta → Você sincroniza → Avisa cliente que aplicou
```

---

## 🚀 Próximos Passos

Depois de dominar o básico:

1. **Migração de Dados Supabase**
   ```bash
   npm run migrate:analyze
   npm run migrate:table users
   ```

2. **Automação de Syncs**
   - Scripts agendados
   - Notificações automáticas
   - CI/CD integration

3. **Análise Avançada**
   - AST parsing de componentes
   - Detecção de dependências
   - Breaking changes automático

---

## 📚 Recursos

- **Documentação Completa:** `MIGRATION_STRATEGY.md`
- **README do Sync Manager:** `sync-manager/README.md`
- **Agentes Disponíveis:**
  - `@app-migration-expert` - Análise e sincronização
  - `@supabase-mcp-expert` - Operações Supabase
  - `@doc-research-expert` - Pesquisa de docs

---

## 💡 Exemplo Completo (Do Início ao Fim)

```bash
# 1. CLIENTE AVISA: "Fiz mudanças X, Y, Z"

# 2. CLIENTE ENVIA: export-2025-01-28.zip

# 3. VOCÊ CRIA SNAPSHOT:
cd sync-manager
npm run sync:snapshot ~/Downloads/export-2025-01-28.zip

# 4. VOCÊ ANALISA (com agente):
# No Claude Code:
@app-migration-expert analise o último snapshot

# 5. AGENTE RESPONDE:
# "Encontrei 3 novos componentes seguros.
#  Comando: npm run sync:apply --components A B C"

# 6. VOCÊ APLICA:
npm run sync:apply --components A B C

# 7. VOCÊ TESTA:
cd ../wg-crm
npm run dev
# ✅ Tudo funcionando!

# 8. VOCÊ COMMITA:
git add .
git commit -m "Sync: Added A, B, C from client"
git push

# 9. VOCÊ AVISA CLIENTE:
# "Aplicado! Features X, Y, Z agora estão na versão local também"

# ✅ DONE!
```

---

**Tempo total do processo: ~10-15 minutos** (vs 2-3 horas fazendo manualmente)

**Pronto para começar?** 🚀

1. Instale dependências: `cd sync-manager && npm install`
2. Configure: `cp config/sync-config.example.json config/sync-config.json`
3. Peça pro cliente enviar export
4. Crie primeiro snapshot: `npm run sync:snapshot /path/to/export.zip`
5. Use o agente: `@app-migration-expert`

**Boa sincronização!** 🎉
