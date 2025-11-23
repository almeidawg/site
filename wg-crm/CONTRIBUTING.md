# Guia de Contribuição

Obrigado por contribuir com o CRM Grupo WG Almeida! Este guia ajudará você a entender como trabalhar no projeto.

## Índice

- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
- [Commits e Pull Requests](#commits-e-pull-requests)

## Configuração do Ambiente

### Requisitos

- Node.js 18+ (use a versão especificada em `.nvmrc`)
- npm 9+
- Git

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repository-url>
cd wg-crm

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Ferramentas Recomendadas

- **Editor**: VS Code
- **Extensões VS Code**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

## Padrões de Código

### JavaScript/JSX

```javascript
// ✅ Bom
const ClientCard = ({ cliente, onEdit }) => {
  const handleEdit = () => {
    onEdit(cliente.id);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold">{cliente.nome}</h3>
      <Button onClick={handleEdit}>Editar</Button>
    </div>
  );
};

// ❌ Evite
function clientCard(props) {
  return <div onClick={() => props.onEdit(props.cliente.id)}>{props.cliente.nome}</div>;
}
```

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ClienteCard`, `NovoLeadDialog` |
| Funções | camelCase | `formatCurrency`, `handleSubmit` |
| Hooks | camelCase + use | `useAuth`, `useClientes` |
| Constantes | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_URL` |
| Arquivos | PascalCase (componentes)<br>camelCase (outros) | `ClientCard.jsx`<br>`utils.js` |
| Pastas | lowercase | `clientes/`, `shared/` |

### Imports

Organize imports na seguinte ordem:

```javascript
// 1. React e bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Componentes de UI
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';

// 3. Hooks e utils
import { useAuth } from '@/shared/hooks/useAuth';
import { formatCurrency } from '@/shared/utils/utils';

// 4. Constantes
import { ROUTES } from '@/shared/constants/routes';

// 5. Contexts
import { useFinancial } from '@/core/contexts/FinancialContext';

// 6. Componentes locais
import { ClienteCard } from './components/ClienteCard';

// 7. Estilos (se necessário)
import './styles.css';
```

### Componentes

#### Estrutura de Componente Funcional

```javascript
import React from 'react';
import { Button } from '@/shared/components/ui/button';

/**
 * Card de exibição de cliente
 *
 * @param {Object} props
 * @param {Object} props.cliente - Dados do cliente
 * @param {Function} props.onEdit - Callback ao editar
 * @param {Function} props.onDelete - Callback ao deletar
 */
export const ClienteCard = ({ cliente, onEdit, onDelete }) => {
  // Estados
  const [isLoading, setIsLoading] = React.useState(false);

  // Efeitos
  React.useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleEdit = () => {
    setIsLoading(true);
    onEdit(cliente.id);
  };

  const handleDelete = () => {
    if (confirm('Tem certeza?')) {
      onDelete(cliente.id);
    }
  };

  // Render
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold">{cliente.nome}</h3>
      <p className="text-gray-600">{cliente.email}</p>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleEdit} disabled={isLoading}>
          Editar
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Deletar
        </Button>
      </div>
    </div>
  );
};
```

### Tailwind CSS

```jsx
// ✅ Bom - Classes organizadas e legíveis
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <span className="text-lg font-semibold text-gray-900">Título</span>
  <Button className="px-4 py-2">Ação</Button>
</div>

// ❌ Evite - Classes muito longas
<div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out transform hover:scale-105">
  ...
</div>
```

Use `cn()` para classes condicionais:

```javascript
import { cn } from '@/shared/utils/utils';

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-blue-100 border-blue-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  ...
</div>
```

## Estrutura do Projeto

Consulte [STRUCTURE.md](./STRUCTURE.md) para detalhes completos.

### Adicionando Nova Feature

1. **Crie o diretório da feature**
   ```bash
   mkdir -p src/features/nova-feature/components
   ```

2. **Adicione os arquivos**
   ```
   features/nova-feature/
   ├── components/
   │   └── NovaFeatureCard.jsx
   ├── NovaFeature.jsx
   └── index.js
   ```

3. **Exporte no index.js**
   ```javascript
   export { default as NovaFeature } from './NovaFeature';
   export { NovaFeatureCard } from './components/NovaFeatureCard';
   ```

4. **Adicione a rota**
   ```javascript
   // src/shared/constants/routes.js
   export const ROUTES = {
     // ...
     NOVA_FEATURE: '/nova-feature',
   };
   ```

5. **Configure no App.jsx**
   ```javascript
   import { NovaFeature } from '@/features/nova-feature';

   // No routes
   <Route path={ROUTES.NOVA_FEATURE} element={<NovaFeature />} />
   ```

## Workflow de Desenvolvimento

### 1. Branches

```bash
# Feature
git checkout -b feature/nome-da-feature

# Bugfix
git checkout -b fix/descricao-do-bug

# Hotfix
git checkout -b hotfix/descricao-urgente
```

### 2. Desenvolvimento

```bash
# Faça suas alterações
# ...

# Teste localmente
npm run dev

# Valide o build
npm run build
```

### 3. Commits

Use mensagens de commit descritivas no formato:

```
tipo(escopo): descrição curta

Descrição mais longa se necessário
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, estilos
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de manutenção

**Exemplos:**

```bash
git commit -m "feat(clientes): adiciona filtro por cidade"
git commit -m "fix(financeiro): corrige cálculo de juros"
git commit -m "docs(readme): atualiza instruções de instalação"
git commit -m "refactor(auth): simplifica lógica de autenticação"
```

### 4. Pull Requests

#### Checklist antes de abrir PR

- [ ] Código testado localmente
- [ ] Build executa sem erros (`npm run build`)
- [ ] Sem warnings no console
- [ ] Código formatado (use Prettier)
- [ ] Documentação atualizada se necessário
- [ ] Commits bem organizados

#### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de mudança
- [ ] Nova feature
- [ ] Bugfix
- [ ] Refatoração
- [ ] Documentação

## Como testar
1. Faça X
2. Clique em Y
3. Verifique Z

## Checklist
- [ ] Código testado
- [ ] Build sem erros
- [ ] Documentação atualizada

## Screenshots (se aplicável)
[Adicione screenshots]
```

## Boas Práticas

### Performance

```javascript
// ✅ Use memo para componentes pesados
const ClienteCard = React.memo(({ cliente }) => {
  // ...
});

// ✅ Use useMemo para cálculos pesados
const totalValue = React.useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);

// ✅ Use useCallback para funções passadas como props
const handleEdit = React.useCallback((id) => {
  // ...
}, []);
```

### Acessibilidade

```jsx
// ✅ Use labels apropriados
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ✅ Use ARIA quando necessário
<button aria-label="Fechar modal" onClick={onClose}>
  <X />
</button>

// ✅ Use elementos semânticos
<main>
  <article>
    <header>...</header>
    <section>...</section>
  </article>
</main>
```

### Segurança

```javascript
// ✅ Nunca commite credenciais
const apiKey = process.env.VITE_API_KEY;

// ✅ Valide inputs do usuário
const sanitizedInput = DOMPurify.sanitize(userInput);

// ✅ Use HTTPS sempre
const API_URL = 'https://api.example.com';
```

## Dúvidas?

- Consulte a [documentação completa](./README.md)
- Veja a [estrutura do projeto](./STRUCTURE.md)
- Entre em contato com a equipe

---

**Última atualização**: Outubro 2025
