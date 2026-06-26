'use client';

import { useQuery } from '@tanstack/react-query';

import {
  fetchAttendanceDetail,
  fetchAttendancesList,
  fetchPatientDetail,
  fetchPatientsList,
  type AttendancesListParams,
  type PatientsListParams,
} from '@/lib/query/fetchers';
import { attendanceKeys, patientKeys } from '@/lib/query/keys';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';

export function usePatientsList(params: PatientsListParams) {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  return useQuery({
    queryKey: patientKeys.list({ ...params, pageSize }),
    queryFn: () => fetchPatientsList({ ...params, pageSize }),
  });
}

export function usePatientDetail(patientId: string) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => fetchPatientDetail(patientId),
  });
}

export function useAttendancesList(params: AttendancesListParams) {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  return useQuery({
    queryKey: attendanceKeys.list({
      page: params.page,
      q: params.q,
      pageSize,
      fromDate: params.fromDate ?? '',
      toDate: params.toDate ?? '',
    }),
    queryFn: () => fetchAttendancesList({ ...params, pageSize }),
  });
}

export function useAttendanceDetail(attendanceId: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(attendanceId),
    queryFn: () => fetchAttendanceDetail(attendanceId),
  });
}
