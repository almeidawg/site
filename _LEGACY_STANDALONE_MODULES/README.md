# 📦 Módulos Standalone Descontinuados

**Data de Descontinuação**: 2025-11-25

---

## ⚠️ IMPORTANTE: NÃO USE ESTES MÓDULOS

Estes módulos foram criados como **projetos Vite standalone** separados, mas foram **INTEGRADOS** no projeto principal `wg-crm/src/modules/`.

**Status**: ❌ Descontinuados e não utilizados pelo frontend principal

---

## 📁 Módulos Arquivados

### 1. `05finance/` - Módulo Financeiro Standalone

**Conteúdo**:
- Dashboard financeiro
- Lançamentos
- Cobranças
- Comissionamento
- Solicitações
- Reembolsos
- Relatórios
- Price List

**Substituído por**: `wg-crm/src/modules/financeiro/`

**Motivo da descontinuação**: Duplicação completa de código com módulo integrado

---

### 2. `06cronograma/` - Módulo Cronograma Standalone

**Conteúdo**:
- Projetos
- Tarefas (Gantt)
- Catálogo de itens
- Equipes
- Dashboard

**Substituído por**: `wg-crm/src/modules/cronograma/`

**Motivo da descontinuação**: Duplicação completa de código com módulo integrado

---

## 🎯 O QUE USAR AGORA

### ✅ Use os Módulos Integrados:

```
wg-crm/
└── src/
    └── modules/
        ├── financeiro/        ← USE ESTE!
        │   ├── pages/
        │   ├── components/
        │   ├── hooks/
        │   └── services/
        └── cronograma/        ← USE ESTE!
            ├── pages/
            ├── components/
            └── hooks/
```

### ❌ NÃO use estes standalone:

```
_LEGACY_STANDALONE_MODULES/
├── 05finance/                 ← NÃO USE!
└── 06cronograma/              ← NÃO USE!
```

---

## 📊 Estatísticas de Duplicação

| Módulo | Arquivos Standalone | Arquivos Integrados | Duplicação |
|--------|---------------------|---------------------|------------|
| Financeiro | 59 | ~30 | ~50% |
| Cronograma | 84 | ~40 | ~50% |
| **TOTAL** | **143** | **~70** | **~50%** |

**Redução de código**: ~73 arquivos duplicados eliminados

---

## 🗄️ Histórico

### Quando foram criados?
Esses módulos foram criados como **protótipos standalone** para desenvolvimento isolado.

### Por que foram descontinuados?
1. **Duplicação de código** (mesmas páginas, hooks, componentes)
2. **Dificulta manutenção** (mudança precisa ser feita 2x)
3. **Inconsistência** (versões standalone divergiram do integrado)
4. **Módulos integrados já funcionam** perfeitamente no `wg-crm/`

### Quando foram descontinuados?
**2025-11-25** - Após auditoria completa de estrutura de módulos

---

## 🔄 Se Precisar Recuperar Código

Se por algum motivo precisar consultar o código original standalone:

1. **Navegue até este diretório**: `_LEGACY_STANDALONE_MODULES/`
2. **Escolha o módulo**: `05finance/` ou `06cronograma/`
3. **Compare com integrado**: `wg-crm/src/modules/financeiro/` ou `cronograma/`
4. **Copie apenas o necessário** (evite duplicação)

---

## ⚠️ Não Delete Esta Pasta

Mantenha esta pasta como **backup histórico** por pelo menos 6 meses após a descontinuação.

**Após 6 meses** (2025-05-25), se nenhum problema surgir, pode deletar com segurança.

---

## 📚 Documentação Relacionada

- `AUDITORIA_ESTRUTURA_MODULOS.md` - Relatório completo de auditoria
- `CORRECAO_BUG_PRODUTOS_SERVICOS_NAN.md` - Correção de bug encontrado durante auditoria

---

**Última Atualização**: 2025-11-25

**Responsável**: Claude Code + Equipe WGEasy
