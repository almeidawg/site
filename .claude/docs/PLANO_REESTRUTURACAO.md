# 📋 PLANO DE REESTRUTURAÇÃO - Projeto WG

**Data**: 02/11/2025
**Objetivo**: Padronizar projeto WG seguindo best practices do projeto Liftlio
**Status**: 🟡 Em planejamento

---

## 🧠 ANÁLISE ULTRATHINK - Situação Atual vs Ideal

<ultrathink>

### 1. ESTRUTURA ATUAL DO PROJETO WG

**Pontos Fortes:**
- ✅ Supabase local já configurado e rodando (containers _WG)
- ✅ Migrations organizadas (7 migrations aplicadas)
- ✅ Branch dev-supabase-local separada para desenvolvimento local
- ✅ .env.local configurado para isolamento de ambientes
- ✅ Agentes básicos já existem (.claude/agents/)
- ✅ Estrutura modular com wg-crm/ separado

**Gaps Críticos Identificados:**

1. **Documentação Central Ausente**
   - ❌ Sem CLAUDE.md na raiz (padrão Liftlio)
   - ❌ Sem documentação modular estruturada
   - ❌ Sem guias de CODE_STANDARDS, MCP_GUIDE, DEPLOY_GUIDE

2. **Agentes Supabase Incompletos**
   - ❌ Falta agente `supabase-local-expert` (desenvolvimento local)
   - ❌ Agente `supabase-mcp-expert` existe mas precisa atualização
   - ❌ Sem sistema de DEPLOY_LOG para controle de deployments

3. **Sistema de Branching Indefinido**
   - ❌ Sem clara separação DEV vs LIVE
   - ❌ Sem script de troca automática de ambientes
   - ❌ Sem indicadores visuais de ambiente ativo

4. **Workflow de Desenvolvimento Não Documentado**
   - ❌ Sem processo claro: Local → Git → Deploy
   - ❌ Sem padrões de nomenclatura de funções
   - ❌ Sem checklist de validação antes de deploy

5. **Configurações de Ambiente Desorganizadas**
   - ⚠️ Múltiplos .env sem clara hierarquia
   - ⚠️ Sem .env.development.{dev|main} separados
   - ⚠️ Sem sistema de proteção contra deploy acidental em produção

6. **Estrutura Supabase Mista**
   - ⚠️ /Supabase/backup/ sem clara função (histórico vs ativo)
   - ⚠️ Sem sistema de versionamento de funções
   - ⚠️ Sem separação clara: migrations vs functions backup

### 2. COMPARAÇÃO COM PADRÃO LIFTLIO

**Liftlio tem e WG precisa:**

| Feature | Liftlio | WG Atual | Prioridade |
|---------|---------|----------|------------|
| CLAUDE.md na raiz | ✅ | ❌ | 🔴 ALTA |
| Docs modulares (.claude/docs/) | ✅ | ⚠️ Parcial | 🔴 ALTA |
| supabase-local-expert | ✅ | ❌ | 🔴 ALTA |
| supabase-mcp-expert atualizado | ✅ | ⚠️ Desatualizado | 🔴 ALTA |
| Sistema de branching DEV/LIVE | ✅ | ❌ | 🟡 MÉDIA |
| Script switch-branch.sh | ✅ | ❌ | 🟡 MÉDIA |
| DEPLOY_LOG para controle | ✅ | ❌ | 🟡 MÉDIA |
| .env.development.{dev|main} | ✅ | ❌ | 🟡 MÉDIA |
| Indicadores visuais de ambiente | ✅ | ❌ | 🟢 BAIXA |
| Workflow 3 terminais documentado | ✅ | ❌ | 🟡 MÉDIA |
| Sistema de URLs dinâmicas (seed.sql) | ✅ | ❌ | 🟢 BAIXA |

### 3. IMPACTO DA REESTRUTURAÇÃO

**Benefícios Esperados:**

1. **Produtividade +50%**
   - Agentes especializados eliminam confusão LOCAL vs LIVE
   - Workflow documentado reduz decisões repetitivas
   - Scripts automatizam tarefas manuais

2. **Segurança +90%**
   - Sistema de proteção impede deploy acidental em produção
   - DEPLOY_LOG rastreia todas mudanças
   - Separação clara de credenciais por ambiente

3. **Manutenibilidade +70%**
   - Documentação centralizada facilita onboarding
   - Padrões de código reduzem inconsistências
   - Versionamento de funções permite rollback fácil

4. **Colaboração +60%**
   - CLAUDE.md guia IA em qualquer sessão
   - Docs modulares facilitam contribuições
   - Workflows padronizados eliminam ambiguidades

### 4. RISCOS E MITIGAÇÕES

**Riscos Identificados:**

1. ⚠️ **Perda de trabalho durante migração**
   - Mitigação: Commit completo antes de iniciar
   - Mitigação: Trabalhar em branch separada (reestruturacao)
   - Mitigação: Testar cada etapa antes de prosseguir

2. ⚠️ **Quebra de ambiente local funcionando**
   - Mitigação: Backup de configs atuais (.env, config.toml)
   - Mitigação: Documentar estado atual antes de mudar
   - Mitigação: Manter Supabase local rodando durante migração

3. ⚠️ **Confusão de ambientes durante transição**
   - Mitigação: Implementar indicadores visuais PRIMEIRO
   - Mitigação: Criar script de verificação de ambiente
   - Mitigação: Manter apenas LOCAL ativo durante reestruturação

4. ⚠️ **Tempo de implementação excedendo 1 dia**
   - Mitigação: Dividir em fases com entregas incrementais
   - Mitigação: Priorizar itens de alta prioridade primeiro
   - Mitigação: Validar cada fase antes de prosseguir

</ultrathink>

---

## 📊 MATRIZ DE PRIORIZAÇÃO

### 🔴 FASE 1 - Fundação Crítica (Prioridade ALTA)
**Tempo estimado**: 2-3 horas
**Impacto**: Estabelece base para todo resto

1. **Criar CLAUDE.md na raiz** (30 min)
   - Baseado no Liftlio mas adaptado para WG
   - Definir filosofia de trabalho
   - Documentar stack e ambientes
   - Adicionar referências para docs modulares

2. **Criar docs modulares em .claude/docs/** (1h)
   - `CODE_STANDARDS.md`: Padrões TypeScript, React, SQL
   - `SUPABASE_WORKFLOW.md`: Workflow LOCAL → GIT → DEPLOY
   - `ENVIRONMENT_GUIDE.md`: Gestão de .env e ambientes
   - `DEPLOY_CHECKLIST.md`: Validações antes de deploy

3. **Criar agente supabase-local-expert** (1h)
   - Copiar estrutura do Liftlio
   - Adaptar para projeto WG (paths, project_id, etc)
   - Adicionar regras específicas do WG
   - Testar com operação simples

4. **Atualizar agente supabase-mcp-expert** (30 min)
   - Incorporar melhorias do Liftlio
   - Adicionar sistema DEPLOY_LOG
   - Atualizar documentação Context7
   - Definir project_id correto (LIVE)

### 🟡 FASE 2 - Organização de Ambientes (Prioridade MÉDIA)
**Tempo estimado**: 2-3 horas
**Impacto**: Elimina confusão entre ambientes

1. **Definir estrutura de branching** (30 min)
   - Criar branch `dev` no Supabase (staging)
   - Manter `main` como produção
   - Documentar quando usar cada um

2. **Reorganizar arquivos .env** (45 min)
   - Criar `.env.development.dev` (staging)
   - Criar `.env.development.main` (produção)
   - Manter `.env.local` para desenvolvimento local
   - Documentar hierarquia de variáveis

3. **Criar sistema DEPLOY_LOG** (1h)
   - Estrutura em `/Supabase/functions_backup/_deploy-control/`
   - `DEPLOY_LOG.md` para tracking
   - `check-deploy-status.sh` para verificação
   - `DEPLOY_WORKFLOW.md` para documentação

4. **Criar indicadores visuais de ambiente** (45 min)
   - Badge no console indicando ambiente ativo
   - Script de verificação: `./check-env.sh`
   - Mensagem clara ao iniciar Supabase local

### 🟢 FASE 3 - Automações e Melhorias (Prioridade BAIXA)
**Tempo estimado**: 2-3 horas
**Impacto**: Aumenta produtividade, não crítico

1. **Criar script switch-environment.sh** (1h)
   - Trocar entre dev/main/local automaticamente
   - Atualizar symlinks de .env
   - Validar ambiente após troca
   - Adicionar confirmações de segurança

2. **Implementar sistema de URLs dinâmicas** (1h)
   - Criar `supabase/seed.sql` (se aplicável)
   - Configurar variáveis PostgreSQL
   - Atualizar funções SQL para usar `current_setting()`
   - Documentar sistema

3. **Melhorar estrutura Supabase/** (1h)
   - Renomear `/backup/` para `/functions_backup/`
   - Adicionar README.md explicando estrutura
   - Criar templates para novas funções
   - Documentar versionamento

---

## 🎯 ROADMAP DE IMPLEMENTAÇÃO

### Semana 1 - Fundação
- [ ] **Dia 1**: FASE 1 completa (CLAUDE.md + docs + agentes)
- [ ] **Dia 2**: Validar agentes com operações reais
- [ ] **Dia 3**: FASE 2 iniciada (branching + .env)

### Semana 2 - Consolidação
- [ ] **Dia 4**: FASE 2 completa (DEPLOY_LOG + indicadores)
- [ ] **Dia 5**: FASE 3 iniciada (scripts + automações)
- [ ] **Dia 6**: Testes completos e ajustes

### Semana 3 - Validação
- [ ] **Dia 7**: Uso real em desenvolvimento de features
- [ ] **Dia 8**: Ajustes baseados em feedback
- [ ] **Dia 9**: Documentação final e training

---

## 📝 CHECKLIST DE VALIDAÇÃO POR FASE

### FASE 1 ✅
- [ ] CLAUDE.md existe e está completo
- [ ] Todos docs modulares criados
- [ ] `supabase-local-expert` funciona (criar função teste)
- [ ] `supabase-mcp-expert` atualizado e testado
- [ ] Git commit: "feat: Adiciona fundação de documentação e agentes"

### FASE 2 ✅
- [ ] Branches DEV/LIVE definidos no Supabase
- [ ] Arquivos .env organizados e documentados
- [ ] DEPLOY_LOG criado e documentado
- [ ] Indicadores visuais funcionando
- [ ] Git commit: "feat: Organiza ambientes e sistema de deploy"

### FASE 3 ✅
- [ ] Script switch-environment.sh funciona
- [ ] Sistema URLs dinâmicas implementado (se aplicável)
- [ ] Estrutura Supabase/ reorganizada
- [ ] Documentação atualizada
- [ ] Git commit: "feat: Adiciona automações e melhorias"

---

## 🚀 QUICK START - Implementação Imediata

Se você tem **30 minutos agora**, comece por:

1. **CLAUDE.md** (15 min)
   ```bash
   # Criar arquivo base
   cp /caminho/liftlio/CLAUDE.md /Users/valdair/Documents/Projetos/William\ WG/CLAUDE.md
   # Adaptar: trocar "Liftlio" por "WG", atualizar paths, project_ids
   ```

2. **supabase-local-expert** (15 min)
   ```bash
   # Copiar agente do Liftlio
   cp /caminho/liftlio/.claude/agents/supabase-local-expert.md \
      /Users/valdair/Documents/Projetos/William\ WG/.claude/agents/
   # Adaptar: project_id "WG", paths corretos
   ```

**Resultado imediato:**
- ✅ Agente LOCAL especializado disponível
- ✅ Documentação central guiando IA
- ✅ Base para próximas melhorias

---

## 📚 REFERÊNCIAS E RECURSOS

### Arquivos do Liftlio para Consulta
- `/Projetos/Liftlio/liftlio-react/CLAUDE.md`
- `/Projetos/Liftlio/liftlio-react/.claude/agents/supabase-local-expert.md`
- `/Projetos/Liftlio/liftlio-react/.claude/agents/supabase-mcp-expert.md`
- `/Projetos/Liftlio/liftlio-react/.claude/docs/`

### Documentação Supabase
- [Local Development](https://supabase.com/docs/guides/local-development)
- [Branching](https://supabase.com/docs/guides/platform/branching)
- [CLI Reference](https://supabase.com/docs/reference/cli)

### Best Practices
- [12-Factor App](https://12factor.net/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

## 🔄 PROCESSO DE MELHORIA CONTÍNUA

### Após Implementação
1. **Monitorar uso real** por 1 semana
2. **Coletar feedback** de pain points
3. **Ajustar documentação** baseado em dúvidas recorrentes
4. **Iterar agentes** conforme padrões emergem
5. **Atualizar este plano** com lições aprendidas

### Métricas de Sucesso
- ⏱️ **Tempo de setup novo ambiente**: < 10 minutos
- 🐛 **Deploys acidentais em produção**: 0
- 📚 **Perguntas repetitivas sobre workflow**: -80%
- 🚀 **Velocidade de desenvolvimento**: +50%
- ✅ **Confiança em mudanças**: +90%

---

## 💡 PRÓXIMOS PASSOS RECOMENDADOS

**Você está aqui**: 🟡 Planejamento completo

**Próximo**: 🔴 Iniciar FASE 1

**Comando para começar:**
```bash
# Criar branch para reestruturação
git checkout -b feat/reestruturacao-padronizacao

# Commit este plano
git add .claude/docs/PLANO_REESTRUTURACAO.md
git commit -m "docs: Adiciona plano de reestruturação baseado em Liftlio"

# Iniciar FASE 1
# 1. Criar CLAUDE.md
# 2. Criar docs modulares
# 3. Criar supabase-local-expert
# 4. Atualizar supabase-mcp-expert
```

---

**Perguntas? Dúvidas? Sugestões?**

Adicione notas aqui conforme implementa:

<!--
NOTAS DE IMPLEMENTAÇÃO:

[Data] - [Fase] - [Ação] - [Resultado]

Exemplo:
02/11/2025 - FASE 1 - Criado CLAUDE.md - ✅ Funcionando
02/11/2025 - FASE 1 - Agente local criado - ⚠️ Precisa ajuste de paths

-->

---

**Última atualização**: 02/11/2025
**Versão**: 1.0
**Autor**: Claude (com ultrathink profundo)
