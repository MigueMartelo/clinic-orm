import { requireAdmin, roleLabels } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CreateUserForm } from '@/components/users/create-user-form';
import { RoleSelect } from '@/components/users/role-select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function UsuariosPage() {
  const currentUser = await requireAdmin();
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('full_name');

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Usuarios</h1>
        <p className='text-sm text-muted-foreground'>
          Administra cuentas del consultorio y asigna roles de acceso.
        </p>
      </div>

      <CreateUserForm />

      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados</CardTitle>
          <CardDescription>
            {profiles?.length ?? 0} usuario
            {(profiles?.length ?? 0) === 1 ? '' : 's'} en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className='text-sm text-destructive'>{error.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol actual</TableHead>
                  <TableHead>Cambiar rol</TableHead>
                  <TableHead>Registrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className='font-medium'>
                      {profile.full_name}
                      {profile.id === currentUser.id ? (
                        <Badge variant='outline' className='ml-2'>
                          Tú
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {roleLabels[profile.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RoleSelect
                        profile={profile}
                        currentUserId={currentUser.id}
                      />
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {new Date(profile.created_at).toLocaleDateString('es-CO')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
