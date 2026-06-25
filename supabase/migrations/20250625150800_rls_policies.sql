-- Row Level Security policies by role

alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.patients enable row level security;
alter table public.attendances enable row level security;
alter table public.payments enable row level security;
alter table public.service_instances enable row level security;
alter table public.service_sessions enable row level security;
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.product_sales enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_name"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- catalog: all staff read; admin write
create policy "service_categories_select_staff"
  on public.service_categories for select
  to authenticated
  using (public.is_staff());

create policy "service_categories_admin_write"
  on public.service_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "services_select_staff"
  on public.services for select
  to authenticated
  using (public.is_staff());

create policy "services_admin_write"
  on public.services for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- patients
create policy "patients_select_staff"
  on public.patients for select
  to authenticated
  using (public.is_staff());

create policy "patients_write_recepcion_admin"
  on public.patients for insert
  to authenticated
  with check (public.can_write_operations());

create policy "patients_update_recepcion_admin"
  on public.patients for update
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "patients_delete_admin"
  on public.patients for delete
  to authenticated
  using (public.is_admin());

-- attendances
create policy "attendances_select_staff"
  on public.attendances for select
  to authenticated
  using (public.is_staff());

create policy "attendances_write_recepcion_admin"
  on public.attendances for insert
  to authenticated
  with check (public.can_write_operations());

create policy "attendances_update_recepcion_admin"
  on public.attendances for update
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "attendances_update_doctora_notes"
  on public.attendances for update
  to authenticated
  using (public.is_doctora())
  with check (public.is_doctora());

create policy "attendances_delete_admin"
  on public.attendances for delete
  to authenticated
  using (public.is_admin());

-- payments
create policy "payments_select_staff"
  on public.payments for select
  to authenticated
  using (public.is_staff());

create policy "payments_write_recepcion_admin"
  on public.payments for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "payments_delete_admin"
  on public.payments for delete
  to authenticated
  using (public.is_admin());

-- service instances & sessions
create policy "service_instances_select_staff"
  on public.service_instances for select
  to authenticated
  using (public.is_staff());

create policy "service_instances_write_recepcion_admin"
  on public.service_instances for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "service_instances_delete_admin"
  on public.service_instances for delete
  to authenticated
  using (public.is_admin());

create policy "service_sessions_select_staff"
  on public.service_sessions for select
  to authenticated
  using (public.is_staff());

create policy "service_sessions_write_recepcion_admin"
  on public.service_sessions for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "service_sessions_delete_admin"
  on public.service_sessions for delete
  to authenticated
  using (public.is_admin());

-- inventory
create policy "products_select_staff"
  on public.products for select
  to authenticated
  using (public.is_staff());

create policy "products_write_recepcion_admin"
  on public.products for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "products_delete_admin"
  on public.products for delete
  to authenticated
  using (public.is_admin());

create policy "inventory_movements_select_staff"
  on public.inventory_movements for select
  to authenticated
  using (public.is_staff());

create policy "inventory_movements_write_recepcion_admin"
  on public.inventory_movements for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "inventory_movements_delete_admin"
  on public.inventory_movements for delete
  to authenticated
  using (public.is_admin());

create policy "product_sales_select_staff"
  on public.product_sales for select
  to authenticated
  using (public.is_staff());

create policy "product_sales_write_recepcion_admin"
  on public.product_sales for all
  to authenticated
  using (public.can_write_operations())
  with check (public.can_write_operations());

create policy "product_sales_delete_admin"
  on public.product_sales for delete
  to authenticated
  using (public.is_admin());

-- grants for authenticated role
grant usage on schema public to authenticated;
grant select on public.receivables to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on type public.user_role to authenticated;
grant usage on type public.payment_method to authenticated;
grant usage on type public.inventory_movement_type to authenticated;
grant usage on type public.session_mode to authenticated;
