# Guia de Estrutura do Projeto

## Visão Geral da Reorganização

Este projeto foi reorganizado de uma estrutura baseada em tipos de arquivos para uma estrutura **modular baseada em features**, seguindo as melhores práticas modernas de desenvolvimento React.

## Comparação: Estrutura Antiga vs Nova

### ❌ Estrutura Antiga (Baseada em Tipos)

```
src/
├── components/
│   ├── clientes/
│   ├── financeiro/
│   ├── pages/          ⚠️ Duplicação
│   └── ui/
├── pages/              ⚠️ Duplicação
├── hooks/
├── contexts/
└── api/
```

**Problemas:**
- Duplicação entre `src/pages/` e `src/components/pages/`
- Difícil navegação em projetos grandes
- Acoplamento implícito entre módulos
- Difícil identificar dependências de features

### ✅ Nova Estrutura (Baseada em Features)

```
src-new/
├── features/           # Módulos de negócio independentes
│   ├── auth/
│   ├── clientes/
│   └── ...
├── shared/            # Código compartilhado
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── constants/
├── core/              # Configurações base
│   ├── api/
│   ├── contexts/
│   └── layout/
└── pages/             # Páginas principais
```

**Vantagens:**
- Organização clara por domínio de negócio
- Fácil localização de código relacionado
- Melhor escalabilidade
- Facilita trabalho em equipe
- Reduz acoplamento

## Detalhamento dos Diretórios

### 📁 `src-new/features/`

Módulos de negócio independentes. Cada feature deve conter todos os seus recursos relacionados.

#### Estrutura de uma Feature

```
features/clientes/
├── components/         # Componentes específicos da feature
│   ├── ClientesTable.jsx
│   └── NovoClienteDialog.jsx
├── hooks/             # Hooks específicos (opcional)
│   └── useClientes.js
├── services/          # Lógica de negócio (opcional)
│   └── clientesService.js
├── types/             # TypeScript types (futuro)
│   └── cliente.types.ts
├── Clientes.jsx       # Página principal
└── index.js           # Exports públicos
```

#### Features Disponíveis

| Feature | Descrição |
|---------|-----------|
| `auth/` | Autenticação, registro, onboarding |
| `clientes/` | Gestão de clientes |
| `compras/` | Pedidos de compra |
| `contratos/` | Gestão de contratos |
| `dashboard/` | Dashboard e métricas |
| `ecommerce/` | Loja online, produtos, carrinho |
| `financeiro/` | Títulos, fluxo de caixa |
| `leads/` | Captação de leads |
| `obras/` | Arquitetura, marcenaria, logística, assistência |
| `oportunidades/` | Pipeline de vendas (Kanban) |
| `pessoas/` | Gestão de contatos |
| `propostas/` | Propostas comerciais |

### 📁 `src-new/shared/`

Código compartilhado entre múltiplas features.

```
shared/
├── components/
│   ├── ui/                    # Componentes de UI (Radix/shadcn)
│   │   ├── button.jsx
│   │   ├── dialog.jsx
│   │   └── ...
│   └── ClienteProjetoCard.jsx # Componentes compartilhados
│
├── hooks/                     # Custom hooks reutilizáveis
│   ├── useAuth.js
│   ├── useCart.jsx
│   ├── useLocalStorage.js
│   └── useBusinessDays.js
│
├── utils/                     # Funções utilitárias
│   ├── utils.js              # Utilitários gerais
│   └── masks.js              # Máscaras de input
│
└── constants/                 # Constantes da aplicação
    ├── api.js                # URLs, endpoints
    ├── routes.js             # Rotas
    └── app.js                # Constantes gerais
```

### 📁 `src-new/core/`

Configurações fundamentais da aplicação.

```
core/
├── api/                       # Camada de API
│   └── EcommerceApi.js
│
├── contexts/                  # React Contexts
│   ├── SupabaseAuthContext.jsx
│   └── FinancialContext.jsx
│
├── layout/                    # Componentes de layout
│   ├── CrmLayout.jsx
│   ├── Sidebar.jsx
│   └── Header.jsx
│
├── lib/                       # Bibliotecas e configs
│   └── customSupabaseClient.js
│
└── config/                    # Páginas de configuração
    ├── Configuracoes.jsx
    └── Usuarios.jsx
```

### 📁 `src-new/pages/`

Páginas principais e públicas que não pertencem a uma feature específica.

```
pages/
├── Login.jsx
├── Register.jsx
├── PublicCadastroPage.jsx
├── StoreLayout.jsx
├── ProductDetailPage.jsx
├── SuccessPage.jsx
└── PortalCliente.jsx
```

## Convenções de Nomenclatura

### Arquivos e Pastas

- **Componentes React**: `PascalCase.jsx` (ex: `NovoClienteDialog.jsx`)
- **Páginas**: `PascalCase.jsx` (ex: `Clientes.jsx`)
- **Hooks**: `camelCase.js` com prefixo `use` (ex: `useAuth.js`)
- **Utilitários**: `camelCase.js` (ex: `masks.js`)
- **Constantes**: `camelCase.js` (ex: `api.js`)
- **Pastas**: `lowercase` (ex: `clientes/`, `shared/`)

### Código

```javascript
// Constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Funções
const formatCurrency = (value) => { /* ... */ };

// Componentes
const ClientCard = ({ cliente }) => { /* ... */ };

// Classes (se usar)
class ApiClient { /* ... */ }
```

## Padrões de Import

### Uso de Alias (@)

Configure no `vite.config.js`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src-new'),
  }
}
```

### Exemplos de Import

```javascript
// Componentes de UI
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';

// Hooks
import { useAuth } from '@/shared/hooks/useAuth';

// Constantes
import { ROUTES } from '@/shared/constants/routes';
import { ECOMMERCE_API_URL } from '@/shared/constants/api';

// Contexts
import { useAuth } from '@/core/contexts/SupabaseAuthContext';

// Features
import { ClientesTable } from '@/features/clientes';
```

## Migração da Estrutura Antiga

### Passo a Passo

1. **Atualize o vite.config.js**
   ```javascript
   alias: {
     '@': path.resolve(__dirname, './src-new'),
   }
   ```

2. **Renomeie diretórios**
   ```bash
   mv src src-old
   mv src-new src
   ```

3. **Atualize imports nos arquivos**
   - Use find & replace para atualizar caminhos
   - Substitua imports relativos por imports com alias `@/`

4. **Teste a aplicação**
   ```bash
   npm run dev
   ```

5. **Remova estrutura antiga (após validação)**
   ```bash
   rm -rf src-old
   ```

### Script de Migração Automática

```bash
#!/bin/bash
# migrate-structure.sh

# Backup
cp -r src src-backup-$(date +%Y%m%d)

# Rename
mv src src-old
mv src-new src

# Update imports (exemplo básico)
find src -type f -name "*.jsx" -o -name "*.js" | while read file; do
  sed -i '' 's|@/components/ui|@/shared/components/ui|g' "$file"
  sed -i '' 's|@/hooks|@/shared/hooks|g' "$file"
done

echo "Migração concluída! Teste a aplicação com 'npm run dev'"
```

## Organização de Componentes por Feature

### Exemplo: Feature de Clientes

```
features/clientes/
├── components/
│   ├── ClientesTable.jsx      # Tabela de clientes
│   ├── NovoClienteDialog.jsx  # Dialog de criação
│   └── ClienteCard.jsx        # Card individual
│
├── hooks/
│   └── useClientes.js         # Hook para gerenciar clientes
│
├── Clientes.jsx               # Página principal
└── index.js                   # Exports
```

**index.js:**
```javascript
export { default as Clientes } from './Clientes';
export { ClientesTable } from './components/ClientesTable';
export { NovoClienteDialog } from './components/NovoClienteDialog';
```

**Uso:**
```javascript
import { Clientes, ClientesTable } from '@/features/clientes';
```

## Boas Práticas

### ✅ Faça

- Mantenha features independentes e auto-contidas
- Use constantes centralizadas para valores compartilhados
- Extraia lógica complexa para hooks ou services
- Documente componentes complexos
- Use TypeScript types quando migrar

### ❌ Evite

- Importar de outras features diretamente (use shared)
- Duplicar código entre features
- Componentes muito grandes (> 300 linhas)
- Lógica de negócio em componentes de UI
- Constantes hardcoded

## Escalabilidade

### Adicionando Nova Feature

1. Crie diretório em `features/`
2. Adicione componentes e lógica
3. Exporte via `index.js`
4. Atualize rotas em `shared/constants/routes.js`
5. Documente no README

### Dividindo Features Grandes

Se uma feature crescer muito, divida em sub-features:

```
features/obras/
├── arquitetura/
│   ├── components/
│   └── Arquitetura.jsx
├── marcenaria/
│   ├── components/
│   └── Marcenaria.jsx
└── shared/
    └── ObrasLayout.jsx
```

## Recursos Adicionais

- [React File Structure Best Practices](https://reactjs.org/docs/faq-structure.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

---

**Última atualização**: Outubro 2025
