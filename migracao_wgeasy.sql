-- =========================
-- MÓDULO STORAGE – DEPÓSITO / FERRAMENTAS / MATERIAIS
-- =========================

-- Extensão para UUID (normalmente já vem ativa no Supabase)
create extension if not exists "pgcrypto";

-- Tabela de itens do depósito
create table if not exists public.storage_items (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  categoria text,
  unidade_medida text,          -- ex: un, m, m², kg
  foto_url text,                -- caminho no Supabase Storage
  codigo_interno text,          -- etiqueta / código GC
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

comment on table public.storage_items is 'Catálogo de itens do depósito (ferramentas e materiais)';
comment on column public.storage_items.unidade_medida is 'Unidade de medida: un, m, m², kg, etc';

-- Tabela de movimentações (entradas e saídas)
create table if not exists public.storage_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.storage_items(id) on delete restrict,
  tipo text not null check (tipo in ('entrada', 'saida')),
  quantidade numeric(12,2) not null check (quantidade > 0),
  data_hora timestamptz not null default now(),

  -- Integrações com o restante do sistema (ajuste os nomes de tabelas se forem diferentes)
  obra_id uuid,
  cliente_id uuid,
  responsavel_id uuid,

  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create table if not exists public.fin_documents (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.fin_transactions(id),
  file_url text not null,
  raw_text text,
  fornecedor_nome text,
  endereco text,
  valor_total numeric(12,2),
  data_emissao date,
  metadata jsonb,
  criado_em timestamptz not null default now(),
  criado_por uuid references auth.users(id)
);

alter table public.fin_documents enable row level security;

create policy "Read fin_documents - authenticated"
on public.fin_documents
for select
using ( auth.role() = 'authenticated' );

create policy "Insert fin_documents - authenticated"
on public.fin_documents
for insert
with check ( auth.role() = 'authenticated' );

-- =========================
-- MÓDULO STORAGE
-- =========================

create extension if not exists "pgcrypto";

create table if not exists public.storage_items (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  categoria text,
  unidade_medida text,
  foto_url text,
  codigo_interno text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create table if not exists public.storage_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.storage_items(id),
  tipo text not null check (tipo in ('entrada', 'saida')),
  quantidade numeric(12,2) not null check (quantidade > 0),
  data_hora timestamptz not null default now(),
  obra_id uuid,
  cliente_id uuid,
  responsavel_id uuid,
  observacoes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create or replace view public.storage_saldo as
select
  i.id as item_id,
  i.nome,
  i.categoria,
  i.unidade_medida,
  i.foto_url,
  coalesce(sum(
    case when m.tipo = 'entrada' then m.quantidade
         when m.tipo = 'saida'   then -m.quantidade
         else 0 end
  ), 0) as saldo_atual
from public.storage_items i
left join public.storage_movements m on m.item_id = i.id
group by i.id, i.nome, i.categoria, i.unidade_medida, i.foto_url;

alter table public.storage_items enable row level security;
alter table public.storage_movements enable row level security;

create policy "Read storage_items - authenticated"
on public.storage_items
for select using (auth.role() = 'authenticated');

create policy "Insert storage_items - authenticated"
on public.storage_items
for insert with check (auth.role() = 'authenticated');

create policy "Read storage_movements - authenticated"
on public.storage_movements
for select using (auth.role() = 'authenticated');

create policy "Insert storage_movements - authenticated"
on public.storage_movements
for insert with check (auth.role() = 'authenticated');


comment on table public.storage_movements is 'Movimentações de estoque: entradas e saídas vinculadas a obras/clientes';

-- View de saldo atual por item
create or replace view public.storage_saldo as
select
  i.id as item_id,
  i.nome,
  i.categoria,
  i.unidade_medida,
  i.foto_url,
  coalesce(sum(
    case
      when m.tipo = 'entrada' then m.quantidade
      when m.tipo = 'saida'   then -m.quantidade
      else 0
    end
  ), 0) as saldo_atual
from public.storage_items i
left join public.storage_movements m on m.item_id = i.id
group by i.id, i.nome, i.categoria, i.unidade_medida, i.foto_url;

-- =========================
-- RLS – Row Level Security
-- =========================

alter table public.storage_items enable row level security;
alter table public.storage_movements enable row level security;

-- Política básica: qualquer usuário autenticado pode ver itens
create policy "Read storage_items - authenticated"
on public.storage_items
for select
using ( auth.role() = 'authenticated' );

-- Política básica: qualquer autenticado pode inserir itens (depois refinamos por papel)
create policy "Insert storage_items - authenticated"
on public.storage_items
for insert
with check ( auth.role() = 'authenticated' );

-- Política: só ver movimentações se autenticado
create policy "Read storage_movements - authenticated"
on public.storage_movements
for select
using ( auth.role() = 'authenticated' );

-- Política: qualquer autenticado pode registrar entrada/saída
create policy "Insert storage_movements - authenticated"
on public.storage_movements
for insert
with check ( auth.role() = 'authenticated' );

-- Opcional: bloquear DELETE direto (mantém histórico)
revoke delete on public.storage_items from public;
revoke delete on public.storage_movements from public;
