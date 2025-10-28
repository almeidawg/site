# 🔄 Workflow de Sincronização - Sync Manager

## Comandos Essenciais

### Criar Snapshot
```bash
cd sync-manager
npm run sync:snapshot /path/to/export.zip
```

### Comparar Snapshots
```bash
npm run sync:diff
cat reports/latest-diff.md
```

### Analisar com Agente
```
@app-migration-expert analise o último snapshot
```

### Aplicar Mudanças
```bash
# Componentes específicos
npm run sync:apply --components ProductCard CheckoutButton

# Páginas
npm run sync:apply --pages Dashboard

# Dry-run (simular sem aplicar)
npm run sync:apply --components ProductCard --dry-run
```

### Migração de Dados Supabase
```bash
# Analisar tabela
npm run migrate:analyze --table users

# Migrar
npm run migrate:table users --batch-size 100

# Migrar storage
npm run migrate:storage --bucket avatars

# Verificar
npm run migrate:verify users
```

---

## Workflow Completo

**1. Cliente envia export** → Salvar em `Atualizacao externa/`

**2. Criar snapshot:**
```bash
cd sync-manager
npm run sync:snapshot "../Atualizacao externa/export.zip"
```

**3. Analisar mudanças:**
```
@app-migration-expert analise o último snapshot e sugira o que aplicar
```

**4. Seguir plano do agente** → Agente retorna comandos prontos

**5. Testar:**
```bash
cd ../wg-crm
npm run dev
```

**6. Só commitar se testado e funcionando** ✅

---

## Estrutura de Snapshots

```
sync-manager/
├── snapshots/
│   ├── 2025-10-28_14-55/     # Snapshot com timestamp
│   ├── 2025-10-29_10-30/
│   └── latest/               # Symlink para último
├── reports/
│   └── latest-diff.md        # Relatório de mudanças
└── scripts/
    ├── snapshot.js
    ├── diff.js
    ├── analyze.js
    └── apply.js
```

---

## Atalhos Rápidos

```bash
# Ver snapshots disponíveis
ls -la sync-manager/snapshots/

# Ver último diff
cat sync-manager/reports/latest-diff.md

# Buscar arquivo em snapshot
find sync-manager/snapshots/latest -name "ProductCard*"

# Ver mudanças específicas
git diff sync-manager/snapshots/[old]/Dashboard.jsx sync-manager/snapshots/[new]/Dashboard.jsx
```

---

## Rollback (se algo der errado)

```bash
cd wg-crm
git log --oneline
git reset --hard [commit-antes-do-sync]
npm run dev  # Verificar se voltou
```

---

## Regras Importantes

1. **NUNCA** aplicar tudo de uma vez (`--all`)
2. **SEMPRE** usar agente para analisar primeiro
3. **SEMPRE** testar antes de commitar
4. **NUNCA** commitar código quebrado
5. **Incremental** → Aplicar componente por componente
