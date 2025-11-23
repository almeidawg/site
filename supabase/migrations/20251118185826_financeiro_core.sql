-- FINANCEIRO CORE – WGEASY

do $$
begin
  if not exists (select 1 from pg_type where typname = 'financeiro_tipo') then
    create type public.financeiro_tipo as enum ('receita', 'despesa');
  end if;

  if not exists (select 1 from pg_type where typname = 'financeiro_origem') then
    create type public.financeiro_origem as enum ('contrato', 'orcamento', 'avulso');
  end if;

  if not exists (select 1 from pg_type where typname = 'financeiro_status') then
    create type public.financeiro_status as enum ('planejado', 'aberto', 'pago', 'cancelado', 'atrasado');
  end if;

  if not exists (select 1 from pg_type where typname = 'financeiro_meio_pagamento') then
    create type public.financeiro_meio_pagamento as enum ('pix', 'boleto', 'cartao_credito', 'transferencia', 'dinheiro', 'outro');
  end if;
end $$;

create table if not exists public.financeiro_lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo public.financeiro_tipo not null,
  origem public.financeiro_origem not null default 'contrato',
  obra_id uuid references public.obras (id) on delete set null,
  contrato_id uuid references public.contratos (id) on delete set null,
  cliente_id uuid references public.clientes (id) on delete set null,
  descricao text not null,
  categoria text,                     -- Ex: Marcenaria, Obra Civil, Honorários
  centro_custo text,                  -- Ex: Obra X, Unidade Y
  valor_total numeric(14,2) not null,
  status public.financeiro_status not null default 'planejado',
  competencia date,                   -- competência contábil
  observacoes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_fin_lanc_ts on public.financeiro_lancamentos;
create trigger trg_fin_lanc_ts
before update on public.financeiro_lancamentos
for each row
execute procedure public.set_timestamp();

alter table public.financeiro_lancamentos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'financeiro_lancamentos'
      and policyname = 'financeiro_lanc_full_access_single_tenant'
  ) then
    create policy financeiro_lanc_full_access_single_tenant
      on public.financeiro_lancamentos
      for all
      using (true)
      with check (true);
  end if;
end $$;

create table if not exists public.financeiro_parcelas (
  id uuid primary key default gen_random_uuid(),
  lancamento_id uuid not null references public.financeiro_lancamentos (id) on delete cascade,
  numero_parcela integer not null,          -- 1, 2, 3...
  descricao text,
  vencimento date not null,
  valor_previsto numeric(14,2) not null,
  valor_pago numeric(14,2),
  data_pagamento date,
  meio_pagamento public.financeiro_meio_pagamento,
  status public.financeiro_status not null default 'aberto',
  documento_referencia text,               -- número de NF, boleto, etc.
  observacoes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_fin_parc_ts on public.financeiro_parcelas;
create trigger trg_fin_parc_ts
before update on public.financeiro_parcelas
for each row
execute procedure public.set_timestamp();

alter table public.financeiro_parcelas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'financeiro_parcelas'
      and policyname = 'financeiro_parc_full_access_single_tenant'
  ) then
    create policy financeiro_parc_full_access_single_tenant
      on public.financeiro_parcelas
      for all
      using (true)
      with check (true);
  end if;
end $$;

create index if not exists idx_fin_lanc_obra on public.financeiro_lancamentos (obra_id);
create index if not exists idx_fin_lanc_contrato on public.financeiro_lancamentos (contrato_id);
create index if not exists idx_fin_lanc_cliente on public.financeiro_lancamentos (cliente_id);
create index if not exists idx_fin_parc_lancamento on public.financeiro_parcelas (lancamento_id);
create index if not exists idx_fin_parc_vencimento on public.financeiro_parcelas (vencimento);
