import { useEffect, type Dispatch, type SetStateAction } from 'react';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { CheckIcon, CirclePlusIcon, Loader2Icon } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

import type { SuccessResponse } from '@repo/shared/types';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type Props<
  TQueryData extends Record<string, any>,
  TOptionValue extends keyof TQueryData,
> = {
  title?: string;
  setValues: Dispatch<SetStateAction<TQueryData[TOptionValue][]>>;
  values: TQueryData[TOptionValue][];
  query: UseInfiniteQueryResult<
    InfiniteData<SuccessResponse<TQueryData[]>, unknown>,
    Error
  >;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  optionValue: TOptionValue;
  optionLabel: keyof TQueryData | ((option: TQueryData) => string | boolean);
  icon?: React.ComponentType<{ className?: string }>;
};

export function DataTableFacetedFilterPaginate<
  TQueryData extends Record<string, any>,
  TOptionValue extends keyof TQueryData,
>({
  title,
  setValues,
  values,
  query,
  search,
  setSearch,
  optionValue,
  optionLabel,
  icon: Icon,
}: Props<TQueryData, TOptionValue>) {
  const selectedValues = new Set(values);
  const options = query.data?.pages.flatMap((page) => page.data) || [];

  const getOptionLabel = (option: TQueryData) =>
    typeof optionLabel === 'function'
      ? optionLabel(option)
      : option[optionLabel];

  //! Infinite scroll logic
  const { ref: infiniteRef, inView } = useInView();
  useEffect(() => {
    if (inView && query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [inView, query.hasNextPage]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-9 border-dashed font-normal'
        >
          <CirclePlusIcon className='size-4' />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge
                variant='secondary'
                className='rounded-sm px-1 font-normal lg:hidden'
              >
                {selectedValues.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selectedValues.size > 2 ? (
                  <Badge
                    variant='secondary'
                    className='rounded-sm px-1 font-normal'
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option[optionValue]))
                    .map((option) => (
                      <Badge
                        variant='secondary'
                        key={option[optionValue] as string}
                        className='rounded-sm px-1 font-normal'
                      >
                        {getOptionLabel(option)}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput
            placeholder={title}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {query.isPending ? (
                <span className='flex items-center justify-center'>
                  <Loader2Icon className='animate-spin' />
                </span>
              ) : (
                <span className='flex items-center justify-center'>
                  No results found.
                </span>
              )}
            </CommandEmpty>
            <CommandGroup>
              {query.isPending ? (
                <div className='flex items-center justify-center p-4'>
                  <Loader2Icon className='animate-spin' />
                </div>
              ) : query.isError ? (
                <div className='py-6 text-center text-sm'>
                  Error, something went wrong
                </div>
              ) : options.length < 1 ? (
                <div className='py-6 text-center text-sm'>No option found.</div>
              ) : (
                options.map((option) => {
                  const isSelected = selectedValues.has(option[optionValue]);
                  return (
                    <CommandItem
                      key={option[optionValue] as string}
                      value={option[optionValue] as string}
                      onSelect={() => {
                        if (isSelected) {
                          selectedValues.delete(option[optionValue]);
                        } else {
                          selectedValues.add(option[optionValue]);
                        }
                        const filterValues = Array.from(selectedValues);
                        setValues(filterValues.length ? filterValues : []);
                      }}
                    >
                      <div
                        className={cn(
                          'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                          isSelected
                            ? 'bg-primary'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon
                          className={cn(
                            'size-4',
                            isSelected && 'text-primary-foreground'
                          )}
                        />
                      </div>
                      {Icon && (
                        <Icon className='text-muted-foreground mr-2 size-4' />
                      )}
                      <span>{getOptionLabel(option)}</span>
                    </CommandItem>
                  );
                })
              )}

              {/* Infinite scroll trigger */}
              <CommandItem
                ref={infiniteRef}
                className='text-muted-foreground w-full text-center'
                disabled
              >
                {query.isFetchingNextPage && (
                  <div className='flex items-center justify-center p-1'>
                    <Loader2Icon className='animate-spin' />
                  </div>
                )}

                {!query.isFetchingNextPage &&
                  !query.hasNextPage &&
                  options.length > 0 && (
                    <span className='text-xs'>No more options</span>
                  )}
              </CommandItem>
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setValues([]);
                    }}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
