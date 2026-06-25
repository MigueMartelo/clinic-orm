-- Service categories and catalog (seeded from clinic vocabulary)

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger service_categories_set_updated_at
  before update on public.service_categories
  for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  default_price_cop bigint not null default 0 check (default_price_cop >= 0),
  session_mode public.session_mode not null default 'none',
  default_session_count int check (default_session_count is null or default_session_count > 0),
  default_deposit_pct int check (
    default_deposit_pct is null
    or (default_deposit_pct >= 0 and default_deposit_pct <= 100)
  ),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_session_count_check check (
    (session_mode = 'fixed_count' and default_session_count is not null)
    or (session_mode != 'fixed_count' and default_session_count is null)
  )
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create index services_category_id_idx on public.services (category_id);
create index services_active_idx on public.services (active) where active = true;

-- Seed categories
insert into public.service_categories (name, slug, sort_order) values
  ('Consultorio', 'consultorio', 1),
  ('HydraFacial', 'hydrafacial', 2),
  ('Láser', 'laser', 3);

-- Seed services
insert into public.services (
  category_id,
  name,
  slug,
  default_price_cop,
  session_mode,
  default_session_count,
  default_deposit_pct
)
select
  c.id,
  s.name,
  s.slug,
  s.default_price_cop,
  s.session_mode::public.session_mode,
  s.default_session_count,
  s.default_deposit_pct
from (
  values
    ('consultorio', 'Toxina botulínica', 'toxina', 800000::bigint, 'none', null::int, null::int),
    ('consultorio', 'Ácido hialurónico', 'acido-hialuronico', 1200000::bigint, 'none', null::int, null::int),
    ('consultorio', 'Profhilo', 'profhilo', 1500000::bigint, 'none', null::int, null::int),
    ('consultorio', 'Mesoterapia', 'mesoterapia', 600000::bigint, 'none', null::int, null::int),
    ('consultorio', 'Skinboosters', 'skinboosters', 900000::bigint, 'none', null::int, null::int),
    ('hydrafacial', 'HydraFacial', 'hydrafacial', 350000::bigint, 'none', null::int, null::int),
    ('laser', 'Depilación láser (paquete 10 sesiones)', 'depilacion-laser-10', 0::bigint, 'fixed_count', 10, 60)
) as s (category_slug, name, slug, default_price_cop, session_mode, default_session_count, default_deposit_pct)
join public.service_categories c on c.slug = s.category_slug;
