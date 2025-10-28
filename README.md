# WG - Sistema de CRM

Sistema de CRM desenvolvido em React + Vite + Supabase.

---

## 🚀 Como Rodar

```bash
cd wg-crm
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📂 Estrutura

```
wg/
├── wg-crm/              # App React principal
├── sync-manager/        # Sistema de sincronização com cliente
├── Supabase/            # SQL Functions, migrations, snippets
│   ├── backup/          # Funções salvas localmente
│   ├── migrations/      # Migrations do banco
│   └── snippets/        # Templates SQL reutilizáveis
└── Atualizacao externa/ # Exports do cliente (low-code platform)
```

---

## 🤖 Agentes Claude Code

Use os agentes especializados:

- **`@supabase-mcp-expert`** - Operações Supabase (seguindo filosofia SQL-first)
- **`@app-migration-expert`** - Analisar exports do cliente e sincronizar mudanças
- **`@doc-research-expert`** - Pesquisar documentação atualizada

---

## 🔄 Workflow de Sincronização

Cliente faz mudanças no app low-code → Exporta código → Você sincroniza

**Ver workflow completo:** `.claude/docs/sync-workflow.md`

---

## 🗄️ Supabase

**Projeto:** vyxscnevgeubfgfstmtf
**URL:** https://vyxscnevgeubfgfstmtf.supabase.co
**Credenciais:** `.env.local` (não versionado)

---

## 📖 Filosofia de Desenvolvimento

- **SQL First:** 90% do backend em funções SQL
- **DROP antes de CREATE:** Zero funções duplicadas
- **JSONB > Tabelas:** Consolidar dados quando possível
- **Salvar localmente:** Código em `/Supabase/backup/` antes de executar
- **Pensar antes de agir:** Analisar melhor abordagem sempre

Ver detalhes nos agentes: `.claude/agents/supabase-mcp-expert.md`

---

## 🔗 Links

- **Repositório:** https://github.com/BVStecnologia/WG
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf
