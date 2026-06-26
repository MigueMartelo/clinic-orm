import {
  bogotaDayToUtcRange,
  getTodayInBogota,
} from '@/lib/format';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { createClient } from '@/lib/supabase/client';

export type PatientsListParams = {
  page: number;
  q: string;
  pageSize?: number;
};

export type PatientsListResult = {
  patients: {
    id: string;
    full_name: string;
    phone: string | null;
    document_id: string | null;
    email: string | null;
    created_at: string;
  }[];
  count: number;
};

export async function fetchPatientsList(
  params: PatientsListParams,
): Promise<PatientsListResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (params.page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = createClient();

  let query = supabase
    .from('patients')
    .select('id, full_name, phone, document_id, email, created_at', {
      count: 'exact',
    })
    .order('full_name', { ascending: true });

  if (params.q) {
    const term = `%${params.q}%`;
    query = query.or(`full_name.ilike.${term},phone.ilike.${term}`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    patients: data ?? [],
    count: count ?? 0,
  };
}

export type AttendancesListParams = {
  page: number;
  q: string;
  fromDate?: string;
  toDate?: string;
  pageSize?: number;
};

export type AttendancesListResult = {
  attendances: {
    id: string;
    attended_at: string;
    total_cop: number;
    paid_cop: number;
    balance_cop: number;
    patients: { full_name: string };
    services: { name: string };
  }[];
  count: number;
  productionTotal: number;
};

export async function fetchAttendancesList(
  params: AttendancesListParams,
): Promise<AttendancesListResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (params.page - 1) * pageSize;
  const to = from + pageSize - 1;
  const today = getTodayInBogota();
  const fromDate = params.fromDate ?? today;
  const toDate = params.toDate ?? today;
  const { start: rangeStart } = bogotaDayToUtcRange(fromDate);
  const { end: rangeEnd } = bogotaDayToUtcRange(toDate);
  const supabase = createClient();

  let patientIds: string[] | null = null;

  if (params.q) {
    const { data: matchingPatients } = await supabase
      .from('patients')
      .select('id')
      .or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`);

    patientIds = matchingPatients?.map((patient) => patient.id) ?? [];
    if (patientIds.length === 0) {
      patientIds = ['00000000-0000-0000-0000-000000000000'];
    }
  }

  let query = supabase
    .from('attendances')
    .select(
      `
      id,
      attended_at,
      total_cop,
      paid_cop,
      balance_cop,
      patients!inner(full_name),
      services!inner(name)
    `,
      { count: 'exact' },
    )
    .gte('attended_at', rangeStart)
    .lte('attended_at', rangeEnd)
    .order('attended_at', { ascending: false });

  if (patientIds) {
    query = query.in('patient_id', patientIds);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  let totalQuery = supabase
    .from('attendances')
    .select('total_cop')
    .gte('attended_at', rangeStart)
    .lte('attended_at', rangeEnd);

  if (patientIds) {
    totalQuery = totalQuery.in('patient_id', patientIds);
  }

  const { data: totals } = await totalQuery;
  const productionTotal =
    totals?.reduce((sum, row) => sum + row.total_cop, 0) ?? 0;

  return {
    attendances: (data ?? []) as AttendancesListResult['attendances'],
    count: count ?? 0,
    productionTotal,
  };
}
