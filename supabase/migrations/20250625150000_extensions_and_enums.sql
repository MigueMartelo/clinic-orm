-- Extensions and domain enums

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum (
  'doctora',
  'recepcion',
  'admin'
);

create type public.payment_method as enum (
  'transferencia',
  'datafono',
  'efectivo',
  'dolares'
);

create type public.inventory_movement_type as enum (
  'entrada',
  'salida'
);

create type public.session_mode as enum (
  'none',
  'fixed_count',
  'open'
);

-- Shared updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
