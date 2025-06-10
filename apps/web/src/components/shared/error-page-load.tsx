import { XCircleIcon } from 'lucide-react';

export function ErrorPageLoad() {
  return (
    <div className='flex flex-col items-center justify-center gap-4 py-12'>
      <XCircleIcon className='text-destructive h-12 w-12' />
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>Failed to load</h3>
        <p className='text-muted-foreground text-sm'>
          An unexpected error occurred. Please try again later.
        </p>
      </div>
    </div>
  );
}
