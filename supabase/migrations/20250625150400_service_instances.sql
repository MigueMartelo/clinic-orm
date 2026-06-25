-- Multi-session packages (e.g. láser 10 sesiones, 60/40 payment)

create table public.service_instances (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  total_sessions int check (total_sessions is null or total_sessions > 0),
  total_cop bigint not null check (total_cop >= 0),
  paid_cop bigint not null default 0 check (paid_cop >= 0),
  balance_cop bigint not null default 0 check (balance_cop >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_instances_balance_check check (paid_cop + balance_cop = total_cop)
);

create trigger service_instances_set_updated_at
  before update on public.service_instances
  for each row execute function public.set_updated_at();

create table public.service_sessions (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.service_instances (id) on delete cascade,
  session_number int not null check (session_number > 0),
  session_at timestamptz not null default now(),
  attendance_id uuid references public.attendances (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (instance_id, session_number)
);

-- Link attendances and payments to service instances
alter table public.attendances
  add column service_instance_id uuid references public.service_instances (id) on delete set null;

alter table public.payments
  add constraint payments_service_instance_id_fkey
  foreign key (service_instance_id) references public.service_instances (id) on delete cascade;

create index attendances_service_instance_id_idx on public.attendances (service_instance_id);
create index service_instances_patient_id_idx on public.service_instances (patient_id);
create index service_instances_service_id_idx on public.service_instances (service_id);
create index service_instances_started_at_idx on public.service_instances (started_at desc);
create index service_sessions_instance_id_idx on public.service_sessions (instance_id);
create index service_sessions_session_at_idx on public.service_sessions (session_at desc);
create index payments_service_instance_id_idx on public.payments (service_instance_id);
