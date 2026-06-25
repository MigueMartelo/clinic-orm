-- Report and query performance indexes

create index attendances_patient_attended_at_idx
  on public.attendances (patient_id, attended_at desc);

create index attendances_balance_positive_idx
  on public.attendances (balance_cop)
  where balance_cop > 0;

create index service_instances_balance_positive_idx
  on public.service_instances (balance_cop)
  where balance_cop > 0;

create index payments_payment_method_paid_at_idx
  on public.payments (payment_method, paid_at desc);

create index product_sales_payment_method_sold_at_idx
  on public.product_sales (payment_method, sold_at desc);

create index products_low_stock_idx
  on public.products (stock_quantity)
  where active = true and stock_quantity <= low_stock_threshold;
