'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DateRangeFilterProps = {
  from: string;
  to: string;
};

export function DateRangeFilter({ from, to }: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const applyRange = (nextFrom: string, nextTo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', nextFrom);
    params.set('to', nextTo);
    params.delete('page');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form
      className='flex flex-wrap items-end gap-3'
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextFrom = String(formData.get('from') ?? '');
        const nextTo = String(formData.get('to') ?? '');
        if (nextFrom && nextTo) {
          applyRange(nextFrom, nextTo);
        }
      }}
    >
      <div className='flex flex-col gap-2'>
        <Label htmlFor='from'>Desde</Label>
        <Input id='from' name='from' type='date' defaultValue={from} />
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='to'>Hasta</Label>
        <Input id='to' name='to' type='date' defaultValue={to} />
      </div>
      <Button type='submit' variant='outline'>
        Filtrar
      </Button>
    </form>
  );
}
