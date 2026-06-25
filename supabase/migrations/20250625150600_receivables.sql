-- Cartera: outstanding balances from attendances and service packages

create or replace view public.receivables
with (security_invoker = true)
as
select
  'attendance'::text as source_type,
  a.id as source_id,
  a.patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  a.balance_cop,
  a.attended_at as reference_at,
  s.name as service_name
from public.attendances a
join public.patients p on p.id = a.patient_id
join public.services s on s.id = a.service_id
where a.balance_cop > 0

union all

select
  'service_instance'::text as source_type,
  si.id as source_id,
  si.patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  si.balance_cop,
  si.started_at as reference_at,
  s.name as service_name
from public.service_instances si
join public.patients p on p.id = si.patient_id
join public.services s on s.id = si.service_id
where si.balance_cop > 0;

comment on view public.receivables is
  'Patients with pending balances from one-off attendances or multi-session packages.';
