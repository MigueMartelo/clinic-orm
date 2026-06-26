import type { Database } from '@/lib/supabase/database.types';

export type PaymentMethod = Database['public']['Enums']['payment_method'];

export const paymentMethods: PaymentMethod[] = [
  'efectivo',
  'transferencia',
  'datafono',
  'dolares',
];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  datafono: 'Datáfono',
  dolares: 'Dólares',
};
