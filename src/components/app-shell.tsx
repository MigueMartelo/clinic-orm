'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutIcon } from 'lucide-react';

import { roleLabels, type Profile } from '@/lib/auth-types';
import { filterNavByRole } from '@/lib/navigation';
import { AppSidebarNav } from '@/components/app-sidebar-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type AppShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell({ profile, children }: AppShellProps) {
  const pathname = usePathname();
  const navItems = filterNavByRole(profile.role);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className='border-b border-sidebar-border'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' render={<Link href='/dashboard' />}>
                <div className='flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <span className='text-sm font-semibold'>CO</span>
                </div>
                <div className='flex flex-col gap-0.5 leading-none'>
                  <span className='font-medium'>Clinic ORM</span>
                  <span className='text-xs text-muted-foreground'>
                    Medicina estética
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Módulos</SidebarGroupLabel>
            <SidebarGroupContent>
              <AppSidebarNav items={navItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className='border-t border-sidebar-border'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <div className='flex w-full items-center gap-2 px-1'>
                    <Avatar size='sm'>
                      <AvatarFallback>
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
                      <span className='truncate text-sm font-medium'>
                        {profile.full_name}
                      </span>
                      <Badge variant='secondary' className='w-fit'>
                        {roleLabels[profile.role]}
                      </Badge>
                    </div>
                  </div>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger />
          <Separator orientation='vertical' className='mx-1 h-4' />
          <div className='ml-auto'>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant='ghost' size='sm' className='gap-2'>
                    <Avatar size='sm'>
                      <AvatarFallback>
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className='hidden sm:inline'>
                      {profile.full_name}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>
                  <div className='flex flex-col gap-1'>
                    <span>{profile.full_name}</span>
                    <span className='text-xs font-normal text-muted-foreground'>
                      {roleLabels[profile.role]}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <form action='/auth/signout' method='post'>
                      <button
                        type='submit'
                        className='flex w-full items-center gap-2'
                      >
                        <LogOutIcon className='size-4' />
                        Cerrar sesión
                      </button>
                    </form>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
