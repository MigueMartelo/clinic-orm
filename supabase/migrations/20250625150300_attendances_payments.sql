-- Service delivery (production) and payments

create table public.attendances (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  total_cop bigint not null check (total_cop >= 0),
  paid_cop bigint not null default 0 check (paid_cop >= 0),
  balance_cop bigint not null default 0 check (balance_cop >= 0),
  clinical_notes text,
  attended_at timestamptz not null default now(),
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendances_balance_check check (paid_cop + balance_cop = total_cop)
);

create trigger attendances_set_updated_at
  before update on public.attendances
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  attendance_id uuid references public.attendances (id) on delete cascade,
  service_instance_id uuid,
  payment_method public.payment_method not null,
  amount_cop bigint not null check (amount_cop > 0),
  paid_at timestamptz not null default now(),
  recorded_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  constraint payments_parent_check check (
    attendance_id is not null or service_instance_id is not null
  )
);

create index attendances_patient_id_idx on public.attendances (patient_id);
create index attendances_service_id_idx on public.attendances (service_id);
create index attendances_attended_at_idx on public.attendances (attended_at desc);
create index payments_attendance_id_idx on public.payments (attendance_id);
create index payments_paid_at_idx on public.payments (paid_at desc);
