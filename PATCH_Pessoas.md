# PATCH: Pessoas.jsx - Endereço + Botão Copiar

## Alterações:
1. ✅ Adicionar funções utilitárias (formatarEnderecoCompleto, copiarParaAreaTransferencia)
2. ✅ Modificar renderListView para incluir endereço + botão copiar
3. ✅ Modificar renderTableView para adicionar coluna de endereço + botão copiar
4. ✅ Adicionar import MapPin

---

## PARTE 1: Adicionar Import (linha ~6)

**ANTES:**
```jsx
import { PlusCircle, Loader2, Users2, Building, User, List, Search, UserCheck, Truck, Briefcase, LayoutGrid } from 'lucide-react';
```

**DEPOIS:**
```jsx
import { PlusCircle, Loader2, Users2, Building, User, List, Search, UserCheck, Truck, Briefcase, LayoutGrid, MapPin, Copy } from 'lucide-react';
```

---

## PARTE 2: Adicionar Funções Utilitárias

**LOCALIZAÇÃO:** ANTES do componente Pessoas (linha ~23)

**ADICIONAR:**
```jsx
/**
 * Formata endereço completo para exibição e cópia
 * @param {Object} endereco - Objeto com dados do endereço
 * @returns {string} Endereço formatado ou string vazia
 */
const formatarEnderecoCompleto = (endereco) => {
  if (!endereco || typeof endereco !== 'object') return '';

  const partes = [];

  if (endereco.logradouro) partes.push(endereco.logradouro);
  if (endereco.numero) partes.push(`nº ${endereco.numero}`);
  if (endereco.complemento) partes.push(endereco.complemento);
  if (endereco.bairro) partes.push(endereco.bairro);
  if (endereco.cidade && endereco.uf) {
    partes.push(`${endereco.cidade}/${endereco.uf}`);
  } else if (endereco.cidade) {
    partes.push(endereco.cidade);
  }
  if (endereco.cep) partes.push(`CEP: ${endereco.cep}`);

  return partes.join(', ');
};

/**
 * Copia texto para área de transferência com feedback
 * @param {string} text - Texto a ser copiado
 * @param {Function} toast - Função toast para feedback
 */
const copiarParaAreaTransferencia = async (text, toast) => {
  if (!text || text.trim() === '') {
    toast({
      title: "Endereço vazio",
      description: "Não há endereço cadastrado para copiar.",
      variant: "destructive"
    });
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Endereço copiado!",
      description: "O endereço foi copiado para a área de transferência.",
    });
    console.log('[Pessoas] Endereço copiado:', text);
  } catch (error) {
    console.error('[Pessoas] Erro ao copiar endereço:', error);

    // Fallback para navegadores antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      toast({
        title: "Endereço copiado!",
        description: "O endereço foi copiado para a área de transferência.",
      });
    } catch (fallbackError) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar. Tente manualmente.",
        variant: "destructive"
      });
    }
  }
};
```

---

## PARTE 3: Modificar renderListView (linhas 90-127)

**DELETAR:**
Deletar renderListView completo (linhas 90-127)

**SUBSTITUIR POR:**
```jsx
const renderListView = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
    <div className="md:col-span-1 flex flex-col h-full">
      <div className="flex-grow overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          pessoas.length > 0 ? (
            <div className="space-y-2">
              {pessoas.map((pessoa, index) => {
                const enderecoFormatado = formatarEnderecoCompleto(pessoa.endereco);

                return (
                  <motion.div
                    key={pessoa.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedPessoa?.id === pessoa.id ? 'bg-muted border-primary' : 'bg-card'
                    }`}
                    onClick={() => setSelectedPessoa(pessoa)}
                  >
                    {/* Nome, Tipo e Botão Copiar */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm flex items-center gap-2 flex-1 min-w-0">
                        {pessoa.tipo_pessoa === 'pf' ? (
                          <User className="h-4 w-4 text-sky-500 flex-shrink-0" />
                        ) : (
                          <Building className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{pessoa.nome_razao_social}</span>
                      </p>

                      {/* Botão Copiar Endereço */}
                      {enderecoFormatado && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation(); // Não seleciona a pessoa ao clicar
                            copiarParaAreaTransferencia(enderecoFormatado, toast);
                          }}
                          title="Copiar endereço completo"
                        >
                          <Copy className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                    </div>

                    {/* Email */}
                    <p className="text-xs text-muted-foreground truncate">
                      {pessoa.email || 'Sem e-mail'}
                    </p>

                    {/* Endereço (preview) */}
                    {enderecoFormatado && (
                      <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate" title={enderecoFormatado}>
                          {enderecoFormatado}
                        </span>
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum registro encontrado.
            </div>
          )
        )}
      </div>
    </div>

    <div className="md:col-span-2 h-full overflow-y-auto">
      <FichaCliente
        pessoa={selectedPessoa}
        onEdit={(p) => handleOpenDialog(p, p.tipo)}
        onUpdate={handleUpdate}
      />
    </div>
  </div>
);
```

---

## PARTE 4: Modificar renderTableView (linhas 129-152)

**DELETAR:**
Deletar renderTableView completo (linhas 129-152)

**SUBSTITUIR POR:**
```jsx
const renderTableView = () => (
  <div className="overflow-x-auto rounded-lg border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Nome / Razão Social</TableHead>
          <TableHead className="w-[100px]">Tipo</TableHead>
          <TableHead className="w-[200px]">Email</TableHead>
          <TableHead className="w-[120px]">Telefone</TableHead>
          <TableHead className="min-w-[300px]">Endereço</TableHead>
          <TableHead className="text-right w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan="6" className="h-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </TableCell>
          </TableRow>
        ) : pessoas.length > 0 ? (
          pessoas.map((pessoa) => {
            const enderecoFormatado = formatarEnderecoCompleto(pessoa.endereco);

            return (
              <TableRow
                key={pessoa.id}
                onClick={() => setSelectedPessoa(pessoa)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {/* Nome */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {pessoa.tipo_pessoa === 'pf' ? (
                      <User className="h-4 w-4 text-sky-500 flex-shrink-0" />
                    ) : (
                      <Building className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    )}
                    <span className="truncate">{pessoa.nome_razao_social}</span>
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  <Badge variant="outline" className="capitalize text-xs">
                    {pessoa.tipo}
                  </Badge>
                </TableCell>

                {/* Email */}
                <TableCell className="max-w-[200px]">
                  <span className="text-sm truncate block" title={pessoa.email}>
                    {pessoa.email || '-'}
                  </span>
                </TableCell>

                {/* Telefone */}
                <TableCell className="text-sm">
                  {pessoa.telefone || '-'}
                </TableCell>

                {/* Endereço + Botão Copiar */}
                <TableCell className="max-w-[300px]">
                  {enderecoFormatado ? (
                    <div className="flex items-center gap-2 group">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span
                        className="text-sm truncate flex-1"
                        title={enderecoFormatado}
                      >
                        {enderecoFormatado}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          copiarParaAreaTransferencia(enderecoFormatado, toast);
                        }}
                        title="Copiar endereço completo"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">
                      Sem endereço
                    </span>
                  )}
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right">
                  <ActionIcons
                    onEdit={() => handleOpenDialog(pessoa, pessoa.tipo)}
                    onDelete={() => {
                      /* Implemented in Ficha */
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan="6" className="h-24 text-center text-muted-foreground">
              Nenhum resultado encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);
```

---

## TESTE MANUAL:

### Vista Lista:

1. **Endereço aparece:**
   - [ ] Abrir página Pessoas
   - [ ] Vista "Lista" ativa
   - [ ] Endereço aparece abaixo do email (com ícone MapPin)
   - [ ] Se endereço muito longo, trunca com "..."
   - [ ] Hover no endereço mostra tooltip com endereço completo

2. **Botão copiar funciona:**
   - [ ] Clicar no ícone Copy ao lado do nome
   - [ ] Toast aparece: "Endereço copiado!"
   - [ ] Abrir bloco de notas e colar (Ctrl+V)
   - [ ] Endereço completo foi copiado no formato:
     ```
     Rua Exemplo, nº 123, Apto 45, Centro, São Paulo/SP, CEP: 01310-100
     ```

3. **Sem endereço:**
   - [ ] Pessoa sem endereço cadastrado NÃO mostra ícone Copy
   - [ ] Só mostra nome e email

### Vista Tabela:

1. **Coluna Endereço aparece:**
   - [ ] Trocar para vista "Tabela"
   - [ ] Coluna "Endereço" existe (entre "Telefone" e "Ações")
   - [ ] Endereços formatados corretamente
   - [ ] Trunca se muito longo

2. **Botão copiar (hover):**
   - [ ] Passar mouse sobre linha da tabela
   - [ ] Ícone Copy aparece na coluna Endereço (opacity 0 → 100%)
   - [ ] Clicar no Copy
   - [ ] Toast aparece
   - [ ] Colar em bloco de notas → endereço completo

3. **Responsividade:**
   - [ ] Em telas menores, tabela tem scroll horizontal
   - [ ] Coluna Endereço não quebra layout
   - [ ] Botão Copy sempre visível em touch devices

### Integração com WhatsApp:

1. **Copiar e enviar:**
   - [ ] Copiar endereço de uma pessoa
   - [ ] Abrir WhatsApp Web
   - [ ] Colar (Ctrl+V)
   - [ ] Endereço aparece formatado e pronto para envio

---

## RESUMO DAS MUDANÇAS:

| Linha(s) | O que foi feito |
|----------|-----------------|
| ~6       | ✅ Adicionado imports MapPin, Copy |
| ~23      | ✅ ADICIONADAS funções utilitárias (formatarEnderecoCompleto, copiarParaAreaTransferencia) |
| 90-127   | ✅ SUBSTITUÍDO renderListView com endereço + botão copiar |
| 129-152  | ✅ SUBSTITUÍDO renderTableView com coluna endereço + botão copiar |

---

## NOTAS TÉCNICAS:

1. **Formato do endereço:**
   - Padrão: `Logradouro, nº Número, Complemento, Bairro, Cidade/UF, CEP: XXXXX-XXX`
   - Campos opcionais são omitidos automaticamente
   - Separador: vírgula + espaço

2. **Clipboard API:**
   - Usa `navigator.clipboard.writeText()` (moderno)
   - Fallback para `document.execCommand('copy')` (navegadores antigos)
   - Tratamento de erros com toast descritivo

3. **UX/UI:**
   - Ícone Copy só aparece se tem endereço
   - Em hover (tabela): botão aparece suavemente (transition opacity)
   - stopPropagation(): não seleciona pessoa ao copiar
   - Toast feedback: sempre confirma ação

---

**Arquivo:** `src/components/pages/Pessoas.jsx`
**Linhas afetadas:** ~6, ~23-78, 90-152
**Tipo de mudança:** Feature + UX improvement
**Breaking change:** Não
**Dependências:** Nenhuma (usa componentes existentes)
