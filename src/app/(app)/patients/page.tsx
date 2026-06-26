import { PatientsView } from '@/app/(app)/patients/patients-view';
import { requireProfile } from '@/lib/auth';

export default async function PatientsPage() {
  const profile = await requireProfile();

  return <PatientsView role={profile.role} />;
}
