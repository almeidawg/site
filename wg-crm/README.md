# CRM Grupo WG Almeida

Sistema CRM completo para gestão de obras, marcenaria, arquitetura e loja online do Grupo WG Almeida.

## Descrição

Aplicação web moderna desenvolvida em React com Vite, oferecendo uma solução completa de CRM (Customer Relationship Management) integrada com e-commerce. O sistema gerencia todo o ciclo de vendas, desde a captação de leads até a gestão financeira e operacional de obras.

## Tecnologias Principais

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 4.4.5
- **Roteamento**: React Router DOM 6.16.0
- **Estilização**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI + shadcn/ui
- **Backend/Auth**: Supabase 2.30.0
- **Animações**: Framer Motion 10.16.4
- **Gráficos**: Recharts 2.12.7
- **PDF Generation**: jsPDF 2.5.1
- **Drag & Drop**: React Beautiful DnD 13.1.1

## Funcionalidades

### Gestão de Relacionamento
- **Leads**: Captação e qualificação de potenciais clientes
- **Clientes**: Cadastro completo e histórico de interações
- **Pessoas**: Gestão de contatos relacionados
- **Oportunidades**: Pipeline visual com Kanban board

### Vendas e Contratos
- **Propostas**: Criação e gestão de propostas comerciais
- **Contratos**: Gerenciamento de modelos e contratos ativos
- **E-commerce**: Loja online integrada com catálogo de produtos

### Gestão de Obras
- **Arquitetura**: Projetos arquitetônicos
- **Marcenaria**: Projetos e produção de móveis
- **Logística**: Controle de entregas e instalações
- **Assistência Técnica**: Suporte pós-venda

### Financeiro e Operacional
- **Financeiro**: Títulos a pagar e receber, fluxo de caixa
- **Compras**: Pedidos de compra e gestão de fornecedores
- **Dashboard**: Métricas e indicadores em tempo real

### Configuração
- **Usuários**: Gestão de acessos e permissões
- **Integrações**: Conexões com sistemas externos
- **Configurações**: Personalização do sistema

## Estrutura do Projeto (Nova Organização)

```
wg-crm/
├── src-new/                    # Código-fonte reorganizado
│   ├── features/               # Módulos de negócio (feature-based)
│   │   ├── auth/              # Autenticação e autorização
│   │   ├── clientes/          # Gestão de clientes
│   │   ├── compras/           # Pedidos de compra
│   │   ├── contratos/         # Gestão de contratos
│   │   ├── dashboard/         # Dashboard e métricas
│   │   ├── ecommerce/         # Loja online
│   │   ├── financeiro/        # Gestão financeira
│   │   ├── leads/             # Captação de leads
│   │   ├── obras/             # Gestão de obras (arquitetura, marcenaria, etc)
│   │   ├── oportunidades/     # Pipeline de vendas (Kanban)
│   │   ├── pessoas/           # Gestão de pessoas/contatos
│   │   └── propostas/         # Propostas comerciais
│   │
│   ├── shared/                # Código compartilhado
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   └── ui/           # Componentes de UI (Radix/shadcn)
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Funções utilitárias
│   │   └── constants/        # Constantes da aplicação
│   │       ├── api.js        # Configurações de API
│   │       ├── routes.js     # Rotas da aplicação
│   │       └── app.js        # Constantes gerais
│   │
│   ├── core/                  # Configurações base
│   │   ├── api/              # Camada de API
│   │   ├── contexts/         # React Contexts
│   │   ├── layout/           # Componentes de layout
│   │   ├── lib/              # Bibliotecas e configurações
│   │   └── config/           # Páginas de configuração
│   │
│   ├── pages/                 # Páginas principais
│   ├── App.jsx               # Componente raiz
│   ├── main.jsx              # Entry point
│   └── index.css             # Estilos globais
│
├── plugins/                   # Plugins Vite customizados
├── public/                    # Arquivos estáticos
├── tools/                     # Scripts e ferramentas
├── .env.example              # Template de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── package.json              # Dependências e scripts
├── vite.config.js            # Configuração do Vite
└── tailwind.config.js        # Configuração do Tailwind CSS
```

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+ (verificar versão no arquivo `.nvmrc`)
- npm ou yarn
- Conta no Supabase (para backend e autenticação)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd wg-crm
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas credenciais:
   ```env
   VITE_SUPABASE_URL=sua-url-do-supabase
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:3000`

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (porta 3000)
npm run build    # Gera build de produção
npm run preview  # Visualiza build de produção (porta 3000)
```

## Estrutura de Dados (Supabase)

O projeto utiliza Supabase como backend. As principais tabelas incluem:

- `users` - Usuários do sistema
- `clientes` - Clientes cadastrados
- `leads` - Leads captados
- `oportunidades` - Pipeline de vendas
- `propostas` - Propostas comerciais
- `contratos` - Contratos ativos
- `titulos` - Títulos financeiros (a pagar/receber)
- `compras` - Pedidos de compra
- (consulte a documentação do Supabase para schema completo)

## Autenticação

O sistema usa Supabase Auth para gerenciamento de autenticação. Funcionalidades:

- Login com email/senha
- Registro de novos usuários
- Recuperação de senha
- Sessões persistentes
- Proteção de rotas

## Contribuindo

### Convenções de Código

- Use TypeScript quando possível (migração em andamento)
- Componentes em PascalCase
- Funções e variáveis em camelCase
- Constantes em UPPER_SNAKE_CASE
- Use Prettier para formatação

### Estrutura de Componentes

Ao criar novos componentes, siga a estrutura modular:

```jsx
// src-new/features/[modulo]/NomeComponente.jsx
import React from 'react';

export const NomeComponente = () => {
  return (
    // JSX
  );
};
```

### Adicionando Novas Features

1. Crie um novo diretório em `src-new/features/[nome-feature]/`
2. Adicione os componentes específicos da feature
3. Exporte via `index.js` para facilitar imports
4. Atualize as rotas em `src-new/shared/constants/routes.js`

## Roadmap

- [ ] Migração completa para TypeScript
- [ ] Implementação de testes unitários (Jest/Vitest)
- [ ] Implementação de testes E2E (Playwright)
- [ ] Sistema de notificações em tempo real
- [ ] Relatórios avançados e BI
- [ ] App mobile (React Native)
- [ ] API REST documentada

## Licença

Propriedade do Grupo WG Almeida. Todos os direitos reservados.

## Suporte

Para questões ou suporte, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 0.0.0
**Última atualização**: Outubro 2025
