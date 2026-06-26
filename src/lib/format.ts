const BOGOTA_TIMEZONE = 'America/Bogota';
const LOCALE = 'es-CO';

export function formatCop(value: bigint | number): string {
  const amount = typeof value === 'bigint' ? Number(value) : value;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCopInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return 0;
  }
  return Number.parseInt(digits, 10);
}

export function formatDate(
  value: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: BOGOTA_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: BOGOTA_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTodayInBogota(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIMEZONE,
  }).format(new Date());
}

export function bogotaDayToUtcRange(dateKey: string): {
  start: string;
  end: string;
} {
  const start = new Date(`${dateKey}T00:00:00-05:00`).toISOString();
  const end = new Date(`${dateKey}T23:59:59.999-05:00`).toISOString();
  return { start, end };
}

export function toBogotaDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA_TIMEZONE,
  }).format(date);
}

export function bogotaDateTimeToIso(dateKey: string, time: string): string {
  return new Date(`${dateKey}T${time}:00-05:00`).toISOString();
}
