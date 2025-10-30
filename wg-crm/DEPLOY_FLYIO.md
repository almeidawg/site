# Deploy no Fly.io - WG CRM

## ✅ Configuração Completa

O projeto está configurado e pronto para deploy no Fly.io!

### 📦 Arquivos Criados

- `fly.toml` - Configuração da aplicação no Fly.io
- `Dockerfile` - Imagem Docker otimizada para produção
- `.dockerignore` - Arquivos excluídos do build Docker

### 🚀 App Criado no Fly.io

**Nome:** wg-crm-sistema
**Organização:** Grupo WG Almeida
**Região:** São Paulo, Brazil (gru)
**Admin URL:** https://fly.io/apps/wg-crm-sistema
**Hostname:** https://wg-crm-sistema.fly.dev
**IPs:**
- IPv6: 2a09:8280:1::ab:66:0
- IPv4: 66.241.125.83

---

## 📋 Comandos para Deploy

### 1. Fazer Login no Fly.io (se necessário)

```bash
flyctl auth login
```

### 2. Fazer Deploy da Aplicação

```bash
flyctl deploy --app wg-crm-sistema
```

### 3. Abrir a Aplicação no Browser

```bash
flyctl open
```

### 4. Ver Logs em Tempo Real

```bash
flyctl logs
```

### 5. Verificar Status da Aplicação

```bash
flyctl status --app wg-crm-sistema
```

**Observação:** As máquinas ficam em estado "stopped" quando não há tráfego (auto-scaling) e iniciam automaticamente ao receber requisições.

---

## 🌐 Configurar Domínio Personalizado

### Passo 1: Adicionar Certificado SSL

```bash
flyctl certs add seudominio.com
```

### Passo 2: Configurar DNS

Após adicionar o certificado, o Fly.io fornecerá os registros DNS necessários.

**Você precisará adicionar no seu provedor de DNS:**

1. **Registro A:**
   ```
   @  A  <ip-fornecido-pelo-flyio>
   ```

2. **Registro AAAA (IPv6):**
   ```
   @  AAAA  <ipv6-fornecido-pelo-flyio>
   ```

3. **CNAME para www (opcional):**
   ```
   www  CNAME  seudominio.com
   ```

### Passo 3: Verificar Status do Certificado

```bash
flyctl certs show seudominio.com
```

### Passo 4: Listar Todos os Certificados

```bash
flyctl certs list
```

---

## 🔧 Comandos Úteis

### Escalar Aplicação

```bash
# Aumentar memória para 2GB
flyctl scale memory 2048

# Aumentar número de máquinas
flyctl scale count 2
```

### Variáveis de Ambiente

```bash
# Adicionar variável
flyctl secrets set SUPABASE_URL=sua_url_aqui

# Listar variáveis (valores ocultos)
flyctl secrets list

# Remover variável
flyctl secrets unset NOME_VARIAVEL
```

### Conectar via SSH

```bash
flyctl ssh console
```

### Reiniciar Aplicação

```bash
flyctl apps restart wg-crm
```

---

## ⚙️ Configuração Atual

### Recursos da Máquina
- **Memória:** 1GB RAM
- **CPU:** 1x shared CPU
- **Auto-scaling:** Habilitado (mín: 0, escala automaticamente)

### Configuração HTTP
- **Porta Interna:** 8080
- **HTTPS Forçado:** Sim
- **Conexões Simultâneas:** 20 (soft) / 25 (hard)

---

## 📝 Variáveis de Ambiente Necessárias

Antes do deploy, configure suas variáveis de ambiente do Supabase:

```bash
flyctl secrets set VITE_SUPABASE_URL=sua_url_aqui
flyctl secrets set VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

**⚠️ Importante:** Variáveis com prefixo `VITE_` serão incluídas no build do Vite.

---

## 🔍 Troubleshooting

### Build Falhando

```bash
# Ver logs detalhados do build
flyctl deploy --verbose
```

### Aplicação Não Inicia

```bash
# Ver logs da aplicação
flyctl logs

# Conectar via SSH para debug
flyctl ssh console
```

### Resetar Aplicação

```bash
# Destruir e recriar
flyctl apps destroy wg-crm
flyctl launch
```

---

## 📚 Documentação Oficial

- [Fly.io Docs](https://fly.io/docs/)
- [Node.js on Fly.io](https://fly.io/docs/languages-and-frameworks/node/)
- [Custom Domains](https://fly.io/docs/networking/custom-domain/)
- [SSL Certificates](https://fly.io/docs/networking/tls/)

---

## ✨ Status do Deploy

1. ✅ Fly.io CLI instalado
2. ✅ Login realizado (william@wgalmeida.com.br)
3. ✅ App criado no Fly.io (wg-crm-sistema)
4. ✅ Arquivos de configuração criados
5. ✅ Variáveis de ambiente do Supabase configuradas
6. ✅ Deploy realizado com sucesso
7. ✅ Aplicação disponível em: https://wg-crm-sistema.fly.dev
8. ✅ **Domínio personalizado configurado: https://easy.wgalmeida.com.br**
9. ✅ Certificado SSL emitido (Let's Encrypt)

---

## 🌐 Domínios Ativos

- **Fly.io Default:** https://wg-crm-sistema.fly.dev
- **Domínio Personalizado:** https://easy.wgalmeida.com.br ✨

### Configuração DNS (Hostinger)

**Subdomínio:** easy.wgalmeida.com.br

```
Tipo: A
Nome: easy
Aponta para: 66.241.125.83
TTL: 14400

Tipo: AAAA
Nome: easy
Aponta para: 2a09:8280:1::ab:66:0
TTL: 14400
```

**Certificado SSL:**
- Autoridade: Let's Encrypt
- Tipos: RSA, ECDSA
- Status: ✅ Emitido automaticamente

---

**Projeto:** WG CRM
**Documentação criada em:** 30/10/2025
