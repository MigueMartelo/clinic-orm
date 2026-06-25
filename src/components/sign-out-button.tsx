'use client';

import { LogOutIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type SignOutButtonProps = {
  className?: string;
  showIcon?: boolean;
  label?: string;
};

export function SignOutButton({
  className,
  showIcon = true,
  label = 'Cerrar sesión',
}: SignOutButtonProps) {
  return (
    <form
      action='/auth/signout'
      method='post'
      className={cn('w-full', className)}
    >
      <button
        type='submit'
        className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      >
        {showIcon ? <LogOutIcon className='size-4 shrink-0' /> : null}
        {label}
      </button>
    </form>
  );
}
