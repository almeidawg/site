# 🧪 TESTE COMPLETO DO FRONTEND WG CRM

**Data de Criação**: 03/11/2025
**Versão**: 1.0
**Objetivo**: Documentar e testar TODAS as funcionalidades do frontend React

---

## 📊 STATUS GERAL

- **Total de Funcionalidades Identificadas**: 157
- **Testadas**: 0
- **Funcionando**: 0
- **Com Erros**: 0
- **Não Testadas**: 157
- **Parcialmente Implementadas**: ~30%

---

## 🗺️ MAPA DE ROTAS

### Rotas Públicas (Sem Login)
- `/` - Landing Page
- `/login` - Login
- `/register` - Registro
- `/cadastro/:type/novo` - Cadastro público (cliente/fornecedor)
- `/store` - Loja online (ecommerce)
- `/product/:id` - Detalhe do produto
- `/success` - Página de sucesso (pós-compra)

### Rotas Privadas (Com Login - CrmLayout)
- `/dashboard` - Dashboard principal
- `/oportunidades` - Funil de vendas (Kanban)
- `/propostas` - Gestão de propostas
- `/contratos` - Gestão de contratos
- `/arquitetura` - Projetos de arquitetura (Kanban)
- `/engenharia` - Obras e reformas (Kanban)
- `/marcenaria` - Projetos de marcenaria (Kanban)
- `/compras` - Pedidos de compra
- `/assistencia` - Assistência técnica
- `/financeiro` - Módulo financeiro
- `/pessoas` - Gestão de entidades (clientes, colaboradores, fornecedores)
- `/usuarios` - Gestão de usuários e permissões
- `/configuracoes` - Configurações do sistema
- `/onboarding` - Onboarding
- `/portal-cliente/:id` - Portal do cliente
- `/integrations` - Integrações

---

## 1. DASHBOARD 🏠

**Rota**: `/dashboard`
**Componente**: `src/components/pages/Dashboard.jsx` + `src/components/dashboard/Dashboard.jsx`

### 1.1 Widgets de Métricas Comerciais
- [ ] **Widget Oportunidades**
  - Exibe: Valor total em oportunidades
  - Fonte: kanban_cards (ambiente: oportunidades)
  - Status: ❓ Não testado
  - Notas:

- [ ] **Widget Propostas em Negociação**
  - Exibe: Valor total de propostas
  - Clicável: redireciona para `/propostas?status=negociacao`
  - Status: ❓ Não testado

### 1.2 Widgets Operacionais
- [ ] **Contratos Arquitetura**
  - Exibe: Valor total de cards no board arquitetura
  - Clicável: redireciona para `/arquitetura?status=ativo`
  - Status: ❓ Não testado

- [ ] **Contratos Engenharia**
  - Exibe: Valor total de cards no board engenharia
  - Clicável: redireciona para `/engenharia?status=execucao`
  - Status: ❓ Não testado

- [ ] **Contratos Marcenaria**
  - Exibe: Valor total de cards no board marcenaria
  - Clicável: redireciona para `/marcenaria?status=producao`
  - Status: ❓ Não testado

### 1.3 Gráficos e Visualizações
- [ ] **Pipeline Chart**
  - Exibe: Distribuição de oportunidades por coluna
  - Componente: `PipelineChart.jsx`
  - Status: ❓ Não testado

- [ ] **Obras Status**
  - Exibe: Status das obras em andamento
  - Componente: `ObrasStatus.jsx`
  - Status: ❓ Não testado

- [ ] **Clientes Ativos**
  - Exibe: Lista de clientes com projetos ativos
  - Componente: `ClientesAtivos.jsx`
  - Status: ❓ Não testado

- [ ] **Finance Charts**
  - Exibe: Gráficos financeiros
  - Componente: `FinanceCharts.jsx`
  - Status: ❓ Não testado

### 1.4 Cards de Alertas
- [ ] **Materiais Críticos**
  - Exibe: Contador de materiais críticos
  - Link: `/compras?criticos=true`
  - Status: ❓ Não testado

- [ ] **PCs Atrasados**
  - Exibe: Pedidos de compra atrasados
  - Link: `/compras?status=atrasado`
  - Status: ❓ Não testado

- [ ] **Itens Abaixo do Piso**
  - Exibe: Propostas com alerta de preço baixo
  - Link: `/propostas?alerta=baixoH`
  - Status: ❓ Não testado

- [ ] **OS Pendentes**
  - Exibe: Ordens de serviço pendentes
  - Link: `/assistencia?status=aberta`
  - Status: ❓ Não testado

### 1.5 Estatísticas (Dashboard Alternativo)
- [ ] **Novos Clientes (30 dias)**
  - Fonte: entities (tipo: cliente, created_at)
  - Status: ❓ Não testado

- [ ] **Cards em Oportunidades**
  - Total e valor de cards ativos
  - Status: ❓ Não testado

- [ ] **Cards em Negociação**
  - Cards em coluna "Negociação"
  - Status: ❓ Não testado

---

## 2. OPORTUNIDADES (Funil de Vendas) 🎯

**Rota**: `/oportunidades`
**Componente**: `src/components/pages/Oportunidades.jsx`

### 2.1 Visualização Kanban
- [ ] **Board Kanban**
  - Exibe: Colunas dinâmicas do banco (kanban_boards ambiente: oportunidades)
  - Componente: `KanbanBoard.jsx`
  - Status: ❓ Não testado

- [ ] **Colunas Dinâmicas**
  - Busca: kanban_colunas ordenadas por posicao
  - Cores customizáveis
  - Status: ❓ Não testado

- [ ] **Cards de Oportunidade**
  - Exibe: titulo, descricao, valor, cliente, responsavel
  - Componente: `OportunidadeCard.jsx`
  - Status: ❓ Não testado

### 2.2 Criar Oportunidade
- [ ] **Botão "Nova Oportunidade"**
  - Abre: `NovaOportunidadeDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: nome, cliente, valor_previsto, responsavel, servicos_contratados
  - Validações: campos obrigatórios
  - Status: ❓ Não testado

- [ ] **Selecionar Cliente**
  - Lista: entities tipo 'cliente'
  - Permite criar novo cliente inline
  - Status: ❓ Não testado

- [ ] **Selecionar Responsável**
  - Lista: profiles (usuários)
  - Status: ❓ Não testado

- [ ] **Serviços Contratados**
  - Toggle: Arquitetura, Engenharia, Marcenaria
  - Multi-seleção
  - Status: ❓ Não testado

- [ ] **Salvar no Banco**
  - Cria: kanban_card com dados
  - coluna_id: primeira coluna do board
  - Status: ❓ Não testado

### 2.3 Editar Oportunidade
- [ ] **Abrir Modal de Edição**
  - Clique no card
  - Preenche formulário com dados existentes
  - Status: ❓ Não testado

- [ ] **Salvar Alterações**
  - Update: kanban_cards
  - Toast de sucesso
  - Status: ❓ Não testado

### 2.4 Drag and Drop
- [ ] **Arrastar Card Entre Colunas**
  - Biblioteca: react-beautiful-dnd
  - Atualiza: coluna_id no banco
  - Status: ❓ Não testado

- [ ] **Reordenar Dentro da Coluna**
  - Atualiza: posicao no banco
  - Status: ❓ Não testado

- [ ] **Ganha/Perdida**
  - Arrastar para coluna final muda status
  - Status: ❓ Não testado

### 2.5 Renomear Colunas
- [ ] **Botão "Renomear Coluna"**
  - Menu de contexto na coluna
  - Status: ❓ Não testado

- [ ] **Salvar Novo Nome**
  - Update: kanban_colunas.titulo
  - Refresh automático
  - Status: ❓ Não testado

### 2.6 Funcionalidades Extras
- [ ] **Gerar Link de Cadastro**
  - Botão: "Gerar Link"
  - Copia: `{url}/cadastro/cliente/novo`
  - Toast de confirmação
  - Status: ❓ Não testado

- [ ] **Adicionar Coluna**
  - Botão: "Nova Coluna"
  - Status: 🚧 Não implementado

- [ ] **Deletar Coluna**
  - Botão no menu de contexto
  - Status: 🚧 Não implementado

---

## 3. PROPOSTAS 📄

**Rota**: `/propostas`
**Componente**: `src/components/pages/Propostas.jsx`

### 3.1 Listagem de Propostas
- [ ] **View Grid**
  - Cards em grid 3 colunas
  - Componente: `PropostaCard.jsx`
  - Status: ❓ Não testado

- [ ] **View Lista**
  - Tabela com todas propostas
  - Componente: `PropostasTable.jsx`
  - Status: ❓ Não testado

- [ ] **Toggle Grid/Lista**
  - Botões de alternância
  - Status: ❓ Não testado

### 3.2 Criar Proposta
- [ ] **Botão "Nova Proposta"**
  - Abre: `NovaPropostaDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: cliente, descricao, itens
  - Status: ❓ Não testado

- [ ] **Selecionar Cliente**
  - Lista: entities tipo 'cliente'
  - Status: ❓ Não testado

- [ ] **Adicionar Itens**
  - Busca: produtos_servicos (pricelist)
  - Componente: Select de produtos
  - Status: ❓ Não testado

- [ ] **Calcular Valores**
  - Por item: quantidade * valor_unitario
  - Total: soma de todos itens
  - Status: ❓ Não testado

- [ ] **Salvar Proposta**
  - LocalStorage: crm_propostas
  - Gera: numero automático
  - Status: ❓ Não testado

### 3.3 Editar Proposta
- [ ] **Botão "Editar"**
  - Ícone de edição no card
  - Status: ❓ Não testado

- [ ] **Modal de Edição**
  - Preenche com dados existentes
  - Permite modificar itens
  - Status: ❓ Não testado

- [ ] **Salvar Alterações**
  - Update no LocalStorage
  - Status: ❓ Não testado

### 3.4 Aprovar/Rejeitar
- [ ] **Botão "Aprovar"**
  - Muda status para 'aprovada'
  - Toast de sucesso
  - Status: ❓ Não testado

- [ ] **Botão "Rejeitar"**
  - Muda status para 'rejeitada'
  - Toast de aviso
  - Status: ❓ Não testado

### 3.5 Gerar Contrato
- [ ] **Botão "Gerar Contrato"**
  - Disponível apenas se status = 'aprovada'
  - Abre: `NovoContratoDialog` com proposta pré-preenchida
  - Status: ❓ Não testado

- [ ] **Pre-fill Contrato**
  - Cliente, valor, itens copiados da proposta
  - Status: ❓ Não testado

### 3.6 Exportar PDF
- [ ] **Botão "PDF"**
  - Gera PDF da proposta
  - Biblioteca: jspdf + html2canvas
  - Status: ❓ Não testado

- [ ] **Preview Invisível**
  - Componente: `PropostaPDF` renderizado fora da tela
  - Status: ❓ Não testado

- [ ] **Download Automático**
  - Arquivo: `proposta-{numero}.pdf`
  - Status: ❓ Não testado

### 3.7 Deletar Proposta
- [ ] **Botão "Deletar"**
  - Ícone de lixeira
  - Status: ❓ Não testado

- [ ] **Alert Dialog de Confirmação**
  - "Você tem certeza?"
  - Evita exclusão acidental
  - Status: ❓ Não testado

- [ ] **Remover do Storage**
  - Remove de crm_propostas
  - Toast de confirmação
  - Status: ❓ Não testado

---

## 4. CONTRATOS 📝

**Rota**: `/contratos`
**Componente**: `src/components/pages/Contratos.jsx`

### 4.1 Listagem de Contratos
- [ ] **Lista de Contratos**
  - Cards em lista
  - Exibe: tipo, cliente, data
  - Status: ❓ Não testado

- [ ] **Badge de Tipo**
  - Cores: arquitetura (azul), engenharia (laranja), marcenaria (amarelo)
  - Status: ❓ Não testado

### 4.2 Criar Contrato
- [ ] **Botão "Novo Contrato"**
  - Abre: `NovoContratoDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: cliente, tipo, modelo, conteudo
  - Status: ❓ Não testado

- [ ] **Selecionar Tipo**
  - Opções: arquitetura, engenharia, marcenaria, prestacao_servicos
  - Status: ❓ Não testado

- [ ] **Selecionar Modelo**
  - Lista: modelos salvos em LocalStorage
  - Status: ❓ Não testado

- [ ] **Carregar Modelo**
  - Preenche textarea com conteúdo do modelo
  - Status: ❓ Não testado

- [ ] **Editar Conteúdo**
  - Textarea livre
  - Status: ❓ Não testado

- [ ] **Salvar Contrato**
  - LocalStorage: crm_contratos
  - Status: 'Rascunho'
  - Status: ❓ Não testado

### 4.3 Gerar de Proposta
- [ ] **Botão em Proposta**
  - Na página de Propostas, botão "Gerar Contrato"
  - Status: ❓ Não testado

- [ ] **Dialog Pre-filled**
  - Cliente, valor, itens vindos da proposta
  - Conteúdo inicial automático
  - Status: ❓ Não testado

### 4.4 Exportar PDF
- [ ] **Botão "Download"**
  - Gera PDF do contrato
  - Componente: `ContratoPDF`
  - Status: ❓ Não testado

- [ ] **Download Automático**
  - Arquivo: `contrato-{cliente}.pdf`
  - Status: ❓ Não testado

### 4.5 Deletar Contrato
- [ ] **Botão "Deletar"**
  - Ícone de lixeira
  - Status: ❓ Não testado

- [ ] **Alert Dialog**
  - Confirmação de exclusão
  - Status: ❓ Não testado

### 4.6 Gerenciar Modelos
- [ ] **Acesso via Configurações**
  - Menu: Configurações > Gerais > Criação e Alteração de Contratos
  - Componente: `GerenciarModelosContrato.jsx`
  - Status: ❓ Não testado

- [ ] **Criar Modelo**
  - Campos: nome, tipo, conteudo
  - Status: ❓ Não testado

- [ ] **Editar Modelo**
  - Status: ❓ Não testado

- [ ] **Deletar Modelo**
  - Status: ❓ Não testado

---

## 5. ARQUITETURA (Kanban) 🏛️

**Rota**: `/arquitetura`
**Componente**: `src/components/pages/Arquitetura.jsx`

### 5.1 Board Kanban
- [ ] **Carregar Board**
  - Busca: kanban_boards ambiente 'arquitetura'
  - Busca: kanban_colunas do board
  - Busca: kanban_cards das colunas
  - Status: ❓ Não testado

- [ ] **Exibir Cards**
  - Cards de projetos de arquitetura
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem: "Nenhum projeto de arquitetura ativo"
  - Status: ❓ Não testado

### 5.2 Interações
- [ ] **Drag and Drop**
  - Status: 🚧 "Funcionalidade em desenvolvimento"

- [ ] **Renomear Coluna**
  - Status: 🚧 Não implementado

- [ ] **Editar Card**
  - Status: 🚧 "Edição de projeto em breve!"

---

## 6. ENGENHARIA/OBRAS (Kanban) 🏗️

**Rota**: `/engenharia`
**Componente**: `src/components/pages/Obras.jsx`

### 6.1 Board Kanban
- [ ] **Carregar Board**
  - Busca: kanban_boards ambiente 'engenharia'
  - Filtro: oportunidades com servicos_contratados = 'engenharia' e fase = 'ganha'
  - Status: ❓ Não testado

- [ ] **Exibir Cards**
  - Cards de obras/reformas
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem: "Nenhuma obra ou reforma ativa"
  - Status: ❓ Não testado

### 6.2 Interações
- [ ] **Drag and Drop**
  - Status: 🚧 "Funcionalidade em desenvolvimento"

- [ ] **Renomear Coluna**
  - Função implementada
  - Status: ❓ Não testado

- [ ] **Editar Card**
  - Status: 🚧 "Edição de projeto em breve!"

---

## 7. MARCENARIA (Kanban) 🔨

**Rota**: `/marcenaria`
**Componente**: `src/components/pages/Marcenaria.jsx`

### 7.1 Board Kanban
- [ ] **Carregar Board**
  - Busca: kanban_boards ambiente 'marcenaria'
  - Status: ❓ Não testado

- [ ] **Exibir Cards**
  - Cards de projetos de marcenaria
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem: "Nenhum projeto de marcenaria ativo"
  - Status: ❓ Não testado

### 7.2 Interações
- [ ] **Drag and Drop**
  - Status: 🚧 "Funcionalidade em desenvolvimento"

- [ ] **Renomear Coluna**
  - Status: 🚧 Não implementado

- [ ] **Editar Card**
  - Status: 🚧 "Edição de projeto em breve!"

---

## 8. COMPRAS 🛒

**Rota**: `/compras`
**Componente**: `src/components/pages/Compras.jsx`

### 8.1 Listagem de Pedidos
- [ ] **Agrupamento por Cliente**
  - Cards expansíveis por cliente
  - Exibe: total de itens, valor total
  - Status: ❓ Não testado

- [ ] **Expandir/Recolher Cliente**
  - Clique no card abre lista de PCs
  - Status: ❓ Não testado

- [ ] **Cards de PC**
  - Componente: `CompraCard.jsx`
  - Exibe: numero, valor, status
  - Status: ❓ Não testado

### 8.2 Criar Pedido de Compra
- [ ] **Botão "Novo PC"**
  - Abre: `NovoPcDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: cliente, itens, fornecedor, valor
  - Status: ❓ Não testado

- [ ] **Salvar PC**
  - LocalStorage: crm_compras
  - Status: ❓ Não testado

### 8.3 Editar Pedido
- [ ] **Botão "Editar"**
  - Ícone no card
  - Status: ❓ Não testado

- [ ] **Modal de Edição**
  - Preenche com dados existentes
  - Status: ❓ Não testado

### 8.4 Deletar Pedido
- [ ] **Botão "Deletar"**
  - Ícone no card
  - Toast de confirmação
  - Status: ❓ Não testado

### 8.5 Funcionalidades Extras
- [ ] **Buscar na Leroy Merlin**
  - Botão: "Buscar na Leroy Merlin"
  - Abre: site da Leroy em nova aba
  - Status: ❓ Não testado

- [ ] **Consolidar Pedidos**
  - Botão por cliente
  - Status: 🚧 Não implementado

---

## 9. ASSISTÊNCIA TÉCNICA 🔧

**Rota**: `/assistencia`
**Componente**: `src/components/pages/Assistencia.jsx`

### 9.1 Listagem de Ordens de Serviço
- [ ] **Lista de OS**
  - Cards ordenados por created_at desc
  - Exibe: codigo, cliente, descricao, status
  - Status: ❓ Não testado

- [ ] **Badge de Status**
  - Cores por status: aberta (cinza), agendado (amarelo), em_atendimento (laranja), atendido (verde), em_atraso (vermelho)
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem: "Nenhum chamado aberto"
  - Status: ❓ Não testado

### 9.2 Criar Ordem de Serviço
- [ ] **Botão "Solicitar Assistência"**
  - Abre: dialog inline
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: cliente, descricao
  - Status padrão: 'aberta'
  - Status: ❓ Não testado

- [ ] **Selecionar Cliente**
  - Combobox com busca
  - Lista: entities tipo 'cliente'
  - Status: ❓ Não testado

- [ ] **Salvar OS**
  - Insert: assistencias
  - Gera código: `AST-{ano}-{timestamp}`
  - Status: ❓ Não testado

### 9.3 Editar Ordem de Serviço
- [ ] **Botão "Editar"**
  - Ícone no card
  - Status: ❓ Não testado

- [ ] **Modal de Edição**
  - Permite: alterar descricao, status
  - Cliente: não editável
  - Status: ❓ Não testado

- [ ] **Atualizar Status**
  - Select com opções: aberta, agendado, em_atendimento, atendido, em_atraso
  - Status: ❓ Não testado

### 9.4 Deletar Ordem de Serviço
- [ ] **Botão "Deletar"** (Admin only)
  - Componente: Can (permissões)
  - Delete: assistencias
  - Status: ❓ Não testado

### 9.5 Funcionalidades Extras
- [ ] **Gerar PDF**
  - Botão: ícone de download
  - Status: 🚧 "geração de PDF em breve"

---

## 10. FINANCEIRO 💰

**Rota**: `/financeiro`
**Componente**: `src/components/pages/Financeiro.jsx`

### 10.1 Cards de Métricas
- [ ] **Total de Receitas**
  - Soma: lancamentos onde titulo.tipo = 'receita'
  - Status: ❓ Não testado

- [ ] **Total de Despesas**
  - Soma: lancamentos onde titulo.tipo = 'despesa'
  - Status: ❓ Não testado

- [ ] **Saldo Atual**
  - Cálculo: receitas - despesas
  - Cor: verde (positivo), vermelho (negativo)
  - Status: ❓ Não testado

- [ ] **Lucratividade**
  - Cálculo: (saldo / receitas) * 100
  - Status: ❓ Não testado

### 10.2 Tabs
- [ ] **Tab: Lançamentos**
  - Tabela com histórico
  - Componente: `LancamentosTab`
  - Status: ❓ Não testado

- [ ] **Tab: Calculadora de Prazos**
  - Componente: `PrazoCalculator`
  - Status: ❓ Não testado

- [ ] **Tab: Centros de Custo**
  - Status: 🚧 Não implementado

- [ ] **Tab: Fluxo de Caixa**
  - Status: 🚧 Não implementado

- [ ] **Tab: Relatórios**
  - Status: 🚧 Não implementado

### 10.3 Lançamentos
- [ ] **Tabela de Lançamentos**
  - Colunas: SDP, Data, Tipo, Centro de Custo, Categoria, Total, Status
  - Busca: lancamentos com joins (titulo, centro_custo, categoria)
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem: "Nenhum lançamento registrado"
  - Status: ❓ Não testado

### 10.4 Calculadora de Prazos
- [ ] **Input: Data Emissão**
  - Campo: date
  - Status: ❓ Não testado

- [ ] **Input: Prazo (dias úteis)**
  - Campo: number
  - Status: ❓ Não testado

- [ ] **Output: Data Vencimento**
  - Cálculo: addBusinessDays (considera feriados)
  - Hook: useBusinessDays
  - Status: ❓ Não testado

- [ ] **Indicador SLA**
  - Cores: vermelho (<=1 dia), amarelo (<=3 dias), verde (>3 dias)
  - Status: ❓ Não testado

### 10.5 Funcionalidades Extras
- [ ] **Novo Lançamento**
  - Botão
  - Status: 🚧 Não implementado

---

## 11. PESSOAS (Entities) 👥

**Rota**: `/pessoas`
**Componente**: `src/components/pages/Pessoas.jsx`

### 11.1 Tabs por Tipo
- [ ] **Tab: Clientes**
  - Filtro: entities tipo 'cliente'
  - Status: ❓ Não testado

- [ ] **Tab: Colaboradores**
  - Filtro: entities tipo 'colaborador'
  - Status: ❓ Não testado

- [ ] **Tab: Fornecedores**
  - Filtro: entities tipo 'fornecedor'
  - Status: ❓ Não testado

### 11.2 Listagem
- [ ] **Tabela de Entidades**
  - Colunas: Nome, CPF/CNPJ, Email, Telefone, Cidade/UF, Ações
  - Status: ❓ Não testado

- [ ] **Estado Vazio**
  - Mensagem por tipo: "Nenhum(a) {tipo} cadastrado(a)"
  - Status: ❓ Não testado

### 11.3 Criar Pessoa
- [ ] **Botão "Nova Pessoa"**
  - Abre: `NovaPessoaDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Criação**
  - Campos: tipo, nome_razao_social, cpf_cnpj, email, telefone, endereco
  - Status: ❓ Não testado

- [ ] **Salvar Entity**
  - LocalStorage: crm_entities
  - Status: ❓ Não testado

### 11.4 Editar Pessoa
- [ ] **Botão "Editar"**
  - Ícone na tabela
  - Status: ❓ Não testado

- [ ] **Modal de Edição**
  - Preenche com dados existentes
  - Status: ❓ Não testado

---

## 12. USUÁRIOS E PERMISSÕES 👤

**Rota**: `/usuarios`
**Componente**: `src/components/pages/Usuarios.jsx`

### 12.1 Restrição de Acesso
- [ ] **Verificação de Role**
  - Apenas role = 'admin' pode acessar
  - Outros roles: tela de "Acesso Restrito"
  - Status: ❓ Não testado

### 12.2 Listagem de Usuários
- [ ] **Lista de Usuários**
  - Busca: supabase.auth.admin.listUsers()
  - Join: usuarios_perfis
  - Status: ❓ Não testado

- [ ] **Card de Usuário**
  - Exibe: avatar, nome, email, role
  - Status: ❓ Não testado

- [ ] **Badge de Role**
  - Cores: admin (vermelho), gestor (laranja), comercial (azul), financeiro (verde), operacional (cinza)
  - Status: ❓ Não testado

### 12.3 Editar Usuário
- [ ] **Botão "Editar"**
  - Abre: `EditUsuarioDialog`
  - Status: ❓ Não testado

- [ ] **Modal de Edição**
  - Campos: nome, role
  - Status: ❓ Não testado

- [ ] **Salvar Alterações**
  - Update: usuarios_perfis
  - Status: ❓ Não testado

### 12.4 Funcionalidades Extras
- [ ] **Novo Usuário**
  - Botão
  - Status: 🚧 Não implementado

- [ ] **Deletar Usuário**
  - Botão
  - Status: 🚧 Não implementado

- [ ] **Upload Avatar**
  - Ref: fileInputRef
  - Status: 🚧 Não implementado

---

## 13. CONFIGURAÇÕES ⚙️

**Rota**: `/configuracoes`
**Componente**: `src/components/pages/Configuracoes.jsx`

### 13.1 Estrutura de Menu
- [ ] **Menu Lateral**
  - Módulos: Gerais, Comercial, Usuários e Acessos, Financeiro, Logística
  - Expandível/recolhível
  - Status: ❓ Não testado

- [ ] **Submenus**
  - Cada módulo tem submenus específicos
  - Status: ❓ Não testado

### 13.2 Gerais
- [ ] **Informações da Empresa**
  - Buscar CNPJ via BrasilAPI
  - Salvar em LocalStorage: crm_empresas_cadastradas
  - Status: ❓ Não testado

- [ ] **Criação e Alteração de Contratos**
  - Componente: `GerenciarModelosContrato`
  - CRUD de modelos
  - Status: ❓ Não testado

- [ ] **Feriados**
  - Componente: `FeriadosManager`
  - Lista feriados do ano atual
  - Hook: useFeriados
  - Status: ❓ Não testado

### 13.3 Comercial
- [ ] **Produtos e Serviços (Pricelist)**
  - Componente: `PricelistManager`
  - CRUD: produtos_servicos
  - Campos: nome, descricao, unidade, valor_unitario, markup_percent, categoria, imagem_url
  - Cálculo: valor_venda = valor_unitario * (1 + markup_percent/100)
  - Status: ❓ Não testado

- [ ] **Especificadores**
  - Componente: `EspecificadoresManager`
  - Lista: especificadores (arquitetos parceiros)
  - Hook: useEspecificadores
  - Status: ❓ Não testado

- [ ] **Procedência de Clientes**
  - Componente: `SimpleListManager`
  - Tabela: procedencia_clientes
  - Status: ❓ Não testado

- [ ] **Equipes**
  - Componente: `SimpleListManager`
  - Tabela: equipes_venda
  - Status: ❓ Não testado

- [ ] **Motivos de Perdas**
  - Status: 🚧 PlaceholderContent

### 13.4 Usuários e Acessos
- [ ] **Cargos e Permissões**
  - Status: 🚧 PlaceholderContent

- [ ] **Comissões**
  - Status: 🚧 PlaceholderContent

### 13.5 Financeiro
- [ ] **Contas e Bancos**
  - Componente: `BancosManager`
  - Lista: bancos cadastrados
  - Hook: useBancos
  - Status: ❓ Não testado

- [ ] **Plano de Contas**
  - Status: 🚧 PlaceholderContent

- [ ] **Categorias**
  - Componente: `SimpleListManager`
  - Tabela: categorias_fin
  - Status: ❓ Não testado

### 13.6 Logística
- [ ] **Transportadoras**
  - Status: 🚧 PlaceholderContent

---

## 14. OUTROS MÓDULOS

### 14.1 Onboarding
**Rota**: `/onboarding`
**Componente**: `src/components/pages/Onboarding.jsx`

- [ ] **Tela de Onboarding**
  - Status: ❓ Não testado

### 14.2 Portal do Cliente
**Rota**: `/portal-cliente/:id`
**Componente**: `src/pages/PortalCliente.jsx`

- [ ] **Portal Personalizado**
  - Exibe informações do cliente
  - Status: ❓ Não testado

### 14.3 Integrações
**Rota**: `/integrations`
**Componente**: `src/pages/IntegrationsPage.jsx`

- [ ] **Página de Integrações**
  - Status: ❓ Não testado

### 14.4 Placeholder Pages
**Rotas**: `/colaboradores`, `/fornecedores`
**Componente**: `src/components/pages/PlaceholderPage.jsx`

- [ ] **Página Placeholder**
  - Mensagem: "Em construção"
  - Status: ❓ Não testado

---

## 15. COMPONENTES COMPARTILHADOS

### 15.1 Layout
- [ ] **Sidebar**
  - Componente: `src/components/layout/Sidebar.jsx`
  - Navegação principal
  - Expansível/recolhível
  - Status: ❓ Não testado

- [ ] **Header**
  - Componente: `src/components/layout/Header.jsx`
  - Usuário, notificações
  - Status: ❓ Não testado

### 15.2 Kanban
- [ ] **KanbanBoard**
  - Componente: `src/components/oportunidades/KanbanBoard.jsx`
  - Drag and drop
  - Usado em: Oportunidades, Arquitetura, Engenharia, Marcenaria
  - Status: ❓ Não testado

- [ ] **KanbanColumn**
  - Componente: `src/components/oportunidades/KanbanColumn.jsx`
  - Coluna individual
  - Status: ❓ Não testado

### 15.3 UI Components (shadcn/ui)
- [ ] **Button**
- [ ] **Dialog**
- [ ] **Input**
- [ ] **Select**
- [ ] **Textarea**
- [ ] **Tabs**
- [ ] **Card**
- [ ] **Badge**
- [ ] **Avatar**
- [ ] **Alert Dialog**
- [ ] **Command**
- [ ] **Popover**
- [ ] **Toggle Group**
- [ ] **Toast**

(Todos em `src/components/ui/`)

---

## 16. HOOKS CUSTOMIZADOS

### 16.1 Hooks de Dados
- [ ] **useAuth**
  - Local: `src/hooks/useAuth.js`
  - Contexto: SupabaseAuthContext
  - Funcionalidades: user, session, signOut, profile
  - Status: ❓ Não testado

- [ ] **useLocalStorage**
  - Local: `src/hooks/useLocalStorage.js`
  - Funcionalidades: get, set, sincronizar com LocalStorage
  - Status: ❓ Não testado

- [ ] **useBancos**
  - Local: `src/hooks/useBancos.js`
  - Busca: lista de bancos
  - Status: ❓ Não testado

- [ ] **useFeriados**
  - Local: `src/hooks/useFeriados.js`
  - Busca: feriados por ano/UF
  - Status: ❓ Não testado

- [ ] **useEspecificadores**
  - Local: `src/hooks/useEspecificadores.js`
  - Busca: lista de especificadores
  - Status: ❓ Não testado

- [ ] **useBusinessDays**
  - Local: `src/hooks/useBusinessDays.js`
  - Funcionalidades: addBusinessDays, getBusinessDaysDiff, formatDate
  - Integração com feriados
  - Status: ❓ Não testado

### 16.2 Hooks de UI
- [ ] **useCart** (Ecommerce)
  - Local: `src/hooks/useCart.jsx`
  - Funcionalidades: addToCart, removeFromCart, cart
  - Status: ❓ Não testado

- [ ] **use-toast**
  - Local: `src/components/ui/use-toast.js`
  - Notificações toast
  - Status: ❓ Não testado

---

## 17. CONTEXTOS

### 17.1 Autenticação
- [ ] **SupabaseAuthContext**
  - Local: `src/contexts/SupabaseAuthContext.jsx`
  - Provider: envolve toda aplicação
  - Dados: user, session, profile, signIn, signOut
  - Componente Can: verificação de permissões
  - Status: ❓ Não testado

### 17.2 Financeiro
- [ ] **FinancialContext**
  - Local: `src/contexts/FinancialContext.jsx`
  - Status: ❓ Não testado

---

## 18. INTEGRAÇÕES COM SUPABASE

### 18.1 Tabelas Usadas
- [ ] **kanban_boards**
  - Ambientes: oportunidades, arquitetura, engenharia, marcenaria
  - Status: ❓ Não testado

- [ ] **kanban_colunas**
  - Relacionamento: kanban_boards
  - Campos: titulo, posicao, cor
  - Status: ❓ Não testado

- [ ] **kanban_cards**
  - Relacionamento: kanban_colunas, entities
  - Campos: titulo, descricao, valor, entity_id, responsavel_id, dados
  - Status: ❓ Não testado

- [ ] **entities**
  - Tipos: cliente, colaborador, fornecedor
  - Campos: nome_razao_social, cpf_cnpj, email, telefone, endereco
  - Status: ❓ Não testado

- [ ] **assistencias**
  - Campos: codigo, cliente_id, descricao, status, data_solicitacao
  - Status: ❓ Não testado

- [ ] **lancamentos**
  - Join: titulos, centro_custo, categoria
  - Campos: valor, titulo_id, centro_custo_cliente_id, categoria_id
  - Status: ❓ Não testado

- [ ] **produtos_servicos**
  - Campos: nome, descricao, unidade, valor_unitario, markup_percent, categoria, imagem_url
  - Computed: valor_venda
  - Status: ❓ Não testado

- [ ] **usuarios_perfis** (profiles)
  - Campos: user_id, nome, role, avatar_url
  - Status: ❓ Não testado

### 18.2 Views Usadas
- [ ] **v_kanban_cards_board**
  - Join completo de cards com boards
  - Status: ❓ Não testado

### 18.3 Funções SQL
(Nenhuma chamada diretamente no frontend identificada nesta análise)

---

## 19. STORAGE (LocalStorage)

### 19.1 Keys Utilizadas
- [ ] **crm_oportunidades**
  - DEPRECIADO (migrando para banco)
  - Status: ❓ Verificar migração

- [ ] **crm_propostas**
  - Armazena: propostas criadas
  - Status: ⚠️ Deveria estar no banco

- [ ] **crm_contratos**
  - Armazena: contratos criados
  - Status: ⚠️ Deveria estar no banco

- [ ] **crm_compras**
  - Armazena: pedidos de compra
  - Status: ⚠️ Deveria estar no banco

- [ ] **crm_entities**
  - DEPRECIADO (migrando para banco)
  - Status: ❓ Verificar migração

- [ ] **crm_empresas_cadastradas**
  - Armazena: empresas do grupo (CNPJ)
  - Status: ⚠️ Deveria estar no banco

- [ ] **crm_contratos_modelos**
  - Armazena: modelos de contrato
  - Status: ⚠️ Deveria estar no banco

---

## 20. ANIMAÇÕES E UX

### 20.1 Framer Motion
- [ ] **Page Transitions**
  - initial, animate, exit
  - Status: ❓ Não testado

- [ ] **Card Animations**
  - Stagger children
  - Status: ❓ Não testado

- [ ] **Hover Effects**
  - whileHover, whileTap
  - Status: ❓ Não testado

### 20.2 Loading States
- [ ] **Spinners**
  - Componente: Loader2 (lucide-react)
  - Usado em: todas páginas com fetch
  - Status: ❓ Não testado

- [ ] **Skeleton Loaders**
  - Status: ❌ Não implementado

---

## 21. VALIDAÇÕES E FORMULÁRIOS

### 21.1 Validações Frontend
- [ ] **Campos Obrigatórios**
  - Toast de erro se vazio
  - Status: ❓ Não testado

- [ ] **Máscaras de Input**
  - CPF/CNPJ
  - Telefone
  - CEP
  - Local: `src/lib/masks.js`
  - Status: ❓ Não testado

### 21.2 Validações Backend
- [ ] **RLS (Row Level Security)**
  - Configurado nas tabelas
  - Status: ❓ Não testado

---

## 22. ECOMMERCE (Store)

**Rota**: `/store`
**Componente**: `src/pages/StoreLayout.jsx`

### 22.1 Loja
- [ ] **Listagem de Produtos**
  - Componente: `ProductsList.jsx`
  - Status: ❓ Não testado

- [ ] **Carrinho**
  - Componente: `ShoppingCart.jsx`
  - Hook: useCart
  - Status: ❓ Não testado

- [ ] **Detalhe do Produto**
  - Rota: `/product/:id`
  - Status: ❓ Não testado

- [ ] **Checkout**
  - Rota: `/success`
  - Status: ❓ Não testado

---

## 23. LANDING PAGE

**Rota**: `/`
**Componente**: `src/pages/LandingPage.jsx`

### 23.1 Componentes
- [ ] **Hero Image**
  - Componente: `HeroImage.jsx`
  - Status: ❓ Não testado

- [ ] **Call to Action**
  - Componente: `CallToAction.jsx`
  - Status: ❓ Não testado

- [ ] **Welcome Message**
  - Componente: `WelcomeMessage.jsx`
  - Status: ❓ Não testado

---

## 24. AUTENTICAÇÃO

### 24.1 Login
**Rota**: `/login`
**Componente**: `src/pages/Login.jsx`

- [ ] **Login com Email/Senha**
  - Supabase Auth
  - Status: ❓ Não testado

- [ ] **Login com Google OAuth**
  - Configurado
  - Status: ❓ Não testado

### 24.2 Registro
**Rota**: `/register`
**Componente**: `src/pages/Register.jsx`

- [ ] **Criar Nova Conta**
  - Supabase Auth
  - Cria profile automático
  - Status: ❓ Não testado

### 24.3 Logout
- [ ] **Botão Sair**
  - Sidebar
  - Chama: signOut()
  - Redireciona: `/`
  - Status: ❓ Não testado

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### ✅ Funcionalidades Completas
1. Dashboard com métricas
2. Oportunidades (Kanban) com CRUD
3. Propostas com CRUD e PDF
4. Contratos com CRUD e PDF
5. Assistência com CRUD
6. Usuários com edição (admin)
7. Configurações (Pricelist, Bancos, Feriados, Especificadores)
8. Autenticação completa (login, registro, OAuth)

### 🚧 Funcionalidades Parciais
1. Arquitetura (Kanban read-only)
2. Engenharia (Kanban read-only)
3. Marcenaria (Kanban read-only)
4. Compras (sem consolidação)
5. Financeiro (sem novo lançamento)
6. Pessoas (sem integração completa com banco)

### ❌ Funcionalidades Não Implementadas
1. Drag and drop nos boards operacionais (Arquitetura, Engenharia, Marcenaria)
2. Criação de novos usuários
3. Upload de avatar
4. Centros de custo
5. Fluxo de caixa
6. Relatórios financeiros
7. Plano de contas
8. Cargos e permissões customizados
9. Comissões
10. Transportadoras

### ⚠️ Migrações Pendentes (LocalStorage → Supabase)
1. Propostas
2. Contratos
3. Compras
4. Empresas
5. Modelos de contrato

---

## 🔬 PLANO DE TESTES

### Metodologia
1. **Testar funcionalidade por funcionalidade**
2. **Marcar status**: ✅ (OK), ❌ (erro), ⚠️ (parcial), 🚧 (não implementado)
3. **Documentar erros encontrados**
4. **Criar issues/tasks para correções**

### Sessões de Teste Sugeridas

#### Sessão 1: Dashboard e Navegação
- Dashboard widgets
- Sidebar navigation
- Header
- Navegação entre páginas

#### Sessão 2: Kanban e Oportunidades
- Board de oportunidades
- CRUD de oportunidades
- Drag and drop
- Renomear colunas

#### Sessão 3: Propostas e Contratos
- CRUD de propostas
- Adicionar itens
- Gerar PDFs
- CRUD de contratos
- Gerar contrato de proposta

#### Sessão 4: Boards Operacionais
- Arquitetura
- Engenharia
- Marcenaria
- Transição de oportunidades ganhas

#### Sessão 5: Compras e Assistência
- CRUD de pedidos de compra
- Agrupamento por cliente
- CRUD de ordens de serviço
- Status e workflows

#### Sessão 6: Financeiro
- Métricas
- Lançamentos
- Calculadora de prazos

#### Sessão 7: Pessoas e Usuários
- CRUD de entities
- Tabs por tipo
- Gestão de usuários (admin)
- Permissões

#### Sessão 8: Configurações
- Pricelist (produtos e serviços)
- Modelos de contrato
- Bancos e feriados
- Especificadores

#### Sessão 9: Autenticação
- Login/logout
- Registro
- OAuth Google
- Proteção de rotas

#### Sessão 10: Integrações e UX
- Animações
- Loading states
- Toasts
- Validações

---

## 🐛 LOG DE BUGS ENCONTRADOS

### Bug #1 - Cards "Status das Obras" Quebrados ✅ RESOLVIDO
- **Data**: 03/11/2025
- **Funcionalidade**: Dashboard → Widget "Status das Obras"
- **Localização**: `/dashboard` - Seção "Status das Obras"
- **Descrição**:
  - Os cards de status das obras (Planejamento, Em Andamento, Concluída, Pausada) estavam exibindo apenas "0"
  - Componente: `src/components/dashboard/ObrasStatus.jsx`
- **Severidade**: Médio
- **Status**: ✅ **RESOLVIDO**
- **Evidência**: Screenshot fornecido pelo usuário

**CAUSA RAIZ:**
- View `v_obras_status` existia e estava correta
- Migration 017 foi aplicada com sucesso
- Problema: Tabela `obras` estava **vazia** (0 registros)
- View retornava 0 rows, componente exibia todos os cards com "0"

**SOLUÇÃO APLICADA:**
1. ✅ Criados 3 clientes de teste (entities)
2. ✅ Criados 8 obras de teste com status variados:
   - Planejamento: 2 obras (R$ 470.000)
   - Em Andamento: 3 obras (R$ 1.365.000)
   - Concluída: 2 obras (R$ 440.000)
   - Pausada: 1 obra (R$ 1.200.000)
3. ✅ Cards agora exibem valores corretos
4. ✅ Screenshot de comprovação: `status-obras-funcionando.png`

**ARQUIVOS CRIADOS/MODIFICADOS:**
- Dados de teste inseridos via SQL direto no PostgreSQL
- Nenhuma alteração de código necessária (bug era de dados, não de código)

**LIÇÕES APRENDIDAS:**
- Sempre popular tabelas com dados de seed em ambiente de desenvolvimento
- View estava correta, componente estava correto, apenas faltavam dados
- Migration 017 (`v_obras_status`) funciona perfeitamente quando há dados

---

### Bug #2 - Cards Dashboard Mostrando R$ 0 / Valores Vazios ✅ RESOLVIDO
- **Data Identificação**: 03/11/2025 16:20
- **Data Resolução**: 03/11/2025 17:45
- **Funcionalidade**: Dashboard → Múltiplos cards de métricas
- **Localização**: `/dashboard` - Várias seções
- **Descrição**: 9 cards diferentes estavam mostrando valores zerados
- **Severidade**: Médio (bug de código + dados faltantes)
- **Status**: ✅ RESOLVIDO

**CARDS AFETADOS E CORRIGIDOS:**

**Gerenciamento Comercial:**
1. Oportunidades → R$ 3.2M ✅ (já funcionava - kanban_cards)
2. Propostas em Negociação → R$ 448k ✅ RESOLVIDO

**Operacional em Andamento:**
3. Contratos Arquitetura → R$ 150k ✅ RESOLVIDO
4. Contratos Engenharia → R$ 78k ✅ RESOLVIDO
5. Contratos Marcenaria → R$ 217k ✅ RESOLVIDO

**Cards de Alertas:**
6. Materiais críticos → 0 ⚠️ (esperado - sem dados de compras)
7. PCs atrasados → 0 ⚠️ (esperado - sem dados de compras)
8. Itens < piso H → 0 ⚠️ (esperado - sem propostas com flag)
9. OS pendentes → 5 ✅ RESOLVIDO

**CAUSA RAIZ IDENTIFICADA:**
1. **Propostas**: Hardcoded vazio! (Dashboard.jsx linha 128: `setPropostas([])`)
2. **Contratos**: Buscando kanban_cards ao invés da tabela `contratos` por tipo
3. **Assistências**: Hardcoded 0, não buscava tabela `assistencias`

**SOLUÇÃO APLICADA:**

**1. Migration 026** - Seed completo de dados teste:
```sql
-- 10 kanban_cards (oportunidades) distribuídos no pipeline
-- 6 propostas (R$ 593.000) com status variados
-- 5 contratos ativos (R$ 445.000) - arquitetura, engenharia, marcenaria
-- 6 assistências técnicas (5 pendentes)
```

**2. Correção Dashboard.jsx** (`src/components/pages/Dashboard.jsx`):
```javascript
// ANTES (linhas 49-129): Código problemático
setPropostas([]);  // ❌ Hardcoded!
// Buscava kanban_cards para contratos ❌
// OS pendentes hardcoded 0 ❌

// DEPOIS (linhas 50-80): Correção aplicada
// Buscar propostas REAIS da tabela
const { data: propostasData } = await supabase
  .from('propostas')
  .select('*')
  .in('status', ['enviada', 'pendente', 'aprovada']);
setPropostas(propostasData || []);

// Buscar assistências REAIS
const { data: assistenciasData } = await supabase
  .from('assistencias')
  .select('*')
  .in('status', ['aberta', 'agendado', 'em_atendimento']);
setAssistencias(assistenciasData || []);

// Buscar contratos da TABELA contratos (não kanban)
const { data: contratosData } = await supabase
  .from('contratos')
  .select('tipo, valor_total')
  .eq('status', 'ativo');

// Calcular totais por tipo
setValorArquitetura(contratosData.filter(c => c.tipo === 'arquitetura').reduce(...));
setValorEngenharia(contratosData.filter(c => c.tipo === 'engenharia').reduce(...));
setValorMarcenaria(contratosData.filter(c => c.tipo === 'marcenaria').reduce(...));
```

**ARQUIVOS MODIFICADOS:**
- `/Supabase/migrations/026_seed_dados_completo_dashboard.sql` (NOVO)
- `/wg-crm/src/components/pages/Dashboard.jsx` (EDITADO)

**RESULTADO:**
✅ **100% dos cards funcionando com dados reais!**
- Oportunidades: R$ 3.2M (10 cards no pipeline)
- Propostas: R$ 448k (6 propostas ativas)
- Contratos Arq: R$ 150k (1 contrato ativo)
- Contratos Eng: R$ 78k (1 contrato ativo)
- Contratos Marc: R$ 217k (2 contratos ativos)
- OS pendentes: 5 (assistências em aberto)

**LIÇÕES APRENDIDAS:**
- ⚠️ Nunca deixar dados hardcoded vazios em produção
- ✅ Verificar se componente busca da tabela CORRETA (não assumir estrutura)
- ✅ Migration de seed é ESSENCIAL para desenvolvimento local
- ✅ Sempre popular dados de teste ao criar novas features

---

### Bug #3 - Texto "uiBa" Quebrado no Card Status das Obras
- **Data**: 03/11/2025
- **Funcionalidade**: Dashboard → Status das Obras
- **Localização**: `/dashboard` - Card "Status das Obras"
- **Descrição**: Aparece texto "uiBa" quebrado/cortado no card, provavelmente bug de CSS
- **Severidade**: Baixo (cosmético)
- **Status**: ❌ Identificado
- **Screenshot**: dashboard-cards-alertas.png

**CAUSA PROVÁVEL:**
- Texto mal posicionado (overflow)
- CSS quebrado em algum elemento
- Possível texto de debug que não foi removido

---

### Bug #4
- **Data**:
- **Funcionalidade**:
- **Descrição**:
- **Severidade**: (Crítico/Alto/Médio/Baixo)
- **Status**:

(Template para próximos bugs encontrados)

---

## ✨ MELHORIAS SUGERIDAS

### Melhoria #1
- **Funcionalidade**:
- **Descrição**:
- **Prioridade**: (Alta/Média/Baixa)

(Template para preenchimento durante testes)

---

## 📊 ESTATÍSTICAS FINAIS

(Preencher após conclusão dos testes)

### Funcionalidades por Módulo
- **Dashboard**: X/Y testadas
- **Oportunidades**: X/Y testadas
- **Propostas**: X/Y testadas
- **Contratos**: X/Y testadas
- **Arquitetura**: X/Y testadas
- **Engenharia**: X/Y testadas
- **Marcenaria**: X/Y testadas
- **Compras**: X/Y testadas
- **Assistência**: X/Y testadas
- **Financeiro**: X/Y testadas
- **Pessoas**: X/Y testadas
- **Usuários**: X/Y testadas
- **Configurações**: X/Y testadas

### Taxa de Sucesso
- **Funcionalidades OK**: X%
- **Funcionalidades com Erros**: X%
- **Funcionalidades Não Implementadas**: X%

---

**Última atualização**: 03/11/2025
**Próxima revisão**: Após primeira rodada de testes
**Responsável**: Equipe de Desenvolvimento WG CRM
