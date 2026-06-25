-- User profiles linked to Supabase Auth

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'recepcion',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

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
    'recepcion'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS helpers (used by policies in next migration)
create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'admin';
$$;

create or replace function public.is_recepcion()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'recepcion';
$$;

create or replace function public.is_doctora()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() = 'doctora';
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() is not null;
$$;

create or replace function public.can_write_operations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_user_role() in ('recepcion', 'admin');
$$;
