-- Retail products, stock movements, and sales

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  unit_price_cop bigint not null default 0 check (unit_price_cop >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  movement_type public.inventory_movement_type not null,
  quantity int not null check (quantity > 0),
  unit_cost_cop bigint check (unit_cost_cop is null or unit_cost_cop >= 0),
  notes text,
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.product_sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  patient_id uuid references public.patients (id) on delete set null,
  quantity int not null check (quantity > 0),
  unit_price_cop bigint not null check (unit_price_cop >= 0),
  total_cop bigint not null check (total_cop >= 0),
  payment_method public.payment_method not null,
  sold_at timestamptz not null default now(),
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index products_sku_unique_idx on public.products (sku) where sku is not null;
create index products_active_idx on public.products (active) where active = true;
create index inventory_movements_product_id_idx on public.inventory_movements (product_id);
create index inventory_movements_created_at_idx on public.inventory_movements (created_at desc);
create index product_sales_product_id_idx on public.product_sales (product_id);
create index product_sales_patient_id_idx on public.product_sales (patient_id);
create index product_sales_sold_at_idx on public.product_sales (sold_at desc);
