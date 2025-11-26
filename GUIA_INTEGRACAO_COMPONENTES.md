# 🎯 GUIA DE INTEGRAÇÃO - Componentes Criados

**Data:** 2025-11-25
**Sistema:** WG CRM
**Componentes:** AlertasPagamentoPopup, TeamBuilder, useAlertas

---

## 📋 COMPONENTES CRIADOS

### 1. ✅ `useAlertas.js` - Hook de Gerenciamento de Alertas
**Localização:** `src/hooks/useAlertas.js`

**Funcionalidades:**
- Busca alertas pendentes via RPC `api_get_alertas_pendentes`
- Atualiza automaticamente a cada 5 minutos
- Marca alertas como lidos/ignorados
- Gera novos alertas via `api_gerar_alertas_pagamento`
- Fornece estatísticas (total, vencidos, urgentes, valor total)

**Como usar:**
```jsx
import { useAlertas } from '@/hooks/useAlertas';

function MyComponent() {
  const {
    alertas,          // Array de alertas
    loading,          // Estado de carregamento
    error,            // Erro se houver
    stats,            // Estatísticas
    marcarComoLido,   // Função para marcar como lido
    ignorarAlerta,    // Função para ignorar
    refetch           // Refazer busca
  } = useAlertas();

  return (
    <div>
      <h2>Total de Alertas: {stats.total}</h2>
      <p>Vencidos: {stats.vencidos}</p>
      <p>Urgentes: {stats.urgentes}</p>
      <p>Valor Total: R$ {stats.valorTotal.toFixed(2)}</p>
    </div>
  );
}
```

---

### 2. ✅ `AlertasPagamentoPopup.jsx` - Popup de Alertas
**Localização:** `src/components/financeiro/AlertasPagamentoPopup.jsx`

**Funcionalidades:**
- Exibe alertas no canto superior direito
- Categoriza por urgência (VENCIDO, VENCE HOJE, VENCE AMANHÃ, URGENTE, NORMAL)
- Mostra até 5 alertas por vez
- Botões: Ver cobrança, Marcar como lido, Marcar todos como lidos
- Estatísticas rápidas (vencidos, urgentes, valor total)
- Animação de entrada suave

**Como integrar no layout principal:**

**Opção 1: Layout Global (Recomendado)**
```jsx
// src/App.jsx ou src/layouts/MainLayout.jsx
import { AlertasPagamentoPopup } from '@/components/financeiro/AlertasPagamentoPopup';

function App() {
  return (
    <div>
      {/* Seu layout */}
      <MainLayout>
        {/* Conteúdo */}
      </MainLayout>

      {/* Popup de Alertas (sempre visível) */}
      <AlertasPagamentoPopup />
    </div>
  );
}
```

**Opção 2: Layout do Módulo Financeiro**
```jsx
// src/modules/financeiro/Layout.jsx
import { AlertasPagamentoPopup } from '@/components/financeiro/AlertasPagamentoPopup';

function FinanceiroLayout({ children }) {
  return (
    <div>
      {children}
      <AlertasPagamentoPopup />
    </div>
  );
}
```

**Opção 3: Página Específica**
```jsx
// src/modules/financeiro/pages/Dashboard.jsx
import { AlertasPagamentoPopup } from '@/components/financeiro/AlertasPagamentoPopup';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard Financeiro</h1>
      {/* Conteúdo */}
      <AlertasPagamentoPopup />
    </div>
  );
}
```

---

### 3. ✅ `TeamBuilder.jsx` - Montagem de Equipe (2 Colunas)
**Localização:** `src/components/cronograma/TeamBuilder.jsx`

**Funcionalidades:**
- 2 colunas: Esquerda (disponíveis) | Direita (selecionados)
- Busca por nome com filtro em tempo real
- Avatar + nome + tipo (colaborador/fornecedor) + núcleo
- Botão "+" para adicionar à equipe
- Botão "X" para remover da equipe
- Salvar equipe (cria team + team_members)
- Suporta edição de equipe existente

**Como usar:**

**Página de Criação de Projeto:**
```jsx
// src/modules/cronograma/pages/ProjectDetail.jsx
import { TeamBuilder } from '@/components/cronograma/TeamBuilder';
import { useState } from 'react';

function ProjectDetail() {
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const projectId = 'uuid-do-projeto';

  const handleTeamSaved = (team) => {
    console.log('Equipe salva:', team);
    setShowTeamBuilder(false);
    // Atualizar UI, refetch, etc
  };

  return (
    <div>
      <h1>Detalhes do Projeto</h1>

      <button onClick={() => setShowTeamBuilder(true)}>
        Montar Equipe
      </button>

      {showTeamBuilder && (
        <div className="mt-8">
          <TeamBuilder
            projectId={projectId}
            onTeamSaved={handleTeamSaved}
            existingTeamId={null} // ou ID da equipe existente para editar
          />
        </div>
      )}
    </div>
  );
}
```

**Em Dialog:**
```jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TeamBuilder } from '@/components/cronograma/TeamBuilder';

function ProjectPage() {
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  return (
    <>
      <button onClick={() => setTeamDialogOpen(true)}>
        Gerenciar Equipe
      </button>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Montar Equipe do Projeto</DialogTitle>
          </DialogHeader>
          <TeamBuilder
            projectId={projectId}
            onTeamSaved={(team) => {
              console.log('Equipe salva:', team);
              setTeamDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🔧 CONFIGURAÇÃO DE ROTAS

### Adicionar Rota de Cobranças (se não existir)

```jsx
// src/App.jsx ou src/routes/index.jsx
import Cobrancas from '@/modules/financeiro/pages/Cobrancas';

const routes = [
  // ... outras rotas
  {
    path: '/financeiro/cobrancas',
    element: <Cobrancas />
  }
];
```

---

## 🧪 COMO TESTAR

### 1. Testar Alertas

#### A. Criar Cobranças de Teste
```sql
-- Via Supabase Studio ou SQL Editor
INSERT INTO cobrancas (cliente_id, project_id, descricao, valor, vencimento, status)
VALUES (
  (SELECT id FROM entities LIMIT 1), -- Cliente qualquer
  (SELECT id FROM projects LIMIT 1), -- Projeto qualquer
  'Teste - Vence em 5 dias',
  5000.00,
  CURRENT_DATE + INTERVAL '5 days',
  'Pendente'
);

INSERT INTO cobrancas (cliente_id, project_id, descricao, valor, vencimento, status)
VALUES (
  (SELECT id FROM entities LIMIT 1),
  (SELECT id FROM projects LIMIT 1),
  'Teste - Vence amanhã',
  3000.00,
  CURRENT_DATE + INTERVAL '1 day',
  'Pendente'
);

INSERT INTO cobrancas (cliente_id, project_id, descricao, valor, vencimento, status)
VALUES (
  (SELECT id FROM entities LIMIT 1),
  (SELECT id FROM projects LIMIT 1),
  'Teste - VENCIDO',
  2000.00,
  CURRENT_DATE - INTERVAL '2 days',
  'Pendente'
);
```

#### B. Gerar Alertas
```sql
-- Executar função via SQL Editor
SELECT * FROM api_gerar_alertas_pagamento();
```

#### C. Verificar Alertas
```sql
-- Ver alertas criados
SELECT * FROM alertas_pagamento ORDER BY created_at DESC;

-- Buscar alertas pendentes (como o hook faz)
SELECT * FROM api_get_alertas_pendentes();
```

#### D. Abrir Aplicação
1. Iniciar frontend: `npm run dev`
2. Fazer login
3. Popup de alertas deve aparecer automaticamente no canto superior direito

---

### 2. Testar TeamBuilder

#### A. Criar Entities de Teste (Colaboradores/Fornecedores)
```sql
INSERT INTO entities (nome_razao_social, tipo, ativo, nucleo, centro_custo_padrao_id)
VALUES
  ('João Silva', 'colaborador', true, 'arquitetura', (SELECT id FROM centros_custo WHERE codigo = 'CC001')),
  ('Maria Santos', 'colaborador', true, 'engenharia', (SELECT id FROM centros_custo WHERE codigo = 'CC003')),
  ('Madeireira ABC', 'fornecedor', true, 'marcenaria', (SELECT id FROM centros_custo WHERE codigo = 'CC002')),
  ('Elétrica XYZ', 'fornecedor', true, null, null);
```

#### B. Criar Projeto de Teste
```sql
INSERT INTO projects (empresa_id, codigo, titulo, data_inicio, data_fim_prevista, status)
VALUES (
  (SELECT empresa_id FROM profiles WHERE id = auth.uid()),
  'PROJ-TEST-001',
  'Projeto de Teste',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'planejamento'
);
```

#### C. Usar TeamBuilder
1. Navegar para página do projeto
2. Clicar em "Montar Equipe"
3. Ver lista de colaboradores/fornecedores na coluna esquerda
4. Buscar por nome
5. Clicar em "+" para adicionar à equipe
6. Ver membros selecionados na coluna direita
7. Clicar em "Salvar Equipe"
8. Verificar no banco:
```sql
-- Ver equipes criadas
SELECT * FROM teams ORDER BY created_at DESC;

-- Ver membros da equipe
SELECT
  t.nome AS equipe,
  e.nome_razao_social AS membro,
  tm.papel
FROM team_members tm
INNER JOIN teams t ON t.id = tm.team_id
INNER JOIN entities e ON e.id = tm.user_id
ORDER BY t.created_at DESC;
```

---

## 🔄 FLUXO COMPLETO DE TESTE

### Cenário: Contrato → Cobranças → Alertas → Pagamento

```sql
-- 1. Criar contrato com condições de pagamento
INSERT INTO project_contracts (
  project_id,
  cliente_id,
  numero,
  descricao,
  valor_total,
  status,
  aprovado,
  condicoes_pagamento
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM entities WHERE tipo = 'cliente' LIMIT 1),
  'CONTRATO-001',
  'Reforma Apartamento',
  50000.00,
  'rascunho',
  false,
  '[
    {"descricao": "Entrada", "valor": 15000, "vencimento": "2025-12-01"},
    {"descricao": "Parcela 1", "valor": 17500, "vencimento": "2025-12-15"},
    {"descricao": "Parcela 2", "valor": 17500, "vencimento": "2025-12-30"}
  ]'::jsonb
);

-- 2. Aprovar contrato (gera cobranças automaticamente)
SELECT api_aprovar_contrato(
  (SELECT id FROM project_contracts WHERE numero = 'CONTRATO-001'),
  true  -- gerar_integracao
);

-- 3. Verificar cobranças criadas
SELECT * FROM cobrancas ORDER BY vencimento ASC;

-- 4. Gerar alertas
SELECT * FROM api_gerar_alertas_pagamento();

-- 5. Ver alertas no frontend
-- Abrir aplicação → popup deve aparecer

-- 6. Marcar cobrança como paga
UPDATE cobrancas
SET status = 'Pago'
WHERE descricao = 'Entrada';

-- 7. Gerar lançamento
SELECT api_lancar_cobranca_paga(
  (SELECT id FROM cobrancas WHERE descricao = 'Entrada')
);

-- 8. Verificar lançamento criado
SELECT * FROM lancamentos ORDER BY created_at DESC;

-- 9. Verificar título financeiro
SELECT * FROM titulos_financeiros WHERE tipo = 'Receber' ORDER BY created_at DESC;
```

---

## 📊 MONITORAMENTO E LOGS

### Verificar Logs das Funções SQL

```sql
-- Habilitar logs de NOTICE no Supabase Studio
-- Settings → Database → Show notices

-- Executar funções e ver logs
SELECT api_sync_cobranca_titulo('<uuid-cobranca>');
-- Deve mostrar NOTICE: 'api_sync_cobranca_titulo - Sincronizando cobrança: ...'

SELECT api_gerar_alertas_pagamento();
-- Deve mostrar quantos alertas foram criados
```

### Verificar Integridade dos Dados

```sql
-- Cobranças sem título vinculado
SELECT id, descricao, valor, status
FROM cobrancas
WHERE titulo_financeiro_id IS NULL
AND status != 'Cancelado';

-- Títulos sem centro de custo
SELECT id, descricao, valor
FROM titulos_financeiros
WHERE centro_custo_id IS NULL
AND tipo = 'Receber';

-- Alertas pendentes por urgência
SELECT urgencia, COUNT(*) AS total
FROM (
  SELECT
    CASE
      WHEN c.vencimento < CURRENT_DATE THEN 'VENCIDO'
      WHEN c.vencimento = CURRENT_DATE THEN 'VENCE HOJE'
      WHEN c.vencimento <= CURRENT_DATE + INTERVAL '5 days' THEN 'URGENTE'
      ELSE 'NORMAL'
    END AS urgencia
  FROM alertas_pagamento a
  INNER JOIN cobrancas c ON c.id = a.cobranca_id
  WHERE a.status = 'pendente'
) AS subq
GROUP BY urgencia;
```

---

## 🚨 TROUBLESHOOTING

### Problema: Popup de alertas não aparece

**Soluções:**
1. Verificar se há alertas pendentes:
```sql
SELECT * FROM api_get_alertas_pendentes();
```

2. Verificar se componente está importado corretamente:
```jsx
// Deve estar no layout principal
import { AlertasPagamentoPopup } from '@/components/financeiro/AlertasPagamentoPopup';
```

3. Verificar console do navegador por erros
4. Verificar se RPC `api_get_alertas_pendentes` está funcionando:
```jsx
// No navegador, abrir console e testar:
supabase.rpc('api_get_alertas_pendentes').then(console.log);
```

---

### Problema: TeamBuilder não carrega colaboradores

**Soluções:**
1. Verificar se há entities do tipo 'colaborador' ou 'fornecedor':
```sql
SELECT * FROM entities WHERE tipo IN ('colaborador', 'fornecedor') AND ativo = true;
```

2. Verificar permissões RLS:
```sql
-- Verificar se policy permite SELECT
SELECT * FROM entities WHERE tipo = 'colaborador' LIMIT 1;
```

3. Verificar console do navegador por erros
4. Verificar campo `avatar_url` (pode ser NULL)

---

### Problema: Erro ao salvar equipe

**Soluções:**
1. Verificar se campo `empresa_id` existe em `teams`:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'teams' AND column_name = 'empresa_id';
```

2. Verificar se usuário tem `empresa_id` em profiles:
```sql
SELECT empresa_id FROM profiles WHERE id = auth.uid();
```

3. Verificar RLS policies de `teams` e `team_members`

---

## 📝 PRÓXIMOS PASSOS

### FASE 3: Triggers Automáticos
Criar triggers para automatizar:
- `ON INSERT/UPDATE cobrancas` → `api_sync_cobranca_titulo`
- `ON UPDATE cobrancas.status='Pago'` → `api_lancar_cobranca_paga`

### FASE 4: Cron Job para Alertas
Configurar `pg_cron` para executar `api_gerar_alertas_pagamento` diariamente:
```sql
SELECT cron.schedule(
  'gerar-alertas-pagamento',
  '0 8 * * *',  -- Todo dia às 8h
  $$SELECT api_gerar_alertas_pagamento();$$
);
```

### FASE 5: Notificações por Email
Integrar serviço de email (SendGrid, Mailgun) para enviar alertas por email.

### FASE 6: Gráfico de Gantt
Implementar componente `GanttChart.jsx` com biblioteca Frappe Gantt ou DHTMLX.

---

## 📄 RESUMO DE ARQUIVOS CRIADOS

1. ✅ `src/hooks/useAlertas.js` - Hook de gerenciamento
2. ✅ `src/components/financeiro/AlertasPagamentoPopup.jsx` - Popup de alertas
3. ✅ `src/components/cronograma/TeamBuilder.jsx` - Montagem de equipe
4. ✅ `GUIA_INTEGRACAO_COMPONENTES.md` - Este guia

---

**Criado por:** Claude Code
**Data:** 2025-11-25
**Versão:** 1.0
