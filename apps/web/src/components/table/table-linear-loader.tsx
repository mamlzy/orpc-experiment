import { cn } from '@/lib/utils';

const isNum = (num?: number) => typeof num === 'number';

type Props = {
  show?: boolean;
  progress?: number;
  containerCN?: string;
};

export function TableLinearLoader({ show, progress, containerCN }: Props) {
  return (
    <div
      className={cn(
        'bg-primary/30 absolute top-[-5px] hidden h-[5px] w-full overflow-x-hidden rounded-lg',
        containerCN,
        show && 'block'
      )}
    >
      {isNum(progress) ? (
        <div
          className='bg-primary relative h-full max-w-full transition-all duration-300 ease-in-out'
          style={{ width: `${progress}%` }}
        />
      ) : (
        <div className='animate-linear-loader bg-primary relative size-full' />
      )}
    </div>
  );
}
