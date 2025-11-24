# 🚀 Deploy Frontend no Vercel - WG CRM

## ✅ Pré-requisitos Completados

- ✅ Código corrigido (43 arquivos .single() → .maybeSingle())
- ✅ Schema do banco corrigido no LIVE
- ✅ Arquivo `vercel.json` criado e commitado
- ✅ Variáveis de ambiente configuradas
- ✅ GitHub atualizado (branch main)

---

## 📋 Passos para Deploy

### 1️⃣ **Criar Conta no Vercel (se não tiver)**

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Autorize o Vercel a acessar seu GitHub
4. ✅ Conta criada!

---

### 2️⃣ **Importar Projeto do GitHub**

1. No Dashboard do Vercel, clique em **"Add New Project"**
2. Selecione o repositório: **`almeidawg/site`**
3. Configure o projeto:

   **Framework Preset**: `Vite`

   **Root Directory**: `wg-crm` ⚠️ **IMPORTANTE!**

   **Build Command**: `npm run build`

   **Output Directory**: `dist`

   **Install Command**: `npm install`

4. Clique em **"Deploy"**

---

### 3️⃣ **Aguardar Build e Deploy**

O Vercel vai:
- ✅ Clonar seu repositório
- ✅ Instalar dependências (`npm install`)
- ✅ Executar build (`npm run build`)
- ✅ Fazer deploy automático
- ⏱️ Tempo estimado: 2-5 minutos

---

### 4️⃣ **Verificar Deploy**

Após o deploy concluir:
1. O Vercel vai mostrar: **"Your project is ready!"**
2. URL do projeto: `https://seu-projeto.vercel.app`
3. Clique no link para abrir a aplicação

---

## 🔧 Variáveis de Ambiente (Já Configuradas)

O arquivo `vercel.json` já contém todas as variáveis necessárias:

```json
{
  "VITE_SUPABASE_URL": "https://vyxscnevgeubfgfstmtf.supabase.co",
  "VITE_SUPABASE_ANON_KEY": "eyJh...",
  "VITE_APP_ENV": "production",
  "VITE_ENABLE_ECOMMERCE": "true",
  "VITE_ENABLE_OBRAS": "true"
}
```

✅ Não precisa configurar manualmente!

---

## 🧪 Testar Aplicação

Após o deploy, teste:

1. **Login**: william@wgalmeida.com.br / 130300@$Wg
2. **Dashboard**: Visualizar métricas
3. **Kanbans**: Criar/mover cards
4. **Entidades**: CRUD de clientes/prospects
5. **Obras**: Gerenciar obras
6. **Financeiro**: Títulos e lançamentos

---

## 🔄 Deploy Automático (Configurado!)

✅ Cada `git push origin main` faz deploy automático!

```bash
# Fazer mudanças no código
git add .
git commit -m "feat: Nova feature"
git push origin main

# Vercel detecta e faz deploy automaticamente! 🎉
```

---

## 🌐 Domínio Customizado (Opcional)

Se quiser usar domínio próprio (ex: `crm.wgalmeida.com.br`):

1. No Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio
4. Configure DNS conforme instruções do Vercel
5. ✅ SSL automático incluído!

---

## 📊 Monitoramento

O Vercel oferece:
- ✅ Analytics de performance
- ✅ Logs de deploy
- ✅ Preview deployments (branches)
- ✅ Rollback instantâneo

Acesse: https://vercel.com/dashboard

---

## 🐛 Troubleshooting

### Build falha com erro de dependências

**Solução**: Adicionar no `vercel.json`:
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Página 404 ao navegar

**Solução**: Já resolvido no `vercel.json` com rewrites!

### Variáveis de ambiente não funcionam

**Solução**: Verificar no Dashboard Vercel → Settings → Environment Variables

---

## ✅ Checklist Final

Antes de considerar deploy completo:

- [ ] ✅ Aplicação abre sem erros
- [ ] ✅ Login funciona
- [ ] ✅ Dashboard carrega
- [ ] ✅ Kanbans funcionam
- [ ] ✅ CRUD de entidades funciona
- [ ] ✅ Sem erros PGRST no console
- [ ] ✅ Performance aceitável (< 3s carregamento)

---

## 🎉 Próximos Passos

Após deploy com sucesso:

1. ✅ Testar todas funcionalidades críticas
2. ✅ Configurar domínio customizado (se tiver)
3. ✅ Configurar alertas de erros (Sentry, opcional)
4. ✅ Monitorar analytics do Vercel
5. ✅ Treinar usuários finais

---

## 📞 Suporte

**Vercel Docs**: https://vercel.com/docs
**Vercel Support**: https://vercel.com/support
**GitHub Repository**: https://github.com/almeidawg/site

---

**Criado em**: 2025-11-23
**Última atualização**: 2025-11-23
**Versão**: 1.0
