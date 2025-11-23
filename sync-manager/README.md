# 🔄 Sync Manager - Sistema de Sincronização de Apps Low-Code

Sistema completo para sincronizar mudanças de apps desenvolvidos em plataformas low-code com versão React local.

## 📂 Estrutura

```
sync-manager/
├── snapshots/              ← Histórico de exports
├── config/                 ← Configurações
├── scripts/                ← Scripts de automação
├── reports/                ← Relatórios gerados
└── README.md
```

## 🚀 Comandos Principais

### Criar Snapshot
```bash
npm run sync:snapshot /path/to/export.zip
```

### Comparar Mudanças
```bash
npm run sync:diff
```

### Aplicar Mudanças
```bash
npm run sync:apply --components ProductCard
```

Documentação completa em `/MIGRATION_STRATEGY.md`
