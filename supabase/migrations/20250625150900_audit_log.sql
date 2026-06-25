-- Audit trail for sensitive operations (Habeas Data compliance)

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_table_record_idx on public.audit_log (table_name, record_id);
create index audit_log_user_id_idx on public.audit_log (user_id);

alter table public.audit_log enable row level security;

create policy "audit_log_admin_select"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- Inserts via service role or security definer functions only (no authenticated insert policy)

create or replace function public.write_audit_log(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_data jsonb default null,
  p_new_data jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
end;
$$;

revoke all on function public.write_audit_log(text, text, uuid, jsonb, jsonb) from public;
grant execute on function public.write_audit_log(text, text, uuid, jsonb, jsonb) to authenticated;
