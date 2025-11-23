# 🔧 Correção do Drag & Drop no Kanban

## Problema Identificado

O drag-and-drop do Kanban mostrava "Oportunidade Movida!" mas o card não persistia na nova posição. Ao recarregar, voltava para o local original.

## Causa Raiz

### 1. Trigger no Banco de Dados
- **Trigger**: `kanban_cards_autordem_upd` (migration 022)
- **Problema**: O trigger verificava se `NEW.posicao = OLD.posicao`
- **Consequência**: Se a posição era igual, ele IGNORAVA nosso valor e colocava o card no FINAL da coluna

### 2. Incompatibilidade de Valores
- **Frontend enviava**: índices baseados em zero (0, 1, 2...)
- **Trigger esperava**: múltiplos de 10 (10, 20, 30...)
- **Resultado**: Posições sempre conflitavam, trigger sobrescrevia

### 3. Estado Local Inconsistente
- Atualizava apenas array `oportunidades`
- Não atualizava objeto `columns` corretamente
- Visual e estado ficavam dessincronizados

### 4. Toast de Sucesso Incorreto
- Mostrava "Movido!" ANTES de verificar erro no banco
- Usuário achava que funcionou, mas não salvou

## Solução Implementada

### 1. Compatibilidade com Trigger
```javascript
// Converter índice para múltiplo de 10
const novaPosicao = (destination.index + 1) * 10;
// Index 0 → Posição 10
// Index 1 → Posição 20
// Index 2 → Posição 30
```

### 2. Atualização Completa do Estado
```javascript
// Remove da coluna origem
const sourceItems = [...sourceColumn.items];
sourceItems.splice(source.index, 1);

// Adiciona na coluna destino
const destItems = [...destColumn.items];
destItems.splice(destination.index, 0, updatedItem);

// Atualiza ambos estados
setColumns(newColumns);
setOportunidades(updatedOportunidades);
```

### 3. Toast Apenas em Sucesso
```javascript
if (error) {
  toast({ title: "Erro", variant: "destructive" });
  fetchColumns(); // Revert
} else {
  toast({ title: "Movido!" }); // Só aqui!
}
```

### 4. Ordenação ao Carregar
```javascript
// Ordenar por posição ao distribuir cards
Object.keys(initialColumns).forEach(key => {
  initialColumns[key].items.sort((a, b) => a.posicao - b.posicao);
});
```

## Como Testar

1. **Abrir o Kanban**: http://localhost:5173/oportunidades
2. **Arrastar um card** para outra coluna
3. **Verificar** que o toast aparece
4. **Recarregar a página** (F5)
5. **Confirmar** que o card PERMANECE na nova posição ✅

## Arquivos Modificados

- `/wg-crm/src/components/pages/Oportunidades.jsx`
  - Função `onDragEnd` completamente refatorada
  - Compatibilidade com trigger do banco
  - Estado local consistente
  - Toast apenas em sucesso

## Notas Técnicas

### Trigger do Banco (NÃO modificado)
O trigger `kanban_cards_autordem_upd` continua funcionando e:
- Fecha gaps automaticamente na coluna origem
- Abre espaço na coluna destino
- Mantém posições organizadas em múltiplos de 10
- Atualiza `updated_at` automaticamente

### Por que funciona agora?
1. Enviamos posição como múltiplo de 10
2. Posição é sempre diferente da original
3. Trigger não sobrescreve nosso valor
4. Estado local reflete exatamente o banco
5. Toast só aparece se realmente salvou

---

**Data da Correção**: 03/11/2025
**Autor**: Claude (AI Assistant)
**Status**: ✅ RESOLVIDO