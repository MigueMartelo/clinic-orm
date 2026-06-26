'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { Input } from '@/components/ui/input';

type SearchInputProps = {
  placeholder?: string;
  paramName?: string;
};

export function SearchInput({
  placeholder = 'Buscar...',
  paramName = 'q',
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const currentQuery = searchParams.get(paramName) ?? '';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextValue = String(formData.get(paramName) ?? '').trim();
    const params = new URLSearchParams(searchParams.toString());
    if (nextValue) {
      params.set(paramName, nextValue);
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className='w-full shrink-0 sm:w-80 md:w-96'>
      <Input
        key={currentQuery}
        name={paramName}
        defaultValue={currentQuery}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </form>
  );
}
