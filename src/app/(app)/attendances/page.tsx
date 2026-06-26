import { AttendancesView } from '@/app/(app)/attendances/attendances-view';
import { requireProfile } from '@/lib/auth';

export default async function AttendancesPage() {
  const profile = await requireProfile();

  return <AttendancesView role={profile.role} />;
}
