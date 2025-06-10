/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ClientContext } from '@orpc/client';
import type { ProcedureUtils } from '@orpc/react-query';
import {
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  CheckIcon,
  ChevronDown,
  Loader2Icon,
  LoaderIcon,
  SearchIcon,
  X,
} from 'lucide-react';
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { lowerCase, startCase } from '@repo/shared/lib/utils';
import type { SuccessResponse } from '@repo/shared/types';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Props<
  TField extends FieldValues,
  TQueryData extends Record<string, any>,
  TOptionValue extends keyof TQueryData,
> = {
  control: Control<TField>;
  query: UseInfiniteQueryResult<
    InfiniteData<SuccessResponse<TQueryData[]>, unknown>,
    Error
  >;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  optionValue: TOptionValue;
  optionLabel: keyof TQueryData | ((option: TQueryData) => string | boolean);
  name: Path<TField>;
  id?: string;
  label?: string;
  placeholder?: string;
  description?: string;
  mandatory?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  disabledOptions?: TQueryData[TOptionValue][];
  additionalOnChange?: (option: TQueryData) => void;
  additionalOnClear?: () => void;
  getSingleQueryOptions: ProcedureUtils<
    ClientContext,
    { id: TQueryData[TOptionValue] },
    SuccessResponse<TQueryData>,
    Error
  >['queryOptions'];
  buttonClassName?: string;
};

export function InputComboboxPaginate<
  TField extends FieldValues,
  TQueryData extends Record<string, any>,
  TOptionValue extends keyof TQueryData,
>({
  control,
  query,
  search,
  setSearch,
  optionValue,
  optionLabel,
  name,
  id,
  label,
  placeholder,
  description,
  mandatory,
  disabled,
  clearable = true,
  disabledOptions,
  additionalOnChange,
  additionalOnClear,
  getSingleQueryOptions,
  buttonClassName,
}: Props<TField, TQueryData, TOptionValue>) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TQueryData | null>(null);
  const [isPending, setIsPending] = useState(false);

  const options = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) || [],
    [query.data]
  ) as TQueryData[];

  const getOptionLabel = (option: TQueryData) =>
    typeof optionLabel === 'function'
      ? optionLabel(option)
      : option[optionLabel];

  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  const { value } = field;

  const fetchSingle = useCallback(async () => {
    setIsPending(true);

    try {
      const data = await qc.fetchQuery(
        getSingleQueryOptions({ input: { id: value } })
      );

      if (data && 'data' in data) {
        setSelected(data.data as TQueryData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('err =>', err);
      toast.error(`Error, Cant get ${` ${label || placeholder}`} data`);

      setSelected(null);
      field.onChange('' as TQueryData[TOptionValue]);
    } finally {
      setIsPending(false);
    }
  }, [value, getSingleQueryOptions, label, placeholder]);

  useEffect(() => {
    //! reset search on every value changes
    setSearch('');

    //! if value empty, but selected not empty, reset
    if (!value && selected?.[optionValue] !== value) {
      setSelected(null);
    }

    //! if value not empty, but selected empty, fetch (to get the option label)
    if (value && selected?.[optionValue] !== value) {
      fetchSingle();
    }
  }, [value]);

  const onChange = (option: TQueryData) => {
    //! if value the same, reset.
    if (option[optionValue] === value) {
      if (clearable) {
        field.onChange('');
        setSelected(null);

        additionalOnClear?.();
        setSearch('');
      }
      setOpen(false);
      return;
    }

    //! set value
    field.onChange(option[optionValue]);
    setSelected(option);

    additionalOnChange?.(option);
    setSearch('');
    setOpen(false);
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    field.onChange('');
    setSelected(null);

    additionalOnClear?.();
    setOpen(false);
  };

  //! Infinite scroll logic
  const { ref: infiniteRef, inView } = useInView();
  useEffect(() => {
    if (inView && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query.hasNextPage]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <div className='grid gap-2'>
        <Label htmlFor={id || name} className={cn(error && 'text-destructive')}>
          {label || startCase(name)}
          {mandatory && <span className='text-[#f00]'>*</span>}
        </Label>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn(
              'hover:bg-accent disabled:bg-muted data-[state=open]:ring-primary group relative w-full min-w-12 justify-start px-2 font-normal data-[state=open]:border-transparent data-[state=open]:ring-2',
              buttonClassName
            )}
            disabled={disabled}
          >
            {/* Value / Placeholder */}
            <span
              className={cn(
                'block truncate text-start',
                value && !disabled
                  ? 'pr-[42px]'
                  : 'text-muted-foreground pr-[20px]'
              )}
            >
              {selected
                ? getOptionLabel(selected)
                : placeholder ||
                  label ||
                  (name ? `Select ${lowerCase(name)}...` : undefined)}
            </span>

            <div
              className={cn(
                'absolute inset-y-0 right-0 flex items-center transition-colors'
              )}
            >
              <div
                className={cn(
                  'hidden h-full shrink-0 place-items-center',
                  value && !disabled && 'grid'
                )}
              >
                {/* CLOSE BUTTON */}
                <span
                  className='rounded-md p-1 opacity-50'
                  onClick={onClear}
                  role='button'
                  tabIndex={0}
                >
                  <X size={16} />
                  <span className='sr-only'>clear button</span>
                </span>
              </div>

              {/* CHEVRON ICON */}
              <div className='mr-2 grid h-full place-items-center'>
                {!disabled && (isPending || query.isPending) ? (
                  <LoaderIcon size={16} className='animate-spin opacity-50' />
                ) : (
                  <ChevronDown size={16} className='shrink-0 opacity-50' />
                )}
              </div>
            </div>
          </Button>
        </PopoverTrigger>

        {/* Description */}
        {description && (
          <p className='text-muted-foreground text-xs'>{description}</p>
        )}

        {/* Error Message */}
        {error?.message && (
          <p className='text-xs text-red-600'>{error.message}</p>
        )}
      </div>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] min-w-[200px] p-0'>
        <div>
          {/* Search input */}
          <div className='relative w-full'>
            <SearchIcon className='absolute left-3 top-1/2 h-full w-4 -translate-y-1/2 opacity-50' />
            <Input
              placeholder='Search...'
              className='w-full rounded-b-none border-none pl-10 outline-none ring-offset-0 focus:outline-none focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label='Search'
            />
          </div>
          <div className='max-h-60 w-full overflow-y-auto p-1'>
            {query.isPending ? (
              //! Loading Indicator
              <div className='flex items-center justify-center p-1'>
                <Loader2Icon className='animate-spin' />
              </div>
            ) : query.isError ? (
              //! Error Component
              <div className='py-6 text-center text-sm'>
                Error, something went wrong
              </div>
            ) : options.length < 1 ? (
              //! Empty Component
              <div className='py-6 text-center text-sm'>No option found.</div>
            ) : (
              //! Option Component
              options.map((option, idx) => {
                const isSelected = value === option[optionValue];
                const isDisabled = disabledOptions?.includes(
                  option[optionValue]
                );

                return (
                  <div
                    key={idx}
                    tabIndex={0}
                    onClick={() => !isDisabled && onChange(option)}
                    role='option'
                    aria-selected={isSelected}
                    className={cn(
                      'hover:bg-accent focus-visible:bg-accent focus-visible:outline-primary flex cursor-default items-center justify-between rounded-sm p-2',
                      isDisabled &&
                        'cursor-not-allowed opacity-50 hover:bg-transparent'
                    )}
                  >
                    <span className='text-sm leading-none'>
                      {getOptionLabel(option)}
                    </span>

                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </div>
                );
              })
            )}

            {/* Infinite scroll trigger */}
            <div
              ref={infiniteRef}
              className='text-muted-foreground w-full text-center'
            >
              {query.isFetchingNextPage && (
                //! Loading Indicator
                <div className='flex items-center justify-center p-1'>
                  <Loader2Icon className='animate-spin' />
                </div>
              )}

              {!query.isFetchingNextPage &&
                !query.hasNextPage &&
                options.length > 0 && (
                  <span className='text-xs'>No more options</span>
                )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
