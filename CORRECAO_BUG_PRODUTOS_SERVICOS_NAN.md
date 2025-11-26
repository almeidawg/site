# 🐛 CORREÇÃO BUG - Produtos e Serviços (NaN)

**Data**: 2025-11-25
**Módulo Afetado**: Configurações → Comercial → Produtos e Serviços (Pricelist)
**Arquivo**: `wg-crm/src/components/pages/Configuracoes.jsx`
**Componente**: `PricelistManager` (linhas 211-365)

---

## 🔍 DIAGNÓSTICO COMPLETO

### Sintoma

Na tela de "Configurações → Comercial → Produtos e Serviços", os itens exibem:

```
Projeto Arquitetônico (m²)
Custo: R$ 1.500,00
Venda: R$ NaN  ← BUG AQUI!
```

---

## 🎯 CAUSA RAIZ

**Linhas 352-353** (PricelistManager):

```javascript
<p className="text-sm">Custo: {parseFloat(p.valor_unitario).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
<p className="text-sm font-bold text-primary">Venda: {parseFloat(p.valor_venda).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
```

**Problema**:
- Código usa `p.valor_venda` (linha 353)
- **Tabela `produtos_servicos` NÃO TEM esse campo!**
- Campos reais da tabela:
  - `valor_unitario` (custo base)
  - `markup_percent` (percentual de markup)
  - **NÃO tem** `valor_venda` como coluna separada

**Fluxo do Erro**:
```javascript
1. p.valor_venda → undefined (campo não existe no banco)
2. parseFloat(undefined) → NaN
3. NaN.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'}) → "NaN"
4. Tela exibe: "Venda: R$ NaN"
```

---

## ✅ SOLUÇÃO

### Opção 1: Calcular Valor de Venda Dinamicamente (Recomendado)

**Lógica**:
```
valor_venda = valor_unitario × (1 + markup_percent / 100)

Exemplo:
custo = 1500
markup = 30%
venda = 1500 × (1 + 30/100) = 1500 × 1.30 = 1950
```

**Código Corrigido** (linhas 345-361):

```javascript
<div className="space-y-2">
    {loading ? <Loader2 className="animate-spin" /> : produtos.map(p => {
        // CALCULAR VALOR DE VENDA DINAMICAMENTE
        const valorCusto = parseFloat(p.valor_unitario) || 0;
        const markupPercent = parseFloat(p.markup_percent) || 0;
        const valorVenda = valorCusto * (1 + markupPercent / 100);

        return (
            <div key={p.id} className="flex justify-between items-center p-3 bg-white/80 rounded-lg">
                <div className="flex items-center gap-4">
                    {p.imagem_url && <img src={p.imagem_url} alt={p.nome} className="w-16 h-16 object-cover rounded-md" />}
                    <div>
                        <p className="font-semibold">{p.nome} <span className="text-xs text-muted-foreground font-normal">({p.unidade})</span></p>
                        <p className="text-sm">Custo: {valorCusto.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                        <p className="text-sm font-bold text-primary">Venda: {valorVenda.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}</p>
                        {markupPercent > 0 && (
                            <p className="text-xs text-muted-foreground">Markup: {markupPercent}%</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setProdutoToEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash className="h-4 w-4 text-red-500" /></Button>
                </div>
            </div>
        );
    })}
</div>
```

---

### Opção 2: Adicionar Coluna `valor_venda` no Banco (Redundante)

**NÃO RECOMENDADO** porque:
- Cria redundância (dado calculável)
- Precisa atualizar 2 campos sempre que mudar custo ou markup
- Risco de inconsistência

Mas se quiser mesmo assim:

**Migration SQL**:
```sql
-- Adicionar coluna valor_venda
ALTER TABLE produtos_servicos
ADD COLUMN IF NOT EXISTS valor_venda NUMERIC(12, 2);

-- Calcular valor_venda para registros existentes
UPDATE produtos_servicos
SET valor_venda = valor_unitario * (1 + COALESCE(markup_percent, 0) / 100);

-- Trigger para atualizar valor_venda automaticamente
CREATE OR REPLACE FUNCTION update_valor_venda()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_venda := NEW.valor_unitario * (1 + COALESCE(NEW.markup_percent, 0) / 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_valor_venda
BEFORE INSERT OR UPDATE OF valor_unitario, markup_percent
ON produtos_servicos
FOR EACH ROW
EXECUTE FUNCTION update_valor_venda();
```

**Código Frontend** (se usar essa opção):
```javascript
<p className="text-sm font-bold text-primary">
    Venda: {(parseFloat(p.valor_venda) || 0).toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}
</p>
```

---

## 📋 TESTE DA CORREÇÃO

### Antes da Correção:
```
✅ Custo: R$ 1.500,00
❌ Venda: R$ NaN
```

### Depois da Correção (Opção 1):
```
✅ Custo: R$ 1.500,00
✅ Venda: R$ 1.950,00
✅ Markup: 30%
```

### Casos de Teste:

| Custo | Markup (%) | Venda Esperada | Fórmula |
|-------|-----------|----------------|---------|
| R$ 1.500,00 | 30% | R$ 1.950,00 | 1500 × 1.30 |
| R$ 500,00 | 0% | R$ 500,00 | 500 × 1.00 |
| R$ 2.000,00 | 50% | R$ 3.000,00 | 2000 × 1.50 |
| R$ 100,00 | 100% | R$ 200,00 | 100 × 2.00 |

---

## 🔧 APLICAÇÃO DA CORREÇÃO

### PASSO 1: Backup

```bash
# Criar backup do arquivo
cp wg-crm/src/components/pages/Configuracoes.jsx wg-crm/src/components/pages/Configuracoes.jsx.backup
```

### PASSO 2: Aplicar Correção

Substituir **linhas 345-361** pelo código corrigido acima (Opção 1).

### PASSO 3: Testar Localmente

```bash
cd wg-crm
npm run dev

# Abrir: http://localhost:5173
# Navegar: Configurações → Comercial → Produtos e Serviços
# Verificar:
# - Custo exibe valor correto
# - Venda exibe valor correto (custo × markup)
# - NÃO aparece NaN
```

### PASSO 4: Testar Diferentes Cenários

1. **Produto com markup 0%**: Venda = Custo
2. **Produto com markup 50%**: Venda = Custo × 1.5
3. **Produto sem markup (null)**: Venda = Custo (fallback para 0%)
4. **Produto sem custo**: Venda = R$ 0,00

---

## 🎓 MELHORIA ADICIONAL (BÔNUS)

### Adicionar Cálculo Visual de Margem

```javascript
const lucro = valorVenda - valorCusto;
const margemPercent = valorCusto > 0 ? ((lucro / valorVenda) * 100).toFixed(1) : 0;

// No JSX:
<p className="text-xs text-muted-foreground">
    Margem: {margemPercent}% | Lucro: {lucro.toLocaleString('pt-BR', {style:'currency', currency: 'BRL'})}
</p>
```

**Resultado**:
```
Projeto Arquitetônico (m²)
Custo: R$ 1.500,00
Venda: R$ 1.950,00
Markup: 30% | Margem: 23.1% | Lucro: R$ 450,00
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após aplicar correção, verificar:

- [ ] ✅ Valores de Custo exibem corretamente (sem NaN)
- [ ] ✅ Valores de Venda exibem corretamente (sem NaN)
- [ ] ✅ Markup 0% → Venda = Custo
- [ ] ✅ Markup 30% → Venda = Custo × 1.30
- [ ] ✅ Produtos sem markup (null) → tratados como 0%
- [ ] ✅ Produtos sem custo → exibem R$ 0,00
- [ ] ✅ Formulário de Novo Item salva corretamente
- [ ] ✅ Formulário de Editar Item atualiza corretamente
- [ ] ✅ Não há erros no console do navegador
- [ ] ✅ Não há warnings do React

---

## 📊 ANÁLISE ADICIONAL

### Verificar Schema da Tabela `produtos_servicos`

```sql
-- Executar no Supabase SQL Editor:
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'produtos_servicos'
ORDER BY ordinal_position;
```

**Schema Esperado**:
```
column_name        | data_type | is_nullable | column_default
-------------------+-----------+-------------+---------------
id                 | uuid      | NO          | gen_random_uuid()
nome               | text      | NO          |
descricao          | text      | YES         |
unidade            | text      | YES         |
valor_unitario     | numeric   | YES         |
categoria          | text      | YES         |
imagem_url         | text      | YES         |
markup_percent     | numeric   | YES         | 0
created_at         | timestamp | YES         | now()
updated_at         | timestamp | YES         | now()
```

**Confirmar**:
- ✅ `valor_unitario` existe
- ✅ `markup_percent` existe
- ❌ `valor_venda` NÃO existe (confirmando o bug)

---

## 🚀 PRÓXIMOS PASSOS

1. Aplicar correção (Opção 1 - cálculo dinâmico)
2. Testar localmente
3. Validar cenários de edge case
4. Commit no Git
5. Deploy em produção

---

## 📝 COMMIT SUGERIDO

```bash
git add wg-crm/src/components/pages/Configuracoes.jsx
git commit -m "fix: Corrige exibição NaN em Produtos/Serviços (Configurações)

- Calcula valor_venda dinamicamente (custo × markup)
- Remove referência ao campo inexistente 'valor_venda'
- Adiciona tratamento de valores null/undefined
- Exibe markup percentual na listagem
- Testa casos: markup 0%, 30%, 50%, 100%

Corrige bug: #BUG-001 - Produtos mostrando R$ NaN na venda
"
```

---

**SOLUÇÃO RECOMENDADA**: **Opção 1** (cálculo dinâmico)

**Tempo estimado de correção**: 5 minutos

**Risco**: Baixo (correção isolada em 1 componente)

**Testabilidade**: Alta (resultado visual imediato)

---

**Gerado por**: Claude Code
**Data**: 2025-11-25
**Versão**: 1.0
