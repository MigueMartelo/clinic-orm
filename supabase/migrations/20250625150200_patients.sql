-- Unified patient records

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  document_id text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create index patients_full_name_idx on public.patients (lower(full_name));
create unique index patients_phone_unique_idx on public.patients (phone) where phone is not null;
create unique index patients_document_id_unique_idx on public.patients (document_id) where document_id is not null;
