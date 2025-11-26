# PATCH: NovaPessoaDialog.jsx

## Alterações:
1. ✅ Adicionar import do EntityAvatarUploader
2. ✅ Adicionar avatar_url ao buildInitialFormState
3. ✅ SUBSTITUIR useEffect (linhas 86-143) por versão corrigida
4. ✅ Adicionar seção de Avatar no form
5. ✅ Corrigir carregamento de dados ao editar

---

## PARTE 1: Adicionar Import (linha ~9)

**ANTES:**
```jsx
import { Loader2, Save, Search, User, Briefcase, Truck, Building, Link, PlusCircle, Trash, Banknote } from 'lucide-react';
```

**DEPOIS:**
```jsx
import { Loader2, Save, Search, User, Briefcase, Truck, Building, Link, PlusCircle, Trash, Banknote, ImageIcon } from 'lucide-react';
import EntityAvatarUploader from '@/components/shared/EntityAvatarUploader';
```

---

## PARTE 2: Adicionar avatar_url ao buildInitialFormState (linha ~26-48)

**ANTES:**
```jsx
const buildInitialFormState = (tipo = 'cliente') => ({
  tipo: tipo || 'cliente',
  tipo_pessoa: 'pf',
  nome_razao_social: '',
  nome_fantasia: '',
  cpf_cnpj: '',
  rg_ie: '',
  email: '',
  telefone: '',
  ativo: true,
  obra_mesmo_endereco: true,
  endereco: {},
  endereco_obra: {},
  observacoes: '',
  procedencia_id: null,
  responsavel_id: null,
  especificador: null,
  drive_link: '',
  dados_bancarios: [],
  arquitetura: false,
  engenharia: false,
  marcenaria: false,
});
```

**DEPOIS:**
```jsx
const buildInitialFormState = (tipo = 'cliente') => ({
  tipo: tipo || 'cliente',
  tipo_pessoa: 'pf',
  nome_razao_social: '',
  nome_fantasia: '',
  cpf_cnpj: '',
  rg_ie: '',
  email: '',
  telefone: '',
  ativo: true,
  obra_mesmo_endereco: true,
  endereco: {},
  endereco_obra: {},
  observacoes: '',
  procedencia_id: null,
  responsavel_id: null,
  especificador: null,
  drive_link: '',
  dados_bancarios: [],
  arquitetura: false,
  engenharia: false,
  marcenaria: false,
  avatar_url: null,  // ✅ ADICIONADO
});
```

---

## PARTE 3: SUBSTITUIR useEffect (linhas 86-143)

**DELETAR COMPLETAMENTE:**
```jsx
useEffect(() => {
  const fetchInitialData = async () => {
    setLoading(true);
    const { data: procedenciasData, error: procedenciasError } = await supabase.from('comercial_procedencias').select('id, nome').eq('ativo', true);
    if (procedenciasError) toast({ title: "Erro ao buscar procedências", variant: "destructive" });
    else setProcedencias(procedenciasData || []);

    const { data: usersData, error: usersError } = await supabase.from('user_profiles').select('user_id, nome').eq('ativo', true);
    if (usersError) toast({ title: "Erro ao buscar usuários", variant: "destructive" });
    else setUsers(usersData || []);

    const { data: especificadoresData, error: especificadoresError } = await supabase.from('especificadores').select('id, nome_empresa');
    if (especificadoresError) toast({ title: "Erro ao buscar especificadores", variant: "destructive" });
    else setEspecificadores(especificadoresData || []);

    const baseEntityState = entityToEdit
      ? {
          ...buildInitialFormState(defaultTipo),
          ...entityToEdit,
          nome_razao_social: entityToEdit.nome || entityToEdit.nome_razao_social,
          tipo: entityToEdit.tipo || defaultTipo,
          dados_bancarios: entityToEdit.dados_bancarios || [],
          endereco: normalizeEndereco(entityToEdit.endereco),
          endereco_obra: normalizeEndereco(entityToEdit.endereco_obra),
          obra_mesmo_endereco: entityToEdit.obra_mesmo_endereco ?? true,
        }
      : { ...buildInitialFormState(defaultTipo), endereco: {}, endereco_obra: {}, obra_mesmo_endereco: true };

    setFormData(baseEntityState);
    setIsEditing(!!entityToEdit);

    if (entityToEdit) {
      const { data: fullEntity, error: entityError } = await supabase
        .from('v_entities_full')
        .select('*, dados_bancarios:bank_accounts(*)')
        .eq('id', entityToEdit.id)
        .single();

      if (entityError) {
        toast({ title: "Erro ao buscar dados completos", variant: "destructive" });
      } else {
        setFormData({
          ...buildInitialFormState(defaultTipo),
          ...fullEntity,
          nome_razao_social: fullEntity.nome || fullEntity.nome_razao_social,
          tipo: fullEntity.tipo || defaultTipo,
          dados_bancarios: fullEntity.dados_bancarios || [],
          endereco: normalizeEndereco(fullEntity.endereco),
          endereco_obra: normalizeEndereco(fullEntity.endereco_obra),
          obra_mesmo_endereco: fullEntity.obra_mesmo_endereco ?? true,
        });
      }
    }
    setLoading(false);
  };

  if (open) fetchInitialData();
}, [entityToEdit, open, toast, defaultTipo]);
```

**SUBSTITUIR POR:**
```jsx
// ✅ useEffect CORRIGIDO - Carrega dados de referência e entity ao abrir dialog
useEffect(() => {
  const fetchInitialData = async () => {
    if (!open) return; // Não carrega se dialog está fechado

    setLoading(true);

    try {
      // 1. Buscar dados de referência em paralelo (mais rápido)
      const [procedenciasRes, usersRes, especificadoresRes] = await Promise.all([
        supabase.from('comercial_procedencias').select('id, nome').eq('ativo', true),
        supabase.from('user_profiles').select('user_id, nome').eq('ativo', true),
        supabase.from('especificadores').select('id, nome_empresa')
      ]);

      // Processar respostas de referência
      if (procedenciasRes.error) {
        console.error('[NovaPessoaDialog] Erro ao buscar procedências:', procedenciasRes.error);
        toast({ title: "Erro ao buscar procedências", variant: "destructive" });
      } else {
        setProcedencias(procedenciasRes.data || []);
      }

      if (usersRes.error) {
        console.error('[NovaPessoaDialog] Erro ao buscar usuários:', usersRes.error);
        toast({ title: "Erro ao buscar usuários", variant: "destructive" });
      } else {
        setUsers(usersRes.data || []);
      }

      if (especificadoresRes.error) {
        console.error('[NovaPessoaDialog] Erro ao buscar especificadores:', especificadoresRes.error);
        toast({ title: "Erro ao buscar especificadores", variant: "destructive" });
      } else {
        setEspecificadores(especificadoresRes.data || []);
      }

      // 2. Buscar dados da entity (se editando)
      if (entityToEdit?.id) {
        console.log('[NovaPessoaDialog] Editando entity:', entityToEdit.id);
        setIsEditing(true);

        const { data: fullEntity, error: entityError } = await supabase
          .from('v_entities_full')
          .select('*, dados_bancarios:bank_accounts(*)')
          .eq('id', entityToEdit.id)
          .single();

        if (entityError) {
          console.error('[NovaPessoaDialog] Erro ao buscar dados completos:', entityError);
          toast({
            title: "Erro ao carregar dados",
            description: "Usando dados básicos disponíveis.",
            variant: "destructive"
          });

          // Fallback: usar entityToEdit (dados parciais)
          setFormData({
            ...buildInitialFormState(entityToEdit.tipo || defaultTipo),
            ...entityToEdit,
            nome_razao_social: entityToEdit.nome || entityToEdit.nome_razao_social || '',
            dados_bancarios: entityToEdit.dados_bancarios || [],
            endereco: normalizeEndereco(entityToEdit.endereco),
            endereco_obra: normalizeEndereco(entityToEdit.endereco_obra),
            obra_mesmo_endereco: entityToEdit.obra_mesmo_endereco ?? true,
            avatar_url: entityToEdit.avatar_url || null,
          });
        } else {
          // Sucesso: usar fullEntity (dados completos do banco)
          console.log('[NovaPessoaDialog] Dados completos carregados:', fullEntity);
          setFormData({
            ...buildInitialFormState(fullEntity.tipo || defaultTipo),
            ...fullEntity,
            nome_razao_social: fullEntity.nome || fullEntity.nome_razao_social || '',
            dados_bancarios: fullEntity.dados_bancarios || [],
            endereco: normalizeEndereco(fullEntity.endereco),
            endereco_obra: normalizeEndereco(fullEntity.endereco_obra),
            obra_mesmo_endereco: fullEntity.obra_mesmo_endereco ?? true,
            avatar_url: fullEntity.avatar_url || null,
          });
        }
      } else {
        // Criando nova pessoa
        console.log('[NovaPessoaDialog] Criando nova entity, tipo:', defaultTipo);
        setIsEditing(false);
        setFormData({
          ...buildInitialFormState(defaultTipo),
          endereco: {},
          endereco_obra: {},
          obra_mesmo_endereco: true,
          avatar_url: null,
        });
      }

    } catch (error) {
      console.error('[NovaPessoaDialog] Erro inesperado no carregamento:', error);
      toast({
        title: "Erro no carregamento",
        description: error.message,
        variant: "destructive"
      });

      // Estado seguro de fallback
      setFormData(buildInitialFormState(defaultTipo));

    } finally {
      setLoading(false);
    }
  };

  fetchInitialData();
}, [open, entityToEdit?.id, defaultTipo, toast]);
// ✅ Dependências mínimas e estáveis (não escuta entityToEdit completo, apenas ID)
```

---

## PARTE 4: Adicionar Seção de Avatar no Formulário

**LOCALIZAÇÃO:** Após a seção "Identificação" (após linha ~357), ANTES da seção "Área de Interesse"

**ADICIONAR:**
```jsx
{/* ✅ SEÇÃO DE AVATAR - Só aparece ao editar */}
{isEditing && formData.id && (
  <div className="p-4 border rounded-lg space-y-4">
    <h3 className="font-semibold text-lg flex items-center gap-2">
      <ImageIcon className="h-5 w-5" />
      Foto / Avatar
    </h3>
    <EntityAvatarUploader
      entityId={formData.id}
      entityName={formData.nome_razao_social}
      currentAvatarUrl={formData.avatar_url}
      onUploadSuccess={(url) => {
        console.log('[NovaPessoaDialog] Avatar atualizado:', url);
        setFormData(prev => ({ ...prev, avatar_url: url }));
      }}
      size="default"
    />
    <p className="text-sm text-muted-foreground">
      A foto será exibida na lista de pessoas e na ficha cadastral.
    </p>
  </div>
)}
```

---

## ONDE COLOCAR NO CÓDIGO ORIGINAL:

**Estrutura do formulário (linha ~331-414):**

```jsx
<form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto pr-4">
  <div className="space-y-6">

    {/* Seção: Identificação */}
    <div className="p-4 border rounded-lg space-y-4">
      ...
    </div>

    {/* ✅ ADICIONAR AQUI - SEÇÃO AVATAR */}
    {isEditing && formData.id && (
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Foto / Avatar
        </h3>
        <EntityAvatarUploader
          entityId={formData.id}
          entityName={formData.nome_razao_social}
          currentAvatarUrl={formData.avatar_url}
          onUploadSuccess={(url) => {
            console.log('[NovaPessoaDialog] Avatar atualizado:', url);
            setFormData(prev => ({ ...prev, avatar_url: url }));
          }}
          size="default"
        />
        <p className="text-sm text-muted-foreground">
          A foto será exibida na lista de pessoas e na ficha cadastral.
        </p>
      </div>
    )}

    {/* Seção: Área de Interesse (linha ~359) */}
    {formData.tipo === 'cliente' && renderAreaOfInterest()}

    {/* Resto do formulário... */}
  </div>
</form>
```

---

## TESTE MANUAL APÓS APLICAR PATCH:

1. **Criar nova pessoa:**
   - [ ] Abrir dialog "Nova Pessoa"
   - [ ] Verificar que NÃO aparece seção de avatar (só ao editar)
   - [ ] Preencher nome e salvar
   - [ ] Verificar que salva sem erro

2. **Editar pessoa existente:**
   - [ ] Clicar em "Editar" em uma pessoa da lista
   - [ ] Verificar que TODOS os campos carregam (nome, email, telefone, endereço, etc.)
   - [ ] Verificar que seção "Foto / Avatar" aparece
   - [ ] Fazer upload de uma foto
   - [ ] Salvar
   - [ ] Reabrir edição → verificar que foto está carregada

3. **Validar console:**
   - [ ] Abrir DevTools → Console
   - [ ] Editar pessoa
   - [ ] Verificar logs: `[NovaPessoaDialog] Editando entity: <id>`
   - [ ] Verificar logs: `[NovaPessoaDialog] Dados completos carregados: {...}`
   - [ ] NÃO deve ter erros

---

## RESUMO DAS MUDANÇAS:

| Linha(s) | O que foi feito |
|----------|-----------------|
| ~9       | ✅ Adicionado import EntityAvatarUploader e ícone ImageIcon |
| ~47      | ✅ Adicionado campo avatar_url ao buildInitialFormState |
| 86-143   | ✅ SUBSTITUÍDO useEffect problemático por versão corrigida |
| ~358     | ✅ ADICIONADA seção de Avatar no formulário (após Identificação) |

---

**Arquivo:** `src/components/pessoas/NovaPessoaDialog.jsx`
**Linhas afetadas:** ~9, ~47, 86-143, ~358
**Tipo de mudança:** Correção de bug + nova feature
**Breaking change:** Não
**Requer migration:** Sim (`20251126000000_add_avatar_to_entities.sql`)
