import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientsLoading() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-72' />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-48' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className='h-10 w-full' />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
