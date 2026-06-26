import { ProfileForm } from '@/app/(app)/profile/profile-form';
import { requireProfile, getSessionUser } from '@/lib/auth';

export default async function PerfilPage() {
  const profile = await requireProfile();
  const user = await getSessionUser();

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Mi perfil</h1>
        <p className='text-sm text-muted-foreground'>
          Administra tu información de cuenta.
        </p>
      </div>

      <ProfileForm profile={profile} email={user?.email ?? ''} />
    </div>
  );
}
