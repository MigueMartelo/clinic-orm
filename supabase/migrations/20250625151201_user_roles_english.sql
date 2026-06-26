-- Defaults, helpers, and policies for English role names

alter table public.profiles alter column role set default 'user';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Usuario'),
    'user'
  );
  return new;
end;
$$;

create or replace function public.is_receptionist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'receptionist';
$$;

create or replace function public.is_doctor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'doctor';
$$;

create or replace function public.can_write_operations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() in ('receptionist', 'admin');
$$;

-- attendances: doctor may update clinical notes
drop policy if exists "attendances_update_doctora_notes" on public.attendances;
create policy "attendances_update_doctor_notes"
  on public.attendances for update
  to authenticated
  using (public.is_doctor())
  with check (public.is_doctor());

-- patient medical profiles + clinical notes
drop policy if exists "patient_medical_profiles_write_staff" on public.patient_medical_profiles;
create policy "patient_medical_profiles_write_staff"
  on public.patient_medical_profiles for insert
  to authenticated
  with check (public.can_write_operations() or public.is_doctor());

drop policy if exists "patient_medical_profiles_update_staff" on public.patient_medical_profiles;
create policy "patient_medical_profiles_update_staff"
  on public.patient_medical_profiles for update
  to authenticated
  using (public.can_write_operations() or public.is_doctor())
  with check (public.can_write_operations() or public.is_doctor());

drop policy if exists "clinical_history_entries_write_staff" on public.clinical_history_entries;
create policy "clinical_history_entries_write_staff"
  on public.clinical_history_entries for insert
  to authenticated
  with check (public.can_write_operations() or public.is_doctor());

drop policy if exists "clinical_history_entries_update_staff" on public.clinical_history_entries;
create policy "clinical_history_entries_update_staff"
  on public.clinical_history_entries for update
  to authenticated
  using (public.can_write_operations() or public.is_doctor())
  with check (public.can_write_operations() or public.is_doctor());

drop function if exists public.is_recepcion();
drop function if exists public.is_doctora();
