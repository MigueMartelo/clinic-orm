'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
};

export function PaginationControls({
  page,
  totalPages,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    return `?${params.toString()}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className='flex items-center justify-between gap-4'>
      <p className='text-sm text-muted-foreground'>
        Página {page} de {totalPages}
      </p>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={page <= 1}
          render={page > 1 ? <Link href={buildHref(page - 1)} /> : undefined}
        >
          Anterior
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={page >= totalPages}
          render={
            page < totalPages ? <Link href={buildHref(page + 1)} /> : undefined
          }
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
