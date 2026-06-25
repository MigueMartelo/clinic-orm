-- Patient clinical history: medical profile, standalone entries, unified timeline

create type public.clinical_entry_type as enum (
  'clinical_note',
  'attachment'
);

-- Static medical background (allergies, consent, etc.) — one row per patient
create table public.patient_medical_profiles (
  patient_id uuid primary key references public.patients (id) on delete cascade,
  allergies text,
  medications text,
  contraindications text,
  skin_type text,
  consent_signed_at timestamptz,
  consent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger patient_medical_profiles_set_updated_at
  before update on public.patient_medical_profiles
  for each row execute function public.set_updated_at();

comment on table public.patient_medical_profiles is
  'Structured medical background for the patient ficha (allergies, consent, contraindications).';

-- Standalone clinical notes and attachments (not tied to billing/production)
create table public.clinical_history_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  entry_type public.clinical_entry_type not null default 'clinical_note',
  title text,
  content text,
  attachment_path text,
  attendance_id uuid references public.attendances (id) on delete set null,
  service_session_id uuid references public.service_sessions (id) on delete set null,
  recorded_by uuid references auth.users (id) on delete set null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinical_history_entries_content_check check (
    entry_type = 'attachment' and attachment_path is not null
    or entry_type = 'clinical_note' and content is not null
  )
);

create trigger clinical_history_entries_set_updated_at
  before update on public.clinical_history_entries
  for each row execute function public.set_updated_at();

create index clinical_history_entries_patient_id_idx
  on public.clinical_history_entries (patient_id);

create index clinical_history_entries_recorded_at_idx
  on public.clinical_history_entries (recorded_at desc);

comment on table public.clinical_history_entries is
  'Free-form clinical notes and file references for the patient historia clínica.';

-- Unified chronological feed for the patient ficha UI
create or replace view public.patient_timeline
with (security_invoker = true)
as

-- Procedures / attendances
select
  a.patient_id,
  'attendance'::text as event_type,
  a.attended_at as event_at,
  s.name as title,
  coalesce(a.clinical_notes, '') as summary,
  a.total_cop,
  a.balance_cop,
  'attendances'::text as source_table,
  a.id as source_id,
  a.recorded_by
from public.attendances a
join public.services s on s.id = a.service_id

union all

-- Package sessions (e.g. láser 3/10)
select
  si.patient_id,
  'session'::text as event_type,
  ss.session_at as event_at,
  s.name || ' — sesión ' || ss.session_number::text
    || coalesce('/' || si.total_sessions::text, '') as title,
  coalesce(si.notes, '') as summary,
  null::bigint as total_cop,
  null::bigint as balance_cop,
  'service_sessions'::text as source_table,
  ss.id as source_id,
  null::uuid as recorded_by
from public.service_sessions ss
join public.service_instances si on si.id = ss.instance_id
join public.services s on s.id = si.service_id

union all

-- Package enrollment
select
  si.patient_id,
  'package_started'::text as event_type,
  si.started_at as event_at,
  'Inicio paquete: ' || s.name as title,
  coalesce(si.notes, '') as summary,
  si.total_cop,
  si.balance_cop,
  'service_instances'::text as source_table,
  si.id as source_id,
  null::uuid as recorded_by
from public.service_instances si
join public.services s on s.id = si.service_id

union all

-- Product sales
select
  ps.patient_id,
  'product_sale'::text as event_type,
  ps.sold_at as event_at,
  pr.name as title,
  'Cantidad: ' || ps.quantity::text
    || ' — Total: $' || ps.total_cop::text as summary,
  ps.total_cop,
  null::bigint as balance_cop,
  'product_sales'::text as source_table,
  ps.id as source_id,
  ps.recorded_by
from public.product_sales ps
join public.products pr on pr.id = ps.product_id
where ps.patient_id is not null

union all

-- Standalone clinical notes / attachments
select
  che.patient_id,
  che.entry_type::text as event_type,
  che.recorded_at as event_at,
  coalesce(che.title, 'Nota clínica') as title,
  coalesce(che.content, che.attachment_path, '') as summary,
  null::bigint as total_cop,
  null::bigint as balance_cop,
  'clinical_history_entries'::text as source_table,
  che.id as source_id,
  che.recorded_by
from public.clinical_history_entries che;

comment on view public.patient_timeline is
  'Chronological patient ficha: attendances, sessions, packages, sales, and clinical notes.';

-- RLS
alter table public.patient_medical_profiles enable row level security;
alter table public.clinical_history_entries enable row level security;

create policy "patient_medical_profiles_select_staff"
  on public.patient_medical_profiles for select
  to authenticated
  using (public.is_staff());

create policy "patient_medical_profiles_write_staff"
  on public.patient_medical_profiles for insert
  to authenticated
  with check (public.can_write_operations() or public.is_doctora());

create policy "patient_medical_profiles_update_staff"
  on public.patient_medical_profiles for update
  to authenticated
  using (public.can_write_operations() or public.is_doctora())
  with check (public.can_write_operations() or public.is_doctora());

create policy "patient_medical_profiles_delete_admin"
  on public.patient_medical_profiles for delete
  to authenticated
  using (public.is_admin());

create policy "clinical_history_entries_select_staff"
  on public.clinical_history_entries for select
  to authenticated
  using (public.is_staff());

create policy "clinical_history_entries_write_staff"
  on public.clinical_history_entries for insert
  to authenticated
  with check (public.can_write_operations() or public.is_doctora());

create policy "clinical_history_entries_update_staff"
  on public.clinical_history_entries for update
  to authenticated
  using (public.can_write_operations() or public.is_doctora())
  with check (public.can_write_operations() or public.is_doctora());

create policy "clinical_history_entries_delete_admin"
  on public.clinical_history_entries for delete
  to authenticated
  using (public.is_admin());

grant select on public.patient_timeline to authenticated;
grant select, insert, update, delete on public.patient_medical_profiles to authenticated;
grant select, insert, update, delete on public.clinical_history_entries to authenticated;
grant usage on type public.clinical_entry_type to authenticated;
