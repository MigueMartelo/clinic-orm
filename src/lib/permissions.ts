import type { UserRole } from '@/lib/auth-types';

export function canWriteOperations(role: UserRole): boolean {
  return role === 'admin' || role === 'receptionist';
}

export function canWriteClinical(role: UserRole): boolean {
  return canWriteOperations(role) || role === 'doctor';
}

export function isReadOnlyStaff(role: UserRole): boolean {
  return role === 'user';
}
