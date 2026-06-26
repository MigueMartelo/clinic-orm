import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientDetailLoading() {
  return (
    <div className='flex flex-col gap-6'>
      <Skeleton className='h-8 w-64' />
      <Skeleton className='h-4 w-96' />
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-40' />
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='h-10 w-full' />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
