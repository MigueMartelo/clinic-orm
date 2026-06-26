'use client';

import { useQueryClient } from '@tanstack/react-query';

import { attendanceKeys, patientKeys } from '@/lib/query/keys';

export function useInvalidatePatients() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: patientKeys.all });
  };
}

export function useInvalidateAttendances() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
  };
}
