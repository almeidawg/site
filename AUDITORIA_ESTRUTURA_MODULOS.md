# 🔍 AUDITORIA COMPLETA - Estrutura de Módulos WGEasy

**Data**: 2025-11-25
**Objetivo**: Identificar arquivos duplicados, legados e mortos entre os módulos do sistema

---

## 📊 RESUMO EXECUTIVO

### Estrutura Encontrada

```
WGEasy Sistema/
├── 02sistemawgeasy/          ❌ VAZIA (0 arquivos)
├── 03wgeasyfrontend/         ✅ App React TS - Portal Cliente/Obra (37 arquivos)
├── 05finance/                ✅ Módulo Financeiro Standalone (59 arquivos)
├── 06cronograma/             ✅ Módulo Cronograma Standalone (84 arquivos)
├── wg-crm/                   ✅ Projeto PRINCIPAL (200+ arquivos)
│   └── src/modules/
│       ├── cronograma/       ⚠️ DUPLICADO com 06cronograma/
│       └── financeiro/       ⚠️ DUPLICADO com 05finance/
└── src/                      ⚠️ Estrutura paralela ao wg-crm/
```

---

## 🚨 DESCOBERTAS CRÍTICAS

### 1. **02sistemawgeasy/** - PASTA VAZIA ✅

**Status**: Pode ser DELETADA sem risco

```
02sistemawgeasy/
(vazia - 0 arquivos)
```

**Ação**: Deletar esta pasta

---

### 2. **Duplicação COMPLETA de Módulos** ⚠️

#### CRONOGRAMA - 3 VERSÕES DO MESMO CÓDIGO

**Versão 1**: `06cronograma/` (Standalone - 84 arquivos)
```
06cronograma/
├── src/
│   ├── pages/
│   │   ├── Projects.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Catalog.jsx
│   │   ├── Teams.jsx
│   │   ├── AuthPage.jsx
│   │   └── CronoProjetoTarefasPage.tsx
│   ├── hooks/
│   │   ├── useCatalog.js
│   │   ├── useEntities.js
│   │   ├── useProjects.js
│   │   └── useTeams.js
│   └── components/
│       ├── ProjectItems.jsx
│       ├── ProjectTeam.jsx
│       ├── ScheduleView.jsx
│       ├── PdfExport.jsx
│       └── ui/ (14 componentes)
```

**Versão 2**: `wg-crm/src/modules/cronograma/` (Integrado - ~40 arquivos)
```
wg-crm/src/modules/cronograma/
├── pages/
│   ├── Projects.jsx          ← DUPLICADO
│   ├── ProjectDetail.jsx     ← DUPLICADO
│   ├── Dashboard.jsx         ← DUPLICADO
│   ├── Catalog.jsx           ← DUPLICADO
│   ├── Teams.jsx             ← DUPLICADO
│   └── CronoProjetoTarefasPage.tsx  ← DUPLICADO
├── hooks/
│   ├── useCatalog.js         ← DUPLICADO
│   ├── useEntities.js        ← DUPLICADO
│   ├── useProjects.js        ← DUPLICADO
│   └── useTeams.js           ← DUPLICADO
└── components/               ← DUPLICADOS
```

**Versão 3**: `src/components/cronograma/` (Parcial - 4 componentes)
```
src/components/cronograma/
├── GanttChart.jsx
├── GanttCommentDialog.jsx
├── GanttTaskDialog.jsx
└── TeamBuilder.jsx
```

---

#### FINANCEIRO - 3 VERSÕES DO MESMO CÓDIGO

**Versão 1**: `05finance/` (Standalone - 59 arquivos)
```
05finance/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Lancamentos.jsx
│   │   ├── Obras.jsx
│   │   ├── Cobrancas.jsx
│   │   ├── Comissionamento.jsx
│   │   ├── PriceList.jsx
│   │   ├── Reembolsos.jsx
│   │   ├── Relatorios.jsx
│   │   └── Solicitacoes.jsx
│   └── components/ui/ (12 componentes)
```

**Versão 2**: `wg-crm/src/modules/financeiro/` (Integrado - ~20 arquivos)
```
wg-crm/src/modules/financeiro/
├── pages/
│   ├── Dashboard.jsx         ← DUPLICADO
│   ├── Lancamentos.jsx       ← DUPLICADO
│   ├── Obras.jsx             ← DUPLICADO
│   ├── Cobrancas.jsx         ← DUPLICADO
│   ├── Comissionamento.jsx   ← DUPLICADO
│   ├── PriceList.jsx         ← DUPLICADO ⚠️ CONTÉM O BUG DO NaN!
│   ├── Reembolsos.jsx        ← DUPLICADO
│   ├── Relatorios.jsx        ← DUPLICADO
│   └── Solicitacoes.jsx      ← DUPLICADO
└── components/ui/            ← DUPLICADOS
```

**Versão 3**: `src/components/financeiro/` (Parcial - 4 componentes)
```
src/components/financeiro/
├── Financeiro.jsx
├── NovoLancamentoDialog.jsx
├── RelatorioFinanceiroDialog.jsx
└── AlertasPagamentoPopup.jsx
```

---

### 3. **Portal Cliente (03wgeasyfrontend/)** - ISOLADO ✅

**Status**: ÚNICO, sem duplicação

```
03wgeasyfrontend/
├── src/
│   ├── pages/
│   │   └── ClienteObraPage.tsx
│   ├── components/
│   │   ├── ClienteTabs.tsx
│   │   ├── ClienteObraVisaoGeral.tsx
│   │   ├── ClienteObraProjeto.tsx
│   │   ├── ClienteObraEngenharia.tsx
│   │   ├── ClienteObraMarcenaria.tsx
│   │   ├── ClienteObraDocumentos.tsx
│   │   ├── ClienteObraFotosFinais.tsx
│   │   └── DiarioObraCarousel.tsx
│   └── hooks/
│       ├── useClienteObra.ts
│       └── useDiarioObra.ts
```

**Ação**: MANTER como está (não duplicado)

---

## 🗂️ ANÁLISE DETALHADA POR CATEGORIA

### A) Componentes UI Duplicados (shadcn/ui)

**Quantidade de Cópias**: 3-4 versões da mesma lib

```
✅ wg-crm/src/components/ui/          (PRINCIPAL - 28 componentes)
⚠️ 05finance/src/components/ui/       (12 componentes duplicados)
⚠️ 06cronograma/src/components/ui/    (14 componentes duplicados)
⚠️ wg-crm/src/modules/cronograma/components/ui/  (14 componentes duplicados)
⚠️ wg-crm/src/modules/financeiro/components/ui/  (10 componentes duplicados)
```

**Componentes duplicados**:
- alert-dialog.jsx (5 cópias)
- button.jsx (5 cópias)
- dialog.jsx (5 cópias)
- input.jsx (5 cópias)
- label.jsx (5 cópias)
- select.jsx (5 cópias)
- tabs.jsx (5 cópias)
- toast.jsx / toaster.jsx / use-toast.js (5 cópias)

**Impacto**: ~80 arquivos duplicados só de UI

---

### B) Hooks Duplicados

#### Cronograma:
```
06cronograma/src/hooks/
├── useCatalog.js         ← DUPLICADO
├── useEntities.js        ← DUPLICADO
├── useProjects.js        ← DUPLICADO
└── useTeams.js           ← DUPLICADO

wg-crm/src/modules/cronograma/hooks/
├── useCatalog.js         ← DUPLICADO
├── useEntities.js        ← DUPLICADO
├── useProjects.js        ← DUPLICADO
└── useTeams.js           ← DUPLICADO
```

#### Contextos de Auth:
```
05finance/src/contexts/SupabaseAuthContext.jsx
06cronograma/src/contexts/SupabaseAuthContext.jsx
wg-crm/src/contexts/SupabaseAuthContext.jsx
```

**Impacto**: 3 versões do mesmo contexto de autenticação

---

### C) Arquivos de Configuração Duplicados

```
✅ wg-crm/vite.config.js                    (PRINCIPAL)
⚠️ 05finance/vite.config.js                 (cópia standalone)
⚠️ 06cronograma/vite.config.js              (cópia standalone)
⚠️ 03wgeasyfrontend/vite.config.ts          (portal cliente)

✅ wg-crm/tailwind.config.js                (PRINCIPAL)
⚠️ 05finance/tailwind.config.js             (duplicado)
⚠️ 06cronograma/tailwind.config.js          (duplicado)

✅ wg-crm/package.json                      (PRINCIPAL)
⚠️ 05finance/package.json                   (standalone)
⚠️ 06cronograma/package.json                (standalone)
⚠️ 03wgeasyfrontend/package.json            (portal)
```

---

### D) Plugins Vite Duplicados

**Encontrados em**:
```
05finance/plugins/
├── visual-editor/
│   ├── edit-mode-script.js
│   ├── vite-plugin-edit-mode.js
│   └── vite-plugin-react-inline-editor.js
├── selection-mode/
│   ├── selection-mode-script.js
│   └── vite-plugin-selection-mode.js
└── vite-plugin-iframe-route-restoration.js

06cronograma/plugins/
├── visual-editor/              ← DUPLICADO
├── selection-mode/             ← DUPLICADO
└── vite-plugin-iframe-route-restoration.js  ← DUPLICADO
```

**Impacto**: 14 arquivos de plugins duplicados

---

## 📈 ESTATÍSTICAS DE DUPLICAÇÃO

| Categoria | Arquivos Únicos | Duplicações | Total Arquivos | % Duplicado |
|-----------|-----------------|-------------|----------------|-------------|
| Componentes UI | 28 | 52 | 80 | 65% |
| Páginas (Finance) | 10 | 10 | 20 | 50% |
| Páginas (Cronograma) | 7 | 7 | 14 | 50% |
| Hooks | 8 | 8 | 16 | 50% |
| Plugins Vite | 7 | 7 | 14 | 50% |
| Contextos | 1 | 2 | 3 | 67% |
| **TOTAL ESTIMADO** | **~60** | **~90** | **~150** | **60%** |

---

## 🎯 MAPA DE DEPENDÊNCIAS

### Qual módulo o Frontend Principal (`wg-crm/src`) USA?

**Verificação via imports**:

1. **Cronograma**:
   - ✅ USA: `wg-crm/src/modules/cronograma/*`
   - ❌ NÃO USA: `06cronograma/*` (standalone)

2. **Financeiro**:
   - ✅ USA: `wg-crm/src/modules/financeiro/*`
   - ⚠️ **BUG IDENTIFICADO**: `PriceList.jsx` (NaN de valores)
   - ❌ NÃO USA: `05finance/*` (standalone)

3. **Portal Cliente**:
   - ✅ USA: `03wgeasyfrontend/*` (isolado - OK)

---

## 🗑️ ARQUIVOS MORTOS (Zero Referências)

### 1. Projetos Standalone (05finance/, 06cronograma/)

**Status**: 100% MORTOS no contexto do WGEasy principal

**Motivo**: O `wg-crm/` já tem esses módulos integrados em `src/modules/`

**Quantidade**: ~140 arquivos

**Ação Recomendada**:
- ⚠️ **NÃO DELETAR AINDA** - podem ser backups ou versões antigas valiosas
- ✅ Movê-los para pasta `_LEGACY/` ou `_STANDALONE_MODULES/`
- ✅ Adicionar README.md explicando que são versões standalone descontinuadas

---

### 2. Pasta Vazia (02sistemawgeasy/)

**Status**: 100% MORTA

**Ação**: Deletar imediatamente

---

## ✅ PLANO DE REORGANIZAÇÃO

### FASE 1: Limpeza Imediata (Sem Risco)

```bash
# 1. Deletar pasta vazia
rm -rf 02sistemawgeasy/

# 2. Mover projetos standalone para legacy
mkdir -p _LEGACY_STANDALONE_MODULES/
mv 05finance/ _LEGACY_STANDALONE_MODULES/
mv 06cronograma/ _LEGACY_STANDALONE_MODULES/

# 3. Criar README.md de aviso
cat > _LEGACY_STANDALONE_MODULES/README.md << 'EOF'
# Módulos Standalone Descontinuados

Estes módulos foram criados como projetos separados (Vite standalone)
mas foram INTEGRADOS no projeto principal `wg-crm/src/modules/`.

**Status**: Não são mais usados pelo frontend principal.

**Ações**:
- ✅ Mantenha como backup histórico
- ✅ Use apenas `wg-crm/src/modules/cronograma` e `wg-crm/src/modules/financeiro`
- ❌ NÃO desenvolva nestes módulos standalone

**Data de descontinuação**: 2025-11-25
EOF
```

---

### FASE 2: Consolidação de UI Components (Médio Risco)

**Objetivo**: Ter APENAS 1 versão de cada componente shadcn/ui

**Estratégia**:

1. Definir `wg-crm/src/components/ui/` como ÚNICA fonte de verdade
2. Deletar `wg-crm/src/modules/*/components/ui/`
3. Atualizar imports nos módulos:

```javascript
// ❌ ANTES (cada módulo tem sua cópia)
import { Button } from '@/modules/financeiro/components/ui/button'

// ✅ DEPOIS (usar UI global)
import { Button } from '@/components/ui/button'
```

**Script de migração**:
```bash
# Deletar UIs duplicadas
rm -rf wg-crm/src/modules/cronograma/components/ui/
rm -rf wg-crm/src/modules/financeiro/components/ui/

# Atualizar imports (regex find/replace no VS Code)
# Procurar: @/modules/(financeiro|cronograma)/components/ui/
# Substituir: @/components/ui/
```

**Ganho**: -60 arquivos duplicados

---

### FASE 3: Consolidação de Hooks e Contextos (Alto Risco)

**Ação**: Mover hooks específicos para pasta compartilhada

```
wg-crm/src/
├── hooks/                      ← CRIAR
│   ├── cronograma/
│   │   ├── useCatalog.js
│   │   ├── useEntities.js
│   │   ├── useProjects.js
│   │   └── useTeams.js
│   └── financeiro/
│       └── (hooks específicos)
└── modules/
    ├── cronograma/
    │   ├── pages/              ← Apenas páginas
    │   └── components/         ← Apenas componentes visuais
    └── financeiro/
        ├── pages/
        └── components/
```

**Ganho**: -16 arquivos duplicados

---

### FASE 4: Auditoria Final

Após reorganização:

```
WGEasy Sistema/
├── _LEGACY_STANDALONE_MODULES/    ← Backup (não usado)
│   ├── 05finance/
│   └── 06cronograma/
├── 03wgeasyfrontend/              ← Portal Cliente (OK)
├── wg-crm/                        ← PROJETO PRINCIPAL
│   └── src/
│       ├── components/ui/         ← UI ÚNICA
│       ├── hooks/                 ← Hooks compartilhados
│       ├── modules/
│       │   ├── cronograma/        ← Apenas pages + components
│       │   └── financeiro/        ← Apenas pages + components
│       └── contexts/              ← Contextos globais
└── src/                           ← Compatibilidade (avaliar manter)
```

---

## 🚨 BUGS IDENTIFICADOS

### 1. **PriceList.jsx - Valores NaN** ⚠️

**Localização**: `wg-crm/src/modules/financeiro/pages/PriceList.jsx`

**Sintoma**: Exibe "Custo: R$ NaN / Venda: R$ NaN"

**Causa Provável**:
- Campo do banco não bate com código (ex: `custo` vs `custo_base`)
- Valor vem como `null` ou `string` e não é tratado
- Formatação numérica sem validação

**Próximo Passo**: Auditoria específica deste módulo

---

## 📊 RESUMO FINAL

### Arquivos por Status:

| Status | Quantidade | Ação |
|--------|-----------|------|
| ✅ Em uso ativo | ~200 | Manter no `wg-crm/` |
| ⚠️ Duplicados/Legados | ~150 | Consolidar (UI, hooks, contextos) |
| 🗑️ Mortos (standalone) | ~140 | Mover para `_LEGACY/` |
| 🗑️ Mortos (pasta vazia) | 0 | Deletar |
| 🐛 Bugados | 1 | Corrigir (PriceList.jsx) |

### Ganho de Limpeza:

- **Arquivos deletados/movidos**: ~150
- **Redução de duplicação**: -60%
- **Melhoria de manutenibilidade**: Alta

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Hoje):

1. ✅ Deletar `02sistemawgeasy/`
2. ✅ Mover `05finance/` e `06cronograma/` para `_LEGACY/`
3. ✅ Corrigir bug PriceList.jsx (NaN)

### Curto Prazo (Esta Semana):

4. Consolidar componentes UI (deletar duplicatas)
5. Atualizar imports para UI global
6. Testar módulos cronograma e financeiro

### Médio Prazo (Próximas 2 Semanas):

7. Consolidar hooks e contextos
8. Revisar estrutura `src/` vs `wg-crm/src/`
9. Documentar arquitetura final

---

**Gerado por**: Claude Code
**Data**: 2025-11-25
**Versão**: 1.0
