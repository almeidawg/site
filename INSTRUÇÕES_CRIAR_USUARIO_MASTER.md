# 🔐 Instruções para Criar Usuário Master

## 📋 Informações do Usuário
- **Email**: william@wgalmeida.com.br
- **Senha**: 130300@$Wg
- **Role**: Administrador/Master
- **Projeto**: vyxscnevgeubfgfstmtf (WG CRM LIVE)

---

## 🚀 MÉTODO 1: Via Supabase Dashboard (RECOMENDADO)

### Opção A: Via SQL Editor (Mais Completo)

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf
   - Faça login com suas credenciais

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `create_master_user.sql`
   - Cole no SQL Editor
   - Clique em "Run" (ou pressione Ctrl+Enter)

4. **Verifique o Resultado**
   - O script irá mostrar mensagens indicando:
     - Se o usuário já existia ou foi criado
     - O ID do usuário
     - Se o perfil foi criado
   - Você verá também uma query mostrando os dados do usuário

### Opção B: Via Authentication (Interface Visual)

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf

2. **Vá para Authentication**
   - No menu lateral, clique em "Authentication"
   - Clique em "Users"

3. **Adicione Novo Usuário**
   - Clique em "Add user" → "Create new user"
   - Preencha:
     - Email: `william@wgalmeida.com.br`
     - Password: `130300@$Wg`
     - Auto Confirm User: ✅ (marcar esta opção)
   - Clique em "Create user"

4. **Configurar Metadata (Opcional)**
   - Clique no usuário criado
   - Na seção "User Metadata", adicione:
     ```json
     {
       "name": "William",
       "role": "admin"
     }
     ```

---

## 🚀 MÉTODO 2: Via Supabase CLI

### Pré-requisitos
- Supabase CLI instalado
- Estar logado no Supabase CLI

### Passos

1. **Abra o terminal** neste diretório:
   ```bash
   cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema"
   ```

2. **Link do projeto** (se ainda não estiver linkado):
   ```bash
   supabase link --project-ref vyxscnevgeubfgfstmtf
   ```

3. **Execute o script SQL**:
   ```bash
   supabase db execute --file create_master_user.sql --linked
   ```

---

## 🚀 MÉTODO 3: Via API REST (Avançado)

Se preferir criar via API (programaticamente):

```bash
curl -X POST 'https://vyxscnevgeubfgfstmtf.supabase.co/auth/v1/admin/users' \
  -H "Authorization: Bearer <SEU_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "william@wgalmeida.com.br",
    "password": "130300@$Wg",
    "email_confirm": true,
    "user_metadata": {
      "name": "William",
      "role": "admin"
    }
  }'
```

**IMPORTANTE**: Substitua `<SEU_SERVICE_ROLE_KEY>` pela chave service_role do projeto.

---

## ✅ Verificação Pós-Criação

### 1. Verificar no Dashboard
- Vá para Authentication → Users
- Procure por `william@wgalmeida.com.br`
- Verifique se:
  - ✅ Email está confirmado (ícone verde)
  - ✅ Usuário está ativo
  - ✅ Metadata está correto

### 2. Testar Login
- Abra o app: https://vyxscnevgeubfgfstmtf.supabase.co
- Ou abra localmente: `http://localhost:5173`
- Tente fazer login com:
  - Email: `william@wgalmeida.com.br`
  - Senha: `130300@$Wg`

### 3. Verificar Permissões (SQL)
Execute no SQL Editor:

```sql
-- Ver dados do usuário
SELECT
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
WHERE email = 'william@wgalmeida.com.br';

-- Ver perfil (se existir tabela profiles)
SELECT *
FROM public.profiles
WHERE email = 'william@wgalmeida.com.br';
```

---

## 🔧 Troubleshooting

### Problema: "User already exists"
**Solução**: O script já trata isso! Ele vai atualizar a senha e confirmar o email.

### Problema: "Permission denied"
**Solução**:
1. Certifique-se de estar logado no Dashboard com permissões de admin
2. Se usando CLI, verifique se está autenticado: `supabase login`

### Problema: "Tabela profiles não existe"
**Solução**: Não é um problema! O script vai criar apenas na tabela auth.users. Se sua aplicação usa uma tabela profiles customizada, você precisará criar manualmente.

### Problema: "Não consigo fazer login"
**Soluções**:
1. Verifique se o email foi confirmado (email_confirmed_at não é NULL)
2. Execute o script novamente para resetar a senha
3. Verifique os logs: Dashboard → Logs → Auth

---

## 📝 Notas Importantes

- ⚠️ **Segurança**: Esta senha está documentada aqui. Após o primeiro login, recomenda-se que o usuário altere a senha.
- 🔒 **Service Role Key**: Nunca exponha a service_role_key publicamente
- ✅ **Email Confirmado**: O script cria o usuário com email já confirmado (não precisa clicar em link de verificação)
- 🔄 **Reexecução**: O script pode ser executado múltiplas vezes sem problemas (é idempotente)

---

## 🎯 Próximos Passos

Após criar o usuário:

1. [ ] Testar login no app
2. [ ] Configurar permissões específicas (RLS policies)
3. [ ] Alterar senha via interface (se necessário)
4. [ ] Configurar metadata adicional (avatar, telefone, etc)
5. [ ] Deletar este arquivo de instruções (contém senha em texto plano)

---

**Criado em**: 2025-11-23
**Autor**: Claude Code
**Projeto**: WG CRM
