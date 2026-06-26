import { PatientDetailView } from '@/app/(app)/patients/[id]/patient-detail-view';
import { requireProfile } from '@/lib/auth';

type PatientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { id } = await params;
  const profile = await requireProfile();

  return <PatientDetailView patientId={id} role={profile.role} />;
}
