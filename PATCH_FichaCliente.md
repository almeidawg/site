# PATCH: FichaCliente.jsx

## Alterações:
1. ✅ Adicionar import do Avatar
2. ✅ Modificar CardHeader para incluir avatar
3. ✅ Ajustar layout para exibir avatar + dados lado a lado

---

## PARTE 1: Adicionar Imports (linha ~7)

**ANTES:**
```jsx
import { User, Building, Phone, Mail, MapPin, FileText, Banknote, AlertCircle, Users2, PlusCircle, Trash, Edit, Loader2, Link, Briefcase } from 'lucide-react';
```

**DEPOIS:**
```jsx
import { User, Building, Phone, Mail, MapPin, FileText, Banknote, AlertCircle, Users2, PlusCircle, Trash, Edit, Loader2, Link, Briefcase } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
```

---

## PARTE 2: Modificar CardHeader (linha ~198-220)

**ANTES:**
```jsx
<CardHeader className="flex flex-row items-start justify-between">
    <div>
        <CardTitle className="flex items-center gap-2">
            {tipo_pessoa === 'pf' ? <User /> : <Building />}
            {nome_razao_social}
        </CardTitle>
        {nome_fantasia && (
            <CardDescription>{nome_fantasia}</CardDescription>
        )}
        <div className="flex gap-2 mt-2">
            <Badge>{tipo}</Badge>
            <Badge variant="outline">{tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}</Badge>
        </div>
    </div>
    <ActionIcons onEdit={() => onEdit(pessoa)} onDelete={() => setIsAlertOpen(true)} />
</CardHeader>
```

**DEPOIS:**
```jsx
<CardHeader className="flex flex-row items-start justify-between gap-4">
    {/* ✅ Avatar + Dados lado a lado */}
    <div className="flex items-start gap-4 flex-1">
        {/* Avatar */}
        <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm flex-shrink-0">
            <AvatarImage
                src={pessoa.avatar_url}
                alt={nome_razao_social}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl">
                {nome_razao_social?.charAt(0)?.toUpperCase() || 'E'}
            </AvatarFallback>
        </Avatar>

        {/* Dados */}
        <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
                {tipo_pessoa === 'pf' ? (
                    <User className="h-5 w-5 text-sky-500 flex-shrink-0" />
                ) : (
                    <Building className="h-5 w-5 text-orange-500 flex-shrink-0" />
                )}
                <span className="truncate">{nome_razao_social}</span>
            </CardTitle>
            {nome_fantasia && (
                <CardDescription className="truncate mt-1">
                    {nome_fantasia}
                </CardDescription>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="capitalize">{tipo}</Badge>
                <Badge variant="outline">
                    {tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </Badge>
            </div>
        </div>
    </div>

    {/* Botões de Ação */}
    <div className="flex gap-2 flex-shrink-0">
        <ActionIcons
            onEdit={() => onEdit(pessoa)}
            onDelete={() => setIsAlertOpen(true)}
        />
    </div>
</CardHeader>
```

---

## PARTE 3: (Opcional) Melhorar Responsividade

Se quiser que em mobile o avatar fique acima dos dados, adicionar classes responsive:

**VERSÃO MOBILE-FIRST:**
```jsx
<CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
    {/* Avatar + Dados */}
    <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 w-full">
        {/* Avatar - Centralizado em mobile, esquerda em desktop */}
        <div className="flex justify-center w-full sm:w-auto">
            <Avatar className="h-20 w-20 sm:h-16 sm:w-16 border-2 border-gray-200 shadow-sm flex-shrink-0">
                <AvatarImage
                    src={pessoa.avatar_url}
                    alt={nome_razao_social}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-2xl sm:text-xl">
                    {nome_razao_social?.charAt(0)?.toUpperCase() || 'E'}
                </AvatarFallback>
            </Avatar>
        </div>

        {/* Dados - Centralizados em mobile */}
        <div className="flex-1 min-w-0 text-center sm:text-left w-full">
            <CardTitle className="flex items-center gap-2 justify-center sm:justify-start">
                {tipo_pessoa === 'pf' ? (
                    <User className="h-5 w-5 text-sky-500 flex-shrink-0" />
                ) : (
                    <Building className="h-5 w-5 text-orange-500 flex-shrink-0" />
                )}
                <span className="truncate">{nome_razao_social}</span>
            </CardTitle>
            {nome_fantasia && (
                <CardDescription className="truncate mt-1">
                    {nome_fantasia}
                </CardDescription>
            )}
            <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                <Badge className="capitalize">{tipo}</Badge>
                <Badge variant="outline">
                    {tipo_pessoa === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </Badge>
            </div>
        </div>
    </div>

    {/* Botões de Ação */}
    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start">
        <ActionIcons
            onEdit={() => onEdit(pessoa)}
            onDelete={() => setIsAlertOpen(true)}
        />
    </div>
</CardHeader>
```

---

## ONDE APLICAR:

**Arquivo:** `src/components/pessoas/FichaCliente.jsx`
**Linhas:** ~7 (imports), ~198-220 (CardHeader)

---

## TESTE MANUAL:

1. **Visualizar pessoa COM avatar:**
   - [ ] Abrir ficha de pessoa que tem avatar
   - [ ] Avatar aparece à esquerda
   - [ ] Imagem carrega corretamente
   - [ ] Layout não quebra

2. **Visualizar pessoa SEM avatar:**
   - [ ] Abrir ficha de pessoa sem avatar
   - [ ] Fallback aparece (inicial do nome em círculo colorido)
   - [ ] Cor de fundo é gradiente azul→roxo
   - [ ] Letra fica branca e legível

3. **Responsividade:**
   - [ ] Em mobile: avatar acima dos dados (se usar versão mobile-first)
   - [ ] Em desktop: avatar à esquerda
   - [ ] Textos truncam corretamente se nome muito longo
   - [ ] Badges não quebram layout

4. **Editar avatar:**
   - [ ] Clicar em "Editar"
   - [ ] Fazer upload de novo avatar
   - [ ] Salvar
   - [ ] Voltar para ficha → verificar que avatar atualiza

---

## RESUMO DAS MUDANÇAS:

| Linha(s) | O que foi feito |
|----------|-----------------|
| ~7       | ✅ Adicionado import Avatar, AvatarImage, AvatarFallback |
| 198-220  | ✅ MODIFICADO CardHeader para incluir avatar + layout melhorado |

---

**Arquivo:** `src/components/pessoas/FichaCliente.jsx`
**Tipo de mudança:** Feature visual (avatar)
**Breaking change:** Não
**Requer migration:** Sim (mesmo do NovaPessoaDialog)
