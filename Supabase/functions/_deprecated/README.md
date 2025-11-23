# ⚠️ Edge Functions Descontinuadas

Estas Edge Functions foram **substituídas por SQL Functions** (Migration 014).

## Por quê SQL é melhor?

✅ **Performance**: Executam direto no PostgreSQL (sem latência de rede)
✅ **Segurança**: RLS integrada, SECURITY DEFINER
✅ **Manutenção**: Versionadas via migrations
✅ **Custo**: Sem consumo de Deno runtime

---

## Funções Migradas para SQL

### 1. `users-invite` → `public.users_invite()`
**Migration 014:102-157**

```sql
-- Convida novo usuário
SELECT public.users_invite(
  'email@example.com',  -- email
  'João Silva',         -- nome
  'viewer'              -- perfil (admin/editor/viewer)
);
```

### 2. `users-reset` → `public.users_reset_password()`
**Migration 014:230-260**

```sql
-- Reset de senha
SELECT public.users_reset_password('user-uuid-here');
```

### 3. `users-role-toggle` → `public.users_role_toggle()`
**Migration 014:262-295**

```sql
-- Alterna perfil (admin ↔ viewer)
SELECT public.users_role_toggle('user-uuid-here');
```

### 4. `users-create` → `public.users_invite()` (mesma função do #1)
Duplicata de `users-invite`, consolidada em uma única SQL Function.

### 5. `secure-signup` → `public.users_invite()`
Signup seguro agora é feito via `users_invite()` com validações integradas.

---

## Uso das SQL Functions

### Frontend (JavaScript):
```javascript
import { supabase } from './supabaseClient';

// Convidar usuário
const { data, error } = await supabase
  .rpc('users_invite', {
    p_email: 'novo@example.com',
    p_nome: 'Novo Usuário',
    p_perfil: 'viewer'
  });

// Reset senha
const { data, error } = await supabase
  .rpc('users_reset_password', {
    p_user_id: 'uuid-aqui'
  });
```

### SQL Direto:
```sql
-- Listar usuários
SELECT * FROM public.users_list();

-- Ativar usuário
SELECT public.users_activate('uuid-aqui');

-- Desativar usuário
SELECT public.users_deactivate('uuid-aqui');
```

---

## ⚠️ Não Use Estas Edge Functions!

Estas funções foram mantidas apenas para **referência histórica**.
Se você precisa dessa funcionalidade, use as **SQL Functions** da Migration 014.

Para mais detalhes, veja:
- `/Supabase/migrations/014_criar_funcoes_gestao_usuarios.sql`
- `/ANALISE_EDGE_FUNCTIONS.md`

---

**Status**: Descontinuadas em 03/Nov/2025
**Migração**: Migration 014 (400 linhas)
**Documentação**: [ANALISE_EDGE_FUNCTIONS.md](../../../ANALISE_EDGE_FUNCTIONS.md)
