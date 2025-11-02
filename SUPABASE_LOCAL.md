# Supabase Local - Guia de Desenvolvimento

## Resumo
Este projeto está configurado para usar Supabase local durante o desenvolvimento, isolado do Supabase do cliente em produção.

## URLs e Credenciais Locais

```
API URL:         http://127.0.0.1:54321
GraphQL URL:     http://127.0.0.1:54321/graphql/v1
Storage URL:     http://127.0.0.1:54321/storage/v1/s3
Database URL:    postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:      http://127.0.0.1:54323
Mailpit URL:     http://127.0.0.1:54324

Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret Key:      sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

## Ferramentas Instaladas

- **Docker Desktop**: Container runtime para rodar Supabase
- **Supabase CLI**: v2.54.11 (via Scoop)
- **Node.js**: v22.11.0

## Comandos Principais

### Iniciar Supabase Local
```bash
supabase start
```

### Parar Supabase Local
```bash
supabase stop
```

### Ver Status
```bash
supabase status
```

### Resetar Database (cuidado!)
```bash
supabase db reset
```

### Aplicar Migrations
```bash
supabase db push
```

## Workflow de Desenvolvimento

### 1. Desenvolvimento Local
- Use `supabase start` para iniciar ambiente local
- Acesse o Studio em http://127.0.0.1:54323
- Faça todas as alterações localmente
- Teste tudo completamente

### 2. Migrations
As migrations estão em `supabase/migrations/`:
- 001_criar_tabelas_base.sql
- 002_criar_tabelas_financeiro.sql
- 003_criar_tabelas_kanban_pipeline.sql
- 004_criar_views.sql
- 005_habilitar_rls.sql
- 006_criar_tabelas_faltando.sql
- 007_corrigir_campos_faltando.sql

**IMPORTANTE**: Todas as migrations locais já foram aplicadas automaticamente no `supabase start`.

### 3. Sincronização com Cliente
Quando o cliente faz alterações no Supabase dele:
1. Cliente exporta código/configuração
2. Agente analisa diff das mudanças
3. Você decide quais mudanças aplicar localmente
4. Cria nova migration se necessário

### 4. Deploy para Produção
Quando for fazer deploy do seu trabalho:
1. Crie novo projeto Supabase (separado do cliente)
2. Aplique todas as migrations: `supabase db push`
3. Faça deploy da aplicação apontando para novo Supabase

## Estrutura de Arquivos

```
C:\Users\Valdair\OneDrive\Área de Trabalho\WG\
├── supabase/
│   ├── config.toml          # Configuração do Supabase
│   ├── migrations/          # Migrations SQL (tracked no git)
│   ├── backup/              # Backups manuais (tracked no git)
│   ├── snippets/            # SQL snippets úteis
│   └── .supabase/           # Dados locais (ignorado no git)
├── .gitignore               # Já configurado para Supabase
└── SUPABASE_LOCAL.md        # Este arquivo
```

## Gitignore Configurado
O `.gitignore` já está configurado para:
- ✅ Trackear `migrations/` (importante para versionamento)
- ✅ Trackear `backup/` (backups manuais)
- ✅ Trackear `config.toml` (configuração)
- ❌ Ignorar `.supabase/` (dados locais gerados automaticamente)
- ❌ Ignorar `.env.local` (credenciais locais)

## Ambiente Local vs Cliente vs Produção

| Ambiente | Uso | Supabase |
|----------|-----|----------|
| **Local** | Desenvolvimento | Localhost (Docker) |
| **Cliente** | Produção do cliente | Supabase do cliente (não mexer!) |
| **Produção** | Seu deploy final | Novo Supabase (criar depois) |

## Troubleshooting

### Docker não está rodando
```bash
# Verificar se Docker Desktop está rodando
docker ps

# Se não estiver, abra Docker Desktop manualmente
```

### Porta já em uso
```bash
# Parar todos os containers
supabase stop

# Iniciar novamente
supabase start
```

### Resetar tudo (extremo)
```bash
# Para e remove todos os containers e volumes
supabase stop --no-backup
supabase db reset
```

## Próximos Passos

1. Abra o Supabase Studio: http://127.0.0.1:54323
2. Explore suas tabelas e dados
3. Conecte sua aplicação usando as credenciais locais
4. Desenvolva com tranquilidade sem afetar o cliente
