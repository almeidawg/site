# 🔧 Instruções para Correção do Módulo Financeiro

## 📋 Resumo
Este guia explica como aplicar as correções necessárias para resolver os erros do módulo financeiro identificados no console do navegador.

## ✅ Correções Realizadas no Código

Já foram corrigidos automaticamente os seguintes arquivos:

1. **`src/modules/financeiro/hooks/useLancamentos.js`**
   - ✅ Corrigida desestruturação incorreta do retorno do service

2. **`src/modules/financeiro/pages/FinanceiroLancamentosPage.jsx`**
   - ✅ Corrigidos imports de funções
   - ✅ Ajustados nomes de campos para compatibilidade com API
   - ✅ Corrigida exibição de dados na tabela

3. **`src/modules/financeiro/services/lancamentos.js`**
   - ✅ Removida referência a campo inexistente `nome_razao_social` em obras

## 🗄️ Correções Necessárias no Banco de Dados

Para completar a correção, é necessário aplicar um script SQL no Supabase.

### Opção 1: Via Supabase Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o script:**
   - Abra o arquivo: `APLICAR_FIX_FINANCEIRO.sql`
   - Copie todo o conteúdo
   - Cole no editor SQL
   - Clique em "Run" (F5)

4. **Verifique os resultados:**
   - O script mostrará mensagens de sucesso
   - Verifique a seção "Verificação final" no resultado

### Opção 2: Via Linha de Comando (psql)

Se você tiver acesso ao psql:

```bash
psql "postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres" < APLICAR_FIX_FINANCEIRO.sql
```

## 📊 O que o Script Faz

### Parte 1: Colunas Faltantes
- ✅ Adiciona coluna `nome` na tabela `obras` (alias para `titulo`)
- ✅ Adiciona coluna `nome_razao_social` na tabela `entities`

### Parte 2: Tabelas Criadas
- ✅ `cobrancas` - Cobranças e faturas
- ✅ `categorias_custo` - Categorias de custo
- ✅ `solicitacoes_pagamento` - Solicitações de pagamento
- ✅ `comissoes` - Comissões de vendas
- ✅ `catalog_items` - Catálogo de produtos/serviços
- ✅ `fin_categories` - Categorias financeiras
- ✅ `reembolsos` - Reembolsos

### Parte 3: Configurações
- ✅ Índices para otimização
- ✅ Row Level Security habilitado
- ✅ Políticas de acesso configuradas
- ✅ Triggers para `updated_at`

## 🎯 Erros que Serão Resolvidos

Após aplicar o script, os seguintes erros do console não aparecerão mais:

```
❌ Could not find the table 'public.cobrancas' in the schema cache
❌ Could not find the table 'public.solicitacoes_pagamento' in the schema cache
❌ Could not find the table 'public.comissoes' in the schema cache
❌ Could not find the table 'public.catalog_items' in the schema cache
❌ Could not find the table 'public.reembolsos' in the schema cache
❌ Could not find the table 'public.fin_categories' in the schema cache
❌ Could not find the table 'public.categorias_custo' in the schema cache
❌ column entities.nome_razao_social does not exist
❌ column obras.nome does not exist
```

## ⚠️ Notas Importantes

1. **Backup**: O script é seguro e usa `CREATE TABLE IF NOT EXISTS`, mas é sempre bom ter um backup
2. **RLS Policies**: As políticas de acesso estão configuradas com permissão total (`true`). Ajuste conforme suas regras de negócio
3. **Computed Columns**: As colunas `nome` e `nome_razao_social` são geradas automaticamente, mantendo sincronia com os dados originais
4. **Idempotência**: O script pode ser executado múltiplas vezes sem causar erros

## 🧪 Testando as Correções

Após aplicar o script:

1. **Recarregue a aplicação** no navegador (Ctrl+Shift+R)
2. **Abra o Console do DevTools** (F12)
3. **Navegue até o módulo financeiro**
4. **Verifique que não há mais erros** relacionados a tabelas/colunas inexistentes

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do SQL Editor no Supabase
2. Confirme que todas as tabelas foram criadas
3. Verifique se há mensagens de erro específicas

## ✨ Resultado Esperado

Depois de aplicar todas as correções:
- ✅ Módulo financeiro funcionando sem erros
- ✅ Todas as páginas carregando corretamente
- ✅ Console do navegador limpo
- ✅ Compatibilidade total entre código e banco de dados
