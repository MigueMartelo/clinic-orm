import { AttendanceDetailView } from '@/app/(app)/attendances/[id]/attendance-detail-view';
import { requireProfile } from '@/lib/auth';

type AttendanceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AttendanceDetailPage({
  params,
}: AttendanceDetailPageProps) {
  const { id } = await params;
  const profile = await requireProfile();

  return <AttendanceDetailView attendanceId={id} role={profile.role} />;
}
