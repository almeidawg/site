-- MARCENARIA CORE – WGEASY

-- AMBIENTES DE MARCENARIA (EX: COZINHA, SUÍTE MASTER, LIVING)
create table if not exists public.marcenaria_ambientes (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid references public.obras (id) on delete cascade,
  contrato_id uuid references public.contratos (id) on delete set null,
  nome text not null,               -- Ex: Cozinha, Suíte Master, Home Theater
  descricao text,
  ordem integer,                    -- ordem de exibição
  observacoes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_marcenaria_ambientes_ts on public.marcenaria_ambientes;
create trigger trg_marcenaria_ambientes_ts
before update on public.marcenaria_ambientes
for each row
execute procedure public.set_timestamp();

alter table public.marcenaria_ambientes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'marcenaria_ambientes'
      and policyname = 'marcenaria_ambientes_full_access_single_tenant'
  ) then
    create policy marcenaria_ambientes_full_access_single_tenant
      on public.marcenaria_ambientes
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- ITENS DE MARCENARIA (EX: ARMÁRIO, PAINEL, GAVETEIRO)
create table if not exists public.marcenaria_itens (
  id uuid primary key default gen_random_uuid(),
  ambiente_id uuid not null references public.marcenaria_ambientes (id) on delete cascade,
  obra_id uuid references public.obras (id) on delete set null,
  contrato_id uuid references public.contratos (id) on delete set null,
  codigo_interno text,              -- Ex: MARC-0001
  nome text not null,               -- Ex: Armário superior, Painel TV
  descricao text,
  largura_mm integer,
  altura_mm integer,
  profundidade_mm integer,
  qtde integer not null default 1,
  material_corpo text,              -- MDF interno
  material_frente text,             -- portas/frentes
  acabamento text,                  -- lacca, melamínico, folha natural
  ferragens text,                   -- Dobradiça Hafele, corrediça Blum, etc.
  observacoes text,
  valor_unitario numeric(14,2),
  valor_total numeric(14,2),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_marcenaria_itens_ts on public.marcenaria_itens;
create trigger trg_marcenaria_itens_ts
before update on public.marcenaria_itens
for each row
execute procedure public.set_timestamp();

alter table public.marcenaria_itens enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'marcenaria_itens'
      and policyname = 'marcenaria_itens_full_access_single_tenant'
  ) then
    create policy marcenaria_itens_full_access_single_tenant
      on public.marcenaria_itens
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- COMPONENTES/LISTAGEM DETALHADA (CHAPA, FITA, FERRAGEM, ETC.)
create table if not exists public.marcenaria_componentes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.marcenaria_itens (id) on delete cascade,
  tipo text,                        -- chapa, ferragem, vidro, pedra etc.
  descricao text not null,
  unidade text,                     -- m2, m, pç, kit
  qtde numeric(14,3),
  custo_unitario numeric(14,4),
  custo_total numeric(14,4),
  fornecedor text,
  lead_time_dias integer,
  observacoes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_marcenaria_componentes_ts on public.marcenaria_componentes;
create trigger trg_marcenaria_componentes_ts
before update on public.marcenaria_componentes
for each row
execute procedure public.set_timestamp();

alter table public.marcenaria_componentes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'marcenaria_componentes'
      and policyname = 'marcenaria_componentes_full_access_single_tenant'
  ) then
    create policy marcenaria_componentes_full_access_single_tenant
      on public.marcenaria_componentes
      for all
      using (true)
      with check (true);
  end if;
end $$;

-- ÍNDICES
create index if not exists idx_marc_ambientes_obra on public.marcenaria_ambientes (obra_id);
create index if not exists idx_marc_itens_ambiente on public.marcenaria_itens (ambiente_id);
create index if not exists idx_marc_componentes_item on public.marcenaria_componentes (item_id);
